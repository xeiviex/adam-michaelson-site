/* Achieve debt relief prototype: "the movie about you". A 30 second animated short drawn on a canvas, a pure function of time,
   so any frame can be drawn for the poster and the same code plays the film. No video file, no audio, no network.
   Scenes: race car jumps, a windy mountain road, the edge of a cliff, the truck turns into a cannon that fires him up and away, the parachute, the zoom out with fireworks and the title. */
export const W = 960, H = 540, DUR = 30, POSTER_T = 4.4;
export const SCENES = [
  { id: 'race', t0: 0, t1: 6 }, { id: 'climb', t0: 6, t1: 11 }, { id: 'edge', t0: 11, t1: 15.5 }, { id: 'jump', t0: 15.5, t1: 30 },
];
export const sceneAt = (t) => SCENES.find((s) => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
const lerp = (a, b, u) => a + (b - a) * u;
const rng = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, u) => { const x = hex(a), y = hex(b); return 'rgb(' + x.map((v, i) => Math.round(lerp(v, y[i], clamp(u, 0, 1)))).join(',') + ')'; };

function sky(c, top, bottom) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bottom); c.fillStyle = g; c.fillRect(0, 0, W, H); }
function ridge(c, camX, base, amp, par, color, seed, x0 = 0, x1 = W, fillTo = H) {
  c.fillStyle = color; c.beginPath(); c.moveTo(x0, fillTo);
  for (let x = x0; x <= x1 + 8; x += 8) { const wx = x + camX * par; c.lineTo(x, base - amp * (0.5 + 0.28 * Math.sin(wx / 130 + seed) + 0.2 * Math.sin(wx / 47 + seed * 2) + 0.12 * Math.sin(wx / 330 + seed * 3))); }
  c.lineTo(x1, fillTo); c.closePath(); c.fill();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); }
function cloud(c, x, y, s, a) { c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; [[0, 0, 40], [34, -10, 32], [-34, 4, 28], [66, 6, 24]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, 7); c.fill(); }); c.restore(); }

