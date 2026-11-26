/* Visiontype C (embedded): every word and every step definition lives here, so the wording is easy to edit.
   The engine (app.js) reads these and never hard-codes copy. Sample data comes from ./data.js and ../shared/data.js. */
import { PERSON, BRAND, money } from '../shared/data.js';
import { MARKET, GOOGLE_PROFILE, SEARCH, FINANCE, APPLICANT, CURRENT_POLICY, CURRENT_WITH_TACOMA, ADD_TO_CURRENT, DELIVERY, LENDERS_CHECKED, CARRIERS_CHECKED } from './data.js?v=1';

const M = MARKET.name;
const LT = BRAND.name;
const pct = (n) => `${n.toFixed(2)}%`;

/* ---------- prototype chrome (outside the product) ---------- */
export const PROTO = {
  back: 'Back to the slides',
  note: 'Prototype controls. Not part of the product.',
  jumpLabel: 'Jump to',
  jumps: { shop: 'Shopping', finance: 'Financing', insurance: 'Insurance', review: 'Review' },
  restart: 'Start over',
  fiction: `A concept prototype with sample data. ${M} is an invented marketplace, and every person, vehicle, offer and quote is fictional.`,
  google: 'The Google connection is simulated. There is no real sign-in, and nothing leaves this page.',
  autoOn: 'Auto-play is on. Pause', autoOff: 'Auto-play is paused. Play', controls: 'Prototype controls',
  theEnd: {
    title: 'That is the whole purchase.',
    body: `A truck, a loan and an insurance policy, without ever leaving the marketplace. ${LT} did the lending and the insurance from inside it.`,
    self: 'Play with it yourself', restart: 'Restart', others: 'See the other visiontypes', othersHref: '/lendingtree/getting-started/#visiontypes',
  },
};

/* ---------- marketplace shell ---------- */
export const SHELL = {
  nav: [{ id: 'shop', label: 'Shop' }, { id: 'sell', label: 'Sell or trade' }, { id: 'finance', label: 'Financing' }, { id: 'how', label: 'How it works' }],
  navElsewhere: 'That page is outside this demo. Shopping and checkout are all here.',
  logoLabel: `${M}, back to search results`,
  near: SEARCH.near, saved: 'Saved', signIn: 'Sign in', secure: 'Secure checkout', help: `Help: ${MARKET.support}`,
  exitCheckout: 'Back to the listing',
  footer: { line: `© ${new Date().getFullYear()} ${M}, Inc. ${MARKET.tagline}.`, links: ['Privacy', 'Terms', 'Licenses'], },
  url: {
    search: `${MARKET.domain}/trucks/toyota-tacoma?near=${SEARCH.zip}`,
    detail: (c) => `${MARKET.domain}/vehicle/${c.year}-toyota-tacoma-${c.trim.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${c.stock}`,
    checkout: (c, step) => `${MARKET.domain}/checkout/${c.stock}/${step}`,
    done: (n) => `${MARKET.domain}/orders/${n}`,
  },
  credit: { loan: `Financing by ${LT}`, insurance: `Insurance by ${LT}`, qw: BRAND.insuranceCredit },
};

/* ---------- search results ---------- */
export const SEARCH_T = {
  field: `${SEARCH.make} ${SEARCH.model}`, searchLabel: 'Search make, model or keyword', go: 'Search',
  title: `Used ${SEARCH.make} ${SEARCH.model} near ${SEARCH.near}`,
  count: (shown) => `${shown} of ${SEARCH.total} trucks, sorted by`,
  sorts: [['best', 'Best match'], ['price', 'Lowest price'], ['miles', 'Lowest mileage'], ['year', 'Newest']],
  sortLabel: 'Sort by',
  filters: 'Filters', clear: 'Clear all',
  groups: { trim: 'Trim', drive: 'Drivetrain', price: 'Price', miles: 'Mileage' },
  price: [['any', 'Any price'], ['30000', 'Under $30,000'], ['36000', 'Under $36,000'], ['40000', 'Under $40,000']],
  miles: [['any', 'Any mileage'], ['30000', 'Under 30,000 miles'], ['50000', 'Under 50,000 miles']],
  delivery: `Free delivery to ${SEARCH.zip}`,
  est: (n) => `Est. ${money(n)}/mo`,
  milesShort: (n) => `${Math.round(n / 1000)}K mi`,
  below: (n) => `${money(n)} below market`,
  save: 'Save', saved: 'Saved', savedToast: 'Saved to your list.', unsavedToast: 'Removed from your list.',
  empty: { title: 'No trucks match those filters', body: 'Try widening the price or mileage, or clear the filters.', cta: 'Clear filters' },
  more: `Showing the closest matches. ${SEARCH.total - 6} more ship from farther away.`,
  chips: { delivery: 'Free delivery', history: 'Clean history' },
};

