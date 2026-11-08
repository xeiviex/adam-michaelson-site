/* Achieve funnel: modal, document upload and offers panels. */
import { h, icon, ico, sleep } from './shared/dom.js';
import { DOC_TYPES, requiredDocs, money, fmtPhone, HOURS, BRAND } from './shared/flow.js';
import { SAMPLE_NOTE } from './shared/offers.js';

/* ---------- modal ---------- */
export function openModal(o) {
  const prev = document.activeElement;
  const close = () => { back.classList.remove('in'); setTimeout(() => { back.remove(); document.body.classList.remove('modal-open'); if (prev && prev.focus) prev.focus(); if (o.onClose) o.onClose(); }, 180); document.removeEventListener('keydown', key); };
  const key = (e) => { if (e.key === 'Escape') close(); };
  const box = h('div', { class: 'modal-box' + (o.wide ? ' wide' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.title || 'Dialog' },
    h('button', { class: 'modal-x', type: 'button', 'aria-label': 'Close', onclick: close, html: icon('x', 20) }),
    o.body);
  const back = h('div', { class: 'modal-back', onclick: (e) => { if (e.target === back) close(); } }, box);
  document.body.append(back);
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', key);
  requestAnimationFrame(() => { back.classList.add('in'); const f = box.querySelector('[autofocus],button.btn,button'); if (f) f.focus({ preventScroll: true }); });
  return close;
}

export function needHelpBody(onHuman) {
  return h('div', { class: 'help-modal' },
    ico('headset', 24),
    h('h2', null, 'Our consultants are here to help you.'),
    h('a', { class: 'tel-pill', href: 'tel:' + BRAND.consultants.replace(/-/g, '') }, BRAND.consultants),
    h('div', { class: 'hours' }, h('b', null, 'Hours of Operation:'), HOURS.map((r) => h('div', null, h('span', null, r[0]), h('b', null, r[1])))),
    h('button', { class: 'btn', type: 'button', onclick: onHuman }, ico('headset', 18), 'Chat with a human instead'));
}

/* ---------- documents ---------- */
const classify = (name) => {
  const n = String(name || '').toLowerCase();
  if (/lease|property|utility|insurance|address|bill/.test(n)) return 'address';
  if (/w-?2|1099|1040|tax|return/.test(n)) return 'tax';
  if (/pay|stub|earning/.test(n)) return 'paystub';
  if (/licen|passport|military|\bid\b|identity|driver/.test(n)) return 'identity';
  if (/bank|statement|check|voided/.test(n)) return 'bank';
  if (/401|\bira\b|retire/.test(n)) return 'retirement';
  return null;
};
const kb = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB');

export function docsPanel(S, a, o) {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const need = new Set(requiredDocs(a).map((d) => d.id));
  const list = h('div', { class: 'docs-list' });
  const foot = h('div', { class: 'docs-foot' });
  const rows = {};

  const refresh = () => {
    const missing = [...need].filter((id) => !S.docFor(id));
    cont.disabled = missing.length > 0;
    cont.title = missing.length ? 'Add the required documents first' : '';
    hint.textContent = missing.length ? missing.length + ' required to go' : 'All required documents received';
    hint.classList.toggle('ok', !missing.length);
  };

  const paint = (t) => {
    const r = rows[t.id], d = S.docFor(t.id);
    r.classList.toggle('done', !!d);
    r.querySelector('.d-state').replaceChildren(
      d ? h('span', { class: 'chip ok' }, ico('check', 14, 2.6), 'Received') : h('span', { class: 'chip' + (need.has(t.id) ? ' req' : '') }, need.has(t.id) ? 'Required' : 'Optional'));
    const act = r.querySelector('.d-act');
    act.replaceChildren(...(d
      ? [h('span', { class: 'fname' }, ico('file', 16), d.name + (d.size ? ' · ' + kb(d.size) : '')),
         h('button', { type: 'button', class: 'lnk', onclick: () => pick(t.id) }, 'Replace'),
         h('button', { type: 'button', class: 'lnk', onclick: () => { S.removeDocument(t.id); paint(t); refresh(); } }, 'Remove')]
      : [h('button', { type: 'button', class: 'btn sm line', onclick: () => pick(t.id) }, ico('upload', 16), 'Upload'),
         coarse ? h('button', { type: 'button', class: 'btn sm line', onclick: () => pick(t.id, true) }, ico('camera', 16), 'Photo') : null].filter(Boolean)));
  };

  const receive = async (id, file) => {
    const r = rows[id];
    r.classList.add('busy');
    const bar = r.querySelector('.d-bar i');
    bar.style.width = '0%';
    for (let p = 0; p <= 100; p += 20) { bar.style.width = p + '%'; await sleep(140); }
    r.classList.remove('busy');
    S.addDocument(id, file);
    paint(DOC_TYPES.find((x) => x.id === id));
    refresh();
  };

  const input = h('input', { type: 'file', class: 'sr-only', multiple: true, accept: 'image/*,application/pdf', tabindex: -1, 'aria-hidden': 'true' });
  let target = null;
  const pick = (id, cam) => { target = id; if (cam) input.setAttribute('capture', 'environment'); else input.removeAttribute('capture'); input.value = ''; input.click(); };
  const handleFiles = async (files) => {
    const arr = Array.from(files || []);
    for (const f of arr) {
      let id = target || classify(f.name);
      if (!id || (S.docFor(id) && !target)) id = [...need].find((x) => !S.docFor(x)) || DOC_TYPES.find((x) => !S.docFor(x.id)).id;
      note.textContent = 'Sorted "' + f.name + '" as ' + DOC_TYPES.find((x) => x.id === id).label.toLowerCase();
      await receive(id, f);
    }
    target = null;
  };
  input.addEventListener('change', () => handleFiles(input.files));

  const sorted = [...DOC_TYPES].sort((x, y) => (need.has(y.id) ? 1 : 0) - (need.has(x.id) ? 1 : 0));
  sorted.forEach((t) => {
    const row = h('div', { class: 'doc' },
      h('div', { class: 'd-top' }, h('div', { class: 'd-ic' }, ico('file', 20)), h('div', { class: 'd-txt' }, h('b', null, t.label), h('span', null, t.hint)), h('div', { class: 'd-state' })),
      h('div', { class: 'd-act' }),
      h('div', { class: 'd-bar' }, h('i')));
    ['dragenter', 'dragover'].forEach((ev) => row.addEventListener(ev, (e) => { e.preventDefault(); row.classList.add('drop'); }));
    ['dragleave', 'drop'].forEach((ev) => row.addEventListener(ev, () => row.classList.remove('drop')));
    row.addEventListener('drop', (e) => { e.preventDefault(); target = t.id; handleFiles(e.dataTransfer.files); });
    rows[t.id] = row; list.append(row); paint(t);
  });

  const note = h('p', { class: 'drop-note', 'aria-live': 'polite' }, coarse ? 'Take a photo or choose a file for each one below.' : 'Drop everything at once and we will sort it for you.');
  const zone = h('div', { class: 'zone' },
    ico('upload', 26), h('b', null, coarse ? 'Add your documents' : 'Drop your documents here'), h('span', null, coarse ? 'Photos and PDFs are fine.' : 'PDFs and photos are fine. Or choose them from your computer.'),
    h('button', { type: 'button', class: 'btn line', onclick: () => pick(null) }, ico('upload', 18), 'Choose files'), note);
  ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add('drop'); }));
  ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, () => zone.classList.remove('drop')));
  zone.addEventListener('drop', (e) => { e.preventDefault(); target = null; handleFiles(e.dataTransfer.files); });

  const textMe = h('div', { class: 'textme' });
  const sendLink = () => {
    const ph = a.phone ? fmtPhone(a.phone) : 'your phone';
    textMe.replaceChildren(ico('check', 18, 2.4), h('span', null, 'Link sent to ' + ph + '. Open it on your phone to take photos, then come back here.'));
    textMe.classList.add('sent');
  };
  textMe.append(ico('phone', 18), h('span', null, 'Easier from your phone?'), h('button', { type: 'button', class: 'lnk', onclick: sendLink }, 'Text me a secure upload link'));

  const hint = h('span', { class: 'need-hint' });
  const cont = h('button', { type: 'button', class: 'btn', onclick: () => o.onContinue() }, 'Continue', ico('chevR', 16, 2.4));
  foot.append(hint, cont, h('button', { type: 'button', class: 'lnk later', onclick: () => o.onLater() }, "I'll upload these later"));
  refresh();
  return h('div', { class: 'card docs' }, zone, input, h('div', { class: 'docs-h' }, 'What we need', h('em', null, requiredDocs(a).length + ' required')), list, textMe, foot);
}

