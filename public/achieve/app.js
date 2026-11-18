/* Achieve debt relief prototype. Slice 1: the shell (path nav, assistant dock, auto-play) and stage 1, lead intake.
   Reuses the first take's form cards, DOM helpers and styles. Everything is sample data and stays in the browser. */
import { h, $, $$, sleep, after, setPaused, reduced, typeInto, tween, ico, icon } from './firsttake/shared/dom.js';
import { money } from './firsttake/shared/flow.js';
import { buildForm } from './firsttake/forms.js';
import * as J from './journey.js';
import { fx, shiftTime, setFxPaused } from './effects.js';
import { paintingBlock } from './art-ui.js';
import * as MU from './movie-ui.js';
import { pace, getSpeed, setSpeed, SPEEDS } from './speed.js';
import * as Q from './qualify.js';
import * as QU from './qualify-ui.js';
import * as C from './consult.js';
import * as CU from './consult-ui.js';
import * as E from './enroll.js';
import * as EU from './enroll-ui.js';
import * as D from './deposit.js';
import * as DU from './deposit-ui.js';
import * as B from './fund.js';
import * as BU from './fund-ui.js';
import * as S from './settle.js';
import * as SU from './settle-ui.js';
import * as F from './free.js';
import * as FU from './free-ui.js';
import { localAnswer, FALLBACK, SUGGESTIONS } from './debt-kb.js';
import * as AC from './account.js';
import { revealAccount } from './acct-reveal.js';
import { createAccount } from './account-ui.js';
import * as ACU from './acct-create-ui.js';

const KEY = 'achv1';
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
const state = Object.assign({ done: [], stageDone: [], applicant: {}, q: {}, qdone: [], c: {}, cdone: [], e: {}, edone: [], d: {}, ddone: [], b: {}, bdone: [], s: {}, sdone: [], f: {}, fdone: [], acct: {}, auto: true }, load());
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

const stream = $('#stream'), tail = $('#tail'), road = $('#roadInner');
const mobile = window.matchMedia('(max-width: 899px)');
const ui = { run: 0, lastPct: 0, gen: 0 };
const cancelled = (my) => () => my !== ui.run;

/* ---------- scrolling ---------- */
function scrollToEl(el) {
  const top = Math.max(0, el.offsetTop - Math.min(110, stream.clientHeight * 0.14));
  stream.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
}
/* bring a payoff into view: its top sits about a third of the way down, so the heading above stays partly visible and the rest invites a scroll */
function revealEl(el) {
  if (!el) return;
  const top = Math.max(0, el.getBoundingClientRect().top - stream.getBoundingClientRect().top + stream.scrollTop - stream.clientHeight * 0.3);
  stream.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
}
function scrollEnd() {
  const last = tail.previousElementSibling;
  const top = last ? last.offsetTop + last.offsetHeight - stream.clientHeight + 28 : stream.scrollHeight;
  stream.scrollTo({ top: Math.max(0, Math.min(top, stream.scrollHeight - stream.clientHeight)), behavior: reduced() ? 'auto' : 'smooth' });
}

/* ---------- the path nav ---------- */
const currentStage = () => J.STAGES.find((s) => !state.stageDone.includes(s.id)) || J.STAGES[J.STAGES.length - 1];
const stageSteps = (id) => id === 'qualify' ? { all: Q.qSteps(state.q), done: state.qdone, label: Q.qStepLabel } : id === 'consult' ? { all: C.C_STEPS, done: state.cdone, label: C.cStepLabel } : id === 'enroll' ? { all: E.E_STEPS, done: state.edone, label: E.eStepLabel } : id === 'deposit' ? { all: D.D_STEPS, done: state.ddone, label: D.dStepLabel } : id === 'build' ? { all: B.B_STEPS, done: state.bdone, label: B.bStepLabel } : id === 'negotiate' ? { all: S.S_STEPS, done: state.sdone, label: S.sStepLabel } : id === 'free' ? { all: F.F_STEPS, done: state.fdone, label: F.fStepLabel } : null;
function renderRoad() {
  paintAcctBtn();
  const cur = currentStage();
  const ss = stageSteps(cur.id);
  const total = cur.id === 'lead' ? J.LEAD_STEPS.length : ss ? ss.all.length : 0;
  const doneN = cur.id === 'lead' ? state.done.length : ss ? ss.done.filter((x) => ss.all.includes(x)).length : 0;
  const allDone = state.stageDone.length >= J.STAGES.length;
  const frac = allDone ? 1 : total ? Math.min(1, doneN / total) : 0;
  const pct = J.pathPct(state.stageDone, state.done, cur.id === 'lead' ? 0 : frac);
  const spct = Math.round(frac * 100);
  const label = allDone ? 'All 8 stages complete' : cur.label + ': ' + spct + '% done' + (total ? ' (' + doneN + ' of ' + total + ' steps)' : '');
  tween(ui.lastPct, pct, 700, (v) => { $('#pct').textContent = v + '%'; });
  ui.lastPct = pct;
  $$('.mins').forEach((e) => { e.textContent = label; });
  $('#barFill').style.width = Math.max(4, pct) + '%';
  $('#roadFill').style.width = pct + '%';
  $('#stageFill').style.width = spct + '%';
  $('#stripStep').textContent = 'Stage ' + cur.n + ' of ' + J.STAGES.length;
  $('#stripPct').textContent = pct + '%';
  const subList = (items) => '<ul class="subs">' + items.map(([lbl, d]) => `<li class="${d ? 'done' : ''}">${lbl}</li>`).join('') + '</ul>';
  road.innerHTML = '<ol class="stages">' + J.STAGES.map((s) => {
    const done = state.stageDone.includes(s.id), on = s.id === cur.id && !done;
    const sx = stageSteps(s.id);
    const subs = !on ? '' : s.id === 'lead' ? subList(J.LEAD_STEPS.map((x) => [x.label, state.done.includes(x.id)]))
      : sx ? subList(sx.all.map((x) => [sx.label(x), sx.done.includes(x)])) : '';
    return `<li class="st ${done ? 'done' : ''} ${on ? 'cur' : ''} ${s.built ? '' : 'soon'}">
      <span class="dot">${done ? icon('check', 13, 3) : s.n}</span>
      <span class="stx"><b>${s.label}</b><em>${s.goal}</em>${subs}</span></li>`;
  }).join('') + '</ol>';
}
const sheet = $('#road');
const openSheet = () => { sheet.classList.add('open'); $('#roadBack').classList.add('on'); };
const closeSheet = () => { sheet.classList.remove('open'); $('#roadBack').classList.remove('on'); };
$('#strip').addEventListener('click', openSheet);
/* on phones, each finished stage gets a short banner that opens the journey map */
function milestoneBanner(stage) {
  if (!mobile.matches) return;
  document.querySelectorAll('.mile-banner').forEach((e) => e.remove());
  const pct = J.pathPct(state.stageDone, state.done, 0);
  const b = h('button', { type: 'button', class: 'mile-banner', onclick: () => { b.remove(); openSheet(); } }, h('b', null, 'Stage ' + stage.n + ' of ' + J.STAGES.length + ' complete'), h('span', null, pct + '% of your journey'), h('em', null, 'See map'));
  document.body.append(b);
  setTimeout(() => b.classList.add('out'), 5200); setTimeout(() => b.remove(), 5700);
}
$('#roadBack').addEventListener('click', closeSheet);
$('#roadClose').addEventListener('click', closeSheet);

