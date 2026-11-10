// Prototype pages: the floating site header stays out of the way. It shows for 1s on page load, then
// rolls up, and stays hidden while scrolling (including the initial scroll back to the top). It returns
// only on a deliberate pull past the top (a new gesture after arriving there), for 3s, then rolls away.
(function () {
  var bar = document.querySelector('.sbar');
  if (!bar) return;
  var LOAD_MS = 1000, PULL_MS = 3000, ARRIVE_MS = 250, timer = null, touching = false, startY = null, lastMove = 0;
  document.documentElement.classList.add('sbar-auto');
  function y() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
  function hide() { clearTimeout(timer); if (bar.contains(document.activeElement)) { timer = setTimeout(hide, 1000); return; } bar.classList.add('sbar-hidden'); }
  function show(ms) { bar.classList.remove('sbar-hidden'); clearTimeout(timer); timer = setTimeout(hide, ms); }
  var topSince = y() <= 0 ? Date.now() - 2000 : null;
  function settled() { return topSince !== null && Date.now() - topSince > ARRIVE_MS && Date.now() - lastMove > ARRIVE_MS; }
  var lastY = y();
  window.addEventListener('scroll', function () {
    var cur = y();
    if (cur !== lastY) lastMove = Date.now();
    if (cur <= 0) { if (topSince === null) topSince = Date.now(); } else topSince = null;
    if (cur > 8) { clearTimeout(timer); bar.classList.add('sbar-hidden'); }
    else if (cur < 0 && touching) { if (bar.classList.contains('sbar-hidden')) show(PULL_MS); } // finger-driven pull past the top
    lastY = cur;
  }, { passive: true });
  window.addEventListener('wheel', function (e) {
    var ok = e.deltaY < 0 && y() <= 0 && settled() && bar.classList.contains('sbar-hidden');
    lastMove = Date.now();   // a flick that is still arriving at the top never counts as a pull
    if (ok) show(PULL_MS);
  }, { passive: true });
  window.addEventListener('touchstart', function (e) { touching = true; startY = y() <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (startY !== null && e.touches[0].clientY - startY > 12 && y() <= 0 && bar.classList.contains('sbar-hidden')) { show(PULL_MS); startY = null; }
  }, { passive: true });
  function end() { touching = false; startY = null; }
  window.addEventListener('touchend', end, { passive: true });
  window.addEventListener('touchcancel', end, { passive: true });
  window.addEventListener('keydown', function (e) { if ((e.key === 'Home' || e.key === 'PageUp' || e.key === 'ArrowUp') && y() <= 0 && settled() && bar.classList.contains('sbar-hidden')) show(PULL_MS); });
  if (y() > 8) bar.classList.add('sbar-hidden'); else timer = setTimeout(hide, LOAD_MS);
})();
