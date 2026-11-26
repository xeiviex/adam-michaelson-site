/* Content and drawings for /lendingtree/getting-started/. One slide per section of the video.
   Each slide: a title, a one-line subtitle, one drawing, optional rail links and a Details sheet.
   Motion: anything with class "a" builds in when the slide is shown, after --d seconds. Variants: gx (grows from the left),
   gy (grows from the bottom), drop (lands from above), fade, and SVG paths with class "ln" (drawn along their length).
   Assumes a January 1, 2027 start. Roles are used in place of names, except Sarah's. */

const A = (d, cls = '') => `class="a ${cls}" style="--d:${d}"`;
/* A is LendingTree's own website and app; B is the same journey inside an assistant. */
/* The financial model behind the economics slide (a Google Sheet; it must be shared for viewers to open it). */
const MODEL = 'https://docs.google.com/spreadsheets/d/1ThgH0lIsIwzAx7juTF14XVXN2BI6ckaR_FFasPzPLII/edit';
const VT_A = '/lendingtree/visiontypes/lifecycle/';
const VT_B = '/lendingtree/visiontypes/assistant/';
const VT_C = '/lendingtree/visiontypes/embedded/';

/* ------------------------------------------------------------------ 1 open */
/* Each pillar is drawn as a miniature of its own slide later in the deck: the core line held above plan (slide 4),
   bets that stop or add up (slide 5), and pods cycling over a research track that reaches its gate (slide 6). */
const dm = (x, y, cls) => `<path class="dia ${cls}" d="M${x} ${y - 7}l7 7-7 7-7-7z"/>`;
const g1 = (d) => `<svg viewBox="0 0 300 124" aria-hidden="true">
  <path class="ln plan" ${A(d)} pathLength="1" d="M10 82 290 62"/>
  <path class="ln corel" ${A(d + 0.3)} pathLength="1" d="M10 86C90 88 150 72 290 34"/>
  ${[[103, 80], [183, 63], [290, 34]].map((q, i) => `<circle ${A((d + 0.7 + i * 0.2).toFixed(2), 'pop')} class="rv" cx="${q[0]}" cy="${q[1]}" r="6"/>`).join('')}
</svg>`;
const g2 = (d) => `<svg viewBox="0 0 300 124" aria-hidden="true">
  ${[[18, 104, 1], [48, 124, 0], [78, 150, 1], [108, 166, 0]].map((r, i) => `<path class="ln bet" ${A((d + i * 0.06).toFixed(2))} pathLength="1" d="M10 ${r[0]}H${r[1] - 7}"/><g ${A((d + 0.5 + i * 0.08).toFixed(2), 'pop')}>${dm(r[1], r[0], r[2] ? 'go' : 'no')}</g>${r[2] ? '' : `<path ${A((d + 0.7).toFixed(2), 'fade')} class="x" d="M${r[1] + 14} ${r[0] - 5}l10 10m0-10-10 10"/>`}`).join('')}
  <path class="ln win" ${A(d + 0.8)} pathLength="1" d="M111 18C170 18 190 64 230 64"/>
  <path class="ln win" ${A(d + 0.8)} pathLength="1" d="M157 78C195 78 205 64 230 64"/>
  <path class="ln flow" ${A(d + 1.3)} pathLength="1" d="M228 64C252 62 264 42 284 26"/>
  <circle ${A(d + 1.8, 'pop')} class="goal" cx="286" cy="24" r="8"/>
</svg>`;
const g3 = (d) => `<svg viewBox="0 0 300 124" aria-hidden="true">
  ${[[16, 14], [44, 48], [72, 82]].map((r, k) => { let o = ''; for (let i = 0, x = r[1]; x <= 290; x += 34, i++) o += i % 4 === 3 ? `<g ${A((d + k * 0.2 + i * 0.06).toFixed(2), 'pop')}>${dm(x, r[0], 'go')}</g>` : `<circle ${A((d + k * 0.2 + i * 0.06).toFixed(2), 'pop')} class="stn${i % 4 === 0 ? ' open' : i % 4 === 2 ? ' ev' : ''}" cx="${x}" cy="${r[0]}" r="5"/>`; return o; }).join('')}
  <path class="ln res" ${A(d + 0.9)} pathLength="1" d="M10 108H214"/>
  <g ${A(d + 1.6, 'pop')}>${dm(224, 108, 'gate')}</g>
  <path class="ln res2" ${A(d + 1.7)} pathLength="1" d="M234 108H280"/>
  <circle ${A(d + 2.1, 'pop')} class="goal" cx="286" cy="108" r="7"/>
</svg>`;
/* The white bar fades in after the three columns; then its words and dots fade in one by one, left to right. */
const base = (d) => `<div class="base a fade" style="--d:${d}">${['Raise the bar', 'Learn fast', 'Lead the team'].map((t, i) => `${i ? `<i ${A((d + 0.25 + i * 0.7).toFixed(2), 'fade')} aria-hidden="true"></i>` : ''}<span ${A((d + 0.6 + i * 0.7).toFixed(2), 'fade')}>${t}</span>`).join('')}</div>`;
const open = `
<div class="th">
  <div class="th3">
    <div>${g1(0.9)}<b ${A(0.9)}>Protect the core</b><small ${A(1.0)}>Core targets, partner with Sarah</small></div>
    <div>${g2(2.0)}<b ${A(2.0)}>Deliver new profit</b><small ${A(2.1)}>$1M+ in year one</small></div>
    <div>${g3(3.4)}<b ${A(3.4)}>Disrupt ourselves</b><small ${A(3.5)}>Three pods + research-led reset</small></div>
  </div>
  ${base(5.0)}
</div>`;

/* ----------------------------------------------------------- 2 integration */
/* Ten working days, January 4 to 15. Each entry is that day's interviews: 6 = 60 minutes, 3 = 30 minutes. */
const DAYS = [[6, 6, 6, 3], [6, 6, 3], [6, 6, 3], [6, 3, 3], [6, 3, 3], [6, 6, 3], [6, 3, 3], [6, 6, 3], [6, 3], [6, 3, 3]];
const DOW = ['M', 'T', 'W', 'T', 'F'];
/* Build order: who (top to bottom), the brace wipes in, the arrow draws, the day columns fade in left to right, the
   legend fades in, then the bubbles pop while the count runs, then the second arrow, the readout card, and the cities. */
let dn = 0;
const T_COLS = 1.9, T_BUBBLES = 3.2, STEP = 0.085;
const cal = DAYS.map((day, i) => `<li class="a fade${i === 5 ? ' wk' : ''}" style="--d:${(T_COLS + i * 0.07).toFixed(2)}"><span class="dots">${day.map((m) => `<i ${A((T_BUBBLES + (dn++) * STEP).toFixed(2), 'pop' + (m === 6 ? ' big' : ''))}></i>`).join('')}</span><b>${DOW[i % 5]}</b>${i % 5 === 0 ? `<small>Jan ${i === 0 ? 4 : 11}</small>` : ''}</li>`).join('');
const T_END = T_BUBBLES + dn * STEP;
const integration = `
<div class="intg">
  <div class="whow">
    <ul class="who">
      <li ${A(0.2, 'fade')}>C-team</li><li ${A(0.45, 'fade')}>VPs</li><li ${A(0.7, 'fade')}>Direct reports</li>
    </ul>
    <svg class="brace a wipe" style="--d:1.0" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true"><path d="M2 1C9 1 10 6 10 13V39C10 46 11 50 18 50C11 50 10 54 10 61V87C10 94 9 99 2 99"/></svg>
  </div>
  <span class="arrow a gx" style="--d:1.4"></span>
  <div class="calw">
    <p class="count a fade" style="--d:${T_BUBBLES}"><b data-count="${dn}" data-pre="~" data-at="${T_BUBBLES}" data-dur="${(dn * STEP).toFixed(1)}">~${dn}</b> interviews in two weeks</p>
    <ol class="cal">${cal}</ol>
    <p class="key a fade" style="--d:2.8"><i class="big"></i>60 minutes<i></i>30 minutes<span>${['Charlotte', 'Seattle', 'Denver', 'Zoom'].map((c, i) => `<span class="a fade" style="--d:${(T_END + 1.5 + i * 0.25).toFixed(2)}">${i ? ' · ' : ''}${c}</span>`).join('')}</span></p>
  </div>
  <span class="arrow a gx" style="--d:${(T_END + 0.2).toFixed(2)}"></span>
  <div class="out a fade" style="--d:${(T_END + 0.7).toFixed(2)}"><em>January 15</em><b>Synthesis and readout</b><small>Topics, key findings, next steps</small></div>
</div>`;