/* ---------- conversation primitives ---------- */
function addTurn(id, cls) {
  const t = h('section', { class: 'turn ' + (cls || ''), 'data-step': id || '' });
  stream.insertBefore(t, tail);
  return t;
}
async function say(text, cls) {
  const my = ++ui.run;
  const t = addTurn('', 'intro lead ' + (cls || ''));
  const q = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(q);
  scrollToEl(t);
  await typeInto(q.firstChild, text, { cancelled: cancelled(my) });
  return t;
}

/* ---------- auto-play: fills a card the way a person would, then submits it ---------- */
const typeChars = async (inp, text, my, gen) => {
  inp.focus({ preventScroll: true });
  for (const ch of text) {
    if (my !== ui.run || !state.auto || gen !== ui.gen) return false;
    inp.value += ch;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(reduced() ? 0 : pace(38));
  }
  return true;
};
async function autoFill(form, step, my) {
  const gen = ui.gen;
  await sleep(reduced() ? 0 : pace(700));
  for (const f of step.fields) {
    if (my !== ui.run || !state.auto || gen !== ui.gen) return false;
    const want = f.id in J.PERSONA ? J.PERSONA[f.id] : Q.PERSONA_Q.budget[f.id];
    const el = form.querySelector('#f_' + f.id);
    if (!el || want == null) continue;
    if (el.type === 'range') {
      const from = Number(el.value), to = Number(want);
      const frames = reduced() ? 1 : 24;
      for (let i = 1; i <= frames; i++) {
        if (my !== ui.run || !state.auto || gen !== ui.gen) return false;
        el.value = String(Math.round((from + (to - from) * (i / frames)) / f.step) * f.step);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(reduced() ? 0 : pace(32));
      }
    } else if (el.tagName === 'SELECT') {
      el.value = String(want); el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(reduced() ? 0 : pace(450));
    } else {
      el.value = '';
      const text = f.type === 'tel' || f.type === 'zip' ? String(want).replace(/\D/g, '') : String(want);
      if (!(await typeChars(el, text, my, gen))) return false;
    }
    await sleep(reduced() ? 0 : pace(280));
  }
  if (my !== ui.run || !state.auto || gen !== ui.gen) return false;
  await sleep(reduced() ? 0 : pace(500));
  form.requestSubmit();
  return true;
}

/* ---------- asking a step ---------- */
async function askStep(step) {
  const my = ++ui.run;
  const t = addTurn(step.id, 'pending');
  const q = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(q);
  scrollToEl(t);
  if (!(await typeInto(q.firstChild, step.q, { cancelled: cancelled(my) })) || my !== ui.run) return;
  if (step.sub) { const s = h('p', { class: 'sub' }, step.sub); t.append(s); requestAnimationFrame(() => s.classList.add('in')); await sleep(reduced() ? 0 : pace(200)); }
  const f = buildForm(step, state.applicant, { mode: 'ask', onSubmit: (v) => finishStep(step, v, t) });
  f.el.classList.add('card-in');
  t.append(f.el);
  requestAnimationFrame(() => f.el.classList.add('in'));
  scrollToEl(t);
  t._resume = () => autoFill(f.el, step, my);
  if (state.auto) autoFill(f.el, step, my); else f.focus();
}

async function finishStep(step, values, turn) {
  Object.assign(state.applicant, values);
  if (!state.done.includes(step.id)) state.done.push(step.id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, step.summary(state.applicant))));
  turn.append(b);
  requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  proceed();
}

function proceed() {
  const next = J.nextStep(state.done);
  if (next) askStep(next); else completeLead();
}

/* ---------- stage complete ---------- */
async function stageDone(id, o) {
  if (!state.stageDone.includes(id)) state.stageDone.push(id);
  save(); renderRoad();
  if (!o.quiet) { burst(o.fx || 'confetti'); milestoneBanner(J.stageById(id)); }
  const t = await say(o.line, 'win');
  const stage = J.stageById(id), next = J.STAGES[J.STAGES.indexOf(stage) + 1];
  const my = ui.run;
  const go = next && next.built
    ? h('button', { class: 'btn', type: 'button', onclick: o.onNext }, 'Continue to ' + next.label.toLowerCase(), ico('chevR', 16, 2.4))
    : h('button', { class: 'btn line', type: 'button', onclick: () => { state.auto = true; resetAll(); } }, 'Replay from the start');
  const extra = o.extra ? o.extra() : null;
  const card = h('div', { class: 'card stage-card in' },
    h('div', { class: 'win-ic' }, ico('check', 26, 3)),
    h('h3', null, 'Step ' + stage.n + ' of ' + J.STAGES.length + ' complete'),
    h('p', null, o.body),
    extra,
    go);
  t.append(card); scrollToEl(t);
  if (extra) after(reduced() ? 0 : 900, () => { if (my === ui.run) revealEl(extra); });
  if (next && next.built) {
    const wait = async () => { const g = ui.gen; await sleep(reduced() ? 0 : pace(o.hold || 2600)); if (my === ui.run && state.auto && g === ui.gen) { t._resume = null; o.onNext(); } };
    t._resume = wait;
    if (state.auto) wait();
  }
}
const completeLead = (quiet) => stageDone('lead', { quiet, fx: 'balloons', line: 'You took the first step, ' + (state.applicant.first || 'there') + '. Nice work.',
  body: 'Telling us about your debt is done. Next, a few questions to see which program fits and what has made payments hard.', onNext: startQualify });
