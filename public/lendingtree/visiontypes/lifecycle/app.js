/* Visiontype A: the whole customer lifecycle on LendingTree's own website (wide) and app (phone).
   Copy and step definitions live in content.js; sample data in ../shared/data.js. The only network call is a question
   the visitor chooses to ask the guide (../shared/agent.js), which falls back to an offline answer when it cannot connect.
   URL params: ?path=loan|insurance  ?stage=shop|home|servicing  ?auto=0|1  ?embed=1  ?speed=N  ?mock=1 (test aid) */
import { PERSON, BRAND, BANKS, LOANS, POLICIES, AUTO_CURRENT, HELOC_ESTIMATE, LIFECYCLE, money, lenderIcon } from '../shared/data.js';
import { PROTO, SHELL, LANDING, PATHS, HOME, FLOWS, NOW, parseFund } from './content.js?v=7';
import { ask } from '../shared/agent.js';

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const fn = (v, ...a) => (typeof v === 'function' ? v(...a) : v);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const LEAF = '/lendingtree/img/lt-leaf.png';
const P_ = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  car: '<path d="M3 13l2-6h14l2 6v5h-3v-2H6v2H3z"/><circle cx="7.5" cy="13.2" r=".6"/><circle cx="16.5" cy="13.2" r=".6"/>',
  line: '<path d="M4 18l5-6 4 3 7-9"/><path d="M15 6h5v5"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  cross: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.500v7M8.5 12h7"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/><path d="M9 9.500v.5M15 9.500v.5"/>',
  paw: '<circle cx="7" cy="10" r="1.6"/><circle cx="10.5" cy="6.5" r="1.6"/><circle cx="14.5" cy="6.5" r="1.6"/><circle cx="17.5" cy="10" r="1.6"/><path d="M8.5 16.500c0-2 1.6-4 3.5-4s3.5 2 3.5 4a2.3 2.3 0 0 1-3.5 2 2.3 2.3 0 0 1-3.5-2z"/>',
  bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7"/>',
  right: '<path d="M9 6l6 6-6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', check: '<path d="M5 12.500l4.5 4.500L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 20h18"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18"/>', file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  eye: '<path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.500S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>', camera: '<path d="M4 8h3l1.5-2.500h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>', bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
};
const ic = (n, s = 20, w = 1.8) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P_[n] || ''}</svg>`;
const LOAN_ICON = { Mortgage: 'home', 'Auto loan': 'car', 'Home equity line': 'line' };
const POL_ICON = { Auto: 'car', Homeowners: 'home', Life: 'heart', Medical: 'cross', 'Vision and dental': 'smile', Pet: 'paw', Motorcycle: 'bike' };
const CARRIER_COLOR = { Allstate: '#0033a0', 'State Farm': '#e31937', Travelers: '#d71e28', 'Liberty Mutual': '#1f2a5c', Progressive: '#1e5aa8', GEICO: '#1f55a0', Nationwide: '#0a5bb5', Trupanion: '#2e4a8b' };
const mono = (name, cls = '') => (lenderIcon(name) ? `<span class="cm lender ${cls}"><img src="${lenderIcon(name)}" alt=""></span>` : monoText(name, cls));
const monoText = (name, cls = '') => `<span class="mono ${cls}" aria-hidden="true">${esc(name.replace(/^Employer plan \(|\)$/g, '').split(' ').filter((w) => /^[A-Z0-9]/.test(w)).map((w) => w[0]).slice(0, 2).join(''))}</span>`;
const cmark = (p) => (p.icon ? `<span class="cm"><img src="/lendingtree/img/carriers/${p.icon}-icon.png" alt=""></span>` : mono(p.carrier || p.lender || p.bank));
const policyNo = (p) => { let h = 7; for (const c of p.carrier + p.type) h = (h * 31 + c.charCodeAt(0)) % 1e9; const s = String(1e9 + h).slice(1); return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)}`; };
const monthYear = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
const perLabel = (p) => `${money(p.premium)} a ${p.per}`;

/* ---------- params and state ---------- */
const Q = new URLSearchParams(location.search);
const EMBED = Q.get('embed') === '1';
const SPEED = Math.max(0.25, Math.min(40, Number(Q.get('speed')) || 1));
const S = { path: Q.get('path') === 'insurance' ? 'insurance' : 'loan', auto: Q.get('auto') !== '0', view: 'guide', station: 0, done: new Set() };
const START_STAGE = ['home', 'servicing'].includes(Q.get('stage')) ? Q.get('stage') : 'shop';
function resetState() {
  Object.assign(S, {
    view: 'guide', station: 0, lock: false, done: new Set(), open: { loans: null, insurance: null, acct: null }, nudge: null, nudgeCb: null,
    /* flow: the tab the journey is waiting on. cp: where a rest would resume. sel/held/ctx: what the guide is told with a question. */
    flow: 'guide', cp: null, sel: null, held: false, resting: false, landing: false, ctx: NOW.landing,
    loans: LOANS.filter((l) => !l.isNew).map((l) => ({ ...l })), banks: BANKS.map((b) => ({ ...b })),
    policies: POLICIES.map((p) => ({ ...p, ...(p.id === 'auto' ? { deductible: AUTO_CURRENT.deductible, liability: AUTO_CURRENT.liability } : {}) })),
    watch: Object.fromEntries(POLICIES.map((p) => [p.id, !/Employer/.test(p.carrier)])), extra: {}, claims: {},
  });
}

/* ---------- engine: time, waiting for the viewer, and auto-play ---------- */
class Cancel extends Error {}
let run = 0, cur = null, autoGen = 0;
async function tick(ms, ok) {
  let left = ms / SPEED;
  while (left > 0) {
    const step = Math.min(left, 60);
    await new Promise((r) => setTimeout(r, step));
    if (!ok()) throw new Cancel();
    if (!document.hidden) left -= step; /* time stands still while the tab is hidden */
  }
}
const sleep = (ms) => { const my = run; return tick(ms, () => my === run); };
/* Wait for the viewer to act. `auto` is a list of steps auto-play performs the way a person would. */
/* opts.hint returns the control (or group) the viewer acts on next; opts.kind names the wait for the code that needs to know. */
function wait(register, auto, opts = {}) {
  const my = run;
  return new Promise((resolve) => {
    const tok = { auto, hint: opts.hint, frame: opts.frame, kind: opts.kind };
    tok.finish = (v) => { if (my !== run || cur !== tok) return; cur = null; autoGen++; resolve(v); };
    cur = tok; register(tok.finish); kick(); keyFocus(tok);
  });
}
const find = (t) => (typeof t === 'function' ? t() : typeof t === 'string' ? $$(t).filter((e) => !e.disabled && e.getClientRects().length).pop() : t) || null;
/* The next thing to act on in the step that is waiting, if any. */
function hintNode(tok = cur) {
  if (!tok) return null;
  if (tok.hint) { const n = tok.hint(); return n && n.getClientRects().length ? n : null; }
  for (const st of tok.auto || []) { const n = (st.tap || st.type) && find(st.tap || st.type); if (n && n.getClientRects().length) return n; }
  return null;
}
/* Someone driving by keyboard should not have to tab from the top each time a step replaces the control they just used. */
let keyed = false, lastTouch = 0;
function keyFocus(tok) {
  if (S.auto || !keyed) return;
  requestAnimationFrame(() => {
    if (cur !== tok) return;
    const a = document.activeElement;
    if (a && a !== document.body && a !== main && a.isConnected && a.getClientRects().length) return;
    let n = hintNode(tok);
    if (n && !n.matches('button, input, select')) n = n.querySelector('button:not(:disabled), input');
    if (n) n.focus({ preventScroll: true });
  });
}
function kick() {
  if (!S.auto || !cur || !cur.auto) return;
  const tok = cur, gen = ++autoGen, my = run;
  const live = () => my === run && gen === autoGen && S.auto && cur === tok;
  (async () => {
    try {
      const steps = tok.auto;
      for (let i = 0; i < steps.length; i++) {
        const st = steps[i];
        if (!live()) return;
        if (st.wait) { await tick(st.wait, live); continue; }
        const target = st.tap || st.type;
        let node = find(target), tries = 0;
        while (!node) {
          if (steps.slice(i + 1).some((n) => (n.tap || n.type) && find(n.tap || n.type))) break; /* resumed mid-way: move on */
          if (++tries > 150) break;
          await tick(100 * SPEED, live); node = find(target);
        }
        if (!node) continue;
        await tick(st.read == null ? 1500 : st.read, live);
        node = find(target) || node;
        const view = node.closest('.view'); if (view && view.hidden) go(view.id.slice(2));
        node.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' });
        if (st.type) {
          if (node.value === st.text) continue;
          node.value = ''; node.focus({ preventScroll: true });
          for (const ch of st.text) { await tick(55, live); node.value += ch; node.dispatchEvent(new Event('input', { bubbles: true })); }
          await tick(300, live);
        } else {
          node.classList.add('pressing'); await tick(420, live); node.classList.remove('pressing');
          if (!live()) return;
          node.click();
        }
      }
    } catch (e) { if (!(e instanceof Cancel)) throw e; }
  })();
}
function setAuto(v) { S.auto = v; autoGen++; $$('.pressing').forEach((n) => n.classList.remove('pressing')); paintDev(); if (v) { threadShow(false); kick(); } }

/* ---------- shell: views, tabs, lifecycle strip, toast ---------- */
const main = $('#main'), stream = $('#stream'), sheet = $('#sheet'), scrim = $('#scrim');
const TAB_ICON = { guide: 'chat', loans: 'bank', insurance: 'shield' };
function paintTabs() {
  const html = SHELL.tabs.map((t) => `<button type="button" data-tab="${t.id}" class="${S.view === t.id ? 'on' : ''}"${S.view === t.id ? ' aria-current="page"' : ''}>${ic(TAB_ICON[t.id], 22, S.view === t.id ? 2.1 : 1.8)}<span>${t.label}</span></button>`).join('');
  $('#nav').innerHTML = html; $('#tabbar').innerHTML = html;
  $('#hdTitle').textContent = SHELL.tabs.find((t) => t.id === S.view).label;
}
function go(view) {
  S.view = view;
  SHELL.tabs.forEach((t) => { $('#v-' + t.id).hidden = t.id !== view; });
  if (view === 'loans') renderLoans(); if (view === 'insurance') renderInsurance();
  paintTabs(); paintDock(); main.scrollTop = view === 'guide' ? main.scrollHeight : 0;
}
/* The journey itself moving to a tab. A viewer wandering to another tab uses go(), and is offered the way back. */
function flowGo(view) { S.flow = view; go(view); }
const now = (c) => { S.ctx = c; };
const setCp = (c) => { S.cp = c; };
function setStation(i, force) { if (S.lock && !force) return; if (i !== S.station) S.done.add(S.station); S.station = i; S.done.delete(i); paintLife(); }
function paintLife() {
  $('#life').innerHTML = `<div class="life-in"><ol>${LIFECYCLE.map((n, i) => `<li class="${i === S.station ? 'cur' : S.done.has(i) ? 'done' : ''}"><i></i><span>${n}</span></li>`).join('')}</ol>
    <p class="life-m"><b>${S.station + 1} of ${LIFECYCLE.length}</b><span>${LIFECYCLE[S.station]}</span></p></div>`;
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2600); }
let skipTimer = 0;
async function timeSkip(text) {
  const s = $('#skip'); s.innerHTML = `<span>${esc(text)}</span>`; s.hidden = false; requestAnimationFrame(() => s.classList.add('on'));
  await sleep(2200);
  s.classList.remove('on'); clearTimeout(skipTimer); skipTimer = setTimeout(() => { s.hidden = true; }, 400);
  await sleep(400);
}

