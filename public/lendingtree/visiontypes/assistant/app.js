/* Visiontype B: LendingTree inside a consumer AI assistant (drawn as ChatGPT).
   This file is the engine. It plays the script in script.js, renders the cards in cards.js, and runs auto-play:
   the prototype types, taps and fills the way a person would, and the Prototype control (outside the product UI)
   pauses it, switches path and entry, restarts, or jumps to servicing.

   Anything a person types that is not plainly one of the replies on offer goes to the live agent (../shared/agent.js).
   Its answer comes back with an action: carry on, stop for now, switch path, show what they hold, or start over.

   URL: ?path=loan|insurance  ?entry=user|agent  ?stage=shop|servicing  ?auto=0|1  ?embed=1  ?speed=<number>
        ?mock=1 swaps the live agent for canned replies (a test aid, see mockAsk below) */
import { h, $, $$, icon, reduced, parseRich, GPT_MARK, LEAF } from './kit.js?v=8';
import * as CARDS from './cards.js?v=8';
import { getScenes, findOffer, routeOpener, matchChoice, matchOpener, noteFor, holdings, OPENERS, TITLES, HERO, PROTO_NOTE, DEFAULT_SEL, SERVICING, MODALS, AGENT, NOTES } from './script.js?v=8';
import { PERSON, BRAND } from '../shared/data.js';
import { ask } from '../shared/agent.js';
import { away, watchAttention, attentionReset } from '../shared/attention.js?v=2';

/* ---------- settings ---------- */
const Q = new URLSearchParams(location.search);
const one = (k, allowed, d) => (allowed.includes(Q.get(k)) ? Q.get(k) : d);
const cfg = {
  path: one('path', ['loan', 'insurance'], 'loan'),
  entry: one('entry', ['user', 'agent'], 'user'),
  stage: one('stage', ['shop', 'servicing'], 'shop'),
  stageGiven: Q.has('stage'),
  embed: Q.get('embed') === '1',
  auto: Q.get('auto') !== '0',
  speed: Math.min(40, Math.max(0.25, Number(Q.get('speed')) || 1)),
  mock: Q.get('mock') === '1',
};
function syncUrl() {
  if (cfg.embed) return;
  const p = new URLSearchParams();
  if (cfg.path !== 'loan') p.set('path', cfg.path);
  if (cfg.entry !== 'user') p.set('entry', cfg.entry);
  if (cfg.stage !== 'shop') p.set('stage', cfg.stage);
  if (!cfg.auto) p.set('auto', '0');
  if (cfg.speed !== 1) p.set('speed', String(cfg.speed));
  if (cfg.mock) p.set('mock', '1');
  const s = p.toString();
  try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch { /* ignore */ }
}

/* ---------- state for one run ---------- */
let scenes = getScenes(cfg.path);
let S = null;
function freshState() {
  S = {
    v: {}, sel: null, list: null, mainSel: null, lead: '', why: '',
    log: [],                 /* the text turns so far, for the agent */
    started: false, offersShown: false, held: false, paused: false, left: null,
    get offer() { return findOffer(cfg.path, this.list, this.sel || DEFAULT_SEL[cfg.path]); },
    get main() { return findOffer(cfg.path, null, this.mainSel || DEFAULT_SEL[cfg.path]); },
  };
}
const val = (x) => (typeof x === 'function' ? x(S) : x);

/* ---------- time: cancellable, pauses while the tab is hidden ---------- */
const CANCEL = Symbol('cancel'), STOP = Symbol('stop');
const ALSO = Symbol('also');
let run = 0, autoTok = 0, pending = null;
let at = { name: '', i: 0 };          /* the step being played */
let asideQ = [], wakers = [], parked = [], busy = false, early = null, holdWake = null, heroEl = null;
const hurry = () => asideQ.length > 0 || !!early;   /* someone is waiting on us: stop lingering */
function sleep(ms, my = run) {
  return new Promise((res, rej) => {
    const end = () => { if (my !== run) return rej(CANCEL); if (away()) return setTimeout(end, 300); res(); };
    setTimeout(end, Math.max(0, ms / cfg.speed));
  });
}
const alive = (my) => { if (my !== run) throw CANCEL; };
async function linger(ms) { for (let left = ms; left > 0 && !hurry(); left -= 150) await sleep(Math.min(150, left)); }
const go = (p) => p.catch((e) => { if (e !== CANCEL && e !== STOP) throw e; });

/* ---------- elements ---------- */
const col = $('#col'), scroller = $('#scroller'), input = $('#gptInput'), sendBtn = $('#sendBtn'), suggest = $('#suggest');
const put = (id, n, s, w) => { const e = document.getElementById(id); if (e) e.innerHTML = icon(n, s, w); };
put('nwIc', 'compose', 18); put('srIc', 'search', 18); put('libIc', 'list', 18); put('mdIc', 'chevD', 14, 2.2); put('shIc', 'share', 16);
put('menuBtn', 'menu', 22, 2); put('cmpBtn', 'compose', 20); put('plusBtn', 'plus', 22, 2); put('micBtn', 'mic', 20); put('sendBtn', 'up', 18, 2.4); put('sideClose', 'sidebar', 20);
$('#logoIc').innerHTML = GPT_MARK;
$('#meA').textContent = $('#meB').textContent = PERSON.first[0];
$('#meName').textContent = PERSON.first + ' ' + PERSON.last;
$('#devNote').textContent = PROTO_NOTE;
function paintHistory() {
  const hist = $('#hist'); hist.textContent = '';
  [TITLES[cfg.path], ...TITLES.other].forEach((t, i) => hist.append(h('li', { class: i ? '' : 'on' }, t)));
}