const completeQualify = (quiet) => stageDone('qualify', { quiet, fx: 'stamp', line: "That's two steps down, " + (state.applicant.first || 'there') + '.',
  body: 'You told us about your debt, what changed, and your budget. Next you create your account, then meet your plan: we confirm your debts, listen, set honest expectations, and show what you would pay.', onNext: startAccount });

const completeConsult = (quiet) => stageDone('consult', { quiet, fx: 'target', line: 'You have a plan, ' + (state.applicant.first || 'there') + '.',
  body: 'You confirmed your debts, told us what matters, heard exactly what to expect, and chose a deposit. Next you review the agreement, sign, and open your account.', onNext: startEnroll });

/* ---------- stage 2: qualification ---------- */
const QMETA = {
  dtypes: { q: 'What kinds of debt do you have?', sub: 'Select all that apply.' },
  status: { q: 'Where do your payments stand?', sub: 'Be as honest as you like. This helps us give you the right plan.' },
  hardship: { q: 'What has made payments hard?', sub: 'Programs are built for people facing a real change. Tell us what happened.' },
  budget: { q: 'What does your month look like?', sub: 'Round numbers are fine. This shows what deposit would work.' },
  result: { q: 'Here is what we found', sub: '' },
};
const qMeta = (id) => id.startsWith('detail:')
  ? { q: 'Tell us more about this: ' + Q.hardshipById(id.slice(7)).label.toLowerCase(), sub: 'A few quick questions. Documents are optional, and they stay private.' } : QMETA[id];
function qSummary(id) {
  const q = state.q;
  if (id === 'dtypes') return (q.debtTypes || []).map((x) => Q.DEBT_TYPES.find((d) => d.id === x).label).join(', ');
  if (id === 'status') return (Q.STATUS.find((x) => x.id === q.status) || {}).label || '';
  if (id === 'hardship') return (q.hardships || []).map((x) => Q.hardshipById(x).label).join(', ');
  if (id === 'budget') return money0(q.budget.deposit) + ' a month deposit';
  if (id.startsWith('detail:')) { const d = (q.detail || {})[id.slice(7)] || {}; return Q.hardshipById(id.slice(7)).label + (d.docs && d.docs.length ? ' · ' + d.docs.length + ' document' + (d.docs.length > 1 ? 's' : '') : ''); }
  return '';
}
const money0 = (n) => '$' + Math.round(Number(n) || 0).toLocaleString('en-US');

async function startQualify() {
  ui.run++;
  await say("Now let's see which program fits. A few questions, and you can skip any document.");
  proceedQ();
}
function proceedQ() {
  const next = Q.nextQStep(state.qdone, state.q);
  if (next) askQ(next);
}
async function runTurn(id, meta, build) {
  const my = ++ui.run;
  const t = addTurn(id, 'pending');
  const qe = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(qe); scrollToEl(t);
  if (!(await typeInto(qe.firstChild, meta.q, { cancelled: cancelled(my) })) || my !== ui.run) return;
  if (meta.sub) { const s = h('p', { class: 'sub' }, meta.sub); t.append(s); requestAnimationFrame(() => s.classList.add('in')); await sleep(reduced() ? 0 : pace(200)); }
  const mk = () => { const g = ui.gen; return () => my === ui.run && state.auto && g === ui.gen; };
  const card = build(t, my);
  card.el.classList.add('card-in'); t.append(card.el);
  requestAnimationFrame(() => card.el.classList.add('in'));
  scrollToEl(t);
  if (card.focus) after(reduced() ? 0 : 900, () => { if (my === ui.run) revealEl(card.focus); });
  t._resume = () => card.auto(mk());
  if (state.auto) card.auto(mk());
}
const askQ = (id) => runTurn(id, qMeta(id), (t, my) => {
  const done = (patch) => finishQ(id, patch, t);
  if (id === 'dtypes') return QU.dtypesCard(state.q, done);
  if (id === 'status') return QU.statusCard(state.q, done);
  if (id === 'hardship') return QU.hardshipCard(state.q, done);
  if (id.startsWith('detail:')) { const hid = id.slice(7); return QU.detailCard(hid, (state.q.detail || {})[hid], (p) => done({ detail: Object.assign({}, state.q.detail, { [hid]: p.detail }) })); }
  if (id === 'budget') {
    const live = h('p', { class: 'bud-live', role: 'status' });
    const draft = {};
    const f = buildForm(Q.BUDGET_STEP, {}, { mode: 'ask', onSubmit: (v) => done({ budget: v }), onDraft: (k, v) => { draft[k] = v; live.textContent = Q.budgetLine(draft); } });
    f.el.insertBefore(live, f.el.querySelector('button[type=submit]'));
    return { el: f.el, auto: () => autoFill(f.el, Q.BUDGET_STEP, my) };
  }
  return QU.resultCard(state.applicant, state.q, () => finishQ('result', {}, t));
});
async function finishQ(id, patch, turn) {
  Object.assign(state.q, patch);
  if (!state.qdone.includes(id)) state.qdone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  if (id !== 'result') {
    const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, qSummary(id))));
    turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  }
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (Q.nextQStep(state.qdone, state.q)) proceedQ(); else completeQualify();
}