/* a head with a face. expr: grin, shock, cool, yell. Facing right. */
function head(c, x, y, r, expr, tilt) {
  c.save(); c.translate(x, y); c.rotate(tilt || 0);
  c.fillStyle = '#f2c09a'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -1, r * 1.08, Math.PI * 1.02, Math.PI * 2.0); c.lineTo(r * 1.08, -r * 0.2); c.lineTo(-r * 1.08, -r * 0.2); c.closePath(); c.fill();
  c.fillStyle = '#ff3b5c'; c.fillRect(-1.5, -r * 1.1, 3, r * 0.9);
  c.fillStyle = '#1a1a2e'; c.fillRect(-r * 1.05, -r * 0.28, r * 2.1, 3);
  const shock = expr === 'shock' || expr === 'yell';
  c.fillStyle = '#9fe3ff'; c.strokeStyle = '#1a1a2e'; c.lineWidth = 2; c.beginPath(); c.arc(r * 0.42, r * 0.05, r * (shock ? 0.4 : 0.34), 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#1a1a2e'; c.beginPath(); c.arc(r * (shock ? 0.5 : 0.48), r * 0.06, r * 0.13, 0, 7); c.fill();
  c.strokeStyle = '#1a1a2e'; c.lineWidth = 2; c.lineCap = 'round'; c.beginPath();
  if (expr === 'grin') { c.arc(r * 0.2, r * 0.45, r * 0.34, 0.15, Math.PI - 0.5); c.stroke(); }
  else if (expr === 'cool') { c.moveTo(r * 0.0, r * 0.55); c.lineTo(r * 0.5, r * 0.5); c.stroke(); }
  else { c.fillStyle = '#7a1f2a'; c.ellipse(r * 0.28, r * 0.55, r * 0.17, r * (expr === 'yell' ? 0.3 : 0.2), 0, 0, 7); c.fill(); }
  c.restore();
}
function limb(c, x, y, a1, l1, a2, l2, w, col) { const x1 = x + Math.sin(a1) * l1, y1 = y + Math.cos(a1) * l1, x2 = x1 + Math.sin(a2) * l2, y2 = y1 + Math.cos(a2) * l2; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); return [x2, y2]; }
/* the hero: jointed arms and legs, helmet, goggles, a face, a red scarf. arms 0 (down) to 1 (up and out). */
function hero(c, x, y, s, o) {
  c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(s, s);
  const A = o.arms == null ? 0.5 : o.arms, L = o.legs == null ? 0.3 : o.legs, t = o.t || 0, fl = o.flail ? Math.sin(t * 12) * 0.22 : 0, suit = '#1b2bd6';
  c.strokeStyle = '#ff3b5c'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, -33); for (let i = 1; i <= 6; i++) c.lineTo(-3 - i * 8, -33 + Math.sin(t * 9 + i) * (3 + i) + i * 1.2); c.stroke();
  const aU = 0.35 + A * 1.85, aL = aU + (A > 0.6 ? 0.25 : -0.5) + fl;
  const hl = limb(c, -3, -26, -aU - fl, 13, -aL, 13, 7, suit), hr = limb(c, 3, -26, aU + fl, 13, aL, 13, 7, suit);
  const lg = 0.12 + L * 0.65;
  const fl2 = limb(c, -3, 0, -lg - fl, 15, -lg + 0.35 - fl, 14, 8, suit), fr = limb(c, 3, 0, lg + fl, 15, lg - 0.15 + fl, 14, 8, suit);
  c.fillStyle = '#111'; [fl2, fr].forEach(([fx, fy]) => { c.beginPath(); c.arc(fx, fy, 5, 0, 7); c.fill(); }); c.fillStyle = '#fff'; [hl, hr].forEach(([hx, hy]) => { c.beginPath(); c.arc(hx, hy, 4.5, 0, 7); c.fill(); });
  c.strokeStyle = suit; c.lineWidth = 12; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 2); c.stroke();
  c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(-3, -28); c.lineTo(-3, 0); c.stroke(); c.fillStyle = '#ffb703'; c.fillRect(-6, -2, 12, 4);
  head(c, 1, -42, 12, o.expr || 'grin', o.tilt || 0);
  c.restore();
}
function wheel(c, x, y, spin) { c.fillStyle = '#16161e'; c.beginPath(); c.arc(x, y, 15, 0, 7); c.fill(); c.strokeStyle = '#c9c9d6'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 7, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x + Math.cos(spin) * 7, y + Math.sin(spin) * 7); c.lineTo(x - Math.cos(spin) * 7, y - Math.sin(spin) * 7); c.stroke(); }
/* the race car, origin at the ground under the middle of the car, facing right */
function car(c, x, y, rot, o) {
  const op = o || {};
  c.save(); c.translate(x, y); c.rotate(rot || 0);
  wheel(c, -40, -15, op.spin || 0); wheel(c, 40, -15, op.spin || 0);
  if (op.peek > 0) { head(c, 8, -60 - op.peek * 20, 13, op.expr || 'shock', op.tilt || 0); }
  c.fillStyle = '#e63946'; rr(c, -62, -46, 124, 26, 9); c.fill();
  const ca = op.cabin == null ? 1 : op.cabin; c.globalAlpha = ca;
  c.beginPath(); c.moveTo(-24, -46); c.lineTo(-8, -70); c.lineTo(30, -70); c.lineTo(48, -46); c.closePath(); c.fillStyle = '#c42232'; c.fill();
  c.beginPath(); c.moveTo(-16, -48); c.lineTo(-4, -66); c.lineTo(26, -66); c.lineTo(40, -48); c.closePath(); c.fillStyle = '#9fe3ff'; c.fill(); c.globalAlpha = 1;
  c.fillStyle = '#fff'; c.fillRect(-62, -36, 124, 4);
  c.globalAlpha = ca; c.fillStyle = '#1a1a2e'; c.fillRect(-70, -64, 30, 5); c.fillRect(-64, -60, 5, 18); c.globalAlpha = 1;
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-4, -30, 9, 0, 7); c.fill(); c.fillStyle = '#e63946'; c.font = '700 13px system-ui'; c.textAlign = 'center'; c.fillText('7', -4, -25);
  c.fillStyle = '#ffe66d'; c.beginPath(); c.arc(60, -35, 4, 0, 7); c.fill();
  if (op.door > 0 && ca > 0.02) { c.globalAlpha = ca; c.save(); c.translate(-14, -46); c.rotate(-op.door * 1.25); c.fillStyle = '#b81d2d'; c.fillRect(0, 0, 40, 24); c.fillStyle = '#9fe3ff'; c.fillRect(4, 4, 28, 10); c.restore(); c.globalAlpha = 1; }
  c.restore();
}
function flash(c, t) { const edges = SCENES.slice(1).map((s) => s.t0); const a = Math.max(0, ...edges.map((e) => 1 - Math.abs(t - e) / 0.16)); if (a > 0) { c.fillStyle = 'rgba(255,255,255,' + (a * 0.9) + ')'; c.fillRect(0, 0, W, H); } }
function caption(c, text, t, a, b, y) {
  const k = ease((t - a) / 0.3) * ease((b - t) / 0.3); if (k <= 0) return;
  c.save(); c.globalAlpha = k; c.font = '800 26px system-ui, sans-serif'; c.textAlign = 'left'; c.fillStyle = 'rgba(0,0,0,.45)'; const w = c.measureText(text).width; rr(c, 36, y - 30, w + 28, 44, 10); c.fill(); c.fillStyle = '#fff'; c.fillText(text, 50, y); c.restore();
}

