/* Visiontype B: every word and every step definition lives here, so the wording is easy to edit.
   The engine (app.js) reads these and never hard-codes copy. Sample data comes from ../shared/data.js. */
import { PERSON, BANKS, HELOC_OFFERS, HELOC_ESTIMATE, AUTO_QUOTES, AUTO_CURRENT, POLICIES, LOANS, money } from '../shared/data.js';

const day = (n, opts) => new Date(Date.now() + n * 86400000).toLocaleDateString('en-US', opts || { month: 'short', day: 'numeric' });
const chase = BANKS.find((b) => b.primary);
const acct = (b) => `${b.bank} ${b.name} ••${b.last4}`;
const home = POLICIES.find((p) => p.id === 'home');
const mortgage = LOANS.find((l) => l.id === 'mortgage');

/* ---------- prototype chrome (outside the product) ---------- */
export const PROTO = {
  back: 'Back to Adam’s proposal',
  label: 'Visiontype B',
  note: 'Prototype controls. Not part of the product.',
  fiction: 'Every person, offer and quote here is fictional.',
  paths: { loan: 'Loan', insurance: 'Insurance' },
  jumps: { shop: 'Shopping', home: 'Home base', servicing: 'Servicing' },
  restart: 'Start over',
  afterClose: {
    title: 'That is the purchase, start to finish.',
    body: 'Next comes the part most marketplaces skip: what happens after the close.',
    primary: 'Jump ahead to servicing', secondary: 'Restart',
  },
  theEnd: {
    title: 'That is the whole lifecycle.',
    body: 'From first question to renewal, all on LendingTree’s own website and app.',
    primary: 'Restart', other: { loan: 'Play the insurance path', insurance: 'Play the loan path' },
  },
  skips: { servicing: 'Three months later', engagement: 'Six months in' },
};

/* ---------- product shell ---------- */
export const SHELL = {
  tabs: [{ id: 'guide', label: 'Guide' }, { id: 'loans', label: 'Loans' }, { id: 'insurance', label: 'Insurance' }],
  guideName: 'LendingTree guide',
  ask: 'Ask anything',
};

export const LANDING = {
  hello: `Hi ${PERSON.first}.`,
  q: 'What are you trying to do?',
  sub: 'Say it in your own words. I will take it from there.',
  placeholder: 'I want to…',
  choices: [
    { label: 'Build a backyard deck', path: 'loan', text: 'I want to build a deck in my back yard' },
    { label: 'Find better car insurance', path: 'insurance', text: 'I’m not happy with Progressive' },
    { label: 'Something else', focus: true },
  ],
  typed: { loan: 'I want to build a deck in my back yard', insurance: 'I’m not happy with Progressive' },
  insuranceWords: /insur|progressive|geico|policy|premium|car |auto|coverage|deductible/i,
};

