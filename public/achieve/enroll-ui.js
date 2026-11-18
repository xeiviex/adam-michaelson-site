/* Achieve debt relief prototype, stage 4: the cards. Each card returns { el, auto(alive) }.
   Nothing here connects to a bank or signs anything. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { chooser, cont } from './qualify-ui.js';
import * as E from './enroll.js';
import { money } from './firsttake/shared/flow.js';

import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));

/* ---- review the agreement ---- */
export function reviewCard(p, onDone) {
  const secs = E.agreement(p);
  const seen = new Set();
  const stat = (k, v) => h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, k), h('b', null, v));
  const acc = secs.map((s, i) => {
    const body = h('div', { class: 'ag-d', hidden: true }, s.d);
    const b = h('button', { type: 'button', class: 'ag-h', 'aria-expanded': 'false', onclick: () => open(i) }, h('span', { class: 'ag-n' }, String(i + 1)), h('span', { class: 'ag-t' }, h('b', null, s.t), h('em', null, s.plain)), ico('chevD', 16));
    const row = h('div', { class: 'ag' }, b, body);
    return { row, b, body };
  });
  function open(i) {
    const a = acc[i], on = a.body.hidden;
    a.body.hidden = !on; a.b.setAttribute('aria-expanded', String(on)); a.row.classList.toggle('open', on);
    if (on) seen.add(i);
  }
  const go = cont('Continue to sign', () => onDone({ review: true, viewed: seen.size }));
  const el = h('div', { class: 'card' },
    h('div', { class: 'glance' }, h('div', { class: 'glance-t' }, 'Your agreement in plain English', h('em', null, 'Sample document')),
      h('div', { class: 'rs-grid' }, stat('Debts enrolled', p.count + ' · ' + money(p.total_debt)), stat('Monthly deposit', money(p.deposit)), stat('Our fee', 'After each settlement'), stat('Cancel', 'Any time'))),
    h('div', { class: 'ag-list' }, acc.map((a) => a.row)),
    h('p', { class: 'help' }, 'Open any section to read the details. The full document is yours to download after you sign.'), go);
  return { el, async auto(alive) {
    await pause(1400);
    for (const i of [2, 3, 4]) { if (!alive()) return; open(i); await pause(1500); }
    if (alive()) go.click();
  } };
}

/* ---- consents ---- */
export function consentCard(saved, onDone) {
  const on = new Set(saved.consents || []);
  let go;
  const rows = E.CONSENTS.map((c) => {
    const b = h('button', { type: 'button', class: 'tl', role: 'checkbox', 'aria-checked': 'false', onclick: () => { on.has(c.id) ? on.delete(c.id) : on.add(c.id); paint(); } }, h('span', { class: 'tl-box' }), h('span', { class: 'tl-main' }, h('b', { class: 'plainb' }, c.t)));
    return { c, b };
  });
  function paint() { rows.forEach(({ c, b }) => { const v = on.has(c.id); b.classList.toggle('on', v); b.setAttribute('aria-checked', String(v)); b.querySelector('.tl-box').replaceChildren(...(v ? [ico('check', 13, 3.4)] : [])); }); go.disabled = on.size < E.CONSENTS.length; }
  go = cont('Agree and continue', () => onDone({ consents: [...on] }));
  const el = h('div', { class: 'card' }, h('div', { class: 'tl-list nomt' }, rows.map((r) => r.b)), h('p', { class: 'help' }, 'Each one is its own choice. You can read the full agreement any time, and you can cancel any time.'), go);
  paint();
  return { el, async auto(alive) { await pause(900); for (const r of rows) { if (!alive()) return; r.b.click(); await pause(520); } await pause(500); if (alive()) go.click(); } };
}

