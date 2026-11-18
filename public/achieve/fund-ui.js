/* Achieve debt relief prototype, stage 6: the cards. Each card returns { el, auto(alive) }. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import * as B from './fund.js';
import { money } from './firsttake/shared/flow.js';

import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));

/* ---- the thermometer and timeline ---- */
const FUND_FX = { q: 'beam', h: 'flag', t: 'bell', free: 'sunrise' };
export function fundCard(applicant, m, hooks, onDone) {
  let month = 1, playing = false, last = 0;
  const fill = h('div', { class: 'th-fill' });
  const pctEl = h('b', { class: 'th-pct' });
  const marks = [[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, 'Debt free']].map(([p, l]) => h('div', { class: 'th-mark', style: { bottom: p * 100 + '%' } }, h('span', null, l)));
  const offerMark = h('div', { class: 'th-mark ofr', style: { bottom: Math.min(100, (m.deposit * m.offerMonth / m.target) * 100) + '%' } }, h('span', null, 'Offers can begin'));
  const tube = h('div', { class: 'th-tube', 'aria-hidden': 'true' }, fill, marks, offerMark);
  const bulb = h('div', { class: 'th-bulb', 'aria-hidden': 'true' });
  const big = h('div', { class: 'fd-big' });
  const saved = h('div', { class: 'fd-sub' });
  const msg = h('div', { class: 'fd-msg', role: 'status' });
  const list = h('ol', { class: 'fd-miles' });
  const range = h('input', { type: 'range', min: 1, max: m.months, step: 1, value: 1, 'aria-label': 'Month of your program' });
  const playBtn = h('button', { type: 'button', class: 'btn line sm', onclick: () => toggle() }, ico('chevR', 16, 2.4), 'Fast-forward');
  const go = cont('Next', () => onDone({ fund: true }));
  go.hidden = true;
  function paint(msgChanged) {
    const s = B.at(m, month);
    fill.style.height = s.pct * 100 + '%';
    pctEl.textContent = Math.round(s.pct * 100) + '%';
    big.textContent = 'Month ' + month + ' of ' + m.months;
    saved.textContent = money(s.fund) + ' saved of ' + money(m.target) + ' for the full program';
    const text = B.message(m, month, applicant.first);
    if (msg.textContent !== text) { msg.textContent = text; msg.classList.remove('pop'); void msg.offsetWidth; msg.classList.add('pop'); }
    list.replaceChildren(...B.milestones(m, month).map((x) => h('li', { class: x.done ? 'done' : '' }, h('span', { class: 'mk' }, x.done ? ico('check', 12, 3.4) : null), h('span', null, h('b', null, x.t), h('em', null, 'Month ' + x.m)))));
    range.value = month; range.style.setProperty('--p', ((month - 1) / Math.max(1, m.months - 1)) * 100 + '%');
    if (s.offersOpen) go.hidden = false;
  }
  function set(v) {
    const prev = month; month = Math.max(1, Math.min(m.months, v)); paint();
    for (const x of B.milestones(m, month)) if (x.done && !B.milestones(m, prev).find((y) => y.id === x.id).done && hooks && hooks.burst && FUND_FX[x.id]) hooks.burst(FUND_FX[x.id]);
  }
  range.addEventListener('input', () => { playing = false; playBtn.lastChild.textContent = 'Fast-forward'; set(Number(range.value)); });
  async function toggle() {
    if (playing) { playing = false; playBtn.lastChild.textContent = 'Fast-forward'; return; }
    playing = true; playBtn.lastChild.textContent = 'Pause';
    if (month >= m.months) set(1);
    while (playing && month < m.months) {
      await pause(380); if (!playing) break; set(month + 1);
      const hit = B.milestones(m, month).some((x) => x.m === month && x.id !== 'first');
      if (hit) await pause(1100);
    }
    playing = false; playBtn.lastChild.textContent = 'Fast-forward';
  }
  paint();
  const el = h('div', { class: 'card fund' },
    h('div', { class: 'fd-grid' }, h('div', { class: 'thermo' }, tube, bulb, pctEl),
      h('div', { class: 'fd-side' }, big, saved, msg, list)),
    h('div', { class: 'fd-ctl' }, playBtn, range),
    h('p', { class: 'fine' }, 'Drag the slider or fast-forward to see your fund grow. Months are estimates from your plan. Creditors decide the real timing, and we will tell you if it changes.'), go);
  return { el, async auto(alive) {
    await pause(1600); if (!alive()) return;
    playing = true; playBtn.lastChild.textContent = 'Pause';
    const stop = () => !alive() || !playing;
    while (!stop() && month < m.months) {
      await pause(300); if (stop()) break; set(month + 1);
      if (B.milestones(m, month).some((x) => x.m === month && x.id !== 'first')) await pause(1000);
    }
    playing = false; playBtn.lastChild.textContent = 'Fast-forward';
    await pause(1800); if (alive()) go.click();
  } };
}

