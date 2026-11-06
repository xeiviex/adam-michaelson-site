/* Achieve prototype, context 1: the web funnel.
   A conversation that asks the Achieve application's questions as forms, with a roadmap that is always visible,
   free-form questions at any time, a human consultant on request, and offers at the end.
   Everything is sample data and stays in the browser. */
import { h, $, $$, sleep, reduced, typeInto, tween, ico, icon, avatarImg } from './shared/dom.js';
import * as F from './shared/flow.js';
import { store } from './shared/store.js';
import { buildOffers, offerLine } from './shared/offers.js';
import { ask, slimContext, slimOffers } from './shared/bot.js';
import { buildForm, reviewCard } from './forms.js';
import { openModal, needHelpBody, docsPanel, offersPanel, details } from './panels.js';

const S = store();
const stream = $('#stream'), tail = $('#tail'), road = $('#roadInner'), dock = $('#dock');
const askForm = $('#askForm'), askInput = $('#askInput'), chip = $('#ctxChip'), humanBar = $('#humanBar');
const mobile = window.matchMedia('(max-width: 899px)');

const ui = { run: 0, human: false, chat: [], offerCtx: null, drafts: {}, offers: [], openGroups: new Set(), lastPct: 0, justDone: new Set(), busy: false };
const A = () => S.applicant();
const first = () => A().first || '';

