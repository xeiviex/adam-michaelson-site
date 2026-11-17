/* Roadmap ROI calculator UI. State lives in this module, so edits survive closing and reopening the overlay.
   Nothing leaves the page: no network calls, no storage. Math is in roi.js. */
import * as R from './roi.js';

const SYM = { USD: '$', EUR: '€', GBP: '£' };
let S = R.loadExample('balanced');
let loaded = 'balanced';
let mode = 'weighted'; // which basis the results table shows
let seq = 100;
const subs = new Set();
export const onCalcChange = (f) => { subs.add(f); };
const changed = () => subs.forEach((f) => f());
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sym = () => SYM[S.settings.currency] || '$';
const $m = (v) => R.money(v, sym());
const $f = (v) => R.moneyFull(v, sym());
const sign = (v) => (v > 0 ? '+' : '');

/* Headline numbers for the slide: confidence-weighted, selected scenario. */
export function summary() {
  const e = R.evaluate(S, 'weighted');
  return { roi: e.proposed.roi, net: e.proposed.net, avoided: e.spend.avoided, redeployed: e.cap.fromStopped, released: e.cap.released, sym: sym(), ev: e, scen: e.scen };
}
export const fmt = { money: (v) => R.money(v, sym()), pct: R.pct, tm: R.tm };

let root = null, uid = 0;

export function mountCalculator(el) {
  root = el; const U = 'rc' + ++uid;
  el.innerHTML =
    '<div class="rc">' +
    '<details class="how"><summary>How this works: assumptions and rules</summary><div class="howb">' +
    '<ul>' +
    '<li><b>Example data.</b> The loaded portfolios are made up. They are not LendingTree figures.</li>' +
    '<li><b>One horizon, one currency.</b> Benefit inputs are the amount earned over the whole horizon if the work ran at full run-rate from month 1.</li>' +
    '<li><b>Timing.</b> Benefits begin in the start month and ramp in a straight line over the ramp months. The share of the horizon realized is the timing factor. Example: horizon 6, start 3, ramp 2 gives months 0, 0, 1/3, 2/3, 1, 1, so the factor is 0.5.</li>' +
    '<li><b>Contribution.</b> Each initiative uses one method: revenue less variable costs, or a direct contribution input. The other is ignored.</li>' +
    '<li><b>Economic benefit</b> = (contribution + cash savings enabled) x timing factor.</li>' +
    '<li><b>Net value</b> = benefit - (remaining one-time investment + incremental operating cost). <b>ROI</b> = net value / that same cost base. Dollars are summed before the portfolio ROI is computed. A zero cost base shows N/A.</li>' +
    '<li><b>Confidence</b> is a haircut on uncertain benefits only. In the confidence-weighted view, benefit is multiplied by confidence / 100. Committed costs are never reduced.</li>' +
    '<li><b>Sunk cost</b> is shown for reference and never enters a forward figure.</li>' +
    '<li><b>No double counting.</b> A stopped item’s remaining cost appears once, as cost avoided. Its cash savings are forgone, not added. Cash savings enabled means savings the initiative creates elsewhere, not its own cost.</li>' +
    '<li><b>Capacity and time.</b> Team-months moved off stopped work are shown separately from cash.</li>' +
    '<li><b>Recommendation.</b> A greedy prioritization heuristic by net value per team-month. It is not an optimizer and can miss the best combination.</li>' +
    '<li><b>Payback</b> is the first month cumulative benefit covers cumulative cost, shown only when a positive timed benefit stream exists. One-time cost is assumed in month 1 and operating cost evenly.</li>' +
    '</ul></div></details>' +
    '<div class="rc-bar" role="group" aria-label="Portfolio actions">' +
    '<label class="sel">Load an example<select data-act-sel="example">' + Object.entries(R.EXAMPLES).map(([k, v]) => '<option value="' + k + '">' + esc(v.label) + '</option>').join('') + '</select></label>' +
    '<button type="button" class="btn" data-act="load">Load example</button>' +
    '<button type="button" class="btn" data-act="reset">Reset to loaded example</button>' +
    '<button type="button" class="btn" data-act="baseline">Restore baseline roadmap</button>' +
    '<button type="button" class="btn" data-act="add">Add initiative</button></div>' +
    '<p class="note" data-exnote></p>' +
    '<fieldset class="rc-set"><legend>Portfolio settings</legend><div class="g">' +
    '<label>Currency<select data-set="currency"><option value="USD">US dollars ($)</option><option value="EUR">Euros (€)</option><option value="GBP">Pounds (£)</option></select></label>' +
    fld(U, 'set', 'horizon', 'Time horizon', 'months, 1 to 36') + fld(U, 'set', 'capacity', 'Team-month capacity', 'team-months; blank for no limit') + fld(U, 'set', 'budget', 'Cash budget (optional)', 'in the chosen currency; blank for none') +
    '<fieldset class="inl"><legend>Scenario</legend>' + ['low', 'base', 'high'].map((s) => '<label><input type="radio" name="' + U + 'sc" data-set="scenario" value="' + s + '"> ' + s[0].toUpperCase() + s.slice(1) + '</label>').join('') + '</fieldset>' +
    '</div></fieldset>' +
    '<div class="rc-live" role="status" aria-live="polite" data-live></div>' +
    '<div data-flags></div>' +
    '<fieldset class="inl rc-mode"><legend>Result basis</legend><label><input type="radio" name="' + U + 'mode" data-mode value="unadjusted"> Unadjusted</label><label><input type="radio" name="' + U + 'mode" data-mode value="weighted"> Confidence-weighted</label></fieldset>' +
    '<div class="rc-res" data-res></div>' +
    '<section aria-labelledby="' + U + 'rec"><h4 id="' + U + 'rec">Recommendation (prioritization heuristic)</h4><div data-rec></div></section>' +
    '<section aria-labelledby="' + U + 'init"><h4 id="' + U + 'init">Initiatives</h4><p class="note">Edit any value. Results update as you type. Low, base and high apply to benefit inputs.</p><div data-items></div></section>' +
    '</div>';
  el.querySelector('[data-act-sel=example]').value = loaded;
  buildItems(); syncSettings(); refresh();
  el.addEventListener('input', onInput); el.addEventListener('change', onChange); el.addEventListener('click', onClick);
}

