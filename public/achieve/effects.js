/* Achieve debt relief prototype: celebration effects on one full-screen canvas (#confetti).
   Kinds: confetti, streamers, fireworks, band (a little band with musical notes flying). No audio, no dependencies. */
const COLORS = ['#3300ff', '#5a4cf0', '#146c55', '#ffb703', '#ff5d8f', '#00c2a8', '#ff7a1a'];
export const FX_KINDS = ['confetti', 'streamers', 'fireworks', 'band', 'balloons', 'stamp', 'target', 'seal', 'trophy', 'beam', 'flag', 'bell', 'gavel', 'sunrise', 'wave', 'shred', 'coins'];
const SCENE_DUR = { stamp: 2000, target: 3200, seal: 2400, trophy: 3600, beam: 3200, flag: 3400, bell: 3200, gavel: 2600, sunrise: 4200, wave: 3600 };
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const S = { confetti: [], streamers: [], rockets: [], sparks: [], notes: [], bands: [], balloons: [], strips: [], coins: [], scenes: [], on: false, last: 0 };
let cv, cx, W = 0, H = 0;

function ensure() {
  cv = cv || document.getElementById('confetti'); if (!cv) return false;
  cx = cx || cv.getContext('2d');
  if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
  W = cv.width; H = cv.height; cv.classList.add('on'); return true;
}

import { LOTTIE_KINDS, playLottie, warmLottie, lottieOff } from './lottie-fx.js';
if (typeof window !== 'undefined') warmLottie();
/* trophy, balloons, streamers and coins play as Lottie animations; the canvas versions below are the fallback */
/* while the account area is open, celebrations are cleared and blocked */
let blocked = false;
export function setFxPaused(on) {
  blocked = !!on; lottieOff(blocked); if (!on) return;
  ['confetti', 'streamers', 'rockets', 'sparks', 'notes', 'bands', 'balloons', 'strips', 'coins', 'scenes'].forEach((k) => { S[k].length = 0; });
  if (cx && cv) cx.clearRect(0, 0, cv.width, cv.height);
  if (cv) cv.classList.remove('on');
  document.querySelectorAll('.lottie-fx').forEach((e) => e.remove());
}
export function fx(kind, n) {
  if (reduced() || blocked) return;
  if (LOTTIE_KINDS.includes(kind)) { playLottie(kind).then((ok) => { if (!ok) fxCanvas(kind, n); }); return; }
  fxCanvas(kind, n);
}
function fxCanvas(kind, n) {
  if (reduced() || blocked || !ensure()) return;
  const now = performance.now();
  if (kind === 'streamers') {
    [0.04, 0.96].forEach((fx0, side) => { for (let i = 0; i < (n ? Math.min(14, n / 10) : 9); i++) S.streamers.push({ x: W * fx0, y: H * 0.92, vx: (side ? -1 : 1) * rnd(2, 9), vy: -rnd(14, 24), c: pick(COLORS), w: rnd(5, 9), trail: [], t0: now + i * 40, ph: rnd(0, 6), life: 3600 }); });
  } else if (kind === 'fireworks') {
    const k = n ? Math.min(9, Math.max(3, Math.round(n / 40))) : 6;
    for (let i = 0; i < k; i++) S.rockets.push({ x: rnd(W * 0.15, W * 0.85), y: H, ty: rnd(H * 0.15, H * 0.5), vy: -rnd(11, 15), c: pick(COLORS), t0: now + i * 380, dead: false });
  } else if (kind === 'band') {
    S.bands.push({ t0: now, dur: 4200 });
  } else if (kind === 'balloons') {
    for (let i = 0; i < 24; i++) S.balloons.push({ x: rnd(0.05, 0.95) * W, y: H + rnd(20, 260), vy: -rnd(2.9, 5.6), ph: rnd(0, 6), c: pick(COLORS), r: rnd(20, 32), t0: now });
  } else if (kind === 'shred') {
    for (let i = 0; i < 70; i++) S.strips.push({ x: rnd(0, W), y: -rnd(10, 260), vy: rnd(1.4, 3.4), ph: rnd(0, 6), r: rnd(0, 6), vr: rnd(-0.12, 0.12), len: rnd(24, 60), c: pick(['#ffffff', '#e8e6f5', '#cfd8ff', '#fff3c4']), t0: now });
  } else if (kind === 'coins') {
    for (let i = 0; i < 46; i++) S.coins.push({ x: rnd(0.05, 0.95) * W, y: -rnd(10, 420), vy: rnd(3, 6), ph: rnd(0, 6), r: rnd(11, 18), t0: now });
  } else if (SCENE_DUR[kind]) {
    S.scenes.push({ kind, t0: now, dur: SCENE_DUR[kind] });
  } else {
    for (let i = 0; i < (n || 140); i++) S.confetti.push({ x: W / 2 + rnd(-130, 130), y: H * 0.45, vx: rnd(-7, 7), vy: -rnd(4, 20), s: rnd(5, 11), r: rnd(0, 6), vr: rnd(-0.15, 0.15), c: pick(COLORS), t0: now });
  }
  if (!S.on) { S.on = true; S.last = now; requestAnimationFrame(frame); }
}