/* ---------- offers ---------- */
const row = (k, v) => h('div', { class: 'o-r' }, h('dt', null, k), h('dd', null, v));

export function offersPanel(offers, a, o) {
  const picked = new Set();
  const wrap = h('div', { class: 'offers' });
  const cmpBar = h('div', { class: 'cmp-bar', hidden: true });
  const upd = () => {
    cmpBar.hidden = picked.size < 2;
    cmpBar.replaceChildren(h('span', null, picked.size + ' selected'), h('button', { type: 'button', class: 'btn sm', onclick: () => compare(offers.filter((x) => picked.has(x.id)), o) }, 'Compare'), h('button', { type: 'button', class: 'lnk', onclick: () => { picked.clear(); wrap.querySelectorAll('.o-cmp input').forEach((i) => { i.checked = false; }); wrap.querySelectorAll('.offer').forEach((c) => c.classList.remove('sel')); upd(); } }, 'Clear'));
  };
  const cards = offers.map((of) => {
    const cb = h('input', { type: 'checkbox', 'aria-label': 'Compare ' + of.name + ' ' + of.short });
    const card = h('article', { class: 'offer', 'data-offer': of.id },
      h('div', { class: 'o-top' }, h('span', { class: 'o-kind' }, of.kind), of.tags.map((t) => h('span', { class: 'tag' }, t))),
      h('h3', { class: 'o-name' }, of.name, h('small', null, of.short)),
      h('div', { class: 'o-amt' }, h('span', null, of.amountLabel), h('b', null, money(of.amount))),
      h('div', { class: 'o-big' }, money(of.monthly), h('small', null, ' / month')),
      h('dl', { class: 'o-grid' }, row('APR', of.apr + '% ' + of.rateType.toLowerCase()), row('Term', of.term + ' mo'), row('Fee', money(of.fee)), row('Funds', of.funding)),
      h('p', { class: 'o-blurb' }, of.blurb),
      h('div', { class: 'o-actions' },
        h('label', { class: 'o-cmp' }, cb, h('span', null, 'Compare')),
        h('button', { type: 'button', class: 'btn sm line', onclick: () => details(of, o) }, 'Details'),
        h('button', { type: 'button', class: 'btn sm', onclick: () => o.onChoose(of) }, 'Choose')));
    cb.addEventListener('change', () => {
      if (cb.checked && picked.size >= 3) { cb.checked = false; return; }
      cb.checked ? picked.add(of.id) : picked.delete(of.id);
      card.classList.toggle('sel', cb.checked); upd();
    });
    return card;
  });
  wrap.append(h('div', { class: 'o-grid-list' }, cards), cmpBar, h('p', { class: 'sample-note' }, ico('info', 14), SAMPLE_NOTE));
  upd();
  return h('div', { class: 'card offers-card' }, wrap);
}

