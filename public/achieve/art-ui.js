/* Achieve debt relief prototype: the commissioned painting. An original illustration of the client mid-leap at sunrise,
   in a gold frame, with a button that prints it. SVG, no network. The "artist" is a prototype illustration. */
import { h, ico } from './firsttake/shared/dom.js';

let uid = 0;
export function paintingSVG(name) {
  const i = 'pt' + (++uid), n = (name || 'Friend').trim() || 'Friend';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 460" role="img" aria-label="Painting: ${n.replace(/[<>&"]/g, '')} leaping off a mountain ridge at sunrise" class="paint-svg">
<defs>
<linearGradient id="${i}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a8a"/><stop offset=".35" stop-color="#c0488f"/><stop offset=".65" stop-color="#ff8a5c"/><stop offset="1" stop-color="#ffd37a"/></linearGradient>
<radialGradient id="${i}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#ffe08a"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
<linearGradient id="${i}m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d4a8f"/><stop offset="1" stop-color="#4a2a63"/></linearGradient>
<linearGradient id="${i}m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2a63"/><stop offset="1" stop-color="#241437"/></linearGradient>
<linearGradient id="${i}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e08a"/><stop offset=".3" stop-color="#b98a2a"/><stop offset=".6" stop-color="#f3d77a"/><stop offset="1" stop-color="#8a621a"/></linearGradient>
<filter id="${i}oil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035 .06" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="9"/></filter>
<filter id="${i}can"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0"/></filter>
</defs>
<rect x="22" y="22" width="556" height="416" fill="#f5ecd8"/>
<g filter="url(#${i}oil)"><svg x="40" y="40" width="520" height="380" viewBox="0 0 520 380" preserveAspectRatio="xMidYMid slice">
<rect width="520" height="380" fill="url(#${i}sky)"/>
<circle cx="300" cy="190" r="150" fill="url(#${i}sun)"/>
<g fill="#fff" opacity=".35"><ellipse cx="90" cy="80" rx="80" ry="12"/><ellipse cx="410" cy="60" rx="70" ry="10"/><ellipse cx="200" cy="130" rx="60" ry="8"/></g>
<path d="M0 250 L70 190 L130 235 L210 160 L290 240 L360 185 L430 235 L520 175 L520 380 L0 380Z" fill="url(#${i}m1)"/>
<path d="M0 300 L80 250 L160 290 L250 235 L330 295 L420 250 L520 290 L520 380 L0 380Z" fill="url(#${i}m2)"/>
<path d="M0 262 L110 262 L135 275 L150 380 L0 380Z" fill="#1c1030"/>
<path d="M0 262 L110 262 L120 268 L0 272Z" fill="#6b3f73" opacity=".7"/>
<g transform="translate(300 150) rotate(-14)" stroke="#120a22" stroke-linecap="round" fill="none">
<path d="M0 -22 L-8 24" stroke-width="15"/>
<path d="M-6 -12 L-52 -42" stroke-width="9"/><path d="M4 -12 L48 -34" stroke-width="9"/>
<path d="M-8 24 L-46 54" stroke-width="10"/><path d="M-6 24 L22 62" stroke-width="10"/>
<path d="M-3 -24 C 40 -26 70 -4 108 -14" stroke="#ff3b5c" stroke-width="7"/>
<circle cx="2" cy="-38" r="14" fill="#120a22" stroke="none"/>
</g>
<g fill="#120a22" opacity=".8"><path d="M60 110 q8 -9 16 0 q8 -9 16 0 q-8 4 -16 2 q-8 2 -16 -2z"/><path d="M420 120 q6 -7 12 0 q6 -7 12 0 q-6 3 -12 1 q-6 2 -12 -1z"/></g>
</svg></g>
<rect x="40" y="40" width="520" height="380" fill="#000" filter="url(#${i}can)" opacity=".18"/>
<rect x="8" y="8" width="584" height="444" fill="none" stroke="url(#${i}gold)" stroke-width="18"/>
<rect x="26" y="26" width="548" height="408" fill="none" stroke="#8a621a" stroke-width="2"/>
<rect x="34" y="34" width="532" height="392" fill="none" stroke="#e6c46a" stroke-width="3"/>
</svg>`;
}

/* the print sheet: only the painting and its caption print */
export function printPainting(name, title) {
  const sheet = h('div', { id: 'printSheet' }, h('div', { html: paintingSVG(name) }), h('p', null, title));
  document.body.append(sheet); document.body.classList.add('printing-art');
  const done = () => { document.body.classList.remove('printing-art'); sheet.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } catch { done(); }
  setTimeout(() => { if (document.body.classList.contains('printing-art')) done(); }, 60000);
}

export function paintingBlock(applicant) {
  const n = ((applicant.first || '') + ' ' + (applicant.last || '')).trim() || applicant.first || 'Friend';
  const title = '"The Leap": a portrait of ' + n + '. Commissioned by Achieve.';
  const wall = h('div', { class: 'art' },
    h('div', { class: 'art-frame', html: paintingSVG(n) }),
    h('div', { class: 'plaque' }, h('b', null, '"The Leap"'), h('span', null, 'Portrait of ' + n + ', oil on canvas, 2026')),
    h('button', { type: 'button', class: 'btn line art-print', onclick: () => printPainting(n, title) }, ico('file', 18), 'Print my painting'),
    h('p', { class: 'fine' }, 'Prototype: an original illustration made for this demo. A real commission would be a hand-painted piece.'));
  return wall;
}