/* ---------- scrolling: follow new content, unless the viewer scrolled away ---------- */
let stick = true, focusEl = null, focusSpan = false;
const smooth = () => (reduced() || cfg.speed > 3 ? 'auto' : 'smooth');
function follow() {
  if (!stick) return;
  const max = scroller.scrollHeight - scroller.clientHeight;
  let to = max;
  const on = focusEl && focusEl.isConnected;
  if (on && focusSpan) {   /* an answer with a card under it: keep the answer in view when both do not fit */
    if (col.offsetHeight - focusEl.offsetTop > scroller.clientHeight - 24) to = Math.min(max, Math.round(scroller.scrollTop + focusEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12));
  } else if (on && focusEl.offsetHeight > scroller.clientHeight - 24) to = Math.min(max, focusEl.offsetTop + col.offsetTop - 12);
  if (Math.abs(scroller.scrollTop - to) > 1) scroller.scrollTo({ top: to, behavior: smooth() });
}
new ResizeObserver(follow).observe(col);
new ResizeObserver(follow).observe(scroller);
const userScrolled = () => setTimeout(() => { stick = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 80; }, 120);
['wheel', 'touchmove', 'keydown'].forEach((ev) => scroller.addEventListener(ev, userScrolled, { passive: true }));
function add(el, focus) { col.append(el); focusEl = focus === false ? null : el; focusSpan = false; stick = true; follow(); return el; }
/* bring a card that is still waiting back under the latest answer, and keep that answer in view */
function represent(el, from) {
  if (!el || !el.isConnected || el === col.lastElementChild) return;
  col.append(el); focusEl = from && from.isConnected ? from : el; focusSpan = focusEl !== el; stick = true; follow();
}

/* ---------- messages ---------- */
function userRow(text) { add(h('div', { class: 'msg user' }, h('div', { class: 'ub' }, text))); S.log.push({ role: 'user', content: text }); }
const actions = () => h('div', { class: 'acts', 'aria-hidden': 'true' }, ['copy', 'thumb', 'speaker', 'refresh'].map((n) => h('span', { class: 'ib', html: icon(n, 16) })));
function markTurnEnd() {
  $$('.acts', col).forEach((a) => a.remove());
  const last = $$('.msg.bot', col).pop();
  if (last && last === col.lastElementChild) last.append(actions());
}
function botOpen(flag) {
  const m = h('div', { class: 'msg bot' });
  if (flag) m.append(h('div', { class: 'flag' }, flag.icon ? h('span', { class: 'ico', html: icon(flag.icon, 13, 2) }) : h('img', { src: LEAF, alt: '', width: 13, height: 13 }), flag.text));
  const t = h('div', { class: 'bt' }, h('span', { class: 'think', role: 'img', 'aria-label': 'Thinking' }));
  m.append(t); add(m);
  return { m, t };
}
/* The answer streams in the way it does in ChatGPT: a few characters at a time, left to right, quickly. The whole
   message takes 350ms to 1.8s depending on its length (scaled by ?speed like every other wait). Only text nodes are
   written, so **bold** never shows as markup. While it streams the visible text is hidden from assistive tech and a
   visually hidden copy of the whole answer is read once; with reduced motion the text simply appears.
   A run that is cancelled mid-stream (restart, path switch) leaves the full sentence if the message is still on the page. */