export function details(of, o) {
  const body = h('div', { class: 'o-detail' },
    h('div', { class: 'o-top' }, h('span', { class: 'o-kind' }, of.kind), of.tags.map((t) => h('span', { class: 'tag' }, t))),
    h('h2', null, of.name, h('small', null, of.short)),
    h('div', { class: 'o-amt big' }, h('span', null, of.amountLabel), h('b', null, money(of.amount))),
    h('div', { class: 'o-hero' }, h('div', null, h('b', null, money(of.monthly)), h('span', null, 'per month')), h('div', null, h('b', null, of.apr + '%'), h('span', null, 'APR, ' + of.rateType.toLowerCase()))),
    h('dl', { class: 'o-grid wide' },
      row('Term', of.term + ' months'), row('Origination fee', money(of.fee) + ' (' + of.feePct + '%)'), row('Estimated total interest', money(of.interest)), row('Estimated total cost', money(of.totalCost)),
      row('Collateral', of.secured ? 'Your home secures this' : 'None (unsecured)'), row('Funding', of.funding), row('Prepayment penalty', 'None')),
    h('div', { class: 'pc' }, h('div', null, h('b', null, 'What you get'), h('ul', null, of.pros.map((p) => h('li', null, ico('check', 14, 2.4), p)))), h('div', null, h('b', null, 'Keep in mind'), h('ul', { class: 'cons' }, of.cons.map((p) => h('li', null, ico('info', 14), p))))),
    h('p', { class: 'sample-note' }, ico('info', 14), SAMPLE_NOTE),
    h('div', { class: 'o-actions stack' },
      h('button', { type: 'button', class: 'btn', onclick: () => { close(); o.onChoose(of); } }, 'Choose this offer'),
      h('button', { type: 'button', class: 'btn line', onclick: () => { close(); o.onAsk(of); } }, ico('sparkle', 18), 'Ask a question about this offer')));
  const close = openModal({ body, title: of.name, wide: true });
  return close;
}

