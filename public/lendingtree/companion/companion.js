// Prototype: the insurance companion app. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var app = $('#app'), sheet = $('#sheet'), scrim = $('#scrim'), toast = $('#toast'), tabbar = $('#tabbar');
  var LOGO = '<img src="/lendingtree/img/lt-logo.png" alt="lendingtree" width="728" height="230">';
  var DAY = 86400000;
  var CARRIERS = { Allstate: '#0b3d91', 'State Farm': '#b3121d', Travelers: '#c8102e', Lemonade: '#d6007f', Progressive: '#0a58ca', GEICO: '#1d6fb8', Nationwide: '#1d4f91', Trupanion: '#00836b', 'Healthy Paws': '#e26b1f', Other: '#3a4350' };
  var QUOTERS = [['Progressive', 0.82], ['GEICO', 0.85], ['Nationwide', 0.91]];
  var COVER = [['car', 'Liability', '$100,000 / $300,000'], ['shield', 'Collision', '$500 deductible'], ['shield', 'Comprehensive', '$500 deductible'], ['people', 'Uninsured motorist', '$100,000 / $300,000'], ['plus', 'Medical payments', '$10,000']];
  var BENEFITS = [['Roadside assistance', 'Towing, jump starts and lockouts, any time.'], ['Rental reimbursement', 'Up to $40 a day while your car is in the shop.'], ['Glass coverage', 'Windshield repairs with no deductible.'], ['Accident forgiveness', 'Your first at-fault accident will not raise your rate.']];
  var EXPLORE = [
    { type: 'Pet Insurance', icon: 'paw', sub: 'Vet bills for dogs and cats', from: [['Lemonade', 48], ['Healthy Paws', 55], ['Trupanion', 62]] },
    { type: 'Life Insurance', icon: 'heart', sub: 'Term coverage for your family', from: [['Nationwide', 41], ['Travelers', 46], ['State Farm', 52]] },
    { type: 'Motorcycle Insurance', icon: 'bike', sub: 'Bikes, scooters and ATVs', from: [['Progressive', 46], ['GEICO', 51], ['Allstate', 58]] }
  ];
  var PATH = {
    shield: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.2-1.3-2-3-2s-3 .8-3 2 1.3 1.8 3 2.2 3 1 3 2.2-1.3 2-3 2-3-.8-3-2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    car: '<path d="M3 13l2-6h14l2 6v5h-3v-2H6v2H3z"/><circle cx="7.5" cy="13.2" r=".6"/><circle cx="16.5" cy="13.2" r=".6"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6.5a2 2 0 0 0 4 0"/>',
    building: '<path d="M5 21V4h9v17"/><path d="M14 9h5v12"/><path d="M8 8h2M8 12h2M8 16h2M3 21h18"/>',
    bike: '<circle cx="6" cy="16" r="3"/><circle cx="18" cy="16" r="3"/><path d="M6 16l4-6h5l3 6M10 10L9 7H7"/>',
    paw: '<circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="4.6" cy="13" r="1.6"/><circle cx="19.4" cy="13" r="1.6"/><path d="M12 12c3 0 5 3 5 5.5S15 20 12 20s-5-.5-5-2.5S9 12 12 12z"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
    right: '<path d="M9 6l6 6-6 6"/>', left: '<path d="M15 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>', card: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 14.5c2 .8 3 2.800 3 5.500"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.500 7.500l8.500 6 8.500-6"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.500" cy="8.500" r="1.200"/>'
  };
  var ic = function (n, s, w) { return '<svg class="i" viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="none" stroke="currentColor" stroke-width="' + (w || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATH[n] + '</svg>'; };
  var ICON = { 'Auto Insurance': 'car', 'Home Insurance': 'home', 'Umbrella Insurance': 'umbrella', 'Renters Insurance': 'building', 'Motorcycle Insurance': 'bike', 'Pet Insurance': 'paw', 'Life Insurance': 'heart' };
  var LG = { Allstate: { full: 1, icon: 1 }, 'State Farm': { full: 1, icon: 1 }, Travelers: { full: 1, icon: 1 }, Lemonade: { full: 1, icon: 1, bleed: 1 }, GEICO: { full: 1, icon: 1 }, Progressive: { full: 1, icon: 1 }, Nationwide: { full: 1, icon: 1, bleed: 1, h: 34 }, Trupanion: { full: 1, icon: 1 }, 'Healthy Paws': { full: 1, icon: 1 } };
  var logo = function (c, h) { var l = LG[c]; return l && l.full ? '<img src="/lendingtree/img/carriers/' + c.toLowerCase().replace(/ /g, '-') + '-full.png" alt="' + c + '" style="max-height:' + h + 'px;max-width:150px;width:auto;height:auto">' : null; };
  var chip = function (c, h) { var l = logo(c, (LG[c] && LG[c].h) || h); return l ? '<span class="lchip">' + l + '</span>' : '<span class="cn">' + c + '</span>'; };
  var S;
  function fresh() {
    S = { tab: 'home', sub: 'cards', screen: 'home', open: null, card: 0, nfilter: 'All', read: {}, dismissed: {}, remind: {}, started: [], nextId: 10, newId: null,
      policies: [
        { id: 'a', carrier: 'Allstate', type: 'Auto Insurance', price: 128, number: '123 456 789', renewIn: 41, detail: true },
        { id: 'h', carrier: 'State Farm', type: 'Home Insurance', price: 118, number: '884 201 337', renewIn: 82 },
        { id: 'u', carrier: 'Travelers', type: 'Umbrella Insurance', price: 34, number: '552 910 004', renewIn: 82 },
        { id: 'r', carrier: 'Lemonade', type: 'Renters Insurance', price: 18, number: '310 774 902', renewIn: 140 }
      ] };
    S.policies.forEach(function (p) { S.remind[p.id] = true; });
  }
  fresh();
  var dateStr = function (d) { var t = new Date(Date.now() + d * DAY), y = t.getFullYear() !== new Date().getFullYear(); return t.toLocaleDateString('en-US', y ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' }); };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var get = function (id) { return S.policies.filter(function (p) { return p.id === id; })[0]; };
  var short = function (p) { return p.type.replace(' Insurance', ''); };
  var low = function (p) { return short(p).toLowerCase(); };
  var best = function (p) { return Math.round(p.price * QUOTERS[0][1]); };
  var yearly = function (p) { return (p.price - best(p)) * 12; };
  var mark = function (c, lg) { var l = LG[c]; if (l && l.icon) return '<span class="cm img' + (l.bleed ? ' bleed' : '') + (lg ? ' lg' : '') + '"><img src="/lendingtree/img/carriers/' + c.toLowerCase().replace(/ /g, '-') + '-icon.png" alt="' + c + '"></span>'; return '<span class="cm' + (lg ? ' lg' : '') + '" style="background:' + (CARRIERS[c] || CARRIERS.Other) + '" aria-hidden="true">' + c.charAt(0) + '</span>'; };
  var ibox = function (t) { return '<span class="ib">' + ic(ICON[t] || 'file', 22) + '</span>'; };
  var iconOf = function (p) { return ICON[p.type] || 'file'; };
  function say(m) { toast.textContent = m; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 2600); }

  // ---- notifications (derived from policies)
  function notes() {
    var out = [];
    S.policies.forEach(function (p) {
      if (p.renewIn <= 45 && !S.dismissed['r' + p.id]) out.push({ id: 'r' + p.id, kind: 'Renewals', icon: 'clock', tone: 'red', title: short(p) + ' policy renews in ' + p.renewIn + ' days', body: 'Your ' + p.carrier + ' ' + low(p) + ' insurance renews on ' + dateStr(p.renewIn) + '. Compare quotes to see if you can get a better rate.', cta: 'See alternative quotes', pid: p.id, when: 'Today' });
    });
    S.policies.forEach(function (p) {
      var y = yearly(p);
      if (y >= 100 && !S.dismissed['s' + p.id]) out.push({ id: 's' + p.id, kind: 'Savings', icon: 'coin', tone: 'green', title: 'You could save about ' + money(y) + ' a year', body: 'We found lower rates for similar coverage on your ' + low(p) + ' policy.', cta: 'View quotes', pid: p.id, when: 'Today' });
    });
    S.started.forEach(function (q, i) { if (!S.dismissed['q' + i]) out.push({ id: 'q' + i, kind: 'Updates', icon: 'check', tone: '', title: 'Quote started', body: 'Your ' + q.type.toLowerCase() + ' quote with ' + q.carrier + ' is in progress. We sent your details along.', when: 'Today' }); });
    S.policies.forEach(function (p) { if (p.added && !S.dismissed['u' + p.id]) out.push({ id: 'u' + p.id, kind: 'Updates', icon: 'info', tone: '', title: 'Policy added', body: p.carrier + ' ' + p.type.toLowerCase() + ' is now in your app. We will watch its renewal date for you.', when: 'Today' }); });
    out.push({ id: 'd1', kind: 'Updates', icon: 'file', tone: '', title: 'New document available', body: 'Your homeowners insurance renewal notice is now available.', when: 'Earlier this month' });
    out.push({ id: 'd2', kind: 'Updates', icon: 'info', tone: '', title: 'Policy updated', body: 'Your renters policy has been updated with your new address.', when: 'Last month' });
    return out;
  }
  var unread = function () { return notes().filter(function (n) { return n.kind !== 'Updates' && !S.read[n.id]; }).length; };

  // ---- views
  function topbar(noBell) { var u = unread(); return '<div class="top"><div class="logo">' + LOGO + '</div>' + (noBell ? '' : '<button class="ico" data-act="tab" data-t="notes" aria-label="Notifications' + (u ? ', ' + u + ' unread' : '') + '">' + ic('bell', 20) + (u ? '<span class="bd">' + u + '</span>' : '') + '</button>') + '</div>'; }
  function tabs() {
    var items = [['home', 'shield', 'Insurance'], ['savings', 'coin', 'Savings'], ['explore', 'compass', 'Explore'], ['notes', 'bell', 'Alerts']], u = unread();
    tabbar.hidden = S.screen === 'detail';
    tabbar.innerHTML = items.map(function (i) { var on = S.tab === i[0]; return '<button data-act="tab" data-t="' + i[0] + '" class="' + (on ? 'on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' + ic(i[1], 24, on ? 2.1 : 1.8) + i[2] + (i[0] === 'notes' && u ? '<i class="bd">' + u + '</i>' : '') + '</button>'; }).join('');
  }
  function polRow(p) {
    var d = p.renewIn;
    return '<button class="prow' + (p.id === S.newId ? ' fresh' : '') + '" data-act="open" data-id="' + p.id + '">' + mark(p.carrier) + '<span class="mid"><b>' + p.type + '</b><span style="color:' + CARRIERS[p.carrier] + '">' + p.carrier + '</span></span><span class="end"><b>' + money(p.price) + ' <small>/ month</small></b><span class="' + (d <= 45 ? 'soon' : '') + '">Renews ' + dateStr(d) + '</span></span><span class="chev">' + ic('right', 18) + '</span></button>';
  }
  function pcard(p) {
    var c = CARRIERS[p.carrier];
    return '<div class="pcard" style="background:linear-gradient(135deg,' + c + ',#0a1f4d)"><div class="hd">' + chip(p.carrier, 22) + '<span class="ty">' + p.type + '<span>Active</span></span></div>' +
      '<div class="meta"><div>Policy number<b>' + p.number + '</b></div><div>Renews in<b>' + p.renewIn + ' days</b></div></div>' +
      '<div class="acts"><button class="a1" data-act="idcard" data-id="' + p.id + '">' + ic('card', 18) + 'View card</button><button class="a2" data-act="open" data-id="' + p.id + '">Details' + ic('right', 16) + '</button></div></div>';
  }
  function home() {
    var soon = S.policies.filter(function (p) { return p.renewIn <= 45; }).sort(function (a, b) { return a.renewIn - b.renewIn; })[0];
    var ban = soon ? '<button class="ban red" data-act="quotes" data-id="' + soon.id + '"><span class="bi">' + ic('clock', 20) + '</span><span class="bt"><b>' + short(soon) + ' renews in ' + soon.renewIn + ' days</b><span>Compare quotes before ' + dateStr(soon.renewIn) + '.</span></span><span class="chev">' + ic('right', 18) + '</span></button>' : '';
    var body = S.sub === 'cards'
      ? '<div class="rail" id="rail">' + S.policies.map(pcard).join('') + '</div><div class="dots">' + S.policies.map(function (p, i) { return '<i data-dot="' + i + '"' + (i === S.card ? ' class="on"' : '') + '></i>'; }).join('') + '</div>' + S.policies.map(polRow).join('')
      : S.policies.map(polRow).join('');
    var top = S.policies.slice().sort(function (a, b) { return yearly(b) - yearly(a); })[0];
    return topbar() + '<h3>Your insurance</h3><p class="sub">Your cards, coverage and renewals in one place.</p>' +
      '<div class="seg" role="tablist">' + [['cards', 'Cards'], ['list', 'Policies']].map(function (s) { return '<button role="tab" data-act="seg" data-s="' + s[0] + '" class="' + (S.sub === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>' + ban + body +
      '<button class="ban green" data-act="quotes" data-id="' + top.id + '"><span class="bi">' + ic('search', 20) + '</span><span class="bt"><b>Find better rates</b><span>Check if you could save on any of your policies.</span></span><span class="chev">' + ic('right', 18) + '</span></button>' +
      '<button class="btn ghost full" data-act="add">' + ic('plus', 18, 2.2) + 'Add a policy</button>';
  }
  function detail(p) {
    var d = p.renewIn;
    return '<div class="top"><button class="back" data-act="back">' + ic('left', 22, 2.2) + 'Back</button><button class="ico" data-act="tab" data-t="notes" aria-label="Notifications">' + ic('bell', 20) + '</button></div>' +
      '<div class="dhead">' + mark(p.carrier, 1) + '<div class="t"><b>' + p.carrier + '</b><span>' + p.type + '</span></div><span class="pill">Active</span></div>' +
      '<div class="facts"><div>Policy number<b>' + p.number + '</b></div><div>Price<b>' + money(p.price) + '/mo</b></div><div>Renews in<b>' + d + ' days</b>' + dateStr(d) + '</div></div>' +
      (d <= 60 ? '<button class="ban red" data-act="quotes" data-id="' + p.id + '"><span class="bi">' + ic('clock', 20) + '</span><span class="bt"><b>Renewal coming up</b><span>Compare quotes to see if you can get a better rate.</span></span><span class="chev">' + ic('right', 18) + '</span></button>' : '') +
      '<div class="btnrow"><button class="btn" data-act="idcard" data-id="' + p.id + '">View insurance card</button><button class="btn ghost" data-act="benefits" data-id="' + p.id + '">View benefits</button></div>' +
      '<h4 style="margin-top:20px">Coverage</h4>' + COVER.slice(0, p.detail ? 5 : 3).map(function (c) { return '<div class="cov"><span>' + ic(c[0], 20) + c[1] + '</span><b>' + c[2] + '</b></div>'; }).join('') +
      '<label class="rem">Remind me 45 days before renewal<span class="sw"><input type="checkbox" data-act="remind" data-id="' + p.id + '"' + (S.remind[p.id] ? ' checked' : '') + '><i></i></span></label>' +
      '<h4>Documents</h4>' + ['Insurance card', 'Policy document', 'Declarations page'].map(function (n) { return '<button class="doc" data-act="doc" data-n="' + n + '" data-id="' + p.id + '">' + ic('file', 20) + '<span>' + n + '</span><span class="chev" style="flex:none">' + ic('right', 18) + '</span></button>'; }).join('');
  }
  function notesView() {
    var all = notes(), f = S.nfilter;
    var cnt = function (k) { return all.filter(function (n) { return n.kind === k && !S.read[n.id]; }).length; };
    var chips = ['All', 'Renewals', 'Savings', 'Updates'].map(function (k) { var c = k === 'All' ? 0 : cnt(k); return '<button data-act="nf" data-k="' + k + '" class="' + (f === k ? 'on' : '') + '">' + k + (c ? '<i>' + c + '</i>' : '') + '</button>'; }).join('');
    var list = all.filter(function (n) { return f === 'All' || n.kind === f; }), last = '';
    return topbar(1) + '<h3>Alerts</h3><p class="sub">Renewals, savings and updates for your policies.</p><div class="chips2">' + chips + '</div>' +
      (list.length ? list.map(function (n) {
        var hd = n.when !== last ? '<h4 class="grp">' + n.when + '</h4>' : ''; last = n.when;
        var unr = n.kind !== 'Updates' && !S.read[n.id];
        return hd + '<div class="nrow ' + (n.tone || '') + '"><span class="ni">' + ic(n.icon, 19) + '</span><div class="nb"><b>' + (unr ? '<i></i>' : '') + n.title + '</b><p>' + n.body + '</p>' + (n.cta ? '<button class="nc" data-act="ncta" data-id="' + n.id + '" data-pid="' + n.pid + '">' + n.cta + ic('right', 16, 2.2) + '</button>' : '') + '</div><button class="nx" data-act="dismiss" data-id="' + n.id + '" aria-label="Dismiss">' + ic('x', 16, 2) + '</button></div>';
      }).join('') : '<p class="sub" style="margin-top:20px">You are all caught up.</p>');
  }
  function savingsView() {
    var ps = S.policies.filter(function (p) { return yearly(p) > 0; }), tot = ps.reduce(function (a, p) { return a + yearly(p); }, 0);
    return topbar() + '<h3>Savings</h3><p class="sub">What the best quotes we found could save you.</p><div class="whero"><span>Potential yearly savings</span><b>' + money(tot) + '</b></div>' +
      ps.map(function (p) { return '<div class="srow">' + ibox(p.type) + '<div class="mid"><b>' + p.type + '</b><small>' + p.carrier + ' ' + money(p.price) + ' to ' + QUOTERS[0][0] + ' ' + money(best(p)) + ' a month</small></div><button class="btn" data-act="quotes" data-id="' + p.id + '">Save ' + money(yearly(p)) + '</button></div>'; }).join('');
  }
  function exploreView() {
    var have = {}; S.policies.forEach(function (p) { have[p.type] = 1; });
    var rows = EXPLORE.filter(function (x) { return !have[x.type]; });
    return topbar() + '<h3>Explore</h3><p class="sub">Coverage you do not have yet, with quotes from carriers we compare.</p>' +
      (rows.length ? rows.map(function (x, i) { return '<div class="xrow">' + ibox(x.type) + '<div class="mid"><b>' + x.type + '</b><small>' + x.sub + ' · from ' + money(x.from[0][1]) + '/mo</small></div><button class="btn ghost" data-act="xquote" data-i="' + EXPLORE.indexOf(x) + '">Get quotes</button></div>'; }).join('') : '<p class="sub" style="margin-top:20px">You are covered everywhere we look.</p>');
  }
  function render() {
    var keep = app.scrollTop, h;
    if (S.screen === 'detail') h = detail(get(S.open));
    else if (S.tab === 'notes') h = notesView();
    else if (S.tab === 'savings') h = savingsView();
    else if (S.tab === 'explore') h = exploreView();
    else h = home();
    app.innerHTML = h; tabs(); app.scrollTop = keep;
    var rail = $('#rail');
    if (rail) {
      var step = function () { var c = rail.firstElementChild; return c ? c.offsetWidth + 10 : 1; };
      rail.scrollLeft = S.card * step();
      rail.addEventListener('scroll', function () { var i = Math.max(0, Math.min(S.policies.length - 1, Math.round(rail.scrollLeft / step()))); if (i !== S.card) { S.card = i; [].forEach.call(document.querySelectorAll('[data-dot]'), function (d) { d.className = +d.getAttribute('data-dot') === i ? 'on' : ''; }); } });
    }
  }
  var X = '<button class="sx" data-act="closesheet" aria-label="Close">' + ic('x', 18, 2.2) + '</button>';
  function openSheet(h) { sheet.innerHTML = '<div class="grab"></div>' + X + h; sheet.hidden = false; scrim.hidden = false; sheet.scrollTop = 0; }
  function closeSheet() { sheet.hidden = true; scrim.hidden = true; }
  function quoteSheet(o) {
    S.q = o;
    openSheet('<h3 style="font-size:22px">Compare quotes</h3><p class="sub">' + o.sub + '</p><div style="height:4px"></div>' +
      o.rows.map(function (r, i) { return '<div class="qrow' + (i === 0 ? ' best' : '') + '">' + mark(r.carrier) + '<div class="mid"><b>' + r.carrier + '</b>' + (i === 0 ? '<span class="tg">Best price</span>' : '') + '<small>' + money(r.price) + '/month</small>' + (r.save > 0 ? '<small style="color:#0a7a46;font-weight:600">Saves ' + money(r.save) + '/year</small>' : '') + '</div><button class="btn' + (i ? ' ghost' : '') + '" data-act="getquote" data-i="' + i + '">Get quote</button></div>'; }).join(''));
  }
  function quotesFor(id) {
    var p = get(id);
    quoteSheet({ type: p.type, sub: p.type + ' · now ' + money(p.price) + '/month with ' + p.carrier + '. Your policy details are pre-filled.', rows: QUOTERS.map(function (q) { var pr = Math.round(p.price * q[1]); return { carrier: q[0], price: pr, save: (p.price - pr) * 12 }; }) });
  }
  function addSheet() {
    var pq = [['b', 'Progressive', 'Motorcycle Insurance', 46, 230], ['t', 'Trupanion', 'Pet Insurance', 62, 300]].filter(function (x) { return !get(x[0]); });
    openSheet('<h3 style="font-size:22px">Add a policy</h3><p class="sub">Three ways. Pick the easiest.</p>' +
      (pq.length ? '<h4>From your past quotes</h4>' + pq.map(function (x) { return '<div class="qrow">' + mark(x[1]) + '<div class="mid"><b>' + x[2] + '</b><small>' + x[1] + ' · ' + money(x[3]) + '/mo · quoted in August</small></div><button class="btn" data-act="addq" data-x="' + x.join('|') + '">Add</button></div>'; }).join('') : '') +
      '<h4>Forward your policy email</h4><p class="sub" style="margin:0">Send any renewal or policy email to this address and we read the dates and prices.</p><div class="addr"><span>add@mail.lendingtree.example</span><button class="link" data-act="copyaddr" aria-label="Copy address" style="display:grid;place-items:center;padding:6px">' + ic('copy', 18) + '</button></div><button class="btn ghost full" data-act="fwd">' + ic('mail', 18) + 'I forwarded an email</button>' +
      '<h4>Upload a document</h4><label class="btn ghost full" style="cursor:pointer">' + ic('upload', 18) + 'Choose a PDF or photo<input type="file" id="upl" accept="application/pdf,image/*" hidden></label>');
    var u = $('#upl'); if (u) u.addEventListener('change', function () { if (u.files[0]) addPolicy({ carrier: 'Other', type: 'Uploaded policy', price: 55, renewIn: 150 }); });
  }
  function addPolicy(p) {
    var id = 'n' + (S.nextId++), g = function () { return String(100 + Math.floor(Math.random() * 899)); };
    p.id = id; p.number = g() + ' ' + g() + ' ' + g(); p.added = true; S.remind[id] = true; S.policies.push(p); S.newId = id;
    closeSheet(); S.tab = 'home'; S.sub = 'list'; S.screen = 'home'; render(); app.scrollTop = 0; say(p.carrier + ' ' + low(p) + ' added. We will watch its renewal date.');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act'), id = el.getAttribute('data-id');
    if (a === 'idcard') {
      var p = get(id), c = CARRIERS[p.carrier];
      openSheet('<h3 style="font-size:22px">Insurance card</h3><div class="idc" style="background:linear-gradient(135deg,' + c + ',#0a1f4d)">' + chip(p.carrier, 26) + '<div class="ty">' + p.type + '</div><dl><div>Insured<dd>Alex Sample</dd></div><div>Policy number<dd>' + p.number + '</dd></div><div>Valid through<dd>' + dateStr(p.renewIn) + '</dd></div>' + (p.type === 'Auto Insurance' ? '<div>Vehicle<dd>2022 Subaru Outback</dd></div>' : '<div>Status<dd>Active</dd></div>') + '</dl></div><button class="btn full" data-act="towallet">Add to wallet</button>');
    }
    else if (a === 'towallet') { closeSheet(); say('Card added to your wallet.'); }
    else if (a === 'benefits') { var bp = get(id); openSheet('<h3 style="font-size:22px">Benefits</h3><p class="sub">Included with your ' + bp.carrier + ' ' + low(bp) + ' policy.</p><div style="height:6px"></div>' + BENEFITS.map(function (b) { return '<div class="ben">' + ic('check', 20, 2.2) + '<div><b>' + b[0] + '</b><small>' + b[1] + '</small></div></div>'; }).join('')); }
    else if (a === 'doc') { var dp = get(id), n = el.getAttribute('data-n'); openSheet('<h3 style="font-size:22px">' + n + '</h3><p class="sub">' + dp.carrier + ' · ' + dp.type + '</p><div class="page"><div class="skl" style="width:55%"></div><div class="skl"></div><div class="skl"></div><div class="skl" style="width:80%"></div><div class="skl" style="width:40%;margin-top:22px"></div><div class="skl"></div><div class="skl" style="width:65%"></div></div><button class="btn full" data-act="savedoc">Save to Files</button>'); }
    else if (a === 'savedoc') { closeSheet(); say('Saved to Files.'); }
    else if (a === 'open') { S.screen = 'detail'; S.open = id; render(); app.scrollTop = 0; }
    else if (a === 'back') { S.screen = 'home'; render(); app.scrollTop = 0; }
    else if (a === 'tab') { S.tab = el.getAttribute('data-t'); S.screen = 'home'; render(); app.scrollTop = 0; }
    else if (a === 'seg') { S.sub = el.getAttribute('data-s'); render(); }
    else if (a === 'nf') { S.nfilter = el.getAttribute('data-k'); render(); }
    else if (a === 'ncta') { S.read[id] = 1; render(); quotesFor(el.getAttribute('data-pid')); }
    else if (a === 'dismiss') { S.dismissed[id] = 1; render(); }
    else if (a === 'quotes') { quotesFor(id); }
    else if (a === 'xquote') { var x = EXPLORE[+el.getAttribute('data-i')]; quoteSheet({ type: x.type, sub: x.type + '. We use what you have told us so you do not start from scratch.', rows: x.from.map(function (f) { return { carrier: f[0], price: f[1], save: 0 }; }) }); }
    else if (a === 'getquote') {
      var r = S.q.rows[+el.getAttribute('data-i')]; S.started.push({ type: S.q.type, carrier: r.carrier });
      sheet.innerHTML = '<div class="grab"></div>' + X + '<div class="okc">' + ic('check', 32, 2.4) + '</div><h3 style="font-size:22px">Quote started with ' + r.carrier + '</h3><p class="sub">Your details came with you, so there is nothing to re-enter. ' + r.carrier + ' will send the quote to your email.</p><button class="btn full" style="margin-top:18px" data-act="closesheet">Done</button>'; sheet.scrollTop = 0; render();
    }
    else if (a === 'add') { addSheet(); }
    else if (a === 'copyaddr') { try { navigator.clipboard.writeText('add@mail.lendingtree.example'); } catch (er) { } say('Address copied.'); }
    else if (a === 'addq') { var q = el.getAttribute('data-x').split('|'); addPolicy({ carrier: q[1], type: q[2], price: +q[3], renewIn: +q[4] }); }
    else if (a === 'fwd') { addPolicy({ carrier: 'Nationwide', type: 'Life Insurance', price: 41, renewIn: 320 }); }
    else if (a === 'closesheet') { closeSheet(); if (S.tab === 'notes') render(); }
  });
  document.addEventListener('change', function (e) { var el = e.target; if (el.matches && el.matches('[data-act="remind"]')) S.remind[el.getAttribute('data-id')] = el.checked; });
  scrim.addEventListener('click', closeSheet);
  render();
})();
