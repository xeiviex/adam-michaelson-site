// Auto-rotating image carousel. Mount: <div class="ic"><div class="ic-stage"><figure class="ic-slide">…</figure>…</div></div>
// Same 10s pace as the quote carousel (carousel.js); pauses on hover/focus; arrows, dots, keyboard and swipe work.
(function () {
  var INTERVAL = 10000;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls) { var n = document.createElement(tag); n.className = cls; return n; }
  Array.prototype.forEach.call(document.querySelectorAll('.ic'), function (box) {
    var stage = box.querySelector('.ic-stage');
    var slides = Array.prototype.slice.call(stage.querySelectorAll('.ic-slide'));
    if (!slides.length) return;
    if (reduce) box.classList.add('ic-still');
    var cur = 0, timer = null, paused = false, dots = [];
    var ctrl = el('div', 'ic-ctrl');
    var prev = el('button', 'ic-arrow ic-prev'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous image');
    var next = el('button', 'ic-arrow ic-next'); next.type = 'button'; next.setAttribute('aria-label', 'Next image');
    var dotWrap = el('div', 'ic-dots');
    slides.forEach(function (s, i) {
      var d = el('button', 'ic-dot'); d.type = 'button'; d.setAttribute('aria-label', 'Show image ' + (i + 1));
      d.addEventListener('click', function () { go(i, true); });
      dotWrap.appendChild(d); dots.push(d);
    });
    ctrl.appendChild(prev); ctrl.appendChild(dotWrap); ctrl.appendChild(next);
    if (slides.length < 2) ctrl.hidden = true;
    box.appendChild(ctrl);
    box.setAttribute('tabindex', '0');

    function go(i, manual) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === cur;
        s.classList.toggle('on', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        var links = s.querySelectorAll('a'); for (var l = 0; l < links.length; l++) links[l].tabIndex = on ? 0 : -1;
        var im = s.querySelector('img'); if (on && im) im.loading = 'eager';
        dots[k].classList.toggle('on', on);
        if (on) dots[k].setAttribute('aria-current', 'true'); else dots[k].removeAttribute('aria-current');
      });
      stage.setAttribute('aria-live', manual ? 'polite' : 'off');
      restart();
    }
    function restart() {
      clearTimeout(timer);
      if (paused || slides.length < 2 || document.hidden) return;
      timer = setTimeout(function () { go(cur + 1, false); }, INTERVAL);
    }
    prev.addEventListener('click', function () { go(cur - 1, true); });
    next.addEventListener('click', function () { go(cur + 1, true); });
    box.addEventListener('keydown', function (e) {
      if (e.target !== box) return;
      if (e.key === 'ArrowLeft') { go(cur - 1, true); e.preventDefault(); }
      if (e.key === 'ArrowRight') { go(cur + 1, true); e.preventDefault(); }
    });
    box.addEventListener('mouseenter', function () { paused = true; restart(); });
    box.addEventListener('mouseleave', function () { paused = false; restart(); });
    box.addEventListener('focusin', function () { paused = true; restart(); });
    box.addEventListener('focusout', function () { paused = false; restart(); });
    document.addEventListener('visibilitychange', restart);
    var sx = null, sy = null;
    stage.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = sy = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
    go(0, false);
  });
})();
