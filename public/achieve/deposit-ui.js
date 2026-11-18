/* Achieve debt relief prototype, stage 5: the cards. Each card returns { el, auto(alive) }.
   No bank, no transfer, no audio. The transfer runs in seconds so the demo shows the whole arc. */
import { h, sleep, reduced, ico, tween } from './firsttake/shared/dom.js';
import { chooser, cont } from './qualify-ui.js';
import * as D from './deposit.js';
import { money } from './firsttake/shared/flow.js';

const pause = (ms) => sleep(reduced() ? 0 : ms);

/* The logged-in account view, shared by the sign-in and deposit cards. */
function acctView(applicant, dep) {
  const bal = h('div', { class: 'acct-bal' }, money(D.balance(dep)).replace(/^(\$[\d,]+)$/, '$1.00'), h('small', null, 'balance'));
  const list = h('div', { class: 'txn-list' });
  const set = (d) => {
    bal.firstChild.textContent = money(D.balance(d)) + '.00';
    const t = D.txns(d);
    list.replaceChildren(...(t.length ? t.map((x) => h('div', { class: 'txn' }, h('span', null, h('b', null, x.desc), h('em', null, x.date + ' · ' + x.status)), h('b', { class: 'pos' }, '+' + money(x.amt)))) : [h('div', { class: 'txn empty' }, 'No transactions yet. Your first deposit will show up here.')]));
  };
  set(dep);
  const el = h('div', { class: 'acct' },
    h('div', { class: 'acct-top' }, h('span', null, 'Your dedicated account'), h('i', { class: 'pill ok' }, 'Open')),
    h('b', { class: 'acct-name' }, applicant.first + ' ' + applicant.last), bal,
    h('div', { class: 'acct-meta' }, h('span', null, 'Account ••3318'), h('span', null, 'FDIC-insured')));
  return { el, list, set, bal };
}

/* ---- sign in and see the account ---- */
export function loginCard(applicant, onDone) {
  const v = acctView(applicant, null);
  const go = cont('Make my first deposit', () => onDone({ login: true }));
  const el = h('div', { class: 'card' }, h('div', { class: 'mint secure' }, ico('lock', 16), 'Signed in as ' + (applicant.email || 'you')), v.el, h('div', { class: 'txn-wrap' }, v.list), go,
    h('p', { class: 'help' }, 'This is your logged-in view. You will see every deposit and every payment here, and you can send money in whenever you like.'));
  return { el, async auto(alive) { await pause(2400); if (alive()) go.click(); } };
}

/* ---- send the first deposit ---- */
export function depositCard(applicant, bank, amount, onDone) {
  const cleared = { cleared: false, amount, date: 'Today', bank: bank.name + ' ••' + bank.last4 };
  const v = acctView(applicant, null);
  const amt = h('input', { class: 'inp', value: money(amount), inputmode: 'numeric', 'aria-label': 'Deposit amount' });
  amt.addEventListener('input', () => { const d = Number(amt.value.replace(/\D/g, '')); amt.value = d ? '$' + d.toLocaleString('en-US') : ''; cleared.amount = d; send.disabled = !d; send.textContent = 'Send ' + (d ? money(d) : ''); });
  const send = h('button', { type: 'button', class: 'btn', onclick: run }, 'Send ' + money(amount));
  const steps = h('ol', { class: 'ach-steps', hidden: true }, D.ACH.map((s) => h('li', { 'data-id': s.id }, h('span', { class: 'dot' }), h('span', null, h('b', null, s.t), h('em', null, s.d)))));
  const note = h('p', { class: 'help', hidden: true }, 'Demo: real bank transfers take one to three business days. This one runs in seconds. We will celebrate the moment yours clears.');
  const go = cont('Continue', () => onDone({ deposit: Object.assign({}, cleared) }));
  go.hidden = true;
  const form = h('div', { class: 'xfer' },
    h('div', { class: 'xf-row' }, h('span', null, 'From'), h('b', null, bank.name + ' ••' + bank.last4)),
    h('div', { class: 'xf-row' }, h('span', null, 'To'), h('b', null, 'Dedicated account ••3318')),
    h('div', { class: 'field' }, h('label', null, 'Amount'), amt));
  let running = false;
  async function run() {
    if (running || !cleared.amount) return; running = true;
    form.hidden = true; send.hidden = true; steps.hidden = false; note.hidden = false;
    const lis = [...steps.children];
    for (let i = 0; i < lis.length; i++) { lis[i].classList.add('now'); await pause(i === 1 ? 2200 : 1400); lis[i].classList.remove('now'); lis[i].classList.add('done'); lis[i].querySelector('.dot').replaceChildren(ico('check', 12, 3.4)); }
    cleared.cleared = true; v.set(cleared); v.bal.classList.add('bump'); go.hidden = false;
  }
  const el = h('div', { class: 'card' }, v.el, h('div', { class: 'txn-wrap' }, v.list), form, send, steps, note, go);
  return { el, run, async auto(alive) { await pause(1500); if (!alive()) return; send.click(); await pause(6600); if (alive()) go.click(); } };
}