/* ---- sign (a typed signature, DocuSign style) ---- */
export function signCard(applicant, onDone) {
  const full = (applicant.first + ' ' + applicant.last).trim();
  let font = 0, signed = false;
  const name = h('input', { class: 'inp', placeholder: 'Type your full name', 'aria-label': 'Full legal name', autocomplete: 'off' });
  const tag = h('button', { type: 'button', class: 'sig-tag', onclick: () => name.focus() }, h('span', null, 'Sign here'));
  const sigText = h('span', { class: 'sig-text' });
  const stamp = h('span', { class: 'sig-stamp' });
  const slot = h('div', { class: 'sig-slot' }, tag, sigText, stamp);
  const styles = E.SIG_FONTS.map((f, i) => h('button', { type: 'button', class: 'sig-opt' + (i === 0 ? ' on' : ''), style: { fontFamily: f }, 'aria-label': 'Signature style ' + (i + 1), onclick: () => { font = i; styles.forEach((s, k) => s.classList.toggle('on', k === i)); paint(); } }, 'Sign'));
  const adopt = h('button', { type: 'button', class: 'btn', disabled: true, onclick: () => { signed = true; paint(); go.hidden = false; adopt.hidden = true; } }, 'Adopt and sign');
  const go = cont('Finish', () => onDone({ signedName: name.value.trim(), signedAt: new Date().toISOString() }));
  go.hidden = true;
  function paint() {
    const v = name.value.trim();
    sigText.textContent = v; sigText.style.fontFamily = E.SIG_FONTS[font];
    slot.classList.toggle('has', !!v); slot.classList.toggle('signed', signed);
    stamp.textContent = signed ? 'Signed ' + new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    adopt.disabled = v.length < 3 || signed;
  }
  name.addEventListener('input', paint);
  const doc = h('div', { class: 'sig-doc' },
    h('div', { class: 'sig-doc-h' }, ico('file', 18), 'Achieve Debt Relief Program Agreement', h('em', null, 'Sample')),
    h('p', null, 'This agreement is between ' + full + ' and Achieve. By signing, you confirm that you have reviewed the agreement, the enrolled debts in Schedule A, and the deposit schedule.'),
    h('div', { class: 'sig-line' }, h('span', { class: 'sig-who' }, full), slot));
  const el = h('div', { class: 'card' }, doc, h('div', { class: 'field' }, h('label', { for: 'sgn' }, 'Type your full legal name'), name), h('div', { class: 'sig-opts' }, h('span', null, 'Choose a style'), styles), adopt, go,
    h('p', { class: 'help' }, 'Your typed name works as your signature, the same as a handwritten one. A copy goes to your email and to your account.'));
  name.id = 'sgn';
  return { el, async auto(alive) {
    await pause(1200);
    name.focus({ preventScroll: true });
    for (const ch of E.PERSONA_E.sign) { if (!alive()) return; name.value += ch; paint(); await pause(70); }
    await pause(700); if (alive()) adopt.click();
    await pause(1700); if (alive()) go.click();
  } };
}

/* ---- link a bank, open the dedicated account ---- */
export function accountCard(applicant, onDone) {
  let bank = null;
  const stage = h('div', { class: 'acct-stage' });
  const go = cont('Continue', () => onDone({ bank, account: { last4: '3318', admin: E.ADMIN.name, held: E.ADMIN.bank } }));
  go.hidden = true;
  const pick = chooser(E.BANKS.map((b) => ({ id: b.id, label: b.name, ic: 'home' })), { label: 'Your bank', onChange: (v) => connect(v[0]) });
  stage.append(h('div', { class: 'qlab' }, 'First, link the bank account your deposits will come from'), pick.el);
  async function connect(id) {
    bank = id; const b = E.bankById(id);
    stage.replaceChildren(h('div', { class: 'conn' }, h('span', { class: 'orbit', 'aria-hidden': 'true' }, h('i')), h('span', null, 'Connecting securely to ' + b.name + '...')));
    await pause(1500);
    stage.replaceChildren(h('div', { class: 'linked' }, ico('check', 18, 3), h('span', null, b.name + ' checking ' + '••' + b.last4 + ' is linked.')),
      h('div', { class: 'conn' }, h('span', { class: 'orbit', 'aria-hidden': 'true' }, h('i')), h('span', null, 'Opening your dedicated account...')));
    await pause(1700);
    stage.replaceChildren(h('div', { class: 'linked' }, ico('check', 18, 3), h('span', null, b.name + ' checking ' + '••' + b.last4 + ' is linked.')),
      h('div', { class: 'acct' },
        h('div', { class: 'acct-top' }, h('span', null, 'Dedicated account'), h('i', { class: 'pill ok' }, 'Open')),
        h('b', { class: 'acct-name' }, applicant.first + ' ' + applicant.last),
        h('div', { class: 'acct-bal' }, '$0.00', h('small', null, 'balance')),
        h('div', { class: 'acct-meta' }, h('span', null, 'Account ••3318'), h('span', null, 'Held at ' + E.ADMIN.bank + ' · FDIC-insured')),
        h('p', { class: 'acct-note' }, 'You own this account. It is run by ' + E.ADMIN.name + ', an independent administrator. You can see the balance and every transaction when you sign in, and you can move money in from your bank any time.')));
    go.hidden = false;
  }
  const el = h('div', { class: 'card' }, stage, go);
  return { el, async auto(alive) { await pause(1500); if (alive()) { pick.click(E.PERSONA_E.bank); await pause(4600); if (alive()) go.click(); } } };
}

