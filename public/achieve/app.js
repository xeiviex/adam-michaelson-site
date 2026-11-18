/* Achieve debt relief prototype. Slice 1: the shell (path nav, assistant dock, auto-play) and stage 1, lead intake.
   Reuses the first take's form cards, DOM helpers and styles. Everything is sample data and stays in the browser. */
import { h, $, $$, sleep, reduced, typeInto, tween, ico, icon } from './firsttake/shared/dom.js';
import { money } from './firsttake/shared/flow.js';
import { buildForm } from './firsttake/forms.js';
import * as J from './journey.js';
import * as Q from './qualify.js';
import * as QU from './qualify-ui.js';
import * as C from './consult.js';
import * as CU from './consult-ui.js';
import { localAnswer, FALLBACK, SUGGESTIONS } from './debt-kb.js';

const KEY = 'achv1';
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
const state = Object.assign({ done: [], stageDone: [], applicant: {}, q: {}, qdone: [], c: {}, cdone: [], auto: true }, load());
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

const stream = $('#stream'), tail = $('#tail'), road = $('#roadInner');
const mobile = window.matchMedia('(max-width: 899px)');
const ui = { run: 0, lastPct: 0 };
const cancelled = (my) => () => my !== ui.run;

/* ---------- scrolling ---------- */
function scrollToEl(el) {
  const top = Math.max(0, el.offsetTop - Math.min(110, stream.clientHeight * 0.14));
  stream.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
}
function scrollEnd() {
  const last = tail.previousElementSibling;
  const top = last ? last.offsetTop + last.offsetHeight - stream.clientHeight + 28 : stream.scrollHeight;
  stream.scrollTo({ top: Math.max(0, Math.min(top, stream.scrollHeight - stream.clientHeight)), behavior: reduced() ? 'auto' : 'smooth' });
}