/* ---------- account creation, right after qualifying ---------- */
async function startAccount() {
  if (state.acctMade) return startConsult();
  runTurn('account', { q: 'Create your account', sub: "We filled in what you've told us. Add a password and agree to the terms, and you can sign in any time to see your progress." }, (t) => { const my = ui.run; return ACU.createCard(state.applicant, async (v) => {
    Object.assign(state.applicant, { first: v.first, last: v.last, email: v.email, phone: v.phone });
    state.acctMade = { at: Date.now(), textOk: v.textOk }; AC.recordEvent(state, 'you', 'Created your account', 'Email sign-in and electronic documents agreed'); save();
    t.classList.remove('pending'); t.classList.add('answered');
    const card = t.querySelector('.card'), sub = t.querySelector('.sub');
    if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
    if (sub) sub.classList.add('fade');
    const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, 'Account created for ' + v.email)));
    t.append(b); requestAnimationFrame(() => b.classList.add('in'));
    await sleep(reduced() ? 0 : pace(600));
    if (my !== ui.run) return;
    renderRoad(); /* shows My Account in the top right and plays the reveal */
    await say('Your account is ready. Look at the top right: that is My Account. It is mostly empty for now, and it fills in as you go.');
    const my2 = ui.run;
    const go = h('button', { type: 'button', class: 'btn', onclick: () => { go.disabled = true; go.closest('.turn') && go.closest('.turn').remove(); startConsult(); } }, 'Continue');
    const t2 = addTurn('acct-next', 'pending'); const c2 = h('div', { class: 'card card-in' }, go); t2.append(c2); requestAnimationFrame(() => c2.classList.add('in')); scrollToEl(t2);
    if (state.auto) { const g = ui.gen; await sleep(reduced() ? 0 : pace(4200)); if (my2 === ui.run && state.auto && g === ui.gen && !go.disabled) go.click(); }
  }); });
}

/* ---------- stage 3: your plan ---------- */
const CMETA = {
  debts: { q: 'Here is what we found on your credit report', sub: 'Check that these are right. Add anything we missed.' },
  goals: { q: 'What would make this a win for you?', sub: 'A few questions a specialist would ask on a call.' },
  talk: { q: 'Tell us in your own words', sub: 'This is where you say what the forms cannot.' },
  expect: { q: 'Before we go further: what to expect', sub: 'The honest version. We would rather you know now.' },
  plan: { q: 'Here is your plan', sub: 'Move the deposit to see how it changes the timeline.' },
};
const selectedDebts = () => (state.c.debts || []).map((id) => C.tradeById(id) || (state.c.custom || []).find((x) => x.id === id)).filter(Boolean);
const deposit = () => state.c.deposit || (state.q.budget || {}).deposit || 600;
function cSummary(id) {
  const c = state.c;
  if (id === 'debts') { const d = selectedDebts(); return d.length + ' debts, ' + money0(d.reduce((t, x) => t + x.balance, 0)); }
  if (id === 'goals') return (c.goals || []).map((g) => C.GOALS.find((x) => x.id === g).label).join(' · ');
  if (id === 'talk') return c.talk ? (c.talk.length > 70 ? c.talk.slice(0, 67) + '...' : c.talk) : 'Nothing more to add';
  if (id === 'expect') return 'I understand what to expect';
  if (id === 'plan') return money0(deposit()) + ' a month';
  return '';
}
/* ---------- stage 3: your plan ---------- */
async function startConsult() {
  ui.run++;
  await say('Now your plan. This is the conversation a specialist would have with you, step by step.');
  proceedC();
}
const proceedC = () => { const n = C.nextCStep(state.cdone); if (n) askC(n); };
const askC = (id) => runTurn(id, CMETA[id], (t) => {
  const done = (patch) => finishC(id, patch, t);
  if (id === 'debts') return CU.debtsCard(state.c, done);
  if (id === 'goals') return CU.goalsCard(state.c, done);
  if (id === 'talk') return CU.talkCard(state.c, done);
  if (id === 'expect') return CU.expectCard(C.plan(selectedDebts(), deposit()).months, done);
  return CU.planCard(selectedDebts(), deposit(), done);
});
async function finishC(id, patch, turn) {
  Object.assign(state.c, patch);
  if (!state.cdone.includes(id)) state.cdone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, cSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (C.nextCStep(state.cdone)) proceedC(); else completeConsult();
}

/* ---------- stage 4: enroll ---------- */
const EMETA = {
  review: { q: 'Your agreement, in plain English', sub: 'Open any section to read the details.' },
  consent: { q: 'A few things we need you to agree to', sub: 'Each one is its own choice.' },
  sign: { q: 'Sign your agreement', sub: 'Type your name and adopt it as your signature.' },
  account: { q: 'Open your dedicated account', sub: 'Your deposits go to an account in your name. You own it and you can see it any time.' },
  draft: { q: 'Set up your automatic deposits', sub: 'The surest way to stay on track is to never have to remember.' },
};
const planNow = () => C.plan(selectedDebts(), deposit());
function eSummary(id) {
  const e = state.e;
  if (id === 'review') return 'I reviewed my agreement';
  if (id === 'consent') return 'I agreed to all ' + E.CONSENTS.length;
  if (id === 'sign') return 'Signed: ' + (e.signedName || '');
  if (id === 'account') return 'Dedicated account ••' + ((e.account || {}).last4 || '');
  if (id === 'draft') { const d = e.draft || {}; return money0(d.amount) + ' ' + ({ monthly: 'a month', biweekly: 'every 2 weeks', twice: 'twice a month' }[d.freq] || '') + (d.auto ? ', automatic' : ', manual'); }
  return '';
}
async function startEnroll() {
  ui.run++;
  await say("Now the part that makes it official: review, sign, open your account, and set up your deposits.");
  proceedE();
}
const proceedE = () => { const n = E.nextEStep(state.edone); if (n) askE(n); };
const askE = (id) => runTurn(id, EMETA[id], (t) => {
  const done = (patch) => finishE(id, patch, t);
  if (id === 'review') return EU.reviewCard(Object.assign(planNow(), { debt: planNow().total_debt }), done);
  if (id === 'consent') return EU.consentCard(state.e, done);
  if (id === 'sign') return EU.signCard(state.applicant, done);
  if (id === 'account') return EU.accountCard(state.applicant, done);
  return EU.draftCard(state.applicant, deposit(), state.e.bank, done);
});
async function finishE(id, patch, turn) {
  Object.assign(state.e, patch);
  if (!state.edone.includes(id)) state.edone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, eSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (E.nextEStep(state.edone)) proceedE(); else completeEnroll();
}
const completeEnroll = (quiet) => {
  const d = state.e.draft || {};
  const first = d.first ? E.fmtDate(new Date(d.first)) : 'soon';
  return stageDone('enroll', { quiet, fx: 'seal', line: "You're enrolled, " + (state.applicant.first || 'there') + '!',
    body: 'Your agreement is signed and your dedicated account is open. Your first deposit is set for ' + first + '. Next you sign in and make it.', onNext: startDeposit });
};

