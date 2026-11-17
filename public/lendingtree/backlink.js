/* Prototype backlinks. The three prototypes are linked from both the current deck (/lendingtree/) and the archived
   October 2026 strategy (/lendingtree1/). Send the visitor back to whichever one they came from. The origin is read
   from the referrer and kept for the session so reloads keep working. Without either, the current deck is the default. */
(function () {
  var KEY = 'lt-from', from = '';
  try {
    var ref = document.referrer ? new URL(document.referrer) : null;
    if (ref && ref.origin === location.origin) {
      if (/^\/lendingtree1(\/|$)/.test(ref.pathname)) from = 'archive';
      else if (/^\/lendingtree\/?$/.test(ref.pathname)) from = 'deck';
      if (from) sessionStorage.setItem(KEY, from);
    }
    if (!from) from = sessionStorage.getItem(KEY) || '';
  } catch (e) { }
  if (from !== 'archive') return;
  document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.querySelectorAll('.trail a[href="/lendingtree/"], .exitbar'), function (a) {
      a.setAttribute('href', '/lendingtree1/' + (a.classList.contains('exitbar') ? '#solutions' : ''));
    });
  });
})();
