// Career pages: fade each full-screen section in as it arrives, and track the side dots.
(function () {
  const panels = Array.from(document.querySelectorAll('.panel'));
  const dots = Array.from(document.querySelectorAll('.dots a'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reduce) {
    panels.forEach((p) => p.classList.add('in'));
    return;
  }

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
    });
  }, { threshold: 0.25 });
  panels.forEach((p) => reveal.observe(p));

  const current = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      dots.forEach((d) => d.classList.toggle('on', d.getAttribute('href') === '#' + e.target.id));
    });
  }, { threshold: 0.55 });
  panels.forEach((p) => current.observe(p));

  // Side dots scroll smoothly on click only; ordinary scrolling is left to the browser.
  dots.forEach((d) => d.addEventListener('click', (e) => {
    const target = document.querySelector(d.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }));
})();
