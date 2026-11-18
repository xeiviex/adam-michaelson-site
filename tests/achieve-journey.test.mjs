import test from 'node:test';
import assert from 'node:assert/strict';
import * as J from '../public/achieve/journey.js';
import { validateStep } from '../public/achieve/firsttake/shared/flow.js';
import { localAnswer } from '../public/achieve/debt-kb.js';

test('eight stages, only the first built', () => {
  assert.equal(J.STAGES.length, 8);
  assert.deepEqual(J.STAGES.filter((s) => s.built).map((s) => s.id), ['lead']);
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
