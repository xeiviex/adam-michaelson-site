/* Achieve debt relief prototype. Slice 1: the shell (path nav, assistant dock, auto-play) and stage 1, lead intake.
   Reuses the first take's form cards, DOM helpers and styles. Everything is sample data and stays in the browser. */
import { h, $, $$, sleep, reduced, typeInto, tween, ico, icon } from './firsttake/shared/dom.js';
import { buildForm } from './firsttake/forms.js';
import * as J from './journey.js';
import { localAnswer, FALLBACK, SUGGESTIONS } from './debt-kb.js';

const KEY = 'achv1';
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
const state = Object.assign({ done: [], stageDone: [], applicant: {}, auto: true }, load());
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
function renderRoad() {
  const cur = currentStage();
  const pct = J.pathPct(state.stageDone, state.done);
  const label = state.stageDone.includes('lead') ? J.minsLabel(0) : J.minsLabel(J.secsLeft(state.done));
  tween(ui.lastPct, pct, 700, (v) => { $('#pct').textContent = v + '%'; });
  ui.lastPct = pct;
  $$('.mins').forEach((e) => { e.textContent = label; });
  $('#barFill').style.width = Math.max(4, pct) + '%';
  $('#roadFill').style.width = pct + '%';
  $('#stripStep').textContent = 'Stage ' + cur.n + ' of ' + J.STAGES.length;
  road.innerHTML = '<ol class="stages">' + J.STAGES.map((s) => {
    const done = state.stageDone.includes(s.id), on = s.id === cur.id && !done;
    const subs = s.id === 'lead' && on ? '<ul class="subs">' + J.LEAD_STEPS.map((x) => `<li class="${state.done.includes(x.id) ? 'done' : ''}">${x.label}</li>`).join('') + '</ul>' : '';
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
    const want = J.PERSONA[f.id];
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
async function completeLead() {
  if (!state.stageDone.includes('lead')) state.stageDone.push('lead');
  save();
  renderRoad();
  burst();
  const first = state.applicant.first || 'there';
  const t = await say('You took the first step, ' + first + '. Nice work.', 'win');
  const next = J.stageById('qualify');
  const card = h('div', { class: 'card stage-card in' },
    h('div', { class: 'win-ic' }, ico('check', 26, 3)),
    h('h3', null, 'Step 1 of 8 complete'),
    h('p', null, 'Telling us about your debt is done. Next is ', h('b', null, next.label.toLowerCase()), ': a few questions to see which program fits, and what is making payments hard right now.'),
    h('div', { class: 'soon-note' }, ico('info', 16), h('span', null, 'Prototype note: the qualification stage is the next piece to be built. The path on the right shows the whole journey.')),
    h('button', { class: 'btn line', type: 'button', onclick: () => { state.auto = true; resetAll(); } }, 'Replay from the start'));
  t.append(card);
  scrollToEl(t);
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
  Object.assign(state.applicant, J.PERSONA); state.done = J.LEAD_STEPS.map((s) => s.id); save(); devMenu.hidden = true; location.reload();
});
function resetAll() { ui.run++; try { sessionStorage.removeItem(KEY); } catch { /* ignore */ } location.reload(); }
$('#doReset').addEventListener('click', () => { state.auto = true; try { sessionStorage.setItem(KEY, JSON.stringify({ auto: true })); } catch { /* ignore */ } location.reload(); });

/* ---------- start ---------- */
(async function start() {
  paintAuto();
  renderRoad();
  if (J.leadComplete(state.done)) {
    state.stageDone.includes('lead') || state.stageDone.push('lead');
    J.LEAD_STEPS.forEach((s) => { const t = addTurn(s.id, 'answered'); t.append(h('div', { class: 'q' }, h('span', { class: 'qt' }, s.q)), h('div', { class: 'ans in' }, h('span', { class: 'bubble static' }, h('span', { class: 'bt' }, s.summary(state.applicant))))); });
    renderRoad(); completeLead(); return;
  }
  await say('Welcome to Achieve. Dealing with debt is hard, and you took a step by being here. Let\'s see how we can help.');
  proceed();
})();
