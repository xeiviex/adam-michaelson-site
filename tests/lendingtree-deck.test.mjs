import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import * as R from '../public/lendingtree/deck/roi.js';
import { SLIDES, DAYS, LEGACY, LEGACY_ARCHIVE_IDS, MEASURES, rollup } from '../public/lendingtree/deck/data.js';

const pub = new URL('../public/', import.meta.url).pathname;
const read = (p) => readFileSync(join(pub, p), 'utf8');
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, a + ' vs ' + b);

/* ---------------------------------------------------------------- calculator math */
const item = (id, o = {}) => ({ ...R.blankItem(id), name: id, ...o });
const T = (v) => ({ low: String(v), base: String(v), high: String(v) });
const state = (items, settings = {}) => ({ settings: { horizon: '6', currency: 'USD', capacity: '', budget: '', scenario: 'base', ...settings }, items });

test('hand-calculated example: margin method, savings, confidence', () => {
  // revenue 500,000 - variable 200,000 = contribution 300,000; savings 50,000; cost 100,000 + 40,000.
  const x = item('x', { inBaseline: true, method: 'margin', rev: T(500000), varc: T(200000), avoid: T(50000), oneTime: '100000', opCost: '40000', confidence: '60', teamMonths: '3' });
  const u = R.evaluate(state([x]), 'unadjusted');
  close(u.proposed.benefit, 350000); close(u.proposed.cost, 140000); close(u.proposed.net, 210000); close(u.proposed.roi, 1.5);
  const w = R.evaluate(state([x]), 'weighted');
  close(w.proposed.benefit, 210000); close(w.proposed.net, 70000); close(w.proposed.roi, 0.5);
});

test('one input method per row: the other method is ignored', () => {
  const a = item('a', { method: 'margin', rev: T(100000), varc: T(40000), contrib: T(999999) });
  const b = item('b', { method: 'contribution', rev: T(999999), varc: T(0), contrib: T(60000) });
  const e = R.evaluate(state([a, b]), 'unadjusted');
  close(e.rows[0].e.contribution, 60000); close(e.rows[1].e.contribution, 60000);
});

test('timing factor: start 3, ramp 2 over 6 months realises half', () => {
  const t = R.timing(6, 3, 2);
  assert.deepEqual(t.months.map((m) => Math.round(m * 1000) / 1000), [0, 0, 0.333, 0.667, 1, 1]);
  close(t.factor, 0.5);
  const x = item('x', { method: 'contribution', contrib: T(120000), startMonth: '3', ramp: '2' });
  close(R.evaluate(state([x]), 'unadjusted').proposed.benefit, 60000);
});

test('portfolio ROI sums dollars first, not an average of ratios', () => {
  const x = item('x', { method: 'contribution', contrib: T(250000), oneTime: '100000' });  // net 150k on 100k = 150%
  const y = item('y', { method: 'contribution', contrib: T(100000), oneTime: '50000' });   // net 50k on 50k = 100%
  const e = R.evaluate(state([x, y]), 'unadjusted');
  close(e.proposed.net, 200000); close(e.proposed.cost, 150000); close(e.proposed.roi, 200000 / 150000);
  assert.notEqual(Math.round(e.proposed.roi * 1000), 1250);
});

test('zero or undefined denominator gives N/A', () => {
  const free = item('f', { method: 'contribution', contrib: T(10000) });
  const e = R.evaluate(state([free]), 'unadjusted');
  assert.equal(e.proposed.roi, null); assert.equal(R.pct(e.proposed.roi), 'N/A');
  assert.equal(R.pct(R.evaluate(state([]), 'unadjusted').proposed.roi), 'N/A');
  assert.equal(R.pct(NaN), 'N/A');
});

test('negative net value is shown, not hidden', () => {
  const x = item('x', { method: 'contribution', contrib: T(50000), oneTime: '100000', opCost: '40000' });
  const e = R.evaluate(state([x]), 'unadjusted');
  close(e.proposed.net, -90000); close(e.proposed.roi, -90000 / 140000);
  assert.ok(e.flags.some((f) => f.kind === 'value'));
});

test('invalid input is reported and counted as zero, never NaN', () => {
  const x = item('x', { method: 'contribution', contrib: { low: 'abc', base: '-5', high: '1e3' }, oneTime: '12x', startMonth: '99', confidence: '150' });
  const r = R.evaluate(state([x]), 'weighted').rows[0];
  for (const k of ['contrib.low', 'oneTime', 'startMonth', 'confidence']) assert.ok(r.errors[k], k + ' should have an error');
  assert.ok(Number.isFinite(r.e.net));
  assert.equal(R.parseNum('1,250,000').value, 1250000);
  assert.equal(R.parseNum('').blank, true);
});

