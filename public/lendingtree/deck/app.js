/* /lendingtree deck: seven screens, navigation, details overlays. Content comes from data.js. */
import { SLIDES, DAYS, LEGACY, LEGACY_ARCHIVE_IDS, MEASURES, MEASURE_HEAD, TAGS, TAG_HELP, rollup } from './data.js';
import { mountCalculator, onCalcChange, summary, fmt } from './roi-ui.js';
import { mountPreview, mountLab } from './embed.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const ids = SLIDES.map((s) => s.id);
const root = document.documentElement;

/* ---------- old fragments (before anything renders) ---------- */
(function legacy() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return;
  if (LEGACY[h]) history.replaceState(null, '', location.pathname + location.search + LEGACY[h]);
  else if (LEGACY_ARCHIVE_IDS.includes(h)) location.replace('/lendingtree1/#' + h);
})();

/* ---------- small renderers ---------- */
const tag = (t) => '<span class="tag tag-' + t + '">' + TAGS[t] + '</span> ';

function ganttHTML(s) {
  const pos = (d) => (d / 180) * 100;
  const segs = DAYS.map((d, i) => { const from = i ? DAYS[i - 1] : 0; return '<i class="seg" style="left:' + pos(from) + '%;width:' + (pos(d) - pos(from)) + '%"></i>'; }).join('');
  const dia = DAYS.map((d) => '<b class="dia' + (d === 180 ? ' end' : '') + '" style="left:' + pos(d) + '%"><span>D' + d + '</span></b>').join('');
  return '<figure class="gantt" aria-labelledby="gc-' + s.id + '"><figcaption id="gc-' + s.id + '"><span>Proposed milestones</span><small>Bar spacing is proportional to days. Text columns are equal width. Full detail is in Details.</small></figcaption>' +
    '<div class="gx" aria-hidden="true">' + segs + dia + '</div>' +
    '<ol class="gm">' + s.gantt.map((m) => '<li><b>Day ' + m.d + '</b><span>' + esc(m.short) + '</span></li>').join('') + '</ol></figure>';
}

function roiHTML(s) {
  let mets;
  if (s.metrics === 'live') mets = '<ul class="mets" data-live-mets></ul>';
  else mets = '<ul class="mets">' + s.metrics.map((m) => '<li><span class="mk">' + esc(m.k) + '</span><span class="mv">' + esc(m.v) + '</span>' + (m.note ? '<small>' + esc(m.note) + '</small>' : '') + '</li>').join('') + '</ul>';
  return '<section class="roi" aria-label="ROI and measurement"><dl class="econ"><div><dt>Economic contribution</dt><dd>' + esc(s.econ) + '</dd></div><div><dt>How we measure it</dt><dd>' + esc(s.measure) + '</dd></div></dl>' + mets + '</section>';
}

const flow = (items, cls = '', label = '') => '<ol class="flow ' + cls + '"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' + items.map((i) => '<li' + (i.c ? ' class="' + i.c + '"' : '') + '>' + (i.k ? '<small>' + esc(i.k) + '</small>' : '') + '<b>' + esc(i.t) + '</b>' + (i.s ? '<span>' + esc(i.s) + '</span>' : '') + '</li>').join('') + '</ol>';

