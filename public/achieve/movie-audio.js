/* Achieve debt relief prototype: a synthesized score for the movie, built with Web Audio. No audio files, no network.
   createScore() returns { start(), stop(), setMuted(bool) }. Everything is scheduled at start from the movie's own timeline. */
const BPM = 124, BEAT = 60 / BPM;
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function createScore() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  let ctx = null, master = null, nodes = [], muted = false, noiseBuf = null;
  const osc = (type, f, t0, dur, vol, dest, f1) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.05); nodes.push(o); return g;
  };
  const noise = (t0, dur, vol, f0, f1, type) => {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; fl.type = type || 'bandpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1 || f0, t0 + dur); fl.Q.value = 0.9;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.04, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.05); nodes.push(s);
  };
  const kick = (t0, v) => osc('sine', 150, t0, 0.22, v, master, 42);
  function start() {
    try {
      ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const T = ctx.currentTime + 0.08, at = (sec) => T + sec;
      const bassN = [33, 33, 36, 33, 31, 31, 40, 31], arp = [57, 60, 64, 69, 64, 60], chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
      /* engine, 0 to 11 s */
      const eng = osc('sawtooth', 70, at(0), 11, 0.05, master, 190); eng.gain.cancelScheduledValues(at(0)); eng.gain.setValueAtTime(0.05, at(0)); eng.gain.setValueAtTime(0.05, at(10.6)); eng.gain.exponentialRampToValueAtTime(0.0001, at(11.2));
      /* drive, 0 to 11 s: kick, offbeat hat, bass, arp */
      for (let b = 0; b * BEAT < 11; b++) { const t = b * BEAT; kick(at(t), 0.7); noise(at(t + BEAT / 2), 0.05, 0.12, 7000, 7000, 'highpass'); }
      for (let i = 0; i * BEAT / 2 < 11; i++) osc('square', hz(bassN[i % 8]), at(i * BEAT / 2), BEAT / 2.2, 0.16);
      for (let i = 0; 6 + i * BEAT / 4 < 11; i++) osc('triangle', hz(arp[i % 6] + (i > 8 ? 12 : 0)), at(6 + i * BEAT / 4), BEAT / 4.5, 0.09);
      /* jumps: whoosh and landing */
      [[1.9, 1.0], [3.7, 1.5]].forEach(([t0, d]) => { noise(at(t0), d * 0.8, 0.2, 400, 3200, 'bandpass'); noise(at(t0 + d), 0.25, 0.4, 900, 200, 'lowpass'); osc('sine', 110, at(t0 + d), 0.3, 0.5, master, 40); });
      /* the brake and the edge */
      noise(at(11.1), 1.5, 0.25, 2600, 900, 'bandpass');
      for (let b = 0; 12.6 + b * 0.9 < 15.5; b++) { osc('sine', 60, at(12.6 + b * 0.9), 0.18, 0.5, master, 40); osc('sine', 60, at(12.6 + b * 0.9 + 0.22), 0.16, 0.4, master, 40); }
      noise(at(13.3), 0.1, 0.3, 1800, 900, 'bandpass'); osc('sawtooth', 220, at(14.6), 0.5, 0.12, master, 330);
      /* the leap */
      noise(at(15.9), 0.5, 0.45, 300, 4200, 'bandpass'); osc('sine', 90, at(16.0), 0.5, 0.7, master, 30);
      noise(at(16.2), 1.5, 0.18, 800, 3000, 'bandpass');
      noise(at(17.7), 0.35, 0.4, 500, 120, 'lowpass');
      /* the finale: pad, drums, fireworks */
      for (let c = 0; c < 4; c++) chords[c].forEach((n) => { osc('sawtooth', hz(n), at(17.7 + c * 2 * BEAT * 2), BEAT * 4, 0.05); osc('triangle', hz(n + 12), at(17.7 + c * 2 * BEAT * 2), BEAT * 4, 0.05); });
      for (let b = 0; 17.7 + b * BEAT < 30; b++) { const t = 17.7 + b * BEAT; kick(at(t), 0.55); if (b % 2) noise(at(t), 0.12, 0.22, 2400, 1800, 'bandpass'); }
      for (let k = 0; k < 16; k++) { const t = 20.5 + k * 0.58; noise(at(t - 0.4), 0.4, 0.1, 1200, 5000, 'bandpass'); noise(at(t), 0.5, 0.42, 900, 90, 'lowpass'); for (let j = 0; j < 6; j++) noise(at(t + 0.08 + j * 0.07), 0.05, 0.11, 6000, 6000, 'highpass'); }
      const tt = 24.5; [57, 61, 64, 69].forEach((n) => osc('sawtooth', hz(n), at(tt), 3.2, 0.09)); noise(at(tt), 0.9, 0.5, 700, 80, 'lowpass');
    } catch { ctx = null; }
  }
  function stop() { try { if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.04); } const c = ctx; setTimeout(() => { try { nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }); c && c.close(); } catch { /* ignore */ } }, 200); } catch { /* ignore */ } nodes = []; ctx = null; master = null; }
  function setMuted(m) { muted = m; try { if (master) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.03); } catch { /* ignore */ } }
  function pause() { try { ctx && ctx.suspend(); } catch { /* ignore */ } }
  function resume() { try { ctx && ctx.resume(); } catch { /* ignore */ } }
  return { start, stop, setMuted, pause, resume };
}
