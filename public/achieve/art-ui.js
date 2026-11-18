/* Achieve debt relief prototype: the commissioned portrait. A photo-style image of the client at the summit, in a gold frame,
   with a button that prints it. The picture is pre-made; "styles" swap in a different pre-made lighting (or a filter),
   so the choice feels instant. */
import { h, ico } from './firsttake/shared/dom.js';

export const STYLES = [
  { id: 'sunrise', label: 'Sunrise', src: '/achieve/img/summit-sunrise.jpg', filter: 'none', medium: 'golden hour' },
  { id: 'moon', label: 'Moonlight', src: '/achieve/img/summit-moon.jpg', filter: 'none', medium: 'moonlight' },
  { id: 'neon', label: 'Neon dusk', src: '/achieve/img/summit-neon.jpg', filter: 'none', medium: 'neon dusk' },
  { id: 'bw', label: 'Black and white', src: '/achieve/img/summit-sunrise.jpg', filter: 'grayscale(1) contrast(1.18) brightness(.97)', medium: 'black and white' },
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
    frameEl.replaceChildren(h('img', { class: 'art-img', src: st.src, alt: TITLE + ': ' + n + ' at the summit', style: 'filter:' + st.filter }));
    if (anim) { frameEl.style.animation = 'none'; void frameEl.offsetWidth; frameEl.style.animation = ''; }
    plaque.replaceChildren(h('b', null, '"' + TITLE + '"'), h('span', null, 'Portrait of ' + n + ', ' + st.medium + ', 2026'));
    chips.forEach((c, k) => { const on = STYLES[k].id === style; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
  }
  show(false);
  return h('div', { class: 'art' }, h('div', { class: 'tabs' }, chips), frameEl, plaque,
    h('button', { type: 'button', class: 'btn line art-print', onclick: () => printPainting(n, titleFor(), style) }, ico('file', 18), 'Print my portrait'));
}
