/* Draws /lendingtree/getting-started/ from slides.js. Same model as /lendingtree/: one slide, one drawing, a Details sheet.
   The drawing's motion is CSS: a slide gets .on when it is shown, and anything with class "a" builds in after --d seconds.
   Arriving on a slide replays its build. Press R to replay the current slide. */
import { SLIDES } from './slides.js?v=51';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s) => document.querySelector(s);
const two = (n) => String(n).padStart(2, '0');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const trackEl = $('#track');
trackEl.innerHTML = SLIDES.map((s, i) => `<section class="slide gs-${s.id}" id="${s.id}" aria-roledescription="slide" aria-labelledby="h-${s.id}"><div class="sb">
  <header class="sh"><h2 id="h-${s.id}" tabindex="-1">${esc(s.title)}</h2><p class="sub">${esc(s.sub)}</p></header>
  <div class="vis">${s.draw}</div>
  <footer class="rail">${(s.links || []).map((l) => `<a class="btn link${l[2] ? ' ' + l[2] : ''}" href="${l[0]}"${/^https?:/.test(l[0]) ? ' target="_blank" rel="noopener"' : ''}>${esc(l[1])}</a>`).join('')}${s.details ? `<button type="button" class="btn" data-open="${s.id}" aria-haspopup="dialog">Details</button>` : ''}</footer></div></section>`).join('');
const slides = [...trackEl.querySelectorAll('.slide')];
const ids = SLIDES.map((s) => s.id);
const dots = $('#dots');
dots.innerHTML = SLIDES.map((s, i) => `<li><a href="#${s.id}" data-go="${i}" aria-label="Slide ${i + 1}: ${esc(s.name)}"><span></span></a></li>`).join('');

/* The visiontypes carousel. Every few seconds it turns, all three moving together: the one in front moves left and back,
   dimming as it goes; the one behind on the right comes forward into the light; the one behind on the left crosses behind
   them to the right. The one leaving stays on top until the strip of it that will end up underneath has dissolved, so its
   edge is never cut off; only then does it drop behind. Pressing and holding pauses the turning; a tap opens the one
   tapped; a sideways swipe turns it by hand. */
trackEl.querySelectorAll('[data-car]').forEach((car) => {
  const cards = [...car.querySelectorAll('.fr')], n = cards.length, slide = car.closest('.slide');
  const T = 1500, DWELL = 4800, EASE = 'cubic-bezier(.45, .05, .25, 1)';
  const tf = ['translateX(4.5%) scale(1)', 'translateX(70%) scale(.72)', 'translateX(-66%) scale(.72)']; // as in slides.css
  let cur = 0, down = null, block = false, busy = false, waited = 0;
  const turn = (dir) => {
    if (busy) return;
    const from = cards.map((c) => +c.dataset.pos);
    cur = (((cur + dir) % n) + n) % n; waited = 0;
    cards.forEach((c, i) => { c.dataset.pos = (i - cur + n) % n; }); // 0 front, 1 behind on the right, 2 behind on the left
    if (still) return;
    busy = true; setTimeout(() => { busy = false; }, T);
    cards.forEach((c, i) => {
      const a = from[i], b = +c.dataset.pos;
      c.animate([{ transform: tf[a] }, { transform: tf[b] }], { duration: T, easing: EASE });
      if (a !== 0 && b !== 0) { c.style.zIndex = 0; setTimeout(() => { c.style.zIndex = ''; }, T); } // crossing behind both
      if (a !== 0) return;
      // Leaving the front. About a fifth of it, on the side nearest the newcomer, overlaps the newcomer all the way through
      // the turn. That strip dissolves (a soft mask slides over it), then the card drops behind, then the mask lifts.
      const rev = b === 1, p0 = rev ? '66.67% 0' : '33.33% 0', p1 = rev ? '53.33% 0' : '46.67% 0';
      c.classList.add('leaving'); c.classList.toggle('back', rev); c.style.zIndex = 4;
      setTimeout(() => { c.style.zIndex = ''; }, T * 0.6);
      setTimeout(() => { c.classList.remove('leaving', 'back'); }, T);
      const k = [{ offset: 0, p: p0 }, { offset: 0.1, p: p0 }, { offset: 0.54, p: p1 }, { offset: 0.66, p: p1 }, { offset: 1, p: p0 }];
      c.animate(k.map((x) => ({ offset: x.offset, maskPosition: x.p, webkitMaskPosition: x.p })), { duration: T });
    });
  };
  setInterval(() => { // counts only while the slide is showing and nothing is holding it
    if (!slide.classList.contains('on') || document.hidden) { waited = 0; return; }
    if (down || busy) return;
    waited += 200; if (waited >= DWELL) turn(1);
  }, 200);
  const stage = car.querySelector('.stage');
  stage.addEventListener('pointerdown', (e) => { if (e.button) return; down = { x: e.clientX, y: e.clientY, t: performance.now() }; block = false; car.classList.add('hold'); });
  const up = (e) => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y, held = performance.now() - down.t; down = null;
    car.classList.remove('hold');
    if (e.type === 'pointercancel') { block = true; return; }
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) { block = true; turn(dx < 0 ? 1 : -1); }
    else if (held > 350 || Math.hypot(dx, dy) > 10) block = true; // a hold or a drag, not a tap
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  stage.addEventListener('click', (e) => { if (block) { e.preventDefault(); block = false; } });
  stage.addEventListener('contextmenu', (e) => { if (e.pointerType === 'touch' || down) e.preventDefault(); });
  stage.addEventListener('dragstart', (e) => e.preventDefault());
});

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
        const k = Math.min(1, (t - t0) / dur), v = Math.round(to * k); // linear, so the number keeps pace with the marks it is counting
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
  const b = e.target.closest('[data-open],[data-topic]'); if (!b) return;
  /* data-open="<slideId>" opens that slide's Details; data-topic="<slideId>:<key>" opens one entry of its topics. */
  const [sid, key] = (b.dataset.topic || b.dataset.open).split(':'), s = SLIDES[ids.indexOf(sid)];
  const t = key ? s && s.topics && s.topics[key] : s && { title: s.title, body: s.details };
  if (!t) return;
  $('#sheetTitle').textContent = t.title;
  $('#sheetBody').innerHTML = t.body;
  sheet.classList.toggle('topic', !!key);
  opener = b; sheet.showModal(); $('#sheetBody').scrollTop = 0;
});
$('#sheetClose').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; });

const start = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
trackEl.classList.add('nomo'); show(start < 0 ? 0 : start, false);
requestAnimationFrame(() => { trackEl.classList.remove('nomo'); document.documentElement.classList.add('ready'); ready = true; });
