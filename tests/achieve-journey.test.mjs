import test from 'node:test';
import assert from 'node:assert/strict';
import * as J from '../public/achieve/journey.js';
import { validateStep } from '../public/achieve/firsttake/shared/flow.js';
import { localAnswer } from '../public/achieve/debt-kb.js';

test('eight stages, first three built', () => {
  assert.equal(J.STAGES.length, 8);
  assert.deepEqual(J.STAGES.filter((s) => s.built).map((s) => s.id), ['lead', 'qualify', 'consult']);
});
test('persona passes every lead step', () => {
  for (const s of J.LEAD_STEPS) assert.deepEqual(validateStep(s, J.PERSONA), {}, s.id);
  assert.ok(J.validPersona(J.PERSONA));
});
test('empty values fail every lead step', () => {
  for (const s of J.LEAD_STEPS.filter((x) => x.id !== 'debt')) assert.ok(Object.keys(validateStep(s, {})).length, s.id);
});
test('progress and next step', () => {
  assert.equal(J.nextStep([]).id, 'debt');
  assert.equal(J.nextStep(J.LEAD_STEPS.map((s) => s.id)), null);
  assert.equal(J.pathPct([], []), 0);
  assert.equal(J.pathPct(['lead'], J.LEAD_STEPS.map((s) => s.id)), 13);
  assert.ok(J.pathPct([], ['debt', 'name']) > 0);
});
test('offline answers are honest about credit and fees', () => {
  assert.match(localAnswer('Will this hurt my credit?'), /drop/);
  assert.match(localAnswer('what does it cost'), /no fee until/i);
  assert.equal(localAnswer('zzz'), null);
});

import * as Q from '../public/achieve/qualify.js';
const base = { debt: 32000 };
const q0 = () => JSON.parse(JSON.stringify(Q.PERSONA_Q));
test('persona qualifies as a fit with a documented hardship', () => {
  const r = Q.qualify(base, q0());
  assert.equal(r.outcome, 'fit');
  assert.equal(r.strength.level, 'documented');
  assert.equal(r.est.months, 38);
});
test('small debt is not yet; large debt goes to review, never declined for size', () => {
  assert.equal(Q.qualify({ debt: 5000 }, q0()).outcome, 'notyet');
  const big = Q.qualify({ debt: 250000 }, q0());
  assert.equal(big.outcome, 'review');
  assert.ok(big.reasons.some((x) => /senior specialist/.test(x)));
});
test('no hardship goes to review; tiny deposit is not yet; summons flags urgent', () => {
  const a = q0(); a.hardships = [];
  assert.equal(Q.qualify(base, a).outcome, 'review');
  const b = q0(); b.budget.deposit = 100;
  assert.equal(Q.qualify(base, b).outcome, 'notyet');
  const c = q0(); c.status = 'sued';
  const r = Q.qualify(base, c);
  assert.ok(r.urgent && r.flags.length);
});
test('hardship detail steps follow the selection, capped at two', () => {
  assert.deepEqual(Q.qSteps({ hardships: ['job', 'medical', 'costs'] }), ['dtypes', 'status', 'hardship', 'detail:job', 'detail:medical', 'budget', 'result']);
  assert.equal(Q.nextQStep(['dtypes', 'status', 'hardship'], { hardships: ['job'] }), 'detail:job');
});
test('every hardship has questions and at least one document prompt', () => {
  for (const h of Q.HARDSHIPS) { assert.ok(h.qs.length && h.docs.length, h.id); }
});
test('hardship strength reflects answers and documents', () => {
  const q = { hardships: ['job'], detail: { job: { when: 'x' } } };
  assert.equal(Q.hardshipStrength(q).level, 'partial');
  q.detail.job = { when: 'x', impact: 'y', now: 'z' };
  assert.equal(Q.hardshipStrength(q).level, 'described');
  q.detail.job.docs = ['a.pdf'];
  assert.equal(Q.hardshipStrength(q).level, 'documented');
});

import * as C from '../public/achieve/consult.js';
test('sample tradelines add up to the sample debt', () => {
  assert.equal(C.TRADELINES.reduce((t, x) => t + x.balance, 0), J.PERSONA.debt);
});
test('plan matches the qualification estimate and orders collections first', () => {
  const p = C.plan(C.TRADELINES, 600);
  assert.equal(p.months, 38);
  assert.equal(p.total, 22400);
  assert.equal(p.order[0].status, 'collections');
  assert.equal(p.firstOffer, 3);
});
test('a bigger deposit shortens the plan, never below the minimum months', () => {
  assert.ok(C.plan(C.TRADELINES, 1200).months < C.plan(C.TRADELINES, 600).months);
  assert.equal(C.plan(C.TRADELINES, 3000).months, 12);
});
test('expectations cover credit, calls, lawsuits, taxes and fees honestly', () => {
  const ids = C.expectations(38).map((x) => x.id);
  for (const k of ['time', 'credit', 'calls', 'suit', 'tax', 'fees', 'us']) assert.ok(ids.includes(k), k);
  assert.match(C.expectations(38)[1].b, /lowers your score/);
  assert.match(C.expectations(38)[0].b, /38 months/);
});
test('listening replies are warm and the default never dead-ends', () => {
  assert.match(C.listenReply('my wife is worried'), /family/);
  assert.ok(C.listenReply('zzz').length > 10);
});
test('consult steps run in order', () => {
  assert.equal(C.nextCStep([]), 'debts');
  assert.equal(C.nextCStep(['debts', 'goals', 'talk', 'expect']), 'plan');
  assert.equal(C.nextCStep(C.C_STEPS), null);
});