/* ---------- the two paths ---------- */
export const PATHS = {
  loan: {
    homeView: 'loans',
    offers: HELOC_OFFERS, recommend: 'figure',
    opening: [
      'A deck is a great project.',
      `You have a lot of equity in ${PERSON.address.split(',')[0]}, so a home equity line is likely your lowest-cost way to pay for it. You could borrow up to about ${money(HELOC_ESTIMATE.max)}. Three quick questions and I will show you real offers.`,
    ],
    qualify: [
      { id: 'amount', q: 'Roughly what do you expect the deck to cost?', options: ['Under $25,000', `About ${money(HELOC_ESTIMATE.deckBudget)}`, '$60,000 or more', 'Not sure yet'], auto: 1 },
      { id: 'when', q: 'How soon would you like to start?', options: ['As soon as I can', 'In a month or two', 'Just exploring'], auto: 0 },
      { id: 'priority', q: 'What matters most to you?', options: ['The lowest rate', 'Getting funds quickly', 'No closing costs'], auto: 1 },
    ],
    onfile: {
      intro: 'That is all I need to ask. Everything else is already on file, so there is nothing to type.',
      title: 'Your application, filled in',
      rows: [['Name', `${PERSON.first} ${PERSON.last}`], ['Home', PERSON.address], ['Estimated value', money(PERSON.homeValue)], ['Mortgage balance', money(PERSON.mortgageBalance)], ['Household income', money(PERSON.income)], ['Credit score', String(PERSON.creditScore)]],
      ok: 'Looks right', edit: 'Update something',
    },
    checking: { text: 'Checking with lenders. This does not affect your credit.', names: ['Figure', 'Rocket Mortgage', 'Bank of America', 'and 9 more'] },
    offersIntro: (n) => `${n} lenders came back with a line that covers your deck. Here is how they compare.`,
    chart: { title: 'Rate and time to funding', x: 'Days until funds arrive', y: 'APR', hint: 'Lower and further left is better' },
    advisor: 'You said speed matters. Figure funds in 5 days with no closing costs. Rocket is a quarter point lower, about $9 a month on $42,000, but takes three weeks. I would go with Figure.',
    choose: 'Choose', details: 'Details', think: 'I want to think about it',
    offerDetails: (o) => [['Credit limit', money(o.limit)], ['Draw period', o.draw], ['Funding', o.fund], ['Costs', o.fee], ['Rate type', 'Variable, with an option to lock']],
    picked: (o) => `Good choice. I will get this finished with ${o.lender}. Most of it I can do for you.`,
    app: {
      title: (o) => `Finish your application with ${o.lender}`,
      steps: [
        { id: 'bank', title: 'Share bank statements', bodyFor: (o) => `${o.lender} needs two months of statements. Your ${chase.bank} account is already linked, so one tap shares them.`, cta: `Share from ${chase.bank} ••${chase.last4}`, working: `Connecting to ${chase.bank}…`, done: 'Two months of statements shared' },
        { id: 'income', title: 'Verify your income', body: 'I can confirm it directly with your employer’s payroll. No pay stubs to find.', cta: 'Verify with payroll', working: 'Checking with payroll…', done: `${money(PERSON.income)} a year, verified` },
        { id: 'property', title: 'Confirm your property', body: 'Pulling public records, an automated valuation and a title check.', working: 'Looking up your property…', done: `Valued at ${money(PERSON.homeValue)}, clear title` },
        { id: 'questions', title: 'Two last questions', questions: [{ q: 'Is this your primary home?', options: ['Yes', 'No'], auto: 0 }, { q: 'How much would you like to draw at closing?', options: ['$25,000', money(HELOC_ESTIMATE.deckBudget), 'The full line'], auto: 1 }], done: (a) => `Primary home: ${a[0]}. First draw: ${a[1]}` },
        { id: 'stips', title: 'Final items', body: `The lender asks for proof of homeowners insurance and a photo ID. Your ${home.carrier} policy is already here, and your ID is on file.`, cta: 'Send both', working: 'Sending…', done: 'Insurance and ID sent' },
      ],
      finished: (o) => `${o.lender} has approved everything. All that is left is your signature.`,
    },
    sign: {
      title: 'Your agreement, in plain language',
      sub: (o) => `${o.lender} home equity line`,
      terms: (o) => [
        ['What you get', `A credit line of ${money(o.limit)}. You draw only what you need, starting with ${money(HELOC_ESTIMATE.deckBudget)}.`],
        ['What it costs', `${o.apr.toFixed(2)}% APR, variable. On ${money(HELOC_ESTIMATE.deckBudget)} that is about ${money(Math.round(386 * o.apr / 7.9))} a month.`],
        ['Fees', `${o.fee}. No penalty for paying it off early.`],
        ['What secures it', `Your home at ${PERSON.address.split(',')[0]}. You have three business days to change your mind.`],
      ],
      fullLabel: 'Read the full agreement', full: 'The complete 14-page agreement would open here, with each section linked to the plain-language summary above.',
      nameLabel: 'Type your full name to sign', cta: 'Sign and finish',
    },
    done: {
      title: 'Your line is open',
      body: (o) => `${money(HELOC_ESTIMATE.deckBudget)} is on its way from ${o.lender} to your ${acct(chase)}. It should arrive by ${day(parseFund(o.fund), { weekday: 'long', month: 'short', day: 'numeric' })}.`,
      facts: (o) => [['Line', money(o.limit)], ['First draw', money(HELOC_ESTIMATE.deckBudget)], ['Rate', `${o.apr.toFixed(2)}% APR`]],
      cta: 'See all your loans',
    },
    watch: {
      say: 'Take all the time you need. These three offers are saved, and nothing here touched your credit.',
      ask: 'Want me to keep watching for a better deal while you decide?',
      yes: 'Yes, keep watching', no: 'No thanks',
      card: { on: 'Watching home equity rates for you', onSub: 'I will let you know the moment something beats Figure at 7.90%.', off: 'Your offers are saved', offSub: 'They are good for 30 days. Come back whenever you are ready.', back: 'See the offers again' },
    },
    tour: 'Your new line sits alongside everything else you owe. Tap any loan to see more.',
    servicing: [
      { kind: 'transfer', text: `Heads up: your ${mortgage.lender} payment of ${money(mortgage.payment)} comes out of Fifth Third Joint Checking in 3 days, and that account has ${money(1885.4, 2)}. Want to move money over from savings?`, yes: 'Move money', no: 'Not now', from: 'ally', to: 'fifththird', amount: 1000, why: `${mortgage.lender} payment on the 1st` },
      { kind: 'payoff', text: 'Twelve on-time payments in a row on your auto loan. Nicely done. A little extra each month would finish it sooner and save you interest. Want to see the numbers?', yes: 'Show me', no: 'Not now', loan: 'auto', extra: 100 },
    ],
    renewal: {
      nudge: `I ran a quick check on your loans. ${mortgage.lender} has a home equity special for existing customers, and with your mortgage in good standing and your home now worth about $655,000, you could get up to $75,000. That is enough to redo a bathroom.`,
      shop: 'Shop it around', direct: 'Start with Rocket', no: 'Not now', directId: 'rocket',
      opening: 'Happy to. I already know your home, your income and the line you have with Figure, so this will be quick.',
      question: { q: 'How much are you thinking for the bathroom?', options: ['About $25,000', 'About $40,000', 'The full $75,000'], auto: 0 },
      offersIntro: 'Three lenders, including the Rocket special. None of them needs anything new from you.',
      chart: { title: 'Rate and time to funding', x: 'Days until funds arrive', y: 'APR', hint: 'Lower and further left is better' },
      advisor: 'Rocket’s special is the lowest rate here and waives the origination fee because they hold your mortgage. Figure could simply raise your current line, which is the least paperwork.',
      offers: [
        { id: 'rocket', lender: 'Rocket Mortgage', apr: 7.15, limit: 75000, draw: '10-year draw', fund: 'Funds in 10 days', fee: '$0 origination for existing customers', tag: 'Existing customer special' },
        { id: 'figure', lender: 'Figure', apr: 7.6, limit: 60000, draw: '5-year draw', fund: 'Funds in 5 days', fee: '$0 closing costs', tag: 'Adds to your current line' },
        { id: 'bofa', lender: 'Bank of America', apr: 7.95, limit: 75000, draw: '10-year draw', fund: 'Funds in 4 weeks', fee: '$0 closing costs', tag: 'Longest draw period' },
      ],
      recommend: 'rocket',
      app: {
        title: (o) => `A short application with ${o.lender}`,
        steps: [
          { id: 'reuse', title: 'Reuse what is on file', body: 'Income, bank statements and property records from your first application are still current.', working: 'Refreshing your details…', done: 'Income, statements and property confirmed' },
          { id: 'stips', title: 'Final items', body: 'Your homeowners policy and ID carry over. One tap sends them.', cta: 'Send both', working: 'Sending…', done: 'Insurance and ID sent' },
        ],
        finished: (o) => `${o.lender} is ready. One signature and it is done.`,
      },
      signTerms: (o) => [
        ['What you get', `A credit line of ${money(o.limit)} for your bathroom project.`],
        ['What it costs', `${o.apr.toFixed(2)}% APR, variable. ${o.fee}.`],
        ['What secures it', 'Your home, the same as your current line. You have three business days to change your mind.'],
      ],
      done: { title: 'Your new line is open', body: (o) => `${o.lender} approved a ${money(o.limit)} line. Draw from it whenever the bathroom work starts.`, cta: 'See all your loans' },
      newLoan: (o) => ({ id: 'heloc2', type: 'Home equity line', lender: o.lender, balance: 0, limit: o.limit, rate: o.apr, payment: 0, due: 'after your first draw', isNew: true }),
    },
  },

  insurance: {
    homeView: 'insurance',
    offers: AUTO_QUOTES, recommend: 'geico',
    opening: [
      'Sorry to hear that. Let us see if someone can do better.',
      `I can see your ${AUTO_CURRENT.carrier} policy on the ${PERSON.vehicle}: ${money(AUTO_CURRENT.premium)} a year with a ${money(AUTO_CURRENT.deductible)} deductible. Three quick questions and I will bring back real quotes.`,
    ],
    qualify: [
      { id: 'why', q: 'What is bothering you most?', options: ['The price keeps climbing', 'Slow service', 'The coverage does not fit', 'All of it'], auto: 0 },
      { id: 'deductible', q: 'What deductible feels comfortable?', sub: `You carry ${money(AUTO_CURRENT.deductible)} today.`, options: ['$250', '$500', '$1,000', 'Show me a mix'], auto: 1 },
      { id: 'coverage', q: 'Keep your coverage the same, or look at stronger protection too?', options: ['Keep it the same', 'Show stronger options too'], auto: 1 },
    ],
    onfile: {
      intro: 'That is all I need to ask. Everything else is already on file, so there is nothing to type.',
      title: 'Your details, filled in',
      rows: [['Driver', `${PERSON.first} ${PERSON.last}`], ['Vehicle', PERSON.vehicle], ['Garaged at', PERSON.address], ['Current policy', `${AUTO_CURRENT.carrier}, ${money(AUTO_CURRENT.premium)} a year`], ['Liability', AUTO_CURRENT.liability], ['Deductible', money(AUTO_CURRENT.deductible)]],
      ok: 'Looks right', edit: 'Update something',
    },
    checking: { text: 'Gathering quotes from carriers. This does not affect your credit.', names: ['GEICO', 'State Farm', 'Travelers', 'and 14 more'] },
    offersIntro: (n) => `${n} carriers beat what you pay today. Here they are next to your ${AUTO_CURRENT.carrier} policy.`,
    chart: { title: 'Yearly premium, next to what you pay now', today: 'Today' },
    advisor: `GEICO matches your current liability limits, halves your deductible and saves ${money(AUTO_CURRENT.premium - AUTO_QUOTES[0].premium)} a year. State Farm costs a bit more but raises your liability protection and bundles with your home policy.`,
    choose: 'Choose', details: 'Details', think: 'I want to think about it',
    offerDetails: (q) => [['Liability', q.liability], ['Collision deductible', money(q.deductible)], ['Comprehensive deductible', money(q.deductible)], ['Roadside and rental', 'Included'], ['Paid monthly', `${money(Math.round(q.premium / 12))} a month`]],
    picked: (q) => `Good choice. I will set this up with ${q.carrier} and handle the switch from ${AUTO_CURRENT.carrier}.`,
    app: {
      title: (q) => `Finish your policy with ${q.carrier}`,
      steps: [
        { id: 'mvr', title: 'Check your driving record', body: 'With your OK, I will pull your record from the state so the price is final, not an estimate.', cta: 'Check my record', working: 'Requesting your record…', done: 'Clean record, no violations in five years' },
        { id: 'import', title: 'Bring over your current policy', body: `I will import your coverage, vehicle and VIN from ${AUTO_CURRENT.carrier} so nothing gets missed.`, cta: `Import from ${AUTO_CURRENT.carrier}`, working: `Connecting to ${AUTO_CURRENT.carrier}…`, done: 'Coverage, vehicle and VIN imported' },
        { id: 'questions', title: 'Two last questions', questions: [{ q: 'About how many miles do you drive in a year?', options: ['Under 8,000', '8,000 to 12,000', 'More than 12,000'], auto: 1 }, { q: 'Who else drives the Highlander?', options: ['Just me', 'My partner too'], auto: 0 }], done: (a) => `${a[0]} miles a year. Drivers: ${a[1].toLowerCase()}` },
        { id: 'start', title: 'Pick a start date', body: `I suggest ${day(6)}. I will cancel ${AUTO_CURRENT.carrier} the same day so there is no gap, and request your refund for the unused months.`, cta: `Start on ${day(6)}`, working: 'Scheduling the switch…', done: `Starts ${day(6)}. ${AUTO_CURRENT.carrier} cancels the same day` },
        { id: 'pay', title: 'Choose how to pay', questions: [{ q: `Pay from your ${acct(chase)}?`, options: ['Monthly', 'Once a year, save 5%'], auto: 0 }], done: (a) => `${a[0]}, from ${chase.bank} ••${chase.last4}` },
      ],
      finished: (q) => `${q.carrier} has confirmed your final price. All that is left is your signature.`,
    },
    sign: {
      title: 'Your policy, in plain language',
      sub: (q) => `${q.carrier} auto policy`,
      terms: (q) => [
        ['What is covered', `Your ${PERSON.vehicle}, and you as the driver, anywhere in the US and Canada.`],
        ['If you cause an accident', `Up to ${q.liability.split('/').map((n) => '$' + n + ',000').join(' / ')} for injuries and damage to others.`],
        ['If your car is damaged', `You pay the first ${money(q.deductible)}. ${q.carrier} pays the rest.`],
        ['What it costs', `${money(q.premium)} a year, or ${money(Math.round(q.premium / 12))} a month. Cancel any time.`],
      ],
      fullLabel: 'Read the full policy', full: 'The complete policy document would open here, with each section linked to the plain-language summary above.',
      nameLabel: 'Type your full name to sign', cta: 'Sign and start my policy',
    },
    done: {
      title: 'You are covered',
      body: (q) => `Your ${q.carrier} policy takes effect on ${day(6, { weekday: 'long', month: 'short', day: 'numeric' })}. ${AUTO_CURRENT.carrier} is cancelled the same day, and your ID card is ready now.`,
      facts: (q) => [['Premium', `${money(q.premium)} a year`], ['You save', `${money(AUTO_CURRENT.premium - q.premium)} a year`], ['Deductible', money(q.deductible)]],
      cta: 'See all your insurance',
    },
    watch: {
      say: 'Take all the time you need. These three quotes are saved, and nothing here touched your credit.',
      ask: `Your ${AUTO_CURRENT.carrier} policy renews on Mar 14. Want me to keep watching for a better price until then?`,
      yes: 'Yes, keep watching', no: 'No thanks',
      card: { on: 'Watching auto rates for you', onSub: `I will let you know if anything beats GEICO at ${money(AUTO_QUOTES[0].premium)} before your renewal.`, off: 'Your quotes are saved', offSub: 'They are good for 30 days. Come back whenever you are ready.', back: 'See the quotes again' },
    },
    tour: 'Your new policy sits alongside everything else that protects you. Tap any policy to see more.',
    servicing: [
      { kind: 'transfer', text: `Heads up: your ${home.carrier} homeowners premium of ${money(home.premium)} comes out of Fifth Third Joint Checking in 4 days, and that account has ${money(1885.4, 2)}. Want to move money over from savings?`, yes: 'Move money', no: 'Not now', from: 'ally', to: 'fifththird', amount: 500, why: `${home.carrier} premium on ${home.renews}` },
      { kind: 'claim', text: (p) => `Sorry about that fender-bender. I hope everyone is okay. I can start the claim with ${p.carrier} now. I already have your policy and your car, so it takes about two minutes.`, yes: 'Start my claim', no: 'Not now', policy: 'auto' },
    ],
    renewal: {
      nudge: (p) => `I ran a quick check on your policies. Your ${home.carrier} homeowners renews on ${home.renews} at ${money(home.premium)}. ${p.carrier} will cover the house for ${money(1608)} if you bundle it with your auto policy. Same coverage, ${money(home.premium - 1608)} less a year.`,
      shop: 'Shop it around', direct: (p) => `Start with ${p.carrier}`, no: 'Not now',
      opening: 'Happy to. I already know the house and the coverage you carry, so this will be quick.',
      question: { q: 'Keep the same $1,000 home deductible?', options: ['Yes, keep it', 'Show me $2,500 too'], auto: 0 },
      offersIntro: `Three carriers, next to your ${home.carrier} renewal. None of them needs anything new from you.`,
      chart: { title: 'Yearly premium, next to your renewal price', today: 'Renewal' },
      advisor: (p) => `Bundling with ${p.carrier} is the clear winner: same coverage and the lowest price, with one bill for home and auto.`,
      current: { carrier: home.carrier, icon: home.icon, premium: home.premium, deductible: 1000, liability: '$300,000' },
      offers: (p) => [
        { id: 'bundle', carrier: p.carrier, icon: p.icon, premium: 1608, deductible: 1000, liability: '$300,000', tag: 'Bundle with your auto policy' },
        { id: 'travelers', carrier: 'Travelers', icon: 'travelers', premium: 1742, deductible: 1000, liability: '$500,000', tag: 'Most liability cover' },
        { id: 'nationwide', carrier: 'Nationwide', icon: 'nationwide', premium: 1795, deductible: 500, liability: '$300,000', tag: 'Lowest deductible' },
      ].filter((q, i) => i === 0 || q.carrier !== p.carrier),
      recommend: 'bundle',
      offerDetails: (q) => [['Dwelling', '$640,000 replacement cost'], ['Personal liability', q.liability], ['Deductible', money(q.deductible)], ['Paid monthly', `${money(Math.round(q.premium / 12))} a month`]],
      app: {
        title: (q) => `A short application with ${q.carrier}`,
        steps: [
          { id: 'reuse', title: 'Reuse what is on file', body: 'Your home details, claims history and current coverage carry over.', working: 'Refreshing your details…', done: 'Home details and coverage confirmed' },
          { id: 'start', title: 'Line up the switch', body: `The new policy starts ${home.renews}, the day ${home.carrier} would renew. I will tell your mortgage servicer too.`, cta: `Start on ${home.renews}`, working: 'Scheduling…', done: `Starts ${home.renews}. ${mortgage.lender} notified` },
        ],
        finished: (q) => `${q.carrier} is ready. One signature and it is done.`,
      },
      signTerms: (q) => [
        ['What is covered', `Your home at ${PERSON.address.split(',')[0]}, your belongings and your liability.`],
        ['If something happens', `You pay the first ${money(q.deductible)} of a claim. ${q.carrier} pays the rest.`],
        ['What it costs', `${money(q.premium)} a year. Cancel any time.`],
      ],
      done: { title: 'Your home is covered', body: (q) => `${q.carrier} takes over on ${home.renews}. You save ${money(home.premium - q.premium)} a year, and there is nothing else to do.`, cta: 'See all your insurance' },
    },
  },
};