/* ------------------------------------------------------------------ 3 team */
const box = (x, y, w, h, t, cls, d, sub) => `<g ${A(d, 'fade')}><rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text class="bt ${cls}" x="${x + w / 2}" y="${y + h / 2 + (sub ? -3 : 5)}">${t}</text>${sub ? `<text class="bs ${cls}" x="${x + w / 2}" y="${y + h / 2 + 15}">${sub}</text>` : ''}</g>`;
const LEADS = [300, 600, 900];
/* Clarity down (blue) and feedback up (white): a dot travels the line between the CPO and each lead, in both directions.
   The motion is SVG's own animateMotion, looping; the group is only shown once the slide's lines have drawn. */
const pulses = (leads, x, y0, bus, r, at = 4.4) => `<g class="pulses" style="--d:${at}" aria-hidden="true">${leads.map(([lx, ly], i) => {
  const down = `M${x} ${y0}V${bus}H${lx}V${ly - 2}`, up = `M${lx} ${ly - 2}V${bus}H${x}V${y0}`;
  const dot = (cls, path, begin) => `<circle class="pulse ${cls}" r="${r}" opacity="0"><animateMotion dur="2.6s" begin="${begin}s" repeatCount="indefinite" path="${path}"/><animate attributeName="opacity" dur="2.6s" begin="${begin}s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.12;0.86;1"/></circle>`;
  return dot('dn', down, (i * 0.45).toFixed(2)) + dot('up', up, (1.3 + i * 0.45).toFixed(2));
}).join('')}</g>`;
const teams = LEADS.map((cx, k) => [-74, 0, 74].map((dx, j) => `<rect ${A((2.0 + k * 0.15 + j * 0.05).toFixed(2))} class="tm${k === 2 ? ' hire' : ''}" x="${cx + dx - 31}" y="318" width="62" height="38" rx="7"/>`).join('')).join('');
/* The same chain of command, redrawn tall for phones, where the wide version would have to scroll sideways. */
const pb = (x, y, w, h, t, cls, d, sub) => `<g ${A(d)}><rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/><text class="pt ${cls}" x="${x + w / 2}" y="${y + h / 2 + (sub ? -2 : 4)}">${t}</text>${sub ? `<text class="ps" x="${x + w / 2}" y="${y + h / 2 + 12}">${sub}</text>` : ''}</g>`;
const PL = [65, 180, 295];
const teamPhone = `
<svg class="org m" viewBox="0 0 360 292" role="img" aria-label="Chain of command: the CPO, three leads and their teams, with the heads of technology, analytics and strategy, and marketing as partners">
  <defs><marker id="ahp" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#6cc3f5" stroke-width="1.6"/></marker></defs>
  <path class="ln rule" ${A(0.9)} pathLength="1" d="M85 58V96M65 96H295M65 96V116M180 96V116M295 96V116"/>
  <path class="ln rule" ${A(1.7)} pathLength="1" d="${PL.slice(0, 2).map((c) => `M${c} 162V180M${c - 34} 180H${c + 34}M${c - 34} 180V196M${c} 180V196M${c + 34} 180V196`).join('')}"/>
  <path class="ln rule dsh" ${A(1.9)} d="M295 162V180M261 180H329M261 180V196M295 180V196M329 180V196"/>
  <path class="ln acc" ${A(0.6)} pathLength="1" d="M150 34H190"/>
  <text class="pl acc" ${A(0.7)} x="265" y="13">Partners: the heads of</text>
  <g ${A(0.75)}><rect class="bx dk" x="190" y="18" width="150" height="60" rx="7"/><text class="pt sm" x="265" y="35">Technology</text><text class="pt sm" x="265" y="52">Analytics and strategy</text><text class="pt sm" x="265" y="69">Marketing</text></g>
  ${pb(20, 12, 130, 46, 'CPO', 'wh', 0.2)}
  ${pb(15, 116, 100, 46, 'Senior director', 'dk', 1.2, 'Product')}
  ${pb(130, 116, 100, 46, 'Senior director', 'dk', 1.35, 'Product')}
  ${pb(245, 116, 100, 46, 'Head of design', 'hire', 1.5, 'To hire')}
  ${PL.map((c, k) => [-34, 0, 34].map((dx, j) => `<rect ${A((1.9 + k * 0.12 + j * 0.04).toFixed(2))} class="tm${k === 2 ? ' hire' : ''}" x="${c + dx - 13}" y="196" width="26" height="20" rx="4"/>`).join('')).join('')}
  <path class="skip" ${A(2.8, 'fade')} d="M104 58C120 66 122.500 78 122.500 100V226" marker-end="url(#ahp)"/>
  <path class="skip" ${A(3.1, 'fade')} d="M134 58C134 86 237.500 78 237.500 102V226" marker-end="url(#ahp)"/>
  <text class="pl acc" ${A(2.9)} x="122" y="246">When a team is in trouble</text>
  <text class="pl acc" ${A(3.2)} x="238" y="264">Coaching rising leaders</text>
  ${pulses([[65, 116], [180, 116], [295, 116]], 85, 60, 96, 3)}
  <text class="pl" ${A(2.4)} x="180" y="286">Solid lines: clarity down, feedback up</text>
</svg>`;

/* Build order for the chain of command (seconds): CPO, leads, lines to leads, teams, lines to teams, caption,
   running dots, the two dashed arrows, their labels, the partner lines and peers, then the day 30/60/90 strip. */