/* ---------- stage 5: first deposit ---------- */
const DMETA = {
  login: { q: 'Welcome to your account', sub: 'This is your logged-in view. Everything about your program lives here.' },
  deposit: { q: 'Make your first deposit', sub: 'Send it from your bank to your dedicated account.' },
  celebrate: { q: 'Your first deposit cleared!', sub: '' },
  outreach: { q: 'Has anyone contacted you yet?', sub: 'Creditors may call, text or write. It is normal, and we want to know.' },
};
const bankNow = () => E.bankById(state.e.bank) || E.BANKS[0];
function dSummary(id) {
  const d = state.d;
  if (id === 'login') return 'Signed in';
  if (id === 'deposit') return 'Deposited ' + money0(((d.deposit || {}).amount)) + ', cleared';
  if (id === 'celebrate') return 'First deposit: celebrated';
  if (id === 'outreach') { const n = (d.outreach || []).length; return n ? n + ' contact' + (n > 1 ? 's' : '') + ' logged' : 'No contact yet'; }
  return '';
}
async function startDeposit() {
  ui.run++;
  await say('Now you are in your account. Time to put the first deposit in.');
  proceedD();
}
const proceedD = () => { const n = D.nextDStep(state.ddone); if (n) askD(n); };
const celebrateBurst = () => { burst('trophy'); after(900, () => burst(220)); after(1600, () => burst(180)); after(2400, () => burst(180)); };
const askD = (id) => runTurn(id, DMETA[id], (t) => {
  const done = (patch) => finishD(id, patch, t);
  if (id === 'login') return DU.loginCard(state.applicant, done);
  if (id === 'deposit') return DU.depositCard(state.applicant, bankNow(), deposit(), done);
  if (id === 'celebrate') return DU.celebrateCard(state.applicant, { goal: (state.c.goals || [])[0] }, { burst: celebrateBurst }, done);
  return DU.outreachCard(selectedDebts(), done);
});
async function finishD(id, patch, turn) {
  Object.assign(state.d, patch);
  if (!state.ddone.includes(id)) state.ddone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card && id === 'celebrate') { card.querySelectorAll('.btn:not(.line):not(.sm)').forEach((b) => b.remove()); card.classList.add('kept'); }
  else if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, dSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (D.nextDStep(state.ddone)) proceedD(); else completeDeposit();
}
const completeDeposit = (quiet) => stageDone('deposit', { quiet, fx: 'streamers', line: 'Your first deposit is in, ' + (state.applicant.first || 'there') + '.',
  body: 'Your account is funded, your first deposit cleared, and you know how to tell us about creditor contact. Next you watch your fund grow toward your first settlement.', onNext: startBuild });

/* ---------- stage 6: build your fund ---------- */
const BMETA = {
  fund: { q: 'Watch your fund grow', sub: 'Every deposit moves you closer. Drag the slider to see ahead.' },
  messages: { q: 'How we stay in touch', sub: 'You will hear from us at the moments that matter.' },
  boost: { q: 'Keep it going, or speed it up', sub: 'Your automatic deposit does the work. Add more any time you like.' },
};
const fundModel = () => B.model(selectedDebts(), deposit());
function bSummary(id) {
  if (id === 'fund') return 'Fund on track: about ' + fundModel().months + ' months';
  if (id === 'messages') return 'Texts, emails and in-app updates';
  if (id === 'boost') return state.b.extra ? 'Extra deposit: ' + money0(state.b.extra) : 'Automatic deposits on';
  return '';
}
async function startBuild() {
  ui.run++;
  await say('Now the build phase. Your deposits grow a fund, and the fund is what lets us settle your debts.');
  proceedB();
}
const proceedB = () => { const n = B.nextBStep(state.bdone); if (n) askB(n); };
const askB = (id) => runTurn(id, BMETA[id], (t) => {
  const done = (patch) => finishB(id, patch, t);
  const m = fundModel();
  if (id === 'fund') return BU.fundCard(state.applicant, m, { burst: (n) => burst(n) }, done);
  if (id === 'messages') return BU.messagesCard(state.applicant, m, money0((state.e.draft || {}).amount || deposit()), done);
  return BU.boostCard(m, state.e.draft || { freq: 'monthly', amount: deposit(), auto: true }, bankNow(), { burst: (n) => burst(n) }, done);
});
async function finishB(id, patch, turn) {
  Object.assign(state.b, patch);
  if (!state.bdone.includes(id)) state.bdone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, bSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (B.nextBStep(state.bdone)) proceedB(); else completeBuild();
}
const completeBuild = (quiet) => stageDone('build', { quiet, fx: 'band', hold: 15000, extra: () => paintingBlock(state.applicant), line: 'Your fund is growing, ' + (state.applicant.first || 'there') + '. We commissioned some serious art for you!',
  body: 'You can see your progress, you know how we will stay in touch, and you can speed things up whenever you like. Next the negotiators go to work, and you approve every settlement.', onNext: startSettle });

