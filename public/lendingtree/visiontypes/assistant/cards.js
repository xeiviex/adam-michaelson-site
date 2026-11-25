/* Embedded cards for the assistant visiontype. Every card carries LendingTree attribution in its header.
   Each renderer takes (step, ctx) and returns { el, wait?, auto? }:
     wait   a promise that resolves when the person finishes the card (cards without one do not block the conversation)
     auto   how auto-play completes it, the way a person would. It gets A = { pause, tap, type, slide }.
   ctx = { val (resolve copy that may be a function of state), S (state), pick (choose an offer), pause (a cancellable sleep) } */
import { h, $, $$, icon, ico, LEAF, carrierIcon, reduced } from './kit.js';
import { BANKS, BRAND, money, lenderIcon } from '../shared/data.js';

const check = (size) => icon('check', size || 14, 2.6);

function shell(step, ctx, cls, ...body) {
  const context = ctx.val(step.context) || '';
  const el = h('section', { class: 'ltc ' + (cls || ''), 'aria-label': BRAND.name + ': ' + context },
    h('header', { class: 'ltc-h' }, h('img', { src: LEAF, alt: '', width: 16, height: 16 }), h('b', null, BRAND.name), context && h('span', { class: 'ltc-c' }, context), h('span', { class: 'ltc-m', title: 'Connected through the Model Context Protocol' }, 'via MCP')),
    h('div', { class: 'ltc-b' }, body));
  const foot = ctx.val(step.foot);
  if (foot || step.credit) el.append(h('footer', { class: 'ltc-f' }, foot && h('span', null, foot), step.credit && h('span', { class: 'qw' }, step.credit)));
  return el;
}
const logo = (o) => (o.icon || lenderIcon(o.lender || o.name)
  ? h('span', { class: 'lg' }, h('img', { src: o.icon ? carrierIcon(o.icon) : lenderIcon(o.lender || o.name), alt: '', loading: 'lazy' }))
  : h('span', { class: 'lg mono', style: 'color:' + (o.mono ? o.mono[1] : '#333') }, o.mono ? o.mono[0] : o.name[0]));
const doneLine = (text) => h('div', { class: 'done-line' }, h('span', { class: 'dl-ic', html: check(12) }), text);
function lock(el, btn, text) {
  el.classList.add('locked');
  $$('button, input', el).forEach((b) => { b.disabled = true; });
  if (btn) btn.replaceWith(doneLine(text));
}

/* ---------- offers ---------- */
export function offers(step, ctx) {
  const list = ctx.val(step.list);
  const rows = list.map((o) => h('li', { class: 'of-r', 'data-id': o.id },
    logo(o),
    h('div', { class: 'of-n' }, h('b', null, o.name), o.tag && h('span', { class: 'tag' }, o.tag)),
    h('div', { class: 'of-big' }, h('b', null, o.big), h('small', null, o.bigLabel)),
    h('div', { class: 'of-s' }, h('span', { class: 'of-sub' }, o.sub), o.stats.map((s) => h('span', null, s))),
    h('button', { type: 'button', class: 'btn sm of-b', 'aria-label': step.cta + ' ' + o.name, onclick: () => ctx.pick(o.id, step.listKey) }, step.cta)));
  const cur = step.current && h('div', { class: 'of-cur' }, logo(step.current), h('span', null, h('b', null, step.current.name), ' ', step.current.text));
  return { el: shell(step, ctx, 'offers', cur, h('ul', { class: 'of' }, rows)) };
}

