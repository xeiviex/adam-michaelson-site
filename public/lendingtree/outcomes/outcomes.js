// Prototype: lead outcomes API (partner-facing docs) and LendingTree's internal partner dashboard. Sample data, no network.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var docs = $('#docs'), dash = $('#dash');
  var NOC = ['wrong_number', 'no_answer', 'not_interested'], INV = ['duplicate', 'out_of_area', 'did_not_apply'];
  // status: [name, description, kind] kind: p1..p3 = in progress (rank), t = final, w = final win
  var LINES = {
    Lending: {
      id: 'lending', noun: 'a lending', api: 'Lending API', base: '/v1/lending', event: 'lending', win: 'funded', elsewhere: 'funded_elsewhere',
      statuses: [['contacted', 'You reached the customer', 'p1'], ['applied', 'Customer submitted an application', 'p2'], ['approved', 'Customer was approved', 'p3'], ['funded', 'Loan was funded', 'w'], ['declined', 'You declined the customer', 't'], ['withdrawn', 'Customer withdrew or chose another lender', 't'], ['no_contact', 'You could not reach the customer', 't'], ['invalid', 'Lead was not valid (opens a credit request)', 't']],
      reasons: { declined: ['credit_score', 'income_too_low', 'debt_to_income', 'insufficient_equity', 'incomplete_docs'], withdrawn: ['found_other_lender', 'rate_too_high', 'changed_mind'], no_contact: NOC, invalid: INV },
      amt: 'loan_amount', amtReq: ['approved', 'funded'], amtOpt: [], amtDef: '26500', defStatus: 'approved', polReq: false,
      products: { personal_loan: 30, home_equity: 65, auto_loan: 25 },
      stages: [['Applied', ['applied', 'approved', 'funded', 'declined']], ['Approved', ['approved', 'funded']], ['Funded', ['funded']]],
      perk: 'Partners that report on 80% or more of their leads, within a week, get better-matched leads and reporting-tier benefits.',
      kpiRate: 'Funded rate per lead', kpiCost: 'Cost per funded loan', colWin: 'Funded', colRate: 'Funded rate', colCost: 'Cost / funded', funTitle: 'from delivery to funded loan', lostRow: 'Funded by another partner', winWord: 'funded loans'
    },
    Insurance: {
      id: 'insurance', noun: 'an insurance', api: 'Insurance API', base: '/v1/insurance', event: 'insurance', win: 'bound', elsewhere: 'bound_elsewhere',
      statuses: [['contacted', 'You reached the customer', 'p1'], ['quoted', 'Customer received a quote', 'p2'], ['applied', 'Customer submitted an application', 'p3'], ['bound', 'Policy was bound (purchased)', 'w'], ['declined', 'Carrier declined to write the policy', 't'], ['lost', 'Customer did not buy', 't'], ['no_contact', 'You could not reach the customer', 't'], ['invalid', 'Lead was not valid (opens a credit request)', 't']],
      reasons: { declined: ['underwriting_ineligible', 'coverage_not_available', 'prior_claims'], lost: ['price_too_high', 'found_other_carrier', 'kept_current_policy'], no_contact: NOC, invalid: INV },
      amt: 'annual_premium', amtReq: ['bound'], amtOpt: ['quoted'], amtDef: '1840', defStatus: 'quoted', polReq: true,
      products: { auto_insurance: 14, home_insurance: 18, renters_insurance: 8, pet_insurance: 10, umbrella_insurance: 12 },
      stages: [['Quoted', ['quoted', 'applied', 'bound', 'declined']], ['Applied', ['applied', 'bound', 'declined']], ['Bound', ['bound']]],
      perk: 'Partners that report on 80% or more of their leads, within a week, earn priority placement and better pricing.',
      kpiRate: 'Bind rate per lead', kpiCost: 'Cost per bound policy', colWin: 'Bound', colRate: 'Bind rate', colCost: 'Cost / bound', funTitle: 'from delivery to bound policy', lostRow: 'Bound by another carrier', winWord: 'bound policies'
    }
  };
  Object.keys(LINES).forEach(function (k) { var ln = LINES[k]; ln.kind = {}; ln.statuses.forEach(function (s) { ln.kind[s[0]] = s[2]; }); });
  var LP = ['personal_loan', 'home_equity', 'auto_loan'], AU = 'auto_insurance', HO = 'home_insurance', RE = 'renters_insurance', PE = 'pet_insurance', UM = 'umbrella_insurance';
  // id, name, line, leads delivered in the last 30 days, reporting coverage, win rate, products
  var DEFS = [
    ['ridgeview', 'Ridgeview Financial', 'Lending', 2480, 0.93, 0.21, LP], ['maple', 'Maple Bank', 'Lending', 1870, 0.86, 0.18, LP], ['summit', 'Summit Lending', 'Lending', 1560, 0.8, 0.17, LP],
    ['harbor', 'Harbor Credit', 'Lending', 1430, 0.64, 0.17, LP], ['cedar', 'Cedar Capital', 'Lending', 1280, 0.57, 0.16, LP], ['northgate', 'Northgate Bank', 'Lending', 980, 0.36, 0.15, LP], ['pinecrest', 'Pinecrest Lending', 'Lending', 720, 0.24, 0.14, LP],
    ['progressive', 'Progressive', 'Insurance', 2300, 0.93, 0.26, [AU, HO, RE]], ['geico', 'GEICO', 'Insurance', 2050, 0.86, 0.24, [AU, HO, RE]], ['state-farm', 'State Farm', 'Insurance', 1900, 0.78, 0.23, [AU, HO, RE, UM]],
    ['allstate', 'Allstate', 'Insurance', 1700, 0.68, 0.21, [AU, HO, RE, UM]], ['nationwide', 'Nationwide', 'Insurance', 1400, 0.54, 0.2, [AU, HO, PE, UM]], ['travelers', 'Travelers', 'Insurance', 1150, 0.46, 0.19, [AU, HO, UM]],
    ['lemonade', 'Lemonade', 'Insurance', 950, 0.38, 0.18, [RE, HO, PE, AU]], ['trupanion', 'Trupanion', 'Insurance', 800, 0.6, 0.22, [PE]], ['healthy-paws', 'Healthy Paws', 'Insurance', 700, 0.32, 0.2, [PE]]
  ];
  var LOGOS = { ridgeview: 1, maple: 1, summit: 1 }, TINTS = ['#2e6db4', '#1f7a5c', '#8a5a1f', '#6a4c93', '#b3463c', '#3a4350', '#0e7490'];
  function pmark(p) { var src = LOGOS[p.id] ? 'lender-' + p.id + '.png' : p.type === 'Insurance' ? 'carriers/' + p.id + '-icon.png' : null; return src ? '<span class="pm"><img src="/lendingtree/img/' + src + '" alt=""></span>' : '<span class="pm" style="background:' + TINTS[DEFS.map(function (d) { return d[0]; }).indexOf(p.id) % TINTS.length] + ';color:#fff" aria-hidden="true">' + p.name.charAt(0) + '</span>'; }
  var LN = function (type) { return LINES[type]; };
  var P, L, S, t0, base, DAY = 86400000;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var pct = function (n, d) { return (n * 100).toFixed(d == null ? 1 : d) + '%'; };
  var iso = function (ms) { return new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z'); };
  var now = function () { return iso(Date.now()); };
  var day = function (ms) { return iso(ms).slice(0, 10); };
  var clock = function () { var s = Math.round((Date.now() - t0) / 1000); return (s < 10 ? '0' : '') + s + 's'; };
  var hex = function (r, n) { var s = ''; for (var i = 0; i < n; i++) s += '0123456789abcdef'.charAt(Math.floor(r() * 16)); return s; };
  var keyOf = function (pid) { return 'lt_sandbox_' + pid.replace(/-/g, '') + '_' + hex(rng(pid.length * 131 + pid.charCodeAt(0)), 6); };
  var idem = 0, newKey = function () { idem++; return 'req_' + hex(rng(idem * 7919 + 3), 12); };

  function fresh() {
    t0 = Date.now(); P = []; L = {}; idem = 0;
    S = { tab: 'docs', sec: 'single', code: 'req', as: 'northgate', sel: 'northgate', sort: 'delivered', dir: -1, seg: 'Lending', form: {}, resp: null, csv: '', csvResp: null, read: null, readid: '', list: null, lf: 'overdue', hooks: [], hookEv: 'report.due' };
    DEFS.forEach(function (d, pi) {
      var ln = LN(d[2]), r = rng(pi * 977 + 13), p = { id: d[0], name: d[1], type: d[2], leads: [], products: d[6] };
      var speed = 2 + (1 - d[4]) * 12, f = d[5] / d[4], q = Math.min(1, d[4] / ((1 - speed / 30) * 0.92));
      for (var i = 0; i < d[3]; i++) {
        var dAgo = r() * 30, lead = { id: 'LT-' + (100000 + pi * 10000 + i), p: p.id, prod: d[6][Math.floor(r() * d[6].length)], dlv: Date.now() - dAgo * DAY, status: null, reason: null, at: null, first: null, amt: null, pol: null, sold: null, hist: [], els: false };
        var firstD = 0.5 + r() * speed * 2;
        if (r() < q && firstD < dAgo) {
          var x = r();
          lead.status = d[2] === 'Lending'
            ? (x < f ? 'funded' : x < f + 0.1 ? 'approved' : x < f + 0.24 ? 'applied' : x < f + 0.34 ? 'declined' : x < f + 0.42 ? 'withdrawn' : x < f + 0.45 ? 'invalid' : x < 0.92 ? 'no_contact' : 'contacted')
            : (x < f ? 'bound' : x < f + 0.1 ? 'applied' : x < f + 0.26 ? 'quoted' : x < f + 0.34 ? 'declined' : x < f + 0.42 ? 'lost' : x < f + 0.45 ? 'invalid' : x < 0.92 ? 'no_contact' : 'contacted');
          var rs = ln.reasons[lead.status]; if (rs) lead.reason = rs[Math.floor(r() * rs.length)];
          if (ln.amtReq.indexOf(lead.status) >= 0) lead.amt = d[2] === 'Lending' ? Math.round((20 + r() * 12) * 10) * 100 : 900 + Math.round(r() * 36) * 50;
          if (lead.status === 'bound') lead.pol = 'POL-' + lead.id.slice(3);
          lead.first = firstD; lead.at = iso(lead.dlv + firstD * DAY); lead.hist = [[lead.at, lead.status]];
        }
        if (lead.status !== ln.win && r() < 0.14) lead.els = true;
        p.leads.push(lead); L[lead.id] = lead;
      }
      P.push(p);
    });
    base = { bySeg: {} }; ['Lending', 'Insurance'].forEach(function (g) { base.bySeg[g] = stats(P.filter(function (p) { return p.type === g; })); });
    var me = byId(S.as), od = pstat(me).overdue;
    S.hooks.push({ t: '00s', ev: 'report.due', data: { overdue_leads: od, report_by: day(Date.now()) } });
  }
  var meaningful = function (s) { return s && s !== 'contacted'; };
  function median(a) { if (!a.length) return null; a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  var pstat = function (p) {
    var ln = LN(p.type), rep = 0, cov = 0, c = [0, 0, 0], firsts = [], cost = 0, els = 0, overdue = 0;
    p.leads.forEach(function (l) {
      cost += ln.products[l.prod];
      if (l.els) els++;
      if (l.status) { rep++; firsts.push(l.first); ln.stages.forEach(function (s, i) { if (s[1].indexOf(l.status) >= 0) c[i]++; }); }
      if (meaningful(l.status)) cov++;
      if (!l.status && Date.now() - l.dlv > 14 * DAY) overdue++;
    });
    var w = c[2];
    return { n: p.leads.length, rep: rep, c: c, win: w, els: els, overdue: overdue, cov: cov / p.leads.length, med: median(firsts), rate: w / p.leads.length, cpf: w ? cost / w : Infinity };
  };
  function stats(ps) { var n = 0, cov = 0, w = 0, cost = 0, ln = LN(ps[0].type), f = []; ps.forEach(function (p) { p.leads.forEach(function (l) { n++; cost += ln.products[l.prod]; if (meaningful(l.status)) cov++; if (l.status === ln.win) w++; if (l.status) f.push(l.first); }); }); return { n: n, cov: cov / n, med: median(f), rate: w / n, cpf: w ? cost / w : Infinity }; }
  var byId = function (id) { return P.filter(function (p) { return p.id === id; })[0]; };
  var cur = function () { return LN(byId(S.as).type); };
  var tier = function (s) { return s.cov >= 0.8 && s.med != null && s.med <= 7 ? ['Priority', 't-p'] : s.cov < 0.4 || s.med == null || s.med > 14 ? ['At risk', 't-r'] : ['Standard', 't-s']; };
  var cols = function (ln) { return ln.id === 'lending' ? ['lead_id', 'status', 'timestamp', 'reason_code', 'loan_amount', 'product_sold'] : ['lead_id', 'status', 'timestamp', 'reason_code', 'annual_premium', 'policy_number', 'product_sold']; };
  var days = function (d) { return d == null ? '–' : d.toFixed(1) + ' days'; };

  // ---- validation + apply
  function validate(b, partner) {
    var errs = [], p = byId(partner), ln = LN(p.type), l = b.lead_id ? L[b.lead_id] : null, st = b.status;
    if (!b.lead_id) errs.push({ field: 'lead_id', message: 'is required' });
    else if (!l || l.p !== partner) return { code: 404, body: { error: 'lead_not_found', message: 'No lead ' + b.lead_id + ' was delivered to this partner.' } };
    if (!ln.kind[st]) errs.push({ field: 'status', message: 'must be one of ' + ln.statuses.map(function (s) { return s[0]; }).join(', ') });
    var ts = Date.parse(b.timestamp);
    if (!b.timestamp || isNaN(ts) || !/^\d{4}-\d{2}-\d{2}T/.test(b.timestamp)) errs.push({ field: 'timestamp', message: 'must be an ISO 8601 date-time' });
    else if (ts > Date.now() + 5 * 60000) errs.push({ field: 'timestamp', message: 'cannot be in the future' });
    var rs = ln.reasons[st];
    if (rs && !b.reason_code) errs.push({ field: 'reason_code', message: 'is required when status is ' + st + ' (one of ' + rs.join(', ') + ')' });
    else if (b.reason_code && (!rs || rs.indexOf(b.reason_code) < 0)) errs.push({ field: 'reason_code', message: rs ? 'must be one of ' + rs.join(', ') : 'is not used with status ' + st });
    if (ln.amtReq.indexOf(st) >= 0 && !(+b[ln.amt] > 0)) errs.push({ field: ln.amt, message: 'is required when status is ' + ln.amtReq.join(' or ') });
    if (ln.polReq && st === 'bound' && !b.policy_number) errs.push({ field: 'policy_number', message: 'is required when status is bound' });
    if (b.product_sold && !ln.products[b.product_sold]) errs.push({ field: 'product_sold', message: 'must be one of ' + Object.keys(ln.products).join(', ') });
    if (errs.length) return { code: 422, body: { error: 'validation_failed', errors: errs } };
    var last = l.hist[l.hist.length - 1];
    if (last && last[1] === st && last[0] === b.timestamp) return { dup: true };
    var ck = l.status ? ln.kind[l.status] : null, nk = ln.kind[st], corr = b.correction === true || b.correction === 'true';
    if (ck && !corr && (ck === 'w' || ck === 't')) return { code: 409, body: { error: 'invalid_transition', message: 'Lead ' + l.id + ' already has a final status (' + l.status + '). Send "correction": true to change it.' } };
    if (ck && !corr && nk.charAt(0) === 'p' && ck.charAt(0) === 'p' && +nk.charAt(1) < +ck.charAt(1)) return { code: 409, body: { error: 'invalid_transition', message: 'Status cannot move back from ' + l.status + ' to ' + st + '. Send "correction": true to fix an earlier report.' } };
    return null;
  }
  function apply(b) {
    var p = byId(S.as), ln = LN(p.type), l = L[b.lead_id], prev = l.status, tb = tier(pstat(p))[0];
    l.status = b.status; l.at = b.timestamp; l.reason = b.reason_code || null;
    if (+b[ln.amt] > 0) l.amt = +b[ln.amt];
    if (b.policy_number) l.pol = b.policy_number;
    if (b.product_sold) l.sold = b.product_sold;
    if (l.first == null) l.first = Math.max(0.1, (Date.parse(b.timestamp) - l.dlv) / DAY);
    if (b.status === ln.win) l.els = false;
    l.hist.push([b.timestamp, b.status]);
    if (b.status === 'invalid') S.hooks.push({ t: clock(), ev: 'lead.credited', data: { lead_id: l.id, reason_code: b.reason_code, credit: ln.products[l.prod] } });
    var ta = tier(pstat(p))[0];
    if (ta !== tb) S.hooks.push({ t: clock(), ev: 'tier.changed', data: { from: tb.toLowerCase(), to: ta.toLowerCase() } });
    return prev;
  }
  var unreported = function (pid, n) { return byId(pid).leads.filter(function (l) { return !l.status; }).sort(function (a, b) { return a.dlv - b.dlv; }).slice(0, n || 1); };
  function summary(pid) { var p = byId(pid), s = pstat(p); return { window: 'last_30_days', leads_delivered: s.n, reporting_coverage: +(s.cov * 100).toFixed(1), median_days_to_first_status: s.med == null ? null : +s.med.toFixed(1), overdue_leads: s.overdue, tier: tier(s)[0].toLowerCase().replace(' ', '_') }; }

  // ---- code samples
  function sample(f) {
    var ln = cur(), o = { lead_id: f.lead_id || 'LT-100001', status: f.status || ln.defStatus, timestamp: f.timestamp || now() };
    if (ln.reasons[o.status] || f.reason_code) o.reason_code = f.reason_code || null;
    if (ln.amtReq.indexOf(o.status) >= 0 || (f.amount !== '' && f.amount != null && ln.amtOpt.indexOf(o.status) >= 0)) o[ln.amt] = +f.amount || 0;
    if (ln.polReq && o.status === 'bound') o.policy_number = f.policy_number || '';
    if (f.product_sold) o.product_sold = f.product_sold;
    if (f.correction) o.correction = true;
    return o;
  }
  var pretty = function (o) { return JSON.stringify(o, null, 2); };
  var hl = function (s) { return esc(s).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="k">$1</span>$2').replace(/: (&quot;[^&]*?&quot;)/g, ': <span class="s">$1</span>').replace(/: (-?\d+(\.\d+)?|null|true|false)/g, ': <span class="n">$1</span>'); };
  function codeFor(kind, o, path, ik) {
    var key = keyOf(S.as), url = 'https://sandbox.api.lendingtree.example' + path;
    if (kind === 'req') return 'POST ' + path + '\nAuthorization: Bearer ' + key + '\nIdempotency-Key: ' + ik + '\nContent-Type: application/json\n\n' + pretty(o);
    if (kind === 'curl') return 'curl -X POST ' + url + ' \\\n  -H "Authorization: Bearer ' + key + '" \\\n  -H "Idempotency-Key: ' + ik + '" \\\n  -H "Content-Type: application/json" \\\n  -d \'' + JSON.stringify(o) + '\'';
    if (kind === 'py') return 'import requests\n\nr = requests.post(\n    "' + url + '",\n    headers={\n        "Authorization": "Bearer ' + key + '",\n        "Idempotency-Key": "' + ik + '",\n    },\n    json=' + JSON.stringify(o).replace(/null/g, 'None').replace(/true/g, 'True') + ',\n)\nprint(r.status_code, r.json())';
    return 'const r = await fetch("' + url + '", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer ' + key + '",\n    "Idempotency-Key": "' + ik + '",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify(' + JSON.stringify(o) + '),\n});\nconsole.log(r.status, await r.json());';
  }
  var sel = function (k, opts, v, labels) { return '<select data-f="' + k + '">' + opts.map(function (x, i) { return '<option value="' + x + '"' + (x === v ? ' selected' : '') + '>' + (labels ? labels[i] : x) + '</option>'; }).join('') + '</select>'; };

  // ---- docs view
  function F() {
    var f = S.form, ln = cur();
    if (!f.lead_id) { var u = unreported(S.as)[0]; f.lead_id = u ? u.id : ''; f.status = f.status || ln.defStatus; f.timestamp = f.timestamp || now(); f.amount = f.amount == null ? ln.amtDef : f.amount; f.reason_code = f.reason_code || ''; f.policy_number = f.policy_number || ''; f.product_sold = f.product_sold || ''; f.correction = !!f.correction; f.ik = newKey(); }
    return f;
  }
  var SECS = [['single', 'Report an outcome'], ['batch', 'Batch (CSV)'], ['list', 'List leads'], ['read', 'Read a lead'], ['hooks', 'Webhooks'], ['errors', 'Errors & limits']];
  function docsView() {
    var p = byId(S.as), ln = LN(p.type), f = F(), B = ln.base;
    var h = '<div class="hd"><h3>Lead Outcomes</h3><span class="api">' + ln.api + '</span></div><p class="sub">Tell LendingTree what happened to each lead we send you. ' + ln.perk + ' ' + (ln.id === 'lending' ? 'Insurance partners use the Insurance API, with the same authentication, batch format and webhooks.' : 'Lenders use the Lending API, with the same authentication, batch format and webhooks.') + '</p>' +
      '<p class="terms"><b>How we use your data.</b> Outcomes train lead matching and power your reporting tier. They are never sold or shown to other partners. Use is covered by your partner agreement.</p>' +
      '<div class="sec">' + SECS.map(function (x) { return '<button data-act="sec" data-s="' + x[0] + '" class="' + (S.sec === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div>';
    if (S.sec === 'single') {
      var o = sample(f), opts = unreported(S.as, 6).map(function (l) { return l.id; }), rs = ln.reasons[f.status], amtNeed = ln.amtReq.indexOf(f.status) >= 0, amtMay = ln.amtOpt.indexOf(f.status) >= 0;
      if (opts.indexOf(f.lead_id) < 0 && f.lead_id) opts.push(f.lead_id);
      h += '<div class="cols"><div class="box"><b>POST</b> <code>' + B + '/outcomes</code><div style="height:12px"></div>' +
        '<label class="f">lead_id' + sel('lead_id', opts, f.lead_id) + '</label>' +
        '<div class="row2"><label class="f">status' + sel('status', ln.statuses.map(function (s) { return s[0]; }), f.status) + '</label>' +
        '<label class="f">reason_code' + (rs ? sel('reason_code', [''].concat(rs), f.reason_code, ['choose one'].concat(rs)) : '<select disabled><option>not used for ' + esc(f.status) + '</option></select>') + '</label></div>' +
        '<div class="row2"><label class="f"><span>' + ln.amt + (amtNeed ? '' : ' <i>optional</i>') + '</span><input data-f="amount" inputmode="numeric" value="' + esc(amtNeed || amtMay ? f.amount : '') + '"' + (amtNeed || amtMay ? '' : ' disabled') + ' placeholder="' + (amtNeed ? 'required' : amtMay ? 'optional' : 'not used for ' + esc(f.status)) + '"></label>' +
        '<label class="f"><span>product_sold <i>optional</i></span>' + sel('product_sold', [''].concat(Object.keys(ln.products)), f.product_sold, ['same as delivered'].concat(Object.keys(ln.products))) + '</label></div>' +
        (ln.polReq ? '<div class="row2"><label class="f">timestamp<input data-f="timestamp" value="' + esc(f.timestamp) + '"></label><label class="f"><span>policy_number' + (f.status === 'bound' ? '' : ' <i>bound only</i>') + '</span><input data-f="policy_number" value="' + esc(f.policy_number) + '"' + (f.status === 'bound' ? '' : ' disabled') + ' placeholder="' + (f.status === 'bound' ? 'required' : 'not used') + '"></label></div>' : '<label class="f">timestamp<input data-f="timestamp" value="' + esc(f.timestamp) + '"></label>') +
        '<label class="chk"><input type="checkbox" data-f="correction"' + (f.correction ? ' checked' : '') + '> correction <span class="note" style="margin:0">(replace an earlier or final status)</span></label>' +
        '<div class="btns"><button class="go" data-act="send">Send request</button><button class="go alt" data-act="fillbad" title="Fill a request that will fail validation">Try a bad request</button></div>' +
        '<h4>Status values</h4><div class="svals">' + ln.statuses.map(function (s) { return '<div><span class="chip c-' + s[0] + '">' + s[0] + '</span>' + s[1] + (s[2] === 't' || s[2] === 'w' ? ' <em class="fin">final</em>' : '') + '</div>'; }).join('') +
        '<div class="ro"><span class="chip c-elsewhere">' + ln.elsewhere + '</span>Set by LendingTree when another partner reports ' + ln.win + ' on the same request. Read only.</div></div>' +
        '<p class="note">Statuses only move forward. Final statuses need <code>"correction": true</code> to change. Reason codes are required for ' + Object.keys(ln.reasons).join(', ') + '.</p></div>' +
        '<div><div class="tabs2">' + [['req', 'Request'], ['curl', 'cURL'], ['py', 'Python'], ['node', 'Node.js']].map(function (t) { return '<button data-act="code" data-c="' + t[0] + '" class="' + (S.code === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        '<div class="code">' + (S.code === 'req' ? hl(codeFor('req', o, B + '/outcomes', f.ik)).replace(/^(POST [^\n]+)/, '<span class="k">$1</span>') : esc(codeFor(S.code, o, B + '/outcomes', f.ik))) + '</div>' + respView(S.resp) + '</div></div>';
    } else if (S.sec === 'batch') {
      var cs = cols(ln), reqd = 'lead_id, status and timestamp are required. reason_code is required for ' + Object.keys(ln.reasons).join(', ') + '. ' + (ln.id === 'lending' ? 'loan_amount is required for approved and funded.' : 'annual_premium and policy_number are required for bound.') + ' product_sold is optional. Up to 5,000 rows per file. Rows already reported are skipped as duplicates.';
      h += '<div class="cols"><div class="box"><b>POST</b> <code>' + B + '/outcomes/batch</code><p class="sub" style="font-size:13.5px">One row per lead. ' + reqd + '</p><div style="height:10px"></div>' +
        '<label class="f">CSV<textarea data-f="csv" spellcheck="false" placeholder="' + cs.join(',') + '">' + esc(S.csv) + '</textarea></label>' +
        '<div class="btns"><button class="go" data-act="sendbatch">Send batch</button><button class="go alt" data-act="sample">Load sample</button><label class="go alt">Upload CSV<input type="file" id="csvf" accept=".csv,text/csv" hidden></label><button class="go alt" data-act="tmpl">Download template</button></div></div>' +
        '<div>' + (S.csvResp ? respView(S.csvResp) : '<p class="sub">Load the sample (every lead you have not reported yet, plus two bad rows), then send. Send it twice to see duplicates skipped.</p>') + '</div></div>';
    } else if (S.sec === 'list') {
      h += '<div class="cols"><div class="box"><b>GET</b> <code>' + B + '/leads</code><p class="sub" style="font-size:13.5px">Find the leads that still need a status. Each lead carries a <code>report_by</code> date, 14 days after delivery.</p><div style="height:10px"></div>' +
        '<label class="f">status' + sel('lf', ['overdue', 'none', 'all'], S.lf, ['overdue (past report_by)', 'none (no status yet)', 'all']) + '</label>' +
        '<div class="btns"><button class="go" data-act="list">Send request</button></div><p class="note">Results are paginated: pass <code>next_cursor</code> as <code>cursor</code> for the next page.</p></div><div>' + respView(S.list) + '</div></div>';
    } else if (S.sec === 'read') {
      var one = unreported(S.as)[0], rep = p.leads.filter(function (l) { return l.status; })[0], el = p.leads.filter(function (l) { return l.els; })[0];
      h += '<div class="cols"><div class="box"><b>GET</b> <code>' + B + '/leads/{lead_id}</code><div style="height:12px"></div><label class="f">lead_id<input data-f="readid" value="' + esc(S.readid || (rep ? rep.id : '')) + '"></label>' +
        '<div class="btns"><button class="go" data-act="fetch">Send request</button></div><p class="note">Try <a href="#" data-act="useid" data-id="' + (rep ? rep.id : '') + '">a reported lead</a>, <a href="#" data-act="useid" data-id="' + (one ? one.id : '') + '">an unreported lead</a> or <a href="#" data-act="useid" data-id="' + (el ? el.id : '') + '">a lead another partner won</a>.</p></div><div>' + respView(S.read) + '</div></div>';
    } else if (S.sec === 'hooks') {
      var EV = [['lead.delivered', 'A new lead was sent to you.'], ['report.due', 'Daily: leads past their report_by date.'], ['lead.credited', 'A lead you marked invalid was credited back.'], ['lead.' + ln.elsewhere, 'Another partner reported ' + ln.win + ' on a request you also received.'], ['tier.changed', 'Your reporting tier changed.'], ['consumer.opted_out', 'The customer replied STOP or asked not to be contacted. Stop outreach.']];
      h += '<div class="cols"><div class="box"><b>Webhooks</b><p class="sub" style="font-size:13.5px">LendingTree posts these events to your endpoint. Each delivery is signed: verify the <code>LT-Signature</code> header, an HMAC-SHA256 of the timestamp and body using your webhook secret. Failed deliveries retry with backoff for 24 hours.</p>' +
        '<div class="svals">' + EV.map(function (e) { return '<div><span class="chip c-ev">' + e[0] + '</span>' + e[1] + '</div>'; }).join('') + '</div><div style="height:14px"></div>' +
        '<label class="f">Event' + sel('hookEv', EV.map(function (e) { return e[0]; }), S.hookEv) + '</label><div class="btns"><button class="go" data-act="testhook">Send test webhook</button></div></div>' +
        '<div><div class="tabs2"><button class="on">Delivery log</button></div><div class="code" style="min-height:140px">' + (S.hooks.length ? S.hooks.slice(-6).reverse().map(hookLine).join('\n\n') + (S.hooks.length > 6 ? '\n\n… ' + (S.hooks.length - 6) + ' earlier deliveries' : '') : 'No deliveries yet.') + '</div></div></div>';
    } else {
      var ERR = [['400', 'malformed_request', 'The body is not valid JSON or CSV.'], ['401', 'unauthorized', 'Missing or invalid API key.'], ['404', 'lead_not_found', 'The lead was not delivered to you.'], ['409', 'invalid_transition', 'The status cannot follow the current one without "correction": true.'], ['422', 'validation_failed', 'One or more fields failed validation. Each error names its field.'], ['429', 'rate_limited', 'Too many requests. Wait for the Retry-After header, then retry.'], ['5xx', 'server_error', 'Retry with exponential backoff, reusing the same Idempotency-Key.']];
      h += '<div class="cols"><div class="box"><b>Errors</b><div style="height:10px"></div><div class="svals">' + ERR.map(function (e) { return '<div><span class="chip c-err">' + e[0] + '</span><span><code>' + e[1] + '</code> ' + e[2] + '</span></div>'; }).join('') + '</div></div>' +
        '<div class="box"><b>Keys, limits and versions</b><div class="svals lim">' +
        '<div><span class="lk">Environments</span><span>Sandbox <code>sandbox.api.lendingtree.example</code> and production <code>api.lendingtree.example</code>, each with its own key.</span></div>' +
        '<div><span class="lk">Your key</span><span><code>' + keyOf(S.as) + '</code> (sandbox). Rotate it in the partner portal. The old key keeps working for 24 hours.</span></div>' +
        '<div><span class="lk">Rate limit</span><span>600 requests a minute per key. Batches up to 5,000 rows.</span></div>' +
        '<div><span class="lk">Idempotency</span><span>Send an <code>Idempotency-Key</code> on every POST. Repeats within 24 hours return the original result.</span></div>' +
        '<div><span class="lk">Versioning</span><span>Breaking changes ship as a new version (<code>/v2</code>) with 12 months\' notice. Additive changes are announced in the changelog.</span></div>' +
        '</div></div></div>';
    }
    docs.innerHTML = h;
    var cf = $('#csvf'); if (cf) cf.addEventListener('change', function () { var fl = cf.files[0]; if (!fl) return; var r = new FileReader(); r.onload = function () { S.csv = String(r.result).slice(0, 600000); docsView(); }; r.readAsText(fl); });
  }
  function hookLine(w) {
    var ln = cur(), ts = Math.floor(t0 / 1000) + parseInt(w.t, 10), body = { event: w.ev, created_at: iso(ts * 1000), data: w.data };
    return esc(w.t + '  POST https://partner.example/hooks/lendingtree  200\nLT-Signature: t=' + ts + ',v1=' + hex(rng(ts + JSON.stringify(w.data).length * 31 + w.ev.length), 16) + '…\n' + JSON.stringify(body));
  }
  var CODES = { 200: 'OK', 404: 'Not Found', 409: 'Conflict', 422: 'Unprocessable' };
  function respView(r) {
    if (!r) return '<div class="resp"><p class="sub" style="font-size:13.5px">Send the request to see the response.</p></div>';
    var h = '<div class="resp"><span class="st ' + (r.code < 300 ? 'ok' : 'bad') + '">' + r.code + ' ' + (CODES[r.code] || '') + '</span> <span class="note">' + r.ms + ' ms</span><div class="code" style="max-height:300px">' + hl(pretty(r.body)) + '</div>';
    if (r.summary) h += '<p class="note" style="margin-top:14px">Then check your standing:</p><div class="code"><span class="k">GET ' + cur().base + '/reporting</span>\n\n' + hl(pretty(r.summary)) + '</div>' + (r.cov ? '<p class="note">' + r.cov + '</p>' : '') + '<div class="btns"><button class="go alt" data-act="todash">See it on LendingTree\'s dashboard</button></div>';
    return h + '</div>';
  }

  // ---- dashboard view (LendingTree internal)
  function dashView() {
    var ps = P.filter(function (p) { return p.type === S.seg; }), ln = LN(S.seg), st = stats(ps), bs = base.bySeg;
    var dl = function (c, ref, unit, inv) { if (c == null || ref == null) return ''; var d = c - ref; if (Math.abs(d) < 0.00005 || (unit === 'd' && Math.abs(d) < 0.05)) return ''; var up = inv ? d < 0 : d > 0; return '<em class="' + (up ? '' : 'dn') + '">' + (d > 0 ? '▲ ' : '▼ ') + (unit === 'pp' ? Math.abs(d * 100).toFixed(1) + ' pp' : unit === '$' ? money(Math.abs(d)) : Math.abs(d).toFixed(1)) + '</em>'; };
    var rows = ps.map(function (p) { var s = pstat(p); return { p: p, s: s, delivered: s.n, cov: s.cov, med: s.med == null ? 99 : s.med, win: s.win, rate: s.rate, cpf: s.cpf, name: p.name }; });
    rows.sort(function (a, b) { var x = a[S.sort], y = b[S.sort]; return (x < y ? -1 : x > y ? 1 : 0) * S.dir; });
    var th = function (k, t) { return '<th data-act="sort" data-k="' + k + '">' + t + (S.sort === k ? (S.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>'; };
    var sl = byId(S.sel); if (sl.type !== S.seg) { sl = ps[0]; S.sel = sl.id; } var ss = pstat(sl);
    var stages = [['Delivered', ss.n], ['Reported', ss.rep]].concat(ln.stages.map(function (x, i) { return [x[0], ss.c[i]]; }));
    var changed = [st.cov - bs[S.seg].cov, st.rate - bs[S.seg].rate].some(function (d) { return Math.abs(d) > 0.00005; });
    dash.innerHTML = '<h3>Partner performance</h3><p class="sub">LendingTree\'s view of how ' + S.seg.toLowerCase() + ' partners perform, from leads delivered to customer outcomes. Last 30 days.</p>' +
      '<div class="sec"><button data-act="seg" data-s="Lending" class="' + (S.seg === 'Lending' ? 'on' : '') + '">Lending partners</button><button data-act="seg" data-s="Insurance" class="' + (S.seg === 'Insurance' ? 'on' : '') + '">Insurance partners</button></div>' +
      '<div class="kp k5"><div><span>Leads delivered</span><b>' + num(st.n) + '</b></div><div><span>Reporting coverage (goal 80%)</span><b>' + pct(st.cov) + dl(st.cov, bs[S.seg].cov, 'pp') + '</b></div><div><span>Median days to first status</span><b>' + (st.med == null ? '–' : st.med.toFixed(1)) + dl(st.med, bs[S.seg].med, 'd', true) + '</b></div><div><span>' + ln.kpiRate + '</span><b>' + pct(st.rate) + dl(st.rate, bs[S.seg].rate, 'pp') + '</b></div><div><span>' + ln.kpiCost + '</span><b>' + money(st.cpf) + dl(st.cpf, bs[S.seg].cpf, '$', true) + '</b></div></div>' +
      (changed ? '<p class="note" style="margin-top:-6px">▲▼ change since you opened this prototype.</p>' : '') +
      '<div class="tbl"><table><tr>' + th('name', 'Partner') + th('delivered', 'Leads delivered') + th('cov', 'Reporting coverage') + th('med', 'Days to first status') + th('win', ln.colWin) + th('rate', ln.colRate) + th('cpf', ln.colCost) + '<th>Tier</th></tr>' +
      rows.map(function (r) { var t = tier(r.s); return '<tr class="pick' + (r.p.id === S.sel ? ' on' : '') + '" data-act="selp" data-id="' + r.p.id + '"><td><span class="pn">' + pmark(r.p) + '<b>' + r.p.name + '</b></span></td><td>' + num(r.delivered) + '</td><td><span class="cov"><i style="width:' + (r.cov * 100) + '%"></i><u></u></span>' + pct(r.cov, 0) + '</td><td>' + (r.s.med == null ? '–' : r.s.med.toFixed(1)) + '</td><td>' + num(r.win) + '</td><td>' + pct(r.rate) + '</td><td>' + (isFinite(r.cpf) ? money(r.cpf) : '–') + '</td><td><span class="tier ' + t[1] + '">' + t[0] + '</span></td></tr>'; }).join('') + '</table></div>' +
      '<p class="note">Coverage counts leads with an outcome status; "contacted" alone does not count. The black tick marks 80%. Priority needs 80% coverage and a median of 7 days or less to first status; under 40% or over 14 days is at risk. ' + (ln.id === 'lending' ? 'Priority lenders get better-matched leads and reporting-tier benefits.' : 'Priority carriers earn better placement and pricing.') + ' ' + ln.kpiCost + ' is lead cost over ' + ln.winWord + '; lead costs by product are illustrative.</p>' +
      '<h4>' + sl.name + ': ' + ln.funTitle + '</h4><div class="box fun">' + stages.map(function (s) { return '<div><span>' + s[0] + '</span><span><i style="width:' + (s[1] / ss.n * 100) + '%"></i></span><b>' + num(s[1]) + ' · ' + pct(s[1] / ss.n, 0) + '</b></div>'; }).join('') +
      '<div class="lost"><span>' + ln.lostRow + '</span><span><i style="width:' + (ss.els / ss.n * 100) + '%"></i></span><b>' + num(ss.els) + ' · ' + pct(ss.els / ss.n, 0) + '</b></div>' +
      '<p class="note">' + num(ss.n - ss.rep) + ' leads have no reported status, ' + num(ss.overdue) + ' of them past their report_by date. ' + num(ss.els) + ' were won by another ' + (ln.id === 'lending' ? 'lender' : 'carrier') + ' on the same request: the closed loop is the only way anyone sees that.</p></div>';
  }
  function introView() {
    var p = byId(S.as), ln = LN(p.type), s = pstat(p), t = tier(s)[0].toLowerCase();
    $('#intro').innerHTML = S.tab === 'docs'
      ? '<b>Prototype with sample data.</b> You are <b>' + p.name + '</b>, ' + ln.noun + ' partner. In the last 30 days ' + pct(s.cov, 0) + ' of your leads have an outcome (goal: 80%), with a median of ' + days(s.med) + ' to first status, which puts you in the <b>' + t + '</b> tier. Try it: report one outcome, or load the sample batch and send it, then open the dashboard. Partner names and logos are for illustration; all figures are invented.'
      : '<b>Prototype with sample data.</b> This is LendingTree\'s internal view. Select a partner row to see its funnel. Updates you send from the developer docs show up here.';
  }
  function render() {
    var opt = function (type) { return P.filter(function (p) { return p.type === type; }).map(function (p) { return '<option value="' + p.id + '"' + (p.id === S.as ? ' selected' : '') + '>' + p.name + '</option>'; }).join(''); };
    $('#who').innerHTML = S.tab === 'docs' ? 'Demo: sign in as ' + pmark(byId(S.as)) + '<select data-f="as" aria-label="Demo: sign in as partner"><optgroup label="Lenders">' + opt('Lending') + '</optgroup><optgroup label="Insurers">' + opt('Insurance') + '</optgroup></select>' : 'LendingTree internal · Last 30 days';
    docs.hidden = S.tab !== 'docs'; dash.hidden = S.tab !== 'dash';
    document.querySelectorAll('.odtabs [data-t]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === S.tab); });
    introView();
    if (S.tab === 'docs') docsView(); else dashView();
  }

  // ---- actions
  function send(body) {
    var t = 12 + Math.floor(Math.random() * 30), e = validate(body, S.as), l = L[body.lead_id];
    if (e && e.dup) { S.resp = { code: 200, ms: t, body: { lead_id: body.lead_id, status: body.status, duplicate: true, message: 'Already recorded. Nothing changed.' }, summary: summary(S.as) }; return false; }
    if (e) { S.resp = { code: e.code, ms: t, body: e.body }; return false; }
    var before = pstat(byId(S.as)), prev = apply(body), after = pstat(byId(S.as));
    var o = { lead_id: body.lead_id, status: body.status, previous_status: prev, recorded_at: now() };
    if (body.correction) o.correction = true;
    if (l.els) o.network_outcome = cur().elsewhere;
    S.resp = { code: 200, ms: t, body: o, summary: summary(S.as), cov: 'Coverage for ' + byId(S.as).name + ' moved from ' + pct(before.cov, 2) + ' to ' + pct(after.cov, 2) + '.' };
    return true;
  }
  function parseCsv(csv) { return csv.split(/\r?\n/).filter(function (x) { return x.trim(); }); }
  function sendBatch(csv) {
    var lines = parseCsv(csv); if (!lines.length) { S.csvResp = { code: 422, ms: 8, body: { error: 'validation_failed', errors: [{ field: 'file', message: 'is empty' }] } }; return; }
    if (lines.length > 5001) { S.csvResp = { code: 422, ms: 9, body: { error: 'validation_failed', errors: [{ field: 'file', message: 'has more than 5,000 rows' }] } }; return; }
    var hdr = lines[0].split(',').map(function (x) { return x.trim(); }), errors = [], ok = 0, dup = 0, before = pstat(byId(S.as));
    if (hdr.indexOf('lead_id') < 0 || hdr.indexOf('status') < 0) { S.csvResp = { code: 422, ms: 9, body: { error: 'validation_failed', errors: [{ field: 'header', message: 'must include lead_id, status and timestamp' }] } }; return; }
    lines.slice(1).forEach(function (row, i) {
      var c = row.split(','), b = {}; hdr.forEach(function (h, k) { b[h] = (c[k] || '').trim(); });
      var e = validate(b, S.as);
      if (e && e.dup) dup++;
      else if (e) errors.push({ row: i + 2, lead_id: b.lead_id || null, error: e.body.error, detail: e.body.errors ? e.body.errors.map(function (x) { return x.field + ' ' + x.message; }).join('; ') : e.body.message });
      else { apply(b); ok++; }
    });
    var after = pstat(byId(S.as));
    S.csvResp = { code: errors.length && !ok && !dup ? 422 : 200, ms: 40 + Math.round(lines.length / 8), body: { received: lines.length - 1, processed: ok, duplicates: dup, rejected: errors.length, errors: errors }, summary: summary(S.as), cov: 'Coverage for ' + byId(S.as).name + ' moved from ' + pct(before.cov) + ' to ' + pct(after.cov) + '.' };
  }
  function sampleCsv() {
    var p = byId(S.as), ln = LN(p.type), cs = cols(ln), u = unreported(S.as, 99999), rg = rng(41), out = [cs.join(',')];
    var row = function (o) { return cs.map(function (k) { return o[k] == null ? '' : o[k]; }).join(','); };
    var mix = ln.id === 'lending' ? [[.2, 'funded'], [.32, 'approved'], [.48, 'applied'], [.62, 'declined'], [.72, 'withdrawn'], [.95, 'no_contact'], [1, 'invalid']] : [[.22, 'bound'], [.34, 'applied'], [.54, 'quoted'], [.64, 'declined'], [.76, 'lost'], [.97, 'no_contact'], [1, 'invalid']];
    u.forEach(function (l) {
      var x = rg(), st = mix.filter(function (m) { return x < m[0]; })[0][1], o = { lead_id: l.id, status: st, timestamp: iso(Math.min(Date.now() - 60000, l.dlv + (0.5 + rg() * 5) * DAY)) };
      var rs = ln.reasons[st]; if (rs) o.reason_code = rs[Math.floor(rg() * rs.length)];
      if (ln.amtReq.indexOf(st) >= 0) o[ln.amt] = ln.id === 'lending' ? 18000 + Math.round(rg() * 14) * 500 : 1200 + Math.round(rg() * 30) * 50;
      if (st === 'bound') o.policy_number = 'POL-' + l.id.slice(3);
      out.push(row(o));
    });
    var bad = { lead_id: 'LT-999999', status: ln.win, timestamp: now() }; bad[ln.amt] = ln.id === 'lending' ? 15000 : 1500; bad.policy_number = 'POL-999999';
    out.splice(3, 0, row(bad));
    var b2 = (out[9] || '').split(','); if (b2.length > 1) { b2[1] = ln.win; b2[3] = ''; for (var i = 4; i < b2.length; i++) b2[i] = ''; out[9] = b2.join(','); }
    return out.join('\n');
  }
  function listLeads() {
    var p = byId(S.as), ln = LN(p.type), all = p.leads.slice().sort(function (a, b) { return a.dlv - b.dlv; }), due = function (l) { return l.dlv + 14 * DAY; };
    var f = S.lf === 'overdue' ? all.filter(function (l) { return !l.status && due(l) < Date.now(); }) : S.lf === 'none' ? all.filter(function (l) { return !l.status; }) : all;
    var page = f.slice(0, 5).map(function (l) { return { lead_id: l.id, product: l.prod, delivered_at: iso(l.dlv), report_by: day(due(l)), status: l.status }; });
    S.list = { code: 200, ms: 18, body: { data: page, total: f.length, has_more: f.length > 5, next_cursor: f.length > 5 ? 'c_' + hex(rng(f.length), 10) : null } };
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return; var a = el.getAttribute('data-act');
    if (a === 'tab') { S.tab = el.getAttribute('data-t'); if (S.tab === 'dash') { var tp0 = byId(S.as); S.seg = tp0.type; S.sel = tp0.id; } render(); }
    else if (a === 'sec') { S.sec = el.getAttribute('data-s'); render(); }
    else if (a === 'code') { S.code = el.getAttribute('data-c'); docsView(); }
    else if (a === 'send') { var f = F(), b = sample(f); if (send(b)) { S.form = {}; F(); } else { f.ik = newKey(); } render(); }
    else if (a === 'fillbad') { var ln = cur(), ub = unreported(S.as)[0], bad = { lead_id: ub ? ub.id : 'LT-100001', status: ln.win, timestamp: 'yesterday', amount: '', policy_number: '', product_sold: '', reason_code: '', correction: false }; S.form = bad; var b2 = sample(bad); b2.timestamp = 'yesterday'; delete b2[ln.amt]; send(b2); S.form = {}; render(); }
    else if (a === 'sample') { S.csv = sampleCsv(); S.csvResp = null; docsView(); }
    else if (a === 'sendbatch') { var ta = docs.querySelector('textarea'); S.csv = ta ? ta.value : S.csv; sendBatch(S.csv); render(); }
    else if (a === 'tmpl') { var ln2 = cur(), tr = ln2.id === 'lending' ? 'LT-123456,funded,2026-10-01T15:30:00Z,,25000,' : 'LT-123456,bound,2026-10-01T15:30:00Z,,1840,POL-123456,'; var bl = new Blob([cols(ln2).join(',') + '\n' + tr + '\n'], { type: 'text/csv' }), u = URL.createObjectURL(bl), lk = document.createElement('a'); lk.href = u; lk.download = 'lead_outcomes_template.csv'; lk.click(); setTimeout(function () { URL.revokeObjectURL(u); }, 500); }
    else if (a === 'list') { listLeads(); docsView(); }
    else if (a === 'fetch') {
      var ln3 = cur(), id = ((docs.querySelector('[data-f="readid"]') || {}).value || '').trim(); S.readid = id; var ld = L[id], ok = ld && ld.p === S.as;
      if (ok) { var rb = { lead_id: ld.id, product: ld.prod, delivered_at: iso(ld.dlv), report_by: day(ld.dlv + 14 * DAY), status: ld.status, reason_code: ld.reason }; rb[ln3.amt] = ld.amt; if (ln3.polReq) rb.policy_number = ld.pol; rb.product_sold = ld.sold; rb.network_outcome = ld.els ? ln3.elsewhere : null; rb.history = ld.hist.map(function (h) { return { timestamp: h[0], status: h[1] }; }); S.read = { code: 200, ms: 14, body: rb }; }
      else S.read = { code: 404, ms: 11, body: { error: 'lead_not_found', message: 'No lead ' + id + ' was delivered to this partner.' } };
      docsView();
    }
    else if (a === 'useid') { e.preventDefault(); S.readid = el.getAttribute('data-id'); docsView(); }
    else if (a === 'testhook') {
      var ln4 = cur(), ev = S.hookEv, l4 = unreported(S.as)[0] || byId(S.as).leads[0], data;
      if (ev === 'lead.delivered') data = { lead_id: l4.id, product: l4.prod, delivered_at: now() };
      else if (ev === 'report.due') data = { overdue_leads: pstat(byId(S.as)).overdue, report_by: day(Date.now()) };
      else if (ev === 'lead.credited') data = { lead_id: l4.id, reason_code: 'duplicate', credit: ln4.products[l4.prod] };
      else if (ev === 'tier.changed') data = { from: 'standard', to: 'priority' };
      else if (ev === 'consumer.opted_out') data = { lead_id: l4.id, channel: 'sms', at: now() };
      else data = { lead_id: l4.id, network_outcome: ln4.elsewhere };
      S.hooks.push({ t: clock(), ev: ev, data: data, test: true }); docsView();
    }
    else if (a === 'seg') { S.seg = el.getAttribute('data-s'); S.sel = P.filter(function (p) { return p.type === S.seg; })[0].id; dashView(); }
    else if (a === 'sort') { var k = el.getAttribute('data-k'); S.dir = S.sort === k ? -S.dir : (k === 'name' || k === 'med' ? 1 : -1); S.sort = k; dashView(); }
    else if (a === 'todash') { var tp = byId(S.as); S.tab = 'dash'; S.seg = tp.type; S.sel = tp.id; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'selp') { S.sel = el.getAttribute('data-id'); dashView(); }
  });
  document.addEventListener('change', function (e) {
    var el = e.target, k = el.getAttribute && el.getAttribute('data-f'); if (!k) return;
    if (k === 'as') { S.as = el.value; S.form = {}; S.resp = null; S.csvResp = null; S.read = null; S.readid = ''; S.csv = ''; S.list = null; S.hooks = [{ t: clock(), ev: 'report.due', data: { overdue_leads: pstat(byId(S.as)).overdue, report_by: day(Date.now()) } }]; render(); return; }
    if (k === 'correction') { S.form.correction = el.checked; docsView(); return; }
    if (k === 'csv') { S.csv = el.value; return; }
    if (k === 'readid') { S.readid = el.value; return; }
    if (k === 'lf') { S.lf = el.value; return; }
    if (k === 'hookEv') { S.hookEv = el.value; return; }
    var ln = cur(); S.form[k] = el.value;
    if (k === 'status') {
      var st = el.value, needs = ln.amtReq.indexOf(st) >= 0 || ln.amtOpt.indexOf(st) >= 0;
      if (!needs) S.form.amount = ''; else if (!S.form.amount) S.form.amount = ln.amtDef;
      S.form.reason_code = '';
      S.form.policy_number = ln.polReq && st === 'bound' ? 'POL-' + String(S.form.lead_id || '').slice(3) : '';
    }
    docsView();
  });
  fresh();
  if (/dash/.test(location.hash)) { var tp0 = byId(S.as); S.tab = 'dash'; S.seg = tp0.type; S.sel = tp0.id; }
  window.addEventListener('hashchange', function () { S.tab = /dash/.test(location.hash) ? 'dash' : 'docs'; render(); });
  render();
})();
