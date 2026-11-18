/* Achieve debt relief prototype: Lottie celebrations (from LottieFiles, free to use). Self-hosted player and files under /achieve/lottie/.
   playLottie(kind) puts the animation on a fixed overlay and removes it when it ends. Resolves false when it cannot play, so the caller can fall back to the canvas effect. */
const BASE = '/achieve/lottie/';
/* where each one sits: css box, fit, and how long to keep it (ms) */
const SPEC = {
  trophy: { file: 'trophy.lottie', css: 'left:50%;top:50%;width:min(420px,80vw);height:min(420px,80vw);transform:translate(-50%,-50%)', fit: 'contain', ms: 3600 },
  balloons: { file: 'balloons.lottie', css: 'inset:0;width:100%;height:100%', fit: 'cover', ms: 5200 },
  streamers: { file: 'party-popper.lottie', css: 'left:50%;bottom:6%;width:min(380px,70vw);height:min(380px,70vw);transform:translateX(-50%)', fit: 'contain', ms: 3000 },
  coins: { file: 'coins.lottie', css: 'left:50%;bottom:4%;width:min(420px,80vw);height:min(420px,80vw);transform:translateX(-50%)', fit: 'contain', ms: 4200 },
};
let off = false;
export const lottieOff = (v) => { off = !!v; };
export const LOTTIE_KINDS = Object.keys(SPEC);
let lib = null;
const load = () => lib || (lib = import(BASE + 'dotlottie-web.js').then((m) => { m.DotLottie.setWasmUrl(BASE + 'dotlottie-player.wasm'); return m.DotLottie; }).catch(() => null));
export const warmLottie = () => { const run = () => { load(); LOTTIE_KINDS.forEach((k) => fetch(BASE + SPEC[k].file).catch(() => {})); }; if (window.requestIdleCallback) requestIdleCallback(run); else setTimeout(run, 1500); };

export async function playLottie(kind) {
  const sp = SPEC[kind]; if (!sp) return false;
  const DotLottie = await load(); if (!DotLottie) return false; if (off) return true;
  const cv = document.createElement('canvas');
  cv.className = 'lottie-fx'; cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'position:fixed;pointer-events:none;z-index:60;' + sp.css;
  cv.width = Math.round(innerWidth * (devicePixelRatio || 1)); cv.height = Math.round(innerHeight * (devicePixelRatio || 1));
  document.body.append(cv);
  let done = false;
  const end = () => { if (done) return; done = true; try { p.destroy(); } catch { /* gone */ } cv.remove(); };
  let p;
  try {
    p = new DotLottie({ canvas: cv, src: BASE + sp.file, autoplay: true, loop: false, layout: { fit: sp.fit, align: [0.5, 0.5] }, renderConfig: { autoResize: true } });
    p.addEventListener('complete', () => setTimeout(end, 150));
    p.addEventListener('loadError', end);
  } catch { cv.remove(); return false; }
  setTimeout(end, sp.ms + 2500);
  return true;
}