/* ---- how we stay in touch ---- */
export function messagesCard(applicant, m, depositLabel, onDone) {
  let ch = 'text', idx = 0;
  const items = () => B.feed(m, applicant.first, depositLabel).filter((x) => x.ch === ch);
  const tabs = B.CHANNELS.map((c) => h('button', { type: 'button', class: 'tab' + (c.id === ch ? ' on' : ''), onclick: () => { ch = c.id; idx = 0; paint(); } }, c.label));
  const screen = h('div', { class: 'phone-s' });
  const pick = h('div', { class: 'sugg-row' });
  function paint() {
    tabs.forEach((t, i) => t.classList.toggle('on', B.CHANNELS[i].id === ch));
    const its = items();
    screen.className = 'phone-s ' + ch;
    screen.replaceChildren(h('div', { class: 'ph-h' }, ch === 'text' ? 'Messages' : ch === 'email' ? 'Inbox' : 'Achieve app'), ...its.map((x, i) => h('div', { class: 'ph-m' + (i === idx ? ' on' : '') , onclick: () => { idx = i; paint(); } },
      h('div', { class: 'ph-top' }, h('b', null, x.from), h('em', null, 'Month ' + x.month)), h('div', { class: 'ph-t' }, x.title), h('div', { class: 'ph-b' }, x.body))));
  }
  const go = cont('Next', () => onDone({ messages: true }));
  paint();
  const el = h('div', { class: 'card' }, h('div', { class: 'tabs', role: 'tablist' }, tabs), screen,
    h('p', { class: 'help' }, 'We reach out at the moments that matter, in the way you like. You can change how, or pause messages, any time. You can always reply or call.'), go);
  return { el, async auto(alive) {
    await pause(1500);
    for (const c of ['email', 'app']) { if (!alive()) return; ch = c; idx = 0; paint(); await pause(1700); }
    if (alive()) go.click();
  } };
}

/* ---- recurring transfers and an extra deposit ---- */
export function boostCard(m, draft, bank, hooks, onDone) {
  let extra = 0;
  const lbl = ({ monthly: 'a month', biweekly: 'every two weeks', twice: 'twice a month' })[draft.freq] || 'a month';
  const next = draft.first ? new Date(draft.first).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'soon';
  const out = h('div', { class: 'boost-out', role: 'status' });
  const range = h('input', { type: 'range', min: 0, max: 5000, step: 100, value: 0, 'aria-label': 'Extra deposit' });
  const val = h('b', { class: 'dep-val' });
  const send = h('button', { type: 'button', class: 'btn line', onclick: () => { if (extra >= 500 && hooks && hooks.burst) hooks.burst('coins'); sent.textContent = extra ? 'Sent ' + money(extra) + ' from ' + bank.name + ' ••' + bank.last4 + '. It will show in your account when it clears.' : ''; } }, 'Send an extra deposit');
  const sent = h('p', { class: 'help ok' });
  function paint() {
    val.textContent = money(extra);
    range.style.setProperty('--p', (extra / 5000) * 100 + '%');
    const r = B.withExtra(m, extra);
    out.textContent = extra ? (r.saved > 0 ? 'That moves your finish about ' + r.saved + (r.saved === 1 ? ' month' : ' months') + ' sooner, to about month ' + r.months + '.' : 'That adds a cushion, and your finish stays about month ' + r.months + '.') : 'Even a small extra deposit can bring your finish date closer.';
    send.disabled = !extra;
  }
  range.addEventListener('input', () => { extra = Number(range.value); sent.textContent = ''; paint(); });
  const go = cont('Done', () => onDone({ extra }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'rec' }, h('div', { class: 'rec-h' }, ico('refresh', 18), h('b', null, 'Your automatic deposit'), h('i', { class: 'pill ok' }, draft.auto ? 'On' : 'Off')),
      h('div', { class: 'xf-row' }, h('span', null, 'Amount'), h('b', null, money(draft.amount || m.deposit) + ' ' + lbl)), h('div', { class: 'xf-row' }, h('span', null, 'Next deposit'), h('b', null, next)), h('div', { class: 'xf-row' }, h('span', null, 'From'), h('b', null, bank.name + ' ••' + bank.last4))),
    h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'Want to finish sooner? Add an extra deposit ', val), range, out, send, sent), go);
  paint();
  return { el, async auto(alive) {
    await pause(1700); if (!alive()) return;
    const goal = B.PERSONA_B.extra;
    for (let v = 0; v <= goal; v += 100) { if (!alive()) return; range.value = v; extra = v; paint(); await pause(70); }
    await pause(500); if (alive()) send.click(); await pause(2000); if (alive()) go.click();
  } };
}