/* ---------- vehicle detail ---------- */
export const DETAIL_T = {
  crumbs: ['Trucks', `${SEARCH.make} ${SEARCH.model}`],
  backToResults: 'Back to results',
  photoCount: (i, n) => `${i} of ${n}`, prev: 'Previous photo', next: 'Next photo', photo: (i) => `Show photo ${i}`,
  sub: (c) => `${c.body} · ${c.drive} · ${c.miles.toLocaleString('en-US')} miles`,
  est: (n) => `Est. ${money(n)}/mo`,
  estNote: (down, term, apr) => `with ${money(down)} down, ${term} months at ${apr}% APR. Your rate may differ.`,
  estCredit: `Financing by ${LT}`,
  below: (n) => `${money(n)} below market average`, above: 'In line with the market',
  cta: 'Start purchase', hold: 'Takes about 10 minutes. Nothing is final until you place the order.',
  perks: [
    ['truck', (when) => `Free delivery to ${SEARCH.near} as soon as ${when}`],
    ['return', `${DELIVERY.returnDays}-day money back guarantee, up to ${DELIVERY.returnMiles} miles`],
    ['shield', '150-point inspection, with a 100-day limited warranty'],
  ],
  specsTitle: 'Key specs',
  specs: (c) => [['Mileage', `${c.miles.toLocaleString('en-US')} miles`], ['Drivetrain', c.drive === '4WD' ? 'Four-wheel drive' : 'Rear-wheel drive'], ['Engine', c.engine], ['Transmission', c.transmission], ['Exterior', c.color], ['Interior', c.interior], ['Fuel economy', c.mpg], ['Cab and bed', `${c.body}, ${c.bed}`], ['Stock number', c.stock], ['VIN', `Ends in ${c.vinTail}`]],
  historyTitle: 'Vehicle history', historyNote: 'Full report included with every vehicle.',
  historyBasic: [{ title: 'No accidents reported', sub: 'Checked against national records' }, { title: 'Clean title', sub: 'No liens, floods or buybacks' }],
  featuresTitle: 'Features', featuresMore: (n) => `Show all ${n} features`, featuresLess: 'Show fewer',
  featuresBasic: ['Apple CarPlay and Android Auto', 'Backup camera', 'Bluetooth', 'Lane departure alert', 'Adaptive cruise control', 'Bed liner'],
  inspectTitle: `${M} certified`, inspect: 'Inspected, serviced and detailed at our Aurora hub. Two keys, owner’s manual and floor mats included.',
  mobileCta: 'Start purchase',
};

/* ---------- the purchase flow ---------- */
export const STEPS = [
  { id: 'details', label: 'Your details', short: 'Details' },
  { id: 'trade', label: 'Trade-in', short: 'Trade-in' },
  { id: 'payment', label: 'Payment', short: 'Payment' },
  { id: 'insurance', label: 'Insurance', short: 'Insurance' },
  { id: 'delivery', label: 'Delivery or pickup', short: 'Delivery' },
  { id: 'review', label: 'Review and place order', short: 'Review' },
];
export const FLOW_T = {
  stepOf: (i, n) => `Step ${i} of ${n}`, back: 'Back', next: 'Continue', edit: 'Edit', change: 'Change',
  progress: 'Purchase steps',
};

export const SUMMARY_T = {
  title: 'Order summary', toggle: 'Order summary', show: 'Show', hide: 'Hide',
  price: 'Vehicle price', tax: 'Sales tax (7.25%)', titleReg: 'Title and registration', doc: 'Documentation fee', delivery: 'Delivery', free: 'Free', pickup: 'Pickup',
  total: 'Total', tradeLater: 'Trade-in', tradeLaterV: 'Valued before delivery',
  payTitle: 'Payment', payPending: 'Chosen in the Payment step',
  cash: 'Paid in full', own: 'Your own lender', ownV: (n) => n,
  down: 'Down payment', financed: 'Amount financed', apr: 'APR', term: 'Term', months: (n) => `${n} months`, monthly: 'Monthly payment', lender: 'Lender', perMo: '/mo',
  dueToday: 'Due at delivery', dueNote: 'Nothing is charged until you place the order.',
  insTitle: 'Insurance', insPending: 'Proof of insurance needed before delivery',
  insBoth: 'Both vehicles', insAdded: 'Tacoma added', perYear: '/yr',
  estimate: 'Estimated payment', estimateNote: 'Until you pick an offer',
};