function fld(U, scope, key, label, unit, extra = '') {
  return '<div class="f"><label for="' + U + scope + key + '">' + label + '</label><input id="' + U + scope + key + '" type="text" inputmode="decimal" autocomplete="off" data-' + scope + '="' + key + '"' + extra + ' aria-describedby="' + U + scope + key + 'u ' + U + scope + key + 'e"><span class="u" id="' + U + scope + key + 'u">' + unit + '</span><span class="err" id="' + U + scope + key + 'e"></span></div>';
}
function triple(U, id, key, label, unit) {
  return '<fieldset class="tri"><legend>' + label + ' <span class="u">' + unit + '</span></legend>' + ['low', 'base', 'high'].map((s) => {
    const fid = U + id + key + s;
    return '<div class="f"><label for="' + fid + '">' + s[0].toUpperCase() + s.slice(1) + '</label><input id="' + fid + '" type="text" inputmode="decimal" autocomplete="off" data-item="' + id + '" data-f="' + key + '.' + s + '" aria-describedby="' + fid + 'e"><span class="err" id="' + fid + 'e"></span></div>';
  }).join('') + '<span class="err" data-ord="' + id + '-' + key + '"></span></fieldset>';
}
function itemField(U, id, key, label, unit) {
  const fid = U + id + key;
  return '<div class="f"><label for="' + fid + '">' + label + '</label><input id="' + fid + '" type="text" inputmode="decimal" autocomplete="off" data-item="' + id + '" data-f="' + key + '" aria-describedby="' + fid + 'u ' + fid + 'e"><span class="u" id="' + fid + 'u">' + unit + '</span><span class="err" id="' + fid + 'e"></span></div>';
}

