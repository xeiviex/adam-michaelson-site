/* /lendingtree deck: seven screens, navigation, tabbed sheets. Content comes from data.js.
   Each slide is a title, one message, and one large drawing. Economics, the 180-day plan and details open in a sheet. */
import { SLIDES, DAYS, LEGACY, LEGACY_ARCHIVE_IDS, MEASURES, MEASURE_HEAD, TAGS, BARS, rollup } from './data.js';
import { mountPreview, mountLab, E as EMB, setEmbed, onEmbedChange } from './embed.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const ids = SLIDES.map((s) => s.id);
const root = document.documentElement;
const NAMES = { overview: 'Overview', roadmap: 'Roadmap ROI optimization', 'down-funnel': 'Down-funnel lending and insurance', mcp: 'MCP/API', embedded: 'Embedded', disruption: 'Disruption', teams: 'Team optimization' };
const two = (n) => String(n).padStart(2, '0');

/* ---------- old fragments (before anything renders) ---------- */
(function legacy() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return;
  if (LEGACY[h]) history.replaceState(null, '', location.pathname + location.search + LEGACY[h]);
  else if (LEGACY_ARCHIVE_IDS.includes(h)) location.replace('/lendingtree1/#' + h);
})();

const tag = (t) => '<span class="tag tag-' + t + '">' + TAGS[t] + '</span> ';

/* A track is a line with stations. Horizontal on wide screens, vertical on phones. */
const track = (items, cls = '', label = '') => '<ol class="trk ' + cls + '"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' +
  items.map((i) => '<li class="' + (i.c || '') + '"><span class="st">' + (i.k ? '<em>' + esc(i.k) + '</em>' : '') + '<b>' + esc(i.t) + '</b>' + (i.s ? '<small>' + esc(i.s) + '</small>' : '') + '</span></li>').join('') + '</ol>';

