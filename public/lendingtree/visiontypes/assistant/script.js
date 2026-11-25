/* The conversation, as data. All copy for the assistant visiontype lives in this file.

   A path (loan or insurance) is a set of named scenes. A scene is a list of steps the engine (app.js) plays in order:
     { t: 'bot', text, flag? }            the assistant speaks. **bold** and blank-line paragraphs are supported.
     { t: 'choice', options }             the person replies. Each option: label, say (what is typed), auto (auto-play picks it),
                                          go (jump to a scene), set (merge into state), neg / match (how typed text maps to it),
                                          pick (an offer id, so the Choose button on a card can answer), chip: false (hide the chip).
     { t: 'tool', lines, done }           the "Working with LendingTree" status.
     { t: 'offers' | 'compare' | 'review' | 'form' | 'checklist' | 'contract' | 'celebrate' | 'app' | 'receipt' | 'payoff' }
                                          embedded cards. See cards.js for what each one reads.
     { t: 'divider', text }               time passing.
     { t: 'goto', scene }  { t: 'modal', kind }
   Any text can be a function of the state S (S.v holds form answers, S.offer the chosen offer). */

import { PERSON, BRAND, ASSISTANTS, BANKS, LOANS, POLICIES, HELOC_OFFERS, HELOC_ESTIMATE, AUTO_QUOTES, AUTO_CURRENT, money } from '../shared/data.js';

/* ---------- small helpers over the shared data ---------- */
const HELOC = LOANS.find((l) => l.id === 'heloc');
const MORTGAGE = LOANS.find((l) => l.id === 'mortgage');
const AUTO_POLICY = POLICIES.find((p) => p.id === 'auto');
const HOME_POLICY = POLICIES.find((p) => p.id === 'home');
const bank = (id) => BANKS.find((b) => b.id === id) || BANKS[0];
export const acct = (b) => b.bank + ' ' + b.name + ' ••' + b.last4;
const PAY_FROM = bank('fifththird');      /* where the automatic payments come from */
const SAVINGS = bank('ally');
const PAYOFF_MONTHS = 192;                 /* the term that makes $42,000 at 7.90% come to the $386 payment in the shared data */
export const payment = (amount, apr, n = PAYOFF_MONTHS) => { const r = apr / 1200; return (amount * r) / (1 - Math.pow(1 + r, -n)); };
const pct = (n) => n.toFixed(2) + '%';
const perMonth = (yearly) => money(yearly / 12, 2);
const first = PERSON.first;
const TOOL = 'Working with ' + BRAND.name;

export const TITLES = { loan: 'Backyard deck plans', insurance: 'Car insurance options', other: ['Trip packing list', 'Weekend meal prep ideas', 'Explain compound interest', 'Birthday ideas for Sam'] };
export const HERO = 'What can I help with?';
export const PROTO_NOTE = 'Drawn as ' + ASSISTANTS[0] + '. It could just as easily be ' + ASSISTANTS.slice(1).join(', ') + ' or another assistant. All offers are fictional.';
export const BUSY_REPLY = 'Happy to get into that. Finish the step above first and I’ll pick it right back up.';

/* ---------- how a conversation can start ---------- */
export const OPENERS = [
  { text: 'I want to build a deck in my back yard', path: 'loan', primary: true, why: 'the deck',
    lead: 'A deck is a great project. For a good-sized one around ' + PERSON.city + ', plan on roughly $35,000 to $45,000 depending on materials.' },
  { text: 'I’m not happy with Progressive', path: 'insurance', primary: true,
    lead: 'Sorry to hear that. I can see why: you pay ' + AUTO_CURRENT.carrier + ' ' + money(AUTO_CURRENT.premium) + ' a year for the Highlander, and it renews on ' + AUTO_POLICY.renews + '.' },
  { text: 'I’m looking for a house in the Chicago area', path: 'loan', why: 'your move',
    lead: 'House hunting around Chicago is exciting. When you find the one, I can line up the mortgage and the home insurance together. One thing that helps right now: your current home has a lot of equity, and a home equity line can cover a down payment so you can move fast.' },
  { text: 'I’m looking at Tacomas', path: 'insurance',
    lead: 'Tacomas hold their value well. When you pick one, I can line up the auto loan and the insurance together. While you shop, it is worth looking at what you pay to insure the Highlander today: ' + money(AUTO_CURRENT.premium) + ' a year with ' + AUTO_CURRENT.carrier + '. That sets the baseline for the truck.' },
  { text: 'Help me get a loan', path: 'loan', why: 'your plans',
    lead: 'Happy to. Looking at what I know about you, the strongest option is a home equity line. Your home is worth about ' + money(PERSON.homeValue) + ' and you owe ' + money(PERSON.mortgageBalance) + ', so there is a lot to work with.' },
  { text: 'Help me find better insurance', path: 'insurance',
    lead: 'Happy to. The one that stands out is your auto policy: ' + money(AUTO_CURRENT.premium) + ' a year with ' + AUTO_CURRENT.carrier + ' for the Highlander, renewing on ' + AUTO_POLICY.renews + '.' },
];
/* Typed openers that are not one of the starters land on the nearest path. */
export function routeOpener(text) {
  const t = text.toLowerCase();
  const known = OPENERS.find((o) => o.text.toLowerCase().replace(/’/g, '\'') === t.replace(/’/g, '\'').replace(/[.!?]+$/, ''));
  if (known) return known;
  const ins = /insur|progressive|geico|state farm|polic|coverage|premium|deductible|tacoma|truck|car\b|claim/.test(t);
  return ins
    ? { path: 'insurance', lead: 'I can help with that. A good place to start is your auto policy: ' + money(AUTO_CURRENT.premium) + ' a year with ' + AUTO_CURRENT.carrier + ' for the Highlander.' }
    : { path: 'loan', why: 'your plans', lead: 'I can help with that. If it comes down to paying for it, your home gives you a strong option: it is worth about ' + money(PERSON.homeValue) + ' and has plenty of equity.' };
}

