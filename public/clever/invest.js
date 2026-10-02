/* Investor-flow behavior: multi-select chips + toggle switches.
   (Single-select option cards and the comment affordance live in build.js.) */

// Multi-select chip groups
document.querySelectorAll('[data-multi]').forEach(function (group) {
  group.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () { chip.classList.toggle('selected'); });
  });
});

// Toggle switches
document.querySelectorAll('.switch').forEach(function (sw) {
  sw.addEventListener('click', function () { sw.classList.toggle('on'); });
});
