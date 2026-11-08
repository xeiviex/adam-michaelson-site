/* Achieve funnel: the form cards that appear inside the conversation. */
import { h, icon, ico } from './shared/dom.js';
import { PURPOSES, STATES, money, digits, fmtPhone, fmtDob, fmtSsn, fieldMax, fieldDefault, validateStep, stepById, HOUSING } from './shared/flow.js';

const PURPOSE_ICON = ['card', 'debt', 'home', 'bag', 'dots'];

function slider(f, a, draft, notify) {
  const max = fieldMax(f, a), min = f.min, step = f.step;
  let val = draft != null ? Number(draft) : (a[f.id] != null && a[f.id] !== '' ? Number(a[f.id]) : fieldDefault(f, a));
  val = Math.max(min, Math.min(max, val));
  const range = h('input', { type: 'range', min, max, step, value: val, 'aria-label': f.label || 'Amount', id: 'f_' + f.id });
  const num = h('input', { class: 'num', type: 'text', inputmode: 'numeric', 'aria-label': (f.label || 'Amount') + ' value', value: money(val), autocomplete: 'off' });
  const paint = () => { range.style.setProperty('--p', ((val - min) / (max - min || 1)) * 100 + '%'); num.value = money(val); };
  range.addEventListener('input', () => { val = Number(range.value); paint(); notify(f.id, val); });
  num.addEventListener('focus', () => { num.value = String(val); num.select(); });
  num.addEventListener('input', () => { const d = Number(digits(num.value)) || 0; val = Math.max(min, Math.min(max, d)); range.value = val; range.style.setProperty('--p', ((val - min) / (max - min || 1)) * 100 + '%'); notify(f.id, val); });
  num.addEventListener('blur', paint);
  paint();
  const head = f.label ? h('div', { class: 'sl-head' }, h('span', { class: 'sl-lab' }, f.tag ? '' : ico(f.id === 'retirement' ? 'shield' : 'card', 18), f.label, f.tag ? h('em', { class: 'opt-tag' }, f.tag) : null)) : null;
  const wrap = h('div', { class: 'field slider' + (f.label ? ' sl-boxed' : ''), 'data-f': f.id },
    head,
    f.help ? h('p', { class: 'help' }, f.help) : null,
    f.sublabel ? h('div', { class: 'sl-sub' }, f.sublabel) : null,
    h('div', { class: 'sval' }, num, ico('edit', 14)),
    range,
    h('div', { class: 'smm' }, h('span', null, f.minLabel), h('span', null, f.maxLabel)),
    f.note ? h('div', { class: 'sl-note' }, ico('info', 16), h('span', null, f.note)) : null,
    h('div', { class: 'err', role: 'alert' }));
  return { el: wrap, get: () => val };
}

function textField(f, a, draft, notify) {
  let v = draft != null ? draft : (a[f.id] != null ? a[f.id] : (f.def || ''));
  const type = f.type;
  const attrs = { id: 'f_' + f.id, class: 'inp', placeholder: f.ph || '', autocomplete: f.autocomplete || 'off', value: v, 'aria-label': f.label };
  if (type === 'email') { attrs.type = 'email'; attrs.inputmode = 'email'; }
  else if (type === 'tel') { attrs.type = 'tel'; attrs.inputmode = 'tel'; }
  else if (type === 'dob') { attrs.type = 'text'; attrs.inputmode = 'numeric'; attrs.maxlength = 10; attrs.autocomplete = 'bday'; }
  else if (type === 'zip') { attrs.type = 'text'; attrs.inputmode = 'numeric'; attrs.maxlength = 5; }
  else if (type === 'ssn') { attrs.type = 'password'; attrs.inputmode = 'numeric'; attrs.maxlength = 11; attrs.autocomplete = 'off'; attrs.placeholder = f.ph; }
  else if (type === 'money') { attrs.type = 'text'; attrs.inputmode = 'numeric'; }
  else attrs.type = 'text';
  const inp = h('input', attrs);
  inp.addEventListener('input', () => {
    if (type === 'tel') inp.value = fmtPhone(inp.value);
    else if (type === 'dob') inp.value = fmtDob(inp.value);
    else if (type === 'ssn') inp.value = fmtSsn(inp.value);
    else if (type === 'zip') inp.value = digits(inp.value).slice(0, 5);
    else if (type === 'money') { const d = digits(inp.value); inp.value = d ? '$' + Number(d).toLocaleString('en-US') : ''; }
    notify(f.id, type === 'ssn' ? '' : inp.value);
  });
  let control = inp;
  if (type === 'ssn') {
    const eye = h('button', { type: 'button', class: 'eye', 'aria-label': 'Show or hide Social Security number', html: icon('eye', 18) });
    eye.addEventListener('click', () => { const hide = inp.type === 'password'; inp.type = hide ? 'text' : 'password'; eye.innerHTML = icon(hide ? 'eyeOff' : 'eye', 18); });
    control = h('div', { class: 'inp-wrap' }, inp, eye);
  }
  const wrap = h('div', { class: 'field', 'data-f': f.id },
    h('label', { for: 'f_' + f.id }, f.label),
    control,
    f.help ? h('p', { class: 'help' }, f.help) : null,
    h('div', { class: 'err', role: 'alert' }));
  return { el: wrap, get: () => (type === 'money' ? Number(digits(inp.value)) : inp.value.trim()), input: inp };
}