function buildItems() {
  const U = 'rc' + uid; const host = root.querySelector('[data-items]');
  if (!S.items.length) { host.innerHTML = '<p class="empty">No initiatives. Use “Add initiative” or load an example.</p>'; return; }
  host.innerHTML = S.items.map((it, n) => {
    const id = it.id; const others = S.items.filter((o) => o.id !== id);
    return '<details class="card" data-card="' + id + '"' + (n === 0 ? ' open' : '') + '><summary><span class="cn" data-cn="' + id + '"></span><span class="cs" data-cs="' + id + '"></span></summary><div class="cb">' +
      '<div class="g">' + itemField(U, id, 'name', 'Initiative name', 'text').replace('inputmode="decimal"', '') +
      '<div class="f"><label for="' + U + id + 'dec">Proposed decision</label><select id="' + U + id + 'dec" data-item="' + id + '" data-f="decision">' + R.DECISIONS.map((d) => '<option value="' + d + '">' + R.decisionLabel(d) + '</option>').join('') + '</select><span class="u">label for the plan</span></div>' +
      '<div class="f"><label for="' + U + id + 'inc">In the proposed roadmap?</label><select id="' + U + id + 'inc" data-item="' + id + '" data-f="included"><option value="1">Include</option><option value="0">Defer or stop</option></select><span class="u" data-mand="' + id + '"></span></div></div>' +
      '<div class="g chk"><label><input type="checkbox" data-item="' + id + '" data-f="inBaseline"> In the current (baseline) roadmap</label><label><input type="checkbox" data-item="' + id + '" data-f="mandatory"> Mandatory work</label></div>' +
      '<fieldset class="inl"><legend>Contribution method (one per initiative)</legend><label><input type="radio" name="' + U + id + 'm" data-item="' + id + '" data-f="method" value="margin"> Revenue less variable costs</label><label><input type="radio" name="' + U + id + 'm" data-item="' + id + '" data-f="method" value="contribution"> Direct contribution</label></fieldset>' +
      '<div data-m="margin">' + triple(U, id, 'rev', 'Incremental revenue', 'over horizon at run-rate') + triple(U, id, 'varc', 'Associated variable costs', 'over horizon at run-rate') + '</div>' +
      '<div data-m="contribution">' + triple(U, id, 'contrib', 'Incremental contribution', 'over horizon at run-rate') + '</div>' +
      triple(U, id, 'avoid', 'Cash savings enabled (distinct from this initiative’s own cost)', 'over horizon at run-rate') +
      '<div class="g">' + itemField(U, id, 'oneTime', 'Remaining one-time investment', 'forward cost only') + itemField(U, id, 'opCost', 'Incremental operating cost', 'over the horizon') + itemField(U, id, 'teamMonths', 'Team-months required', 'team-months') + itemField(U, id, 'sunk', 'Sunk cost to date', 'excluded from ROI') +
      itemField(U, id, 'startMonth', 'Benefits start in month', 'whole month, 1 to horizon') + itemField(U, id, 'ramp', 'Ramp months', 'months to full run-rate') + itemField(U, id, 'confidence', 'Confidence', '% of benefit to keep when weighting') + '</div>' +
      (others.length ? '<fieldset class="inl deps"><legend>Depends on (must also be included)</legend>' + others.map((o) => '<label><input type="checkbox" data-item="' + id + '" data-dep="' + o.id + '"> <span data-dn="' + o.id + '"></span></label>').join('') + '</fieldset>' : '') +
      '<div class="rm"><button type="button" class="btn" data-rm="' + id + '">Remove this initiative</button></div>' +
      '</div></details>';
  }).join('');
  fillInputs();
}

