/* Achieve prototype: client for the assistant. Calls /api/achieve-assistant (Claude); if that is unavailable
   (preview without a key, offline) it falls back to the built-in FAQ so the demo never goes silent.
   Only non-sensitive context is sent: step id, loan amount and purpose, first name, offers. */
import { localAnswer } from './kb.js';

export const DEFAULT_FALLBACK = "Good question. I don't have a confident answer for that, but a loan consultant does. You can choose \"Chat with a human\" or call 833-598-0058.";

export function slimOffers(offers) {
  return (offers || []).map((o) => ({ id: o.id, name: o.name, short: o.short, apr: o.apr, rateType: o.rateType, monthly: o.monthly, term: o.term, fee: o.fee, totalCost: o.totalCost, funding: o.funding, secured: o.secured }));
}

export function slimContext(applicant, extra) {
  const a = applicant || {};
  return Object.assign({ first: a.first || '', amount: a.amount || null, purpose: a.purpose || '' }, extra || {});
}

export async function ask(messages, ctx, opts) {
  const o = opts || {};
  const last = messages.length ? messages[messages.length - 1].content : '';
  try {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), o.timeout || 15000);
    const res = await fetch('/api/achieve-assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
      body: JSON.stringify({ messages: messages.slice(-12), ctx: ctx || {} }),
    });
    clearTimeout(to);
    if (res.ok) {
      const j = await res.json();
      if (j && j.text) return j.text;
    }
  } catch { /* fall through */ }
  return localAnswer(last) || DEFAULT_FALLBACK;
}
