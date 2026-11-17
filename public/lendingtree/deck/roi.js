/* Roadmap ROI calculator: pure logic, no DOM. Every scenario calculation stays in the browser.
   Used by roi-ui.js and covered by tests/lendingtree-roi.test.mjs.

   Definitions (also shown in the calculator's "How this works" panel)
   - Horizon: H months, one currency. Benefit inputs are the amount earned over the whole horizon IF the initiative ran at
     full run-rate from month 1. The timing factor f (0 to 1) scales that to what the schedule actually realises.
   - Timing: benefits begin in month `start` and ramp linearly over `ramp` extra months: m(t) = 0 before start, then
     min(1, (t - start + 1) / (ramp + 1)). f = sum of m(t) over months 1..H, divided by H.
   - Contribution: revenue minus associated variable costs ("margin" method) OR the direct contribution input
     ("contribution" method). One method per initiative; the other method's fields are ignored.
   - Economic benefit = (contribution + cash savings enabled) x f x w, where w = confidence / 100 in confidence-weighted
     mode and 1 in unadjusted mode. Costs are committed and never weighted.
   - Cost base = remaining one-time investment + incremental operating cost over the horizon (incurred up front and evenly).
   - Net value = benefit - cost base. ROI = net value / cost base, or null ("N/A") when the cost base is zero.
   - Portfolio ROI sums dollars first, then divides.
   - Sunk cost is shown but never enters any forward figure. */

export const SCEN = ['low', 'base', 'high'];
export const DECISIONS = ['continue', 'start', 'rescope', 'stop'];
const ONE_DECISION = { continue: 'Continue', start: 'Start', rescope: 'Re-scope', stop: 'Stop' };
export const decisionLabel = (d) => ONE_DECISION[d] || 'Continue';

/* ---------- parsing ---------- */
export function parseNum(raw, { min = -Infinity, max = Infinity, int = false } = {}) {
  if (typeof raw === 'number') raw = Number.isFinite(raw) ? String(raw) : '';
  const s = String(raw == null ? '' : raw).replace(/[,$€£\s]/g, '');
  if (s === '') return { value: 0, error: '', blank: true };
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return { value: 0, error: 'Enter a number, for example 250000.' };
  let v = Number(s);
  if (int && !Number.isInteger(v)) return { value: 0, error: 'Enter a whole number.' };
  if (v < min) return { value: 0, error: min === 0 ? 'Enter zero or more.' : 'Enter ' + min + ' or more.' };
  if (v > max) return { value: 0, error: 'Enter ' + max + ' or less.' };
  return { value: v, error: '' };
}

const tri = (o) => ({ low: o && o.low !== undefined ? o.low : '', base: o && o.base !== undefined ? o.base : '', high: o && o.high !== undefined ? o.high : '' });

export function blankItem(id) {
  return {
    id, name: '', inBaseline: false, included: true, mandatory: false, decision: 'start', method: 'margin',
    rev: tri(), varc: tri(), contrib: tri(), avoid: tri(),
    oneTime: '', opCost: '', teamMonths: '', startMonth: '1', ramp: '0', confidence: '70', sunk: '', deps: [],
  };
}