/* ---- scene 1: the race ---- */
function race(c, t, name) {
  const u = t, speed = 420, cam = u * speed, carX = 300;
  const jumps = [{ t0: 1.9, d: 1.0, h: 110, flips: 0 }, { t0: 3.7, d: 1.5, h: 210, flips: 1 }];
  let jy = 0, jr = 0; for (const j of jumps) { if (u >= j.t0 && u <= j.t0 + j.d) { const p = (u - j.t0) / j.d; jy = -4 * j.h * p * (1 - p); jr = j.flips * Math.PI * 2 * ease(p) - Math.sin(Math.PI * p) * 0.2; } }
  const shake = [2.9, 5.2].reduce((s, l) => s + (u > l ? 7 * Math.exp(-(u - l) * 9) : 0), 0);
  sky(c, '#4fc3ff', '#ffe2a8'); c.fillStyle = '#fff6c9'; c.beginPath(); c.arc(760, 130, 54, 0, 7); c.fill();
  cloud(c, ((300 - cam * 0.05) % 1200 + 1200) % 1200 - 100, 90, 1, 0.9); cloud(c, ((900 - cam * 0.08) % 1200 + 1200) % 1200 - 100, 150, 0.8, 0.8);
  c.save(); c.translate(0, Math.sin(u * 60) * shake);
  ridge(c, cam, 380, 130, 0.12, '#c98a5b', 1); ridge(c, cam, 410, 90, 0.3, '#a8673d', 2);
  c.fillStyle = '#d9a066'; c.fillRect(0, 410, W, 130);
  c.fillStyle = '#34343f'; c.fillRect(0, 430, W, 70); c.fillStyle = '#fff'; for (let x = -((cam) % 120); x < W; x += 120) c.fillRect(x, 464, 60, 5);
  const r = rng(4); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = 300 + r() * 120, len = 60 + r() * 120, x = ((r() * W - cam * (1.2 + r())) % (W + 200) + W + 200) % (W + 200) - 100; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y); c.stroke(); }
  jumps.forEach((j) => { const rx = carX + (j.t0 - u) * speed; if (rx > -150 && rx < W + 150) { c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(rx - 120, 468); c.lineTo(rx, 468); c.lineTo(rx, 468 - 28 - j.h / 7); c.closePath(); c.fill(); c.fillStyle = '#34343f'; c.fillRect(rx - 120, 466, 120, 4); } });
  for (let i = 0; i < 9; i++) { const k = ((u * 3 + i * 0.11) % 1); c.fillStyle = 'rgba(240,215,170,' + (0.6 * (1 - k)) + ')'; c.beginPath(); c.arc(carX - 55 - k * 170, 455 + jy * 0.2 - k * 24, 8 + k * 18, 0, 7); c.fill(); }
  car(c, carX, 468 + jy, jr, { spin: u * 18 }); c.restore();
  const k = ease(u / 0.4) * ease((2.6 - u) / 0.4);
  if (k > 0) { c.save(); c.globalAlpha = k; c.textAlign = 'center'; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 8; c.font = '600 22px system-ui'; c.fillText('ACHIEVE PRESENTS', W / 2, 190); c.font = '900 76px system-ui'; c.strokeText(name.toUpperCase(), W / 2, 270, W - 80); c.fillText(name.toUpperCase(), W / 2, 270, W - 80); c.restore(); }
}

