/* Draws /lendingtree/getting-started/ from slides.js. Same model as /lendingtree/: one slide, one drawing, a Details sheet.
   The drawing's motion is CSS: a slide gets .on when it is shown, and anything with class "a" builds in after --d seconds.
   Arriving on a slide replays its build. Press R to replay the current slide. */
import { SLIDES } from './slides.js?v=6';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s) => document.querySelector(s);
const two = (n) => String(n).padStart(2, '0');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const trackEl = $('#track');
trackEl.innerHTML = SLIDES.map((s, i) => `<section class="slide gs-${s.id}" id="${s.id}" aria-roledescription="slide" aria-labelledby="h-${s.id}"><div class="sb">
  <header class="sh"><h2 id="h-${s.id}" tabindex="-1"><i>${two(i + 1)}</i> ${esc(s.title)}</h2><p class="sub">${esc(s.sub)}</p></header>
  <div class="vis">${s.draw}</div>
  <footer class="rail">${(s.links || []).map((l) => `<a class="btn link" href="${l[0]}">${esc(l[1])}</a>`).join('')}${s.details ? `<button type="button" class="btn" data-open="${s.id}" aria-haspopup="dialog">Details</button>` : ''}</footer></div></section>`).join('');
const slides = [...trackEl.querySelectorAll('.slide')];
const ids = SLIDES.map((s) => s.id);
const dots = $('#dots');
dots.innerHTML = SLIDES.map((s, i) => `<li><a href="#${s.id}" data-go="${i}" aria-label="Slide ${i + 1}: ${esc(s.name)}"><span></span></a></li>`).join('');

const live = $('#live'), status = $('#status'), where = $('#where'), prevB = $('#prev'), nextB = $('#next');
let idx = 0, ready = false, sayT, timers = [];
function say(m) { clearTimeout(sayT); live.textContent = ''; sayT = setTimeout(() => { live.textContent = m; }, 60); }

/* Numbers that count up as part of a build: <b data-count="30" data-at="1.2" data-final="20 to 30">. */
function counts(el) {
  el.querySelectorAll('[data-count]').forEach((n) => {
    const to = +n.dataset.count, fin = n.dataset.final || (n.dataset.pre || '') + to + (n.dataset.post || '');
    if (still) { n.textContent = fin; return; }
    n.textContent = (n.dataset.pre || '') + '0' + (n.dataset.post || '');
    timers.push(setTimeout(() => {
      const t0 = performance.now(), dur = (+n.dataset.dur || 1.2) * 1000;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
        n.textContent = k === 1 ? fin : (n.dataset.pre || '') + v + (n.dataset.post || '');
        if (k < 1 && slides[idx] === el) requestAnimationFrame(step); else n.textContent = fin;
      };
      requestAnimationFrame(step);
    }, (+n.dataset.at || 0) * 1000));
  });
}
function play(el) {
  timers.forEach(clearTimeout); timers = [];
  slides.forEach((s) => s.classList.remove('on'));
  void el.offsetWidth; // restart the CSS builds
  el.classList.add('on');
  counts(el);
  el.querySelectorAll('iframe[data-src]').forEach((f) => { if (!f.src) f.src = f.dataset.src; });
}

function show(i, announce = true) {
  const old = idx; idx = Math.max(0, Math.min(SLIDES.length - 1, i));
  const hadFocus = slides[old] && slides[old].contains(document.activeElement);
  trackEl.style.setProperty('--i', idx);
  slides.forEach((el, k) => { const on = k === idx; el.inert = !on; el.setAttribute('aria-hidden', on ? 'false' : 'true'); });
  slides[idx].scrollTop = 0;
  status.textContent = `${idx + 1} / ${SLIDES.length}`; where.textContent = SLIDES[idx].name;
  prevB.setAttribute('aria-disabled', idx === 0 ? 'true' : 'false'); nextB.setAttribute('aria-disabled', idx === SLIDES.length - 1 ? 'true' : 'false');
  dots.querySelectorAll('a').forEach((d, k) => { if (k === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); d.classList.toggle('done', k < idx); });
  if (hadFocus && old !== idx) slides[idx].querySelector('h2').focus({ preventScroll: true });
  if (announce && ready && old !== idx) say(`Slide ${idx + 1} of ${SLIDES.length}: ${SLIDES[idx].name}`);
  play(slides[idx]);
}
let mine = false;
function go(i) {
  if (i < 0 || i >= SLIDES.length || i === idx) return;
  show(i);
  if (location.hash !== '#' + ids[i]) { mine = true; location.hash = ids[i]; }
}
window.addEventListener('hashchange', () => {
  if (mine) { mine = false; return; }
  const k = ids.indexOf(decodeURIComponent(location.hash.slice(1))); show(k < 0 ? 0 : k);
});
prevB.addEventListener('click', () => go(idx - 1)); nextB.addEventListener('click', () => go(idx + 1));
dots.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(+a.dataset.go); });

const sheet = $('#sheet');
document.addEventListener('keydown', (e) => {
  if (sheet.open || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const sc = slides[idx], scrolls = sc.scrollHeight > sc.clientHeight + 2;
  let d = 0;
  if (e.key === 'ArrowRight') d = 1; else if (e.key === 'ArrowLeft') d = -1;
  else if (e.key === 'PageDown' && !scrolls) d = 1; else if (e.key === 'PageUp' && !scrolls) d = -1;
  else if (e.key === ' ' && !scrolls && !e.target.closest('button,a')) d = e.shiftKey ? -1 : 1;
  else if (e.key === 'r' || e.key === 'R') return play(slides[idx]);
  else if (e.key === 'Home') { e.preventDefault(); return go(0); } else if (e.key === 'End') { e.preventDefault(); return go(SLIDES.length - 1); }
  if (d) { e.preventDefault(); go(idx + d); }
});

let t0 = null;
const vp = $('#viewport');
vp.addEventListener('scroll', () => { if (vp.scrollLeft || vp.scrollTop) { vp.scrollLeft = 0; vp.scrollTop = 0; } });
vp.addEventListener('touchstart', (e) => { t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
vp.addEventListener('touchend', (e) => {
  if (!t0 || sheet.open) return;
  const dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y; t0 = null;
  if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6 && !e.target.closest('.hs')) go(idx + (dx < 0 ? 1 : -1));
}, { passive: true });

let opener = null;
trackEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]'); if (!b) return;
  const i = ids.indexOf(b.dataset.open), s = SLIDES[i];
  $('#sheetTitle').innerHTML = `<i>${two(i + 1)}</i> ${esc(s.title)}`;
  $('#sheetBody').innerHTML = s.details;
  opener = b; sheet.showModal(); $('#sheetBody').scrollTop = 0;
});
$('#sheetClose').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; });

const start = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
trackEl.classList.add('nomo'); show(start < 0 ? 0 : start, false);
requestAnimationFrame(() => { trackEl.classList.remove('nomo'); document.documentElement.classList.add('ready'); ready = true; });
