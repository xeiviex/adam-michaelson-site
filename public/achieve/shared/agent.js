/* Achieve prototype: the "chasing" agent used by Messages and ChatGPT.
   It knows where the applicant dropped out (from the shared session), asks for the next missing item as plain
   conversation, never takes anything sensitive (SSN, date of birth, documents, offers), and sends a link back
   to the exact spot in the web funnel instead. Anyone can ask it a question at any time; it answers, then
   gently returns to the question it was on. */
import * as F from './flow.js';
import { slimContext, slimOffers } from './bot.js';
import { buildOffers } from './offers.js';

const has = (v) => v !== undefined && v !== null && v !== '';
const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];
const WORDS = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;

export const isQuestion = (t) => {
  const s = String(t || '').trim();
  const w = WORDS(s);
  return (/\?\s*$/.test(s) && w > 3) || (/^(what|why|how|when|where|who|which|is|are|can|could|do|does|will|would|should|tell me|explain)\b/i.test(s) && w >= 3);
};
const wantsHuman = (t) => /\b(human|real person|representative|agent|consultant|speak to|talk to (a|someone|somebody|an?)|call me)\b/i.test(t);
const wantsLink = (t) => /\b(link|url|where.*(continue|finish)|website|online)\b/i.test(t);
const isGreeting = (t) => /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening))\b[\s!.]*$/i.test(String(t || '').trim());

