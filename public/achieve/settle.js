/* Achieve debt relief prototype, stage 7: settle. Pure data and rules, no DOM.
   Negotiators work one debt at a time. Every call, text and email is visible to the client, and nothing is paid
   without their yes. Names, creditors and percentages are fictional, illustrative samples. */
import { money } from './firsttake/shared/flow.js';
import { RULES } from './qualify.js';
import { plan } from './consult.js';

export const S_STEPS = ['advocate', 'activity', 'offer', 'board'];
export const nextSStep = (sdone) => S_STEPS.find((s) => !sdone.includes(s)) || null;
export const sStepLabel = (id) => ({ advocate: 'Meet your negotiator', activity: 'See everything', offer: 'Your first offer', board: 'Where you stand' }[id]);

export const NEGOTIATOR = { name: 'Priya Nair', first: 'Priya', title: 'Your negotiator', years: 'Has settled thousands of accounts' };
export const HOW = [
  { t: 'One debt at a time', d: 'We start with the debt your fund can cover and work down the list.' },
  { t: 'You see everything', d: 'Every call is recorded. Every text and email is in your account.' },
  { t: 'You say yes or no', d: 'No settlement is paid without your approval. You can always say no.' },
];

/* What a creditor settles for, by kind of debt. Illustrative. */
export const SETTLE_PCT = { 'Medical bill': 0.4, 'Credit card': 0.5, 'Personal loan': 0.55, 'Added by you': 0.5 };
export const counterStep = 0.05;
export function offerFor(debt, pct) {
  const p = pct == null ? (SETTLE_PCT[debt.kind] || 0.5) : pct;
  const amount = Math.round((debt.balance * p) / 5) * 5;
  const fee = Math.round(debt.balance * RULES.feePct);
  return { debt, pct: p, amount, fee, total: amount + fee, saved: debt.balance - amount - fee, pctLabel: Math.round(p * 100) + '%' };
}
export const counterOffer = (debt, o) => offerFor(debt, o.pct - counterStep);

/* The first debt we work on: the one the plan puts first. */
export function firstDebt(selected, deposit) { return plan(selected, deposit).order[0]; }

/* Fund check: can the account cover the offer today? Month 3 is when the plan says offers can begin. */
export const fundAt = (deposit, month) => deposit * month;

/* The activity the client can see. Built from their debts and name. */
export function activity(first, debt, rep) {
  const n = first || 'there', d = debt || { name: 'your creditor', balance: 0 };
  const o = offerFor(d), c = counterOffer(d, o);
  return [
    { id: 'a1', kind: 'call', when: 'Today, 10:42 am', who: 'Call with ' + d.name, dur: '6:42', summary: 'Priya asked for a lower settlement. The creditor offered ' + o.pctLabel + ', ' + money(o.amount) + '.',
      transcript: [
        ['Priya', 'Hi, this is Priya Nair with Achieve, calling for ' + n + ' about the ' + d.name + ' account. This call is recorded.'],
        [rep, 'Understood. What can I do for you?'],
        ['Priya', n + ' has had a hardship and wants to resolve the full ' + money(d.balance) + ' with one lump-sum payment. We can fund it this week.'],
        [rep, 'I could do sixty percent.'],
        ['Priya', 'That is higher than ' + n + ' can do. Could you ask your supervisor about forty?'],
        [rep, 'I can do forty percent, ' + money(o.amount) + ', if it is paid within ten days.'],
        ['Priya', 'Thank you. ' + n + ' approves every settlement, so I will take it to them. Please send it in writing.'],
      ] },
    { id: 'a2', kind: 'text', when: 'Today, 11:05 am', who: 'Text from Priya', summary: 'Hi ' + n + ', it is Priya. I have a first offer on your ' + d.name + ' account. Open the app when you can. No rush, and nothing is paid unless you say yes.' },
    { id: 'a3', kind: 'email', when: 'Today, 11:10 am', who: 'Email from your negotiator', summary: 'Your first offer is ready: ' + money(o.amount) + ' to settle ' + money(d.balance) + '. After the fee you would keep about ' + money(o.saved) + '. If you would like me to ask for more, I can try for about ' + money(c.amount) + '.' },
    { id: 'a4', kind: 'letter', when: 'Yesterday', who: 'Letter from Summit Bank', summary: 'A routine past-due notice. No action needed. Priya will start talking to Summit Bank when the account is far enough behind that they will settle. Nothing to do on your side.' },
  ];
}
export const KINDS = [{ id: 'all', label: 'All' }, { id: 'call', label: 'Calls' }, { id: 'text', label: 'Texts' }, { id: 'email', label: 'Emails' }, { id: 'letter', label: 'Letters' }];
export const REP = 'Daniel (creditor)';

/* After approval: what happens, in order. The fee comes last, only after the payment is made. */
export function afterApprove(o) {
  return [
    { t: 'You approve', d: 'Done. We tell the creditor.' },
    { t: 'The creditor confirms in writing', d: 'You get a copy of the settlement letter.' },
    { t: 'We pay ' + money(o.amount) + ' from your account', d: 'The creditor is paid from the funds you saved.' },
    { t: 'Our fee: ' + money(o.fee), d: 'Charged only now, after the payment is made.' },
  ];
}

/* Where every debt stands. The honest version, including why some wait. */
export function board(selected, deposit, settledId) {
  const order = plan(selected, deposit).order;
  return order.map((d) => {
    if ([].concat(settledId || []).includes(d.id)) return { debt: d, status: 'settled', label: 'Settled', note: 'Paid from your fund.' };
    if (d.status === 'late') return { debt: d, status: 'next', label: 'Next in line', note: 'Offers usually come once an account is about 90 days behind.' };
    if (d.status === 'current') return { debt: d, status: 'wait', label: 'Waiting', note: 'Creditors usually will not settle until an account is behind. We will tell you what to expect before that happens.' };
    return { debt: d, status: 'next', label: 'Next in line', note: 'We will reach out when your fund can cover an offer.' };
  });
}
export function savedSoFar(o) { return o ? o.saved : 0; }
export const PERSONA_S = { ask: true, approve: true };
export { money };
