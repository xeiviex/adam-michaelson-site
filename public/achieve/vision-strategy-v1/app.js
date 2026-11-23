/* Draws the /achieve/vision-strategy-v1/ deck from content.js. No content lives here.
   Same model as /lendingtree/: one slide on screen, a Details sheet for the depth. */
import { meta, questions, slides as SLIDES, milestones } from './content.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const txt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const $ = (s) => document.querySelector(s);
const qLabel = (q) => (q.length === 0 ? '' : q.length === 1 ? `Question ${q[0]}` : `Questions ${q[0]} to ${q[q.length - 1]}`);

function items(list) {
  return '<ul class="pts">' + list.map((it) => (typeof it === 'string'
    ? `<li>${txt(it)}</li>`
    : `<li><b>${txt(it.t)}</b><span>${txt(it.d)}</span></li>`)).join('') + '</ul>';
}

const draw = {
  group: (b) => `<section class="grp${b.wide ? ' wide' : ''}">${b.title ? `<h3>${txt(b.title)}</h3>` : ''}${items(b.items)}</section>`,
  row: (b) => `<div class="row row-${b.blocks.length}${b.blocks.some((x) => x.wide) ? ' has-wide' : ''}">${b.blocks.map(block).join('')}</div>`,
  callout: (b) => `<aside class="call"><span class="ctag">${esc(b.tag)}</span><p>${txt(b.text)}${b.link ? ` <a href="${esc(b.link.url)}">${esc(b.link.label)}</a>` : ''}</p></aside>`,
  table: (b) => {
    const rows = b.rows === 'milestones' ? milestones.map((m) => [`Day ${m.day}`, m.text, m.gate]) : b.rows;
    return `<div class="tblw">${b.title ? `<h3>${txt(b.title)}</h3>` : ''}<table class="tbl"><thead><tr>${b.head.map((h) => `<th scope="col">${txt(h)}</th>`).join('')}</tr></thead><tbody>`
      + rows.map((r) => '<tr>' + r.map((c, i) => (i === 0 ? `<th scope="row">${txt(c)}</th>` : `<td data-h="${esc(b.head[i])}">${txt(c)}</td>`)).join('') + '</tr>').join('')
      + '</tbody></table></div>';
  },
  matrix: (b) => {
    const rows = [['problem', 'Problem'], ['policy', 'Policy'], ['action', 'Action'], ['kpis', 'KPIs']];
    const cell = (v) => (Array.isArray(v) ? '<ul>' + v.map((x) => `<li>${txt(x)}</li>`).join('') + '</ul>' : `<p>${txt(v)}</p>`);
    return '<div class="mx" role="group" aria-label="Strategy matrix">'
      + `<div class="mx-col mx-rows" aria-hidden="true"><div class="mx-h"></div>${rows.map((r) => `<div class="mx-rl">${r[1]}</div>`).join('')}</div>`
      + b.cols.map((c) => `<div class="mx-col"><h3 class="mx-h">${esc(c.name)}</h3>`
        + rows.map((r) => `<div class="mx-c mx-${r[0]}"><span class="mx-l">${r[1]}</span>${cell(c[r[0]])}</div>`).join('') + '</div>').join('')
      + '</div>';
  },
  flow: (b) => '<figure class="flow"><ol>'
    + b.steps.map((s) => `<li class="fz-${s.zone}">${s.mark ? `<span class="fmark">${esc(s.mark)}</span>` : ''}<b>${txt(s.name)}</b><span>${txt(s.note)}</span></li>`).join('')
    + `</ol><figcaption>${txt(b.caption)}</figcaption></figure>`,
  tracks: (b) => '<figure class="tracks">'
    + b.tracks.map((t, i) => `<div class="trk trk-${i}"><div class="trk-n"><b>${txt(t.name)}</b><span>${txt(t.note)}</span></div><ol>${t.steps.map((s) => `<li>${txt(s)}</li>`).join('')}</ol></div>`
      + (i === 0 ? `<p class="trk-link"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 16V4M5.5 8.5 10 4l4.5 4.5"/></svg>${txt(b.link)}</p>` : '')).join('')
    + '</figure>',
  timeline: () => {
    const bar = (v, cls, label) => (v == null
      ? `<div class="tm none"><span>${label}</span><i></i><em>Not yet</em></div>`
      : `<div class="tm ${cls}"><span>${label}</span><i><u style="width:${Math.max(v, 2)}%"></u></i><em>${cls === 'un' ? 'At least ' : ''}${v}%</em></div>`);
    return '<div class="tlw"><ol class="tl">'
      + milestones.map((m) => `<li><h3>Day ${m.day}</h3><p>${txt(m.text)}</p>${bar(m.routed, 'ro', 'Eligible traffic routed to DEX')}${bar(m.unassisted, 'un', 'DEX completions without staff')}</li>`).join('')
      + '</ol><p class="fine">Two different denominators: the first bar is a share of all eligible traffic, the second a share of DEX completions. Overall completion among eligible customers is tracked beside both.</p></div>';
  },
  asks: (b) => `<ol class="asks">${b.items.map((it) => `<li><b>${txt(it.t)}</b><span>${txt(it.d)}</span></li>`).join('')}</ol>`,
};
function block(b) { return draw[b.type] ? draw[b.type](b) : ''; }

