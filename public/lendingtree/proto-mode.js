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
    document.addEventListener('DOMContentLoaded', function () {
      var p = document.getElementById('phone'); if (!p) return;
      var a = document.createElement('a'); a.className = 'exitbar'; a.href = '/lendingtree/#solutions'; a.textContent = '‹ Back to the LendingTree page';
      p.insertBefore(a, p.firstChild);
    });
  }
})();