const STREAM = { min: 350, max: 1800, perChar: 7, tick: 22 };
const wholeText = (paras) => paras.map((p) => h('p', null, p.words.map((w) => (w.b ? h('b', null, w.t) : w.t))));
async function botFill(t, text) {
  const my = run;
  const paras = parseRich(text);
  S.log.push({ role: 'assistant', content: String(text).replace(/\*\*/g, '') });
  if (reduced() || cfg.speed > 12 || hurry()) { t.replaceChildren(...wholeText(paras)); return; }
  /* one text node per run of plain or bold words; each paragraph joins the page when its first character does */
  const segs = [];
  let total = 0;
  for (const p of paras) {
    const pe = h('p');
    let last = null;
    for (const w of p.words) {
      if (last && last.b === !!w.b) { last.full += w.t; } else {
        const node = document.createTextNode('');
        if (w.b) pe.append(h('b', null, node)); else pe.append(node);
        last = { node, full: w.t, b: !!w.b, pe, n: 0 }; segs.push(last);
      }
      total += w.t.length;
    }
  }
  const plain = paras.map((p) => p.words.map((w) => w.t).join('')).join(' ');
  const sr = h('div', { class: 'sr-only' }, plain);
  t.setAttribute('aria-hidden', 'true'); t.textContent = ''; t.classList.add('stream'); t.after(sr);
  let shown = 0, si = 0;
  const show = (to) => {
    while (shown < to && si < segs.length) {
      const g = segs[si], take = Math.min(g.full.length - g.n, to - shown);
      if (!g.pe.isConnected) t.append(g.pe);
      g.n += take; shown += take; g.node.data = g.full.slice(0, g.n);
      if (g.n >= g.full.length) si++;
    }
  };
  const dur = Math.min(STREAM.max, Math.max(STREAM.min, total * STREAM.perChar)) / cfg.speed, t0 = performance.now();
  try {
    while (shown < total) {
      await sleep(STREAM.tick * cfg.speed, my);   /* a real 22ms or so between writes, whatever the speed */
      show(hurry() ? total : Math.max(shown + 1, Math.round(total * Math.min(1, (performance.now() - t0) / dur))));
    }
  } catch (e) {
    if (t.isConnected) show(total);
    throw e;
  } finally { t.classList.remove('stream'); }
}
async function botSay(text, flag, rest) {
  const { m, t } = botOpen(flag);
  try { await sleep(700 + Math.min(500, text.length * 2)); }   /* the thinking dot: 0.7s to 1.2s */
  catch (e) { m.remove(); throw e; }
  await botFill(t, text);
  await linger(rest == null ? Math.min(2400, 500 + text.length * 13) : rest);
}

/* ---------- the "Working with LendingTree" status ---------- */
function toolChip(label) {
  const title = h('b', { class: 'shim' }, 'Working with ' + (label || BRAND.name));
  const line = h('span', { class: 'tl-line' });
  const el = h('div', { class: 'tool', role: 'status' },
    h('span', { class: 'tl-ic' }, h('img', { src: LEAF, alt: '', width: 16, height: 16 }), h('i', { class: 'ring' }), h('i', { class: 'tl-ok', html: icon('check', 9, 3.4) })),
    h('span', { class: 'tl-m' }, title, line), h('span', { class: 'tl-mcp' }, 'MCP'));
  const set = (text) => { line.classList.remove('in'); void line.offsetWidth; line.textContent = text; line.classList.add('in'); };
  return { el, set, end(text, off) { el.classList.add(off ? 'off' : 'done'); title.classList.remove('shim'); title.textContent = BRAND.agent.replace(/^./, (c) => c.toUpperCase()); set(text); } };
}
async function tool(step) {
  const c = toolChip(step.label);
  add(c.el);
  for (const l of step.lines) { c.set(val(l)); await linger(1250); }
  c.end(val(step.done));
  await linger(750);
}

/* ---------- waiting for the person (or auto-play standing in for them) ---------- */
/* What the viewer sees when auto-play acts. A touch point lands on the control, the control presses in, a ring spreads
   from the point as it is let go, and a control that is still there afterwards flashes once (one that has just become
   the chosen one pulses instead). Before any of that the control is brought into view, only if it is not already
   comfortably in view, and the page is allowed to come to rest. Every wait scales with ?speed. */