/* ---------- the guide stream ---------- */
const smooth = () => (reduced() ? 'auto' : 'smooth');
function reveal(node, top) {
  requestAnimationFrame(() => {
    const r = node.getBoundingClientRect(), m = main.getBoundingClientRect();
    main.scrollTo({ top: top || r.height > m.height - 48 ? main.scrollTop + r.top - m.top - 20 : main.scrollHeight, behavior: smooth() });
  });
}
function add(node, top) { stream.append(node); reveal(node, top); return node; }
async function scene() { stream.classList.add('out'); await sleep(260); stream.innerHTML = ''; stream.classList.remove('out'); main.scrollTop = 0; }
async function say(text, sub) {
  const m = add(el(`<div class="msg g"><img class="g-av" src="${LEAF}" alt=""><div class="g-t"><span class="dots" aria-label="${SHELL.guideName} is typing"><i></i><i></i><i></i></span></div></div>`));
  await sleep(650);
  $('.g-t', m).innerHTML = `<p>${esc(text)}</p>${sub ? `<small>${esc(sub)}</small>` : ''}`;
  reveal(m);
  await sleep(Math.min(2000, 380 + text.length * 13));
  return m;
}
function me(text) { const m = el('<div class="msg me"><span></span></div>'); m.firstChild.textContent = text; return add(m); }
async function choose(options, autoIdx) {
  const box = add(el(`<div class="chips" role="group">${options.map((o, i) => `<button type="button" class="chip" data-i="${i}">${esc(o)}</button>`).join('')}</div>`));
  const i = await wait((fin) => box.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) fin(Number(b.dataset.i)); }), autoIdx == null ? null : [{ tap: () => box.children[autoIdx], read: 1500 }], { hint: () => box });
  box.remove(); me(options[i]); await sleep(350);
  return options[i];
}

/* landing: one question */
async function landing() {
  const L = LANDING;
  const hero = add(el(`<div class="hero">
    <p class="hero-hi">${esc(L.hello)}</p>
    <h1>${esc(L.q)}</h1>
    <p class="hero-sub">${esc(L.sub)}</p>
    <form class="ask" autocomplete="off"><input type="text" id="goal" maxlength="140" placeholder="${esc(L.placeholder)}" aria-label="${esc(L.q)}"><button type="submit" aria-label="Send" disabled>${ic('right', 20, 2.4)}</button></form>
    <div class="hero-chips">${L.choices.map((c, i) => `<button type="button" class="chip" data-i="${i}">${esc(c.label)}</button>`).join('')}</div>
  </div>`));
  const input = $('#goal', hero), send = $('button[type=submit]', hero);
  input.addEventListener('input', () => { send.disabled = input.value.trim().length < 3; });
  const goal = await wait((fin) => {
    hero.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      const c = L.choices[Number(b.dataset.i)];
      if (c.focus) { input.focus(); return; }
      fin({ path: c.path, text: c.text });
    });
    $('form', hero).addEventListener('submit', (e) => { e.preventDefault(); const text = input.value.trim(); if (text.length >= 3) fin({ path: L.insuranceWords.test(text + ' ') ? 'insurance' : 'loan', text }); });
  }, [{ type: () => input, text: L.typed[S.path], read: 2200 }, { tap: () => send, read: 700 }], { hint: () => $('form', hero) });
  await scene();
  return goal;
}

/* what is already on file */
async function onfile(O) {
  const card = add(el(`<div class="card onfile"><h3>${esc(O.title)}</h3><dl>${O.rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="btns"><button type="button" class="btn" data-a="ok">${esc(O.ok)}</button><button type="button" class="btn quiet" data-a="edit">${esc(O.edit)}</button></div></div>`), true);
  await wait((fin) => {
    $('[data-a=ok]', card).addEventListener('click', () => fin());
    $('[data-a=edit]', card).addEventListener('click', (e) => { $$('dl > div', card).forEach((r) => { const d = $('dd', r); d.innerHTML = `<input value="${esc(d.textContent)}" aria-label="${esc($('dt', r).textContent)}">`; }); e.currentTarget.remove(); const f = $('input', card); if (f) f.focus(); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) fin(); });
  }, [{ tap: () => $('[data-a=ok]', card), read: 3000 }]);
  $$('input', card).forEach((i) => { i.parentNode.textContent = i.value; });
  $('.btns', card).remove(); card.classList.add('settled');
  card.append(el(`<p class="settled-line">${ic('check', 16, 2.4)} Confirmed</p>`));
}
async function checking(K) {
  const c = add(el(`<div class="checking"><span class="spin" aria-hidden="true"></span><p>${esc(K.text)}</p><ul>${K.names.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`));
  const lis = $$('li', c);
  for (const li of lis) { await sleep(520); li.classList.add('on'); }
  await sleep(700);
  c.remove();
}

/* offers and quotes, with the comparison visual */
function loanChart(offers, T, rec) {
  const pts = offers.map((o) => ({ o, x: parseFund(o.fund), y: o.apr }));
  const xmax = Math.ceil((Math.max(...pts.map((p) => p.x)) + 5) / 7) * 7;
  const ymin = Math.floor((Math.min(...pts.map((p) => p.y)) - 0.15) * 4) / 4, ymax = Math.ceil((Math.max(...pts.map((p) => p.y)) + 0.1) * 4) / 4;
  const yt = []; for (let y = ymin; y <= ymax + 1e-9; y += 0.25) yt.push(y);
  const xt = []; for (let x = 0; x <= xmax; x += 7) xt.push(x);
  const px = (x) => (x / xmax) * 100, py = (y) => ((y - ymin) / (ymax - ymin)) * 100;
  return `<figure class="card chart"><figcaption><b>${esc(T.title)}</b><span>${esc(T.hint)}</span></figcaption>
    <div class="plot-wrap"><span class="ax-y">${esc(T.y)}</span><div class="plot">
      ${yt.map((y) => `<span class="gy" style="bottom:${py(y)}%"><em>${y.toFixed(2)}%</em></span>`).join('')}
      ${xt.map((x) => `<span class="gx" style="left:${px(x)}%"><em>${x}</em></span>`).join('')}
      ${pts.map((p) => `<button type="button" class="pt${p.o.id === rec ? ' rec' : ''}${px(p.x) > 55 ? ' flip' : ''}" data-offer="${p.o.id}" style="left:${px(p.x)}%;bottom:${py(p.y)}%" aria-label="${esc(p.o.lender)}: ${p.y.toFixed(2)}% APR, ${esc(p.o.fund.toLowerCase())}"><i></i><span><b>${esc(p.o.lender)}</b>${p.y.toFixed(2)}% · ${p.x} days</span></button>`).join('')}
    </div><span class="ax-x">${esc(T.x)}</span></div></figure>`;
}
function premiumChart(quotes, current, T) {
  const max = current.premium;
  const row = (q, now) => `<div class="bar-row${now ? ' now' : ''}" data-offer="${now ? '' : q.id}"><span class="bar-name">${cmark(q)}<span><b>${esc(q.carrier)}</b>${now ? `<small>${esc(T.today)}</small>` : ''}</span></span>
    <span class="bar-track"><i style="width:${(q.premium / max) * 100}%"></i></span>
    <span class="bar-val"><b>${money(q.premium)}</b>${now ? '<small>a year</small>' : `<small class="good">Saves ${money(max - q.premium)}</small>`}</span></div>`;
  return `<figure class="card chart bars"><figcaption><b>${esc(T.title)}</b></figcaption>${row(current, true)}${quotes.map((q) => row(q)).join('')}<p class="credit">${esc(BRAND.insuranceCredit)}</p></figure>`;
}
function offerCard(o, kind, D, rec, current) {
  const name = o.lender || o.carrier;
  const facts = kind === 'loan'
    ? `<div class="big"><b>${o.apr.toFixed(2)}%</b><span>APR</span></div><ul><li>${money(o.limit)} line</li><li>${esc(o.fund)}</li><li>${esc(o.fee)}</li></ul>`
    : `<div class="big"><b>${money(o.premium)}</b><span>a year</span></div><ul><li>${money(o.deductible)} deductible${current && o.deductible < current.deductible ? `, down from ${money(current.deductible)}` : ''}</li><li>${esc(o.liability)} liability</li><li>${money(Math.round(o.premium / 12))} a month</li></ul>`;
  return `<article class="offer${o.id === rec ? ' rec' : ''}" data-offer="${o.id}">
    <header>${o.icon ? cmark(o) : mono(name, 'lg')}<b>${esc(name)}</b></header><span class="tag">${esc(o.tag)}</span>
    ${facts}
    <div class="offer-more" hidden><dl>${D.offerDetails(o).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
    <footer><button type="button" class="btn${o.id === rec ? '' : ' ghost'}" data-a="pick" data-id="${o.id}" aria-label="${esc(D.choose)} ${esc(name)}">${esc(D.choose)}</button><button type="button" class="link" data-a="more" aria-expanded="false">${esc(D.details)}</button></footer>
  </article>`;
}
/* Returns the chosen offer. "Think about it" ends gracefully and can come back. */
async function offersScene(P, D) {
  const kind = S.path, list = D.offers, rec = D.recommend, recOffer = list.find((o) => o.id === rec);
  for (;;) {
    S.sel = null; now(NOW.offers(list.map((o) => o.lender || o.carrier), recOffer.lender || recOffer.carrier, P.think));
    await say(fn(D.offersIntro, list.length));
    setStation(3);
    add(el(kind === 'loan' ? loanChart(list, D.chart, rec) : premiumChart(list, D.current, D.chart)), true);
    await sleep(1500);
    const chartEl = stream.lastElementChild;
    const grid = add(el(`<div class="offers">${list.map((o) => offerCard(o, kind, { ...P, ...D, offerDetails: D.offerDetails || P.offerDetails }, rec, D.current)).join('')}</div>`));
    reveal(chartEl, true);
    grid.addEventListener('click', (e) => { const b = e.target.closest('[data-a=more]'); if (!b) return; const more = $('.offer-more', b.closest('.offer')); more.hidden = !more.hidden; b.setAttribute('aria-expanded', String(!more.hidden)); });
    const hi = (id, on) => $$(`[data-offer="${id}"]`, stream).forEach((n) => n.classList.toggle('hi', on));
    $$('.pt, .bar-row[data-offer]:not(.now)', stream).forEach((n) => { n.addEventListener('pointerenter', () => hi(n.dataset.offer, true)); n.addEventListener('pointerleave', () => hi(n.dataset.offer, false)); n.addEventListener('click', () => { const c = $(`.offer[data-offer="${n.dataset.offer}"]`, grid); if (c) c.scrollIntoView({ block: 'center', behavior: smooth() }); }); });
    /* The cards can be chosen the moment they appear. The guide's advice follows, and steps aside if they have already picked. */
    let r = null;
    const picked = new Promise((res) => grid.addEventListener('click', (e) => { const b = e.target.closest('[data-a=pick]'); if (b && !r) { r = b.dataset.id; res(); } }));
    await Promise.race([sleep(2200), picked]);
    if (!r) { setStation(4); await Promise.race([say(fn(D.advisor, newPolicy())), picked]); }
    if (!r) {
      const think = add(el(`<div class="think"><button type="button" class="link" data-a="think">${esc(P.think)}</button></div>`));
      const v = await wait((fin) => {
        picked.then(() => fin(r));
        $('button', think).addEventListener('click', () => fin('think'));
      }, [{ tap: () => $(`.offer[data-offer="${rec}"] [data-a=more]`, grid), read: 2600 }, { tap: () => $(`.offer[data-offer="${rec}"] [data-a=pick]`, grid), read: 2800 }], { hint: () => grid, kind: 'offers' });
      think.remove();
      r = r || v;
    }
    if (r !== 'think' && r !== 'rest') {
      setStation(4);
      $$('[data-a=pick]', grid).forEach((b) => { b.disabled = true; }); $(`.offer[data-offer="${r}"]`, grid).classList.add('chosen');
      return list.find((o) => o.id === r);
    }
    /* A: wants to think about it. 'rest' is the same ending reached by asking the guide, which has already replied. */
    S.resting = true; now(NOW.watch);
    if (r === 'think') { me(P.think); await say(P.watch.say); }
    await say(D.watchAsk || P.watch.ask);
    const w = await choose([P.watch.yes, P.watch.no], 0);
    const on = w === P.watch.yes, W = P.watch.card;
    const card = add(el(`<div class="card rest"><span class="rest-ic${on ? ' on' : ''}">${ic(on ? 'eye' : 'check', 22)}</span><div><b>${esc(on ? W.on : W.off)}</b><p>${esc(on ? W.onSub(recOffer) : W.offSub)}</p></div><button type="button" class="btn ghost">${esc(W.back)}</button></div>`));
    await wait((fin) => $('button', card).addEventListener('click', () => fin()), [{ tap: () => $('button', card), read: 3600 }]);
    S.resting = false;
    await scene();
  }
}