/* Turn one editable row (strings) into clean numbers plus a map of field errors. Invalid or blank numbers count as 0. */
export function normalize(item, H) {
  const errors = {};
  const grab = (key, raw, opts) => { const r = parseNum(raw, opts); if (r.error) errors[key] = r.error; return r.value; };
  const triple = (key, src, opts) => { const out = {}; for (const s of SCEN) out[s] = grab(key + '.' + s, src[s], opts); return out; };
  const n = {
    id: item.id, name: String(item.name || '').trim(), inBaseline: !!item.inBaseline, included: !!item.included,
    mandatory: !!item.mandatory, decision: item.decision, method: item.method === 'contribution' ? 'contribution' : 'margin',
    rev: triple('rev', item.rev, { min: 0 }), varc: triple('varc', item.varc, { min: 0 }),
    contrib: triple('contrib', item.contrib, {}), avoid: triple('avoid', item.avoid, { min: 0 }),
    oneTime: grab('oneTime', item.oneTime, { min: 0 }), opCost: grab('opCost', item.opCost, { min: 0 }),
    teamMonths: grab('teamMonths', item.teamMonths, { min: 0 }), sunk: grab('sunk', item.sunk, { min: 0 }),
    deps: (item.deps || []).filter((d) => d !== item.id),
  };
  if (!n.name) errors.name = 'Add a name so this initiative can be identified.';
  const conf = parseNum(item.confidence, { min: 0, max: 100 });
  if (conf.error) errors.confidence = conf.error.replace('Enter zero or more.', 'Enter 0 to 100.').replace(/Enter 100 or less\./, 'Enter 0 to 100.');
  n.confidence = conf.error || conf.blank ? (conf.error ? 0 : 100) : conf.value;
  if (conf.blank) errors.confidence = 'Enter 0 to 100. A blank value is treated as 100.';
  const st = parseNum(item.startMonth, { min: 1, max: Math.max(1, H), int: true });
  if (st.error) errors.startMonth = 'Enter a month from 1 to ' + Math.max(1, H) + '.';
  n.startMonth = st.error || st.blank ? 1 : st.value;
  const rp = parseNum(item.ramp, { min: 0, max: Math.max(0, H), int: true });
  if (rp.error) errors.ramp = 'Enter 0 to ' + Math.max(0, H) + ' months.';
  n.ramp = rp.error ? 0 : rp.value;
  // Keep low <= base <= high visible without silently rewriting the inputs.
  for (const f of ['rev', 'varc', 'contrib', 'avoid']) {
    const t = n[f]; if (!(t.low <= t.base && t.base <= t.high) && !errors[f + '.low'] && !errors[f + '.base'] && !errors[f + '.high']) {
      const used = (f === 'rev' || f === 'varc') ? n.method === 'margin' : f === 'contrib' ? n.method === 'contribution' : true;
      const anyNonZero = t.low || t.base || t.high;
      if (used && anyNonZero) errors[f + '.order'] = 'Low, base and high should rise in that order.';
    }
  }
  return { n, errors };
}

/* ---------- timing ---------- */
export function timing(H, start, ramp) {
  const months = [];
  for (let t = 1; t <= H; t++) months.push(t < start ? 0 : Math.min(1, (t - start + 1) / (ramp + 1)));
  const factor = H > 0 ? months.reduce((a, b) => a + b, 0) / H : 0;
  return { months, factor };
}

/* ---------- one initiative ---------- */
export function evalItem(n, H, scen, mode) {
  const w = mode === 'weighted' ? n.confidence / 100 : 1;
  const contribution = n.method === 'margin' ? n.rev[scen] - n.varc[scen] : n.contrib[scen];
  const savings = n.avoid[scen];
  const { months, factor } = timing(H, n.startMonth, n.ramp);
  const benefitContribution = contribution * factor * w;
  const benefitSavings = savings * factor * w;
  const benefit = benefitContribution + benefitSavings;
  const cost = n.oneTime + n.opCost;
  const net = benefit - cost;
  const series = months.map((m, i) => ({
    benefit: H > 0 ? ((contribution + savings) * w * m) / H : 0,
    cost: (i === 0 ? n.oneTime : 0) + (H > 0 ? n.opCost / H : 0),
  }));
  return { contribution, savings, factor, weight: w, benefitContribution, benefitSavings, benefit, cost, net, roi: cost > 0 ? net / cost : null, teamMonths: n.teamMonths, series };
}

export const isIn = (n) => n.mandatory || n.included;

