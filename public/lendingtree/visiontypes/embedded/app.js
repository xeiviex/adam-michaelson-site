/* Visiontype C: LendingTree embedded inside another company's purchase flow (a fictional used-car marketplace).
   Copy and step definitions live in content.js; sample data in data.js and ../shared/data.js. The only network call is a
   question the visitor chooses to ask (../shared/agent.js), which falls back to an offline answer when it cannot connect.
   The Google sign-in is simulated: no real sign-in, no network.
   URL params: ?stage=shop|finance|insurance|review  ?auto=0|1  ?embed=1  ?speed=N  ?mock=1 (test aid)
   How it works: one state object (S), one render() that draws the current screen from it, and an auto-play driver that
   reads the state, works out what a person would do next, and does it by pressing the real controls. */
import { PERSON, money, lenderIcon } from '../shared/data.js';
import { MARKET, LISTINGS, HERO_ID, carName, priceBreakdown, monthlyPayment, loanNumbers, FINANCE, APPLICANT, AUTO_LOAN_OFFERS, LOAN_RECOMMEND, CURRENT_POLICY, CURRENT_WITH_TACOMA, TWO_CAR_QUOTES, INSURANCE_RECOMMEND, DELIVERY, ORDER_NUMBER, GOOGLE_PROFILE, ADDRESS_SUGGESTIONS, SEARCH } from './data.js?v=1';
import { PROTO, SHELL, SEARCH_T, DETAIL_T, STEPS, FLOW_T, SUMMARY_T, DETAILS_T, GOOGLE_T, TRADE_T, PAY_T, FIN_STEPS, FIN, INS, DELIVERY_T, REVIEW_T, DONE_T, ASK_T, NOW, APPLICANT_AUTO } from './content.js?v=1';
import { ask } from '../shared/agent.js';

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const smooth = () => (reduced() ? 'auto' : 'smooth');
const digits = (v) => Number(String(v).replace(/[^\d]/g, '')) || 0;
const LEAF = '/lendingtree/img/lt-leaf.png';
const P_ = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>', pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.500 6.500 0 0 1 13 0c0 5.400-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
  heart: '<path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>', check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  right: '<path d="M9 6l6 6-6 6"/>', left: '<path d="M15 6l-6 6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  truck: '<path d="M2.500 6.500h11v9.500h-11z"/><path d="M13.500 10h4l3 3v3h-7z"/><circle cx="7" cy="17.500" r="1.800"/><circle cx="17" cy="17.500" r="1.800"/>',
  return: '<path d="M4 9h10a5 5 0 0 1 0 10H9"/><path d="M8 5L4 9l4 4"/>', shield: '<path d="M12 3l7 3v5c0 4.500-3 8.200-7 10-4-1.800-7-5.500-7-10V6z"/><path d="M9 12l2.200 2.200L15 10.500"/>',
  user: '<circle cx="12" cy="8" r="3.600"/><path d="M5 20c.6-3.600 3.400-5.500 7-5.500s6.400 1.900 7 5.500"/>', userplus: '<circle cx="10" cy="8" r="3.600"/><path d="M3 20c.6-3.600 3.400-5.500 7-5.500 1.300 0 2.500.3 3.500.7M18 13v6M15 16h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', phone: '<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M11 18.500h2"/>',
  doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.800v.2"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>', key: '<circle cx="8" cy="8" r="4"/><path d="M11 11l8.500 8.500M16 16l2.500-2.500"/>', bank: '<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9.700 10v8M14.300 10v8M19 10v8M3 20h18"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>', filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
};
const ic = (n, s = 20, w = 1.8) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P_[n] || ''}</svg>`;
const MARK = (s = 28) => `<svg class="kt-mark" viewBox="0 0 32 32" width="${s}" height="${s}" aria-hidden="true"><rect width="32" height="32" rx="9" fill="currentColor"/><circle cx="12.500" cy="12.500" r="4.700" fill="none" stroke="#fff" stroke-width="3"/><path d="M16 16l8 8M20.500 20.500l3-3" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`;
const WORDMARK = `<span class="kt-logo">${MARK()}<span class="kt-word">${esc(MARKET.name.toLowerCase())}</span></span>`;
const G_LOGO = (s = 18) => `<svg viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true"><path fill="#EA4335" d="M24 9.500c3.500 0 6.600 1.200 9.100 3.600l6.800-6.800C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.200C12.400 13.600 17.700 9.500 24 9.500z"/><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.700 6c4.500-4.200 6.900-10.300 6.900-17.700z"/><path fill="#FBBC05" d="M10.500 28.600A14.500 14.500 0 0 1 9.700 24c0-1.600.3-3.200.8-4.600l-7.900-6.200A24 24 0 0 0 0 24c0 3.900.9 7.500 2.600 10.800l7.900-6.200z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.700-6c-2.200 1.400-4.900 2.300-8.200 2.300-6.300 0-11.600-4.200-13.500-9.900l-7.900 6.200C6.500 42.600 14.600 48 24 48z"/></svg>`;
const initials = (name) => name.split(' ').filter((w) => /^[A-Z0-9]/.test(w)).map((w) => w[0]).slice(0, 2).join('');
const lmark = (name) => (lenderIcon(name) ? `<span class="cm lender"><img src="${lenderIcon(name)}" alt=""></span>` : `<span class="cm mono" aria-hidden="true">${esc(initials(name))}</span>`);
const cmark = (icon) => `<span class="cm"><img src="/lendingtree/img/carriers/${icon}-icon.png" alt=""></span>`;
const CARRIER_COLOR = { 'State Farm': '#c8102e', GEICO: '#1f55a0', 'Liberty Mutual': '#1f2a5c', Progressive: '#1e5aa8' };
const credit = (kind) => `<span class="ltc"><img src="${LEAF}" alt=""><span>${esc(SHELL.credit[kind])}</span></span>`;

/* dates */
const addDays = (n) => { const d = new Date(); d.setHours(12, 0, 0, 0); let left = n; while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) left--; } return d; };
const fmt = (d, o) => d.toLocaleDateString('en-US', o);
const dayLong = (d) => fmt(d, { weekday: 'long', month: 'short', day: 'numeric' });
const dayShort = (d) => fmt(d, { weekday: 'short', month: 'short', day: 'numeric' });
const arrival = () => (S.del.mode === 'pickup' ? addDays(DELIVERY.pickupDay) : addDays(DELIVERY.firstDay + S.del.day));
function refund() {
  const start = addDays(DELIVERY.firstDay), [mon, day] = CURRENT_POLICY.renews.split(' ');
  const end = new Date(`${mon} ${day}, ${start.getFullYear()} 12:00`); if (end <= start) end.setFullYear(end.getFullYear() + 1);
  return Math.round((CURRENT_POLICY.premium * Math.round((end - start) / 864e5)) / 365);
}

/* ---------- state ---------- */
const Q = new URLSearchParams(location.search);
const EMBED = Q.get('embed') === '1';
const MOCK = Q.get('mock') === '1';
const SPEED = Math.max(0.25, Math.min(40, Number(Q.get('speed')) || 1));
const START_STAGE = ['finance', 'insurance', 'review'].includes(Q.get('stage')) ? Q.get('stage') : 'shop';
const HERO = LISTINGS.find((l) => l.id === HERO_ID);
const S = { auto: Q.get('auto') !== '0' };
function fresh() {
  return {
    screen: 'search', car: HERO, saved: new Set(), featAll: false, filt: { trim: new Set(), drive: new Set(), price: 'any', miles: 'any', sort: 'best' },
    step: 'details', done: {}, sumOpen: false,
    det: { stage: 'start', google: false, name: '', email: '', phone: '', address: '', addrOk: false }, gdlg: null, gNote: false,
    trade: null,
    pay: { method: null, lender: '' },
    fin: { stage: 'have', down: FINANCE.down, term: FINANCE.term, status: APPLICANT.employment, employer: '', income: '', verified: false, verifying: false, housing: APPLICANT.housing, housingPay: '', agree: false, checked: false, line: 0, offer: null, stips: { identity: false, income: false }, busy: null, sig: '', full: false, signing: false, approved: false, paused: false },
    ins: { stage: 'prompt', quote: null, agree: false, line: 0, result: null, paused: false },
    del: { mode: 'delivery', day: 0, win: 1 },
    agree: false, placing: false,
  };
}
const B = () => priceBreakdown(S.car);
const financed = () => B().total - S.fin.down;
const offerOf = (id) => AUTO_LOAN_OFFERS.find((o) => o.id === id);
const nums = (o) => ({ ...loanNumbers(o, financed()), financed: financed() });
const quoteOf = (id) => TWO_CAR_QUOTES.find((q) => q.id === id);
const recOffer = () => LOAN_RECOMMEND[S.fin.term] || AUTO_LOAN_OFFERS[0].id;
const estFor = (car, down = FINANCE.down, term = FINANCE.term) => Math.round(monthlyPayment(priceBreakdown(car).total - down, FINANCE.estimateApr, term));
const stepIdx = (id) => STEPS.findIndex((s) => s.id === id);
const firstOpen = () => (STEPS.find((s) => s.id !== 'review' && !S.done[s.id]) || STEPS[STEPS.length - 1]).id;
const canGo = (id) => id === S.step || S.done[id] || id === firstOpen();
const loanDone = () => S.pay.method === 'lt' && S.fin.approved;

/* Put the journey at a deep link: everything before it is filled in the way auto-play would have. */
function preset(stage) {
  Object.assign(S, fresh());
  if (stage === 'shop') return;
  S.screen = 'checkout';
  Object.assign(S.det, { stage: 'confirm', google: true, ...GOOGLE_PROFILE, address: PERSON.address, addrOk: true });
  S.trade = 'skip'; S.done.details = S.done.trade = true; S.step = 'payment';
  if (stage === 'finance') return;
  Object.assign(S.pay, { method: 'lt' });
  Object.assign(S.fin, { stage: 'approved', employer: APPLICANT.employer, income: APPLICANT_AUTO.income, verified: true, housingPay: APPLICANT_AUTO.housingPayment, agree: true, checked: true, offer: recOffer(), stips: { identity: true, income: true }, sig: GOOGLE_PROFILE.name, approved: true });
  S.done.payment = true; S.step = 'insurance';
  if (stage === 'insurance') return;
  Object.assign(S.ins, { stage: 'bound', quote: INSURANCE_RECOMMEND, agree: true, result: 'switched' });
  S.done.insurance = S.done.delivery = true; S.step = 'review';
}

/* ---------- engine: time and auto-play ---------- */
class Cancel extends Error {}
let run = 0, autoGen = 0;
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
/* Run a timed sequence that a restart cancels cleanly. */
const seq = (fn) => { fn().catch((e) => { if (!(e instanceof Cancel)) throw e; }); };
const find = (t) => (typeof t === 'function' ? t() : $$(t, kt).filter((e) => !e.disabled && e.getClientRects().length).pop()) || null;

