/* Achieve debt relief prototype: the account area ("My account"). Pure data and rules, no DOM, so it can be unit tested.
   Everything shown is derived from the journey state plus a few things the client records here (transfers, uploads, reports,
   profile edits), kept in state.acct. All names, dates and amounts are samples. */
import { money } from './firsttake/shared/flow.js';

export const SECTIONS = [
  { id: 'overview', label: 'Overview', ic: 'home' },
  { id: 'bank', label: 'Bank and transfers', ic: 'card' },
  { id: 'documents', label: 'Documents', ic: 'file' },
  { id: 'keepsakes', label: 'Keepsakes', ic: 'star' },
  { id: 'profile', label: 'Profile', ic: 'edit' },
  { id: 'contacts', label: 'Contact reports', ic: 'phone' },
  { id: 'activity', label: 'Activity', ic: 'list' },
];
export const sectionById = (id) => SECTIONS.find((s) => s.id === id) || SECTIONS[0];

const MIN = 60000, DAY = 86400000;
export const hasAccount = (state) => (state.stageDone || []).includes('enroll');
export const acct = (state) => { if (!state.acct) state.acct = {}; const a = state.acct; a.txns = a.txns || []; a.docs = a.docs || []; a.log = a.log || []; if (!a.startedAt) a.startedAt = Date.now() - 45 * MIN; return a; };
const at = (state, k) => acct(state).startedAt + k * 2 * MIN;
export const uid = (p) => p + Math.random().toString(36).slice(2, 8);

/* Everything the client or Achieve did. ctx: { debts, deposit, offerMonth, bankName, last4 } */
export function recordEvent(state, who, title, detail) { acct(state).log.push({ id: uid('e'), ts: Date.now(), who, title, detail: detail || '' }); }

export function activity(state, ctx) {
  const n = (state.applicant && state.applicant.first) || 'you', done = (id) => (state.stageDone || []).includes(id), ev = [];
  const push = (k, who, title, detail) => ev.push({ id: 'm' + ev.length, ts: at(state, k), who, title, detail: detail || '' });
  if (done('lead')) push(1, 'you', 'Told us about your debt', ctx.debts && ctx.debts.length ? ctx.debts.length + ' accounts, ' + money(ctx.debts.reduce((s, d) => s + d.balance, 0)) + ' in unsecured debt' : '');
  if (done('qualify')) { push(2, 'you', 'Answered the qualifying questions', 'What changed, where payments stand, and your budget'); push(3, 'achieve', 'Confirmed you qualify', 'No account is declined for size, and your balance is in range'); }
  if (done('consult')) { push(4, 'you', 'Went through your plan with a specialist', 'Confirmed your debts and read what to expect'); push(5, 'achieve', 'Built your plan', ctx.deposit ? money(ctx.deposit) + ' a month' : ''); }
  if (done('enroll')) { push(6, 'you', 'Signed your enrollment agreement', 'Four consents and an electronic signature'); push(7, 'you', 'Linked ' + ctx.bankName + ' ••' + ctx.last4, ''); push(8, 'achieve', 'Opened your dedicated account', 'Account ••3318, FDIC-insured, in your name'); }
  const dep = state.d && state.d.deposit;
  if (dep && dep.cleared) { push(9, 'you', 'Sent your first deposit of ' + money(dep.amount), 'From ' + dep.bank); push(10, 'achieve', 'First deposit cleared', 'The money is in your dedicated account'); }
  if (done('build')) push(11, 'achieve', 'Started building your fund', 'Deposits are set aside for settlements. Fees come after a settlement is paid');
  const off = state.s && state.s.offer;
  if (off && off.status === 'approved') { push(12, 'achieve', 'Negotiated an offer', 'Settle for ' + money(off.amount) + ', a saving of ' + money(off.saved)); push(13, 'you', 'Approved the offer', 'Nothing is paid without your yes'); push(14, 'achieve', 'Paid the creditor from your account', money(off.amount)); push(15, 'achieve', 'Charged the fee after payment', money(off.fee)); }
  if (done('negotiate')) push(16, 'achieve', 'Finished settling your accounts', '');
  if (done('free')) push(17, 'you', 'Became debt free', 'Congratulations, ' + n);
  ((state.d && state.d.outreach) || []).forEach((o, i) => ev.push({ id: 'o' + i, ts: o.ts || at(state, 9.5 + i / 10), who: 'you', title: 'Reported contact from ' + (nameOf(ctx.debts, o.who)), detail: how(o.how) + (o.urgent ? ' · urgent' : '') }));
  acct(state).log.forEach((e) => ev.push(e));
  return ev.sort((a, b) => b.ts - a.ts);
}
export const how = (id) => ({ call: 'A phone call', voicemail: 'A voicemail', text: 'A text', email: 'An email', letter: 'A letter', legal: 'Legal papers or a summons' }[id] || id);
export const nameOf = (debts, id) => ((debts || []).find((d) => d.id === id) || { name: 'someone else' }).name;