const T = { cpo: 0.2, leads: 0.9, l1: 1.5, teams: 2.3, l2: 2.9, caption: 3.8, dots: 4.4, skip: 5.0, partner: 6.6, strip: 7.9 };
const team = `
<svg class="org" viewBox="0 0 1200 410" role="img" aria-label="Chain of command: the CPO, three leads and their teams, with the heads of technology, analytics and strategy, and marketing as partners">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#6cc3f5" stroke-width="1.6"/></marker></defs>
  ${/* 3. lines down from the CPO to the leads, all three at once */''}
  ${[300, 600].map((c) => `<path class="ln rule" ${A(T.l1)} pathLength="1" d="M600 78V124H${c}V170"/>`).join('')}
  <path class="ln rule" ${A(T.l1)} pathLength="1" d="M600 78V124H900V170"/>
  ${/* 5. lines down from each lead to its teams, all at once */''}
  ${[300, 600].map((c) => [-74, 0, 74].map((dx) => `<path class="ln rule" ${A(T.l2)} pathLength="1" d="M${c} 234V276H${c + dx}V318"/>`).join('')).join('')}
  <path class="ln rule dsh" ${A(T.l2)} d="M900 234V276M826 276H974M826 276V318M900 276V318M974 276V318"/>
  ${/* 10. partner lines out from the CPO, both sides at once, then the peers */''}
  <path class="ln acc" ${A(T.partner)} pathLength="1" d="M500 44H320"/>
  <path class="ln acc" ${A(T.partner)} pathLength="1" d="M700 44H800V27H836"/>
  <path class="ln acc" ${A(T.partner)} pathLength="1" d="M700 44H800V61H836"/>
  <text class="lb acc" ${A(T.partner + 0.3, 'fade')} x="410" y="34">Partner</text>
  <text class="lb acc" ${A(T.partner + 0.3, 'fade')} x="750" y="34">Partners</text>
  ${box(100, 12, 220, 64, 'Head of technology', 'dk', T.partner + 0.6)}
  ${box(836, 10, 304, 32, 'Head of analytics and strategy', 'dk sm', T.partner + 0.6)}
  ${box(836, 46, 304, 32, 'Head of marketing', 'dk sm', T.partner + 0.6)}
  ${/* 1. the CPO, then 2. the leads together */''}
  ${box(500, 12, 200, 66, 'CPO', 'wh', T.cpo)}
  ${box(185, 170, 230, 64, 'Senior director', 'dk', T.leads, 'Product')}
  ${box(485, 170, 230, 64, 'Senior director', 'dk', T.leads, 'Product')}
  ${box(785, 170, 230, 64, 'Head of design', 'hire', T.leads, 'To hire')}
  ${/* 4. the teams, all together */''}
  ${LEADS.map((cx, k) => [-74, 0, 74].map((dx) => `<rect ${A(T.teams, 'fade')} class="tm${k === 2 ? ' hire' : ''}" x="${cx + dx - 31}" y="318" width="62" height="38" rx="7"/>`).join('')).join('')}
  ${/* 6. the caption, then 7. the dots start running */''}
  <text class="lb" ${A(T.caption, 'fade')} x="362" y="114">Clarity down, feedback up</text>
  ${pulses([[300, 170], [600, 170], [900, 170]], 600, 80, 124, 4)}
  ${/* 8. the two dashed arrows draw downward together, then 9. their labels */''}
  <path class="skip" ${A(T.skip, 'down')} d="M540 78C470 96 450 130 450 176V330" marker-end="url(#ah)"/>
  <path class="skip" ${A(T.skip, 'down')} d="M660 78C730 96 750 130 750 176V330" marker-end="url(#ah)"/>
  <text class="lb acc" ${A(T.skip + 0.9, 'fade')} x="450" y="384">When a team is in trouble</text>
  <text class="lb acc" ${A(T.skip + 0.9, 'fade')} x="750" y="384">Coaching rising leaders</text>
</svg>
${teamPhone}
<ol class="trk t3">
  <li class="on link" style="--d:${T.strip}"><div class="st"><em>By day 30</em><b>Set expectations</b><small>Outputs and outcomes for every role</small></div></li>
  <li class="on link" style="--d:${T.strip + 0.6}"><div class="st"><em>By day 60</em><b>Assess</b><small>Every team member, one on one</small></div></li>
  <li class="on link" style="--d:${T.strip + 1.2}"><div class="st"><em>By day 90</em><b>Act</b><small>Develop, redeploy or hire</small></div></li>
</ol>`;

/* ------------------------------------------------------------------ 4 core */
const QX = [80, 350, 620, 890, 1160];
/* The same chart redrawn for phones: the whole year fits the width, drawn taller so the rise above plan reads. */
const PQ = [20, 100, 180, 260, 340];
const corePhone = `
<svg class="corec m" viewBox="0 0 360 232" role="img" aria-label="Core KPIs tracking the company plan through four quarterly reviews and finishing above it">
  <rect ${A(0.3, 'fade')} class="band" x="20" y="26" width="80" height="164"/>
  <text class="pl acc" ${A(0.5)} x="60" y="44"><tspan x="60">Transition</tspan><tspan class="thin" x="60" dy="13">with Sarah</tspan></text>
  <path class="axis" d="M20 190H340"/>
  ${PQ.slice(1).map((x) => `<path class="tick" d="M${x} 190V26"/>`).join('')}
  ${['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => `<text class="pl" x="${PQ[i] + 40}" y="206">${q}</text>`).join('')}
  <path class="ln plan" ${A(0.8)} pathLength="1" d="M20 152C120 146 240 132 340 120"/>
  <path class="ln corel" ${A(1.8)} pathLength="1" d="M20 156C60 158 80 148 100 144S150 130 180 122S230 100 260 90S310 66 340 54"/>
  <text class="pl" ${A(1.4)} x="334" y="148" text-anchor="end">Company plan</text>
  <text class="pt" ${A(3.4)} x="330" y="38" text-anchor="end">Core KPIs</text>
  ${[[100, 144], [180, 122], [260, 90], [340, 54]].map((q, i) => `<circle ${A((2.3 + i * 0.35).toFixed(2), 'pop')} class="rv" cx="${q[0]}" cy="${q[1]}" r="5.5"/>`).join('')}
  <g ${A(3.6, 'fade')}><circle class="rv" cx="26" cy="223" r="4.5"/><text class="pl" x="38" y="227" text-anchor="start">Review, every quarter</text></g>
</svg>`;

const core = `
<svg class="corec" viewBox="0 0 1200 330" role="img" aria-label="Core KPIs tracking the company plan through four quarterly reviews and finishing above it">
  <rect ${A(0.3, 'fade')} class="band" x="80" y="40" width="270" height="230"/>
  <text class="lb acc" ${A(0.5)} x="215" y="70"><tspan x="215">Transition</tspan><tspan class="thin" x="215" dy="20">in partnership with Sarah</tspan></text>
  <path class="axis" d="M80 270H1160"/>
  ${QX.slice(1).map((x) => `<path class="tick" d="M${x} 270V40"/>`).join('')}
  ${['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => `<text class="lb" x="${QX[i] + 135}" y="296">${q}</text>`).join('')}
  <path class="ln plan" ${A(0.8)} pathLength="1" d="M80 214C420 204 820 182 1160 162"/>
  <path class="ln corel" ${A(1.8)} pathLength="1" d="M80 220C170 222 250 206 350 204S530 192 620 180S800 150 890 136S1070 96 1160 78"/>
  <text class="lb mut" ${A(1.4)} x="1150" y="186" text-anchor="end">Company plan</text>
  <text class="lb wh" ${A(3.4)} x="1150" y="62" text-anchor="end">Core KPIs</text>
  ${[[350, 204], [620, 180], [890, 136], [1160, 78]].map((p, i) => `<g ${A((2.3 + i * 0.35).toFixed(2), 'pop')}><circle class="rv" cx="${p[0]}" cy="${p[1]}" r="7"/><text class="lb sm" x="${p[0] - (i === 3 ? 12 : 0)}" y="${p[1] + 28}" ${i === 3 ? 'text-anchor="end"' : ''}>Review</text></g>`).join('')}
</svg>
${corePhone}
<div class="sup">
  <div ${A(3.8)}><b>Understand</b><small>In the team’s meetings and working sessions</small></div>
  <div ${A(4.0)}><b>Remove roadblocks</b><small>Clear the red tape</small></div>
  <div ${A(4.2)}><b>Simplify</b><small>Score in-flight work on ROI; stop or re-scope</small></div>
</div>
<p class="acct a fade" style="--d:4.6">Same core targets as the company plan. Jointly accountable.</p>`;

/* ---------------------------------------------------------------- 5 impact */
/* Six unlabelled bets. Each has a decision at its own distance; three stop there, three carry on and add up. */
const BETS = [{ y: 50, x: 300, live: true }, { y: 110, x: 470 }, { y: 170, x: 240 }, { y: 230, x: 590, live: true }, { y: 290, x: 380 }, { y: 350, x: 520, live: true }];
const dia = (x, y, cls) => `<path class="dia ${cls}" d="M${x} ${y - 9}l9 9-9 9-9-9z"/>`;
const impact = `
<div class="bets">
  <div class="cand">
    <h3 ${A(0.2)}>Candidate first bets</h3>
    <ul>
      <li ${A(0.35)}><a href="/lendingtree/choice/">The Power of Choice</a></li>
      <li ${A(0.5)}><a href="/lendingtree/companion/">A Companion</a></li>
      <li ${A(0.65)}><a href="/lendingtree/outcomes/">Aligned Outcomes</a></li>
      <li ${A(0.8)} class="a more">Other in-flight work, ideas from the team, other ideas of mine, etc.</li>
    </ul>
  </div>
  <svg viewBox="0 0 940 400" role="img" aria-label="Six bets. Each reaches a decision at its own date. Three stop and three continue, adding up to more than one million dollars of profit in year one">
    <text class="lb acc" ${A(0.8)} x="6" y="18" text-anchor="start">Kill rule and decision date, written first</text>
    ${BETS.map((b, i) => `<rect ${A((0.9 + i * 0.06).toFixed(2), 'pop')} class="st0" x="4" y="${b.y - 6}" width="12" height="12" rx="2"/>
    <path class="ln bet" ${A((1.2 + i * 0.05).toFixed(2))} pathLength="1" d="M16 ${b.y}H${b.x - 9}"/>
    <g ${A((1.9 + b.x / 500).toFixed(2), 'pop')}>${dia(b.x, b.y, b.live ? 'go' : 'no')}</g>
    ${b.live ? `<path class="ln win" ${A((2.2 + b.x / 500).toFixed(2))} pathLength="1" d="M${b.x + 9} ${b.y}C${b.x + 160} ${b.y} 600 232 690 226"/>` : `<path ${A((2.1 + b.x / 500).toFixed(2), 'fade')} class="x" d="M${b.x + 20} ${b.y - 6}l12 12m0-12-12 12"/>`}`).join('')}
    <path class="ln flow" ${A(3.7)} pathLength="1" d="M686 226C740 222 760 150 800 112"/>
    <circle ${A(4.3, 'pop')} class="goal" cx="806" cy="106" r="11"/>
    <text ${A(4.45, 'land')} class="big" x="828" y="96" text-anchor="start">$1M+</text>
    <text ${A(4.75, 'fade')} class="lb" x="829" y="122" text-anchor="start">profit, year one</text>
    <text ${A(2.6)} class="lb sm" x="${BETS[3].x}" y="${BETS[3].y + 28}">Decision</text>
    <text ${A(2.5)} class="lb sm" x="${BETS[2].x + 44}" y="${BETS[2].y + 5}" text-anchor="start">Stopped</text>
  </svg>
</div>`;