/* ---------- scrolling ---------- */
function scrollToEl(el, offset) {
  const top = Math.max(0, el.offsetTop - (offset == null ? Math.min(110, stream.clientHeight * 0.14) : offset));
  stream.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
}
const scrollEnd = () => stream.scrollTo({ top: stream.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' });
function updateEarlier() {
  const has = $$('.turn.answered', stream).length > 0 || $$('.msg', stream).length > 0;
  $('#earlier').classList.toggle('show', has && stream.scrollTop > 140 && !mobile.matches);
}
stream.addEventListener('scroll', updateEarlier, { passive: true });
$('#earlier').addEventListener('click', () => stream.scrollBy({ top: -Math.round(stream.clientHeight * 0.7), behavior: 'smooth' }));

/* ---------- roadmap ---------- */
function stepRowHtml(s, cur) {
  const done = S.isDone(s.id);
  const on = s.id === cur;
  return `<li><button type="button" class="rs ${done ? 'done' : ''} ${on ? 'cur' : ''} ${ui.justDone.has(s.id) ? 'pop' : ''}" data-step="${s.id}" ${on ? 'aria-current="step"' : ''}>
    <span class="dot">${done ? icon('check', 12, 3) : ''}</span><span class="rl">${s.label}</span></button></li>`;
}
function renderRoad() {
  const cur = S.get().focus && !S.isDone(S.get().focus) ? S.get().focus : S.nextIncomplete();
  const curGroup = cur ? F.stepById(cur).group : 'offers';
  ui.openGroups.add(curGroup);
  const p = S.progress();
  const secs = p.secsLeft;
  const label = F.minsLabel(secs, S.doneIds());
  $('#pct').textContent = p.pct + '%';
  tween(ui.lastPct, p.pct, 700, (v) => { $('#pct').textContent = v + '%'; });
  ui.lastPct = p.pct;
  $$('.mins').forEach((e) => { e.textContent = label; });
  $('#barFill').style.width = Math.max(4, p.pct) + '%';
  $('#roadFill').style.width = p.pct + '%';
  const idx = cur ? F.stepIndex(cur) + 1 : F.STEPS.length;
  $('#stripStep').textContent = 'Step ' + idx + ' of ' + F.STEPS.length;
  road.innerHTML = F.GROUPS.map((g) => {
    const gp = S.groupProgress(g.id);
    const open = ui.openGroups.has(g.id);
    const complete = gp.done === gp.total;
    return `<div class="rg ${open ? 'open' : ''} ${complete ? 'complete' : ''}">
      <button type="button" class="rg-h" data-group="${g.id}" aria-expanded="${open}">
        <span class="rg-ic">${complete ? icon('check', 14, 3) : icon('chevR', 14, 2.4)}</span><span class="rg-t">${g.title}</span><span class="rg-n">${gp.done}/${gp.total}</span></button>
      <ul>${F.stepsInGroup(g.id).map((s) => stepRowHtml(s, cur)).join('')}</ul></div>`;
  }).join('');
  ui.justDone.clear();
}
road.addEventListener('click', (e) => {
  const g = e.target.closest('.rg-h');
  if (g) { const id = g.dataset.group; ui.openGroups.has(id) ? ui.openGroups.delete(id) : ui.openGroups.add(id); renderRoad(); return; }
  const s = e.target.closest('.rs');
  if (s) { closeSheet(); jump(s.dataset.step, true); }
});
const sheet = $('#road');
function openSheet() { sheet.classList.add('open'); $('#roadBack').classList.add('on'); }
function closeSheet() { sheet.classList.remove('open'); $('#roadBack').classList.remove('on'); }
$('#strip').addEventListener('click', openSheet);
$('#roadBack').addEventListener('click', closeSheet);
$('#roadClose').addEventListener('click', closeSheet);

/* ---------- conversation primitives ---------- */
const cancelled = (my) => () => my !== ui.run;

function addTurn(stepId, cls) {
  const t = h('section', { class: 'turn ' + (cls || ''), 'data-step': stepId || '' });
  stream.insertBefore(t, tail);
  return t;
}
function dropPending(except) {
  $$('.turn:not(.answered):not(.intro):not(.done)', stream).forEach((t) => { if (t.dataset.step !== except) t.remove(); });
}
const turnFor = (id) => stream.querySelector('.turn[data-step="' + id + '"]');

function bubble(text, id) {
  return h('button', { type: 'button', class: 'bubble', 'aria-label': 'Change this answer: ' + text, title: 'Change this answer', onclick: () => openEdit(id) },
    h('span', { class: 'bt' }, text), ico('edit', 14));
}

function answerText(step) { return step.summary(A(), S.get()); }

function renderAnswered(step) {
  const t = addTurn(step.id, 'answered');
  t.append(h('div', { class: 'q' }, h('span', { class: 'qt' }, step.q)), h('div', { class: 'ans' }, bubble(answerText(step), step.id)));
  return t;
}

async function say(text, o) {
  const opt = o || {};
  const my = ++ui.run;
  const t = addTurn('', 'intro lead' + (opt.cls ? ' ' + opt.cls : ''));
  const q = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(q);
  if (!opt.noScroll) scrollToEl(t);
  await typeInto(q.firstChild, text, { cancelled: cancelled(my), instant: opt.instant });
  return t;
}

/* ---------- asking a step ---------- */
async function askStep(id, o) {
  const opt = o || {};
  const step = F.stepById(id);
  if (!step) return;
  if (S.isDone(id)) { openEdit(id); return; }
  S.start(id); renderRoad();
  const my = ++ui.run;
  dropPending(id);
  const old = turnFor(id);
  if (old) old.remove();
  if (opt.lead) {
    const lead = addTurn('', 'intro lead');
    const lq = h('div', { class: 'q' }, h('span', { class: 'qt' }));
    lead.append(lq);
    scrollToEl(lead);
    await typeInto(lq.firstChild, opt.lead, { cancelled: cancelled(my) });
    if (my !== ui.run) return;
    await sleep(reduced() ? 0 : 250);
  }
  const t = addTurn(id, 'pending');
  const q = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(q);
  if (!opt.noScroll) scrollToEl(t);
  const ok = await typeInto(q.firstChild, step.q, { cancelled: cancelled(my) });
  if (!ok || my !== ui.run) return;
  if (step.sub) { const s = h('p', { class: 'sub' }, step.sub); t.append(s); requestAnimationFrame(() => s.classList.add('in')); await sleep(reduced() ? 0 : 220); }
  if (my !== ui.run) return;
  const card = makeCard(step, 'ask', t);
  card.classList.add('card-in');
  t.append(card);
  requestAnimationFrame(() => card.classList.add('in'));
  if (step.f) step.f.focus();
  if (!opt.noScroll) scrollToEl(t);
}

function makeCard(step, mode, turn) {
  const a = A();
  if (step.review) {
    const box = h('div', { class: 'card review-card' }, reviewCard(a, (id) => openEdit(id), null),
      h('button', { class: 'btn', type: 'button', onclick: () => finishStep(step, {}, mode, turn) }, mode === 'edit' ? 'Done' : 'Looks good', ico('chevR', 16, 2.4)));
    return box;
  }
  if (step.docs) return docsPanel(S, a, {
    onContinue: () => finishStep(step, {}, mode, turn),
    onLater: () => { S.get().docs_later = true; finishStep(step, {}, mode, turn); },
  });
  if (step.offers) {
    ui.offers = buildOffers(a);
    return offersPanel(ui.offers, a, { onChoose: chooseOffer, onAsk: askAboutOffer });
  }
  const f = buildForm(step, a, { mode, drafts: ui.drafts[step.id] || (ui.drafts[step.id] = {}), onSubmit: (v) => finishStep(step, v, mode, turn) });
  step.f = f;
  const wrap = f.el;
  if (mode === 'edit') wrap.append(h('button', { type: 'button', class: 'lnk cancel', onclick: () => closeEdit(turn) }, 'Cancel'));
  return wrap;
}

async function finishStep(step, values, mode, turn) {
  const patch = Object.assign({}, values);
  if (step.id === 'ssn') { S.get().ssn_provided = true; delete patch.ssn; }
  if (step.fields.length) S.setApplicant(patch);
  if (mode === 'edit') { closeEdit(turn); S.log('edit', { step_id: step.id }); S.save(); renderRoad(); const pend = $('.turn.pending', stream); if (pend && mode === 'edit') setTimeout(() => scrollToEl(pend), 350); return; }
  const wasNext = S.nextIncomplete() === step.id;
  S.complete(step.id);
  ui.justDone.add(step.id);
  turn.classList.remove('pending');
  turn.classList.add('answered');
  const card = turn.querySelector('.card');
  const sub = turn.querySelector('.sub');
  if (card) { card.style.maxHeight = card.offsetHeight + 'px'; requestAnimationFrame(() => card.classList.add('out')); setTimeout(() => card.remove(), 420); }
  if (sub) sub.classList.add('fade');
  const b = h('div', { class: 'ans' }, bubble(answerText(step), step.id));
  turn.append(b);
  requestAnimationFrame(() => b.classList.add('in'));
  renderRoad();
  await sleep(reduced() ? 0 : 650);
  proceed(wasNext);
}

function proceed(inOrder) {
  const next = S.nextIncomplete();
  if (!next) { finishFlow(); return; }
  askStep(next, inOrder === false ? { lead: "Let's pick up the step we skipped." } : null);
}

/* ---------- editing an earlier answer ---------- */
function openEdit(id) {
  const step = F.stepById(id);
  const turn = turnFor(id);
  if (!step || !turn) { askStep(id); return; }
  if (!turn.classList.contains('answered')) { scrollToEl(turn); return; }
  if (turn.querySelector('.card')) { scrollToEl(turn); return; }
  if (step.offers) { scrollToEl(turn); return; }
  turn.classList.add('editing');
  const card = makeCard(step, 'edit', turn);
  card.classList.add('card-in');
  turn.append(card);
  requestAnimationFrame(() => card.classList.add('in'));
  scrollToEl(turn);
  if (step.f) step.f.focus();
}
function closeEdit(turn) {
  const step = F.stepById(turn.dataset.step);
  const card = turn.querySelector('.card');
  if (card) card.remove();
  turn.classList.remove('editing');
  const bt = turn.querySelector('.bubble .bt');
  if (bt && step) bt.textContent = answerText(step);
}

/* ---------- jumping around ---------- */
function jump(id, fromRoad) {
  const step = F.stepById(id);
  if (!step) return;
  if (S.isDone(id)) { openEdit(id); return; }
  const turn = turnFor(id);
  if (turn && turn.classList.contains('pending') && stream.contains(turn)) { scrollToEl(turn); return; }
  askStep(id, { lead: fromRoad ? 'Sure, ' + step.label.toLowerCase() + ' next.' : "Sure. Let's do " + step.label.toLowerCase() + ' now.' });
}
const currentId = () => { const f = S.get().focus; return f && !S.isDone(f) ? f : S.nextIncomplete(); };

/* ---------- offers and the finish ---------- */
function askAboutOffer(of, seed) {
  ui.offerCtx = of;
  renderCtxChip();
  askInput.focus();
  if (seed) { askInput.value = seed; handleSend(seed); }
  else askInput.placeholder = 'Ask about ' + of.name + ' (' + of.short + ')';
}
function renderCtxChip() {
  const o = ui.offerCtx;
  chip.hidden = !o;
  if (!o) { askInput.placeholder = ui.human ? 'Message Maya...' : 'Ask a question...'; return; }
  chip.replaceChildren(h('span', null, 'Asking about ', h('b', null, o.name + ' · ' + o.short)), h('button', { type: 'button', 'aria-label': 'Stop asking about this offer', html: icon('x', 14), onclick: () => { ui.offerCtx = null; renderCtxChip(); } }));
  const hints = ['What if I pay it off early?', 'Why is the fee that amount?', 'Is this the best fit for me?'];
  chip.append(h('div', { class: 'sugg' }, hints.map((q) => h('button', { type: 'button', onclick: () => handleSend(q) }, q))));
}

function chooseOffer(of) {
  const body = h('div', { class: 'choose' },
    h('h2', null, 'Continue with this offer?'),
    h('p', null, of.name + ' (' + of.short + '): ' + F.money(of.monthly) + ' a month at ' + of.apr + '% APR.'),
    h('p', { class: 'sample-note' }, ico('info', 14), 'Prototype: nothing is submitted. A real offer would move on to e-signing.'),
    h('div', { class: 'o-actions stack' },
      h('button', { class: 'btn', type: 'button', onclick: () => { close(); confirmOffer(of); } }, 'Yes, continue'),
      h('button', { class: 'btn line', type: 'button', onclick: () => close() }, 'Keep comparing')));
  const close = openModal({ body, title: 'Continue with this offer' });
}
async function confirmOffer(of) {
  ui.offerCtx = null; renderCtxChip();
  S.get().selected_offer = of.id; S.get().selected_offer_name = of.name + ' (' + of.short + ')'; S.save();
  const turn = turnFor('offers');
  if (turn && turn.classList.contains('pending')) await finishStep(F.stepById('offers'), {}, 'ask', turn); else finishFlow();
}

async function finishFlow() {
  if (stream.querySelector('.turn.done')) return;
  const my = ++ui.run;
  const t = addTurn('done', 'done');
  const q = h('div', { class: 'q' }, h('span', { class: 'qt' }));
  t.append(q);
  scrollToEl(t);
  const name = first();
  await typeInto(q.firstChild, 'You made the right move with Achieve' + (name ? ', ' + name : '') + '!', { cancelled: cancelled(my) });
  const sel = S.get().selected_offer_name;
  const card = h('div', { class: 'card done-card' },
    h('p', { class: 'sub in' }, sel ? 'You chose ' + sel + '. We are reviewing your submitted documents and will reach out within 2-3 business days.' : "We're currently reviewing your submitted documents. We will reach out within 2-3 business days."),
    h('div', { class: 'contact' }, h('b', null, ico('headset', 18), 'Contact Us'), h('span', null, 'Ready to talk now? Give us a call.'), h('a', { class: 'tel-pill', href: 'tel:' + F.BRAND.consultants.replace(/-/g, '') }, F.BRAND.consultants),
      h('b', { class: 'hrs' }, 'Hours of Operation:'), F.HOURS.map((r) => h('div', { class: 'hr' }, h('span', null, r[0]), h('b', null, r[1])))));
  t.append(card);
  requestAnimationFrame(() => card.classList.add('in'));
  renderRoad();
  scrollToEl(t);
}

/* ---------- free-form chat ---------- */
function userMsg(text) {
  const m = h('div', { class: 'msg user' }, h('div', { class: 'mb' }, text));
  stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in'));
  return m;
}
function dots(who) {
  const m = h('div', { class: 'msg ' + who + ' wait' }, who === 'human' ? avatarImg('mav') : h('img', { class: 'mav mark', src: '/achieve/img/logo-mark.png', alt: '' }),
    h('div', { class: 'mb' }, h('span', { class: 'dots', 'aria-label': 'Typing' }, h('i'), h('i'), h('i'))));
  stream.insertBefore(m, tail); requestAnimationFrame(() => m.classList.add('in'));
  return m;
}
async function reveal(m, text, minWait) {
  await sleep(reduced() ? 0 : minWait);
  const mb = m.querySelector('.mb');
  mb.textContent = text;
  m.classList.remove('wait'); m.classList.add('said');
}
function context() {
  const cid = currentId();
  return slimContext(A(), { step: cid, offerId: ui.offerCtx && ui.offerCtx.id, offers: cid === 'offers' || S.get().selected_offer ? slimOffers(ui.offers.length ? ui.offers : buildOffers(A())) : [], persona: ui.human ? 'human' : 'assistant', channel: 'web' });
}

async function handleSend(raw) {
  const text = String(raw || '').trim().slice(0, 500);
  if (!text) return;
  askInput.value = '';
  userMsg(text);
  scrollEnd();
  const nav = !ui.human && F.parseNavigate(text);
  if (nav) {
    const st = F.stepById(nav.stepId);
    ui.chat.push({ role: 'user', content: text });
    await sleep(500);
    jump(nav.stepId, false);
    return;
  }
  ui.chat.push({ role: 'user', content: text });
  const who = ui.human ? 'human' : 'bot';
  const w = dots(who);
  scrollEnd();
  const started = Date.now();
  const reply = await ask(ui.chat, context());
  ui.chat.push({ role: 'assistant', content: reply });
  const wait = Math.max(0, 900 - (Date.now() - started));
  await reveal(w, reply, wait);
  scrollEnd();
  if (!ui.human) {
    const cid = currentId();
    if (cid) { await sleep(reduced() ? 0 : 1100); const st = F.stepById(cid); askStep(cid, { lead: 'Back to where we left off: ' + st.label.toLowerCase() + '.' }); }
  }
}
askForm.addEventListener('submit', (e) => { e.preventDefault(); handleSend(askInput.value); });

/* ---------- the human ---------- */
async function startHuman() {
  if (ui.human) { askInput.focus(); return; }
  $$('.modal-back').forEach((m) => m.remove()); document.body.classList.remove('modal-open');
  ui.human = true; ui.run++;
  document.body.classList.add('human');
  humanBar.hidden = false;
  askInput.placeholder = 'Message Maya...';
  const div = h('div', { class: 'joined' }, avatarImg('jav'), h('span', null, h('b', null, 'Maya R.'), ' joined the chat'), h('em', null, 'Achieve loan consultant'));
  stream.insertBefore(div, tail); requestAnimationFrame(() => div.classList.add('in')); scrollEnd();
  const step = F.stepById(currentId() || 'offers');
  const lines = [
    'Hi' + (first() ? ' ' + first() : '') + ", I'm Maya with Achieve. I'm a real person, and I'm here to help.",
    step ? "I can see you're working on " + step.label.toLowerCase() + '. What can I help you with?' : 'I can see your application is nearly done. What can I help you with?',
  ];
  for (const l of lines) { const w = dots('human'); scrollEnd(); await reveal(w, l, 1300); ui.chat.push({ role: 'assistant', content: l }); scrollEnd(); }
  askInput.focus();
}
async function handBack() {
  if (!ui.human) return;
  ui.human = false;
  document.body.classList.remove('human');
  humanBar.hidden = true;
  renderCtxChip();
  const div = h('div', { class: 'joined back' }, ico('sparkle', 16), h('span', null, 'Maya handed you back to the ', h('b', null, 'Achieve assistant')));
  stream.insertBefore(div, tail); requestAnimationFrame(() => div.classList.add('in'));
  ui.chat.push({ role: 'user', content: '(The consultant handed the conversation back to the automated assistant.)' }); ui.chat.push({ role: 'assistant', content: 'Welcome back! I can answer questions or keep going with your application.' });
  await sleep(700);
  const cid = currentId();
  if (cid) askStep(cid, { lead: "I'm back. Let's pick up where you left off." });
  else scrollEnd();
}
$$('[data-human]').forEach((b) => b.addEventListener('click', startHuman));
$('#handBack').addEventListener('click', handBack);
$$('[data-help]').forEach((b) => b.addEventListener('click', () => openModal({ body: needHelpBody(startHuman), title: 'Need help' })));

/* ---------- prototype controls (not part of the real product) ---------- */
const dev = $('#dev'), devBtn = $('#devBtn'), devMenu = $('#devMenu');
devBtn.addEventListener('click', () => { const open = devMenu.hidden; devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); });
document.addEventListener('click', (e) => { if (!dev.contains(e.target)) { devMenu.hidden = true; devBtn.setAttribute('aria-expanded', 'false'); } });
function dropOut(to) {
  S.dropOut('web', to);
  document.body.classList.add('leaving');
  setTimeout(() => { location.href = to === 'chatgpt' ? '/achieve/chatgpt/' : '/achieve/messages/'; }, reduced() ? 0 : 450);
}
$('#doDropMsg').addEventListener('click', () => dropOut('messages'));
$('#doDropGpt').addEventListener('click', () => dropOut('chatgpt'));
$('#doReset').addEventListener('click', () => { S.reset(); location.href = '/achieve/'; });

/* ---------- start ---------- */
async function boot() {
  const q = new URLSearchParams(location.search);
  const dropped = S.get().dropout;
  const resume = q.get('resume') || q.get('step');
  const done = S.doneIds();
  F.STEPS.forEach((s) => { if (S.isDone(s.id)) renderAnswered(s); });
  renderRoad();
  if (dropped) S.clearDropout();
  if (resume) history.replaceState(null, '', '/achieve/');

  const next = S.nextIncomplete();
  const target = resume && F.stepById(resume) && !S.isDone(resume) ? resume : next;
  if (!done.length && !resume) {
    const t = addTurn('', 'intro');
    const qd = h('div', { class: 'q' }, h('span', { class: 'qt' }));
    t.append(qd);
    const my = ++ui.run;
    await typeInto(qd.firstChild, "Hi, I'm Achieve's assistant. A few quick questions and you'll see your options. Checking your rate won't affect your credit score.", { cancelled: cancelled(my) });
    const trust = h('div', { class: 'trust' }, h('div', { class: 'tp' }, h('b', null, '★ Trustpilot'), h('span', { class: 'stars' }, '★★★★★'), h('small', null, 'Trustscore 4.8/5')), h('div', null, h('b', null, '450K+'), h('small', null, "Members we've served")), h('div', null, h('b', null, '$7.5 billion+'), h('small', null, 'Loans to members')));
    t.append(trust); requestAnimationFrame(() => trust.classList.add('in'));
    await sleep(reduced() ? 0 : 500);
    askStep(target, { noScroll: !mobile.matches });
    return;
  }
  if (!target) { finishFlow(); return; }
  const back = dropped || resume ? 'Welcome back' + (first() ? ', ' + first() : '') + ". You're right where you left off." : 'Welcome back' + (first() ? ', ' + first() : '') + '.';
  askStep(target, { lead: back });
}
window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });
boot();