/* ---------- the seven drawings ---------- */
const VIS = {
  overview() {
    const toc = SLIDES.slice(1).map((s, i) => '<li><a href="#' + s.id + '"><i>' + two(i + 2) + '</i><span>' + esc(NAMES[s.id]) + '</span></a></li>').join('');
    const li = (x) => '<li>' + x + '</li>';
    return '<div class="ov"><div class="shift">' +
      '<section class="era was" aria-labelledby="era-a"><h3 id="era-a"><b>Today</b> Lead generation</h3>' +
      '<ol class="pipe"><li>Shopper</li><li class="mid">LendingTree<small>Sells the lead</small></li><li>Lender or carrier</li></ol>' +
      '<p>One handoff, paid once at the match. Then the relationship ends, for the shopper and for the partner.</p></section>' +
      '<section class="era will" aria-labelledby="era-b"><h3 id="era-b"><b>The next chapter</b> Financial products platform</h3>' +
      '<div class="plat"><div class="side"><h4>Shoppers reach it through</h4><ul>' + ['LendingTree.com', 'AI assistants', 'Partner products'].map(li).join('') + '</ul></div>' +
      '<span class="both" aria-hidden="true"></span>' +
      '<div class="core"><b>LendingTree platform</b><ul>' + ['Offers and quotes', 'Compare and choose', 'Transactions', 'Servicing and renewal'].map(li).join('') + '</ul></div>' +
      '<span class="both" aria-hidden="true"></span>' +
      '<div class="side"><h4>Lenders and carriers</h4><ul>' + ['Publish offers and quotes', 'Win customers who chose them', 'See outcomes and improve'].map(li).join('') + '</ul></div></div>' +
      '<p>Value flows both ways, across the whole lifecycle. Shoppers come back. Partners build on it.</p></section></div>' +
      '<nav class="tocn" aria-label="Six strategies"><h3>Six strategies</h3><ol class="toc">' + toc + '</ol></nav></div>';
  },
  roadmap() {
    const seg = (c, f, t) => '<i class="' + c + '" style="flex:' + f + ' 0 0"><span>' + t + '</span></i>';
    const bar = (label, segs) => '<div class="capb"><p><b>' + label + '</b></p><div class="cbt"><div class="cbs">' + segs + '</div></div></div>';
    return '<div class="rmap"><div class="rm-bars" role="group" aria-label="Illustration: today’s roadmap is sorted into continue, re-scope and stop, and the freed capacity funds new work">' +
      bar('Today’s roadmap', seg('keep', 5, 'Continue') + seg('keep', 3, 'Continue') + seg('stop', 4, 'Re-scope') + seg('stop', 5, 'Stop')) +
      '<p class="turn" aria-hidden="true">Score every commitment, then decide</p>' +
      bar('Six-month roadmap, within capacity', seg('keep', 5, 'Continue') + seg('keep', 3, 'Continue') + seg('start', 4, 'Start') + seg('start', 3, 'Start') + seg('start', 2, 'Start')) +
      '<p class="fine">Illustration, not LendingTree data.</p></div>' +
      '<div class="roi-how"><h3>How we calculate ROI</h3><p class="eq">Net value <span>÷</span> remaining cost</p>' +
      '<ul><li>Net value is new contribution plus savings, minus what it still costs.</li><li>Money already spent does not count.</li><li>Rank by net value per team-month.</li></ul></div></div>';
  },
  'down-funnel'() {
    const lane = (pre, first, later) => [{ t: pre, c: 'was' }, ...first.map((t, i) => ({ t, c: 'on' + (i ? ' link' : '') })), ...later.map((t) => ({ t, c: 'later' }))];
    return '<div class="df">' +
      '<p class="before"><b>Today</b><span>Paid at the match</span></p><p class="zone"><b>First investment</b><span>What a shopper can do in the first release</span></p>' +
      '<h3 class="ln l1">Lending</h3>' + track(lane('Discover, consent, match', ['Generate offers', 'Present and compare', 'Select'], ['Application', 'Underwriting or approval', 'Funding', 'Servicing or refinance']), 'l1', 'Lending path') +
      '<h3 class="ln l2">Insurance</h3>' + track(lane('Discover, consent, match', ['Generate quotes', 'Present and compare', 'Select'], ['Application or underwriting', 'Bind', 'Servicing', 'Renewal and re-shop']), 'l2', 'Insurance path') +
      '<p class="after"><b>Later</b><span>Funded as evidence supports. Partner status feeds back to measure the pilot.</span></p></div>';
  },
  mcp() {
    return '<div class="hub" role="group" aria-label="Channels reach shared LendingTree APIs, which reach lenders and carriers">' +
      '<ul class="hub-in" aria-label="Channels"><li class="on"><b>AI assistants and agents</b><small>Through the MCP interface</small></li><li><b>Partner products</b><small>Through the Embedded SDK</small></li><li><b>LendingTree.com</b><small>Shopping today</small></li></ul>' +
      '<div class="hub-core"><b>Shared LendingTree APIs</b><ul><li>Eligibility</li><li>Offers and quotes</li><li>Consented handoff</li><li>Status</li></ul><small>Existing capabilities first. Offer-stage capabilities as they arrive.</small></div>' +
      '<div class="hub-out"><b>Lenders and carriers</b><small>Authorized capabilities and partner networks</small></div></div>';
  },
  embedded() {
    return '<div class="emv"><div class="em-stage"><div class="em-chrome" aria-hidden="true"><i></i><i></i><i></i></div><div data-embed-preview></div></div>' +
      '<form class="em-side" onsubmit="return false"><h3>Partners configure</h3>' +
      '<fieldset><legend>Brand</legend><label><input type="radio" name="sp" value="northbeam"> Northbeam Home</label><label><input type="radio" name="sp" value="fernhill"> Fernhill Rewards</label></fieldset>' +
      '<fieldset><legend>Vertical</legend><label><input type="radio" name="sv" value="lending"> Lending</label><label><input type="radio" name="sv" value="insurance"> Insurance</label></fieldset>' +
      '<h3>LendingTree always enforces</h3><p class="lock">Consent, disclosures, offer integrity, security, attribution</p><p class="fine">Illustrative preview with made-up offers.</p></form></div>';
  },
  disruption() {
    const gates = [['Open charter', 'Threat or opportunity, hypothesis'], ['Smallest test', 'With a comparison cohort'], ['Evidence review', 'Against the threshold'], ['Decision', 'Scale, pivot, or stop']];
    return '<div class="pods" role="group" aria-label="Three principal-led pods pass through the same four gates: open charter, smallest test, evidence review, decision">' +
      '<ol class="gates">' + gates.map((g) => '<li><b>' + g[0] + '</b><small>' + g[1] + '</small></li>').join('') + '</ol>' +
      ['A', 'B', 'C'].map((p) => '<div class="pod"><h3>Pod ' + p + '<small>Principal-led</small></h3><div class="pl" aria-hidden="true"><i class="open"></i><i></i><i></i><i class="end"></i></div></div>').join('') +
      '<p class="fine">Charters stay open until the principals shape them.</p></div>';
  },
  teams() {
    return '<div class="tcy">' +
      track([{ k: 'By Day 30', t: 'Set expectations', s: 'Outputs and outcomes for every role', c: 'on' }, { k: 'By Day 60', t: 'Assess the team', s: 'Each person’s capabilities and engagement', c: 'on link' }, { k: 'By Day 90', t: 'Act', s: 'Develop, redeploy, hire, or contract', c: 'on link' }, { k: 'From Day 90', t: 'Assess new members', s: 'Same expectations, then repeat', c: 'later' }], 'tsteps', 'Team optimization steps') +
      '<p class="hire"><b>Hiring pipeline</b><span>Open from day one, for employees and contractors</span></p></div>';
  },
};