const VIS = {
  overview() {
    const toc = SLIDES.slice(1).map((s, i) => '<li><a href="#' + s.id + '"><i>' + (i + 2) + '</i><span>' + esc(s.nav === 'Roadmap ROI' ? 'Roadmap ROI optimization' : s.nav === 'Down-funnel' ? 'Down-funnel lending and insurance' : s.nav === 'MCP/API' ? 'MCP/API' : s.nav === 'Teams' ? 'Team optimization' : s.nav) + '</span></a></li>').join('');
    return '<div class="ovr"><div class="flows">' +
      '<div><h3>Today: value is earned at the match</h3>' + flow([{ t: 'Shopper form' }, { t: 'Match', c: 'peak', s: 'Fee earned here' }, { t: 'Handoff to partner' }, { t: 'Little visibility', c: 'dim' }], 'cur', 'Current model') + '</div>' +
      '<div><h3>Proposed: win the offer, then the lifecycle</h3>' + flow([{ t: 'Offers and quotes', c: 'first' }, { t: 'Compare and choose', c: 'first' }, { t: 'Handoff', s: 'Consented' }, { t: 'Transaction', s: 'Funded or bound' }, { t: 'Ongoing relationship', s: 'Servicing, renewal' }], 'new', 'Proposed model') + '</div></div>' +
      '<div class="ov2"><nav aria-label="Six strategies"><h3>Six strategies</h3><ol class="toc">' + toc + '</ol></nav>' +
      '</div></div>';
  },
  roadmap() {
    return '<div class="rmv" data-rmv></div>';
  },
  'down-funnel'() {
    const lane = (name, pre, first, later, c) => '<div class="lane"><h3>' + name + '</h3>' + flow([...pre.map((t) => ({ t, c: 'pre' })), ...first.map((t, i) => ({ t, c: 'first', k: i === 0 ? 'First investment' : '' })), ...later.map((t) => ({ t, c: 'later' }))], 'stages ' + c, name + ' path').replace('<ol', '<ol') + '</div>';
    return '<div class="dfv">' +
      lane('Lending', ['Discover, consent, match'], ['Generate offers', 'Present and compare', 'Select'], ['Application', 'Underwriting or approval', 'Funding', 'Servicing or refinance'], 'lend') +
      lane('Insurance', ['Discover, consent, match'], ['Generate quotes', 'Present and compare', 'Select'], ['Application or underwriting', 'Bind', 'Servicing', 'Renewal and re-shop'], 'ins') +
      '<ul class="legend"><li><h3><b class="lg first"></b>First release: what a shopper can do</h3>See comparable offers or quotes with freshness and eligibility, choose one, and consent to a handoff.</li><li><h3><b class="lg later"></b>Subsequent capabilities</h3>Application, approval or bind, funding, servicing, and renewal, funded as the evidence supports.</li><li><h3><b class="lg out"></b>Outcome visibility</h3>Partner status feeds back, which measures the pilot and closes the loop.</li></ul></div>';
  },
  mcp() {
    return '<div class="mcv">' + flow([
      { t: 'AI assistant or agent', s: 'Asks on a shopper’s behalf' }, { t: 'MCP interface', s: 'Discoverable tools, scoped access' },
      { t: 'Shared LendingTree APIs', s: 'Same capabilities as every channel', c: 'core' }, { t: 'Authorized capabilities and partner networks', s: 'Existing first, offer-stage as available' }], 'chain', 'MCP and API path') +
      '<p class="cap">Lead with existing capabilities that can be exposed safely. Add new offer-stage capabilities as they arrive.</p></div>';
  },
  embedded() {
    return '<div class="emv"><div class="em-partner"><p class="cap">Partner surface (illustrative)</p><div data-embed-preview></div></div>' +
      '<div class="em-shared"><p class="cap">Shared services</p><ul><li>Consent and identity</li><li>Offers and eligibility</li><li>Partner integrations</li><li>Events and attribution</li></ul></div></div>';
  },
  disruption() {
    const stages = [['Open charter', 'Threat or opportunity, baseline, hypothesis'], ['Smallest credible test', 'With a comparison cohort'], ['Evidence review', 'Against the threshold'], ['Decision', 'Scale, pivot, or stop']];
    return '<div class="dsv"><p class="cap">Three parallel pods, one shared evidence process</p><ul class="pods">' + ['A', 'B', 'C'].map((p) => '<li><h3>Pod ' + p + '<small>Principal-led. Charter open.</small></h3><ol class="stages4">' + stages.map((s, i) => '<li' + (i === 0 ? ' class="open"' : '') + '><b>' + s[0] + '</b><span>' + s[1] + '</span></li>').join('') + '</ol></li>').join('') + '</ul></div>';
  },
  teams() {
    const team = (t, s) => '<li><b>' + t + '</b><span>' + s + '</span></li>';
    return '<div class="tmv"><p class="band">Roadmap optimization: one portfolio discipline across every team</p>' +
      '<div class="tm-row"><ul class="teams" aria-label="Four delivery teams (illustrative)">' + team('Lending Down-Funnel', 'Offers and handoff') + team('Insurance Down-Funnel', 'Quotes and handoff') + team('MCP/API', 'Contract and adapter') + team('Embedded', 'SDK and partners') + '</ul>' +
      '<ul class="pods3" aria-label="Three disruption pods">' + team('Pod A', 'Principal-led') + team('Pod B', 'Principal-led') + team('Pod C', 'Principal-led') + '</ul></div>' +
      '<ul class="surf" aria-label="Surfaces"><li>Shopping</li><li>MCP/API</li><li>Embedded</li></ul>' +
      '<div class="arch"><b>Shared architecture, owned by the CTO and a principal architect</b><ul><li>Identity and consent</li><li>Offers and eligibility</li><li>Partner integrations</li><li>Transaction orchestration</li><li>Analytics and economics</li><li>Security and compliance</li></ul></div></div>';
  },
};

