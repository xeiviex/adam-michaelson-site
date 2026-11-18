/* Achieve debt relief prototype: the journey, defined once. Pure data and helpers, no DOM, so it can be unit tested.
   Eight stages from lead to graduation. Slice 1 builds stage 1 (lead intake) and the shell around all eight.
   Everything is sample data. Values are illustrative, not Achieve pricing. */
import { money, parseEmail, parsePhone } from './firsttake/shared/flow.js';

export const BRAND = { name: 'Achieve', phone: '(833) 435-2021' };

export const STAGES = [
  { id: 'lead', n: 1, label: 'Get started', goal: 'Tell us about your debt', built: true },
  { id: 'qualify', n: 2, label: 'Qualify', goal: 'See if a program fits', built: true },
  { id: 'consult', n: 3, label: 'Your plan', goal: 'Build your plan with a specialist', built: true },
  { id: 'enroll', n: 4, label: 'Enroll', goal: 'Review, sign and open your account', built: true },
  { id: 'deposit', n: 5, label: 'First deposit', goal: 'Make your first deposit', built: true },
  { id: 'build', n: 6, label: 'Build your fund', goal: 'Save toward your first settlement', built: true },
  { id: 'negotiate', n: 7, label: 'Settle', goal: 'We negotiate, you approve', built: true },
  { id: 'free', n: 8, label: 'Debt free', goal: 'Graduate and celebrate', built: true },
];
export const stageById = (id) => STAGES.find((s) => s.id === id);

/* Stage 1 steps. The shape matches the first take's steps, so forms.js builds them unchanged. */
const F = (o) => o;
export const LEAD_STEPS = [
  {
    id: 'debt', stage: 'lead', label: 'Debt amount', secs: 30,
    q: 'About how much unsecured debt do you have?',
    sub: 'Add up credit cards, personal loans, store cards and medical bills. Leave out your mortgage and car loan. A rough number is fine.',
    fields: [F({ id: 'debt', type: 'slider', min: 7500, max: 150000, step: 500, def: 32000, minLabel: '$7,500', maxLabel: '$150K+', label: 'Total unsecured debt' })],
    note: 'Programs generally start at $7,500 in unsecured debt. Larger balances are welcome.',
    summary: (a) => money(a.debt),
  },
  {
    id: 'name', stage: 'lead', label: 'Name', secs: 20,
    q: "Let's get to know you",
    sub: 'Checking your options will not affect your credit score.',
    fields: [
      F({ id: 'first', type: 'text', label: 'First Name', ph: 'First Name', autocomplete: 'given-name' }),
      F({ id: 'last', type: 'text', label: 'Last Name', ph: 'Last Name', autocomplete: 'family-name' }),
    ],
    summary: (a) => a.first + ' ' + a.last,
  },
  {
    id: 'where', stage: 'lead', label: 'Location', secs: 20,
    q: 'Where do you live?',
    sub: 'Programs and consumer rules vary by state.',
    fields: [
      F({ id: 'state', type: 'state', label: 'State', autocomplete: 'address-level1' }),
      F({ id: 'zip', type: 'zip', label: 'ZIP Code', ph: '', autocomplete: 'postal-code' }),
    ],
    summary: (a) => a.state + ' ' + a.zip,
  },
  {
    id: 'phone', stage: 'lead', label: 'Phone', secs: 20,
    q: "What's the best number to reach you?",
    secure: 'We keep your personal information secure.',
    fields: [F({ id: 'phone', type: 'tel', label: 'Mobile Phone Number', ph: '(___) ___-____', autocomplete: 'tel' })],
    consent: 'By clicking "Next" you agree to the E-Sign Consent, Privacy Policy and Terms of Use, and give your express written consent to be contacted by Achieve about your options at this number, including by autodialed or prerecorded calls and texts. Consent is not a condition of any purchase. Message and data rates may apply. Reply STOP to opt out.',
    summary: (a) => a.phone,
  },
  {
    id: 'email', stage: 'lead', label: 'Email', secs: 20,
    q: 'Last step to see your options',
    sub: "We'll send your summary here.",
    fields: [F({ id: 'email', type: 'email', label: 'Email Address', ph: 'example@email.com', autocomplete: 'email' })],
    after: 'Seeing if you qualify will not impact your credit score.',
    submitLabel: 'See my options',
    summary: (a) => a.email,
  },
];
export const stepById = (id) => LEAD_STEPS.find((s) => s.id === id);

/* The sample person the auto-play fills in. Nothing here is a real person. */
export const PERSONA = { debt: 32000, first: 'Jordan', last: 'Rivera', state: 'UT', zip: '84043', phone: '(801) 555-0142', email: 'jordan.rivera@example.com' };

export function leadComplete(done) { return LEAD_STEPS.every((s) => done.includes(s.id)); }
export function nextStep(done) { return LEAD_STEPS.find((s) => !done.includes(s.id)) || null; }

/* Overall progress on the path: each stage is an equal share; the current stage counts by its own steps. */
export function pathPct(stageDone, leadDone, qFrac) {
  const per = 100 / STAGES.length;
  let p = stageDone.length * per;
  if (!stageDone.includes('lead')) p += per * (leadDone.length / LEAD_STEPS.length);
  else p += per * (qFrac || 0);
  return Math.round(Math.min(100, p));
}

export function secsLeft(done) { return LEAD_STEPS.filter((s) => !done.includes(s.id)).reduce((t, s) => t + s.secs, 0); }
export function minsLabel(secs) {
  if (secs <= 0) return 'Step 1 complete';
  if (secs < 60) return 'Less than 1 min left';
  const m = Math.ceil(secs / 60);
  return 'About ' + m + (m === 1 ? ' min' : ' mins') + ' left';
}

/* Light checks used by the demo and the tests. */
export const validPersona = (p) => !!(p && p.debt >= 7500 && parseEmail(p.email) && parsePhone(p.phone));
