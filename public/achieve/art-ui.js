/* Achieve debt relief prototype: the commissioned portrait. A photo-style image of the client at the summit, in a gold frame,
   with a button that prints it. The picture is pre-made; "styles" swap in a different pre-made lighting (or a filter),
   so the choice feels instant. */
import { h, ico } from './firsttake/shared/dom.js';

export const STYLES = [
  { id: 'sunrise', label: 'Sunrise', src: '/achieve/img/summit-sunrise.jpg', filter: 'none', medium: 'golden hour' },
  { id: 'moon', label: 'Moonlight', src: '/achieve/img/summit-moon.jpg', filter: 'none', medium: 'moonlight' },
  { id: 'neon', label: 'Neon dusk', src: '/achieve/img/summit-neon.jpg', filter: 'none', medium: 'neon dusk' },
  { id: 'bw', label: 'Black and white', src: '/achieve/img/summit-bw.jpg', filter: 'none', medium: 'black and white' },
];
export const styleById = (id) => STYLES.find((x) => x.id === id) || STYLES[0];
const TITLE = 'The Summit';

export function printPainting(name, title, style) {
  const st = styleById(style);
  const sheet = h('div', { id: 'printSheet' }, h('img', { src: st.src, alt: title, style: 'filter:' + st.filter }), h('p', null, title));
  document.body.append(sheet); document.body.classList.add('printing-art');
  const done = () => { document.body.classList.remove('printing-art'); sheet.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } catch { done(); }
  setTimeout(() => { if (document.body.classList.contains('printing-art')) done(); }, 60000);
}

export function paintingBlock(applicant) {
  const n = ((applicant.first || '') + ' ' + (applicant.last || '')).trim() || applicant.first || 'Friend';
  let style = 'sunrise';
  const frameEl = h('div', { class: 'art-frame' }), plaque = h('div', { class: 'plaque' });
  const chips = STYLES.map((x) => h('button', { type: 'button', class: 'tab', 'aria-pressed': String(x.id === style), onclick: () => { style = x.id; show(true); } }, x.label));
  const titleFor = () => '"' + TITLE + '": a portrait of ' + n + ', ' + styleById(style).medium + '. Commissioned by Achieve.';
  /* the other lighting is already loaded, so a tap swaps instantly */
  STYLES.forEach((x) => { const i = new Image(); i.src = x.src; });
  function show(anim) {
    const st = styleById(style);
    frameEl.replaceChildren(h('img', { class: 'art-img', src: st.src, alt: TITLE + ': ' + n + ' at the summit', style: 'filter:' + st.filter }), h('div', { class: 'art-you', 'aria-hidden': 'true' }, h('span', null, 'THAT\'S YOU, ' + ((applicant.first || 'friend') + '').toUpperCase() + '!'), h('span', { class: 'art-arr', html: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h16M13 5l7 7-7 7"/></svg>' })));
    if (anim) { frameEl.style.animation = 'none'; void frameEl.offsetWidth; frameEl.style.animation = ''; }
    plaque.replaceChildren(h('b', null, '"' + TITLE + '"'), h('span', null, 'Portrait of ' + n + ', ' + st.medium + ', 2026'));
    chips.forEach((c, k) => { const on = STYLES[k].id === style; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
  }
  show(false);
  /* the callout starts wobbling only once the portrait is actually on screen */
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting && e.intersectionRatio >= 0.55)) { io.disconnect(); const y = frameEl.querySelector('.art-you'); if (y) y.classList.add('go'); } }, { threshold: [0.55] });
    io.observe(frameEl);
  }
  return h('div', { class: 'art' }, h('p', { class: 'art-lead' }, 'Look who is standing on the summit. That is ', h('b', null, 'you'), ', ' + (applicant.first || 'friend') + '.'), h('div', { class: 'tabs' }, chips), frameEl, plaque,
    h('button', { type: 'button', class: 'btn line art-print', onclick: () => printPainting(n, titleFor(), style) }, ico('file', 18), 'Print my portrait'));
}