/* ---------- build the slides ---------- */
const track = $('#track');
track.innerHTML = SLIDES.map((s, i) => {
  const calcBtn = s.id === 'roadmap' ? '<button type="button" class="btn pri" data-calc>Open ROI calculator</button>' : '';
  const ov = s.id === 'overview' ? '' : '';
  return '<section class="slide" id="slide-' + s.id + '" data-i="' + i + '" aria-roledescription="slide" aria-labelledby="h-' + s.id + '"><div class="sb">' +
    '<header class="sh"><div><p class="kicker">' + esc(s.kicker) + '</p><h2 id="h-' + s.id + '" tabindex="-1">' + esc(s.title) + '</h2><p class="msg">' + esc(s.message) + '</p></div>' +
    '<div class="acts">' + calcBtn + '<button type="button" class="btn" data-details="' + s.id + '" aria-haspopup="dialog">Economics, timeline and details</button></div></header>' +
    '<div class="vis">' + VIS[s.id]() + '</div></div></section>';
}).join('');
const slides = [...track.querySelectorAll('.slide')];

/* nav dots */
const dots = $('#dots');
dots.innerHTML = SLIDES.map((s, i) => '<li><a href="#' + s.id + '" data-go="' + i + '" aria-label="Slide ' + (i + 1) + ': ' + esc(s.nav) + '"><span aria-hidden="true">' + (i + 1) + '</span></a></li>').join('');

/* ---------- live roadmap visual and metrics (from the calculator) ---------- */
function paintRoadmap() {
  const sm = summary(); const ev = sm.ev; const lim = ev.cap.limit;
  const bar = (label, used) => {
    const max = Math.max(lim || 0, ev.cap.baselineUsed, ev.cap.proposedUsed, 1);
    return '<li><span>' + label + '</span><span class="cbar" aria-hidden="true"><i style="width:' + (used / max * 100) + '%"></i>' + (lim ? '<u style="left:' + (lim / max * 100) + '%"></u>' : '') + '</span><b>' + fmt.tm(used) + (lim !== null ? ' of ' + fmt.tm(lim) : '') + ' team-months</b></li>';
  };
  const v = $('[data-rmv]');
  v.innerHTML = '<div class="rm3"><div class="rm-a"><h3>Current portfolio</h3><p>' + ev.baseline.count + ' in-flight initiatives, ' + fmt.tm(ev.cap.baselineUsed) + ' team-months</p></div>' +
    '<div class="rm-b" aria-label="Decision"><h3>Decide</h3><ul class="dec"><li>Stop</li><li>Start</li><li>Continue</li><li>Re-scope</li></ul></div>' +
    '<div class="rm-c"><h3>Six-month roadmap</h3><p>Capacity-constrained, at least one meaningful release per team per month</p></div></div>' +
    '<div class="capv"><p class="cap">Team-month capacity, illustrative example</p><ul class="cbars">' + bar('Current plan', ev.cap.baselineUsed) + bar('Proposed', ev.cap.proposedUsed) + '</ul></div>';
  const m = $('[data-live-mets]');
  if (!m) return;
  m.innerHTML = '<li><span class="mk">Projected return of retained work</span><span class="mv">' + fmt.pct(sm.roi) + '</span><small>Confidence-weighted ROI, ' + sm.scen + ' case</small></li>' +
    '<li><span class="mk">Avoidable spending</span><span class="mv">' + fmt.money(sm.avoided) + '</span><small>Remaining cost of stopped or deferred work</small></li>' +
    '<li><span class="mk">Engineering capacity redeployed</span><span class="mv">' + fmt.tm(sm.redeployed) + ' team-months</span><small>Off stopped work; net released ' + fmt.tm(sm.released) + '</small></li>' +
    '<li class="exm"><small>Illustrative example data. Edit it in the calculator.</small></li>';
}
paintRoadmap(); onCalcChange(paintRoadmap);
mountPreview($('[data-embed-preview]'));