/* ---------- comparison visuals ---------- */
const daysOf = (fund) => { const m = /(\d+)\s*(day|week)/.exec(fund) || [0, 7, 'day']; return Number(m[1]) * (m[2] === 'week' ? 7 : 1); };
export function compare(step, ctx) {
  const list = ctx.val(step.list);
  let body;
  if (step.kind === 'loan') {
    const pts = list.map((o) => ({ o, x: daysOf(o.raw.fund), y: o.raw.apr }));
    const ys = pts.map((p) => p.y), lo = Math.round((Math.min(...ys) - 0.15) * 10) / 10, hi = Math.round((Math.max(...ys) + 0.15) * 10) / 10, xmax = 32;
    const top = (y) => ((hi - y) / (hi - lo)) * 100, left = (x) => (x / xmax) * 100;
    const yt = []; for (let y = Math.ceil(lo * 5 + 0.01) / 5; y < hi - 0.01; y += 0.2) yt.push(Math.round(y * 10) / 10);
    body = h('div', { class: 'plot', role: 'img', 'aria-label': 'Rate against time to fund. ' + pts.map((p) => p.o.name + ': ' + p.o.big + ' APR, ' + p.o.raw.fund.toLowerCase()).join('. ') },
      h('div', { class: 'pl-y' }, 'APR'),
      h('div', { class: 'pl-area' },
        yt.map((y) => h('i', { class: 'gl', style: 'top:' + top(y) + '%' }, h('em', null, y.toFixed(1) + '%'))),
        [7, 14, 21, 28].map((d) => h('i', { class: 'gx', style: 'left:' + left(d) + '%' }, h('em', null, d / 7 + (d === 7 ? ' week' : ' weeks')))),
        pts.map((p, i) => h('div', { class: 'pt' + (p.o.id === step.best ? ' best' : '') + (left(p.x) > 50 ? ' flip' : ''), style: 'left:' + left(p.x) + '%;top:' + top(p.y) + '%;--d:' + i },
          h('span', { class: 'dot' }), h('span', { class: 'pl-l' }, h('b', null, p.o.name), h('small', null, p.o.big + ' · ' + p.o.raw.fund.replace('Funds in ', '')))))),
      h('div', { class: 'pl-x' }, 'Time to fund'));
  } else {
    const cur = step.current, max = cur.premium;
    const row = (o, i, isCur) => h('div', { class: 'bar-r' + (isCur ? ' cur' : '') + (!isCur && o.id === step.best ? ' best' : ''), style: '--d:' + i },
      logo(isCur ? { icon: cur.icon, name: cur.carrier } : o),
      h('div', { class: 'bar-m' },
        h('div', { class: 'bar-t' }, h('b', null, isCur ? cur.carrier : o.name), isCur ? h('span', { class: 'tag grey' }, 'Today') : (o.id === step.best && h('span', { class: 'tag' }, 'My pick')), h('span', { class: 'bar-p' }, money(isCur ? cur.premium : o.raw.premium))),
        h('div', { class: 'bar' }, h('i', { style: '--w:' + ((isCur ? cur.premium : o.raw.premium) / max) * 100 + '%' })),
        h('div', { class: 'bar-c' }, h('span', null, (isCur ? cur.liability : o.raw.liability) + ' liability'), h('span', null, money(isCur ? cur.deductible : o.raw.deductible) + ' deductible'), !isCur && h('span', { class: 'save' }, 'Saves ' + money(max - o.raw.premium)))));
    body = h('div', { class: 'bars', role: 'img', 'aria-label': 'Yearly price and coverage. ' + cur.carrier + ' today: ' + money(cur.premium) + '. ' + list.map((o) => o.name + ': ' + o.big).join('. ') }, row(null, 0, true), list.map((o, i) => row(o, i + 1)));
  }
  return { el: shell({ ...step, foot: step.caption }, ctx, 'compare', body) };
}

/* ---------- pre-filled application review ---------- */
export function review(step, ctx) {
  let go;
  const wait = new Promise((r) => { go = r; });
  const btn = h('button', { type: 'button', class: 'btn', onclick: () => { lock(el, btn, step.done || 'Confirmed'); go({}); } }, step.cta);
  const el = shell(step, ctx, 'review', h('h3', null, ctx.val(step.title)),
    h('dl', { class: 'kv' }, ctx.val(step.rows).map(([k, v]) => h('div', null, h('dt', null, k), h('dd', null, v)))), btn);
  return { el, wait, auto: async (A) => { await A.pause(2200); await A.tap(btn); } };
}