/* Step 1: details, with the simulated Google account chooser. */
export const DETAILS_T = {
  title: 'First, who is buying?', sub: 'We use this for your paperwork, your registration and delivery updates.',
  google: 'Continue with Google', or: 'or', manual: 'Enter my details myself',
  why: 'Signing in fills in your name, email and phone, so there is less to type.',
  fromGoogle: 'From Google', signedIn: (email) => `Signed in as ${email}`,
  confirmTitle: 'Check your details', confirmSub: 'Edit anything that is not right.',
  fields: { name: 'Full legal name', email: 'Email', phone: 'Mobile phone' },
  addressTitle: 'Home address', addressSub: 'For your registration, and where we deliver unless you say otherwise.',
  addressLabel: 'Street address', addressPlaceholder: 'Start typing your address', addressPick: 'Choose an address',
  addressOk: 'Address confirmed', addressType: PERSON.address.slice(0, 9),
  cta: 'Continue to trade-in',
};
export const GOOGLE_T = {
  heading: 'Sign in with Google', choose: 'Choose an account', to: `to continue to ${M}`,
  other: 'Use another account', otherNote: 'This demo has one sample account. You can also enter your details yourself.',
  consentTitle: `${M} wants access to your Google Account`,
  consentLead: `This lets ${M} see your:`,
  scopes: ['Name and profile picture', 'Email address', 'Phone number'],
  consentFine: `You can review what ${M} can see in your Google Account at any time.`,
  cancel: 'Cancel', allow: 'Continue', close: 'Close',
  simulated: 'Simulated for this prototype. No real sign-in happens.',
  working: 'Signing you in…',
};

/* Step 2: trade-in. */
export const TRADE_T = {
  title: 'Do you have a vehicle to trade in?', sub: 'A trade-in lowers what you pay and, in Illinois, the sales tax too.',
  options: [
    { id: 'skip', title: 'Skip for now', sub: 'You can add one any time before delivery.' },
    { id: 'later', title: 'Yes, I have a trade-in', sub: 'We will value it before delivery.' },
  ],
  laterNote: 'Good to know. We will email you a link to add photos and mileage, and your advisor will send an offer within a day. Your order total is adjusted before you pay anything.',
  cta: 'Continue to payment',
};

/* Step 3: payment, and the LendingTree financing module inside it. */
export const PAY_T = {
  title: 'How would you like to pay?', sub: (total) => `Your total is ${money(total)}, including taxes and fees.`,
  options: [
    { id: 'lt', title: `Finance with ${M}`, credit: `powered by ${LT}`, sub: 'Compare real offers from top lenders in about two minutes. No effect on your credit to look.', badge: 'Most popular' },
    { id: 'own', title: 'Bring your own financing', sub: 'Use a loan from your bank or credit union.' },
    { id: 'cash', title: 'Pay in full', sub: 'Bank transfer or cashier’s check.' },
  ],
  cash: {
    title: 'Pay in full',
    body: (total) => `You will pay ${money(total)} by bank transfer or cashier’s check. We will email wire instructions when you place the order, and payment is due before delivery.`,
    cta: 'Continue to insurance', summary: (total) => `${money(total)} by bank transfer or cashier’s check`,
  },
  own: {
    title: 'Your own financing', body: 'Tell us who your lender is. We will send them a purchase order and work out the paperwork with them directly.',
    label: 'Lender name', placeholder: 'For example, your credit union', sample: 'Lakeshore Credit Union',
    cta: 'Continue to insurance', summary: (n) => `Financed through ${n}`,
  },
  saved: { title: `Your ${LT} application is saved`, body: 'Nothing has been submitted, and nothing here has touched your credit.', resume: 'Pick up where I left off' },
  done: { title: 'Payment is set', change: 'Change how I pay', cta: 'Continue to insurance' },
};

