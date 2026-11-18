/* Achieve debt relief prototype: the commissioned painting. An original illustration of the client mid-leap at sunrise,
   in a gold frame, with a button that prints it. SVG, no network. The "artist" is a prototype illustration. */
import { h, ico } from './firsttake/shared/dom.js';

let uid = 0;
export const STYLES = [
  { id: 'oil', label: 'Sunrise oil', medium: 'oil on canvas' },
  { id: 'pop', label: 'Neon pop', medium: 'acrylic and neon on panel' },
  { id: 'ink', label: 'Ink wash', medium: 'sumi ink and watercolor on paper' },
];
const rng = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
/* seeded brush strokes: short curved dabs that make the surface read as painted */
function strokes(seed, n, colors, x0, y0, x1, y1, wmin, wmax, op) {
  const r = rng(seed); let out = '';
  for (let k = 0; k < n; k++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), len = 26 + r() * 70, bend = (r() - 0.5) * 22, w = wmin + r() * (wmax - wmin);
    out += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} q${(len / 2).toFixed(1)} ${bend.toFixed(1)} ${len.toFixed(1)} ${(bend / 3).toFixed(1)}" stroke="${colors[(r() * colors.length) | 0]}" stroke-width="${w.toFixed(1)}" stroke-linecap="round" fill="none" opacity="${(op * (0.5 + r() * 0.6)).toFixed(2)}"/>`;
  }
  return out;
}
/* the hero mid-leap and the family waving from the ridge, shared by every style */
const hero = (ink, scarf) => `<g transform="translate(300 150) rotate(-14)" stroke="${ink}" stroke-linecap="round" fill="none"><path d="M0 -22 L-8 24" stroke-width="15"/><path d="M-6 -12 L-52 -42" stroke-width="9"/><path d="M4 -12 L48 -34" stroke-width="9"/><path d="M-8 24 L-46 54" stroke-width="10"/><path d="M-6 24 L22 62" stroke-width="10"/><path d="M-3 -24 C 40 -26 70 -4 108 -14" stroke="${scarf}" stroke-width="7"/><circle cx="2" cy="-38" r="14" fill="${ink}" stroke="none"/></g>`;
const family = (ink, glow) => `<g transform="translate(18 252)"><path d="M6 0 L6 -22 L26 -38 L46 -22 L46 0Z" fill="${ink}"/><rect x="20" y="-20" width="11" height="12" fill="${glow}"/><rect x="62" y="-34" width="7" height="34" rx="3" fill="${ink}"/><circle cx="65.500" cy="-40" r="6" fill="${ink}"/><path d="M65 -30 L52 -48" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><rect x="78" y="-34" width="7" height="34" rx="3" fill="${ink}"/><circle cx="81.500" cy="-40" r="6" fill="${ink}"/><path d="M82 -30 L96 -50" stroke="${ink}" stroke-width="4" stroke-linecap="round"/><rect x="94" y="-20" width="6" height="20" rx="3" fill="${ink}"/><circle cx="97" cy="-25" r="5" fill="${ink}"/><path d="M97 -17 L106 -30" stroke="${ink}" stroke-width="3" stroke-linecap="round"/></g>`;
const birds = (c) => `<g fill="${c}" opacity=".8"><path d="M60 110 q8 -9 16 0 q8 -9 16 0 q-8 4 -16 2 q-8 2 -16 -2z"/><path d="M420 120 q6 -7 12 0 q6 -7 12 0 q-6 3 -12 1 q-6 2 -12 -1z"/></g>`;