/* ---------- forms: only what the assistant would not already know ---------- */
function accountField(f, ctx, set) {
  const wrap = h('div', { class: 'accts', role: 'radiogroup', 'aria-label': ctx.val(f.label) });
  f.ids.forEach((id) => {
    const b = BANKS.find((x) => x.id === id);
    const btn = h('button', { type: 'button', class: 'acct', role: 'radio', 'aria-checked': 'false', 'data-v': id, onclick: () => { $$('.acct', wrap).forEach((x) => x.setAttribute('aria-checked', String(x === btn))); set(id); } },
      (lenderIcon(b.bank) ? h('span', { class: 'ac-ic logo' }, h('img', { src: lenderIcon(b.bank), alt: '' })) : h('span', { class: 'ac-ic', html: icon('bank', 18) })), h('span', { class: 'ac-n' }, h('b', null, b.bank + ' ' + b.name), h('small', null, '••' + b.last4)), h('span', { class: 'ac-b' }, money(b.balance, 2)), h('span', { class: 'radio' }));
    wrap.append(btn);
  });
  return wrap;
}
const fmtVal = (f, v) => (f.fmt === 'money' ? money(v) : f.fmt === 'miles' ? Number(v).toLocaleString('en-US') + ' miles' : String(v));
export function form(step, ctx) {
  const values = {}, need = new Set(), autos = [];
  let go, btn;
  const wait = new Promise((r) => { go = r; });
  const refresh = () => { if (btn) btn.disabled = [...need].some((k) => values[k] == null || values[k] === ''); };
  const set = (k) => (v) => { values[k] = v; refresh(); };
  const fields = step.fields.map((f, fi) => {
    const label = ctx.val(f.label), id = 'f' + Math.random().toString(36).slice(2, 8);
    let body;
    if (f.type === 'slider') {
      values[f.k] = f.value;
      const out = h('output', { class: 'sl-v', for: id }, fmtVal(f, f.value));
      const inp = h('input', { type: 'range', id, min: f.min, max: f.max, step: f.step, value: f.value, 'aria-label': label });
      const paint = () => { inp.style.setProperty('--p', ((inp.value - f.min) / (f.max - f.min)) * 100 + '%'); out.textContent = fmtVal(f, inp.value); values[f.k] = Number(inp.value); };
      inp.addEventListener('input', paint); paint();
      body = h('div', { class: 'sl' }, out, inp, h('div', { class: 'sl-r' }, h('span', null, fmtVal(f, f.min)), h('span', null, fmtVal(f, f.max))));
      autos.push(async (A) => { await A.slide(inp, f.auto); });
    } else if (f.type === 'chips') {
      need.add(f.k);
      const wrap = h('div', { class: 'chips', role: 'radiogroup', 'aria-label': label });
      f.options.forEach((o) => { const b = h('button', { type: 'button', class: 'chip', role: 'radio', 'aria-checked': 'false', onclick: () => { $$('.chip', wrap).forEach((x) => x.setAttribute('aria-checked', String(x === b))); set(f.k)(o); } }, o); wrap.append(b); });
      body = wrap;
      autos.push(async (A) => { await A.tap(wrap.children[f.auto || 0]); });
    } else if (f.type === 'account') {
      need.add(f.k);
      body = accountField(f, ctx, set(f.k));
      autos.push(async (A) => { await A.tap($('[data-v="' + f.auto + '"]', body)); });
    } else if (f.type === 'text') {
      if (!f.value) need.add(f.k);
      values[f.k] = f.value || '';
      const inp = h('input', { type: 'text', id, value: f.value || '', placeholder: f.placeholder || '', autocomplete: 'off' });
      inp.addEventListener('input', () => set(f.k)(inp.value.trim()));
      body = h('div', { class: 'txt' }, f.icon && ico(f.icon, 17), inp);
      if (f.auto) autos.push(async (A) => { await A.type(inp, f.auto); });
    } else if (f.type === 'photos') {
      need.add(f.k);
      const added = new Set();
      const wrap = h('div', { class: 'photos' });
      f.slots.forEach((s, i) => {
        const b = h('button', { type: 'button', class: 'photo', 'aria-label': 'Add a photo: ' + s, onclick: () => { b.classList.add('on', 'p' + i); b.setAttribute('aria-label', s + ' photo added'); added.add(i); set(f.k)(added.size); } },
          h('span', { class: 'ph-ic', html: icon('camera', 20) }), h('span', { class: 'ph-ok', html: check(12) }), h('small', null, s));
        wrap.append(b);
      });
      body = wrap;
      autos.push(async (A) => { for (const b of wrap.children) await A.tap(b, 380); });
    }
    return h('div', { class: 'fld', style: '--d:' + fi }, f.type === 'slider' || f.type === 'text' ? h('label', { class: 'fl', for: id }, label) : h('div', { class: 'fl' }, label), body);
  });
  btn = h('button', { type: 'submit', class: 'btn' }, step.submit);
  const formEl = h('form', { class: 'fm', autocomplete: 'off', onsubmit: (e) => { e.preventDefault(); if (btn.disabled) return; lock(el, btn, step.doneText || 'Sent to the ' + BRAND.agent); go(values); } }, fields, btn);
  const el = shell(step, ctx, 'formc', h('h3', null, ctx.val(step.title)), formEl);
  refresh();
  return { el, wait, auto: async (A) => { await A.pause(900); for (const a of autos) { await a(A); await A.pause(450); } await A.pause(350); await A.tap(btn); } };
}