function fillInputs() {
  root.querySelectorAll('[data-item][data-f]').forEach((c) => {
    const it = S.items.find((x) => x.id === c.dataset.item); if (!it) return;
    const path = c.dataset.f.split('.'); let v = it; for (const p of path) v = v == null ? v : v[p];
    if (c.type === 'checkbox') c.checked = !!v;
    else if (c.type === 'radio') c.checked = v === c.value;
    else if (c.dataset.f === 'included') c.value = it.mandatory || it.included ? '1' : '0';
    else c.value = v == null ? '' : v;
  });
  root.querySelectorAll('[data-dep]').forEach((c) => { const it = S.items.find((x) => x.id === c.dataset.item); c.checked = !!(it && it.deps.includes(c.dataset.dep)); });
  root.querySelectorAll('[data-card]').forEach((card) => syncCardMode(card));
}
function syncCardMode(card) {
  const it = S.items.find((x) => x.id === card.dataset.card); if (!it) return;
  card.querySelectorAll('[data-m]').forEach((d) => { d.hidden = d.dataset.m !== it.method; });
  const inc = card.querySelector('[data-f=included]'); const mand = card.querySelector('[data-mand]');
  if (inc) { inc.disabled = it.mandatory; inc.value = it.mandatory || it.included ? '1' : '0'; }
  if (mand) mand.textContent = it.mandatory ? 'Mandatory work stays in the scenario' : 'include or defer';
}
function syncSettings() {
  root.querySelectorAll('[data-set]').forEach((c) => {
    if (c.type === 'radio') c.checked = S.settings.scenario === c.value; else c.value = S.settings[c.dataset.set];
  });
  root.querySelector('[data-exnote]').textContent = R.EXAMPLES[loaded] ? R.EXAMPLES[loaded].note : '';
  root.querySelectorAll('[data-mode]').forEach((c) => { c.checked = c.value === mode; });
}

/* ---------- events ---------- */
function onInput(e) {
  const c = e.target;
  if (c.dataset.set && c.type !== 'radio') { S.settings[c.dataset.set] = c.value; return refresh(true); }
  if (c.dataset.item && c.dataset.f && c.type !== 'checkbox' && c.type !== 'radio' && c.tagName !== 'SELECT') {
    const it = S.items.find((x) => x.id === c.dataset.item); if (!it) return;
    const path = c.dataset.f.split('.'); let o = it; for (let i = 0; i < path.length - 1; i++) o = o[path[i]]; o[path[path.length - 1]] = c.value;
    refresh(true);
  }
}
function onChange(e) {
  const c = e.target;
  if (c.dataset.set) { S.settings[c.dataset.set] = c.value; if (c.dataset.set === 'currency' || c.dataset.set === 'scenario') refresh(true); return; }
  if (c.hasAttribute('data-mode')) { mode = c.value; return refresh(true); }
  if (c.dataset.dep) { const it = S.items.find((x) => x.id === c.dataset.item); it.deps = c.checked ? [...new Set([...it.deps, c.dataset.dep])] : it.deps.filter((d) => d !== c.dataset.dep); return refresh(true); }
  if (c.dataset.item && c.dataset.f) {
    const it = S.items.find((x) => x.id === c.dataset.item); if (!it) return; const f = c.dataset.f;
    if (f === 'inBaseline' || f === 'mandatory') { it[f] = c.checked; if (f === 'mandatory' && c.checked) it.included = true; }
    else if (f === 'included') { it.included = c.value === '1'; it.decision = it.included ? (it.inBaseline ? 'continue' : 'start') : (it.inBaseline ? 'stop' : 'start'); c.closest('.card').querySelector('[data-f=decision]').value = it.decision; }
    else if (f === 'decision') { it.decision = c.value; if (!it.mandatory) it.included = c.value !== 'stop'; c.closest('.card').querySelector('[data-f=included]').value = it.mandatory || it.included ? '1' : '0'; }
    else if (f === 'method') it.method = c.value;
    syncCardMode(c.closest('.card')); refresh(true);
  }
}
function onClick(e) {
  const b = e.target.closest('button'); if (!b) return;
  const a = b.dataset.act; const inRec = !!b.closest('[data-rec]');
  if (a === 'apply' || a === 'baseline') setTimeout(() => { const t = root.querySelector((inRec ? '[data-rec]' : '.rc-bar') + ' [data-act="' + a + '"]'); if (t) t.focus(); }, 0);
  if (a === 'load') { loaded = root.querySelector('[data-act-sel=example]').value; S = R.loadExample(loaded); reseq(); rebuild(); say('Loaded ' + R.EXAMPLES[loaded].label + '.'); }
  else if (a === 'reset') { S = R.loadExample(loaded); reseq(); rebuild(); say('Reset to ' + R.EXAMPLES[loaded].label + '. Your edits were discarded.'); }
  else if (a === 'baseline') { S.items = R.restoreBaseline(S.items); fillInputs(); refresh(true); say('Selection restored to the baseline roadmap. Compare it with your proposal by applying the recommendation or re-including items.'); }
  else if (a === 'add') { const it = R.blankItem('n' + ++seq); it.name = 'New initiative'; S.items.push(it); buildItems(); refresh(true); const card = root.querySelector('[data-card="' + it.id + '"]'); if (card) { card.open = true; card.querySelector('input').focus(); } say('Added a new initiative.'); }
  else if (a === 'apply') { S.items = R.applyRecommendation(S, 'weighted'); fillInputs(); refresh(true); say('Applied the recommendation. You can still override any row.'); }
  else if (b.dataset.rm) { const id = b.dataset.rm; S.items = S.items.filter((x) => x.id !== id); S.items.forEach((x) => { x.deps = x.deps.filter((d) => d !== id); }); buildItems(); refresh(true); say('Removed the initiative.'); const add = root.querySelector('[data-act=add]'); if (add) add.focus(); }
}
function reseq() { S.items.forEach((x) => { const m = /^n(\d+)$/.exec(x.id); if (m) seq = Math.max(seq, +m[1]); }); }
function rebuild() { root.querySelector('[data-act-sel=example]').value = loaded; buildItems(); syncSettings(); refresh(true); }
let sayT; function say(msg) { const l = root.querySelector('[data-live]'); clearTimeout(sayT); sayT = setTimeout(() => { l.textContent = msg; }, 80); }

