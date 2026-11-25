/* Sample data shared by both visiontypes (/lendingtree/visiontypes/assistant/ and /lendingtree/visiontypes/lifecycle/).
   Everything here is fictional and illustrative: the person, the balances, the offers and the quotes. Real lender and
   carrier names appear only as examples of who could be on the marketplace. */

export const PERSON = {
  first: 'Alex', last: 'Rivera', city: 'Naperville', state: 'IL', address: '418 Juniper Ct, Naperville, IL 60540',
  income: 148000, creditScore: 762, homeValue: 640000, mortgageBalance: 312000,
  vehicle: '2021 Toyota Highlander', pet: 'Biscuit, a 4-year-old golden retriever',
};

export const BRAND = { name: 'LendingTree', agent: 'LendingTree agent', insuranceCredit: 'Powered by QuoteWizard', app: 'LendingTree app' };

/* The assistant could be any of these; the visiontype is drawn in ChatGPT. */
export const ASSISTANTS = ['ChatGPT', 'Muse', 'Grok', 'Instinct'];

export const BANKS = [
  { id: 'chase', bank: 'Chase', name: 'Total Checking', last4: '4471', balance: 6240.18, primary: true },
  { id: 'ally', bank: 'Ally', name: 'Savings', last4: '9038', balance: 28410.55 },
  { id: 'fifththird', bank: 'Fifth Third', name: 'Joint Checking', last4: '2206', balance: 1885.4 },
];

/* What Alex already holds. The loan the shopping flow closes (HELOC) and the policy it binds (auto) are added to these. */
export const LOANS = [
  { id: 'mortgage', type: 'Mortgage', lender: 'Rocket Mortgage', balance: 312000, rate: 5.875, payment: 2315, due: 'the 1st', original: 380000 },
  { id: 'auto', type: 'Auto loan', lender: 'Toyota Financial', balance: 18400, rate: 6.4, payment: 512, due: 'the 12th', original: 36000 },
  { id: 'heloc', type: 'Home equity line', lender: 'Figure', balance: 42000, limit: 75000, rate: 7.9, payment: 386, due: 'the 20th', isNew: true },
];

export const POLICIES = [
  { id: 'auto', type: 'Auto', carrier: 'Progressive', icon: 'progressive', premium: 2184, per: 'year', renews: 'Mar 14', covers: '2021 Toyota Highlander' },
  { id: 'home', type: 'Homeowners', carrier: 'State Farm', icon: 'state-farm', premium: 1920, per: 'year', renews: 'Aug 2', covers: '418 Juniper Ct' },
  { id: 'life', type: 'Life', carrier: 'Nationwide', icon: 'nationwide', premium: 54, per: 'month', renews: 'Level term to 2046', covers: '$750,000, 20-year term' },
  { id: 'medical', type: 'Medical', carrier: 'Employer plan (Blue Cross)', icon: null, premium: 310, per: 'month', renews: 'Jan 1', covers: 'Family PPO' },
  { id: 'dental', type: 'Vision and dental', carrier: 'Employer plan (Delta Dental)', icon: null, premium: 42, per: 'month', renews: 'Jan 1', covers: 'Family' },
  { id: 'pet', type: 'Pet', carrier: 'Trupanion', icon: 'trupanion', premium: 68, per: 'month', renews: 'Monthly', covers: 'Biscuit' },
];

/* Loan path: "I want to build a deck in my back yard" leads to a home equity line. */
export const HELOC_OFFERS = [
  { id: 'figure', lender: 'Figure', apr: 7.9, limit: 75000, draw: '5-year draw', fund: 'Funds in 5 days', fee: '$0 closing costs', tag: 'Fastest funding' },
  { id: 'rocket', lender: 'Rocket Mortgage', apr: 7.65, limit: 75000, draw: '10-year draw', fund: 'Funds in 3 weeks', fee: '$495 origination', tag: 'Lowest rate' },
  { id: 'bofa', lender: 'Bank of America', apr: 8.15, limit: 90000, draw: '10-year draw', fund: 'Funds in 4 weeks', fee: '$0 closing costs', tag: 'Highest limit' },
];
export const HELOC_ESTIMATE = { max: 300000, deckBudget: 42000 };

/* Insurance path: "I'm not happy with Progressive" leads to an auto insurance comparison. Icons are in /lendingtree/img/carriers/<icon>-icon.png. */
export const AUTO_QUOTES = [
  { id: 'geico', carrier: 'GEICO', icon: 'geico', premium: 1716, deductible: 500, liability: '100/300/100', tag: 'Lowest price' },
  { id: 'statefarm', carrier: 'State Farm', icon: 'state-farm', premium: 1802, deductible: 500, liability: '250/500/100', tag: 'Bundle with your home policy' },
  { id: 'travelers', carrier: 'Travelers', icon: 'travelers', premium: 1894, deductible: 250, liability: '250/500/100', tag: 'Lowest deductible' },
];
export const AUTO_CURRENT = { carrier: 'Progressive', icon: 'progressive', premium: 2184, deductible: 1000, liability: '100/300/100' };

/* The nine lifecycle stations both visiontypes cover. */
export const LIFECYCLE = ['Lead', 'MQL', 'Application', 'Offers and quotes', 'Review and selection', 'Funding or binding', 'Servicing', 'Regular engagement', 'Renewal or upgrade'];

export const money = (n, d = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/* Lender and bank logos, by the name shown in the prototypes. Icons are in /lendingtree/img/lenders/<id>-icon.png
   (square mark) with a <id>-full.png wordmark beside each. A name without an entry falls back to its initials. */
export const LENDER_ICONS = {
  Figure: 'figure', 'Rocket Mortgage': 'rocket-mortgage', Rocket: 'rocket-mortgage', 'Bank of America': 'bank-of-america', 'Toyota Financial': 'toyota-financial',
  Chase: 'chase', Ally: 'ally', 'Fifth Third': 'fifth-third',
};
export const lenderIcon = (name) => (LENDER_ICONS[name] ? '/lendingtree/img/lenders/' + LENDER_ICONS[name] + '-icon.png' : null);
