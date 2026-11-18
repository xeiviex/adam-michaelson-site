/* Achieve debt relief prototype, stage 3: the cards. Each card returns { el, auto(alive) }. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { chooser, cont } from './qualify-ui.js';
import * as C from './consult.js';

import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));
const money = C.money;
const STATUS_CHIP = { current: ['Current', 'ok'], late: ['Behind', 'warn'], collections: ['Collections', 'bad'] };

/* ---- confirm the debts found on the (simulated, soft) credit report ---- */
export function debtsCard(saved, onDone) {
  const custom = (saved.custom || []).slice();
  let sel = new Set(saved.debts || C.TRADELINES.map((t) => t.id));
  const list = h('div', { class: 'tl-list' });
  const totalEl = h('b', { class: 'tl-total' });
  let go;
  const all = () => C.TRADELINES.concat(custom);
  const paint = () => {
    const rows = all();
    list.replaceChildren(...rows.map((t) => {
      const [cl, tone] = STATUS_CHIP[t.status] || STATUS_CHIP.current;
      const on = sel.has(t.id);
      return h('button', { type: 'button', class: 'tl' + (on ? ' on' : ''), role: 'checkbox', 'aria-checked': String(on), 'data-id': t.id,
        onclick: () => { sel.has(t.id) ? sel.delete(t.id) : sel.add(t.id); paint(); } },
        h('span', { class: 'tl-box' }, on ? ico('check', 13, 3.4) : null),
        h('span', { class: 'tl-main' }, h('b', null, t.name), h('em', null, t.kind + ' · ' + t.note)),
        h('span', { class: 'tl-amt' }, h('b', null, money(t.balance)), h('i', { class: 'pill ' + tone }, cl)));
    }));
    const sum = rows.filter((t) => sel.has(t.id)).reduce((s, t) => s + t.balance, 0);
    totalEl.textContent = money(sum) + ' across ' + sel.size + (sel.size === 1 ? ' debt' : ' debts');
    if (go) go.disabled = !sel.size;
  };
  const name = h('input', { class: 'inp', placeholder: 'Creditor name', 'aria-label': 'Creditor name' });
  const bal = h('input', { class: 'inp', placeholder: 'Balance', inputmode: 'numeric', 'aria-label': 'Balance' });
  bal.addEventListener('input', () => { const d = bal.value.replace(/\D/g, ''); bal.value = d ? '$' + Number(d).toLocaleString('en-US') : ''; });
  const add = h('div', { class: 'tl-add', hidden: true }, name, bal, h('button', { type: 'button', class: 'btn line sm', onclick: () => {
    const b = Number(bal.value.replace(/\D/g, '')); if (!name.value.trim() || !b) return;
    const t = { id: 'c' + (custom.length + 1), name: name.value.trim(), kind: 'Added by you', balance: b, status: 'current', note: 'Added by you' };
    custom.push(t); sel.add(t.id); name.value = ''; bal.value = ''; add.hidden = true; paint();
  } }, 'Add'));
  go = cont('These look right', () => onDone({ debts: [...sel], custom }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'mint secure' }, ico('lock', 16), 'We checked your credit report with a soft check. It did not affect your score.'),
    list,
    h('div', { class: 'tl-foot' }, totalEl, h('button', { type: 'button', class: 'lnk', onclick: () => { add.hidden = !add.hidden; } }, 'Add a debt we missed')), add,
    h('p', { class: 'help' }, 'Uncheck anything you do not want in the program. Secured debts like a mortgage or car loan are not shown.'), go);
  paint();
  return { el, async auto(alive) { await pause(1800); if (alive()) go.click(); } };
}

/* ---- goals and a few situation questions ---- */
export function goalsCard(saved, onDone) {
  const v = Object.assign({}, saved);
  const mk = (items, key, o) => chooser(items, Object.assign({ value: v[key] ? [].concat(v[key]) : [], onChange: (s) => { v[key] = o && o.multi ? s : s[0]; refresh(); } }, o));
  const goals = mk(C.GOALS, 'goals', { multi: true, max: 2, label: 'What matters most', cls: 'two' });
  const house = mk(C.HOUSEHOLD.map((x) => ({ id: x, label: x })), 'household', { cls: 'seg', label: 'Household' });
  const cosign = mk(C.COSIGN, 'cosign', { cls: 'seg', label: 'Co-signers' });
  const bk = mk(C.BK, 'bk', { cls: 'seg', label: 'Bankruptcy' });
  const go = cont('Next', () => onDone({ goals: v.goals, household: v.household, cosign: v.cosign, bk: v.bk }));
  const refresh = () => { go.disabled = !(v.goals && v.goals.length && v.household && v.cosign && v.bk); };
  const g = (lab, c) => h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, lab), c.el);
  const el = h('div', { class: 'card' }, g('What matters most to you? Pick up to two.', goals), g('Who is in your household?', house), g('Is anyone else on any of these accounts?', cosign), g('Have you considered bankruptcy?', bk), go);
  refresh();
  return { el, async auto(alive) {
    await pause(600);
    for (const id of C.PERSONA_C.goals) { if (!alive()) return; goals.click(id); await pause(380); }
    for (const [c, id] of [[house, C.PERSONA_C.household], [cosign, C.PERSONA_C.cosign], [bk, C.PERSONA_C.bk]]) { if (!alive()) return; c.click(id); await pause(380); }
    await pause(500); if (alive()) go.click();
  } };
}

