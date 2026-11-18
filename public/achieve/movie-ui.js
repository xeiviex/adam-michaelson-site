/* Achieve debt relief prototype: "we produced a movie about you". A poster with a play button, then the 30 second film. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import * as M from './movie.js';
import { createScore } from './movie-audio.js';

export function movieCard(applicant, hooks, onDone, opts) {
  const o = opts || {};
  const name = ((applicant.first || '') + ' ' + (applicant.last || '')).trim() || applicant.first || 'Friend';
  const cv = h('canvas', { class: 'mv-cv', width: M.W, height: M.H, 'aria-label': 'A short film starring ' + name });
  const cx = cv.getContext('2d');
  const bar = h('div', { class: 'mv-bar' }, h('i'));
  const playBtn = h('button', { type: 'button', class: 'mv-play', 'aria-label': 'Play the movie' }, h('span', { html: '<svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>' }));
  const label = h('div', { class: 'mv-title' }, h('b', null, name.toUpperCase()), h('span', null, 'The Movie'), h('em', null, '0:30'));
  const stage = h('div', { class: 'mv' }, cv, label, playBtn);
  const ctrl = h('div', { class: 'mv-ctl' });
  const replay = h('button', { type: 'button', class: 'btn line sm', onclick: () => start() }, ico('refresh', 16), 'Watch again');
  replay.hidden = true;
  const go = cont('Continue', () => { stop(); onDone({ movie: true }); });
  let raf = 0, t0 = 0, playing = false, score = null, muted = !!o.muted, pausedAt = 0, loop = null;
  const soundBtn = h('button', { type: 'button', class: 'btn line sm', 'aria-pressed': String(!muted), onclick: () => { muted = !muted; paintSound(); score && score.setMuted(muted); } });
  const paintSound = () => { soundBtn.replaceChildren(ico('speaker', 16), muted ? 'Sound off' : 'Sound on'); soundBtn.setAttribute('aria-pressed', String(!muted)); };
  paintSound();
  const share = h('button', { type: 'button', class: 'btn line sm', onclick: doShare }, ico('share', 16), 'Share my movie');
  share.hidden = true;
  async function doShare() {
    const url = location.origin + '/achieve/', text = name + ' just got debt free in this Achieve prototype. Watch the movie.';
    try { if (navigator.share) { await navigator.share({ title: 'My Achieve movie', text, url }); return; } await navigator.clipboard.writeText(text + ' ' + url); share.lastChild.textContent = 'Link copied'; setTimeout(() => { share.lastChild.textContent = 'Share my movie'; }, 2000); } catch { /* cancelled */ }
  }
  const draw = (t) => M.drawMovie(cx, t, name);
  const poster = () => { draw(M.POSTER_T); bar.firstChild.style.width = '0%'; };
  function stop() { playing = false; cancelAnimationFrame(raf); if (score) { score.stop(); score = null; } }
  function start() {
    stop(); playing = true; playBtn.hidden = true; label.hidden = true; replay.hidden = true; share.hidden = true; t0 = performance.now();
    score = createScore(); if (score) { score.setMuted(muted); score.start(); }
    const step = loop = (now) => {
      if (!playing) return;
      const t = Math.min(M.DUR - 0.01, (now - t0) / 1000); draw(t); bar.firstChild.style.width = (t / M.DUR * 100) + '%';
      if (t >= M.DUR - 0.01) { playing = false; replay.hidden = false; share.hidden = false; if (score) { const sc = score; score = null; setTimeout(() => sc.stop(), 1500); } return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  /* the viewer looked away: freeze the film and the score, then continue from the same frame */
  window.addEventListener('achieve:attention', (ev) => {
    if (!playing || !loop) return;
    if (!ev.detail.attentive) { cancelAnimationFrame(raf); pausedAt = performance.now(); score && score.pause(); }
    else if (pausedAt) { t0 += performance.now() - pausedAt; pausedAt = 0; score && score.resume(); raf = requestAnimationFrame(loop); }
  });
  playBtn.addEventListener('click', start); cv.addEventListener('click', () => { if (!playing && !playBtn.hidden) start(); });
  stage.append(bar);
  ctrl.append(soundBtn, replay, share);
  poster();
  const el = h('div', { class: 'card movie' }, stage, ctrl, h('p', { class: 'fine' }, 'Prototype: an animated short drawn in your browser. No audio plays.'), go);
  return { el, async auto(alive) {
    await sleep(reduced() ? 0 : 1800); if (!alive()) return;
    start(); await sleep(reduced() ? 0 : M.DUR * 1000 + 1500); if (alive()) go.click();
  } };
}