test('stopped item: avoided cost counted once, its savings are forgone', () => {
  const keep = item('keep', { inBaseline: true, included: true, method: 'contribution', contrib: T(300000), oneTime: '100000', teamMonths: '2' });
  const stop = item('stop', { inBaseline: true, included: false, decision: 'stop', method: 'contribution', contrib: T(0), avoid: T(50000), oneTime: '100000', teamMonths: '2', sunk: '800000' });
  const e = R.evaluate(state([keep, stop]), 'unadjusted');
  close(e.recon.costAvoided, 100000); close(e.recon.benefitForgone, 50000); close(e.recon.delta, 50000);
  close(e.proposed.net - e.baseline.net, 50000); assert.ok(e.recon.check);
  close(e.spend.avoided, 100000); close(e.spend.retained, 100000);
  close(e.cap.released, 2); close(e.cap.fromStopped, 2); close(e.sunk.sunkStopped, 800000);
  assert.equal(R.evaluate(state([keep, stop]), 'unadjusted').proposed.net, 200000); // sunk cost never enters
});

test('reconciliation always equals proposed minus baseline (all examples, both bases, all scenarios)', () => {
  for (const k of Object.keys(R.EXAMPLES)) for (const mode of ['unadjusted', 'weighted']) for (const sc of R.SCEN) {
    const e = R.evaluate(R.loadExample(k), mode, sc);
    assert.ok(e.recon.check, k + ' ' + mode + ' ' + sc);
    close(e.recon.delta, e.proposed.net - e.baseline.net, 1e-4);
  }
});

test('payback only with a positive timed benefit stream', () => {
  const ok = item('ok', { method: 'contribution', contrib: T(360000), oneTime: '120000' }); // 60k a month, 120k in month 1
  assert.equal(R.evaluate(state([ok]), 'unadjusted').proposed.payback.month, 2);
  const none = item('none', { method: 'contribution', contrib: T(0), oneTime: '1000' });
  assert.equal(R.evaluate(state([none]), 'unadjusted').proposed.payback.status, 'na');
  const slow = item('slow', { method: 'contribution', contrib: T(1000), oneTime: '100000' });
  assert.equal(R.evaluate(state([slow]), 'unadjusted').proposed.payback.status, 'beyond');
});

test('capacity-constrained recommendation: net value per team-month, with tie-break and reasons', () => {
  const A = item('A', { method: 'contribution', contrib: T(200000), oneTime: '100000', teamMonths: '3' }); // net 100k, 33.3k/tm
  const B = item('B', { method: 'contribution', contrib: T(190000), oneTime: '100000', teamMonths: '3' }); // net 90k, 30k/tm
  const C = item('C', { method: 'contribution', contrib: T(140000), oneTime: '100000', teamMonths: '1' }); // net 40k, 40k/tm
  const rec = R.recommend(state([A, B, C], { capacity: '5' }), 'unadjusted');
  assert.deepEqual([...rec.selected].sort(), ['A', 'C']);
  assert.match(rec.why.get('B'), /capacity/i);
  assert.deepEqual(rec.order.map((o) => o.id), ['C', 'A', 'B']);
  const over = R.evaluate(state([A, B, C], { capacity: '5' }), 'unadjusted');
  assert.ok(over.flags.some((f) => f.kind === 'capacity'), 'selecting all three is over capacity');
  // tie-break: equal score, higher net first
  const P1 = item('P1', { method: 'contribution', contrib: T(200000), oneTime: '100000', teamMonths: '2' }); // 50k/tm net 100k
  const P2 = item('P2', { method: 'contribution', contrib: T(150000), oneTime: '100000', teamMonths: '1' }); // 50k/tm net 50k
  assert.deepEqual(R.recommend(state([P2, P1]), 'unadjusted').order.map((o) => o.id), ['P1', 'P2']);
});