export const FIN_STEPS = [
  { id: 'have', label: 'What we have' },
  { id: 'terms', label: 'Down payment and term' },
  { id: 'income', label: 'Income' },
  { id: 'housing', label: 'Housing' },
  { id: 'consent', label: 'Credit check' },
  { id: 'offers', label: 'Your offers' },
  { id: 'stips', label: 'Final items' },
  { id: 'sign', label: 'Sign' },
];
export const FIN = {
  secure: 'Encrypted', stepOf: (i, n) => `${i} of ${n}`, back: 'Back', ask: 'Ask a question',
  foot: `${LT} compares lenders for you and is paid by the lender you choose, never by you.`,
  have: {
    title: 'Most of your application is already done',
    sub: `${M} and your Google account shared what they know, so you only fill in the rest.`,
    haveTitle: 'Already here', needTitle: 'Still needed',
    rows: (d, car, total) => [
      ['You', d.name, 'Google'], ['Contact', `${d.email} · ${d.phone}`, 'Google'], ['Address', d.address, M],
      ['Vehicle', `${car.year} ${car.make} ${car.model} ${car.trim}, ${car.miles.toLocaleString('en-US')} miles`, M], ['Price with taxes and fees', money(total), M],
    ],
    profile: `You also have a ${LT} profile under this email, so your credit profile and current policies are on file.`,
    needs: ['Down payment and how long you want to pay', 'Income and employment', 'Your housing payment', 'Your OK for a soft credit check'],
    time: 'About two minutes', cta: 'Get started',
  },
  terms: {
    title: 'How much down, and for how long?', sub: 'You can change both when you see real offers.',
    downLabel: 'Down payment', downAria: 'Down payment in dollars', termLabel: 'How long would you like to pay?', months: (n) => `${n} months`,
    estTitle: 'Estimated payment', estNote: (apr) => `At about ${apr}% APR, typical for your credit profile. Real offers come next.`,
    financed: 'Amount financed', perMo: '/mo', cta: 'Continue',
  },
  income: {
    title: 'Your income', sub: 'Lenders use this to size your offer. Type it in, or connect payroll and skip the typing.',
    statusLabel: 'Employment', statuses: ['Employed full time', 'Self-employed', 'Retired or other'],
    employerLabel: 'Employer', employerPh: 'Company name', incomeLabel: 'Yearly income before taxes', incomePh: '0',
    or: 'or', verify: 'Verify with payroll instead', verifying: 'Connecting to your payroll provider…',
    verified: (emp, inc) => `Verified with payroll: ${emp}, ${money(inc)} a year`, verifiedTag: 'Verified',
    verifyNote: 'A secure connection reads your employer and pay. Nothing else.',
    cta: 'Continue',
  },
  housing: {
    title: 'Your housing payment', sub: 'One number, so lenders can see what else you pay each month.',
    statusLabel: 'Do you own or rent?', statuses: ['Own, with a mortgage', 'Own, paid off', 'Rent'],
    payLabel: 'Monthly mortgage or rent', none: 'No monthly payment', cta: 'Continue',
  },
  consent: {
    title: 'One soft credit check', sub: 'This is how lenders give you real rates and not guesses.',
    safe: 'A soft check does not affect your credit score, and lenders cannot see it.',
    dob: 'Date of birth', ssn: 'Last four of your Social Security number', sample: 'Sample',
    sampleNote: 'These two fields are filled with sample values. This prototype never asks for real ones.',
    agree: `I agree to let ${LT} check my credit with a soft inquiry and share my application with lenders to get offers.`,
    cta: 'Check my rates',
  },
  checking: {
    title: 'Checking with lenders', sub: 'This usually takes a few seconds.',
    lines: [(score) => `Soft credit check complete. Score ${score}`, 'Sharing your application with lenders', 'Collecting offers'],
    names: LENDERS_CHECKED,
  },
  offers: {
    title: (n) => `${n} lenders approved you`, sub: (financed) => `Each offer is for ${money(financed)} and is ready to sign. No effect on your credit so far.`,
    apr: 'APR', perMo: '/mo', term: (n) => `${n} months`, interest: 'Total interest', total: 'Total of payments', first: (d) => `First payment in ${d} days`,
    choose: 'Choose', chosen: 'Chosen', rec: 'Advisor pick',
    compareTitle: 'Side by side', cols: ['Lender', 'APR', 'Term', 'Monthly', 'Total interest'],
    barTitle: 'Total interest over the loan', barNote: 'Shorter is better',
    advisorName: `${LT} advisor`,
    advisor: {
      bofa: (n) => `You asked for ${n.term} months to keep the payment low. Bank of America does that at ${pct(n.bofa.apr)}, for ${money(n.bofa.payment)} a month. Chase has a lower rate over 60 months and would save you ${money(n.bofa.interest - n.chase.interest)} in interest, but it costs ${money(n.chase.payment - n.bofa.payment)} more each month. If the monthly number matters most, I would take Bank of America. There is no penalty for paying extra.`,
      chase: (n) => `You asked for a shorter loan. Chase has the lowest rate at ${pct(n.chase.apr)} over 60 months, for ${money(n.chase.payment)} a month, and the least interest overall: ${money(n.bofa.interest - n.chase.interest)} less than Bank of America. If you would rather have the smaller payment, Bank of America is ${money(n.chase.payment - n.bofa.payment)} a month lower.`,
    },
    adjust: 'Change down payment or term',
  },
  stips: {
    title: (o) => `Final items for ${o.lender}`, count: (n, t) => `${n} of ${t} done`,
    items: {
      identity: { title: 'Confirm your identity', working: 'Matching your details…', done: 'Matched to your Google account and your credit file' },
      income: {
        title: 'Verify your income', body: (o) => `${o.lender} needs to confirm the income you entered. Connecting payroll takes a few seconds, with no pay stubs to find.`,
        cta: 'Connect payroll', working: 'Checking with your payroll provider…', done: (emp, inc) => `${money(inc)} a year at ${emp}, verified`, already: (emp, inc) => `${money(inc)} a year at ${emp}, already verified with payroll`,
      },
      insurance: { title: 'Proof of insurance', tag: 'Next step', note: (o) => `${o.lender} needs to see the truck is insured before delivery. That is the next step of your purchase, and we will send the proof for you.` },
    },
    approved: (o) => `${o.lender} has approved everything. All that is left is your signature.`,
    cta: 'Review and sign',
  },
  sign: {
    title: 'Your loan agreement, in plain language', sub: (o) => `${o.lender} auto loan, arranged by ${LT}`,
    terms: (o, n, car, down) => [
      ['What you borrow', `${money(n.financed)} to buy the ${car.year} ${car.make} ${car.model} ${car.trim}, after your ${money(down)} down payment.`],
      ['What it costs', `${pct(o.apr)} APR, fixed. ${o.term} payments of ${money(n.payment)} a month. Over the whole loan you pay ${money(n.interest)} in interest.`],
      ['Fees', `${o.fee}. No penalty for paying it off early or paying extra.`],
      ['When you pay', `Your first payment is due ${o.firstPayment} days after delivery. ${o.perk}.`],
      ['What secures it', `The truck. ${o.lender} holds the title until the loan is paid. If you return the truck within ${DELIVERY.returnDays} days, the loan is cancelled.`],
    ],
    fullLabel: 'Read the full agreement', full: 'The complete retail installment contract would open here, with each section linked to the plain-language summary above.',
    nameLabel: 'Type your full name to sign', cta: 'Sign and apply to my purchase', signing: 'Sending to your lender…',
  },
  approved: {
    title: 'Approved and applied to your purchase',
    body: (o) => `Your ${o.lender} loan is signed. The order summary now shows what you will actually pay.`,
    facts: (o, n) => [['Amount financed', money(n.financed)], ['Rate', `${pct(o.apr)} APR`], ['Payment', `${money(n.payment)} a month`]],
    cta: 'Continue to insurance', line: (o, n) => `${o.lender} · ${pct(o.apr)} APR · ${money(n.payment)} a month for ${o.term} months`,
  },
};