/* The dedicated account. Deposits clear monthly up to the first offer; the settlement and its fee come out after that. */
export function transactions(state, ctx) {
  const a = acct(state), list = [], dep = state.d && state.d.deposit;
  if (dep && dep.cleared) {
    const off0 = state.s && state.s.offer, need = off0 && off0.status === 'approved' && dep.amount ? Math.ceil((off0.amount + off0.fee) / dep.amount) : 0;
    const months = Math.max(1, (state.stageDone || []).includes('build') ? ctx.offerMonth || 1 : 1, need);
    const T = months > 1 ? Date.now() - 2 * DAY : at(state, 10);
    for (let m = 0; m < months; m++) list.push({ id: 'dep' + m, ts: T - (months - 1 - m) * 30 * DAY, desc: m === 0 ? 'First deposit from ' + dep.bank : 'Monthly deposit from ' + dep.bank, amt: dep.amount, status: 'Cleared', kind: 'deposit' });
    const off = state.s && state.s.offer;
    if (off && off.status === 'approved') {
      list.push({ id: 'pay', ts: T + DAY / 2, desc: 'Settlement payment to ' + nameOf(ctx.debts, off.debtId), amt: -off.amount, status: 'Cleared', kind: 'payment' });
      list.push({ id: 'fee', ts: T + DAY, desc: 'Achieve fee, charged after payment', amt: -off.fee, status: 'Cleared', kind: 'fee' });
    }
  }
  a.txns.forEach((t) => list.push(t));
  return list.sort((x, y) => y.ts - x.ts);
}
export const balance = (txns) => txns.filter((t) => t.status === 'Cleared').reduce((s, t) => s + t.amt, 0);
export const pending = (txns) => txns.filter((t) => t.status !== 'Cleared').reduce((s, t) => s + t.amt, 0);

/* Transfers the client can make. Returns { ok, error, txn }. */
export function transfer(state, ctx, kind, amount, bankLabel) {
  const amt = Math.round(Number(amount) || 0);
  if (amt < 1) return { ok: false, error: 'Enter an amount.' };
  const bal = balance(transactions(state, ctx));
  if (kind === 'out' && amt > bal) return { ok: false, error: 'That is more than your balance of ' + money(bal) + '.' };
  if (kind === 'in' && amt > 100000) return { ok: false, error: 'Transfers over $100,000 need to be set up with your specialist.' };
  const txn = { id: uid('t'), ts: Date.now(), desc: kind === 'in' ? 'Deposit from ' + bankLabel : 'Withdrawal to ' + bankLabel, amt: kind === 'in' ? amt : -amt, status: 'Pending', kind: kind === 'in' ? 'deposit' : 'withdrawal' };
  acct(state).txns.push(txn);
  recordEvent(state, 'you', kind === 'in' ? 'Sent ' + money(amt) + ' to your account' : 'Requested a withdrawal of ' + money(amt), 'From ' + bankLabel);
  return { ok: true, txn };
}
export const clearPending = (state) => { acct(state).txns.forEach((t) => { if (t.status === 'Pending' && Date.now() - t.ts > 4000) t.status = 'Cleared'; }); };
export const withdrawNote = 'Money you take out is money that is no longer building toward settlements, so your plan can take longer.';