/* ---------- the path nav ---------- */
const currentStage = () => J.STAGES.find((s) => !state.stageDone.includes(s.id)) || J.STAGES[J.STAGES.length - 1];
const stageSteps = (id) => id === 'qualify' ? { all: Q.qSteps(state.q), done: state.qdone, label: Q.qStepLabel } : id === 'consult' ? { all: C.C_STEPS, done: state.cdone, label: C.cStepLabel } : null;
function renderRoad() {
  const cur = currentStage();
  const ss = stageSteps(cur.id);
  const frac = ss ? ss.done.filter((x) => ss.all.includes(x)).length / ss.all.length : 0;
  const pct = J.pathPct(state.stageDone, state.done, frac);
  const left = ss ? ss.all.filter((x) => !ss.done.includes(x)).length : 0;
  const label = !state.stageDone.includes('lead') ? J.minsLabel(J.secsLeft(state.done))
    : ss && !state.stageDone.includes(cur.id) ? (left <= 1 ? 'Almost there' : left + ' steps left in this stage') : 'Stage ' + (cur.n - 1) + ' complete';
  tween(ui.lastPct, pct, 700, (v) => { $('#pct').textContent = v + '%'; });
  ui.lastPct = pct;
  $$('.mins').forEach((e) => { e.textContent = label; });
  $('#barFill').style.width = Math.max(4, pct) + '%';
  $('#roadFill').style.width = pct + '%';
  $('#stripStep').textContent = 'Stage ' + cur.n + ' of ' + J.STAGES.length;
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
const typeChars = async (inp, text, my) => {
  inp.focus({ preventScroll: true });
  for (const ch of text) {
    if (my !== ui.run || !state.auto) return false;
    inp.value += ch;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(reduced() ? 0 : 38);
  }
  return true;
};
async function autoFill(form, step, my) {
  await sleep(reduced() ? 0 : 700);
  for (const f of step.fields) {
    if (my !== ui.run || !state.auto) return false;
    const want = f.id in J.PERSONA ? J.PERSONA[f.id] : Q.PERSONA_Q.budget[f.id];
    const el = form.querySelector('#f_' + f.id);
    if (!el || want == null) continue;
    if (el.type === 'range') {
      const from = Number(el.value), to = Number(want);
      const frames = reduced() ? 1 : 24;
      for (let i = 1; i <= frames; i++) {
        if (my !== ui.run || !state.auto) return false;
        el.value = String(Math.round((from + (to - from) * (i / frames)) / f.step) * f.step);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(reduced() ? 0 : 32);
      }
    } else if (el.tagName === 'SELECT') {
      el.value = String(want); el.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(reduced() ? 0 : 450);
    } else {
      el.value = '';
      const text = f.type === 'tel' || f.type === 'zip' ? String(want).replace(/\D/g, '') : String(want);
      if (!(await typeChars(el, text, my))) return false;
    }
    await sleep(reduced() ? 0 : 280);
  }
  if (my !== ui.run || !state.auto) return false;
  await sleep(reduced() ? 0 : 500);
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
  if (step.sub) { const s = h('p', { class: 'sub' }, step.sub); t.append(s); requestAnimationFrame(() => s.classList.add('in')); await sleep(reduced() ? 0 : 200); }
  const f = buildForm(step, state.applicant, { mode: 'ask', onSubmit: (v) => finishStep(step, v, t) });
  f.el.classList.add('card-in');
  t.append(f.el);
  requestAnimationFrame(() => f.el.classList.add('in'));
  scrollToEl(t);
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
  await sleep(reduced() ? 0 : 650);
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
  if (!o.quiet) burst();
  const t = await say(o.line, 'win');
  const stage = J.stageById(id), next = J.STAGES[J.STAGES.indexOf(stage) + 1];
  const my = ui.run;
  const go = next && next.built
    ? h('button', { class: 'btn', type: 'button', onclick: o.onNext }, 'Continue to ' + next.label.toLowerCase(), ico('chevR', 16, 2.4))
    : h('button', { class: 'btn line', type: 'button', onclick: () => { state.auto = true; resetAll(); } }, 'Replay from the start');
  const card = h('div', { class: 'card stage-card in' },
    h('div', { class: 'win-ic' }, ico('check', 26, 3)),
    h('h3', null, 'Step ' + stage.n + ' of ' + J.STAGES.length + ' complete'),
    h('p', null, o.body),
    next && !next.built ? h('div', { class: 'soon-note' }, ico('info', 16), h('span', null, 'Prototype note: "' + next.label + '" is the next piece to be built. The path on the right shows the whole journey.')) : null,
    go);
  t.append(card); scrollToEl(t);
  if (state.auto && next && next.built) { await sleep(reduced() ? 0 : 2600); if (my === ui.run && state.auto) o.onNext(); }
}
const completeLead = (quiet) => stageDone('lead', { quiet, line: 'You took the first step, ' + (state.applicant.first || 'there') + '. Nice work.',
  body: 'Telling us about your debt is done. Next, a few questions to see which program fits and what has made payments hard.', onNext: startQualify });
const completeQualify = (quiet) => stageDone('qualify', { quiet, line: "That's two steps down, " + (state.applicant.first || 'there') + '.',
  body: 'You told us about your debt, what changed, and your budget. Next you meet your plan: we confirm your debts, listen, set honest expectations, and show what you would pay.', onNext: startConsult });

const completeConsult = (quiet) => stageDone('consult', { quiet, line: 'You have a plan, ' + (state.applicant.first || 'there') + '.',
  body: 'You confirmed your debts, told us what matters, heard exactly what to expect, and chose a deposit. Next you review the agreement, sign, and open your account.', onNext: () => {} });

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
  if (meta.sub) { const s = h('p', { class: 'sub' }, meta.sub); t.append(s); requestAnimationFrame(() => s.classList.add('in')); await sleep(reduced() ? 0 : 200); }
  const alive = () => my === ui.run && state.auto;
  const card = build(t, my);
  card.el.classList.add('card-in'); t.append(card.el);
  requestAnimationFrame(() => card.el.classList.add('in'));
  scrollToEl(t);
  if (state.auto) card.auto(alive);
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
  await sleep(reduced() ? 0 : 650);
  if (Q.nextQStep(state.qdone, state.q)) proceedQ(); else completeQualify();
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
  await sleep(reduced() ? 0 : 650);
  if (C.nextCStep(state.cdone)) proceedC(); else completeConsult();
}

/* ---------- confetti (small, dependency free) ---------- */
function burst() {
  if (reduced()) return;
  const cv = $('#confetti'), cx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight; cv.classList.add('on');
  const colors = ['#3300ff', '#5a4cf0', '#146c55', '#ffb703', '#ff5d8f', '#00c2a8'];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 220, y: innerHeight * .45, vx: (Math.random() - .5) * 13, vy: -Math.random() * 15 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: colors[(Math.random() * colors.length) | 0] }));
  const t0 = performance.now();
  (function frame(now) {
    const dt = now - t0;
    cx.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) { p.vy += .42; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.max(0, 1 - dt / 2600); cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); cx.restore(); }
    if (dt < 2600) requestAnimationFrame(frame); else { cx.clearRect(0, 0, cv.width, cv.height); cv.classList.remove('on'); }
  })(t0);
}