/* ---- automatic deposits ---- */
export function draftCard(applicant, deposit, bankId, onDone) {
  const st = { freq: 'monthly', day: 15, auto: true, ok: false };
  const bank = E.bankById(bankId) || E.BANKS[0];
  const live = h('div', { class: 'dr-live', role: 'status' });
  const freq = chooser(E.FREQS.map((f) => ({ id: f.id, label: f.label })), { value: ['monthly'], cls: 'seg', label: 'How often', onChange: (v) => { st.freq = v[0]; paint(); } });
  const day = chooser(E.DAYS.map((d) => ({ id: String(d), label: 'The ' + d + ordinal(d) })), { value: ['15'], cls: 'seg days', label: 'Day', onChange: (v) => { st.day = Number(v[0]); paint(); } });
  const toggle = h('button', { type: 'button', class: 'tgl on', role: 'switch', 'aria-checked': 'true', onclick: () => { st.auto = !st.auto; paint(); } }, h('i'), h('span', null, 'Automatic deposits'));
  const why = h('p', { class: 'help' });
  const auth = h('button', { type: 'button', class: 'tl', role: 'checkbox', 'aria-checked': 'false', onclick: () => { st.ok = !st.ok; paint(); } }, h('span', { class: 'tl-box' }), h('span', { class: 'tl-main' }, h('b', { class: 'plainb' }, 'I authorize ' + E.ADMIN.name + ' to debit ' + bank.name + ' ••' + bank.last4 + ' on the schedule above. I can change or stop this with 3 business days notice.')));
  const go = cont('Finish enrolling', () => onDone({ draft: { freq: st.freq, day: st.day, auto: st.auto, amount: E.perDraft(deposit, st.freq), first: E.firstDraft(new Date(), st.day, 5).toISOString() } }));
  function paint() {
    const amt = E.perDraft(deposit, st.freq), first = E.firstDraft(new Date(), st.day, 5);
    day.el.parentElement && (day.el.parentElement.hidden = st.freq === 'biweekly');
    toggle.classList.toggle('on', st.auto); toggle.setAttribute('aria-checked', String(st.auto));
    live.replaceChildren(h('div', null, h('span', null, 'Each deposit'), h('b', null, money(amt))), h('div', null, h('span', null, 'First deposit'), h('b', null, E.fmtDate(first))), h('div', null, h('span', null, 'From'), h('b', null, bank.name + ' ••' + bank.last4)));
    why.textContent = st.auto ? 'Automatic deposits mean you never have to remember. Missed deposits can delay settlements or end the program.' : 'Without automatic deposits, you will need to send each deposit yourself, on time. You can turn this on later in your account.';
    auth.hidden = !st.auto; auth.classList.toggle('on', st.ok); auth.setAttribute('aria-checked', String(st.ok)); auth.querySelector('.tl-box').replaceChildren(...(st.ok ? [ico('check', 13, 3.4)] : []));
    go.disabled = st.auto && !st.ok;
  }
  const grp = (lab, c) => h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, lab), c.el);
  const el = h('div', { class: 'card' }, grp('How often should we move your deposit?', freq), grp('On which day?', day), toggle, why, live, auth, go);
  paint();
  return { el, async auto(alive) { await pause(1500); if (!alive()) return; day.click('15'); await pause(900); if (alive()) { auth.click(); await pause(1100); if (alive()) go.click(); } } };
}
const ordinal = (d) => (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');
