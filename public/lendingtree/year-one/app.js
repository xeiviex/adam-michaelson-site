import { META, WEEKS, CHECKPOINTS, TRACKS, PHASES, ALLOC, milestones, when } from './data.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const STATUS = { draft: 'Draft target', open: 'Target set at Day 30' };
const span = (b) => (b.s === b.e ? 'Week ' + b.s : b.e <= 12 ? 'Weeks ' + b.s + ' to ' + b.e : 'Months ' + Math.ceil(b.s / 4) + ' to ' + Math.ceil(b.e / 4));

$('eyebrow').textContent = META.eyebrow;
$('title').textContent = META.title;
$('intro').textContent = META.intro;
$('plan-note').textContent = META.planNote;

/* outcome cards */
TRACKS.forEach((tr) => {
  const c = el('article', 'card');
  c.append(el('h3', '', tr.name));
  const v = el('p', 'val'); v.append(el('b', '', tr.card.value), el('span', '', tr.card.unit)); c.append(v);
  const by = el('p', 'by'); by.append(el('span', '', 'By'), document.createTextNode(' ' + tr.card.by.replace(/^Every/, 'every'))); c.append(by);
  const ul = el('ul'); tr.card.points.forEach((p) => ul.append(el('li', '', p))); c.append(ul);
  c.append(el('p', 'chip ' + tr.card.status, STATUS[tr.card.status]));
  $('cards').append(c);
});

/* gantt */
const all = milestones();
const g = $('gantt');
g.style.setProperty('--weeks', WEEKS);
const ax = el('div', 'lane ax'); ax.append(el('div', 'lh'));
const axg = el('div', 'axis');
for (let m = 1; m <= WEEKS / 4; m++) { const c = el('div', CHECKPOINTS[m] ? 'cp' : ''); c.append(el('b', '', 'M' + m)); if (CHECKPOINTS[m]) c.append(el('span', '', CHECKPOINTS[m])); axg.append(c); }
ax.append(axg); g.append(ax);

TRACKS.forEach((tr) => {
  const lane = el('div', 'lane');
  const lh = el('div', 'lh'); lh.append(el('b', '', tr.name), el('small', '', tr.sub)); lane.append(lh);
  const grid = el('div', 'grid');
  const rows = Math.max(...tr.bars.map((b) => b.row));
  tr.bars.forEach((b) => {
    const bar = el('div', 'bar' + (b.light ? ' light' : '') + (b.e - b.s < 3 ? ' out' : ''));
    bar.style.gridColumn = b.s + ' / ' + (b.e + 1); bar.style.gridRow = b.row;
    bar.append(el('span', 'when', span(b)), el('span', 'lb', b.label));
    if (b.short != null) { bar.classList.add('hasshort'); bar.append(el('span', 'sh', b.short)); }
    bar.title = b.label + ' · ' + span(b);
    grid.append(bar);
  });
  all.filter((m) => m.track === tr.id).forEach((m) => {
    const k = el('span', 'mk' + (m.w === WEEKS ? ' end' : ''), String(m.n));
    k.style.gridColumn = m.w + ' / ' + (m.w + 1); k.style.gridRow = rows + 1;
    k.title = when(m.w) + ': ' + m.t;
    grid.append(k);
  });
  lane.append(grid); g.append(lane);
});

/* milestone list */
all.forEach((m) => {
  const li = el('li');
  li.append(el('span', 'mk', String(m.n)), el('span', 'mw', when(m.w)));
  const d = el('div'); d.append(el('b', '', m.t), el('small', '', m.name + ' · ' + m.ev)); li.append(d);
  $('ms').append(li);
});

/* my time */
const nameOf = (r) => r.name || TRACKS.find((t) => t.id === r.id).name;
const tb = $('alloc');
const hr = el('tr'); hr.append(el('th', '', 'Share of my week'));
PHASES.forEach((p) => { const th = el('th', '', p); th.scope = 'col'; hr.append(th); });
const thead = el('thead'); thead.append(hr); tb.append(thead);
const body = el('tbody');
ALLOC.forEach((r) => {
  const tr = el('tr', r.id === 'buffer' ? 'buf' : ''); const th = el('th', '', nameOf(r)); th.scope = 'row'; tr.append(th);
  r.pct.forEach((v) => { const td = el('td', v ? '' : 'zero', v ? v + '%' : '\u2013'); td.style.setProperty('--v', v / 60); tr.append(td); });
  body.append(tr);
  if (r.id === 'buffer') return;
  const c = el('article', 'del'); c.append(el('h3', '', nameOf(r)));
  const k = el('p'); k.append(el('span', '', 'I keep'), document.createTextNode(r.keep)); c.append(k);
  const g2 = el('p'); g2.append(el('span', '', 'I delegate'), document.createTextNode(r.give)); c.append(g2);
  $('dels').append(c);
});
tb.append(body);