export function createAgent(o) {
  const S = o.store, channel = o.channel, askFn = o.ask;
  const origin = o.origin || 'https://adam-michaelson.com';
  const state = () => {
    const s = S.get();
    s.agent = s.agent || {};
    return (s.agent[channel] = s.agent[channel] || { pending: null, linked: [], n: 0 });
  };
  const A = () => S.applicant();
  const linkFor = (stepId) => ({ url: origin + '/achieve/' + (stepId ? '?resume=' + stepId : ''), title: 'Continue your Achieve application', host: 'adam-michaelson.com/achieve' });
  const msg = (text, extra) => Object.assign({ text }, extra || {});

  /* Decide what to do next. Completes steps whose answers are all in hand. */
  function work() {
    const a = A(), st = state();
    for (const step of F.STEPS) {
      if (S.isDone(step.id) || st.linked.includes(step.id)) continue;
      if (step.docs || step.offers || step.id === 'ssn') return { kind: 'link', step };
      if (step.review) return { kind: 'review', step };
      if (step.askAll) {
        const need = step.id === 'name' ? !(has(a.first) && has(a.last)) : !(has(a.street) && has(a.city) && has(a.state) && has(a.zip));
        if (need) return { kind: 'ask', step, field: '__all' };
      } else {
        const f = step.fields.find((x) => x.ask && !x.optional && !has(a[x.id]));
        if (f) return { kind: 'ask', step, field: f.id };
      }
      const sens = step.fields.find((x) => x.sensitive && !x.optional && !has(a[x.id]));
      if (sens) return { kind: 'link', step, why: 'sensitive', field: sens };
      S.complete(step.id);
    }
    return { kind: 'done' };
  }

  function summaryLines() {
    const a = A();
    const house = (F.HOUSING.find((h) => h[0] === a.housing) || ['', ''])[1];
    return [
      'Loan: ' + F.money(a.amount) + ' for ' + String(a.purpose || '').toLowerCase(),
      'Name: ' + (a.first || '') + ' ' + (a.last || ''),
      'Address: ' + [a.street, a.city, a.state, a.zip].filter(Boolean).join(', '),
      'Email: ' + (a.email || '') + ', phone ' + (a.phone || ''),
      'Home: ' + house + ', ' + F.money(a.housingPayment) + '/mo',
      'Work: ' + (a.employer || '') + ', ' + (a.employment || 'Full-Time') + ', ' + F.money(a.income) + '/yr',
    ].join('\n');
  }

  /* The message(s) that ask for the next thing. */
  function promptFor(w, o2) {
    const opt = o2 || {};
    const st = state();
    const a = A();
    if (w.kind === 'done') {
      st.pending = null;
      const left = S.nextIncomplete();
      if (!left) return [msg('You are all set. Your offers are ready whenever you are.', { link: linkFor('offers') })];
      const ls = F.stepById(left);
      return [msg("That's everything I can take here. " + (ls.id === 'offers' ? 'Your offers are ready:' : 'The rest (' + ls.label.toLowerCase() + ') is on the secure page. Pick it up right where you left off:'), { link: linkFor(left) })];
    }
    const step = w.step;
    if (w.kind === 'ask') {
      st.pending = { step: step.id, field: w.field };
      const text = w.field === '__all' ? step.askAll.ask : step.fields.find((f) => f.id === w.field).ask;
      return [msg(text)];
    }
    if (w.kind === 'review') {
      st.pending = { step: 'review' };
      return [msg("Here's what I have so far:\n" + summaryLines()), msg('Does that all look right? Reply "yes" to confirm, or tell me what to change.')];
    }
    // link-only step: remember we sent it so we do not nag, and move on to anything else we can ask
    st.pending = null;
    if (!st.linked.includes(step.id)) st.linked.push(step.id);
    const lead = {
      ssn: "Next up is verification. For your security I can't take your Social Security number over " + (channel === 'messages' ? 'text' : 'chat') + ". You can finish it safely here:",
      docs: 'Next is a couple of documents, like your most recent paystub. The easiest way is to upload them here:',
      offers: "Great news" + (a.first ? ', ' + a.first : '') + ': your Achieve options are ready. See them and compare here:',
      name: "I'll also need your date of birth, but for your security please add it on the secure page:",
    }[step.id] || 'The next part needs a secure page. You can pick it up right where you left off:';
    const out = [msg(lead, { link: linkFor(step.id) })];
    if (!opt.noFollow) {
      const nxt = work();
      if (nxt.kind === 'ask') out.push(...promptFor(nxt));
      else if (nxt.kind === 'review') out.push(...promptFor(nxt));
    }
    return out;
  }

  /* First messages when the person lands in this channel. */
  function start() {
    const a = A(), dropped = S.get().dropout;
    const done = S.doneIds();
    const name = a.first;
    const w = work();
    const stepNow = w.step;
    const out = [];
    if (done.length) {
      const mins = F.minsAway(F.secsToOffers(S.doneIds()));
      const first = 'Hey there' + (name ? ', ' + name : '') + ' 🙂 You\'ve made great progress toward financing through Achieve and you\'re ' + mins + ' away from options.';
      out.push(msg(first));
      if (stepNow) out.push(msg('Your next step is ' + stepNow.label.toLowerCase() + '.'));
      if (w.kind === 'ask') {
        out.push(...promptFor(w));
        out.push(msg('Or pick it up online whenever you like:', { link: linkFor(stepNow.id) }));
      } else out.push(...promptFor(w));
    } else {
      out.push(msg('Hi there 🙂 I can help you get financing or debt relief through Achieve.com.'));
      const w0 = w.kind === 'ask' ? w : { kind: 'ask', step: F.stepById('amount'), field: 'amount' };
      out.push(...promptFor(w0));
      out.push(msg('Prefer to do it online? Start here:', { link: linkFor('') }));
    }
    if (dropped) { S.clearDropout(); }
    S.save();
    return out;
  }

  function context() {
    const st = state();
    const w = st.pending && st.pending.step;
    return slimContext(A(), { step: w || (S.nextIncomplete() || 'offers'), channel, offers: S.get().selected_offer || S.isDone('docs') ? slimOffers(buildOffers(A())) : [] });
  }

  async function answerQuestion(text, history) {
    const msgs = history.slice(-8).map((m) => ({ role: m.who === 'user' ? 'user' : 'assistant', content: m.text })).concat([{ role: 'user', content: text }]);
    return askFn(msgs, context());
  }

  /* A reply from the person. `history` is the transcript so far: [{who:'user'|'agent', text}]. */
  async function reply(text, history) {
    const st = state();
    const t = String(text || '').trim();
    const out = [];
    st.n++;
    if (channel === 'messages' && /^stop\b/i.test(t)) return [msg("You're opted out of texts from Achieve. Reply START any time to rejoin.")];
    if (channel === 'messages' && /^start\b/i.test(t)) return [msg('Welcome back! Texts are on again.'), ...promptFor(work())];
    if (wantsHuman(t)) {
      out.push(msg('Of course. A loan consultant can help at ' + F.BRAND.consultants + ' (Mon-Thu 6 am-8 pm MST, Fri 6 am-7 pm MST, Sat-Sun 7 am-4 pm MST), or you can chat with one on the secure page:', { link: linkFor(st.pending ? st.pending.step : '') }));
      return out;
    }
    if (wantsLink(t) && !isQuestion(t)) {
      const w = work();
      return [msg('Sure, here is the link to pick up right where you left off:', { link: linkFor(w.step ? w.step.id : '') })];
    }
    if (isGreeting(t)) return [msg('Hi again 🙂'), ...repeatPending()];

    const p = st.pending;
    // 1) a question: answer it, then go back to what we were asking
    if (isQuestion(t)) {
      const ans = await answerQuestion(t, history || []);
      out.push(msg(ans));
      out.push(...repeatPending(true));
      return out;
    }
    // 2) an answer to what we asked
    if (p) {
      if (p.step === 'review') {
        if (F.isYes(t)) { S.complete('review'); out.push(msg('Thanks! Confirmed.')); out.push(...promptFor(work())); return out; }
        if (!st.linked.includes('review')) st.linked.push('review');
        out.push(msg('No problem. You can change anything on the review page, then come right back:', { link: linkFor('review') }));
        out.push(...promptFor(work()));
        return out;
      }
      const res = parseFor(p, t);
      if (res === undefined || res === null) {
        const step = F.stepById(p.step);
        const errText = p.field === '__all' ? step.askAll.err : step.fields.find((f) => f.id === p.field).err;
        if (!isQuestion(t) && WORDS(t) > 6) {   // a long sentence that is not an answer: treat as a question
          const ans = await answerQuestion(t, history || []);
          out.push(msg(ans)); out.push(...repeatPending(true)); return out;
        }
        out.push(msg(errText || 'Sorry, I did not catch that.'));
        return out;
      }
      apply(p, res);
      out.push(msg(pick(['Got it.', 'Thanks!', 'Perfect.', 'Great, thank you.', 'Got it, thanks.'], st.n)));
      out.push(...promptFor(work()));
      return out;
    }
    // 3) nothing pending and not a question
    out.push(...promptFor(work()));
    return out;
  }

  function parseFor(p, t) {
    const step = F.stepById(p.step);
    if (!step) return undefined;
    if (p.field === '__all') { const v = step.askAll.parse(t); return v || undefined; }
    const f = step.fields.find((x) => x.id === p.field);
    if (!f || !f.parse) return undefined;
    const v = f.parse(t, A());
    return v === null || v === undefined ? undefined : v;
  }
  function apply(p, v) {
    if (p.field === '__all') S.setApplicant(v);
    else {
      S.setApplicant({ [p.field]: v });
      const step = F.stepById(p.step);
      if (step.id === 'work' && p.field === 'employer' && !A().employment) { /* employment asked next */ }
      if (step.id === 'boost' && p.field === 'payoff' && Number(v) > Number(A().amount || 0)) S.setApplicant({ payoff: Number(A().amount) });
    }
    S.log('text_answer', { channel, step_id: p.step });
    S.save();
  }
  function repeatPending(soft) {
    const p = state().pending;
    if (!p) return promptFor(work());
    const step = F.stepById(p.step);
    if (p.step === 'review') return [msg(soft ? 'Back to your review: does everything look right? Reply "yes" to confirm.' : 'Does everything look right? Reply "yes" to confirm.')];
    const text = p.field === '__all' ? step.askAll.ask : step.fields.find((f) => f.id === p.field).ask;
    return [msg(soft ? 'Whenever you are ready: ' + text : text)];
  }

  return { start, reply, work, linkFor, state };
}
