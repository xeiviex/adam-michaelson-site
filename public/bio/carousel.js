// Rotating endorsement quotes. Mount: <aside class="quotes" data-page="main|lendio1|..."></aside>
// Data lives in quotes-data.js. Auto-advances every 10s; arrows, keyboard and swipe all work.
(function () {
  var root = document.querySelector('.quotes[data-page]');
  if (!root || !window.BIO_QUOTES) return;
  var page = root.getAttribute('data-page');
  var list = window.BIO_QUOTES.filter(function (x) { return x.pages.indexOf(page) !== -1; });
  if (!list.length) { root.remove(); return; }

  var INTERVAL = 10000;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Order: try many random arrangements (each person's quotes at evenly spaced, randomly offset slots)
  // and keep the one where the same person is farthest from themselves, counting the loop back to the start.
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function arrange(items) {
    var groups = {};
    items.forEach(function (x) { (groups[x.by] = groups[x.by] || []).push(x); });
    var slotted = [];
    Object.keys(groups).forEach(function (k) {
      var g = shuffle(groups[k].slice());
      var off = Math.random();
      g.forEach(function (x, i) { slotted.push({ x: x, s: (i + off) / g.length }); });
    });
    return slotted.sort(function (a, b) { return a.s - b.s; }).map(function (o) { return o.x; });
  }
  function cost(seq) {
    var n = seq.length, last = {}, first = {}, c = 0;
    seq.forEach(function (x, i) {
      if (last[x.by] !== undefined) { var d = i - last[x.by]; c += 1 / (d * d); }
      else first[x.by] = i;
      last[x.by] = i;
    });
    Object.keys(last).forEach(function (k) { if (first[k] !== last[k]) { var d = n - last[k] + first[k]; c += 1 / (d * d); } });
    return c;
  }
  function order(items) {
    var best = null, bc = Infinity;
    for (var t = 0; t < 300; t++) { var s = arrange(items), c = cost(s); if (c < bc) { bc = c; best = s; } }
    return best;
  }
  var seq = order(list);

  function el(tag, cls, text) {
    var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n;
  }

  var wrap = el('div', 'wrap');
  var box = el('div', 'qc');
  box.setAttribute('role', 'group');
  box.setAttribute('aria-roledescription', 'carousel');
  box.setAttribute('aria-label', 'What colleagues say about working with Adam');
  var stage = el('div', 'qc-stage');
  stage.setAttribute('aria-live', 'off');
  var slides = seq.map(function (x, i) {
    var f = el('figure', 'qc-slide');
    f.setAttribute('role', 'group');
    f.setAttribute('aria-roledescription', 'slide');
    f.setAttribute('aria-label', (i + 1) + ' of ' + seq.length);
    var bq = el('blockquote', 'qc-text'); bq.textContent = '“' + x.q + '”';
    var cap = el('figcaption', 'qc-who');
    cap.appendChild(el('span', 'qc-name', x.name));
    cap.appendChild(el('span', 'qc-role', x.role));
    if (x.post) {
      var a = el('a', 'qc-post', 'see full post here');
      a.href = x.post; a.target = '_blank'; a.rel = 'noopener noreferrer';
      cap.appendChild(a);
    }
    f.appendChild(bq); f.appendChild(cap);
    stage.appendChild(f);
    return f;
  });

  var prev = el('button', 'qc-arrow qc-prev'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous quote'); 
  var next = el('button', 'qc-arrow qc-next'); next.type = 'button'; next.setAttribute('aria-label', 'Next quote'); 
  box.appendChild(prev); box.appendChild(stage); box.appendChild(next);
  wrap.appendChild(box); root.appendChild(wrap);
  if (reduce) root.classList.add('qc-still');
  if (seq.length < 2) { prev.hidden = next.hidden = true; }

  var cur = 0, timer = null, paused = false;
  // Stage height follows the visible quote so short quotes don't leave a gap.
  function sizeStage() { stage.style.height = slides[cur].offsetHeight + 'px'; }
  window.addEventListener('resize', sizeStage);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeStage);
  function go(i, manual) {
    cur = (i + seq.length) % seq.length;
    slides.forEach(function (s, k) {
      var on = k === cur;
      s.classList.toggle('on', on);
      if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      var links = s.querySelectorAll('a'); for (var l = 0; l < links.length; l++) links[l].tabIndex = on ? 0 : -1;
    });
    sizeStage();
    stage.setAttribute('aria-live', manual ? 'polite' : 'off');
    restart();
  }
  function restart() {
    clearTimeout(timer);
    if (paused || seq.length < 2 || document.hidden) return;
    timer = setTimeout(function () { go(cur + 1, false); }, INTERVAL);
  }
  prev.addEventListener('click', function () { go(cur - 1, true); });
  next.addEventListener('click', function () { go(cur + 1, true); });
  box.setAttribute('tabindex', '0');
  box.addEventListener('keydown', function (e) {
    if (e.target !== box) return;
    if (e.key === 'ArrowLeft') { go(cur - 1, true); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(cur + 1, true); e.preventDefault(); }
  });

  // Pause while hovered or focused so the quote doesn't change under the reader.
  box.addEventListener('mouseenter', function () { paused = true; restart(); });
  box.addEventListener('mouseleave', function () { paused = false; restart(); });
  box.addEventListener('focusin', function () { paused = true; restart(); });
  box.addEventListener('focusout', function () { paused = false; restart(); });
  document.addEventListener('visibilitychange', restart);

  // Swipe on touch screens.
  var sx = null, sy = null;
  stage.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = sy = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  go(0, false);
})();