/* Step 4: insurance, also by LendingTree. */
export const INS = {
  ask: 'Ask a question',
  foot: `${LT} shops insurance through QuoteWizard and is paid by the carrier you choose, never by you.`,
  saved: { title: 'Your insurance choice is saved for later', body: 'Nothing has changed on your Progressive policy.', resume: 'Pick up where I left off' },
  prompt: {
    title: (car) => `You need proof of insurance to drive it home. Should we add the ${car.model} to your ${CURRENT_POLICY.carrier} policy?`,
    sub: `Your current policy is on file with ${LT}, so there are no forms either way.`,
    currentTitle: 'Your policy today', currentRows: [['Covers', CURRENT_POLICY.covers], ['You pay', `${money(CURRENT_POLICY.premium)} a year`], ['Renews', CURRENT_POLICY.renews]],
    options: [
      { id: 'add', title: `Add it to ${CURRENT_POLICY.carrier}`, sub: `Your premium becomes ${money(CURRENT_WITH_TACOMA.total)} a year, ${money(ADD_TO_CURRENT)} more than today.`, cta: `Add it to ${CURRENT_POLICY.carrier}` },
      { id: 'shop', title: 'Shop it around', sub: 'See what other carriers would charge for both vehicles. Takes a few seconds.', cta: 'Shop it around', badge: 'Could save you money' },
    ],
  },
  adding: { title: (car) => `Adding the ${car.model} to your ${CURRENT_POLICY.carrier} policy`, lines: [`Contacting ${CURRENT_POLICY.carrier}`, 'Adding the vehicle and matching your coverage', 'Getting your new ID card'] },
  added: {
    title: (car) => `The ${car.model} is on your ${CURRENT_POLICY.carrier} policy`,
    body: 'Coverage starts the day it is delivered. Proof of insurance goes to us and to your lender for you.',
    rows: [['New premium', `${money(CURRENT_WITH_TACOMA.total)} a year`], ['Change', `${money(ADD_TO_CURRENT)} more a year`], ['Coverage', `${CURRENT_POLICY.liability} liability, ${money(CURRENT_POLICY.deductible)} deductible`]],
    reshop: 'Shop it around instead', cta: 'Continue to delivery',
    line: `${CURRENT_POLICY.carrier} · ${money(CURRENT_WITH_TACOMA.total)} a year for both vehicles`,
  },
  checking: { title: 'Getting quotes for both vehicles', sub: (car) => `The ${car.model} and your ${CURRENT_POLICY.covers}, with the same drivers and address.`, names: CARRIERS_CHECKED },
  quotes: {
    title: 'Moving both vehicles would save you money',
    sub: (car) => `Yearly price to insure the ${car.model} and the Highlander together, next to ${CURRENT_POLICY.carrier} with the ${car.model} added.`,
    nowTag: 'If you stay', perYear: 'a year', save: (n) => `Save ${money(n)} a year`, same: 'What you would pay',
    split: (car, q) => `${car.model} ${money(q.tacoma)} · Highlander ${money(q.highlander)}`,
    cover: (q) => `${q.liability} liability · ${money(q.deductible)} deductible`,
    choose: (q) => `Switch to ${q.carrier}`, rec: 'Advisor pick',
    barTitle: 'Both vehicles, per year',
    advisorName: `${LT} advisor`,
    advisor: (rec, low, car) => `${rec.carrier} covers both vehicles for ${money(rec.total)} a year, ${money(rec.saving)} less than staying with ${CURRENT_POLICY.carrier}, with higher liability limits and half the deductible. It also bundles with the home policy you already have there. ${low.carrier} is ${money(rec.total - low.total)} a year cheaper, with the liability limits you have today. I would move both to ${rec.carrier}.`,
    stay: `Keep ${CURRENT_POLICY.carrier} and add the Tacoma`, stayNote: (n) => `${money(n)} a year`,
  },
  when: { card: 'Delivery day' },
  confirm: {
    title: (q) => `Switch both vehicles to ${q.carrier}`, sub: 'Here is exactly what happens. You do not need to call anyone.',
    steps: (q, car, refund) => [
      ['Your new policy', `${q.carrier} covers the ${car.model} and the Highlander from the day your truck arrives. ${money(q.total)} a year, or ${money(Math.round(q.total / 12))} a month.`],
      ['Your old policy', `We cancel ${CURRENT_POLICY.carrier} for you on the same day, so there is no gap and no overlap. ${CURRENT_POLICY.carrier} refunds the unused part, about ${money(refund)}.`],
      ['Proof of insurance', `We send it to ${M} and to your lender. Your ID cards arrive by email in a minute.`],
    ],
    coverage: (q) => [['Liability', q.liability], ['Deductible', money(q.deductible)], ['Drivers', `${PERSON.first} ${PERSON.last}`], ['Vehicles', '2']],
    agree: (q) => `I authorize ${LT} to start this ${q.carrier} policy and cancel my ${CURRENT_POLICY.carrier} policy on the same date.`,
    cta: 'Switch and bind', back: 'Back to quotes',
  },
  binding: { title: (q) => `Binding your ${q.carrier} policy`, lines: (q) => [`Starting your ${q.carrier} policy`, `Scheduling your ${CURRENT_POLICY.carrier} cancellation`, `Sending proof of insurance to ${M} and your lender`] },
  bound: {
    title: 'You are covered', body: (q) => `Your ${q.carrier} policy is bound and starts the day your truck arrives. Both vehicles are on it.`,
    rows: (q, refund, lender) => [
      ['New policy', `${q.carrier}, ${money(q.total)} a year for both vehicles`],
      ['Old policy', `${CURRENT_POLICY.carrier} cancels the same day. About ${money(refund)} comes back to you.`],
      ['Proof of insurance', lender ? `Sent to ${M} and ${lender}` : `Sent to ${M}`],
      ['You save', `${money(q.saving)} a year`],
    ],
    cta: 'Continue to delivery', line: (q) => `${q.carrier} · ${money(q.total)} a year for both vehicles`,
  },
  card: { title: 'Insurance ID card', insured: 'Insured', policy: 'Policy number', vehicle: 'Vehicle', vin: 'VIN', effective: 'Effective', vinMask: (tail) => `•••• •••• ${tail}`, number: 'LT-48-2206-71', wallet: 'Add to wallet', walletDone: 'Card added to your wallet.' },
  done: { change: 'Change my insurance', cta: 'Continue to delivery' },
};

