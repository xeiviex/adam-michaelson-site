// Entrance choreography for /bio:
//   1. photo + header fade in
//   2. metric cards fade in one at a time, left → right
//   3. each section header types out, then its paragraph fades in
// Sections build as they come into view, and a rapid scroll skips the animation.
(function () {
  // ---- Tunable timing (milliseconds) ----
  const TYPE_SPEED   = 42;   // same cadence as the homepage quotes
  const HEAD_MS      = 150;  // header fade starts
  const CARDS_MS     = 900;  // first card fades in
  const CARD_STEP_MS = 500;  // gap between cards
  const BODY_HOLD_MS = 700;  // pause after a paragraph before the next header

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const show = (el) => el.classList.add('in');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const heads = $$('.section h2');
  const cards = $$('.card');

  // Build each header: an invisible ghost holds the final footprint so
  // nothing shifts while the visible layer types over it.
  heads.forEach((h) => {
    const t = h.dataset.t;
    h.setAttribute('aria-label', t);
    h.innerHTML =
      '<span class="ghost" aria-hidden="true">' + escape(t) + '</span>' +
      '<span class="typed" aria-hidden="true"><span class="t"></span></span>';
  });

  if (reduce) {
    $$('.reveal').forEach(show);
    heads.forEach((h) => {
      h.querySelector('.typed .t').textContent = h.dataset.t;
    });
    return;
  }

  function escape(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // Slightly longer pauses after punctuation give a natural typewriter cadence.
  function delayFor(ch) {
    if ('.!?…'.indexOf(ch) !== -1) return 300;
    if (',;:—'.indexOf(ch) !== -1) return 150;
    return TYPE_SPEED;
  }

  // ---- Scroll awareness ----
  // A fast scroll (a flick, End, Space) puts the page in "fast" mode for a moment:
  // pending delays resolve at once, typing completes instantly, and everything at
  // or above the viewport is revealed without animation.
  const FAST_PX_PER_S = 1200;  // scroll speed that counts as "rapid"
  const FAST_HOLD_MS  = 1500;  // how long fast mode lasts after the last rapid scroll
  let fastUntil = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  const wakers = [];
  const isFast = () => performance.now() < fastUntil;
  const wake = () => wakers.splice(0).forEach((fn) => fn());

  window.addEventListener('scroll', () => {
    const t = performance.now();
    const y = window.scrollY;
    const dt = t - lastT;
    if (dt > 0 && Math.abs(y - lastY) / dt * 1000 > FAST_PX_PER_S) fastUntil = t + FAST_HOLD_MS;
    lastY = y;
    lastT = t;
    wake();
  }, { passive: true });

  // Resolves after ms, or as soon as the page enters fast mode.
  const pause = (ms) => new Promise((resolve) => {
    if (isFast()) return resolve();
    const timer = setTimeout(resolve, ms);
    wakers.push(() => { if (isFast()) { clearTimeout(timer); resolve(); } });
  });
  // Resolves on the next scroll, or after ms.
  const nextScroll = (ms) => new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    wakers.push(() => { clearTimeout(timer); resolve(); });
  });

  function typeInto(el, text, caret) {
    return new Promise((done) => {
      el.after(caret);
      let i = 0;
      (function step() {
        if (isFast()) { el.textContent = text; return done(); }
        if (i < text.length) {
          const ch = text[i++];
          el.textContent += ch;
          setTimeout(step, delayFor(ch));
        } else done();
      })();
    });
  }

  async function typeHeader(h) {
    const caret = document.createElement('span');
    caret.className = 'caret';
    await typeInto(h.querySelector('.typed .t'), h.dataset.t, caret);
    caret.remove();
  }

  const fillHeader = (h) => { h.querySelector('.typed .t').textContent = h.dataset.t; };

  // 1. Header
  setTimeout(() => $$('[data-step="head"]').forEach(show), HEAD_MS);

  // 2 + 3. Cards, then sections, strictly in order
  (async function () {
    await pause(CARDS_MS);
    for (const card of cards) {
      if (isFast()) { cards.forEach(show); break; }
      show(card);
      await pause(CARD_STEP_MS);
    }
    await pause(300);

    for (const h of heads) {
      // Don't build what nobody can see yet: wait until the header is near the viewport.
      while (h.getBoundingClientRect().top > window.innerHeight * 0.92) await nextScroll(400);

      const r = h.getBoundingClientRect();
      if (isFast() || r.bottom < 0) fillHeader(h);   // fast scroll, or already scrolled past
      else await typeHeader(h);
      show(h.nextElementSibling);
      await pause(BODY_HOLD_MS);
    }
    $$('[data-step="foot"]').forEach(show);
  })();
})();
