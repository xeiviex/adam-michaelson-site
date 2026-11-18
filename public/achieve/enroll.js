/* Achieve debt relief prototype, stage 4: enrollment. Pure data and rules, no DOM.
   The agreement is a plain-language sample built from the program-agreement doc: it is not legal text and every
   name, fee and bank below is fictional. The first deposit is celebrated in stage 5, after the debit clears. */
import { money } from './firsttake/shared/flow.js';

export const ADMIN = { name: 'Harbor Trust Services', bank: 'Granite Harbor Bank', monthlyFee: 9.95 };

export const E_STEPS = ['review', 'consent', 'sign', 'account', 'draft'];
export const nextEStep = (edone) => E_STEPS.find((s) => !edone.includes(s)) || null;
export const eStepLabel = (id) => ({ review: 'Review your agreement', consent: 'Your consents', sign: 'Sign', account: 'Open your account', draft: 'Automatic deposits' }[id]);

/* Sections of the agreement: a one-line plain summary and a few sentences of detail. */
export function agreement(p) {
  const fee = Math.round(p.fee / (p.debt || 1) * 100) || 20;
  return [
    { id: 'what', t: 'What you are signing up for', plain: 'A program to settle your unsecured debts for less than you owe.',
      d: 'Achieve negotiates with your creditors, one debt at a time, using money you save in your own dedicated account. We do not make loans and we do not pay your creditors from our own funds. No result is guaranteed, because each creditor decides whether to settle.' },
    { id: 'debts', t: 'Your enrolled debts', plain: p.count + ' accounts, ' + money(p.total_debt) + ' in total.',
      d: 'These are the debts listed in Schedule A: ' + p.order.map((x) => x.name + ' (' + money(x.balance) + ')').join(', ') + '. You can ask to add or remove a debt, and balances may change as creditors add interest and fees.' },
    { id: 'deposit', t: 'Your monthly deposit', plain: money(p.deposit) + ' a month, for about ' + p.months + ' months.',
      d: 'You agree to deposit ' + money(p.deposit) + ' each month into your dedicated account. Missing deposits can delay settlements, and enough missed deposits can end the program or void a settlement already agreed. If a deposit will be late, tell us before it happens.' },
    { id: 'account', t: 'Your dedicated account', plain: 'An FDIC-insured account in your name. You own it. You can see it any time.',
      d: 'Your deposits go to a dedicated account in your name at ' + ADMIN.bank + ', run by ' + ADMIN.name + ', an independent administrator that is not part of Achieve. The administrator charges $' + ADMIN.monthlyFee.toFixed(2) + ' a month. Achieve cannot take money from the account except to pay a settlement you approved and a fee we have earned.' },
    { id: 'fee', t: 'Our fee', plain: 'About ' + fee + '% of the debt we settle, only after it is settled.',
      d: 'We charge no fee until a debt is settled, you approve the settlement, and the first payment on it has been made. The fee for each debt is ' + fee + '% of that debt\'s enrolled balance. Example: on a $10,000 debt the fee is $' + (fee * 100).toLocaleString('en-US') + ', due only after that debt is settled.' },
    { id: 'approve', t: 'You approve every settlement', plain: 'Nothing is paid without your yes.',
      d: 'When a creditor makes an offer, we show it to you with the savings and the cost. You choose to accept or decline. The funds for an accepted settlement come from your account.' },
    { id: 'expect', t: 'What to expect', plain: 'Your credit score will drop. Creditors will keep contacting you. A lawsuit is possible.',
      d: 'Stopping payments lowers your credit score. Creditors and collectors may call, text and write, and may sue. Forgiven debt of $600 or more can be reported to the IRS as income. We will help you through each of these, and you should tell us about every contact.' },
    { id: 'duty', t: 'What we ask of you', plain: 'Deposit on time, keep your information current, and tell us about creditor contact.',
      d: 'Keep making your deposits. Tell us if your income changes, if you move, or if you get legal papers. Do not take on new debt you cannot afford while you are in the program.' },
    { id: 'comms', t: 'How we communicate and record', plain: 'Calls with us may be recorded, and you can listen to them.',
      d: 'We may call, text and email you about your program. Some calls are recorded. Some states require everyone on a call to agree to recording, so we will tell you at the start of each call. You can listen to the recordings of your own calls in your account.' },
    { id: 'cancel', t: 'Cancelling', plain: 'You can cancel any time. Your money is yours.',
      d: 'You can cancel at any time. The funds in your account are returned to you within 7 business days, less any fees already earned and the administrator\'s fees. Tell us at least 3 business days before your next deposit date so that deposit can be stopped.' },
  ];
}

export const CONSENTS = [
  { id: 'esign', t: 'I agree to sign electronically and to receive documents electronically.' },
  { id: 'record', t: 'I understand some calls may be recorded, and I agree to be contacted about my program by phone, text and email.' },
  { id: 'authorize', t: 'I authorize Achieve to negotiate the debts in Schedule A for me, and to open a dedicated account in my name.' },
  { id: 'understand', t: 'I understand my credit score will drop, creditors may contact or sue me, and results are not guaranteed.' },
];

export const BANKS = [
  { id: 'evergreen', name: 'Evergreen Credit Union', last4: '4821' },
  { id: 'cascade', name: 'Cascade Bank', last4: '7730' },
  { id: 'mesa', name: 'Mesa Federal', last4: '2096' },
];
export const bankById = (id) => BANKS.find((b) => b.id === id);
export const SIG_FONTS = ['Snell Roundhand, "Brush Script MT", cursive', '"Segoe Script", "Lucida Handwriting", cursive', 'Georgia, serif'];

export const FREQS = [
  { id: 'monthly', label: 'Once a month', n: 12, hint: 'Simple. One deposit a month.' },
  { id: 'biweekly', label: 'Every two weeks', n: 26, hint: 'Lines up with many paychecks. Smaller amounts.' },
  { id: 'twice', label: 'Twice a month', n: 24, hint: 'Half on two set days.' },
];
export const freqById = (id) => FREQS.find((f) => f.id === id);
/* The amount of each draft so the year adds up to the monthly deposit. */
export const perDraft = (monthly, freq) => Math.round((monthly * 12) / freqById(freq).n);
export const DAYS = [1, 5, 10, 15, 20, 25];
/* The first draft: the next chosen day at least `gap` days after `from`. */
export function firstDraft(from, day, gap) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const min = new Date(d.getTime() + (gap || 5) * 86400000);
  let t = new Date(d.getFullYear(), d.getMonth(), day);
  while (t < min) t = new Date(t.getFullYear(), t.getMonth() + 1, day);
  return t;
}
export const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export const PERSONA_E = { sign: 'Jordan Rivera', bank: 'evergreen', freq: 'monthly', day: 15, auto: true };