function scene(style, i) {
  if (style === 'pop') return `
<rect width="520" height="380" fill="url(#${i}sky)"/>
<g fill="#ffffff" opacity=".9"><circle cx="60" cy="40" r="1.8"/><circle cx="150" cy="70" r="1.4"/><circle cx="240" cy="28" r="2"/><circle cx="430" cy="48" r="1.8"/><circle cx="480" cy="110" r="1.4"/><circle cx="360" cy="22" r="1.4"/></g>
<circle cx="300" cy="200" r="118" fill="url(#${i}sun)"/>
<g fill="#1a0b3d" opacity=".9">${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="170" y="${220 + k * 12}" width="260" height="${2 + k * 1.4}"/>`).join('')}</g>
<path d="M0 250 L70 190 L130 235 L210 160 L290 240 L360 185 L430 235 L520 175 L520 380 L0 380Z" fill="#2a0f5e" stroke="#00e5ff" stroke-width="2.500"/>
<path d="M0 300 L80 250 L160 290 L250 235 L330 295 L420 250 L520 290 L520 380 L0 380Z" fill="#150636" stroke="#ff2e93" stroke-width="2.500"/>
<g stroke="#00e5ff" stroke-width="1" opacity=".5">${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M${k * 74 - 20} 380 L260 300"/>`).join('')}</g>
<path d="M0 262 L110 262 L135 275 L150 380 L0 380Z" fill="#0a0220" stroke="#00e5ff" stroke-width="2"/>
${family('#0a0220', '#ffb000')}
<g filter="url(#${i}glow)">${hero('#0a0220', '#00e5ff')}</g>
${birds('#00e5ff')}`;
  if (style === 'ink') return `
<rect width="520" height="380" fill="#f6efe0"/>
<g filter="url(#${i}wash)"><ellipse cx="260" cy="120" rx="300" ry="110" fill="#f5c4a0" opacity=".55"/><ellipse cx="380" cy="70" rx="220" ry="70" fill="#9fc3d9" opacity=".45"/><ellipse cx="110" cy="190" rx="180" ry="60" fill="#e9a58a" opacity=".35"/></g>
<circle cx="300" cy="170" r="54" fill="#d6342b" opacity=".92" filter="url(#${i}wash)"/>
<g filter="url(#${i}wash)"><path d="M0 250 L70 192 L130 236 L210 166 L290 240 L360 190 L430 236 L520 180 L520 380 L0 380Z" fill="#6f7c8c" opacity=".55"/><path d="M0 300 L80 252 L160 292 L250 240 L330 296 L420 252 L520 292 L520 380 L0 380Z" fill="#2f3945" opacity=".8"/><path d="M0 262 L110 262 L135 275 L150 380 L0 380Z" fill="#161b22"/></g>
${family('#161b22', '#d6342b')}
<g filter="url(#${i}wash)">${hero('#161b22', '#d6342b')}</g>
${birds('#161b22')}
${strokes(8, 26, ['#161b22', '#2f3945'], 0, 40, 520, 300, 1.5, 4, 0.35)}`;
  return `
<rect width="520" height="380" fill="url(#${i}sky)"/>
<circle cx="300" cy="190" r="150" fill="url(#${i}sun)"/>
<g fill="#fff" opacity=".35"><ellipse cx="90" cy="80" rx="80" ry="12"/><ellipse cx="410" cy="60" rx="70" ry="10"/><ellipse cx="200" cy="130" rx="60" ry="8"/></g>
${strokes(3, 46, ['#ffd37a', '#ff8a5c', '#c0488f', '#fff1c2'], 0, 30, 520, 210, 6, 13, 0.34)}
<path d="M0 250 L70 190 L130 235 L210 160 L290 240 L360 185 L430 235 L520 175 L520 380 L0 380Z" fill="url(#${i}m1)"/>
${strokes(5, 30, ['#9b5fa8', '#5a3270', '#c0488f'], 0, 170, 520, 290, 5, 11, 0.3)}
<path d="M0 300 L80 250 L160 290 L250 235 L330 295 L420 250 L520 290 L520 380 L0 380Z" fill="url(#${i}m2)"/>
${strokes(6, 22, ['#4a2a63', '#241437', '#7d4a8f'], 0, 240, 520, 380, 6, 12, 0.34)}
<path d="M0 262 L110 262 L135 275 L150 380 L0 380Z" fill="#1c1030"/><path d="M0 262 L110 262 L120 268 L0 272Z" fill="#6b3f73" opacity=".7"/>
${family('#120a22', '#ffd37a')}
${hero('#120a22', '#ff3b5c')}
${strokes(9, 10, ['#fff6c9', '#ffe08a'], 220, 100, 400, 200, 3, 6, 0.4)}
${birds('#120a22')}`;
}

export function paintingSVG(name, style) {
  const i = 'pt' + (++uid), n = (name || 'Friend').trim() || 'Friend', st = style || 'oil';
  const frame = st === 'pop' ? '<rect x="8" y="8" width="584" height="444" fill="none" stroke="#00e5ff" stroke-width="8"/><rect x="18" y="18" width="564" height="424" fill="none" stroke="#ff2e93" stroke-width="4"/>' : st === 'ink' ? '<rect x="8" y="8" width="584" height="444" fill="none" stroke="#3a2a22" stroke-width="16"/><rect x="30" y="30" width="540" height="400" fill="none" stroke="#c9b48a" stroke-width="2"/>' : `<rect x="8" y="8" width="584" height="444" fill="none" stroke="url(#${i}gold)" stroke-width="18"/><rect x="26" y="26" width="548" height="408" fill="none" stroke="#8a621a" stroke-width="2"/><rect x="34" y="34" width="532" height="392" fill="none" stroke="#e6c46a" stroke-width="3"/>`;
  const mat = st === 'pop' ? '#0a0220' : st === 'ink' ? '#efe6d2' : '#f5ecd8';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 460" role="img" aria-label="Painting: ${n.replace(/[<>&"]/g, '')} leaping off a mountain ridge, family and home waving behind" class="paint-svg">
<defs>
<linearGradient id="${i}sky" x1="0" y1="0" x2="0" y2="1">${st === 'pop' ? '<stop offset="0" stop-color="#1a0b3d"/><stop offset=".5" stop-color="#7a1fa2"/><stop offset=".8" stop-color="#ff2e93"/><stop offset="1" stop-color="#ffb000"/>' : '<stop offset="0" stop-color="#3b2a8a"/><stop offset=".35" stop-color="#c0488f"/><stop offset=".65" stop-color="#ff8a5c"/><stop offset="1" stop-color="#ffd37a"/>'}</linearGradient>
<radialGradient id="${i}sun" cx=".5" cy=".5" r=".5">${st === 'pop' ? '<stop offset="0" stop-color="#fff36b"/><stop offset=".6" stop-color="#ff5ea8"/><stop offset="1" stop-color="#ff2e93" stop-opacity="0"/>' : '<stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/>'}</radialGradient>
<linearGradient id="${i}m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d4a8f"/><stop offset="1" stop-color="#4a2a63"/></linearGradient>
<linearGradient id="${i}m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2a63"/><stop offset="1" stop-color="#241437"/></linearGradient>
<linearGradient id="${i}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e08a"/><stop offset=".3" stop-color="#b98a2a"/><stop offset=".6" stop-color="#f3d77a"/><stop offset="1" stop-color="#8a621a"/></linearGradient>
<filter id="${i}oil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${st === 'oil' ? 9 : 3}"/></filter>
<filter id="${i}wash" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".02 .035" numOctaves="4" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16"/><feGaussianBlur stdDeviation=".8"/></filter>
<filter id="${i}glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="${i}can"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/></filter>
<filter id="${i}imp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .09" numOctaves="3" seed="12" result="h"/><feDiffuseLighting in="h" surfaceScale="2.4" diffuseConstant="1" lighting-color="#fff4d6" result="l"><feDistantLight azimuth="235" elevation="52"/></feDiffuseLighting><feComposite in="l" in2="SourceGraphic" operator="in"/></filter>
</defs>
<rect x="22" y="22" width="556" height="416" fill="${mat}"/>
<g filter="url(#${i}oil)"><svg x="40" y="40" width="520" height="380" viewBox="0 0 520 380" preserveAspectRatio="xMidYMid slice">${scene(st, i)}</svg></g>
${st === 'oil' ? `<rect x="40" y="40" width="520" height="380" fill="#fff" filter="url(#${i}imp)" opacity=".16" style="mix-blend-mode:overlay"/>` : ''}
<rect x="40" y="40" width="520" height="380" fill="#000" filter="url(#${i}can)" opacity="${st === 'ink' ? 0.1 : 0.18}"/>
${frame}
</svg>`;
}

