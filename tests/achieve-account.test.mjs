import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../public/achieve/account.js';

const ctx = { debts: [{ id: 'v', name: 'Visa', balance: 5000 }], deposit: 600, offerMonth: 3, months: 38, bankName: 'Evergreen', last4: '4821' };
const mk = (extra) => Object.assign({ stageDone: ['lead', 'qualify', 'consult', 'enroll', 'deposit', 'build'], applicant: { first: 'Jordan', last: 'Rivera', email: 'j@x.co', phone: '(801) 555-0142' }, e: { signedName: 'Jordan Rivera', consents: ['a', 'b'] }, d: { deposit: { cleared: true, amount: 600, bank: 'Evergreen ••4821' }, outreach: [] }, s: {}, q: {}, acct: {} }, extra);

test('account exists only after enrollment', () => { assert.equal(A.hasAccount({ stageDone: ['lead'] }), false); assert.equal(A.hasAccount(mk()), true); });

test('transactions: monthly deposits to the first offer, balance adds up, never negative after a settlement', () => {
  const st = mk({ s: { offer: { debtId: 'v', amount: 2500, fee: 1000, saved: 1500, status: 'approved' } } });
  const t = A.transactions(st, ctx), bal = A.balance(t);
  assert.ok(t.some((x) => x.kind === 'payment') && t.some((x) => x.kind === 'fee'));
  assert.ok(bal >= 0, 'balance ' + bal);
  assert.equal(bal, t.reduce((s, x) => s + x.amt, 0));
  assert.ok(t.every((x) => x.ts <= Date.now() + 1000), 'no future-dated transactions');
});

test('transfers: validation, pending until cleared, and the balance counts only cleared money', () => {
  const st = mk();
  assert.equal(A.transfer(st, ctx, 'in', 0, 'Bank').ok, false);
  assert.equal(A.transfer(st, ctx, 'out', 99999, 'Bank').ok, false);
  assert.equal(A.transfer(st, ctx, 'in', 1000000, 'Bank').ok, false);
  const before = A.balance(A.transactions(st, ctx)), r = A.transfer(st, ctx, 'in', 250, 'Bank');
  assert.ok(r.ok); const t = A.transactions(st, ctx);
  assert.equal(A.balance(t), before); assert.equal(A.pending(t), 250);
  st.acct.txns[0].ts -= 10000; A.clearPending(st);
  assert.equal(A.balance(A.transactions(st, ctx)), before + 250);
  assert.ok(A.activity(st, ctx).some((e) => /Sent \$250/.test(e.title)), 'a transfer lands in the activity log');
});

test('withdrawals cannot exceed the balance', () => {
  const st = mk(); const bal = A.balance(A.transactions(st, ctx));
  assert.equal(A.transfer(st, ctx, 'out', bal + 1, 'Bank').ok, false);
  assert.equal(A.transfer(st, ctx, 'out', bal, 'Bank').ok, true);
});

test('activity: newest first, both sides present, reports and edits are logged', () => {
  const st = mk(); A.addReport(st, { who: 'v', how: 'legal', text: '', urgent: true }); A.saveProfile(st, { phone: '(801) 555-0199' });
  const a = A.activity(st, ctx);
  assert.ok(a.every((e, i) => !i || a[i - 1].ts >= e.ts));
  assert.ok(a.some((e) => e.who === 'you') && a.some((e) => e.who === 'achieve'));
  assert.ok(a.some((e) => /Reported contact from Visa/.test(e.title)) && a.some((e) => /Updated your phone/.test(e.title)));
});

test('documents: derived from the journey, plus uploads', () => {
  const st = mk({ q: { detail: { job: { docs: ['pay-stub.pdf'] } } } });
  A.addDocument(st, 'letter.pdf', 2048);
  const names = A.documents(st, ctx).map((d) => d.name);
  ['Enrollment agreement (signed)', 'Your plan summary', 'pay-stub.pdf', 'letter.pdf'].forEach((n) => assert.ok(names.includes(n), n));
});

test('profile edits validate and persist', () => {
  assert.equal(A.validField('email', 'nope'), false); assert.equal(A.validField('email', 'a@b.co'), true);
  assert.equal(A.validField('phone', '123'), false); assert.equal(A.validField('phone', '(801) 555-0142'), true);
  assert.equal(A.validField('zip', '8404'), false); assert.equal(A.validField('zip', '84043'), true);
  const st = mk(); assert.deepEqual(A.saveProfile(st, { email: 'new@x.co' }), ['email']); assert.equal(st.applicant.email, 'new@x.co');
  assert.deepEqual(A.saveProfile(st, { email: 'new@x.co' }), []);
});

test('contact reports: newest first with names and method labels', () => {
  const st = mk(); A.addReport(st, { who: 'v', how: 'call', text: 'hi', ts: 1000 }); A.addReport(st, { who: 'other', how: 'letter', text: '', ts: 2000 });
  const r = A.reports(st, ctx); assert.equal(r.length, 2); assert.equal(r[0].howLabel, 'A letter'); assert.equal(r[1].name, 'Visa');
});
