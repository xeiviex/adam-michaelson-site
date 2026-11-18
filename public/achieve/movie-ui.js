/* Achieve debt relief prototype: "we produced a movie about you". A poster with a play button, then the 27 second film (video clips with a music track). */
import { h, sleep, reduced, ico } from './firsttake/shared/dom.js';
import { cont } from './qualify-ui.js';

const CAPS = [[5.2, 8.6, 'THE ROAD GETS HARDER.'], [10, 13.2, 'END OF THE ROAD.']];
const LEN = 27;

export function movieCard(applicant, hooks, onDone, opts) {
  const o = opts || {};
  const name = ((applicant.first || '') + ' ' + (applicant.last || '')).trim() || applicant.first || 'Friend';
  const vid = h('video', { class: 'mv-cv', playsinline: '', preload: 'auto', poster: '/achieve/jordan-movie-poster.jpg', src: '/achieve/jordan-movie.mp4', 'aria-label': 'A short film starring ' + name });
  vid.muted = !!o.muted;
  const bar = h('div', { class: 'mv-bar' }, h('i'));
  const cap = h('div', { class: 'mv-cap' });
  const endCard = h('div', { class: 'mv-end' }, h('b', null, name.toUpperCase() + ' BROKE FREE.'), h('span', null, 'Debt free with Achieve'));
  const playBtn = h('button', { type: 'button', class: 'mv-play', 'aria-label': 'Play the movie' }, h('span', { html: '<svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>' }));
  const label = h('div', { class: 'mv-title' }, h('b', null, name.toUpperCase()), h('span', null, 'The Movie'), h('em', null, '0:27'));
  const stage = h('div', { class: 'mv' }, vid, cap, endCard, label, playBtn);
  const ctrl = h('div', { class: 'mv-ctl' });
  const replay = h('button', { type: 'button', class: 'btn line sm', onclick: () => start() }, ico('refresh', 16), 'Watch again');
  replay.hidden = true;
  const go = cont('Continue', () => { stop(); onDone({ movie: true }); });
  let playing = false, held = false;
  const soundBtn = h('button', { type: 'button', class: 'btn line sm', 'aria-pressed': String(!vid.muted), onclick: () => { vid.muted = !vid.muted; paintSound(); } });
  const paintSound = () => { soundBtn.replaceChildren(ico('speaker', 16), vid.muted ? 'Sound off' : 'Sound on'); soundBtn.setAttribute('aria-pressed', String(!vid.muted)); };
  paintSound();
  const share = h('button', { type: 'button', class: 'btn line sm', onclick: doShare }, ico('share', 16), 'Share my movie');
  share.hidden = true;
  async function doShare() {
    const url = location.origin + '/achieve/', text = name + ' just got debt free with Achieve. Watch the movie.';
    try { if (navigator.share) { await navigator.share({ title: 'My Achieve movie', text, url }); return; } await navigator.clipboard.writeText(text + ' ' + url); share.lastChild.textContent = 'Link copied'; setTimeout(() => { share.lastChild.textContent = 'Share my movie'; }, 2000); } catch { /* cancelled */ }
  }
  const paint = () => {
    const t = vid.currentTime || 0;
    bar.firstChild.style.width = Math.min(100, t / LEN * 100) + '%';
    const c = CAPS.find((x) => t >= x[0] && t < x[1]);
    cap.textContent = c ? c[2] : ''; cap.classList.toggle('on', !!c);
    endCard.classList.toggle('on', t >= 22.5);
  };
  vid.addEventListener('timeupdate', paint);
  vid.addEventListener('ended', () => { playing = false; replay.hidden = false; share.hidden = false; paint(); });
  function stop() { playing = false; try { vid.pause(); } catch { /* not playing */ } }
  async function start() {
    playBtn.hidden = true; label.hidden = true; replay.hidden = true; share.hidden = true; playing = true;
    try { vid.currentTime = 0; } catch { /* not ready */ }
    try { await vid.play(); } catch { vid.muted = true; paintSound(); try { await vid.play(); } catch { playing = false; playBtn.hidden = false; } }
  }
  /* the viewer looked away: freeze the film, then continue from the same frame */
  window.addEventListener('achieve:attention', (ev) => {
    if (!playing) return;
    if (!ev.detail.attentive) { held = true; vid.pause(); } else if (held) { held = false; vid.play().catch(() => {}); }
  });
  playBtn.addEventListener('click', start); vid.addEventListener('click', () => { if (!playing && !playBtn.hidden) start(); });
  stage.append(bar);
  ctrl.append(soundBtn, replay, share);
  const el = h('div', { class: 'card movie' }, stage, ctrl, go);
  return { el, async auto(alive) {
    await sleep(reduced() ? 0 : 1800); if (!alive()) return;
    start();
    const ended = new Promise((r) => { vid.addEventListener('ended', r, { once: true }); });
    await Promise.race([ended, sleep(reduced() ? 0 : 60000)]); await sleep(reduced() ? 0 : 1500); if (alive()) go.click();
  } };
}
