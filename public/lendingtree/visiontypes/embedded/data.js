/* Visiontype C (embedded): every piece of sample data for the prototype, as plain data with named exports and no DOM code,
   so the live agent endpoint (functions/api/vt-assistant.js) can import the same facts the screens show.
   Everything here is fictional and illustrative. The marketplace is an invented brand. Real vehicle, lender and carrier
   names appear only as examples of who could be on the marketplace. The person and the policies they already hold come
   from ../shared/data.js. */
import { PERSON, POLICIES, AUTO_QUOTES } from '../shared/data.js';

/* The marketplace LendingTree is embedded in. Change the name here and it changes everywhere. */
export const MARKET = {
  name: 'Keyturn',
  domain: 'keyturn.com',
  tagline: 'Used cars, delivered',
  hub: 'Keyturn Chicagoland hub, Aurora, IL',
  support: '(800) 555-0199',
};

/* What the simulated Google account shares with the marketplace. */
export const GOOGLE_PROFILE = { name: `${PERSON.first} ${PERSON.last}`, email: 'alex.rivera@gmail.com', phone: '(630) 555-0142', initials: 'AR' };
export const ADDRESS_SUGGESTIONS = [PERSON.address, '418 Juniper Ln, Aurora, IL 60504', '4180 Juniper Rd, Lisle, IL 60532'];

export const SEARCH = { make: 'Toyota', model: 'Tacoma', near: `${PERSON.city}, ${PERSON.state}`, zip: '60540', total: 128 };

/* Photos are in ./img/. The first listing is the one the journey follows; the others share a simpler treatment. */
const IMG = '/lendingtree/visiontypes/embedded/img/';
export const LISTINGS = [
  {
    id: 'tacoma', stock: 'KT48213', year: 2023, make: 'Toyota', model: 'Tacoma', trim: 'TRD Off-Road', body: 'Double Cab', drive: '4WD',
    miles: 21412, price: 38900, market: 40050, deal: 'Great price', color: 'Lunar Rock', interior: 'Black fabric',
    engine: '3.5L V6, 278 hp', transmission: '6-speed automatic', mpg: '18 city / 22 highway', bed: '5 ft bed', vinTail: '4213', location: 'Aurora, IL', distance: 9,
    thumb: IMG + 'tacoma-thumb.jpg',
    photos: [
      { src: IMG + 'tacoma-1-front.jpg', alt: 'Front three-quarter view' },
      { src: IMG + 'tacoma-2-side.jpg', alt: 'Side profile' },
      { src: IMG + 'tacoma-3-rear.jpg', alt: 'Rear three-quarter view' },
      { src: IMG + 'tacoma-4-interior.jpg', alt: 'Interior and dashboard' },
      { src: IMG + 'tacoma-5-bed.jpg', alt: 'Cargo bed' },
      { src: IMG + 'tacoma-6-wheel.jpg', alt: 'Wheel and tire' },
    ],
    history: [
      { title: 'No accidents reported', sub: 'Checked against national records' },
      { title: 'One owner', sub: 'Personal use, bought new in Illinois' },
      { title: 'Clean title', sub: 'No liens, floods or buybacks' },
      { title: '6 service records', sub: 'Last serviced at 20,180 miles' },
    ],
    features: ['Locking rear differential', 'Crawl Control', 'Multi-Terrain Select', 'Bilstein shocks', 'Apple CarPlay and Android Auto', '8-inch touchscreen', 'Heated front seats', 'Blind spot monitor', 'Adaptive cruise control', 'Lane departure alert', 'LED headlights', 'Tow package, 6,400 lb', 'Bed liner and rail system', 'Backup camera', 'Smart key with push start', 'All-terrain tires, 80% tread'],
  },
  { id: 'black', stock: 'KT47750', year: 2022, make: 'Toyota', model: 'Tacoma', trim: 'TRD Off-Road', body: 'Double Cab', drive: '4WD', miles: 29750, price: 37200, market: 37600, deal: 'Good price', color: 'Midnight Black Metallic', interior: 'Black fabric', engine: '3.5L V6, 278 hp', transmission: '6-speed automatic', mpg: '18 city / 22 highway', bed: '5 ft bed', vinTail: '7750', location: 'Joliet, IL', distance: 18, photo: IMG + 'listing-black.jpg' },
  { id: 'blue', stock: 'KT46391', year: 2021, make: 'Toyota', model: 'Tacoma', trim: 'TRD Sport', body: 'Double Cab', drive: '4WD', miles: 34880, price: 35600, market: 35900, deal: 'Good price', color: 'Cavalry Blue', interior: 'Black fabric', engine: '3.5L V6, 278 hp', transmission: '6-speed automatic', mpg: '18 city / 22 highway', bed: '5 ft bed', vinTail: '6391', location: 'Schaumburg, IL', distance: 24, photo: IMG + 'listing-blue.jpg' },
  { id: 'grey', stock: 'KT45108', year: 2019, make: 'Toyota', model: 'Tacoma', trim: 'Limited', body: 'Double Cab', drive: '4WD', miles: 61400, price: 31900, market: 31700, deal: 'Fair price', color: 'Magnetic Gray Metallic', interior: 'Hickory leather', engine: '3.5L V6, 278 hp', transmission: '6-speed automatic', mpg: '18 city / 22 highway', bed: '5 ft bed', vinTail: '5108', location: 'Aurora, IL', distance: 9, photo: IMG + 'listing-grey.jpg' },
  { id: 'white', stock: 'KT44872', year: 2019, make: 'Toyota', model: 'Tacoma', trim: 'SR5', body: 'Double Cab', drive: '4WD', miles: 58210, price: 29400, market: 30300, deal: 'Great price', color: 'Super White', interior: 'Cement fabric', engine: '3.5L V6, 278 hp', transmission: '6-speed automatic', mpg: '18 city / 22 highway', bed: '5 ft bed', vinTail: '4872', location: 'Rockford, IL', distance: 71, photo: IMG + 'listing-white.jpg' },
  { id: 'silver', stock: 'KT43365', year: 2020, make: 'Toyota', model: 'Tacoma', trim: 'SR', body: 'Access Cab', drive: '2WD', miles: 44120, price: 24800, market: 25100, deal: 'Good price', color: 'Silver Sky Metallic', interior: 'Cement fabric', engine: '2.7L 4-cylinder, 159 hp', transmission: '6-speed automatic', mpg: '20 city / 23 highway', bed: '6 ft bed', vinTail: '3365', location: 'Gary, IN', distance: 52, photo: IMG + 'listing-silver.jpg' },
];
export const HERO_ID = 'tacoma';
export const carName = (c) => `${c.year} ${c.make} ${c.model} ${c.trim}`;

