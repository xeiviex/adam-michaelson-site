/* Achieve debt relief prototype: "we produced a movie about you". A poster with a play button, then the 30 second film. */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';
import * as M from './movie.js';

export function movieCard(applicant, hooks, onDone) {
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
  let raf = 0, t0 = 0, playing = false;
  const draw = (t) => M.drawMovie(cx, t, name);
  const poster = () => { draw(M.POSTER_T); bar.firstChild.style.width = '0%'; };
  function stop() { playing = false; cancelAnimationFrame(raf); }
  function start() {
    stop(); playing = true; playBtn.hidden = true; label.hidden = true; replay.hidden = true; t0 = performance.now();
    const step = (now) => {
      if (!playing) return;
      const t = Math.min(M.DUR - 0.01, (now - t0) / 1000); draw(t); bar.firstChild.style.width = (t / M.DUR * 100) + '%';
      if (t >= M.DUR - 0.01) { playing = false; replay.hidden = false; return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  playBtn.addEventListener('click', start); cv.addEventListener('click', () => { if (!playing && !playBtn.hidden) start(); });
  stage.append(bar);
  ctrl.append(replay);
  poster();
  const el = h('div', { class: 'card movie' }, stage, ctrl, h('p', { class: 'fine' }, 'Prototype: an animated short drawn in your browser. No audio plays.'), go);
  return { el, async auto(alive) {
    await sleep(reduced() ? 0 : 1800); if (!alive()) return;
    start(); await sleep(reduced() ? 0 : M.DUR * 1000 + 1500); if (alive()) go.click();
  } };
}