/* ---------- build the slides ---------- */
const trackEl = $('#track');
trackEl.innerHTML = SLIDES.map((s, i) =>
  '<section class="slide" id="slide-' + s.id + '" data-i="' + i + '" aria-roledescription="slide" aria-labelledby="h-' + s.id + '"><div class="sb">' +
  '<header class="sh"><p class="kicker"><i>' + two(i + 1) + '</i>' + esc(NAMES[s.id]) + '</p><h2 id="h-' + s.id + '" tabindex="-1">' + esc(s.title) + '</h2></header>' +
  '<div class="vis">' + VIS[s.id]() + '</div>' +
  '<footer class="rail"><button type="button" class="btn" data-open="' + s.id + '" aria-haspopup="dialog">Details</button></footer></div></section>').join('');
const slides = [...trackEl.querySelectorAll('.slide')];

const dots = $('#dots');
dots.innerHTML = SLIDES.map((s, i) => '<li><a href="#' + s.id + '" data-go="' + i + '" aria-label="Slide ' + (i + 1) + ': ' + esc(NAMES[s.id]) + '"><span aria-hidden="true"></span></a></li>').join('');

/* ---------- embedded drawing ---------- */
mountPreview($('[data-embed-preview]'), { controls: false });
const side = $('.em-side');
const syncSide = () => side.querySelectorAll('input').forEach((r) => { r.checked = r.value === (r.name === 'sp' ? EMB.partner : EMB.vertical); });
side.addEventListener('change', (e) => { const t = e.target; setEmbed(t.name === 'sp' ? { partner: t.value } : { vertical: t.value }); });
onEmbedChange(syncSide); syncSide();

/* ---------- navigation ---------- */
const live = $('#live'), status = $('#status'), where = $('#where'), prevB = $('#prev'), nextB = $('#next');
const mq = window.matchMedia('(max-width: 760px)');
let idx = 0, ready = false;
const vertical = () => mq.matches;

