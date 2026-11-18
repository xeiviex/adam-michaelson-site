/* Achieve debt relief prototype: the first-deposit song as an 80s power anthem, built with Web Audio. No audio files, no network.
   All major chords (C, F, G), power-chord guitars, gated-style snare, synth lead, a bass that pumps eighth notes. The words are read
   in time by the browser's own voice (speechSynthesis), since the browser cannot sing.
   createAnthem(lines) returns { start({ onLine, onEnd, voice }), stop(), pause(), resume(), duration }. */
const BPM = 112, BEAT = 60 / BPM, BAR = BEAT * 4, LINE = BAR * 2;
const INTRO = BAR * 2, OUTRO = BAR * 2;
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
const ROOT = { C: 36, F: 41, G: 43 };
/* two bars of chords per sung line: verse lines 0-3, chorus lines 4-7 */
const PROG = [['C', 'F'], ['C', 'G'], ['C', 'F'], ['G', 'G'], ['F', 'C'], ['F', 'G'], ['F', 'C'], ['G', 'C']];
const LEAD = [
  [76, 76, 74, 72, 74, 76, 79, 76], [76, 74, 72, 74, 76, 79, 76, 74], [72, 74, 76, 79, 81, 79, 76, 74], [76, 74, 72, 74, 72, 72, 79, 79],
  [79, 79, 81, 79, 76, 79, 84, 81], [79, 81, 84, 84, 81, 79, 76, 74], [79, 79, 81, 79, 76, 79, 84, 86], [88, 86, 84, 81, 84, 84, 84, 84],
];
export const spoken = (l) => String(l).replace(/^[A-Za-z ]{3,12}:\s*/, '');

