/* Achieve debt relief prototype: the "create your account" card, shown right after qualifying.
   Prefilled from what the applicant already told us. Nothing is sent anywhere, and the password is never stored. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));

export const SAMPLE_PASSWORD = 'Break-free-2026';
export const validEmail = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
export const validPhone = (v) => String(v).replace(/\D/g, '').length === 10;
export const passwordIssue = (v) => (v.length < 10 ? 'Use at least 10 characters.' : !/\d/.test(v) ? 'Add at least one number.' : !/[A-Za-z]/.test(v) ? 'Add at least one letter.' : '');

export function createCard(applicant, onDone) {
  const field = (label, input, hint) => h('div', { class: 'field' }, h('label', null, label), input, hint ? h('p', { class: 'help' }, hint) : null);
  const mk = (v, o) => h('input', Object.assign({ class: 'inp', value: v || '', autocomplete: 'off' }, o));
  const first = mk(applicant.first, { 'aria-label': 'First name' }), last = mk(applicant.last, { 'aria-label': 'Last name' });
  const email = mk(applicant.email, { type: 'email', 'aria-label': 'Email' }), phone = mk(applicant.phone, { type: 'tel', 'aria-label': 'Mobile phone' });
  const pw = mk('', { type: 'password', 'aria-label': 'Password', autocomplete: 'new-password' }), pw2 = mk('', { type: 'password', 'aria-label': 'Confirm password', autocomplete: 'new-password' });
  const show = h('button', { type: 'button', class: 'btn line sm', onclick: () => { const on = pw.type === 'password'; pw.type = pw2.type = on ? 'text' : 'password'; show.textContent = on ? 'Hide' : 'Show'; } }, 'Show');
  const on = new Set();
  const OPTS = [
    { id: 'terms', t: 'I agree to the Terms of Use and the Privacy Policy.', req: true },
    { id: 'esign', t: 'I agree to receive documents and notices electronically.', req: true },
    { id: 'text', t: 'Text me when something needs my attention. Message and data rates may apply.', req: false },
  ];
  const rows = OPTS.map((c) => {
    const b = h('button', { type: 'button', class: 'tl', role: 'checkbox', 'aria-checked': 'false', onclick: () => { on.has(c.id) ? on.delete(c.id) : on.add(c.id); paint(); } }, h('span', { class: 'tl-box' }), h('span', { class: 'tl-main' }, h('b', { class: 'tl-t' }, c.t + (c.req ? '' : ' (optional)'))));
    return { c, b };
  });
  const err = h('p', { class: 'help av-err', role: 'alert', hidden: true });
  const go = cont('Create my account', submit);
  function paint() { rows.forEach(({ c, b }) => { const v = on.has(c.id); b.classList.toggle('on', v); b.setAttribute('aria-checked', String(v)); b.querySelector('.tl-box').replaceChildren(...(v ? [ico('check', 13, 3.4)] : [])); }); }
  function submit() {
    const bad = !first.value.trim() || !last.value.trim() ? 'Enter your first and last name.' : !validEmail(email.value.trim()) ? 'Check your email address.' : !validPhone(phone.value) ? 'Check your phone number.'
      : passwordIssue(pw.value) || (pw.value !== pw2.value ? 'The two passwords do not match.' : '') || (!on.has('terms') || !on.has('esign') ? 'Please agree to the terms and electronic documents to continue.' : '');
    if (bad) { err.textContent = bad; err.hidden = false; return; }
    err.hidden = true; go.disabled = true;
    onDone({ first: first.value.trim(), last: last.value.trim(), email: email.value.trim(), phone: phone.value.trim(), textOk: on.has('text') });
  }
  const el = h('div', { class: 'card' },
    h('div', { class: 'av-grid two' }, field('First name', first), field('Last name', last)),
    field('Email', email, 'This is how you sign in.'), field('Mobile phone', phone, 'We use it for sign-in codes.'),
    h('div', { class: 'av-grid two' }, field('Password', pw, 'At least 10 characters with a number.'), field('Confirm password', pw2)), h('div', { class: 'av-actions' }, show),
    h('div', { class: 'tl-list' }, rows.map((r) => r.b)), err, go);
  const type = async (inp, v, alive) => { inp.focus(); for (const ch of v) { if (!alive()) return; inp.value += ch; await pause(45); } };
  return { el, focus: go, async auto(alive) {
    await pause(1200); if (!alive()) return;
    pw.value = ''; await type(pw, SAMPLE_PASSWORD, alive); await pause(300); await type(pw2, SAMPLE_PASSWORD, alive); await pause(400);
    for (const r of rows) { if (!alive()) return; if (r.c.req) { r.b.click(); await pause(450); } }
    await pause(700); if (alive()) go.click();
  } };
}