/* application: LendingTree gathers what the lender or carrier needs */
async function application(A, o, prog, save) {
  const steps = A.steps;
  const card = add(el(`<div class="card app"><header><h3>${esc(A.title(o))}</h3><span class="app-n"></span></header><div class="prog"><i></i></div>
    <ol>${steps.map((s) => `<li data-step="${s.id}"><span class="st-dot">${ic('check', 14, 3)}</span><div class="st-b"><b>${esc(s.title)}</b><div class="st-body"></div></div></li>`).join('')}</ol></div>`), true);
  const paint = (n) => { $('.app-n', card).textContent = `${n} of ${steps.length} done`; $('.prog i', card).style.width = `${(n / steps.length) * 100}%`; };
  /* steps finished before a rest are still finished */
  prog.sums.forEach((sum, i) => { const li = $(`[data-step="${steps[i].id}"]`, card); li.classList.add('done'); $('.st-body', li).innerHTML = `<p class="st-done">${esc(sum)}</p>`; });
  paint(prog.sums.length); await sleep(900);
  for (let i = prog.sums.length; i < steps.length; i++) {
    const s = steps[i], li = $(`[data-step="${s.id}"]`, card), body = $('.st-body', li);
    now(NOW.app(A.title(o), s, i + 1, steps.length));
    li.classList.add('active'); reveal(li);
    let summary = s.done;
    if (s.questions) {
      const answers = [];
      for (const q of s.questions) {
        body.innerHTML = `<p>${esc(q.q)}</p><div class="chips in">${q.options.map((op, k) => `<button type="button" class="chip" data-i="${k}">${esc(op)}</button>`).join('')}</div>`;
        reveal(li);
        const k = await wait((fin) => body.addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) fin(Number(b.dataset.i)); }), [{ tap: () => $$('.chip', body)[q.auto], read: 1700 }], { hint: () => $('.chips', body) });
        answers.push(q.options[k]);
      }
      summary = s.done(answers);
    } else {
      body.innerHTML = `<p>${esc(s.bodyFor ? s.bodyFor(o) : s.body)}</p>${s.cta ? `<button type="button" class="btn sm">${ic('lock', 15, 2)}${esc(s.cta)}</button>` : ''}`;
      reveal(li);
      if (s.cta) await wait((fin) => $('button', body).addEventListener('click', () => fin()), [{ tap: () => $('button', body), read: 2100 }]);
      else await sleep(900);
      body.innerHTML = `<p class="working"><span class="spin" aria-hidden="true"></span>${esc(s.working)}</p>`;
      await sleep(1500);
    }
    body.innerHTML = `<p class="st-done">${esc(summary)}</p>`;
    li.classList.remove('active'); li.classList.add('done'); paint(i + 1);
    prog.sums.push(summary); save(prog);
    await sleep(550);
  }
  await sleep(500);
}

