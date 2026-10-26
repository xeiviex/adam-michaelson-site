/* Decides how a mobile-app prototype is shown. Phones get the app full screen; everything else gets the iPhone frame.
   Override for testing: ?view=app or ?view=desktop */
(function () {
  var d = document.documentElement, m = /[?&]view=(app|desktop)/.exec(location.search), app;
  if (m) app = m[1] === 'app';
  else {
    var ua = navigator.userAgent || '';
    var ipadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    app = /iPhone|iPod|iPad|Android|Windows Phone|Mobile.+Firefox/i.test(ua) || ipadOS ||
      (window.matchMedia && matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 1100);
  }
  if (app) {
    d.classList.add('app-mode');
    var vp = document.querySelector('meta[name=viewport]'); if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
    document.addEventListener('DOMContentLoaded', function () {
      var p = document.getElementById('phone'); if (!p) return;
      /* Keep the app glued to the visible area when the iOS keyboard opens, so the docked assistant stays above the keyboard
         and only the content behind it scrolls. */
      var land = innerWidth > innerHeight;
      function turned() {
        var now = innerWidth > innerHeight; if (now === land) return; land = now;
        p.classList.remove('rot'); void p.offsetWidth; p.classList.add('rot');
      }
      window.addEventListener('resize', turned); window.addEventListener('orientationchange', function () { setTimeout(turned, 60); });
      var vv = window.visualViewport;
      function fit() {
        if (!vv) return;
        p.style.top = vv.offsetTop + 'px'; p.style.bottom = 'auto'; p.style.height = vv.height + 'px';
        d.classList.toggle('kb', window.innerHeight - vv.height > 120);
      }
      if (vv) { vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit(); }
      document.addEventListener('focusin', function () { setTimeout(fit, 50); setTimeout(fit, 300); });
      /* Tapping anywhere outside the assistant closes the keyboard; scrolling does not. */
      p.addEventListener('click', function (e) {
        var ae = document.activeElement;
        if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && !e.target.closest('.dock, input, select, textarea, label')) ae.blur();
      });
      var a = document.createElement('a'); a.className = 'exitbar'; a.href = '/lendingtree/#solutions'; a.textContent = '‹ Back to Adam\u2019s proposal';
      p.insertBefore(a, p.firstChild);
    });
  }
})();

/* The status bar clock follows the device clock and locale (no AM/PM, like iOS). */
(function () {
  function stamp() {
    var t = '';
    try { t = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).formatToParts(new Date()).filter(function (p) { return p.type !== 'dayPeriod' && !(p.type === 'literal' && /\s/.test(p.value) && p.value.trim() === '' && false); }).map(function (p) { return p.value; }).join('').replace(/\s+$/, '').replace(/\u202f|\u00a0/g, ''); } catch (e) { var d = new Date(); t = d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2); }
    [].forEach.call(document.querySelectorAll('.phone .sb .clock'), function (el) { el.textContent = t; });
  }
  document.addEventListener('DOMContentLoaded', function () { stamp(); setInterval(stamp, 15000); });
})();