export function parseFund(s) { const m = /(\d+)\s*(day|week)/.exec(s) || [0, 7, 'day']; return Number(m[1]) * (m[2] === 'week' ? 7 : 1); }

/* ---------- home bases ---------- */
export const HOME = {
  loans: {
    title: 'Your loans', sub: (n, total, monthly) => `${n} loans, ${money(total)} owed. ${money(monthly)} a month.`,
    newTag: 'New',
    actions: { pay: 'Pay now', extra: 'Pay extra', details: 'Details' },
    accountsTitle: 'Your accounts', accountsSub: (total) => `${money(total, 2)} across your banks`,
    acctActions: { transfer: 'Transfer', activity: 'Recent activity' },
    connect: 'Connect another account',
    move: 'Move money',
    moveOptions: [
      { id: 'pay', label: 'Make a loan payment', sub: 'Pay any loan from any account' },
      { id: 'transfer', label: 'Transfer between accounts', sub: 'Move money between your banks' },
      { id: 'bill', label: 'Pay a bill', sub: 'Utilities, cards and more' },
    ],
    banksToConnect: [{ bank: 'Capital One', name: '360 Checking', last4: '7714', balance: 3120.77 }, { bank: 'Schwab', name: 'Investor Checking', last4: '5530', balance: 9482.1 }, { bank: 'SoFi', name: 'Savings', last4: '0192', balance: 12050 }, { bank: 'Wells Fargo', name: 'Everyday Checking', last4: '8846', balance: 2214.36 }],
    bills: [['ComEd electric', 142.18], ['Nicor Gas', 86.4], ['Naperville water', 61.05]],
    activity: [['Payroll deposit', 4120.5], ['Whole Foods', -86.12], ['ComEd electric', -142.18], ['Transfer from savings', 500]],
  },
  insurance: {
    title: 'Your insurance', sub: (n, watching) => `${n} policies in one place. Watching ${watching} renewals for a better rate.`,
    newTag: 'New',
    actions: { card: 'ID card', coverage: 'Coverage', claim: 'File a claim', reshop: 'Re-shop' },
    watch: 'Watch for better rates', watchOn: 'I will check prices 45 days before renewal.', employer: 'Through your employer. Changes happen at open enrollment.',
    add: 'Add a policy',
    addWays: { title: 'Add a policy', sub: 'Three ways. Pick the easiest.', email: 'add@mail.lendingtree.example', quoted: [{ carrier: 'Progressive', icon: 'progressive', type: 'Motorcycle', premium: 46, per: 'month', renews: 'Jun 9', covers: '2019 Triumph Bonneville' }] },
    nextTitle: 'Coming up',
    coverage: {
      Auto: [['Liability', (p) => p.liability || '100/300/100'], ['Collision', (p) => `${money(p.deductible || 500)} deductible`], ['Comprehensive', (p) => `${money(p.deductible || 500)} deductible`], ['Uninsured motorist', () => '100/300'], ['Roadside and rental', () => 'Included']],
      Homeowners: [['Dwelling', () => '$640,000'], ['Personal property', () => '$320,000'], ['Liability', () => '$300,000'], ['Deductible', () => '$1,000']],
      Life: [['Death benefit', () => '$750,000'], ['Term', () => '20 years, to 2046'], ['Beneficiary', () => 'Spouse']],
      Medical: [['Plan', () => 'Family PPO'], ['Deductible', () => '$3,000 family'], ['Out-of-pocket max', () => '$8,000']],
      'Vision and dental': [['Cleanings', () => 'Two a year, covered'], ['Eye exam', () => 'One a year, covered'], ['Annual max', () => '$2,000 per person']],
      Pet: [['Covers', () => 'Accidents and illness'], ['Reimbursement', () => '90%'], ['Deductible', () => '$250']],
      Motorcycle: [['Liability', () => '100/300/50'], ['Collision', () => '$500 deductible']],
    },
    reshopCarriers: [['GEICO', 'geico', 0.84], ['Travelers', 'travelers', 0.88], ['Nationwide', 'nationwide', 0.93]],
  },
};