/* ---------- output ---------- */
let liveT;
function refresh(announce) {
  const ev = R.evaluate(S, mode);
  const other = R.evaluate(S, mode === 'weighted' ? 'unadjusted' : 'weighted');
  paintFlags(ev); paintResults(ev); paintRec(); paintCards(ev);
  changed();
  if (announce) {
    clearTimeout(liveT);
    liveT = setTimeout(() => {
      const w = R.evaluate(S, 'weighted');
      const bad = countErrors(w);
      root.querySelector('[data-live]').textContent = 'Proposed net value ' + $m(w.proposed.net) + ', ROI ' + R.pct(w.proposed.roi) + ', confidence-weighted. ' + w.flags.filter((f) => f.kind !== 'info' && f.kind !== 'value').length + ' warnings.' + (bad ? ' ' + bad + ' inputs need attention.' : '');
    }, 700);
  }
  void other;
}
function countErrors(ev) { return ev.rows.reduce((a, r) => a + Object.keys(r.errors).filter((k) => !k.endsWith('.order')).length, 0) + Object.keys(ev.cfg.errors).length; }

function paintFlags(ev) {
  const host = root.querySelector('[data-flags]');
  const errs = Object.values(ev.cfg.errors);
  const items = ev.flags.map((f) => '<li class="fl-' + f.kind + '"><b>' + ({ capacity: 'Capacity', dependency: 'Dependency', mandatory: 'Mandatory', budget: 'Budget', value: 'Value', info: 'Note' }[f.kind]) + ':</b> ' + esc(f.text) + '</li>').join('');
  host.innerHTML = '<h4>Checks on this scenario</h4>' + (items || errs.length ? '<ul class="flags">' + errs.map((t) => '<li class="fl-info"><b>Setting:</b> ' + esc(t) + '</li>').join('') + items + '</ul>' : '<p class="ok">No capacity, budget, dependency, or mandatory-work problems.</p>');
}