function drawBand(b, t) {
  const age = t - b.t0, k = Math.min(1, age / 500) * Math.min(1, (b.dur - age) / 500);
  if (k <= 0) return;
  const cy = H - 8 + (1 - k) * 160, u = Math.min(W / 640, 1.3), beat = Math.sin(age / 150);
  const members = [
    { x: 0.2, c: '#3300ff', tool: 'sax' }, { x: 0.4, c: '#146c55', tool: 'guitar' }, { x: 0.6, c: '#ff5d8f', tool: 'drums' }, { x: 0.8, c: '#ffb703', tool: 'sing' },
  ];
  members.forEach((m, i) => {
    const bob = Math.sin(age / 150 + i * 1.2) * 6 * u, x = W * m.x, y = cy + bob;
    cx.save(); cx.translate(x, y); cx.scale(u, u); cx.globalAlpha = k;
    cx.fillStyle = m.c; cx.beginPath(); cx.roundRect(-20, -70, 40, 70, 14); cx.fill();
    cx.fillStyle = '#f2c9a5'; cx.beginPath(); cx.arc(0, -86, 15, 0, 7); cx.fill();
    cx.fillStyle = '#1a1a2e'; cx.beginPath(); cx.arc(0, -90, 15, Math.PI, 0); cx.fill();
    cx.strokeStyle = '#1a1a2e'; cx.fillStyle = '#ffd24a'; cx.lineWidth = 4;
    if (m.tool === 'sax') { cx.beginPath(); cx.moveTo(8, -60); cx.lineTo(30, -40); cx.lineTo(34, -14); cx.stroke(); cx.beginPath(); cx.arc(34, -10, 9, 0, 7); cx.fill(); }
    if (m.tool === 'guitar') { cx.beginPath(); cx.ellipse(-14, -26, 22, 16, -0.5, 0, 7); cx.fillStyle = '#c27a3a'; cx.fill(); cx.beginPath(); cx.moveTo(0, -36); cx.lineTo(34, -64); cx.stroke(); }
    if (m.tool === 'drums') { cx.fillStyle = '#e8e6f5'; cx.fillRect(-36, -26, 72, 26); cx.strokeRect(-36, -26, 72, 26); cx.beginPath(); cx.moveTo(24, -56 + beat * 6); cx.lineTo(8, -34); cx.stroke(); }
    if (m.tool === 'sing') { cx.beginPath(); cx.moveTo(16, -64); cx.lineTo(16, -20); cx.stroke(); cx.fillStyle = '#1a1a2e'; cx.beginPath(); cx.arc(16, -68, 6, 0, 7); cx.fill(); }
    cx.restore();
    if (Math.random() < 0.16 * k) S.notes.push({ x: x + rnd(-10, 30) * u, y: y - 110 * u, vy: -rnd(1.6, 3.2), ph: rnd(0, 6), g: pick(['♪', '♫', '♩', '♬']), c: pick(COLORS), s: rnd(22, 40), t0: t });
  });
}


const env = (age, dur, fi = 0.12, fo = 0.2) => Math.max(0, Math.min(1, age / (dur * fi), (dur - age) / (dur * fo)));
const outBack = (u) => { u = Math.max(0, Math.min(1, u)); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
function ring(x, y, r, a, col, w) { cx.save(); cx.globalAlpha = Math.max(0, a); cx.strokeStyle = col; cx.lineWidth = w; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.stroke(); cx.restore(); }
function sparkle(x, y, r, a, col) { cx.save(); cx.globalAlpha = Math.max(0, a); cx.fillStyle = col || '#fff6b0'; cx.translate(x, y); cx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.28 : r; const an = (i / 8) * Math.PI * 2; cx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } cx.closePath(); cx.fill(); cx.restore(); }
function dim(a) { cx.fillStyle = 'rgba(20,10,50,' + a + ')'; cx.fillRect(0, 0, W, H); }
function sparkles(age, seed, n, cxp, cyp, spread, life) { const r = (() => { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })(); for (let i = 0; i < n; i++) { const a0 = r() * 6.28, d = r() * spread, t0 = r() * life * 0.6, k = (age - t0) / (life * 0.4); if (k < 0 || k > 1) continue; sparkle(cxp + Math.cos(a0) * d, cyp + Math.sin(a0) * d - k * 20, 6 + r() * 12, Math.sin(Math.PI * k), pick(['#fff6b0', '#ffd24a', '#fff'])); } }