export function createAnthem(lines) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  let ctx = null, master = null, delayIn = null, nodes = [], noiseBuf = null, timer = 0, events = [], T0 = 0, stopped = true, voice = true;
  const osc = (type, f, t0, dur, vol, dest, f1, det) => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t0 + dur); if (det) o.detune.value = det;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012); g.gain.setTargetAtTime(0.0001, t0 + Math.max(0.02, dur - 0.06), 0.03);
    o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.2); nodes.push(o); return g;
  };
  const noise = (t0, dur, vol, f0, type, q) => {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; fl.type = type || 'bandpass'; fl.frequency.value = f0; fl.Q.value = q || 0.8;
    g.gain.setValueAtTime(vol, t0); g.gain.setTargetAtTime(0.0001, t0 + dur * 0.4, dur / 4);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0); s.stop(t0 + dur + 0.1); nodes.push(s);
  };
  const kick = (t, v) => { osc('sine', 150, t, 0.24, v, master, 44); noise(t, 0.02, v * 0.3, 2500, 'bandpass'); };
  const snare = (t, v) => { noise(t, 0.34, v, 1900, 'bandpass', 0.6); osc('triangle', 200, t, 0.14, v * 0.5, master, 130); noise(t + 0.01, 0.5, v * 0.35, 5200, 'highpass'); };
  const hat = (t, v, open) => noise(t, open ? 0.2 : 0.05, v, 8000, 'highpass');
  const tom = (t, f, v) => osc('sine', f, t, 0.26, v, master, f * 0.55);
  const power = (t, root, dur, vol) => {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; lp.connect(master);
    [0, 7, 12].forEach((iv) => { [-9, 9].forEach((d) => osc('sawtooth', hz(root + 12 + iv), t, dur, vol, lp, 0, d)); });
  };
  const chord = (n) => [0, 4, 7].map((i) => ROOT[n] + 24 + i);
  function build() {
    const sec = (s) => T0 + s;
    /* intro: guitar stab on one, then a snare roll into the first line */
    power(sec(0), ROOT.C + 12, BAR * 1.9, 0.06); power(sec(BAR), ROOT.G + 12, BAR * 0.9, 0.06);
    for (let b = 0; b < 8; b++) { kick(sec(b * BEAT), 0.6); if (b % 2) snare(sec(b * BEAT), 0.35); hat(sec(b * BEAT + BEAT / 2), 0.07); }
    for (let i = 0; i < 4; i++) snare(sec(INTRO - BEAT + i * BEAT / 4), 0.22 + i * 0.07);
    for (let L = 0; L < 8; L++) {
      const base = INTRO + L * LINE, chorus = L >= 4;
      for (let bar = 0; bar < 2; bar++) {
        const bt = base + bar * BAR, name = PROG[L][bar], r = ROOT[name];
        /* drums */
        for (let b = 0; b < 4; b++) {
          const t = bt + b * BEAT;
          if (b === 0 || b === 2 || (chorus && b === 3 && bar === 1)) kick(sec(t), 0.7);
          if (b === 1 || b === 3) snare(sec(t), chorus ? 0.5 : 0.4);
          hat(sec(t), 0.08); hat(sec(t + BEAT / 2), chorus ? 0.09 : 0.06, chorus && b === 3);
        }
        if (chorus && bar === 0) { noise(sec(bt), 1.4, 0.2, 6000, 'highpass'); }
        /* bass: pumping eighths on the root, octave jumps in the chorus */
        for (let i = 0; i < 8; i++) osc('sawtooth', hz(r + (chorus && i % 4 === 3 ? 12 : 0)), sec(bt + i * BEAT / 2), BEAT / 2.3, 0.15);
        /* power chords: palm-muted eighths in the verse, open and ringing in the chorus */
        if (chorus) power(sec(bt), r + 12, BAR * 0.97, 0.05);
        else for (let i = 0; i < 8; i++) power(sec(bt + i * BEAT / 2), r + 12, BEAT / 2.8, 0.05);
        /* synth pad: the full major triad */
        if (chorus) chord(name).forEach((n) => osc('triangle', hz(n), sec(bt), BAR * 0.98, 0.035));
      }
      /* lead, doubled an octave up in the chorus, with an echo */
      LEAD[L].forEach((n, i) => { const t = sec(base + i * BEAT); osc('square', hz(n), t, BEAT * 0.85, chorus ? 0.075 : 0.055, delayIn); osc('sawtooth', hz(n + (chorus ? 12 : 0)), t, BEAT * 0.85, 0.03, delayIn); });
      /* a tom fill closes each half */
      if (L === 3 || L === 7) { [220, 190, 160, 130].forEach((f, i) => tom(sec(base + LINE - BEAT + i * BEAT / 4), f, 0.5)); }
    }
    /* outro: a big final chord, crash, and a long ring */
    const o = INTRO + 8 * LINE;
    power(sec(o), ROOT.F + 12, BAR * 0.95, 0.06); power(sec(o + BAR), ROOT.C + 12, BAR * 1.8, 0.07);
    chord('C').forEach((n) => osc('triangle', hz(n), sec(o + BAR), BAR * 1.8, 0.05)); osc('sawtooth', hz(ROOT.C), sec(o + BAR), BAR * 1.6, 0.14);
    kick(sec(o), 0.7); snare(sec(o + BEAT), 0.5); kick(sec(o + BAR), 0.8); noise(sec(o + BAR), 2.6, 0.3, 5500, 'highpass'); snare(sec(o + BAR), 0.6);
  }
  const speak = (text) => {
    try {
      const ss = window.speechSynthesis; if (!ss || !voice) return; ss.cancel();
      const u = new SpeechSynthesisUtterance(spoken(text)); u.rate = 0.92; u.pitch = 1.05; u.volume = 1;
      const vs = ss.getVoices(), v = vs.find((x) => /^en[-_]US/i.test(x.lang) && /google|samantha|aaron|natural|male/i.test(x.name)) || vs.find((x) => /^en/i.test(x.lang)); if (v) u.voice = v;
      ss.speak(u);
    } catch { /* the music still plays */ }
  };
  function start(opts) {
    opts = opts || {}; voice = opts.voice !== false;
    try {
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5;
      const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
      delayIn = ctx.createGain(); const dl = ctx.createDelay(1), fb = ctx.createGain(); dl.delayTime.value = BEAT * 0.75; fb.gain.value = 0.28; delayIn.connect(master); delayIn.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      T0 = ctx.currentTime + 0.15; stopped = false; events = [];
      build();
      const total = INTRO + 8 * LINE + OUTRO;
      lines.forEach((l, i) => events.push({ t: INTRO + i * LINE + 0.12, fn: () => { speak(l); opts.onLine && opts.onLine(i); } }));
      events.push({ t: total - 0.3, fn: () => { stop(); opts.onEnd && opts.onEnd(); } });
      timer = setInterval(() => { if (stopped) return; const now = ctx.currentTime - T0; while (events.length && events[0].t <= now) events.shift().fn(); }, 40);
    } catch { stop(); opts.onEnd && opts.onEnd(); }
  }
  function stop() {
    stopped = true; clearInterval(timer); events = [];
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* ignore */ }
    try { master && master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch { /* already ended */ } }); nodes = []; ctx && ctx.close().catch(() => {}); ctx = null; }, 300); } catch { /* ignore */ }
  }
  const pause = () => { try { ctx && ctx.suspend(); window.speechSynthesis && window.speechSynthesis.pause(); } catch { /* ignore */ } };
  const resume = () => { try { ctx && ctx.resume(); window.speechSynthesis && window.speechSynthesis.resume(); } catch { /* ignore */ } };
  return { start, stop, pause, resume, duration: INTRO + 8 * LINE + OUTRO };
}