/* ---------- stage 7: settle ---------- */
const SMETA = {
  advocate: { q: 'Meet your negotiator', sub: 'One person on your side, start to finish.' },
  activity: { q: 'Everything we do for you', sub: 'Every call, text and email, in one place.' },
  offer: { q: 'Your first offer', sub: 'Nothing is paid unless you say yes.' },
  board: { q: 'Where you stand', sub: 'Every debt, with an honest status.' },
};
const firstDebtNow = () => S.firstDebt(selectedDebts(), deposit());
function sSummary(id) {
  if (id === 'advocate') return S.NEGOTIATOR.name + ' is your negotiator';
  if (id === 'activity') return 'Calls recorded, texts and emails in your account';
  if (id === 'offer') { const o = state.s.offer; return !o ? '' : o.status === 'approved' ? 'Approved: ' + money0(o.amount) + ', you keep about ' + money0(o.saved) : 'Declined, we keep negotiating'; }
  if (id === 'board') return 'Status of every debt';
  return '';
}
async function startSettle() {
  ui.run++;
  await say('Now the negotiators go to work. You see everything, and you approve every settlement.');
  proceedS();
}
const proceedS = () => { const n = S.nextSStep(state.sdone); if (n) askS(n); };
const askS = (id) => runTurn(id, SMETA[id], (t) => {
  const done = (patch) => finishS(id, patch, t);
  const debt = firstDebtNow();
  if (id === 'advocate') return SU.advocateCard(state.applicant, done);
  if (id === 'activity') return SU.activityCard(state.applicant, debt, done);
  if (id === 'offer') return SU.offerCard(state.applicant, debt, S.fundAt(deposit(), fundModel().offerMonth), { burst: (n) => burst(n) }, done);
  return SU.boardCard(selectedDebts(), deposit(), { burst: (n) => burst(n) }, state.s.offer && state.s.offer.status === 'approved' ? { debtId: state.s.offer.debtId, saved: state.s.offer.saved } : { debtId: null, saved: 0 }, fundModel().months, done);
});
async function finishS(id, patch, turn) {
  Object.assign(state.s, patch);
  if (!state.sdone.includes(id)) state.sdone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, sSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (S.nextSStep(state.sdone)) proceedS(); else completeSettle();
}
const completeSettle = (quiet) => stageDone('negotiate', { quiet, fx: 'shred', line: 'Your first debt is handled, ' + (state.applicant.first || 'there') + '.',
  body: 'You met your negotiator, saw every conversation, and approved your first offer. Next comes the finish line.', onNext: startFree });

/* ---------- stage 8: debt free ---------- */
const FMETA = {
  graduate: { q: 'You made it', sub: 'Take a second. This is a big one.' },
  rave: { q: 'Celebrate', sub: 'Your account, tonight.' },
  movie: { q: 'We made you a movie', sub: 'Starring you. Press play.' },
  box: { q: 'Your graduation box', sub: 'A small thank you, shipped to your door.' },
  next: { q: 'What comes next', sub: 'Pick what interests you. Skip anything you like.' },
};
const recapNow = () => F.recap({ selected: selectedDebts(), deposit: deposit(), months: fundModel().months });
function fSummary(id) {
  if (id === 'graduate') return 'Debt free';
  if (id === 'rave') return 'Celebrated with the team';
  if (id === 'movie') return 'Watched your movie';
  if (id === 'box') return state.f.box ? 'Box going to ' + state.f.box.city + ', ' + state.f.box.state : 'Box on its way';
  if (id === 'next') return F.nextFlowSummary(state.f.next || []);
  return '';
}
async function startFree() {
  ui.run++;
  await say('You finished. Let us celebrate, and then talk about what comes next.');
  proceedF();
}
const proceedF = () => { const n = F.nextFStep(state.fdone); if (n) askF(n); };
const askF = (id) => runTurn(id, FMETA[id], (t) => {
  const done = (patch) => finishF(id, patch, t);
  const seq = ['sunrise']; let si = 0;
  const hooks = { burst: (n, kind) => burst(n === undefined ? seq[si++ % seq.length] : n, kind) };
  if (id === 'graduate') return FU.graduateCard(state.applicant, recapNow(), hooks, done);
  if (id === 'movie') return MU.movieCard(state.applicant, hooks, done, { muted: state.auto });
  if (id === 'rave') return FU.raveCard(state.applicant, recapNow(), hooks, done);
  if (id === 'box') return FU.boxCard(state.applicant, done);
  return FU.nextCard(state.applicant, done);
});
async function finishF(id, patch, turn) {
  Object.assign(state.f, patch);
  if (!state.fdone.includes(id)) state.fdone.push(id);
  save();
  turn.classList.remove('pending'); turn.classList.add('answered');
  const card = turn.querySelector('.card'), sub = turn.querySelector('.sub');
  if (card && id === 'movie') { card.querySelectorAll('.btn:not(.line):not(.sm)').forEach((b) => b.remove()); card.classList.add('kept'); }
  else if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, fSummary(id))));
  turn.append(b); requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : pace(650));
  if (F.nextFStep(state.fdone)) proceedF(); else completeFree();
}
const completeFree = (quiet) => stageDone('free', { quiet, fx: 'fireworks', line: 'You are debt free, ' + (state.applicant.first || 'there') + '.',
  body: 'You started with a pile of debt and finished with a plan, a team, and a clean slate. Your graduation box is on its way, and your next steps are waiting whenever you are ready.', onNext: () => {} });

/* ---------- celebrations: confetti, streamers, fireworks, band (effects.js) ---------- */
const burst = (n, kind) => fx(typeof n === 'string' ? n : (kind || 'confetti'), typeof n === 'string' ? undefined : n);

