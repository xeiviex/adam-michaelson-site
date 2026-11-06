/* Achieve prototype, context 3: the same chasing agent, inside a ChatGPT-style chat.
   Behaves like Messages (picks up at the next incomplete step, links back for anything sensitive),
   but replies stream in like ChatGPT and links appear as cards. */
import { h, $, sleep, reduced, icon } from '../shared/dom.js';
import { store } from '../shared/store.js';
import { createAgent } from '../shared/agent.js';
import { ask } from '../shared/bot.js';

const S = store();
const agent = createAgent({ store: S, channel: 'chatgpt', ask, origin: location.origin });
const col = $('#col'), scroller = $('#scroller'), input = $('#gptInput'), sendBtn = $('#sendBtn');
const put = (id, n, s, w) => { const e = document.getElementById(id); if (e) e.innerHTML = icon(n, s, w); };
put('nwIc', 'compose', 18); put('srIc', 'search', 18); put('libIc', 'list', 18); put('mdIc', 'chevD', 14, 2.2); put('shIc', 'share', 16);
put('menuBtn', 'menu', 22); put('cmpBtn', 'compose', 20); put('plusBtn', 'plus', 22, 2); put('micBtn', 'mic', 20); put('sendBtn', 'up', 18, 2.4); put('sideClose', 'sidebar', 20);
$('#logoIc').innerHTML = '<svg viewBox="0 0 32 32" width="30" height="30" fill="none" stroke="#0d0d0d" stroke-width="1.9" stroke-linejoin="round"><g transform="translate(16 16)"><rect x="-9" y="-5" width="18" height="10" rx="5"/><rect x="-9" y="-5" width="18" height="10" rx="5" transform="rotate(60)"/><rect x="-9" y="-5" width="18" height="10" rx="5" transform="rotate(120)"/></g></svg>';

const log = () => S.thread('chatgpt');
const bottom = () => { scroller.scrollTop = scroller.scrollHeight; };
let lastBot = null;

function actions() {
  return h('div', { class: 'acts' }, ['copy', 'thumb', 'speaker', 'refresh'].map((n) => h('button', { type: 'button', class: 'ib', 'aria-label': n, html: icon(n, 16) })));
}
function linkCard(l) {
  return h('a', { class: 'card', href: l.url }, h('span', { class: 'cl' }, h('img', { src: '/achieve/img/logo-mark.png', alt: '' })), h('div', null, h('b', null, l.title), h('span', null, l.host)), h('span', { class: 'go', html: icon('chevR', 18) }));
}
function userRow(text) {
  const m = h('div', { class: 'msg user' }, h('div', { class: 'ub' }, text));
  col.append(m); bottom();
}
function botShell(first) {
  const m = h('div', { class: 'msg bot' });
  if (first) m.append(h('div', { class: 'used' }, h('img', { src: '/achieve/img/logo-mark.png', alt: '' }), 'Achieve'));
  const t = h('div', { class: 'bt' });
  m.append(t); col.append(m);
  return { m, t };
}
async function streamInto(t, text, instant) {
  if (instant || reduced()) { t.textContent = text; return; }
  const words = text.split(/(\s+)/);
  t.textContent = '';
  for (let i = 0; i < words.length; i++) { t.textContent += words[i]; if (i % 2 === 0) { bottom(); await sleep(28 + Math.random() * 40); } }
}
async function botRow(m, instant) {
  const first = !lastBot;
  const { m: el, t } = botShell(first && !instant ? true : first);
  if (!instant) { t.innerHTML = '<span class="think" aria-label="Thinking"></span>'; bottom(); await sleep(reduced() ? 0 : 700 + Math.min(900, m.text.length * 6)); }
  await streamInto(t, m.text, instant);
  if (m.link) el.append(linkCard(m.link));
  if (lastBot) { const old = lastBot.querySelector('.acts'); if (old) old.remove(); }
  el.append(actions());
  lastBot = el; bottom();
}

let busy = false;
async function deliver(msgs) {
  for (const m of msgs) { log().push({ who: 'agent', text: m.text, link: m.link || null, at: Date.now() }); S.save(); await botRow(m); await sleep(reduced() ? 0 : 150); }
}
async function send(text) {
  const t = String(text || '').trim().slice(0, 800);
  if (!t || busy) return;
  busy = true;
  input.value = ''; resize();
  const history = log().map((m) => ({ who: m.who, text: m.text }));
  log().push({ who: 'user', text: t, at: Date.now() }); S.save();
  userRow(t);
  const msgs = await agent.reply(t, history);
  await deliver(msgs);
  busy = false;
  input.focus({ preventScroll: true });
}
function resize() { input.style.height = 'auto'; input.style.height = Math.min(200, input.scrollHeight) + 'px'; sendBtn.disabled = !input.value.trim(); }
input.addEventListener('input', resize);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
$('#composer').addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });

/* drawer on phones */
const side = $('#side'), scrim = $('#scrim');
const toggle = (on) => { side.classList.toggle('open', on); scrim.classList.toggle('on', on); };
$('#menuBtn').addEventListener('click', () => toggle(true));
$('#sideClose').addEventListener('click', () => toggle(false));
scrim.addEventListener('click', () => toggle(false));
$('#cmpBtn').addEventListener('click', () => { location.href = '/achieve/chatgpt/'; });

const devBtn = $('#devBtn'), devMenu = $('#devMenu');
devBtn.addEventListener('click', () => { devMenu.hidden = !devMenu.hidden; devBtn.setAttribute('aria-expanded', String(!devMenu.hidden)); });
document.addEventListener('click', (e) => { if (!$('#dev').contains(e.target)) devMenu.hidden = true; });
$('#doReset').addEventListener('click', () => { S.reset(); location.href = '/achieve/chatgpt/'; });

async function boot() {
  const d = S.get().dropout;
  for (const m of log()) { if (m.who === 'user') userRow(m.text); else { await botRow(m, true); } }
  const fresh = d && d.to === 'chatgpt';
  if (!log().length || fresh) {
    await sleep(reduced() ? 0 : 600);
    await deliver(agent.start());
  }
  if (matchMedia('(min-width: 900px)').matches) input.focus({ preventScroll: true });
}
boot();
