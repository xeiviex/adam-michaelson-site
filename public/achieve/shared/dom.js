/* Tiny DOM helpers and icons shared by the three Achieve contexts. */

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const k of Object.keys(attrs)) {
      const v = attrs[k];
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const $ = (s, r) => (r || document).querySelector(s);
export const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const P = {
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>', chevD: '<path d="M6 9l6 6 6-6"/>', chevU: '<path d="M6 15l6-6 6 6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.6"/><rect x="17" y="14" width="4" height="6" rx="1.6"/><path d="M19 20c0 1.2-1.5 2-4 2h-2"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  debt: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 10h8M8 14h5"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  dots: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  eye: '<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 6c.5-.1 1-.1 1.4-.1 6.500 0 10 6.100 10 6.100a17 17 0 0 1-3.200 3.800M6.500 7.600C3.800 9.300 2 12 2 12s3.500 6.500 10 6.500c1.600 0 3-.3 4.200-.9"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  search: '<circle cx="11" cy="11" r="6.500"/><path d="M20 20l-4.500-4.500"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  thumb: '<path d="M7 11v9H4v-9zM7 11l4-7c1.500 0 2.500 1 2.500 2.500V9h5a2 2 0 0 1 2 2.300l-1 6a2 2 0 0 1-2 1.700H7"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.400-5.700M20 4v4h-4"/>',
  share: '<path d="M12 15V4M7 9l5-5 5 5M5 14v5h14v-5"/>',
  clip: '<path d="M20 11l-8 8a5 5 0 0 1-7-7l8.500-8.500a3.500 3.500 0 0 1 5 5L10 17a2 2 0 0 1-3-3l7.500-7.500"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  speaker: '<path d="M4 10v4h4l5 4V6l-5 4zM16 9a4 4 0 0 1 0 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  compose: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  shield: '<path d="M12 3l7 3v5c0 4.500-3 8.200-7 10-4-1.800-7-5.500-7-10V6z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9z"/>',
};

export function icon(name, size, sw) {
  const s = size || 20;
  return '<svg class="i i-' + name + '" viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';
}
export const ico = (name, size, sw) => h('span', { class: 'ico', html: icon(name, size, sw) });

/* A friendly illustrated stand-in for the human consultant. Replace by dropping a real photo at
   /achieve/img/maya.jpg: the <img> below tries that first and falls back to this drawing. */
export const MAYA_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3defe"/><stop offset="1" stop-color="#c4ebdc"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/>' +
  '<path d="M20 52c-2-22 10-38 28-38s30 16 28 38c-1 14 2 24 6 30H14c4-6 7-16 6-30z" fill="#6b3f2a"/>' +
  '<path d="M16 96c1-20 14-28 32-28s31 8 32 28z" fill="#3300ff"/><path d="M38 68l10 12 10-12" fill="#fff"/>' +
  '<path d="M41 60h14v12c0 4-3 6-7 6s-7-2-7-6z" fill="#e6b08a"/>' +
  '<ellipse cx="48" cy="43" rx="16" ry="19" fill="#f2c6a3"/>' +
  '<path d="M31 42c-1-14 8-24 18-24 11 0 19 9 17 24-3-6-5-10-9-12-7 4-15 4-22 0-2 3-3 7-4 12z" fill="#6b3f2a"/>' +
  '<ellipse cx="42" cy="44" rx="1.800" ry="2.200" fill="#2b1a12"/><ellipse cx="54" cy="44" rx="1.800" ry="2.200" fill="#2b1a12"/>' +
  '<path d="M37 39c2-2 5-2 7-1M52 38c2-1 5-1 7 1" stroke="#5a3320" stroke-width="1.500" fill="none" stroke-linecap="round"/>' +
  '<path d="M42 52c3 3.500 9 3.500 12 0" stroke="#c0564f" stroke-width="2.200" fill="none" stroke-linecap="round"/>' +
  '<circle cx="31" cy="49" r="2" fill="#f1d27a"/><circle cx="65" cy="49" r="2" fill="#f1d27a"/></svg>');

export function avatarImg(cls) {
  const img = h('img', { class: cls || 'avatar', alt: 'Maya, Achieve loan consultant', src: '/achieve/img/maya.jpg', width: 96, height: 96 });
  img.addEventListener('error', () => { img.onerror = null; img.src = MAYA_SVG; }, { once: true });
  return img;
}

/* Type text into an element. Resolves when done. `token` lets a newer action cancel an older one. */
export async function typeInto(el, text, o) {
  const opt = o || {};
  if (reduced() || opt.instant) { el.textContent = text; return true; }
  el.textContent = '';
  el.classList.add('typing');
  const total = Math.min(1800, Math.max(350, text.length * (opt.speed || 15)));
  const step = total / Math.max(1, text.length);
  let i = 0;
  while (i < text.length) {
    if (opt.cancelled && opt.cancelled()) { el.classList.remove('typing'); return false; }
    const chunk = step < 9 ? Math.ceil(9 / step) : 1;
    i = Math.min(text.length, i + chunk);
    el.textContent = text.slice(0, i);
    if (opt.onTick) opt.onTick();
    await sleep(Math.max(8, step * chunk));
  }
  el.classList.remove('typing');
  return true;
}

export function tween(from, to, ms, fn) {
  if (reduced() || from === to) { fn(to); return; }
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / ms);
    fn(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