/* signing, then the celebration */
async function signing(G, terms, o, onSigned) {
  const name = `${PERSON.first} ${PERSON.last}`;
  const card = add(el(`<div class="card sign"><h3>${esc(G.title)}</h3><p class="sign-sub">${esc(G.sub(o))}</p>
    <dl class="terms">${terms.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <button type="button" class="link" data-a="full" aria-expanded="false">${esc(G.fullLabel)}</button><p class="full" hidden>${esc(G.full)}</p>
    <label class="sig"><span>${esc(G.nameLabel)}</span><input type="text" id="sig" autocomplete="off" spellcheck="false" placeholder="${esc(name)}"></label>
    <button type="button" class="btn wide" data-a="sign" disabled>${esc(G.cta)}</button></div>`), true);
  const input = $('#sig', card), btn = $('[data-a=sign]', card);
  $('[data-a=full]', card).addEventListener('click', (e) => { const f = $('.full', card); f.hidden = !f.hidden; e.currentTarget.setAttribute('aria-expanded', String(!f.hidden)); });
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 3; });
  await wait((fin) => {
    btn.addEventListener('click', () => fin());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !btn.disabled) fin(); });
  }, [{ type: () => input, text: name, read: 4200 }, { tap: () => btn, read: 800 }], { hint: () => (btn.disabled ? input : btn), frame: () => btn });
  input.readOnly = true; onSigned();
  btn.disabled = true; btn.classList.add('busy'); btn.innerHTML = '<span class="spin" aria-hidden="true"></span>'; await sleep(1100);
}
function confetti() {
  if (reduced()) return '';
  const colors = ['#08c177', '#0b5cff', '#ffc94d', '#0d1b2a', '#9ad7ff'];
  let h = '';
  for (let i = 0; i < 34; i++) { const a = (i * 137.5) % 360; h += `<i style="--x:${Math.round(Math.cos(a) * (60 + (i * 37) % 150))}px;--y:${-40 - ((i * 53) % 130)}px;--r:${(i * 97) % 360}deg;--d:${(i % 7) * 40}ms;background:${colors[i % colors.length]}"></i>`; }
  return `<span class="confetti" aria-hidden="true">${h}</span>`;
}
async function celebrate(Dn, o, homeView) {
  const facts = Dn.facts ? fn(Dn.facts, o) : null;
  const card = add(el(`<div class="card party"><span class="seal">${confetti()}<svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 14-16"/></svg></span>
    <h2>${esc(Dn.title)}</h2><p>${esc(Dn.body(o))}</p>
    ${facts ? `<dl>${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    <button type="button" class="btn">${esc(Dn.cta)}</button></div>`), true);
  /* the button keeps working afterwards, for anyone who comes back to this card from another tab */
  let seen = false;
  await wait((fin) => $('button', card).addEventListener('click', () => { if (seen) go(homeView); else { seen = true; fin(); } }), [{ tap: () => $('button', card), read: 4200 }]);
}

/* ---------- the shopping journey ---------- */
function closeDeal(path, o) {
  if (path === 'loan') {
    const base = LOANS.find((l) => l.isNew);
    S.loans = S.loans.filter((l) => l.id !== base.id).concat({ ...base, lender: o.lender, rate: o.apr, limit: o.limit, payment: Math.round(base.payment * o.apr / 7.9), isNew: true });
    S.open.loans = null;
  } else {
    const fresh = { ...POLICIES.find((p) => p.id === 'auto'), carrier: o.carrier, icon: o.icon, premium: o.premium, deductible: o.deductible, liability: o.liability, renews: new Date(Date.now() + 371 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), isNew: true };
    S.policies = S.policies.map((p) => (p.id === 'auto' ? fresh : p)); S.watch.auto = true; S.open.insurance = null;
  }
}
const newPolicy = () => S.policies.find((p) => p.id === 'auto');
/* landing, or the opening after someone switched here by asking */
async function intro(switched) {
  flowGo('guide'); stream.innerHTML = ''; setStation(0);
  let lines = PATHS[S.path].switched;
  if (!switched) {
    S.landing = true; paintDock(); now(NOW.landing);
    const goal = await landing();
    S.landing = false; paintDock();
    if (goal.path !== S.path) { S.path = goal.path; paintDev(); }
    add(el(`<div class="msg g"><img class="g-av" src="${LEAF}" alt=""><div class="g-t"><p>${esc(LANDING.q)}</p></div></div>`));
    me(goal.text); await sleep(500);
    lines = PATHS[S.path].opening;
  }
  setCp({ at: 'qualify', i: 0 }); now(NOW.opening);
  for (const line of lines) await say(line);
}
async function qualify(P, from, back) {
  if (back) await say(SHELL.rest.back);
  setStation(1);
  for (let i = from; i < P.qualify.length; i++) {
    const q = P.qualify[i];
    setCp({ at: 'qualify', i }); now(NOW.qualify(q, i + 1, P.qualify.length));
    await say(q.q, q.sub); await choose(q.options, q.auto);
  }
  setCp({ at: 'qualify', i: P.qualify.length }); now(NOW.onfile(P.onfile));
  await say(P.onfile.intro);
  setStation(2);
  await onfile(P.onfile);
  now(NOW.checking);
  await checking(P.checking);
  await scene();
}
/* application, signature, celebration. base is the checkpoint a rest returns to; prog is how far a rested application got. */
async function finish(P, o, A, terms, Dn, quiet, base, prog, onSigned) {
  const save = (p) => setCp({ ...base, o, prog: p });
  S.sel = o.id; now(NOW.picked(o.lender || o.carrier));
  if (prog) await say(SHELL.rest.back);
  else {
    prog = { sums: [] }; save(prog);
    if (!quiet) me(`${P.choose} ${o.lender || o.carrier}`);
    await say(P.picked(o));
    await scene();
  }
  if (!prog.sign) {
    setStation(2);
    await application(A, o, prog, save);
    await say(A.finished(o));
    prog.sign = true; save(prog);
    await scene();
  }
  setStation(5); now(NOW.sign(P.sign.sub(o), P.sign.cta));
  await signing(P.sign, terms, o, () => { setCp({ at: 'held' }); S.held = true; onSigned(); });
  await scene();
  now(NOW.done(Dn));
  await celebrate(Dn, o, P.homeView);
}

/* ---------- home bases ---------- */
function nudgeHtml() {
  const n = S.nudge; if (!n) return '';
  return `<div class="nudge"><img src="${LEAF}" alt=""><div><p>${esc(n.text)}</p>${n.yes ? `<div class="btns"><button type="button" class="btn sm" data-a="nudge" data-v="yes">${esc(n.yes)}</button>${n.alt ? `<button type="button" class="btn sm ghost" data-a="nudge" data-v="alt">${esc(n.alt)}</button>` : ''}${n.no ? `<button type="button" class="btn sm quiet" data-a="nudge" data-v="no">${esc(n.no)}</button>` : ''}</div>` : ''}</div></div>`;
}
const chev = `<span class="chev">${ic('down', 18, 2)}</span>`;
function renderLoans() {
  const H = HOME.loans, v = $('#v-loans'), keep = main.scrollTop;
  const total = S.loans.reduce((a, l) => a + l.balance, 0), monthly = S.loans.reduce((a, l) => a + l.payment, 0);
  const row = (l) => {
    const open = S.open.loans === l.id, isLine = l.limit != null;
    const pct = isLine ? (l.balance / l.limit) * 100 : ((l.original - l.balance) / l.original) * 100;
    const extra = S.extra[l.id];
    return `<div class="row${open ? ' open' : ''}${l.isNew ? ' is-new' : ''}" data-row="${l.id}">
      <button type="button" class="row-main" data-act="loan" data-id="${l.id}" aria-expanded="${open}">
        <span class="ib">${ic(LOAN_ICON[l.type] || 'file', 21)}</span>
        <span class="mid"><b>${esc(l.type)}</b><span>${esc(l.lender)}${l.isNew ? `<i class="tag new">${H.newTag}</i>` : ''}</span></span>
        <span class="end"><b>${money(l.balance)}</b><span>${l.payment ? `${money(l.payment + (extra || 0))} due ${esc(l.due)}` : `Nothing due yet`}</span></span>${chev}
      </button>
      ${open ? `<div class="row-more">
        <div class="meter"><i style="width:${Math.max(2, pct)}%"></i></div>
        <p class="meter-l">${isLine ? `${money(l.balance)} used of your ${money(l.limit)} line` : `${money(l.original - l.balance)} paid of ${money(l.original)}`}</p>
        <dl class="facts"><div><dt>Rate</dt><dd>${l.rate}%</dd></div><div><dt>Payment</dt><dd>${l.payment ? money(l.payment) : 'None yet'}${extra ? ` + ${money(extra)}` : ''}</dd></div><div><dt>Next due</dt><dd>${esc(l.due.replace(/^the /, ''))}</dd></div></dl>
        <div class="acts"><button type="button" class="btn sm" data-act="pay" data-id="${l.id}">${H.actions.pay}</button><button type="button" class="btn sm ghost" data-act="extra" data-id="${l.id}">${H.actions.extra}</button><button type="button" class="btn sm ghost" data-act="loan-details" data-id="${l.id}">${H.actions.details}</button></div>
      </div>` : ''}</div>`;
  };
  const acct = (b) => {
    const open = S.open.acct === b.id;
    return `<div class="row slim${open ? ' open' : ''}${b.isNew ? ' is-new' : ''}" data-row="${b.id}">
      <button type="button" class="row-main" data-act="acct" data-id="${b.id}" aria-expanded="${open}">${mono(b.bank)}<span class="mid"><b>${esc(b.bank)}</b><span>${esc(b.name)} ••${b.last4}</span></span><span class="end"><b>${money(b.balance, 2)}</b></span></button>
      ${open ? `<div class="row-more"><div class="acts"><button type="button" class="btn sm ghost" data-act="transfer" data-id="${b.id}">${H.acctActions.transfer}</button><button type="button" class="btn sm ghost" data-act="activity" data-id="${b.id}">${H.acctActions.activity}</button></div></div>` : ''}</div>`;
  };
  v.innerHTML = `<div class="home">${nudgeHtml()}
    <div class="home-hd"><h2>${H.title}</h2><p>${H.sub(S.loans.length, total, monthly)}</p></div>
    <div class="cols"><div class="col-a"><div class="list">${S.loans.map(row).join('')}</div></div>
      <div class="col-b"><div class="sec-hd"><h3>${H.accountsTitle}</h3><span>${H.accountsSub(S.banks.reduce((a, b) => a + b.balance, 0))}</span></div>
        <div class="list">${S.banks.map(acct).join('')}<button type="button" class="row-add" data-act="connect">${ic('plus', 18, 2.2)}${H.connect}</button></div>
        <button type="button" class="btn ghost wide move" data-act="move">${ic('swap', 18, 2)}${H.move}</button></div></div></div>`;
  main.scrollTop = keep;
}
function renderInsurance() {
  const H = HOME.insurance, v = $('#v-insurance'), keep = main.scrollTop;
  const watching = S.policies.filter((p) => S.watch[p.id]).length;
  const row = (p) => {
    const open = S.open.insurance === p.id, employer = /Employer/.test(p.carrier), claim = S.claims[p.id];
    return `<div class="row${open ? ' open' : ''}${p.isNew ? ' is-new' : ''}" data-row="${p.id}">
      <button type="button" class="row-main" data-act="policy" data-id="${p.id}" aria-expanded="${open}">
        ${p.icon ? cmark(p) : `<span class="ib">${ic(POL_ICON[p.type] || 'shield', 21)}</span>`}
        <span class="mid"><b>${esc(p.type)}</b><span>${esc(p.carrier.replace(/^Employer plan \((.*)\)$/, '$1, through work'))}${p.isNew ? `<i class="tag new">${H.newTag}</i>` : ''}</span></span>
        <span class="end"><b>${money(p.premium)}<small> / ${p.per === 'year' ? 'yr' : 'mo'}</small></b><span>${/^[A-Z][a-z]{2} \d/.test(p.renews) ? `Renews ${esc(p.renews)}` : esc(p.renews)}</span></span>${chev}
      </button>
      ${open ? `<div class="row-more">
        ${claim ? `<p class="claim-line">${ic('file', 16, 2)}Claim ${esc(claim)} is open. An adjuster will call you.</p>` : ''}
        <dl class="facts"><div><dt>Covers</dt><dd>${esc(p.covers)}</dd></div><div><dt>Policy number</dt><dd>${policyNo(p)}</dd></div></dl>
        <div class="acts"><button type="button" class="btn sm" data-act="idcard" data-id="${p.id}">${H.actions.card}</button><button type="button" class="btn sm ghost" data-act="coverage" data-id="${p.id}">${H.actions.coverage}</button>${employer ? '' : `<button type="button" class="btn sm ghost" data-act="claim" data-id="${p.id}">${H.actions.claim}</button><button type="button" class="btn sm ghost" data-act="reshop" data-id="${p.id}">${H.actions.reshop}</button>`}</div>
        ${employer ? `<p class="fine">${H.employer}</p>` : `<label class="sw-row"><span><b>${H.watch}</b><small>${H.watchOn}</small></span><span class="sw"><input type="checkbox" data-act="watch" data-id="${p.id}"${S.watch[p.id] ? ' checked' : ''}><i></i></span></label>`}
      </div>` : ''}</div>`;
  };
  const dated = S.policies.filter((p) => /^[A-Z][a-z]{2} \d/.test(p.renews) && !/Employer/.test(p.carrier)).map((p) => { const d = new Date(/\d{4}/.test(p.renews) ? p.renews : `${p.renews}, ${new Date().getFullYear()}`); if (d < Date.now()) d.setFullYear(d.getFullYear() + 1); return { p, d }; }).sort((a, b) => a.d - b.d).slice(0, 3);
  v.innerHTML = `<div class="home">${nudgeHtml()}
    <div class="home-hd"><h2>${H.title}</h2><p>${H.sub(S.policies.length, watching)}</p></div>
    <div class="cols"><div class="col-a"><div class="list">${S.policies.map(row).join('')}<button type="button" class="row-add" data-act="add-policy">${ic('plus', 18, 2.2)}${H.add}</button></div></div>
      <div class="col-b"><div class="sec-hd"><h3>${H.nextTitle}</h3></div>
        <div class="list soft">${dated.map(({ p }) => `<div class="next"><span class="ib sm">${ic(POL_ICON[p.type] || 'shield', 17)}</span><span><b>${esc(p.type)} renews ${esc(p.renews)}</b><small>${S.watch[p.id] ? 'Watching for a better rate' : 'Not watching'}</small></span></div>`).join('')}</div>
        <p class="credit">${esc(BRAND.insuranceCredit)}</p></div></div></div>`;
  main.scrollTop = keep;
}
const rerender = () => { if (S.view === 'loans') renderLoans(); if (S.view === 'insurance') renderInsurance(); };

/* ---------- sheets (bottom sheet on the app, dialog on the website) ---------- */
let sheetOnClose = null, sheetFrom = null;
function openSheet(html, onClose) {
  if (!sheet.hidden) closeSheet();
  sheetFrom = document.activeElement; sheetOnClose = onClose || null;
  sheet.innerHTML = `<div class="grab" aria-hidden="true"></div>${EMBED ? '' : `<button type="button" class="sask" data-act="ask" aria-label="${esc(SHELL.ask.label)}"><img src="${LEAF}" alt="">${esc(SHELL.ask.short)}</button>`}<button type="button" class="sx" data-act="close-sheet" aria-label="Close">${ic('x', 18, 2.2)}</button><div class="sheet-in">${html}</div>`;
  sheet.hidden = false; scrim.hidden = false; sheet.scrollTop = 0; fitDock();
  requestAnimationFrame(() => { sheet.classList.add('on'); scrim.classList.add('on'); });
  if (!S.auto) sheet.querySelector('.sx').focus({ preventScroll: true });
  return $('.sheet-in', sheet);
}
function setSheet(html) { const b = $('.sheet-in', sheet); b.innerHTML = html; sheet.scrollTop = 0; fitDock(); return b; }
function closeSheet(silent) {
  if (sheet.hidden) return;
  sheet.hidden = true; scrim.hidden = true; sheet.classList.remove('on'); scrim.classList.remove('on');
  const cb = sheetOnClose; sheetOnClose = null;
  if (sheetFrom && sheetFrom.isConnected && !S.auto) sheetFrom.focus({ preventScroll: true });
  if (cb && !silent) cb();
}
const okIcon = `<span class="ok">${ic('check', 26, 2.6)}</span>`;
const success = (title, body, close) => `<div class="flow-done">${okIcon}<h3>${esc(title)}</h3><p>${esc(body)}</p><button type="button" class="btn wide" data-a="flow-done">${esc(close)}</button></div>`;
const acctOpt = (b, sel) => `<option value="${b.id}"${b.id === sel ? ' selected' : ''}>${esc(b.bank)} ••${b.last4} · ${money(b.balance, 2)}</option>`;
const bankOf = (id) => S.banks.find((b) => b.id === id);
/* Each flow is self-contained and calls done(result) once, whether it finishes or is closed. */
function flowShell(done) { let finished = false, result = false; return { end: (r) => { result = r; }, close: () => { if (finished) return; finished = true; done(result); }, onDone: (body) => { const b = $('[data-a=flow-done]', body); if (b) b.addEventListener('click', () => closeSheet()); } }; }

function transferFlow({ from, to, amount, why }, done = () => {}) {
  const F = FLOWS.transfer, sh = flowShell(done);
  let amt = amount || 500;
  const body = openSheet(`<h3>${F.title}</h3>
    <label class="fld"><span>${F.from}</span><select id="tf_from">${S.banks.map((b) => acctOpt(b, from)).join('')}</select></label>
    <label class="fld"><span>${F.to}</span><select id="tf_to">${S.banks.map((b) => acctOpt(b, to)).join('')}</select></label>
    <label class="fld"><span>${F.amount}</span><span class="amt"><i>$</i><input id="tf_amt" inputmode="decimal" value="${amt.toLocaleString('en-US')}"></span></label>
    <div class="chips in">${F.chips.map((c) => `<button type="button" class="chip${c === amt ? ' on' : ''}" data-c="${c}">${money(c)}</button>`).join('')}</div>
    <button type="button" class="btn wide" data-a="flow-go"></button>`, sh.close);
  const go_ = $('[data-a=flow-go]', body), inp = $('#tf_amt', body);
  const paint = () => { amt = Number(inp.value.replace(/[^\d.]/g, '')) || 0; const f = bankOf($('#tf_from', body).value), t = bankOf($('#tf_to', body).value); go_.textContent = F.cta(amt); go_.disabled = !(amt > 0 && f.id !== t.id && amt <= f.balance); $$('.chip', body).forEach((c) => c.classList.toggle('on', Number(c.dataset.c) === amt)); };
  body.addEventListener('input', paint); body.addEventListener('change', paint);
  body.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { inp.value = Number(c.dataset.c).toLocaleString('en-US'); paint(); } });
  go_.addEventListener('click', () => {
    const f = bankOf($('#tf_from', body).value), t = bankOf($('#tf_to', body).value);
    f.balance -= amt; t.balance += amt; sh.end(true); rerender();
    sh.onDone(setSheet(success(F.doneTitle, F.done(t, why), F.close)));
  });
  paint();
}
function payoffMath(balance, rate, pmt) { const r = rate / 1200; let b = balance, m = 0, int = 0; while (b > 0.005 && m < 720) { const i = b * r; int += i; b = b + i - pmt; m++; } return { months: m, interest: int }; }
function payoffFlow({ loan, extra }, done = () => {}) {
  const F = FLOWS.payoff, sh = flowShell(done), l = S.loans.find((x) => x.id === loan);
  let ex = extra || 100;
  const base = payoffMath(l.balance, l.rate, l.payment);
  const body = openSheet(`<h3>${F.title}</h3><p class="sub">${esc(F.sub(l))}</p>
    <p class="lbl">${F.pick}</p><div class="chips in">${F.chips.map((c) => `<button type="button" class="chip" data-c="${c}">${money(c)}</button>`).join('')}</div>
    <div class="payoff" id="po"></div><button type="button" class="btn wide" data-a="flow-go"></button>`, sh.close);
  const paint = () => {
    const n = payoffMath(l.balance, l.rate, l.payment + ex), saved = Math.round(base.interest - n.interest);
    $$('.chip', body).forEach((c) => c.classList.toggle('on', Number(c.dataset.c) === ex));
    $('#po', body).innerHTML = `<div class="po-bar"><span>${F.now}</span><span class="tr"><i style="width:100%"></i></span><b>${monthYear(base.months)}</b></div>
      <div class="po-bar new"><span>${F.next}</span><span class="tr"><i style="width:${(n.months / base.months) * 100}%"></i></span><b>${monthYear(n.months)}</b></div>
      <dl class="po-stats"><div><dt>${F.saved}</dt><dd>${money(saved)}</dd></div><div><dt>Paid off</dt><dd>${F.sooner(base.months - n.months)}</dd></div></dl>`;
    $('[data-a=flow-go]', body).textContent = F.cta(ex);
    return n;
  };
  body.addEventListener('click', (e) => { const c = e.target.closest('.chip'); if (c) { ex = Number(c.dataset.c); paint(); } });
  $('[data-a=flow-go]', body).addEventListener('click', () => { const n = paint(); S.extra[l.id] = ex; sh.end(true); rerender(); sh.onDone(setSheet(success(F.doneTitle, F.done(ex, monthYear(n.months)), F.close))); });
  paint();
}
function payFlow(loanId) {
  const F = FLOWS.pay, sh = flowShell(() => {});
  const opts = S.loans.filter((l) => l.payment).map((l) => `<option value="${l.id}"${l.id === loanId ? ' selected' : ''}>${esc(l.lender)} ${esc(l.type.toLowerCase())} · ${money(l.payment)}</option>`).join('');
  const body = openSheet(`<h3>${F.title}</h3><label class="fld"><span>Loan</span><select id="pf_loan">${opts}</select></label><label class="fld"><span>${F.from}</span><select id="pf_from">${S.banks.map((b) => acctOpt(b, 'chase')).join('')}</select></label><button type="button" class="btn wide" data-a="flow-go"></button>`, sh.close);
  const cur_ = () => S.loans.find((l) => l.id === $('#pf_loan', body).value);
  const paint = () => { $('[data-a=flow-go]', body).textContent = F.cta(cur_().payment); };
  body.addEventListener('change', paint); paint();
  $('[data-a=flow-go]', body).addEventListener('click', () => { const l = cur_(), b = bankOf($('#pf_from', body).value); b.balance -= l.payment; l.balance = Math.max(0, l.balance - Math.round(l.payment * 0.4)); rerender(); sh.onDone(setSheet(success(F.doneTitle, F.done(l), F.close))); });
}
function billFlow() {
  const F = FLOWS.bill, H = HOME.loans, sh = flowShell(() => {});
  const body = openSheet(`<h3>${F.title}</h3><label class="fld"><span>Bill</span><select id="bf_bill">${H.bills.map(([n, a], i) => `<option value="${i}">${esc(n)} · ${money(a, 2)}</option>`).join('')}</select></label><label class="fld"><span>Pay from</span><select id="bf_from">${S.banks.map((b) => acctOpt(b, 'chase')).join('')}</select></label><button type="button" class="btn wide" data-a="flow-go"></button>`, sh.close);
  const bill = () => H.bills[Number($('#bf_bill', body).value)];
  const paint = () => { $('[data-a=flow-go]', body).textContent = F.cta(bill()[1]); };
  body.addEventListener('change', paint); paint();
  $('[data-a=flow-go]', body).addEventListener('click', () => { const [n, a] = bill(); bankOf($('#bf_from', body).value).balance -= a; rerender(); sh.onDone(setSheet(success(F.doneTitle, `${n} is paid. ${money(a, 2)} will leave your account today.`, F.close))); });
}
function moveSheet() {
  const H = HOME.loans, icons = { pay: 'card', transfer: 'swap', bill: 'bolt' };
  const body = openSheet(`<h3>${H.move}</h3><div class="opts">${H.moveOptions.map((o) => `<button type="button" class="opt" data-o="${o.id}"><span class="ib">${ic(icons[o.id], 20)}</span><span><b>${o.label}</b><small>${o.sub}</small></span>${ic('right', 18, 2)}</button>`).join('')}</div>`);
  body.addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (!b) return; ({ pay: () => payFlow(S.loans[0].id), transfer: () => transferFlow({ from: 'ally', to: 'chase' }), bill: billFlow })[b.dataset.o](); });
}
function connectSheet() {
  const H = HOME.loans, left = H.banksToConnect.filter((b) => !S.banks.some((x) => x.bank === b.bank));
  const body = openSheet(`<h3>${H.connect}</h3><p class="sub">${left.length ? H.connectSub : H.connectNone}</p><div class="opts">${left.map((b, i) => `<button type="button" class="opt" data-i="${i}">${mono(b.bank)}<span><b>${esc(b.bank)}</b></span>${ic('right', 18, 2)}</button>`).join('')}</div>`);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('.opt'); if (!b) return; const bank = left[Number(b.dataset.i)];
    setSheet(`<div class="flow-done"><span class="spin big" aria-hidden="true"></span><h3>Connecting to ${esc(bank.bank)}</h3><p>This takes a few seconds.</p></div>`);
    setTimeout(() => { if (sheet.hidden) return; S.banks.push({ ...bank, id: bank.bank.toLowerCase().replace(/\W/g, ''), isNew: true }); rerender(); $('[data-a=flow-done]', setSheet(success(`${bank.bank} is connected`, `${bank.name} ••${bank.last4} now shows with your other accounts.`, 'Done'))).addEventListener('click', () => closeSheet()); }, 1400 / SPEED);
  });
}
const factsSheet = (title, sub, rows, extra = '') => openSheet(`<h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p><dl class="lines">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${extra}`);
function idCardSheet(p) {
  const c = CARRIER_COLOR[p.carrier] || '#24364d';
  openSheet(`<h3>ID card</h3><p class="sub">Show this as proof of insurance.</p>
    <div class="idc" style="background:linear-gradient(135deg,${c},color-mix(in srgb,${c} 60%,#000))"><div class="idc-h"><b>${esc(p.carrier.replace(/^Employer plan \(|\)$/g, ''))}</b><span>${esc(p.type)}</span></div>
      <dl><div><dt>Insured</dt><dd>${PERSON.first} ${PERSON.last}</dd></div><div><dt>Policy number</dt><dd>${policyNo(p)}</dd></div><div class="w2"><dt>Covers</dt><dd>${esc(p.covers)}</dd></div></dl></div>
    <button type="button" class="btn wide" data-a="wallet">Add to wallet</button>`);
  $('[data-a=wallet]', sheet).addEventListener('click', () => { closeSheet(); toast('Card added to your wallet.'); });
}
function reshopSheet(p) {
  const rows = HOME.insurance.reshopCarriers.filter(([n]) => n !== p.carrier).map(([n, icon, f]) => ({ carrier: n, icon, premium: Math.round(p.premium * f) }));
  const body = openSheet(`<h3>Re-shop your ${esc(p.type.toLowerCase())} policy</h3><p class="sub">You pay ${perLabel(p)} with ${esc(p.carrier)}. Your details are already filled in.</p>
    <div class="opts">${rows.map((r, i) => `<div class="opt static">${cmark(r)}<span><b>${esc(r.carrier)}</b><small>${money(r.premium)} a ${p.per} · saves ${money(p.premium - r.premium)}</small></span><button type="button" class="btn sm${i ? ' ghost' : ''}" data-c="${esc(r.carrier)}">Get quote</button></div>`).join('')}</div><p class="credit">${esc(BRAND.insuranceCredit)}</p>`);
  body.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) { closeSheet(); toast(`Quote started with ${b.dataset.c}. Your details are on their way.`); } });
}
function addPolicySheet() {
  const A = HOME.insurance.addWays, q = A.quoted.filter((x) => !S.policies.some((p) => p.type === x.type));
  const addIt = (p) => { const id = 'p' + S.policies.length; S.policies.push({ ...p, id, isNew: true }); S.watch[id] = true; closeSheet(); rerender(); toast(`${p.carrier} ${p.type.toLowerCase()} added. I will watch its renewal.`); };
  const body = openSheet(`<h3>${A.title}</h3><p class="sub">${A.sub}</p>
    ${q.length ? `<p class="lbl">From a quote you already have</p><div class="opts">${q.map((x, i) => `<div class="opt static">${cmark(x)}<span><b>${esc(x.type)}</b><small>${esc(x.carrier)} · ${perLabel(x)}</small></span><button type="button" class="btn sm" data-q="${i}">Add</button></div>`).join('')}</div>` : ''}
    <p class="lbl">Forward a policy email</p><div class="addr"><span>${A.email}</span><button type="button" class="link" data-a="copy">Copy</button></div>
    <p class="lbl">Upload a document</p><button type="button" class="btn ghost wide" data-a="upload">${ic('upload', 18)}Choose a PDF or photo</button>`);
  body.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.q) addIt(q[Number(b.dataset.q)]);
    else if (b.dataset.a === 'copy') toast('Address copied.');
    else if (b.dataset.a === 'upload') { if (S.policies.some((p) => p.type === A.uploaded.type)) toast(A.uploadedAlready); else addIt(A.uploaded); }
  });
}
function claimFlow(p, done = () => {}) {
  const F = FLOWS.claim, sh = flowShell(done), data = { photos: new Set() };
  const head = (i) => `<h3>${F.title}</h3><p class="sub">${esc(p.carrier)} ${esc(p.type.toLowerCase())} · ${esc(p.covers)}</p><ol class="steps">${F.steps.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'cur' : ''}"><i></i><span>${s}</span></li>`).join('')}</ol>`;
  const body = openSheet('', sh.close);
  const step = (i) => {
    if (i === 0) {
      setSheet(`${head(0)}<p class="q">${F.what.q}</p><div class="opts">${F.what.options.map((o, k) => `<button type="button" class="opt" data-a="claim-opt" data-i="${k}"><span><b>${o}</b></span>${ic('right', 18, 2)}</button>`).join('')}</div>`);
      $$('[data-a=claim-opt]', body).forEach((b) => b.addEventListener('click', () => { data.what = F.what.options[Number(b.dataset.i)]; step(1); }));
    } else if (i === 1) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      setSheet(`${head(1)}<p class="q">${F.when.q}</p><div class="two"><label class="fld"><span>${F.when.date}</span><input type="date" value="${y}"></label><label class="fld"><span>${F.when.time}</span><input type="text" value="${F.when.timeVal}"></label></div>
        <label class="fld"><span>${F.when.place}</span><input type="text" value="${esc(F.when.placeVal)}"></label><button type="button" class="btn wide" data-a="claim-next">${F.when.next}</button>`);
      $('[data-a=claim-next]', body).addEventListener('click', () => step(2));
    } else if (i === 2) {
      setSheet(`${head(2)}<p class="q">${F.photos.q}</p><p class="sub">${F.photos.sub}</p><div class="tiles">${F.photos.tiles.map((t, k) => `<button type="button" class="tile" data-a="claim-tile" data-i="${k}" aria-pressed="false"><span class="t-ic">${ic('camera', 22)}</span><span class="t-ok">${ic('check', 20, 2.6)}</span><span>${t}</span></button>`).join('')}</div><button type="button" class="btn wide" data-a="claim-next">${F.photos.next}</button>`);
      $$('.tile', body).forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); }));
      $('[data-a=claim-next]', body).addEventListener('click', () => step(3));
    } else if (i === 3) {
      setSheet(`${head(3)}<p class="q">${F.other.q}</p><p class="sub">${F.other.sub}</p>${F.other.fields.map(([id, label]) => `<label class="fld"><span>${label}</span><input type="text" id="cf_${id}" autocomplete="off"></label>`).join('')}
        <button type="button" class="btn wide" data-a="claim-next">${F.other.next}</button><button type="button" class="link center" data-a="claim-none">${F.other.none}</button>`);
      const file = () => {
        const no = `${p.carrier.replace(/\W/g, '').slice(0, 2).toUpperCase()}-${String(Date.now()).slice(-6)}`; S.claims[p.id] = no; sh.end(true); rerender();
        sh.onDone(setSheet(`<div class="flow-done left">${okIcon}<h3>${F.done.title}</h3><p class="claim-no"><span>${F.done.number}</span><b>${no}</b></p><ol class="next-steps">${F.done.steps(p.carrier).map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join('')}</ol><p class="fine">${F.done.note}</p><button type="button" class="btn wide" data-a="flow-done">${F.done.close}</button></div>`));
      };
      $('[data-a=claim-next]', body).addEventListener('click', file); $('[data-a=claim-none]', body).addEventListener('click', file);
      $$('input', body).forEach((f) => f.addEventListener('keydown', (e) => { if (e.key === 'Enter') file(); }));
    }
  };
  step(0);
}
const CLAIM_AUTO = () => { const F = FLOWS.claim; return [{ tap: `[data-a=claim-opt][data-i="${F.what.auto}"]`, read: 2200 }, { tap: '[data-a=claim-next]', read: 2800 }, ...F.photos.autoTiles.map((i, k) => ({ tap: `[data-a=claim-tile][data-i="${i}"][aria-pressed=false]`, read: k ? 500 : 1700 })), { tap: '[data-a=claim-next]', read: 1100 }, ...F.other.fields.map(([id, , v], k) => ({ type: `#cf_${id}`, text: v, read: k ? 250 : 1500 })), { tap: '[data-a=claim-next]', read: 900 }, { tap: '[data-a=flow-done]', read: 5200 }]; };
const FLOW_AUTO = [{ tap: '[data-a=flow-go]', read: 3400 }, { tap: '[data-a=flow-done]', read: 3600 }];