/* ---------- assistant dock ---------- */
const askForm = $('#askForm'), askInput = $('#askInput');
const userMsg = (text) => { const m = h('div', { class: 'msg user' }, h('div', { class: 'mb' }, text)); stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in')); return m; };
const chat = [];
function chatCtx() {
  const next = J.STAGES.find((x) => !state.stageDone.includes(x.id));
  const debts = selectedDebts().map((d) => ({ name: d.name, kind: d.kind, balance: d.balance }));
  return { stage: next ? next.id : 'free', first: state.applicant.first || '', deposit: state.c.deposit || null, months: state.c.deposit ? fundModel().months : null, debts };
}
/* Real assistant first; the offline answers keep the demo alive without a key or a connection. */
async function askAssistant(q) {
  chat.push({ role: 'user', content: q });
  let text = null;
  try {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 15000);
    const res = await fetch('/api/achieve-debt-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal, body: JSON.stringify({ messages: chat.slice(-12), ctx: chatCtx() }) });
    clearTimeout(to);
    if (res.ok) { const j = await res.json(); if (j && j.text) text = j.text; }
  } catch { /* offline answers below */ }
  if (!text) { await sleep(reduced() ? 0 : pace(700)); text = localAnswer(q) || FALLBACK; }
  chat.push({ role: 'assistant', content: text });
  return text;
}
async function handleSend(text) {
  const q = String(text || '').trim();
  if (!q) return;
  askInput.value = '';
  userMsg(q); scrollEnd();
  const m = h('div', { class: 'msg bot wait' }, h('img', { class: 'mav mark', src: '/achieve/firsttake/img/logo-mark.png', alt: '' }),
    h('div', { class: 'mb' }, h('span', { class: 'dots', 'aria-label': 'Typing' }, h('i'), h('i'), h('i'))));
  stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in')); scrollEnd();
  const reply = await askAssistant(q);
  m.querySelector('.mb').textContent = reply;
  m.classList.remove('wait'); m.classList.add('said'); scrollEnd();
}
askForm.addEventListener('submit', (e) => { e.preventDefault(); handleSend(askInput.value); });
$('#suggRow').append(...SUGGESTIONS.map((s) => h('button', { type: 'button', onclick: () => handleSend(s) }, s)));

/* ---------- my account: the places a returning client goes ---------- */
const pauseJourney = (on) => { setPaused(on); window.dispatchEvent(new CustomEvent('achieve:attention', { detail: { attentive: !on } })); };
const acct = createAccount({
  state, save,
  ctx: () => ({ debts: selectedDebts(), deposit: deposit(), months: fundModel().months, offerMonth: fundModel().offerMonth, bankName: bankNow().name, last4: bankNow().last4 }),
  pct: () => Math.round(J.pathPct(state.stageDone, state.done, 0)),
  onOpen: () => { ui.held = true; paintAuto(); pauseJourney(true); setFxPaused(true); }, onClose: () => { ui.held = false; paintAuto(); setFxPaused(false); pauseJourney(false); },
});
function paintAcctBtn() { const on = AC.hasAccount(state), a = $('#acctBtn'), m = $('#menuBtn'); if (!a || !m) return; a.hidden = !on; m.hidden = !on; if (on && !state.acctSeen) { state.acctSeen = true; save(); revealAccount(a, m); } $('.acct-ini', a).textContent = ((state.applicant && state.applicant.first) || 'Me')[0].toUpperCase(); }
$('#acctBtn').addEventListener('click', () => acct.open('overview'));
$('#menuBtn').addEventListener('click', () => acct.openSheet());
window.addEventListener('hashchange', () => { const m = /^#account\/?(\w*)/.exec(location.hash); if (m && AC.hasAccount(state)) acct.open(m[1] || 'overview'); });

/* ---------- prototype controls ---------- */
const devBtn = $('#devBtn'), devMenu = $('#devMenu');
const paintSpeed = () => { const slow = getSpeed() === 'slow', sw = $('#doSpeed'); sw.setAttribute('aria-checked', String(slow)); sw.classList.toggle('on', slow); $('.sw-state', sw).textContent = slow ? 'On' : 'Off'; };
paintSpeed();
const IC_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
const IC_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
const paintAuto = () => { const t = $('#devToggle'); const live = state.auto && !ui.held; $('#devIc').innerHTML = live ? IC_PAUSE : IC_PLAY; t.setAttribute('aria-pressed', String(state.auto)); t.setAttribute('aria-label', state.auto ? 'Auto-play is on. Pause' : 'Auto-play is paused. Play'); t.classList.toggle('paused', !live); };
/* the menu opens from the pill, closes on a tap away, on Escape, and a second after a choice (the choice pulses first) */
let closeTimer = 0;
const setMenu = (open) => { clearTimeout(closeTimer); $$('.dev-menu button', devMenu).forEach((b) => b.classList.remove('picked')); devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); };
const choose = (btn, then, wait) => { clearTimeout(closeTimer); $$('.dev-menu button', devMenu).forEach((b) => b.classList.remove('picked')); void btn.offsetWidth; btn.classList.add('picked'); closeTimer = setTimeout(() => { setMenu(false); }, 1000); if (then) setTimeout(then, wait || 0); };
devBtn.addEventListener('click', () => setMenu(devMenu.hidden));
document.addEventListener('pointerdown', (e) => { if (!devMenu.hidden && !$('#dev').contains(e.target)) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !devMenu.hidden) { setMenu(false); devBtn.focus(); } });
$('#doSpeed').addEventListener('click', (e) => { setSpeed(getSpeed() === 'fast' ? 'slow' : 'fast'); paintSpeed(); choose(e.currentTarget); });
$('#devToggle').addEventListener('click', () => {
  state.auto = !state.auto; ui.gen++; save(); paintAuto();
  if (state.auto) { const last = [...$$('.turn', stream)].pop(); if (last && last._resume && (last.classList.contains('pending') || last.classList.contains('win') || last.querySelector('.stage-card'))) last._resume(); }
});
$('#doSkip').addEventListener('click', (e) => choose(e.currentTarget, () => {
  if (!state.stageDone.includes('lead')) { Object.assign(state.applicant, J.PERSONA); state.done = J.LEAD_STEPS.map((s) => s.id); }
  else if (state.stageDone.includes('negotiate')) { state.f = {}; state.fdone = ['graduate', 'rave', 'movie']; }
  else if (state.stageDone.includes('build')) { state.s = { offer: { debtId: firstDebtNow().id, amount: S.offerFor(firstDebtNow()).amount, fee: S.offerFor(firstDebtNow()).fee, saved: S.offerFor(firstDebtNow()).saved, status: 'approved', pct: S.offerFor(firstDebtNow()).pct } }; state.sdone = ['advocate', 'activity', 'offer']; }
  else if (state.stageDone.includes('deposit')) { state.b = {}; state.bdone = ['fund', 'messages']; }
  else if (state.stageDone.includes('enroll')) { state.d = { login: true, deposit: { cleared: true, amount: deposit(), date: 'Today', bank: bankNow().name + ' ••' + bankNow().last4 } }; state.ddone = ['login', 'deposit']; }
  else if (state.stageDone.includes('consult')) { Object.assign(state.e, { consents: E.CONSENTS.map((c) => c.id), signedName: E.PERSONA_E.sign, bank: E.PERSONA_E.bank, account: { last4: '3318' } }); state.edone = ['review', 'consent', 'sign', 'account']; }
  else if (state.stageDone.includes('qualify')) { Object.assign(state.c, JSON.parse(JSON.stringify(C.PERSONA_C))); state.c.custom = []; state.cdone = C.C_STEPS.filter((x) => x !== 'plan'); }
  else { state.q = JSON.parse(JSON.stringify(Q.PERSONA_Q)); state.qdone = Q.qSteps(state.q).filter((x) => x !== 'result'); state.stageDone.includes('lead') || state.stageDone.push('lead'); }
  save(); devMenu.hidden = true; location.reload();
}, 700));
function resetAll() { ui.run++; try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } location.reload(); }
$('#doReset').addEventListener('click', (e) => choose(e.currentTarget, () => { state.auto = true; try { sessionStorage.setItem(KEY, JSON.stringify({ auto: true })); } catch { /* ignore */ } location.reload(); }, 700));

