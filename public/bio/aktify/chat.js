/* Plays the Aktify hero text conversation in the charter tile. Message copy and timings follow aktify.com. */
(function () {
  var tile = document.querySelector('.chat-tile');
  if (!tile) return;
  var stage = tile.querySelector('.chat-stage');
  var list = tile.querySelector('.chat-msgs');
  var MSGS = [
    { t: 'business', x: 'Hi Tom! We received your request for a roofing bid. We are here to help.' },
    { t: 'typing' },
    { t: 'lead', x: 'Thank you, the hail storm caused some heavy damage last night.' },
    { t: 'typing' },
    { t: 'business', x: 'We can get someone out as early as today. Does today at either 2pm or 3:30pm work?' },
    { t: 'typing' },
    { t: 'lead', x: '2pm would be perfect' },
    { t: 'typing' },
    { t: 'business', x: 'Done! We will have a specialist at your home at 2pm.', ok: true }
  ];
  var AT = [0, 1200, 2400, 3600, 4800, 6200, 7400, 8400, 10000];
  var CYCLE = 18000;
  // Callouts follow the last message (10s): 50% right after, then booked and transferred a second apart
  var CARDS = [['.stat', 10600], ['.booked', 11600], ['.transfer', 12600]];
  var cards = {};
  CARDS.forEach(function (c) { cards[c[0]] = tile.querySelector('.chat-card' + c[0]); });
  function setCard(sel, on) { if (cards[sel]) cards[sel].classList.toggle('show', on); }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function fit() {
    var room = tile.parentNode.clientWidth;
    tile.setAttribute('data-mode', room >= 600 ? 'wide' : 'compact');
    var w = room >= 600 ? 640 : 300, h = room >= 600 ? 560 : 640;
    var s = Math.min(tile.clientWidth / w, tile.clientHeight / h);
    stage.style.setProperty('--s', Math.min(s, 1).toFixed(3));
  }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(tile.parentNode); else window.addEventListener('resize', fit);

  function row(i) {
    var m = MSGS[i], el = document.createElement('div'), b = document.createElement('div');
    b.className = 'chat-bubble';
    if (m.t === 'typing') {
      var lead = MSGS[i + 1] && MSGS[i + 1].t === 'lead';
      el.className = 'chat-row typing' + (lead ? ' lead' : '');
      b.innerHTML = '<span class="chat-dot"></span><span class="chat-dot"></span><span class="chat-dot"></span>';
    } else {
      el.className = 'chat-row ' + m.t + (m.ok ? ' confirmed' : '');
      b.textContent = m.x;
    }
    el.appendChild(b);
    return el;
  }

  function showAll() {
    list.textContent = '';
    MSGS.forEach(function (m, i) { if (m.t !== 'typing') list.appendChild(row(i)); });
    CARDS.forEach(function (c) { setCard(c[0], true); });
  }

  var timers = [], visible = true, running = false;
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function play() {
    clear(); list.textContent = '';
    CARDS.forEach(function (c) { setCard(c[0], false); });
    var els = {};
    AT.forEach(function (ms, i) {
      timers.push(setTimeout(function () {
        var prev = MSGS[i - 1];
        if (MSGS[i].t !== 'typing' && prev && prev.t === 'typing' && els[i - 1]) els[i - 1].remove();
        els[i] = row(i); list.appendChild(els[i]);
      }, ms));
    });
    CARDS.forEach(function (c) { timers.push(setTimeout(function () { setCard(c[0], true); }, c[1])); });
    timers.push(setTimeout(function () { if (visible) play(); else running = false; }, CYCLE));
  }
  function start() {
    if (reduce.matches) { clear(); showAll(); running = false; return; }
    if (!running) { running = true; play(); }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }, { threshold: 0.1 }).observe(tile);
  } else start();
  if (reduce.addEventListener) reduce.addEventListener('change', function () { running = false; start(); });
  start();
})();
