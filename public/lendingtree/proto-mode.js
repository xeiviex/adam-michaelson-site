/* Decides how a mobile-app prototype is shown. Phones get the app full screen; everything else gets the iPhone frame.
   Override for testing: ?view=app or ?view=desktop */
(function () {
  var d = document.documentElement, m = /[?&]view=(app|desktop)/.exec(location.search), app;
  if (m) app = m[1] === 'app';
  else {
    var ua = navigator.userAgent || '';
    app = /iPhone|iPod|Android.+Mobile|Windows Phone|Mobile.+Firefox/i.test(ua) ||
      (window.matchMedia && matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 700);
  }
  if (app) {
    d.classList.add('app-mode');
    var vp = document.querySelector('meta[name=viewport]'); if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
    document.addEventListener('DOMContentLoaded', function () {
      var p = document.getElementById('phone'); if (!p) return;
      /* Keep the app glued to the visible area when the iOS keyboard opens, so the docked assistant stays above the keyboard
         and only the content behind it scrolls. */
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
        if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && !e.target.closest('.dock')) ae.blur();
      });
      var a = document.createElement('a'); a.className = 'exitbar'; a.href = '/lendingtree/#solutions'; a.textContent = '‹ Back to Adam\u2019s proposal';
      p.insertBefore(a, p.firstChild);
    });
  }
})();