/* Documents. Derived from the journey, plus anything uploaded here. */
export function documents(state, ctx) {
  const done = (id) => (state.stageDone || []).includes(id), docs = [], a = acct(state), n = (state.applicant && state.applicant.first) || 'Client';
  const add = (id, name, by, k, text) => docs.push({ id, name, by, ts: at(state, k), text });
  if (done('consult')) add('plan', 'Your plan summary', 'Achieve', 5, 'Plan summary for ' + n + '\nMonthly deposit: ' + money(ctx.deposit) + '\nEstimated months: ' + (ctx.months || '') + '\nThese figures are estimates. Creditors decide the real timing.');
  if (done('enroll')) {
    add('agreement', 'Enrollment agreement (signed)', 'You and Achieve', 6, 'Enrollment agreement\nSigned electronically by ' + ((state.e && state.e.signedName) || n) + '\nFee: 20% of the enrolled balance of a debt, charged only after a payment to that creditor.');
    add('ach', 'Bank draft authorization', 'You', 7, 'Authorization to draft ' + money(ctx.deposit) + ' a month from ' + ctx.bankName + ' ••' + ctx.last4 + '.');
  }
  const detail = (state.q && state.q.detail) || {};
  Object.keys(detail).forEach((k) => ((detail[k] && detail[k].docs) || []).forEach((nm, i) => add('up-' + k + i, nm, 'You uploaded', 2, 'Uploaded during your qualifying questions.')));
  ((state.d && state.d.outreach) || []).forEach((o, i) => { if (o.shot) docs.push({ id: 'shot' + i, name: 'Screenshot: contact from ' + nameOf(ctx.debts, o.who), by: 'You uploaded', ts: o.ts || at(state, 9.5 + i / 10), text: 'Screenshot attached to a contact report.' }); });
  const off = state.s && state.s.offer;
  if (off && off.status === 'approved') add('settle', 'Settlement agreement: ' + nameOf(ctx.debts, off.debtId), 'Creditor and Achieve', 13, 'Settlement of ' + money(off.amount) + '. Paid from your dedicated account.');
  a.docs.forEach((d) => docs.push({ id: d.id, name: d.name, by: 'You uploaded', ts: d.ts, text: 'File: ' + d.name + (d.size ? ' (' + Math.round(d.size / 1024) + ' KB)' : '') }));
  return docs.sort((x, y) => y.ts - x.ts);
}
export function addDocument(state, name, size) { const d = { id: uid('u'), name: String(name || 'Document').slice(0, 80), size: size || 0, ts: Date.now() }; acct(state).docs.push(d); recordEvent(state, 'you', 'Uploaded a document', d.name); return d; }

/* Profile: what the client has told us. Contact fields can be edited. */
export const EDITABLE = [{ id: 'email', label: 'Email', type: 'email' }, { id: 'phone', label: 'Phone', type: 'tel' }, { id: 'zip', label: 'ZIP code', type: 'text' }];
export function profile(state, ctx) {
  const ap = state.applicant || {}, q = state.q || {}, hs = (q.hardships || []).length;
  return {
    contact: [['Name', [ap.first, ap.last].filter(Boolean).join(' ') || 'Not given'], ['Email', ap.email || 'Not given'], ['Phone', ap.phone || 'Not given'], ['State and ZIP', [ap.state, ap.zip].filter(Boolean).join(' ') || 'Not given']],
    money: [['Unsecured debt', ctx.debts && ctx.debts.length ? money(ctx.debts.reduce((s, d) => s + d.balance, 0)) + ' across ' + ctx.debts.length + ' accounts' : 'Not given'], ['Monthly deposit', ctx.deposit ? money(ctx.deposit) : 'Not set'], ['Linked bank', ctx.bankName + ' ••' + ctx.last4], ['What changed', hs ? hs + ' reason' + (hs > 1 ? 's' : '') + ' you shared' : 'Not shared']],
    debts: (ctx.debts || []).map((d) => [d.name, money(d.balance)]),
    consents: (state.e && state.e.consents && state.e.consents.length) ? state.e.consents.length + ' consents signed' : 'Not signed yet',
  };
}
export const MIN_DEPOSIT = 250, MIN_DEBT = 100;
export function addDebt(state, name, balance) { const c = state.c = state.c || {}; c.custom = c.custom || []; c.debts = c.debts || []; const t = { id: 'c' + (c.custom.length + 1), name: String(name).trim().slice(0, 60), kind: 'Added by you', balance: Math.round(Number(balance)), status: 'current', note: 'Added by you' }; c.custom.push(t); c.debts.push(t.id); recordEvent(state, 'you', 'Reported another debt: ' + t.name, money(t.balance) + ' · your specialist will review it'); return t; }
export function setDeposit(state, amount) { const c = state.c = state.c || {}; const v = Math.round(Number(amount)); const old = c.deposit; c.deposit = v; recordEvent(state, 'you', 'Changed your monthly deposit to ' + money(v), 'Takes effect with your next draft'); return old; }
export const validDeposit = (v) => Number(v) >= MIN_DEPOSIT && Number(v) <= 20000;
export const validDebt = (name, bal) => String(name).trim().length >= 2 && Number(bal) >= MIN_DEBT && Number(bal) <= 500000;
export function saveProfile(state, patch) { const ap = state.applicant = state.applicant || {}; const ch = []; Object.keys(patch).forEach((k) => { if (patch[k] !== ap[k]) { ch.push(k); ap[k] = patch[k]; } }); if (ch.length) recordEvent(state, 'you', 'Updated your ' + ch.map((k) => (EDITABLE.find((x) => x.id === k) || { label: k }).label.toLowerCase()).join(' and '), ''); return ch; }
export const validField = (id, v) => (id === 'email' ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) : id === 'phone' ? String(v).replace(/\D/g, '').length === 10 : id === 'zip' ? /^\d{5}$/.test(v) : true);