function show(i, announce = true) {
  const old = idx; idx = Math.max(0, Math.min(SLIDES.length - 1, i));
  const hadFocus = slides[old] && slides[old].contains(document.activeElement);
  trackEl.style.setProperty('--i', idx);
  slides.forEach((el, k) => { const on = k === idx; el.inert = !on; el.setAttribute('aria-hidden', on ? 'false' : 'true'); el.classList.toggle('on', on); });
  const a = slides[idx]; a.scrollTop = 0;
  status.textContent = (idx + 1) + ' / ' + SLIDES.length; where.textContent = NAMES[ids[idx]];
  prevB.setAttribute('aria-disabled', idx === 0 ? 'true' : 'false'); nextB.setAttribute('aria-disabled', idx === SLIDES.length - 1 ? 'true' : 'false');
  dots.querySelectorAll('a').forEach((d, k) => { if (k === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); d.classList.toggle('done', k < idx); });
  document.title = SLIDES[idx].title + ' | The next chapter at LendingTree | Adam Michaelson';
  if (hadFocus && old !== idx) a.querySelector('h2').focus({ preventScroll: true });
  if (announce && ready && old !== idx) say('Slide ' + (idx + 1) + ' of ' + SLIDES.length + ': ' + SLIDES[idx].title);
  fitOverflow();
}
let sayT; function say(m) { clearTimeout(sayT); live.textContent = ''; sayT = setTimeout(() => { live.textContent = m; }, 60); }

let mine = false;
function go(i) {
  if (i < 0) return say('This is the first slide.');
  if (i >= SLIDES.length) return say('This is the last slide.');
  if (i === idx) return;
  show(i);
  if (location.hash !== '#' + ids[i]) { mine = true; location.hash = ids[i]; } // one history entry per slide, so back and forward work
}
window.addEventListener('hashchange', () => {
  if (mine) { mine = false; return; }
  const h = decodeURIComponent(location.hash.slice(1));
  if (LEGACY[h]) { history.replaceState(null, '', location.pathname + LEGACY[h]); return show(ids.indexOf(LEGACY[h].slice(1))); }
  if (LEGACY_ARCHIVE_IDS.includes(h)) return location.replace('/lendingtree1/#' + h);
  const k = ids.indexOf(h); show(k < 0 ? 0 : k);
});
prevB.addEventListener('click', () => go(idx - 1)); nextB.addEventListener('click', () => go(idx + 1));
dots.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(+a.dataset.go); });
trackEl.addEventListener('click', (e) => { const a = e.target.closest('.toc a'); if (!a) return; e.preventDefault(); go(ids.indexOf(a.getAttribute('href').slice(1))); });

const anyDialog = () => !!document.querySelector('dialog[open]');
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented || anyDialog() || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const t = e.target; if (t.closest && t.closest('input,select,textarea,[contenteditable],[role=slider],[role=tab],[role=listbox],summary')) return;
  const v = vertical(); const sc = slides[idx]; const scrolls = sc.scrollHeight > sc.clientHeight + 2;
  let d = 0;
  if (e.key === 'ArrowRight') d = 1; else if (e.key === 'ArrowLeft') d = -1;
  else if (v && !scrolls && e.key === 'ArrowDown') d = 1; else if (v && !scrolls && e.key === 'ArrowUp') d = -1;
  else if (e.key === 'Home') { e.preventDefault(); return go(0); } else if (e.key === 'End') { e.preventDefault(); return go(SLIDES.length - 1); }
  else if (e.key === 'PageDown' && !scrolls) d = 1; else if (e.key === 'PageUp' && !scrolls) d = -1;
  if (d) { e.preventDefault(); go(idx + d); }
});

