/* Visiontype A: LendingTree inside a consumer AI assistant (drawn as ChatGPT).
   This file is the engine. It plays the script in script.js, renders the cards in cards.js, and runs auto-play:
   the prototype types, taps and fills the way a person would, and the Prototype control (outside the product UI)
   pauses it, switches path and entry, restarts, or jumps to servicing.

   URL: ?path=loan|insurance  ?entry=user|agent  ?stage=shop|servicing  ?auto=0|1  ?embed=1  ?speed=<number> */
import { h, $, $$, icon, reduced, parseRich, GPT_MARK, LEAF } from './kit.js';
import * as CARDS from './cards.js';
import { getScenes, findOffer, routeOpener, matchChoice, OPENERS, TITLES, HERO, PROTO_NOTE, BUSY_REPLY, DEFAULT_SEL, SERVICING, MODALS } from './script.js';
import { PERSON, BRAND } from '../shared/data.js';

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
};
function syncUrl() {
  if (cfg.embed) return;
  const p = new URLSearchParams();
  if (cfg.path !== 'loan') p.set('path', cfg.path);
  if (cfg.entry !== 'user') p.set('entry', cfg.entry);
  if (cfg.stage !== 'shop') p.set('stage', cfg.stage);
  if (!cfg.auto) p.set('auto', '0');
  if (cfg.speed !== 1) p.set('speed', String(cfg.speed));
  const s = p.toString();
  try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch { /* ignore */ }
}

/* ---------- state for one run ---------- */
let scenes = getScenes(cfg.path);
let S = null;
function freshState() {
  S = {
    v: {}, sel: null, list: null, mainSel: null, lead: '', why: '',
    get offer() { return findOffer(cfg.path, this.list, this.sel || DEFAULT_SEL[cfg.path]); },
    get main() { return findOffer(cfg.path, null, this.mainSel || DEFAULT_SEL[cfg.path]); },
  };
}
const val = (x) => (typeof x === 'function' ? x(S) : x);

/* ---------- time: cancellable, pauses while the tab is hidden ---------- */
const CANCEL = Symbol('cancel'), STOP = Symbol('stop');
let run = 0, autoTok = 0, pending = null;
function sleep(ms, my = run) {
  return new Promise((res, rej) => {
    const end = () => { if (my !== run) return rej(CANCEL); if (document.hidden) return setTimeout(end, 300); res(); };
    setTimeout(end, Math.max(0, ms / cfg.speed));
  });
}
const alive = (my) => { if (my !== run) throw CANCEL; };

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
let stick = true, focusEl = null;
const smooth = () => (reduced() || cfg.speed > 3 ? 'auto' : 'smooth');
function follow() {
  if (!stick) return;
  const max = scroller.scrollHeight - scroller.clientHeight;
  let to = max;
  if (focusEl && focusEl.isConnected && focusEl.offsetHeight > scroller.clientHeight - 24) to = Math.min(max, focusEl.offsetTop + col.offsetTop - 12);
  if (Math.abs(scroller.scrollTop - to) > 1) scroller.scrollTo({ top: to, behavior: smooth() });
}
new ResizeObserver(follow).observe(col);
new ResizeObserver(follow).observe(scroller);
const userScrolled = () => setTimeout(() => { stick = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop < 80; }, 120);
['wheel', 'touchmove', 'keydown'].forEach((ev) => scroller.addEventListener(ev, userScrolled, { passive: true }));
function reveal(el) {
  const r = el.getBoundingClientRect(), s = scroller.getBoundingClientRect();
  if (r.bottom > s.bottom - 14) scroller.scrollBy({ top: r.bottom - s.bottom + 22, behavior: smooth() });
  else if (r.top < s.top + 8) scroller.scrollBy({ top: r.top - s.top - 22, behavior: smooth() });
}
function add(el, focus) { col.append(el); focusEl = focus === false ? null : el; stick = true; follow(); return el; }

