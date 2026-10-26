// Prototype: the insurance companion app. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var app = $('#app'), sheet = $('#sheet'), scrim = $('#scrim'), toast = $('#toast'), logEl = $('#log');
  var LOGO = '<img src="/lendingtree/img/lt-logo.png" alt="lendingtree" width="728" height="230">';
  var DAY = 86400000;
  var COVER = [['🚗', 'Liability', '$100,000 / $300,000'], ['🛡', 'Collision', '$500 deductible'], ['🛡', 'Comprehensive', '$500 deductible'], ['👥', 'Uninsured motorist', '$100,000 / $300,000'], ['➕', 'Medical payments', '$10,000']];
  var CARRIERS = { Allstate: '#0b3d91', 'State Farm': '#b3121d', Travelers: '#c8102e', Lemonade: '#d6007f', Progressive: '#0a58ca', GEICO: '#1d6fb8', Nationwide: '#1d4f91', Trupanion: '#00836b', Other: '#3a4350' };
  var QUOTERS = [['Progressive', 0.82], ['GEICO', 0.85], ['Nationwide', 0.91]];
  var S, off;
  function fresh() {
    off = 0;
    S = { tab: 'cards', sub: 'cards', screen: 'home', open: null, card: 0, nfilter: 'All', read: {}, dismissed: {}, remind: {}, quotes: 0, nopened: 0, sent: {}, nextId: 10, log0: Date.now(), days: [],
      policies: [
        { id: 'a', carrier: 'Allstate', type: 'Auto Insurance', icon: '🚗', price: 128, number: '123 456 789', renewIn: 41, detail: true },
        { id: 'h', carrier: 'State Farm', type: 'Home Insurance', icon: '🏠', price: 118, number: '884 201 337', renewIn: 82 },
        { id: 'u', carrier: 'Travelers', type: 'Umbrella Insurance', icon: '☂️', price: 34, number: '552 910 004', renewIn: 82 },
        { id: 'r', carrier: 'Lemonade', type: 'Renters Insurance', icon: '🏢', price: 18, number: '310 774 902', renewIn: 140 }
      ] };
    S.policies.forEach(function (p) { S.remind[p.id] = true; });
  }
  fresh();
  var dateStr = function (d) { var t = new Date(Date.now() + d * DAY); return t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  var left = function (p) { return p.renewIn - off; };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var get = function (id) { return S.policies.filter(function (p) { return p.id === id; })[0]; };
  var best = function (p) { var q = QUOTERS[0]; return Math.round(p.price * q[1]); };
  var yearly = function (p) { return (p.price - best(p)) * 12; };
  var clock = function () { var s = Math.round((Date.now() - S.log0) / 1000); return (s < 10 ? '0' : '') + s + 's'; };
  function log(ev, detail, warn) { var d = document.createElement('div'); if (warn) d.className = 'warn'; d.innerHTML = '<i>day ' + off + ' · ' + clock() + '</i><em>' + ev + '</em> ' + (detail || ''); logEl.appendChild(d); logEl.scrollTop = logEl.scrollHeight; }
  function say(m) { toast.textContent = m; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 2400); }
  function tiles() {
    var n = S.policies.length;
    $('#tiles').innerHTML = '<div class="' + (n >= 2 ? 'ok' : '') + '"><b>' + n + '</b><span>Policies connected' + (n >= 2 ? ' (goal met)' : ' (goal 2+)') + '</span></div><div><b>' + S.quotes + '</b><span>Quote starts</span></div><div><b>' + S.nopened + '</b><span>Notifications opened</span></div>';
  }

  // ---- notifications (derived from policies and the clock)
  function notes() {
    var out = [];
    S.policies.forEach(function (p) {
      var d = left(p);
      if (d <= 45 && !S.dismissed['r' + p.id + Math.floor(p.renewIn / 365)]) out.push({ id: 'r' + p.id + Math.floor(p.renewIn / 365), kind: 'Renewals', icon: '⏰', tone: 'red', title: p.type.replace(' Insurance', '') + ' policy renews in ' + d + ' days', body: 'Your ' + p.carrier + ' ' + p.type.toLowerCase().replace(' insurance', '') + ' insurance renews on ' + dateStr(d) + '. Compare quotes to see if you can get a better rate.', cta: 'See alternative quotes', pid: p.id, when: 'Today' });
    });
    S.policies.forEach(function (p) {
      var y = yearly(p);
      if (y >= 100 && !S.dismissed['s' + p.id]) out.push({ id: 's' + p.id, kind: 'Savings', icon: '🐷', tone: 'green', title: 'You could save about ' + money(y) + '/year', body: 'We found lower rates for similar coverage on your ' + p.type.toLowerCase().replace(' insurance', '') + ' policy.', cta: 'View quotes', pid: p.id, when: 'Today' });
    });
    S.policies.forEach(function (p) { if (p.added && !S.dismissed['u' + p.id]) out.push({ id: 'u' + p.id, kind: 'Updates', icon: 'ℹ️', tone: '', title: 'Policy added', body: p.carrier + ' ' + p.type.toLowerCase() + ' is now in your app. We will watch its renewal date for you.', when: 'Today' }); });
    out.push({ id: 'd1', kind: 'Updates', icon: '📄', tone: '', title: 'New document available', body: 'Your homeowners insurance renewal notice is now available.', when: 'Earlier this month' });
    out.push({ id: 'd2', kind: 'Updates', icon: 'ℹ️', tone: '', title: 'Policy updated', body: 'Your renters policy has been updated with your new address.', when: 'Last month' });
    return out;
  }
  var unread = function () { return notes().filter(function (n) { return n.kind !== 'Updates' && !S.read[n.id]; }).length; };

  // ---- views
  function topbar() { var u = unread(); return '<div class="top"><div class="logo">' + LOGO + '</div><div style="display:flex;gap:8px;align-items:center"><button class="ico" data-act="tab" data-t="notes" aria-label="Notifications" style="position:relative">🔔' + (u ? '<span style="position:absolute;top:-6px;right:-6px;background:#e5362d;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;display:grid;place-items:center">' + u + '</span>' : '') + '</button><button class="ico" style="background:#e8eefc;border-color:#e8eefc;color:#0b5cff;font-size:12px" data-act="say" data-m="Profile is not in this prototype.">AM</button></div></div>'; }
  function nav() {
    var items = [['home', '🛡', 'Insurance'], ['savings', '🗓', 'Savings'], ['explore', '🏷', 'Explore'], ['notes', '🔔', 'Notifications']];
    return '<div class="nav" style="position:absolute;z-index:5;left:0;right:0;bottom:0;background:#fff;border-top:1px solid #e3e8ef;display:flex;padding:8px 6px 26px">' + items.map(function (i) { var on = S.tab === i[0]; return '<button data-act="tab" data-t="' + i[0] + '" style="flex:1;background:none;border:0;color:' + (on ? '#0b5cff' : '#7b8696') + ';font-size:11.5px;font-weight:' + (on ? 700 : 500) + ';display:grid;gap:2px;justify-items:center;position:relative"><span style="font-size:20px">' + i[1] + '</span>' + i[2] + (i[0] === 'notes' && unread() ? '<i style="position:absolute;top:-2px;right:calc(50% - 22px);background:#e5362d;color:#fff;border-radius:50%;width:16px;height:16px;font:700 10px/16px var(--sans);font-style:normal;text-align:center">' + unread() + '</i>' : '') + '</button>'; }).join('') + '</div>';
  }
  function seg() { return '<div style="display:flex;background:#eef2f6;border-radius:10px;padding:3px;margin:8px 0 14px">' + [['cards', 'Cards'], ['list', 'Policies'], ['notes', 'Notifications']].map(function (s) { var on = (S.tab === 'notes' ? 'notes' : S.sub) === s[0]; return '<button data-act="seg" data-s="' + s[0] + '" style="flex:1;border:0;border-radius:8px;padding:9px 4px;font-size:13.5px;font-weight:600;background:' + (on ? '#0b5cff' : 'transparent') + ';color:' + (on ? '#fff' : '#3a4350') + '">' + s[1] + '</button>'; }).join('') + '</div>'; }
  function polRow(p) {
    var d = left(p);
    return '<button data-act="open" data-id="' + p.id + '" style="width:100%;text-align:left;background:#fff;border:0;border-top:1px solid #e3e8ef;padding:13px 2px;display:flex;align-items:center;gap:12px"><span style="width:38px;height:38px;border-radius:10px;background:#eef4ff;display:grid;place-items:center;font-size:20px">' + p.icon + '</span><span style="flex:1"><b style="font-size:14.5px">' + p.type.replace(' Insurance', ' Insurance') + '</b><br><span style="font-size:12.5px;color:' + CARRIERS[p.carrier] + ';font-weight:700">' + p.carrier + '</span></span><span style="text-align:right"><b>' + money(p.price) + ' <small style="font-weight:400;color:#5b6574">/ month</small></b><br><span style="font-size:12px;color:' + (d <= 45 ? '#c0362c' : '#5b6574') + '">' + (d <= 0 ? 'Renews today' : 'Renews ' + dateStr(d).replace(/, \d{4}/, ', ' + new Date(Date.now() + d * DAY).getFullYear())) + '</span></span><span style="color:#9aa4b2">›</span></button>';
  }
  function cardView(p) {
    var c = CARRIERS[p.carrier], d = left(p);
    return '<div class="pc" data-act="open" data-id="' + p.id + '" style="flex:0 0 100%;scroll-snap-align:center;background:linear-gradient(135deg,' + c + ',#0a1f4d);color:#fff;border-radius:18px;padding:18px;min-height:190px;position:relative;cursor:pointer"><div style="display:flex;justify-content:space-between;align-items:start"><b style="font-size:24px;letter-spacing:-.02em">' + p.carrier + '</b><span style="text-align:right;font-size:13px">' + p.type + '<br><span style="opacity:.8">Active</span></span></div>' +
      '<div style="display:flex;gap:16px;margin:22px 0 14px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.85"><div>Policy number<br><b style="font-size:14px;letter-spacing:0;opacity:1">' + p.number + '</b></div><div>Renews in<br><b style="font-size:14px;letter-spacing:0">' + d + ' days</b></div></div>' +
      '<div style="display:flex;gap:8px"><button data-act="idcard" data-id="' + p.id + '" style="flex:1;border:0;border-radius:10px;padding:10px;background:rgba(255,255,255,.92);color:#0b5cff;font-weight:700">View card</button><button data-act="open" data-id="' + p.id + '" style="flex:1;border:1.5px solid rgba(255,255,255,.7);border-radius:10px;padding:10px;background:transparent;color:#fff;font-weight:700">Details →</button></div></div>';
  }
  function home() {
    var body;
    if (S.sub === 'cards') {
      body = '<div id="rail" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:10px;scrollbar-width:none">' + S.policies.map(cardView).join('') + '</div>' +
        '<div style="display:flex;gap:6px;justify-content:center;margin:10px 0 6px">' + S.policies.map(function (p, i) { return '<i data-dot="' + i + '" style="width:7px;height:7px;border-radius:50%;background:' + (i === S.card ? '#0b5cff' : '#cdd5e0') + '"></i>'; }).join('') + '</div>' + S.policies.map(polRow).join('');
    } else body = S.policies.map(polRow).join('');
    var top = S.policies.slice().sort(function (a, b) { return yearly(b) - yearly(a); })[0];
    return topbar() + '<h3>Your insurance</h3><p class="sub">Quick access to your cards, coverage, and renewals, all in one place.</p>' + seg() + body +
      '<button data-act="quotes" data-id="' + top.id + '" style="width:100%;text-align:left;margin:14px 0;border:0;background:#e8f6ec;border-radius:14px;padding:14px;display:flex;gap:12px;align-items:center"><span style="font-size:26px">🔎</span><span style="flex:1"><b>Find better rates</b><br><span style="font-size:13px;color:#3b5a49">Check if you could save on any of your policies.</span></span><span>›</span></button>' +
      '<button class="btn ghost full" data-act="add">+ Add a policy</button>';
  }
  function detail(p) {
    var d = left(p), c = CARRIERS[p.carrier];
    return '<div class="top"><button class="back" data-act="back">‹ Your insurance</button><button class="ico" data-act="tab" data-t="notes" aria-label="Notifications">🔔</button></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 12px"><b style="font-size:30px;color:' + c + ';letter-spacing:-.03em">' + p.carrier + '</b><div style="text-align:right"><b>' + p.type + '</b><br><span class="chosen">Active</span></div></div>' +
      '<div style="display:flex;border:1px solid #e3e8ef;border-radius:12px;padding:10px 12px;font-size:12.5px;color:#5b6574;gap:12px"><div style="flex:1">Policy number<br><b style="color:#0d1b2a;font-size:14px">' + p.number + '</b></div><div style="flex:1">Price<br><b style="color:#0d1b2a;font-size:14px">' + money(p.price) + '/mo</b></div><div style="flex:1">Expires in<br><b style="color:#0d1b2a;font-size:14px">' + d + ' days</b><br>' + dateStr(d) + '</div></div>' +
      (d <= 60 ? '<button data-act="quotes" data-id="' + p.id + '" style="width:100%;text-align:left;margin:12px 0;border:0;background:#fdeceb;border-radius:12px;padding:12px;display:flex;gap:10px;align-items:center"><span style="font-size:22px;color:#c0362c">⏰</span><span style="flex:1"><b style="color:#c0362c">Renewal coming up</b><br><span style="font-size:13px;color:#5b6574">Your policy renews in ' + d + ' days. Compare quotes to see if you can get a better rate.</span></span><span>›</span></button>' : '<div style="height:12px"></div>') +
      '<div style="display:flex;gap:8px"><button class="btn" style="flex:1" data-act="idcard" data-id="' + p.id + '">View insurance card</button><button class="btn ghost" style="flex:1" data-act="say" data-m="Benefits detail is not in this prototype.">View benefits</button></div>' +
      '<h4 style="margin-top:18px">Coverage</h4>' + COVER.slice(0, p.detail ? 5 : 3).map(function (c2) { return '<div style="display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #e3e8ef;font-size:14px"><span>' + c2[0] + ' &nbsp;' + c2[1] + '</span><b>' + c2[2] + '</b></div>'; }).join('') +
      '<label style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-top:1px solid #e3e8ef;font-size:14px">Remind me 45 days before renewal<input type="checkbox" data-act="remind" data-id="' + p.id + '"' + (S.remind[p.id] ? ' checked' : '') + ' style="width:22px;height:22px;accent-color:#0b5cff"></label>' +
      '<h4>Documents</h4>' + ['Insurance card', 'Policy document', 'Declarations page'].map(function (n) { return '<button data-act="say" data-m="Documents open in the full app." style="width:100%;text-align:left;background:none;border:0;border-top:1px solid #e3e8ef;padding:12px 0;display:flex;justify-content:space-between"><span>📄 &nbsp;' + n + '</span><span>›</span></button>'; }).join('');
  }
  function notesView() {
    var all = notes(), f = S.nfilter;
    var cnt = function (k) { return all.filter(function (n) { return n.kind === k && !S.read[n.id]; }).length; };
    var chips = ['All', 'Renewals', 'Savings', 'Updates'].map(function (k) { var c = k === 'All' ? 0 : cnt(k); return '<button data-act="nf" data-k="' + k + '" style="border:1.5px solid ' + (f === k ? '#0b5cff' : '#dfe5ee') + ';background:' + (f === k ? '#eef4ff' : '#fff') + ';border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;color:' + (f === k ? '#0b5cff' : '#3a4350') + '">' + k + (c ? ' <i style="font-style:normal;background:#e5362d;color:#fff;border-radius:50%;padding:1px 6px;font-size:11px">' + c + '</i>' : '') + '</button>'; }).join('');
    var list = all.filter(function (n) { return f === 'All' || n.kind === f; }), lastWhen = '';
    return topbar().replace(/<div class="top">.*?<\/div><\/div>/, '<div class="top"><div class="logo">' + LOGO + '</div></div>') + '<h3>Notifications</h3><p class="sub">Important updates about your policies, renewals, and savings opportunities.</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">' + chips + '</div>' +
      (list.length ? list.map(function (n) {
        var hd = n.when !== lastWhen ? '<h4 style="margin:14px 0 6px">' + n.when + '</h4>' : ''; lastWhen = n.when;
        var bg = n.tone === 'red' ? '#fdeceb' : n.tone === 'green' ? '#e8f6ec' : '#fff', unr = n.kind !== 'Updates' && !S.read[n.id];
        return hd + '<div style="background:' + bg + ';border-radius:14px;padding:12px;margin-bottom:8px;display:flex;gap:10px;' + (bg === '#fff' ? 'border:1px solid #e3e8ef;' : '') + '"><span style="font-size:22px">' + n.icon + '</span><div style="flex:1"><b style="font-size:14.5px">' + n.title + (unr ? ' <i style="color:#e5362d;font-style:normal">●</i>' : '') + '</b><br><span style="font-size:13px;color:#4a5565">' + n.body + '</span>' + (n.cta ? '<br><button class="link" data-act="ncta" data-id="' + n.id + '" data-pid="' + n.pid + '">' + n.cta + ' →</button>' : '') + '</div><button data-act="dismiss" data-id="' + n.id + '" aria-label="Dismiss" style="background:none;border:0;color:#9aa4b2;font-size:18px;align-self:start">×</button></div>';
      }).join('') : '<p class="sub">Nothing here right now.</p>');
  }
  function savingsView() {
    var ps = S.policies.filter(function (p) { return yearly(p) > 0; }), tot = ps.reduce(function (a, p) { return a + yearly(p); }, 0);
    return topbar() + '<h3>Savings</h3><p class="sub">What the best quote we found could save you across your policies.</p><div class="kv" style="text-align:center;padding:18px"><span style="color:#5b6574;font-size:13px">Potential yearly savings</span><br><b style="font-size:38px;letter-spacing:-.03em;color:#0a7a46">' + money(tot) + '</b></div>' +
      ps.map(function (p) { return '<div class="req"><div><b>' + p.type + '</b><small>' + p.carrier + ' ' + money(p.price) + '/mo → ' + QUOTERS[0][0] + ' ' + money(best(p)) + '/mo</small></div><button class="btn" data-act="quotes" data-id="' + p.id + '">Save ' + money(yearly(p)) + '</button></div>'; }).join('');
  }
  function render() {
    var keep = app.scrollTop, h;
    if (S.screen === 'detail') h = detail(get(S.open));
    else if (S.tab === 'notes') h = notesView();
    else if (S.tab === 'savings') h = savingsView();
    else if (S.tab === 'explore') h = topbar() + '<h3>Explore</h3><p class="sub">More ways to save: bundles, credit cards and loans, chosen for you. Not in this prototype.</p>';
    else h = home();
    app.innerHTML = h + (S.screen === 'detail' ? '' : '');
    var old = $('#navhost'); if (old) old.remove();
    var n = document.createElement('div'); n.id = 'navhost'; n.innerHTML = S.screen === 'detail' ? '' : nav(); $('#phone').appendChild(n);
    app.scrollTop = keep; tiles();
    var rail = $('#rail'); if (rail) { rail.scrollLeft = S.card * rail.clientWidth; rail.addEventListener('scroll', function () { var i = Math.round(rail.scrollLeft / rail.clientWidth); if (i !== S.card) { S.card = i; document.querySelectorAll('[data-dot]').forEach(function (d) { d.style.background = +d.getAttribute('data-dot') === i ? '#0b5cff' : '#cdd5e0'; }); } }); }
  }
  function openSheet(h) { sheet.innerHTML = '<div class="grab"></div>' + h; sheet.hidden = false; scrim.hidden = false; sheet.scrollTop = 0; }
  function closeSheet() { sheet.hidden = true; scrim.hidden = true; }
  function quotesSheet(id) {
    var p = get(id); log('quote_compared', p.carrier + ' ' + p.type.toLowerCase());
    openSheet('<h3 style="font-size:22px">Compare quotes</h3><p class="sub">' + p.type + ' · now ' + money(p.price) + '/month with ' + p.carrier + '. Your policy details are pre-filled.</p><div style="height:8px"></div>' +
      QUOTERS.map(function (q, i) { var pr = Math.round(p.price * q[1]), sv = (p.price - pr) * 12; return '<div class="req"><div><b>' + q[0] + '</b>' + (i === 0 ? ' <span class="chosen">Best price</span>' : '') + '<small>' + money(pr) + '/month · saves ' + money(sv) + '/year</small></div><button class="btn' + (i ? ' ghost' : '') + '" data-act="getquote" data-id="' + p.id + '" data-c="' + q[0] + '">Get quote</button></div>'; }).join('') +
      '<p class="note" style="text-align:left">Sample prices for illustration. A real quote would come from the carrier.</p><button class="link" data-act="closesheet">Close</button>');
  }
  function addSheet() {
    openSheet('<h3 style="font-size:22px">Add a policy</h3><p class="sub">Three ways. Pick the easiest.</p>' +
      '<h4>From your past quotes</h4>' + [['b', 'Progressive', 'Motorcycle Insurance', '🏍', 46, 230], ['t', 'Trupanion', 'Pet Insurance', '🐕', 62, 300]].filter(function (x) { return !get(x[0]); }).map(function (x) { return '<div class="req"><div><b>' + x[2] + '</b><small>' + x[1] + ' · ' + money(x[4]) + '/mo · you quoted this in August</small></div><button class="btn" data-act="addq" data-x="' + x.join('|') + '">Add</button></div>'; }).join('') +
      '<h4>Forward your policy email</h4><p class="sub" style="margin:0">Send any renewal or policy email to <b>add@mail.lendingtree.example</b> and we read the dates and prices.</p><button class="btn ghost full" style="margin-top:8px" data-act="fwd">I forwarded an email</button>' +
      '<h4>Upload a document</h4><label class="btn ghost full" style="display:block;text-align:center">Choose a PDF or photo<input type="file" id="upl" accept="application/pdf,image/*" hidden></label><button class="link" data-act="closesheet" style="margin-top:12px">Close</button>');
    var u = $('#upl'); if (u) u.addEventListener('change', function () { if (u.files[0]) addPolicy({ carrier: 'Other', type: 'Uploaded policy', icon: '📄', price: 55, renewIn: 150 }, 'upload (' + u.files[0].name.replace(/</g, '') + ')'); });
  }
  function addPolicy(p, src) {
    var id = 'n' + (S.nextId++); p.id = id; p.number = String(100 + Math.floor(Math.random() * 899)) + ' ' + String(100 + Math.floor(Math.random() * 899)) + ' ' + String(100 + Math.floor(Math.random() * 899)); p.added = true; S.remind[id] = true; S.policies.push(p);
    log('policy_connected', p.carrier + ' ' + p.type.toLowerCase() + ' via <em>' + src + '</em>. policies now ' + S.policies.length); closeSheet(); S.tab = 'home'; S.sub = 'list'; S.screen = 'home'; render(); say(p.carrier + ' ' + p.type.toLowerCase() + ' added. We will watch its renewal date.');
  }
  function advance(n) {
    var before = S.policies.map(function (p) { return left(p); });
    off += n;
    S.policies.forEach(function (p, i) {
      if (left(p) <= 0) { p.renewIn += 365; log('policy_renewed', p.carrier + ' ' + p.type.toLowerCase() + ' rolled to next term', true); }
      else if (before[i] > 45 && left(p) <= 45 && S.remind[p.id]) log('renewal_prompt_sent', p.carrier + ' ' + p.type.toLowerCase() + ' · ' + left(p) + ' days out. push + email');
    });
    log('day_advanced', '+' + n + ' days'); render(); say(n + ' days later. Renewals are closer.');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    if (a === 'idcard') { e.stopPropagation(); var p = get(id); log('id_card_viewed', p.carrier); openSheet('<h3 style="font-size:22px">Insurance card</h3><div style="background:linear-gradient(135deg,' + CARRIERS[p.carrier] + ',#0a1f4d);color:#fff;border-radius:16px;padding:18px;margin:12px 0"><b style="font-size:22px">' + p.carrier + '</b><br><span style="opacity:.8">' + p.type + '</span><div style="margin-top:20px;font-size:13px;opacity:.9">Policy ' + p.number + '<br>Insured: Alex M. Sample<br>Valid through ' + dateStr(left(p)) + '</div></div><button class="link" data-act="closesheet">Close</button>'); return; }
    if (a === 'open') { S.screen = 'detail'; S.open = id; log('policy_opened', get(id).carrier); render(); app.scrollTop = 0; }
    else if (a === 'back') { S.screen = 'home'; render(); app.scrollTop = 0; }
    else if (a === 'tab') { S.tab = el.getAttribute('data-t'); S.screen = 'home'; if (S.tab === 'home') { } render(); app.scrollTop = 0; }
    else if (a === 'seg') { var s = el.getAttribute('data-s'); if (s === 'notes') { S.tab = 'notes'; } else { S.tab = 'home'; S.sub = s; } S.screen = 'home'; render(); }
    else if (a === 'nf') { S.nfilter = el.getAttribute('data-k'); render(); }
    else if (a === 'ncta') { var nid = el.getAttribute('data-id'); if (!S.read[nid]) { S.read[nid] = 1; S.nopened++; log('notification_opened', nid + '. <em>opens quote compare</em>'); } render(); quotesSheet(el.getAttribute('data-pid')); }
    else if (a === 'dismiss') { S.dismissed[id] = 1; log('notification_dismissed', id); render(); }
    else if (a === 'quotes') { quotesSheet(id); }
    else if (a === 'getquote') { S.quotes++; log('quote_started', el.getAttribute('data-c') + ' for ' + get(id).type.toLowerCase() + '. details pre-filled, <em>zero re-entry</em>'); closeSheet(); render(); say('Quote started with ' + el.getAttribute('data-c') + '. Your details came with you.'); }
    else if (a === 'add') { openSheet(''); addSheet(); }
    else if (a === 'addq') { var x = el.getAttribute('data-x').split('|'); addPolicy({ carrier: x[1], type: x[2], icon: x[3], price: +x[4], renewIn: +x[5] }, 'past quote (pre-filled)'); }
    else if (a === 'fwd') { addPolicy({ carrier: 'Nationwide', type: 'Life Insurance', icon: '🛟', price: 41, renewIn: 320 }, 'email forward'); }
    else if (a === 'closesheet') closeSheet();
    else if (a === 'say') say(el.getAttribute('data-m'));
    else if (a === 't-add') { if (get('b')) { say('Already added. Start over to try again.'); return; } closeSheet(); addPolicy({ carrier: 'Progressive', type: 'Motorcycle Insurance', icon: '🏍', price: 46, renewIn: 230 }, 'past quote (pre-filled)'); }
    else if (a === 't-skip') advance(30);
    else if (a === 't-quote') { S.screen = 'home'; S.tab = 'home'; render(); quotesSheet('a'); }
    else if (a === 't-reset') { fresh(); logEl.innerHTML = ''; closeSheet(); log('app_opened', '4 policies pre-filled from past quotes'); render(); app.scrollTop = 0; }
  });
  document.addEventListener('change', function (e) { var el = e.target; if (el.matches && el.matches('[data-act="remind"]')) { S.remind[el.getAttribute('data-id')] = el.checked; log('reminder_' + (el.checked ? 'on' : 'off'), el.getAttribute('data-id')); } });
  scrim.addEventListener('click', closeSheet);
  log('app_opened', '4 policies pre-filled from past quotes'); render();
})();
