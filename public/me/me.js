// /me — placeholder fallback, scroll reveal, photo lightbox.
(function () {
  // A slot whose file is not there yet shows its placeholder instead of a broken image.
  document.querySelectorAll('.ph').forEach(function (ph) {
    var m = ph.querySelector('img, video');
    if (!m) { ph.classList.add('missing'); return; }
    var miss = function () { ph.classList.add('missing'); };
    m.addEventListener('error', miss);
    var s = m.querySelector('source'); if (s) s.addEventListener('error', miss);
    if (m.tagName === 'IMG' && m.complete && m.naturalWidth === 0) miss();
  });

  var io = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.rv').forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); });

  var shots = [].slice.call(document.querySelectorAll('.ph.zoom'));
  if (!shots.length) return;
  var lb = document.createElement('div'); lb.id = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button class="x" aria-label="Close">&times;</button><button class="p" aria-label="Previous">&lsaquo;</button><img alt=""><button class="n" aria-label="Next">&rsaquo;</button>';
  document.body.appendChild(lb);
  var img = lb.querySelector('img'), at = 0;
  function live() { return shots.filter(function (p) { return !p.classList.contains('missing'); }); }
  function show(i) { var l = live(); at = (i + l.length) % l.length; var s = l[at].querySelector('img'); img.src = s.currentSrc || s.src; img.alt = s.alt; }
  function open(p) { var l = live(); show(l.indexOf(p)); lb.classList.add('on'); lb.querySelector('.x').focus(); }
  function close() { lb.classList.remove('on'); }
  shots.forEach(function (p) { p.addEventListener('click', function () { if (!p.classList.contains('missing')) open(p); }); });
  lb.querySelector('.x').onclick = close;
  lb.querySelector('.p').onclick = function (e) { e.stopPropagation(); show(at - 1); };
  lb.querySelector('.n').onclick = function (e) { e.stopPropagation(); show(at + 1); };
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === img) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(at - 1); else if (e.key === 'ArrowRight') show(at + 1);
  });
})();
