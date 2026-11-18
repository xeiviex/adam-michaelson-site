/* Achieve debt relief prototype, stage 2: the cards. Each card returns { el, auto(alive) }.
   auto() plays the card the way a person would (clicks, a few typed words, a sample file) and presses Continue.
   Files chosen here stay in the browser; nothing is uploaded. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { money } from './firsttake/shared/flow.js';
import * as Q from './qualify.js';

import { pace } from './speed.js';
const pause = (ms) => sleep(reduced() ? 0 : pace(ms));
export const cont = (label, onclick) => h('button', { type: 'button', class: 'btn', onclick }, label, ico('chevR', 16, 2.4));

/* A group of options: one choice or several. items: [{ id, label, ic }]. */
export function chooser(items, o) {
  const opt = o || {};
  let sel = (opt.value || []).slice();
  const btns = new Map();
  const paint = () => btns.forEach((b, id) => { const on = sel.includes(id); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
  const click = (id) => {
    if (opt.multi) {
      if (sel.includes(id)) sel = sel.filter((x) => x !== id);
      else { sel.push(id); if (opt.max && sel.length > opt.max) sel.shift(); }
    } else sel = [id];
    paint(); if (opt.onChange) opt.onChange(sel.slice());
  };
  const el = h('div', { class: 'qopts ' + (opt.cls || ''), role: opt.multi ? 'group' : 'radiogroup', 'aria-label': opt.label || 'Options' },
    items.map((it) => { const b = h('button', { type: 'button', class: 'opt', role: opt.multi ? 'checkbox' : 'radio', onclick: () => click(it.id) }, it.ic ? ico(it.ic, 20) : null, h('span', null, it.label)); btns.set(it.id, b); return b; }));
  paint();
  return { el, get: () => sel.slice(), click };
}

/* ---- types of debt ---- */
export function dtypesCard(saved, onDone) {
  const c = chooser(Q.DEBT_TYPES, { multi: true, value: saved.debtTypes, cls: 'two', label: 'Types of debt', onChange: (v) => { go.disabled = !v.length; } });
  const go = cont('Next', () => onDone({ debtTypes: c.get() }));
  go.disabled = !c.get().length;
  const el = h('div', { class: 'card' }, c.el,
    h('div', { class: 'mint note' }, h('b', null, 'Not included: '), Q.NOT_INCLUDED.join(', ') + '. Programs are for unsecured debt.'), go);
  return { el, async auto(alive) {
    for (const id of Q.PERSONA_Q.dtypes) { if (!alive()) return; c.click(id); await pause(380); }
    await pause(500); if (alive()) go.click();
  } };
}

/* ---- where payments stand ---- */
export function statusCard(saved, onDone) {
  const note = h('div', { class: 'warn', role: 'status' }, ico('info', 18), h('span', null, 'Legal papers have deadlines. Tell your specialist as soon as you can. You can still continue here.'));
  note.hidden = saved.status !== 'sued';
  const c = chooser(Q.STATUS, { value: saved.status ? [saved.status] : [], label: 'Where payments stand', onChange: (v) => { go.disabled = !v.length; note.hidden = v[0] !== 'sued'; } });
  const go = cont('Next', () => onDone({ status: c.get()[0] }));
  go.disabled = !c.get().length;
  const el = h('div', { class: 'card' }, c.el, note, h('p', { class: 'help' }, 'There is no wrong answer. This helps us give you the right plan.'), go);
  return { el, async auto(alive) { await pause(700); if (!alive()) return; c.click(Q.PERSONA_Q.status); await pause(800); if (alive()) go.click(); } };
}

/* ---- what changed ---- */
export function hardshipCard(saved, onDone) {
  const c = chooser(Q.HARDSHIPS, { multi: true, max: Q.MAX_DETAIL, value: saved.hardships, label: 'What changed', onChange: (v) => { go.disabled = !v.length; } });
  const go = cont('Next', () => onDone({ hardships: c.get() }));
  go.disabled = !c.get().length;
  const el = h('div', { class: 'card' }, c.el, h('p', { class: 'help' }, 'Pick up to two, the biggest first. We ask a few follow-up questions about each.'), go);
  return { el, async auto(alive) {
    for (const id of Q.PERSONA_Q.hardships) { if (!alive()) return; c.click(id); await pause(450); }
    await pause(500); if (alive()) go.click();
  } };
}

/* ---- details for one hardship, with upload prompts ---- */
const STRENGTH = { none: '', partial: 'Answer the questions above to continue.', described: 'Described. Adding a document makes it easier to confirm.', documented: 'Described and documented. Thank you.' };
export function detailCard(id, saved, onDone) {
  const hd = Q.hardshipById(id);
  const vals = Object.assign({}, saved || {});
  const files = {};
  (vals.docs || []).forEach((n, i) => { files[hd.docs[i] ? hd.docs[i].id : 'x' + i] = n; });
  let go;
  const strength = h('p', { class: 'strength', role: 'status' });
  const refresh = () => {
    vals.docs = Object.values(files);
    const lvl = Q.hardshipStrength({ hardships: [id], detail: { [id]: vals } }).level;
    strength.textContent = STRENGTH[lvl]; strength.dataset.level = lvl;
    go.disabled = lvl === 'partial' || lvl === 'none';
  };
  const groups = hd.qs.map((qq) => {
    const c = chooser(qq.opts.map((o) => ({ id: o, label: o })), { value: vals[qq.id] ? [vals[qq.id]] : [], cls: 'seg', label: qq.q, onChange: (v) => { vals[qq.id] = v[0]; refresh(); } });
    return { qq, c, el: h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, qq.q), c.el) };
  });
  const rows = hd.docs.map((d) => {
    const name = h('span', { class: 'fname' });
    const input = h('input', { type: 'file', class: 'sr-only', accept: 'image/*,.pdf', 'aria-label': d.label });
    const set = (n) => { if (n) files[d.id] = n; else delete files[d.id]; name.textContent = n || ''; row.classList.toggle('has', !!n); refresh(); };
    input.addEventListener('change', () => set(input.files[0] ? input.files[0].name : ''));
    const add = h('button', { type: 'button', class: 'btn line sm', onclick: () => input.click() }, ico('upload', 16), 'Add');
    const sample = h('button', { type: 'button', class: 'lnk', onclick: () => set(files[d.id] ? '' : sampleName(d)) }, 'Use a sample');
    const row = h('div', { class: 'updoc' }, h('div', { class: 'ud-t' }, h('b', null, d.label), h('span', null, d.hint), name), h('div', { class: 'ud-a' }, add, sample, input));
    if (files[d.id]) set(files[d.id]);
    return { d, set, el: row };
  });
  const sampleName = (d) => d.id + '-sample.pdf';
  const note = h('textarea', { class: 'inp note', rows: 3, maxlength: 400, placeholder: 'Anything else you would like us to know? (optional)', 'aria-label': 'Anything else' }, vals.note || '');
  note.addEventListener('input', () => { vals.note = note.value; });
  go = cont('Next', () => onDone({ detail: Object.assign({}, vals, { docs: Object.values(files) }) }));
  const el = h('div', { class: 'card' },
    groups.map((g) => g.el),
    h('div', { class: 'qgroup' }, h('div', { class: 'qlab' }, 'Documents that help', h('em', { class: 'opt-tag' }, 'Optional')),
      h('p', { class: 'help' }, 'Documents are not required to continue. They help your specialist confirm what changed, and they stay private.'), rows.map((r) => r.el)),
    note, strength, go);
  refresh();
  return { el, async auto(alive) {
    const p = Q.PERSONA_Q.detail[id] || {};
    await pause(600);
    for (const g of groups) { if (!alive()) return; const want = p[g.qq.id] || g.qq.opts[0]; g.c.click(want); await pause(420); }
    if (rows.length && p.docs && p.docs.length) { await pause(300); if (!alive()) return; rows[0].set(p.docs[0]); await pause(600); }
    if (p.note) {
      note.focus({ preventScroll: true });
      for (const ch of p.note) { if (!alive()) return; note.value += ch; vals.note = note.value; await pause(14); }
    }
    await pause(600); if (alive()) go.click();
  } };
}

