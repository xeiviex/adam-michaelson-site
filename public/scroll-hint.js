/* Scroll hint: site-wide. A small chevron fades in at the bottom center when the visible screen looks complete
   but the page continues below. It leaves as soon as the visitor scrolls, and returns when they pause.
   Injected into every HTML page by functions/_middleware.js, so new pages inherit it.
   Opt out on a page with <html data-no-scroll-hint>. */
(function () {
  if (window.__scrollHint || window.top !== window.self) return;
  window.__scrollHint = true;
  var de = document.documentElement;
  if (de.hasAttribute('data-no-scroll-hint')) return;

  var css = document.createElement('style');
  css.textContent =
    '.sh{position:fixed;left:50%;bottom:max(20px,calc(env(safe-area-inset-bottom,0px) + 14px));z-index:40;width:44px;height:44px;margin-left:-22px;display:grid;place-items:center;padding:0;border:1px solid rgba(190,210,255,.28);border-radius:50%;background:rgba(8,10,16,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease,visibility 0s .5s,background .2s}' +
    '.sh.on{opacity:.9;visibility:visible;transform:none;transition-delay:0s}' +
    '.sh:hover,.sh:focus-visible{opacity:1;background:rgba(8,10,16,.82)}' +
    '.sh svg{width:20px;height:20px;animation:shbob 2.4s ease-in-out infinite}' +
    '@keyframes shbob{0%,100%{transform:translateY(-2px)}50%{transform:translateY(3px)}}' +
    '@media (prefers-reduced-motion:reduce){.sh,.sh svg{animation:none;transition:opacity .3s}}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'sh'; btn.setAttribute('aria-label', 'Scroll down for more'); btn.tabIndex = -1;
  btn.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7.5L10 13l5.5-5.5"/></svg>';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  btn.addEventListener('click', function () { window.scrollBy({ top: Math.round(innerHeight * 0.85), behavior: reduce ? 'auto' : 'smooth' }); });

  var CUT = 'p,h1,h2,h3,h4,h5,h6,li,img,figure,blockquote,pre,tr,button,input,textarea,video,.cta';
  function moreBelow() {
    var d = document.scrollingElement || de;
    return d.scrollHeight - (window.scrollY + innerHeight) > 24;
  }
  /* Content running off the bottom edge already tells the visitor to scroll, so the hint stays away. */
  function cutOff() {
    var vh = innerHeight, els = document.body.querySelectorAll(CUT);
    for (var i = 0; i < els.length; i++) {
      var e = els[i]; if (e === btn || btn.contains(e)) continue;
      var r = e.getBoundingClientRect();
      if (r.height < 4 || r.top >= vh - 8 || r.bottom <= vh + 8) continue;
      var cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.1) continue;
      for (var p = e, fixed = false; p && p !== document.body; p = p.parentElement) { if (getComputedStyle(p).position === 'fixed') { fixed = true; break; } }
      if (!fixed) return true;
    }
    return false;
  }
  function blocked() { return document.hidden || document.body.style.overflow === 'hidden' || de.style.overflow === 'hidden'; }

  var timer = null, first = true;
  function hide() { btn.classList.remove('on'); btn.tabIndex = -1; }
  function evaluate() {
    if (!blocked() && moreBelow() && !cutOff()) { btn.classList.add('on'); btn.tabIndex = 0; } else hide();
  }
  function arm(ms) { clearTimeout(timer); timer = setTimeout(evaluate, ms); }
  function onActivity() { hide(); arm(1400); }

  document.body.appendChild(btn);
  window.addEventListener('scroll', onActivity, { passive: true });
  window.addEventListener('resize', onActivity);
  window.addEventListener('wheel', onActivity, { passive: true });
  window.addEventListener('touchmove', onActivity, { passive: true });
  document.addEventListener('keydown', function (e) { if (e.key !== 'Tab') onActivity(); });
  document.addEventListener('visibilitychange', onActivity);
  /* First look: wait for entrance animations and late layout to settle. */
  var go = function () { arm(first ? 2600 : 1400); first = false; };
  if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
})();