/* What a person would do next on the screen that is showing. Derived from the state, so it is right after a pause too. */
function autoSteps() {
  const tap = (sel, read) => ({ tap: sel, read }), type = (sel, text, read) => ({ type: sel, text, read }), see = (sel, read) => ({ see: sel, read });
  if (S.gdlg === 'choose') return [tap('[data-a=g-pick]', 2400)];
  if (S.gdlg === 'consent') return [tap('[data-a=g-allow]', 2800)];
  if (S.gdlg) return [];
  if (S.screen === 'search') return [{ wait: 1200 }, tap(`[data-a=open][data-v=${HERO_ID}]`, 2800)];
  if (S.screen === 'detail') return [tap('[data-a=photo][data-v="1"]', 2600), tap('[data-a=photo][data-v="3"]', 1900), tap('[data-a=photo][data-v="4"]', 1900), see('#specs', 1400), see('#history', 2400), tap('[data-a=start]', 2400)];
  if (S.screen === 'done') return [see('.whatnext', 3200), { do: EMBED ? () => start(START_STAGE) : finale, read: EMBED ? 5000 : 5200 }];
  const f = S.fin, n = S.ins;
  if (S.step === 'details') {
    if (S.det.stage === 'start') return [tap('[data-a=google]', 2600)];
    const d = S.det, out = [];
    if (!d.name) out.push(type('#f-name', GOOGLE_PROFILE.name, 1200));
    if (!d.email) out.push(type('#f-email', GOOGLE_PROFILE.email, 500));
    if (!d.phone) out.push(type('#f-phone', GOOGLE_PROFILE.phone, 500));
    if (!d.addrOk) out.push(type('#f-addr', DETAILS_T.addressType, out.length ? 600 : 2800), tap('[data-a=addr-pick]', 1200));
    return out.length ? out : [tap('[data-a=next]', 2000)];
  }
  if (S.step === 'trade') return S.trade ? [tap('[data-a=next]', 1300)] : [tap('[data-a=trade][data-v=skip]', 2800)];
  if (S.step === 'payment') {
    if (S.done.payment) return [tap('[data-a=next]', 3000)];
    if (f.paused) return [tap('[data-a=fin-resume]', 3200)];
    if (!S.pay.method) return [tap('[data-a=pay][data-v=lt]', 3400)];
    if (S.pay.method === 'cash') return [tap('[data-a=pay-done]', 2600)];
    if (S.pay.method === 'own') return [...(S.pay.lender ? [] : [type('#f-lender', PAY_T.own.sample, 1800)]), tap('[data-a=pay-done]', 1000)];
    switch (f.stage) {
      case 'have': return [tap('[data-a=fin-next]', 5200)];
      case 'terms': return [tap('[data-a=down][data-v="6000"]', 2400), tap(`[data-a=down][data-v="${FINANCE.down}"]`, 1700), tap('[data-a=fin-next]', 2200)];
      case 'income': return f.verified ? [tap('[data-a=fin-next]', 2200)] : [...(f.employer ? [] : [type('#f-employer', APPLICANT_AUTO.employer, 2000)]), ...(digits(f.income) ? [] : [type('#f-income', APPLICANT_AUTO.income, 500)]), tap('[data-a=fin-next]', 1300)];
      case 'housing': return [...(digits(f.housingPay) ? [] : [type('#f-housing', APPLICANT_AUTO.housingPayment, 2200)]), tap('[data-a=fin-next]', 1200)];
      case 'consent': return [...(f.agree ? [] : [tap('#agreeCredit', 3800)]), tap('[data-a=fin-next]', 1200)];
      case 'offers': return [see('.advisor', 2600), tap(`[data-a=pick-offer][data-v=${recOffer()}]`, 5600)];
      case 'stips': return f.busy ? [] : !f.stips.income ? [tap('[data-a=stip-income]', 2800)] : [tap('[data-a=fin-next]', 3000)];
      case 'sign': return f.signing ? [] : [type('#sig', GOOGLE_PROFILE.name, 4600), tap('[data-a=sign]', 900)];
      case 'approved': return [tap('[data-a=next]', 4600)];
      default: return [];
    }
  }
  if (S.step === 'insurance') {
    if (n.paused) return [tap('[data-a=ins-resume]', 3200)];
    switch (n.stage) {
      case 'prompt': return [tap('[data-a=ins-choice][data-v=shop]', 5200)];
      case 'quotes': return [see('.advisor', 3000), tap(`[data-a=pick-quote][data-v=${INSURANCE_RECOMMEND}]`, 5800)];
      case 'confirm': return [...(n.agree ? [] : [tap('#agreeSwitch', 5000)]), tap('[data-a=bind]', 1100)];
      case 'bound': return [see('.idc', 2600), tap('[data-a=next]', 3600)];
      case 'added': return [tap('[data-a=next]', 3800)];
      default: return [];
    }
  }
  if (S.step === 'delivery') return [tap('[data-a=day][data-v="1"]', 2600), tap('[data-a=next]', 1900)];
  if (S.step === 'review') return S.placing ? [] : [see('.rv-price', 3000), ...(S.agree ? [] : [tap('#agreeOrder', 2600)]), tap('[data-a=place]', 1200)];
  return [];
}
let modalOpen = false;
function kick() {
  const gen = ++autoGen, my = run;
  if (!S.auto || modalOpen) return;
  const steps = autoSteps();
  const live = () => my === run && gen === autoGen && S.auto && !modalOpen;
  seq(async () => {
    while (speech) { await speech; if (!live()) return; } /* let LendingTree finish what it is saying first */
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      if (!live()) return;
      if (st.wait) { await tick(st.wait, live); continue; }
      if (st.do) { await tick(st.read, live); st.do(); return; }
      const target = st.tap || st.type || st.see;
      let node = find(target), tries = 0;
      while (!node && ++tries <= 12) { await tick(100 * SPEED, live); node = find(target); }
      if (!node) continue; /* not on this screen (a listing with one photo, say): move on */
      if (st.see) { node.scrollIntoView({ block: 'center', behavior: smooth() }); await tick(st.read, live); continue; }
      await tick(st.read == null ? 1500 : st.read, live);
      node = find(target) || node;
      if (main.contains(node)) node.scrollIntoView({ block: 'center', behavior: smooth() });
      if (st.type) {
        if (node.value === st.text) continue;
        node.value = ''; node.focus({ preventScroll: true });
        for (const ch of st.text) { await tick(55, live); node.value += ch; node.dispatchEvent(new Event('input', { bubbles: true })); }
        await tick(300, live); node.blur();
      } else {
        const show = node.matches('input[type=checkbox]') ? node.closest('label') : node;
        show.classList.add('pressing'); await tick(420, live); show.classList.remove('pressing');
        if (!live()) return;
        node.click();
      }
    }
  });
}
function setAuto(v) { S.auto = v; $$('.pressing').forEach((n) => n.classList.remove('pressing')); paintDev(); if (v) threadShow(false); kick(); }

/* ---------- shell ---------- */
const kt = $('#kt'), main = $('#main'), view = $('#view'), hd = $('#hd'), gov = $('#gov');
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2800); }
function paintShell() {
  const checkout = S.screen === 'checkout', signed = S.det.google || (S.det.name && S.done.details);
  const me = signed ? `<span class="me" aria-label="Signed in as ${esc(S.det.name)}"><span class="me-n">${esc(S.det.name.split(' ')[0])}</span><span class="av" aria-hidden="true">${esc(initials(S.det.name) || 'A')}</span></span>` : `<button type="button" class="hd-link" data-a="nav" data-v="signin">${ic('user', 18)}<span>${esc(SHELL.signIn)}</span></button>`;
  hd.className = checkout ? 'hd co-hd' : 'hd';
  hd.innerHTML = checkout
    ? `<button type="button" class="logo" data-a="exit" aria-label="${esc(SHELL.exitCheckout)}">${WORDMARK}</button><span class="hd-secure">${ic('lock', 15, 2)}${esc(SHELL.secure)}</span><span class="hd-help">${esc(SHELL.help)}</span>${me}`
    : `<button type="button" class="logo" data-a="home" aria-label="${esc(SHELL.logoLabel)}">${WORDMARK}</button>
       <nav class="nav" aria-label="${esc(MARKET.name)}">${SHELL.nav.map((n) => `<button type="button" data-a="nav" data-v="${n.id}"${n.id === 'shop' ? ' class="on"' : ''}>${esc(n.label)}</button>`).join('')}</nav>
       <span class="hd-loc">${ic('pin', 16)}${esc(SHELL.near)}</span>
       <button type="button" class="hd-link" data-a="nav" data-v="saved">${ic('heart', 18)}<span>${esc(SHELL.saved)}${S.saved.size ? ` (${S.saved.size})` : ''}</span></button>${me}`;
  $('#urlT').textContent = S.screen === 'search' ? SHELL.url.search : S.screen === 'detail' ? SHELL.url.detail(S.car) : S.screen === 'done' ? SHELL.url.done(ORDER_NUMBER) : SHELL.url.checkout(S.car, S.step);
  kt.dataset.screen = S.screen;
}

