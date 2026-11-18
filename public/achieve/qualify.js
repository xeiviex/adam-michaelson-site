/* Achieve debt relief prototype, stage 2: qualification. Pure data and rules, no DOM, so it can be unit tested.
   The rules mirror how debt settlement programs screen in practice: enough unsecured debt, a hardship that makes the
   payments hard, and the ability to make a monthly deposit. All thresholds and ratios are illustrative samples. */
import { money } from './firsttake/shared/flow.js';

export const RULES = {
  minDebt: 7500,          /* many programs start at $7,500; some at $10,000 */
  reviewDebt: 100000,     /* above this a specialist reviews the file; larger balances are not declined */
  minDeposit: 250,        /* smallest monthly deposit that makes a program workable */
  settlePct: 0.5,         /* typical settlement is about half of the balance (illustrative) */
  feePct: 0.2,            /* fee as a share of enrolled debt, charged only after a settlement (illustrative) */
  minMonths: 12, maxMonths: 60,
};

export const DEBT_TYPES = [
  { id: 'card', label: 'Credit cards', ic: 'card' },
  { id: 'personal', label: 'Personal loans', ic: 'debt' },
  { id: 'medical', label: 'Medical bills', ic: 'shield' },
  { id: 'store', label: 'Store cards', ic: 'bag' },
  { id: 'collections', label: 'Accounts in collections', ic: 'file' },
  { id: 'payday', label: 'Payday or online loans', ic: 'clip' },
  { id: 'other', label: 'Other unsecured debt', ic: 'dots' },
];
export const NOT_INCLUDED = ['Mortgage', 'Car loan', 'Federal student loans', 'Taxes owed', 'Child support'];

export const STATUS = [
  { id: 'current', label: 'I am current, but it is getting hard' },
  { id: 'late', label: '1 to 2 months behind on some' },
  { id: 'behind', label: '3 or more months behind on some' },
  { id: 'collections', label: 'Some are with collection agencies' },
  { id: 'sued', label: "I've received legal papers or a summons" },
];