const cue = h('div', { class: 'cue', 'aria-hidden': 'true' }, h('i'), h('b'));
document.body.append(cue);
let cueN = 0;
const cueAt = (node, x) => { const r = node.getBoundingClientRect(); cue.style.left = (x == null ? r.left + Math.min(r.width / 2, Math.max(28, r.width - 34)) : x) + 'px'; cue.style.top = r.top + r.height / 2 + 'px'; };
const cueShow = () => { cueN++; cue.className = 'cue show'; };
const cueRing = () => { const n = ++cueN; cue.className = 'cue show ring'; setTimeout(() => { if (n === cueN) cue.className = 'cue'; }, 560); };
function cueOff() { cueN++; cue.className = 'cue'; $$('.tap').forEach((n) => n.classList.remove('tap')); }
const thumbX = (inp) => { const r = inp.getBoundingClientRect(), p = (inp.value - inp.min) / ((inp.max - inp.min) || 1); return r.left + 12 + p * (r.width - 24); };
const CHOSEN = '[aria-checked="true"], .photo.on';
function flash(el) {
  requestAnimationFrame(() => {
    if (!el.isConnected) return;
    const c = el.matches(CHOSEN) || el.querySelector('input:checked') ? 'chosen' : 'tapped';
    el.classList.add(c); setTimeout(() => el.classList.remove(c), 900);
  });
}
function makeA(tok) {
  const pause = async (ms) => { await sleep(ms); if (!cfg.auto || tok !== autoTok) throw STOP; };
  /* scroll only when the control is not comfortably in view, smoothly, then wait until nothing is moving */
  const bringIn = async (el) => {
    if (scroller.contains(el)) {
      const r = el.getBoundingClientRect(), s = scroller.getBoundingClientRect();
      if (r.top < s.top + 24 || r.bottom > s.bottom - 24) scroller.scrollBy({ top: r.top + r.height / 2 - (s.top + s.height / 2), behavior: reduced() ? 'auto' : 'smooth' });
    }
    let last = null, still = 0;
    for (let i = 0; i < 24 && still < 2; i++) { await pause(70 * cfg.speed); const y = el.getBoundingClientRect().top; still = last != null && Math.abs(y - last) < 0.5 ? still + 1 : 0; last = y; }
  };
  const guard = async (fn) => { try { return await fn(); } catch (e) { cueOff(); throw e; } };
  return {
    pause,
    /* act is what the press does when it is not a plain click (the composer's send button submits the scripted reply) */
    tap: (el, hold, act) => guard(async () => {
      if (!el || (el.disabled && !act)) return;
      await bringIn(el);
      if (!el.isConnected) return;
      cueAt(el); cueShow(); await pause(240);
      el.classList.add('tap'); cue.classList.add('down'); await pause(hold || 300);
      el.classList.remove('tap'); cueAt(el); cueRing();
      focusEl = null;
      if (act) act(); else el.click();
      flash(el);
    }),
    /* the touch point taps the field, then the text types */
    type: (inp, text) => guard(async () => {
      await bringIn(inp);
      cueAt(inp); cueShow(); await pause(240); cue.classList.add('down'); await pause(160); cueRing();
      inp.classList.add('typing'); inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      try { for (const ch of text) { inp.value += ch; inp.dispatchEvent(new Event('input', { bubbles: true })); await pause(34 + Math.random() * 30); } } finally { inp.classList.remove('typing'); }
    }),
    /* the touch point lands on the thumb, holds it, and rides along as it is dragged */
    slide: (inp, to) => guard(async () => {
      await bringIn(inp);
      cueAt(inp, thumbX(inp)); cueShow(); await pause(240);
      inp.classList.add('tap'); cue.classList.add('down'); await pause(160);
      const from = Number(inp.value), step = Number(inp.step) || 1, frames = reduced() ? 1 : 26;
      try {
        for (let i = 1; i <= frames; i++) { const e = 1 - Math.pow(1 - i / frames, 3); inp.value = String(Math.round((from + (to - from) * e) / step) * step); inp.dispatchEvent(new Event('input', { bubbles: true })); cueAt(inp, thumbX(inp)); await pause(34); }
      } finally { inp.classList.remove('tap'); }
      cueAt(inp, thumbX(inp)); cueRing();
    }),
  };
}
function startAuto() {
  if (!pending || !pending.auto || !cfg.auto) return;
  pending.auto(makeA(++autoTok)).catch((e) => { if (e !== STOP && e !== CANCEL) throw e; });
}
/* Waits for the step to be answered. A typed message that is not an answer is taken to the agent and then the same step
   is offered again. `also` is a second way out (see hold). */
async function awaitUser(p, wait, also) {
  const my = run;
  let settled = false, out;
  p.wait = wait;
  wait.then((v) => { settled = true; p.answered = true; out = v; });
  if (also) also.then(() => { if (!settled) { settled = true; out = ALSO; } });
  for (;;) {
    pending = p; paintSuggest(); startAuto();
    await Promise.race([wait, also, p.noAside ? null : asideSignal()].filter(Boolean));
    alive(my);
    pending = null; paintSuggest();
    if (settled) return out;
    if (!asideQ.length) continue;
    parked.push(p);
    try { await aside(takeAsides(), p); } finally { if (my === run) parked.pop(); }
    alive(my);
    if (settled) return out;
    if (p.kind === 'choice' || p.kind === 'opener') markTurnEnd();
  }
}
function paintSuggest() {
  suggest.textContent = '';
  if (!pending || cfg.auto) return;
  if (pending.kind === 'choice') pending.opts.filter((o) => o.chip !== false).forEach((o) => suggest.append(h('button', { type: 'button', class: 'sg', onclick: () => submitChoice(o, o.say || o.label) }, o.label)));
  else if (pending.kind === 'opener' && !heroEl) OPENERS.filter((o) => o.primary).forEach((o) => suggest.append(h('button', { type: 'button', class: 'sg', onclick: () => { autoTok++; setInput(''); pending.done(o.text); } }, o.text)));
}
function setInput(v) { input.value = v; resize(); }
function submitChoice(o, text) {
  if (!pending || pending.kind !== 'choice') return;
  autoTok++; setInput('');
  pending.done({ o, text });
}
const typeComposer = async (A, text, submit) => { input.classList.add('auto'); try { await A.type(input, text); await A.pause(380); await A.tap(sendBtn, 200, submit); } finally { input.classList.remove('auto'); } };
const autoChoice = (opts) => async (A) => { await A.pause(1100); const a = opts.find((x) => x.auto) || opts[0]; await typeComposer(A, a.say || a.label, () => submitChoice(a, a.say || a.label)); };