/* ---------- search results ---------- */
function shown() {
  const f = S.filt, by = { best: () => 0, price: (a, b) => a.price - b.price, miles: (a, b) => a.miles - b.miles, year: (a, b) => b.year - a.year };
  return LISTINGS.filter((c) => (!f.trim.size || f.trim.has(c.trim)) && (!f.drive.size || f.drive.has(c.drive)) && (f.price === 'any' || c.price < Number(f.price)) && (f.miles === 'any' || c.miles < Number(f.miles))).sort(by[f.sort]);
}
const filtered = () => S.filt.trim.size || S.filt.drive.size || S.filt.price !== 'any' || S.filt.miles !== 'any';
function cardHtml(c) {
  const below = c.market - c.price, on = S.saved.has(c.id);
  return `<li class="lc"><button type="button" class="lc-hit" data-a="open" data-v="${c.id}" aria-label="${esc(carName(c))}, ${money(c.price)}"></button>
    <div class="lc-ph"><img src="${c.thumb || c.photo}" alt="" loading="lazy" width="640" height="429"><span class="deal ${c.deal === 'Great price' ? 'great' : ''}">${esc(c.deal)}</span></div>
    <button type="button" class="lc-save${on ? ' on' : ''}" data-a="save" data-v="${c.id}" aria-pressed="${on}" aria-label="${esc(on ? SEARCH_T.saved : SEARCH_T.save)} ${esc(carName(c))}">${ic('heart', 18, 2)}</button>
    <div class="lc-b"><div class="lc-t"><b>${c.year} ${esc(c.make)} ${esc(c.model)}</b><span>${esc(c.trim)} · ${esc(c.body)} · ${esc(c.drive)}</span></div>
      <div class="lc-m"><span>${esc(SEARCH_T.milesShort(c.miles))}</span><span>${esc(c.color)}</span></div>
      <div class="lc-p"><b>${money(c.price)}</b><span>${esc(SEARCH_T.est(estFor(c)))}</span></div>
      <div class="lc-f">${below > 300 ? `<span class="good">${esc(SEARCH_T.below(below))}</span>` : `<span>${esc(c.location)}</span>`}<span>${ic('truck', 15)}${esc(SEARCH_T.chips.delivery)}</span></div></div></li>`;
}
function searchHtml() {
  const f = S.filt, T = SEARCH_T, list = shown();
  const trims = [...new Set(LISTINGS.map((l) => l.trim))], drives = [...new Set(LISTINGS.map((l) => l.drive))];
  const checks = (k, vals) => vals.map((v) => `<label class="ck"><input type="checkbox" data-f="filt-${k}" value="${esc(v)}"${f[k].has(v) ? ' checked' : ''}><span>${esc(v)}</span><em>${LISTINGS.filter((l) => l[k] === v).length}</em></label>`).join('');
  const radios = (k, opts) => opts.map(([v, l]) => `<label class="ck"><input type="radio" name="filt-${k}" data-f="filt-${k}" value="${v}"${f[k] === v ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('');
  return `<div class="srp">
    <form class="srp-bar" data-form="search" role="search"><label class="srp-q">${ic('search', 18)}<input type="text" value="${esc(T.field)}" aria-label="${esc(T.searchLabel)}" enterkeyhint="search"></label><span class="srp-loc">${ic('pin', 16)}${esc(SEARCH.near)} ${esc(SEARCH.zip)}</span><button type="submit" class="btn sm">${esc(T.go)}</button></form>
    <div class="srp-grid">
      <aside class="filt" aria-label="${esc(T.filters)}"><div class="filt-h"><b>${esc(T.filters)}</b>${filtered() ? `<button type="button" class="link" data-a="clear">${esc(T.clear)}</button>` : ''}</div>
        <fieldset><legend>${esc(T.groups.trim)}</legend>${checks('trim', trims)}</fieldset>
        <fieldset><legend>${esc(T.groups.drive)}</legend>${checks('drive', drives)}</fieldset>
        <fieldset><legend>${esc(T.groups.price)}</legend>${radios('price', T.price)}</fieldset>
        <fieldset><legend>${esc(T.groups.miles)}</legend>${radios('miles', T.miles)}</fieldset></aside>
      <div class="res"><header><h1>${esc(T.title)}</h1><div class="res-meta"><span>${esc(T.count(list.length))}</span><select data-f="sort" aria-label="${esc(T.sortLabel)}">${T.sorts.map(([v, l]) => `<option value="${v}"${f.sort === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div></header>
        <div class="qf" role="group" aria-label="${esc(T.groups.trim)}">${trims.map((t) => `<button type="button" class="chip${f.trim.has(t) ? ' on' : ''}" data-a="qf" data-v="${esc(t)}" aria-pressed="${f.trim.has(t)}">${esc(t)}</button>`).join('')}</div>
        ${list.length ? `<ul class="cards">${list.map(cardHtml).join('')}</ul><p class="res-more">${esc(T.more)}</p>` : `<div class="empty"><b>${esc(T.empty.title)}</b><p>${esc(T.empty.body)}</p><button type="button" class="btn ghost" data-a="clear">${esc(T.empty.cta)}</button></div>`}
      </div></div>
    <footer class="ft"><span>${esc(SHELL.footer.line)}</span><span>${SHELL.footer.links.map(esc).join(' · ')}</span></footer></div>`;
}

/* ---------- vehicle detail ---------- */
const photosOf = (c) => c.photos || [{ src: c.photo, alt: 'Front three-quarter view' }];
function setPhoto(i) {
  const ph = photosOf(S.car); S.photo = (i + ph.length) % ph.length;
  const img = $('#galImg'); if (!img) return;
  img.src = ph[S.photo].src; img.alt = `${carName(S.car)}. ${ph[S.photo].alt}`;
  $('#galN').textContent = DETAIL_T.photoCount(S.photo + 1, ph.length);
  $$('[data-a=photo]', view).forEach((b) => { const on = Number(b.dataset.v) === S.photo; b.classList.toggle('on', on); b.setAttribute('aria-current', String(on)); if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
}
function detailHtml() {
  const c = S.car, T = DETAIL_T, ph = photosOf(c), below = c.market - c.price, on = S.saved.has(c.id);
  const feats = c.features || T.featuresBasic, few = 8, hist = c.history || T.historyBasic;
  const perk = (v) => (typeof v === 'function' ? v(dayShort(addDays(DELIVERY.firstDay))) : v);
  return `<div class="vdp">
    <nav class="crumbs" aria-label="Breadcrumb"><button type="button" class="link" data-a="home">${ic('left', 15, 2.2)}${esc(T.backToResults)}</button><span>${T.crumbs.map(esc).join(' / ')} / ${esc(c.trim)}</span></nav>
    <div class="vdp-grid">
      <div class="gal"><div class="gal-stage" id="galStage"><img id="galImg" src="${ph[S.photo].src}" alt="${esc(carName(c))}. ${esc(ph[S.photo].alt)}" width="1264" height="848">
          ${ph.length > 1 ? `<button type="button" class="gal-nav gal-prev" data-a="photo-step" data-v="-1" aria-label="${esc(T.prev)}">${ic('left', 20, 2.2)}</button><button type="button" class="gal-nav gal-next" data-a="photo-step" data-v="1" aria-label="${esc(T.next)}">${ic('right', 20, 2.2)}</button>` : ''}
          <span class="gal-n" id="galN"${ph.length > 1 ? '' : ' hidden'}>${esc(T.photoCount(S.photo + 1, ph.length))}</span>
          <button type="button" class="lc-save${on ? ' on' : ''}" data-a="save" data-v="${c.id}" aria-pressed="${on}" aria-label="${esc(on ? SEARCH_T.saved : SEARCH_T.save)}">${ic('heart', 18, 2)}</button></div>
        ${ph.length > 1 ? `<div class="gal-thumbs">${ph.map((p, i) => `<button type="button" class="${i === S.photo ? 'on' : ''}" data-a="photo" data-v="${i}" aria-label="${esc(T.photo(i + 1))}: ${esc(p.alt)}" aria-current="${i === S.photo}"><img src="${p.src}" alt="" loading="lazy" width="158" height="106"></button>`).join('')}</div>` : ''}</div>
      <aside class="buy"><span class="deal ${c.deal === 'Great price' ? 'great' : ''}">${esc(c.deal)}</span>
        <h1>${c.year} ${esc(c.make)} ${esc(c.model)} <span>${esc(c.trim)}</span></h1><p class="buy-sub">${esc(T.sub(c))}</p>
        <div class="buy-price"><b>${money(c.price)}</b><span>${esc(below > 300 ? T.below(below) : T.above)}</span></div>
        <div class="buy-est"><div><b>${esc(T.est(estFor(c)))}</b><span>${esc(T.estNote(FINANCE.down, FINANCE.term, FINANCE.estimateApr))}</span></div>${credit('loan')}</div>
        <button type="button" class="btn wide lg" data-a="start">${esc(T.cta)}</button><p class="buy-hold">${esc(T.hold)}</p>
        <ul class="perks">${T.perks.map(([i, v]) => `<li>${ic(i, 18)}<span>${esc(perk(v))}</span></li>`).join('')}</ul></aside>
      <div class="info">
        <section id="specs"><h2>${esc(T.specsTitle)}</h2><dl class="specs">${T.specs(c).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
        <section id="history"><h2>${esc(T.historyTitle)}</h2><ul class="hist">${hist.map((h) => `<li><span class="okc">${ic('check', 15, 2.8)}</span><div><b>${esc(h.title)}</b><span>${esc(h.sub)}</span></div></li>`).join('')}</ul><p class="note">${esc(T.historyNote)}</p></section>
        <section id="features"><h2>${esc(T.featuresTitle)}</h2><ul class="feats">${(S.featAll ? feats : feats.slice(0, few)).map((x) => `<li>${ic('check', 15, 2.4)}${esc(x)}</li>`).join('')}</ul>${feats.length > few ? `<button type="button" class="link" data-a="feats" aria-expanded="${S.featAll}">${esc(S.featAll ? T.featuresLess : T.featuresMore(feats.length))}</button>` : ''}</section>
        <section class="cert"><span class="cert-ic">${MARK(34)}</span><div><h2>${esc(T.inspectTitle)}</h2><p>${esc(T.inspect)}</p></div></section>
      </div></div>
    <div class="mbar"><div><b>${money(c.price)}</b><span>${esc(T.est(estFor(c)))}</span></div><button type="button" class="btn" data-a="start">${esc(T.mobileCta)}</button></div>
    <footer class="ft"><span>${esc(SHELL.footer.line)}</span><span>${SHELL.footer.links.map(esc).join(' · ')}</span></footer></div>`;
}

/* ---------- the purchase flow: stepper, order summary, steps ---------- */
function stepperHtml() {
  const i = stepIdx(S.step);
  return `<ol class="steps" aria-label="${esc(FLOW_T.progress)}">${STEPS.map((s, k) => {
    const state = s.id === S.step ? 'cur' : S.done[s.id] ? 'done' : '';
    return `<li class="${state}"><button type="button" data-a="goto" data-v="${s.id}"${canGo(s.id) ? '' : ' disabled'}${s.id === S.step ? ' aria-current="step"' : ''}><i>${S.done[s.id] && s.id !== S.step ? ic('check', 13, 3.2) : k + 1}</i><span>${esc(s.nav || s.label)}</span></button></li>`;
  }).join('')}</ol>
  <div class="steps-m"><b>${esc(STEPS[i].label)}</b><span>${esc(FLOW_T.stepOf(i + 1, STEPS.length))}</span><div class="steps-bar">${STEPS.map((s, k) => `<i class="${k < i || S.done[s.id] ? 'done' : k === i ? 'cur' : ''}"></i>`).join('')}</div></div>`;
}
const row = (k, v, cls = '') => `<div class="${cls}"><dt>${esc(k)}</dt><dd>${v}</dd></div>`;
function sumBlocks() {
  const T = SUMMARY_T, b = B(), f = S.fin;
  const price = `<dl class="sum-l">${row(T.price, money(b.price))}${row(T.taxesFees, money(b.tax + b.titleRegistration + b.documentation))}${row(S.del.mode === 'pickup' && S.done.delivery ? T.pickup : T.delivery, T.free, 'good')}${S.trade === 'later' ? row(T.tradeLater, esc(T.tradeLaterV), 'mut') : ''}${row(T.total, money(b.total), 'tot')}</dl>`;
  let pay = `<p class="sum-pend">${esc(T.payPending)}</p>`, due = null;
  if (S.pay.method === 'lt' && f.approved) {
    const o = offerOf(f.offer), n = nums(o);
    pay = `<dl class="sum-l">${row(T.downDue, money(f.down))}${row(T.financed, money(n.financed))}${row(T.monthly, `<b>${money(n.payment)}</b>${esc(T.perMo)}`, 'big')}</dl><div class="sum-who">${lmark(o.lender)}<span><b>${esc(o.lender)}</b><em>${o.apr.toFixed(2)}% APR · ${esc(T.months(o.term))}</em>${credit('loan')}</span></div>`;
  } else if (S.pay.method === 'lt') {
    pay = `<dl class="sum-l">${row(T.down, money(f.down))}${row(T.estimate, `about ${money(estFor(S.car, f.down, f.term))}${esc(T.perMo)}`, 'mut')}</dl><p class="sum-pend">${esc(T.estimateNote)}</p>`;
  } else if (S.pay.method === 'cash' && S.done.payment) { pay = `<p class="sum-line">${esc(T.cash)}</p>`; due = b.total; }
  else if (S.pay.method === 'own' && S.done.payment) { pay = `<p class="sum-line">${esc(T.own)}: ${esc(S.pay.lender)}</p>`; }
  let ins = `<p class="sum-pend">${esc(T.insPending)}</p>`;
  if (S.done.insurance) {
    const q = S.ins.result === 'switched' ? quoteOf(S.ins.quote) : CURRENT_WITH_TACOMA;
    ins = `<div class="sum-who">${cmark(q.icon)}<span><b>${esc(q.carrier)}</b><em>${money(q.total)}${esc(T.perYear)} · ${esc(S.ins.result === 'switched' ? T.insBoth : T.insAdded)}</em>${credit('insurance')}</span></div>`;
  }
  return { price, pay: `<h3>${esc(T.payTitle)}</h3>${pay}${due != null ? `<dl class="sum-l due">${row(T.dueToday, money(due), 'tot')}</dl>` : ''}`, ins: `<h3>${esc(T.insTitle)}</h3>${ins}` };
}
let sumLast = {};
function paintSummary(flashAll) {
  const c = S.car, b = B(), blocks = sumBlocks(), sum = $('#sum'); if (!sum) return;
  const monthly = loanDone() ? ` · ${money(nums(offerOf(S.fin.offer)).payment)}${SUMMARY_T.perMo}` : '';
  $('#sumBar').innerHTML = `<span class="sum-bar-t">${ic('doc', 17)}${esc(SUMMARY_T.toggle)}</span><span class="sum-bar-v"><b>${money(b.total)}</b>${esc(monthly)}${ic('down', 16, 2.4)}</span>`;
  $('#sumBar').setAttribute('aria-expanded', String(S.sumOpen)); sum.classList.toggle('open', S.sumOpen);
  $('#sumCar').innerHTML = `<b>${c.year} ${esc(c.make)} ${esc(c.model)}</b><span>${esc(c.trim)} · ${esc(DETAIL_T.sub(c).split(' · ').slice(1).join(' · '))}</span>`;
  $('#sumNote').hidden = !!S.pay.method;
  for (const k of ['price', 'pay', 'ins']) {
    const n = $(`#sum-${k}`); if (sumLast[k] === blocks[k] && !flashAll) continue;
    n.innerHTML = blocks[k];
    if (sumLast[k] !== undefined || flashAll) { n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash'); }
    sumLast[k] = blocks[k];
  }
}
const actions = (next, opts = {}) => `<div class="actions${next ? '' : ' soft'}">${opts.noBack ? '' : `<button type="button" class="btn ghost" data-a="${opts.backA || 'back'}">${esc(opts.back || FLOW_T.back)}</button>`}${next ? `<button type="button" class="btn" data-a="${opts.a || 'next'}"${opts.disabled ? ' disabled' : ''}>${esc(next)}</button>` : ''}</div>`;
const optCard = (a, o, on, extra = '') => `<button type="button" class="opt${on ? ' on' : ''}" data-a="${a}" data-v="${o.id}" aria-pressed="${!!on}"><span class="opt-r" aria-hidden="true"></span><span class="opt-b"><b>${esc(o.title)}${o.credit ? ` <span class="opt-c"><img src="${LEAF}" alt="">${esc(o.credit)}</span>` : ''}</b><span>${esc(typeof o.sub === 'function' ? o.sub(S.det.address.split(',').slice(0, 2).join(',')) : o.sub)}</span>${extra}</span>${o.badge ? `<em class="opt-badge">${esc(o.badge)}</em>` : ''}</button>`;
const field = (id, label, value, attrs = '', tag = '') => `<label class="fld" for="${id}"><span>${esc(label)}${tag ? `<em>${esc(tag)}</em>` : ''}</span><input id="${id}" data-f="${id}" value="${esc(value)}" autocomplete="off" ${attrs}></label>`;
const working = (title, sub, lines, at, names) => `<div class="work"><span class="spin big" aria-hidden="true"></span><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}${lines ? `<ul class="work-l">${lines.map((l, i) => `<li class="${i < at ? 'done' : i === at ? 'cur' : ''}"><i>${i < at ? ic('check', 13, 3.2) : ''}</i>${esc(l)}</li>`).join('')}</ul>` : ''}${names ? `<ul class="work-n">${names.map((x, i) => `<li style="--d:${i * 320}ms">${esc(x)}</li>`).join('')}</ul>` : ''}</div>`;
const advisor = (name, text) => `<div class="advisor"><img src="${LEAF}" alt=""><div><b>${esc(name)}</b><p>${esc(text)}</p></div></div>`;

/* step 1 */
function detailsHtml() {
  const T = DETAILS_T, d = S.det;
  if (d.stage === 'start') return `<h1>${esc(T.title)}</h1><p class="lead">${esc(T.sub)}</p>
    <div class="panel start"><button type="button" class="gbtn" data-a="google">${G_LOGO(20)}<span>${esc(T.google)}</span></button><p class="why">${esc(T.why)}</p><div class="or"><span>${esc(T.or)}</span></div><button type="button" class="btn ghost wide" data-a="manual">${esc(T.manual)}</button></div>${actions(null)}`;
  const tag = d.google ? T.fromGoogle : '';
  return `<h1>${esc(T.confirmTitle)}</h1><p class="lead">${esc(T.confirmSub)}</p>
    <div class="panel">${d.google ? `<p class="gsigned">${G_LOGO(16)}<span>${esc(T.signedIn(d.email))}</span></p>` : ''}
      <div class="grid2">${field('f-name', T.fields.name, d.name, 'type="text"', tag)}${field('f-phone', T.fields.phone, d.phone, 'type="tel" inputmode="tel"', tag)}</div>${field('f-email', T.fields.email, d.email, 'type="email" inputmode="email"', tag)}</div>
    <div class="panel"><h2>${esc(T.addressTitle)}</h2><p class="sub">${esc(T.addressSub)}</p>
      <div class="addr">${field('f-addr', T.addressLabel, d.address, `type="text" placeholder="${esc(T.addressPlaceholder)}" role="combobox" aria-expanded="false" aria-controls="addrList" aria-autocomplete="list"`)}<ul class="addr-list" id="addrList" role="listbox" aria-label="${esc(T.addressPick)}" hidden></ul></div>
      <p class="addr-ok" id="addrOk"${d.addrOk ? '' : ' hidden'}>${ic('check', 15, 2.8)}${esc(T.addressOk)}</p></div>
    ${actions(T.cta, { disabled: !detailsValid() })}`;
}
const detailsValid = () => { const d = S.det; return d.name.trim().length > 2 && /.+@.+\..+/.test(d.email) && digits(d.phone) > 999999 && (d.addrOk || d.address.trim().length > 9); };
function paintAddr() {
  const list = $('#addrList'), input = $('#f-addr'); if (!list) return;
  const q = S.det.address.trim().toLowerCase(), hits = q.length >= 3 && !S.det.addrOk ? ADDRESS_SUGGESTIONS.filter((a) => a.toLowerCase().startsWith(q.slice(0, 3))) : [];
  list.innerHTML = hits.map((a, i) => `<li role="option"><button type="button" data-a="addr-pick" data-v="${i}">${ic('pin', 16)}<span>${esc(a)}</span></button></li>`).join('');
  list.hidden = !hits.length; input.setAttribute('aria-expanded', String(!!hits.length));
  $('#addrOk').hidden = !S.det.addrOk;
}
function googleHtml() {
  const T = GOOGLE_T, p = GOOGLE_PROFILE;
  const head = `<header class="g-h">${G_LOGO(18)}<span>${esc(T.heading)}</span><button type="button" data-a="g-close" aria-label="${esc(T.close)}">${ic('x', 18)}</button></header>`;
  const acct = `<span class="g-av" aria-hidden="true">${esc(p.initials)}</span><span class="g-id"><b>${esc(p.name)}</b><small>${esc(p.email)}</small></span>`;
  let body = '';
  if (S.gdlg === 'choose') body = `<div class="g-app">${MARK(40)}</div><h2 id="gT">${esc(T.choose)}</h2><p class="g-to">${esc(T.to)}</p>
    <ul class="g-list"><li><button type="button" data-a="g-pick">${acct}</button></li><li><button type="button" data-a="g-other"><span class="g-av ghost" aria-hidden="true">${ic('userplus', 18)}</span><span class="g-id"><b>${esc(T.other)}</b></span></button></li></ul>${S.gNote ? `<p class="g-note">${esc(T.otherNote)}</p>` : ''}`;
  else if (S.gdlg === 'consent') body = `<div class="g-app">${MARK(40)}</div><h2 id="gT">${esc(T.consentTitle)}</h2><div class="g-chip">${acct}</div><p class="g-lead">${esc(T.consentLead)}</p>
    <ul class="g-scopes">${T.scopes.map((s, i) => `<li>${ic(['user', 'mail', 'phone'][i], 18)}<span>${esc(s)}</span></li>`).join('')}</ul><p class="g-fine">${esc(T.consentFine)}</p>
    <div class="g-btns"><button type="button" class="g-b ghost" data-a="g-close">${esc(T.cancel)}</button><button type="button" class="g-b" data-a="g-allow">${esc(T.allow)}</button></div>`;
  else body = `<div class="g-work"><span class="spin big" aria-hidden="true"></span><h2 id="gT">${esc(T.working)}</h2></div>`;
  return `<div class="gdlg" role="dialog" aria-modal="true" aria-labelledby="gT">${head}<div class="g-body">${body}</div><footer class="g-sim">${ic('info', 14, 2)}${esc(T.simulated)}</footer></div>`;
}
let gFrom = null;
function paintGoogle() {
  const was = !gov.hidden;
  if (!S.gdlg) { gov.hidden = true; gov.innerHTML = ''; if (was && gFrom && gFrom.isConnected) gFrom.focus({ preventScroll: true }); return; }
  gov.innerHTML = googleHtml(); gov.hidden = false;
  const first = $('[data-a=g-pick], [data-a=g-allow]', gov); if (first && !S.auto) first.focus({ preventScroll: true });
}

/* step 2 */
function tradeHtml() {
  const T = TRADE_T;
  return `<h1>${esc(T.title)}</h1><p class="lead">${esc(T.sub)}</p><div class="opts">${T.options.map((o) => optCard('trade', o, S.trade === o.id)).join('')}</div>
    ${S.trade === 'later' ? `<p class="callout">${ic('info', 18)}<span>${esc(T.laterNote)}</span></p>` : ''}${actions(T.cta, { disabled: !S.trade })}`;
}

/* step 3: payment, with the LendingTree financing module inside it */
function moduleHtml(kind, inner, prog) {
  const T = kind === 'loan' ? FIN : INS;
  return `<section class="ltm" id="ltm" aria-label="${esc(SHELL.credit[kind])}">
    <header class="ltm-h"><span class="ltm-brand"><img src="${LEAF}" alt=""><span><b>${esc(SHELL.credit[kind])}</b>${kind === 'insurance' ? `<small>${esc(SHELL.credit.qw)}</small>` : ''}</span></span>${prog ? `<span class="ltm-step"><b>${esc(prog.label)}</b>${esc(FIN.stepOf(prog.i, prog.n))}</span>` : `<span class="ltm-step">${ic('lock', 14, 2)}${esc(FIN.secure)}</span>`}</header>
    ${prog ? `<div class="ltm-prog" role="progressbar" aria-valuemin="0" aria-valuemax="${prog.n}" aria-valuenow="${prog.i}"><i style="width:${(prog.i / prog.n) * 100}%"></i></div>` : ''}
    <div class="ltm-b">${inner}</div>
    <footer class="ltm-f"><span>${ic('lock', 14, 2)}${esc(T.foot)}</span>${EMBED ? '' : `<button type="button" class="link" data-a="ask">${esc(T.ask)}</button>`}</footer></section>`;
}
const finValid = () => { const f = S.fin; return f.stage === 'income' ? f.verified || (f.employer.trim().length > 1 && digits(f.income) > 999) || (f.status !== FIN.income.statuses[0] && digits(f.income) > 999) : f.stage === 'housing' ? f.housing === FIN.housing.statuses[1] || digits(f.housingPay) > 0 : f.stage === 'consent' ? f.agree : f.stage === 'stips' ? f.stips.identity && f.stips.income && !f.busy : true; };
const chips = (a, opts, cur, labelOf = (v) => v) => `<div class="chips">${opts.map((v) => `<button type="button" class="chip${v === cur ? ' on' : ''}" data-a="${a}" data-v="${esc(v)}" aria-pressed="${v === cur}">${esc(labelOf(v))}</button>`).join('')}</div>`;
function estHtml() {
  const f = S.fin, T = FIN.terms;
  return `<div><span>${esc(T.estTitle)}</span><b>${money(estFor(S.car, f.down, f.term))}<small>${esc(T.perMo)}</small></b></div><dl>${row(T.financed, money(financed()))}${row(SUMMARY_T.term, esc(T.months(f.term)))}</dl><p>${esc(T.estNote(FINANCE.estimateApr))}</p>`;
}
function offersHtml() {
  const T = FIN.offers, list = AUTO_LOAN_OFFERS.map((o) => ({ o, n: nums(o) })), rec = recOffer(), max = Math.max(...list.map((x) => x.n.interest));
  const by = Object.fromEntries(list.map((x) => [x.o.id, { ...x.o, ...x.n }]));
  return `<h2>${esc(T.title(list.length))}</h2><p class="sub">${esc(T.sub(financed()))}</p>
    <div class="offers">${list.map(({ o, n }) => `<article class="offer${o.id === rec ? ' rec' : ''}">${o.id === rec ? `<em class="rib">${esc(T.rec)}</em>` : ''}<header>${lmark(o.lender)}<div><b>${esc(o.lender)}</b><span class="tag">${esc(o.tag)}</span></div></header>
        <div class="offer-big"><b>${money(n.payment)}</b><span>${esc(T.perMo)}</span></div>
        <dl>${row(T.apr, `${o.apr.toFixed(2)}%`)}${row(SUMMARY_T.term, esc(T.term(o.term)))}${row(T.interest, money(n.interest))}</dl><p class="offer-perk">${esc(o.perk)}</p>
        <button type="button" class="btn${o.id === rec ? '' : ' ghost'} wide" data-a="pick-offer" data-v="${o.id}" aria-label="${esc(T.choose)} ${esc(o.lender)}">${esc(T.choose)}</button></article>`).join('')}</div>
    <figure class="bars"><figcaption><b>${esc(T.barTitle)}</b><span>${esc(T.barNote)}</span></figcaption>${list.map(({ o, n }) => `<div class="bar-row${o.id === rec ? ' rec' : ''}"><span class="bar-name">${lmark(o.lender)}<span><b>${esc(o.lender)}</b><small>${o.apr.toFixed(2)}% · ${esc(T.term(o.term))}</small></span></span><span class="bar-track"><i style="width:${(n.interest / max) * 100}%"></i></span><span class="bar-val"><b>${money(n.interest)}</b></span></div>`).join('')}</figure>
    ${advisor(T.advisorName, T.advisor[rec]({ term: S.fin.term, bofa: by.bofa, chase: by.chase }))}
    <div class="actions soft"><button type="button" class="btn ghost" data-a="fin-adjust">${esc(T.adjust)}</button></div>`;
}
function stipsHtml() {
  const f = S.fin, o = offerOf(f.offer), T = FIN.stips, I = T.items, n = Number(f.stips.identity) + Number(f.stips.income), ready = f.stips.identity && f.stips.income && !f.busy;
  const li = (id, title, state, body) => `<li class="${state}"><span class="st-dot">${state === 'done' ? ic('check', 14, 3) : ''}</span><div class="st-b"><b>${esc(title)}</b>${body}</div></li>`;
  const spin = (t) => `<p class="working"><span class="spin" aria-hidden="true"></span>${esc(t)}</p>`;
  return `<header class="app-h"><h2>${esc(T.title(o))}</h2><span class="app-n">${esc(T.count(n, 2))}</span></header>
    <ol class="app">
      ${li('identity', I.identity.title, f.stips.identity ? 'done' : 'active', f.stips.identity ? `<p class="st-done">${esc(I.identity.done)}</p>` : spin(I.identity.working))}
      ${li('income', I.income.title, f.stips.income ? 'done' : f.stips.identity ? 'active' : '', f.stips.income ? `<p class="st-done">${esc((f.verified === 'early' ? I.income.already : I.income.done)(APPLICANT.employer, APPLICANT.income))}</p>` : f.busy === 'income' ? spin(I.income.working) : f.stips.identity ? `<p>${esc(I.income.body(o))}</p><button type="button" class="btn sm" data-a="stip-income">${ic('lock', 15, 2)}${esc(I.income.cta)}</button>` : '')}
      ${li('insurance', I.insurance.title, 'next', `<span class="tag">${esc(I.insurance.tag)}</span><p>${esc(I.insurance.note(o))}</p>`)}
    </ol>${ready ? `<p class="approved">${ic('check', 16, 2.8)}${esc(T.approved(o))}</p>` : ''}
    ${actions(T.cta, { a: 'fin-next', backA: 'fin-back', disabled: !ready })}`;
}
function finHtml() {
  const f = S.fin, d = S.det, b = B(), back = { a: 'fin-next', backA: 'fin-back' };
  const idx = FIN_STEPS.findIndex((s) => s.id === f.stage), prog = idx >= 0 ? { i: idx + 1, n: FIN_STEPS.length, label: FIN_STEPS[idx].label } : null;
  let inner = '';
  if (f.stage === 'have') { const T = FIN.have; inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub)}</p>
      <div class="have"><div><h3>${esc(T.haveTitle)}</h3><dl class="have-l">${T.rows(d, S.car, b.total).map(([k, v, src]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd><em class="src">${src === 'Google' ? G_LOGO(11) : MARK(12)}${esc(src)}</em></div>`).join('')}</dl><p class="have-p"><img src="${LEAF}" alt="">${esc(T.profile)}</p></div>
        <div><h3>${esc(T.needTitle)}</h3><ol class="need">${T.needs.map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p class="have-t">${ic('bolt', 15, 2)}${esc(T.time)}</p></div></div>${actions(T.cta, back)}`; }
  if (f.stage === 'terms') { const T = FIN.terms; inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub)}</p>
      <div class="terms-g"><div><div class="fl">${esc(T.downLabel)}<b id="downV">${money(f.down)}</b></div><input type="range" class="range" id="f-down" data-f="f-down" min="0" max="${FINANCE.downMax}" step="500" value="${f.down}" aria-label="${esc(T.downAria)}">
          <div class="chips" id="downChips">${FINANCE.downChoices.map((v) => `<button type="button" class="chip${v === f.down ? ' on' : ''}" data-a="down" data-v="${v}" aria-pressed="${v === f.down}">${money(v)}</button>`).join('')}</div>
          <div class="fl">${esc(T.termLabel)}</div><div class="chips" id="termChips">${FINANCE.terms.map((v) => `<button type="button" class="chip${v === f.term ? ' on' : ''}" data-a="term" data-v="${v}" aria-pressed="${v === f.term}">${esc(T.months(v))}</button>`).join('')}</div></div>
        <div class="est" id="est" aria-live="polite">${estHtml()}</div></div>${actions(T.cta, back)}`; }
  if (f.stage === 'income') { const T = FIN.income; inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub)}</p>
      ${f.verified ? `<p class="verified">${ic('check', 16, 2.8)}<span>${esc(T.verified(APPLICANT.employer, APPLICANT.income))}</span></p>` : f.verifying ? `<p class="working pad"><span class="spin" aria-hidden="true"></span>${esc(T.verifying)}</p>` : `<div class="fl">${esc(T.statusLabel)}</div>${chips('emp', T.statuses, f.status)}
        <div class="grid2 top">${field('f-employer', T.employerLabel, f.employer, `type="text" placeholder="${esc(T.employerPh)}"`)}<label class="fld" for="f-income"><span>${esc(T.incomeLabel)}</span><span class="money-in"><i>$</i><input id="f-income" data-f="f-income" value="${esc(f.income)}" inputmode="numeric" autocomplete="off" placeholder="${esc(T.incomePh)}"></span></label></div>
        <div class="or"><span>${esc(T.or)}</span></div><button type="button" class="btn ghost" data-a="payroll">${ic('bolt', 16, 2)}${esc(T.verify)}</button><p class="fine">${esc(T.verifyNote)}</p>`}${actions(T.cta, { ...back, disabled: !finValid() })}`; }
  if (f.stage === 'housing') { const T = FIN.housing, none = f.housing === T.statuses[1]; inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub)}</p>
      <div class="fl">${esc(T.statusLabel)}</div>${chips('housing', T.statuses, f.housing)}
      ${none ? `<p class="fine top">${esc(T.none)}</p>` : `<div class="grid2 top"><label class="fld" for="f-housing"><span>${esc(T.payLabel)}</span><span class="money-in"><i>$</i><input id="f-housing" data-f="f-housing" value="${esc(f.housingPay)}" inputmode="numeric" autocomplete="off" placeholder="0"></span></label></div>`}${actions(T.cta, { ...back, disabled: !finValid() })}`; }
  if (f.stage === 'consent') { const T = FIN.consent; inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub)}</p>
      <p class="safe">${ic('shield', 20)}<span>${esc(T.safe)}</span></p>
      <div class="grid2"><label class="fld ro"><span>${esc(T.dob)}<em>${esc(T.sample)}</em></span><input value="${esc(APPLICANT.dob)}" readonly aria-readonly="true"></label><label class="fld ro"><span>${esc(T.ssn)}<em>${esc(T.sample)}</em></span><input value="•••  ••  ${esc(APPLICANT.ssnLast4)}" readonly aria-readonly="true"></label></div><p class="fine">${esc(T.sampleNote)}</p>
      <label class="agree"><input type="checkbox" id="agreeCredit" data-f="agreeCredit"${f.agree ? ' checked' : ''}><span>${esc(T.agree)}</span></label>${actions(T.cta, { ...back, disabled: !finValid() })}`; }
  if (f.stage === 'checking') { const T = FIN.checking; inner = working(T.title, T.sub, T.lines.map((l) => (typeof l === 'function' ? l(APPLICANT.creditScore) : l)), f.line, f.line >= 1 ? T.names : null); }
  if (f.stage === 'offers') inner = offersHtml();
  if (f.stage === 'stips') inner = stipsHtml();
  if (f.stage === 'sign') { const T = FIN.sign, o = offerOf(f.offer); inner = `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub(o))}</p>
      <dl class="terms">${T.terms(o, nums(o), S.car, f.down).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <button type="button" class="link" data-a="full" aria-expanded="${f.full}">${esc(T.fullLabel)}</button>${f.full ? `<p class="full">${esc(T.full)}</p>` : ''}
      <label class="sig" for="sig"><span>${esc(T.nameLabel)}</span><input type="text" id="sig" data-f="sig" value="${esc(f.sig)}" autocomplete="off" spellcheck="false" placeholder="${esc(d.name)}"${f.signing ? ' readonly' : ''}></label>
      <div class="actions"><button type="button" class="btn ghost" data-a="fin-back"${f.signing ? ' disabled' : ''}>${esc(FIN.back)}</button><button type="button" class="btn${f.signing ? ' busy' : ''}" data-a="sign"${f.signing || f.sig.trim().length < 3 ? ' disabled' : ''}>${f.signing ? `<span class="spin" aria-hidden="true"></span>${esc(T.signing)}` : esc(T.cta)}</button></div>`; }
  if (f.stage === 'approved') { const T = FIN.approved, o = offerOf(f.offer), n = nums(o); inner = `<div class="party"><span class="seal">${confetti()}<svg viewBox="0 0 52 52" width="44" height="44" aria-hidden="true"><path d="M15 27l8 8 14-16"/></svg></span><h2>${esc(T.title)}</h2><p>${esc(T.body(o))}</p>
      <dl class="facts">${T.facts(o, n).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><div class="party-who">${lmark(o.lender)}<b>${esc(o.lender)}</b></div></div>
      <div class="actions"><button type="button" class="btn" data-a="next">${esc(T.cta)}</button></div>`; }
  return moduleHtml('loan', inner, prog && f.stage !== 'approved' ? prog : null);
}
function paymentHtml() {
  const T = PAY_T, b = B(), m = S.pay.method, f = S.fin;
  if (m === 'lt' && !f.paused) return `<div class="pay-on"><button type="button" class="link" data-a="pay-change">${ic('left', 15, 2.2)}${esc(T.done.change)}</button><span><b>${esc(T.options[0].title)}</b>, ${esc(T.options[0].credit)}</span></div>${finHtml()}`;
  if (S.done.payment && m) return `<h1>${esc(T.done.title)}</h1><div class="panel"><p class="sum-line big">${ic('check', 18, 2.8)}${esc(m === 'cash' ? T.cash.summary(b.total) : T.own.summary(S.pay.lender))}</p></div>${actions(T.done.cta, { a: 'next', backA: 'pay-change', back: T.done.change })}`;
  const sub = m === 'cash' ? `<div class="opt-x"><p>${esc(T.cash.body(b.total))}</p><button type="button" class="btn" data-a="pay-done">${esc(T.cash.cta)}</button></div>`
    : m === 'own' ? `<div class="opt-x"><p>${esc(T.own.body)}</p>${field('f-lender', T.own.label, S.pay.lender, `type="text" placeholder="${esc(T.own.placeholder)}"`)}<button type="button" class="btn" data-a="pay-done"${S.pay.lender.trim().length > 1 ? '' : ' disabled'}>${esc(T.own.cta)}</button></div>` : '';
  return `<h1>${esc(T.title)}</h1><p class="lead">${esc(T.sub(b.total))}</p>
    ${f.paused ? `<div class="saved"><span class="saved-ic"><img src="${LEAF}" alt=""></span><div><b>${esc(T.saved.title)}</b><p>${esc(T.saved.body)}</p></div><button type="button" class="btn" data-a="fin-resume">${esc(T.saved.resume)}</button></div>` : ''}
    <div class="opts">${T.options.map((o) => `${optCard('pay', o, m === o.id && !f.paused)}${m === o.id && o.id !== 'lt' ? sub : ''}`).join('')}</div>${actions(null)}`;
}

/* step 4: insurance, also by LendingTree */
function idCard(q, when) {
  const C = INS.card, c = CARRIER_COLOR[q.carrier] || '#24364d';
  return `<div class="idc" style="background:linear-gradient(135deg,${c},color-mix(in srgb,${c} 58%,#000))"><div class="idc-h">${cmark(q.icon)}<b>${esc(q.carrier)}</b><span>${esc(C.title)}</span></div>
    <dl><div><dt>${esc(C.insured)}</dt><dd>${esc(S.det.name || GOOGLE_PROFILE.name)}</dd></div><div><dt>${esc(C.policy)}</dt><dd>${esc(C.number)}</dd></div><div class="w2"><dt>${esc(C.vehicle)}</dt><dd>${esc(carName(S.car))}</dd></div><div><dt>${esc(C.vin)}</dt><dd>${esc(C.vinMask(S.car.vinTail))}</dd></div><div><dt>${esc(C.effective)}</dt><dd>${esc(when)}</dd></div></dl></div>`;
}
function quotesHtml() {
  const T = INS.quotes, car = S.car, now = CURRENT_WITH_TACOMA, rec = quoteOf(INSURANCE_RECOMMEND), low = [...TWO_CAR_QUOTES].sort((a, b) => a.total - b.total)[0];
  const bar = (q) => `<span class="bar-track"><i style="width:${(q.total / now.total) * 100}%"></i></span>`;
  return `<h2>${esc(T.title)}</h2><p class="sub">${esc(T.sub(car))}</p>
    <div class="quotes"><div class="quote now"><div class="q-id">${cmark(now.icon)}<div><b>${esc(now.carrier)}</b><span class="tag grey">${esc(T.nowTag)}</span></div></div><div class="q-bar">${bar(now)}<small>${esc(T.split(car, now))} · ${esc(T.cover(now))}</small></div><div class="q-val"><b>${money(now.total)}</b><span>${esc(T.perYear)}</span></div></div>
      ${TWO_CAR_QUOTES.map((q) => `<div class="quote${q.id === rec.id ? ' rec' : ''}">${q.id === rec.id ? `<em class="rib">${esc(T.rec)}</em>` : ''}<div class="q-id">${cmark(q.icon)}<div><b>${esc(q.carrier)}</b><span class="tag">${esc(q.tag)}</span></div></div><div class="q-bar">${bar(q)}<small>${esc(T.split(car, q))} · ${esc(T.cover(q))}</small></div><div class="q-val"><b>${money(q.total)}</b><span class="good">${esc(T.save(q.saving))}</span></div>
        <button type="button" class="btn${q.id === rec.id ? '' : ' ghost'} sm" data-a="pick-quote" data-v="${q.id}">${esc(T.choose(q))}</button></div>`).join('')}</div>
    ${advisor(T.advisorName, T.advisor(rec, low, car))}
    <div class="actions soft"><button type="button" class="btn ghost" data-a="ins-back">${esc(FLOW_T.back)}</button><button type="button" class="btn ghost" data-a="ins-choice" data-v="add">${esc(T.stay)}</button></div>`;
}
function insuranceHtml() {
  const n = S.ins, car = S.car, when = INS.when;
  let inner = '';
  if (n.paused) return `<h1>${esc(STEPS[3].label)}</h1><div class="saved"><span class="saved-ic"><img src="${LEAF}" alt=""></span><div><b>${esc(INS.saved.title)}</b><p>${esc(INS.saved.body)}</p></div><button type="button" class="btn" data-a="ins-resume">${esc(INS.saved.resume)}</button></div>${actions(null)}`;
  if (n.stage === 'prompt') { const T = INS.prompt; inner = `<h2 class="q">${esc(T.title(car))}</h2><p class="sub">${esc(T.sub)}</p>
      <div class="cur-pol"><div class="q-id">${cmark(CURRENT_POLICY.icon)}<div><b>${esc(CURRENT_POLICY.carrier)}</b><span>${esc(T.currentTitle)}</span></div></div><dl>${T.currentRows.map(([k, v]) => row(k, esc(v))).join('')}</dl></div>
      <div class="opts two">${T.options.map((o) => optCard('ins-choice', o, false)).join('')}</div>${actions(null)}`; }
  if (n.stage === 'adding') inner = working(INS.adding.title(car), null, INS.adding.lines, n.line);
  if (n.stage === 'added') { const T = INS.added; inner = `<div class="party left"><span class="seal sm"><svg viewBox="0 0 52 52" width="30" height="30" aria-hidden="true"><path d="M15 27l8 8 14-16"/></svg></span><div><h2>${esc(T.title(car))}</h2><p>${esc(T.body)}</p></div></div>
      <div class="bound"><dl class="lines">${T.rows.map(([k, v]) => row(k, esc(v))).join('')}</dl>${idCard(CURRENT_WITH_TACOMA, when.card)}</div>
      <button type="button" class="link under" data-a="ins-choice" data-v="shop">${esc(T.reshop)}</button><div class="actions"><button type="button" class="btn" data-a="next">${esc(T.cta)}</button></div>`; }
  if (n.stage === 'checking') inner = working(INS.checking.title, INS.checking.sub(car), null, 0, INS.checking.names);
  if (n.stage === 'quotes') inner = quotesHtml();
  if (n.stage === 'confirm') { const T = INS.confirm, q = quoteOf(n.quote); inner = `<h2>${esc(T.title(q))}</h2><p class="sub">${esc(T.sub)}</p>
      <ol class="happen">${T.steps(q, car, refund()).map(([k, v], i) => `<li><i>${i + 1}</i><div><b>${esc(k)}</b><p>${esc(v)}</p></div></li>`).join('')}</ol>
      <dl class="cov">${T.coverage(q).map(([k, v]) => row(k, esc(v))).join('')}</dl>
      <label class="agree"><input type="checkbox" id="agreeSwitch" data-f="agreeSwitch"${n.agree ? ' checked' : ''}><span>${esc(T.agree(q))}</span></label>
      ${actions(T.cta, { a: 'bind', backA: 'ins-quotes', back: T.back, disabled: !n.agree })}`; }
  if (n.stage === 'binding') { const q = quoteOf(n.quote); inner = working(INS.binding.title(q), null, INS.binding.lines(q), n.line); }
  if (n.stage === 'bound') { const T = INS.bound, q = quoteOf(n.quote); inner = `<div class="party left"><span class="seal sm">${confetti()}<svg viewBox="0 0 52 52" width="30" height="30" aria-hidden="true"><path d="M15 27l8 8 14-16"/></svg></span><div><h2>${esc(T.title)}</h2><p>${esc(T.body(q))}</p></div></div>
      <div class="bound"><dl class="lines">${T.rows(q, refund(), loanDone() ? offerOf(S.fin.offer).lender : null).map(([k, v]) => row(k, esc(v))).join('')}</dl>${idCard(q, when.card)}</div>
      <button type="button" class="link under" data-a="ins-change">${esc(INS.done.change)}</button><div class="actions"><button type="button" class="btn" data-a="next">${esc(T.cta)}</button></div>`; }
  return `<h1 class="vh">${esc(STEPS[3].label)}</h1>${moduleHtml('insurance', inner, null)}`;
}

/* step 5 */
function deliveryHtml() {
  const T = DELIVERY_T, d = S.del, days = Array.from({ length: DELIVERY.days }, (_, i) => addDays(DELIVERY.firstDay + i));
  return `<h1>${esc(T.title)}</h1><div class="opts">${T.options.map((o) => optCard('del-mode', o, d.mode === o.id)).join('')}</div>
    <div class="panel">${d.mode === 'delivery' ? `<div class="fl">${esc(T.dayLabel)}</div><div class="chips" id="dayChips">${days.map((x, i) => `<button type="button" class="chip day${i === d.day ? ' on' : ''}" data-a="day" data-v="${i}" aria-pressed="${i === d.day}"><b>${esc(fmt(x, { weekday: 'short' }))}</b>${esc(fmt(x, { month: 'short', day: 'numeric' }))}</button>`).join('')}</div>
      <div class="fl">${esc(T.windowLabel)}</div><div class="chips" id="winChips">${DELIVERY.windows.map((w, i) => `<button type="button" class="chip${i === d.win ? ' on' : ''}" data-a="win" data-v="${i}" aria-pressed="${i === d.win}">${esc(w)}</button>`).join('')}</div><p class="fine top">${esc(T.deliveryNote)}</p>`
      : `<p class="callout flat">${ic('key', 18)}<span>${esc(T.pickupNote(dayLong(addDays(DELIVERY.pickupDay))))}</span></p>`}</div>${actions(T.cta)}`;
}
const deliveryLine = () => (S.del.mode === 'pickup' ? DELIVERY_T.summary.pickup(dayLong(arrival())) : DELIVERY_T.summary.delivery(dayLong(arrival()), DELIVERY.windows[S.del.win]));
const payLine = () => { const b = B(); return S.pay.method === 'lt' && S.fin.approved ? FIN.approved.line(offerOf(S.fin.offer), nums(offerOf(S.fin.offer))) : S.pay.method === 'cash' ? PAY_T.cash.summary(b.total) : S.pay.method === 'own' ? PAY_T.own.summary(S.pay.lender) : ''; };
const insLine = () => (S.ins.result === 'switched' ? INS.bound.line(quoteOf(S.ins.quote)) : S.ins.result === 'added' ? INS.added.line : '');

/* step 6 */
function reviewHtml() {
  const T = REVIEW_T, R = T.sections, c = S.car, d = S.det, b = B(), P = SUMMARY_T;
  const missing = STEPS.find((s) => s.id !== 'review' && !S.done[s.id]);
  const sec = (id, title, body) => `<section class="rv"><header><h2>${esc(title)}</h2>${id ? `<button type="button" class="link" data-a="goto" data-v="${id}" aria-label="${esc(FLOW_T.edit)} ${esc(title)}">${esc(FLOW_T.edit)}</button>` : ''}</header>${body}</section>`;
  return `<h1>${esc(T.title)}</h1><p class="lead">${esc(T.sub)}</p>
    ${sec(null, R.vehicle, `<div class="rv-car"><img src="${c.thumb || c.photo}" alt="" width="640" height="429"><div><b>${esc(carName(c))}</b><span>${esc(DETAIL_T.sub(c))}</span><span>${esc(c.color)} · ${esc(P.price)} ${money(c.price)}</span></div></div>`)}
    ${sec('details', R.details, `<p>${esc(d.name)}<br>${esc(d.email)} · ${esc(d.phone)}<br>${esc(d.address)}</p>`)}
    ${sec('trade', R.trade, `<p>${esc(S.trade === 'later' ? T.tradeLater : T.tradeNone)}</p>`)}
    ${sec('payment', R.payment, `<p>${esc(payLine())}</p>${loanDone() ? credit('loan') : ''}`)}
    ${sec('insurance', R.insurance, `<p>${esc(insLine())}</p>${credit('insurance')}`)}
    ${sec('delivery', R.delivery, `<p>${esc(deliveryLine())}</p>`)}
    <section class="rv rv-price"><header><h2>${esc(R.price)}</h2></header><dl class="sum-l">${row(P.price, money(b.price))}${row(P.tax, money(b.tax))}${row(P.titleReg, money(b.titleRegistration))}${row(P.doc, money(b.documentation))}${row(P.delivery, P.free, 'good')}${row(P.total, money(b.total), 'tot')}${loanDone() ? row(P.down, money(S.fin.down)) + row(P.monthly, `${money(nums(offerOf(S.fin.offer)).payment)}${esc(P.perMo)}`) : ''}</dl></section>
    <label class="agree"><input type="checkbox" id="agreeOrder" data-f="agreeOrder"${S.agree ? ' checked' : ''}><span>${esc(T.agree)}</span></label>
    <div class="actions"><button type="button" class="btn ghost" data-a="back"${S.placing ? ' disabled' : ''}>${esc(FLOW_T.back)}</button><button type="button" class="btn lg${S.placing ? ' busy' : ''}" data-a="place"${S.placing || !S.agree || missing ? ' disabled' : ''}>${S.placing ? `<span class="spin" aria-hidden="true"></span>${esc(T.placing)}` : esc(missing ? T.missing(missing.label) : T.cta)}</button></div>`;
}
function checkoutShell() {
  if (dock.parentNode !== kt) kt.append(dock);
  view.innerHTML = `<div class="co"><div class="co-top" id="stepper"></div><div class="co-grid"><section class="co-main" id="stepBody"></section>
    <aside class="sum" id="sum" aria-label="${esc(SUMMARY_T.title)}"><button type="button" class="sum-bar" id="sumBar" data-a="sum-toggle" aria-controls="sumIn"></button>
      <div class="sum-in" id="sumIn"><h2>${esc(SUMMARY_T.title)}</h2><div class="sum-car"><img src="${S.car.thumb || S.car.photo}" alt="" width="640" height="429"><div id="sumCar"></div></div><div id="sum-price"></div><div class="sum-sec" id="sum-pay"></div><div class="sum-sec" id="sum-ins"></div><p class="sum-note" id="sumNote">${ic('lock', 14, 2)}${esc(SUMMARY_T.dueNote)}</p></div></aside></div></div>`;
  sumLast = {};
}
const STEP_HTML = { details: detailsHtml, trade: tradeHtml, payment: paymentHtml, insurance: insuranceHtml, delivery: deliveryHtml, review: reviewHtml };

/* ---------- confirmation ---------- */
function confetti() {
  if (reduced()) return '';
  const colors = ['#4733e6', '#08c177', '#ffc94d', '#14122b', '#b9b0ff'];
  let h = '';
  for (let i = 0; i < 34; i++) { const a = (i * 137.5) % 360; h += `<i style="--x:${Math.round(Math.cos(a) * (60 + (i * 37) % 150))}px;--y:${-40 - ((i * 53) % 130)}px;--r:${(i * 97) % 360}deg;--d:${(i % 7) * 40}ms;background:${colors[i % colors.length]}"></i>`; }
  return `<span class="confetti" aria-hidden="true">${h}</span>`;
}
function doneHtml() {
  const T = DONE_T, c = S.car, d = S.det, pickup = S.del.mode === 'pickup', when = arrival(), loan = loanDone() ? offerOf(S.fin.offer) : null, q = S.ins.result === 'switched' ? quoteOf(S.ins.quote) : S.ins.result === 'added' ? CURRENT_WITH_TACOMA : null;
  const M_ = loan && q ? T.manage : T.manageSolo;
  return `<div class="conf">
    <div class="done-hero"><div class="done-t"><span class="seal">${confetti()}<svg viewBox="0 0 52 52" width="44" height="44" aria-hidden="true"><path d="M15 27l8 8 14-16"/></svg></span>
        <p class="kick">${esc(T.kicker(ORDER_NUMBER))}</p><h1>${esc((pickup ? T.titlePickup : T.title)(d.name.split(' ')[0], c))}</h1><p class="lead">${esc(T.sub(d.email))}</p>
        <dl class="facts">${row(pickup ? T.facts.pickup : T.facts.delivery, esc(dayShort(when)))}${row(T.facts.payment, esc(loan ? `${money(nums(loan).payment)} a month` : S.pay.method === 'cash' ? SUMMARY_T.cash : S.pay.lender))}${q ? row(T.facts.insurance, esc(q.carrier)) : ''}</dl></div>
      <figure class="done-ph"><img src="${photosOf(c)[0].src}" alt="${esc(carName(c))}" width="1264" height="848"><figcaption>${esc(carName(c))}</figcaption></figure></div>
    <div class="done-grid"><section class="whatnext"><h2>${esc(T.nextTitle)}</h2><ol>${T.next({ loan, insurer: q && q.carrier, pickup, whenShort: dayShort(when) }).map(([k, v]) => `<li><i></i><div><b>${esc(k)}</b><p>${esc(v)}</p></div></li>`).join('')}</ol></section>
      <section class="held"><div class="ltm-brand"><img src="${LEAF}" alt=""><span><b>${esc(T.heldTitle)}</b></span></div>
        ${loan ? `<div class="held-c">${lmark(loan.lender)}<div><span>${esc(T.loanCard)}</span><b>${esc(loan.lender)}</b><em>${esc(FIN.approved.line(loan, nums(loan)).split(' · ').slice(1).join(' · '))}</em></div></div>` : ''}
        ${q ? `<div class="held-c">${cmark(q.icon)}<div><span>${esc(T.policyCard)}</span><b>${esc(q.carrier)}</b><em>${money(q.total)} a year · ${esc(INS.card.effective)} ${esc(dayShort(when))}</em><small>${esc(SHELL.credit.qw)}</small></div></div>` : ''}
        <p class="manage">${esc(M_.before)}<a href="${T.manage.href}"${EMBED ? ' target="_top"' : ''}>${esc(M_.link)}</a>${esc(M_.after)}</p></section></div>
    <div class="done-again"><button type="button" class="btn ghost" data-a="again">${esc(T.again)}</button></div>
    <footer class="ft"><span>${esc(SHELL.footer.line)}</span><span>${SHELL.footer.links.map(esc).join(' · ')}</span></footer></div>`;
}

/* ---------- render ---------- */
let lastKey = '', lastScreen = '';
const viewKey = () => `${S.screen}|${S.screen === 'checkout' ? `${S.step}|${S.step === 'details' ? S.det.stage : S.step === 'payment' ? `${S.pay.method}|${S.fin.stage}|${S.fin.paused}|${S.done.payment}` : S.step === 'insurance' ? `${S.ins.stage}|${S.ins.paused}` : ''}` : S.screen === 'detail' ? S.car.id : ''}`;
const fkey = (n) => (!n || !kt.contains(n) ? null : n.id ? `#${n.id}` : n.dataset.a ? `[data-a="${n.dataset.a}"]${n.dataset.v ? `[data-v="${n.dataset.v}"]` : ''}` : null);
function render() {
  const key = viewKey(), changed = key !== lastKey, focus = fkey(document.activeElement), stepChanged = key.split('|').slice(0, 2).join('|') !== lastKey.split('|').slice(0, 2).join('|');
  paintShell();
  let body = view;
  if (S.screen === 'checkout') {
    if (lastScreen !== 'checkout' || !$('#stepBody')) checkoutShell();
    $('#stepper').innerHTML = stepperHtml(); paintSummary();
    body = $('#stepBody'); body.innerHTML = STEP_HTML[S.step]();
    if (S.step === 'details' && S.det.stage === 'confirm') paintAddr();
  } else { if (dock.parentNode !== kt) kt.append(dock); view.innerHTML = S.screen === 'search' ? searchHtml() : S.screen === 'detail' ? detailHtml() : doneHtml(); }
  if (changed) {
    body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
    const ltm = $('#ltm'), target = stepChanged || !ltm ? 0 : Math.max(0, topOf(ltm) - 12);
    if (stepChanged || !ltm || main.scrollTop > target) main.scrollTo({ top: target, behavior: stepChanged ? 'auto' : smooth() });
  }
  if (focus && !S.auto) { const n = stepChanged ? null : $(focus, kt); if (n && !n.disabled) n.focus({ preventScroll: true }); else if (changed) main.focus({ preventScroll: true }); }
  lastKey = key; lastScreen = S.screen;
  converse(key);
  paintGoogle(); paintDock(); kick();
}
const topOf = (n) => n.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
const syncCta = (sel, ok) => { const b = $(sel, view); if (b) b.disabled = !ok; };

/* ---------- LendingTree speaking: three dots, then the words type in ----------
   Only the LendingTree module talks this way. The marketplace's own pages, and the cards, tables, fields and buttons inside
   the module, are never typed: the module's other content waits (in its final place) until the sentence that introduces it
   has finished, then fades up. Each message is typed once per run; coming back to a step shows it as it was left. */
const SAY = { dots: 900, per: 15, min: 350, max: 1800, gap: 140 };
const SAY_INTRO = ':scope > h2, :scope > .sub, :scope > .app-h > h2, :scope > .party > h2, :scope > .party > p, :scope > .party > div > h2, :scope > .party > div > p';
const SAY_LATER = '.have-p, .advisor p, :scope > .approved';
const said = new Set();
let sayGen = 0, speech = null;
/* Hide a message's words where they stand, so its lines and height are final before the first letter shows. */
function veil(node) {
  const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT), texts = [];
  while (w.nextNode()) if (w.currentNode.nodeValue.trim()) texts.push(w.currentNode);
  return texts.map((t) => { const s = el('<span class="tw"><span class="tw-on"></span><span class="tw-off"></span></span>'); s.lastChild.textContent = t.nodeValue; t.replaceWith(s); return { s, text: t.nodeValue }; });
}
function unveil(parts) { for (const p of parts) if (p.s) { if (p.s.isConnected) p.s.replaceWith(document.createTextNode(p.text)); p.s = null; } }
async function typeOut(parts, ok) {
  const len = parts.reduce((n, p) => n + p.text.length, 0); if (!len) return;
  const step = Math.min(SAY.max, Math.max(SAY.min, len * SAY.per)) / len, chunk = Math.max(1, Math.ceil((16 * SPEED) / step)); /* a few letters a frame */
  for (let i = 0; i < len;) {
    i = Math.min(len, i + chunk);
    let left = i;
    for (const p of parts) { const k = Math.max(0, Math.min(p.text.length, left)); p.s.firstChild.textContent = p.text.slice(0, k); p.s.lastChild.textContent = p.text.slice(k); p.s.classList.toggle('tw-cur', left > 0 && left <= p.text.length); left -= p.text.length; }
    await tick(step * chunk, ok);
  }
  unveil(parts);
}
async function sayDots(parts, ok) {
  const d = el('<span class="lt-dots" aria-hidden="true"><i></i><i></i><i></i></span>'), at = parts[0] && parts[0].s; if (!at) return;
  at.append(d);
  try { await tick(SAY.dots, ok); } finally { d.remove(); }
}
/* A later message (the advisor's reasoning, say) may sit below the fold: auto-play brings it into view, a person scrolls to it. */
async function reach(n, ok) {
  const box = n.closest('.advisor') || n;
  const pos = () => { const r = box.getBoundingClientRect(), m = main.getBoundingClientRect(); return { part: r.top < m.bottom - 48 && r.bottom > m.top + 8, all: r.top >= m.top && r.bottom <= m.bottom - 8 }; };
  for (;;) {
    const p = pos();
    if (S.auto ? p.all : p.part) return;
    if (S.auto) { box.scrollIntoView({ block: 'center', behavior: smooth() }); await tick(450, ok); return; }
    await tick(150, ok);
  }
}
function converse(key) {
  const my = ++sayGen, box = $('.ltm-b', view), ok = () => my === sayGen;
  if (!box) return;
  const fresh_ = (n) => { const id = `${key}|${n.textContent}`; if (said.has(id)) return false; said.add(id); return true; };
  const intro = $$(SAY_INTRO, box).filter(fresh_), later = $$(SAY_LATER, box).filter(fresh_);
  if (reduced() || !(intro.length + later.length)) return;
  const holds = [];
  if (intro.length) (function walk(p) { for (const c of p.children) { if (intro.includes(c) || c.matches('.seal')) continue; if (intro.some((n) => c.contains(n))) walk(c); else holds.push(c); } })(box);
  const veiled = (list) => list.map((n) => ({ n, parts: veil(n) })), first = veiled(intro), rest = veiled(later);
  holds.forEach((h) => h.classList.add('lt-hold'));
  box.setAttribute('aria-busy', 'true');
  let finish; const mine = new Promise((r) => { finish = r; }); speech = mine;
  const show = (anim) => holds.forEach((h) => { if (h.classList.contains('lt-hold')) { h.classList.remove('lt-hold'); if (anim) h.classList.add('lt-show'); } });
  seq(async () => {
    try {
      if (first.length) {
        await sayDots(first[0].parts, ok);
        for (const m of first) { await typeOut(m.parts, ok); await tick(SAY.gap, ok); }
        show(true);
        if (rest.length) await tick(260, ok);
      }
      for (const m of rest) { await reach(m.n, ok); await sayDots(m.parts, ok); await typeOut(m.parts, ok); await tick(SAY.gap, ok); }
    } finally {
      /* done, or cut short by a restart or the next screen: never leave a half-typed message behind */
      [...first, ...rest].forEach((m) => unveil(m.parts)); show(false); $$('.lt-dots', box).forEach((d) => d.remove()); box.removeAttribute('aria-busy');
      if (speech === mine) speech = null;
      finish();
    }
  });
}
/* For timed sequences that must not redraw the screen while a message is still typing. */
async function spoken() { const my = run; while (speech) { await speech; if (my !== run) throw new Cancel(); } }

/* ---------- what each control does ---------- */
function goStep(id) { if (!canGo(id)) return; S.step = id; S.sumOpen = false; render(); }
function advance() { S.done[S.step] = true; S.step = firstOpen(); S.sumOpen = false; render(); }
function runChecking() {
  const f = S.fin; f.stage = 'checking'; f.line = 0; render();
  seq(async () => { await sleep(1300); f.line = 1; render(); await sleep(1500); f.line = 2; render(); await sleep(1900); f.checked = true; f.stage = 'offers'; render(); });
}
function runStips() {
  const f = S.fin; f.stage = 'stips'; f.busy = f.stips.identity ? null : 'identity'; render();
  if (f.stips.identity) return;
  seq(async () => { await spoken(); await sleep(1500); f.stips.identity = true; f.busy = null; if (f.verified) f.stips.income = true; render(); });
}
function runInsurance(choice) {
  const n = S.ins; n.line = 0; n.agree = false;
  if (choice === 'add') { n.stage = 'adding'; render(); seq(async () => { for (let i = 1; i <= 3; i++) { await sleep(1100); n.line = i; if (i < 3) render(); } n.stage = 'added'; n.result = 'added'; n.quote = null; S.done.insurance = true; render(); }); }
  else { n.stage = 'checking'; n.result = null; S.done.insurance = false; render(); seq(async () => { await sleep(3200); n.stage = 'quotes'; render(); }); }
}
const act = {
  home() { S.screen = 'search'; render(); },
  nav(n) { if (n.dataset.v === 'shop') return act.home(); toast(SHELL.navElsewhere); },
  open(n) { S.car = LISTINGS.find((l) => l.id === n.dataset.v) || HERO; S.photo = 0; S.featAll = false; S.screen = 'detail'; render(); },
  save(n) { const id = n.dataset.v, on = !S.saved.has(id); if (on) S.saved.add(id); else S.saved.delete(id); $$(`[data-a=save][data-v="${id}"]`, view).forEach((b) => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); paintShell(); toast(on ? SEARCH_T.savedToast : SEARCH_T.unsavedToast); },
  qf(n) { const s = S.filt.trim; if (s.has(n.dataset.v)) s.delete(n.dataset.v); else s.add(n.dataset.v); render(); },
  clear() { Object.assign(S.filt, { trim: new Set(), drive: new Set(), price: 'any', miles: 'any' }); render(); },
  photo(n) { setPhoto(Number(n.dataset.v)); },
  'photo-step'(n) { setPhoto(S.photo + Number(n.dataset.v)); },
  feats() { S.featAll = !S.featAll; render(); },
  start() { const car = S.car, saved = S.saved, auto = S.auto; Object.assign(S, fresh(), { car, saved, auto, screen: 'checkout' }); said.clear(); render(); },
  exit() { S.screen = 'detail'; render(); },
  again() { start('shop'); },
  goto(n) { goStep(n.dataset.v); },
  back() { const i = stepIdx(S.step); if (i === 0) return act.exit(); S.step = STEPS[i - 1].id; render(); },
  next() { if (S.step === 'details' && !detailsValid()) return; if (S.step === 'trade' && !S.trade) return; if (S.step === 'details') S.det.addrOk = true; advance(); },
  'sum-toggle'() { S.sumOpen = !S.sumOpen; paintSummary(); },
  /* details */
  google(n) { gFrom = n; S.gdlg = 'choose'; S.gNote = false; paintGoogle(); kick(); },
  manual() { S.det.stage = 'confirm'; render(); const f = $('#f-name'); if (f && !S.auto) f.focus(); },
  'g-close'() { S.gdlg = null; paintGoogle(); kick(); },
  'g-other'() { S.gNote = true; paintGoogle(); },
  'g-pick'() { S.gdlg = 'consent'; paintGoogle(); kick(); },
  'g-allow'() { S.gdlg = 'working'; paintGoogle(); kick(); seq(async () => { await sleep(1100); Object.assign(S.det, { stage: 'confirm', google: true, name: GOOGLE_PROFILE.name, email: GOOGLE_PROFILE.email, phone: GOOGLE_PROFILE.phone }); S.gdlg = null; gFrom = null; render(); }); },
  'addr-pick'(n) { S.det.address = ADDRESS_SUGGESTIONS[Number(n.dataset.v)]; S.det.addrOk = true; render(); },
  trade(n) { S.trade = n.dataset.v; render(); },
  /* payment */
  pay(n) { const m = n.dataset.v; S.pay.method = m; S.done.payment = false; if (m === 'lt') { S.fin.paused = false; if (S.fin.approved) S.done.payment = true; } render(); if (m === 'own' && !S.auto) { const f = $('#f-lender'); if (f) f.focus(); } },
  'pay-done'() { if (S.pay.method === 'own' && S.pay.lender.trim().length < 2) return; advance(); },
  'pay-change'() { S.pay.method = null; S.done.payment = false; const f = S.fin; if (f.approved || f.stage === 'approved') Object.assign(f, { approved: false, offer: null, sig: '', signing: false, stage: 'offers' }); render(); },
  'fin-resume'() { S.fin.paused = false; S.pay.method = 'lt'; render(); },
  'fin-next'() {
    const f = S.fin; if (!finValid()) return;
    if (f.stage === 'terms' && f.checked) return runChecking();
    if (f.stage === 'consent') return runChecking();
    if (f.stage === 'stips') { f.stage = 'sign'; return render(); }
    f.stage = { have: 'terms', terms: 'income', income: 'housing', housing: 'consent' }[f.stage] || f.stage; render();
  },
  'fin-back'() { const f = S.fin; if (f.stage === 'have') { S.pay.method = null; return render(); } f.stage = { terms: f.checked ? 'offers' : 'have', income: 'terms', housing: 'income', consent: 'housing', stips: 'offers', sign: 'stips' }[f.stage] || f.stage; if (f.stage === 'offers') f.offer = null; render(); },
  'fin-adjust'() { S.fin.stage = 'terms'; render(); },
  down(n) { setDown(Number(n.dataset.v)); },
  term(n) { S.fin.term = Number(n.dataset.v); $$('#termChips .chip').forEach((b) => { const on = b === n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); $('#est').innerHTML = estHtml(); paintSummary(); },
  emp(n) { S.fin.status = n.dataset.v; render(); },
  housing(n) { S.fin.housing = n.dataset.v; render(); },
  payroll() { const f = S.fin; f.verifying = true; render(); seq(async () => { await sleep(2000); Object.assign(f, { verifying: false, verified: 'early', employer: APPLICANT.employer, income: APPLICANT_AUTO.income, status: APPLICANT.employment }); render(); }); },
  'pick-offer'(n) { S.fin.offer = n.dataset.v; runStips(); },
  'stip-income'() { const f = S.fin; f.busy = 'income'; render(); seq(async () => { await sleep(2100); f.busy = null; f.stips.income = true; f.verified = f.verified || 'late'; render(); }); },
  full() { S.fin.full = !S.fin.full; render(); },
  sign() { const f = S.fin; if (f.sig.trim().length < 3 || f.signing) return; f.signing = true; render(); seq(async () => { await sleep(1500); Object.assign(f, { signing: false, approved: true, stage: 'approved' }); S.done.payment = true; render(); }); },
  /* insurance */
  'ins-choice'(n) { runInsurance(n.dataset.v); },
  'ins-back'() { S.ins.stage = 'prompt'; render(); },
  'ins-quotes'() { S.ins.stage = 'quotes'; render(); },
  'pick-quote'(n) { Object.assign(S.ins, { quote: n.dataset.v, stage: 'confirm', agree: false }); render(); },
  bind() { const n = S.ins; if (!n.agree) return; n.stage = 'binding'; n.line = 0; render(); seq(async () => { for (let i = 1; i <= 3; i++) { await sleep(1200); n.line = i; if (i < 3) render(); } n.stage = 'bound'; n.result = 'switched'; S.done.insurance = true; render(); }); },
  'ins-change'() { Object.assign(S.ins, { stage: 'prompt', result: null, quote: null, agree: false }); S.done.insurance = false; render(); },
  'ins-resume'() { S.ins.paused = false; render(); },
  /* delivery, review */
  'del-mode'(n) { S.del.mode = n.dataset.v; render(); },
  day(n) { S.del.day = Number(n.dataset.v); $$('#dayChips .chip').forEach((b) => { const on = b === n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); },
  win(n) { S.del.win = Number(n.dataset.v); $$('#winChips .chip').forEach((b) => { const on = b === n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); },
  place() { if (!S.agree || S.placing) return; S.placing = true; render(); seq(async () => { await sleep(1700); S.placing = false; S.screen = 'done'; render(); }); },
  ask() { dockOpen(); },
};
function setDown(v) {
  const f = S.fin; f.down = Math.max(0, Math.min(FINANCE.downMax, v));
  const r = $('#f-down'); if (r && Number(r.value) !== f.down) r.value = f.down;
  $('#downV').textContent = money(f.down); $('#est').innerHTML = estHtml();
  $$('#downChips .chip').forEach((b) => { const on = Number(b.dataset.v) === f.down; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  paintSummary();
}
const fields = {
  'f-name'(n) { S.det.name = n.value; }, 'f-email'(n) { S.det.email = n.value; }, 'f-phone'(n) { S.det.phone = n.value; },
  'f-addr'(n) { S.det.address = n.value; S.det.addrOk = false; paintAddr(); },
  'f-lender'(n) { S.pay.lender = n.value; syncCta('[data-a=pay-done]', n.value.trim().length > 1); },
  'f-down'(n) { setDown(Number(n.value)); },
  'f-employer'(n) { S.fin.employer = n.value; }, 'f-income'(n) { S.fin.income = n.value; }, 'f-housing'(n) { S.fin.housingPay = n.value; },
  agreeCredit(n) { S.fin.agree = n.checked; }, agreeSwitch(n) { S.ins.agree = n.checked; syncCta('[data-a=bind]', n.checked); },
  agreeOrder(n) { S.agree = n.checked; syncCta('[data-a=place]', n.checked && !STEPS.some((s) => s.id !== 'review' && !S.done[s.id])); },
  sig(n) { S.fin.sig = n.value; syncCta('[data-a=sign]', n.value.trim().length >= 3); },
  sort(n) { S.filt.sort = n.value; render(); },
  'filt-trim'(n) { const s = S.filt.trim; if (n.checked) s.add(n.value); else s.delete(n.value); render(); },
  'filt-drive'(n) { const s = S.filt.drive; if (n.checked) s.add(n.value); else s.delete(n.value); render(); },
  'filt-price'(n) { S.filt.price = n.value; render(); }, 'filt-miles'(n) { S.filt.miles = n.value; render(); },
};
kt.addEventListener('click', (e) => { const n = e.target.closest('[data-a]'); if (n && kt.contains(n) && !n.disabled && act[n.dataset.a]) act[n.dataset.a](n, e); });
kt.addEventListener('input', (e) => {
  const n = e.target, f = n.dataset && n.dataset.f; if (!f || !fields[f]) return;
  fields[f](n);
  if (S.screen === 'checkout' && S.step === 'details') syncCta('[data-a=next]', detailsValid());
  if (S.screen === 'checkout' && S.step === 'payment' && S.pay.method === 'lt') syncCta('[data-a=fin-next]', finValid());
});
kt.addEventListener('submit', (e) => { e.preventDefault(); if (e.target.dataset.form === 'search') { act.clear(); main.scrollTo({ top: 0, behavior: smooth() }); } });
kt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'sig') act.sign();
  if (e.key === 'Enter' && e.target.id === 'f-addr') { const b = $('[data-a=addr-pick]', view); if (b) b.click(); }
  if (S.screen === 'detail' && !e.target.closest('input, textarea, select') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && photosOf(S.car).length > 1) setPhoto(S.photo + (e.key === 'ArrowRight' ? 1 : -1));
});
/* swipe the gallery on a phone */
let swipeX = null;
kt.addEventListener('touchstart', (e) => { swipeX = e.target.closest('#galStage') ? e.touches[0].clientX : null; }, { passive: true });
kt.addEventListener('touchend', (e) => { if (swipeX == null) return; const dx = e.changedTouches[0].clientX - swipeX; swipeX = null; if (Math.abs(dx) > 40 && photosOf(S.car).length > 1) setPhoto(S.photo + (dx < 0 ? 1 : -1)); }, { passive: true });

/* ---------- prototype chrome: the final interstitial ---------- */
let pmDismiss = null;
function modal(M, buttons, dismiss) {
  const pm = $('#pmodal');
  $('#pmTitle').textContent = M.title; $('#pmBody').textContent = M.body;
  $('#pmBtns').innerHTML = buttons.map(([v, label, href], i) => (href ? `<a class="pm-b ghost" href="${href}">${esc(label)}</a>` : `<button type="button" class="${i ? 'pm-b ghost' : 'pm-b'}" data-v="${v}">${esc(label)}</button>`)).join('');
  threadShow(false); modalOpen = true; autoGen++;
  pm.hidden = false; requestAnimationFrame(() => pm.classList.add('on')); $('#pmBtns button').focus({ preventScroll: true });
  return new Promise((resolve) => {
    const done = (v) => { hideModal(); resolve(v); };
    $('#pmBtns').onclick = (e) => { const b = e.target.closest('button'); if (b) done(b.dataset.v); };
    pmDismiss = dismiss ? () => done(dismiss) : null;
  });
}
function hideModal() { const pm = $('#pmodal'); pm.hidden = true; pm.classList.remove('on'); pmDismiss = null; modalOpen = false; }
$('#pmodal').addEventListener('click', (e) => { if (e.target === e.currentTarget && pmDismiss) pmDismiss(); });
/* Clicking outside the card, or Escape, is the same as choosing to play with it. */
async function finale() {
  const E = PROTO.theEnd, my = run;
  const r = await modal(E, [['self', E.self], ['restart', E.restart], ['others', E.others, E.othersHref]], 'self');
  if (my !== run) return;
  if (r === 'self') setAuto(false);
  resetAsk(); start('shop');
}
function start(stage) {
  run++; autoGen++; hideModal(); S.gdlg = null;
  preset(stage); lastKey = ''; lastScreen = ''; sumLast = {}; said.clear();
  paintDev(); render();
}

/* ---------- ask a question: answered by the live LendingTree agent, during financing and insurance ---------- */
const dock = $('#dock'), ASK = { msgs: [], busy: false, gen: 0, last: null };
/* TEST AID, only with ?mock=1: canned replies so every action can be exercised without the network. Not part of the product. */
function mockAsk(req) {
  const q = req.messages[req.messages.length - 1].content.toLowerCase();
  const hit = [
    ['think about it', 'pause', 'Of course. Nothing is submitted, and I will keep everything as it is until you are ready.'],
    ['insurance instead', 'insurance', 'Sure. Let us sort out the insurance first.'],
    ['loan instead', 'loan', 'Sure. Let us go back to your financing.'],
    ['order summary', 'home', 'Here is your order as it stands.'],
    ['start over', 'restart', 'No problem. Let us start again from the top.'],
  ].find(([k]) => q.includes(k));
  const out = hit ? { text: hit[2], action: hit[1] } : { text: `Good question. In this sample nothing is final until you sign, and looking at offers never affects your credit. Whenever you are ready, carry on with the ${req.stage} step in front of you.`, action: 'continue' };
  return new Promise((r) => setTimeout(() => r({ ...out, live: false }), 400));
}
if (MOCK) window.__vt = { S, ASK };
const askPath = () => (S.step === 'insurance' ? 'insurance' : 'loan');
const askOn = () => !EMBED && S.screen === 'checkout' && !S.gdlg && (S.step === 'insurance' || (S.step === 'payment' && (S.pay.method === 'lt' || S.fin.paused)));
function buildDock() {
  const A = ASK_T;
  dock.innerHTML = `<div class="dock-thread" id="dockThread" hidden><button type="button" class="dock-x" id="dockHide" aria-label="${esc(A.hide)}">${ic('down', 16, 2.4)}</button><div class="dock-log" id="dockLog" role="log" aria-live="polite"></div><p class="dock-by"><img src="${LEAF}" alt="">${esc(A.by)}</p></div>
    <div class="dock-row"><button type="button" class="dock-pill" id="dockPill" aria-label="${esc(A.label)}"><img src="${LEAF}" alt=""><span>${esc(A.short)}</span></button>
      <form class="dock-form" id="dockForm" autocomplete="off"><img src="${LEAF}" alt=""><input type="text" id="dockIn" maxlength="300" enterkeyhint="send" placeholder="${esc(A.placeholder)}" aria-label="${esc(A.label)}"><button type="submit" aria-label="${esc(A.send)}" disabled>${ic('right', 18, 2.4)}</button></form></div>`;
  const input = $('#dockIn');
  input.addEventListener('input', paintAsk);
  input.addEventListener('blur', () => setTimeout(() => { if (!input.value && document.activeElement !== input && !dock.classList.contains('has-thread')) dock.classList.remove('open'); }, 0));
  $('#dockForm').addEventListener('submit', (e) => { e.preventDefault(); e.stopPropagation(); const t = input.value.trim(); if (t.length >= 2 && !ASK.busy) submitAsk(t); });
  $('#dockPill').addEventListener('click', dockOpen);
  $('#dockHide').addEventListener('click', () => threadShow(false));
  dock.addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; e.stopPropagation(); threadShow(false); input.blur(); });
}
function dockOpen() { if (dock.hidden) return; dock.classList.add('open'); $('#dockIn').focus({ preventScroll: true }); }
function paintAsk() { $('#dockForm button').disabled = ASK.busy || $('#dockIn').value.trim().length < 2; }
/* On wide screens the field sits under the order summary; on phones it floats above the step's main button. */
const wide = matchMedia('(min-width: 761px)');
function placeDock() { const home = wide.matches && $('#sum') ? $('#sum') : kt; if (dock.parentNode !== home) home.append(dock); }
wide.addEventListener('change', () => { if (!EMBED) { placeDock(); paintDock(); } });
function paintDock() {
  if (EMBED) return;
  placeDock();
  const on = askOn() || (dock.classList.contains('has-thread') && S.screen === 'checkout');
  if (!on && !dock.hidden) threadShow(false);
  dock.hidden = !on; kt.classList.toggle('has-ask', on);
}
function threadShow(on) {
  if (EMBED || !dock.firstChild || (!on && !dock.classList.contains('has-thread') && !dock.classList.contains('open'))) return;
  $('#dockThread').hidden = !on; dock.classList.toggle('has-thread', on);
  if (!on && !$('#dockIn').value && document.activeElement !== $('#dockIn')) dock.classList.remove('open');
  kt.classList.toggle('asking', on); if (on) kt.style.setProperty('--dock-h', `${dock.offsetHeight}px`);
}
function resetAsk() { ASK.gen++; ASK.msgs = []; ASK.busy = false; if (EMBED || !dock.firstChild) return; $('#dockLog').innerHTML = ''; $('#dockIn').value = ''; paintAsk(); threadShow(false); dock.classList.remove('open'); }
/* What the agent is told: where the journey is and what is on screen. */
function askContext() {
  const f = S.fin, n = S.ins;
  if (S.step === 'payment') {
    if (f.paused) return NOW.fin.saved;
    if (S.pay.method !== 'lt') return NOW.pay;
    const o = f.offer && offerOf(f.offer);
    if (f.stage === 'offers') return NOW.fin.offers(AUTO_LOAN_OFFERS.map((x) => x.lender), offerOf(recOffer()).lender);
    return typeof NOW.fin[f.stage] === 'function' ? NOW.fin[f.stage](o) : NOW.fin[f.stage];
  }
  if (S.step === 'insurance') {
    if (n.paused) return NOW.ins.saved;
    if (n.stage === 'quotes') return NOW.ins.quotes(TWO_CAR_QUOTES.map((x) => x.carrier), quoteOf(INSURANCE_RECOMMEND).carrier);
    if (n.stage === 'confirm') return NOW.ins.confirm(quoteOf(n.quote));
    if (n.stage === 'bound' || n.stage === 'added') return NOW.ins.bound(n.stage === 'bound' ? quoteOf(n.quote).carrier : CURRENT_POLICY.carrier);
    return n.stage === 'prompt' ? NOW.ins.prompt : NOW.ins.working;
  }
  return NOW.other(STEPS[stepIdx(S.step)].label);
}
async function submitAsk(text) {
  if (S.auto) setAuto(false);
  const my = ++ASK.gen, log = $('#dockLog'), pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const q = el('<div class="msg me"><span></span></div>'); q.firstChild.textContent = text;
  const a = el(`<div class="msg g"><img class="g-av" src="${LEAF}" alt=""><div class="g-t"><span class="dots" role="img" aria-label="${esc(ASK_T.thinking)}"><i></i><i></i><i></i></span></div></div>`);
  log.append(q, a); $('#dockIn').value = ''; ASK.busy = true; paintAsk();
  /* the panel is only as tall as the latest exchange; earlier ones are a scroll away */
  const frame = () => { const pad = parseFloat(getComputedStyle(log).paddingTop); log.style.height = `${a.offsetTop + a.offsetHeight - q.offsetTop + pad * 2}px`; log.scrollTop = q.offsetTop - pad; kt.style.setProperty('--dock-h', `${dock.offsetHeight}px`); };
  dock.classList.add('open'); threadShow(true); frame();
  ASK.msgs.push({ role: 'user', content: text });
  const path = askPath(), ctx = askContext();
  const req = { surface: 'embedded', path, stage: ctx.stage, step: ctx.step.slice(0, 300), selected: path === 'loan' ? S.fin.offer : S.ins.quote, held: path === 'loan' ? S.fin.approved : !!S.ins.result, messages: ASK.msgs.slice(-11) }; /* odd, so it opens on a question */
  ASK.last = req;
  const [out] = await Promise.all([MOCK ? mockAsk(req) : ask(req), pause(900)]);
  if (my !== ASK.gen) return;
  ASK.msgs.push({ role: 'assistant', content: out.text });
  /* the words type in for the eye; a screen reader gets the whole answer once */
  $('.g-t', a).innerHTML = `<p aria-hidden="true">${esc(out.text)}</p><span class="vh">${esc(out.text)}</span>`;
  frame();
  if (!reduced()) {
    const parts = veil($('p', a));
    try { await typeOut(parts, () => my === ASK.gen); } catch (e) { if (!(e instanceof Cancel)) throw e; } finally { unveil(parts); }
    if (my !== ASK.gen) return;
  }
  await pause(out.action === 'continue' ? 350 : 1100); /* long enough to read the reply before the screen changes */
  if (my !== ASK.gen) return;
  ASK.busy = false; paintAsk();
  doAction(out.action);
}
/* What each reply does to the journey. The words are the agent's; this only moves the product to match them. */
function doAction(action) {
  if (action === 'restart') { resetAsk(); return void start('shop'); }
  if (action === 'pause') {
    if (S.step === 'payment' && S.pay.method === 'lt' && !S.fin.approved && !['checking'].includes(S.fin.stage)) { S.fin.paused = true; S.fin.signing = false; render(); }
    else if (S.step === 'insurance' && !S.ins.result && !['adding', 'binding', 'checking'].includes(S.ins.stage)) { S.ins.paused = true; render(); }
  }
  if (action === 'loan' && S.step !== 'payment') { S.step = 'payment'; if (!S.fin.approved) { S.pay.method = 'lt'; S.fin.paused = false; } render(); }
  if (action === 'insurance' && S.step !== 'insurance') { if (S.pay.method === 'lt' && !S.fin.approved) S.fin.paused = true; S.step = 'insurance'; S.ins.paused = false; render(); }
  if (action === 'home') { S.sumOpen = true; paintSummary(true); const s = $('#sum'); if (s) s.scrollIntoView({ block: 'nearest', behavior: smooth() }); return; }
  requestAnimationFrame(markReady);
}
/* Bring the control that carries the flow on into view, clear of the answer, and pulse it. */
function markReady() {
  const st = autoSteps().reverse().find((x) => (x.tap || x.type) && find(x.tap || x.type)); if (!st) return; /* the button that carries the step on, or what unlocks it */
  let n = find(st.tap || st.type); if (n.matches('input[type=checkbox]')) n = n.closest('label');
  const r = n.getBoundingClientRect(), m = main.getBoundingClientRect(), d = dock.hidden ? null : dock.getBoundingClientRect();
  const floor = d && r.right > d.left && r.left < d.right ? d.top - 20 : m.bottom - 90;
  const by = r.top < m.top + 12 ? r.top - m.top - 12 : r.bottom > floor ? r.bottom - floor : 0;
  if (by) main.scrollBy({ top: by, behavior: smooth() });
  n.classList.remove('ready'); void n.offsetWidth; n.classList.add('ready');
  clearTimeout(markReady.t); markReady.t = setTimeout(() => $$('.ready').forEach((x) => x.classList.remove('ready')), 2600);
}
if (!EMBED) buildDock();

/* ---------- prototype chrome: the Prototype pill ---------- */
const IC_PAUSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3.5" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/><rect x="9.3" y="2.5" width="3.2" height="11" rx="1" fill="currentColor"/></svg>';
const IC_PLAY = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.400 2.300a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';
const devMenu = $('#devMenu'), devBtn = $('#devBtn');
function paintDev() {
  const t = $('#devToggle');
  $('#devIc').innerHTML = S.auto ? IC_PAUSE : IC_PLAY;
  t.setAttribute('aria-pressed', String(S.auto)); t.setAttribute('aria-label', S.auto ? PROTO.autoOn : PROTO.autoOff); t.classList.toggle('paused', !S.auto);
}
$('#devNote').textContent = PROTO.note; $('#devFine').textContent = PROTO.fiction; $('#devGoogle').textContent = PROTO.google; $('#doReset').textContent = PROTO.restart; $('#pbackT').textContent = PROTO.back; $('#devJumpL').textContent = PROTO.jumpLabel; devBtn.setAttribute('aria-label', PROTO.controls);
$('#devJumps').innerHTML = Object.entries(PROTO.jumps).map(([k, v]) => `<button type="button" data-stage="${k}">${esc(v)}</button>`).join('');
const setMenu = (open) => { devMenu.hidden = !open; devBtn.setAttribute('aria-expanded', String(open)); };
devBtn.addEventListener('click', () => setMenu(devMenu.hidden));
$('#devToggle').addEventListener('click', () => setAuto(!S.auto));
$('#devJumps').addEventListener('click', (e) => { const b = e.target.closest('[data-stage]'); if (!b) return; setMenu(false); resetAsk(); start(b.dataset.stage); });
$('#doReset').addEventListener('click', () => { setMenu(false); S.auto = true; resetAsk(); start('shop'); });
document.addEventListener('pointerdown', (e) => {
  if (!devMenu.hidden && !$('#dev').contains(e.target)) setMenu(false);
  /* a real tap inside the product means the viewer is driving: auto-play steps aside until they press play */
  if (e.isTrusted && kt.contains(e.target) && S.auto && !EMBED) setAuto(false);
}, true);
/* A tap anywhere else in the product puts an open answer away. */
document.addEventListener('click', (e) => { if (e.isTrusted && !ASK.busy && kt.contains(e.target) && !dock.contains(e.target) && !e.target.closest('[data-a=ask]')) threadShow(false); }, true);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!devMenu.hidden) { setMenu(false); devBtn.focus(); }
    else if (pmDismiss) pmDismiss();
    else if (S.gdlg && S.gdlg !== 'working') act['g-close']();
  }
  if (e.isTrusted && kt.contains(e.target) && S.auto && !EMBED && (e.key === 'Enter' || e.key === ' ' || e.key.length === 1)) setAuto(false);
});
gov.addEventListener('click', (e) => { if (e.target === gov && S.gdlg !== 'working') act['g-close'](); });
/* keep the keyboard inside the dialog while it is open */
gov.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const f = $$('button', gov).filter((b) => !b.disabled); if (!f.length) return void e.preventDefault();
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

Object.assign(S, fresh());
start(START_STAGE);
