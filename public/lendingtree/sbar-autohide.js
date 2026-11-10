// Prototype pages: the floating site header stays out of the way. It rolls up as soon as the page
// scrolls, and only comes back when the visitor is at the very top and keeps pulling/scrolling up.
// It then rolls away again after a few seconds.
(function () {
  var bar = document.querySelector('.sbar');
  if (!bar) return;
  var root = document.documentElement, SHOW_MS = 3500, timer = null, startY = null;
  root.classList.add('sbar-auto');
  function hide() { clearTimeout(timer); if (bar.contains(document.activeElement)) { timer = setTimeout(hide, 1500); return; } bar.classList.add('sbar-hidden'); }
  function reveal() {
    bar.classList.remove('sbar-hidden');
    clearTimeout(timer); timer = setTimeout(hide, SHOW_MS);
  }
  function y() { return window.pageYOffset || document.documentElement.scrollTop || 0; }
  var lastY = y();
  window.addEventListener('scroll', function () {
    var cur = y();
    if (cur < 0) reveal();                       // iOS rubber-band pull past the top
    else if (cur > 8 && cur > lastY) { clearTimeout(timer); bar.classList.add('sbar-hidden'); }
    else if (cur > 8 && cur < lastY && !bar.classList.contains('sbar-hidden')) hide();
    lastY = cur;
  }, { passive: true });
  window.addEventListener('wheel', function (e) { if (e.deltaY < 0 && y() <= 0) reveal(); }, { passive: true });
  window.addEventListener('touchstart', function (e) { startY = y() <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (startY !== null && e.touches[0].clientY - startY > 12 && y() <= 0) { reveal(); startY = null; }
  }, { passive: true });
  window.addEventListener('keydown', function (e) { if ((e.key === 'Home' || e.key === 'PageUp' || e.key === 'ArrowUp') && y() <= 0) reveal(); });
  if (y() > 8) bar.classList.add('sbar-hidden');
})();