/* ---------- a selection of initiatives ---------- */
export function aggregate(rows, H) {
  const a = { benefit: 0, benefitContribution: 0, benefitSavings: 0, cost: 0, oneTime: 0, opCost: 0, net: 0, teamMonths: 0, sunk: 0, count: rows.length, series: [] };
  for (let t = 0; t < H; t++) a.series.push({ benefit: 0, cost: 0 });
  for (const r of rows) {
    a.benefit += r.e.benefit; a.benefitContribution += r.e.benefitContribution; a.benefitSavings += r.e.benefitSavings;
    a.cost += r.e.cost; a.oneTime += r.n.oneTime; a.opCost += r.n.opCost; a.net += r.e.net; a.teamMonths += r.n.teamMonths; a.sunk += r.n.sunk;
    r.e.series.forEach((s, i) => { a.series[i].benefit += s.benefit; a.series[i].cost += s.cost; });
  }
  a.roi = a.cost > 0 ? a.net / a.cost : null;
  a.payback = payback(a.series);
  return a;
}

/* Simple payback: first month where cumulative timed benefit covers cumulative cost. Only when a positive benefit stream exists. */
export function payback(series) {
  const totalBenefit = series.reduce((x, s) => x + s.benefit, 0);
  const totalCost = series.reduce((x, s) => x + s.cost, 0);
  if (!(totalBenefit > 0)) return { month: null, status: 'na', text: 'N/A (no positive timed benefit)' };
  if (!(totalCost > 0)) return { month: null, status: 'none', text: 'No cost to recover' };
  let cum = 0;
  for (let i = 0; i < series.length; i++) {
    cum += series[i].benefit - series[i].cost;
    if (cum >= 0) return { month: i + 1, status: 'ok', text: 'Month ' + (i + 1) };
  }
  return { month: null, status: 'beyond', text: 'Not within the horizon' };
}

/* ---------- full scenario ---------- */
export function readSettings(s) {
  const errors = {};
  const h = parseNum(s.horizon, { min: 1, max: 36, int: true });
  const H = h.error || h.blank ? 6 : h.value;
  if (h.error || h.blank) errors.horizon = 'Enter 1 to 36 months. Using 6 until fixed.';
  const cap = parseNum(s.capacity, { min: 0 }); if (cap.error) errors.capacity = cap.error;
  const bud = parseNum(s.budget, { min: 0 }); if (bud.error) errors.budget = bud.error;
  return {
    H, capacity: cap.blank || cap.error ? null : cap.value, budget: bud.blank || bud.error ? null : bud.value,
    scen: SCEN.includes(s.scenario) ? s.scenario : 'base', errors,
  };
}

export function prepare(state) {
  const cfg = readSettings(state.settings);
  const rows = state.items.map((it) => { const { n, errors } = normalize(it, cfg.H); return { n, errors, raw: it }; });
  return { cfg, rows };
}

export function evaluate(state, mode, scenOverride) {
  const { cfg, rows } = prepare(state);
  const scen = scenOverride || cfg.scen;
  const H = cfg.H;
  const ev = rows.map((r) => ({ ...r, e: evalItem(r.n, H, scen, mode) }));
  const base = ev.filter((r) => r.n.inBaseline);
  const prop = ev.filter((r) => isIn(r.n));
  const A = aggregate(base, H), P = aggregate(prop, H);
  const stopped = ev.filter((r) => r.n.inBaseline && !isIn(r.n));
  const started = ev.filter((r) => !r.n.inBaseline && isIn(r.n));
  const kept = ev.filter((r) => r.n.inBaseline && isIn(r.n));
  const sum = (arr, f) => arr.reduce((a, r) => a + f(r), 0);
  const recon = {
    benefitForgone: sum(stopped, (r) => r.e.benefit), costAvoided: sum(stopped, (r) => r.e.cost),
    benefitAdded: sum(started, (r) => r.e.benefit), costAdded: sum(started, (r) => r.e.cost),
  };
  recon.delta = recon.benefitAdded - recon.benefitForgone + recon.costAvoided - recon.costAdded;
  recon.check = Math.abs(recon.delta - (P.net - A.net)) < 1e-6;
  const spend = { retained: sum(kept, (r) => r.e.cost), avoided: recon.costAvoided, added: recon.costAdded };
  const cap = { baselineUsed: A.teamMonths, proposedUsed: P.teamMonths, released: A.teamMonths - P.teamMonths, limit: cfg.capacity, fromStopped: sum(stopped, (r) => r.n.teamMonths), toStarted: sum(started, (r) => r.n.teamMonths) };
  const forgone = { sunkExcluded: sum(ev, (r) => r.n.sunk), sunkStopped: sum(stopped, (r) => r.n.sunk) };
  return { cfg, rows: ev, scen, mode, baseline: A, proposed: P, stopped, started, kept, recon, spend, cap, sunk: forgone, flags: flags(ev, cfg, P, cap) };
}