const YES = /\b(yes|yeah|yep|sure|ok|okay|please|go|do it|sounds good|let'?s|show|look)\b/i;
const NO = /\b(no|not now|not right now|later|think|maybe|wait|hold off|nah|skip|cancel)\b/i;
export const matchChoice = (text, options) => {
  const t = text.replace(/’/g, '\'');
  return options.find((o) => o.match && o.match.test(t)) || (NO.test(t) && options.find((o) => o.neg)) || (YES.test(t) && options.find((o) => !o.neg)) || options.find((o) => o.auto) || options[0];
};

/* ---------- offers, shaped for the offers card ---------- */
const MONO = { figure: ['F', '#1f2937'], rocket: ['R', '#c8102e'], bofa: ['B', '#0b3a82'] };
const loanOffer = (o, amount, extra) => ({
  id: o.id, name: o.lender, mono: MONO[o.id], tag: o.tag,
  big: pct(o.apr), bigLabel: 'APR', sub: 'About ' + money(payment(amount, o.apr)) + ' a month',
  stats: [money(o.limit) + ' limit', o.fund, o.fee, o.draw].filter(Boolean),
  raw: o, ...extra,
});
const quoteOffer = (q) => ({
  id: q.id, name: q.carrier, icon: q.icon, tag: q.tag,
  big: money(q.premium), bigLabel: 'a year', sub: 'Saves ' + money(AUTO_CURRENT.premium - q.premium) + ' a year',
  stats: [perMonth(q.premium) + ' a month', q.liability + ' liability', money(q.deductible) + ' deductible'],
  raw: q,
});
/* The second time around (the check-in offer on the loan path). These three are extra to the shared data. */
const REFI_OFFERS = [
  { id: 'rocket', lender: 'Rocket Mortgage', apr: 7.15, limit: 117000, fund: 'Funds in 10 days', fee: '$0 origination', tag: 'Existing customer special' },
  { id: 'figure', lender: 'Figure', apr: 7.9, limit: 105000, fund: 'Funds in 5 days', fee: '$0 closing costs', tag: 'Raise your current limit' },
  { id: 'bofa', lender: 'Bank of America', apr: 7.6, limit: 115000, fund: 'Funds in 4 weeks', fee: '$0 closing costs', tag: null },
];
const ROCKET = HELOC_OFFERS.find((o) => o.id === 'rocket');

const lenderName = (S) => (S.offer ? S.offer.name : HELOC.lender);
const mainName = (S) => (S.main ? S.main.name : HELOC.lender);   /* the lender or carrier chosen in the shopping pass */
const pickOptions = (list, verb, go, set) => list.map((o) => ({
  label: verb + ' ' + o.name, say: 'Let’s go with ' + o.name + '.', pick: o.id, go, set: { sel: o.id, ...(set || {}) },
  match: new RegExp(o.name.split(' ')[0], 'i'),
}));
const THINK = { label: 'I want to think about it', say: 'I want to think about it.', neg: true, go: 'think' };
const END_SHOP = { t: 'modal', kind: 'interstitial' };
const END_ALL = { t: 'modal', kind: 'final' };

const APP_CARD = (what) => ({
  t: 'app',
  title: 'Get the ' + BRAND.app,
  sub: 'Manage your ' + what + ' in one place. It connects to this ' + ASSISTANTS[0] + ' conversation, so you can start here and finish there.',
  points: ['Payments and history', 'Add or manage other people', 'Keep watching for better deals'],
  cta: 'Text me the link', done: 'Link sent to your phone', alt: 'Or keep everything here',
});

/* ====================================================================================================================
   LOAN PATH: a deck leads to a home equity line
   ==================================================================================================================== */
function loanScenes() {
  const offers = (S) => HELOC_OFFERS.map((o) => loanOffer(o, S.v.amount || HELOC_ESTIMATE.deckBudget));
  const fig = HELOC_OFFERS[0], roc = HELOC_OFFERS[1], bofa = HELOC_OFFERS[2];
  const amt = (S) => S.v.amount || HELOC_ESTIMATE.deckBudget;
  const fundsTo = (S) => bank(S.v.fundTo || 'chase');
  const helocPay = money(HELOC.payment);

  return {
    pitch: [
      { t: 'bot', text: (S) => S.lead + '\n\nThe simplest way to pay for it is probably a home equity line. Your home has plenty of equity, so the rate is usually well below a personal loan or a card. I work with ' + BRAND.name + ', so I can check real offers for you. It won’t affect your credit.\n\nWant me to take a look?' },
      { t: 'choice', options: [{ label: 'Yes, take a look', say: 'Yes, take a look.', auto: true }, { label: 'Not right now', say: 'Not right now.', neg: true, go: 'notNow' }] },
      { t: 'goto', scene: 'intake' },
    ],
    agentOpen: [
      { t: 'bot', flag: { text: ASSISTANTS[0] + ' checked in', icon: 'spark' }, text: 'Hi ' + first + '. I just checked the value of your home, checked some rates and weighed them against your current credit score. It looks like you could easily get a HELOC of around ' + money(HELOC_ESTIMATE.max) + '.\n\nThat could be a good option for doing some improvements, a good rainy day option, and it could even let you do some investing. Want me to pull real offers through ' + BRAND.name + '? It won’t affect your credit.' },
      { t: 'choice', options: [{ label: 'Sure, show me', say: 'Sure, show me.', auto: true }, { label: 'Not right now', say: 'Not right now.', neg: true, go: 'notNow' }] },
      { t: 'goto', scene: 'intake' },
    ],
    notNow: [
      { t: 'bot', text: 'No problem, I’ll leave it there. I can keep an eye on rates with ' + BRAND.name + ' and only speak up when something is worth your time.' },
      { t: 'tool', label: BRAND.name, lines: ['Setting a quiet watch on rates'], done: 'Watching rates for you' },
      END_SHOP,
    ],
    intake: [
      { t: 'tool', lines: ['Connecting to the ' + BRAND.agent, 'Sharing only what you approved', 'Checking your home value and equity'], done: 'Connected. Up to ' + money(HELOC_ESTIMATE.max) + ' available' },
      { t: 'bot', text: 'I already have your address, income and credit range, so there are no long forms. Two things only you can tell me:' },
      { t: 'form', title: 'What do you need?', context: 'Home equity line', submit: 'Find my options', fields: [
        { k: 'amount', type: 'slider', label: 'How much do you want to borrow?', min: 10000, max: 150000, step: 1000, value: 25000, auto: HELOC_ESTIMATE.deckBudget, fmt: 'money' },
        { k: 'soon', type: 'chips', label: 'How soon do you need it?', options: ['Within a week', 'This month', 'No rush'], auto: 0 },
      ] },
      { t: 'tool', lines: ['Sending your request to the ' + BRAND.agent, (S) => 'Matching lenders for a ' + money(amt(S)) + ' line', 'Comparing rates, fees and funding times'], done: '3 offers from 3 lenders' },
      { t: 'bot', text: (S) => 'Here are your three best matches for ' + money(amt(S)) + '. These are real offers based on your profile, not ranges.' },
      { t: 'offers', context: 'Home equity offers', list: offers, cta: 'Choose', foot: 'Checking these did not affect your credit.' },
      { t: 'bot', text: 'I can walk you through the trade-offs, or you can pick one and I’ll take it from there.' },
      { t: 'choice', options: [
        { label: 'Which would you pick?', say: 'Which one would you pick?', auto: true },
        ...pickOptions(HELOC_OFFERS.map((o) => ({ id: o.id, name: o.lender })), 'Go with', 'apply').map((o) => ({ ...o, chip: false })),
        THINK,
      ] },
      { t: 'bot', text: (S) => 'They are close on rate, so it mostly comes down to timing and how much room you want.\n\n**' + fig.lender + '** funds in 5 days with no closing costs. **' + roc.lender + '** has the lowest rate, but that is only about ' + money(payment(amt(S), fig.apr) - payment(amt(S), roc.apr)) + ' a month on ' + money(amt(S)) + ', and it takes three weeks plus a $495 fee. **' + bofa.lender + '** gives you the most room at ' + money(bofa.limit) + ' if you think the project could grow.' },
      { t: 'compare', kind: 'loan', context: 'Rate and time to fund', list: offers, best: 'figure', caption: 'Lower and further left is better.' },
      { t: 'bot', text: (S) => 'If you want to get going on ' + (S.why || 'your plans') + ' soon, my pick is ' + fig.lender + '. You only pay interest on what you draw, and you can pay it down early with no penalty.' },
      { t: 'choice', options: [
        ...pickOptions(HELOC_OFFERS.map((o) => ({ id: o.id, name: o.lender })), 'Go with', 'apply').map((o, i) => ({ ...o, auto: i === 0 })),
        THINK,
      ] },
    ],
    think: [
      { t: 'bot', text: 'That makes sense. It is a real decision and there is no clock on it. These offers are good for 30 days.\n\nI’ll keep watching with ' + BRAND.name + ' and let you know if a better rate shows up or one of these is about to expire. Just say the word when you are ready.' },
      { t: 'tool', label: BRAND.name, lines: ['Saving your three offers', 'Setting a watch on rates'], done: 'Offers saved. Watching rates for you' },
      END_SHOP,
    ],
    apply: [
      { t: 'bot', text: (S) => 'Good choice. I’ll work with the ' + BRAND.agent + ' to get your ' + lenderName(S) + ' application done right here. Most of it is already filled in.' },
      { t: 'tool', lines: [(S) => 'Starting your application with ' + lenderName(S), 'Filling in what I already know', 'Asking for next steps'], done: 'Application started. 4 steps to go' },
      { t: 'review', context: 'Your application', title: 'Here is what I filled in', rows: (S) => [
        ['Name', PERSON.first + ' ' + PERSON.last], ['Property', PERSON.address], ['Income', money(PERSON.income) + ' a year'],
        ['Home value', money(PERSON.homeValue) + ' (estimate)'], ['Mortgage', money(PERSON.mortgageBalance) + ' with ' + MORTGAGE.lender], ['Requesting', money(amt(S)) + ' first draw'],
      ], cta: 'Looks right', done: 'Confirmed' },
      { t: 'tool', lines: ['Getting next steps from the ' + BRAND.agent], done: 'Next: verify assets, income and property' },
      { t: 'bot', text: (S) => lenderName(S) + ' needs to verify three things. I can connect each one securely, so there is nothing to upload.' },
      { t: 'checklist', context: 'Secure connections', title: 'Connect your information', cta: 'Connect all three', items: [
        { icon: 'bank', title: 'Bank account', sub: acct(bank('chase')), done: 'Linked. Balances and 3 months of history shared' },
        { icon: 'wallet', title: 'Income', sub: 'Through your payroll provider', done: 'Verified at ' + money(PERSON.income) + ' a year' },
        { icon: 'home', title: 'Property', sub: 'County records and home value', done: 'Confirmed at ' + money(PERSON.homeValue) },
      ], foot: 'Read-only. You can disconnect any of these at any time.' },
      { t: 'tool', lines: ['Sending verifications to the ' + BRAND.agent, 'Checking what is left'], done: 'Verified. 3 questions and 3 documents left' },
      { t: 'bot', text: 'All three are verified. Now a few questions I can’t answer for you:' },
      { t: 'form', title: 'A few quick questions', context: 'Your application', submit: 'Continue', fields: [
        { k: 'primary', type: 'chips', label: 'Is this your primary home?', options: ['Yes', 'No'], auto: 0 },
        { k: 'title', type: 'chips', label: 'Who is on the title?', options: ['Just me', 'Me and my spouse'], auto: 0 },
        { k: 'fundTo', type: 'account', label: 'Where should the funds go?', ids: ['chase', 'ally', 'fifththird'], auto: 'chase' },
      ] },
      { t: 'tool', lines: ['Passing your answers to the ' + BRAND.agent, 'Asking what documents are still needed'], done: '3 documents requested' },
      { t: 'bot', text: 'Last stretch. The lender asked for three documents, and I can pull all of them for you. OK to share?' },
      { t: 'checklist', context: 'Documents', title: 'Documents to share', cta: 'Share these', items: [
        { icon: 'shield', title: 'Homeowners insurance', sub: 'From your ' + HOME_POLICY.carrier + ' policy', done: 'Shared' },
        { icon: 'doc', title: 'Latest mortgage statement', sub: 'From ' + MORTGAGE.lender, done: 'Shared' },
        { icon: 'id', title: 'Photo ID', sub: 'From your saved documents', done: 'Shared and matched' },
      ] },
      { t: 'tool', lines: [(S) => 'Final review with ' + lenderName(S), 'Clearing the final conditions'], done: 'Approved. All conditions cleared' },
      { t: 'goto', scene: 'sign' },
    ],
    sign: [
      { t: 'bot', text: 'You’re approved. The ' + BRAND.agent + ' sent your agreement and asked me to walk you through it before you sign. Here it is in plain language:' },
      { t: 'contract', context: 'Your agreement', title: (S) => 'Home equity line with ' + lenderName(S), sections: (S) => {
        const o = S.offer.raw;
        return [
          { h: 'Your line', v: money(o.limit), p: 'You can borrow up to this amount. Your first draw is ' + money(amt(S)) + '.' },
          { h: 'Your rate', v: pct(o.apr) + ' APR', p: 'A variable rate that follows the prime rate. You pay interest only on what you draw.' },
          { h: 'Your payment', v: 'About ' + money(payment(amt(S), o.apr)) + ' a month', p: 'Due on ' + HELOC.due + '. Pay extra or pay it off early with no penalty.' },
          { h: 'Costs', v: o.fee, p: 'No annual fee. Nothing else is due at signing.' },
          { h: 'Changing your mind', v: '3 business days', p: 'You can cancel within three business days at no cost.' },
        ];
      }, consent: 'I have read the summary and the full agreement.', cta: 'Sign and submit', signer: PERSON.first + ' ' + PERSON.last },
      { t: 'tool', lines: ['Sending your signed agreement', (S) => 'Closing with ' + lenderName(S), 'Scheduling your funds'], done: 'Closed. Funds on the way' },
      { t: 'celebrate', title: 'Your line is open', sub: (S) => lenderName(S) + ' is sending ' + money(amt(S)) + ' to ' + acct(fundsTo(S)) + '.', track: ['Signed', 'Closed', 'Funds sent', 'In your account'], at: 2, note: (S) => S.offer.raw.fund.replace('Funds in', 'Arrives within') },
      { t: 'bot', text: (S) => 'Congratulations, ' + first + '. The ' + BRAND.agent + ' confirmed closing is complete and the transfer from ' + lenderName(S) + ' has started. I’ll let you know when it lands.\n\nOne more thing that will make this easier to live with:' },
      APP_CARD('loan'),
      { t: 'bot', text: 'The app is optional. If you skip it, you can still manage everything right here, and I’ll stay connected to ' + BRAND.name + ' through MCP.' },
      END_SHOP,
    ],

    /* ----- servicing ----- */
    svcTransfer: transferScene('home equity line', helocPay, HELOC.due),
    svcSpecific: [
      { t: 'divider', text: 'A few months later' },
      { t: 'bot', flag: { text: 'Smart prompt from ' + BRAND.name }, text: 'Great job on making consistent on-time payments, ' + first + '. Would you like to speed up your payoff and save on interest by making extra payments? I can set that up.' },
      { t: 'choice', options: [{ label: 'Show me what that looks like', say: 'Show me what that looks like.', auto: true }, { label: 'Not right now', say: 'Not right now.', neg: true, go: 'svcSpecificNo' }] },
      { t: 'tool', lines: ['Pulling your loan details from the ' + BRAND.agent, 'Running payoff scenarios'], done: 'Balance ' + money(HELOC.balance) + ' at ' + pct(HELOC.rate) },
      { t: 'bot', text: 'Here is how extra payments change things. With your budget, I’d suggest around **$150 a month**. It cuts years off the loan and leaves your ' + money(Math.round(SAVINGS.balance / 1000) * 1000) + ' savings cushion alone.' },
      { t: 'payoff', context: 'Extra payments', title: 'Pay a little more each month', balance: HELOC.balance, rate: HELOC.rate, base: HELOC.payment, months: PAYOFF_MONTHS, options: [50, 100, 150, 250], value: 50, auto: 150, cta: 'Set up extra payment' },
      { t: 'tool', lines: [(S) => 'Updating your automatic payment with ' + mainName(S)], done: 'Automatic payment updated' },
      { t: 'receipt', context: 'Payment plan', title: 'Extra payments are set', rows: (S) => [
        ['New payment', money(HELOC.payment + S.v.extra) + ' on ' + HELOC.due], ['Interest saved', 'About ' + money(S.v.saved)], ['Paid off', S.v.payoffDate + ', ' + S.v.sooner + ' sooner'],
      ], foot: 'Change or pause this any time. Just tell me.' },
      { t: 'bot', text: (S) => 'Done. Starting next month you’ll pay ' + money(HELOC.payment + S.v.extra) + ', and the extra goes straight to principal. If money gets tight, tell me and I’ll drop it back to ' + helocPay + ' the same day.' },
    ],
    svcSpecificNo: [{ t: 'bot', text: 'No problem. Your payments stay at ' + helocPay + '. I’ll mention it again if rates or your budget change.' }],

    cross: [
      { t: 'divider', text: 'Six months in' },
      { t: 'bot', flag: { text: ASSISTANTS[0] + ' checked in', icon: 'spark' }, text: 'Hey there. Looks like you’re about halfway through your first year paying off your loan, and I did a quick check to see if we can optimize in any way.' },
      { t: 'tool', lines: ['Reviewing your loan with the ' + BRAND.agent, 'Checking current rates and specials', 'Comparing against your home value'], done: '1 opportunity found' },
      { t: 'bot', flag: { text: 'Intelligence from ' + BRAND.name }, text: 'Looks like ' + ROCKET.lender + ' is running a special on HELOCs right now for existing customers. Based on your mortgage status and the value of your home, it looks like you could get up to ' + money(ROCKET.limit) + ' more at a lower rate than you have today, which could be enough to redo your bathroom.\n\nWant me to shop that around or initiate with Rocket?' },
      { t: 'choice', options: [
        { label: 'Shop it around', say: 'Shop it around.', auto: true, match: /shop|around|compare/i },
        { label: 'Start with Rocket', say: 'Start with Rocket.', go: 'crossConfirm', set: { sel: 'rocket', list: 'refi' }, match: /rocket|initiate|start/i },
        { label: 'Not right now', say: 'Not right now.', neg: true, go: 'crossNo' },
      ] },
      { t: 'bot', text: (S) => 'On it. Since you already have a line with ' + mainName(S) + ', I can reuse everything from last time: your documents, your bank link and your income verification.' },
      { t: 'tool', lines: ['Sharing your existing profile with the ' + BRAND.agent, 'Asking lenders for an upgrade'], done: '3 options. Nothing new needed from you' },
      { t: 'offers', context: 'Upgrade your line', list: () => REFI_OFFERS.map((o) => loanOffer(o, HELOC.balance, { stats: [money(o.limit) + ' limit', money(o.limit - HELOC.balance) + ' available', o.fund, o.fee] })), cta: 'Choose', listKey: 'refi', foot: 'Each option pays off your current ' + money(HELOC.balance) + ' balance.' },
      { t: 'bot', text: 'Rocket’s special is the strongest: a lower rate on what you already owe, about ' + money(payment(HELOC.balance, HELOC.rate) - payment(HELOC.balance, REFI_OFFERS[0].apr)) + ' less a month, plus ' + money(REFI_OFFERS[0].limit - HELOC.balance) + ' you can draw on for the bathroom whenever you are ready.' },
      { t: 'choice', options: [
        ...pickOptions(REFI_OFFERS.map((o) => ({ id: o.id, name: o.lender })), 'Go with', 'crossConfirm', { list: 'refi' }).map((o, i) => ({ ...o, auto: i === 0 })),
        { label: 'Keep what I have', say: 'I’ll keep what I have.', neg: true, go: 'crossNo' },
      ] },
    ],
    crossConfirm: [
      { t: 'tool', lines: ['Reusing your verified documents', (S) => 'Starting with ' + lenderName(S), 'Checking for anything new'], done: 'Approved. One signature needed' },
      { t: 'bot', text: (S) => 'That was quick, because ' + lenderName(S) + ' could use what you already shared. Here is the short version of the new agreement:' },
      { t: 'contract', context: 'Your agreement', title: (S) => 'New home equity line with ' + lenderName(S), sections: (S) => {
        const o = S.offer.raw;
        return [
          { h: 'Your new line', v: money(o.limit), p: 'Pays off your ' + money(HELOC.balance) + ' balance with ' + mainName(S) + ' and leaves ' + money(o.limit - HELOC.balance) + ' available.' },
          { h: 'Your rate', v: pct(o.apr) + ' APR', p: 'Your payment on the current balance becomes about ' + money(payment(HELOC.balance, o.apr)) + ' a month.' },
          { h: 'Costs', v: o.fee, p: 'You can cancel within three business days at no cost.' },
        ];
      }, consent: 'I have read the summary and the full agreement.', cta: 'Sign and submit', signer: PERSON.first + ' ' + PERSON.last },
      { t: 'tool', lines: ['Sending your signed agreement', (S) => 'Closing with ' + lenderName(S)], done: 'Closed. Your old line is being paid off' },
      { t: 'celebrate', small: true, title: 'Your new line is open', sub: (S) => money(S.offer.raw.limit - HELOC.balance) + ' is ready whenever the bathroom is.', },
      { t: 'bot', text: 'All set. Nothing changes about how you manage it: ask me here or open the ' + BRAND.app + '. I’ll keep watching for the next good moment.' },
      END_ALL,
    ],
    crossNo: [
      { t: 'bot', text: 'No problem. Your line stays exactly as it is. I’ll keep watching with ' + BRAND.name + ' and only bring you something when it is clearly better.' },
      END_ALL,
    ],
  };
}

/* ====================================================================================================================
   INSURANCE PATH: unhappy with Progressive leads to a new auto policy
   ==================================================================================================================== */
function insuranceScenes() {
  const quotes = () => AUTO_QUOTES.map(quoteOffer);
  const [geico, sf] = AUTO_QUOTES;
  const q = (S) => (S.main ? S.main.raw : sf);
  const carrier = (S) => q(S).carrier;
  const QW = BRAND.insuranceCredit;
  const startDay = (S) => (/renewal/i.test(S.v.start || '') ? AUTO_POLICY.renews : 'today');
  const helocOffers = () => HELOC_OFFERS.map((o) => loanOffer(o, 40000, o.id === 'rocket' ? { tag: 'Existing customer special' } : {}));

  return {
    pitch: [
      { t: 'bot', text: (S) => S.lead + '\n\nI work with ' + BRAND.name + ', so I can compare real quotes from other carriers in about a minute, using what I already know about you.\n\nWant me to take a look?' },
      { t: 'choice', options: [{ label: 'Yes, please', say: 'Yes, please.', auto: true }, { label: 'Not right now', say: 'Not right now.', neg: true, go: 'notNow' }] },
      { t: 'goto', scene: 'intake' },
    ],
    agentOpen: [
      { t: 'bot', flag: { text: ASSISTANTS[0] + ' checked in', icon: 'spark' }, text: 'Hi ' + first + '. I’ve been watching for better deals on your insurance and I noticed that ' + sf.carrier + ' has some new rates that are worth checking out. You pay ' + AUTO_CURRENT.carrier + ' ' + money(AUTO_CURRENT.premium) + ' a year for the Highlander right now.\n\nWant me to pull quotes through ' + BRAND.name + ' and compare?' },
      { t: 'choice', options: [{ label: 'Sure, show me', say: 'Sure, show me.', auto: true }, { label: 'Not right now', say: 'Not right now.', neg: true, go: 'notNow' }] },
      { t: 'goto', scene: 'intake' },
    ],
    notNow: [
      { t: 'bot', text: 'No problem, I’ll leave it there. Your renewal is on ' + AUTO_POLICY.renews + ', so I’ll keep an eye on prices with ' + BRAND.name + ' and check back before then.' },
      { t: 'tool', label: BRAND.name, lines: ['Setting a quiet watch on prices'], done: 'Watching prices for you', credit: QW },
      END_SHOP,
    ],
    intake: [
      { t: 'tool', lines: ['Connecting to the ' + BRAND.agent, 'Sharing only what you approved', 'Looking up your vehicle and current policy'], done: 'Connected. Current policy found', credit: QW },
      { t: 'bot', text: 'I already have your address, your vehicle and your current coverage, so there are no long forms. Three preferences only you can tell me:' },
      { t: 'form', title: 'What matters to you?', context: 'Auto insurance', submit: 'Get my quotes', credit: QW, fields: [
        { k: 'goal', type: 'chips', label: 'What matters most?', options: ['Lower price', 'Better coverage', 'Both'], auto: 2 },
        { k: 'deductible', type: 'chips', label: 'A deductible you are comfortable with', options: ['$250', '$500', '$1,000'], auto: 1 },
        { k: 'miles', type: 'slider', label: 'Miles you drive in a year', min: 4000, max: 20000, step: 1000, value: 8000, auto: 12000, fmt: 'miles' },
      ] },
      { t: 'tool', lines: ['Sending your request to the ' + BRAND.agent, 'Getting quotes for your ' + PERSON.vehicle, 'Lining them up against ' + AUTO_CURRENT.carrier], done: '3 quotes from 3 carriers', credit: QW },
      { t: 'bot', text: 'Here are three quotes for the Highlander. Every one of them is lower than what you pay today.' },
      { t: 'offers', context: 'Auto insurance quotes', list: quotes, cta: 'Choose', credit: QW, current: { name: AUTO_CURRENT.carrier, icon: AUTO_CURRENT.icon, text: 'You pay ' + money(AUTO_CURRENT.premium) + ' a year today' } },
      { t: 'bot', text: 'Want my take, or do you already see one you like?' },
      { t: 'choice', options: [
        { label: 'Which would you pick?', say: 'Which one would you pick?', auto: true },
        ...pickOptions(AUTO_QUOTES.map((o) => ({ id: o.id, name: o.carrier })), 'Go with', 'apply').map((o) => ({ ...o, chip: false })),
        THINK,
      ] },
      { t: 'bot', text: '**' + geico.carrier + '** is the lowest at ' + money(geico.premium) + ', with the same liability limits you have now. **' + sf.carrier + '** is ' + money(sf.premium - geico.premium) + ' more a year, but it raises your liability to ' + sf.liability + ' and cuts your deductible in half. It can also bundle with your ' + sf.carrier + ' home policy.' },
      { t: 'compare', kind: 'ins', context: 'Price and coverage', credit: QW, list: quotes, best: 'statefarm', current: AUTO_CURRENT, caption: 'Yearly price, next to what each one covers.' },
      { t: 'bot', text: 'My pick is ' + sf.carrier + ': ' + money(AUTO_CURRENT.premium - sf.premium) + ' less a year than today, with more protection if something goes wrong. If price is all that matters, ' + geico.carrier + ' saves ' + money(AUTO_CURRENT.premium - geico.premium) + '.' },
      { t: 'choice', options: [
        ...pickOptions([sf, geico, AUTO_QUOTES[2]].map((o) => ({ id: o.id, name: o.carrier })), 'Go with', 'apply').map((o, i) => ({ ...o, auto: i === 0 })),
        THINK,
      ] },
    ],
    think: [
      { t: 'bot', text: 'That makes sense, and there is no rush. Your current policy runs until ' + AUTO_POLICY.renews + ' and these quotes are good for 30 days.\n\nI’ll keep watching with ' + BRAND.name + ' and let you know if a better price shows up. Just say the word when you are ready.' },
      { t: 'tool', label: BRAND.name, lines: ['Saving your three quotes', 'Setting a watch on prices'], done: 'Quotes saved. Watching prices for you', credit: QW },
      END_SHOP,
    ],
    apply: [
      { t: 'bot', text: (S) => 'Great. I’ll work with the ' + BRAND.agent + ' to get you covered with ' + carrier(S) + ' right here. Most of the application is already filled in.' },
      { t: 'tool', lines: [(S) => 'Starting your application with ' + carrier(S), 'Filling in what I already know', 'Asking for next steps'], done: 'Application started. 4 steps to go', credit: QW },
      { t: 'review', context: 'Your application', title: 'Here is what I filled in', credit: QW, rows: (S) => [
        ['Driver', PERSON.first + ' ' + PERSON.last], ['Address', PERSON.address], ['Vehicle', PERSON.vehicle],
        ['Liability', q(S).liability], ['Deductible', money(q(S).deductible)], ['Price', money(q(S).premium) + ' a year'],
      ], cta: 'Looks right', done: 'Confirmed' },
      { t: 'tool', lines: ['Getting next steps from the ' + BRAND.agent], done: 'Next: verify record, coverage and vehicle', credit: QW },
      { t: 'bot', text: (S) => carrier(S) + ' needs to verify three things. I can connect each one securely, so there is nothing to look up.' },
      { t: 'checklist', context: 'Secure connections', title: 'Connect your information', cta: 'Connect all three', credit: QW, items: [
        { icon: 'id', title: 'Driving record', sub: 'Illinois driver records', done: 'Clean record for 5 years' },
        { icon: 'shield', title: 'Current policy', sub: 'Import from ' + AUTO_CURRENT.carrier, done: 'Imported. No gaps in coverage' },
        { icon: 'car', title: 'Vehicle', sub: 'Look up by VIN', done: PERSON.vehicle + ' confirmed' },
      ], foot: 'Read-only. You can disconnect any of these at any time.' },
      { t: 'tool', lines: ['Sending verifications to the ' + BRAND.agent, 'Checking what is left'], done: 'Verified. 3 questions and 3 items left', credit: QW },
      { t: 'bot', text: 'All three are verified. Now a few questions I can’t answer for you:' },
      { t: 'form', title: 'A few quick questions', context: 'Your application', submit: 'Continue', credit: QW, fields: [
        { k: 'drivers', type: 'chips', label: 'Who else drives the Highlander?', options: ['Just me', 'My spouse too'], auto: 0 },
        { k: 'start', type: 'chips', label: 'When should coverage start?', options: ['Today', 'At renewal, ' + AUTO_POLICY.renews], auto: 0 },
        { k: 'payFrom', type: 'account', label: (S) => 'Pay ' + perMonth(q(S).premium) + ' a month from', ids: ['fifththird', 'chase'], auto: 'fifththird' },
      ] },
      { t: 'tool', lines: ['Passing your answers to the ' + BRAND.agent, 'Asking what is still needed'], done: '3 final items', credit: QW },
      { t: 'bot', text: 'Last stretch. There are three final items and I can handle all of them. OK to go ahead?' },
      { t: 'checklist', context: 'Final items', title: 'Finishing up', cta: 'Go ahead', credit: QW, items: [
        { icon: 'doc', title: 'Proof of prior coverage', sub: 'From your ' + AUTO_CURRENT.carrier + ' policy', done: 'Shared' },
        { icon: 'file', title: 'Vehicle registration', sub: 'From your saved documents', done: 'Shared' },
        { icon: 'swap', title: 'Cancel ' + AUTO_CURRENT.carrier, sub: 'On the day your new coverage starts', done: 'Scheduled. Refund of unused premium requested' },
      ] },
      { t: 'tool', lines: [(S) => 'Final review with ' + carrier(S), 'Clearing the final conditions'], done: 'Approved. Ready to sign', credit: QW },
      { t: 'goto', scene: 'sign' },
    ],
    sign: [
      { t: 'bot', text: 'You’re approved. The ' + BRAND.agent + ' sent your policy and asked me to walk you through it before you sign. Here it is in plain language:' },
      { t: 'contract', context: 'Your policy', credit: QW, title: (S) => 'Auto policy with ' + carrier(S), sections: (S) => [
        { h: 'What is covered', v: q(S).liability, p: 'Liability for injuries and damage you cause, plus collision and comprehensive for your ' + PERSON.vehicle + '.' },
        { h: 'Your deductible', v: money(q(S).deductible), p: 'What you pay toward a repair before the policy pays. It is ' + money(AUTO_CURRENT.deductible) + ' today.' },
        { h: 'Your price', v: money(q(S).premium) + ' a year', p: perMonth(q(S).premium) + ' a month, paid automatically. Locked for 12 months.' },
        { h: 'When it starts', v: startDay(S) === 'today' ? 'Today' : startDay(S), p: 'Your ' + AUTO_CURRENT.carrier + ' policy ends the same day, so there is no gap and no overlap.' },
        { h: 'Changing your mind', v: 'Any time', p: 'Cancel whenever you like and get back what you have not used.' },
      ], consent: 'I have read the summary and the full policy.', cta: 'Sign and start coverage', signer: PERSON.first + ' ' + PERSON.last },
      { t: 'tool', lines: ['Sending your signed application', (S) => 'Binding your policy with ' + carrier(S), 'Confirming the switch from ' + AUTO_CURRENT.carrier], done: 'Policy bound. Coverage confirmed', credit: QW },
      { t: 'celebrate', title: 'You’re covered', sub: (S) => 'Your ' + carrier(S) + ' policy is in effect' + (startDay(S) === 'today' ? '.' : ' from ' + startDay(S) + '.'), idcard: (S) => ({ carrier: carrier(S), icon: q(S).icon, name: PERSON.first + ' ' + PERSON.last, vehicle: PERSON.vehicle, policy: 'LT-48-2206-71', status: startDay(S) === 'today' ? 'Active today' : 'Starts ' + startDay(S) }), credit: QW },
      { t: 'bot', text: (S) => 'Congratulations, ' + first + '. The ' + BRAND.agent + ' confirmed your policy is bound, and your ID card is saved here whenever you need it. You are saving ' + money(AUTO_CURRENT.premium - q(S).premium) + ' a year.\n\nOne more thing that will make this easier to live with:' },
      APP_CARD('policy'),
      { t: 'bot', text: 'The app is optional. If you skip it, you can still manage everything right here, and I’ll stay connected to ' + BRAND.name + ' through MCP.' },
      END_SHOP,
    ],

    /* ----- servicing ----- */
    svcTransfer: transferScene('auto insurance', perMonth(sf.premium), 'the 14th'),
    svcSpecific: [
      { t: 'divider', text: 'A few months later' },
      { t: 'bot', flag: { text: 'Intelligence from ' + BRAND.name }, text: 'Sorry about that fender-bender, ' + first + '. Let me grab your insurance info and we’ll get that claim started.' },
      { t: 'tool', lines: ['Getting your policy from the ' + BRAND.agent, 'Checking your coverage'], done: (S) => carrier(S) + ' policy active. Collision covered', credit: QW },
      { t: 'bot', text: (S) => 'Good news first: you are covered for this, and your deductible is ' + money(q(S).deductible) + '. Let’s start with what happened.' },
      { t: 'form', title: 'What happened?', context: 'Start a claim', submit: 'Continue', credit: QW, fields: [
        { k: 'what', type: 'chips', label: 'Which is closest?', options: ['I was rear-ended', 'I hit another car', 'Parking lot bump', 'Something else'], auto: 0 },
        { k: 'hurt', type: 'chips', label: 'Is anyone hurt?', options: ['No', 'Yes'], auto: 0 },
      ] },
      { t: 'bot', text: 'Thanks. I have the time and place from your phone, so just fix anything that is off. A few photos will speed things up.' },
      { t: 'form', title: 'When and where', context: 'Start a claim', submit: 'Continue', credit: QW, fields: [
        { k: 'when', type: 'text', label: 'When', value: 'Today, 5:42 PM', icon: 'clock' },
        { k: 'where', type: 'text', label: 'Where', value: 'Ogden Ave and Washington St, ' + PERSON.city, icon: 'pin' },
        { k: 'photos', type: 'photos', label: 'Photos of the damage', slots: ['Your car', 'Their car', 'The scene'] },
      ] },
      { t: 'bot', text: 'Those help a lot. Last part: the other driver.' },
      { t: 'form', title: 'The other driver', context: 'Start a claim', submit: 'Start my claim', credit: QW, fields: [
        { k: 'otherName', type: 'text', label: 'Their name', value: '', auto: 'Jordan Blake', placeholder: 'Full name' },
        { k: 'otherPlate', type: 'text', label: 'License plate', value: '', auto: 'DK4 2291', placeholder: 'Plate number' },
        { k: 'otherIns', type: 'chips', label: 'Their insurance', options: ['Allstate', 'GEICO', 'Nationwide', 'Not sure'], auto: 0 },
      ] },
      { t: 'tool', lines: ['Filing your claim through the ' + BRAND.agent, (S) => 'Sending photos and details to ' + carrier(S), 'Getting your next steps'], done: 'Claim opened', credit: QW },
      { t: 'receipt', context: 'Your claim', credit: QW, title: 'Your claim is started', rows: (S) => [
        ['Claim number', 'CLM-7702-4418'], ['Carrier', carrier(S)], ['Vehicle', PERSON.vehicle], ['Your deductible', money(q(S).deductible)],
      ], nextTitle: 'What happens next', next: [
        'An adjuster calls you within one business day.',
        'Pick a repair shop. I found two near you with openings this week.',
        'A rental car is covered while yours is in the shop.',
      ] },
      { t: 'bot', text: 'It is filed, and everything the adjuster needs is attached. I’ll check in when they respond and can book the repair shop for you. For now, take a breath. This part is handled.' },
    ],

    cross: [
      { t: 'divider', text: 'Six months in' },
      { t: 'bot', flag: { text: ASSISTANTS[0] + ' checked in', icon: 'spark' }, text: 'Hey there. Looks like you’re about halfway through your first year of coverage, and I did a quick check to see if we can optimize in any way.' },
      { t: 'tool', lines: ['Reviewing your policy with the ' + BRAND.agent, 'Checking current prices and specials', 'Looking across your loans and your home'], done: 'Coverage looks right. 1 opportunity found', credit: null },
      { t: 'bot', flag: { text: 'Intelligence from ' + BRAND.name }, text: 'Your auto policy is still the best price for what it covers, so nothing to change there.\n\nOne thing did come up. Looks like ' + ROCKET.lender + ' is running a special on HELOCs right now for existing customers, and based on your mortgage status and the value of your home, it looks like you could get up to ' + money(ROCKET.limit) + ', which could be enough to redo your bathroom. Want me to shop that around or initiate with Rocket?' },
      { t: 'choice', options: [
        { label: 'Shop it around', say: 'Shop it around.', auto: true, match: /shop|around|compare/i },
        { label: 'Start with Rocket', say: 'Start with Rocket.', go: 'crossConfirm', set: { sel: 'rocket', list: 'heloc' }, match: /rocket|initiate|start/i },
        { label: 'Not right now', say: 'Not right now.', neg: true, go: 'crossNo' },
      ] },
      { t: 'bot', text: 'On it. Since you already have a policy through ' + BRAND.name + ', I can reuse what you shared then: who you are, your address, your income and your bank link.' },
      { t: 'tool', lines: ['Sharing your existing profile with the ' + BRAND.agent, 'Asking lenders for home equity offers'], done: '3 offers. Nothing new needed from you' },
      { t: 'offers', context: 'Home equity offers', list: helocOffers, cta: 'Choose', listKey: 'heloc', foot: 'Checking these did not affect your credit.' },
      { t: 'bot', text: 'Rocket’s special has the lowest rate, and because they already hold your mortgage there is less to verify. ' + HELOC_OFFERS[0].lender + ' is faster if the bathroom can’t wait.' },
      { t: 'choice', options: [
        ...pickOptions([ROCKET, HELOC_OFFERS[0], HELOC_OFFERS[2]].map((o) => ({ id: o.id, name: o.lender })), 'Go with', 'crossConfirm', { list: 'heloc' }).map((o, i) => ({ ...o, auto: i === 0 })),
        { label: 'Not right now', say: 'Not right now.', neg: true, go: 'crossNo' },
      ] },
    ],
    crossConfirm: [
      { t: 'tool', lines: ['Reusing what you already verified', (S) => 'Starting with ' + lenderName(S), 'Confirming your home value'], done: 'Approved. One signature needed' },
      { t: 'bot', text: (S) => 'That was quick, because ' + lenderName(S) + ' could use what you already shared. Here is the short version of the agreement:' },
      { t: 'contract', context: 'Your agreement', title: (S) => 'Home equity line with ' + lenderName(S), sections: (S) => {
        const o = S.offer.raw;
        return [
          { h: 'Your line', v: money(o.limit), p: 'Borrow what you need, when you need it. You pay interest only on what you draw.' },
          { h: 'Your rate', v: pct(o.apr) + ' APR', p: 'A variable rate that follows the prime rate. No penalty for paying early.' },
          { h: 'Costs', v: o.fee, p: 'You can cancel within three business days at no cost.' },
        ];
      }, consent: 'I have read the summary and the full agreement.', cta: 'Sign and submit', signer: PERSON.first + ' ' + PERSON.last },
      { t: 'tool', lines: ['Sending your signed agreement', (S) => 'Closing with ' + lenderName(S)], done: 'Closed. Your line is open' },
      { t: 'celebrate', small: true, title: 'Your line is open', sub: (S) => money(S.offer.raw.limit) + ' is ready whenever the bathroom is.' },
      { t: 'bot', text: 'All set. Your loan now sits next to your policy: ask me about either one here, or open the ' + BRAND.app + '. I’ll keep watching for the next good moment.' },
      END_ALL,
    ],
    crossNo: [
      { t: 'bot', text: 'No problem. Everything stays exactly as it is. I’ll keep watching with ' + BRAND.name + ' and only bring you something when it is clearly worth it.' },
      END_ALL,
    ],
  };
}

/* ---------- the low-balance transfer, shared by both paths ---------- */
function transferScene(what, amount, due) {
  const short = MORTGAGE.payment + 400 - PAY_FROM.balance;
  const suggested = Math.ceil(short / 500) * 500;
  const amounts = [suggested / 2, suggested, suggested * 2];
  const num = (S) => Number(String(S.v.xferAmount || '').replace(/[^\d.]/g, '')) || suggested;
  const from = (S) => bank(S.v.xferFrom || 'ally');
  return [
    { t: 'divider', text: 'Three weeks later' },
    { t: 'bot', flag: { text: 'Noticed through ' + BRAND.name }, text: 'Hi ' + first + '. Your automatic payment of ' + amount + ' for your ' + what + ' is coming up in a few days, on ' + due + ', but I noticed your bank account where you usually make that payment has a lower balance. ' + PAY_FROM.name + ' is at ' + money(PAY_FROM.balance, 2) + ', and your mortgage comes out of it soon after.\n\nWould you like to make a transfer?' },
    { t: 'choice', options: [{ label: 'Yes, let’s move some money', say: 'Yes, let’s move some money.', auto: true }, { label: 'No, I’m covered', say: 'No, I’m covered.', neg: true, go: 'svcTransferNo' }] },
    { t: 'tool', lines: ['Checking your linked accounts through the ' + BRAND.agent], done: '3 accounts linked' },
    { t: 'bot', text: 'Here are your other accounts. I’d pull from savings and leave your everyday checking alone. ' + money(suggested) + ' covers both payments with room to spare.' },
    { t: 'form', title: 'Move money to ' + PAY_FROM.name + ' ••' + PAY_FROM.last4, context: 'Transfer', submit: 'Review transfer', fields: [
      { k: 'xferFrom', type: 'account', label: 'Move from', ids: ['ally', 'chase'], auto: 'ally' },
      { k: 'xferAmount', type: 'chips', label: 'Amount', options: amounts.map((a) => money(a)), auto: 1 },
    ] },
    { t: 'bot', text: (S) => 'Moving **' + money(num(S)) + '** from ' + acct(from(S)) + ' to ' + acct(PAY_FROM) + '. OK to send?' },
    { t: 'choice', options: [{ label: 'Confirm transfer', say: 'Confirm.', auto: true }, { label: 'Cancel', say: 'Cancel that.', neg: true, go: 'svcTransferNo' }] },
    { t: 'tool', lines: ['Sending your transfer through the ' + BRAND.agent], done: 'Transfer complete' },
    { t: 'receipt', context: 'Transfer', title: 'Transfer sent', rows: (S) => [
      ['From', acct(from(S))], ['To', acct(PAY_FROM)], ['Amount', money(num(S), 2)], ['New balance', money(PAY_FROM.balance + num(S), 2)],
    ], foot: 'Arrives today.' },
    { t: 'bot', text: 'Done. Your payment on ' + due + ' is covered. I’ll keep an eye on it each month so this never sneaks up on you.' },
  ];
}
const TRANSFER_NO = [{ t: 'bot', text: 'Got it, nothing moved. I’ll remind you the day before the payment in case anything changes.' }];

/* ---------- what the engine imports ---------- */
export function getScenes(path) {
  const s = path === 'insurance' ? insuranceScenes() : loanScenes();
  s.svcTransferNo = TRANSFER_NO;
  if (!s.svcSpecificNo) s.svcSpecificNo = [];
  return s;
}
/* Which list a chosen offer id belongs to, so S.offer resolves the same way in shopping and in the second pass. */
export function findOffer(path, list, id) {
  const amount = HELOC_ESTIMATE.deckBudget;
  if (list === 'refi') { const o = REFI_OFFERS.find((x) => x.id === id); return o && loanOffer(o, HELOC.balance); }
  if (list === 'heloc' || path === 'loan') { const o = HELOC_OFFERS.find((x) => x.id === id); return o && loanOffer(o, amount); }
  const q = AUTO_QUOTES.find((x) => x.id === id); return q && quoteOffer(q);
}
export const DEFAULT_SEL = { loan: 'figure', insurance: 'statefarm' };
/* The moments a viewer can pick from in servicing when they are driving. */
export const SERVICING = (path) => [
  { scene: 'svcTransfer', label: 'A payment is coming up and the balance is low' },
  { scene: 'svcSpecific', label: path === 'insurance' ? 'A fender-bender: start a claim' : 'Pay the loan off faster' },
  { scene: 'cross', label: 'The halfway check-in and a new offer' },
];
export const MODALS = {
  interstitial: { title: 'That is the shopping journey', text: 'From the first question to a signed agreement, without leaving the conversation. Next comes life after closing.', a: 'Restart', b: 'Jump ahead to servicing' },
  final: { title: 'That is the whole journey', text: 'Shopping, closing, servicing and the next offer, all inside the assistant with ' + BRAND.name + ' behind it.', a: 'Restart', b: (path) => (path === 'loan' ? 'Try the insurance path' : 'Try the loan path') },
  picker: 'Choose a servicing moment',
};