/* ---------- connections and documents ---------- */
export function checklist(step, ctx) {
  let go;
  const wait = new Promise((r) => { go = r; });
  const rows = step.items.map((it) => h('li', { class: 'ck-r' }, h('span', { class: 'ck-ic', html: icon(it.icon, 19) }), h('div', { class: 'ck-n' }, h('b', null, it.title), h('small', null, it.sub)), h('span', { class: 'ck-s', 'aria-hidden': 'true' }, h('i', { class: 'spin' }), h('i', { class: 'ok', html: check(13) }))));
  const run = async () => {
    btn.disabled = true; btn.classList.add('busy');
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.add('run'); await ctx.pause(1150);
      rows[i].classList.replace('run', 'ok'); $('small', rows[i]).textContent = step.items[i].done; await ctx.pause(320);
    }
    lock(el, btn, step.doneText || 'All set'); go({});
  };
  const btn = h('button', { type: 'button', class: 'btn', onclick: () => { run().catch(() => {}); } }, h('span', { class: 'ico', html: icon('lock', 15, 2) }), step.cta);
  const el = shell(step, ctx, 'check', h('h3', null, ctx.val(step.title)), h('ul', { class: 'ck' }, rows), btn);
  return { el, wait, auto: async (A) => { await A.pause(1700); await A.tap(btn); } };
}

/* ---------- the agreement, in plain language, then the signature ---------- */
export function contract(step, ctx) {
  let go;
  const wait = new Promise((r) => { go = r; });
  const secs = ctx.val(step.sections).map((s, i) => h('li', { class: 'ct-s' }, h('span', { class: 'ct-n' }, i + 1), h('div', null, h('div', { class: 'ct-h' }, h('span', null, s.h), h('b', null, s.v)), h('p', null, s.p))));
  const agree = h('input', { type: 'checkbox', id: 'ag' + Math.random().toString(36).slice(2, 7) });
  const name = h('input', { type: 'text', class: 'sig-in', placeholder: 'Type your full name', 'aria-label': 'Type your full name to sign', autocomplete: 'off' });
  const line = h('div', { class: 'sig-line', 'aria-hidden': 'true' });
  const btn = h('button', { type: 'submit', class: 'btn', disabled: true }, h('span', { class: 'ico', html: icon('lock', 15, 2) }), step.cta);
  const refresh = () => { line.textContent = name.value; btn.disabled = !(agree.checked && name.value.trim().length > 2); };
  agree.addEventListener('change', refresh); name.addEventListener('input', refresh);
  const signBox = h('form', { class: 'sig', autocomplete: 'off', onsubmit: (e) => { e.preventDefault(); if (btn.disabled) return; lock(el, btn, 'Signed by ' + name.value.trim()); go({}); } },
    h('label', { class: 'agree' }, agree, h('span', { class: 'cbx', html: check(12) }), h('span', null, step.consent)),
    h('div', { class: 'sig-f' }, name, line), btn);
  const el = shell(step, ctx, 'contract', h('h3', null, ctx.val(step.title)), h('ol', { class: 'ct' }, secs), signBox);
  /* the assistant walks through it: sections arrive one at a time, then the signature opens */
  const walk = async () => {
    for (const s of secs) { s.classList.add('in'); await ctx.pause(reduced() ? 250 : 1000); }
    signBox.classList.add('in');
  };
  const walked = walk();
  walked.catch(() => {});
  return { el, wait, auto: async (A) => { await walked; await A.pause(900); if (!agree.checked) await A.tap(agree.parentNode); await A.pause(300); await A.type(name, step.signer); await A.pause(500); await A.tap(btn); } };
}