/* ---- the celebration ---- */
export function celebrateCard(applicant, st, hooks, onDone) {
  const s = D.song({ first: applicant.first, goal: st.goal });
  const eq = h('span', { class: 'eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'));
  const lyr = h('div', { class: 'lyrics', 'aria-live': 'polite' });
  const play = h('button', { type: 'button', class: 'btn line', onclick: playSong }, ico('speaker', 18), 'Play my song');
  let playing = false;
  async function playSong() {
    if (playing) return; playing = true; play.disabled = true; eq.classList.add('on'); lyr.replaceChildren();
    for (const l of s.lines) { lyr.append(h('div', { class: 'ly' }, l)); lyr.lastChild.scrollIntoView({ block: 'nearest' }); await pause(1100); }
    eq.classList.remove('on'); play.disabled = false; playing = false;
  }
  const go = cont('Keep going', () => onDone({ celebrated: true }));
  const el = h('div', { class: 'card party' },
    h('div', { class: 'party-ring' }, h('div', { class: 'win-ic big' }, ico('star', 34, 2))),
    h('h3', null, 'The hardest part is done, ' + (applicant.first || 'friend') + '.'),
    h('p', { class: 'party-sub' }, 'You made your first deposit. Most people never take that step. You did.'),
    h('div', { class: 'gift' }, h('div', { class: 'gift-card' }, h('b', null, applicant.first + ', you did it.'), h('span', null, 'From your Achieve team')), h('div', { class: 'gift-t' }, h('b', null, 'A welcome box is on its way'), h('span', null, 'A handwritten card and a few small treats. We will confirm where to send it in your account.'))),
    h('div', { class: 'song' }, h('div', { class: 'song-h' }, eq, h('span', null, h('b', null, s.title), h('em', null, 'A song about you'))), lyr, play, h('p', { class: 'fine' }, s.note)), go);
  hooks && hooks.burst && setTimeout(hooks.burst, 250);
  return { el, async auto(alive) { await pause(2400); if (!alive()) return; playSong(); await pause(s.lines.length * (reduced() ? 0 : 1100) + 2600); if (alive()) go.click(); } };
}

/* ---- creditor outreach log ---- */
export function outreachCard(debts, onDone) {
  const log = [];
  const body = h('div', { class: 'ol-body' });
  const done = (extra) => onDone({ outreach: log.slice() });
  const entries = h('div', { class: 'ol-entries' });
  const finish = cont('That is everything', () => done());
  finish.hidden = true;
  const msg = h('div', { class: 'reassure', hidden: true });
  const yn = chooser([{ id: 'yes', label: 'Yes, someone has contacted me' }, { id: 'no', label: 'Not yet' }], { cls: 'seg', label: 'Contacted', onChange: (v) => (v[0] === 'yes' ? showForm() : none()) });
  let who = null, how = null; const text = h('textarea', { class: 'inp note', rows: 3, placeholder: 'Paste the message, or tell us what they said (optional)', 'aria-label': 'What they said' });
  const whoC = chooser(debts.map((d) => ({ id: d.id, label: d.name })).concat([{ id: 'other', label: 'Someone else' }]), { cls: 'seg', label: 'Who', onChange: (v) => { who = v[0]; sync(); } });
  const howC = chooser(D.METHODS, { cls: 'two', label: 'How', onChange: (v) => { how = v[0]; sync(); } });
  const shot = h('button', { type: 'button', class: 'lnk', onclick: () => { shotName.textContent = 'screenshot-sample.png'; } }, 'Add a screenshot (sample)');
  const shotName = h('span', { class: 'fname' });
  const add = h('button', { type: 'button', class: 'btn', disabled: true, onclick: submit }, 'Log it');
  const form = h('div', { class: 'ol-form', hidden: true }, h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'Who contacted you?'), whoC.el), h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'How?'), howC.el), text, h('div', { class: 'ol-shot' }, shot, shotName), add);
  function sync() { add.disabled = !(who && how); }
  function none() { form.hidden = true; finish.hidden = false; msg.hidden = false; msg.textContent = 'Good. If anyone does contact you, come back here and log it. We will tell you what it means.'; }
  function showForm() { form.hidden = false; finish.hidden = true; msg.hidden = true; }
  function submit() {
    const e = { who, how, text: text.value.trim(), shot: !!shotName.textContent };
    const r = D.outreachReply(e); e.urgent = r.urgent; log.push(e);
    const name = (debts.find((d) => d.id === who) || { name: 'Someone else' }).name;
    entries.append(h('div', { class: 'ol-entry' }, h('b', null, name + ' · ' + D.METHODS.find((m) => m.id === how).label), h('em', null, new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })), e.text ? h('span', null, e.text) : null));
    msg.hidden = false; msg.classList.toggle('urgent', r.urgent); msg.textContent = r.text;
    form.hidden = true; finish.hidden = false; text.value = ''; shotName.textContent = ''; whoC.get().forEach((x) => whoC.click(x)); who = how = null; sync();
  }
  const el = h('div', { class: 'card' }, h('div', { class: 'qlab' }, D.OUTREACH_OPEN), yn.el, form, entries, msg, finish);
  return { el, async auto(alive) {
    const p = D.PERSONA_D.outreach;
    await pause(1800); if (!alive()) return; yn.click('yes'); await pause(900);
    if (!alive()) return; whoC.click(p.who); await pause(600); howC.click(p.how); await pause(600);
    for (const ch of p.text) { if (!alive()) return; text.value += ch; await pause(10); }
    await pause(500); if (!alive()) return; shot.click(); await pause(500); add.click(); await pause(3200); if (alive()) finish.click();
  } };
}