/* Capacity overruns, unresolved dependencies, mandatory conflicts, and other things a reader should see. */
export function flags(ev, cfg, P, cap) {
  const out = [];
  const byId = new Map(ev.map((r) => [r.n.id, r]));
  const name = (r) => r.n.name || 'Unnamed initiative';
  if (!ev.length) out.push({ kind: 'info', text: 'No initiatives yet. Add one or load an example.' });
  for (const r of ev) {
    if (!isIn(r.n)) continue;
    for (const d of r.n.deps) {
      const dep = byId.get(d);
      if (!dep) out.push({ kind: 'dependency', id: r.n.id, text: name(r) + ' depends on an initiative that no longer exists.' });
      else if (!isIn(dep.n)) out.push({ kind: 'dependency', id: r.n.id, text: name(r) + ' depends on ' + name(dep) + ', which is deferred or stopped.' });
    }
    if (r.n.mandatory && r.n.decision === 'stop') out.push({ kind: 'mandatory', id: r.n.id, text: name(r) + ' is mandatory, so the Stop decision is ignored and its cost stays in the scenario.' });
    if (!r.n.mandatory && r.e.net < 0) out.push({ kind: 'value', id: r.n.id, text: name(r) + ' is included with negative net value (' + Math.round(r.e.net).toLocaleString('en-US') + ').' });
  }
  const mand = ev.filter((r) => r.n.mandatory);
  const mandT = mand.reduce((a, r) => a + r.n.teamMonths, 0);
  if (cap.limit !== null && mandT > cap.limit) out.push({ kind: 'mandatory', text: 'Mandatory work alone needs ' + fmtNum(mandT) + ' team-months, more than the ' + fmtNum(cap.limit) + ' available. Capacity, scope, or the mandatory list has to change.' });
  if (cap.limit !== null && P.teamMonths > cap.limit) out.push({ kind: 'capacity', text: 'Capacity overrun: the selection needs ' + fmtNum(P.teamMonths) + ' team-months against ' + fmtNum(cap.limit) + ' available (' + fmtNum(P.teamMonths - cap.limit) + ' over).' });
  if (cfg.budget !== null && P.cost > cfg.budget) out.push({ kind: 'budget', text: 'Over budget: committed cost is ' + fmtNum(P.cost) + ' against a cash budget of ' + fmtNum(cfg.budget) + '.' });
  if (ev.length && !ev.some((r) => isIn(r.n))) out.push({ kind: 'info', text: 'Nothing is selected, so every proposed total is zero. ROI shows N/A.' });
  if (ev.length && ev.every((r) => r.n.mandatory)) out.push({ kind: 'info', text: 'Every initiative is mandatory, so there is nothing to decide. The recommendation keeps all of them.' });
  return out;
}

function fmtNum(x) { return (Math.round(x * 10) / 10).toLocaleString('en-US'); }

/* ---------- recommendation (a prioritisation heuristic, not an optimiser) ----------
   1. Mandatory initiatives and everything they depend on are always kept.
   2. Each remaining initiative is scored by net value per team-month (net value / team-months). Zero team-months with
      positive net value scores as unlimited. Net value of zero or less is never recommended.
   3. Candidates are considered from the best score down. Tie-break: higher net value, then higher confidence, then fewer
      team-months, then list order. An initiative is added together with any missing dependencies if the bundle has
      positive net value and still fits the capacity limit and cash budget; otherwise it is skipped with a reason.
   This greedy ratio rule is fast and explainable. It can miss the best combination (the knapsack problem), so it is a
   heuristic. Use the overrides and compare. */