const WHEN = ['In the last 3 months', '3 to 12 months ago', 'More than a year ago'];
const D = (id, label, hint) => ({ id, label, hint });
export const HARDSHIPS = [
  { id: 'job', label: 'Lost a job or had hours cut', ic: 'bag',
    qs: [{ id: 'when', q: 'When did this happen?', opts: WHEN }, { id: 'impact', q: 'What changed?', opts: ['Lost the job entirely', 'Hours or pay were cut', 'Lost a second income', 'Self-employed income dropped'] }, { id: 'now', q: 'Where are things now?', opts: ['Still looking for work', 'New job at lower pay', 'Back to full pay, but behind'] }],
    docs: [D('layoff', 'Layoff or termination letter', 'Shows the date and the reason.'), D('paystubs', 'Pay stubs before and after', 'Shows how much income changed.'), D('ui', 'Unemployment benefits statement', 'If you are receiving benefits.')] },
  { id: 'medical', label: 'Medical expenses or illness', ic: 'shield',
    qs: [{ id: 'when', q: 'When did this start?', opts: WHEN }, { id: 'who', q: 'Who was it for?', opts: ['Me', 'My spouse or partner', 'My child', 'A parent or other family'] }, { id: 'kind', q: 'Is it ongoing?', opts: ['One-time event', 'Ongoing treatment'] }],
    docs: [D('bills', 'Medical bills or an explanation of benefits', 'We only need amounts and dates, not details of care.'), D('lostwork', 'Proof of missed work or lost income', 'If time off cut your pay.')] },
  { id: 'divorce', label: 'Divorce or separation', ic: 'link',
    qs: [{ id: 'when', q: 'When did this happen?', opts: WHEN }, { id: 'impact', q: 'What changed?', opts: ['Lost a second income', 'Taking on support payments', 'Taking on shared debts'] }],
    docs: [D('decree', 'Decree or court filing', 'Shows the date.'), D('support', 'Support order', 'If you pay or receive support.')] },
  { id: 'death', label: 'Death of a spouse or family member', ic: 'star',
    qs: [{ id: 'when', q: 'When did this happen?', opts: WHEN }, { id: 'impact', q: 'What changed?', opts: ['Lost their income', 'Funeral or estate costs', 'Both'] }],
    docs: [D('cert', 'Death certificate', 'Optional. Share only if you are comfortable.')] },
  { id: 'business', label: 'Business slowdown or closure', ic: 'home',
    qs: [{ id: 'when', q: 'When did this happen?', opts: WHEN }, { id: 'impact', q: 'What changed?', opts: ['Sales dropped', 'The business closed', 'I used personal credit to cover it'] }],
    docs: [D('pl', 'Profit and loss or recent tax return', 'Shows the drop in income.'), D('closure', 'Closure notice', 'If the business closed.')] },
  { id: 'disaster', label: 'Disaster or emergency', ic: 'info',
    qs: [{ id: 'when', q: 'When did this happen?', opts: WHEN }, { id: 'impact', q: 'What changed?', opts: ['Home or car damage', 'Had to relocate', 'Lost work because of it'] }],
    docs: [D('claim', 'Insurance claim or assistance letter', 'Shows the date and the loss.')] },
  { id: 'costs', label: 'Living costs rose faster than income', ic: 'card',
    qs: [{ id: 'when', q: 'How long has this been building?', opts: ['Under a year', '1 to 2 years', 'More than 2 years'] }, { id: 'impact', q: 'What grew the most?', opts: ['Housing', 'Childcare', 'Food and fuel', 'Insurance'] }],
    docs: [D('lease', 'Lease or rent increase notice', 'Shows the new amount.'), D('bills', 'A recent bill showing the increase', 'Utilities, insurance or childcare.')] },
  { id: 'other', label: 'Something else', ic: 'dots',
    qs: [{ id: 'when', q: 'When did this start?', opts: WHEN }],
    docs: [D('any', 'Anything that shows what changed', 'A letter, bill or statement.')] },
];
export const hardshipById = (id) => HARDSHIPS.find((x) => x.id === id);
export const MAX_DETAIL = 2;

/* The steps for stage 2. Hardship detail steps appear for what the person selected (up to two). */
export function qSteps(q) {
  const picked = ((q && q.hardships) || []).slice(0, MAX_DETAIL);
  return ['dtypes', 'status', 'hardship', ...picked.map((id) => 'detail:' + id), 'budget', 'result'];
}
export const nextQStep = (qdone, q) => qSteps(q).find((s) => !qdone.includes(s)) || null;
export const qStepLabel = (id) => ({ dtypes: 'Types of debt', status: 'Where you stand', hardship: 'What changed', budget: 'Your budget', result: 'Your result' }[id]
  || (id.startsWith('detail:') ? (hardshipById(id.slice(7)) || { label: 'Details' }).label : id));

/* How strongly a hardship is described and backed up. Never blocks the person; it only shows what would help. */
export function hardshipStrength(q) {
  const picked = (q.hardships || []).slice(0, MAX_DETAIL);
  let asked = 0, answered = 0, docs = 0;
  for (const id of picked) {
    const h = hardshipById(id); if (!h) continue;
    const d = (q.detail && q.detail[id]) || {};
    asked += h.qs.length; answered += h.qs.filter((x) => d[x.id]).length; docs += (d.docs || []).length;
  }
  const level = !picked.length ? 'none' : answered < asked ? 'partial' : docs > 0 ? 'documented' : 'described';
  return { level, answered, asked, docs };
}

/* The budget view: what is left each month and what a deposit could be. */
export function budget(b) {
  const income = Number(b.income) || 0, essentials = Number(b.essentials) || 0, deposit = Number(b.deposit) || 0;
  const surplus = income - essentials;
  return { income, essentials, deposit, surplus, fits: deposit > 0 && deposit <= Math.max(0, surplus) };
}