/* ---- the result ---- */
const HEAD = {
  fit: ['Good news, {first}. This looks like a fit.', 'Based on what you shared, a debt relief program could work for you. A specialist will confirm the details with you next.'],
  review: ['Thanks, {first}. A specialist should take a look.', 'You may still be a fit. A specialist will review your situation and talk it through with you.'],
  notyet: ['Thanks, {first}. A program is not the right fit today.', 'Here is why, and what you can do. You are welcome to come back any time your situation changes.'],
};
export function resultCard(applicant, q, onContinue) {
  const r = Q.qualify(applicant, q);
  const [t, sub] = HEAD[r.outcome];
  const stat = (k, v, s) => h('div', { class: 'rs-stat' }, h('span', { class: 'k' }, k), h('b', null, v), s ? h('small', null, s) : null);
  const e = r.est;
  const el = h('div', { class: 'card result ' + r.outcome },
    h('div', { class: 'res-h' }, h('div', { class: 'win-ic ' + (r.outcome === 'fit' ? '' : 'soft') }, ico(r.outcome === 'notyet' ? 'info' : 'check', 26, 3)), h('h3', null, t.replace('{first}', applicant.first || 'there')), h('p', null, sub)),
    r.flags.map((f) => h('div', { class: 'warn' }, ico('info', 18), h('span', null, f))),
    r.outcome === 'notyet' ? null : h('div', { class: 'glance' },
      h('div', { class: 'glance-t' }, 'Your program at a glance', h('em', null, 'Estimates, not guarantees')),
      h('div', { class: 'rs-grid' },
        stat('Debt enrolled', money(e.debt), 'before fees and settlements'),
        stat('Monthly deposit', money(e.deposit), 'into an account you own'),
        stat('Typical length', e.months + ' months', 'depends on your creditors'),
        stat('Estimated total cost', money(e.total), 'settlements plus fees, paid from your deposits')),
      h('p', { class: 'fine' }, 'Illustrative: settling at about half of each balance with a fee of ' + Math.round(Q.RULES.feePct * 100) + '% of enrolled debt, paid only after a debt is settled. Results vary and creditors decide.')),
    r.reasons.length ? h('ul', { class: 'why' }, r.reasons.map((x) => h('li', null, x))) : null,
    h('div', { class: 'chips' },
      h('span', { class: 'chip' }, ico('check', 14, 3), 'Debt ' + money(applicant.debt)),
      h('span', { class: 'chip' }, ico('check', 14, 3), 'Hardship: ' + ({ described: 'described', documented: 'described and documented', partial: 'in progress', none: 'not yet shared' }[r.strength.level])),
      h('span', { class: 'chip' }, ico('check', 14, 3), 'Deposit ' + money(r.budget.deposit) + ' a month')),
    r.outcome === 'notyet' ? null : cont('Meet your plan', onContinue));
  return { el, result: r, async auto(alive) { await pause(2600); if (alive() && r.outcome !== 'notyet') el.querySelector('.btn').click(); } };
}