async function choice(step) {
  markTurnEnd();
  const opts = step.options;
  const pre = early && opts.find((x) => x.pick === early);   /* they pressed Choose on the card before the question finished */
  early = null;
  let o, text;
  if (pre) { o = pre; text = pre.say || pre.label; }
  else {
    let done;
    const wait = new Promise((r) => { done = r; });
    ({ o, text } = await awaitUser({ kind: 'choice', opts, done, auto: autoChoice(opts) }, wait));
  }
  userRow(text);
  if (o.set) { if (o.set.sel) { S.sel = o.set.sel; S.list = o.set.list || null; if (!o.set.list) S.mainSel = o.set.sel; } }
  if (o.pick) markOffer(o.pick);
  await sleep(500);
  return o.go;
}
/* The Choose button on an offers card. It answers the question on offer, or the one that is about to be asked. */
function pick(id) {
  for (const p of [pending, ...parked.slice().reverse()]) {
    const o = p && p.kind === 'choice' && p.opts.find((x) => x.pick === id);
    if (!o) continue;
    if (p === pending) return submitChoice(o, o.say || o.label);
    autoTok++; markOffer(id);
    return p.done({ o, text: o.say || o.label });
  }
  early = id; markOffer(id);
  if (holdWake) holdWake();
}
function markOffer(id) {
  const card = $$('.ltc.offers', col).pop();
  if (!card) return;
  $$('.of-r', card).forEach((r) => { const on = r.dataset.id === id; r.classList.toggle('sel', on); const b = $('.of-b', r); b.disabled = true; if (on) b.textContent = 'Chosen'; });
  card.classList.add('locked');
}

/* ---------- embedded cards ---------- */
const LINGER = { offers: 2600, compare: 3200, celebrate: 3000, app: 2600, receipt: 2400 };
const cardCtx = () => { const my = run; return { val, get S() { return S; }, pick, pause: (ms) => sleep(ms, my) }; };
async function card(step) {
  const r = CARDS[step.t](step, cardCtx());
  const blk = add(h('div', { class: 'blk' }, r.el));
  if (step.t === 'offers') S.offersShown = true;
  if (step.t === 'celebrate') S.held = true;
  if (r.wait) { Object.assign(S.v, await awaitUser({ kind: 'card', el: blk, auto: r.auto }, r.wait)); await sleep(650); }
  else await linger(LINGER[step.t] || 1500);
}

/* ---------- playing a scene ---------- */
async function exec(step) {
  switch (step.t) {
    case 'bot': return void (await botSay(val(step.text), step.flag));
    case 'choice': return choice(step);
    case 'tool': return void (await tool(step));
    case 'divider': add(h('div', { class: 'divider', role: 'separator' }, h('span', null, step.text))); return void (await sleep(900));
    case 'goto': return step.scene;
    case 'modal': if (step.kind === 'final' && S.left && S.left.length) return;   /* other servicing moments are still unplayed */
      return modal(step.kind);
    default: return void (await card(step));
  }
}
async function play(name) {
  const my = run, list = scenes[name] || [];
  for (let i = 0; i < list.length; i++) {
    at = { name, i };
    await drain();
    const to = await exec(list[i]);
    alive(my);
    if (to) return play(to);
  }
}

/* ---------- how it starts ---------- */
function dropHero() { if (heroEl) { heroEl.remove(); heroEl = null; col.classList.remove('empty'); } }
async function opener() {
  const def = OPENERS.find((o) => o.primary && o.path === cfg.path);
  let done;
  const wait = new Promise((r) => { done = r; });
  heroEl = h('div', { class: 'hero' }, h('h1', null, HERO),
    h('div', { class: 'starters' }, OPENERS.map((o) => h('button', { type: 'button', class: 'st', onclick: () => { autoTok++; setInput(''); done(o.text); } }, o.text))));
  col.append(heroEl); col.classList.add('empty');
  const text = await awaitUser({ kind: 'opener', done, note: NOTES.opener, auto: async (A) => { await A.pause(1700); await typeComposer(A, def.text, () => { setInput(''); done(def.text); }); } }, wait);
  dropHero();
  userRow(text);
  const r = routeOpener(text);
  if (r.path !== cfg.path) { cfg.path = r.path; scenes = getScenes(cfg.path); paintHistory(); paintDev(); syncUrl(); }
  S.lead = r.lead; S.why = r.why || '';
  await sleep(350);
}
async function servicing() {
  const left = SERVICING(cfg.path).slice();
  S.held = true; S.left = left;
  await sleep(500);
  while (left.length) {
    let t = left[0];
    if (!cfg.auto) {
      let done;
      const wait = new Promise((r) => { done = r; });
      const box = add(h('div', { class: 'picker' }, h('span', { class: 'pk-k' }, 'Prototype'), h('b', null, MODALS.picker), left.map((x) => h('button', { type: 'button', onclick: () => done(x) }, x.label, h('span', { class: 'ico', html: icon('chevR', 15, 2.2) })))));
      t = await awaitUser({ kind: 'picker', el: box, note: NOTES.picker(cfg.path), auto: async (A) => { await A.pause(600); await A.tap($('button', box)); } }, wait);
      box.remove();
    }
    left.splice(left.indexOf(t), 1);
    await play(t.scene);
    await drain();
    await sleep(1400);
  }
  await modal('final');
}
async function main() {
  if (cfg.stage === 'servicing') return servicing();
  if (cfg.entry === 'agent') { await sleep(900); S.started = true; return play('agentOpen'); }
  await opener();
  S.started = true;
  return play('pitch');
}
function clearRun() { run++; autoTok++; cueOff(); pending = null; asideQ = []; wakers = []; parked = []; busy = false; early = null; holdWake = null; }
function start(keep) {
  const chosen = keep && S ? S.mainSel : null;   /* servicing follows the lender or carrier picked while shopping */
  clearRun();
  hideModal();
  heroEl = null; col.textContent = ''; col.classList.remove('empty'); suggest.textContent = ''; setInput('');
  scroller.scrollTop = 0; stick = true; focusEl = null;
  scenes = getScenes(cfg.path); freshState(); S.mainSel = chosen; paintHistory(); paintDev(); syncUrl();
  go(main());
}

