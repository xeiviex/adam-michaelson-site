// Entrance choreography for /bio:
//   1. photo + header fade in
//   2. metric cards fade in one at a time, left → right
//   3. each section header types out, then its paragraph fades in
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

  function typeInto(el, text, caret) {
    return new Promise((done) => {
      el.after(caret);
      let i = 0;
      (function step() {
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

  // 1. Header
  setTimeout(() => $$('[data-step="head"]').forEach(show), HEAD_MS);

  // 2. Cards fade in left → right
  cards.forEach((card, i) => {
    setTimeout(() => show(card), CARDS_MS + i * CARD_STEP_MS);
  });

  // 3. Sections, strictly in order
  (async function () {
    await wait(CARDS_MS + cards.length * CARD_STEP_MS + 300);
    for (const h of heads) {
      await typeHeader(h);
      show(h.nextElementSibling);
      await wait(BODY_HOLD_MS);
    }
    $$('[data-step="foot"]').forEach(show);
  })();
})();
