/* Achieve prototype: sample offers. Every option is an Achieve product (Achieve is the lender).
   Rates, fees and terms are illustrative sample data for the prototype, not real Achieve pricing. */
import { money } from './flow.js';

export const pmt = (P, apr, n) => {
  const r = apr / 100 / 12;
  return r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
};

export function buildOffers(a) {
  const amount = Math.max(5000, Math.min(50000, Number(a.amount) || 20000));
  const income = Number(a.income) || 50000;
  const owns = a.housing === 'own_mortgage' || a.housing === 'own_free';
  const ratio = (income + (Number(a.coIncome) || 0)) / amount;
  let adj = ratio >= 5 ? -1 : ratio >= 3 ? 0 : 1.5;
  if (Number(a.retirement) >= 50000) adj -= 0.25;
  if (Number(a.payoff) > 0) adj -= 0.25;   // paying creditors directly earns a small rate discount
  const apr = (base) => Math.round((base + adj) * 100) / 100;

  const list = [
    { id: 'term36', type: 'term', kind: 'Personal loan', name: 'Achieve Personal Loan', short: '36 months', term: 36, apr: apr(11.99), rateType: 'Fixed', feePct: 3.99, funding: 'As soon as 24-72 hours', secured: false,
      blurb: 'Pay it off fastest with a fixed payment that never changes.',
      pros: ['Fixed rate and payment', 'Lowest total interest of the loans', 'No prepayment penalty'], cons: ['Higher monthly payment than the 60-month loan'] },
    { id: 'term60', type: 'term', kind: 'Personal loan', name: 'Achieve Personal Loan', short: '60 months', term: 60, apr: apr(13.49), rateType: 'Fixed', feePct: 3.99, funding: 'As soon as 24-72 hours', secured: false,
      blurb: 'A lower monthly payment, spread over five years.',
      pros: ['Fixed rate and payment', 'Lower monthly payment', 'No prepayment penalty'], cons: ['More total interest over the longer term'] },
    { id: 'loc', type: 'loc', kind: 'Line of credit', name: 'Achieve Line of Credit', short: 'Revolving, 7-year term', term: 84, apr: apr(14.99), rateType: 'Variable', feePct: 2.5, funding: 'Access in about 3-5 business days', secured: false,
      blurb: 'Borrow what you need, when you need it, and pay interest only on what you use.',
      pros: ['Draw funds as you go', 'Interest only on what you borrow', 'Reuse it as you repay'], cons: ['Rate can change over time', 'Payment can change with the rate'] },
  ];
  if (owns && amount >= 15000) {
    list.push({ id: 'heloc', type: 'heloc', kind: 'HELOC', name: 'Achieve Fixed-Rate HELOC', short: 'Secured by your home, 10 years', term: 120, apr: apr(8.49), rateType: 'Fixed', feePct: 3.0, funding: 'About 10-14 days (home valuation)', secured: true,
      blurb: 'The lowest rate and payment, because your home secures it.',
      pros: ['Lowest APR of your options', 'Fixed rate and payment', 'Longest term, lowest monthly payment'], cons: ['Your home is collateral', 'Slowest to fund (home valuation)'] });
  }
  for (const o of list) {
    o.amount = amount;
    o.amountLabel = o.type === 'term' ? 'Loan amount' : 'Credit line';
    o.fee = Math.round((amount * o.feePct) / 100);
    o.monthly = Math.round(pmt(amount, o.apr, o.term));
    o.totalCost = o.monthly * o.term + o.fee;
    o.interest = o.monthly * o.term - amount;
    o.tags = [];
  }
  const by = (k, dir) => list.slice().sort((x, y) => (x[k] - y[k]) * dir)[0];
  by('monthly', 1).tags.push('Lowest payment');
  by('totalCost', 1).tags.push('Lowest total cost');
  list[0].tags.push('Fastest funding');
  const pop = list.find((o) => o.id === 'term60');
  if (pop) pop.tags.push('Most popular');
  return list;
}

export const offerLine = (o) => `${o.name} (${o.short}): ${money(o.amount)} ${o.amountLabel.toLowerCase()}, ${o.apr}% APR ${o.rateType.toLowerCase()}, ${money(o.monthly)} a month, ${o.feePct}% fee (${money(o.fee)}), est. total ${money(o.totalCost)}`;

export const SAMPLE_NOTE = 'Sample offers for this prototype. Rates and terms are illustrative, not real Achieve pricing, and nothing here is a credit decision.';
