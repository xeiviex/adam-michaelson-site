/* Client for the live agent behind both visiontypes (functions/api/vt-assistant.js).
   ask({ surface, path, stage, step, selected, held, messages }) resolves to { text, action, live }.
   It never rejects. If the agent cannot be reached (no network, no key, running from a plain file server), it answers
   from a small offline fallback so the prototype still responds, and live is false.
   action is one of: continue, pause, loan, insurance, home, restart. See the endpoint for what each means. */

const ENDPOINT = '/api/vt-assistant';

/* Offline: recognise an explicit wish to leave the flow, otherwise give a short, honest holding answer. */
export function offline(q, path) {
  const t = String(q || '').toLowerCase();
  if (/\b(start over|restart|begin again|from the (top|start))\b/.test(t)) return { text: 'No problem. Let’s start again from the top.', action: 'restart' };
  if (/\b(stop|not now|not right now|later|think about it|think it over|never ?mind|cancel|no thanks|i’m done|im done|i'm done)\b/.test(t)) return { text: 'Of course. Nothing is submitted, and I’ll keep what we have so you can pick it up whenever you like.', action: 'pause' };
  if (path !== 'insurance' && /\b(insurance|policy|premium|deductible|progressive|geico|coverage)\b/.test(t) && /\b(instead|switch|rather|shop|look at|help me with)\b/.test(t)) return { text: 'Sure. Let’s look at your insurance instead.', action: 'insurance' };
  if (path !== 'loan' && /\b(loan|heloc|home equity|borrow|mortgage|deck)\b/.test(t) && /\b(instead|switch|rather|shop|look at|help me with)\b/.test(t)) return { text: 'Sure. Let’s look at borrowing instead.', action: 'loan' };
  if (/\b(my (loans|accounts|policies|insurance)|what (do )?i (have|owe|hold)|show me (my|what))\b/.test(t)) return { text: 'Here is everything you hold, in one place.', action: 'home' };
  return { text: 'Good question. I can’t reach the LendingTree agent right now to answer it properly, so I’d rather not guess. Let’s keep going with the step in front of you, and you can ask again in a moment.', action: 'continue' };
}

export async function ask(req) {
  const last = [...(req.messages || [])].reverse().find((m) => m.role === 'user');
  const fallback = () => ({ ...offline(last && last.content, req.path), live: false });
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req), signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) return fallback();
    const out = await res.json();
    if (!out || !out.text) return fallback();
    return { text: out.text, action: out.action || 'continue', live: true };
  } catch (e) {
    return fallback();
  }
}