/* ------------------------------------------------------------ 6 disruption */
const M0 = 250, MW = (1170 - 250) / 12, mx = (m) => M0 + m * MW; // m = months from January 1
/* Starts are three quarters of a month apart, the same as the station spacing, so each pod has a station exactly on the Day 90 line. */
const PODS = [{ n: 'Pod A', y: 108, s: 0.75 }, { n: 'Pod B', y: 154, s: 1.5 }, { n: 'Pod C', y: 200, s: 2.25 }];
const podRow = (p, k) => {
  let out = `<text class="lb wh" ${A(0.4 + k * 0.5)} x="18" y="${p.y + 5}" text-anchor="start">${p.n}</text>`;
  out += [0, 1, 2].map((j) => `<circle ${A((0.5 + k * 0.5 + j * 0.06).toFixed(2), 'pop')} class="ppl" cx="${96 + j * 20}" cy="${p.y}" r="6"/>`).join('');
  out += `<path class="ln pod" ${A(0.9 + k * 0.5)} pathLength="1" d="M${mx(p.s)} ${p.y}H1170"/>`;
  let i = 0;
  for (let m = p.s; m <= 12.01; m += 0.75, i++) {
    const x = mx(m), d = (1.0 + k * 0.5 + i * 0.07).toFixed(2);
    out += i % 4 === 3 ? `<g ${A(d, 'pop')}>${dia(x, p.y, 'go')}</g>` : `<circle ${A(d, 'pop')} class="stn${i % 4 === 0 ? ' open' : i % 4 === 2 ? ' ev' : ''}" cx="${x}" cy="${p.y}" r="5.5"/>`;
  }
  return out;
};
const RS = [['Stakeholder interviews', 0.5, -1], ['Market research', 1.5, 1], ['Provisional vision', 3, -1], ['Contextual inquiry', 4, 1], ['Synthesis', 5, -1], ['Concept design', 6, 1], ['Validation', 7, -1], ['Go-to-market', 8, 1]];
const disruption = `
<svg class="dis" viewBox="0 0 1200 524" role="img" aria-label="Three independent pods running repeating cycles through the year, and a research-led reset that reaches a phase gate in month nine and an alpha in month twelve">
  ${Array.from({ length: 12 }, (_, i) => `<text class="lb mo" x="${mx(i + 0.5)}" y="26">${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</text>`).join('')}
  <path class="axis" d="M${M0} 38H1170"/>
  ${/* last of all: the Day 90 label fades in, then its dotted line draws from top to bottom */''}<text class="lb acc sm" ${A(6.0, 'fade')} x="${mx(3)}" y="62">Day 90</text><path class="tick mk" ${A(6.6, 'down')} d="M${mx(3)} 38V44M${mx(3)} 72V454"/>
  <text class="hd" ${A(0.2)} x="18" y="66" text-anchor="start">Three independent pods</text>
  <text class="lb sm" ${A(0.3)} x="18" y="86" text-anchor="start"><tspan x="18">PM · Designer · Engineer,</tspan><tspan x="18" dy="17">all at principal level.</tspan><tspan x="18" dy="17">No brief from me.</tspan><tspan x="18" dy="17">They eat what they kill.</tspan></text>
  <g transform="translate(0 54)">
  ${PODS.map(podRow).join('')}
  <g ${A(2.6, 'fade')}>
    <rect class="ko" x="${mx(3) - 8}" y="234" width="16" height="24"/>
    <circle class="stn open" cx="${M0 + 6}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 20}" y="251" text-anchor="start">Open charter</text>
    <circle class="stn" cx="${M0 + 136}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 150}" y="251" text-anchor="start">Smallest test</text>
    <circle class="stn ev" cx="${M0 + 266}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 280}" y="251" text-anchor="start">Evidence review</text>
    ${dia(M0 + 420, 246, 'go')}<text class="lb sm" x="${M0 + 436}" y="251" text-anchor="start">Decision: scale, pivot or stop. Then again.</text>
  </g>
  <text class="hd" ${A(3.0)} x="18" y="300" text-anchor="start">Research-led reset</text>
  <text class="lb" ${A(3.0)} x="18" y="320" text-anchor="start">Led by me</text>
  <path class="ln res" ${A(3.2)} pathLength="1" d="M${M0} 344H${mx(8.5) - 12}"/>
  <path class="ln res2" ${A(4.9)} pathLength="1" d="M${mx(8.5) + 12} 344H${mx(12) - 10}"/>
  ${RS.map((r, i) => `<g ${A((3.3 + i * 0.18).toFixed(2), 'pop')}><circle class="stn res" cx="${mx(r[1])}" cy="344" r="6"/>${r[0] === 'Provisional vision' ? `<rect class="ko" x="${mx(r[1]) - 64}" y="313" width="128" height="18"/>` : ''}<text class="lb sm${r[0] === 'Provisional vision' ? ' wh' : ''}" x="${mx(r[1])}" y="${r[2] < 0 ? 326 : 370}">${r[0]}</text></g>`).join('')}
  <g ${A(4.8, 'pop')}>${dia(mx(8.5), 344, 'gate')}<text class="lb wh" x="${mx(8.5)}" y="322">Phase gate</text></g>
  <g ${A(5.4, 'pop')}><circle class="goal" cx="${mx(12) - 2}" cy="344" r="10"/><text class="lb wh" x="${mx(12)}" y="322" text-anchor="end">Alpha in market</text></g>
  <path class="skip" ${A(4.2, 'fade')} d="M${M0 + 30} 418V362" marker-end="url(#ah)"/>
  <text class="lb acc" ${A(4.0)} x="18" y="436" text-anchor="start">Hypotheses to invalidate</text>
  ${['Bank connectivity through MCP', 'Assistants as underwriting intelligence'].map((t, i) => { const w = [236, 300][i], x = [250, 498][i]; return `<g ${A((4.1 + i * 0.15).toFixed(2), 'drop')}><rect class="chip" x="${x}" y="420" width="${w}" height="30" rx="15"/><text class="lb" x="${x + w / 2}" y="440">${t}</text></g>`; }).join('')}
  </g>
</svg>`;

/* ----------------------------------------------------------- 7 visiontypes */
const LIFE = ['Lead', 'MQL', 'Application', 'Offers and quotes', 'Review and selection', 'Funding or binding', 'Servicing', 'Regular engagement', 'Renewal or upgrade'];
/* The three visiontypes, as a carousel: the middle one is in front, the other two sit behind it on either side.
   Each carries its own logo and title; the line under the title shows only on the one in front.
   app.js turns it, pauses it while it is held, and lets a tap open the one tapped. */
const EMB_MARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9.5" y="9.5" width="8.5" height="8.5" rx="2.2" fill="var(--acc)"/></svg>';
const VTS = [
  { url: VT_A, title: 'LendingTree website and app', sub: 'The whole journey on LendingTree’s own surfaces.', mark: '<img src="/lendingtree/img/lt-leaf.png" alt="">', q: 'path=insurance' },
  { url: VT_B, title: 'Inside ChatGPT', sub: 'The same journey in ChatGPT, Muse or Grok.', mark: '<img src="/lendingtree/img/chatgpt-mark.png" alt="">', q: 'path=insurance' },
  { url: VT_C, title: 'Embedded in a partner', sub: 'Financing and insurance inside a car marketplace’s checkout.', mark: EMB_MARK, q: 'stage=insurance' },
];
const visiontypes = `
<div class="car hs a" style="--d:.2" data-car>
  <div class="stage"><div class="ring">
    ${VTS.map((v, i) => `<a class="fr" href="${v.url}" data-pos="${i}" draggable="false" aria-label="Open ${v.title}">
      <div class="fh"><h3><span class="lg">${v.mark}</span>${v.title}</h3><p>${v.sub}</p></div>
      <div class="desk"><i></i><div class="scr"><iframe title="${v.title}, desktop" data-src="${v.url}?embed=1" loading="lazy" tabindex="-1"></iframe></div></div>
      <div class="phone"><div class="scr"><iframe title="${v.title}, mobile" data-src="${v.url}?embed=1&${v.q}" loading="lazy" tabindex="-1"></iframe></div></div>
    </a>`).join('')}
  </div></div>
</div>
<ol class="life a" style="--d:1.2">${LIFE.map((s, i) => `<li style="--k:${i}"><span>${s}</span></li>`).join('')}</ol>`;

/* ------------------------------------------------------- what this will take */
const nd = (d, n, t, sub, cls = '') => `<div ${A(d)} class="a nd ${cls}"><i>${n}</i><div><b>${t}</b><small>${sub}</small></div></div>`;
const take = `
<div class="stk">
  <p class="stk-l a fade" style="--d:1.0">Where the customer is</p>
  <div class="stk-r three">
    ${nd(1.1, 1, 'AI assistants', 'OpenAI first, then Google, Anthropic and others')}
    ${nd(1.3, 2, 'Partner products', 'Embedded in their purchase flow, three partners in 2027')}
    ${nd(1.5, 3, 'LendingTree website and app', 'One account for loans, policies and linked accounts')}
  </div>
  <div class="stk-c three a fade" style="--d:.9"><span></span><span></span><span></span></div>
  <div class="stk-p a" style="--d:.2">
    <h3>LendingTree platform</h3>
    <div class="stk-r three">
      ${nd(0.4, 4, 'The LendingTree agent', 'MCP, API and an embedded SDK, with consent and an audit trail', 'on')}
      ${nd(0.55, 5, 'Closing and binding rails', 'Disclosures, signature, funding, policy binding', 'on')}
      ${nd(0.7, 6, 'One chosen partner', 'No flood of calls, texts and emails', 'on')}
    </div>
  </div>
  <div class="stk-c three a fade" style="--d:1.8"><span></span><span></span><span></span></div>
  <p class="stk-l a fade" style="--d:1.9">Who we need to sign</p>
  <div class="stk-r three">
    ${nd(2.0, 7, 'Data connections', 'Plaid, Finicity, property and credit, by consent')}
    ${nd(2.2, 8, 'Alpha lenders and carriers', 'Firm offers, bindable quotes and applications through an API')}
    ${nd(2.4, 9, 'A first embedded partner', 'Signed, integrated and live in 2027')}
  </div>
  <p class="stk-l gap a fade" style="--d:2.7">How we take it to market</p>
  <div class="stk-r two">
    ${nd(2.8, 10, 'An embedded partnerships team', 'A group within Partnerships that signs, launches and supports partners')}
    ${nd(3.0, 11, 'A go-to-market for embedded', 'Who we target, the partner fee, the launch playbook, and how we measure it')}
  </div>
</div>
<p class="acct a fade" style="--d:3.4">First version: one loan product, one insurance product, one assistant, one embedded partner, a handful of lenders and carriers.</p>`;

/* ------------------------------------------------------------- the economics */
/* Per consumer request, from the model's default inputs. Lead prices and conversion rates are assumptions. */
const ECON = [
  { name: 'Loans', eg: 'Example: a home equity line', today: 120, close: 248, serv: 278, flat: 175, fmt: (n) => '$' + n },
  { name: 'Insurance', eg: 'Example: an auto policy', today: 36, close: 27, serv: 25, flat: 17, fmt: (n) => '$' + n },
];
const econ = `
<div class="ec">
  ${ECON.map((e, k) => { const max = e.close + e.serv, w = (n) => (n / max * 100).toFixed(1), d = 0.3 + k * 1.4; return `
  <section class="ec-p">
    <h3 ${A(d)}>${e.name} <span>${e.eg}</span></h3>
    <p class="ec-u a fade" style="--d:${(d + 0.1).toFixed(2)}">Revenue per shopper</p>
    <div class="ec-row a" style="--d:${(d + 0.15).toFixed(2)}"><span>Today, selling leads</span><div class="ec-b"><i class="lead a gx" style="--d:${(d + 0.25).toFixed(2)};width:${w(e.today)}%"></i><b>${e.fmt(e.today)}</b></div></div>
    <div class="ec-row a" style="--d:${(d + 0.5).toFixed(2)}"><span>Paid on outcomes</span><div class="ec-b"><i class="close a gx" style="--d:${(d + 0.6).toFixed(2)};width:${w(e.close)}%"><em>At close</em></i><i class="serv a gx" style="--d:${(d + 0.9).toFixed(2)};width:${w(e.serv)}%"><em>Servicing</em></i><b>${e.fmt(e.close + e.serv)}</b></div></div>
    <div class="ec-row a" style="--d:${(d + 1.0).toFixed(2)}"><span>Outcomes, with no lift in conversion</span><div class="ec-b"><i class="flat a gx" style="--d:${(d + 1.1).toFixed(2)};width:${w(e.flat)}%"></i><b>${e.fmt(e.flat)}</b></div></div>
  </section>`; }).join('')}
  <section class="ec-p">
    <h3 ${A(3.1)}>Embedded <span>Example: a financed used car</span></h3>
    <p class="ec-u a fade" style="--d:3.2">Revenue per purchase</p>
    <div class="ec-row a" style="--d:3.25"><span>Paid on outcomes</span><div class="ec-b"><i class="close a gx" style="--d:3.35;width:57.7%"><em>At close</em></i><i class="serv a gx" style="--d:3.65;width:42.3%"><em>Servicing</em></i><b>$2,346</b></div></div>
    <div class="ec-row a" style="--d:3.8"><span>Paid to the partner, 2% of the loan</span><div class="ec-b"><i class="flat a gx" style="--d:3.9;width:23.1%"></i><b>$541</b></div></div>
    <div class="ec-row a" style="--d:4.1"><span>Partners live</span><p class="ec-n"><b>3</b> in 2027<i></i><b>10</b> in 2028<i></i><b>20</b> in 2029</p></div>
  </section>
</div>
<div class="ec-f">
  <div class="ec-t a" style="--d:4.5"><h3>The terms</h3><p>5% of the loan or first-year premium at close or bind. 15% of interest while we service a loan. A monthly fee per policy in force. Each request goes to one chosen partner. Embedded partners are paid 2% in place of our marketing spend.</p></div>
  <div class="ec-ramp a" style="--d:4.8"><h3>Share of volume on outcomes</h3><ol>${[['Start', 1], ['6 months', 10], ['1 year', 50], ['2 years', 100]].map((r, i) => `<li><i class="a gy" style="--d:${(5.0 + i * 0.2).toFixed(1)};height:${Math.max(r[1], 4)}%"></i><b>${r[1]}%</b><span>${r[0]}</span></li>`).join('')}</ol></div>
</div>
<p class="ec-w a fade" style="--d:5.9">Lead prices and conversion rates are my assumptions, informed by my experience at Lendio, since LendingTree does not publish them. Being paid on close in home equity, and on bind in insurance, needs legal review first.</p>`;

/* ------------------------------------------------------------------ 8 time */
const PH = ['Jan 1–15', 'Jan 16–31', 'February', 'March', 'Apr–Jun', 'Jul–Dec'];
const BANDS = [
  ['Core', 'core', [10, 20, 20, 15, 20, 20]],
  ['Team', 'team', [10, 20, 25, 20, 25, 20]],
  ['Impact', 'imp', [0, 15, 25, 25, 0, 0]],
  ['Disruption', 'dis', [0, 5, 10, 20, 40, 50]],
  ['Integration', 'intg', [60, 20, 0, 0, 0, 0]],
  ['Onboarding', 'onb', [10, 0, 0, 0, 0, 0]],
  ['Unplanned', 'unp', [10, 20, 20, 20, 15, 10]],
];
const CW = 120, CG = 84, CX = (i) => 40 + i * (CW + CG), CH = 330, CY = 46;
function timeChart() {
  const top = (b, i) => CY + CH - BANDS.slice(0, b + 1).reduce((s, x) => s + x[2][i], 0) * CH / 100;
  let rib = '', cols = '';
  BANDS.forEach((band, b) => {
    for (let i = 0; i < 5; i++) {
      const v0 = band[2][i], v1 = band[2][i + 1]; if (!v0 && !v1) continue;
      const x0 = CX(i) + CW, x1 = CX(i + 1), t0 = top(b, i), b0 = t0 + v0 * CH / 100, t1 = top(b, i + 1), b1 = t1 + v1 * CH / 100, mxx = (x0 + x1) / 2;
      rib += `<path class="rb ${band[1]}" ${A((1.0 + i * 0.45).toFixed(2), 'fade')} d="M${x0} ${t0}C${mxx} ${t0} ${mxx} ${t1} ${x1} ${t1}V${b1}C${mxx} ${b1} ${mxx} ${b0} ${x0} ${b0}Z"/>`;
    }
  });
  PH.forEach((p, i) => {
    let g = `<text class="lb wh" x="${CX(i) + CW / 2}" y="30">${p}</text>`;
    BANDS.forEach((band, b) => {
      const v = band[2][i]; if (!v) return;
      const y = top(b, i), h = v * CH / 100;
      g += `<rect class="bd ${band[1]}" x="${CX(i)}" y="${y + 1}" width="${CW}" height="${h - 2}" rx="4"/>`;
      g += `<text class="bl ${band[1]}" x="${CX(i) + CW / 2}" y="${y + h / 2 + 4.5}">${h >= 26 ? band[0] + ' ' : ''}${v}%</text>`;
    });
    cols += `<g ${A((0.3 + i * 0.45).toFixed(2), 'gy')}>${g}</g>`;
  });
  return `<svg class="time" viewBox="0 0 1200 386" role="img" aria-label="Share of my week in six phases. Integration falls from 60 percent to nothing by February, immediate impact ends at day 90, and disruption grows to half my week">${rib}${cols}</svg>`;
}
const time = `${timeChart()}
<p class="acct a fade" style="--d:3.4">The leads run the day-to-day. An owner runs each bet. Principals run each pod.</p>`;

/* -------------------------------------------------------------- 9 outcomes */
const card = (d, part, fig, line, by, cls = '') => `<article ${A(d)}><h3>${part}</h3><b class="fig ${cls}">${fig}</b><p>${line}</p><em>${by}</em></article>`;
const outcomes = `
<div class="cards6">
  ${card(0.2, 'Integration', '~30', 'Leaders interviewed; synthesis read out to all', 'January 15')}
  ${card(0.5, 'Team leadership', '30 · 60 · 90', 'Expectations, assessments, changes; every team with a named lead', 'Day 90')}
  ${card(0.8, 'Protecting the core', '≥ Plan', 'The company plan’s core targets, jointly accountable', 'Every quarter')}
  ${card(1.1, 'Immediate impact', '$1M+', 'Profit booked, and annual run rate', 'Within year one')}
  ${card(1.4, 'Disruption: pods', '3 × 3', 'Three pods of three principals, 100% allocated and running', 'Day 90')}
  ${card(1.7, 'Disruption: research', 'M9 · M12', 'Executive phase gate; alpha in market', 'Months 9 and 12')}
</div>`;

/* ------------------------------------------------------------------ 10 plan */
/* Columns are half months, 1 to 24. [label, note, from, to (exclusive), kind, marker] */
const LANES = [
  ['Foundation', 'Learn, lead and protect', [
    ['Integration', 'Interviews and readout', 1, 2, 'f', 'Readout'],
    ['Team leadership', 'Expectations, assessments, changes', 1, 7, 'f', 'Day 90'],
    ['Team leadership', 'Leveling up, ongoing', 7, 25, 'o'],
    ['Protecting the core', 'Quarterly reviews', 1, 25, 'f', '', [7, 13, 19, 25]],
  ]],
  ['Immediate impact', 'New profit, proven by experiment', [
    ['First bets', 'Choose, test, decide', 1, 7, 'f'],
    ['Owners scale the winners', '', 7, 25, 'o', '$1M+'],
  ]],
  ['Disruption', 'Three pods and a research-led reset', [
    ['Pods', 'Staff and start', 1, 7, 'o', 'Running'],
    ['Pods', 'Test, review, decide, repeat', 7, 25, 'f'],
    ['Research', 'Interviews, market research, internal reflection', 1, 5, 'f'],
    ['Research', 'Contextual inquiry', 3, 9, 'f'],
    ['Research', 'Provisional vision', 5, 7, 'f', 'Day 90'],
    ['Research', 'Synthesis, concept design, validation, go-to-market', 9, 17, 'f'],
    ['Research', 'Phase gate', 17, 19, 'g', 'Commit'],
    ['Research', 'Build the alpha', 19, 25, 'f', 'Alpha'],
  ]],
];
let pr = 0;
const plan = `
<div class="gn" role="table" aria-label="Year-one plan by month">
  ${LANES.map((lane, li) => `
  <div class="gnl a" style="--d:${(0.2 + li * 1.1).toFixed(1)}" role="row"><div class="gnh"><b>${lane[0]}</b><span>${lane[1]}</span></div><div class="gnm" aria-hidden="true">${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => `<span>${m}</span>`).join('')}</div></div>
  ${lane[2].map((r) => { const d = (0.4 + li * 1.1 + (pr++) * 0.12).toFixed(2); return `<div class="gnr" role="row"><div class="gnt a fade" style="--d:${d}" role="rowheader"><b>${r[0]}</b><small>${r[1]}</small></div><div class="gng" role="cell"><span class="gb ${r[4]} a gx" style="--d:${d};grid-column:${r[2]} / ${r[3]}">${r[5] ? `<em class="a pop${r[3] > 22 ? ' end' : ''}" style="--d:${(+d + 0.6).toFixed(2)}"><i>${r[5]}</i></em>` : ''}</span>${(r[6] || []).map((c) => `<i class="qm a pop" style="--d:${(+d + 0.5).toFixed(2)};grid-column:${c - 1}"></i>`).join('')}</div></div>`; }).join('')}`).join('')}
</div>`;

