import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sources, sections, milestones } from '../public/achieve/vision-strategy-v1/content.js';

const walk = (blocks, out = []) => { for (const b of blocks) { out.push(b); if (b.blocks) walk(b.blocks, out); } return out; };
const all = sections.flatMap((s) => walk(s.blocks));

test('the presentation answers all 11 stakeholder questions', () => {
  const covered = new Set(sections.flatMap((s) => s.q));
  for (let q = 1; q <= 11; q++) assert.ok(covered.has(q), `question ${q} has no section`);
  for (const s of sections) if (s.q.length && s.id !== 'better-off') assert.ok(s.ask, `${s.id} does not show the question it answers`);
  assert.equal(new Set(sections.map((s) => s.id)).size, sections.length, 'section ids are unique');
});

test('every content block says whose statement it is', () => {
  const needs = new Set(['group', 'matrix', 'table', 'flow', 'timeline', 'asks']);
  for (const b of all) if (needs.has(b.type)) assert.ok(sources[b.src], `${b.type} "${b.title || ''}" has no valid source`);
});

test('published statements carry source links and nothing else claims to be published', () => {
  const pub = all.filter((b) => b.src === 'published');
  assert.equal(pub.length, 1);
  assert.ok(pub[0].links.length >= 4);
  for (const l of pub[0].links) assert.match(l.url, /^https:\/\/www\.achieve\.com\/about/);
});

test('the original milestone targets are preserved', () => {
  assert.deepEqual(milestones.map((m) => [m.day, m.routed, m.unassisted]),
    [[30, null, null], [60, null, null], [90, 1, null], [180, 10, 10], [270, 50, 25], [365, 100, 50]]);
});

test('both strategy matrices have the four pillars and four rows', () => {
  const mx = all.filter((b) => b.type === 'matrix');
  assert.equal(mx.length, 2);
  for (const m of mx) {
    assert.deepEqual(m.cols.map((c) => c.name), ['Solution', 'Quality', 'Adoption', 'Economics']);
    for (const c of m.cols) for (const k of ['problem', 'policy', 'action', 'kpis']) assert.ok(c[k] && c[k].length, `${c.name} is missing ${k}`);
  }
});

test('the page stays out of search results', () => {
  const html = readFileSync(new URL('../public/achieve/vision-strategy-v1/index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});