/* ---------- attention: pause everything when the viewer looks away, resume when they are back ---------- */
const away = h('div', { class: 'away', role: 'status', 'aria-live': 'polite', hidden: true }, h('b', null), h('span', null));
document.body.append(away);
let attentive = true, awayAt = 0, resumeTimer = 0;
const tell = (a, b) => { away.firstChild.textContent = a; away.lastChild.textContent = b; away.hidden = false; };
function setAttention(v) {
  if (v === attentive) return; attentive = v; clearTimeout(resumeTimer);
  if (!v) { awayAt = performance.now(); setPaused(true); tell('Paused', 'Come back and we will pick up right where you left off.'); window.dispatchEvent(new CustomEvent('achieve:attention', { detail: { attentive: false } })); return; }
  tell('Welcome back', 'Picking up where you left off...');
  resumeTimer = setTimeout(() => { away.hidden = true; shiftTime(performance.now() - awayAt); setPaused(false); window.dispatchEvent(new CustomEvent('achieve:attention', { detail: { attentive: true } })); }, 900);
}
const isHere = () => !document.hidden && document.hasFocus();
document.addEventListener('visibilitychange', () => setAttention(isHere()));
window.addEventListener('blur', () => setAttention(false));
window.addEventListener('focus', () => setTimeout(() => setAttention(isHere()), 0));

/* ---------- start ---------- */
const answeredTurn = (id, q, text) => { const t = addTurn(id, 'answered'); t.append(h('div', { class: 'q' }, h('span', { class: 'qt' }, q)), h('div', { class: 'ans in' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, text)))); };
const FLOWS = [
  { id: 'qualify', prev: () => completeLead(true), done: () => state.qdone.filter((x) => x !== 'result'), meta: (id) => qMeta(id), sum: qSummary, go: proceedQ, finish: completeQualify },
  { id: 'consult', prev: () => completeQualify(true), done: () => state.cdone, meta: (id) => CMETA[id], sum: cSummary, go: proceedC, finish: completeConsult },
  { id: 'enroll', prev: () => completeConsult(true), done: () => state.edone, meta: (id) => EMETA[id], sum: eSummary, go: proceedE, finish: completeEnroll },
  { id: 'deposit', prev: () => completeEnroll(true), done: () => state.ddone, meta: (id) => DMETA[id], sum: dSummary, go: proceedD, finish: completeDeposit },
  { id: 'build', prev: () => completeDeposit(true), done: () => state.bdone, meta: (id) => BMETA[id], sum: bSummary, go: proceedB, finish: completeBuild },
  { id: 'negotiate', prev: () => completeBuild(true), done: () => state.sdone, meta: (id) => SMETA[id], sum: sSummary, go: proceedS, finish: completeSettle },
  { id: 'free', prev: () => completeSettle(true), done: () => state.fdone, meta: (id) => FMETA[id], sum: fSummary, go: proceedF, finish: completeFree },
];
(async function start() {
  paintAuto();
  renderRoad();
  if (J.leadComplete(state.done)) {
    state.stageDone.includes('lead') || state.stageDone.push('lead');
    J.LEAD_STEPS.forEach((st) => answeredTurn(st.id, st.q, st.summary(state.applicant)));
    for (const fl of FLOWS) {
      const prevDone = fl.id === 'qualify' || state.stageDone.includes(FLOWS[FLOWS.indexOf(fl) - 1].id);
      if (!prevDone) break;
      fl.done().forEach((id) => answeredTurn(id, fl.meta(id).q, fl.sum(id)));
      renderRoad();
      if (state.stageDone.includes(fl.id)) { if (fl === FLOWS[FLOWS.length - 1]) { fl.finish(true); return; } continue; }
      if (fl.done().length) { await say("Welcome back. Let's keep going."); fl.go(); return; }
      fl.prev(); return;
    }
  }
  if (!J.leadComplete(state.done)) {
    await say('Welcome to Achieve. Dealing with debt is hard, and you took a step by being here. Let\'s see how we can help.');
    proceed();
  }
})();
{ const m = /^#account\/?(\w*)/.exec(location.hash); if (m) setTimeout(() => { if (AC.hasAccount(state)) acct.open(m[1] || 'overview'); }, 0); }
