import test from 'node:test';
import assert from 'node:assert/strict';
import * as J from '../public/achieve/journey.js';
import { validateStep } from '../public/achieve/firsttake/shared/flow.js';
import { localAnswer } from '../public/achieve/debt-kb.js';

test('eight stages, all eight built', () => {
  assert.equal(J.STAGES.length, 8);
  assert.deepEqual(J.STAGES.filter((s) => s.built).map((s) => s.id), ['lead', 'qualify', 'consult', 'enroll', 'deposit', 'build', 'negotiate', 'free']);
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

import * as E from '../public/achieve/enroll.js';
test('agreement sections come from the plan and keep the honest terms', () => {
  const p = Object.assign(C.plan(C.TRADELINES, 600), { debt: 32000 });
  const s = E.agreement(p);
  assert.equal(s.length, 10);
  assert.match(s.find((x) => x.id === 'deposit').plain, /\$600 a month/);
  assert.match(s.find((x) => x.id === 'fee').d, /only after|no fee until/i);
  assert.match(s.find((x) => x.id === 'cancel').d, /7 business days/);
  assert.match(s.find((x) => x.id === 'expect').plain, /credit score will drop/);
});
test('draft amounts add up to the monthly deposit over a year', () => {
  assert.equal(E.perDraft(600, 'monthly'), 600);
  assert.equal(E.perDraft(600, 'twice'), 300);
  assert.equal(E.perDraft(600, 'biweekly'), 277);
});
test('first draft is at least five days out and lands on the chosen day', () => {
  const from = new Date(2026, 10, 17);
  const d = E.firstDraft(from, 15, 5);
  assert.equal(d.getDate(), 15); assert.equal(d.getMonth(), 11);
  assert.equal(E.firstDraft(new Date(2026, 10, 12), 15, 5).getMonth(), 11);
});
test('enroll steps run in order and the persona signature matches the sample name', () => {
  assert.equal(E.nextEStep([]), 'review');
  assert.equal(E.nextEStep(['review', 'consent', 'sign', 'account']), 'draft');
  assert.equal(E.PERSONA_E.sign, J.PERSONA.first + ' ' + J.PERSONA.last);
  assert.equal(E.CONSENTS.length, 4);
});

import * as D from '../public/achieve/deposit.js';
test('balance and transactions only show once the deposit has cleared', () => {
  const dep = { cleared: false, amount: 600, date: 'Today', bank: 'X' };
  assert.equal(D.balance(dep), 0); assert.equal(D.txns(dep).length, 0);
  dep.cleared = true;
  assert.equal(D.balance(dep), 600); assert.equal(D.txns(dep)[0].status, 'Cleared');
});
test('the transfer has three steps and ends cleared', () => {
  assert.deepEqual(D.ACH.map((s) => s.id), ['init', 'proc', 'clear']);
});
test('song is personalized and ends the chorus on the name', () => {
  const s = D.song({ first: 'Jordan', goal: 'nobk' });
  assert.match(s.title, /Jordan/); assert.ok(s.lines.some((l) => /Jordan/.test(l)));
  assert.match(s.note, /Prototype/);
});
test('outreach replies are calm, and legal papers are urgent', () => {
  assert.equal(D.outreachReply({ how: 'call' }).urgent, false);
  assert.match(D.outreachReply({ how: 'text' }).text, /normal/);
  assert.equal(D.outreachReply({ how: 'legal' }).urgent, true);
  assert.equal(D.outreachReply({ how: 'email', text: 'They said I was being sued' }).urgent, true);
  assert.match(D.outreachReply({ how: 'legal' }).text, /today/);
});
test('deposit steps run in order; persona logs a creditor from the sample debts', () => {
  assert.equal(D.nextDStep([]), 'login');
  assert.equal(D.nextDStep(['login', 'deposit', 'celebrate']), 'outreach');
  assert.ok(C.TRADELINES.some((t) => t.id === D.PERSONA_D.outreach.who));
});

import * as B from '../public/achieve/fund.js';
const bm = () => B.model(C.TRADELINES, 600);
test('fund model matches the plan and stops at the target', () => {
  const m = bm();
  assert.equal(m.target, 22400); assert.equal(m.months, 38); assert.equal(m.offerMonth, 3);
  assert.equal(B.at(m, 1).fund, 600);
  assert.equal(B.at(m, 38).fund, 22400); assert.equal(B.at(m, 99).month, 38);
  assert.ok(B.at(m, 38).done && !B.at(m, 37).done);
});
test('thermometer messages follow the journey', () => {
  const m = bm();
  assert.match(B.message(m, 1, 'Jordan'), /first deposit is in/);
  assert.equal(B.message(m, 3, 'Jordan'), 'Your fund is ready. Negotiators can start asking creditors for offers.');
  assert.match(B.message(m, 10, 'Jordan'), /25% there/);
  assert.match(B.message(m, 19, 'Jordan'), /Halfway/);
  assert.match(B.message(m, 28, 'Jordan'), /75% there/);
  assert.match(B.message(m, 37, 'Jordan'), /one month away/);
  assert.match(B.message(m, 38, 'Jordan'), /You did it/);
});
test('milestones are ordered and flip to done as months pass', () => {
  const m = bm();
  const a = B.milestones(m, 1), z = B.milestones(m, 38);
  assert.ok(a.filter((x) => x.done).length < z.filter((x) => x.done).length);
  assert.ok(z.every((x) => x.done));
  assert.deepEqual(a.map((x) => x.m), a.map((x) => x.m).slice().sort((p, q) => p - q));
});
test('an extra deposit shortens the program but never below twelve months', () => {
  const m = bm();
  assert.equal(B.withExtra(m, 0).saved, 0);
  assert.ok(B.withExtra(m, 1000).saved >= 1);
  assert.equal(B.withExtra(m, 999999).months, 12);
});
test('feed covers text, email and app and personalizes', () => {
  const f = B.feed(bm(), 'Jordan', '$600');
  for (const c of ['text', 'email', 'app']) assert.ok(f.some((x) => x.ch === c), c);
  assert.ok(f.every((x) => /Jordan|achieve|Achieve|specialist|path|fund|finish|halfway|Halfway|25%|one month/i.test(x.title + x.body)));
});

/* ---- stage 7: settle ---- */
import * as S7 from '../public/achieve/settle.js';
const D7 = { id: 'd4', name: 'Regional Medical Group', kind: 'Medical bill', balance: 4500, status: 'late' };
test('settle: first offer numbers', () => {
  const o = S7.offerFor(D7);
  assert.equal(o.amount, 1800); assert.equal(o.fee, 900); assert.equal(o.saved, 1800);
});
test('settle: counter offer is lower and saves more', () => {
  const o = S7.offerFor(D7), c = S7.counterOffer(D7, o);
  assert.equal(c.amount, 1575); assert.equal(c.saved, 2025);
});
test('settle: fee is last after approval', () => {
  const steps = S7.afterApprove(S7.offerFor(D7));
  assert.match(steps[steps.length - 1].t, /fee/i);
  assert.match(steps[steps.length - 2].t, /pay/i);
});
test('settle: step order', () => {
  assert.equal(S7.nextSStep([]), 'advocate');
  assert.equal(S7.nextSStep(['advocate', 'activity', 'offer']), 'board');
  assert.equal(S7.nextSStep(S7.S_STEPS), null);
});

/* ---- stage 8: debt free ---- */
import * as F8 from '../public/achieve/free.js';
test('free: step order and labels', () => {
  assert.equal(F8.nextFStep([]), 'graduate');
  assert.equal(F8.nextFStep(['graduate', 'rave', 'box']), 'next');
  assert.equal(F8.nextFStep(F8.F_STEPS), null);
  F8.F_STEPS.forEach((s) => assert.ok(F8.fStepLabel(s)));
});
test('free: recap totals', () => {
  const r = F8.recap({ selected: [{ balance: 20000 }, { balance: 12000 }], deposit: 600, months: 38 });
  assert.equal(r.owed, 32000); assert.equal(r.total, 22800); assert.equal(r.debts, 2);
});
test('free: address validation', () => {
  assert.equal(F8.addressOk(F8.PERSONA_ADDR), true);
  assert.equal(F8.addressOk({ line1: '1 Main', city: 'X', state: 'Utah', zip: '84601' }), false);
  assert.equal(F8.addressOk({ line1: '123 Main', city: 'X', state: 'UT', zip: '846' }), false);
});
test('free: next steps are hedged, no guarantees', () => {
  F8.NEXT.forEach((x) => assert.doesNotMatch(x.step + x.d, /guaranteed|will raise your score/i));
});

/* ---- auto-play speed ---- */
import * as SP from '../public/achieve/speed.js';
test('speed: defaults to fast, slow is slower, unknown values fall back', () => {
  assert.equal(SP.getSpeed(), 'fast');
  assert.equal(SP.pace(1000), 1000);
  assert.ok(SP.SPEEDS.slow.k > SP.SPEEDS.fast.k);
});