/* home base clicks (everything beyond seeing the list is one tap deeper) */
$('#lt').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]'); if (tab) { go(tab.dataset.tab); return; }
  const n = e.target.closest('[data-a=nudge]'); if (n && S.nudgeCb) { S.nudgeCb(n.dataset.v); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, id = b.dataset.id, loan = S.loans.find((l) => l.id === id), pol = S.policies.find((p) => p.id === id);
  if (a === 'close-sheet') closeSheet();
  else if (a === 'ask') dockOpen();
  else if (a === 'loan') { S.open.loans = S.open.loans === id ? null : id; renderLoans(); }
  else if (a === 'acct') { S.open.acct = S.open.acct === id ? null : id; renderLoans(); }
  else if (a === 'policy') { S.open.insurance = S.open.insurance === id ? null : id; renderInsurance(); }
  else if (a === 'pay') (loan.payment ? payFlow(id) : toast(HOME.loans.nothingDue));
  else if (a === 'extra') (loan.payment ? payoffFlow({ loan: id, extra: 100 }) : toast(HOME.loans.nothingDue));
  else if (a === 'loan-details') factsSheet(`${loan.lender} ${loan.type.toLowerCase()}`, 'Everything about this loan.', [['Balance', money(loan.balance)], loan.limit ? ['Credit limit', money(loan.limit)] : ['Original amount', money(loan.original)], ['Rate', `${loan.rate}%`], ['Payment', loan.payment ? `${money(loan.payment)}, due ${loan.due}` : 'Nothing due yet'], ['Autopay', 'On, from Chase ••4471']], `<div class="opts"><button type="button" class="opt" data-act="doc"><span class="ib">${ic('file', 20)}</span><span><b>Statements and documents</b></span>${ic('right', 18, 2)}</button></div>`);
  else if (a === 'doc') { closeSheet(); toast('Your documents would open here.'); }
  else if (a === 'transfer') transferFlow({ from: id, to: id === 'chase' ? 'ally' : 'chase' });
  else if (a === 'activity') { const bk = bankOf(id); factsSheet(`${bk.bank} ${bk.name}`, `••${bk.last4} · ${money(bk.balance, 2)}`, HOME.loans.activity.map(([k, v]) => [k, (v < 0 ? '-' : '+') + money(Math.abs(v), 2)])); }
  else if (a === 'connect') connectSheet();
  else if (a === 'move') moveSheet();
  else if (a === 'idcard') idCardSheet(pol);
  else if (a === 'coverage') factsSheet(`${pol.type} coverage`, `${pol.carrier.replace(/^Employer plan \(|\)$/g, '')} · ${pol.covers}`, (HOME.insurance.coverage[pol.type] || []).map(([k, v]) => [k, v(pol)]));
  else if (a === 'claim') claimFlow(pol);
  else if (a === 'reshop') reshopSheet(pol);
  else if (a === 'add-policy') addPolicySheet();
});
$('#lt').addEventListener('change', (e) => { const w = e.target.closest('[data-act=watch]'); if (w) { S.watch[w.dataset.id] = w.checked; toast(w.checked ? 'Watching this policy for a better rate.' : 'Stopped watching this policy.'); renderInsurance(); } });
scrim.addEventListener('click', () => closeSheet());
$('#logo').addEventListener('click', () => go('guide'));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#pmodal').hidden) { if (pmDismiss) pmDismiss(); } else if (!sheet.hidden) closeSheet();
});

