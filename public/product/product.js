// Scroll-in reveal: elements marked .rv fade up as they enter the viewport; [data-rvg] children stagger.
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  document.querySelectorAll('[data-rvg]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add('rv'); c.style.setProperty('--d', i * 120 + 'ms'); els.push(c); });
  });
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  els.forEach(function (e) { io.observe(e); });
})();

// Hero photo rotator: crossfade every 5 seconds, no controls.
(function () {
  var box = document.querySelector('.fade-show');
  if (!box) return;
  var imgs = Array.prototype.slice.call(box.querySelectorAll('img'));
  if (imgs.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function () {
    imgs[i].classList.remove('on');
    i = (i + 1) % imgs.length;
    imgs[i].loading = 'eager';
    imgs[i].classList.add('on');
  }, 5000);
})();