test('dependencies: pulled in with their parent, flagged when unresolved, rejected when net-negative', () => {
  const dep = item('dep', { method: 'contribution', contrib: T(0), oneTime: '50000', teamMonths: '1' });
  const top = item('top', { method: 'contribution', contrib: T(300000), oneTime: '100000', teamMonths: '2', deps: ['dep'] });
  const rec = R.recommend(state([top, dep]), 'unadjusted');
  assert.deepEqual([...rec.selected].sort(), ['dep', 'top']);
  assert.match(rec.why.get('dep'), /Added with/);
  const e = R.evaluate(state([{ ...top, included: true }, { ...dep, included: false }]), 'unadjusted');
  assert.ok(e.flags.some((f) => f.kind === 'dependency'));
  const weak = item('weak', { method: 'contribution', contrib: T(120000), oneTime: '100000', teamMonths: '1', deps: ['dep'] }); // net 20k, dep costs 50k
  assert.ok(!R.recommend(state([weak, dep]), 'unadjusted').selected.has('weak'));
});

test('mandatory work stays in, and conflicts are reported', () => {
  const m = item('m', { mandatory: true, included: false, inBaseline: true, method: 'contribution', contrib: T(0), oneTime: '100000', teamMonths: '6' });
  const d = item('d', { method: 'contribution', contrib: T(500000), oneTime: '100000', teamMonths: '2' });
  const s = state([m, d], { capacity: '5' });
  const e = R.evaluate(s, 'unadjusted');
  assert.ok(e.proposed.count >= 1 && R.isIn(e.rows[0].n), 'mandatory item is in the selection even when included=false');
  assert.ok(e.flags.some((f) => f.kind === 'mandatory' && /alone/.test(f.text)), 'mandatory alone exceeds capacity');
  assert.ok(!R.recommend(s, 'unadjusted').selected.has('d'), 'nothing discretionary fits');
  const all = R.evaluate(R.loadExample('mandatory'), 'unadjusted');
  assert.ok(all.flags.some((f) => /Every initiative is mandatory/.test(f.text)));
});

test('budget overrun and empty portfolio', () => {
  const e = R.evaluate(state([item('x', { method: 'contribution', contrib: T(1), oneTime: '500000' })], { budget: '100000' }), 'unadjusted');
  assert.ok(e.flags.some((f) => f.kind === 'budget'));
  const empty = R.evaluate(R.loadExample('empty'), 'unadjusted');
  assert.equal(empty.proposed.net, 0); assert.ok(empty.flags.length);
});

test('apply recommendation, restore baseline, and reset leave no shared state', () => {
  const s = R.loadExample('balanced');
  const applied = R.applyRecommendation(s, 'weighted');
  const sel = R.recommend(s, 'weighted').selected;
  for (const it of applied) assert.equal(it.included || it.mandatory, sel.has(it.id) || it.mandatory);
  const back = R.restoreBaseline(applied);
  for (const it of back) assert.equal(it.included, !!it.inBaseline);
  s.items[0].name = 'edited'; assert.notEqual(R.loadExample('balanced').items[0].name, 'edited');
});

/* ---------------------------------------------------------------- deck content */
test('exactly seven screens in the required order with stable fragments', () => {
  assert.deepEqual(SLIDES.map((s) => s.id), ['overview', 'roadmap', 'down-funnel', 'mcp', 'embedded', 'disruption', 'teams']);
});

test('every screen has a Gantt at Days 30, 60, 90 and 180 with the detail fields', () => {
  assert.deepEqual(DAYS, [30, 60, 90, 180]);
  for (const s of SLIDES) {
    assert.deepEqual(s.gantt.map((m) => m.d), DAYS, s.id);
    for (const m of s.gantt) for (const k of ['short', 'owner', 'commit', 'target', 'dep', 'evidence']) assert.ok(m[k] && m[k].length > 3, s.id + ' ' + m.d + ' ' + k);
  }
});

test('six strategy ROI blocks plus the overview scorecard', () => {
  const strategies = SLIDES.slice(1);
  assert.equal(strategies.length, 6);
  for (const s of strategies) { assert.ok(s.econ && s.measure, s.id); assert.ok(s.metrics === 'live' || s.metrics.length >= 3, s.id); }
  assert.equal(SLIDES[0].metrics.length, 3);
  assert.deepEqual(SLIDES[0].metrics.map((m) => m.k), ['Incremental contribution', 'Capacity redeployed', 'Evidence for more investment']);
  assert.deepEqual(SLIDES[2].metrics.map((m) => m.k), ['Selection conversion', 'Revenue per eligible shopper', 'Incremental contribution margin', 'Lender or carrier acquisition economics']);
});

test('overview rollup is built from the same milestone objects as each strategy Gantt', () => {
  const r = rollup(); assert.equal(r.length, 6);
  r.forEach((row, i) => row.cells.forEach((c, k) => assert.strictEqual(c, SLIDES[i + 1].gantt[k])));
});

