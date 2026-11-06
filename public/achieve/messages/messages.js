/* Achieve prototype, context 2: an Achieve agent follows up by text in Apple Messages.
   It picks up at the next incomplete step from the shared session, asks conversationally (no forms),
   and sends a link to the exact spot in the web funnel for anything sensitive. */
import { h, $, sleep, reduced, icon } from '../shared/dom.js';
import { store } from '../shared/store.js';
import { createAgent } from '../shared/agent.js';
import { ask } from '../shared/bot.js';

const S = store();
const agent = createAgent({ store: S, channel: 'messages', ask, origin: location.origin });
const thread = $('#thread'), input = $('#msgInput'), compose = $('#compose');
const put = (id, n, s, w) => { const e = document.getElementById(id); if (e) e.innerHTML = icon(n, s, w); };
put('srIc', 'search', 13); put('backIc', 'chevL', 22, 2.4); put('chevIc', 'chevR', 10, 2.6); put('micBtn', 'mic', 18); put('plusBtn', 'plus', 18, 2.2); put('sendBtn', 'up', 16, 2.6);

let last = { who: null, at: 0, row: null };
const log = () => S.thread('messages');
const timeStr = (t) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const scroll = () => { thread.scrollTop = thread.scrollHeight; };

function stamp(t) {
  thread.append(h('div', { class: 'stamp' }, h('b', null, 'Today'), ' ' + timeStr(t)));
}
function untail() { if (last.row) last.row.classList.remove('tail'); }

function addRow(who, text, link, at, instant) {
  if (!last.who || at - last.at > 30 * 60 * 1000) { stamp(at); last = { who: null, at, row: null }; }
  const out = who === 'user';
  const same = last.who === who;
  if (same) untail();
  document.querySelectorAll('.rcv').forEach((e) => e.remove());
  const rows = [];
  if (text) {
    const r = h('div', { class: 'row tail' + (out ? ' out' : '') + (same ? '' : ' gap') }, h('div', { class: 'bub text' }, text));
    if (instant) r.firstChild.style.animation = 'none';
    rows.push(r);
  }
  if (link) {
    const a = h('a', { class: 'link', href: link.url },
      h('div', { class: 'lg' }, h('img', { src: '/achieve/img/logo-full.png', alt: 'achieve' })),
      h('div', { class: 'lt' }, h('b', null, link.title), h('span', null, link.host)));
    const r = h('div', { class: 'row tail hasLink' + (text ? '' : (same ? '' : ' gap')) }, h('div', { class: 'bub' }, a));
    if (instant) r.firstChild.style.animation = 'none';
    if (rows.length) rows[0].classList.remove('tail');
    rows.push(r);
  }
  rows.forEach((r) => thread.append(r));
  last = { who, at, row: rows[rows.length - 1] };
  if (out) thread.append(h('div', { class: 'rcv' }, 'Delivered'));
  scroll();
}

function typing() {
  const r = h('div', { class: 'row tail gap typing' }, h('div', { class: 'bub' }, h('i'), h('i'), h('i')));
  untail(); thread.append(r); scroll();
  return r;
}

async function deliver(msgs) {
  for (const m of msgs) {
    const t = typing();
    await sleep(reduced() ? 0 : Math.min(2200, 650 + m.text.length * 16));
    t.remove();
    last.row = null; last.who = last.who === 'agent' ? 'agent' : last.who;
    const at = Date.now();
    log().push({ who: 'agent', text: m.text, link: m.link || null, at }); S.save();
    addRow('agent', m.text, m.link, at);
    await sleep(reduced() ? 0 : 350);
  }
}

let busy = false;
async function send(text) {
  const t = String(text || '').trim().slice(0, 600);
  if (!t || busy) return;
  busy = true;
  input.value = ''; compose.classList.remove('has');
  const at = Date.now();
  const history = log().map((m) => ({ who: m.who, text: m.text }));
  log().push({ who: 'user', text: t, at }); S.save();
  addRow('user', t, null, at);
  await sleep(reduced() ? 0 : 500);
  const msgs = await agent.reply(t, history);
  await deliver(msgs);
  S.save();
  busy = false;
  input.focus({ preventScroll: true });
}

compose.addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
input.addEventListener('input', () => compose.classList.toggle('has', input.value.trim().length > 0));
$('#backBtn').addEventListener('click', (e) => e.preventDefault());

/* conversation list (desktop) */
function convos() {
  const lastMsg = log().length ? log()[log().length - 1].text : 'Say hello';
  const items = [['Achieve', lastMsg, 'now', true], ['Mom', 'Sounds good, see you Sunday!', 'Yesterday'], ['Jordan Lee', 'Haha that was great', 'Tuesday'], ['Weekend Hike Crew', 'Trail looks clear', 'Monday'], ['Delivery updates', 'Your package arrives today', 'Sunday']];
  const ul = $('#convos');
  ul.replaceChildren(...items.map((c) => h('li', { class: 'convo' + (c[3] ? ' on' : '') },
    h('span', { class: 'cav' }, c[3] ? h('img', { src: '/achieve/img/logo-mark.png', alt: '' }) : c[0].charAt(0)),
    h('div', null, h('b', null, c[0]), h('span', null, c[1])), h('time', null, c[2]))));
}

/* prototype-only menu */
const devBtn = $('#devBtn'), devMenu = $('#devMenu');
devBtn.addEventListener('click', () => { devMenu.hidden = !devMenu.hidden; devBtn.setAttribute('aria-expanded', String(!devMenu.hidden)); });
document.addEventListener('click', (e) => { if (!$('#dev').contains(e.target)) devMenu.hidden = true; });
$('#doReset').addEventListener('click', () => { S.reset(); location.href = '/achieve/messages/'; });

async function boot() {
  const d = S.get().dropout;
  // The thread persists for the session; replay it without delay.
  log().forEach((m) => addRow(m.who, m.text, m.link, m.at, true));
  convos();
  const fresh = d && d.to === 'messages';
  if (!log().length || fresh) {
    await sleep(reduced() ? 0 : 900);
    const msgs = agent.start();
    await deliver(msgs);
    convos();
  }
  if (matchMedia('(min-width: 761px)').matches) input.focus({ preventScroll: true });
}
boot();
