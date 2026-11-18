/* Achieve debt relief prototype, stage 8: the cards. Each card returns { el, auto(alive) }.
   No audio plays, nothing ships, and no account is opened. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import * as F from './free.js';
import { money } from './firsttake/shared/flow.js';

import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));

/* ---- graduation ---- */
export function graduateCard(applicant, r, hooks, onDone) {
  const n = applicant.first || 'friend';
  const stat = (k, v, s) => h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, k), h('b', null, v), s ? h('small', null, s) : null);
  const go = cont('Celebrate', () => onDone({ graduated: true }));
  const el = h('div', { class: 'card party grad' },
    h('div', { class: 'party-ring' }, h('div', { class: 'win-ic big' }, ico('star', 34, 2))),
    h('h3', null, 'You are debt free, ' + n + '.'),
    h('p', { class: 'party-sub' }, r.debts + ' debts. ' + r.months + ' months. Every deposit, every call, every hard day. You finished.'),
    h('div', { class: 'rs-grid' }, stat('Debt you started with', money(r.owed), r.debts + ' accounts'), stat('You put in', money(r.total), money(r.deposit) + ' a month'), stat('Time', r.months + ' months', 'start to finish')),
    h('p', { class: 'fine' }, 'Illustrative example. Your own numbers will differ.'), go);
  [250, 1500, 3200].forEach((t) => hooks && hooks.burst && setTimeout(() => hooks.burst(), t));
  return { el, async auto(alive) { await pause(4200); if (alive()) go.click(); } };
}

/* ---- the rave: a party view of the logged-in account ---- */
export function raveCard(applicant, r, hooks, onDone) {
  const n = applicant.first || 'friend';
  const s = F.song({ first: n, months: r.months });
  const eq = h('span', { class: 'eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));
  const lyr = h('div', { class: 'lyrics', 'aria-live': 'polite' });
  const badges = h('div', { class: 'badges' });
  let playing = false;
  const play = h('button', { type: 'button', class: 'btn line', onclick: playSong }, ico('speaker', 18), 'Play my song');
  async function playSong() {
    if (playing) return; playing = true; play.disabled = true; eq.classList.add('on'); lyr.replaceChildren();
    for (const l of s.lines) { lyr.append(h('div', { class: 'ly' }, l)); lyr.lastChild.scrollIntoView({ block: 'nearest' }); await pause(1000); }
    eq.classList.remove('on'); play.disabled = false; playing = false;
  }
  async function reveal() {
    for (const b of F.BADGES) { badges.append(h('div', { class: 'badge' }, h('span', { class: 'bdg-ic' }, ico('check', 14, 3.4)), h('span', null, h('b', null, b.t), h('em', null, b.d)))); hooks && hooks.burst && hooks.burst(24); await pause(650); }
  }
  const notes = F.NOTES.map((x) => h('div', { class: 'note' }, h('div', { class: 'note-av' }, x.who[0]), h('div', null, h('b', null, x.who), h('em', null, x.role), h('p', null, x.say(n)))));
  const go = cont('Next', () => onDone({ raved: true }));
  const el = h('div', { class: 'card party rave' },
    h('div', { class: 'rave-h' }, h('span', { class: 'rave-dot' }), 'Your account, tonight'),
    h('div', { class: 'rave-zero' }, '$0', h('small', null, 'owed on every enrolled debt')),
    h('div', { class: 'qlab' }, 'Your milestones'), badges,
    h('div', { class: 'qlab' }, 'From your team'), h('div', { class: 'notes' }, notes),
    h('div', { class: 'song' }, h('div', { class: 'song-h' }, eq, h('span', null, h('b', null, s.title), h('em', null, 'A song about you'))), lyr, play, h('p', { class: 'fine' }, s.note)), go);
  reveal();
  return { el, async auto(alive) { await pause(F.BADGES.length * 650 + 1200); if (!alive()) return; playSong(); await pause(s.lines.length * (reduced() ? 0 : 1000) + 2400); if (alive()) go.click(); } };
}

/* ---- the gift box ---- */
export function boxCard(applicant, onDone) {
  const a = {};
  const inputs = F.ADDRESS_FIELDS.map((f) => { const i = h('input', { class: 'inp', placeholder: f.ph, maxlength: f.max || 60, 'aria-label': f.label, autocomplete: 'off', oninput: () => { a[f.id] = i.value; sync(); } }); return { f, i }; });
  const go = cont('Send my box', () => onDone({ box: Object.assign({}, a) }));
  go.disabled = true;
  const sync = () => { go.disabled = !F.addressOk(a); };
  const el = h('div', { class: 'card' },
    h('div', { class: 'boxart', 'aria-hidden': 'true' }, ico('bag', 44, 1.6)),
    h('p', { class: 'boxlead' }, 'We are sending you a graduation box, ' + (applicant.first || 'friend') + '.'),
    h('ul', { class: 'boxlist' }, F.BOX.map((x) => h('li', null, ico('check', 14, 3), x))),
    h('div', { class: 'qlab' }, 'Where should we send it?'),
    h('div', { class: 'addr' }, inputs.map(({ f, i }) => h('label', { class: 'addr-' + f.id }, h('span', null, f.label), i))),
    h('p', { class: 'fine' }, 'Prototype: nothing is shipped and the address is not stored on a server.'), go);
  return { el, async auto(alive) {
    await pause(1600);
    for (const { f, i } of inputs) { if (!alive()) return; i.value = F.PERSONA_ADDR[f.id]; a[f.id] = i.value; await pause(450); }
    sync(); await pause(1200); if (alive()) go.click();
  } };
}

/* ---- what comes next ---- */
export function nextCard(applicant, onDone) {
  const sel = new Set();
  const cards = F.NEXT.map((x) => {
    const b = h('button', { type: 'button', class: 'nx', 'aria-pressed': 'false', onclick: () => { sel.has(x.id) ? sel.delete(x.id) : sel.add(x.id); paint(); } },
      h('span', { class: 'nx-t' }, h('b', null, x.t), h('em', null, x.d)), h('span', { class: 'nx-c' }));
    return { x, b };
  });
  const detail = h('div', { class: 'nx-detail', 'aria-live': 'polite' });
  const go = cont('Finish', () => onDone({ next: [...sel] }));
  function paint() {
    cards.forEach(({ x, b }) => { const on = sel.has(x.id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.querySelector('.nx-c').replaceChildren(...(on ? [ico('check', 14, 3.4)] : [])); });
    detail.replaceChildren(...F.NEXT.filter((x) => sel.has(x.id)).map((x) => h('div', { class: 'nx-step' }, h('b', null, x.t), h('p', null, x.step))));
    go.textContent = sel.size ? 'Finish' : 'Skip for now';
  }
  paint();
  const el = h('div', { class: 'card' }, h('div', { class: 'nx-grid' }, cards.map((c) => c.b)), detail, h('p', { class: 'fine' }, 'General information only. Fictional placeholders, no accounts are opened. Credit and loan outcomes depend on you and the lender.'), go);
  return { el, async auto(alive) {
    await pause(1500);
    for (const id of F.PERSONA_F.next) { if (!alive()) return; cards.find((c) => c.x.id === id).b.click(); await pause(1100); }
    await pause(1800); if (alive()) go.click();
  } };
}