/* Step 5: delivery or pickup. */
export const DELIVERY_T = {
  title: 'How would you like to get your truck?',
  options: [
    { id: 'delivery', title: 'Deliver it to me', sub: (addr) => `Free, to ${addr}` },
    { id: 'pickup', title: 'I will pick it up', sub: () => MARKET.hub },
  ],
  dayLabel: 'Choose a day', windowLabel: 'Choose a time',
  pickupNote: (when) => `Ready from ${when}. Bring your driver’s license. We will have the truck charged, fuelled and plated.`,
  deliveryNote: `Your advisor hands over the keys, walks you through the truck and takes your signature. Then your ${DELIVERY.returnDays}-day money back guarantee starts.`,
  cta: 'Continue to review',
  summary: { delivery: (when, win) => `Home delivery, ${when}, ${win}`, pickup: (when) => `Pickup at the hub from ${when}` },
};

/* Step 6: review and place the order. */
export const REVIEW_T = {
  title: 'Review your order', sub: 'Check everything once. Nothing is charged until you place the order.',
  sections: { vehicle: 'Vehicle', details: 'Your details', trade: 'Trade-in', payment: 'Payment', insurance: 'Insurance', delivery: 'Delivery', price: 'Price' },
  tradeNone: 'No trade-in', tradeLater: 'Trade-in to be valued before delivery',
  priceRows: SUMMARY_T,
  agree: `I have reviewed my order and agree to the ${M} purchase agreement.`,
  cta: 'Place order', placing: 'Placing your order…',
  missing: (label) => `Finish the ${label} step first`,
};