function selectField(f, a, draft, notify) {
  let v = draft != null ? draft : (a[f.id] != null && a[f.id] !== '' ? a[f.id] : (f.def || ''));
  const opts = f.type === 'state' ? STATES.map((s) => [s, s]) : f.options;
  const sel = h('select', { id: 'f_' + f.id, class: 'inp sel', autocomplete: f.autocomplete || 'off', 'aria-label': f.label },
    h('option', { value: '' }, f.ph || 'Select'),
    opts.map((o) => h('option', { value: o[0] }, o[1])));
  sel.value = v;
  sel.addEventListener('change', () => notify(f.id, sel.value));
  const wrap = h('div', { class: 'field', 'data-f': f.id }, h('label', { for: 'f_' + f.id }, f.label), h('div', { class: 'sel-wrap' }, sel, ico('chevD', 16)), f.help ? h('p', { class: 'help' }, f.help) : null, h('div', { class: 'err', role: 'alert' }));
  return { el: wrap, get: () => sel.value };
}

function choiceField(f, a, draft, notify, submit) {
  let v = draft != null ? draft : (a[f.id] || '');
  const rows = f.options.map((o, i) => {
    const b = h('button', { type: 'button', class: 'opt' + (o === v ? ' on' : ''), role: 'radio', 'aria-checked': o === v ? 'true' : 'false' },
      ico(PURPOSE_ICON[i] || 'dots', 20), h('span', null, o));
    b.addEventListener('click', () => {
      v = o; rows.forEach((r) => { r.classList.toggle('on', r === b); r.setAttribute('aria-checked', r === b ? 'true' : 'false'); });
      notify(f.id, v);
    });
    return b;
  });
  const wrap = h('div', { class: 'field choice', 'data-f': f.id, role: 'radiogroup', 'aria-label': 'Loan purpose' }, rows, h('div', { class: 'err', role: 'alert' }));
  return { el: wrap, get: () => v };
}