/* ---------- servicing flows (shown in a sheet on the app, a dialog on the website) ---------- */
export const FLOWS = {
  transfer: { title: 'Move money', from: 'From', to: 'To', amount: 'Amount', chips: [500, 1000, 2000], cta: (n) => `Transfer ${money(n)}`, doneTitle: 'Transfer complete', done: (b, why) => `${b.bank} ${b.name} now has ${money(b.balance, 2)}${why ? `, enough for your ${why}` : ''}.`, close: 'Done' },
  payoff: {
    title: 'Pay it off sooner', sub: (l) => `${l.lender} ${l.type.toLowerCase()}, ${money(l.balance)} at ${l.rate}%`, pick: 'Extra each month', chips: [50, 100, 200],
    now: 'Today’s plan', next: 'With extra', saved: 'Interest saved', sooner: (m) => `${m} month${m === 1 ? '' : 's'} sooner`,
    cta: (n) => `Add ${money(n)} a month`, doneTitle: 'Extra payments are on', done: (n, d) => `${money(n)} extra goes toward principal each month, starting with your next payment. New payoff date: ${d}.`, close: 'Done',
  },
  pay: { title: 'Make a payment', from: 'Pay from', cta: (n) => `Pay ${money(n)}`, doneTitle: 'Payment scheduled', done: (l) => `Your ${l.lender} payment will post tomorrow.`, close: 'Done' },
  bill: { title: 'Pay a bill', cta: (n) => `Pay ${money(n, 2)}`, doneTitle: 'Bill paid', close: 'Done' },
  claim: {
    title: 'Start a claim', steps: ['What happened', 'When and where', 'Photos', 'Other driver'],
    what: { q: 'What happened?', options: ['Another car hit mine', 'I hit another car', 'My parked car was hit', 'Something else'], auto: 0 },
    when: { q: 'When and where?', date: 'Date', time: 'Time', place: 'Location', timeVal: '5:40 PM', placeVal: 'Ogden Ave and Washington St, Naperville', next: 'Continue' },
    photos: { q: 'Add a few photos', sub: 'They help the adjuster settle things faster. You can add more later.', tiles: ['Your car', 'Other car', 'The scene', 'Their plate'], next: 'Continue', autoTiles: [0, 1] },
    other: { q: 'The other driver', sub: 'Whatever you have is fine.', fields: [['name', 'Name', 'Jordan Lee'], ['plate', 'License plate', 'DR 48213'], ['insurer', 'Their insurer', 'Allstate']], next: 'Submit claim', none: 'No one else was involved' },
    done: {
      title: 'Your claim is filed', number: 'Claim number',
      steps: (c) => [['Today', `${c} has your claim and photos.`], ['Within one business day', 'An adjuster calls you to confirm the details.'], ['This week', 'Pick a repair shop near you. A rental car is covered while yours is in the shop.']],
      close: 'Done', note: 'I will keep the status here under your auto policy.',
    },
  },
};
