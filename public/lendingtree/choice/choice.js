// Prototype: the options step. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var app = $('#app'), dock = $('#dock'), sheet = $('#sheet'), scrim = $('#scrim'), toast = $('#toast');
  var LOGO = '<img src="/lendingtree/img/lt-logo.png" alt="lendingtree" width="728" height="230">';
  var OFFERS = [
    { id: 'ridgeview', best: 'Steady payment', speed: '2 to 3 business days', name: 'Ridgeview Financial', mark: '<img src=\"/lendingtree/img/lender-ridgeview.png\" alt=\"\" width=\"46\" height=\"46\">', kind: 'Personal loan', rate: 'Fixed rate', apr: 6.49, mo: 387, fee: 0, term: 60, total: 23220, stars: '4.8', n: '2,341', fixed: true,
      about: 'A fixed-rate personal loan with no origination fee. Good for debt consolidation, home improvement, or other major expenses.' },
    { id: 'maple', best: 'Lowest<br>cost', speed: '2 to 3 weeks', name: 'Maple Bank', mark: '<img src=\"/lendingtree/img/lender-maple.png\" alt=\"\" width=\"46\" height=\"46\">', kind: 'Home equity line', rate: 'Variable', apr: 7.21, mo: 356, fee: 0, term: 60, total: 21360, stars: '4.6', n: '1,208', fixed: false,
      about: 'A home equity line of credit with a variable rate. The payment can move with the market, and your home secures the line.' },
    { id: 'summit', best: 'Fastest funding', speed: 'as soon as the next business day', name: 'Summit Lending', mark: '<img src=\"/lendingtree/img/lender-summit.png\" alt=\"\" width=\"46\" height=\"46\">', kind: 'Personal loan', rate: 'Fixed rate', apr: 8.99, mo: 422, fee: 400, term: 60, total: 25720, stars: '4.4', n: '893', fixed: true,
      about: 'A fixed-rate personal loan with a 2% origination fee. Funds can arrive as soon as the next business day.' }
  ];
  /* Contact times follow the device clock and locale: the next whole hour that is at least 15 minutes away, then the next two,
     within 8 AM to 9 PM; otherwise tomorrow morning. */
  function fmt(d) { try { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); } catch (e) { return d.getHours() + ':00'; } }
  function timeOpts() {
    var now = new Date(), out = [], first = new Date(now.getTime() + 15 * 60000);
    if (now.getHours() >= 8 && now.getHours() < 21) out.push('Right now (within 5 minutes)');
    var t = new Date(first); t.setMinutes(0, 0, 0); if (t < first) t.setHours(t.getHours() + 1);
    for (var i = 0; i < 3; i++) { if (t.getDate() === now.getDate() && t.getHours() >= 8 && t.getHours() <= 21) out.push('Today, ' + fmt(t)); t = new Date(t.getTime() + 3600000); }
    var tm = new Date(now); tm.setDate(tm.getDate() + 1);
    var nine = new Date(tm); nine.setHours(9, 0, 0, 0); var noon = new Date(tm); noon.setHours(12, 0, 0, 0);
    out.push('Tomorrow, ' + fmt(nine), 'Tomorrow, ' + fmt(noon));
    return out;
  }
  function defaultTime() { return timeOpts().filter(function (x) { return x.indexOf('Right now') < 0; })[0]; }
  function emailOpts() { var o = timeOpts(), h = new Date().getHours(); return (h < 21 ? ['Any time today'] : []).concat(o.filter(function (x) { return x.indexOf('Tomorrow') === 0; })); }
  var S;
  var OPEN_MSG = "Hi, I'm here to help you choose. What will you use the money for?";
  function fresh() { S = { screen: 'offers', open: null, compare: {}, picks: {}, draft: {}, chat: { all: [{ text: OPEN_MSG }] }, busy: false, done: false, fallback: false, asked: 0, opened: {}, t0: Date.now() }; }
  fresh();
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var by = function (id) { return OFFERS.filter(function (o) { return o.id === id; })[0]; };
  var clock = function () { var s = Math.round((Date.now() - S.t0) / 1000); return (s < 10 ? '0' : '') + s + 's'; };

  // ---- log + tiles
  var logEl = $('#log');
  function log(ev, detail, warn) {
    var d = document.createElement('div'); if (warn) d.className = 'warn';
    d.innerHTML = '<i>' + clock() + '</i><em>' + ev + '</em> ' + (detail || '');
    if (!logEl) return;
    logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight;
  }
  function tiles() {
    var n = Object.keys(S.picks).length;
    if (!$('#tiles')) return;
    $('#tiles').innerHTML =
      '<div class="' + (n ? 'ok' : '') + '"><b>' + n + '</b><span>Lenders chosen</span></div>' +
      '<div><b>' + (n ? n : 0) + '</b><span>Contacts scheduled</span></div>' +
      '<div><b>' + (S.fallback ? 'Released' : '0') + '</b><span>' + (S.fallback ? 'Old model took over' : 'Calls from anyone else') + '</span></div>';
  }
  function say(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 2600); }

  // ---- AI guide
  function answer(q, ctx) {
    var t = q.toLowerCase(), r;
    var fixedLow = OFFERS.filter(function (o) { return o.fixed; }).sort(function (a, b) { return a.total - b.total; })[0];
    var low = OFFERS.slice().sort(function (a, b) { return a.total - b.total; })[0];
    if (ctx) {
      var o = by(ctx);
      if (/fee/.test(t)) return o.fee ? o.name + ' charges a ' + money(o.fee) + ' origination fee (2% of $20,000). It is taken from the loan amount or added to the total, so your estimated cost includes it.' : o.name + ' charges no origination fee. The estimated total of ' + money(o.total) + ' is principal plus interest only.';
      if (/total|cost|5 year|five/.test(t)) return 'Over ' + o.term + ' months, ' + o.name + ' comes to about ' + money(o.total) + ': ' + money(o.mo) + ' a month' + (o.fee ? ' plus a ' + money(o.fee) + ' fee' : '') + '.' + (o.fixed ? ' The rate is fixed, so this will not move.' : ' The rate is variable, so this can change.');
      if (/compare/.test(t)) return 'Against the other two: ' + OFFERS.filter(function (x) { return x.id !== ctx; }).map(function (x) { return x.name + ' is ' + money(x.mo) + ' a month at ' + x.apr + '% (' + (x.fixed ? 'fixed' : 'variable') + ')'; }).join('; ') + '.';
      if (/good deal|worth/.test(t)) return o.id === low.id ? o.name + ' has the lowest estimated total of the three, but the rate is variable. If rates rise, the gap closes.' : o.id === fixedLow.id ? o.name + ' has the lowest total of the fixed-rate options and no fee. That is a strong choice if you want a payment that never changes.' : o.name + ' costs the most of the three over the term. It could still make sense if speed matters more than total cost.';
      return 'I can explain the fees, the total cost, or how this compares to the other offers. Type a question below.';
    }
    if (/least|cheap|lowest|cost|total/.test(t)) return 'Over 5 years the lowest estimated total is Maple Bank at ' + money(low.total) + ', but its rate is variable and can rise. The lowest fixed-rate total is Ridgeview Financial at ' + money(fixedLow.total) + ', with no fee. Summit Lending is highest at ' + money(by('summit').total) + ' including its fee.';
    if (/differen|vs|compare/.test(t)) return 'Ridgeview and Summit are fixed-rate personal loans. Maple Bank is a variable-rate home equity line secured by your home. Ridgeview has the lowest APR (6.49%) and no fee. Maple has the lowest payment. Summit charges a 2% fee.';
    if (/choose|help|recommend|pick/.test(t)) return 'If you want a payment that never changes, Ridgeview Financial is the strongest fit: lowest APR, no fee, fixed rate. If the lowest monthly payment matters most and you are comfortable with a variable rate, look at Maple Bank. Pick one or more, and only the lenders you choose will contact you.';
    if (/fee/.test(t)) return 'Ridgeview and Maple Bank charge no origination fee. Summit Lending charges 2% ($400).';
    return 'I can compare these offers, explain fees, or work out total cost. Type a question below, or tap See details on an offer.';
  }
  function dockHtml(ctx) {
    var list = S.chat[ctx || 'all'] || [], open = S.dockOpen !== false && list.length;
    var msgs = open ? '<div class="dmsgs">' + list.map(function (m) { return '<div class="answer' + (m.you ? ' you' : '') + '">' + m.text + '</div>'; }).join('') + '</div>' : '';
    return '<div class="ai dock" data-ctx="' + (ctx || '') + '"><div class="hd"><div><b>AI Assistant</b><span>Quick, unbiased answers about ' + (ctx ? 'this offer' : 'these offers') + '.</span></div>' +
      (list.length ? '<button type="button" class="dtog" data-act="dockhide" aria-label="' + (open ? 'Hide answers' : 'Show answers') + '">' + '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"' + (open ? '' : ' class="up"') + '><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' : '') + '</div>' + msgs +
      '<form data-act="askform"><input aria-label="Ask a question" autocomplete="off" placeholder="' + (ctx ? 'Ask a question about this offer' : 'Ask a question about these options') + '"><button aria-label="Send">➤</button></form></div>';
  }
  function renderDock() {
    var show = !S.fallback && !S.done, old = dock.querySelector('input'), val = old ? old.value : '', had = old && document.activeElement === old;
    if (!show) { dock.hidden = true; dock.innerHTML = ''; app.style.paddingBottom = ''; return; }
    dock.classList.toggle('away', !!(S.ddOpen && S.screen === 'detail'));
    var m = dock.querySelector('.dmsgs'), top = m ? m.scrollTop : 0;
    dock.hidden = false; dock.innerHTML = dockHtml(S.screen === 'detail' ? S.open : null);
    var inp = dock.querySelector('input'); if (val) inp.value = val; if (had) inp.focus();
    var nm = dock.querySelector('.dmsgs'); if (nm) nm.scrollTop = S.stick ? nm.scrollHeight : top; S.stick = false;
    app.style.paddingBottom = ((S.ddOpen || S.ddClosing) && S.screen === 'detail' ? 330 : dock.offsetHeight + 36) + 'px';
  }
  function ask(q, ctx) {
    if (!q || S.busy) return;
    var k = ctx || 'all'; S.chat[k] = (S.chat[k] || []).concat([{ you: true, text: q.replace(/</g, '&lt;') }]); S.asked++;
    log('ai_question', '"' + q.replace(/</g, '&lt;') + '"' + (ctx ? ' on ' + ctx : ''));
    S.busy = true; S.dockOpen = true; S.stick = true;
    var pending = { text: '<span class="typing"><i></i><i></i><i></i></span>', pending: true };
    S.chat[k].push(pending); render();
    var history = S.chat[k].filter(function (m) { return !m.pending; }).map(function (m) { return { role: m.you ? 'user' : 'assistant', content: m.you ? m.text.replace(/&lt;/g, '<') : m.text.replace(/<[^>]+>/g, '') }; });
    var done = function (text, live) { pending.pending = false; pending.text = text; S.busy = false; S.stick = true; if (live) log('ai_answer', 'agent reply, ' + text.length + ' chars'); render(); };
    var fb = function () { setTimeout(function () { done(answer(q, ctx), false); }, 350); };
    if (!window.fetch) return fb();
    var ctrl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctrl) ctrl.abort(); }, 25000);
    fetch('/api/lt-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, ctx: ctx || null }), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { clearTimeout(to); if (!d || !d.text) throw 0; done(String(d.text).replace(/</g, '&lt;').replace(/\n/g, '<br>'), true); })
      .catch(function () { clearTimeout(to); fb(); });
  }

  // ---- screens
  var steps = function (n) { return '<div class="steps">' + ['Application', 'View offers', 'Choose &amp; connect'].map(function (t, k) { return '<div class="st' + (k + 1 === n ? ' on' : '') + (k + 1 < n ? ' past' : '') + '"><i>' + (k + 1) + '</i><span>' + t + '</span></div>'; }).join('') + '</div>'; };
  var topbar = '<div class="top"><div class="logo">' + LOGO + '</div></div>';
  function screenOffers() {
    var nChosen = Object.keys(S.picks).length, nCmp = Object.keys(S.compare).length;
    var wasShown = S.cmpShown; S.cmpShown = nCmp >= 2; if (S.cmpShown && !wasShown) S.revealCmp = true;
    var cards = OFFERS.map(function (o) {
      var p = S.picks[o.id];
      return '<div class="offer' + (p ? ' sel' : '') + '"><div class="row"><div style="display:flex;gap:12px;align-items:flex-start"><div class="mark">' + o.mark + '</div><div><div class="nm">' + o.name + '</div><div class="ty">' + o.kind + ' · ' + o.rate + '</div></div></div>' +
        '<button class="btn" data-act="open" data-id="' + o.id + '">' + (p ? 'Edit' : 'See details') + '</button></div>' +
        '<div class="nums"><div><b>' + o.apr.toFixed(2) + '%</b><span>APR</span></div><div><b>' + money(o.mo) + '</b><span>Est. monthly</span></div>' +
        (p ? '</div><div class="chosen"><i>✓</i><span><b>' + p.method + '</b> · ' + p.time + '</span></div></div>' : '<label><input type="checkbox" data-act="cmp" data-id="' + o.id + '"' + (S.compare[o.id] ? ' checked' : '') + '> Compare</label></div></div>');
    }).join('');
    return steps(2) + '<h3>You have options.</h3><p class="sub">We found personalized offers based on your application. Choose the lenders you want to hear from.</p><div style="height:14px"></div>' + cards +
      (nChosen ? '<div class="donebox"><button class="btn full" data-act="finish">Done: connect me with ' + nChosen + (nChosen > 1 ? ' lenders' : ' lender') + '</button><div class="note">Only the lenders you chose will contact you.</div></div>' : '') +
      (nCmp >= 2 ? '<div class="cmpwrap' + (wasShown ? '' : ' enter') + '"><button class="btn ghost full" data-act="docompare">Compare ' + nCmp + ' offers</button></div>' : '') +
      '';
  }
  function screenDetail(id) {
    var o = by(id), d = S.draft[id] || (S.draft[id] = { method: (S.picks[id] || {}).method || 'Text', time: (S.picks[id] || {}).time || defaultTime() });
    var rows = [['Loan amount', '$20,000'], ['APR (' + (o.fixed ? 'fixed' : 'variable') + ')', o.apr.toFixed(2) + '%'], ['Est. monthly payment', money(o.mo)], ['Term', o.term + ' months'], ['Origination fee', money(o.fee)], ['Estimated total cost', money(o.total)]];
    return '<div class="top"><button class="back" data-act="back">‹ Back to offers</button></div>' +
      '<div style="display:flex;gap:12px;align-items:flex-start;justify-content:space-between"><div style="display:flex;gap:14px;align-items:flex-start;min-width:0"><div class="mark lg">' + o.mark + '</div><div><h3 style="font-size:21px">' + o.name + '</h3><div class="tags"><span class="tag">' + o.kind + '</span><span class="tag">' + o.rate + '</span></div></div></div><div style="text-align:right;font-size:13px">★ <b>' + o.stars + '</b><br><span style="color:#5b6574">(' + o.n + ')</span></div></div>' +
      '<h4>Overview</h4><p class="sub" style="margin-top:0">' + o.about + '</p><h4>Loan details</h4><div class="kv">' + rows.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
      '<h4>Contact me about this offer</h4><p class="sub" style="margin:0 0 6px">Choose how and when ' + o.name + ' can reach you.</p>' +
      '<div class="methods">' + ['Text', 'Call', 'Email'].map(function (m) { return '<button data-act="method" data-m="' + m + '" class="' + (d.method === m ? 'on' : '') + '">' + ({ Text: '💬', Call: '📞', Email: '<svg class="envl" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="2.75" y="5.5" width="18.5" height="13" rx="2.2" fill="#e4e9f0" stroke="#7d8896" stroke-width="1"/><path d="M3.5 7.2l8.5 6.3 8.5-6.3" fill="none" stroke="#7d8896" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>' })[m] + '<span>' + m + '</span></button>'; }).join('') + '</div>' +
      (function () { var opts = d.method === 'Email' ? emailOpts() : timeOpts(); if (opts.indexOf(d.time) < 0) d.time = opts[0];
        return '<div class="dd' + (S.ddOpen ? ' open' : '') + '"><button type="button" class="ddbtn" data-act="ddtoggle" aria-haspopup="listbox" aria-expanded="' + (!!S.ddOpen) + '"><span>' + d.time + '</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          (S.ddOpen ? '<div class="ddlist" role="listbox">' + opts.map(function (t) { return '<button type="button" role="option" class="ddopt' + (t === d.time ? ' on' : '') + '" aria-selected="' + (t === d.time) + '" data-act="ddpick" data-v="' + t + '"><i>' + (t === d.time ? '✓' : '') + '</i>' + t + '</button>'; }).join('') + '</div>' : '') + '</div>'; })() +
      '<div style="height:14px"></div>' +
      '<div class="donebox"><button class="btn full" data-act="request" data-id="' + o.id + '">' + (S.picks[o.id] ? 'Update my request' : 'Contact me about this offer') + '</button><div class="note">You can change or cancel this request at any time.</div></div>';
  }
  function screenDone() {
    var ids = Object.keys(S.picks);
    return steps(3) + '<div class="done-ico">✓</div><h3>You are connected.</h3><p class="sub">Only the lenders below will contact you, the way you asked.</p>' +
      ids.map(function (id) { var p = S.picks[id], o = by(id); return '<div class="req"><div><b>' + o.name + '</b><small>' + p.method + ' · ' + p.time + '</small></div><button class="link" data-act="cancel" data-id="' + id + '">Cancel</button></div>'; }).join('') +
      '<div class="kv"><div><span>Other lenders contacting you</span><b>None</b></div><div><span>Your next step</span><b>Expect your first contact</b></div></div>' +
      '<p class="note" style="text-align:left">Your AI assistant will follow up by text and email if you want help deciding. You can change or cancel any request.</p>' +
      '<div class="bar2"><button class="btn ghost full" data-act="back">Review offers</button></div>';
  }
  function screenFallback() {
    return steps(3) + '<div class="done-ico" style="background:#fff2dd;color:#a35a00">⏱</div><h3>24 hours passed.</h3><p class="sub">No lender was chosen, so this request moved to the standard flow. Matching lenders can now contact you directly, as they do today.</p>' +
      '<div class="kv"><div><span>Chosen lenders</span><b>0</b></div><div><span>Status</span><b>Released to matches</b></div></div>' +
      '<p class="note" style="text-align:left">This is the safety net. Nothing is lost if a shopper never chooses. It is also why selection rate is the number to watch.</p>' +
      '<div class="bar2"><button class="btn full" data-act="reset">Start over</button></div>';
  }
  function render() {
    var keep = app.scrollTop;
    app.innerHTML = S.fallback ? screenFallback() : S.done ? screenDone() : S.screen === 'detail' ? screenDetail(S.open) : topbar + screenOffers();
    app.scrollTop = keep; renderDock(); tiles();
    if (S.revealCmp) { S.revealCmp = false; setTimeout(function () {
      var w = app.querySelector('.cmpwrap'); if (!w) return;
      var delta = w.getBoundingClientRect().bottom - (app.getBoundingClientRect().bottom - dock.offsetHeight - 14);
      if (delta > 0) app.scrollTo({ top: app.scrollTop + delta, behavior: 'smooth' });
    }, 460); }
  }
  function closeDd() {
    if (!S.ddOpen || S.ddClosing) return; S.ddClosing = true;
    var l = app.querySelector('.ddlist'); if (l) l.classList.add('out');
    dock.classList.remove('away');
    app.scrollTo({ top: Math.max(0, Math.min(S.ddScroll || 0, app.scrollHeight)), behavior: 'smooth' });
    setTimeout(function () { S.ddOpen = false; render(); }, 190);
    /* Keep the extra room below the form until the scroll has landed, then drop it with no transition so nothing shifts. */
    setTimeout(function () {
      S.ddClosing = false; app.style.transition = 'none'; app.style.paddingBottom = (dock.offsetHeight + 36) + 'px'; void app.offsetWidth; app.style.transition = '';
    }, 620);
  }
  function openSheet(html) { sheet.innerHTML = '<div class="grab"></div>' + html; sheet.hidden = false; scrim.hidden = false; }
  function closeSheet() { sheet.hidden = true; scrim.hidden = true; }
  function why(o) {
    var d = function (a, b) { return money(Math.abs(a.total - b.total)); }, r = by('ridgeview'), m = by('maple'), u = by('summit');
    if (o.id === 'ridgeview') return 'Choose <b>' + o.name + '</b> if you want a payment you can plan around. It has the lowest APR (' + o.apr.toFixed(2) + '%) and no fee, and the rate is fixed, so ' + money(o.mo) + ' stays ' + money(o.mo) + ' for all ' + o.term + ' months. Over the term it costs ' + d(r, m) + ' more than Maple Bank at today\'s rate, but nothing can rise and your home is not collateral. Funds take ' + o.speed + '.';
    if (o.id === 'maple') return 'Choose <b>' + o.name + '</b> if the lowest cost matters most and you can live with some risk. At today\'s rate it has the lowest payment (' + money(o.mo) + ') and the lowest total (' + money(o.total) + '), ' + d(r, m) + ' less than Ridgeview. The rate is variable, so the payment can rise, and your home secures the line. It is also the slowest: expect ' + o.speed + '.';
    return 'Choose <b>' + o.name + '</b> if you need the money fast. Funds can arrive ' + o.speed + '. That speed costs more: ' + o.apr.toFixed(2) + '% APR plus a ' + money(o.fee) + ' fee, about ' + d(u, r) + ' more than Ridgeview over the term. The rate is fixed, so the payment stays at ' + money(o.mo) + '.';
  }
  function cmpBody() {
    var ids = Object.keys(S.compare), os = ids.map(by);
    if (!S.cmpSel || ids.indexOf(S.cmpSel) < 0) S.cmpSel = os[0].id;
    var best = function (f, lo) { var v = os.map(f); return lo ? Math.min.apply(0, v) : Math.max.apply(0, v); };
    var sel = function (o) { return o.id === S.cmpSel ? ' sel' : ''; };
    var row = function (label, f, lo, fmtv, last, nobest) {
      var vals = os.map(f), tie = nobest || vals.every(function (v) { return v === vals[0]; }), b = best(f, lo);
      return '<tr' + (last ? ' class="last"' : '') + '><th scope="row">' + label + '</th>' + os.map(function (o, k) { return '<td class="cv' + (!tie && vals[k] === b ? ' best' : '') + sel(o) + '">' + fmtv(vals[k], o) + '</td>'; }).join('') + '</tr>';
    };
    var head = '<tr><td></td>' + os.map(function (o) { return '<td class="ch' + sel(o) + '"><div class="mark">' + o.mark + '</div><div class="cn">' + o.name + '</div><button class="btn sm" data-act="open" data-id="' + o.id + '">' + (S.picks[o.id] ? 'Edit' : 'See details') + '</button></td>'; }).join('') + '</tr>';
    var bf = '<tr class="last"><th scope="row">Best for</th>' + os.map(function (o) { return '<td class="cv bf' + sel(o) + '"><button type="button" class="chip' + (o.id === S.cmpSel ? ' on' : '') + '" data-act="cmpsel" data-id="' + o.id + '">' + o.best + '</button></td>'; }).join('') + '</tr>';
    var k = ids.indexOf(S.cmpSel), n = os.length;
    return '<div class="cmpwrap2"><svg class="ol" aria-hidden="true"><path d=""/></svg><table class="cmp">' + head +
      row('APR', function (o) { return o.apr; }, true, function (v) { return v.toFixed(2) + '%'; }) +
      row('Monthly', function (o) { return o.mo; }, true, function (v) { return money(v); }) +
      row('Fee', function (o) { return o.fee; }, true, function (v) { return money(v); }) +
      row('Est. total', function (o) { return o.total; }, true, function (v) { return money(v); }) +
      row('Rate type', function (o) { return o.fixed ? 0 : 1; }, true, function (v) { return v ? 'Variable' : 'Fixed'; }, false, true) + bf + '</table>' +
      '<div class="why" style="--cl:calc(21% + (79% / ' + n + ') * ' + k + ');--cr:calc(21% + (79% / ' + n + ') * ' + (k + 1) + ')"><p>' + why(by(S.cmpSel)) + '</p></div></div>' +
      '<p class="note" style="text-align:left;margin-top:12px">Green marks the best value in each row. Maple Bank\'s total assumes today\'s variable rate.</p>';
  }
  /* One continuous outline: the selected column and its description share a single rounded path. */
  function drawOutline() {
    var w = document.querySelector('.cmpwrap2'); if (!w) return;
    var path = w.querySelector('svg.ol path'), head = w.querySelector('td.ch.sel'), why = w.querySelector('.why'); if (!path || !head || !why) return;
    var o = w.getBoundingClientRect(), h = head.getBoundingClientRect(), y = why.getBoundingClientRect(), r = 14, k = 0.75;
    var x1 = h.left - o.left + k, x2 = h.right - o.left - k, y0 = h.top - o.top + k, L = k, R = o.width - k, yj = y.top - o.top, yb = y.bottom - o.top - k;
    var last = x2 >= R - 2;
    var d = 'M' + (x1 + r) + ',' + y0 + ' H' + (x2 - r) + ' Q' + x2 + ',' + y0 + ' ' + x2 + ',' + (y0 + r);
    d += last ? ' V' + (yb - r) : ' V' + (yj - r) + ' Q' + x2 + ',' + yj + ' ' + (x2 + r) + ',' + yj + ' H' + (R - r) + ' Q' + R + ',' + yj + ' ' + R + ',' + (yj + r) + ' V' + (yb - r);
    d += ' Q' + (last ? x2 : R) + ',' + yb + ' ' + ((last ? x2 : R) - r) + ',' + yb + ' H' + (L + r) + ' Q' + L + ',' + yb + ' ' + L + ',' + (yb - r) + ' V' + (yj + r) + ' Q' + L + ',' + yj + ' ' + (L + r) + ',' + yj;
    d += ' H' + (x1 - r) + ' Q' + x1 + ',' + yj + ' ' + x1 + ',' + (yj - r) + ' V' + (y0 + r) + ' Q' + x1 + ',' + y0 + ' ' + (x1 + r) + ',' + y0 + ' Z';
    path.setAttribute('d', d);
  }
  window.addEventListener('resize', function () { setTimeout(drawOutline, 60); });
  function compareSheet() {
    openSheet('<button class="sx" data-act="closesheet" aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg></button>' +
      '<h3 style="font-size:22px">Compare offers</h3><p class="sub">Side by side, same $20,000 over 60 months. Tap a tag to see why you might pick it.</p><div id="cmpbody">' + cmpBody() + '</div>');
  }

  // ---- events
  document.addEventListener('click', function (e) {
    if (S.ddOpen && !e.target.closest('.dd')) { closeDd(); }
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    if (a === 'open') { closeSheet(); S.screen = 'detail'; S.open = id; if (!S.opened[id]) { S.opened[id] = 1; log('offer_opened', id); } render(); app.scrollTop = 0; }
    else if (a === 'back') { S.screen = 'offers'; S.done = false; S.ddOpen = false; render(); app.scrollTop = 0; }
    else if (a === 'method') { var d = S.draft[S.open]; d.method = el.getAttribute('data-m'); d.time = d.method === 'Email' ? emailOpts()[0] : defaultTime(); render(); }
    else if (a === 'request') {
      var dd = S.draft[id]; S.picks[id] = { method: dd.method, time: dd.time }; S.screen = 'offers';
      log('contact_requested', by(id).name + ' via <em>' + dd.method.toLowerCase() + '</em>, ' + dd.time + '. consent scoped to this lender'); render(); app.scrollTop = 0; say(by(id).name + ' will ' + (dd.method === 'Call' ? 'call' : dd.method === 'Text' ? 'text' : 'email') + ' you. Choose another lender to hear from them too.');
    }
    else if (a === 'finish') { S.done = true; log('selection_complete', Object.keys(S.picks).length + ' lender(s) chosen. other lenders: <em>0</em>'); render(); app.scrollTop = 0; }
    else if (a === 'cancel') { delete S.picks[id]; log('contact_cancelled', id); if (!Object.keys(S.picks).length) { S.done = false; } render(); }
    else if (a === 'docompare') { log('offers_compared', Object.keys(S.compare).join(', ')); compareSheet(); }
    else if (a === 'closesheet') closeSheet();
    else if (a === 'cmpsel') { S.cmpSel = id; var cb = document.getElementById('cmpbody'); if (cb) { cb.innerHTML = cmpBody(); drawOutline(); } }
    else if (a === 'ddtoggle') { if (S.ddOpen) { closeDd(); return; } S.ddScroll = app.scrollTop; S.ddOpen = true; render(); { var b = app.querySelector('.ddbtn'); if (b) app.scrollTo({ top: app.scrollTop + b.getBoundingClientRect().top - app.getBoundingClientRect().top - 80, behavior: 'smooth' }); } }
    else if (a === 'ddpick') { var v = el.getAttribute('data-v'); S.draft[S.open].time = v; var bt = app.querySelector('.ddbtn span'); if (bt) bt.textContent = v; closeDd(); }
    else if (a === 'dockhide') { S.dockOpen = S.dockOpen === false; render(); }
    else if (a === 'chip') { ask(el.getAttribute('data-q'), el.closest('.ai').getAttribute('data-ctx')); }
    else if (a === 'help') { say('Help: tap See details, choose how to be contacted, then Done.'); }
    else if (['ask', 'pick', 'skip', 'reset'].indexOf(a) > -1) tryIt(a);
  });
  document.addEventListener('change', function (e) {
    var el = e.target; if (el.matches && el.matches('[data-act="cmp"]')) { var id = el.getAttribute('data-id'); if (el.checked) { if (Object.keys(S.compare).length >= 3) { el.checked = false; return; } S.compare[id] = 1; } else delete S.compare[id]; render(); }
    if (el.matches && el.matches('[data-act="time"]')) { S.draft[S.open].time = el.value; }
  });
  document.addEventListener('submit', function (e) { var f = e.target.closest('[data-act="askform"]'); if (!f) return; e.preventDefault(); var i = f.querySelector('input'), q = i.value.trim(), cx = f.closest('.ai').getAttribute('data-ctx'); i.value = ''; ask(q, cx); });
  scrim.addEventListener('click', closeSheet);

  function tryIt(a) {
    if (a === 'reset') { fresh(); if (logEl) logEl.innerHTML = ''; closeSheet(); log('form_submitted', 'home equity, $20,000. options step shown'); render(); app.scrollTop = 0; }
    else if (a === 'ask') { S.screen = 'offers'; S.done = false; S.fallback = false; render(); ask('Which of these costs least over 5 years?', null); }
    else if (a === 'pick') { S.fallback = false; S.screen = 'offers'; S.done = false; S.draft.ridgeview = { method: 'Text', time: defaultTime() }; S.picks.ridgeview = { method: 'Text', time: defaultTime() }; log('offer_opened', 'ridgeview'); log('contact_requested', 'Ridgeview Financial via <em>text</em>, ' + defaultTime() + '. consent scoped to this lender'); render(); app.scrollTop = 0; say('Ridgeview Financial will text you. Choose another lender to hear from them too.'); }
    else if (a === 'skip') { if (Object.keys(S.picks).length) { say('You already chose. Start over to see the fallback.'); return; } S.fallback = true; log('no_selection_24h', 'lead released to matching lenders (today\'s model)', true); render(); app.scrollTop = 0; }
  }
  log('form_submitted', 'home equity, $20,000. options step shown'); render();
})();