/* Contact reports. */
export const URGENT_TEXT = 'Legal papers matter. Call your specialist right away at (833) 435-2021 and do not ignore them.';
export function reports(state, ctx) { return ((state.d && state.d.outreach) || []).map((o, i) => Object.assign({ i, name: nameOf(ctx.debts, o.who), howLabel: how(o.how), ts: o.ts || at(state, 9.5 + i / 10) }, o)).sort((a, b) => b.ts - a.ts); }
export function addReport(state, e) { state.d = state.d || {}; (state.d.outreach = state.d.outreach || []).push(Object.assign({ ts: Date.now() }, e)); }

export const when = (ts, now) => {
  const d = new Date(ts), t = new Date(now || Date.now()), same = d.toDateString() === t.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return same ? 'Today, ' + time : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + time;
};
export const day = (ts, now) => { const d = new Date(ts), t = new Date(now || Date.now()); return d.toDateString() === t.toDateString() ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };

/* ---- keepsakes: the fun things made along the way, each available once its moment has happened ---- */
export const keepsakes = (state) => {
  const first = (state.applicant && state.applicant.first) || 'Jordan', slug = ((state.applicant && ((state.applicant.first || '') + '_' + (state.applicant.last || ''))) || 'Jordan').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const sd = state.stageDone || [];
  return [
    { id: 'song', title: first + ' Broke Free', blurb: 'Your anthem, from the day your first deposit cleared.', on: (state.ddone || []).includes('celebrate'), lock: 'Unlocks when your first deposit clears.', kind: 'audio', src: '/achieve/jordan-broke-free.mp3', file: slug + '_Broke_Free.mp3', label: 'Download song' },
    { id: 'portrait', title: 'The Summit', blurb: 'Your portrait, in four looks.', on: sd.includes('build'), lock: 'Unlocks when your fund is growing.', kind: 'images', files: [['Sunrise', '/achieve/img/summit-sunrise.jpg'], ['Moonlight', '/achieve/img/summit-moon.jpg'], ['Neon dusk', '/achieve/img/summit-neon.jpg'], ['Black and white', '/achieve/img/summit-bw.jpg']], slug },
    { id: 'movie', title: first + ' Broke Free: the movie', blurb: 'The short film we made about you.', on: (state.fdone || []).includes('movie') || sd.includes('free'), lock: 'Unlocks on graduation day.', kind: 'video', src: '/achieve/jordan-movie.mp4', poster: '/achieve/jordan-movie-poster.jpg', file: slug + '_Broke_Free.mp4', label: 'Download movie' },
  ];
};
