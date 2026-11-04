// Renders every quote in /bio/quotes-data.js, grouped by person (people with the most quotes first).
(function () {
  var data = window.BIO_QUOTES || [], root = document.getElementById('recs');
  if (!root) return;
  var order = [], by = {};
  data.forEach(function (x) {
    if (!by[x.by]) { by[x.by] = { name: x.name, role: x.role, items: [] }; order.push(x.by); }
    by[x.by].items.push(x);
  });
  order.sort(function (a, b) { return by[b].items.length - by[a].items.length; });
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  order.forEach(function (k) {
    var p = by[k], sec = el('section', 'person');
    var who = el('div', 'who'); who.appendChild(el('h2', '', p.name)); who.appendChild(el('p', 'role', p.role));
    var list = el('ul', 'quotes-list');
    p.items.forEach(function (x) {
      var li = el('li'), bq = el('blockquote', '', '“' + x.q + '”');
      li.appendChild(bq);
      if (x.post) { var a = el('a', 'src', 'see full post here'); a.href = x.post; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.appendChild(a); }
      list.appendChild(li);
    });
    sec.appendChild(who); sec.appendChild(list); root.appendChild(sec);
  });
})();