/* The confirmation. */
export const DONE_T = {
  kicker: (n) => `Order ${n}`,
  title: (first, car) => `It’s yours, ${first}. Your ${car.model} is on its way.`,
  titlePickup: (first, car) => `It’s yours, ${first}. Your ${car.model} is being readied.`,
  sub: (email) => `We sent a confirmation to ${email}.`,
  facts: { delivery: 'Arrives', pickup: 'Ready for pickup', payment: 'Payment', insurance: 'Insurance' },
  nextTitle: 'What happens next',
  next: (o) => [
    ['Today', `Your order is confirmed and the truck is off the market. ${o.loan ? `${o.loan.lender} has your signed agreement.` : 'Payment instructions are in your inbox.'}`],
    ['Before delivery', `We register the truck in Illinois and fit your plates.${o.insurer ? ` Your ${o.insurer} coverage starts on the day.` : ''}`],
    [o.whenShort, o.pickup ? 'Pick up your keys at the hub and take a walk through the truck with your advisor.' : 'Your advisor brings the truck to your door and walks you through it.'],
    [`${DELIVERY.returnDays} days after`, `Your money back guarantee ends. Until then you can return it for any reason, up to ${DELIVERY.returnMiles} miles.`],
  ],
  manage: { before: 'Your loan and your policy can be ', link: `managed with ${LT}`, after: ', alongside everything else you hold.', href: '/lendingtree/visiontypes/lifecycle/?stage=home' },
  manageSolo: { before: 'Whatever you hold can be ', link: `managed with ${LT}`, after: ', in one place.' },
  loanCard: 'Your loan', policyCard: 'Your policy',
  again: 'Keep browsing trucks',
};

