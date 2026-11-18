/* Achieve debt relief prototype: celebration effects on one full-screen canvas (#confetti).
   Kinds: confetti, streamers, fireworks, band (a little band with musical notes flying). No audio, no dependencies. */
const COLORS = ['#3300ff', '#5a4cf0', '#146c55', '#ffb703', '#ff5d8f', '#00c2a8', '#ff7a1a'];
export const FX_KINDS = ['confetti', 'streamers', 'fireworks', 'band'];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[(Math.random() * a.length) | 0];
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const S = { confetti: [], streamers: [], rockets: [], sparks: [], notes: [], bands: [], on: false, last: 0 };
let cv, cx, W = 0, H = 0;

function ensure() {
  cv = cv || document.getElementById('confetti'); if (!cv) return false;
  cx = cx || cv.getContext('2d');
  if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; }
  W = cv.width; H = cv.height; cv.classList.add('on'); return true;
}

export function fx(kind, n) {
  if (reduced() || !ensure()) return;
  const now = performance.now();
  if (kind === 'streamers') {
    [0.04, 0.96].forEach((fx0, side) => { for (let i = 0; i < (n ? Math.min(14, n / 10) : 9); i++) S.streamers.push({ x: W * fx0, y: H * 0.92, vx: (side ? -1 : 1) * rnd(2, 9), vy: -rnd(14, 24), c: pick(COLORS), w: rnd(5, 9), trail: [], t0: now + i * 40, ph: rnd(0, 6), life: 3600 }); });
  } else if (kind === 'fireworks') {
    const k = n ? Math.min(9, Math.max(3, Math.round(n / 40))) : 6;
    for (let i = 0; i < k; i++) S.rockets.push({ x: rnd(W * 0.15, W * 0.85), y: H, ty: rnd(H * 0.15, H * 0.5), vy: -rnd(11, 15), c: pick(COLORS), t0: now + i * 380, dead: false });
  } else if (kind === 'band') {
    S.bands.push({ t0: now, dur: 4200 });
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
  for (let i = S.notes.length - 1; i >= 0; i--) {
    const n = S.notes[i], age = t - n.t0; if (age > 2600) { S.notes.splice(i, 1); continue; }
    n.y += n.vy; n.x += Math.sin(age / 220 + n.ph) * 1.4;
    cx.globalAlpha = Math.max(0, 1 - age / 2600); cx.fillStyle = n.c; cx.font = '700 ' + n.s + 'px system-ui, sans-serif'; cx.fillText(n.g, n.x, n.y); cx.globalAlpha = 1;
  }
  if (busy || S.confetti.length || S.streamers.length || S.rockets.length || S.sparks.length || S.bands.length || S.notes.length) requestAnimationFrame(frame);
  else { cx.clearRect(0, 0, W, H); cv.classList.remove('on'); S.on = false; }
}