/* ---------- free-typed messages: the live agent ---------- */
const asideSignal = () => (asideQ.length ? Promise.resolve() : new Promise((r) => { wakers.push(r); }));
function pushAside(text) {
  dropHero(); userRow(text);
  asideQ.push(text);
  const w = wakers; wakers = []; w.forEach((r) => r());
}
const takeAsides = () => asideQ.splice(0).join('\n');   /* messages sent back to back are answered together */
async function drain() { while (asideQ.length) await aside(takeAsides(), null); }
const contextFor = (p) => (p && p.note ? p.note : noteFor(scenes, at, cfg.path, !!p, S, val));

/* TEST AID ONLY (?mock=1): canned replies in place of the live agent, so every action can be tried without the network. */
function mockAsk(req, back) {
  const said = String(req.messages[req.messages.length - 1].content).toLowerCase();
  const r = /think about it/.test(said) ? ['Of course. Nothing is submitted, and everything stays just as it is.', 'pause']
    : /insurance instead/.test(said) ? ['Sure. Let’s look at your insurance instead.', 'insurance']
    : /loan instead/.test(said) ? ['Sure. Let’s look at borrowing instead.', 'loan']
    : /what do i have/.test(said) ? ['Here is everything you hold, in one place.', 'home']
    : /start over/.test(said) ? ['No problem. Let’s start again from the top.', 'restart']
    : ['That depends on your own numbers, and nothing here commits you to anything. ' + back, 'continue'];
  return new Promise((res) => setTimeout(() => res({ text: r[0], action: r[1], live: true }), 400));
}

/* One typed message: thinking, the LendingTree status when the question is about offers, quotes, the account or next
   steps, then the answer. p is the step that was waiting (null when the assistant was mid-turn). */
async function aside(text, p) {
  const my = run;
  busy = true; resize();
  try {
    const note = contextFor(p);
    const req = {
      surface: 'assistant', path: cfg.path, stage: note.stage, step: note.step.slice(0, 300),
      selected: S.mainSel || (!S.list && S.sel) || (S.held ? DEFAULT_SEL[cfg.path] : undefined), held: !!S.held,
      messages: S.log.slice(-12),
    };
    const reply = cfg.mock ? mockAsk(req, note.back) : ask(req);
    const topic = AGENT.topics.find((t) => t.re.test(text));
    let said = botOpen(), res;
    if (topic) {
      await sleep(750);
      said.m.remove();
      const c = toolChip(); add(c.el); c.set(topic.line);
      [res] = await Promise.all([reply, sleep(1500)]); alive(my);
      const off = !res.live && res.action === 'continue';
      c.end(off ? AGENT.offline : topic.done, off);
      await sleep(550);
      said = botOpen();
      await sleep(700);
    } else { [res] = await Promise.all([reply, sleep(900)]); alive(my); }
    await botFill(said.t, res.text);
    await sleep(450);
    await act(res.action, p, said.m);
  } finally { if (my === run) { busy = false; resize(); } }
}
async function act(action, p, said) {
  const waitingCard = p && p.el;
  if (action === 'restart') { await sleep(700); cfg.stage = 'shop'; start(); throw CANCEL; }
  if ((action === 'loan' || action === 'insurance') && !(action === cfg.path && cfg.stage === 'shop' && S.started && !S.held)) { await sleep(300); switchPath(action); throw CANCEL; }
  if (action === 'pause' && !S.paused && !(p && (p.kind === 'opener' || p.kind === 'picker'))) { await hold(p); said = null; }
  if (action === 'home') {
    add(h('div', { class: 'blk' }, CARDS.holdings(holdings(cfg.path, S), cardCtx()).el));
    await sleep(900);
    if (p && p.kind !== 'opener') { await botSay(AGENT.homeBack, null, 300); said = $$('.msg.bot', col).pop(); }
  }
  if (waitingCard && !p.answered) represent(p.el, said);
}
/* A calm stop. Nothing is unwound: the step they were on stays live, so using it (or saying so) picks it back up. */
async function hold(p) {
  const my = run;
  const decline = p && p.kind === 'choice' && p.opts.find((o) => o.neg && o.go);
  const saved = AGENT.hold.tool(scenes, at.name, decline && decline.go, S);
  const was = contextFor(p);
  S.paused = true;
  try {
    if (saved) await tool(saved);
    let done;
    const wait = new Promise((r) => { done = r; });
    const used = new Promise((r) => { holdWake = r; });
    const opts = AGENT.hold.options;
    markTurnEnd();
    busy = false; resize();
    const r = await awaitUser({ kind: 'choice', opts, done, note: NOTES.hold(was), auto: autoChoice(opts) }, wait, p && p.wait ? Promise.race([p.wait, used]) : used);
    if (r === ALSO) return;
    userRow(r.text);
    if (r.o.fresh) { await sleep(400); cfg.stage = 'shop'; start(); throw CANCEL; }
    await sleep(350);
    await botSay(AGENT.hold.back, null, 300);
  } finally { if (my === run) { S.paused = false; holdWake = null; } }
}
/* The other kind of shopping, from the start, in the same chat. Whatever was open above is closed. */
function switchPath(path) {
  const log = S.log;
  clearRun(); dropHero(); resize();
  $$('.picker', col).forEach((x) => x.remove());
  $$('.ltc:not(.locked)', col).forEach((el) => { el.classList.add('locked'); $$('button, input', el).forEach((b) => { b.disabled = true; }); });
  cfg.path = path; cfg.stage = 'shop';
  scenes = getScenes(path); freshState(); S.log = log; S.started = true;
  S.lead = AGENT.switchLead[path].lead; S.why = AGENT.switchLead[path].why || '';
  paintHistory(); paintDev(); paintSuggest(); syncUrl();
  go(play('pitch'));
}