/* ---- scene 2: the windy mountain road ---- */
const roadY = (wx) => 420 - 0.32 * wx + 38 * Math.sin(wx / 110);
const roadSlope = (wx) => -0.32 + (38 / 110) * Math.cos(wx / 110);
function climb(c, t) {
  const u = t - 6, wx = 150 + u * 330, camX = wx - 300, camY = roadY(wx) - 360;
  sky(c, '#ff9a5c', '#ffd9a0'); c.fillStyle = '#fff1c2'; c.beginPath(); c.arc(700, 200 + u * 4, 62, 0, 7); c.fill();
  cloud(c, 200 - u * 12, 110, 1.1, 0.7); cloud(c, 640 - u * 10, 70, 0.9, 0.6);
  ridge(c, camX, 360 - camY * 0.05, 150, 0.1, '#8a5a8f', 5); ridge(c, camX, 420 - camY * 0.1, 120, 0.22, '#6b3f73', 6);
  c.fillStyle = '#3a2a3a'; c.beginPath(); c.moveTo(0, H + 40); for (let x = 0; x <= W; x += 10) c.lineTo(x, roadY(x + camX) - camY + 16); c.lineTo(W, H + 40); c.closePath(); c.fill();
  c.strokeStyle = '#2a2a33'; c.lineWidth = 34; c.lineJoin = 'round'; c.beginPath(); for (let x = 0; x <= W; x += 10) { const y = roadY(x + camX) - camY - 4; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.strokeStyle = '#ffd24a'; c.lineWidth = 3; c.setLineDash([22, 18]); c.lineDashOffset = -u * 200; c.beginPath(); for (let x = 0; x <= W; x += 10) { const y = roadY(x + camX) - camY - 4; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]);
  c.fillStyle = '#e8e6f5'; for (let wxp = Math.floor(camX / 70) * 70; wxp < camX + W + 70; wxp += 70) { const sx = wxp - camX, sy = roadY(wxp) - camY + 14; c.fillRect(sx - 2, sy - 16, 4, 18); }
  c.strokeStyle = '#e8e6f5'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 10) { const y = roadY(x + camX) - camY - 2; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  const ang = Math.atan(roadSlope(wx));
  car(c, 300, 360 + 4, ang, { spin: u * 16 });
  caption(c, 'THE ROAD GETS HARDER.', t, 6.2, 9.6, 500);
}

/* ---- scene 3: the edge ---- */
function edge(c, t, name) {
  const u = t - 11, edgeX = 585, ground = 380;
  const outX = 0.03 * u;
  sky(c, '#7ac8ff', '#ffe6b0'); cloud(c, 160 + u * 6, 90, 1.1, 0.9); cloud(c, 700 - u * 5, 140, 0.8, 0.8);
  c.save(); c.translate(W / 2, ground); c.scale(1 + outX, 1 + outX); c.translate(-W / 2, -ground);
  ridge(c, 0, 470, 150, 0, '#9fb7d9', 7); ridge(c, 40, 510, 110, 0, '#7e97c4', 8);
  c.fillStyle = '#c47a4a'; c.beginPath(); c.moveTo(0, ground); c.lineTo(edgeX, ground); c.lineTo(edgeX - 6, 460); c.lineTo(edgeX + 8, H + 20); c.lineTo(0, H + 20); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 3; [420, 470, 520].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(edgeX - 2, y + 6); c.stroke(); });
  c.fillStyle = '#d9a066'; c.fillRect(0, ground - 6, edgeX, 8);
  const drive = Math.min(1, u / 1.6), e3 = 1 - Math.pow(1 - drive, 3), cx0 = lerp(-150, 515, e3);
  const nose = u > 1.2 ? 0.05 * Math.sin(Math.min(1, (u - 1.2) / 0.5) * Math.PI) : 0;
  if (u < 2.2) { c.strokeStyle = 'rgba(30,20,20,.55)'; c.lineWidth = 4; c.beginPath(); c.moveTo(Math.max(0, cx0 - 220), ground - 2); c.lineTo(cx0 - 40, ground - 2); c.stroke(); for (let i = 0; i < 7; i++) { const k = ((u * 2 + i * 0.15) % 1); c.fillStyle = 'rgba(235,205,160,' + (0.55 * (1 - k)) * (u < 1.9 ? 1 : 0) + ')'; c.beginPath(); c.arc(cx0 - 55 - k * 70, ground - 12 - k * 26, 10 + k * 18, 0, 7); c.fill(); } }
  const door = ease((u - 2.3) / 0.5), peek = ease((u - 2.9) / 0.7), gulp = u > 3.5 ? Math.sin((u - 3.5) * 14) * 0.08 : 0;
  car(c, cx0, ground + 2, nose, { spin: u < 1.6 ? u * 30 : 0, door, peek, tilt: gulp + (u > 3.4 ? 0.28 : 0), expr: u > 3.6 ? 'yell' : 'shock' });
  if (u > 2 && u < 3.1) { const k = u - 2; c.fillStyle = '#8a8a98'; c.beginPath(); c.arc(edgeX + 10 + k * 14, ground + k * k * 220, 5, 0, 7); c.fill(); }
  c.restore();
  caption(c, 'END OF THE ROAD.', t, 12.6, 15.0, 500);
}