/* ---------- ask a question (answered by the live LendingTree agent) ---------- */
export const ASK_T = {
  placeholder: 'Ask a question', short: 'Ask', label: `Ask the ${LT} agent a question`, send: 'Send', hide: 'Hide the answer', thinking: `${LT} agent is thinking`,
  by: `Answered by ${LT}`,
};

/* What the live agent is told about the screen (sent with a question, never shown). */
export const NOW = {
  pay: { stage: 'payment choice', step: `The Payment step of the ${M} purchase flow. Choices: finance with ${M} powered by ${LT}, bring your own financing, or pay in full. Next: pick one.` },
  fin: {
    have: { stage: 'application', step: `The embedded ${LT} financing module shows what it already has from Google and ${M}, and what it still needs. Next: press "Get started".` },
    terms: { stage: 'application', step: 'Choosing a down payment and a loan term, with a live payment estimate. Next: press "Continue".' },
    income: { stage: 'application', step: 'Entering employment and yearly income, or connecting payroll to verify it. Next: press "Continue".' },
    housing: { stage: 'application', step: 'Entering the monthly housing payment. Next: press "Continue".' },
    consent: { stage: 'credit check consent', step: 'Asking for consent to a soft credit check that does not affect the credit score. Date of birth and last four of SSN are prefilled sample values. Next: tick the box and press "Check my rates".' },
    checking: { stage: 'gathering offers', step: 'Checking with lenders. Next: offers appear in a moment.' },
    offers: (names, rec) => ({ stage: 'offers', step: `Comparing auto loan offers from ${names.join(', ')}. The advisor recommends ${rec}. Next: press "Choose" on one.` }),
    stips: (o) => ({ stage: 'final items', step: `Final items for the ${o.lender} loan: identity, income verification, and proof of insurance (the next purchase step). Next: finish the items, then press "Review and sign".` }),
    sign: (o) => ({ stage: 'signing', step: `The plain-language agreement for the ${o.lender} auto loan is on screen. Nothing is final yet. Next: type their full name and press "Sign and apply to my purchase".` }),
    approved: (o) => ({ stage: 'closed', step: `The ${o.lender} loan is signed and applied to the purchase. Next: press "Continue to insurance".` }),
    saved: { stage: 'paused', step: 'They paused the financing application. It is saved and nothing is submitted. Next: press "Pick up where I left off", or choose another way to pay.' },
  },
  ins: {
    prompt: { stage: 'insurance choice', step: `They need proof of insurance. Choices: add the Tacoma to the existing Progressive policy for ${money(CURRENT_WITH_TACOMA.total)} a year, or shop both vehicles around. Next: pick one.` },
    working: { stage: 'gathering quotes', step: 'Working with carriers. Next: the result appears in a moment.' },
    quotes: (names, rec) => ({ stage: 'quotes', step: `Comparing quotes for both vehicles from ${names.join(', ')} against Progressive with the Tacoma added. The advisor recommends ${rec}. Next: press "Switch" on one, or keep Progressive and add the Tacoma.` }),
    confirm: (q) => ({ stage: 'switching', step: `Confirming a switch of both vehicles to ${q.carrier}, with Progressive cancelled the same day. Next: tick the box and press "Switch and bind".` }),
    bound: (name) => ({ stage: 'bound', step: `Insurance is in place with ${name}. Next: press "Continue to delivery".` }),
    saved: { stage: 'paused', step: 'They paused the insurance step. Nothing has changed on their policy. Next: press "Pick up where I left off".' },
  },
  other: (label) => ({ stage: 'purchase flow', step: `They are on the "${label}" step of the ${M} purchase flow.` }),
};

export const APPLICANT_AUTO = { employer: APPLICANT.employer, income: APPLICANT.income.toLocaleString('en-US'), housingPayment: APPLICANT.housingPayment.toLocaleString('en-US') };
export const FIN_DEFAULTS = FINANCE;
export const GOOGLE = GOOGLE_PROFILE;
