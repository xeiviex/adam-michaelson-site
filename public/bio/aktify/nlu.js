/* Redesigned NLU analyst tool: a looping click-through (dashboard > intent grid > group/filter/sort > intent record).
   All data is illustrative. Markup is built here so the stage stays small in the page source. */
(function () {
  var tile = document.querySelector('.nlu-tile');
  if (!tile) return;
  var stage = tile.querySelector('.nlu-stage');
  var stepsEl = document.querySelector('.nlu-steps');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var INTENTS = {
    Delay: [['conditional', 91, 86], ['day', 88, 142], ['evaluating', 84, 97], ['family sick', 66, 38], ['finances', 79, 64], ['funeral', 93, 41], ['having baby', 90, 52], ['holidays', 87, 118], ['hours', 82, 73], ['new house', 85, 66], ['sick', 72, 89], ['sleeping', 89, 77], ['three days', 94, 105], ['travel', 86, 131], ['two weeks', 92, 120], ['week', 83, 160], ['will reply', 77, 94], ['work', 80, 111]],
    Neutral: [['about contract', 81, 58], ['agent contact info', 90, 71], ['apology', 95, 46], ['auto reply', 97, 210], ['call length', 78, 44], ['confirmation', 88, 132], ['cost demand', 74, 67], ['courtesy or statement', 91, 188], ['credit check', 69, 35], ['fall detection', 64, 59], ['got recording', 61, 48], ['greeting', 96, 240], ['how are you', 94, 99], ['how does it work', 76, 123], ['how to get', 71, 84], ['what is this about', 53, 124], ['info for someone else', 73, 62], ['insurance coverage', 70, 91]],
    Positive: [['call now', 92, 157], ['cancel call', 89, 64], ['is interested', 85, 212], ['schedule call confirmation', 94, 176], ['schedule call day-n-time', 87, 149], ['schedule call in duration', 82, 98]],
    Negative: [['already customer', 90, 137], ['care provided', 84, 72], ['chose competitor', 88, 69], ['cost too high', 80, 154], ['dnc', 97, 301], ['existing customer issue', 62, 55], ['future interest', 75, 83], ['harassment', 93, 36], ['has product', 83, 102], ['needs income', 78, 49], ['not interested', 91, 266], ['phone impaired', 86, 57], ['prospect died', 96, 33], ['transfer success', 89, 118], ['wrong number', 95, 74]]
  };
  var TASKS = [['Protect Your Identity', 73], ['Super Insurance', 81], ['Medical Safety', 88], ['Health Savings Account', 79]];
  var PHRASES = ['what is this regarding', 'who is this and why are you texting me', 'how did you get my number', 'I don’t recognize this number', 'what company is this', 'are you from my alarm company', 'hi what are we going to talk about?', 'why are you reaching out to me', 'is this about my order', 'what are you contacting me about', 'sorry who is this', 'what’s this in reference to', 'did I sign up for something', 'what services are you talking about', 'I didn’t ask for any information', 'what is this about'];
  var RESPONSES = [
    'This is Monica, I work with <mark>Medical Guardian</mark> and I’m following up on your interest in our services. We would love to give you more information. When would be good time for a quick phone call?',
    'I’m following up on your interest in our medical alert services. We would love to give you more information. When would be good time for a quick phone call?',
    'This is Monica, I work with <mark>Medical Guardian</mark> and I’m following up on your request for information. Do you have a few minutes for a quick call?'
  ];

  var SEARCH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';
  var ARROW = '<svg viewBox="0 0 22 22"><path d="M3 2l15 9-6.5 1.6L9 19z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/></svg>';

  function bar(crumbs, act) {
    return '<div class="nlu-bar"><span class="logo">AKTIFY</span>' + crumbs.map(function (c, i) { return '<span class="crumb' + (c === 'NLU' ? ' c-nlu' : '') + '">' + c + '</span>'; }).join('') + '<span class="sp"></span><span class="srch">' + SEARCH + '</span>' + (act ? '<span class="act">Activate Agent</span>' : '') + '</div>';
  }

  function dash() {
    var tasks = TASKS.map(function (t, i) {
      return '<a class="nlu-task t' + i + '"><b>' + t[0] + '</b><em>Medical Guardian</em><span>due: <i>' + (i === 3 ? '9 days' : '7 days') + '</i></span><span>task: <i>Set Up Agent</i></span><span>edited: <i>June 18, 3:41 am</i></span></a>';
    }).join('');
    var days = [['Mon', 62], ['Tue', 78], ['Wed', 90], ['Thu', 70], ['Fri', 54], ['Sat', 22], ['Sun', 12]];
    var bars = days.map(function (d) { return '<div><i style="height:' + d[1] + '%"></i>' + d[0] + '</div>'; }).join('');
    var rows = TASKS.concat([['Fall Detection Plus', 68]]).map(function (t) { return '<div class="nlu-hrow' + (t[1] < 70 ? ' low' : '') + '"><span>' + t[0] + '</span><span class="nlu-meter"><i style="width:' + t[1] + '%"></i></span><b>' + t[1] + '%</b></div>'; }).join('');
    return '<div class="nlu-screen dash" data-s="dash"><div class="nlu-side"><h4>Hi Austin! <span class="nlu-pill">All Tasks ☰</span></h4><p class="sub">You have 3 tasks due today and 7 more tasks due this week.</p>' + tasks + '</div>' +
      '<div class="nlu-main"><h5>Team view</h5><div class="nlu-kpis">' + [['Products & Services', 19, '+2 this month'], ['Companies', 71, '+5 this month'], ['Agents', 102, '+9 this month'], ['Intents', 157, '+14 this month']].map(function (k) { return '<div class="nlu-kpi"><small>' + k[0] + '</small><b>' + k[1] + '</b><u>' + k[2] + '</u></div>'; }).join('') + '</div>' +
      '<h5>Work load · tasks due</h5><div class="nlu-panel"><div class="nlu-bars">' + bars + '</div></div>' +
      '<h5>Agent health &amp; performance</h5><div class="nlu-panel nlu-health"><div>' + rows + '</div><div class="nlu-note"><b>Needs attention:</b> Fall Detection Plus sits below the 70% accuracy line. Most misses are callers asking <b>what this is about</b>, confused with <b>who is this</b>.<br><br><b>Next release:</b> v3 of Protect Your Identity, due in 7 days.</div></div></div></div>';
  }

  var state = { sort: 'recommended', hi: 70 };
  function sorted(list) {
    var l = list.slice();
    if (state.sort === 'accuracy') l.sort(function (a, b) { return a[1] - b[1]; });
    return l;
  }
  function cols() {
    return Object.keys(INTENTS).map(function (g) {
      return '<div class="nlu-col"><h5>' + g + '<small>' + INTENTS[g].length + ' intents</small></h5>' + sorted(INTENTS[g]).map(function (r) {
        var id = r[0].replace(/\W+/g, '-');
        return '<div class="nlu-int' + (r[1] < state.hi ? ' low' : '') + '" data-i="' + id + '"><span>' + r[0] + '</span><em>' + r[1] + '%</em></div>';
      }).join('') + '</div>';
    }).join('');
  }
  function grid() {
    return '<div class="nlu-screen grid" data-s="grid"><div class="nlu-side"><div class="nlu-ver">Version <b>2</b> of 2 · Protect Your Identity</div>' +
      '<h6>Agent accuracy</h6><div class="nlu-acc"><b>73</b><span>% · up 4 pts</span></div><svg class="nlu-spark" viewBox="0 0 270 34" preserveAspectRatio="none"><path d="M0 28 C40 26 60 24 90 22 S150 17 180 14 S240 8 270 5" fill="none" stroke="#5fd3a8" stroke-width="2"/></svg>' +
      '<div class="nlu-btns"><span class="nlu-btn">Revert</span><span class="nlu-btn">Run report</span></div>' +
      '<div class="nlu-thresh">Highlight accuracy below<b>70%</b></div>' +
      '<span class="nlu-btn wide gfs">Group, Filter &amp; Sort</span><div class="nlu-view">grouped by sentiment<b class="sortlbl">recommended (hi &gt; lo)</b></div></div>' +
      '<div class="nlu-cols">' + cols() + '</div></div>';
  }
  function drawer() {
    function opt(c, t, extra) { return '<div class="nlu-opt ' + c + '">' + '<i></i>' + t + (extra || '') + '</div>'; }
    return '<div class="nlu-scrim"></div><div class="nlu-drawer"><span class="x">×</span><h6>Groups</h6>' + opt('', 'none') + opt('sel', 'delay / neutral / pos / neg') +
      '<h6>Filters</h6>' + opt('sq', 'intent: selected') + opt('sq', 'intent: marked') +
      '<h6>Sort</h6>' + opt('sel o-rec', 'recommended (hi &gt; lo)', '<span class="flip">⇄</span>') + opt('o-alpha', 'alphabetical (A &gt; Z)') + opt('o-acc', 'accuracy (lo &gt; hi)') + opt('o-cnt', '# of phrases (lo &gt; hi)') +
      '<span class="nlu-btn wide go save">Save Group/Filter/Sort</span></div>';
  }
  function rec() {
    var ph = PHRASES.map(function (p, i) { return '<div class="nlu-phr p' + i + '"><span>' + p + '</span><i>⋮</i></div>'; }).join('');
    var rs = RESPONSES.map(function (r, i) { return '<div class="nlu-resp r' + i + '"><span class="tools"><i>✎</i><i>✕</i></span>' + r + '</div>'; }).join('');
    return '<div class="nlu-screen rec" data-s="rec"><div class="nlu-side"><div class="nlu-agent">Agent: Protect Your Identity ▾</div><div class="nlu-title">what is this about</div>' +
      '<h6>Intent accuracy report</h6><div class="nlu-acc low"><b>53</b><span>% · below your 70% line</span></div>' +
      '<h6>Definition</h6><p>Expression of confusion about why the agent is contacting them, how the agent got their contact information, etc.</p>' +
      '<h6>Agent behavior</h6><p>Continues core flow (no change)</p>' +
      '<h6>Top confounding intents</h6><div class="nlu-tags"><span>who is this</span><span>get info</span></div>' +
      '<h6>Phrase count</h6><p>113 of 124 selected</p></div>' +
      '<div class="nlu-rec-col"><div class="nlu-colhead"><span>Phrases<small>124 in intent record ▾</small></span><s>+</s></div>' + ph + '</div>' +
      '<div class="nlu-rec-col"><div class="nlu-colhead"><span>Responses</span><s>+</s></div>' + rs + '</div></div>';
  }

  var BAR_DASH = bar(['NLU'], false);
  var CRUMBS = { dash: ['NLU'], grid: ['NLU', 'Medical Guardian', 'Protect Your Identity'], rec: ['NLU', 'Medical Guardian', 'Protect Your Identity', 'Intent Record'] };
  function build() {
    state.sort = 'recommended';
    stage.innerHTML = dash() + grid() + rec() + drawer() + bar([], false) + '<div class="nlu-cursor">' + ARROW + '</div>';
  }
  build();
  var cur = stage.querySelector('.nlu-cursor');
  var barEl = function () { return stage.querySelector('.nlu-bar'); };
  var scale = 1;
  function fit() { scale = tile.clientWidth / 1280; stage.style.setProperty('--s', scale.toFixed(4)); }
  fit();
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(tile); else window.addEventListener('resize', fit);

  function setBar(name) {
    var b = barEl();
    b.innerHTML = '<span class="logo">AKTIFY</span>' + CRUMBS[name].map(function (c) { return '<span class="crumb">' + c + '</span>'; }).join('') + '<span class="sp"></span><span class="srch">' + SEARCH + '</span>' + (name === 'dash' ? '' : '<span class="act">Activate Agent</span>');
  }
  function show(name) {
    [].forEach.call(stage.querySelectorAll('.nlu-screen'), function (s) { s.classList.toggle('on', s.getAttribute('data-s') === name); });
    setBar(name);
    if (stepsEl) [].forEach.call(stepsEl.children, function (b) { b.classList.toggle('on', b.getAttribute('data-go') === name); });
    cur.style.opacity = 1;
  }
  function $(sel) { return stage.querySelector(sel); }

  var token = 0;
  function wait(ms, t) { return new Promise(function (res) { setTimeout(function () { res(t === token); }, ms); }); }
  function pos(sel, fx, fy) {
    var el = $(sel); if (!el) return null;
    var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
    return [(r.left - s.left + r.width * (fx == null ? 0.5 : fx)) / scale, (r.top - s.top + r.height * (fy == null ? 0.5 : fy)) / scale];
  }
  function move(sel, fx, fy) { var p = pos(sel, fx, fy); if (p) cur.style.transform = 'translate(' + p[0] + 'px,' + p[1] + 'px)'; }
  function click(sel) {
    cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click');
    var el = $(sel); if (el) { el.classList.add('press'); setTimeout(function () { el.classList.remove('press'); }, 260); }
  }
  function hot(sel, on) { var el = $(sel); if (el) el.classList.toggle('hot', on); }

  function reset() {
    state.sort = 'recommended';
    $('.nlu-screen.grid .nlu-cols').innerHTML = cols();
    $('.sortlbl').innerHTML = 'recommended (hi &gt; lo)';
    $('.nlu-drawer').classList.remove('on'); $('.nlu-scrim').classList.remove('on');
    [].forEach.call(stage.querySelectorAll('.o-rec,.o-acc'), function (o) { o.classList.toggle('sel', o.classList.contains('o-rec')); });
  }

  async function play(from) {
    var t = ++token, ok;
    var scene = from || 'dash';
    cur.style.transform = 'translate(1000px,640px)';
    while (t === token) {
      if (scene === 'dash') {
        reset(); show('dash');
        if (!(await wait(2600, t))) return;
        move('.t0', 0.7, 0.4); if (!(await wait(1100, t))) return;
        hot('.t0', true); click('.t0'); if (!(await wait(450, t))) return;
        hot('.t0', false); scene = 'grid';
      }
      if (scene === 'grid') {
        reset(); show('grid');
        if (!(await wait(1700, t))) return;
        move('.gfs', 0.5, 0.5); if (!(await wait(1300, t))) return;
        click('.gfs'); if (!(await wait(350, t))) return;
        $('.nlu-scrim').classList.add('on'); $('.nlu-drawer').classList.add('on'); if (!(await wait(1000, t))) return;
        move('.o-acc', 0.4, 0.5); if (!(await wait(1100, t))) return;
        hot('.o-acc', true); click('.o-acc'); if (!(await wait(300, t))) return;
        $('.o-rec').classList.remove('sel'); $('.o-acc').classList.add('sel'); hot('.o-acc', false); if (!(await wait(900, t))) return;
        move('.save', 0.5, 0.5); if (!(await wait(1100, t))) return;
        click('.save'); if (!(await wait(400, t))) return;
        state.sort = 'accuracy'; $('.nlu-screen.grid .nlu-cols').innerHTML = cols();
        [].forEach.call(stage.querySelectorAll('.nlu-screen.grid .nlu-int'), function (e) { e.classList.add('flash'); });
        $('.sortlbl').innerHTML = 'accuracy (lo &gt; hi)';
        $('.nlu-drawer').classList.remove('on'); $('.nlu-scrim').classList.remove('on'); cur.style.transform = 'translate(700px,330px)';
        if (!(await wait(1900, t))) return;
        move('[data-i="what-is-this-about"]', 0.3, 0.5); if (!(await wait(1200, t))) return;
        hot('[data-i="what-is-this-about"]', true); click('[data-i="what-is-this-about"]'); if (!(await wait(450, t))) return;
        scene = 'rec';
      }
      if (scene === 'rec') {
        show('rec');
        if (!(await wait(1800, t))) return;
        move('.p6', 0.3, 0.5); if (!(await wait(1100, t))) return;
        hot('.p6', true); if (!(await wait(1500, t))) return;
        hot('.p6', false); move('.r0', 0.55, 0.6); if (!(await wait(1100, t))) return;
        hot('.r0', true); if (!(await wait(2200, t))) return;
        hot('.r0', false);
        move('.nlu-bar .crumb', 0.5, 0.5); if (!(await wait(1200, t))) return;
        $('.nlu-bar .crumb').classList.add('hot'); click('.nlu-bar .crumb'); if (!(await wait(450, t))) return;
        scene = 'dash';
      }
    }
  }

  // Static views for "jump to" and reduced motion
  function still(name) {
    token++; reset(); show(name); cur.style.opacity = 0;
    if (name === 'grid') { state.sort = 'accuracy'; $('.nlu-screen.grid .nlu-cols').innerHTML = cols(); $('.sortlbl').innerHTML = 'accuracy (lo &gt; hi)'; }
    if (name === 'rec') hot('.r0', true);
  }
  var inView = false, userPicked = false;
  if (stepsEl) stepsEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var n = b.getAttribute('data-go'); userPicked = true;
    if (reduce) still(n); else { cur.style.opacity = 1; play(n); }
  });
  if (reduce) { still('dash'); return; }

  show('dash');
  var running = false;
  function sync() {
    var want = inView && !document.hidden;
    if (want && !running) { running = true; play(userPicked ? undefined : 'dash'); }
    else if (!want && running) { running = false; token++; }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(tile);
  else { inView = true; sync(); }
  document.addEventListener('visibilitychange', sync);
})();