/* Illustrative program estimate: settle at about half, fee on enrolled debt, paid for out of one monthly deposit. */
export function estimate(debt, deposit) {
  const d = Number(debt) || 0, dep = Math.max(1, Number(deposit) || 0);
  const settlement = Math.round(d * RULES.settlePct), fee = Math.round(d * RULES.feePct);
  const total = settlement + fee;
  const months = Math.min(RULES.maxMonths, Math.max(RULES.minMonths, Math.ceil(total / dep)));
  return { debt: d, settlement, fee, total, kept: d - total, months, deposit: dep };
}

/* The decision. outcome: 'fit' (likely a fit), 'review' (a specialist looks at it), 'notyet' (not a fit today).
   Larger debts are never declined for size; they go to a specialist. */
export function qualify(applicant, q) {
  const debt = Number(applicant.debt) || 0;
  const b = budget(q.budget || {});
  const reasons = [], flags = [];
  let outcome = 'fit';
  const sue = q.status === 'sued';
  if (sue) flags.push('Legal papers need attention first. A specialist will call you about the deadline on them.');
  if (debt < RULES.minDebt) { outcome = 'notyet'; reasons.push('Your unsecured debt is under ' + money(RULES.minDebt) + ', the usual minimum for a program.'); }
  if (!((q.hardships || []).length)) { if (outcome === 'fit') outcome = 'review'; reasons.push('Tell us what has made payments hard, so a specialist can confirm a program is right for you.'); }
  if (b.deposit < RULES.minDeposit) { outcome = 'notyet'; reasons.push('A program needs a monthly deposit of about ' + money(RULES.minDeposit) + ' or more.'); }
  else if (!b.fits) { if (outcome === 'fit') outcome = 'review'; reasons.push('Your deposit is more than what is left after essentials. A specialist can look for a plan that fits.'); }
  if (debt > RULES.reviewDebt && outcome === 'fit') { outcome = 'review'; reasons.push('With ' + money(debt) + ' in debt, a senior specialist reviews your plan. Larger balances can be a strong fit.'); }
  const strength = hardshipStrength(q);
  return { outcome, reasons, flags, strength, est: estimate(debt, b.deposit), budget: b, urgent: sue };
}

/* The sample person the auto-play fills in for this stage. */
export const PERSONA_Q = {
  dtypes: ['card', 'personal', 'medical'],
  status: 'late',
  hardships: ['job', 'medical'],
  detail: {
    job: { when: 'In the last 3 months', impact: 'Hours or pay were cut', now: 'Back to full pay, but behind', docs: ['pay-stubs-before-after.pdf'], note: 'My hours were cut by about 40 percent in the spring. Pay is back up, but the cards kept growing.' },
    medical: { when: '3 to 12 months ago', who: 'My spouse or partner', kind: 'One-time event', docs: ['medical-bill-summary.pdf'], note: '' },
  },
  budget: { income: 5400, essentials: 4500, deposit: 600 },
};

/* The budget step is a plain form card (three sliders), so the first take's form builder handles it. */
const SL = (o) => Object.assign({ type: 'slider' }, o);
export const BUDGET_STEP = {
  id: 'budget', submitLabel: 'See my result',
  fields: [
    SL({ id: 'income', min: 1000, max: 20000, step: 100, def: 5000, minLabel: '$1,000', maxLabel: '$20K+', label: 'Monthly income after taxes' }),
    SL({ id: 'essentials', min: 500, max: 15000, step: 100, def: 3500, minLabel: '$500', maxLabel: '$15K+', label: 'Monthly essentials (housing, food, utilities, transport, insurance)' }),
    SL({ id: 'deposit', min: 100, max: 3000, step: 25, def: 500, minLabel: '$100', maxLabel: '$3,000+', label: 'Monthly deposit you could commit to' }),
  ],
};
export function budgetLine(b) {
  const x = budget(b);
  if (!x.deposit) return '';
  if (x.surplus <= 0) return 'Your essentials use all of your income. A specialist can still help you look at options.';
  return 'After essentials you have about ' + money(x.surplus) + ' a month. ' + (x.fits ? 'A ' + money(x.deposit) + ' deposit fits.' : 'A ' + money(x.deposit) + ' deposit is more than that.');
}
