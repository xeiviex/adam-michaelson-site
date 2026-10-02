/* Shared behavior for the "Build your package" flow.
   - single-select option cards
   - comment (speech-bubble) affordance on auto-filled values */

// Option cards: single-select within each [data-opt-group]
document.querySelectorAll('[data-opt-group]').forEach(function (group) {
  group.querySelectorAll('.opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      group.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
    });
  });
});

// Comment affordance
document.querySelectorAll('.comment-btn').forEach(function (btn) {
  var row  = btn.closest('.p-row, .adj-field');
  if (!row) return;
  var wrap = row.querySelector('.note-wrap');
  if (!wrap) return;

  btn.addEventListener('click', function () {
    if (wrap.hasAttribute('hidden')) {
      wrap.removeAttribute('hidden');
      var ta = wrap.querySelector('textarea');
      ta.focus();
    } else {
      wrap.setAttribute('hidden', '');
    }
  });

  var save = wrap.querySelector('.save-note');
  if (save) {
    save.addEventListener('click', function () {
      var ta = wrap.querySelector('textarea');
      var val = ta.value.trim();
      if (!val) { wrap.setAttribute('hidden', ''); return; }

      var existing = row.querySelector('.saved-note');
      if (existing) existing.remove();

      var bubble = document.createElement('div');
      bubble.className = 'saved-note';
      var tag = document.createElement('span');
      tag.className = 'saved-note-tag';
      tag.textContent = 'Your note';
      bubble.appendChild(tag);
      bubble.appendChild(document.createTextNode(val));
      row.appendChild(bubble);

      btn.classList.add('active');
      ta.value = '';
      wrap.setAttribute('hidden', '');
    });
  }
});