/* ---- the open conversation ---- */
export function talkCard(saved, onDone) {
  const notes = (saved.talk ? [saved.talk] : []);
  const log = h('div', { class: 'tk-log' });
  const say = (who, text) => { const m = h('div', { class: 'tk ' + who }, h('div', { class: 'tkb' }, text)); log.append(m); return m; };
  say('bot', C.LISTEN_OPEN);
  const input = h('input', { class: 'inp', placeholder: 'Type here...', maxlength: 300, 'aria-label': 'Tell us more' });
  const go = cont('That is everything', () => onDone({ talk: notes.join(' ') }));
  go.hidden = true;
  async function send(text) {
    const t = String(text || '').trim(); if (!t) return;
    input.value = ''; chips.hidden = true;
    if (!/^nothing else$/i.test(t)) notes.push(t);
    say('user', t);
    const dots = say('bot', '...'); dots.classList.add('wait');
    await pause(700);
    dots.querySelector('.tkb').textContent = /^nothing else$/i.test(t) ? 'Understood. You can always add more later.' : C.listenReply(t);
    dots.classList.remove('wait'); go.hidden = false;
  }
  const chips = h('div', { class: 'sugg-row' }, C.LISTEN_CHIPS.map((s) => h('button', { type: 'button', onclick: () => send(s) }, s)));
  const form = h('form', { class: 'tk-form', onsubmit: (e) => { e.preventDefault(); send(input.value); } }, input, h('button', { type: 'submit', class: 'btn sm' }, 'Send'));
  const el = h('div', { class: 'card' }, log, chips, form, go);
  return { el, send, async auto(alive) {
    await pause(1800);
    for (const ch of C.PERSONA_TALK) { if (!alive()) return; input.value += ch; await pause(16); }
    await pause(500); if (alive()) { await send(input.value); await pause(2400); if (alive()) go.click(); }
  } };
}

/* ---- what to expect: one idea at a time ---- */
export function expectCard(months, onDone) {
  const items = C.expectations(months);
  let i = 0;
  const body = h('div', { class: 'ex-body' });
  const dots = h('div', { class: 'ex-dots', 'aria-hidden': 'true' }, items.map(() => h('i')));
  const back = h('button', { type: 'button', class: 'btn line sm', onclick: () => show(i - 1) }, 'Back');
  const next = h('button', { type: 'button', class: 'btn sm', onclick: () => (i === items.length - 1 ? onDone({ expect: true }) : show(i + 1)) });
  function show(n) {
    i = Math.max(0, Math.min(items.length - 1, n));
    const it = items[i];
    body.replaceChildren(h('div', { class: 'ex-ic' }, ico(it.ic, 26)), h('h3', null, it.t), h('p', null, it.b));
    body.classList.remove('swap'); void body.offsetWidth; body.classList.add('swap');
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k <= i));
    back.disabled = i === 0;
    next.replaceChildren(i === items.length - 1 ? 'I understand. Continue' : 'Next', ico('chevR', 16, 2.4));
  }
  show(0);
  const el = h('div', { class: 'card expect' }, h('div', { class: 'ex-count' }, 'Please read each one. It is how we start honest.'), body, dots, h('div', { class: 'ex-nav' }, back, next));
  return { el, async auto(alive) {
    for (let k = 0; k < items.length; k++) { await pause(1500 + items[k].b.length * 11); if (!alive()) return; next.click(); }
  } };
}

/* ---- your plan ---- */
export function planCard(selected, deposit, onDone) {
  let dep = deposit;
  const stats = h('div', { class: 'rs-grid' });
  const miles = h('ol', { class: 'miles' });
  const range = h('input', { type: 'range', min: 250, max: 3000, step: 25, value: dep, 'aria-label': 'Monthly deposit' });
  const val = h('b', { class: 'dep-val' });
  const stat = (k, v, s) => h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, k), h('b', null, v), h('small', null, s));
  const paint = () => {
    const p = C.plan(selected, dep);
    val.textContent = money(dep) + ' a month';
    range.style.setProperty('--p', ((dep - 250) / (3000 - 250)) * 100 + '%');
    stats.replaceChildren(stat('Debt in the program', money(p.total_debt), p.count + (p.count === 1 ? ' account' : ' accounts')), stat('Typical length', p.months + ' months', 'an estimate, not a promise'),
      stat('Estimated total cost', money(p.total), 'settlements plus fees'), stat('Estimated to keep', money(p.kept), 'compared with the full balances, before interest'));
    miles.replaceChildren(...[['Today', 'You review and sign'], ['This week', 'You make your first deposit'], ['About month ' + p.firstOffer, 'Settlement offers can begin'], ['About month ' + p.months, 'Debt free, if all goes to plan']].map(([a, b]) => h('li', null, h('b', null, a), h('span', null, b))));
  };
  range.addEventListener('input', () => { dep = Number(range.value); paint(); });
  const order = C.plan(selected, dep).order;
  const go = cont('This is my plan', () => onDone({ deposit: dep }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'glance' }, h('div', { class: 'glance-t' }, 'Your plan', h('em', null, 'Estimates, not guarantees')), stats,
      h('div', { class: 'dep' }, h('div', { class: 'qlab' }, 'Your monthly deposit ', val), range, h('p', { class: 'help' }, 'A larger deposit shortens the program. You can change it later.')),
      h('p', { class: 'fine' }, 'Illustrative: settling at about half of each balance with a fee of ' + Math.round(C.RULES.feePct * 100) + '% of enrolled debt, charged only after a settlement you approve.')),
    h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'How we would work through your debts'), h('ol', { class: 'ord' }, order.map((d) => h('li', null, h('b', null, d.name), h('span', null, money(d.balance)))))),
    h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'Your path'), miles), go);
  paint();
  return { el, async auto(alive) { await pause(3800); if (alive()) go.click(); } };
}