const row = (label, a, b, d, cls = '') => '<tr class="' + cls + '"><th scope="row">' + label + '</th><td>' + a + '</td><td>' + b + '</td><td>' + d + '</td></tr>';
function paintResults(ev) {
  const host = root.querySelector('[data-res]'); const A = ev.baseline, P = ev.proposed, rc = ev.recon;
  const dm = (x, y) => sign(y - x) + $m(y - x);
  const roiD = A.roi === null || P.roi === null ? 'N/A' : sign(P.roi - A.roi) + Math.round((P.roi - A.roi) * 1000) / 10 + ' pts';
  const scen = ['low', 'base', 'high'].map((s) => { const u = R.evaluate(S, 'unadjusted', s), w = R.evaluate(S, 'weighted', s); return '<tr class="' + (s === ev.scen ? 'cur' : '') + '"><th scope="row">' + s[0].toUpperCase() + s.slice(1) + (s === ev.scen ? ' (selected)' : '') + '</th><td>' + $m(u.proposed.net) + '</td><td>' + R.pct(u.proposed.roi) + '</td><td>' + $m(w.proposed.net) + '</td><td>' + R.pct(w.proposed.roi) + '</td></tr>'; }).join('');
  const ledger = ev.rows.map((r) => {
    const st = r.n.inBaseline ? (R.isIn(r.n) ? 'Kept' : 'Stopped or deferred') : (R.isIn(r.n) ? 'Started' : 'Not started');
    return '<tr class="' + (R.isIn(r.n) || r.n.inBaseline ? '' : 'mut') + '"><th scope="row">' + esc(r.n.name || 'Unnamed') + (r.n.mandatory ? ' <small>(mandatory)</small>' : '') + '</th><td>' + st + '</td><td title="' + $f(r.e.benefit) + '">' + $m(r.e.benefit) + '</td><td title="' + $f(r.e.cost) + '">' + $m(r.e.cost) + '</td><td>' + $m(r.e.net) + '</td><td>' + R.tm(r.n.teamMonths) + '</td></tr>';
  }).join('');
  host.innerHTML =
    '<h4>Results: baseline roadmap versus proposed selection</h4>' +
    '<p class="note">' + (mode === 'weighted' ? 'Benefits are multiplied by each initiative’s confidence. Costs are not reduced.' : 'Benefits are taken at face value. Confidence is not applied.') + ' Scenario: ' + ev.scen + '. Horizon: ' + ev.cfg.H + ' months.</p>' +
    '<div class="tw" tabindex="0" role="region" aria-label="Scenario results table"><table><caption class="sr">Baseline versus proposed results</caption><thead><tr><th scope="col">Measure</th><th scope="col">Baseline roadmap</th><th scope="col">Proposed selection</th><th scope="col">Change</th></tr></thead><tbody>' +
    row('Incremental contribution (timed)', $m(A.benefitContribution), $m(P.benefitContribution), dm(A.benefitContribution, P.benefitContribution)) +
    row('Cash savings enabled (timed)', $m(A.benefitSavings), $m(P.benefitSavings), dm(A.benefitSavings, P.benefitSavings)) +
    row('Economic benefit', $m(A.benefit), $m(P.benefit), dm(A.benefit, P.benefit), 'sub') +
    row('Remaining one-time investment', $m(A.oneTime), $m(P.oneTime), dm(A.oneTime, P.oneTime)) +
    row('Incremental operating cost', $m(A.opCost), $m(P.opCost), dm(A.opCost, P.opCost)) +
    row('Cost base', $m(A.cost), $m(P.cost), dm(A.cost, P.cost), 'sub') +
    row('Net value', $m(A.net), $m(P.net), dm(A.net, P.net), 'key') +
    row('ROI (net value / cost base)', R.pct(A.roi), R.pct(P.roi), roiD, 'key') +
    row('Simple payback', esc(A.payback.text), esc(P.payback.text), '') +
    row('Team-months used', R.tm(A.teamMonths) + (ev.cap.limit !== null ? ' of ' + R.tm(ev.cap.limit) : ''), R.tm(P.teamMonths) + (ev.cap.limit !== null ? ' of ' + R.tm(ev.cap.limit) : ''), sign(P.teamMonths - A.teamMonths) + R.tm(P.teamMonths - A.teamMonths)) +
    '</tbody></table></div>' +
    '<h4>Where the change comes from</h4>' +
    '<div class="tw" tabindex="0" role="region" aria-label="Reconciliation table"><table><caption class="sr">Reconciliation of net value and capacity</caption><tbody>' +
    '<tr><th scope="row">Benefit of started work</th><td>' + sign(rc.benefitAdded) + $m(rc.benefitAdded) + '</td></tr>' +
    '<tr><th scope="row">Cost of started work</th><td>-' + $m(rc.costAdded) + '</td></tr>' +
    '<tr><th scope="row">Benefit forgone from stopped or deferred work (includes its cash savings)</th><td>-' + $m(rc.benefitForgone) + '</td></tr>' +
    '<tr><th scope="row">Remaining cost avoided on stopped or deferred work (counted once)</th><td>+' + $m(rc.costAvoided) + '</td></tr>' +
    '<tr class="key"><th scope="row">Change in net value</th><td>' + sign(rc.delta) + $m(rc.delta) + (rc.check ? '' : ' <b>(does not match; report this)</b>') + '</td></tr>' +
    '<tr><th scope="row">Spending retained on kept work</th><td>' + $m(ev.spend.retained) + '</td></tr>' +
    '<tr><th scope="row">Spending avoided</th><td>' + $m(ev.spend.avoided) + '</td></tr>' +
    '<tr><th scope="row">Spending added</th><td>' + $m(ev.spend.added) + '</td></tr>' +
    '<tr><th scope="row">Team-months moved off stopped or deferred work (redeployed)</th><td>' + R.tm(ev.cap.fromStopped) + '</td></tr>' +
    '<tr><th scope="row">Team-months taken by started work</th><td>' + R.tm(ev.cap.toStarted) + '</td></tr>' +
    '<tr class="key"><th scope="row">Net team-months released (baseline minus proposed)</th><td>' + sign(ev.cap.released) + R.tm(ev.cap.released) + '</td></tr>' +
    '<tr class="mut"><th scope="row">Sunk cost excluded from every figure above (' + $m(ev.sunk.sunkStopped) + ' on stopped or deferred work)</th><td>' + $m(ev.sunk.sunkExcluded) + '</td></tr>' +
    '</tbody></table></div>' +
    '<h4>Initiative ledger</h4><p class="note">Every dollar and team-month above is the sum of these rows. Baseline roadmap total is the Kept and Stopped rows. Proposed total is the Kept and Started rows.</p>' +
    '<div class="tw" tabindex="0" role="region" aria-label="Initiative ledger"><table><caption class="sr">Per-initiative benefit, cost, net value and team-months</caption><thead><tr><th scope="col">Initiative</th><th scope="col">Treatment</th><th scope="col">Benefit</th><th scope="col">Cost base</th><th scope="col">Net value</th><th scope="col">Team-months</th></tr></thead><tbody>' + (ledger || '<tr><td colspan="6">No initiatives.</td></tr>') +
    '</tbody><tfoot><tr><th scope="row">Baseline roadmap total</th><td></td><td>' + $m(A.benefit) + '</td><td>' + $m(A.cost) + '</td><td>' + $m(A.net) + '</td><td>' + R.tm(A.teamMonths) + '</td></tr><tr><th scope="row">Proposed selection total</th><td></td><td>' + $m(P.benefit) + '</td><td>' + $m(P.cost) + '</td><td>' + $m(P.net) + '</td><td>' + R.tm(P.teamMonths) + '</td></tr></tfoot></table></div>' +
    '<h4>Low, base and high for the proposed selection</h4>' +
    '<div class="tw" tabindex="0" role="region" aria-label="Scenario table"><table><caption class="sr">Proposed selection under low, base and high assumptions</caption><thead><tr><th scope="col">Scenario</th><th scope="col">Net value, unadjusted</th><th scope="col">ROI, unadjusted</th><th scope="col">Net value, weighted</th><th scope="col">ROI, weighted</th></tr></thead><tbody>' + scen + '</tbody></table></div>';
}