/* ---------- the interstitial: outside the product UI, same family as the Prototype control ---------- */
const pm = $('#pm'), pmActs = $('#pmActs'), appEl = $('#app');
function hideModal() { pm.hidden = true; appEl.inert = false; pmDismiss = null; }
let pmDismiss = null;   /* what a click on the backdrop or Escape does, when the modal allows it */
async function modal(kind) {
  const my = run;
  markTurnEnd();
  const M = MODALS[kind];
  const next = (act) => {
    if (kind === 'interstitial' && act === 'b') { cfg.stage = 'servicing'; return start(true); }
    if (act === 'c') {   /* play with it yourself: auto-play off, a fresh chat on the opening screen */
      cfg.auto = false; cfg.entry = 'user'; cfg.stage = 'shop';
      start(); input.focus({ preventScroll: true });
      return;
    }
    if (act === 'b') { cfg.path = cfg.path === 'loan' ? 'insurance' : 'loan'; cfg.stage = 'shop'; }
    else cfg.stage = cfg.embed && cfg.stageGiven ? cfg.stage : 'shop';
    start();
  };
  if (cfg.embed) {   /* inside a slide: no modal, just keep looping */
    await sleep(kind === 'final' ? 4200 : 3000); alive(my);
    next(kind === 'interstitial' && !cfg.stageGiven ? 'b' : 'a');
    throw CANCEL;
  }
  await sleep(1300);
  await drain();
  let done;
  const wait = new Promise((r) => { done = r; });
  $('#pmTitle').textContent = M.title; $('#pmText').textContent = M.text;
  const a = h('button', { type: 'button', class: 'pm-b ghost', onclick: () => done('a') }, M.a);
  const b = h('button', { type: 'button', class: 'pm-b' + (M.c ? ' ghost' : ''), onclick: () => done('b') }, h('span', null, val2(M.b)), !M.c && h('i', { class: 'pm-cd', 'aria-hidden': 'true' }));
  const c = M.c && h('button', { type: 'button', class: 'pm-b', onclick: () => done('c') }, M.c);
  pmActs.replaceChildren(...[c, a, b].filter(Boolean));
  pmActs.classList.toggle('three', !!c);
  pmDismiss = c ? () => done('c') : null;
  $$('.pm-count', pm).forEach((n) => { n.hidden = true; n.className = ''; });
  pm.hidden = false; appEl.inert = true; (c || b).focus({ preventScroll: true });
  const SECS = 9;
  const act = await awaitUser({ kind: 'modal', noAside: true, auto: kind === 'interstitial' ? async (A) => {
    b.style.setProperty('--cd', SECS / cfg.speed + 's'); b.classList.remove('count'); void b.offsetWidth; b.classList.add('count');
    const cd = h('p', { class: 'pm-count', role: 'timer', 'aria-live': 'off' });
    pmActs.after(cd);
    try { for (let n = SECS; n > 0; n--) { cd.replaceChildren('Jumping ahead to servicing in ', h('b', null, String(n))); await A.pause(1000); } }
    catch (e) { b.classList.remove('count'); cd.hidden = true; throw e; }
    cd.hidden = true; await A.tap(b);
  } : null }, wait);
  hideModal();
  next(act);
  throw CANCEL;
}
const val2 = (x) => (typeof x === 'function' ? x(cfg.path) : x);
pm.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const bs = $$('button', pmActs), i = bs.indexOf(document.activeElement);
  e.preventDefault(); bs[(i + (e.shiftKey ? bs.length - 1 : 1)) % bs.length].focus();
});
pm.addEventListener('click', (e) => { if (e.target === pm && pmDismiss) pmDismiss(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pm.hidden && pmDismiss && devMenu.hidden) pmDismiss(); });