export function recommend(state, mode) {
  const { cfg, rows } = prepare(state);
  const ev = rows.map((r) => ({ ...r, e: evalItem(r.n, cfg.H, cfg.scen, mode) }));
  const byId = new Map(ev.map((r) => [r.n.id, r]));
  const sel = new Set(); const why = new Map(); const order = [];
  const closure = (id, acc = new Set()) => { if (acc.has(id) || !byId.has(id)) return acc; acc.add(id); byId.get(id).n.deps.forEach((d) => closure(d, acc)); return acc; };
  const used = () => [...sel].reduce((a, id) => a + byId.get(id).n.teamMonths, 0);
  const spent = () => [...sel].reduce((a, id) => a + byId.get(id).e.cost, 0);
  for (const r of ev) if (r.n.mandatory) for (const id of closure(r.n.id)) {
    if (!sel.has(id)) { sel.add(id); why.set(id, byId.get(id).n.mandatory ? 'Mandatory: always kept.' : 'Kept because mandatory work depends on it.'); }
  }
  const cand = ev.filter((r) => !sel.has(r.n.id)).map((r, idx) => ({ r, idx, score: r.n.teamMonths > 0 ? r.e.net / r.n.teamMonths : r.e.net > 0 ? Infinity : -Infinity }));
  cand.sort((a, b) => (b.score === a.score ? 0 : b.score > a.score ? 1 : -1) || b.r.e.net - a.r.e.net || b.r.n.confidence - a.r.n.confidence || a.r.n.teamMonths - b.r.n.teamMonths || a.idx - b.idx);
  for (const c of cand) {
    const id = c.r.n.id;
    if (sel.has(id)) continue;
    const score = c.score;
    order.push({ id, score });
    if (!(c.r.e.net > 0)) { why.set(id, 'Skipped: net value is zero or negative, so it does not earn a place.'); continue; }
    const need = [...closure(id)].filter((x) => !sel.has(x));
    const bundleNet = need.reduce((a, x) => a + byId.get(x).e.net, 0);
    const bundleT = need.reduce((a, x) => a + byId.get(x).n.teamMonths, 0);
    const bundleCost = need.reduce((a, x) => a + byId.get(x).e.cost, 0);
    if (!(bundleNet > 0)) { why.set(id, 'Skipped: with the dependencies it needs, net value is zero or negative.'); continue; }
    if (cfg.capacity !== null && used() + bundleT > cfg.capacity + 1e-9) { why.set(id, 'Skipped: does not fit the remaining capacity (' + fmtNum(Math.max(0, cfg.capacity - used())) + ' team-months left, needs ' + fmtNum(bundleT) + ').'); continue; }
    if (cfg.budget !== null && spent() + bundleCost > cfg.budget + 1e-9) { why.set(id, 'Skipped: would exceed the cash budget.'); continue; }
    need.forEach((x) => { sel.add(x); if (x !== id) why.set(x, 'Added with ' + (c.r.n.name || 'another initiative') + ', which depends on it.'); });
    why.set(id, Number.isFinite(score) ? 'Selected: ' + fmtNum(score) + ' net value per team-month.' : 'Selected: positive net value and no team-months needed.');
  }
  const notes = [];
  const mandT = ev.filter((r) => r.n.mandatory).reduce((a, r) => a + r.n.teamMonths, 0);
  if (cfg.capacity !== null && mandT > cfg.capacity) notes.push('Mandatory work alone exceeds capacity. No discretionary work fits.');
  if (!ev.length) notes.push('Nothing to recommend yet.');
  else if (ev.every((r) => r.n.mandatory)) notes.push('Everything is mandatory, so the recommendation is the full list.');
  return { selected: sel, why, order, notes, rows: ev };
}