test('measurement tables exist for each strategy and use the explicit baseline wording', () => {
  for (const s of SLIDES.slice(1)) { assert.ok(MEASURES[s.id] && MEASURES[s.id].length >= 3, s.id); }
  assert.ok(Object.values(MEASURES).flat().some((r) => r.includes('Baseline to establish')));
});

test('leadership asks, three charters, four teams, offer-first lifecycle stages are present', () => {
  const ov = JSON.stringify(SLIDES[0].details);
  for (const t of ['Executive introductions', 'reallocate roadmap capacity', 'CTO', 'hiring or contractors', 'performance measures and a review cadence', 'Executive phase gate']) assert.match(ov, new RegExp(t));
  assert.match(JSON.stringify(SLIDES[5].details), /Pod A[\s\S]*Pod B[\s\S]*Pod C/);
  const app = read('lendingtree/deck/app.js');
  for (const t of ['Lending Down-Funnel', 'Insurance Down-Funnel', 'MCP/API', 'Embedded', 'Generate offers', 'Generate quotes', 'Present and compare', 'Select', 'Underwriting or approval', 'Funding', 'Servicing or refinance', 'Bind', 'Renewal and re-shop']) assert.ok(app.includes(t), t);
});

test('every archive anchor has a compatibility mapping', () => {
  const ids = [...read('lendingtree1/index.html').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length > 50);
  for (const id of ids) assert.ok(LEGACY[id] || LEGACY_ARCHIVE_IDS.includes(id), 'unmapped archive id ' + id);
  for (const to of Object.values(LEGACY)) assert.ok(SLIDES.some((s) => '#' + s.id === to));
});

/* ---------------------------------------------------------------- archive, routes, links */
test('archive is the original page with only its page-local asset paths versioned', () => {
  const arch = read('lendingtree1/index.html');
  const restored = arch.replace('/lendingtree1/lt.css?v=30', '/lendingtree/lt.css?v=30').replace('/lendingtree1/lt.js?v=1', '/lendingtree/lt.js?v=1');
  const h = createHash('sha256').update(restored).digest('hex');
  assert.equal(h, ORIGINAL_SHA, 'archive differs from the original beyond the two versioned paths');
  assert.equal(read('lendingtree1/lt.css'), read('lendingtree/lt.css'));
  assert.equal(read('lendingtree1/lt.js'), read('lendingtree/lt.js'));
  assert.match(arch, /<meta name="robots" content="noindex">/);
});

function resolves(url) {
  const path = url.split('#')[0].split('?')[0];
  const f = join(pub, path.replace(/^\//, ''));
  if (existsSync(f) && statSync(f).isFile()) return true;
  return existsSync(join(f, 'index.html'));
}
test('internal links and assets resolve on the archive, the new deck, and all three prototypes', () => {
  for (const page of ['lendingtree1/index.html', 'lendingtree/index.html', 'lendingtree/choice/index.html', 'lendingtree/companion/index.html', 'lendingtree/outcomes/index.html']) {
    const html = read(page);
    const refs = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('//'));
    for (const u of refs) assert.ok(resolves(u), page + ' -> ' + u);
  }
  const html = read('lendingtree1/index.html');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(m[1]), 'dead anchor #' + m[1]);
});

test('deck modules reference only files that exist, and the page keeps noindex and the scroll-hint opt-out', () => {
  const html = read('lendingtree/index.html');
  assert.match(html, /name="robots" content="noindex"/); assert.match(html, /data-no-scroll-hint/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/); assert.doesNotMatch(html, /maximum-scale|user-scalable/);
  for (const f of ['app.js', 'data.js', 'roi.js', 'roi-ui.js', 'embed.js', 'deck.css']) assert.ok(existsSync(join(pub, 'lendingtree/deck', f)), f);
});

test('prototypes keep working and link back to the right strategy page', () => {
  const bl = read('lendingtree/backlink.js');
  assert.match(bl, /\/lendingtree1\//);
  for (const p of ['choice', 'companion', 'outcomes']) { assert.match(read('lendingtree/' + p + '/index.html'), /backlink\.js/); assert.ok(existsSync(join(pub, 'lendingtree', p, 'index.html'))); }
  assert.match(read('lendingtree/deck/data.js'), /October 2026 strategy/);
});

const ORIGINAL_SHA = '0d00f47de90e1c50543e3c2a032ff1ef7190e5338b3df8d5a0d1dfa5f6b0a99c';
