/* Achieve debt relief prototype, stage 6: build your fund. Pure data and rules, no DOM.
   Each month the client's deposits grow a fund. When it can cover a first settlement offer, negotiators start.
   Months are estimates from the plan (illustrative ratios); creditors decide the real timing. */
import { money } from './firsttake/shared/flow.js';
import { plan as makePlan } from './consult.js';

export const B_STEPS = ['fund', 'messages', 'boost'];
export const nextBStep = (bdone) => B_STEPS.find((s) => !bdone.includes(s)) || null;
export const bStepLabel = (id) => ({ fund: 'Your fund', messages: 'Staying in touch', boost: 'Speed it up' }[id]);

/* The program's target is everything the plan will cost: settlements plus fees. */
export function model(selected, deposit) {
  const p = makePlan(selected, deposit);
  const monthFor = (pct) => Math.min(p.months, Math.max(1, Math.ceil((pct * p.total) / p.deposit)));
  return Object.assign(p, {
    target: p.total,
    offerMonth: Math.min(p.firstOffer, p.months),
    marks: [{ id: 'q', pct: 0.25, m: monthFor(0.25) }, { id: 'h', pct: 0.5, m: monthFor(0.5) }, { id: 't', pct: 0.75, m: monthFor(0.75) }],
  });
}
/* Where the fund stands at the end of a given month (deposits only; the first deposit is month 1). */
export function at(m, month) {
  const mo = Math.max(1, Math.min(m.months, month));
  const fund = Math.min(m.target, m.deposit * mo);
  const pct = m.target ? fund / m.target : 0;
  return { month: mo, fund, pct, left: m.months - mo, offersOpen: mo >= m.offerMonth, done: mo >= m.months };
}

/* The line that goes with each moment. Warm, specific, and never a promise. */
export function message(m, month, first) {
  const s = at(m, month), n = first || 'friend';
  if (s.done) return 'You did it, ' + n + '. Every settlement is funded.';
  if (s.left === 1) return 'You are one month away from getting this monkey off your back!';
  if (s.pct >= 0.75) return "75% there! The finish line is in sight, " + n + '.';
  if (s.pct >= 0.5) return 'Halfway there! You are past the hard part.';
  if (month === m.offerMonth) return 'Your fund is ready. Negotiators can start asking creditors for offers.';
  if (s.pct >= 0.25) return "You're 25% there! Keep going!";
  if (month === 1) return 'Your first deposit is in. Every month from here builds your fund.';
  if (s.offersOpen) return 'Offers can come in any time now. We will bring each one to you.';
  return 'Month ' + month + '. ' + money(s.fund) + ' saved. Steady is the whole game.';
}

/* The milestone list beside the thermometer. */
export function milestones(m, month) {
  const list = [
    { id: 'first', t: 'First deposit', m: 1 },
    { id: 'offers', t: 'Settlement offers can begin', m: m.offerMonth },
    { id: 'q', t: '25% of the way', m: m.marks[0].m },
    { id: 'h', t: 'Halfway', m: m.marks[1].m },
    { id: 't', t: '75% of the way', m: m.marks[2].m },
    { id: 'free', t: 'Debt free, if all goes to plan', m: m.months },
  ].sort((a, b) => a.m - b.m || a.id.localeCompare(b.id));
  return list.map((x) => Object.assign({ done: month >= x.m }, x));
}

/* What an extra deposit does. */
export function withExtra(m, extra) {
  const need = Math.max(0, m.target - Math.max(0, extra));
  const months = Math.min(m.months, Math.max(12, Math.ceil(need / m.deposit)));
  return { months, saved: m.months - months };
}

/* The messages we send to keep a client engaged, by channel. */
export function feed(m, first, depositLabel) {
  const n = first || 'there';
  return [
    { ch: 'email', month: 1, from: 'Achieve', title: 'Welcome to your path, ' + n, body: 'Your first deposit cleared and your fund has started. Here is your timeline, and who to call if you need anything.' },
    { ch: 'text', month: 2, from: 'Achieve', title: 'Deposit reminder', body: n + ', your ' + depositLabel + ' deposit goes out tomorrow. Nothing to do. Just keep the money in your bank.' },
    { ch: 'app', month: m.marks[0].m, from: 'Your specialist', title: "You're 25% of the way", body: 'Nice work, ' + n + '. Want to see how your fund compares with where you started?' },
    { ch: 'text', month: m.offerMonth, from: 'Achieve', title: 'Your fund is ready', body: 'Great news, ' + n + '. Negotiators can start talking to your creditors now. We will bring you every offer.' },
    { ch: 'email', month: m.marks[1].m, from: 'Achieve', title: 'Halfway there', body: 'You are halfway. Here is what you have saved, what is settled, and what is next.' },
    { ch: 'app', month: Math.max(m.marks[2].m, m.months - 1), from: 'Your specialist', title: 'One month to go', body: 'You are about to finish. We will walk you through your last settlement and what to do next.' },
  ];
}
export const CHANNELS = [{ id: 'text', label: 'Text' }, { id: 'email', label: 'Email' }, { id: 'app', label: 'In the app' }];

export const PERSONA_B = { extra: 1000 };
export { money };
