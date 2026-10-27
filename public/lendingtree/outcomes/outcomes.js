// Prototype: outcomes API and partner dashboard. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var docs = $('#docs'), dash = $('#dash');
  var LINES = {
    Lending: {
      id: 'lending', noun: 'a lending', api: 'Lending API', path: '/v1/lending/customer-status', event: 'lending.status_updated', cost: 20,
      statuses: [['contacted', 'Customer was contacted'], ['applied', 'Customer submitted an application'], ['approved', 'Customer was approved'], ['funded', 'Loan was funded'], ['declined', 'Customer was declined'], ['withdrawn', 'Customer withdrew an application']],
      amt: 'loan_amount', amtOn: ['approved', 'funded'], amtDef: '26500', defStatus: 'approved', win: 'funded',
      reasons: ['', 'income_too_low', 'credit_score', 'incomplete_docs', 'customer_withdrew', 'found_other_lender'],
      stages: [['Applied', ['applied', 'approved', 'funded', 'declined']], ['Approved', ['approved', 'funded']], ['Funded', ['funded']]],
      mix: [[.22, 'funded'], [.42, 'approved'], [.62, 'applied'], [.78, 'declined'], [.86, 'withdrawn'], [1, 'contacted']],
      why: { declined: 'credit_score', withdrawn: 'customer_withdrew' },
      kpiRate: 'Funded rate per lead', kpiCost: 'Cost per funded loan', colWin: 'Funded', colRate: 'Funded rate', colCost: 'Cost / funded', funTitle: 'from delivery to funded loan',
      amtNote: 'loan_amount (required if approved or funded)', unit: 'loan', seg: 'Lending partners'
    },
    Insurance: {
      id: 'insurance', noun: 'an insurance', api: 'Insurance API', path: '/v1/insurance/customer-status', event: 'insurance.status_updated', cost: 14,
      statuses: [['contacted', 'Customer was contacted'], ['quoted', 'Customer received a quote'], ['applied', 'Customer submitted an application'], ['bound', 'Policy was bound (purchased)'], ['declined', 'Carrier declined to write the policy'], ['lost', 'Customer did not buy']],
      amt: 'annual_premium', amtOn: ['quoted', 'bound'], amtDef: '1840', defStatus: 'quoted', win: 'bound',
      reasons: ['', 'price_too_high', 'coverage_not_available', 'underwriting_ineligible', 'found_other_carrier', 'customer_unresponsive'],
      stages: [['Quoted', ['quoted', 'applied', 'bound', 'declined']], ['Applied', ['applied', 'bound', 'declined']], ['Bound', ['bound']]],
      mix: [[.22, 'bound'], [.4, 'applied'], [.66, 'quoted'], [.78, 'declined'], [.88, 'lost'], [1, 'contacted']],
      why: { declined: 'underwriting_ineligible', lost: 'price_too_high' },
      kpiRate: 'Bind rate per lead', kpiCost: 'Cost per bound policy', colWin: 'Bound', colRate: 'Bind rate', colCost: 'Cost / bound', funTitle: 'from delivery to bound policy',
      amtNote: 'annual_premium (required if quoted or bound)', unit: 'policy', seg: 'Insurance partners'
    }
  };
  // id, name, line, delivered, reporting coverage, win rate, products
  var LP = ['personal_loan', 'home_equity', 'auto_loan'], AU = 'auto_insurance', HO = 'home_insurance', RE = 'renters_insurance', PE = 'pet_insurance', UM = 'umbrella_insurance';
  var DEFS = [
    ['ridgeview', 'Ridgeview Financial', 'Lending', 248, 0.91, 0.21, LP], ['maple', 'Maple Bank', 'Lending', 187, 0.84, 0.18, LP], ['summit', 'Summit Lending', 'Lending', 156, 0.78, 0.17, LP],
    ['harbor', 'Harbor Credit', 'Lending', 143, 0.62, 0.17, LP], ['cedar', 'Cedar Capital', 'Lending', 128, 0.55, 0.16, LP], ['northgate', 'Northgate Bank', 'Lending', 98, 0.38, 0.15, LP], ['pinecrest', 'Pinecrest Lending', 'Lending', 72, 0.22, 0.14, LP],
    ['progressive', 'Progressive', 'Insurance', 230, 0.91, 0.26, [AU, HO, RE]], ['geico', 'GEICO', 'Insurance', 205, 0.84, 0.24, [AU, HO, RE]], ['state-farm', 'State Farm', 'Insurance', 190, 0.76, 0.23, [AU, HO, RE, UM]],
    ['allstate', 'Allstate', 'Insurance', 170, 0.66, 0.21, [AU, HO, RE, UM]], ['nationwide', 'Nationwide', 'Insurance', 140, 0.52, 0.2, [AU, HO, PE, UM]], ['travelers', 'Travelers', 'Insurance', 115, 0.44, 0.19, [AU, HO, UM]],
    ['lemonade', 'Lemonade', 'Insurance', 95, 0.36, 0.18, [RE, HO, PE, AU]], ['trupanion', 'Trupanion', 'Insurance', 80, 0.58, 0.22, [PE]], ['healthy-paws', 'Healthy Paws', 'Insurance', 70, 0.3, 0.2, [PE]]
  ];
  var LOGOS = { ridgeview: 'lender-ridgeview.png', maple: 'lender-maple.png', summit: 'lender-summit.png' }, TINTS = ['#2e6db4', '#1f7a5c', '#8a5a1f', '#6a4c93', '#b3463c', '#3a4350', '#0e7490'];
  function pmark(p) { var src = LOGOS[p.id] ? 'lender-' + p.id + '.png' : p.type === 'Insurance' ? 'carriers/' + p.id + '-icon.png' : null; return src ? '<span class="pm"><img src="/lendingtree/img/' + src + '" alt=""></span>' : '<span class="pm" style="background:' + TINTS[DEFS.map(function (d) { return d[0]; }).indexOf(p.id) % TINTS.length] + ';color:#fff" aria-hidden="true">' + p.name.charAt(0) + '</span>'; }
  var LN = function (type) { return LINES[type]; };
  var P, L, S, key = 'lt_test_sample', t0, base;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pct = function (n, d) { return (n * 100).toFixed(d == null ? 1 : d) + '%'; };
  var now = function () { return new Date().toISOString().replace(/\.\d+Z$/, 'Z'); };
  var clock = function () { var s = Math.round((Date.now() - t0) / 1000); return (s < 10 ? '0' : '') + s + 's'; };
  function log() {}

  function fresh() {
    t0 = Date.now(); P = []; L = {}; S = { tab: 'docs', sec: 'single', code: 'req', as: 'northgate', sel: 'northgate', sort: 'delivered', dir: -1, seg: 'Lending', form: {}, resp: null, csv: '', csvResp: null, read: null, hooks: [] };
    DEFS.forEach(function (d, pi) {
      var ln = LN(d[2]), r = rng(pi * 977 + 13), p = { id: d[0], name: d[1], type: d[2], delivered: d[3], leads: [], fr: d[5], products: d[6] };
      for (var i = 0; i < d[3]; i++) {
        var lead = { id: 'LT-' + (100000 + pi * 10000 + i), p: p.id, status: null, at: null, amt: null, pol: null, hist: [] };
        if (r() < d[4]) {
          var x = r(), f = d[5] / d[4], st = ln.mix.map(function (m) { return m[1]; });
          lead.status = d[2] === 'Lending'
            ? (x < f ? 'funded' : x < f + 0.12 ? 'approved' : x < f + 0.3 ? 'applied' : x < f + 0.4 ? 'declined' : x < f + 0.45 ? 'withdrawn' : 'contacted')
            : (x < f ? 'bound' : x < f + 0.12 ? 'applied' : x < f + 0.3 ? 'quoted' : x < f + 0.4 ? 'declined' : x < f + 0.45 ? 'lost' : 'contacted');
          if (ln.amtOn.indexOf(lead.status) >= 0 || (d[2] === 'Insurance' && lead.status === 'applied')) lead.amt = d[2] === 'Lending' ? Math.round((20 + r() * 12) * 1000 / 100) * 100 : 900 + Math.round(r() * 36) * 50;
          if (lead.status === 'bound') lead.pol = 'POL-' + lead.id.slice(3);
          lead.at = new Date(Date.now() - r() * 12 * 86400000).toISOString().replace(/\.\d+Z$/, 'Z'); lead.hist = [[lead.at, lead.status]];
        }
        p.leads.push(lead); L[lead.id] = lead;
      }
      P.push(p);
    });
    base = { bySeg: {} }; ['Lending', 'Insurance'].forEach(function (g) { base.bySeg[g] = stats(P.filter(function (p) { return p.type === g; })); });
  }
  var pstat = function (p) {
    var ln = LN(p.type), rep = 0, c = [0, 0, 0];
    p.leads.forEach(function (l) { if (l.status) { rep++; ln.stages.forEach(function (s, i) { if (s[1].indexOf(l.status) >= 0) c[i]++; }); } });
    var w = c[2];
    return { n: p.leads.length, rep: rep, c: c, win: w, cov: rep / p.leads.length, rate: w / p.leads.length, cpf: w ? ln.cost * p.leads.length / w : Infinity };
  };
  function stats(ps) { var n = 0, rep = 0, w = 0, ln = LN(ps[0].type); ps.forEach(function (p) { var s = pstat(p); n += s.n; rep += s.rep; w += s.win; }); return { n: n, rep: rep, win: w, cov: rep / n, rate: w / n, cpf: w ? ln.cost * n / w : Infinity }; }
  var byId = function (id) { return P.filter(function (p) { return p.id === id; })[0]; };
  var cur = function () { return LN(byId(S.as).type); };
  var tier = function (c) { return c >= 0.8 ? ['Priority', 't-p'] : c >= 0.4 ? ['Standard', 't-s'] : ['At risk', 't-r']; };
  var cols = function (ln) { return ln.id === 'lending' ? ['customer_id', 'status', 'timestamp', 'loan_amount', 'product', 'reason_code'] : ['customer_id', 'status', 'timestamp', 'annual_premium', 'policy_number', 'product', 'reason_code']; };

  // ---- request validation + apply
  function validate(b, partner) {
    var errs = [], p = byId(partner), ln = LN(p.type), l = b.customer_id ? L[b.customer_id] : null, names = ln.statuses.map(function (s) { return s[0]; });
    if (!b.customer_id) errs.push({ field: 'customer_id', message: 'is required' });
    else if (!l || l.p !== partner) return { code: 404, body: { error: 'customer_not_found', message: 'No lead ' + b.customer_id + ' was delivered to this partner.' } };
    if (names.indexOf(b.status) < 0) errs.push({ field: 'status', message: 'must be one of ' + names.join(', ') });
    if (!b.timestamp || isNaN(Date.parse(b.timestamp))) errs.push({ field: 'timestamp', message: 'must be an ISO 8601 date-time' });
    if (ln.amtOn.indexOf(b.status) >= 0 && !(+b[ln.amt] > 0)) errs.push({ field: ln.amt, message: 'is required when status is ' + ln.amtOn.join(' or ') });
    if (ln.id === 'insurance' && b.status === 'bound' && !b.policy_number) errs.push({ field: 'policy_number', message: 'is required when status is bound' });
    if (b.product && p.products.indexOf(b.product) < 0) errs.push({ field: 'product', message: 'is not offered by this partner' });
    if (b.reason_code && ln.reasons.indexOf(b.reason_code) < 0) errs.push({ field: 'reason_code', message: 'is not a recognized code' });
    return errs.length ? { code: 422, body: { error: 'validation_failed', errors: errs } } : null;
  }
  function apply(b, notify) {
    var ln = LN(byId(S.as).type), l = L[b.customer_id], prev = l.status; l.status = b.status; l.at = b.timestamp; if (+b[ln.amt] > 0) l.amt = +b[ln.amt]; if (b.policy_number) l.pol = b.policy_number; l.hist.push([b.timestamp, b.status]);
    if (notify) S.hooks.push({ t: clock(), ev: 'lead.status_updated', id: l.id, status: l.status });
    return prev;
  }
  var unreported = function (pid, n) { return byId(pid).leads.filter(function (l) { return !l.status; }).slice(0, n || 1); };

  // ---- code samples
  function sample(f) {
    var ln = cur(), o = { customer_id: f.customer_id || 'LT-100001', status: f.status || ln.defStatus, timestamp: f.timestamp || now() };
    if (f.amount !== '' && f.amount != null && (ln.amtOn.indexOf(o.status) >= 0 || f.amount)) o[ln.amt] = +f.amount || 0;
    if (ln.id === 'insurance' && (o.status === 'bound' || f.policy_number)) o.policy_number = f.policy_number || '';
    if (f.product) o.product = f.product;
    o.reason_code = f.reason_code || null;
    return o;
  }
  var pretty = function (o) { return JSON.stringify(o, null, 2); };
  var hl = function (s) { return esc(s).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2').replace(/: (&quot;[^&]*?&quot;)/g, ': <span class="s">$1</span>').replace(/: (-?\d+(\.\d+)?|null|true|false)/g, ': <span class="n">$1</span>'); };
  function codeFor(kind, o) {
    var ln = cur(), j = pretty(o), url = 'https://api.lendingtree.example' + ln.path;
    if (kind === 'req') return 'POST ' + ln.path + '\nAuthorization: Bearer ' + key + '\nContent-Type: application/json\n\n' + j;
    if (kind === 'curl') return "curl -X POST " + url + " \\\n  -H \"Authorization: Bearer " + key + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '" + JSON.stringify(o) + "'";
    if (kind === 'py') return 'import requests\n\nr = requests.post(\n    "' + url + '",\n    headers={"Authorization": "Bearer ' + key + '"},\n    json=' + JSON.stringify(o).replace(/null/g, 'None').replace(/true/g, 'True') + ',\n)\nprint(r.status_code, r.json())';
    return 'const r = await fetch("' + url + '", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer ' + key + '",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(' + JSON.stringify(o) + '),\n});\nconsole.log(r.status, await r.json());';
  }

  // ---- docs view
  function F() {
    var f = S.form, p = byId(S.as), ln = LN(p.type);
    if (!f.customer_id) { var u = unreported(S.as)[0]; f.customer_id = u ? u.id : ''; f.status = f.status || ln.defStatus; f.timestamp = f.timestamp || now(); f.amount = f.amount == null ? ln.amtDef : f.amount; f.product = f.product || p.products[0]; f.reason_code = f.reason_code || ''; f.policy_number = f.policy_number || ''; f.notify = f.notify == null ? true : f.notify; }
    return f;
  }
  function docsView() {
    var p = byId(S.as), ln = LN(p.type), f = F();
    var secs = [['single', 'Single update'], ['batch', 'Batch update (CSV)'], ['read', 'Read a status'], ['hooks', 'Webhooks']], P_ = ln.path;
    var h = '<div class="hd"><h3>Update Customer Status</h3><span class="api">' + ln.api + '</span></div><p class="sub">Report the latest status for customers referred by LendingTree. Partners that report on 80% or more of their leads earn priority placement and better pricing. ' + (ln.id === 'lending' ? 'Insurance partners use the Insurance API: the same authentication, batch format and webhooks, with insurance statuses and fields.' : 'Lenders use the Lending API: the same authentication, batch format and webhooks, with lending statuses and fields.') + '</p><div class="sec">' + secs.map(function (x) { return '<button data-act="sec" data-s="' + x[0] + '" class="' + (S.sec === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (S.sec === 'single') {
      var o = sample(f), opts = unreported(S.as, 6).map(function (l) { return l.id; }), ins = ln.id === 'insurance';
      h += '<div class="cols"><div class="box"><b>POST</b> <code>' + P_ + '</code><div style="height:12px"></div>' +
        '<label class="f">customer_id<select data-f="customer_id">' + opts.map(function (i) { return '<option' + (i === f.customer_id ? ' selected' : '') + '>' + i + '</option>'; }).concat(opts.indexOf(f.customer_id) < 0 && f.customer_id ? ['<option selected>' + esc(f.customer_id) + '</option>'] : []).join('') + '</select></label>' +
        '<div class="row2"><label class="f">status<select data-f="status">' + ln.statuses.map(function (s) { return '<option' + (s[0] === f.status ? ' selected' : '') + '>' + s[0] + '</option>'; }).join('') + '</select></label>' +
        '<label class="f">product<select data-f="product">' + p.products.map(function (x) { return '<option' + (x === f.product ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="row2"><label class="f">' + ln.amt + '<input data-f="amount" inputmode="numeric" value="' + esc(f.amount) + '" placeholder="required if ' + ln.amtOn.join(' or ') + '"></label>' +
        '<label class="f">reason_code<select data-f="reason_code">' + ln.reasons.map(function (x) { return '<option value="' + x + '"' + (x === f.reason_code ? ' selected' : '') + '>' + (x || 'none') + '</option>'; }).join('') + '</select></label></div>' +
        (ins ? '<div class="row2"><label class="f">timestamp<input data-f="timestamp" value="' + esc(f.timestamp) + '"></label><label class="f">policy_number<input data-f="policy_number" value="' + esc(f.policy_number) + '" placeholder="required if bound"></label></div>' : '<label class="f">timestamp<input data-f="timestamp" value="' + esc(f.timestamp) + '"></label>') +
        '<label class="chk"><input type="checkbox" data-f="notify"' + (f.notify ? ' checked' : '') + '> notify_webhook</label>' +
        '<div class="btns"><button class="go" data-act="send">Send request</button><button class="go alt" data-act="fillbad" title="Fill a request that will fail validation">Try a bad request</button></div>' +
        '<h4>Status values</h4><div class="svals">' + ln.statuses.map(function (s) { return '<div><span class="chip c-' + s[0] + '">' + s[0] + '</span>' + s[1] + '</div>'; }).join('') + '</div></div>' +
        '<div><div class="tabs2">' + [['req', 'Request'], ['curl', 'cURL'], ['py', 'Python'], ['node', 'Node.js']].map(function (t) { return '<button data-act="code" data-c="' + t[0] + '" class="' + (S.code === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div class="code">' + (S.code === 'req' ? hl(codeFor('req', o)).replace(/^(POST [^\n]+)/, '<span class="k">$1</span>') : esc(codeFor(S.code, o))) + '</div>' + respView(S.resp) + '</div></div>';
    } else if (S.sec === 'batch') {
      var cs = cols(ln), reqd = ln.id === 'lending' ? 'customer_id, status, timestamp (required); loan_amount (required if approved or funded); product and reason_code (optional).' : 'customer_id, status, timestamp (required); annual_premium (required if quoted or bound); policy_number (required if bound); product and reason_code (optional).';
      h += '<div class="cols"><div class="box"><b>POST</b> <code>' + P_ + '/batch</code><p class="sub" style="font-size:13.5px">One row per customer. Columns: ' + reqd + '</p><div style="height:10px"></div>' +
        '<label class="f">CSV<textarea data-f="csv" spellcheck="false" placeholder="' + cs.join(',') + '">' + esc(S.csv) + '</textarea></label>' +
        '<div class="btns"><button class="go" data-act="sendbatch">Send batch</button><button class="go alt" data-act="sample">Load sample</button><label class="go alt">Upload CSV<input type="file" id="csvf" accept=".csv,text/csv" hidden></label><button class="go alt" data-act="tmpl">Download template</button></div></div>' +
        '<div>' + (S.csvResp ? respView(S.csvResp) : '<p class="sub">Load the sample or paste rows, then send. The response lists any rows that were rejected and why.</p>') + '</div></div>';
    } else if (S.sec === 'read') {
      var one = unreported(S.as)[0], rep = p.leads.filter(function (l) { return l.status; })[0];
      h += '<div class="cols"><div class="box"><b>GET</b> <code>' + P_ + '/{customer_id}</code><div style="height:12px"></div><label class="f">customer_id<input data-f="readid" value="' + esc(S.readid || (rep ? rep.id : '')) + '"></label>' +
        '<div class="btns"><button class="go" data-act="fetch">Send request</button></div><p class="note">Try <a href="#" data-act="useid" data-id="' + (rep ? rep.id : '') + '">a reported lead</a> or <a href="#" data-act="useid" data-id="' + (one ? one.id : '') + '">an unreported lead</a>.</p></div><div>' + respView(S.read) + '</div></div>';
    } else {
      h += '<div class="cols"><div class="box"><b>Webhook</b> <code>' + ln.event + '</code><p class="sub" style="font-size:13.5px">Set <code>notify_webhook</code> on an update and LendingTree posts the new status to your endpoint, signed with your secret. Your systems stay in step without polling.</p><div style="height:8px"></div><div class="btns"><button class="go" data-act="testhook">Send test webhook</button></div></div>' +
        '<div><div class="tabs2"><button class="on">Delivery log</button></div><div class="code" style="min-height:140px">' + (S.hooks.length ? S.hooks.slice().reverse().map(function (w) { return esc(w.t + '  POST https://partner.example/hooks/lt  200  ' + JSON.stringify({ event: w.ev === 'lead.test' ? w.ev : ln.event, customer_id: w.id, status: w.status })); }).join('\n') : 'No deliveries yet. Send an update with notify_webhook on.') + '</div></div></div>';
    }
    docs.innerHTML = h;
    var cf = $('#csvf'); if (cf) cf.addEventListener('change', function () { var fl = cf.files[0]; if (!fl) return; var r = new FileReader(); r.onload = function () { S.csv = String(r.result).slice(0, 60000); docsView(); }; r.readAsText(fl); });
  }
  function respView(r) {
    if (!r) return '<div class="resp"><p class="sub" style="font-size:13.5px">Send the request to see the response.</p></div>';
    return '<div class="resp"><span class="st ' + (r.code < 300 ? 'ok' : 'bad') + '">' + r.code + (r.code < 300 ? ' OK' : r.code === 404 ? ' Not Found' : ' Unprocessable') + '</span> <span class="note">' + r.ms + ' ms</span><div class="code" style="max-height:300px">' + hl(pretty(r.body)) + '</div>' + (r.cov ? '<p class="note">' + r.cov + '</p><div class="btns"><button class="go alt" data-act="todash">See it on the dashboard</button></div>' : '') + '</div>';
  }

  // ---- dashboard view
  function dashView() {
    var ps = P.filter(function (p) { return p.type === S.seg; }), ln = LN(S.seg), st = stats(ps), bs = base.bySeg;
    var dl = function (cur, ref, unit, inv) { var d = (cur - ref); if (Math.abs(d) < 0.00005) return ''; var up = inv ? d < 0 : d > 0; return '<em class="' + (up ? '' : 'dn') + '">' + (d > 0 ? '▲ ' : '▼ ') + (unit === 'pp' ? Math.abs(d * 100).toFixed(1) + ' pp' : unit === '$' ? money(Math.abs(d)) : num(Math.abs(d))) + '</em>'; };
    var rows = ps.map(function (p) { var s = pstat(p); return { p: p, s: s, delivered: s.n, cov: s.cov, win: s.win, rate: s.rate, cpf: s.cpf, name: p.name }; });
    if (S.sort === 'funded') S.sort = 'win';
    rows.sort(function (a, b) { var x = a[S.sort], y = b[S.sort]; return (x < y ? -1 : x > y ? 1 : 0) * S.dir; });
    var th = function (k, t) { return '<th data-act="sort" data-k="' + k + '">' + t + (S.sort === k ? (S.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; };
    var sel = byId(S.sel); if (sel.type !== S.seg) { sel = ps[0]; S.sel = sel.id; } var ss = pstat(sel);
    var stages = [['Delivered', ss.n], ['Reported', ss.rep]].concat(ln.stages.map(function (x, i) { return [x[0], ss.c[i]]; }));
    dash.innerHTML = '<h3>Partner performance</h3><p class="sub">See how your ' + S.seg.toLowerCase() + ' partners perform, from leads delivered to customer outcomes.</p>' +
      '<div class="sec"><button data-act="seg" data-s="Lending" class="' + (S.seg === 'Lending' ? 'on' : '') + '">Lending partners</button><button data-act="seg" data-s="Insurance" class="' + (S.seg === 'Insurance' ? 'on' : '') + '">Insurance partners</button></div>' +
      '<div class="kp"><div><span>Total leads delivered</span><b>' + num(st.n) + '</b></div><div><span>Reporting coverage (goal 80%)</span><b>' + pct(st.cov) + dl(st.cov, bs[S.seg].cov, 'pp') + '</b></div><div><span>' + ln.kpiRate + '</span><b>' + pct(st.rate) + dl(st.rate, bs[S.seg].rate, 'pp') + '</b></div><div><span>' + ln.kpiCost + '</span><b>' + money(st.cpf) + dl(st.cpf, bs[S.seg].cpf, '$', true) + '</b></div></div>' +
      '<div class="tbl"><table><tr>' + th('name', 'Partner') + th('delivered', 'Leads delivered') + th('cov', 'Reporting coverage') + th('win', ln.colWin) + th('rate', ln.colRate) + th('cpf', ln.colCost) + '<th>Tier</th></tr>' +
      rows.map(function (r) { var t = tier(r.cov); return '<tr class="pick' + (r.p.id === S.sel ? ' on' : '') + '" data-act="selp" data-id="' + r.p.id + '"><td><span class="pn">' + pmark(r.p) + '<b>' + r.p.name + '</b></span></td><td>' + num(r.delivered) + '</td><td><span class="cov"><i style="width:' + (r.cov * 100) + '%"></i><u></u></span>' + pct(r.cov, 0) + '</td><td>' + num(r.win) + '</td><td>' + pct(r.rate) + '</td><td>' + (isFinite(r.cpf) ? money(r.cpf) : '–') + '</td><td><span class="tier ' + t[1] + '">' + t[0] + '</span></td></tr>'; }).join('') + '</table></div>' +
      '<p class="note">The black tick marks 80% coverage. Priority partners earn better placement and pricing. Under 40% is at risk. ' + ln.kpiCost + ' is lead cost ($' + ln.cost + ' each) over ' + (ln.id === 'lending' ? 'funded loans' : 'bound policies') + ', so it only means something once outcomes are reported.</p>' +
      '<h4>' + sel.name + ': ' + ln.funTitle + '</h4><div class="box fun">' + stages.map(function (s) { return '<div><span>' + s[0] + '</span><span><i style="width:' + (s[1] / ss.n * 100) + '%"></i></span><b>' + num(s[1]) + ' · ' + pct(s[1] / ss.n, 0) + '</b></div>'; }).join('') + '<p class="note">' + num(ss.n - ss.rep) + ' leads have no reported outcome. Those are the leads LendingTree cannot learn from.</p></div>';
  }
  function introView() {
    var p = byId(S.as), ln = LN(p.type), s = pstat(p), t = tier(s.cov)[0].toLowerCase();
    $('#intro').innerHTML = S.tab === 'docs'
      ? '<b>Prototype with sample data.</b> You are <b>' + p.name + '</b>, ' + ln.noun + ' partner. ' + pct(s.cov, 0) + ' of the leads LendingTree sent you have a reported outcome (goal: 80%), which puts you in the <b>' + t + '</b> tier. Try it: send a status update for one lead, or load the sample batch and send it, then open the dashboard to watch your tier change. Partner names and logos are for illustration; all figures are invented.'
      : '<b>Prototype with sample data.</b> Select a partner row to see its funnel. Updates you send from the developer docs show up here. Switch between lending and insurance to see each line\'s own funnel and terms.';
  }
  function render() {
    var opt = function (type) { return P.filter(function (p) { return p.type === type; }).map(function (p) { return '<option value="' + p.id + '"' + (p.id === S.as ? ' selected' : '') + '>' + p.name + '</option>'; }).join(''); };
    $('#who').innerHTML = S.tab === 'docs' ? 'Signed in as ' + pmark(byId(S.as)) + '<select data-f="as" aria-label="Partner"><optgroup label="Lenders">' + opt('Lending') + '</optgroup><optgroup label="Insurers">' + opt('Insurance') + '</optgroup></select> <code>' + key + '</code>' : 'Last 12 months';
    docs.hidden = S.tab !== 'docs'; dash.hidden = S.tab !== 'dash';
    document.querySelectorAll('.odtabs [data-t]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === S.tab); });
    introView();
    if (S.tab === 'docs') docsView(); else dashView();
  }

  // ---- actions
  function send(body, notify) {
    var ln = cur(), t = 12 + Math.floor(Math.random() * 30), e = validate(body, S.as);
    if (e) { S.resp = { code: e.code, ms: t, body: e.body }; return false; }
    var before = pstat(byId(S.as)).cov, prev = apply(body, notify), after = pstat(byId(S.as)).cov;
    var o = { customer_id: body.customer_id, status: body.status, recorded_at: now(), previous_status: prev, reporting_coverage: +(after * 100).toFixed(1) };
    S.resp = { code: 200, ms: t, body: o, cov: 'Reporting coverage for ' + byId(S.as).name + ' moved from ' + pct(before) + ' to ' + pct(after) + (before < 0.8 && after >= 0.8 ? '. Priority tier reached.' : '.') };
    return true;
  }
  function sendBatch(csv) {
    var lines = csv.split(/\r?\n/).filter(function (x) { return x.trim(); }); if (!lines.length) { S.csvResp = { code: 422, ms: 8, body: { error: 'validation_failed', errors: [{ field: 'file', message: 'is empty' }] } }; return; }
    var hdr = lines[0].split(',').map(function (x) { return x.trim(); }), errors = [], ok = 0, before = pstat(byId(S.as)).cov;
    if (hdr.indexOf('customer_id') < 0 || hdr.indexOf('status') < 0) { S.csvResp = { code: 422, ms: 9, body: { error: 'validation_failed', errors: [{ field: 'header', message: 'must include customer_id and status' }] } }; return; }
    lines.slice(1).forEach(function (ln, i) {
      var c = ln.split(','), b = {}; hdr.forEach(function (h, k) { b[h] = (c[k] || '').trim(); }); if (!b.reason_code) b.reason_code = null;
      var e = validate(b, S.as); if (e) errors.push({ row: i + 2, customer_id: b.customer_id || null, error: e.body.error === 'customer_not_found' ? 'customer_not_found' : e.body.errors.map(function (x) { return x.field + ' ' + x.message; }).join('; ') }); else { apply(b, true); ok++; }
    });
    var after = pstat(byId(S.as)).cov;
    S.csvResp = { code: errors.length && !ok ? 422 : 200, ms: 40 + lines.length * 2, body: { received: lines.length - 1, processed: ok, rejected: errors.length, errors: errors }, cov: 'Reporting coverage for ' + byId(S.as).name + ' moved from ' + pct(before) + ' to ' + pct(after) + '.' };
  }
  function sampleCsv() {
    var p = byId(S.as), ln = LN(p.type), cs = cols(ln), u = unreported(S.as, 9999), ts = now(), rg = rng(41), prod = p.products[0], out = [cs.join(',')];
    var row = function (o) { return cs.map(function (k) { return o[k] == null ? '' : o[k]; }).join(','); };
    var need = Math.max(6, Math.ceil(0.82 * p.leads.length) - p.leads.filter(function (l) { return l.status; }).length), take = u.slice(0, Math.min(u.length, need + 2));
    take.forEach(function (l) {
      var x = rg(), st = ln.mix.filter(function (m) { return x < m[0]; })[0][1], o = { customer_id: l.id, status: st, timestamp: ts, product: prod, reason_code: ln.why[st] || '' };
      if (ln.amtOn.indexOf(st) >= 0) o[ln.amt] = ln.id === 'lending' ? 18000 + Math.round(rg() * 14) * 500 : 1200 + Math.round(rg() * 30) * 50;
      if (st === 'bound') o.policy_number = 'POL-' + l.id.slice(3);
      out.push(row(o));
    });
    var bad = { timestamp: ts, product: prod }; bad.customer_id = 'LT-999999'; bad.status = ln.win; bad[ln.amt] = ln.id === 'lending' ? 15000 : 1500; bad.policy_number = 'POL-999999';
    out.splice(3, 0, row(bad));
    var bad2 = { customer_id: take[1] ? take[1].id : 'LT-100777', status: ln.win, timestamp: ts, product: prod }; out.splice(9, 0, row(bad2));
    return out.join('\n');
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act');
    if (a === 'tab') { S.tab = el.getAttribute('data-t'); if (S.tab === 'dash') { var tp0 = byId(S.as); S.seg = tp0.type; S.sel = tp0.id; } render(); }
    else if (a === 'sec') { S.sec = el.getAttribute('data-s'); render(); }
    else if (a === 'code') { S.code = el.getAttribute('data-c'); docsView(); }
    else if (a === 'send') { var f = F(), b = sample(f); if (send(b, f.notify)) { var nx = unreported(S.as)[0]; f.customer_id = nx ? nx.id : f.customer_id; f.timestamp = now(); f.policy_number = ''; } render(); }
    else if (a === 'fillbad') { var ln = cur(), ub = unreported(S.as)[0]; S.form = { customer_id: ub ? ub.id : 'LT-100001', status: ln.win, timestamp: 'yesterday', amount: '', policy_number: '', product: byId(S.as).products[0], reason_code: '', notify: true }; var b2 = sample(S.form); b2.timestamp = 'yesterday'; send(b2, false); render(); }
    else if (a === 'sample') { S.csv = sampleCsv(); S.csvResp = null; docsView(); }
    else if (a === 'sendbatch') { var ta = docs.querySelector('textarea'); S.csv = ta ? ta.value : S.csv; sendBatch(S.csv); render(); }
    else if (a === 'tmpl') { var ln2 = cur(), tr = ln2.id === 'lending' ? 'LT-123456,approved,2026-10-01T15:30:00Z,25000,personal_loan,' : 'LT-123456,bound,2026-10-01T15:30:00Z,1840,POL-123456,auto_insurance,'; var bl = new Blob([cols(ln2).join(',') + '\n' + tr + '\n'], { type: 'text/csv' }), u = URL.createObjectURL(bl), l = document.createElement('a'); l.href = u; l.download = 'customer_status_template.csv'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 500); }
    else if (a === 'fetch') { var ln3 = cur(), id = (docs.querySelector('[data-f="readid"]') || {}).value || ''; S.readid = id.trim(); var ld = L[S.readid], ok = ld && ld.p === S.as; var rb = ok ? { customer_id: ld.id, partner: S.as, status: ld.status || 'no_status_reported', updated_at: ld.at } : null; if (ok) { rb[ln3.amt] = ld.amt; if (ln3.id === 'insurance') rb.policy_number = ld.pol; rb.history = ld.hist.map(function (h) { return { timestamp: h[0], status: h[1] }; }); } S.read = ok ? { code: 200, ms: 14, body: rb } : { code: 404, ms: 11, body: { error: 'customer_not_found', message: 'No lead ' + esc(S.readid) + ' was delivered to this partner.' } }; docsView(); }
    else if (a === 'useid') { e.preventDefault(); S.readid = el.getAttribute('data-id'); docsView(); }
    else if (a === 'testhook') { S.hooks.push({ t: clock(), ev: 'lead.test', id: 'LT-TEST-0001', status: cur().win }); docsView(); }
    else if (a === 'seg') { S.seg = el.getAttribute('data-s'); S.sel = P.filter(function (p) { return p.type === S.seg; })[0].id; dashView(); }
    else if (a === 'sort') { var k = el.getAttribute('data-k'); S.dir = S.sort === k ? -S.dir : (k === 'name' ? 1 : -1); S.sort = k; dashView(); }
    else if (a === 'todash') { var tp = byId(S.as); S.tab = 'dash'; S.seg = tp.type; S.sel = tp.id; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'selp') { S.sel = el.getAttribute('data-id'); dashView(); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute && el.getAttribute('data-f'); if (!k) return;
    if (k === 'as') { S.as = el.value; S.form = {}; S.resp = null; S.csvResp = null; S.read = null; S.readid = ''; S.csv = ''; render(); return; }
    if (k === 'notify') { S.form.notify = el.checked; docsView(); return; }
    if (k === 'csv') { S.csv = el.value; return; }
    if (k === 'readid') { S.readid = el.value; return; }
    var ln = cur(); S.form[k] = el.value;
    if (k === 'status') {
      var needs = ln.amtOn.indexOf(el.value) >= 0;
      if (!needs && S.form.amount === ln.amtDef) S.form.amount = '';
      if (needs && !S.form.amount) S.form.amount = ln.amtDef;
      if (ln.id === 'insurance' && el.value === 'bound' && !S.form.policy_number) S.form.policy_number = 'POL-' + String(S.form.customer_id || '').slice(3);
      if (el.value !== 'bound') S.form.policy_number = '';
    }
    docsView();
  });
  fresh(); render();
})();