/* ---------- after the close: servicing, engagement, renewal ---------- */
async function nudge(n) {
  S.nudge = n; rerender(); main.scrollTo({ top: 0, behavior: smooth() });
  const r = await wait((fin) => { S.nudgeCb = fin; }, [{ tap: '[data-a=nudge][data-v=yes]', read: 5200 }], { hint: () => $(`#v-${S.flow} .nudge .btns`) });
  S.nudge = null; S.nudgeCb = null; rerender();
  return r;
}
async function homeTour(P) {
  setStation(6); now(NOW.tour(HOME[P.homeView].title));
  S.nudge = { text: P.tour }; rerender();
  await sleep(2400);
  if (S.auto) { const id = P.homeView === 'loans' ? S.loans.find((l) => l.isNew).id : 'auto'; S.open[P.homeView] = id; rerender(); }
  await sleep(3800);
}
/* Someone driving by hand gets to finish what they are doing before the prototype speaks over the product. */
async function settle() {
  const typing = () => { const i = $('#dockIn'); return !!(i && i.value); };
  while (!S.auto && (!sheet.hidden || ASK.busy || typing() || Date.now() - lastTouch < 5000 / SPEED)) await sleep(250);
}
async function servicing(from = 0, back) {
  const P = PATHS[S.path];
  flowGo(P.homeView); S.nudge = null; S.open[P.homeView] = null; rerender(); setStation(6);
  if (!back) await timeSkip(PROTO.skips.servicing);
  for (let i = from; i < P.servicing.length; i++) {
    const t = P.servicing[i];
    setCp({ at: 'servicing', i });
    await sleep(900);
    now(NOW.nudge('servicing', t.gist, t.yes, t.no));
    const r = await nudge({ text: fn(t.text, newPolicy()), yes: t.yes, no: t.no });
    now(NOW.between(HOME[P.homeView].title));
    if (r !== 'yes') continue;
    now(NOW.flow(FLOWS[t.kind].title));
    if (t.kind === 'transfer') await wait((fin) => transferFlow(t, fin), FLOW_AUTO);
    else if (t.kind === 'payoff') await wait((fin) => payoffFlow(t, fin), [{ tap: '.sheet .chip[data-c="200"]', read: 3200 }, { tap: `.sheet .chip[data-c="${t.extra}"]`, read: 1800 }, ...FLOW_AUTO]);
    else if (t.kind === 'claim') await wait((fin) => claimFlow(newPolicy(), fin), CLAIM_AUTO());
    now(NOW.between(HOME[P.homeView].title));
    if (t.kind !== 'transfer' && S.auto) { S.open[P.homeView] = t.loan || t.policy; rerender(); }
    await sleep(2600);
  }
}
/* cp carries a rest's return point: the nudge, the offers (sub 'offers') or the application (sub 'finish'). */
async function renewal(cp = {}) {
  const P = PATHS[S.path], R = P.renewal, pol = S.policies.find((p) => p.id === 'auto'), list = fn(R.offers, pol);
  let r = cp.r, o = cp.o;
  if (!cp.sub) {
    setCp({ at: 'renewal' }); S.lock = false;
    flowGo(P.homeView); S.open[P.homeView] = null; rerender();
    if (!cp.back) await timeSkip(PROTO.skips.engagement);
    setStation(7);
    await sleep(700);
    now(NOW.nudge('renewal', R.gist, R.shop, R.no));
    r = await nudge({ text: fn(R.nudge, pol), yes: R.shop, alt: fn(R.direct, pol), no: R.no });
    if (r === 'no') { now(NOW.end); return; }
    setStation(8); S.lock = true;
    flowGo('guide'); stream.innerHTML = '';
    now(NOW.renewalQ(R.question));
    me(r === 'yes' ? R.shop : fn(R.direct, pol)); await sleep(400);
    await say(R.opening);
    if (r === 'yes') { await say(R.question.q); await choose(R.question.options, R.question.auto); }
  }
  if (r !== 'yes') o = o || list.find((x) => x.id === (R.directId || R.recommend));
  else if (!o) {
    setCp({ at: 'renewal', sub: 'offers', r });
    o = await offersScene(P, { offers: list, recommend: R.recommend, offersIntro: R.offersIntro, chart: R.chart, advisor: R.advisor, current: R.current, offerDetails: R.offerDetails, watchAsk: R.watchAsk });
  }
  await finish(P, o, R.app, R.signTerms(o), R.done, r !== 'yes', { at: 'renewal', sub: 'finish', r }, cp.sub === 'finish' ? cp.prog : null, () => {
    if (S.path === 'loan') { S.loans.forEach((l) => { l.isNew = false; }); S.loans.push(R.newLoan(o)); } else { S.policies = S.policies.map((p) => (p.id === 'home' ? { ...p, carrier: o.carrier, icon: o.icon, premium: o.premium, isNew: true } : { ...p, isNew: false })); }
    S.open[P.homeView] = null;
  });
  now(NOW.end);
  flowGo(P.homeView);
  await sleep(3200);
}