/* Apply the recommended selection to the editable rows (returns a new items array). */
export function applyRecommendation(state, mode) {
  const rec = recommend(state, mode);
  return state.items.map((it) => {
    const keep = rec.selected.has(it.id);
    const next = { ...it, included: keep || it.mandatory };
    next.decision = keep ? (it.inBaseline ? (it.decision === 'rescope' ? 'rescope' : 'continue') : 'start') : (it.inBaseline ? 'stop' : 'start');
    if (!keep && !it.inBaseline) next.decision = 'start';
    return next;
  });
}

/* Restore the baseline roadmap selection (what is in flight today) for comparison. */
export function restoreBaseline(items) {
  return items.map((it) => ({ ...it, included: !!it.inBaseline, decision: it.inBaseline ? 'continue' : it.decision }));
}

/* ---------- examples (illustrative, not LendingTree data) ---------- */
const T = (low, base, high) => ({ low: String(low), base: String(base), high: String(high) });
const Z = T('', '', '');
function mk(id, o) { return { ...blankItem(id), ...o }; }

export const EXAMPLES = {
  balanced: {
    label: 'Example A: balanced portfolio',
    note: 'Eight made-up initiatives over 12 months: four in the current plan, four new, with a shared dependency, a stop, a re-scope, and mandatory work. The proposal fits capacity and budget.',
    settings: { horizon: '12', currency: 'USD', capacity: '24', budget: '2200000', scenario: 'base' },
    items: [
      mk('a1', { name: 'Shared consent and identity service', mandatory: true, inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: Z, avoid: T(100000, 150000, 200000), oneTime: '250000', opCost: '60000', teamMonths: '4', startMonth: '2', ramp: '1', confidence: '90', sunk: '180000' }),
      mk('a2', { name: 'Lending offer comparison alpha', decision: 'start', included: true, method: 'contribution', contrib: T(1000000, 2400000, 4000000), avoid: Z, oneTime: '450000', opCost: '120000', teamMonths: '6', startMonth: '5', ramp: '2', confidence: '50', deps: ['a1'] }),
      mk('a3', { name: 'Insurance quote comparison alpha', decision: 'start', included: true, method: 'contribution', contrib: T(800000, 1800000, 3000000), avoid: Z, oneTime: '380000', opCost: '100000', teamMonths: '4', startMonth: '5', ramp: '2', confidence: '50', deps: ['a1'] }),
      mk('a4', { name: 'MCP/API sandbox and reference docs', decision: 'start', included: true, method: 'margin', rev: T(800000, 1500000, 2400000), varc: T(300000, 600000, 900000), oneTime: '260000', opCost: '80000', teamMonths: '3', startMonth: '6', ramp: '2', confidence: '40', deps: ['a1'] }),
      mk('a5', { name: 'Embedded SDK reference integration', decision: 'start', included: false, method: 'margin', rev: T(600000, 1200000, 2000000), varc: T(250000, 500000, 800000), oneTime: '340000', opCost: '90000', teamMonths: '5', startMonth: '7', ramp: '2', confidence: '35', deps: ['a1'] }),
      mk('a6', { name: 'Legacy lead-routing rewrite', inBaseline: true, included: false, decision: 'stop', method: 'contribution', contrib: T(200000, 400000, 600000), avoid: T(100000, 200000, 300000), oneTime: '700000', opCost: '140000', teamMonths: '8', startMonth: '3', ramp: '3', confidence: '60', sunk: '900000' }),
      mk('a7', { name: 'Mobile app redesign', inBaseline: true, included: false, decision: 'rescope', method: 'contribution', contrib: T(700000, 1400000, 2100000), avoid: Z, oneTime: '600000', opCost: '100000', teamMonths: '7', startMonth: '4', ramp: '2', confidence: '55', sunk: '300000' }),
      mk('a8', { name: 'Partner dashboard v2', inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: T(500000, 800000, 1100000), avoid: T(50000, 100000, 150000), oneTime: '150000', opCost: '40000', teamMonths: '3', startMonth: '2', ramp: '1', confidence: '80' }),
    ],
  },
  tight: {
    label: 'Example B: tight capacity',
    note: 'Only 8 team-months and a $1.0M budget, and the starting proposal is over capacity on purpose. Apply the recommendation to see what the heuristic drops.',
    settings: { horizon: '12', currency: 'USD', capacity: '8', budget: '1000000', scenario: 'base' },
    items: [
      mk('b1', { name: 'Compliance reporting (mandatory)', mandatory: true, inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: Z, avoid: T(0, 40000, 60000), oneTime: '200000', opCost: '30000', teamMonths: '3', startMonth: '1', ramp: '0', confidence: '95' }),
      mk('b2', { name: 'Offer selection pilot', decision: 'start', included: true, method: 'contribution', contrib: T(600000, 1600000, 2800000), avoid: Z, oneTime: '300000', opCost: '60000', teamMonths: '4', startMonth: '3', ramp: '2', confidence: '50', deps: ['b1'] }),
      mk('b3', { name: 'Renewal reminders', decision: 'start', included: true, method: 'contribution', contrib: T(200000, 600000, 1000000), avoid: Z, oneTime: '120000', opCost: '30000', teamMonths: '2', startMonth: '4', ramp: '1', confidence: '45' }),
      mk('b4', { name: 'Partner API v2', decision: 'start', included: true, method: 'margin', rev: T(500000, 1000000, 1600000), varc: T(200000, 400000, 640000), oneTime: '280000', opCost: '70000', teamMonths: '5', startMonth: '5', ramp: '2', confidence: '40' }),
      mk('b5', { name: 'Brand refresh microsite', inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: T(0, 150000, 300000), avoid: Z, oneTime: '150000', opCost: '20000', teamMonths: '2', startMonth: '2', ramp: '0', confidence: '60', sunk: '90000' }),
      mk('b6', { name: 'Zero-effort config change', decision: 'start', included: true, method: 'contribution', contrib: T(30000, 80000, 120000), avoid: Z, oneTime: '0', opCost: '0', teamMonths: '0', startMonth: '1', ramp: '0', confidence: '90' }),
    ],
  },
  mandatory: {
    label: 'Example C: all mandatory',
    note: 'Every item is mandatory and together they exceed capacity, so there is nothing to trade off. Useful to see the warnings.',
    settings: { horizon: '12', currency: 'USD', capacity: '8', budget: '', scenario: 'base' },
    items: [
      mk('c1', { name: 'Regulatory disclosure update', mandatory: true, inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: Z, avoid: Z, oneTime: '180000', opCost: '20000', teamMonths: '4', startMonth: '1', ramp: '0', confidence: '100' }),
      mk('c2', { name: 'Security remediation', mandatory: true, inBaseline: true, included: true, decision: 'continue', method: 'contribution', contrib: Z, avoid: Z, oneTime: '220000', opCost: '10000', teamMonths: '5', startMonth: '1', ramp: '0', confidence: '100' }),
    ],
  },
  empty: { label: 'Empty portfolio', note: 'No initiatives. Add your own.', settings: { horizon: '12', currency: 'USD', capacity: '', budget: '', scenario: 'base' }, items: [] },
};

export function loadExample(key) {
  const ex = EXAMPLES[key] || EXAMPLES.balanced;
  return JSON.parse(JSON.stringify({ settings: ex.settings, items: ex.items }));
}

/* ---------- formatting ---------- */
export function money(v, sym = '$') {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'N/A';
  const a = Math.abs(v), s = v < 0 ? '-' : '';
  if (a >= 1e6) return s + sym + (Math.round(a / 1e4) / 100).toString() + 'M';
  if (a >= 1e4) return s + sym + (Math.round(a / 100) / 10).toString() + 'k';
  return s + sym + Math.round(a).toLocaleString('en-US');
}
export const moneyFull = (v, sym = '$') => (v === null || !Number.isFinite(v)) ? 'N/A' : (v < 0 ? '-' : '') + sym + Math.round(Math.abs(v)).toLocaleString('en-US');
export const pct = (r) => (r === null || !Number.isFinite(r)) ? 'N/A' : Math.round(r * 1000) / 10 + '%';
export const tm = (v) => (Math.round(v * 10) / 10).toLocaleString('en-US');