/* ---------- messages ---------- */
function userRow(text) { add(h('div', { class: 'msg user' }, h('div', { class: 'ub' }, text))); }
const actions = () => h('div', { class: 'acts', 'aria-hidden': 'true' }, ['copy', 'thumb', 'speaker', 'refresh'].map((n) => h('span', { class: 'ib', html: icon(n, 16) })));
function markTurnEnd() {
  $$('.acts', col).forEach((a) => a.remove());
  const last = $$('.msg.bot', col).pop();
  if (last && last === col.lastElementChild) last.append(actions());
}
async function botSay(text, flag) {
  const my = run;
  const m = h('div', { class: 'msg bot' });
  if (flag) m.append(h('div', { class: 'flag' }, flag.icon ? h('span', { class: 'ico', html: icon(flag.icon, 13, 2) }) : h('img', { src: LEAF, alt: '', width: 13, height: 13 }), flag.text));
  const t = h('div', { class: 'bt' }, h('span', { class: 'think', role: 'img', 'aria-label': 'Thinking' }));
  m.append(t); add(m);
  await sleep(650 + Math.min(700, text.length * 3));
  t.textContent = '';
  const paras = parseRich(text);
  if (reduced() || cfg.speed > 12) {
    paras.forEach((p) => t.append(h('p', null, p.words.map((w) => (w.b ? h('b', null, w.t) : w.t)))));
  } else {
    col.setAttribute('aria-busy', 'true');
    for (const p of paras) {
      const pe = h('p'); t.append(pe);
      let bold = null, n = 0;
      for (const w of p.words) {
        if (w.b) { if (!bold) { bold = h('b'); pe.append(bold); } bold.append(w.t); } else { bold = null; pe.append(w.t); }
        if (/\S/.test(w.t) && ++n % 2 === 0) { await sleep(34 + Math.random() * 36); alive(my); }
      }
    }
    col.removeAttribute('aria-busy');
  }
  await sleep(Math.min(2400, 500 + text.length * 13));
}

/* ---------- the "Working with LendingTree" status ---------- */
async function tool(step) {
  const title = h('b', { class: 'shim' }, step.label ? 'Working with ' + step.label : 'Working with ' + BRAND.name);
  const line = h('span', { class: 'tl-line' });
  const el = h('div', { class: 'tool', role: 'status' },
    h('span', { class: 'tl-ic' }, h('img', { src: LEAF, alt: '', width: 16, height: 16 }), h('i', { class: 'ring' }), h('i', { class: 'tl-ok', html: icon('check', 9, 3.4) })),
    h('span', { class: 'tl-m' }, title, line), h('span', { class: 'tl-mcp' }, 'MCP'));
  add(el);
  for (const l of step.lines) {
    line.classList.remove('in'); void line.offsetWidth;
    line.textContent = val(l); line.classList.add('in');
    await sleep(1250);
  }
  el.classList.add('done');
  title.classList.remove('shim'); title.textContent = BRAND.agent.replace(/^./, (c) => c.toUpperCase());
  line.classList.remove('in'); void line.offsetWidth; line.textContent = val(step.done); line.classList.add('in');
  await sleep(750);
}

/* ---------- waiting for the person (or auto-play standing in for them) ---------- */
function makeA(tok) {
  const pause = async (ms) => { await sleep(ms); if (!cfg.auto || tok !== autoTok) throw STOP; };
  return {
    pause,
    async tap(el, hold) { if (!el || el.disabled) return; reveal(el); el.classList.add('tap'); await pause(hold || 300); el.classList.remove('tap'); focusEl = null; el.click(); },
    async type(inp, text) {
      reveal(inp); inp.classList.add('typing'); inp.value = ''; inp.dispatchEvent(new Event('input', { bubbles: true }));
      try { for (const ch of text) { inp.value += ch; inp.dispatchEvent(new Event('input', { bubbles: true })); await pause(34 + Math.random() * 30); } } finally { inp.classList.remove('typing'); }
    },
    async slide(inp, to) {
      reveal(inp); inp.classList.add('tap');
      const from = Number(inp.value), step = Number(inp.step) || 1, frames = reduced() ? 1 : 26;
      try {
        for (let i = 1; i <= frames; i++) { const e = 1 - Math.pow(1 - i / frames, 3); inp.value = String(Math.round((from + (to - from) * e) / step) * step); inp.dispatchEvent(new Event('input', { bubbles: true })); await pause(34); }
      } finally { inp.classList.remove('tap'); }
    },
  };
}
function startAuto() {
  if (!pending || !pending.auto || !cfg.auto) return;
  pending.auto(makeA(++autoTok)).catch((e) => { if (e !== STOP && e !== CANCEL) throw e; });
}
async function awaitUser(p, wait) {
  const my = run;
  pending = p; paintSuggest(); startAuto();
  const out = await wait;
  alive(my);
  pending = null; paintSuggest();
  return out;
}
function paintSuggest() {
  suggest.textContent = '';
  if (!pending || pending.kind !== 'choice' || cfg.auto) return;
  pending.opts.filter((o) => o.chip !== false).forEach((o) => suggest.append(h('button', { type: 'button', class: 'sg', onclick: () => submitChoice(o, o.say || o.label) }, o.label)));
}
function setInput(v) { input.value = v; resize(); }
function submitChoice(o, text) {
  if (!pending || pending.kind !== 'choice') return;
  autoTok++; setInput('');
  pending.done({ o, text });
}
const typeComposer = async (A, text) => { input.classList.add('auto'); try { await A.type(input, text); await A.pause(380); sendBtn.classList.add('tap'); await A.pause(200); } finally { sendBtn.classList.remove('tap'); input.classList.remove('auto'); } };