/* ---------- navigation ---------- */
const live = $('#live'), status = $('#status'), prevB = $('#prev'), nextB = $('#next');
const mq = window.matchMedia('(max-width: 760px)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let idx = 0, ready = false;
const vertical = () => mq.matches;

function show(i, announce = true) {
  const old = idx; idx = Math.max(0, Math.min(SLIDES.length - 1, i));
  const hadFocus = slides[old] && slides[old].contains(document.activeElement);
  track.style.setProperty('--i', idx);
  slides.forEach((el, k) => { const on = k === idx; el.inert = !on; el.setAttribute('aria-hidden', on ? 'false' : 'true'); if (on) el.removeAttribute('tabindex'); });
  const a = slides[idx]; a.scrollTop = 0;
  status.textContent = (idx + 1) + ' / ' + SLIDES.length;
  prevB.setAttribute('aria-disabled', idx === 0 ? 'true' : 'false'); nextB.setAttribute('aria-disabled', idx === SLIDES.length - 1 ? 'true' : 'false');
  dots.querySelectorAll('a').forEach((d, k) => { if (k === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
  document.title = SLIDES[idx].title + ' | The next chapter at LendingTree | Adam Michaelson';
  if (hadFocus && old !== idx) a.querySelector('h2').focus({ preventScroll: true });
  if (announce && ready && old !== idx) say('Slide ' + (idx + 1) + ' of ' + SLIDES.length + ': ' + SLIDES[idx].title);
  fitOverflow();
}
let sayT; function say(m) { clearTimeout(sayT); live.textContent = ''; sayT = setTimeout(() => { live.textContent = m; }, 60); }

function go(i) {
  if (i < 0) return say('This is the first slide.');
  if (i >= SLIDES.length) return say('This is the last slide.');
  if (i === idx) return;
  show(i);
  if (location.hash !== '#' + ids[i]) { mine = true; location.hash = ids[i]; } // one history entry per slide, so back and forward work
}
let mine = false;
window.addEventListener('hashchange', () => {
  if (mine) { mine = false; return; }
  const h = decodeURIComponent(location.hash.slice(1));
  if (LEGACY[h]) { history.replaceState(null, '', location.pathname + LEGACY[h]); return show(ids.indexOf(LEGACY[h].slice(1))); }
  if (LEGACY_ARCHIVE_IDS.includes(h)) return location.replace('/lendingtree1/#' + h);
  const k = ids.indexOf(h); show(k < 0 ? 0 : k);
});
prevB.addEventListener('click', () => go(idx - 1)); nextB.addEventListener('click', () => go(idx + 1));
dots.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(+a.dataset.go); });
track.addEventListener('click', (e) => { const a = e.target.closest('.toc a'); if (!a) return; e.preventDefault(); go(ids.indexOf(a.getAttribute('href').slice(1))); });

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

/* swipe: directional, discrete, never inside overlays, forms or scrollable tables */
let t0 = null;
const vp = $('#viewport');
/* focus or scrollIntoView can nudge the clipped track sideways; keep it pinned */
vp.addEventListener('scroll', () => { if (vp.scrollLeft || vp.scrollTop) { vp.scrollLeft = 0; vp.scrollTop = 0; } });
vp.addEventListener('touchstart', (e) => {
  if (anyDialog() || e.touches.length !== 1 || e.target.closest('input,select,textarea,.tw,pre,button,a')) { t0 = null; return; }
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

/* a slide that cannot fit its content gets a keyboard-focusable scroll area, so nothing is cut off */
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
mq.addEventListener('change', () => { root.dataset.mode = vertical() ? 'v' : 'h'; track.classList.add('nomo'); show(idx, false); requestAnimationFrame(() => track.classList.remove('nomo')); });
root.dataset.mode = vertical() ? 'v' : 'h';

/* ---------- details overlays ---------- */
const dialogs = {}; let opener = null;
function blocks(bl) {
  return bl.map((b) => {
    if (b.p) return '<p>' + esc(b.p) + '</p>';
    if (b.ul) return '<ul class="dl">' + b.ul.map((x) => typeof x === 'string' ? '<li>' + esc(x) + '</li>' : '<li>' + tag(x.t) + esc(x.x) + '</li>').join('') + '</ul>';
    if (b.ol) return '<ol class="dl' + (b.cls ? ' ' + b.cls : '') + '">' + b.ol.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ol>';
    if (b.table) return '<div class="tw" tabindex="0" role="region" aria-label="' + esc(b.table.cap) + '"><table><caption>' + esc(b.table.cap) + '</caption><thead><tr>' + b.table.head.map((h) => '<th scope="col">' + esc(h) + '</th>').join('') + '</tr></thead><tbody>' + b.table.rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? '<th scope="row">' : '<td>') + esc(c) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody></table></div>';
    if (b.code) return '<pre tabindex="0" aria-label="Illustrative contract">' + esc(b.code) + '</pre>' + (b.cap ? '<p class="note">' + esc(b.cap) + '</p>' : '');
    if (b.links) return '<ul class="links">' + b.links.map((l) => '<li><a href="' + l.href + '">' + esc(l.text) + '</a> <small>' + esc(l.note) + '</small></li>').join('') + '</ul>';
    if (b.states) return '<div class="tw" tabindex="0" role="region" aria-label="Offer states"><table><caption>When an offer is not ready</caption><thead><tr><th scope="col">State</th><th scope="col">What it means</th><th scope="col">Clear fallback</th></tr></thead><tbody>' + b.states.map((r) => '<tr><th scope="row">' + r[0] + '</th><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>').join('') + '</tbody></table></div>';
    if (b.measure) return measureHTML(b.measure);
    if (b.embedlab) return '<div data-lab></div>';
    if (b.rollup) return rollupHTML();
    return '';
  }).join('');
}
function measureHTML(key) {
  const rows = MEASURES[key];
  return '<div class="tw" tabindex="0" role="region" aria-label="Measures"><table><caption>Measurement plan. Unknown internal numbers are marked to establish.</caption><thead><tr>' + MEASURE_HEAD.map((h) => '<th scope="col">' + h + '</th>').join('') + '</tr></thead><tbody>' + rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? '<th scope="row">' : '<td>') + esc(c) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') + '</tbody></table></div>' +
    '<p class="note">Each experiment names a comparison cohort or holdout and its earliest credible review window. Results are counted once on the common event spine.</p>';
}
function rollupHTML() {
  const r = rollup();
  return '<div class="tw" tabindex="0" role="region" aria-label="Milestone rollup"><table><caption>Proposed milestones by strategy. Built from the same data as each slide’s timeline.</caption><thead><tr><th scope="col">Strategy</th>' + DAYS.map((d) => '<th scope="col">Day ' + d + '</th>').join('') + '</tr></thead><tbody>' +
    r.map((x) => '<tr><th scope="row"><a href="#' + x.id + '" data-jump="' + x.id + '">' + esc(x.nav) + '</a></th>' + x.cells.map((c) => '<td>' + esc(c.short) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function milestonesHTML(s) {
  return '<section class="ds"><h3>Proposed milestones</h3><p class="note">Not yet calibrated. These are the same four milestones drawn on the slide’s timeline.</p><div class="mls">' + s.gantt.map((m) =>
    '<article class="ml"><h4>Day ' + m.d + '</h4><p class="mt">' + esc(m.short) + '</p><dl>' +
    '<dt>Owner role</dt><dd>' + esc(m.owner) + '</dd><dt>' + tag('commitment') + '</dt><dd>' + esc(m.commit) + '</dd><dt>' + tag('target') + '</dt><dd>' + esc(m.target) + '</dd><dt>' + tag('dependency') + '</dt><dd>' + esc(m.dep) + '</dd><dt>Success evidence</dt><dd>' + esc(m.evidence) + '</dd></dl></article>').join('') + '</div></section>';
}

function build(id) {
  const s = SLIDES.find((x) => x.id === id), d = document.createElement('dialog');
  d.className = 'dlg' + (id === 'roadmap' ? ' wide' : ''); d.setAttribute('aria-labelledby', 'dt-' + id);
  const top = '<section class="ds"><h3>Economics and measurement</h3>' + roiHTML(s) + '</section><section class="ds"><h3>Timeline</h3>' + ganttHTML(s) + '</section>';
  const body = top + s.details.sections.map((x) => '<section class="ds"><h3>' + esc(x.h) + '</h3>' + blocks(x.blocks) + '</section>').join('');
  if (id === 'roadmap') {
    d.innerHTML = '<div class="dh"><h2 id="dt-roadmap">' + esc(s.details.title) + '</h2><button type="button" class="btn" data-close>Close</button></div>' +
      '<div class="seg2" role="group" aria-label="Details view"><button type="button" class="btn" data-view="plan" aria-pressed="true">Method and plan</button><button type="button" class="btn" data-view="calc" aria-pressed="false">ROI calculator</button></div>' +
      '<div class="db"><div data-pane="plan"><p class="intro">' + esc(s.details.intro) + '</p>' + body + milestonesHTML(s) + '</div><div data-pane="calc" hidden><div data-calc-host></div></div></div>';
  } else {
    d.innerHTML = '<div class="dh"><h2 id="dt-' + id + '">' + esc(s.details.title) + '</h2><button type="button" class="btn" data-close>Close</button></div><div class="db"><p class="intro">' + esc(s.details.intro) + '</p>' + body + milestonesHTML(s) + '</div>';
  }
  document.body.appendChild(d);
  if (id === 'roadmap') paintRoadmap();
  d.addEventListener('click', (e) => {
    if (e.target === d || e.target.closest('[data-close]')) return d.close();
    const j = e.target.closest('[data-jump]'); if (j) { e.preventDefault(); d.close(); go(ids.indexOf(j.dataset.jump)); }
    const v = e.target.closest('[data-view]'); if (v) setView(d, v.dataset.view);
  });
  d.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...d.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea,summary,[tabindex]:not([tabindex="-1"])')].filter((x) => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  d.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; say(s.details.title + ' closed.'); });
  if (id === 'embedded') mountLab($('[data-lab]', d));
  return d;
}
let calcMounted = false;
function setView(d, v) {
  d.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'));
  d.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== v; });
  if (v === 'calc' && !calcMounted) { mountCalculator($('[data-calc-host]', d)); calcMounted = true; }
  $('.db', d).scrollTop = 0;
}
function openDetails(id, from, view) {
  const d = dialogs[id] || (dialogs[id] = build(id));
  opener = from; if (id === 'roadmap') setView(d, view || 'plan');
  d.showModal(); $('.db', d).scrollTop = 0;
  const c = $('[data-close]', d); if (c) c.focus();
}
track.addEventListener('click', (e) => {
  const b = e.target.closest('[data-details]'); if (b) return openDetails(b.dataset.details, b);
  const c = e.target.closest('[data-calc]'); if (c) openDetails('roadmap', c, 'calc');
});

/* ---------- start ---------- */
const start = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
show(start < 0 ? 0 : start, false);
requestAnimationFrame(() => { ready = true; root.classList.add('ready'); });
