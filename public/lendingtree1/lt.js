// Quick, still reveal: .rv elements settle in as they enter the viewport; [data-rvg] children stagger.
(function () {
  var els = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  document.querySelectorAll('[data-rvg]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add('rv'); c.style.transitionDelay = i * 90 + 'ms'; els.push(c); });
  });
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();