export function compare(list, o) {
  const best = (k, dir) => { const v = list.map((x) => x[k]); const t = dir > 0 ? Math.min(...v) : Math.max(...v); return (x) => x[k] === t && new Set(v).size > 1; };
  const rowsDef = [
    ["Loan amount / credit line", (x) => money(x.amount) + (x.type === 'term' ? '' : ' line')], ['Monthly payment', (x) => money(x.monthly), best('monthly', 1)], ['APR', (x) => x.apr + '%', best('apr', 1)], ['Rate type', (x) => x.rateType], ['Term', (x) => x.term + ' months'],
    ['Origination fee', (x) => money(x.fee), best('fee', 1)], ['Estimated total cost', (x) => money(x.totalCost), best('totalCost', 1)], ['Funding', (x) => x.funding], ['Collateral', (x) => (x.secured ? 'Your home' : 'None')],
  ];
  const table = h('table', { class: 'cmp-table' },
    h('thead', null, h('tr', null, h('th'), list.map((x) => h('th', null, h('b', null, x.name), h('span', null, x.short))))),
    h('tbody', null, rowsDef.map(([k, f, bst]) => h('tr', null, h('th', null, k), list.map((x) => h('td', { class: bst && bst(x) ? 'best' : '' }, f(x)))))),
    h('tfoot', null, h('tr', null, h('th'), list.map((x) => h('td', null, h('button', { type: 'button', class: 'btn sm', onclick: () => { close(); o.onChoose(x); } }, 'Choose'))))));
  const body = h('div', { class: 'o-compare' }, h('h2', null, 'Compare your options'), h('div', { class: 'cmp-scroll' }, table),
    h('div', { class: 'o-actions stack' }, h('button', { type: 'button', class: 'btn line', onclick: () => { close(); o.onAsk(null, 'Which of these offers is best for me?'); } }, ico('sparkle', 18), 'Ask which one fits me')),
    h('p', { class: 'sample-note' }, ico('info', 14), SAMPLE_NOTE));
  const close = openModal({ body, title: 'Compare offers', wide: true });
}