/* ---------- prototype chrome: interstitial, controls ---------- */
/* dismiss, when given, is the choice made by clicking outside the card or pressing Escape. */
let cdTimer = 0, pmDismiss = null;
function modal(M, buttons, secs = 0, dismiss) {
  const pm = $('#pmodal');
  $('#pmTitle').textContent = M.title; $('#pmBody').textContent = M.body;
  $('#pmBtns').className = buttons.length > 2 ? 'pm-btns stack' : 'pm-btns';
  $('#pmBtns').innerHTML = buttons.map(([v, label], i) => `<button type="button" class="${i ? 'pm-b ghost' : 'pm-b'}" data-v="${v}">${esc(label)}</button>`).join('');
  threadShow(false);
  pm.hidden = false; requestAnimationFrame(() => pm.classList.add('on')); $('#pmBtns button').focus({ preventScroll: true });
  /* With auto-play on, the first button presses itself after a visible countdown. Pausing auto-play stops it. */
  clearInterval(cdTimer); const cd = $('#pmCount'); cd.hidden = true;
  if (secs && S.auto) {
    let n = secs;
    const paint = () => { cd.innerHTML = `${esc(M.countdown || 'Continuing in')} <b>${n}</b>`; };
    paint(); cd.hidden = false;
    cdTimer = setInterval(() => {
      if (pm.hidden || !S.auto) { clearInterval(cdTimer); cd.hidden = true; return; }
      n--; if (n > 0) return paint();
      clearInterval(cdTimer); $('#pmBtns button').click();
    }, 1000 / SPEED);
  }
  return wait((fin) => {
    const done = (v) => { hideModal(); fin(v); };
    $('#pmBtns').onclick = (e) => { const b = e.target.closest('button'); if (b) done(b.dataset.v); };
    pmDismiss = dismiss ? () => done(dismiss) : null;
  }, null);
}
function hideModal() { const pm = $('#pmodal'); pm.hidden = true; pm.classList.remove('on'); clearInterval(cdTimer); pmDismiss = null; }
$('#pmodal').addEventListener('click', (e) => { if (e.target === e.currentTarget && pmDismiss) pmDismiss(); });

/* ---------- the journey, which can be entered at any checkpoint: from the top, from a jump, or after a rest ---------- */
async function launch(fn_) {
  run++; cur = null; autoGen++;
  closeSheet(true); hideModal(); $('#skip').hidden = true; $('#skip').classList.remove('on'); S.landing = false;
  try { await fn_(); } catch (e) { if (!(e instanceof Cancel)) throw e; }
}
function start(stage, cp) {
  return launch(async () => {
    resetState(); paintDev(); paintLife();
    if (stage !== 'shop') {
      const d = PATHS[S.path], o = d.offers.find((x) => x.id === d.recommend);
      closeDeal(S.path, o); S.sel = o.id; S.held = true; S.done = new Set([0, 1, 2, 3, 4, 5]); flowGo(d.homeView);
    }
    await journey(cp || { at: stage === 'shop' ? 'shop' : stage === 'servicing' ? 'servicing' : 'tour' });
  });
}
async function journey(cp) {
  let at = cp.at;
  if (at === 'shop') { await intro(cp.switched); at = 'qualify'; }
  const P = PATHS[S.path];
  if (at === 'qualify') { await qualify(P, cp.at === 'qualify' ? cp.i : 0, cp.back); at = 'offers'; }
  let o = cp.o;
  if (at === 'offers') {
    setCp({ at: 'offers' });
    o = await offersScene(P, { offers: P.offers, recommend: P.recommend, offersIntro: P.offersIntro, chart: P.chart, advisor: P.advisor, current: S.path === 'insurance' ? AUTO_CURRENT : null });
    at = 'finish';
  }
  if (at === 'finish') {
    await finish(P, o, P.app, P.sign.terms(o), P.done, false, { at: 'finish' }, cp.at === 'finish' ? cp.prog : null, () => closeDeal(S.path, o));
    flowGo(P.homeView); at = 'tour';
  }
  if (at === 'tour') {
    setCp({ at: 'tour' });
    await homeTour(P);
    if (!EMBED) { await settle(); const r = await modal(PROTO.afterClose, [['next', PROTO.afterClose.primary], ['restart', PROTO.afterClose.secondary]], 9); if (r === 'restart') { resetAsk(); return void start('shop'); } }
    at = 'servicing';
  }
  if (at === 'servicing') { await servicing(cp.at === 'servicing' ? cp.i : 0, cp.at === 'servicing' && cp.back); at = 'renewal'; }
  if (at === 'renewal') await renewal(cp.at === 'renewal' ? cp : {});
  if (EMBED) { await sleep(3000); return void start(START_STAGE); }
  setCp({ at: 'end' });
  await settle();
  /* Clicking outside the card, or Escape, is the same as choosing to play with it. */
  const r = await modal(PROTO.theEnd, [['self', PROTO.theEnd.self], ['restart', PROTO.theEnd.primary], ['other', PROTO.theEnd.other[S.path]]], 0, 'self');
  if (r === 'other') S.path = S.path === 'loan' ? 'insurance' : 'loan';
  if (r === 'self') setAuto(false);
  resetAsk(); start('shop');
}

/* A calm stopping point, reached by telling the guide you want to stop or think it over. Nothing is lost, and one button resumes. */
const restsAtHome = (cp) => cp.at === 'servicing' || (cp.at === 'renewal' && !cp.sub);
const restsInGuide = (cp) => ['qualify', 'offers', 'finish'].includes(cp.at) || (cp.at === 'renewal' && !!cp.sub);
function pauseFlow() {
  const cp = S.cp;
  if (!cp || S.resting) return false;
  if (cur && cur.kind === 'offers') { cur.finish('rest'); return true; }
  if (!restsAtHome(cp) && !restsInGuide(cp)) return false;
  launch(() => rest(cp));
  return true;
}
async function rest(cp) {
  const R = SHELL.rest, P = PATHS[S.path];
  S.resting = true;
  if (restsAtHome(cp)) {
    now(NOW.rested(R.homeResume));
    flowGo(P.homeView); S.open[P.homeView] = null;
    await nudge({ text: R.home, yes: R.homeResume });
  } else {
    now(NOW.rested(R.resume));
    flowGo('guide'); await scene();
    const card = add(el(`<div class="card rest"><span class="rest-ic">${ic('check', 22)}</span><div><b>${esc(R.title)}</b><p>${esc(cp.o ? R.app(cp.o.lender || cp.o.carrier) : R.shop)}</p></div><button type="button" class="btn">${esc(R.resume)}</button></div>`));
    await wait((fin) => $('button', card).addEventListener('click', () => fin()), [{ tap: () => $('button', card), read: 3600 }]);
    await scene();
  }
  S.resting = false;
  await journey({ ...cp, back: true });
}

/* ---------- ask the guide: a question at any point, answered by the live LendingTree agent ---------- */
const dock = $('#dock'), ASK = { msgs: [], busy: false, gen: 0, last: null };
const MOCK = Q.get('mock') === '1';
/* TEST AID, only with ?mock=1: canned replies so every action can be exercised without the network. Not part of the product. */
function mockAsk(req) {
  const q = req.messages[req.messages.length - 1].content.toLowerCase();
  const hit = [
    ['think about it', 'pause', 'Of course. Nothing is submitted, and I will keep everything as it is until you are ready.'],
    ['insurance instead', 'insurance', 'Sure. Let us look at your car insurance instead.'],
    ['loan instead', 'loan', 'Sure. Let us look at borrowing instead.'],
    ['my loans', 'home', 'Here is everything you hold, in one place.'],
    ['start over', 'restart', 'No problem. Let us start again from the top.'],
  ].find(([k]) => q.includes(k));
  const out = hit ? { text: hit[2], action: hit[1] } : { text: `Good question. In this sample nothing is final until you sign, and looking around never affects your credit. Whenever you are ready, carry on with the ${req.stage} step in front of you.`, action: 'continue' };
  return new Promise((r) => setTimeout(() => r({ ...out, live: false }), 400));
}
if (MOCK) window.__vt = { S, ASK };