function drawScene(sc, t) {
  const age = Math.max(0, t - sc.t0), d = sc.dur, e = env(age, d), u = age / d, cxm = W / 2, cym = H * 0.46, S1 = Math.min(1, W / 700);
  if (sc.kind === 'stamp') {
    const slam = Math.min(1, age / 220), sc2 = 2.6 - 1.6 * slam, rot = -0.14, shake = age > 200 && age < 420 ? (Math.random() - 0.5) * 10 : 0;
    cx.save(); cx.translate(cxm + shake, cym + shake); cx.rotate(rot); cx.scale(sc2 * S1, sc2 * S1); cx.globalAlpha = e * Math.min(1, slam * 1.3);
    cx.strokeStyle = '#146c55'; cx.fillStyle = '#146c55'; cx.lineWidth = 12; cx.beginPath(); cx.roundRect ? cx.roundRect(-210, -70, 420, 140, 18) : cx.rect(-210, -70, 420, 140); cx.stroke();
    cx.lineWidth = 3; cx.beginPath(); cx.roundRect ? cx.roundRect(-196, -56, 392, 112, 12) : cx.rect(-196, -56, 392, 112); cx.stroke();
    cx.font = '900 76px system-ui, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText("YOU'RE IN", 0, 4); cx.restore();
    if (age > 200) ring(cxm, cym, (age - 200) * 0.9, 1 - (age - 200) / 500, '#146c55', 6);
  } else if (sc.kind === 'target') {
    /* an archery target pops in on the right, an arrow arcs in from the left and sticks in the bullseye */
    const tx = W * 0.72, ty = cym, R = 105 * S1 + 20, hit = 0.46, pop = outBack(Math.min(1, u / 0.16));
    cx.save(); cx.globalAlpha = e;
    cx.save(); cx.translate(tx, ty); cx.scale(Math.max(0.01, pop), Math.max(0.01, pop));
    cx.strokeStyle = '#6b4a2a'; cx.lineWidth = 9; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(-R * 0.35, R * 0.8); cx.lineTo(-R * 0.75, R * 1.9); cx.moveTo(R * 0.35, R * 0.8); cx.lineTo(R * 0.75, R * 1.9); cx.stroke();
    [['#f4f1ea', 1], ['#23233a', 0.8], ['#2a6df4', 0.6], ['#e8325f', 0.4], ['#ffd24a', 0.2]].forEach(([col, f]) => { cx.fillStyle = col; cx.beginPath(); cx.arc(0, 0, R * f, 0, 7); cx.fill(); });
    cx.strokeStyle = 'rgba(0,0,0,.28)'; cx.lineWidth = 2; [1, 0.8, 0.6, 0.4, 0.2].forEach((f) => { cx.beginPath(); cx.arc(0, 0, R * f, 0, 7); cx.stroke(); });
    cx.strokeStyle = '#6b4a2a'; cx.lineWidth = 7; cx.beginPath(); cx.arc(0, 0, R + 3, 0, 7); cx.stroke();
    cx.restore();
    /* arrow: parabolic arc from off-screen left to the center; tip leads */
    const fly = Math.min(1, Math.max(0, (u - 0.18) / (hit - 0.18))), L = 120 * S1 + 30;
    const pos = (k) => ({ x: lerp(-L, tx, k), y: lerp(ty + 90, ty, k) - Math.sin(Math.PI * k) * 70 });
    if (u > 0.18) {
      const tip = pos(fly), pre = pos(Math.max(0, fly - 0.02)); let ang = Math.atan2(tip.y - pre.y, tip.x - pre.x); if (fly >= 1) ang = 0.05;
      const wob = fly >= 1 ? Math.sin((age - hit * d) / 38) * 0.09 * Math.exp(-(age - hit * d) / 260) : 0, len = fly >= 1 ? L * 0.62 : L;
      if (fly < 1) { for (let i = 1; i <= 6; i++) { const q = pos(Math.max(0, fly - i * 0.035)); cx.globalAlpha = e * (0.35 - i * 0.05); cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(q.x - 20, q.y); cx.lineTo(q.x - 50, q.y); cx.stroke(); } cx.globalAlpha = e; }
      cx.save(); cx.translate(tip.x, tip.y); cx.rotate(ang + wob); cx.lineCap = 'round';
      cx.strokeStyle = '#8a5a2b'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(-len, 0); cx.stroke();
      cx.fillStyle = '#4b5263'; cx.beginPath(); cx.moveTo(8, 0); cx.lineTo(-10, -8); cx.lineTo(-10, 8); cx.closePath(); cx.fill();
      cx.fillStyle = '#e8325f'; [-1, 1].forEach((sd) => { cx.beginPath(); cx.moveTo(-len, 0); cx.lineTo(-len - 18, sd * 12); cx.lineTo(-len + 22, sd * 12); cx.lineTo(-len + 22, 0); cx.closePath(); cx.fill(); });
      cx.restore();
    }
    cx.restore();
    if (u >= hit) { const ha = age - hit * d; ring(tx, ty, ha * 0.55, 1 - ha / 700, '#ffd24a', 6); ring(tx, ty, ha * 0.9, 1 - ha / 600, '#fff', 3); sparkles(ha, 11, 26, tx, ty, 150, 1400);
      cx.save(); cx.globalAlpha = Math.min(1, ha / 200) * e; cx.fillStyle = '#e8325f'; cx.font = '900 ' + Math.round(46 * S1 + 6) + 'px system-ui, sans-serif'; cx.textAlign = 'center'; cx.fillText('Bullseye!', tx, ty - R - 26 - Math.min(20, ha / 20)); cx.restore(); }
  } else if (sc.kind === 'seal') {
    const slam = Math.min(1, age / 260), sc2 = 2 - slam;
    cx.save(); cx.globalAlpha = e; cx.translate(cxm, cym); cx.scale(sc2 * S1, sc2 * S1);
    const g = cx.createRadialGradient(-20, -20, 10, 0, 0, 84); g.addColorStop(0, '#ffe98a'); g.addColorStop(0.55, '#f2b92e'); g.addColorStop(1, '#a8741a'); cx.fillStyle = g; cx.beginPath(); for (let i = 0; i < 28; i++) { const a0 = (i / 28) * 6.283, rr = 78 + (i % 2 ? 6 : -2); cx.lineTo(Math.cos(a0) * rr, Math.sin(a0) * rr); } cx.closePath(); cx.fill();
    cx.strokeStyle = 'rgba(255,248,210,.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 54, 0, 7); cx.stroke(); cx.strokeStyle = 'rgba(140,90,10,.35)'; cx.lineWidth = 2; cx.beginPath(); cx.arc(0, 0, 49, 0, 7); cx.stroke();
    cx.beginPath(); for (let i = 0; i < 10; i++) { const a1 = -Math.PI / 2 + (i / 10) * Math.PI * 2, r1 = i % 2 ? 19 : 42; cx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1 + 3); } cx.closePath(); const sg = cx.createLinearGradient(0, -40, 0, 40); sg.addColorStop(0, '#fffbe6'); sg.addColorStop(1, '#ffe27a'); cx.fillStyle = sg; cx.fill(); cx.strokeStyle = '#a8741a'; cx.lineWidth = 2.5; cx.lineJoin = 'round'; cx.stroke(); cx.restore();
    if (age > 230) { ring(cxm, cym, (age - 230) * 0.5, 1 - (age - 230) / 600, '#ffb703', 5); sparkles(age - 230, 3, 20, cxm, cym, 140, 1200); }
  } else if (sc.kind === 'trophy') {
    dim(0.28 * e); const rise = outBack(Math.min(1, age / 900)), ty = lerp(H + 140, cym + 20, rise);
    cx.save(); cx.translate(cxm, cym); cx.globalAlpha = e * 0.55; cx.rotate(age / 2600); for (let i = 0; i < 14; i++) { cx.rotate(Math.PI * 2 / 14); const g = cx.createLinearGradient(0, 0, 0, -520); g.addColorStop(0, 'rgba(255,230,120,.8)'); g.addColorStop(1, 'rgba(255,230,120,0)'); cx.fillStyle = g; cx.beginPath(); cx.moveTo(-14, 0); cx.lineTo(14, 0); cx.lineTo(40, -520); cx.lineTo(-40, -520); cx.closePath(); cx.fill(); } cx.restore();
    cx.save(); cx.globalAlpha = e; cx.translate(cxm, ty); cx.scale(1.25 * S1, 1.25 * S1);
    const gold = cx.createLinearGradient(-60, 0, 60, 0); gold.addColorStop(0, '#b98a2a'); gold.addColorStop(0.4, '#ffe486'); gold.addColorStop(1, '#a8741a'); cx.fillStyle = gold; cx.strokeStyle = '#a8741a'; cx.lineWidth = 8;
    cx.beginPath(); cx.arc(-52, -50, 24, 1.2, 4.4); cx.stroke(); cx.beginPath(); cx.arc(52, -50, 24, 5.0, 8.2); cx.stroke();
    cx.beginPath(); cx.moveTo(-58, -110); cx.lineTo(58, -110); cx.quadraticCurveTo(58, -20, 0, -10); cx.quadraticCurveTo(-58, -20, -58, -110); cx.fill();
    cx.fillRect(-9, -12, 18, 40); cx.beginPath(); cx.moveTo(-44, 28); cx.lineTo(44, 28); cx.lineTo(54, 56); cx.lineTo(-54, 56); cx.closePath(); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(-44, -104, 10, 70); cx.fillStyle = '#7a4d0a'; cx.font = '900 22px system-ui'; cx.textAlign = 'center'; cx.fillText('#1', 0, -62); cx.restore();
    if (age > 800) sparkles(age - 800, 5, 34, cxm, cym, 200, 2400);
  } else if (sc.kind === 'beam') {
    const lx = W * 0.88, ly = H * 0.82; dim(0.45 * e);
    cx.save(); cx.globalAlpha = e; cx.fillStyle = '#e8e6f5'; cx.beginPath(); cx.moveTo(lx - 22, H); cx.lineTo(lx - 12, ly); cx.lineTo(lx + 12, ly); cx.lineTo(lx + 22, H); cx.fill(); cx.fillStyle = '#e63946'; [0.25, 0.6].forEach((q) => cx.fillRect(lx - 21 + q * 6, ly + q * (H - ly) - 18, 42 - q * 12, 16)); cx.fillStyle = '#ffd24a'; cx.fillRect(lx - 14, ly - 18, 28, 18); cx.restore();
    const ang = Math.PI + 0.25 + 0.9 * (0.5 + 0.5 * Math.sin(age / 480)); cx.save(); cx.globalAlpha = 0.55 * e; cx.translate(lx, ly - 9); cx.rotate(ang); const g = cx.createLinearGradient(0, 0, W * 1.1, 0); g.addColorStop(0, 'rgba(255,250,200,.95)'); g.addColorStop(1, 'rgba(255,250,200,0)'); cx.fillStyle = g; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(W * 1.1, -90); cx.lineTo(W * 1.1, 90); cx.closePath(); cx.fill(); cx.restore();
    cx.save(); cx.globalAlpha = e; cx.fillStyle = '#fff'; cx.font = '900 54px system-ui'; cx.textAlign = 'center'; cx.fillText('25%', cxm, cym - 30); cx.restore();
  } else if (sc.kind === 'flag') {
    const peakY = lerp(H + 40, H * 0.62, outBack(Math.min(1, age / 900))); cx.save(); cx.globalAlpha = e;
    cx.fillStyle = '#6b3f73'; cx.beginPath(); cx.moveTo(cxm - 260, H); cx.lineTo(cxm, peakY); cx.lineTo(cxm + 260, H); cx.closePath(); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(cxm - 40, peakY + 52); cx.lineTo(cxm, peakY); cx.lineTo(cxm + 40, peakY + 52); cx.closePath(); cx.fill();
    const grow = Math.min(1, Math.max(0, (age - 700) / 400)), ph = 130 * grow; cx.strokeStyle = '#e8e6f5'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(cxm, peakY); cx.lineTo(cxm, peakY - ph); cx.stroke();
    if (grow > 0.6) { cx.fillStyle = '#3300ff'; cx.beginPath(); cx.moveTo(cxm, peakY - ph); for (let i = 0; i <= 12; i++) cx.lineTo(cxm + i * 8, peakY - ph + Math.sin(age / 130 + i * 0.6) * (i * 0.9)); for (let i = 12; i >= 0; i--) cx.lineTo(cxm + i * 8, peakY - ph + 44 + Math.sin(age / 130 + i * 0.6) * (i * 0.9)); cx.closePath(); cx.fill(); cx.fillStyle = '#fff'; cx.font = '800 20px system-ui'; cx.fillText('50%', cxm + 14, peakY - ph + 30); }
    cx.restore(); if (age > 1000) sparkles(age - 1000, 9, 22, cxm + 40, peakY - 100, 120, 1800);
  } else if (sc.kind === 'bell') {
    const sw = Math.sin(age / 110) * 0.55 * Math.exp(-age / 1300); cx.save(); cx.globalAlpha = e; cx.translate(cxm, -10); cx.rotate(sw); cx.strokeStyle = '#7a4d0a'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(0, 150); cx.stroke(); cx.translate(0, 150);
    const g = cx.createLinearGradient(-70, 0, 70, 0); g.addColorStop(0, '#b98a2a'); g.addColorStop(0.45, '#ffe486'); g.addColorStop(1, '#a8741a'); cx.fillStyle = g; cx.beginPath(); cx.moveTo(-26, 0); cx.quadraticCurveTo(-30, 60, -72, 110); cx.lineTo(72, 110); cx.quadraticCurveTo(30, 60, 26, 0); cx.closePath(); cx.fill(); cx.fillStyle = '#7a4d0a'; cx.beginPath(); cx.arc(Math.sin(age / 110 + 1) * 12, 118, 12, 0, 7); cx.fill(); cx.restore();
    for (let i = 0; i < 4; i++) ring(cxm, 275, ((age + i * 380) % 1500) * 0.35, 1 - ((age + i * 380) % 1500) / 1500, '#ffd24a', 4);
    cx.save(); cx.globalAlpha = e; cx.fillStyle = '#ffd24a'; cx.font = '900 54px system-ui'; cx.textAlign = 'center'; cx.fillText('75%', cxm, H * 0.62); cx.restore();
    if (Math.random() < 0.12 * e) S.notes.push({ x: cxm + rnd(-90, 90), y: 280, vy: -rnd(1.6, 3), ph: rnd(0, 6), g: pick(['♪', '♫']), c: '#ffd24a', s: rnd(24, 38), t0: t });
  } else if (sc.kind === 'gavel') {
    const hit = 500, k = age < hit ? ease2(age / hit) : 1, ang = lerp(-0.95, 0.12, k), bounce = age > hit ? Math.exp(-(age - hit) / 160) * Math.sin((age - hit) / 40) * 0.07 : 0;
    cx.save(); cx.globalAlpha = e; cx.fillStyle = '#5b3a24'; cx.fillRect(cxm - 130 * S1, cym + 90, 260 * S1, 36); cx.fillStyle = '#7a4d2e'; cx.fillRect(cxm - 150 * S1, cym + 126, 300 * S1, 14);
    cx.translate(cxm + 80 * S1, cym + 80); cx.rotate(ang + bounce); cx.scale(S1, S1); cx.fillStyle = '#8a5a34'; cx.fillRect(-12, -10, 24, -170); cx.fillRect(-12, -10, 24, 0); cx.fillStyle = '#a06a3c'; cx.fillRect(-12, -180, 24, 170); cx.fillStyle = '#6b4224'; cx.fillRect(-54, -230, 108, 56); cx.fillStyle = '#c9a15a'; cx.fillRect(-54, -230, 12, 56); cx.fillRect(42, -230, 12, 56); cx.restore();
    if (age > hit) { ring(cxm - 40, cym + 88, (age - hit) * 0.7, 1 - (age - hit) / 600, '#fff', 5); const k2 = Math.min(1, (age - hit - 150) / 220); if (k2 > 0) { cx.save(); cx.globalAlpha = e * k2; cx.translate(cxm, cym - 80); cx.rotate(-0.06); cx.scale((2 - k2) * S1, (2 - k2) * S1); cx.strokeStyle = '#146c55'; cx.fillStyle = '#146c55'; cx.lineWidth = 10; cx.strokeRect(-170, -48, 340, 96); cx.font = '900 64px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('SETTLED', 0, 4); cx.restore(); } }
  } else if (sc.kind === 'sunrise') {
    const rise = ease2(Math.min(1, age / 2400)), sy = lerp(H * 1.05, H * 0.5, rise);
    cx.save(); cx.globalAlpha = e * 0.55; const g = cx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(60,30,120,.55)'); g.addColorStop(0.7, 'rgba(255,140,90,.55)'); g.addColorStop(1, 'rgba(255,220,130,.7)'); cx.fillStyle = g; cx.fillRect(0, 0, W, H); cx.restore();
    cx.save(); cx.globalAlpha = e; cx.translate(cxm, sy); cx.rotate(age / 3000); for (let i = 0; i < 18; i++) { cx.rotate(Math.PI * 2 / 18); cx.fillStyle = 'rgba(255,240,170,.28)'; cx.beginPath(); cx.moveTo(-10, 0); cx.lineTo(10, 0); cx.lineTo(34, -H); cx.lineTo(-34, -H); cx.closePath(); cx.fill(); } cx.restore();
    cx.save(); cx.globalAlpha = e; const sg = cx.createRadialGradient(cxm, sy, 10, cxm, sy, 120 * S1 + 40); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.5, '#ffe08a'); sg.addColorStop(1, 'rgba(255,200,100,0)'); cx.fillStyle = sg; cx.beginPath(); cx.arc(cxm, sy, 160, 0, 7); cx.fill(); cx.fillStyle = '#1c1030'; cx.beginPath(); cx.moveTo(0, H); for (let x = 0; x <= W; x += 20) cx.lineTo(x, H * 0.86 - 30 * Math.sin(x / 90) - 18 * Math.sin(x / 33)); cx.lineTo(W, H); cx.closePath(); cx.fill(); cx.restore();
  } else if (sc.kind === 'wave') {
    const n = Math.max(12, Math.round(W / 42)); cx.save(); cx.globalAlpha = e;
    for (let i = 0; i < n; i++) { const x = ((i + 0.5) / n) * W, ph = (age / 1200) - i / n * 1.1, up = Math.max(0, Math.sin(Math.PI * Math.max(0, Math.min(1, ph)))), y = H - 40 - up * 34, col = COLORS[i % COLORS.length];
      cx.fillStyle = col; cx.beginPath(); cx.roundRect ? cx.roundRect(x - 14, y, 28, 70, 10) : cx.rect(x - 14, y, 28, 70); cx.fill(); cx.fillStyle = '#f2c9a5'; cx.beginPath(); cx.arc(x, y - 10, 12, 0, 7); cx.fill();
      cx.strokeStyle = col; cx.lineWidth = 7; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(x - 12, y + 10); cx.lineTo(x - 18 - up * 4, y + 12 - up * 42); cx.moveTo(x + 12, y + 10); cx.lineTo(x + 18 + up * 4, y + 12 - up * 42); cx.stroke(); }
    cx.restore();
  }
}
const ease2 = (u) => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;