/* ---- scene 4 and 5: the leap, the parachute, the zoom out, the fireworks, the title ---- */
function jumpScene(c, t, name) {
  const u = t - 15.5, LT = 2.0, v = u - LT, g = 520, VX = 330, VY = -400, VO = 0.9;
  /* the truck becomes a cannon: barrel pivot sits on the truck's roof line, aimed up and to the right */
  const AN = 0.85, BL = 105, PX = -70, PY = -50, MX = PX + Math.cos(AN) * BL, MY = PY - Math.sin(AN) * BL;
  let hx, hy, hrot = 0, open = 0, arms = 0.4, legs = 0.4, hs = 1.25, expr = 'cool';
  if (u < 0.5) { const e = ease(u / 0.5); hx = lerp(-58, -6, e); hy = lerp(-58, -30, e) - Math.sin(Math.PI * e) * 18; arms = 0.1; legs = 0.15; }
  else if (u < 1.0) { hx = -6; hy = -30; arms = 0.1; legs = 0.15; expr = 'shock'; }
  else if (v < 0) { const e = ease(clamp((u - 1.0) / 0.6, 0, 1)); hx = lerp(-6, MX, e); hy = lerp(-30, MY, e) - Math.sin(Math.PI * e) * 46; hs = 1.25 * (1 - 0.8 * ease((e - 0.55) / 0.45)); arms = 0.9; legs = 0.6; hrot = e * 1.1; expr = 'yell'; }
  else if (v <= VO) { hx = MX + VX * v; hy = MY + VY * v + 0.5 * g * v * v; hrot = 0.9 - 1.2 * (v / VO); arms = 1; legs = 0.9; expr = 'yell'; }
  else { const w = v - VO, x1 = MX + VX * VO, y1 = MY + VY * VO + 0.5 * g * VO * VO, vy1 = VY + g * VO; hx = x1 + 70 * w + (VX - 70) / 3 * (1 - Math.exp(-3 * w)) + Math.sin(w * 1.5) * 18; hy = y1 + 80 * w + (vy1 - 80) / 3 * (1 - Math.exp(-3 * w)); open = ease(w / 0.5); arms = 0.9; legs = 0.15; hrot = -0.3 * Math.exp(-4 * w) + Math.sin(w * 1.6) * 0.06; expr = 'grin'; }
  const z = v < 2 ? 1 : lerp(1, 0.26, ease((v - 2) / 6.5));
  const camX = hx + 60 + (v < 0 ? 0 : 20 * ease(v / 0.5)) * z, camY = hy - 40;
  c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-camX, -camY);
  const farY = 1750; c.fillStyle = mix('#7a8ac0', '#2a1f55', clamp(u / 9, 0, 1)); c.beginPath(); c.moveTo(-6000, farY + 400); for (let x = -6000; x <= 6000; x += 40) c.lineTo(x, farY - 260 - 140 * Math.sin(x / 520) - 90 * Math.sin(x / 190)); c.lineTo(6000, farY + 400); c.closePath(); c.fill();
  c.fillStyle = mix('#5fa86a', '#14301f', clamp(u / 9, 0, 1)); c.fillRect(-6000, farY + 20, 12000, 600);
  [[300, 500, 3], [900, 900, 2.4], [-300, 1200, 3.4], [1500, 700, 2.8], [-900, 600, 2.6], [2100, 1100, 3]].forEach(([x, y, s]) => cloud(c, x + u * 8, y, s, 0.5));
  c.fillStyle = mix('#c47a4a', '#4a2a2e', clamp(u / 9, 0, 1)); c.beginPath(); c.moveTo(-6000, 0); c.lineTo(0, 0); c.lineTo(-24, 400); c.lineTo(30, 800); c.lineTo(-14, 1300); c.lineTo(-30, farY + 30); c.lineTo(-6000, farY + 30); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(60,30,20,.3)'; c.lineWidth = 6; [300, 600, 900, 1250, 1500].forEach((y) => { c.beginPath(); c.moveTo(-3000, y); c.lineTo(-20, y + 8); c.stroke(); });
  c.fillStyle = '#d9a066'; c.fillRect(-6000, -8, 6000, 12);
  const km = ease((u - 0.3) / 0.8), rec = v > 0 ? 16 * Math.exp(-v * 7) * Math.cos(v * 20) : 0, shake = u > 1.65 && v < 0 ? Math.sin(u * 90) * 2.2 : 0;
  const drawHero = () => { if (hs > 0.3 || v >= 0) hero(c, hx, hy, hs, { rot: hrot, arms, legs, t: u, flail: v > 0 && v < VO, expr }); };
  if (v < 0 && u >= 1.0) drawHero();
  car(c, PX + shake, 2, 0, { door: 1 - km, cabin: 1 - km });
  if (km > 0) {
    c.save(); c.translate(PX + shake, PY); c.rotate(-AN); const len = BL * km - rec, hw = 17;
    const gr = c.createLinearGradient(0, -hw, 0, hw); gr.addColorStop(0, '#6b7288'); gr.addColorStop(0.45, '#c5cbdc'); gr.addColorStop(1, '#3d4356');
    c.fillStyle = gr; c.beginPath(); c.moveTo(-16, -hw + 2); c.lineTo(len, -hw + 4); c.lineTo(len, hw - 4); c.lineTo(-16, hw - 2); c.closePath(); c.fill();
    c.fillStyle = '#e63946'; c.fillRect(len * 0.32, -hw + 3, 10, 2 * hw - 6); c.fillStyle = '#ffd24a'; c.fillRect(Math.max(0, len - 12), -hw + 1, 12, 2 * hw - 2);
    c.fillStyle = '#23263a'; c.beginPath(); c.ellipse(len, 0, 5, hw - 5, 0, 0, 7); c.fill();
    c.fillStyle = '#3d4356'; c.beginPath(); c.arc(-16, 0, hw - 1, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '800 15px system-ui'; c.textAlign = 'center'; c.fillText('7', len * 0.5, 5);
    c.restore();
    if (u > 1.5 && v < 0) { const fx = PX - Math.cos(AN) * 20, fy = PY + Math.sin(AN) * 20 - 6, fl = 0.6 + 0.4 * Math.sin(u * 60); c.fillStyle = '#ffd24a'; c.beginPath(); for (let i = 0; i < 10; i++) { const an = i / 10 * 6.283, rr = (i % 2 ? 4 : 11) * fl; c.lineTo(fx + Math.cos(an) * rr, fy + Math.sin(an) * rr); } c.closePath(); c.fill(); }
  }
  if (v >= 0) {
    if (v < 0.35) { const k = v / 0.35; c.fillStyle = 'rgba(255,236,160,' + (1 - k) + ')'; c.beginPath(); c.arc(MX, MY, 30 + 90 * k, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,' + (1 - k) + ')'; c.beginPath(); c.arc(MX, MY, 16 + 40 * k, 0, 7); c.fill(); }
    for (let i = 0; i < 9; i++) { const k = clamp((v - 0.04 * i) / 1.6, 0, 1); if (k <= 0 || k >= 1) continue; c.fillStyle = 'rgba(230,225,235,' + (0.7 * (1 - k)) + ')'; c.beginPath(); c.arc(MX + Math.cos(i * 1.9) * 30 * k + 12 * k * i * 0.3, MY - 20 * k - 36 * k * (i % 3) * 0.4 + Math.sin(i) * 8, 14 + 34 * k, 0, 7); c.fill(); }
  }
  if (open > 0) {
    const cxp = hx, cyp = hy - 120 * open - 6, rad = 78 * open, sway = hrot * 0.8;
    c.save(); c.translate(cxp, cyp); c.rotate(sway);
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * rad / 3, 0); c.lineTo(-sway * 120 * 0 + (hx - cxp) * 0.9, hy - cyp - 24); c.stroke(); }
    const cols = ['#ff3b5c', '#fff', '#ffb703', '#fff', '#ff3b5c', '#fff', '#3300ff'];
    for (let i = 0; i < 7; i++) { const a0 = Math.PI + (i / 7) * Math.PI, a1 = Math.PI + ((i + 1) / 7) * Math.PI; c.fillStyle = cols[i]; c.beginPath(); c.moveTo(0, 0); c.ellipse(0, 0, rad, rad * 0.62, 0, a0, a1); c.closePath(); c.fill(); }
    c.restore();
  }
  if (!(v < 0 && u >= 1.0)) drawHero();
  c.restore();
  /* fireworks in screen space, deterministic */
  const r = rng(11);
  for (let k = 0; k < 16; k++) {
    const tk = 5 + k * 0.58, fx0 = 90 + r() * (W - 180), fy0 = 70 + r() * 230, col = ['#ffd24a', '#ff5d8f', '#7fe7ff', '#a68bff', '#7dffb0'][k % 5], col2 = ['#fff', '#ffb703'][k % 2], tau = u - tk;
    if (tau < -0.45 || tau > 1.9) continue;
    if (tau < 0) { const p = (tau + 0.45) / 0.45; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(fx0, lerp(H, fy0, p)); c.lineTo(fx0, lerp(H, fy0, p) + 16); c.stroke(); continue; }
    const a = 1 - tau / 1.9; c.globalAlpha = Math.max(0, a);
    for (let i = 0; i < 48; i++) { const ang = (i / 48) * Math.PI * 2, sp = (i % 2 ? 150 : 95) + (i % 5) * 9, x = fx0 + Math.cos(ang) * sp * tau, y = fy0 + Math.sin(ang) * sp * tau + 60 * tau * tau; c.fillStyle = i % 3 ? col : col2; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }
  const kk = ease((u - 9) / 0.7);
  if (kk > 0) {
    const text = name.split(' ')[0].toUpperCase() + ' RULES!', pop = 1 + (1 - kk) * 0.6 + Math.sin(u * 3) * 0.015;
    c.save(); c.globalAlpha = kk; c.translate(W / 2, 470); c.scale(pop, pop); c.textAlign = 'center'; c.font = '900 96px system-ui, sans-serif';
    c.lineWidth = 14; c.lineJoin = 'round'; c.strokeStyle = '#1a1050'; c.strokeText(text, 0, 0, W - 80);
    const g = c.createLinearGradient(0, -80, 0, 10); g.addColorStop(0, '#fff3a8'); g.addColorStop(1, '#ffb703'); c.fillStyle = g; c.fillText(text, 0, 0, W - 80);
    c.restore();
    c.save(); c.globalAlpha = ease((u - 10.5) / 0.6) * 0.9; c.fillStyle = '#fff'; c.font = '600 16px system-ui'; c.textAlign = 'center'; c.fillText('Produced by Achieve. Starring you.', W / 2, 503); c.restore();
  }
}