/* ---------- done: funds on the way, or coverage in effect ---------- */
const CONFETTI = ['#08c177', '#10a37f', '#f5b83d', '#4f8ef7', '#ef6b6b', '#0d0d0d'];
function burst(host) {
  if (reduced()) return;
  const box = h('div', { class: 'confetti', 'aria-hidden': 'true' });
  for (let i = 0; i < 36; i++) {
    const a = (-90 + (Math.random() - 0.5) * 150) * (Math.PI / 180), d = 70 + Math.random() * 130;
    box.append(h('i', { style: '--x:' + Math.cos(a) * d + 'px;--y:' + Math.sin(a) * d + 'px;--r:' + (Math.random() * 720 - 360) + 'deg;--c:' + CONFETTI[i % CONFETTI.length] + ';--t:' + (0.9 + Math.random() * 0.7) + 's;--w:' + (5 + Math.random() * 4) + 'px' }));
  }
  host.append(box);
  setTimeout(() => box.remove(), 2600);
}
export function celebrate(step, ctx) {
  const mark = h('div', { class: 'cb-mark' }, h('span', { html: '<svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M15.5 27l7 7 14.5-15.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' }));
  const body = [mark, h('h3', null, ctx.val(step.title)), h('p', { class: 'cb-sub' }, ctx.val(step.sub))];
  if (step.track) body.push(h('ol', { class: 'trk' }, step.track.map((t, i) => h('li', { class: i < step.at ? 'done' : i === step.at ? 'now' : '' }, h('i'), h('span', null, t)))), h('p', { class: 'cb-note' }, ctx.val(step.note)));
  if (step.idcard) {
    const c = ctx.val(step.idcard);
    body.push(h('div', { class: 'idc' }, h('div', { class: 'idc-t' }, h('span', { class: 'lg' }, h('img', { src: carrierIcon(c.icon), alt: '' })), h('b', null, c.carrier), h('span', { class: 'idc-st' }, c.status)),
      h('div', { class: 'idc-b' }, h('div', null, h('small', null, 'Insured'), h('span', null, c.name)), h('div', null, h('small', null, 'Vehicle'), h('span', null, c.vehicle)), h('div', null, h('small', null, 'Policy'), h('span', null, c.policy)))));
  }
  const el = shell({ ...step, context: 'Confirmed' }, ctx, 'celebrate' + (step.small ? ' small' : ''), body);
  requestAnimationFrame(() => setTimeout(() => burst(mark), 450));
  return { el };
}

/* ---------- the LendingTree app ---------- */
export function app(step) {
  const btn = h('button', { type: 'button', class: 'btn sm', onclick: () => { btn.replaceWith(doneLine(step.done)); } }, h('span', { class: 'ico', html: icon('phone', 15, 2) }), step.cta);
  const el = h('section', { class: 'ltc appc', 'aria-label': step.title },
    h('div', { class: 'ap-ic' }, h('img', { src: LEAF, alt: '', width: 30, height: 30 })),
    h('div', { class: 'ap-m' }, h('h3', null, step.title), h('p', null, step.sub),
      h('ul', null, step.points.map((p) => h('li', null, h('span', { html: check(12) }), p))),
      h('div', { class: 'ap-a' }, btn, h('span', null, step.alt))));
  return { el };
}