async function choice(step) {
  markTurnEnd();
  let done;
  const wait = new Promise((r) => { done = r; });
  const opts = step.options;
  const { o, text } = await awaitUser({ kind: 'choice', opts, done, auto: async (A) => { await A.pause(1100); const a = opts.find((x) => x.auto) || opts[0]; await typeComposer(A, a.say || a.label); submitChoice(a, a.say || a.label); } }, wait);
  userRow(text);
  if (o.set) { if (o.set.sel) { S.sel = o.set.sel; S.list = o.set.list || null; if (!o.set.list) S.mainSel = o.set.sel; } }
  if (o.pick) markOffer(o.pick);
  await sleep(500);
  return o.go;
}
function pick(id) {
  if (!pending || pending.kind !== 'choice') return;
  const o = pending.opts.find((x) => x.pick === id);
  if (o) submitChoice(o, o.say || o.label);
}
function markOffer(id) {
  const card = $$('.ltc.offers', col).pop();
  if (!card) return;
  $$('.of-r', card).forEach((r) => { const on = r.dataset.id === id; r.classList.toggle('sel', on); const b = $('.of-b', r); b.disabled = true; if (on) b.textContent = 'Chosen'; });
  card.classList.add('locked');
}

/* ---------- embedded cards ---------- */
const ctx = { val, get S() { return S; }, pick, pause: (ms) => sleep(ms) };
const LINGER = { offers: 2600, compare: 3200, celebrate: 3000, app: 2600, receipt: 2400 };
async function card(step) {
  const r = CARDS[step.t](step, ctx);
  add(h('div', { class: 'blk' }, r.el));
  if (r.wait) { Object.assign(S.v, await awaitUser({ kind: 'card', auto: r.auto }, r.wait)); await sleep(650); }
  else await sleep(LINGER[step.t] || 1500);
}

/* ---------- playing a scene ---------- */
async function exec(step) {
  switch (step.t) {
    case 'bot': return void (await botSay(val(step.text), step.flag));
    case 'choice': return choice(step);
    case 'tool': return void (await tool(step));
    case 'divider': add(h('div', { class: 'divider', role: 'separator' }, h('span', null, step.text))); return void (await sleep(900));
    case 'goto': return step.scene;
    case 'modal': return modal(step.kind);
    default: return void (await card(step));
  }
}
async function play(name) {
  const my = run;
  for (const step of scenes[name] || []) {
    const go = await exec(step);
    alive(my);
    if (go) return play(go);
  }
}

/* ---------- how it starts ---------- */
async function opener() {
  const def = OPENERS.find((o) => o.primary && o.path === cfg.path);
  let done;
  const wait = new Promise((r) => { done = r; });
  const hero = h('div', { class: 'hero' }, h('h1', null, HERO),
    h('div', { class: 'starters' }, OPENERS.map((o) => h('button', { type: 'button', class: 'st', onclick: () => { autoTok++; setInput(''); done(o.text); } }, o.text))));
  col.append(hero); col.classList.add('empty');
  const text = await awaitUser({ kind: 'opener', done, auto: async (A) => { await A.pause(1700); await typeComposer(A, def.text); setInput(''); done(def.text); } }, wait);
  hero.remove(); col.classList.remove('empty');
  userRow(text);
  const r = routeOpener(text);
  if (r.path !== cfg.path) { cfg.path = r.path; scenes = getScenes(cfg.path); paintHistory(); paintDev(); syncUrl(); }
  S.lead = r.lead; S.why = r.why || '';
  await sleep(350);
}
async function servicing() {
  const left = SERVICING(cfg.path).slice();
  await sleep(500);
  while (left.length) {
    let t = left[0];
    if (!cfg.auto) {
      let done;
      const wait = new Promise((r) => { done = r; });
      const box = add(h('div', { class: 'picker' }, h('span', { class: 'pk-k' }, 'Prototype'), h('b', null, MODALS.picker), left.map((x) => h('button', { type: 'button', onclick: () => done(x) }, x.label, h('span', { class: 'ico', html: icon('chevR', 15, 2.2) })))));
      t = await awaitUser({ kind: 'picker', auto: async (A) => { await A.pause(600); done(left[0]); } }, wait);
      box.remove();
    }
    left.splice(left.indexOf(t), 1);
    await play(t.scene);
    await sleep(1400);
  }
  await modal('final');
}
async function main() {
  if (cfg.stage === 'servicing') return servicing();
  if (cfg.entry === 'agent') { await sleep(900); return play('agentOpen'); }
  await opener();
  return play('pitch');
}
function start(keep) {
  const chosen = keep && S ? S.mainSel : null;   /* servicing follows the lender or carrier picked while shopping */
  run++; autoTok++; pending = null;
  hideModal();
  col.textContent = ''; col.classList.remove('empty'); suggest.textContent = ''; setInput('');
  scroller.scrollTop = 0; stick = true; focusEl = null;
  scenes = getScenes(cfg.path); freshState(); S.mainSel = chosen; paintHistory(); paintDev(); syncUrl();
  main().catch((e) => { if (e !== CANCEL && e !== STOP) throw e; });
}