function frame(t) {
  cx.clearRect(0, 0, W, H);
  let busy = false;
  for (let i = S.confetti.length - 1; i >= 0; i--) {
    const p = S.confetti[i], age = t - p.t0; p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    if (age > 2800 || p.y > H + 40) { S.confetti.splice(i, 1); continue; }
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = Math.max(0, 1 - age / 2800); cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore();
  }
  for (let i = S.streamers.length - 1; i >= 0; i--) {
    const p = S.streamers[i], age = t - p.t0; if (age < 0) { busy = true; continue; }
    p.vy += 0.5; p.vx *= 0.995; p.x += p.vx + Math.sin(age / 130 + p.ph) * 2.2; p.y += p.vy; p.trail.push([p.x, p.y]); if (p.trail.length > 34) p.trail.shift();
    if (age > p.life || (p.y > H + 60 && p.vy > 0)) { S.streamers.splice(i, 1); continue; }
    cx.save(); cx.globalAlpha = Math.max(0, 1 - age / p.life); cx.strokeStyle = p.c; cx.lineWidth = p.w; cx.lineCap = 'round'; cx.beginPath();
    p.trail.forEach(([x, y], j) => { const wob = Math.sin(j * 0.7 + p.ph + age / 140) * 7; j ? cx.lineTo(x + wob, y) : cx.moveTo(x + wob, y); }); cx.stroke(); cx.restore();
  }
  for (let i = S.rockets.length - 1; i >= 0; i--) {
    const r = S.rockets[i]; if (t < r.t0) { busy = true; continue; }
    r.y += r.vy; r.vy *= 0.985;
    cx.fillStyle = '#fff'; cx.globalAlpha = 0.9; cx.fillRect(r.x - 1.5, r.y, 3, 14); cx.globalAlpha = 1;
    if (r.y <= r.ty || r.vy > -2.2) {
      const c1 = r.c, c2 = pick(COLORS), cnt = 70;
      for (let j = 0; j < cnt; j++) { const a = (j / cnt) * Math.PI * 2, sp = rnd(2, 7.5) * (j % 2 ? 1 : 0.6); S.sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, c: j % 3 ? c1 : c2, t0: t, life: rnd(900, 1600) }); }
      S.rockets.splice(i, 1);
    }
  }
  for (let i = S.sparks.length - 1; i >= 0; i--) {
    const p = S.sparks[i], age = t - p.t0; if (age > p.life) { S.sparks.splice(i, 1); continue; }
    p.vy += 0.07; p.vx *= 0.985; p.x += p.vx; p.y += p.vy;
    cx.globalAlpha = Math.max(0, 1 - age / p.life); cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, 2.4, 0, 7); cx.fill(); cx.globalAlpha = 1;
  }
  for (let i = S.bands.length - 1; i >= 0; i--) { const b = S.bands[i]; if (t - b.t0 > b.dur) { S.bands.splice(i, 1); continue; } drawBand(b, t); }

  for (let i = S.balloons.length - 1; i >= 0; i--) {
    const b = S.balloons[i], age = t - b.t0; b.y += b.vy; b.x += Math.sin(age / 400 + b.ph) * 0.9; if (b.y < -90) { S.balloons.splice(i, 1); continue; }
    cx.strokeStyle = 'rgba(80,80,100,.6)'; cx.lineWidth = 1.5; cx.beginPath(); cx.moveTo(b.x, b.y + b.r * 1.2); cx.quadraticCurveTo(b.x + Math.sin(age / 300 + b.ph) * 10, b.y + b.r * 2.6, b.x, b.y + b.r * 3.6); cx.stroke();
    cx.fillStyle = b.c; cx.beginPath(); cx.ellipse(b.x, b.y, b.r, b.r * 1.22, 0, 0, 7); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.22, b.r * 0.4, 0.5, 0, 7); cx.fill();
    cx.fillStyle = b.c; cx.beginPath(); cx.moveTo(b.x, b.y + b.r * 1.2); cx.lineTo(b.x - 5, b.y + b.r * 1.5); cx.lineTo(b.x + 5, b.y + b.r * 1.5); cx.closePath(); cx.fill();
  }
  for (let i = S.strips.length - 1; i >= 0; i--) {
    const p = S.strips[i], age = t - p.t0; p.y += p.vy; p.x += Math.sin(age / 260 + p.ph) * 1.6; p.r += p.vr; if (p.y > H + 70) { S.strips.splice(i, 1); continue; }
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.globalAlpha = 0.92; cx.fillRect(-1.5, -p.len / 2, 3, p.len); cx.restore();
  }
  for (let i = S.coins.length - 1; i >= 0; i--) {
    const p = S.coins[i], age = t - p.t0; p.y += p.vy; p.vy += 0.12; if (p.y > H + 40) { S.coins.splice(i, 1); continue; }
    const sq = Math.abs(Math.cos(age / 140 + p.ph)); cx.save(); cx.translate(p.x, p.y); cx.scale(Math.max(0.15, sq), 1); cx.fillStyle = '#ffd24a'; cx.beginPath(); cx.arc(0, 0, p.r, 0, 7); cx.fill(); cx.strokeStyle = '#b98a2a'; cx.lineWidth = 3; cx.stroke(); cx.fillStyle = '#b98a2a'; cx.font = '800 ' + p.r + 'px system-ui'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('$', 0, 1); cx.restore();
  }
  for (let i = S.scenes.length - 1; i >= 0; i--) { const sc = S.scenes[i]; if (t - sc.t0 > sc.dur) { S.scenes.splice(i, 1); continue; } drawScene(sc, t); }
  for (let i = S.notes.length - 1; i >= 0; i--) {
    const n = S.notes[i], age = t - n.t0; if (age > 2600) { S.notes.splice(i, 1); continue; }
    n.y += n.vy; n.x += Math.sin(age / 220 + n.ph) * 1.4;
    cx.globalAlpha = Math.max(0, 1 - age / 2600); cx.fillStyle = n.c; cx.font = '700 ' + n.s + 'px system-ui, sans-serif'; cx.fillText(n.g, n.x, n.y); cx.globalAlpha = 1;
  }
  if (busy || S.confetti.length || S.streamers.length || S.rockets.length || S.sparks.length || S.bands.length || S.notes.length || S.balloons.length || S.strips.length || S.coins.length || S.scenes.length) requestAnimationFrame(frame);
  else { cx.clearRect(0, 0, W, H); cv.classList.remove('on'); S.on = false; }
}

/* when the viewer looks away the clock stops, so shift every running effect forward by the time they were gone */
export function shiftTime(delta) {
  ['confetti', 'streamers', 'rockets', 'sparks', 'notes', 'bands', 'balloons', 'strips', 'coins', 'scenes'].forEach((k) => S[k].forEach((p) => { if (p.t0 != null) p.t0 += delta; }));
}