function paintRec() {
  const host = root.querySelector('[data-rec]');
  const rec = R.recommend(S, 'weighted'); const ev = R.evaluate(S, 'weighted');
  const byId = new Map(ev.rows.map((r) => [r.n.id, r]));
  const lines = []; const done = new Set();
  const add = (id) => {
    if (done.has(id) || !byId.has(id)) return; done.add(id); const r = byId.get(id);
    const recIn = rec.selected.has(id), cur = R.isIn(r.n);
    lines.push('<tr class="' + (recIn !== cur ? 'diff' : '') + '"><th scope="row">' + esc(r.n.name || 'Unnamed') + '</th><td>' + (recIn ? 'Include' : 'Defer or stop') + '</td><td>' + (cur ? 'Include' : 'Defer or stop') + (recIn !== cur ? ' <b>(differs)</b>' : '') + '</td><td>' + esc(rec.why.get(id) || '') + '</td></tr>');
  };
  ev.rows.filter((r) => r.n.mandatory).forEach((r) => add(r.n.id));
  rec.order.forEach((o) => add(o.id));
  ev.rows.forEach((r) => add(r.n.id));
  host.innerHTML = '<p class="note">Ranks discretionary work by confidence-weighted net value per team-month. Ties go to higher net value, then higher confidence, then fewer team-months, then list order. Mandatory work and its dependencies are always kept. Items with zero or negative net value are never recommended. Greedy, not optimal: it can miss a better combination, so treat it as a starting point and override freely.</p>' +
    (rec.notes.length ? '<p class="note"><b>' + esc(rec.notes.join(' ')) + '</b></p>' : '') +
    '<div class="rc-bar"><button type="button" class="btn pri" data-act="apply"' + (S.items.length ? '' : ' disabled') + '>Apply recommendation</button><button type="button" class="btn" data-act="baseline">Restore baseline roadmap</button></div>' +
    '<div class="tw" tabindex="0" role="region" aria-label="Recommendation table"><table><caption class="sr">Recommended and current selection per initiative</caption><thead><tr><th scope="col">Initiative</th><th scope="col">Recommended</th><th scope="col">Current</th><th scope="col">Why</th></tr></thead><tbody>' + (lines.join('') || '<tr><td colspan="4">No initiatives.</td></tr>') + '</tbody></table></div>';
}

