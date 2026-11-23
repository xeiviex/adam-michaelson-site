import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { meta, questions, slides, milestones } from '../public/achieve/vision-strategy-v1/content.js';
import * as company from '../public/achieve/company-vision-strategy/content.js';

const walk = (blocks, out = []) => { for (const b of blocks || []) { out.push(b); if (b.blocks) walk(b.blocks, out); } return out; };
const all = slides.flatMap((s) => [...walk(s.blocks), ...walk(s.details)]);

test('there are 15 interview questions, with the four SWOT questions after question 2', () => {
  assert.equal(Object.keys(questions).length, 15);
  assert.match(questions[3], /strengths/); assert.match(questions[4], /weaknesses/);
  assert.match(questions[5], /opportunities/); assert.match(questions[6], /threats/);
});

test('the deck skips the company questions (1 to 6) and answers 7 to 15', () => {
  const covered = new Set(slides.flatMap((s) => s.q));
  for (let q = 1; q <= 6; q++) assert.ok(!covered.has(q), `question ${q} should be skipped`);
  for (let q = 7; q <= 15; q++) assert.ok(covered.has(q), `question ${q} has no slide`);
  assert.equal(new Set(slides.map((s) => s.id)).size, slides.length, 'slide ids are unique');
  assert.match(meta.intro, /1 to 6/);
});

test('research comes straight after the DEX strategy, and the plan says research will calibrate it', () => {
  const ids = slides.map((s) => s.id);
  assert.ok(ids.indexOf('research') > ids.indexOf('dex-strategy') && ids.indexOf('research') < ids.indexOf('better-off'));
  const plan = slides.find((s) => s.id === 'milestones');
  assert.match(plan.sub, /hypothesis-based/); assert.match(plan.sub, /contextual research/);
});

test('no source labels are left on the slides', () => {
  assert.ok(!all.some((b) => b.src));
  assert.doesNotMatch(readFileSync(new URL('../public/achieve/vision-strategy-v1/content.js', import.meta.url), 'utf8'), /My proposal|My reading|Achieve published/);
});

test('the original milestone targets are preserved', () => {
  assert.deepEqual(milestones.map((m) => [m.day, m.routed, m.unassisted]),
    [[30, null, null], [60, null, null], [90, 1, null], [180, 10, 10], [270, 50, 25], [365, 100, 50]]);
});

test('the DEX strategy matrix has the four pillars and four rows', () => {
  const mx = all.filter((b) => b.type === 'matrix');
  assert.equal(mx.length, 1);
  assert.deepEqual(mx[0].cols.map((c) => c.name), ['Solution', 'Quality', 'Adoption', 'Economics']);
  for (const c of mx[0].cols) for (const k of ['problem', 'action', 'kpis']) assert.ok(c[k] && c[k].length, `${c.name} is missing ${k}`);
  for (const c of mx[0].cols) assert.ok(c.policy, `${c.name} is missing its policy`);
  assert.equal(mx[0].cols[1].policy, 'The best UI is no UI; delight.');
  assert.equal(mx[0].cols[3].kpis, 'Profit per completion without humans.');
});

test('the page stays out of search results', () => {
  const html = readFileSync(new URL('../public/achieve/vision-strategy-v1/index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});

test('the company deck answers questions 1 to 6 and nothing else', () => {
  const covered = [...new Set(company.slides.flatMap((s) => s.q))].sort((a, b) => a - b);
  assert.deepEqual(covered, [1, 2, 3, 4, 5, 6]);
  const swot = company.slides.find((s) => s.id === 'swot').blocks[0].blocks.map((b) => b.title);
  assert.deepEqual(swot, ['Strengths', 'Weaknesses', 'Opportunities', 'Threats']);
  const html = readFileSync(new URL('../public/achieve/company-vision-strategy/index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});

test('neither deck links to the other, so each can be shown on its own', () => {
  for (const f of ['vision-strategy-v1', 'company-vision-strategy']) {
    const other = f === 'vision-strategy-v1' ? 'company-vision-strategy' : 'vision-strategy-v1';
    const html = readFileSync(new URL(`../public/achieve/${f}/index.html`, import.meta.url), 'utf8');
    assert.ok(!html.includes(`href="/achieve/${other}`));
  }
});