/* ---------- confirmations ---------- */
export function receipt(step, ctx) {
  const el = shell(step, ctx, 'receipt',
    h('div', { class: 'rc-t' }, h('span', { class: 'rc-ic', html: check(15) }), h('h3', null, ctx.val(step.title))),
    h('dl', { class: 'kv' }, ctx.val(step.rows).map(([k, v]) => h('div', null, h('dt', null, k), h('dd', null, v)))),
    step.next && h('div', { class: 'rc-n' }, h('b', null, step.nextTitle), h('ol', null, step.next.map((n) => h('li', null, n)))));
  return { el };
}

/* ---------- extra payments ---------- */
export function payoffMath(balance, rate, pay) {
  const r = rate / 1200, n = -Math.log(1 - (r * balance) / pay) / Math.log(1 + r);
  return { months: n, interest: n * pay - balance };
}
export function payoff(step, ctx) {
  let go, extra = step.value;
  const wait = new Promise((r) => { go = r; });
  const base = payoffMath(step.balance, step.rate, step.base);
  const out = { pay: h('b'), saved: h('b'), date: h('b'), sooner: h('small'), barNew: h('i'), yrsNew: h('span') };
  const dateOf = (months) => { const d = new Date(); d.setMonth(d.getMonth() + Math.round(months)); return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
  const yrs = (m) => (m / 12).toFixed(1) + ' years';
  const calc = () => { const now = payoffMath(step.balance, step.rate, step.base + extra); return { extra, saved: Math.round((base.interest - now.interest) / 10) * 10, payoffDate: dateOf(now.months), sooner: yrs(base.months - now.months), months: now.months }; };
  const paint = () => {
    const c = calc();
    out.pay.textContent = money(step.base + extra); out.saved.textContent = money(c.saved); out.date.textContent = c.payoffDate; out.sooner.textContent = c.sooner + ' sooner';
    out.barNew.style.setProperty('--w', (c.months / base.months) * 100 + '%'); out.yrsNew.textContent = yrs(c.months);
  };
  const wrap = h('div', { class: 'chips', role: 'radiogroup', 'aria-label': 'Extra each month' });
  step.options.forEach((o) => { const b = h('button', { type: 'button', class: 'chip', role: 'radio', 'aria-checked': String(o === extra), onclick: () => { extra = o; $$('.chip', wrap).forEach((x) => x.setAttribute('aria-checked', String(x === b))); paint(); } }, '+' + money(o)); wrap.append(b); });
  const btn = h('button', { type: 'button', class: 'btn', onclick: () => { lock(el, btn, 'Sent to the ' + BRAND.agent); go(calc()); } }, step.cta);
  const el = shell(step, ctx, 'payoff', h('h3', null, ctx.val(step.title)),
    h('div', { class: 'fld' }, h('div', { class: 'fl' }, 'Extra each month'), wrap),
    h('div', { class: 'tiles' }, h('div', null, h('small', null, 'New payment'), out.pay), h('div', { class: 'good' }, h('small', null, 'Interest saved'), out.saved), h('div', null, h('small', null, 'Paid off'), out.date, out.sooner)),
    h('div', { class: 'tl2', 'aria-hidden': 'true' },
      h('div', null, h('span', null, 'Today'), h('div', { class: 'bar' }, h('i', { style: '--w:100%' })), h('span', null, yrs(base.months))),
      h('div', { class: 'new' }, h('span', null, 'With extra'), h('div', { class: 'bar' }, out.barNew), out.yrsNew)),
    btn);
  paint();
  return { el, wait, auto: async (A) => { await A.pause(1400); const want = step.options.indexOf(step.auto); for (let i = 1; i <= want; i++) { await A.tap(wrap.children[i], 520); await A.pause(500); } await A.pause(1200); await A.tap(btn); } };
}
