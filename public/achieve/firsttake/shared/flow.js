/* Achieve prototype: the application flow, defined once and used by all three contexts
   (web funnel, Messages, ChatGPT). Steps and wording follow the screenshots of the live Achieve
   personal-loan flow. Pure data and helpers: no DOM, so it can be unit tested. */

export const BRAND = { name: 'Achieve', phone: '(833) 435-2021', consultants: '833-598-0058' };

export const HOURS = [
  ['Monday - Thursday', '6 am - 8 pm MST'],
  ['Friday', '6 am - 7 pm MST'],
  ['Saturday - Sunday', '7 am - 4 pm MST'],
];

export const GROUPS = [
  { id: 'loan', title: 'Your loan' },
  { id: 'you', title: 'About you' },
  { id: 'finances', title: 'Your finances' },
  { id: 'verify', title: 'Review & verify' },
  { id: 'docs', title: 'Documents' },
  { id: 'offers', title: 'Your offers' },
];

export const PURPOSES = ['Credit Card Refinancing', 'Debt Consolidation', 'Home Improvement', 'Major Purchase', 'Other'];
export const HOUSING = [
  ['own_mortgage', 'I own and pay mortgage'],
  ['own_free', 'I own free and clear'],
  ['rent', 'I rent'],
  ['other', 'I live with family or other'],
];
export const EMPLOYMENT = ['Full-Time', 'Part-Time', 'Self-Employed', 'Retired', 'Other'];
export const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');

export const DOC_TYPES = [
  { id: 'paystub', label: 'Most recent paystub', hint: 'From your employer. Shows your income.', required: true },
  { id: 'identity', label: 'Proof of identity', hint: "Driver's license, passport or military ID.", required: true },
  { id: 'address', label: 'Proof of address', hint: 'Lease, property tax bill or homeowner insurance.', required: (a) => a.housing !== 'other' },
  { id: 'bank', label: 'Bank statement or voided check', hint: 'Where you want your funds sent.', required: false },
  { id: 'tax', label: 'W-2 or tax forms', hint: 'Helps if your income varies.', required: false },
  { id: 'retirement', label: 'Retirement statement', hint: 'Only if you listed retirement savings.', required: false },
];
export const requiredDocs = (a) => DOC_TYPES.filter((d) => (typeof d.required === 'function' ? d.required(a || {}) : d.required));

/* ---------- formatting ---------- */
export const money = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');
export const digits = (s) => String(s || '').replace(/\D/g, '');
export const fmtPhone = (s) => {
  const d = digits(s).replace(/^1(?=\d{10}$)/, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
  return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
};
export const fmtDob = (s) => {
  const d = digits(s).slice(0, 8);
  if (d.length < 3) return d;
  if (d.length < 5) return d.slice(0, 2) + '/' + d.slice(2);
  return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4);
};
export const fmtSsn = (s) => {
  const d = digits(s).slice(0, 9);
  if (d.length < 4) return d;
  if (d.length < 6) return d.slice(0, 3) + '-' + d.slice(3);
  return d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5);
};

