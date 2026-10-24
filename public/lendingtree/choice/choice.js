// Prototype: the options step. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var app = $('#app'), sheet = $('#sheet'), scrim = $('#scrim'), toast = $('#toast');
  var LEAF = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 14C2 6 7 2 14 2c0 7-4 12-12 12z" fill="#1fa35c"/></svg>';
  var OFFERS = [
    { id: 'ridgeview', name: 'Ridgeview Financial', mark: '▲', kind: 'Personal loan', rate: 'Fixed rate', apr: 6.49, mo: 387, fee: 0, term: 60, total: 23220, stars: '4.8', n: '2,341', fixed: true,
      about: 'A fixed-rate personal loan with no origination fee. Good for debt consolidation, home improvement, or other major expenses.' },
    { id: 'maple', name: 'Maple Bank', mark: '❦', kind: 'Home equity line', rate: 'Variable', apr: 7.21, mo: 356, fee: 0, term: 60, total: 21360, stars: '4.6', n: '1,208', fixed: false,
      about: 'A home equity line of credit with a variable rate. The payment can move with the market, and your home secures the line.' },
    { id: 'summit', name: 'Summit Lending', mark: '▞', kind: 'Personal loan', rate: 'Fixed rate', apr: 8.99, mo: 422, fee: 400, term: 60, total: 25720, stars: '4.4', n: '893', fixed: true,
      about: 'A fixed-rate personal loan with a 2% origination fee. Funds can arrive as soon as the next business day.' }
  ];
  var TIMES = ['Right now (within 5 minutes)', 'Today, 6:00 PM', 'Today, 8:00 PM', 'Tomorrow, 9:00 AM', 'Tomorrow, 12:00 PM'];
  var S;
  function fresh() { S = { screen: 'offers', open: null, compare: {}, picks: {}, draft: {}, chat: {}, done: false, fallback: false, asked: 0, opened: {}, t0: Date.now() }; }
  fresh();
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var by = function (id) { return OFFERS.filter(function (o) { return o.id === id; })[0]; };
  var clock = function () { var s = Math.round((Date.now() - S.t0) / 1000); return (s < 10 ? '0' : '') + s + 's'; };

  // ---- log + tiles
  var logEl = $('#log');
  function log(ev, detail, warn) {
    var d = document.createElement('div'); if (warn) d.className = 'warn';
    d.innerHTML = '<i>' + clock() + '</i><em>' + ev + '</em> ' + (detail || '');
    logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight;
  }
  function tiles() {
    var n = Object.keys(S.picks).length;
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
      return 'I can explain the fees, the total cost, or how this compares to the other offers. Try one of the questions below.';
    }
    if (/least|cheap|lowest|cost|total/.test(t)) return 'Over 5 years the lowest estimated total is Maple Bank at ' + money(low.total) + ', but its rate is variable and can rise. The lowest fixed-rate total is Ridgeview Financial at ' + money(fixedLow.total) + ', with no fee. Summit Lending is highest at ' + money(by('summit').total) + ' including its fee.';
    if (/differen|vs|compare/.test(t)) return 'Ridgeview and Summit are fixed-rate personal loans. Maple Bank is a variable-rate home equity line secured by your home. Ridgeview has the lowest APR (6.49%) and no fee. Maple has the lowest payment. Summit charges a 2% fee.';
    if (/choose|help|recommend|pick/.test(t)) return 'If you want a payment that never changes, Ridgeview Financial is the strongest fit: lowest APR, no fee, fixed rate. If the lowest monthly payment matters most and you are comfortable with a variable rate, look at Maple Bank. Pick one or more, and only the lenders you choose will contact you.';
    if (/fee/.test(t)) return 'Ridgeview and Maple Bank charge no origination fee. Summit Lending charges 2% ($400).';
    return 'I can compare these offers, explain fees, or work out total cost. Try one of the questions below, or tap See details on an offer.';
  }
  function aiBox(ctx, chips) {
    var msgs = (S.chat[ctx || 'all'] || []).map(function (m) { return '<div class="answer' + (m.you ? ' you' : '') + '">' + m.text + '</div>'; }).join('');
    return '<div class="ai" data-ctx="' + (ctx || '') + '"><div class="hd"><div class="spark">✦</div><div><b>AI Assistant<em>BETA</em></b><span>Get quick, unbiased answers about ' + (ctx ? 'this offer' : 'these offers') + '.</span></div></div>' +
      msgs + '<form data-act="askform"><input aria-label="Ask a question" placeholder="' + (ctx ? "What's the total cost over 5 years?" : 'Which of these costs least over 5 years?') + '"><button aria-label="Send">➤</button></form>' +
      '<div class="chips">' + chips.map(function (c) { return '<button type="button" data-act="chip" data-q="' + c + '">' + c + '</button>'; }).join('') + '</div></div>';
  }
  function ask(q, ctx) {
    if (!q) return;
    var k = ctx || 'all'; S.chat[k] = (S.chat[k] || []).concat([{ you: true, text: q.replace(/</g, '&lt;') }]); S.asked++;
    log('ai_question', '"' + q.replace(/</g, '&lt;') + '"' + (ctx ? ' on ' + ctx : ''));
    render();
    setTimeout(function () { S.chat[k].push({ text: answer(q, ctx) }); render(); var a = app.querySelectorAll('.answer'); if (a.length) a[a.length - 1].scrollIntoView({ block: 'nearest' }); }, 450);
  }

  // ---- screens
  var steps = function (n) { return '<div class="steps"><span class="' + (n === 1 ? 'on' : '') + '"><i>1</i> Application</span><u></u><span class="' + (n === 2 ? 'on' : '') + '"><i>2</i> View offers</span><u></u><span class="' + (n === 3 ? 'on' : '') + '"><i>3</i> Choose &amp; connect</span></div>'; };
  var topbar = '<div class="top"><div class="logo">' + LEAF + 'lendingtree</div><button class="ico" aria-label="Help" data-act="help">?</button></div>';
  function screenOffers() {
    var nChosen = Object.keys(S.picks).length, nCmp = Object.keys(S.compare).length;
    var cards = OFFERS.map(function (o) {
      var p = S.picks[o.id];
      return '<div class="offer' + (p ? ' sel' : '') + '"><div class="row"><div style="display:flex;gap:12px;align-items:center"><div class="mark">' + o.mark + '</div><div><div class="nm">' + o.name + '</div><div class="ty">' + o.kind + ' · ' + o.rate + '</div></div></div>' +
        '<button class="btn" data-act="open" data-id="' + o.id + '">' + (p ? 'Edit' : 'See details →') + '</button></div>' +
        '<div class="nums"><div><b>' + o.apr.toFixed(2) + '%</b><span>APR</span></div><div><b>' + money(o.mo) + '</b><span>Est. monthly</span></div>' +
        (p ? '<span class="chosen" style="margin-left:auto">✓ ' + p.method + ' · ' + p.time.split(',')[0] + '</span>' : '<label><input type="checkbox" data-act="cmp" data-id="' + o.id + '"' + (S.compare[o.id] ? ' checked' : '') + '> Compare</label>') + '</div></div>';
    }).join('');
    return steps(2) + '<h3>You have options.</h3><p class="sub">We found personalized offers based on your application. Choose the lenders you want to hear from.</p><div style="height:14px"></div>' + cards +
      (nCmp >= 2 ? '<button class="btn ghost full" data-act="docompare" style="margin-bottom:12px">Compare ' + nCmp + ' offers</button>' : '') +
      aiBox(null, ['Lowest total cost?', "What's the difference?", 'Help me choose']) +
      '<div class="bar2"><button class="btn full" data-act="finish"' + (nChosen ? '' : ' disabled') + '>' + (nChosen ? 'Done: connect me with ' + nChosen + (nChosen > 1 ? ' lenders' : ' lender') : 'Choose at least one lender') + '</button><div class="note">Only lenders you choose will contact you.</div></div>';
  }
  function screenDetail(id) {
    var o = by(id), d = S.draft[id] || (S.draft[id] = { method: (S.picks[id] || {}).method || 'Text', time: (S.picks[id] || {}).time || TIMES[1] });
    var rows = [['Loan amount', '$20,000'], ['APR (' + (o.fixed ? 'fixed' : 'variable') + ')', o.apr.toFixed(2) + '%'], ['Est. monthly payment', money(o.mo)], ['Term', o.term + ' months'], ['Origination fee', money(o.fee)], ['Estimated total cost', money(o.total)]];
    return '<div class="top"><button class="back" data-act="back">‹ Back to offers</button><button class="ico" aria-label="Help" data-act="help">?</button></div>' +
      '<div style="display:flex;gap:12px;align-items:center;justify-content:space-between"><div style="display:flex;gap:12px;align-items:center"><div class="mark">' + o.mark + '</div><div><h3 style="font-size:21px">' + o.name + '</h3><span class="tag">' + o.kind + '</span><span class="tag">' + o.rate + '</span></div></div><div style="text-align:right;font-size:13px">★ <b>' + o.stars + '</b><br><span style="color:#5b6574">(' + o.n + ')</span></div></div>' +
      '<h4>Overview</h4><p class="sub" style="margin-top:0">' + o.about + '</p><h4>Loan details</h4><div class="kv">' + rows.map(function (r) { return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '</div>' +
      '<h4>Contact me about this offer</h4><p class="sub" style="margin:0 0 6px">Choose how and when ' + o.name + ' can reach you.</p>' +
      '<div class="methods">' + ['Text', 'Call', 'Email'].map(function (m) { return '<button data-act="method" data-m="' + m + '" class="' + (d.method === m ? 'on' : '') + '">' + ({ Text: '💬', Call: '📞', Email: '✉️' })[m] + '<span>' + m + '</span></button>'; }).join('') + '</div>' +
      '<select aria-label="When" data-act="time">' + (d.method === 'Email' ? ['Any time today'].concat(TIMES.slice(3)) : TIMES).map(function (t) { return '<option' + (t === d.time ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select>' +
      '<div style="height:14px"></div>' + aiBox(id, ["Explain the fees", 'Compare to other offers', 'Is this a good deal?']) +
      '<div class="bar2"><button class="btn full" data-act="request" data-id="' + o.id + '">' + (S.picks[o.id] ? 'Update my request' : 'Contact me about this offer') + '</button><div class="note">You can change or cancel this request at any time.</div></div>';
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
    app.scrollTop = keep; tiles();
  }
  function openSheet(html) { sheet.innerHTML = '<div class="grab"></div>' + html; sheet.hidden = false; scrim.hidden = false; }
  function closeSheet() { sheet.hidden = true; scrim.hidden = true; }
  function compareSheet() {
    var ids = Object.keys(S.compare), os = ids.map(by);
    var best = function (f, lo) { var v = os.map(f); return lo ? Math.min.apply(0, v) : Math.max.apply(0, v); };
    var cell = function (txt, good) { return '<td class="' + (good ? 'win b' : 'b') + '">' + txt + '</td>'; };
    openSheet('<h3 style="font-size:22px">Compare offers</h3><p class="sub">Side by side, same $20,000 over 60 months.</p><div style="overflow-x:auto"><table><tr><th></th>' + os.map(function (o) { return '<th>' + o.name.split(' ')[0] + '</th>'; }).join('') + '</tr>' +
      '<tr><td>APR</td>' + os.map(function (o) { return cell(o.apr.toFixed(2) + '%', o.apr === best(function (x) { return x.apr; }, true)); }).join('') + '</tr>' +
      '<tr><td>Monthly</td>' + os.map(function (o) { return cell(money(o.mo), o.mo === best(function (x) { return x.mo; }, true)); }).join('') + '</tr>' +
      '<tr><td>Fee</td>' + os.map(function (o) { return cell(money(o.fee), o.fee === best(function (x) { return x.fee; }, true)); }).join('') + '</tr>' +
      '<tr><td>Est. total</td>' + os.map(function (o) { return cell(money(o.total), o.total === best(function (x) { return x.total; }, true)); }).join('') + '</tr>' +
      '<tr><td>Rate type</td>' + os.map(function (o) { return '<td>' + (o.fixed ? 'Fixed' : 'Variable') + '</td>'; }).join('') + '</tr></table></div>' +
      '<p class="note" style="text-align:left;margin-top:12px">Green marks the best value in each row. Maple Bank\'s total assumes today\'s variable rate.</p><button class="btn full" data-act="closesheet" style="margin-top:12px">Close</button>');
  }

  // ---- events
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    if (a === 'open') { S.screen = 'detail'; S.open = id; if (!S.opened[id]) { S.opened[id] = 1; log('offer_opened', id); } render(); app.scrollTop = 0; }
    else if (a === 'back') { S.screen = 'offers'; S.done = false; render(); app.scrollTop = 0; }
    else if (a === 'method') { var d = S.draft[S.open]; d.method = el.getAttribute('data-m'); d.time = d.method === 'Email' ? 'Any time today' : TIMES[1]; render(); }
    else if (a === 'request') {
      var dd = S.draft[id]; S.picks[id] = { method: dd.method, time: dd.time }; S.screen = 'offers';
      log('contact_requested', by(id).name + ' via <em>' + dd.method.toLowerCase() + '</em>, ' + dd.time + '. consent scoped to this lender'); render(); app.scrollTop = 0; say(by(id).name + ' will ' + (dd.method === 'Call' ? 'call' : dd.method === 'Text' ? 'text' : 'email') + ' you. No one else will.');
    }
    else if (a === 'finish') { S.done = true; log('selection_complete', Object.keys(S.picks).length + ' lender(s) chosen. other lenders: <em>0</em>'); render(); app.scrollTop = 0; }
    else if (a === 'cancel') { delete S.picks[id]; log('contact_cancelled', id); if (!Object.keys(S.picks).length) { S.done = false; } render(); }
    else if (a === 'docompare') { log('offers_compared', Object.keys(S.compare).join(', ')); compareSheet(); }
    else if (a === 'closesheet') closeSheet();
    else if (a === 'chip') { ask(el.getAttribute('data-q'), el.closest('.ai').getAttribute('data-ctx')); }
    else if (a === 'help') { say('Help: tap See details, choose how to be contacted, then Done.'); }
    else if (['ask', 'pick', 'skip', 'reset'].indexOf(a) > -1) tryIt(a);
  });
  document.addEventListener('change', function (e) {
    var el = e.target; if (el.matches && el.matches('[data-act="cmp"]')) { var id = el.getAttribute('data-id'); if (el.checked) { if (Object.keys(S.compare).length >= 3) { el.checked = false; return; } S.compare[id] = 1; } else delete S.compare[id]; render(); }
    if (el.matches && el.matches('[data-act="time"]')) { S.draft[S.open].time = el.value; }
  });
  document.addEventListener('submit', function (e) { var f = e.target.closest('[data-act="askform"]'); if (!f) return; e.preventDefault(); var i = f.querySelector('input'); ask(i.value.trim(), f.closest('.ai').getAttribute('data-ctx')); });
  scrim.addEventListener('click', closeSheet);

  function tryIt(a) {
    if (a === 'reset') { fresh(); logEl.innerHTML = ''; closeSheet(); log('form_submitted', 'home equity, $20,000. options step shown'); render(); app.scrollTop = 0; }
    else if (a === 'ask') { S.screen = 'offers'; S.done = false; S.fallback = false; render(); ask('Which of these costs least over 5 years?', null); }
    else if (a === 'pick') { S.fallback = false; S.screen = 'offers'; S.done = false; S.draft.ridgeview = { method: 'Text', time: 'Today, 6:00 PM' }; S.picks.ridgeview = { method: 'Text', time: 'Today, 6:00 PM' }; log('offer_opened', 'ridgeview'); log('contact_requested', 'Ridgeview Financial via <em>text</em>, Today, 6:00 PM. consent scoped to this lender'); render(); app.scrollTop = 0; say('Ridgeview Financial will text you. No one else will.'); }
    else if (a === 'skip') { if (Object.keys(S.picks).length) { say('You already chose. Start over to see the fallback.'); return; } S.fallback = true; log('no_selection_24h', 'lead released to matching lenders (today\'s model)', true); render(); app.scrollTop = 0; }
  }
  log('form_submitted', 'home equity, $20,000. options step shown'); render();
})();