/* ----------------------------------------------------------------- 11 close */
const close = `
<div class="cl">
  <div class="th">
    <div class="th3">
      <div><b ${A(0.8)}>Protect the core</b><small class="fg a" style="--d:.9">≥ Plan</small></div>
      <div><b ${A(1.2)}>Deliver new profit</b><small class="fg a" style="--d:1.3">$1M+</small></div>
      <div><b ${A(1.6)}>Disrupt ourselves</b><small class="fg a" style="--d:1.7">3 pods · M9 gate · M12 alpha</small></div>
    </div>
    ${base(2.0)}
  </div>
  <div class="inv a" style="--d:4.6">
    <p>See where this could go.</p>
    ${VTS.map((v) => `<a class="btn pri" href="${v.url}">${v.title}</a>`).join('')}
  </div>
</div>`;

/* -------------------------------------------------------------- details */
const ul = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const ol = (xs) => `<ol>${xs.map((x) => `<li>${x}</li>`).join('')}</ol>`;
const tbl = (head, rows) => `<div class="hs"><table><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
const lnk = (xs) => `<ul class="lk">${xs.map((x) => `<li><a href="${x[0]}">${x[1]}</a>${x[2] ? ` <span>${x[2]}</span>` : ''}</li>`).join('')}</ul>`;

const D = {
  take: `
    <h4>What the visiontypes assume, and a first version of each</h4>
    ${tbl(['', 'What we would need', 'First version'], [
      ['1', 'Assistant partnerships', 'OpenAI first, then Google, Anthropic and others: listing in their app programme, review, commercial terms, attribution.'],
      ['2', 'Embedded partners', 'Companies who put LendingTree financing and insurance inside their own purchase flow. Three in 2027, ten in 2028, twenty in 2029. The partner is paid a fee, in place of what we spend to acquire a lead.'],
      ['3', 'The customer account', 'One home on LendingTree’s website and app for loans, policies and linked accounts. Read-only to start (balances, due dates, renewals), then payments and claims.'],
      ['4', 'The LendingTree agent: MCP, API and an embedded SDK', 'The tools an assistant or a partner calls: eligibility, offers and quotes, application status, servicing. With sign-in, consent and an audit trail. The embedded SDK is new technology we would need to build.'],
      ['5', 'Closing and binding rails', 'Disclosures, e-signature, funding status, policy binding and ID card, with licensing and compliance signed off first.'],
      ['6', 'One chosen partner', 'In these journeys the shopper picks who contacts them, so the request is not sold to several partners and the flood of calls, texts and emails stops.'],
      ['7', 'Data connections', 'Aggregators such as Plaid and Finicity for bank, income and assets; property and vehicle data; a soft credit pull. All by consent.'],
      ['8', 'Alpha lenders and carriers', 'Two or three of each who return firm offers and bindable quotes, and accept an application, through an API.'],
      ['9', 'A first embedded partner', 'One company signed, integrated and live in 2027, as the reference for the next two that year.'],
      ['10', 'An embedded partnerships team', 'A group within Partnerships dedicated to this: finding and signing partners, launching them, and supporting them once live.'],
      ['11', 'A go-to-market for embedded', 'Which partners we target first, the fee we pay them, the launch playbook, and how we measure each partner. This is needed alongside the technology, not after it.'],
    ])}
    <p>Some of this LendingTree has today. Finding out how much is part of my first two weeks.</p>`,
  economics: `
    <p>The slide shows one example of each kind of product: a home equity line for loans, and an auto policy for insurance. The economics differ a good deal by product, because the fee is a share of the amount. The model has a section for each product type and an aggregate.</p>
    <h4>Per consumer request, at the model’s default inputs</h4>
    ${tbl(['', 'Home equity line', 'Auto insurance'], [
      ['Today, selling leads', '$120 (three leads at $40)', '$36 (three leads at $12)'],
      ['Paid on outcomes', '$526 ($248 at close, $278 from servicing)', '$52 ($27 at bind, $25 from servicing)'],
      ['Outcomes, with no lift in conversion', '$175', '$17'],
      ['Break-even', 'A 1.8% funded rate per request', 'About double today’s assumed bind rate per lead'],
    ])}
    <h4>Embedded: per financed used-car purchase</h4>
    ${tbl(['', 'Revenue', 'After the partner fee and cost to serve'], [
      ['Loan only', '$2,346 ($1,354 at close, $993 from servicing)', '$1,337'],
      ['Loan and an insurance policy', '$2,653', '$1,542'],
    ])}
    <p>The partner is paid 2% of the loan, about $541, in place of marketing spend. With three partners in 2027, ten in 2028 and twenty in 2029, and an assumed 500 financed purchases per partner each month, the model shows about $221M of revenue over three years, with the cost of building the embedded technology paid back early in 2028. Acquisition cost is about 23% of revenue here, against 70% to 77% on leads today.</p>
    <h4>Across LendingTree’s products</h4>
    <p>The model has a section for each of eight product types and an aggregate. The terms do not fit every product equally. They fit small business loans and insurance best. A 5% fee on a mortgage is about $21,000 a loan, which is not realistic and is the hardest legal case. Personal loans earn less on these terms than on leads. Leaving mortgage out, a request earns about $85 on outcomes against $42 on leads, and about $31 with no lift in conversion.</p>
    <h4>What is assumed</h4>
    ${ul(['Price per lead, leads sold per request, and funded and bind rates are assumptions, informed by my experience at Lendio. LendingTree does not publish them, and every comparison moves with them.', 'Marketing cost per request comes from LendingTree’s reported segment margins and is charged equally to both models.', 'The default outcome case assumes one chosen partner closes as many requests as three lead buyers do today. The no-lift row shows the case where it does not.', 'Sending each request to one partner gives up two thirds of today’s lead revenue per request.'])}
    <h4>Over 36 months on the ramp</h4>
    <p>With illustrative volumes, revenue is about 32% higher than staying on leads. All of that comes from home equity. Auto insurance finishes slightly behind, because servicing fees arrive later than lead fees.</p>
    <h4>To review with counsel before anything else</h4>
    ${ul(['Home equity: US rules on referral fees for mortgage-type loans (RESPA Section 8) constrain fees paid to a referrer on close.', 'Insurance: being paid when a policy binds generally requires a producer licence.', 'The proposed terms are large next to market norms: 5% at close is about five times a typical origination fee, and 15% of interest is several times a typical servicing fee.'])}`,
  integration: `
    <h4>Who, and how</h4>
    ${ul(['The C-team, VP-level leaders (a short list if there are many) and my direct reports: 20 at minimum, 30 at most.', 'No more than six a day. 60 minutes with key stakeholders, 30 with roles further from product.', 'In person where I can, in Charlotte, Seattle and Denver. Otherwise by Zoom.', 'Others, such as board members and directors, are added as the interviews point to them.', 'Everyone gets a fresh conversation, including the leaders I met while interviewing. These are different questions.'])}
    <h4>Questions for executives and VPs</h4>
    ${ol(['What is the vision for the company: why it exists, and the ideal outcome it achieves?', 'What is the strategy? What is missing, what should we stop doing, and what should we start?', 'What are LendingTree’s greatest strengths?', 'What are its greatest weaknesses?', 'What are its greatest opportunities?', 'What are its greatest threats?', 'A year from now, what needs to be materially different for you to call it a great year?', 'Where should Product lead, and where should it help another team succeed?', 'Where would you want me to concentrate first? What would you slow down to make room?', 'What do you expect by day 30, day 60 and day 90?', 'Which people, dependencies or decisions will most affect whether I can deliver? Where should I act independently, and where do you want to be involved?'])}
    <h4>Questions for my direct reports</h4>
    ${ol(['What is working that I should be careful not to break?', 'What is blocking you and your team right now?', 'Where is the team spending time that is not paying off?', 'Which decisions are stuck, and with whom?', 'Who on your team is rising, and who needs help?', 'What do you need from me in the first 90 days?', 'If you had my job, what would you do first?'])}
    <h4>The readout</h4>
    <p>A synthesis with analysis by topic and key findings, read out in groups to everyone I interviewed. At a minimum it ends with next steps toward a stated goal. It may add a high-level direction.</p>
    ${lnk([['/product/internal-stakeholder-interviews/', 'How I run internal stakeholder interviews'], ['/product/30-60-90/', 'How I approach the first 30, 60 and 90 days']])}`,
  team: `
    <h4>Structure</h4>
    ${ul(['The senior directors of product are my leads. A head of design joins them.', 'The heads of technology, analytics and strategy, and marketing are my partners. They and my other peers represent the product direction to their own teams wherever possible.', 'One clear line of communication, through the leads. They run the day-to-day and bring me decisions.', 'I step in directly when a team is in real trouble, and I make time to coach rising leaders.'])}
    <h4>What I expect from a lead</h4>
    ${ul(['Works well with me, without friction.', 'Shows clear alignment and support.', 'Gets results on what I ask.'])}
    <h4>Earning trust in the first 30 days</h4>
    ${ul(['Clarity: to my leads first, then through them to the team.', 'Support on the initiatives that matter most.', 'Bold movement.', 'Continual two-way communication through the chain, with a swift response to feedback.'])}
    <h4>Leveling up</h4>
    ${ul(['By day 30: written expectations for every role, in outputs and outcomes.', 'By day 60: every team member assessed, with one-on-one guidance.', 'By day 90: changes made. Develop, redeploy or hire. The hiring pipeline stays open.'])}
    ${lnk([['/product/', 'How I do product', 'principles, practices and expectations'], ['/product/leader/', 'Leading product teams'], ['/product/leveling-up/', 'Leveling up a team']])}`,
  core: `
    <h4>What I am accountable for</h4>
    <p>The same core targets as the company plan, held jointly with the leaders who own them today. The specific KPIs are named after the stakeholder interviews.</p>
    <h4>How</h4>
    ${ul(['Sarah has been leading product and championing customer experience. She helps through the transition.', 'The existing product team keeps running the core. I join their meetings, a weekly KPI review and working sessions as needed.', 'Remove roadblocks: clear the red tape and the stuck decisions.', 'Simplify: score in-flight work on ROI, then stop, start or re-scope. That is my call to make, and I make it together with my peers.'])}
    ${lnk([['/lendingtree/#roadmap', 'Scoring the roadmap on ROI'], ['/product/principles/measuring/', 'How I measure success']])}`,
  impact: `
    <h4>The rule for every bet</h4>
    ${ul(['A written kill rule and a decision date before it starts.', 'The date fits the bet. Some can be decided quickly. Others need time to reach certainty.', 'Who does the work is decided per bet: an existing team, a small dedicated team, or me building the first version.', 'After day 90 an owner runs each surviving bet, or we stop it.'])}
    <h4>The target</h4>
    <p>$1M+ in profit booked in year one, and the new work running at $1M+ a year. Profit is net of what it costs to build and run.</p>
    <h4>Candidates, not commitments</h4>
    <p>The three named bets are starting points. Other in-flight work, ideas from the team and more of my own compete for the same capacity.</p>
    ${lnk([['/lendingtree/choice/', 'The Power of Choice', 'prototype'], ['/lendingtree/companion/', 'A Companion', 'prototype'], ['/lendingtree/outcomes/', 'Aligned Outcomes', 'prototype: partner API and dashboard'], ['/lendingtree1/', 'The thinking behind them']])}`,
  disruption: `
    <h4>Three independent pods</h4>
    ${ul(['Three people each: a PM, a designer and an engineer, all at principal level.', 'Staffed from inside where someone fits and can be freed up; otherwise hired or contracted.', '100% allocated, and running by day 90. Internally staffed pods can start sooner.', 'Accountable only for their charter. I give them no brief.', 'Each cycle: an open charter, the smallest credible test, an evidence review, and a decision to scale, pivot or stop.'])}
    <h4>The research-led reset</h4>
    ${tbl(['Step', 'When'], [['Stakeholder interviews', 'Month 1'], ['Market research and internal reflection', 'Months 1 to 2'], ['Contextual inquiry with lenders, carriers, partners and shoppers', 'Months 2 to 4'], ['Provisional vision and strategy', 'Month 3, day 90'], ['Synthesis', 'Month 5'], ['Concept design', 'Month 6'], ['Validation', 'Month 7'], ['Go-to-market plan', 'Month 8'], ['Executive phase gate', 'Month 9'], ['Alpha in market', 'Month 12']])}
    <p>I lead this, with a team staffed internally wherever possible. The two hypotheses are there to be invalidated, not defended.</p>
    ${lnk([['/lendingtree/#mcp', 'LendingTree in AI-native channels'], ['/product/contextual-inquiry/', 'Contextual inquiry']])}`,
  time: `
    <h4>What I keep and what I delegate</h4>
    ${tbl(['Part', 'I keep', 'I delegate'], [
      ['Integration', 'The interviews and the readout', 'Scheduling, note capture, follow-ups'],
      ['Team leadership', 'Choosing and coaching the leads; expectations and assessments', 'Day-to-day team management, to the leads'],
      ['Protecting the core', 'The KPI review and roadblocks that need my level', 'Running the core roadmap, to the senior directors, with Sarah’s help in the transition'],
      ['Immediate impact', 'Choosing the bets and the kill or scale calls', 'Build, launch and monitoring, to an owner per bet'],
      ['Disruption', 'Leading the research-led effort', 'Each pod, to its principals'],
    ])}
    <h4>Share of my week</h4>
    ${tbl(['', ...PH], [['General onboarding', '10%', '', '', '', '', ''], ['Integration', '60%', '20%', '', '', '', ''], ['Team leadership', '10%', '20%', '25%', '20%', '25%', '20%'], ['Protecting the core', '10%', '20%', '20%', '15%', '20%', '20%'], ['Immediate impact', '', '15%', '25%', '25%', '', ''], ['Disruption', '', '5%', '10%', '20%', '40%', '50%'], ['Unplanned', '10%', '20%', '20%', '20%', '15%', '10%']])}`,
  outcomes: `${lnk([['/lendingtree/year-one/', 'Outcome cards, the full plan and every milestone']])}`,
};

/* The A() helper writes its own class attribute; fold it into any class the tag already has. */
const fold = (h) => h
  .replace(/class="([^"]*)"\s+class="a ([^"]*)"/g, 'class="$1 a $2"')
  .replace(/class="a ([^"]*)" (style="[^"]*") class="([^"]*)"/g, 'class="$3 a $1" $2');

const RAW = [
  { id: 'thesis', name: 'My first year', title: 'My first year at LendingTree', sub: 'How I will get started, what I will deliver in year one, and where it could go', draw: open },
  { id: 'integration', name: 'Integration', title: 'Integration', sub: 'Two weeks of stakeholder interviews, then a readout', draw: integration, details: D.integration },
  { id: 'team', name: 'Team leadership', title: 'Team leadership', sub: 'A clear chain of command, and a team that keeps getting stronger', draw: team, details: D.team, links: [['/product/', 'How I do product']] },
  { id: 'core', name: 'Protecting the core', title: 'Protecting the core', sub: 'Safe with me, and growing', draw: core, details: D.core },
  { id: 'impact', name: 'Immediate impact', title: 'Immediate impact', sub: 'New profit in year one, from bets that earn their place', draw: impact, details: D.impact, links: [['/lendingtree/choice/', 'The Power of Choice'], ['/lendingtree/companion/', 'A Companion'], ['/lendingtree/outcomes/', 'Aligned Outcomes']] },
  { id: 'disruption', name: 'Disruption', title: 'Disruption', sub: 'Put LendingTree out of business: three pods and a research-led reset', draw: disruption, details: D.disruption },
  { id: 'visiontypes', name: 'Visiontypes', title: 'Visiontypes', sub: 'Where this could go, across the whole customer lifecycle', draw: visiontypes, links: VTS.map((v) => [v.url, v.title]) },
  { id: 'take', name: 'What this will take', title: 'What this will take', sub: 'What the visiontypes assume, and the first version of each', draw: take, details: D.take },
  { id: 'economics', name: 'The economics', title: 'The economics', sub: 'Selling leads against being paid on outcomes', draw: econ, details: D.economics, links: [[MODEL, 'Open the model', 'pri']] },
  { id: 'time', name: 'My time', title: 'My time', sub: 'Balance carefully, delegate everything I can', draw: time, details: D.time },
  { id: 'outcomes', name: 'Year-one outcomes', title: 'Year-one outcomes', sub: 'My commitments', draw: outcomes, details: D.outcomes },
  { id: 'plan', name: 'Year-one plan', title: 'Year-one plan', sub: 'Assumes a January 1 start', draw: plan, details: D.outcomes },
  { id: 'close', name: 'Recap', title: 'The year, in three lines', sub: 'And a look at where it could go', draw: close },
];
export const SLIDES = RAW.map((x) => ({ ...x, draw: fold(x.draw) }));
