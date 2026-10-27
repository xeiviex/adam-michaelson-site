// Prototype: outcomes API and partner dashboard. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var docs = $('#docs'), dash = $('#dash');
  var STATUSES = [['contacted', 'Customer was contacted'], ['applied', 'Customer submitted application'], ['approved', 'Customer was approved'], ['funded', 'Loan was funded'], ['declined', 'Customer was declined'], ['withdrawn', 'Customer withdrew an application']];
  var REASONS = ['', 'income_too_low', 'credit_score', 'incomplete_docs', 'customer_withdrew', 'found_other_lender'];
  var PRODUCTS = ['personal_loan', 'home_equity', 'auto_loan', 'auto_insurance', 'home_insurance'];
  var DEFS = [
    ['ridgeview', 'Ridgeview Financial', 'Lending', 248, 0.91, 0.21], ['maple', 'Maple Bank', 'Lending', 187, 0.84, 0.18], ['summit', 'Summit Lending', 'Lending', 156, 0.78, 0.17],
    ['harbor', 'Harbor Credit', 'Lending', 143, 0.62, 0.17], ['cedar', 'Cedar Capital', 'Lending', 128, 0.55, 0.16], ['northgate', 'Northgate Bank', 'Lending', 98, 0.38, 0.15], ['pinecrest', 'Pinecrest Lending', 'Lending', 72, 0.22, 0.14],
    ['beacon', 'Beacon Mutual', 'Insurance', 210, 0.86, 0.24], ['keystone', 'Keystone Insurance', 'Insurance', 175, 0.7, 0.22], ['lakeshore', 'Lakeshore Mutual', 'Insurance', 120, 0.45, 0.2]
  ];
  var LOGOS = { ridgeview: 1, maple: 1, summit: 1 }, TINTS = ['#2e6db4', '#1f7a5c', '#8a5a1f', '#6a4c93', '#b3463c', '#3a4350', '#0e7490'];
  function pmark(p) { return LOGOS[p.id] ? '<span class="pm"><img src="/lendingtree/img/lender-' + p.id + '.png" alt=""></span>' : '<span class="pm" style="background:' + TINTS[DEFS.map(function (d) { return d[0]; }).indexOf(p.id) % TINTS.length] + ';color:#fff" aria-hidden="true">' + p.name.charAt(0) + '</span>'; }
  var LEAD_COST = 20, FEE_BASE = 0.2;
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
      var r = rng(pi * 977 + 13), p = { id: d[0], name: d[1], type: d[2], delivered: d[3], leads: [], fr: d[5] };
      for (var i = 0; i < d[3]; i++) {
        var lead = { id: 'LT-' + (100000 + pi * 10000 + i), p: p.id, status: null, at: null, amt: null, hist: [] };
        if (r() < d[4]) {
          var x = r(), f = d[5] / d[4];
          lead.status = x < f ? 'funded' : x < f + 0.12 ? 'approved' : x < f + 0.3 ? 'applied' : x < f + 0.4 ? 'declined' : x < f + 0.45 ? 'withdrawn' : 'contacted';
          if (lead.status === 'funded' || lead.status === 'approved') lead.amt = Math.round((20 + r() * 12) * 1000 / 100) * 100;
          lead.at = new Date(Date.now() - r() * 12 * 86400000).toISOString().replace(/\.\d+Z$/, 'Z'); lead.hist = [[lead.at, lead.status]];
        }
        p.leads.push(lead); L[lead.id] = lead;
      }
      P.push(p);
    });
    base = { bySeg: {} }; ['Lending', 'Insurance'].forEach(function (g) { base.bySeg[g] = stats(P.filter(function (p) { return p.type === g; })); });
  }
  var pstat = function (p) { var rep = 0, f = 0, ap = 0, apr = 0, con = 0; p.leads.forEach(function (l) { if (l.status) { rep++; if (l.status === 'funded') f++; if (l.status === 'applied' || l.status === 'approved' || l.status === 'funded' || l.status === 'declined') ap++; if (l.status === 'approved' || l.status === 'funded') apr++; } }); return { n: p.leads.length, rep: rep, funded: f, applied: ap, approved: apr, cov: rep / p.leads.length, rate: f / p.leads.length, cpf: f ? LEAD_COST * p.leads.length / f : Infinity }; };
  function stats(ps) { var n = 0, rep = 0, f = 0; ps.forEach(function (p) { var s = pstat(p); n += s.n; rep += s.rep; f += s.funded; }); return { n: n, rep: rep, funded: f, cov: rep / n, rate: f / n, cpf: f ? LEAD_COST * n / f : Infinity }; }
  var byId = function (id) { return P.filter(function (p) { return p.id === id; })[0]; };
  var tier = function (c) { return c >= 0.8 ? ['Priority', 't-p'] : c >= 0.4 ? ['Standard', 't-s'] : ['At risk', 't-r']; };

  // ---- request validation + apply
  function validate(b, partner) {
    var errs = [], l = b.customer_id ? L[b.customer_id] : null;
    if (!b.customer_id) errs.push({ field: 'customer_id', message: 'is required' });
    else if (!l || l.p !== partner) return { code: 404, body: { error: 'customer_not_found', message: 'No lead ' + b.customer_id + ' was delivered to this partner.' } };
    if (!STATUSES.some(function (s) { return s[0] === b.status; })) errs.push({ field: 'status', message: 'must be one of ' + STATUSES.map(function (s) { return s[0]; }).join(', ') });
    if (!b.timestamp || isNaN(Date.parse(b.timestamp))) errs.push({ field: 'timestamp', message: 'must be an ISO 8601 date-time' });
    if ((b.status === 'approved' || b.status === 'funded') && !(+b.loan_amount > 0)) errs.push({ field: 'loan_amount', message: 'is required when status is approved or funded' });
    if (b.reason_code && REASONS.indexOf(b.reason_code) < 0) errs.push({ field: 'reason_code', message: 'is not a recognized code' });
    return errs.length ? { code: 422, body: { error: 'validation_failed', errors: errs } } : null;
  }
  function apply(b, notify) {
    var l = L[b.customer_id], prev = l.status; l.status = b.status; l.at = b.timestamp; if (+b.loan_amount > 0) l.amt = +b.loan_amount; l.hist.push([b.timestamp, b.status]);
    if (notify) S.hooks.push({ t: clock(), ev: 'lead.status_updated', id: l.id, status: l.status });
    return prev;
  }
  var unreported = function (pid, n) { return byId(pid).leads.filter(function (l) { return !l.status; }).slice(0, n || 1); };

  // ---- code samples
  function sample(f) {
    var o = { customer_id: f.customer_id || 'LT-100001', status: f.status || 'approved', timestamp: f.timestamp || now() };
    if (f.loan_amount !== '' && f.loan_amount != null && (o.status === 'approved' || o.status === 'funded' || f.loan_amount)) o.loan_amount = +f.loan_amount || 0;
    if (f.product) o.product = f.product;
    o.reason_code = f.reason_code || null;
    return o;
  }
  var pretty = function (o) { return JSON.stringify(o, null, 2); };
  var hl = function (s) { return esc(s).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2').replace(/: (&quot;[^&]*?&quot;)/g, ': <span class="s">$1</span>').replace(/: (-?\d+(\.\d+)?|null|true|false)/g, ': <span class="n">$1</span>'); };
  function codeFor(kind, o, notify) {
    var j = pretty(o), url = 'https://api.lendingtree.example/v1/customer-status';
    if (kind === 'req') return 'POST /v1/customer-status\nAuthorization: Bearer ' + key + '\nContent-Type: application/json\n\n' + j;
    if (kind === 'curl') return "curl -X POST " + url + " \\\n  -H \"Authorization: Bearer " + key + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '" + JSON.stringify(o) + "'";
    if (kind === 'py') return 'import requests\n\nr = requests.post(\n    "' + url + '",\n    headers={"Authorization": "Bearer ' + key + '"},\n    json=' + JSON.stringify(o).replace(/null/g, 'None').replace(/true/g, 'True') + ',\n)\nprint(r.status_code, r.json())';
    return 'const r = await fetch("' + url + '", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer ' + key + '",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(' + JSON.stringify(o) + '),\n});\nconsole.log(r.status, await r.json());';
  }

  // ---- docs view
  function F() { var f = S.form; if (!f.customer_id) { var u = unreported(S.as)[0]; f.customer_id = u ? u.id : ''; f.status = f.status || 'approved'; f.timestamp = f.timestamp || now(); f.loan_amount = f.loan_amount == null ? '26500' : f.loan_amount; f.product = f.product || (byId(S.as).type === 'Lending' ? 'personal_loan' : 'auto_insurance'); f.reason_code = f.reason_code || ''; f.notify = f.notify == null ? true : f.notify; } return f; }
  function docsView() {
    var p = byId(S.as), f = F();
    var secs = [['single', 'Single update'], ['batch', 'Batch update (CSV)'], ['read', 'Read a status'], ['hooks', 'Webhooks']];
    var h = '<h3>Update Customer Status</h3><p class="sub">Report the latest status for customers referred by LendingTree. Partners that report on 80% or more of their leads earn priority placement and better pricing.</p><div class="sec">' + secs.map(function (s) { return '<button data-act="sec" data-s="' + s[0] + '" class="' + (S.sec === s[0] ? 'on' : '') + '">' + s[1] + '</button>'; }).join('') + '</div>';
    if (S.sec === 'single') {
      var o = sample(f), opts = unreported(S.as, 6).map(function (l) { return l.id; });
      h += '<div class="cols"><div class="box"><b>POST</b> <code>/v1/customer-status</code><div style="height:12px"></div>' +
        '<label class="f">customer_id<select data-f="customer_id">' + opts.map(function (i) { return '<option' + (i === f.customer_id ? ' selected' : '') + '>' + i + '</option>'; }).concat(opts.indexOf(f.customer_id) < 0 && f.customer_id ? ['<option selected>' + esc(f.customer_id) + '</option>'] : []).join('') + '</select></label>' +
        '<div class="row2"><label class="f">status<select data-f="status">' + STATUSES.map(function (s) { return '<option' + (s[0] === f.status ? ' selected' : '') + '>' + s[0] + '</option>'; }).join('') + '</select></label>' +
        '<label class="f">product<select data-f="product">' + PRODUCTS.map(function (x) { return '<option' + (x === f.product ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="row2"><label class="f">loan_amount<input data-f="loan_amount" inputmode="numeric" value="' + esc(f.loan_amount) + '" placeholder="required if approved or funded"></label>' +
        '<label class="f">reason_code<select data-f="reason_code">' + REASONS.map(function (x) { return '<option value="' + x + '"' + (x === f.reason_code ? ' selected' : '') + '>' + (x || 'none') + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="f">timestamp<input data-f="timestamp" value="' + esc(f.timestamp) + '"></label>' +
        '<label style="display:flex;gap:8px;align-items:center;font-size:13px;margin-bottom:14px"><input type="checkbox" data-f="notify"' + (f.notify ? ' checked' : '') + '> notify_webhook</label>' +
        '<button class="go" data-act="send">Send request</button> <button class="go alt" data-act="fillbad" title="Fill a request that will fail validation">Try a bad request</button>' +
        '<h4>Status values</h4><div class="svals">' + STATUSES.map(function (s) { return '<div><span class="chip c-' + s[0] + '">' + s[0] + '</span>' + s[1] + '</div>'; }).join('') + '</div></div>' +
        '<div><div class="tabs2">' + [['req', 'Request'], ['curl', 'cURL'], ['py', 'Python'], ['node', 'Node.js']].map(function (t) { return '<button data-act="code" data-c="' + t[0] + '" class="' + (S.code === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div class="code">' + (S.code === 'req' ? hl(codeFor('req', o)).replace(/^(POST \/v1\/customer-status)/, '<span class="k">$1</span>') : esc(codeFor(S.code, o))) + '</div>' + respView(S.resp) + '</div></div>';
    } else if (S.sec === 'batch') {
      h += '<div class="cols"><div class="box"><b>POST</b> <code>/v1/customer-status/batch</code><p class="sub" style="font-size:13.5px">One row per customer. Columns: customer_id, status, timestamp (required); loan_amount (required if approved or funded); product and reason_code (optional).</p><div style="height:10px"></div>' +
        '<label class="f">CSV<textarea data-f="csv" spellcheck="false" placeholder="customer_id,status,timestamp,loan_amount,product,reason_code">' + esc(S.csv) + '</textarea></label>' +
        '<button class="go" data-act="sendbatch">Send batch</button> <button class="go alt" data-act="sample">Load sample</button> <label class="go alt" style="display:inline-block;cursor:pointer">Upload CSV<input type="file" id="csvf" accept=".csv,text/csv" hidden></label> <button class="go alt" data-act="tmpl">Download template</button></div>' +
        '<div>' + (S.csvResp ? respView(S.csvResp) : '<p class="sub">Load the sample or paste rows, then send. The response lists any rows that were rejected and why.</p>') + '</div></div>';
    } else if (S.sec === 'read') {
      var one = unreported(S.as)[0], rep = p.leads.filter(function (l) { return l.status; })[0];
      h += '<div class="cols"><div class="box"><b>GET</b> <code>/v1/customer-status/{customer_id}</code><div style="height:12px"></div><label class="f">customer_id<input data-f="readid" value="' + esc(S.readid || (rep ? rep.id : '')) + '"></label>' +
        '<button class="go" data-act="fetch">Send request</button><p class="note">Try <a href="#" data-act="useid" data-id="' + (rep ? rep.id : '') + '">a reported lead</a> or <a href="#" data-act="useid" data-id="' + (one ? one.id : '') + '">an unreported lead</a>.</p></div><div>' + respView(S.read) + '</div></div>';
    } else {
      h += '<div class="cols"><div class="box"><b>Webhook</b> <code>lead.status_updated</code><p class="sub" style="font-size:13.5px">Set <code>notify_webhook</code> on an update and LendingTree posts the new status to your endpoint, signed with your secret. Your systems stay in step without polling.</p><div style="height:8px"></div><button class="go" data-act="testhook">Send test webhook</button></div>' +
        '<div><div class="tabs2"><button class="on">Delivery log</button></div><div class="code" style="min-height:140px">' + (S.hooks.length ? S.hooks.slice().reverse().map(function (w) { return esc(w.t + '  POST https://partner.example/hooks/lt  200  ' + JSON.stringify({ event: w.ev, customer_id: w.id, status: w.status })); }).join('\n') : 'No deliveries yet. Send an update with notify_webhook on.') + '</div></div></div>';
    }
    docs.innerHTML = h;
    var cf = $('#csvf'); if (cf) cf.addEventListener('change', function () { var fl = cf.files[0]; if (!fl) return; var r = new FileReader(); r.onload = function () { S.csv = String(r.result).slice(0, 60000); log('csv_loaded', esc(fl.name) + ', ' + S.csv.split(/\r?\n/).length + ' lines'); docsView(); }; r.readAsText(fl); });
  }
  function respView(r) {
    if (!r) return '<div class="resp"><p class="sub" style="font-size:13.5px">Send the request to see the response.</p></div>';
    return '<div class="resp"><span class="st ' + (r.code < 300 ? 'ok' : 'bad') + '">' + r.code + (r.code < 300 ? ' OK' : r.code === 404 ? ' Not Found' : ' Unprocessable') + '</span> <span class="note">' + r.ms + ' ms</span><div class="code" style="max-height:300px">' + hl(pretty(r.body)) + '</div>' + (r.cov ? '<p class="note">' + r.cov + '</p><button class="go alt" data-act="todash">See it on the dashboard</button>' : '') + '</div>';
  }

  // ---- dashboard view
  function dashView() {
    var ps = P.filter(function (p) { return p.type === S.seg; }), st = stats(ps), bs = base.bySeg;
    var dl = function (cur, ref, unit, inv) { var d = (cur - ref); if (Math.abs(d) < 0.00005) return ''; var up = inv ? d < 0 : d > 0; return '<em class="' + (up ? '' : 'dn') + '">' + (d > 0 ? '▲ ' : '▼ ') + (unit === 'pp' ? Math.abs(d * 100).toFixed(1) + ' pp' : unit === '$' ? money(Math.abs(d)) : num(Math.abs(d))) + '</em>'; };
    var rows = ps.map(function (p) { var s = pstat(p); return { p: p, s: s, delivered: s.n, cov: s.cov, funded: s.funded, rate: s.rate, cpf: s.cpf, name: p.name }; });
    rows.sort(function (a, b) { var x = a[S.sort], y = b[S.sort]; return (x < y ? -1 : x > y ? 1 : 0) * S.dir; });
    var th = function (k, t) { return '<th data-act="sort" data-k="' + k + '">' + t + (S.sort === k ? (S.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; };
    var sel = byId(S.sel); if (sel.type !== S.seg) { sel = ps[0]; S.sel = sel.id; } var ss = pstat(sel);
    var stages = [['Delivered', ss.n], ['Reported', ss.rep], ['Applied', ss.applied], ['Approved', ss.approved], ['Funded', ss.funded]];
    dash.innerHTML = '<h3>Partner performance</h3><p class="sub">See how your ' + S.seg.toLowerCase() + ' partners perform, from leads delivered to customer outcomes.</p>' +
      '<div class="sec"><button data-act="seg" data-s="Lending" class="' + (S.seg === 'Lending' ? 'on' : '') + '">Lending partners</button><button data-act="seg" data-s="Insurance" class="' + (S.seg === 'Insurance' ? 'on' : '') + '">Insurance partners</button></div>' +
      '<div class="kp"><div><span>Total leads delivered</span><b>' + num(st.n) + '</b></div><div><span>Reporting coverage (goal 80%)</span><b>' + pct(st.cov) + dl(st.cov, bs[S.seg].cov, 'pp') + '</b></div><div><span>Funded rate per lead</span><b>' + pct(st.rate) + dl(st.rate, bs[S.seg].rate, 'pp') + '</b></div><div><span>Cost per funded loan</span><b>' + money(st.cpf) + dl(st.cpf, bs[S.seg].cpf, '$', true) + '</b></div></div>' +
      '<div class="tbl"><table><tr>' + th('name', 'Partner') + th('delivered', 'Leads delivered') + th('cov', 'Reporting coverage') + th('funded', 'Funded') + th('rate', 'Funded rate') + th('cpf', 'Cost / funded') + '<th>Tier</th></tr>' +
      rows.map(function (r) { var t = tier(r.cov); return '<tr class="pick' + (r.p.id === S.sel ? ' on' : '') + '" data-act="selp" data-id="' + r.p.id + '"><td><span class="pn">' + pmark(r.p) + '<b>' + r.p.name + '</b></span></td><td>' + num(r.delivered) + '</td><td><span class="cov"><i style="width:' + (r.cov * 100) + '%"></i><u></u></span>' + pct(r.cov, 0) + '</td><td>' + num(r.funded) + '</td><td>' + pct(r.rate) + '</td><td>' + (isFinite(r.cpf) ? money(r.cpf) : '–') + '</td><td><span class="tier ' + t[1] + '">' + t[0] + '</span></td></tr>'; }).join('') + '</table></div>' +
      '<p class="note">The black tick marks 80% coverage. Priority partners earn better placement and pricing. Under 40% is at risk. Cost per funded loan is lead cost ($' + LEAD_COST + ' each) over funded loans, so it only means something once outcomes are reported.</p>' +
      '<h4>' + sel.name + ': from delivery to funded</h4><div class="box fun">' + stages.map(function (s) { return '<div><span>' + s[0] + '</span><span><i style="width:' + (s[1] / ss.n * 100) + '%"></i></span><b>' + num(s[1]) + ' · ' + pct(s[1] / ss.n, 0) + '</b></div>'; }).join('') + '<p class="note">' + num(ss.n - ss.rep) + ' leads have no reported outcome. Those are the leads LendingTree cannot learn from.</p></div>';
  }
  function render() {
    $('#who').innerHTML = S.tab === 'docs' ? 'Signed in as ' + pmark(byId(S.as)) + '<select data-f="as" aria-label="Partner">' + P.map(function (p) { return '<option value="' + p.id + '"' + (p.id === S.as ? ' selected' : '') + '>' + p.name + '</option>'; }).join('') + '</select> <code>' + key + '</code>' : 'Last 12 months';
    docs.hidden = S.tab !== 'docs'; dash.hidden = S.tab !== 'dash';
    document.querySelectorAll('.odtabs [data-t]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === S.tab); });
    if (S.tab === 'docs') docsView(); else dashView();
  }

  // ---- actions
  function send(body, notify) {
    var t = 12 + Math.floor(Math.random() * 30), e = validate(body, S.as);
    if (e) { S.resp = { code: e.code, ms: t, body: e.body }; log('POST /v1/customer-status', e.code + ' ' + e.body.error + ' <em>' + esc(body.customer_id || '') + '</em>', true); return false; }
    var before = pstat(byId(S.as)).cov, prev = apply(body, notify), after = pstat(byId(S.as)).cov;
    var o = { customer_id: body.customer_id, status: body.status, recorded_at: now(), previous_status: prev, reporting_coverage: +(after * 100).toFixed(1) };
    S.resp = { code: 200, ms: t, body: o, cov: 'Reporting coverage for ' + byId(S.as).name + ' moved from ' + pct(before) + ' to ' + pct(after) + (before < 0.8 && after >= 0.8 ? '. Priority tier reached.' : '.') };
    log('POST /v1/customer-status', '200 <em>' + body.customer_id + '</em> → ' + body.status + '. coverage ' + pct(before) + ' → ' + pct(after)); return true;
  }
  function sendBatch(csv) {
    var lines = csv.split(/\r?\n/).filter(function (x) { return x.trim(); }); if (!lines.length) { S.csvResp = { code: 422, ms: 8, body: { error: 'validation_failed', errors: [{ field: 'file', message: 'is empty' }] } }; return; }
    var hdr = lines[0].split(',').map(function (x) { return x.trim(); }), errors = [], ok = 0, before = pstat(byId(S.as)).cov;
    if (hdr.indexOf('customer_id') < 0 || hdr.indexOf('status') < 0) { S.csvResp = { code: 422, ms: 9, body: { error: 'validation_failed', errors: [{ field: 'header', message: 'must include customer_id and status' }] } }; log('POST /v1/customer-status/batch', '422 bad header', true); return; }
    lines.slice(1).forEach(function (ln, i) {
      var c = ln.split(','), b = {}; hdr.forEach(function (h, k) { b[h] = (c[k] || '').trim(); }); if (!b.reason_code) b.reason_code = null;
      var e = validate(b, S.as); if (e) errors.push({ row: i + 2, customer_id: b.customer_id || null, error: e.body.error === 'customer_not_found' ? 'customer_not_found' : e.body.errors.map(function (x) { return x.field + ' ' + x.message; }).join('; ') }); else { apply(b, true); ok++; }
    });
    var after = pstat(byId(S.as)).cov;
    S.csvResp = { code: errors.length && !ok ? 422 : 200, ms: 40 + lines.length * 2, body: { received: lines.length - 1, processed: ok, rejected: errors.length, errors: errors }, cov: 'Reporting coverage for ' + byId(S.as).name + ' moved from ' + pct(before) + ' to ' + pct(after) + '.' };
    log('POST /v1/customer-status/batch', '200 ' + ok + ' processed, ' + errors.length + ' rejected. coverage ' + pct(before) + ' → ' + pct(after), !!errors.length);
  }
  function sampleCsv() {
    var p = byId(S.as), u = unreported(S.as, 9999), ts = now(), r = ['customer_id,status,timestamp,loan_amount,product,reason_code'], rg = rng(41), prod = p.type === 'Lending' ? 'personal_loan' : 'auto_insurance';
    var need = Math.max(6, Math.ceil(0.82 * p.leads.length) - p.leads.filter(function (l) { return l.status; }).length), take = u.slice(0, Math.min(u.length, need + 2));
    take.forEach(function (l, i) {
      var x = rg(), st = x < 0.22 ? 'funded' : x < 0.42 ? 'approved' : x < 0.62 ? 'applied' : x < 0.78 ? 'declined' : x < 0.86 ? 'withdrawn' : 'contacted';
      r.push([l.id, st, ts, (st === 'funded' || st === 'approved') ? 18000 + Math.round(rg() * 14) * 500 : '', prod, st === 'declined' ? 'credit_score' : st === 'withdrawn' ? 'customer_withdrew' : ''].join(','));
    });
    r.splice(3, 0, 'LT-999999,funded,' + ts + ',15000,' + prod + ','); r.splice(9, 0, (take[1] ? take[1].id : 'LT-100777') + ',funded,' + ts + ',,' + prod + ',');
    return r.join('\n');
  }
  function bring(pid, goal) { var p = byId(pid), need = Math.ceil(goal * p.leads.length) - p.leads.filter(function (l) { return l.status; }).length, r = rng(5), n = 0; p.leads.forEach(function (l) { if (!l.status && n < need) { var x = r(); l.status = x < 0.2 ? 'funded' : x < 0.4 ? 'approved' : x < 0.6 ? 'applied' : x < 0.75 ? 'declined' : 'contacted'; l.at = now(); if (l.status === 'funded' || l.status === 'approved') l.amt = 22000; l.hist.push([l.at, l.status]); n++; } }); return n; }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act');
    if (a === 'tab') { S.tab = el.getAttribute('data-t'); render(); }
    else if (a === 'sec') { S.sec = el.getAttribute('data-s'); render(); }
    else if (a === 'code') { S.code = el.getAttribute('data-c'); docsView(); }
    else if (a === 'send') { var f = F(), b = sample(f); if (send(b, f.notify)) { var nx = unreported(S.as)[0]; f.customer_id = nx ? nx.id : f.customer_id; f.timestamp = now(); } render(); }
    else if (a === 'fillbad') { var ub = unreported(S.as)[0]; S.form = { customer_id: ub ? ub.id : 'LT-100001', status: 'funded', timestamp: 'yesterday', loan_amount: '', product: 'personal_loan', reason_code: '', notify: true }; var b2 = sample(S.form); b2.timestamp = 'yesterday'; send(b2, false); render(); }
    else if (a === 'sample') { S.csv = sampleCsv(); S.csvResp = null; docsView(); }
    else if (a === 'sendbatch') { var ta = docs.querySelector('textarea'); S.csv = ta ? ta.value : S.csv; sendBatch(S.csv); render(); }
    else if (a === 'tmpl') { var bl = new Blob(['customer_id,status,timestamp,loan_amount,product,reason_code\nLT-123456,approved,2026-10-01T15:30:00Z,25000,personal_loan,\n'], { type: 'text/csv' }), u = URL.createObjectURL(bl), l = document.createElement('a'); l.href = u; l.download = 'customer_status_template.csv'; l.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 500); }
    else if (a === 'fetch') { var id = (docs.querySelector('[data-f="readid"]') || {}).value || ''; S.readid = id.trim(); var ld = L[S.readid], ok = ld && ld.p === S.as; S.read = ok ? { code: 200, ms: 14, body: { customer_id: ld.id, partner: S.as, status: ld.status || 'no_status_reported', updated_at: ld.at, loan_amount: ld.amt, history: ld.hist.map(function (h) { return { timestamp: h[0], status: h[1] }; }) } } : { code: 404, ms: 11, body: { error: 'customer_not_found', message: 'No lead ' + esc(S.readid) + ' was delivered to this partner.' } }; log('GET /v1/customer-status/' + esc(S.readid), ok ? '200 ' + (ld.status || 'no_status_reported') : '404', !ok); docsView(); }
    else if (a === 'useid') { e.preventDefault(); S.readid = el.getAttribute('data-id'); docsView(); }
    else if (a === 'testhook') { S.hooks.push({ t: clock(), ev: 'lead.test', id: 'LT-TEST-0001', status: 'funded' }); log('webhook', 'lead.test delivered to partner.example, 200'); docsView(); }
    else if (a === 'seg') { S.seg = el.getAttribute('data-s'); S.sel = P.filter(function (p) { return p.type === S.seg; })[0].id; dashView(); }
    else if (a === 'sort') { var k = el.getAttribute('data-k'); S.dir = S.sort === k ? -S.dir : (k === 'name' ? 1 : -1); S.sort = k; dashView(); }
    else if (a === 'todash') { var tp = byId(S.as); S.tab = 'dash'; S.seg = tp.type; S.sel = tp.id; render(); window.scrollTo({ top: document.querySelector('.stage').getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }
    else if (a === 'selp') { S.sel = el.getAttribute('data-id'); dashView(); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute && el.getAttribute('data-f'); if (!k) return;
    if (k === 'as') { S.as = el.value; S.form = {}; S.resp = null; S.csvResp = null; S.read = null; S.readid = ''; S.csv = ''; render(); return; }
    if (k === 'notify') { S.form.notify = el.checked; docsView(); return; }
    if (k === 'csv') { S.csv = el.value; return; }
    if (k === 'readid') { S.readid = el.value; return; }
    S.form[k] = el.value; if (k === 'status') { if (el.value !== 'approved' && el.value !== 'funded' && S.form.loan_amount === '26500') S.form.loan_amount = ''; if ((el.value === 'approved' || el.value === 'funded') && !S.form.loan_amount) S.form.loan_amount = '26500'; } docsView();
  });
  fresh(); render();
})();
