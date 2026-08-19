/* Types the AI companion message in, letter by letter, preserving inline
   formatting (bold, lists). Targets any [data-type-ai] element and every
   `.ai-note p`. Elements start hidden (via inline style or CSS) and are
   revealed as typing begins, so there's no flash of the full text. */
(function () {
  function collectTextNodes(el, arr) {
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i];
      if (n.nodeType === 3) arr.push(n);
      else if (n.nodeType === 1) collectTextNodes(n, arr);
    }
  }

  function typeEl(el) {
    var speed = parseInt(el.getAttribute('data-type-ai'), 10) || 15;
    var nodes = [];
    collectTextNodes(el, nodes);
    var texts = nodes.map(function (n) { return n.nodeValue; });
    nodes.forEach(function (n) { n.nodeValue = ''; });
    el.style.visibility = 'visible';

    var i = 0, j = 0;
    (function step() {
      if (i >= nodes.length) return;
      var t = texts[i];
      if (j < t.length) { nodes[i].nodeValue += t.charAt(j); j++; }
      else { i++; j = 0; }
      setTimeout(step, speed);
    })();
  }

  function run() {
    var els = document.querySelectorAll('[data-type-ai], .ai-note p');
    for (var k = 0; k < els.length; k++) typeEl(els[k]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