/* ---------- parsing free text (Messages / ChatGPT channels) ---------- */
export function parseMoney(text) {
  const t = String(text || '').toLowerCase().replace(/,/g, '');
  const m = t.match(/\$?\s*(\d+(?:\.\d+)?)\s*(k|thousand|m|million)?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (m[2] === 'k' || m[2] === 'thousand') n *= 1000;
  if (m[2] === 'm' || m[2] === 'million') n *= 1000000;
  return Math.round(n);
}
export function parsePurpose(text) {
  const t = String(text || '').toLowerCase().trim();
  if (/^[1-5]$/.test(t)) return PURPOSES[Number(t) - 1];
  if (/card|refinanc/.test(t)) return PURPOSES[0];
  if (/debt|consolidat|pay off|payoff/.test(t)) return PURPOSES[1];
  if (/home|improv|remodel|renovat|kitchen|roof|repair/.test(t)) return PURPOSES[2];
  if (/major|purchase|buy|wedding|car|vacation|medical/.test(t)) return PURPOSES[3];
  if (/other|something else/.test(t)) return PURPOSES[4];
  return null;
}
export function parseName(text) {
  const t = String(text || '').replace(/^(my name is|i'm|i am|it's|its|this is)\s+/i, '').replace(/[^\p{L}\s'.-]/gu, ' ').trim();
  const p = t.split(/\s+/).filter(Boolean);
  if (p.length < 2) return null;
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  return { first: cap(p[0]), last: p.slice(1).map(cap).join(' ') };
}
export function parseAddress(text) {
  const t = String(text || '').trim().replace(/\n/g, ', ');
  const m = t.match(/^(.+?),\s*([A-Za-z .'-]+?),?\s+([A-Za-z]{2})\.?,?\s+(\d{5})(?:-\d{4})?$/);
  if (!m || !STATES.includes(m[3].toUpperCase())) return null;
  return { street: m[1].trim(), apt: '', city: m[2].trim(), state: m[3].toUpperCase(), zip: m[4] };
}
export function parseEmail(text) {
  const m = String(text || '').match(/[^\s@<>()]+@[^\s@<>()]+\.[A-Za-z]{2,}/);
  return m ? m[0] : null;
}
export function parsePhone(text) {
  const d = digits(text).replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? fmtPhone(d) : null;
}
export function parseHousing(text) {
  const t = String(text || '').toLowerCase();
  if (/^1$/.test(t.trim()) || /mortgage/.test(t)) return 'own_mortgage';
  if (/^2$/.test(t.trim()) || /free|clear|own/.test(t)) return 'own_free';
  if (/^3$/.test(t.trim()) || /rent/.test(t)) return 'rent';
  if (/^4$/.test(t.trim()) || /family|other|parents/.test(t)) return 'other';
  return null;
}
export function parseEmployment(text) {
  const t = String(text || '').toLowerCase();
  if (/full/.test(t)) return 'Full-Time';
  if (/part/.test(t)) return 'Part-Time';
  if (/self|own business|freelance/.test(t)) return 'Self-Employed';
  if (/retire/.test(t)) return 'Retired';
  if (/other/.test(t)) return 'Other';
  return null;
}
export const isYes = (t) => /^(y|yes|yep|yeah|sure|ok|okay|correct|looks good|that's right|confirm|go ahead|sounds good)\b/i.test(String(t || '').trim());
export const isSkip = (t) => /^(skip|no|none|n\/a|nope|pass|not now|later)\b/i.test(String(t || '').trim());

/* ---------- steps ----------
   fields: what the web form shows. ask/parse: how Messages and ChatGPT ask for it in conversation.
   sensitive: never collected over text; those channels send a link back to the web flow instead. */
const F = (o) => o;

export const STEPS = [
  {
    id: 'amount', group: 'loan', label: 'Loan amount', secs: 40,
    q: 'How much are you looking to borrow?',
    perks: { title: 'Personal Loans with Achieve', items: ['Check your rate in 5 minutes', 'No prepayment penalty', 'Funds in as little as 24-72 hours'] },
    fields: [F({ id: 'amount', type: 'slider', min: 5000, max: 50000, step: 500, def: 20000, minLabel: '$5,000', maxLabel: '$50K+', ask: 'How much are you looking to borrow? (Between $5,000 and $50,000)', parse: (t) => { const n = parseMoney(t); return n && n >= 5000 ? Math.min(n, 50000) : null; }, err: 'Achieve personal loans start at $5,000. What amount works for you?' })],
    summary: (a) => money(a.amount),
  },
  {
    id: 'purpose', group: 'loan', label: 'Loan purpose', secs: 25,
    q: "What's this loan for?",
    fields: [F({ id: 'purpose', type: 'choice', options: PURPOSES, ask: "What's this loan for? Credit card refinancing, debt consolidation, home improvement, a major purchase, or something else?", parse: parsePurpose, err: 'I can help with credit card refinancing, debt consolidation, home improvement, a major purchase, or something else. Which fits best?' })],
    summary: (a) => a.purpose,
  },
  {
    id: 'income', group: 'loan', label: 'Annual income', secs: 35,
    q: "What's your individual annual income?",
    sub: 'Tell us how much you make in a year, before taxes. This can include wages, bonuses, commissions and other income.',
    note: 'We need this information to find personalized offers that best fit your needs.',
    fields: [
      F({ id: 'income', type: 'slider', min: 1000, max: 200000, step: 1000, def: 50000, minLabel: '$1,000', maxLabel: '$200K+', ask: "What's your individual annual income, before taxes?", parse: (t) => { const n = parseMoney(t); return n && n >= 1000 ? Math.min(n, 200000) : null; }, err: 'About how much do you make in a year, before taxes? A rough number is fine.' }),
      F({ id: 'coIncome', type: 'slider', optional: true, min: 0, max: 200000, step: 1000, def: 0, minLabel: '$0', maxLabel: '$200K+', label: 'Add co-applicant income', tag: 'Optional', help: 'Adding a co-applicant can help you qualify for a loan and may result in a lower rate.' }),
    ],
    summary: (a) => money(a.income) + ' a year' + (Number(a.coIncome) > 0 ? ' (plus ' + money(a.coIncome) + ' co-applicant)' : ''),
  },
  {
    id: 'name', group: 'you', label: 'Name and birthday', secs: 40,
    q: "Let's get to know you",
    sub: "Viewing your rate won't affect your credit score.",
    fields: [
      F({ id: 'first', type: 'text', label: 'First Name', ph: 'First Name', autocomplete: 'given-name' }),
      F({ id: 'last', type: 'text', label: 'Last Name', ph: 'Last Name', autocomplete: 'family-name' }),
      F({ id: 'dob', type: 'dob', label: 'Date of Birth', ph: 'mm / dd / yyyy', sensitive: true }),
    ],
    askAll: { ask: "What's your first and last name?", parse: parseName, err: "Could you send your first and last name? For example, Jordan Smith." },
    summary: (a) => a.first + ' ' + a.last + (a.dob ? ', born ' + a.dob : ''),
  },
  {
    id: 'address', group: 'you', label: 'Home address', secs: 45,
    q: "What's your home address?",
    sub: "Providing your home address helps us confirm it's really you.",
    fields: [
      F({ id: 'street', type: 'text', label: 'Street Address', ph: 'Street Address', autocomplete: 'address-line1' }),
      F({ id: 'apt', type: 'text', label: 'Apartment, suite, etc (optional)', ph: '', optional: true, autocomplete: 'address-line2' }),
      F({ id: 'city', type: 'text', label: 'City', ph: 'City', autocomplete: 'address-level2' }),
      F({ id: 'state', type: 'state', label: 'State', autocomplete: 'address-level1' }),
      F({ id: 'zip', type: 'zip', label: 'ZIP Code', ph: '', autocomplete: 'postal-code' }),
    ],
    askAll: { ask: "What's your home address? Please send it as street, city, state ZIP.", parse: parseAddress, err: 'I need it as: street, city, state and ZIP. For example: 123 Main St, Lehi, UT 84043.' },
    summary: (a) => [a.street, a.apt, a.city + ', ' + a.state + ' ' + a.zip].filter(Boolean).join(', '),
  },
  {
    id: 'phone', group: 'you', label: 'Phone number', secs: 25,
    q: "What's your contact info",
    secure: 'We keep your personal information secure.',
    fields: [F({ id: 'phone', type: 'tel', label: 'Phone Number', ph: '(___) ___-____', autocomplete: 'tel', ask: "What's the best mobile number to reach you?", parse: parsePhone, err: 'That number looks short. Could you send the 10 digits?' })],
    consent: 'By providing your phone number above, and clicking on "Next" below, you are agreeing to the following E-Sign Consent, Achieve Privacy Policy, Cross River Bank Privacy Notice, Privacy Policy, Terms of Use, as well as providing express written consent to receive calls, texts, and recorded messages as described below.',
    summary: (a) => a.phone,
  },
  {
    id: 'email', group: 'you', label: 'Email', secs: 25,
    q: 'Last step to see your offer!',
    sub: 'We need this information to find personalized offers that best fit your needs.',
    fields: [F({ id: 'email', type: 'email', label: 'Email Address', ph: 'example@email.com', autocomplete: 'email', ask: "What's your email address?", parse: parseEmail, err: "That doesn't look like an email address. Could you try again?" })],
    consent: 'By clicking "Next" below, you are providing written instructions to have information from your credit report obtained and accessed as described below.',
    after: 'Your credit score will not be impacted.',
    summary: (a) => a.email,
  },
  {
    id: 'housing', group: 'finances', label: 'Home and address', secs: 40,
    q: 'Just a few more details',
    sub: 'We have almost everything we need to move forward. Please provide any missing details to proceed.',
    section: 'Home and Address',
    fields: [
      F({ id: 'housing', type: 'select', label: 'Housing Information', options: HOUSING, ph: 'Select', ask: 'Which best describes your housing: 1) I own and pay a mortgage, 2) I own free and clear, 3) I rent, 4) Other?', parse: parseHousing, err: 'Reply 1 if you own with a mortgage, 2 if you own free and clear, 3 if you rent, or 4 for other.' }),
      F({ id: 'housingPayment', type: 'money', label: 'Monthly housing payment', ph: '$', help: 'Enter your monthly housing expense.', ask: 'And roughly what is your monthly housing payment?', parse: (t) => { const n = parseMoney(t); return n === null ? null : n; }, err: 'About how much do you pay each month for housing?' }),
    ],
    summary: (a) => (HOUSING.find((h) => h[0] === a.housing) || ['', ''])[1] + ', ' + money(a.housingPayment) + '/mo',
  },
  {
    id: 'work', group: 'finances', label: 'Work and income', secs: 40,
    q: 'Where do you work?',
    sub: 'We use this to confirm your income.',
    section: 'Work and Income',
    fields: [
      F({ id: 'employer', type: 'text', label: 'Employer', ph: 'Employer', ask: 'Who is your employer?', parse: (t) => { const s = String(t || '').trim(); return s.length > 1 ? s.slice(0, 80) : null; }, err: 'What company do you work for?' }),
      F({ id: 'employment', type: 'select', label: 'Employment type', options: EMPLOYMENT.map((e) => [e, e]), ph: 'Select', def: 'Full-Time', ask: 'Is that full-time, part-time, self-employed, or something else?', parse: parseEmployment, err: 'Full-time, part-time, self-employed, retired or other?' }),
    ],
    summary: (a) => a.employer + ', ' + (a.employment || 'Full-Time'),
  },
  {
    id: 'boost', group: 'finances', label: 'Boost your chances', secs: 35,
    q: 'Boost your chances of getting approved!',
    sub: 'Fill out this section and you may also qualify for extra interest rate savings.',
    fields: [
      F({ id: 'payoff', type: 'slider', label: 'Funds to credit cards & loans', sublabel: 'Your payoff amount', min: 0, max: 'amount', step: 500, def: 'amount', minLabel: '0%', maxLabel: '100%', ask: 'How much of the loan would go toward paying off credit cards or other loans? Say "skip" if none.', parse: (t) => (isSkip(t) ? 0 : parseMoney(t)), err: 'A dollar amount is perfect, or say "skip".' }),
      F({ id: 'retirement', type: 'slider', label: 'Retirement savings', sublabel: 'Your current retirement savings', min: 0, max: 100000, step: 1000, def: 0, minLabel: '$0', maxLabel: '$100K+', note: "Please only enter assets that we can verify. Retirement assets won't be used as collateral for the loan.", ask: 'About how much do you have in retirement savings? Say "skip" if none.', parse: (t) => (isSkip(t) ? 0 : parseMoney(t)), err: 'A rough dollar amount is fine, or say "skip".' }),
    ],
    summary: (a) => 'Payoff ' + money(a.payoff) + ', retirement ' + money(a.retirement),
  },
  {
    id: 'review', group: 'verify', label: 'Review', secs: 40,
    q: 'Please review your information',
    sub: 'Please take a moment to review and ensure all the information is correct. To be eligible for a loan with Achieve Personal Loans, you must be 18+, a US citizen and/or permanent resident, and have a verifiable bank account.',
    fields: [], review: true,
    ask: 'Here is what I have so far. Does everything look right? Reply "yes" to confirm, or tell me what to change.',
    summary: () => 'Looks good',
  },
  {
    id: 'ssn', group: 'verify', label: 'Verification', secs: 30,
    q: 'Verification',
    sub: 'Your Social Security number lets us check your credit and confirm your identity.',
    fields: [F({ id: 'ssn', type: 'ssn', label: 'Social Security Number', ph: 'Social Security Number', sensitive: true, help: 'Your data is safe and encrypted.' })],
    consent: 'By selecting "Proceed" below, you are providing written instructions to have information from your credit report obtained and accessed as described below.',
    submitLabel: 'Proceed',
    summary: () => 'Social Security number provided',
  },
  {
    id: 'docs', group: 'docs', label: 'Upload documents', secs: 120,
    q: 'Next, a few documents',
    sub: 'These help us verify your income and identity so we can finish your application.',
    fields: [], docs: true, sensitive: true,
    summary: (a, s) => { const n = s && s.documents ? s.documents.filter((d) => d.status !== 'removed').length : 0; return n ? n + (n === 1 ? ' document received' : ' documents received') : "I'll upload my documents later"; },
  },
  {
    id: 'offers', group: 'offers', label: 'Choose your offer', secs: 60,
    q: 'Here are your Achieve options',
    sub: 'Compare them side by side, ask me anything, then choose the one that fits.',
    fields: [], offers: true, sensitive: true,
    summary: () => 'Offer selected',
  },
];

export const stepById = (id) => STEPS.find((s) => s.id === id);
export const stepIndex = (id) => STEPS.findIndex((s) => s.id === id);
export const stepsInGroup = (g) => STEPS.filter((s) => s.group === g);

/* Which words in a sentence mean "take me to this step". Used by the chat in the web flow. */
const NAV = [
  ['amount', /\b(loan amount|how much|amount)\b/], ['purpose', /\b(purpose|what.*loan for|reason)\b/],
  ['income', /\b(income|salary|pay)\b/], ['name', /\b(name|birthday|birth|dob)\b/], ['address', /\baddress\b/],
  ['phone', /\b(phone|number|mobile|contact)\b/], ['email', /\bemail\b/], ['housing', /\b(housing|rent|mortgage|home and)\b/],
  ['work', /\b(work|employer|job)\b/], ['boost', /\b(boost|payoff|retirement|co-?applicant)\b/], ['review', /\breview\b/],
  ['ssn', /\b(ssn|social security|verification|verify)\b/], ['docs', /\b(documents?|upload|paystub|w-?2)\b/], ['offers', /\b(offers?|options|rates?)\b/],
];
export function parseNavigate(text) {
  const t = String(text || '').toLowerCase();
  if (!/\b(skip|jump|go to|go back|take me|change|edit|update|fix|show me|let'?s do)\b/.test(t)) return null;
  for (const [id, re] of NAV) if (re.test(t)) return { stepId: id, edit: /\b(change|edit|update|fix|go back)\b/.test(t) };
  return null;
}

/* ---------- validation (web form) ---------- */
export function validateField(f, v, a) {
  const empty = v === undefined || v === null || String(v).trim() === '';
  if (empty) return f.optional ? '' : 'Required';
  if (f.type === 'email' && !parseEmail(v)) return 'Enter a valid email address';
  if (f.type === 'tel' && digits(v).replace(/^1(?=\d{10}$)/, '').length !== 10) return 'Enter a 10-digit phone number';
  if (f.type === 'zip' && !/^\d{5}$/.test(String(v))) return 'Enter a 5-digit ZIP code';
  if (f.type === 'dob') {
    const d = digits(v);
    if (d.length !== 8) return 'Use mm/dd/yyyy';
    const mm = +d.slice(0, 2), dd = +d.slice(2, 4), yy = +d.slice(4);
    const dt = new Date(yy, mm - 1, dd);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || dt.getMonth() !== mm - 1) return 'Enter a valid date';
    const age = (Date.now() - dt.getTime()) / 31557600000;
    if (age < 18) return 'You must be 18 or older';
    if (age > 110) return 'Enter a valid date';
  }
  if (f.type === 'ssn' && digits(v).length !== 9) return 'Enter all 9 digits';
  if (f.type === 'money' && !(Number(String(v).replace(/[^0-9.]/g, '')) >= 0)) return 'Enter an amount';
  return '';
}
export function validateStep(step, values) {
  const errs = {};
  for (const f of step.fields || []) {
    const e = validateField(f, values[f.id], values);
    if (e) errs[f.id] = e;
  }
  return errs;
}
export function fieldMax(f, a) { return f.max === 'amount' ? Number(a.amount) || 20000 : f.max; }
export function fieldDefault(f, a) { return f.def === 'amount' ? Number(a.amount) || 20000 : f.def; }

/* ---------- time estimate ----------
   "About N mins left" counts the application itself, up to and including verification (like Achieve's own
   "About 4 mins left" on the first screens). Documents and offers come after; minsAway includes the documents. */
const COUNTED = (s) => s.id !== 'offers' && s.id !== 'docs';
export function secsLeft(doneIds) {
  const done = new Set(doneIds);
  return STEPS.filter((s) => COUNTED(s) && !done.has(s.id)).reduce((t, s) => t + s.secs, 0);
}
export function secsToOffers(doneIds) {
  const done = new Set(doneIds);
  return STEPS.filter((s) => s.id !== 'offers' && !done.has(s.id)).reduce((t, s) => t + s.secs, 0);
}
export function minsLabel(secs, doneIds) {
  if (secs <= 0) return doneIds && doneIds.indexOf('docs') < 0 ? 'Next: your documents' : 'Ready to choose an offer';
  if (secs < 60) return 'Less than 1 min left';
  const m = Math.ceil(secs / 60);
  return 'About ' + m + (m === 1 ? ' min' : ' mins') + ' left';
}
export function minsAway(secs) {
  if (secs < 60) return 'under a minute';
  const m = Math.ceil(secs / 60);
  return m + (m === 1 ? ' minute' : ' minutes');
}