function paintCards(ev) {
  ev.rows.forEach((r) => {
    const id = r.n.id; const cn = root.querySelector('[data-cn="' + id + '"]'); if (!cn) return;
    cn.textContent = r.n.name || 'Unnamed initiative';
    root.querySelector('[data-cs="' + id + '"]').textContent = (R.isIn(r.n) ? 'Included' : 'Deferred') + ' · ' + R.decisionLabel(r.n.decision) + ' · net ' + $m(r.e.net) + ' · ROI ' + R.pct(r.e.roi) + ' · ' + R.tm(r.n.teamMonths) + ' tm' + (r.n.mandatory ? ' · mandatory' : '');
    root.querySelectorAll('[data-dn="' + id + '"]').forEach((s) => { s.textContent = r.n.name || 'Unnamed initiative'; });
    root.querySelectorAll('[data-item="' + id + '"][data-f]').forEach((c) => {
      const f = c.dataset.f; const errEl = root.querySelector('#' + CSS.escape(c.id + 'e')); if (!errEl) return;
      const msg = r.errors[f] || ''; errEl.textContent = msg; c.setAttribute('aria-invalid', msg ? 'true' : 'false');
    });
    ['rev', 'varc', 'contrib', 'avoid'].forEach((k) => { const el = root.querySelector('[data-ord="' + id + '-' + k + '"]'); if (el) el.textContent = r.errors[k + '.order'] || ''; });
  });
  root.querySelectorAll('[data-set]').forEach((c) => {
    if (c.type === 'radio') return; const k = c.dataset.set; const errEl = root.querySelector('#' + CSS.escape(c.id + 'e'));
    if (errEl) { const m = ev.cfg.errors[k] || ''; errEl.textContent = m; c.setAttribute('aria-invalid', m ? 'true' : 'false'); }
  });
}