/* swipe: directional, discrete, never inside sheets, forms or scrollable tables */
let t0 = null;
const vp = $('#viewport');
vp.addEventListener('scroll', () => { if (vp.scrollLeft || vp.scrollTop) { vp.scrollLeft = 0; vp.scrollTop = 0; } }); // focus can nudge the clipped track; keep it pinned
vp.addEventListener('touchstart', (e) => {
  if (anyDialog() || e.touches.length !== 1 || e.target.closest('input,select,textarea,label,.tw,pre,button,a')) { t0 = null; return; }
  t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
vp.addEventListener('touchend', (e) => {
  if (!t0) return; const c = e.changedTouches[0]; const dx = c.clientX - t0.x, dy = c.clientY - t0.y; t0 = null;
  const sc = slides[idx];
  if (vertical()) {
    if (Math.abs(dy) < 64 || Math.abs(dy) < Math.abs(dx) * 1.6) return;
    const atTop = sc.scrollTop <= 2, atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2;
    if (dy < 0 && atEnd) go(idx + 1); else if (dy > 0 && atTop) go(idx - 1);
  } else {
    if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    go(dx < 0 ? idx + 1 : idx - 1);
  }
}, { passive: true });

/* a slide that cannot fit its content becomes a keyboard-focusable scroll area, so nothing is cut off */
function fitOverflow() {
  slides.forEach((el, k) => {
    if (k !== idx) { el.removeAttribute('tabindex'); el.classList.remove('scrolls'); return; }
    const over = el.scrollHeight > el.clientHeight + 2;
    el.classList.toggle('scrolls', over);
    if (over) { el.tabIndex = 0; el.setAttribute('role', 'region'); } else { el.removeAttribute('tabindex'); el.removeAttribute('role'); }
  });
}
new ResizeObserver(() => fitOverflow()).observe(vp);
window.addEventListener('resize', fitOverflow);
mq.addEventListener('change', () => { root.dataset.mode = vertical() ? 'v' : 'h'; trackEl.classList.add('nomo'); show(idx, false); requestAnimationFrame(() => trackEl.classList.remove('nomo')); });
root.dataset.mode = vertical() ? 'v' : 'h';

/* ---------- sheets ---------- */
const dialogs = {}; let opener = null;
const table = (cap, head, rows, label) => '<div class="tw" tabindex="0" role="region" aria-label="' + esc(label || cap) + '"><table><caption>' + esc(cap) + '</caption>' + (head ? '<thead><tr>' + head.map((h) => '<th scope="col">' + esc(h) + '</th>').join('') + '</tr></thead>' : '') + '<tbody>' + rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? '<th scope="row">' : '<td>') + (c && c.html ? c.html : esc(c)) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody></table></div>';
function blocks(bl) {
  return bl.map((b) => {
    if (b.p) return '<p>' + esc(b.p) + '</p>';
    if (b.ul) return '<ul class="dl">' + b.ul.map((x) => typeof x === 'string' ? '<li>' + esc(x) + '</li>' : '<li>' + tag(x.t) + esc(x.x) + '</li>').join('') + '</ul>';
    if (b.ol) return '<ol class="dl' + (b.cls ? ' ' + b.cls : '') + '">' + b.ol.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>';
    if (b.table) return table(b.table.cap, b.table.head, b.table.rows);
    if (b.code) return '<pre tabindex="0" aria-label="Illustrative contract">' + esc(b.code) + '</pre>' + (b.cap ? '<p class="note">' + esc(b.cap) + '</p>' : '');
    if (b.links) return '<ul class="links">' + b.links.map((l) => '<li><a href="' + l.href + '">' + esc(l.text) + '</a> <small>' + esc(l.note) + '</small></li>').join('') + '</ul>';
    if (b.states) return table('When an offer is not ready', ['State', 'What it means', 'Clear fallback'], b.states, 'Offer states');
    if (b.embedlab) return '<div data-lab></div>';
    if (b.rollup) return rollupHTML();
    return ''; // measure blocks are shown on the Economics tab
  }).join('');
}
function rollupHTML() {
  return table('Proposed milestones by strategy. Built from the same data as each plan.', ['Strategy'].concat(DAYS.map((d) => 'Day ' + d)), rollup().map((x) => [{ html: '<a href="#' + x.id + '" data-jump="' + x.id + '">' + esc(NAMES[x.id]) + '</a>' }].concat(x.cells.map((c) => c.short))), 'Milestone rollup');
}
function econHTML(s) {
  const mets = '<ul class="mets">' + s.metrics.map((m) => '<li><span class="mk">' + esc(m.k) + '</span><span class="mv">' + esc(m.v) + '</span>' + (m.note ? '<small>' + esc(m.note) + '</small>' : '') + '</li>').join('') + '</ul>';
  const meas = MEASURES[s.id] ? '<section class="ds"><h3>Measurement plan</h3>' + table('Unknown internal numbers are marked to establish.', MEASURE_HEAD, MEASURES[s.id], 'Measures') + '<p class="note">Each experiment names a comparison cohort or holdout and its earliest credible review window. Results are counted once on the common event spine.</p></section>' : '';
  return '<dl class="econ"><div><dt>Economic contribution</dt><dd>' + esc(s.econ) + '</dd></div><div><dt>How we measure it</dt><dd>' + esc(s.measure) + '</dd></div></dl>' + mets + meas;
}
function planHTML(s) {
  const pos = (d) => (d / 180) * 100;
  const rows = s.gantt.map((m, i) => { const from = i ? DAYS[i - 1] : 0; return '<li><div class="gb"><i style="margin-left:' + pos(from) + '%;width:' + (pos(m.d) - pos(from)) + '%"><b>Day ' + m.d + '</b><span>' + esc(BARS[s.id][i]) + '</span></i></div></li>'; }).join('');
  const scale = '<div class="gs" aria-hidden="true">' + [0].concat(DAYS).map((d) => '<span style="left:' + pos(d) + '%">' + (d ? 'Day ' + d : 'Start') + '</span>').join('') + '</div>';
  const cards = s.gantt.map((m) => '<article class="ml"><h4>Day ' + m.d + '</h4><p class="mt">' + esc(m.short) + '</p><dl><dt>Owner</dt><dd>' + esc(m.owner) + '</dd><dt>Commitment</dt><dd>' + esc(m.commit) + '</dd><dt>Target</dt><dd>' + esc(m.target) + '</dd><dt>Dependency</dt><dd>' + esc(m.dep) + '</dd><dt>Success evidence</dt><dd>' + esc(m.evidence) + '</dd></dl></article>').join('');
  return '<figure class="gantt" aria-label="Proposed milestones at days 30, 60, 90 and 180">' + scale + '<ol class="gr">' + rows + '</ol></figure><div class="mls">' + cards + '</div><p class="note">Proposed milestones, not yet calibrated. A commitment is a deliverable the team controls. A target is an outcome to pursue. A dependency is outside help it needs.</p>';
}

function build(id) {
  const s = SLIDES.find((x) => x.id === id), d = document.createElement('dialog');
  d.className = 'dlg'; d.setAttribute('aria-labelledby', 'dt-' + id);
  const more = s.details.sections.filter((x) => !x.blocks.every((b) => b.measure)).map((x) => '<section class="ds"><h3>' + esc(x.h) + '</h3>' + blocks(x.blocks) + '</section>').join('');
  const tabs = [['more', 'Details'], ['econ', 'Economics'], ['plan', '180-day plan']];
  d.innerHTML = '<div class="dh"><h2 id="dt-' + id + '">' + esc(s.title) + '</h2><button type="button" class="btn x" data-close>Close</button></div>' +
    '<div class="tabs" role="group" aria-label="Sections">' + tabs.map((t) => '<button type="button" data-view="' + t[0] + '" aria-pressed="false">' + t[1] + '</button>').join('') + '</div>' +
    '<div class="db"><div data-pane="more">' + more + '</div><div data-pane="econ" hidden>' + econHTML(s) + '</div><div data-pane="plan" hidden>' + planHTML(s) + '</div></div>';
  document.body.appendChild(d);
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-close]')) return d.close();
    const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); d.close(); return go(ids.indexOf(j.dataset.jump)); }
    const v = e.target.closest('.tabs [data-view]'); if (v) setView(d, v.dataset.view);
  });
  d.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...d.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,summary,[tabindex]:not([tabindex="-1"])')].filter((x) => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  d.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; say('Closed.'); });
  if (id === 'embedded') mountLab($('[data-lab]', d));
  return d;
}
function setView(d, v) {
  d.querySelectorAll('.tabs [data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'));
  d.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== v; });
  $('.db', d).scrollTop = 0;
}
function openSheet(id, from) {
  const d = dialogs[id] || (dialogs[id] = build(id));
  opener = from; setView(d, 'more');
  d.showModal(); $('.db', d).scrollTop = 0;
  const c = $('[data-close]', d); if (c) c.focus();
}
trackEl.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) openSheet(b.dataset.open, b); });

/* ---------- start ---------- */
const start = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
show(start < 0 ? 0 : start, false);
requestAnimationFrame(() => { ready = true; root.classList.add('ready'); });
