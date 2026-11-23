/* Draws /achieve/vision-strategy-v1/ from content.js. No content lives here. */
import { meta, sources, sections, milestones } from './content.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const txt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const tag = (src) => (src && sources[src] ? `<span class="src src-${src}">${esc(sources[src].label)}</span>` : '');
const qLabel = (q) => (q.length === 0 ? 'Closing' : q.length === 1 ? `Question ${q[0]}` : `Questions ${q[0]}${q.length > 2 ? ' to ' : ' and '}${q[q.length - 1]}`);

function items(list) {
  return '<ul class="pts">' + list.map((it) => (typeof it === 'string'
    ? `<li>${txt(it)}</li>`
    : `<li><b>${txt(it.t)}</b><span>${txt(it.d)}</span></li>`)).join('') + '</ul>';
}

function links(list) {
  if (!list || !list.length) return '';
  return '<p class="links">Sources: ' + list.map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(', ') + '</p>';
}

const draw = {
  group: (b) => `<section class="grp grp-${b.src}">${tag(b.src)}${b.title ? `<h3>${txt(b.title)}</h3>` : ''}${items(b.items)}${links(b.links)}</section>`,
  row: (b) => `<div class="row row-${b.blocks.length}">${b.blocks.map(block).join('')}</div>`,
  callout: (b) => `<aside class="call"><span class="ctag">${esc(b.tag)}</span><p>${txt(b.text)}${b.link ? ` <a href="${esc(b.link.url)}">${esc(b.link.label)}</a>` : ''}</p></aside>`,
  details: (b) => `<details class="more"><summary>${txt(b.summary)}</summary><div class="more-in">${b.blocks.map(block).join('')}</div></details>`,
  table: (b) => {
    const rows = b.rows === 'milestones' ? milestones.map((m) => [`Day ${m.day}`, m.text, m.gate]) : b.rows;
    return `<div class="tblw">${tag(b.src)}<table class="tbl"><thead><tr>${b.head.map((h) => `<th scope="col">${txt(h)}</th>`).join('')}</tr></thead><tbody>`
      + rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? `<th scope="row">${txt(c)}</th>` : `<td data-h="${esc(b.head[i])}">${txt(c)}</td>`)).join('') + '</tr>').join('')
      + '</tbody></table></div>';
  },
  matrix: (b) => {
    const rows = [['problem', 'Problem'], ['policy', 'Policy'], ['action', 'Action'], ['kpis', 'KPIs']];
    const cell = (v) => (Array.isArray(v) ? '<ul>' + v.map((x) => `<li>${txt(x)}</li>`).join('') + '</ul>' : `<p>${txt(v)}</p>`);
    return `<div class="mxw">${tag(b.src)}<div class="mx" role="group" aria-label="Strategy matrix">`
      + `<div class="mx-col mx-rows" aria-hidden="true"><div class="mx-h"></div>${rows.map((r) => `<div class="mx-rl">${r[1]}</div>`).join('')}</div>`
      + b.cols.map((c) => `<div class="mx-col"><h3 class="mx-h">${esc(c.name)}</h3>`
        + rows.map((r) => `<div class="mx-c mx-${r[0]}"><span class="mx-l">${r[1]}</span>${cell(c[r[0]])}</div>`).join('') + '</div>').join('')
      + '</div></div>';
  },
  flow: (b) => `<figure class="flow">${tag(b.src)}<ol>`
    + b.steps.map((s) => `<li class="fz-${s.zone}${s.mark ? ' marked' : ''}">${s.mark ? `<span class="fmark">${esc(s.mark)}</span>` : ''}<b>${txt(s.name)}</b><span>${txt(s.note)}</span></li>`).join('')
    + `</ol><figcaption>${txt(b.caption)}</figcaption></figure>`,
  timeline: (b) => {
    const bar = (v, cls, label) => (v == null
      ? `<div class="tm none"><span>${label}</span><i></i><em>Not yet</em></div>`
      : `<div class="tm ${cls}"><span>${label}</span><i><u style="width:${Math.max(v, 2)}%"></u></i><em>${cls === 'un' ? 'At least ' : ''}${v}%</em></div>`);
    return `<div class="tlw">${tag(b.src)}<ol class="tl">`
      + milestones.map((m) => `<li><h3>Day ${m.day}</h3><p>${txt(m.text)}</p>${bar(m.routed, 'ro', 'Eligible traffic routed to DEX')}${bar(m.unassisted, 'un', 'DEX completions without staff')}</li>`).join('')
      + '</ol><p class="tl-key">Two different denominators. The first bar is a share of all eligible traffic. The second is a share of DEX completions. Overall completion among eligible customers is tracked beside both.</p></div>';
  },
  asks: (b) => `<div class="asksw">${tag(b.src)}<ol class="asks">${b.items.map((it) => `<li><b>${txt(it.t)}</b><span>${txt(it.d)}</span></li>`).join('')}</ol></div>`,
};

function block(b) { return draw[b.type] ? draw[b.type](b) : ''; }

function cover() {
  return `<section class="sec cover" id="top" data-name="Overview">
    <p class="eyebrow">${esc(meta.status)} &middot; ${esc(meta.version)}</p>
    <h1>${esc(meta.title)}</h1>
    <p class="by">${esc(meta.author)} &middot; ${esc(meta.audience)}</p>
    <p class="note">${txt(meta.note)}</p>
    <div class="legend" aria-label="How to read the labels">${Object.keys(sources).map((k) => `<div>${tag(k)}<p>${esc(sources[k].help)}</p></div>`).join('')}</div>
    <ol class="toc">${sections.map((s) => `<li><a href="#${s.id}"><span>${esc(qLabel(s.q))}</span><b>${txt(s.title)}</b></a></li>`).join('')}</ol>
  </section>`;
}

const main = document.getElementById('main');
main.innerHTML = cover() + sections.map((s) => `<section class="sec" id="${s.id}" data-name="${esc(s.title)}">
  <header class="sh"><p class="eyebrow">${esc(qLabel(s.q))}</p><h2>${txt(s.title)}</h2>${s.ask ? `<p class="ask"><span>I asked</span>${txt(s.ask)}</p>` : ''}<p class="lead">${txt(s.lead)}</p></header>
  ${s.blocks.map(block).join('')}
</section>`).join('');

/* Section navigation for presenting: buttons, and J / K or the left and right arrow keys. */
const secs = Array.from(main.querySelectorAll('.sec'));
const count = document.getElementById('count');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
let current = 0;

function setCurrent(i) {
  current = i;
  count.textContent = `${i + 1} / ${secs.length}`;
  prev.disabled = i === 0;
  next.disabled = i === secs.length - 1;
}
function go(i) {
  const n = Math.min(Math.max(i, 0), secs.length - 1);
  secs[n].scrollIntoView({ block: 'start' });
  history.replaceState(null, '', '#' + secs[n].id);
}
function locate() {
  const line = window.scrollY + window.innerHeight * 0.35;
  let n = 0;
  secs.forEach((s, i) => { if (s.offsetTop <= line) n = i; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) n = secs.length - 1;
  setCurrent(n);
}
prev.addEventListener('click', () => go(current - 1));
next.addEventListener('click', () => go(current + 1));
document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight' || e.key === 'j') { e.preventDefault(); go(current + 1); }
  if (e.key === 'ArrowLeft' || e.key === 'k') { e.preventDefault(); go(current - 1); }
});
window.addEventListener('scroll', locate, { passive: true });
window.addEventListener('resize', locate);
locate();
if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