function buildDock() {
  const A = SHELL.ask;
  dock.innerHTML = `<div class="dock-thread" id="dockThread" hidden><button type="button" class="dock-x" id="dockHide" aria-label="${esc(A.hide)}">${ic('down', 16, 2.4)}</button><div class="dock-log" id="dockLog" role="log" aria-live="polite"></div></div>
    <div class="dock-row"><button type="button" class="dock-back" id="dockBack" hidden>${esc(A.back)}${ic('right', 15, 2.6)}</button>
      <button type="button" class="dock-pill" id="dockPill" aria-label="${esc(A.label)}"><img src="${LEAF}" alt=""><span>${esc(A.short)}</span></button>
      <form class="dock-form" id="dockForm" autocomplete="off"><img src="${LEAF}" alt=""><input type="text" id="dockIn" maxlength="300" enterkeyhint="send" placeholder="${esc(A.placeholder)}" aria-label="${esc(A.label)}"><button type="submit" aria-label="${esc(A.send)}" disabled>${ic('right', 18, 2.4)}</button></form></div>`;
  dock.hidden = false;
  const input = $('#dockIn');
  input.addEventListener('input', paintAsk);
  input.addEventListener('blur', () => setTimeout(() => { if (!input.value && document.activeElement !== input && !dock.classList.contains('has-thread')) dock.classList.remove('open'); }, 0));
  $('#dockForm').addEventListener('submit', (e) => { e.preventDefault(); const t = input.value.trim(); if (t.length >= 2 && !ASK.busy) submitAsk(t); });
  $('#dockPill').addEventListener('click', dockOpen);
  $('#dockHide').addEventListener('click', () => threadShow(false));
  $('#dockBack').addEventListener('click', () => { go(S.flow); requestAnimationFrame(markReady); });
  dock.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; e.stopPropagation(); threadShow(false); input.blur(); });
  paintDock();
}
function dockOpen() { if (dock.hidden) return; dock.classList.add('open'); $('#dockIn').focus({ preventScroll: true }); }
function paintAsk() { $('#dockForm button').disabled = ASK.busy || $('#dockIn').value.trim().length < 2; }
function paintDock() {
  if (dock.hidden) return;
  $('#lt').classList.toggle('no-ask', !!S.landing && S.view === 'guide'); /* the opening screen is already one big question */
  $('#dockBack').hidden = S.view === S.flow;
}
function threadShow(on) {
  if (dock.hidden || (!on && !dock.classList.contains('has-thread') && !dock.classList.contains('open'))) return;
  $('#dockThread').hidden = !on; dock.classList.toggle('has-thread', on);
  if (!on && !$('#dockIn').value && document.activeElement !== $('#dockIn')) dock.classList.remove('open');
  fitDock();
}
/* while an answer is open, the page can scroll far enough that nothing is stuck underneath it */
function fitDock() {
  const lt = $('#lt'), on = dock.classList.contains('has-thread');
  lt.classList.toggle('asking', on); if (on) lt.style.setProperty('--dock-h', `${dock.offsetHeight}px`);
  /* on the website a dialog slides up to stay clear of the answer (on the app the answer sits over the sheet) */
  let lift = 0;
  if (on && !sheet.hidden && matchMedia('(min-width: 761px)').matches) { const top = sheet.offsetTop - sheet.offsetHeight / 2; lift = Math.max(0, Math.min(top - 12, top + sheet.offsetHeight + 14 - dock.offsetTop)); }
  sheet.style.setProperty('--lift', `${lift}px`);
}
function resetAsk() { ASK.gen++; ASK.msgs = []; ASK.busy = false; if (dock.hidden) return; $('#dockLog').innerHTML = ''; $('#dockIn').value = ''; paintAsk(); threadShow(false); dock.classList.remove('open'); }
/* What the guide is told: where the journey is, plus anything the visitor has wandered off to look at. */
function askContext() {
  let { stage, step } = S.ctx;
  const t = $('.sheet-in h3', sheet);
  if (!sheet.hidden && t && !S.ctx.sheet) step += NOW.panel(t.textContent);
  else if (sheet.hidden && S.view !== S.flow) step += NOW.elsewhere(SHELL.tabs.find((x) => x.id === S.view).label);
  return { stage, step: step.slice(0, 300) };
}
async function submitAsk(text) {
  if (S.auto) setAuto(false);
  const my = ++ASK.gen, log = $('#dockLog'), pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const q = el('<div class="msg me"><span></span></div>'); q.firstChild.textContent = text;
  const a = el(`<div class="msg g"><img class="g-av" src="${LEAF}" alt=""><div class="g-t"><span class="dots" role="img" aria-label="${esc(SHELL.ask.thinking)}"><i></i><i></i><i></i></span></div></div>`);
  log.append(q, a); $('#dockIn').value = ''; ASK.busy = true; paintAsk();
  /* the panel is only as tall as the latest exchange; earlier ones are a scroll away */
  const frame = () => { const pad = parseFloat(getComputedStyle(log).paddingTop); log.style.height = `${a.offsetTop + a.offsetHeight - q.offsetTop + pad * 2}px`; log.scrollTop = q.offsetTop - pad; fitDock(); };
  dock.classList.add('open'); threadShow(true); frame();
  ASK.msgs.push({ role: 'user', content: text });
  const req = { surface: 'lifecycle', path: S.path, ...askContext(), selected: S.sel, held: S.held, messages: ASK.msgs.slice(-11) }; /* odd, so it opens on a question */
  ASK.last = req;
  const [out] = await Promise.all([MOCK ? mockAsk(req) : ask(req), pause(700)]);
  if (my !== ASK.gen) return;
  ASK.msgs.push({ role: 'assistant', content: out.text });
  $('.g-t', a).innerHTML = `<p>${esc(out.text)}</p>`;
  frame();
  await pause(out.action === 'continue' ? 350 : 1100); /* long enough to read the reply before the screen changes */
  if (my !== ASK.gen) return;
  ASK.busy = false; paintAsk();
  act(out.action);
}
/* What each reply does to the journey. The words are the agent's; this only moves the product to match them. */
function act(action) {
  if ((action === 'loan' || action === 'insurance') && (action !== S.path || S.held || !S.cp || S.cp.at === 'shop')) { S.path = action; return void start('shop', { at: 'shop', switched: true }); }
  if (action === 'restart') return void start('shop');
  if (action === 'pause' && pauseFlow()) return;
  if (action === 'home') { closeSheet(); go(PATHS[S.path].homeView); main.scrollTo({ top: 0, behavior: smooth() }); }
  requestAnimationFrame(markReady);
}
/* Bring the step that is waiting into view, clear of the answer, and pulse the control that carries it on. */
function markReady() {
  if (sheet.hidden && S.view !== S.flow) return; /* the way back is offered beside the ask field instead */
  const n = hintNode(); if (!n) return;
  if (main.contains(n)) {
    const r = ((cur.frame && cur.frame()) || n).getBoundingClientRect(), m = main.getBoundingClientRect(), d = dock.hidden ? null : dock.getBoundingClientRect();
    const floor = d && r.right > d.left && r.left < d.right ? d.top - 20 : m.bottom - 20;
    const by = r.height > floor - m.top - 12 || r.top < m.top + 12 ? r.top - m.top - 12 : r.bottom > floor ? r.bottom - floor : 0;
    if (by) main.scrollBy({ top: by, behavior: smooth() });
  }
  n.classList.remove('ready'); void n.offsetWidth; n.classList.add('ready');
  clearTimeout(markReady.t); markReady.t = setTimeout(() => $$('.ready').forEach((x) => x.classList.remove('ready')), 2600);
}
if (!EMBED) buildDock();

const IC_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
const IC_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
const devMenu = $('#devMenu'), devBtn = $('#devBtn');
function paintDev() {
  const t = $('#devToggle');
  $('#devIc').innerHTML = S.auto ? IC_PAUSE : IC_PLAY;
  t.setAttribute('aria-pressed', String(S.auto)); t.setAttribute('aria-label', S.auto ? 'Auto-play is on. Pause' : 'Auto-play is paused. Play'); t.classList.toggle('paused', !S.auto);
  $('#devPath').innerHTML = Object.entries(PROTO.paths).map(([k, v]) => `<button type="button" data-path="${k}" aria-pressed="${S.path === k}">${v}</button>`).join('');
}
$('#devNote').textContent = PROTO.note; $('#devFine').textContent = PROTO.fiction; $('#doReset').textContent = PROTO.restart; $('#pbackT').textContent = PROTO.back;
$('#devJumps').innerHTML = Object.entries(PROTO.jumps).map(([k, v]) => `<button type="button" data-stage="${k}">${v}</button>`).join('');
const setMenu = (open) => { devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); };
devBtn.addEventListener('click', () => setMenu(devMenu.hidden));
$('#devToggle').addEventListener('click', () => setAuto(!S.auto));
$('#devPath').addEventListener('click', (e) => { const b = e.target.closest('[data-path]'); if (!b) return; S.path = b.dataset.path; setMenu(false); resetAsk(); start('shop'); });
$('#devJumps').addEventListener('click', (e) => { const b = e.target.closest('[data-stage]'); if (!b) return; setMenu(false); resetAsk(); start(b.dataset.stage); });
$('#doReset').addEventListener('click', () => { setMenu(false); S.auto = true; resetAsk(); start('shop'); });
document.addEventListener('pointerdown', (e) => {
  if (!devMenu.hidden && !$('#dev').contains(e.target)) setMenu(false);
  if (!e.isTrusted) return;
  keyed = false;
  if (!$('#lt').contains(e.target)) return;
  lastTouch = Date.now();
  /* a real tap inside the product means the viewer is driving: auto-play steps aside until they press play */
  if (S.auto && !EMBED) setAuto(false);
}, true);
/* A tap anywhere else in the product puts an open answer away. On click, not on press, so the page cannot shift under the tap. */
document.addEventListener('click', (e) => {
  if (e.isTrusted && !ASK.busy && $('#lt').contains(e.target) && !dock.contains(e.target) && !e.target.closest('[data-act=ask]')) threadShow(false);
}, true);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !devMenu.hidden) { setMenu(false); devBtn.focus(); }
  if (!e.isTrusted) return;
  keyed = true;
  if (!$('#lt').contains(e.target)) return;
  lastTouch = Date.now();
  if (S.auto && !EMBED && (e.key === 'Enter' || e.key === ' ' || e.key.length === 1)) setAuto(false);
});

resetState();
start(START_STAGE);