/* the print sheet: only the painting and its caption print */
export function printPainting(name, title, style) {
  const sheet = h('div', { id: 'printSheet' }, h('div', { html: paintingSVG(name, style) }), h('p', null, title));
  document.body.append(sheet); document.body.classList.add('printing-art');
  const done = () => { document.body.classList.remove('printing-art'); sheet.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } catch { done(); }
  setTimeout(() => { if (document.body.classList.contains('printing-art')) done(); }, 60000);
}

export function paintingBlock(applicant) {
  const n = ((applicant.first || '') + ' ' + (applicant.last || '')).trim() || applicant.first || 'Friend';
  let style = 'oil';
  const frameEl = h('div', { class: 'art-frame' }), plaque = h('div', { class: 'plaque' });
  const chips = STYLES.map((x) => h('button', { type: 'button', class: 'tab', 'aria-pressed': String(x.id === style), onclick: () => { style = x.id; show(true); } }, x.label));
  const titleFor = () => '"The Leap": a portrait of ' + n + ', ' + STYLES.find((x) => x.id === style).medium + '. Commissioned by Achieve.';
  function show(anim) {
    frameEl.innerHTML = paintingSVG(n, style); if (anim) { frameEl.style.animation = 'none'; void frameEl.offsetWidth; frameEl.style.animation = ''; }
    plaque.replaceChildren(h('b', null, '"The Leap"'), h('span', null, 'Portrait of ' + n + ', ' + STYLES.find((x) => x.id === style).medium + ', 2026'));
    chips.forEach((c, k) => { const on = STYLES[k].id === style; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
  }
  show(false);
  return h('div', { class: 'art' }, h('div', { class: 'tabs' }, chips), frameEl, plaque,
    h('button', { type: 'button', class: 'btn line art-print', onclick: () => printPainting(n, titleFor(), style) }, ico('file', 18), 'Print my painting'),
    h('p', { class: 'fine' }, 'An original illustration made for you, with your family and home waving from the ridge.'));
}