function camera(c, t) {
  const cl = (v) => clamp(v, 0, 1);
  if (t < 6) { let k = 0; [[1.9, 1.0], [3.7, 1.5]].forEach(([t0, d]) => { if (t >= t0 && t <= t0 + d) k = Math.max(k, Math.sin(Math.PI * (t - t0) / d)); }); const z = 1 + 0.07 * k; c.translate(W * 0.35, H * 0.6); c.scale(z, z); c.translate(-W * 0.35, -H * 0.6); }
  else if (t < 11) { const u = t - 6; c.translate(W / 2, H / 2); c.rotate(Math.sin(u * 0.9) * 0.035 - 0.015); c.scale(1.06, 1.06); c.translate(-W / 2, -H / 2); }
  else if (t < 15.5) { const u = t - 11, k = ease(cl((u - 2.7) / 1.1)), z = 1 + 0.75 * k; c.translate(lerp(W / 2, 560, k), lerp(H / 2, 300, k)); c.scale(z, z); c.translate(-lerp(W / 2, 560, k), -lerp(H / 2, 300, k)); }
}
function finish(c) {
  const g = c.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, 26); c.fillRect(0, H - 26, W, 26);
}
export function drawMovie(c, t, name) {
  const n = (name || 'Friend').trim() || 'Friend', tt = clamp(t, 0, DUR - 0.001);
  c.save(); c.clearRect(0, 0, W, H);
  const s = sceneAt(tt).id;
  c.save(); camera(c, tt);
  if (s === 'race') race(c, tt, n); else if (s === 'climb') climb(c, tt); else if (s === 'edge') edge(c, tt, n); else jumpScene(c, tt, n);
  c.restore();
  flash(c, tt); finish(c); c.restore();
}