/* ---- the review card ---- */
export function reviewCard(a, onJump, secs) {
  const row = (k, v) => h('div', { class: 'rv-row' }, h('span', { class: 'rv-k' }, k), h('span', { class: 'rv-v' }, v || '-'));
  const sec = (title, ic, stepId, rows) => h('div', { class: 'rv-sec' },
    h('div', { class: 'rv-head' }, h('span', null, ico(ic, 18), title),
      h('button', { type: 'button', class: 'rv-edit', 'aria-label': 'Edit ' + title, onclick: () => onJump(stepId), html: icon('edit', 16) })),
    rows);
  const housing = (HOUSING.find((x) => x[0] === a.housing) || ['', ''])[1];
  return h('div', { class: 'review' },
    sec('Loan Details', 'card', 'amount', [row('Loan Amount', money(a.amount)), row('Zip code', a.zip), row('Loan Purpose', a.purpose)]),
    sec('Contact Information', 'phone', 'name', [row('Full Name', (a.first || '') + ' ' + (a.last || '')), row('Email', a.email), row('Mobile phone number', a.phone)]),
    sec('Home and Address', 'home', 'address', [row('Primary Address', [a.street, a.apt, [a.city, a.state].filter(Boolean).join(', ') + ' ' + (a.zip || '')].filter(Boolean).join(', ')), row('Housing Information', housing), row('Monthly Housing Payment', money(a.housingPayment))]),
    sec('Work and Income', 'bag', 'work', [row('Employer', a.employer), row('Employment type', a.employment || 'Full-Time'), row('Annual Income', money(a.income))]),
    sec('Funds to credit cards & loans', 'card', 'boost', [row('Payoff Amount', money(a.payoff))]),
    sec('Retirement savings', 'shield', 'boost', [row('Value of Retirement Savings', money(a.retirement))]),
    sec('Verification', 'lock', 'name', [row('Birthdate', '••/••/••••')]));
}

/* Build a card for a standard (field based) step. Returns { el, values(), submit() }. */
export function buildForm(step, a, o) {
  const opts = o || {};
  const drafts = opts.drafts || {};
  const parts = [];
  const notify = (id, v) => { drafts[id] = v; if (opts.onDraft) opts.onDraft(id, v); };
  const form = h('form', { class: 'card', novalidate: true, autocomplete: 'on' });
  if (step.perks) form.append(h('div', { class: 'mint perks' }, h('b', null, step.perks.title), h('ul', null, step.perks.items.map((i) => h('li', null, ico('check', 14, 2.4), i)))));
  if (step.secure) form.append(h('div', { class: 'mint secure' }, ico('lock', 16), step.secure));
  if (step.section) form.append(h('div', { class: 'sec-title' }, ico(step.section.indexOf('Work') === 0 ? 'bag' : 'home', 18), step.section));
  const stateZip = [];
  for (const f of step.fields) {
    let p;
    if (f.type === 'slider') p = slider(f, a, drafts[f.id], notify);
    else if (f.type === 'choice') p = choiceField(f, a, drafts[f.id], notify);
    else if (f.type === 'select' || f.type === 'state') p = selectField(f, a, drafts[f.id], notify);
    else p = textField(f, a, drafts[f.id], notify);
    parts.push([f, p]);
    if (f.id === 'state' || f.id === 'zip') { stateZip.push(p.el); if (stateZip.length === 2) form.append(h('div', { class: 'row2' }, stateZip)); }
    else form.append(p.el);
  }
  if (step.note) form.append(h('div', { class: 'mint note' }, step.note));
  const btn = h('button', { type: 'submit', class: 'btn' }, step.submitLabel || (opts.mode === 'edit' ? 'Save' : 'Next'), opts.mode === 'edit' ? null : ico('chevR', 16, 2.4));
  form.append(btn);
  if (step.after) form.append(h('p', { class: 'after' }, step.after));
  if (step.consent) form.append(h('p', { class: 'consent' }, step.consent));
  if (step.id === 'ssn') form.append(h('p', { class: 'proto-note' }, 'Prototype: use any 9 digits. Nothing is sent or saved.'));

  const values = () => { const v = {}; for (const [f, p] of parts) v[f.id] = p.get(); return v; };
  const showErrors = (errs) => {
    for (const [f, p] of parts) {
      const e = errs[f.id] || '';
      p.el.classList.toggle('bad', !!e);
      const box = p.el.querySelector('.err'); if (box) box.textContent = e;
    }
    const first = parts.find(([f]) => errs[f.id]);
    if (first) { const t = first[1].input || first[1].el.querySelector('input,select,button'); if (t) t.focus({ preventScroll: false }); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = values();
    const errs = validateStep(step, Object.assign({}, a, v));
    showErrors(errs);
    if (Object.keys(errs).length) return;
    if (opts.onSubmit) opts.onSubmit(v);
  });
  const firstInput = parts.map(([, p]) => p.input).find(Boolean);
  return { el: form, values, focus: () => { if (firstInput && !matchMedia('(pointer: coarse)').matches) firstInput.focus({ preventScroll: true }); } };
}