/* ---------- the composer ---------- */
function resize() { input.style.height = 'auto'; input.style.height = Math.min(160, input.scrollHeight) + 'px'; sendBtn.disabled = busy || !input.value.trim(); }
function send() {
  const text = input.value.trim().slice(0, 400);
  if (!text || busy || cfg.embed || !pm.hidden) return;   /* while an answer is on its way the message waits in the box */
  if (cfg.auto) { setAuto(false); tip(true); }
  setInput('');
  if (pending && pending.kind === 'opener' && matchOpener(text)) { autoTok++; return pending.done(text); }
  if (pending && pending.kind === 'choice') { const o = matchChoice(text, pending.opts); if (o) return submitChoice(o, text); }
  pushAside(text);
}
/* typing takes the wheel. If auto-play was mid-word in the box, its text goes and the person's keystroke stays. */
input.addEventListener('input', (e) => { if (e.isTrusted && cfg.auto && !cfg.embed) { setAuto(false, e.data || ''); tip(true); } resize(); });
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
$('#composer').addEventListener('submit', (e) => { e.preventDefault(); send(); });
if (cfg.embed) input.readOnly = true;   /* embeds are watch-only */

/* drawer on phones */
const side = $('#side'), scrim = $('#scrim');
const drawer = (on) => { side.classList.toggle('open', on); scrim.classList.toggle('on', on); };
$('#menuBtn').addEventListener('click', () => drawer(true));
$('#sideClose').addEventListener('click', () => drawer(false));
scrim.addEventListener('click', () => drawer(false));
const restart = () => { drawer(false); cfg.stage = 'shop'; start(); };
$('#cmpBtn').addEventListener('click', restart);
$('#newChat').addEventListener('click', restart);

/* ---------- the Prototype control ---------- */
const devBtn = $('#devBtn'), devMenu = $('#devMenu'), devToggle = $('#devToggle');
const IC_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
const IC_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
function paintDev() {
  $('#devIc').innerHTML = cfg.auto ? IC_PAUSE : IC_PLAY;
  devToggle.setAttribute('aria-pressed', String(cfg.auto));
  devToggle.setAttribute('aria-label', cfg.auto ? 'Auto-play is on. Pause' : 'Auto-play is paused. Play');
  devToggle.classList.toggle('paused', !cfg.auto);
  const sw = $('#doAuto'); sw.setAttribute('aria-checked', String(cfg.auto)); sw.classList.toggle('on', cfg.auto); $('.sw-state', sw).textContent = cfg.auto ? 'On' : 'Off';
  $$('.seg', devMenu).forEach((g) => $$('button', g).forEach((b) => b.setAttribute('aria-pressed', String(cfg[g.dataset.k] === b.dataset.v))));
}
function setAuto(v, keep) {
  attentionReset(); cfg.auto = v; autoTok++; cueOff();
  if (v) tip(false);
  if (!v && input.classList.contains('auto')) { input.classList.remove('auto'); setInput(keep || ''); }
  paintDev(); paintSuggest(); syncUrl();
  if (v) startAuto();
}
/* The callout that says auto-play has stopped. It belongs to the prototype's controls, and it appears each time the
   viewer taking over inside the product pauses auto-play (never when they pause from the control itself, never in an
   embed). It goes when auto-play resumes, when it is dismissed, when the menu opens, or after a while. */
const devTip = $('#devTip');
function tip(show) {
  clearTimeout(tip.t);
  show = !!show && !cfg.embed;
  devTip.hidden = !show;
  if (show) tip.t = setTimeout(() => tip(false), 14000);
}
$('#devResume').addEventListener('click', () => setAuto(true));
$('#devTipX').addEventListener('click', () => tip(false));
const setMenu = (open) => { if (open) tip(false); devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); };
devBtn.addEventListener('click', () => setMenu(devMenu.hidden));
document.addEventListener('pointerdown', (e) => { if (!devMenu.hidden && !$('#dev').contains(e.target)) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !devMenu.hidden) { setMenu(false); devBtn.focus(); } });
devToggle.addEventListener('click', () => setAuto(!cfg.auto));
$('#doAuto').addEventListener('click', () => setAuto(!cfg.auto));
$$('.seg button', devMenu).forEach((b) => b.addEventListener('click', () => { cfg[b.parentNode.dataset.k] = b.dataset.v; start(); setTimeout(() => setMenu(false), 450); }));
$('#doReset').addEventListener('click', () => { cfg.stage = 'shop'; start(); setMenu(false); });

start();
if (!cfg.embed && matchMedia('(min-width: 900px)').matches && !cfg.auto) input.focus({ preventScroll: true });

/* Auto-play stands still while the viewer is away (another tab, another window) and says so; it picks up when they are back. */
watchAttention({ active: () => cfg.auto, embed: cfg.embed });