/* ---------- assistant dock ---------- */
const askForm = $('#askForm'), askInput = $('#askInput');
const userMsg = (text) => { const m = h('div', { class: 'msg user' }, h('div', { class: 'mb' }, text)); stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in')); return m; };
async function handleSend(text) {
  const q = String(text || '').trim();
  if (!q) return;
  askInput.value = '';
  userMsg(q); scrollEnd();
  const m = h('div', { class: 'msg bot wait' }, h('img', { class: 'mav mark', src: '/achieve/firsttake/img/logo-mark.png', alt: '' }),
    h('div', { class: 'mb' }, h('span', { class: 'dots', 'aria-label': 'Typing' }, h('i'), h('i'), h('i'))));
  stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in')); scrollEnd();
  await sleep(reduced() ? 0 : 700);
  m.querySelector('.mb').textContent = localAnswer(q) || FALLBACK;
  m.classList.remove('wait'); m.classList.add('said'); scrollEnd();
}
askForm.addEventListener('submit', (e) => { e.preventDefault(); handleSend(askInput.value); });
$('#suggRow').append(...SUGGESTIONS.map((s) => h('button', { type: 'button', onclick: () => handleSend(s) }, s)));

/* ---------- prototype controls ---------- */
const devBtn = $('#devBtn'), devMenu = $('#devMenu');
const paintAuto = () => { devBtn.textContent = state.auto ? 'Auto-play on' : 'Auto-play off'; $('#doAuto').textContent = 'Auto-play: ' + (state.auto ? 'on (tap to take over)' : 'off (tap to turn on)'); };
devBtn.addEventListener('click', () => { const open = devMenu.hidden; devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); });
$('#doAuto').addEventListener('click', () => {
  state.auto = !state.auto; save(); paintAuto(); devMenu.hidden = true; devBtn.setAttribute('aria-expanded', 'false');
  const pending = $('.turn.pending', stream);
  if (state.auto && pending) { const step = J.stepById(pending.dataset.step); const form = pending.querySelector('form'); if (step && form) autoFill(form, step, ui.run); }
});
$('#doSkip').addEventListener('click', () => {
  if (!state.stageDone.includes('lead')) { Object.assign(state.applicant, J.PERSONA); state.done = J.LEAD_STEPS.map((s) => s.id); }
  else if (state.stageDone.includes('qualify')) { Object.assign(state.c, JSON.parse(JSON.stringify(C.PERSONA_C))); state.c.custom = []; state.cdone = C.C_STEPS.filter((x) => x !== 'plan'); }
  else { state.q = JSON.parse(JSON.stringify(Q.PERSONA_Q)); state.qdone = Q.qSteps(state.q).filter((x) => x !== 'result'); state.stageDone.includes('lead') || state.stageDone.push('lead'); }
  save(); devMenu.hidden = true; location.reload();
});
function resetAll() { ui.run++; try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } location.reload(); }
$('#doReset').addEventListener('click', () => { state.auto = true; try { sessionStorage.setItem(KEY, JSON.stringify({ auto: true })); } catch { /* ignore */ } location.reload(); });

/* ---------- start ---------- */
const answeredTurn = (id, q, text) => { const t = addTurn(id, 'answered'); t.append(h('div', { class: 'q' }, h('span', { class: 'qt' }, q)), h('div', { class: 'ans in' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, text)))); };
(async function start() {
  paintAuto();
  renderRoad();
  if (J.leadComplete(state.done)) {
    state.stageDone.includes('lead') || state.stageDone.push('lead');
    J.LEAD_STEPS.forEach((s) => answeredTurn(s.id, s.q, s.summary(state.applicant)));
    const qdone = state.qdone.filter((x) => x !== 'result');
    qdone.forEach((id) => answeredTurn(id, qMeta(id).q, qSummary(id)));
    if (state.qdone.includes('result')) { state.stageDone.includes('qualify') || state.stageDone.push('qualify'); state.cdone.forEach((id) => answeredTurn(id, CMETA[id].q, cSummary(id))); }
    renderRoad();
    if (state.stageDone.includes('qualify') || (state.qdone.includes('result'))) {
      if (!C.nextCStep(state.cdone)) { completeConsult(true); return; }
      if (state.cdone.length) { await say('Welcome back. Let\'s keep going.'); proceedC(); return; }
      completeQualify(true); return;
    }
    if (Q.nextQStep(state.qdone, state.q) === null && state.qdone.includes('result')) { completeQualify(true); return; }
    if (qdone.length) { await say('Welcome back. Let\'s keep going.'); proceedQ(); return; }
    completeLead(true); return;
  }
  await say('Welcome to Achieve. Dealing with debt is hard, and you took a step by being here. Let\'s see how we can help.');
  proceed();
})();