function slideHTML(s) {
  if (s.cover) {
    return `<section class="slide" id="${s.id}" aria-label="${esc(s.name)}"><div class="sb cover">
      <header><p class="kicker">${esc(meta.eyebrow)}</p><h2 tabindex="-1">${esc(meta.title)}</h2></header>
      <div class="vis"><p class="by">${esc(meta.author)}</p><p class="msg">${txt(meta.intro)}</p></div><footer class="rail"></footer></div></section>`;
  }
  return `<section class="slide" id="${s.id}" aria-label="${esc(s.name)}"><div class="sb">
    <header>${s.q.length ? `<p class="kicker">${esc(qLabel(s.q))}</p>` : ''}<h2 tabindex="-1">${txt(s.title)}</h2><p class="msg">${txt(s.sub)}</p></header>
    <div class="vis">${s.blocks.map(block).join('')}</div>
    <footer class="rail">${s.details || s.q.length ? `<button type="button" class="btn" data-open="${s.id}" aria-haspopup="dialog">Details</button>` : ''}</footer></div></section>`;
}

const ids = SLIDES.map((s) => s.id);
const trackEl = $('#track');
$('#ctx').textContent = meta.context;
trackEl.innerHTML = SLIDES.map(slideHTML).join('');
const slides = [...trackEl.querySelectorAll('.slide')];
const dots = $('#dots');
dots.innerHTML = SLIDES.map((s, i) => `<li><a href="#${s.id}" data-go="${i}" aria-label="Slide ${i + 1}: ${esc(s.name)}"><span></span></a></li>`).join('');

const live = $('#live'), status = $('#status'), where = $('#where'), prevB = $('#prev'), nextB = $('#next');
let idx = 0, ready = false, sayT;
function say(m) { clearTimeout(sayT); live.textContent = ''; sayT = setTimeout(() => { live.textContent = m; }, 60); }

function show(i, announce = true) {
  const old = idx; idx = Math.max(0, Math.min(SLIDES.length - 1, i));
  const hadFocus = slides[old] && slides[old].contains(document.activeElement);
  trackEl.style.setProperty('--i', idx);
  slides.forEach((el, k) => { const on = k === idx; el.inert = !on; el.setAttribute('aria-hidden', on ? 'false' : 'true'); });
  slides[idx].scrollTop = 0;
  status.textContent = `${idx + 1} / ${SLIDES.length}`; where.textContent = SLIDES[idx].name;
  prevB.setAttribute('aria-disabled', idx === 0 ? 'true' : 'false'); nextB.setAttribute('aria-disabled', idx === SLIDES.length - 1 ? 'true' : 'false');
  dots.querySelectorAll('a').forEach((d, k) => { if (k === idx) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); d.classList.toggle('done', k < idx); });
  if (hadFocus && old !== idx) slides[idx].querySelector('h2').focus({ preventScroll: true });
  if (announce && ready && old !== idx) say(`Slide ${idx + 1} of ${SLIDES.length}: ${SLIDES[idx].name}`);
}
let mine = false;
function go(i) {
  if (i < 0 || i >= SLIDES.length || i === idx) return;
  show(i);
  if (location.hash !== '#' + ids[i]) { mine = true; location.hash = ids[i]; } // one history entry per slide, so back and forward work
}
window.addEventListener('hashchange', () => {
  if (mine) { mine = false; return; }
  const k = ids.indexOf(decodeURIComponent(location.hash.slice(1))); show(k < 0 ? 0 : k);
});
prevB.addEventListener('click', () => go(idx - 1)); nextB.addEventListener('click', () => go(idx + 1));
dots.addEventListener('click', (e) => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); go(+a.dataset.go); });

const sheet = $('#sheet');
document.addEventListener('keydown', (e) => {
  if (sheet.open || e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const sc = slides[idx], scrolls = sc.scrollHeight > sc.clientHeight + 2;
  let d = 0;
  if (e.key === 'ArrowRight') d = 1; else if (e.key === 'ArrowLeft') d = -1;
  else if (e.key === 'PageDown' && !scrolls) d = 1; else if (e.key === 'PageUp' && !scrolls) d = -1;
  else if (e.key === ' ' && !scrolls && !e.target.closest('button,a')) d = e.shiftKey ? -1 : 1;
  else if (e.key === 'Home') { e.preventDefault(); return go(0); } else if (e.key === 'End') { e.preventDefault(); return go(SLIDES.length - 1); }
  if (d) { e.preventDefault(); go(idx + d); }
});

/* Swipe left and right on touch screens. Vertical movement scrolls the slide. */
let t0 = null;
const vp = $('#viewport');
vp.addEventListener('scroll', () => { if (vp.scrollLeft || vp.scrollTop) { vp.scrollLeft = 0; vp.scrollTop = 0; } }); // focus can nudge the clipped track; keep it pinned
vp.addEventListener('touchstart', (e) => { t0 = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
vp.addEventListener('touchend', (e) => {
  if (!t0 || sheet.open) return;
  const dx = e.changedTouches[0].clientX - t0.x, dy = e.changedTouches[0].clientY - t0.y; t0 = null;
  if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6) go(idx + (dx < 0 ? 1 : -1));
}, { passive: true });

/* Details sheet: the question as asked, then the depth behind the slide. */
let opener = null;
function openSheet(id, from) {
  const s = SLIDES.find((x) => x.id === id);
  $('#sheetTitle').textContent = s.title;
  $('#sheetBody').innerHTML = s.q.map((n) => `<p class="ask"><span>Question ${n}</span>${txt(questions[n])}</p>`).join('') + (s.details || []).map(block).join('');
  opener = from; sheet.showModal(); $('#sheetBody').scrollTop = 0;
}
trackEl.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) openSheet(b.dataset.open, b); });
$('#sheetClose').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
sheet.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; });

const start = ids.indexOf(decodeURIComponent(location.hash.slice(1)));
trackEl.classList.add('nomo'); show(start < 0 ? 0 : start, false);
requestAnimationFrame(() => { trackEl.classList.remove('nomo'); ready = true; });
