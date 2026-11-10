(function () {
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var log = null, EMAIL = 'hello@adam-michaelson.com', PHONE = '801-822-9045';

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
    /* a pill shape turns into an oval on tall text, so wrapped bubbles get a normal rounded corner */
    if (window.ResizeObserver) new ResizeObserver(function () { b.classList.toggle('multi', b.scrollHeight > 60); }).observe(b);
    lg.appendChild(r); if (!lg._hold) lg.scrollTop = lg.scrollHeight; return b;
  }
  function setText(b, text) {
    b.textContent = '';
    var re = new RegExp('(' + EMAIL.replace(/[.]/g, '\\.') + '|\\(?801\\)?[-. ]?822[-. ]?9045)', 'g'), last = 0, m;
    while ((m = re.exec(text))) {
      b.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = document.createElement('a'); a.style.color = 'inherit'; a.textContent = m[0];
      a.href = m[0] === EMAIL ? 'mailto:' + EMAIL : 'sms:+1' + PHONE.replace(/\D/g, '');
      b.appendChild(a); last = m.index + m[0].length;
    }
    b.appendChild(document.createTextNode(text.slice(last)));
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

  /* Real replies: POST /api/chat, streamed back as server-sent events. */
  function newSession() {
    var a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  var FAIL = "Sorry, I couldn't answer that just now. Text me at " + PHONE + " or email " + EMAIL + ".";
  function askAdam(mode, sessionId, message, lg, ok, done) {
    var b = row(false, lg); b.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    var text = '', started = false;
    function show(t) {
      if (ok && !ok()) return;
      if (!started) { started = true; ding(); b.classList.add('pop'); }
      setText(b, t); if (!lg._hold) lg.scrollTop = lg.scrollHeight;
    }
    function finish() { if (done) done(); }
    fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: sessionId, mode: mode, message: message })
    }).then(function (res) {
      var type = res.headers.get('Content-Type') || '';
      if (type.indexOf('text/event-stream') < 0 || !res.body) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          if (j.human) { b.parentNode && b.parentNode.remove(); return; }
          show(j.error || FAIL);
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += dec.decode(r.value, { stream: true });
          var parts = buf.split('\n\n'); buf = parts.pop();
          parts.forEach(function (p) {
            if (p.indexOf('data: ') !== 0) return;
            var ev; try { ev = JSON.parse(p.slice(6)); } catch (e) { return; }
            if (ev.t) { text += ev.t; show(text); }
          });
          return pump();
        });
      }
      return pump();
    }).catch(function () { if (!text) show(FAIL); }).then(finish);
  }
  /* Tell the server a conversation has ended so Adam gets the transcript right away. */
  function endSession(sid) {
    try { if (sid && navigator.sendBeacon) navigator.sendBeacon('/api/chat/end', new Blob([JSON.stringify({ sessionId: sid })], { type: 'application/json' })); } catch (e) {}
  }
  window.addEventListener('pagehide', function (e) { if (!e.persisted) { dialogs.forEach(function (d) { d.end(); }); } });
  var dialogs = [];
  /* Live messages from Adam: while a conversation is open, check every few seconds whether he has stepped in. */
  function watcher(getSid, lg, isOpen, hooks) {
    hooks = hooks || {};
    var lastId = 0, human = false, started = false, t = null;
    function note(text) { var r = document.createElement('div'); r.className = 'row note'; r.textContent = text; lg.appendChild(r); if (!lg._hold) lg.scrollTop = lg.scrollHeight; }
    function poll() {
      var sid = getSid();
      if (!sid || document.hidden || (isOpen && !isOpen())) return;
      fetch('/api/chat/poll?sessionId=' + encodeURIComponent(sid) + '&after=' + lastId).then(function (r) { return r.json(); }).then(function (j) {
        if (isOpen && !isOpen()) return;
        if (j.mode === 'human' && !human) { human = true; note('Adam has joined the conversation.'); if (hooks.onMode) hooks.onMode(true); }
        if (j.mode !== 'human' && human) { human = false; note('Adam has handed you back to the assistant.'); if (hooks.onMode) hooks.onMode(false); }
        (j.messages || []).forEach(function (m) {
          lastId = Math.max(lastId, m.id);
          var b = row(false, lg); setText(b, m.content);
          var ico = document.createElement('span');
          ico.className = 'live-bolt';
          ico.tabIndex = 0;
          ico.setAttribute('role', 'img');
          ico.setAttribute('aria-label', 'This is actually Adam messaging you -- not AI.');
          ico.setAttribute('data-tip', 'This is actually Adam messaging you -- not AI.');
          ico.innerHTML = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9.5 1.5L3 9h4.5l-1 5.5L13 7H8.5l1-5.5z"/></svg>';
          b.insertBefore(ico, b.firstChild);
          b.classList.add('pop', 'live');
          ding();
          if (hooks.onMessage) hooks.onMessage();
        });
      }).catch(function () {});
    }
    return {
      start: function () { if (!started) { started = true; t = setInterval(poll, 4000); } },
      stop: function () { clearInterval(t); started = false; },
      reset: function () { lastId = 0; human = false; if (hooks.onMode) hooks.onMode(false); }
    };
  }

  /* Idle check-ins for the chat dialog: same lines and timing as the home page chat. */
  var IDLE_LINES = [
    [
      "Are you there?",
      "Still with me?",
      "Hey, are you still around?",
      "Everything okay on your end?",
      "Did I lose you?",
      "Just checking, are you still there?",
      "Anyone home?",
      "Still there?",
      "Hello? Did I catch you at a bad moment?",
      "Hey, you still with me?"
    ],
    [
      "Ready when you are.",
      "No rush. Ask me whenever you're ready.",
      "Whenever you're ready, I'm here.",
      "Got a question in mind? I'm ready for it.",
      "Say the word and we'll get started.",
      "When you've got something, send it over.",
      "I'm ready if you are.",
      "Whenever something comes to mind, go ahead and type it.",
      "Plenty of room for your question whenever you have one.",
      "Start anywhere you like. I'm ready."
    ],
    [
      "Take your time, I'll be here.",
      "No pressure at all. I'll be here if you want to chat.",
      "If now's not the moment, that's fine. The door's open.",
      "I'll be here if you decide you want to talk.",
      "Feel free to look around. Come back and ask anything you like.",
      "No need to answer. I'm around if something comes up.",
      "Go explore the rest of the site, and find me here if you have a question.",
      "Totally fine if you'd rather just browse. I'm here whenever.",
      "Take your time. If you want to talk, just type.",
      "No worries if you're busy. I'll be here."
    ]
  ];
  var IDLE_MS = 60000;

  /* ---- Two dialogs share this code: "Check my fit" (id prefix f, mode fit) and "Chat with Adam" (prefix c, mode intro). ---- */
  function dialog(p, mode, opener, wait) {
    var dlg = $(p + 'dlg'), scrim = $(p + 'scrim'), flog = $(p + 'log'), fmsg = $(p + 'msg'), ffield = $(p + 'field'), form = $(p + 'form');
    var fgen = 0, lastFocus = null, fSession = newSession(), fBusy = false;
    var human = false, idleStage = 0, idleTimer = null;
    /* No check-ins while Adam has taken over; each message from him restarts the countdown. */
    function idleReset() {
      clearTimeout(idleTimer); idleStage = 0;
      if (mode !== 'intro' || human || !dlg.classList.contains('on')) return;
      idleTimer = setTimeout(idleFire, IDLE_MS);
    }
    function idleFire() {
      if (human || !dlg.classList.contains('on')) return;
      var list = IDLE_LINES[idleStage];
      botSay(list[Math.floor(Math.random() * list.length)], 1200, flog, ok(fgen));
      idleStage++;
      if (idleStage < IDLE_LINES.length) idleTimer = setTimeout(idleFire, IDLE_MS);
    }
    var watch = watcher(function () { return fSession; }, flog, function () { return dlg.classList.contains('on'); }, {
      onMode: function (h) { human = h; idleReset(); },
      onMessage: function () { idleReset(); }
    });
    ['input', 'keydown', 'pointerdown', 'focusin', 'submit'].forEach(function (ev) { dlg.addEventListener(ev, idleReset, true); });
    function grow() { fmsg.style.height = 'auto'; fmsg.style.height = Math.min(fmsg.scrollHeight, 128) + 'px'; ffield.classList.toggle('has', !!fmsg.value.trim()); }
    function ok(g) { return function () { return g === fgen; }; }
    function open() {
      lastFocus = document.activeElement; fgen++; var g = fgen;
      flog.innerHTML = ''; flog._hold = false; fmsg.value = ''; grow(); fSession = newSession(); fBusy = false; watch.reset(); watch.stop();
      scrim.classList.add('on'); dlg.classList.add('on'); document.body.style.overflow = 'hidden';
      botSay(typeof opener === 'function' ? opener() : opener, wait, flog, ok(g));
      human = false; idleReset();
      setTimeout(function () { fmsg.focus(); }, 60);
      syncKeyboard();
    }
    function close() {
      if (!dlg.classList.contains('on')) return;
      endSession(fSession); fgen++; watch.stop(); clearTimeout(idleTimer); flog.innerHTML = ''; fmsg.value = ''; grow();
      scrim.classList.remove('on'); dlg.classList.remove('on'); document.body.style.overflow = '';
      syncKeyboard();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (d.onClose) d.onClose();
    }
    $(p + 'close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    fmsg.addEventListener('input', grow);
    fmsg.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = fmsg.value.trim(); if (!v || fBusy) return;
      var g = fgen;
      flog._hold = false;
      row(true, flog).textContent = mode === 'fit' && v.length > 90 ? v.slice(0, 87) + '...' : v;
      fmsg.value = ''; grow(); fBusy = true;
      watch.start();
      askAdam(mode, fSession, v, flog, ok(g), function () { fBusy = false; });
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = [$(p + 'close'), fmsg, dlg.querySelector('.enter')], i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    });
    var d = { open: open, close: close, onClose: null, el: dlg, log: flog, end: function () { if (dlg.classList.contains('on')) endSession(fSession); } };
    dialogs.push(d); return d;
  }
  var openers = [
    "Hi, I'm Adam. Ask me whatever you're curious about, about my work or about me.",
    "Welcome. Whatever you came here wondering, go ahead and ask.",
    "Not sure where to start? Tell me what you're looking for and I'll point you there.",
    "Hello. I build products, mostly with AI these days. What would you like to know?"
  ];
  var fit = $('fdlg') ? dialog('f', 'fit', "Paste a job description or a link to the posting, or just give me a title or describe what you're looking for, and I'll tell you honestly how I fit.", 1800) : null;
  var chat = $('cdlg') ? dialog('c', 'intro', function () { return openers[Math.floor(Math.random() * openers.length)]; }, 1800) : null;

  /* On-screen keyboard: on narrow screens pin the open dialog to the visual viewport so the input rides above the keyboard. */
  var vv = window.visualViewport, appMode = document.documentElement.hasAttribute('data-chat-app');
  function syncKeyboard() {
    var narrow = (window.innerWidth <= 820 || appMode) && !!vv, kbOpen = false;
    dialogs.forEach(function (d) {
      var fd = d.el, full = fd.id === 'cdlg' || appMode;
      if (fd.classList.contains('on') && narrow) {
        if (full) { fd.style.top = vv.offsetTop + 'px'; fd.style.height = vv.height + 'px'; }
        else { fd.style.top = (vv.offsetTop + vv.height / 2) + 'px'; fd.style.height = Math.min(720, Math.round(vv.height * 0.92)) + 'px'; }
        if (!d.log._hold) d.log.scrollTop = d.log.scrollHeight;
        if (window.innerHeight - vv.height > 120) kbOpen = true;
      } else { fd.style.top = ''; fd.style.height = ''; }
    });
    /* keyboard open: lets the CSS tighten the input area */
    document.documentElement.classList.toggle('kb', kbOpen);
  }
  if (vv) { vv.addEventListener('resize', syncKeyboard); vv.addEventListener('scroll', syncKeyboard); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dialogs.forEach(function (d) { d.close(); }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-modal]');
    if (!a) return;
    var m = a.getAttribute('data-modal'), d = m === 'fit' ? fit : m === 'chat' ? chat : null;
    if (!d) return;
    e.preventDefault();
    /* Phones get the chat as its own full-screen page (with a way back) instead of a modal over the page. */
    if (window.innerWidth <= 820 && !appMode) { location.href = '/chat/?m=' + m + '&from=' + encodeURIComponent(location.pathname + location.search); return; }
    d.open();
  });

  /* The /chat/ page: open the requested conversation at once; closing it goes back to where the visitor came from. */
  if (appMode) {
    var q = new URLSearchParams(location.search), from = q.get('from') || '/';
    if (from.charAt(0) !== '/' || from.charAt(1) === '/') from = '/';
    var app = q.get('m') === 'fit' ? fit : chat;
    if (app) {
      app.onClose = function () {
        var back = false;
        try { back = history.length > 1 && document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
        if (back) history.back(); else location.replace(from);
      };
      var cb = app.el.querySelector('.fhead button');
      cb.setAttribute('aria-label', 'Back');
      cb.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5L14 2M6.5 9.5L2 14"/></svg>';
      app.open();
    }
  }
})();
