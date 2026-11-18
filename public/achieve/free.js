/* Achieve debt relief prototype, stage 8: debt free. Pure data and rules, no DOM.
   All figures are illustrative samples. Products named here are fictional placeholders, and nothing is promised:
   credit scores, rates and mortgage readiness depend on the person and the lender. */
import { money } from './firsttake/shared/flow.js';

export const F_STEPS = ['graduate', 'rave', 'movie', 'box', 'next'];
export const nextFStep = (fdone) => F_STEPS.find((s) => !fdone.includes(s)) || null;
export const fStepLabel = (id) => ({ graduate: 'You did it', rave: 'Celebrate', movie: 'Your movie', box: 'Your gift box', next: 'What comes next' }[id]);

/* The story of the journey, from what the person already told us. */
export function recap({ selected, deposit, months, fee }) {
  const owed = selected.reduce((t, d) => t + d.balance, 0);
  const total = deposit * months;
  return { owed, debts: selected.length, months, deposit, total, kept: Math.max(0, owed - total), fee: fee == null ? Math.round(owed * 0.2) : fee };
}

export const BADGES = [
  { id: 'start', t: 'Took the first step', d: 'You told us about your debt.' },
  { id: 'sign', t: 'Made a commitment', d: 'You signed and opened your account.' },
  { id: 'draft', t: 'First deposit cleared', d: 'The hardest part was done.' },
  { id: 'half', t: 'Halfway there', d: 'Your fund passed 50%.' },
  { id: 'settle', t: 'First settlement', d: 'Your first debt was resolved.' },
  { id: 'free', t: 'Debt free', d: 'Every enrolled debt resolved.' },
];

/* Messages from the people who worked with the client. Fictional. */
export const NOTES = [
  { who: 'Priya Nair', role: 'Your negotiator', say: (n) => 'Working for you was a privilege, ' + n + '. You never missed a deposit when it counted, and that is why we got here.' },
  { who: 'Maya', role: 'Your specialist', say: (n) => 'I remember our first call, ' + n + '. You were not sure this could work. Look at you now.' },
  { who: 'The Achieve team', role: 'Everyone who cheered you on', say: () => 'We keep a short list of people who finish what they start. You are on it.' },
];

/* The gift box. Shipped to a mailing address the client confirms. */
export const BOX = ['A handwritten card from your team', 'A framed "Debt free" certificate', 'A small celebration treat', 'A pen to sign your first mortgage or savings paperwork'];
export const ADDRESS_FIELDS = [
  { id: 'line1', label: 'Street address', ph: '123 Main Street' },
  { id: 'city', label: 'City', ph: 'Salt Lake City' },
  { id: 'state', label: 'State', ph: 'UT', max: 2 },
  { id: 'zip', label: 'ZIP', ph: '84101', max: 5 },
];
export const PERSONA_ADDR = { line1: '482 Juniper Lane', city: 'Provo', state: 'UT', zip: '84601' };
export const addressOk = (a) => !!(a && a.line1 && a.line1.trim().length > 3 && a.city && a.city.trim() && /^[A-Za-z]{2}$/.test((a.state || '').trim()) && /^\d{5}$/.test((a.zip || '').trim()));

/* The song, a graduation version. Own words, no real lyrics. */
export function song({ first, months }) {
  const n = first || 'friend';
  return { title: n + ', Debt Free', note: 'A song written for you.', lines: [
    'Month by month, ' + n + ', you showed up,',
    'ninety days or more, and you did not stop.',
    'Every deposit was a brick in the wall,',
    'and now ' + (months || 'all') + ' months later the wall stands tall.',
    'The calls are over, the balance is zero,',
    'and you are the hero, the hero, the hero.',
  ] };
}

/* What comes next. Three paths, each with an honest starting step. Illustrative only. */
export const NEXT = [
  { id: 'save', t: 'Build a safety net', d: 'Start an emergency fund so a surprise bill never lands on a card again.', step: 'Open a savings account and set an automatic transfer. Your old debt payment is a natural amount to keep saving.', cta: 'Open savings' },
  { id: 'credit', t: 'Rebuild your credit', d: 'Your score took a hit during the program. It can recover with steady habits.', step: 'Open one small, on-time-payment account and keep balances low. Most people see steady gains over 12 to 24 months. Results vary.', cta: 'Start rebuilding' },
  { id: 'invest', t: 'Start investing', d: 'Small and steady is fine. Time does most of the work.', step: 'Begin with a retirement account and a low-cost index fund. This is general information, not personal investment advice.', cta: 'Explore investing' },
  { id: 'home', t: 'Work toward a home', d: 'Many lenders want to see a track record after a settlement. We will show you what they look at.', step: 'A readiness check shows your income, savings and credit steps. It does not guarantee any loan.', cta: 'Check readiness' },
];
export const PERSONA_F = { next: ['save', 'credit'], addr: true };
export const nextFlowSummary = (ids) => ids.length ? NEXT.filter((x) => ids.includes(x.id)).map((x) => x.t).join(', ') : 'Nothing right now';
export { money };
