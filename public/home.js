(function () {
  var $ = function (id) { return document.getElementById(id); };
  try { var tq = new URLSearchParams(location.search).get('trace'); if (tq) document.documentElement.setAttribute('data-trace', tq); } catch (e) {}
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var openers = [
    "Hi, I'm Adam. Ask me whatever you're curious about, about my work or about me.",
    "Hey there. I'd normally ask what brought you here, so what did?",
    "Welcome. Whatever you came here wondering, go ahead and ask.",
    "Not sure where to start? Tell me what you're looking for and I'll point you there.",
    "Hello. I build products, mostly with AI these days. What would you like to know?"
  ];
  var log = $('log'), EMAIL = 'hello@adam-michaelson.com';

  /* ---- sound: two soft notes, only after the browser allows audio ---- */
  var ctx = null, soundOn = true;
  function audio() {
    try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(freq, at, dur, vol) {
    var c = ctx; if (!c || c.state !== 'running') return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + at);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
    o.connect(g); g.connect(c.destination); o.start(c.currentTime + at); o.stop(c.currentTime + at + dur + 0.05);
  }
  function ding() { if (!soundOn) return; audio(); tone(880, 0, 0.16, 0.05); tone(1318, 0.09, 0.22, 0.045); }
  function whoosh() { if (!soundOn) return; audio(); tone(520, 0, 0.12, 0.03); }
  ['pointerdown', 'keydown'].forEach(function (ev) { window.addEventListener(ev, function () { audio(); }, { once: true }); });

  /* ---- chat ---- */
  function row(user, lg) {
    lg = lg || log;
    var r = document.createElement('div'); r.className = 'row' + (user ? ' user' : '');
    if (!user) { var a = document.createElement('div'); a.className = 'av'; r.appendChild(a); }
    var b = document.createElement('div'); b.className = 'bubble'; r.appendChild(b);
    lg.appendChild(r); if (!lg._hold) lg.scrollTop = lg.scrollHeight; return b;
  }
  function setText(b, text) {
    var k = text.indexOf(EMAIL);
    if (k < 0) { b.textContent = text; return; }
    b.textContent = text.slice(0, k);
    var a = document.createElement('a'); a.href = 'mailto:' + EMAIL; a.textContent = EMAIL; a.style.color = 'inherit';
    b.appendChild(a); b.appendChild(document.createTextNode(text.slice(k + EMAIL.length)));
  }
  /* Adam's reply: dots bubble for a few seconds, then the full message pops in. */
  function botSay(text, wait, lg, ok) {
    lg = lg || log;
    var b = row(false, lg); b.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    setTimeout(function () {
      if (ok && !ok()) { return; }
      ding(); setText(b, text); b.classList.add('pop'); if (!reduce) { b.classList.add('trace'); setTimeout(function () { b.classList.remove('trace'); }, 1900); } if (!lg._hold) lg.scrollTop = lg.scrollHeight;
    }, reduce ? 0 : wait);
    return b;
  }

  /* ---- load sequence ---- */
  var ctas = Array.prototype.slice.call(document.querySelectorAll('.cta'));
  var STEP = 650, t0 = reduce ? 0 : 350;
  ctas.forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); }, reduce ? 0 : t0 + i * STEP); });
  setTimeout(function () { $('photo').classList.add('in'); }, reduce ? 0 : 200);
  var chatAt = reduce ? 0 : t0 + ctas.length * STEP + 400;
  setTimeout(function () {
    $('chat').classList.add('in'); whoosh();
    botSay(openers[Math.floor(Math.random() * openers.length)], 2800);
  }, chatAt);

  /* ---- highlight cycle: 3s on each CTA, hover or focus pauses it ---- */
  var idx = -1, timer = null, paused = false;
  function show(i) { ctas.forEach(function (c, j) { c.classList.toggle('hl', j === i); }); }
  function next() {
    if (paused) return;
    idx = (idx + 1) % ctas.length; show(idx);
    if (reduce) return;
    timer = setTimeout(next, 3000);
  }
  setTimeout(next, reduce ? 0 : t0 + 250);
  var nav = document.querySelector('.ctas');
  function pause() { paused = true; clearTimeout(timer); show(-1); }
  function resume() { if (!paused) return; paused = false; timer = setTimeout(next, 600); }
  nav.addEventListener('pointerenter', pause); nav.addEventListener('pointerleave', resume);
  nav.addEventListener('focusin', pause); nav.addEventListener('focusout', resume);

  /* ---- scroll-in for the lead sections ---- */
  var items = [];
  Array.prototype.forEach.call(document.querySelectorAll('.lead'), function (sec) {
    var k = 0;
    Array.prototype.forEach.call(sec.querySelectorAll('.rv, [data-rvg] > div, [data-rvg] > a'), function (el) {
      el.classList.add('rv'); el.style.setProperty('--d', (k++ * 110) + 'ms'); items.push(el);
    });
  });
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    /* animate in at 18% visible; reset once fully back below the viewport so it replays on the next scroll down */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.intersectionRatio >= 0.18) e.target.classList.add('in');
        else if (!e.isIntersecting && e.boundingClientRect.top > 0) e.target.classList.remove('in');
      });
    }, { threshold: [0, 0.18], rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---- Check my fit: a chat in a modal. Links are validated here, but the posting is not read
         yet: a server function has to do that. Until then the reply points to email. ---- */
  var flog = $('flog'), fmsg = $('fmsg'), ffield = $('ffield'), fgen = 0, fcount = 0, lastFocus = null, FMAX = 5;
  function fgrow() { fmsg.style.height = 'auto'; fmsg.style.height = Math.min(fmsg.scrollHeight, 128) + 'px'; ffield.classList.toggle('has', !!fmsg.value.trim()); }
  function fok(g) { return function () { return g === fgen; }; }
  function checkLink(raw) {
    var t = raw.trim();
    function no(why) { return { ok: false, why: why }; }
    if (!t) return no('');
    if (t.length > 2048) return no("That link is too long for me to open.");
    if (/\s/.test(t)) return no("Please paste just the link, one at a time, with nothing else.");
    var u;
    try { u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : 'https://' + t); } catch (e) { return no("That doesn't look like a web link. Try pasting the full address of the posting."); }
    if (u.protocol !== 'https:') return no("I can only open secure (https) links to job postings.");
    if (u.username || u.password) return no("I can't open links that contain a username or password.");
    if (u.port && u.port !== '443') return no("I can only open standard web addresses.");
    var h = u.hostname.toLowerCase();
    if (h.indexOf('.') < 0 || h.indexOf(':') > -1 || /^[\d.]+$/.test(h)) return no("Please use a normal website address, not an IP address.");
    if (/(^|\.)(localhost|local|internal|intranet|lan|home|corp|onion|test|invalid|example)$/.test(h)) return no("That address isn't a public website I can open.");
    if (h.indexOf('xn--') > -1) return no("I can't open links with look-alike characters in the address.");
    if (/\.(exe|msi|bat|cmd|sh|js|jar|zip|rar|7z|dmg|apk|iso|scr)$/i.test(u.pathname)) return no("That link goes to a file, not a job posting.");
    return { ok: true, url: u };
  }
  function openFit() {
    lastFocus = document.activeElement; fgen++; var g = fgen;
    flog.innerHTML = ''; flog._hold = false; fmsg.value = ''; fgrow(); fcount = 0;
    $('fscrim').classList.add('on'); $('fdlg').classList.add('on'); document.body.style.overflow = 'hidden';
    botSay("Paste a link to a job posting or description, and I'll tell you honestly how I fit.", 1800, flog, fok(g));
    setTimeout(function () { fmsg.focus(); }, 60);
  }
  function closeFit() {
    if (!$('fdlg').classList.contains('on')) return;
    fgen++; flog.innerHTML = ''; fmsg.value = ''; fgrow();
    $('fscrim').classList.remove('on'); $('fdlg').classList.remove('on'); document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('fclose').addEventListener('click', closeFit);
  $('fscrim').addEventListener('click', closeFit);
  fmsg.addEventListener('input', fgrow);
  fmsg.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('fform').requestSubmit(); } });
  $('fform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = fmsg.value.trim(); if (!v) return;
    var g = fgen, res = checkLink(v);
    flog._hold = false;
    row(true, flog).textContent = v.length > 90 ? v.slice(0, 87) + '...' : v;
    fmsg.value = ''; fgrow();
    if (!res.ok) { botSay(res.why, 1200, flog, fok(g)); return; }
    if (fcount >= FMAX) { botSay("I've reached my limit for this visit. Email me and I'll go through it with you myself.", 1200, flog, fok(g)); return; }
    fcount++;
    botSay("Thanks. The fit check isn't live yet, so I can't read that posting. Send the link to " + EMAIL + " and I'll go through it with you myself.", 2400, flog, fok(g));
  });
  $('fdlg').addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = [$('fclose'), fmsg, $('fdlg').querySelector('.enter')], i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
  });

  /* ---- chat form and layout controls ---- */
  var msg = $('msg'), field = $('field');
  function grow() {
    msg.style.height = 'auto'; msg.style.height = Math.min(msg.scrollHeight, 128) + 'px';
    field.classList.toggle('has', !!msg.value.trim());
  }
  msg.addEventListener('input', grow);
  msg.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('form').requestSubmit(); }
  });
  var spacer = null;
  function setMax(on) {
    var chat = $('chat'), isMax = chat.classList.contains('max');
    if (on === isMax) return;
    if (on) {
      spacer = document.createElement('div'); spacer.style.cssText = 'flex:none;height:' + chat.offsetHeight + 'px';
      chat.parentNode.insertBefore(spacer, chat);
      chat.classList.add('max'); $('scrim').classList.add('on'); document.body.style.overflow = 'hidden';
    } else {
      chat.classList.remove('max'); $('scrim').classList.remove('on'); document.body.style.overflow = '';
      if (spacer) { spacer.remove(); spacer = null; }
    }
    $('ctl').setAttribute('aria-expanded', on); $('ctl').setAttribute('aria-label', on ? 'Minimize chat' : 'Maximize chat');
    $('ico-max').style.display = on ? 'none' : ''; $('ico-min').style.display = on ? '' : 'none';
    log.scrollTop = log.scrollHeight; msg.focus();
  }
  $('ctl').addEventListener('click', function () { setMax(!$('chat').classList.contains('max')); });
  $('scrim').addEventListener('click', function () { setMax(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeFit(); setMax(false); } });
  var fbar = $('fbar');
  function onScroll() {
    var on = window.scrollY > window.innerHeight * 0.75;
    fbar.classList.toggle('on', on); fbar.setAttribute('aria-hidden', !on); $('totop').tabIndex = on ? 0 : -1;
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('totop').addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  $('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = msg.value.trim(); if (!v) return;
    row(true).textContent = v; msg.value = ''; grow();
    botSay("I can't answer in chat just yet. Email me at " + EMAIL + " and I'll reply myself.", 2400);
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.getAttribute('data-modal') === 'fit') { e.preventDefault(); openFit(); return; }
    if (href === '#') e.preventDefault();
  });
})();
