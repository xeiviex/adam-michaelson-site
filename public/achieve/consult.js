/* Achieve debt relief prototype, stage 3: the plan consultation. Pure data and rules, no DOM.
   Replicates what a specialist covers on the phone: confirm the debts, learn the goal, listen, set expectations
   honestly, and show the plan. Debts and names are fictional samples. Numbers are illustrative. */
import { money } from './firsttake/shared/flow.js';
import { RULES, estimate } from './qualify.js';

/* What a soft credit pull would return. Fictional creditors that add up to the sample $32,000. */
export const TRADELINES = [
  { id: 't1', name: 'Summit Bank Visa', kind: 'Credit card', balance: 11200, status: 'late', note: '2 payments behind' },
  { id: 't2', name: 'Lakeview Rewards Card', kind: 'Credit card', balance: 8900, status: 'current', note: 'Current, high balance' },
  { id: 't3', name: 'Northfield Personal Loan', kind: 'Personal loan', balance: 7400, status: 'late', note: '1 payment behind' },
  { id: 't4', name: 'Regional Medical Group', kind: 'Medical bill', balance: 4500, status: 'collections', note: 'With a collection agency' },
];

export const GOALS = [
  { id: 'calls', label: 'Stop the stress and the calls', ic: 'phone' },
  { id: 'total', label: 'Pay back less overall', ic: 'card' },
  { id: 'time', label: 'Be done in about three years', ic: 'star' },
  { id: 'nobk', label: 'Avoid bankruptcy', ic: 'shield' },
];
export const HOUSEHOLD = ['Just me', '2 people', '3 people', '4 or more'];
export const COSIGN = [{ id: 'no', label: 'No, only me' }, { id: 'yes', label: 'Yes, someone else is on an account' }];
export const BK = [{ id: 'no', label: 'No' }, { id: 'thought', label: 'I have thought about it' }, { id: 'talked', label: 'I have talked to an attorney' }];

/* The open conversation: warm, short replies. A later slice sends this to the Claude assistant. */
const LISTEN = [
  [/spouse|husband|wife|partner|kids|children|family/, 'Thank you for telling me about your family. A plan works best when it fits real life, so I will note that your household is part of how we set your deposit.'],
  [/job|laid|hours|work|income|raise|pay/, 'That is a lot to carry. I have noted the change in your income. It is exactly the kind of thing that makes payments hard, and it is why this works for people in your position.'],
  [/sick|medical|hospital|surgery|cancer|health/, 'I am sorry you have had to deal with that. I will note it. You only need to share what you are comfortable with.'],
  [/house|home|mortgage|rent|car|vehicle/, 'Good to know. A home or car loan is not part of the program, so those payments continue as usual. I will make a note so your plan keeps them in mind.'],
  [/bankrupt|lawyer|attorney|lawsuit|sued|court/, 'That matters. If you have legal papers, tell your specialist the same day, because they come with deadlines. I have noted it.'],
  [/scared|worried|afraid|ashamed|embarrass|stress|overwhelm/, 'What you feel is common, and you are not alone. Many people in this program felt the same way on day one. You took a step, and we will be next to you for the rest.'],
];
export const LISTEN_DEFAULT = 'Thank you for sharing that. I have added it to your file so your specialist sees it too.';
export function listenReply(text) { const t = String(text || '').toLowerCase(); const hit = LISTEN.find(([re]) => re.test(t)); return hit ? hit[1] : LISTEN_DEFAULT; }
export const LISTEN_OPEN = "Before I show you a plan, is there anything about your situation I haven't asked? You can type it, or tap one below.";
export const LISTEN_CHIPS = ['I am worried about my family', 'My income changed', 'I have legal papers', 'Nothing else'];
export const PERSONA_TALK = 'My hours were cut and my wife is worried about the cards. I just want a plan I can stick with.';

/* What to expect. Plain and honest: this is the screen that sets the relationship up to last. */
export function expectations(months) {
  return [
    { id: 'time', ic: 'star', t: 'How long it takes', b: 'For your numbers, about ' + months + ' months. Your first settlement often comes within the first several months, and the rest follow as your fund grows. It is an estimate. Creditors decide, and your timeline can move.' },
    { id: 'credit', ic: 'shield', t: 'Your credit score will drop', b: 'Stopping payments to creditors lowers your score, and accounts can be reported late and charged off. Settled accounts show as settled for less than the full balance. Many people are already behind and see it fall further before it recovers. You will start rebuilding as accounts are resolved, and we will show you how.' },
    { id: 'calls', ic: 'phone', t: 'Creditors will keep calling and texting', b: 'Expect calls, texts and letters. This is normal, and you do not have to answer. Collectors have rules they must follow. Tell us about every contact, including anything that crosses a line, and we will tell you what it means and what to do.' },
    { id: 'suit', ic: 'info', t: 'A lawsuit is possible', b: 'A creditor can sue, even while you are in a program. If you get legal papers, tell us the same day. There are deadlines, and we will help you through them.' },
    { id: 'tax', ic: 'file', t: 'Forgiven debt can be taxable', b: 'When a creditor forgives $600 or more, they may report it to the IRS, and it can count as income. A tax professional can tell you how it applies to you.' },
    { id: 'fees', ic: 'card', t: 'You pay fees only after results', b: 'We charge no fee until a debt is settled, you approve it, and the first payment to that creditor is made. You can cancel at any time, and the money in your account is yours.' },
    { id: 'us', ic: 'link', t: 'We will be next to you', b: 'You approve every settlement. You see every call, text and email we handle for you. Your specialist and your negotiators are a message away. You are not doing this alone.' },
  ];
}

/* The plan from the debts the person confirmed and the deposit they chose. */
export const MIN_OFFER_MONTH = 3;
export function plan(selected, deposit) {
  const debts = selected.filter(Boolean);
  const total = debts.reduce((t, d) => t + d.balance, 0);
  const est = estimate(total, deposit);
  const smallest = debts.length ? Math.min(...debts.map((d) => d.balance)) : 0;
  const firstOffer = Math.max(MIN_OFFER_MONTH, Math.ceil((smallest * 0.2) / est.deposit));
  const order = debts.slice().sort((a, b) => (b.status === 'collections') - (a.status === 'collections') || a.balance - b.balance);
  return Object.assign(est, { total_debt: total, firstOffer, order, count: debts.length });
}
export const tradeById = (id) => TRADELINES.find((t) => t.id === id);

export const PERSONA_C = {
  debts: TRADELINES.map((t) => t.id),
  household: '2 people', cosign: 'no', bk: 'thought', goals: ['calls', 'nobk'],
  talk: PERSONA_TALK,
};

export const C_STEPS = ['debts', 'goals', 'talk', 'expect', 'plan'];
export const nextCStep = (cdone) => C_STEPS.find((s) => !cdone.includes(s)) || null;
export const cStepLabel = (id) => ({ debts: 'Your debts', goals: 'Your goals', talk: 'Tell us more', expect: 'What to expect', plan: 'Your plan' }[id]);
export { money, RULES };