/* ---------- the interstitial: outside the product UI, same family as the Prototype control ---------- */
const pm = $('#pm'), pmActs = $('#pmActs'), appEl = $('#app');
function hideModal() { pm.hidden = true; appEl.inert = false; }
async function modal(kind) {
  const my = run;
  markTurnEnd();
  const M = MODALS[kind];
  const next = (act) => {
    if (kind === 'interstitial' && act === 'b') { cfg.stage = 'servicing'; return start(true); }
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
  let done;
  const wait = new Promise((r) => { done = r; });
  $('#pmTitle').textContent = M.title; $('#pmText').textContent = M.text;
  const a = h('button', { type: 'button', class: 'pm-b ghost', onclick: () => done('a') }, M.a);
  const b = h('button', { type: 'button', class: 'pm-b', onclick: () => done('b') }, h('span', null, val2(M.b)), h('i', { class: 'pm-cd', 'aria-hidden': 'true' }));
  pmActs.replaceChildren(a, b);
  $$('.pm-count', pm).forEach((n) => { n.hidden = true; n.className = ''; });
  pm.hidden = false; appEl.inert = true; b.focus({ preventScroll: true });
  const SECS = 9;
  const act = await awaitUser({ kind: 'modal', auto: kind === 'interstitial' ? async (A) => {
    b.style.setProperty('--cd', SECS / cfg.speed + 's'); b.classList.remove('count'); void b.offsetWidth; b.classList.add('count');
    const cd = h('p', { class: 'pm-count', role: 'timer', 'aria-live': 'off' });
    pmActs.after(cd);
    try { for (let n = SECS; n > 0; n--) { cd.replaceChildren('Jumping ahead to servicing in ', h('b', null, String(n))); await A.pause(1000); } }
    catch (e) { b.classList.remove('count'); cd.hidden = true; throw e; }
    cd.hidden = true; done('b');
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

/* ---------- the composer ---------- */
function resize() { input.style.height = 'auto'; input.style.height = Math.min(160, input.scrollHeight) + 'px'; sendBtn.disabled = !input.value.trim(); }
let asideBusy = false;
function send() {
  const text = input.value.trim().slice(0, 400);
  if (!text || !pending) return;
  if (pending.kind === 'opener') { autoTok++; setInput(''); pending.done(text); }
  else if (pending.kind === 'choice') submitChoice(matchChoice(text, pending.opts), text);
  else if (pending.kind === 'card' && !asideBusy) {
    asideBusy = true; setInput(''); userRow(text);
    botSay(BUSY_REPLY).catch(() => {}).finally(() => { asideBusy = false; });
  }
}
input.addEventListener('input', (e) => { resize(); if (e.isTrusted && cfg.auto) setAuto(false); });   /* typing takes the wheel */
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
$('#composer').addEventListener('submit', (e) => { e.preventDefault(); send(); });

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
function setAuto(v) {
  cfg.auto = v; autoTok++;
  if (!v) setInput('');
  paintDev(); paintSuggest(); syncUrl();
  if (v) startAuto();
}
const setMenu = (open) => { devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); };
devBtn.addEventListener('click', () => setMenu(devMenu.hidden));
document.addEventListener('pointerdown', (e) => { if (!devMenu.hidden && !$('#dev').contains(e.target)) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !devMenu.hidden) { setMenu(false); devBtn.focus(); } });
devToggle.addEventListener('click', () => setAuto(!cfg.auto));
$('#doAuto').addEventListener('click', () => setAuto(!cfg.auto));
$$('.seg button', devMenu).forEach((b) => b.addEventListener('click', () => { cfg[b.parentNode.dataset.k] = b.dataset.v; start(); setTimeout(() => setMenu(false), 450); }));
$('#doReset').addEventListener('click', () => { cfg.stage = 'shop'; start(); setMenu(false); });

start();
if (!cfg.embed && matchMedia('(min-width: 900px)').matches && !cfg.auto) input.focus({ preventScroll: true });