/* Taxes and fees on the purchase (Illinois, illustrative). */
export const FEES = { taxRate: 0.0725, titleRegistration: 316, documentation: 358, delivery: 0 };
export function priceBreakdown(car) {
  const tax = Math.round(car.price * FEES.taxRate);
  return { price: car.price, tax, titleRegistration: FEES.titleRegistration, documentation: FEES.documentation, delivery: FEES.delivery, total: car.price + tax + FEES.titleRegistration + FEES.documentation + FEES.delivery };
}

/* Loan arithmetic, shared by the screens and the agent. */
export function monthlyPayment(principal, apr, months) {
  const r = apr / 1200;
  return r ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
}
export function loanNumbers(offer, financed) {
  const payment = Math.round(monthlyPayment(financed, offer.apr, offer.term));
  return { payment, interest: payment * offer.term - financed, total: payment * offer.term };
}

/* The financing application: defaults, and what the person tells LendingTree. Sensitive values are fixed samples. */
export const FINANCE = { down: 4000, downChoices: [2000, 4000, 6000, 8000], downMax: 15000, term: 72, terms: [48, 60, 72], estimateApr: 6.5 };
export const APPLICANT = {
  employment: 'Employed full time', employer: 'Northfield Design Co.', income: PERSON.income,
  housing: 'Own, with a mortgage', housingPayment: 2315,
  dob: '04/12/1988', ssnLast4: '6789', creditScore: PERSON.creditScore,
};

/* Auto loan offers from three lenders, for the amount financed. */
export const AUTO_LOAN_OFFERS = [
  { id: 'bofa', lender: 'Bank of America', apr: 6.19, term: 72, tag: 'Lowest payment', fee: 'No origination fee', firstPayment: 30, perk: 'Rate includes a 0.25% autopay discount' },
  { id: 'chase', lender: 'Chase', apr: 5.89, term: 60, tag: 'Least interest', fee: 'No origination fee', firstPayment: 30, perk: 'Pay it off a year sooner' },
  { id: 'ally', lender: 'Ally', apr: 6.74, term: 72, tag: 'First payment in 60 days', fee: 'No origination fee', firstPayment: 60, perk: 'Skip a payment once a year' },
];
/* Which offer the advisor recommends, by the term the person asked for. */
export const LOAN_RECOMMEND = { 48: 'chase', 60: 'chase', 72: 'bofa' };
export const LENDERS_CHECKED = ['Bank of America', 'Chase', 'Ally', 'Capital One', 'and 14 more'];

/* Insurance. The existing Progressive policy covers the Highlander; adding the Tacoma to it costs ADD_TO_CURRENT a year.
   The quotes cover both vehicles; the Highlander part matches the quotes in ../shared/data.js. */
const current = POLICIES.find((p) => p.id === 'auto');
export const CURRENT_POLICY = { carrier: current.carrier, icon: current.icon, premium: current.premium, renews: current.renews, covers: current.covers, deductible: 1000, liability: '100/300/100' };
export const ADD_TO_CURRENT = 1428;
export const CURRENT_WITH_TACOMA = { carrier: current.carrier, icon: current.icon, highlander: current.premium, tacoma: ADD_TO_CURRENT, total: current.premium + ADD_TO_CURRENT, deductible: 1000, liability: '100/300/100' };
const hl = (id) => AUTO_QUOTES.find((q) => q.id === id).premium;
export const TWO_CAR_QUOTES = [
  { id: 'statefarm', carrier: 'State Farm', icon: 'state-farm', highlander: hl('statefarm'), tacoma: 1146, deductible: 500, liability: '250/500/100', tag: 'Bundles with your home policy' },
  { id: 'geico', carrier: 'GEICO', icon: 'geico', highlander: hl('geico'), tacoma: 1128, deductible: 500, liability: '100/300/100', tag: 'Lowest price' },
  { id: 'liberty', carrier: 'Liberty Mutual', icon: 'liberty-mutual', highlander: hl('liberty'), tacoma: 1210, deductible: 250, liability: '250/500/100', tag: 'Lowest deductible' },
].map((q) => ({ ...q, total: q.highlander + q.tacoma, saving: current.premium + ADD_TO_CURRENT - q.highlander - q.tacoma }));
export const INSURANCE_RECOMMEND = 'statefarm';
export const CARRIERS_CHECKED = ['State Farm', 'GEICO', 'Liberty Mutual', 'Allstate', 'Travelers', 'and 9 more'];

/* Delivery. */
export const DELIVERY = { windows: ['9am to 12pm', '12pm to 4pm', '4pm to 7pm'], firstDay: 5, days: 3, pickupDay: 3, returnDays: 7, returnMiles: 400 };
export const ORDER_NUMBER = 'KT-482913';
