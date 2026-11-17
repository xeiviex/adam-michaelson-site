import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { SLIDES, DAYS, LEGACY, LEGACY_ARCHIVE_IDS, MEASURES, BARS, rollup } from '../public/lendingtree/deck/data.js';

const pub = new URL('../public/', import.meta.url).pathname;
const read = (p) => readFileSync(join(pub, p), 'utf8');
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, a + ' vs ' + b);

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
  for (const s of strategies) { assert.ok(s.econ && s.measure, s.id); assert.ok(s.metrics.length >= 3, s.id); }
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

test('leadership asks, three charters, team plan, offer-first lifecycle stages are present', () => {
  const ov = JSON.stringify(SLIDES[0].details);
  for (const t of ['Executive introductions', 'reallocate roadmap capacity', 'CTO', 'hiring or contractors', 'performance measures and a review cadence', 'Executive phase gate']) assert.match(ov, new RegExp(t));
  assert.match(JSON.stringify(SLIDES[5].details), /Pod A[\s\S]*Pod B[\s\S]*Pod C/);
  const all = read('lendingtree/deck/app.js') + JSON.stringify(SLIDES);
  for (const t of ['Lending Down-Funnel', 'Insurance Down-Funnel', 'MCP/API', 'Embedded', 'Generate offers', 'Generate quotes', 'Present and compare', 'Select', 'Underwriting or approval', 'Funding', 'Servicing or refinance', 'Bind', 'Renewal and re-shop', 'Set expectations', 'Assess the team', 'Hiring pipeline', 'How we calculate ROI', 'Financial products platform']) assert.ok(all.includes(t), t);
});

test('every plan bar has a short one-line label, and the calculator is gone', () => {
  for (const s of SLIDES) {
    assert.equal(BARS[s.id].length, 4, s.id);
    BARS[s.id].slice(0, 3).forEach((t) => assert.ok(t.length <= 20, s.id + ': "' + t + '" is too long for a one-sixth bar'));
    assert.ok(BARS[s.id][3].length <= 50, s.id);
  }
  assert.ok(!existsSync(join(pub, 'lendingtree/deck/roi.js')) && !existsSync(join(pub, 'lendingtree/deck/roi-ui.js')));
  assert.doesNotMatch(read('lendingtree/deck/app.js') + read('lendingtree/deck/data.js'), /calculator/i);
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
  for (const f of ['app.js', 'data.js', 'embed.js', 'deck.css']) assert.ok(existsSync(join(pub, 'lendingtree/deck', f)), f);
});

test('prototypes keep working and link back to the right strategy page', () => {
  const bl = read('lendingtree/backlink.js');
  assert.match(bl, /\/lendingtree1\//);
  for (const p of ['choice', 'companion', 'outcomes']) { assert.match(read('lendingtree/' + p + '/index.html'), /backlink\.js/); assert.ok(existsSync(join(pub, 'lendingtree', p, 'index.html'))); }
  assert.match(read('lendingtree/deck/data.js'), /October 2026 strategy/);
});

const ORIGINAL_SHA = '0d00f47de90e1c50543e3c2a032ff1ef7190e5338b3df8d5a0d1dfa5f6b0a99c';
