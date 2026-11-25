/* Content and drawings for /lendingtree/getting-started/. One slide per section of the video.
   Each slide: a title, a one-line subtitle, one drawing, optional rail links and a Details sheet.
   Motion: anything with class "a" builds in when the slide is shown, after --d seconds. Variants: gx (grows from the left),
   gy (grows from the bottom), drop (lands from above), fade, and SVG paths with class "ln" (drawn along their length).
   Assumes a January 1, 2027 start. Roles are used in place of names, except Sarah's. */

const A = (d, cls = '') => `class="a ${cls}" style="--d:${d}"`;
const VT_A = '/lendingtree/visiontypes/assistant/';
const VT_B = '/lendingtree/visiontypes/lifecycle/';

/* ------------------------------------------------------------------ 1 open */
const open = `
<div class="th">
  <div class="th3">
    <div ${A(1.0, 'drop')}><b>Protect the core</b><small>Core targets, partner with Sarah</small></div>
    <div ${A(1.5, 'drop')}><b>Deliver new profit</b><small>$1M+ in year one</small></div>
    <div ${A(2.0, 'drop new')}><b>Disrupt ourselves</b><small>Three pods + research-led reset</small></div>
  </div>
  <div class="base a gx" style="--d:.2"><span>Raise the bar</span><i aria-hidden="true"></i><span>Learn fast</span><i aria-hidden="true"></i><span>Lead the team</span></div>
</div>`;

/* ----------------------------------------------------------- 2 integration */
/* Ten working days, January 4 to 15. Each entry is that day's interviews: 6 = 60 minutes, 3 = 30 minutes. */
const DAYS = [[6, 6, 6, 3], [6, 6, 3], [6, 6, 3], [6, 3, 3], [6, 3], [6, 6, 3], [6, 3, 3], [6, 6, 3], [6, 3], [3, 3]];
const DOW = ['M', 'T', 'W', 'T', 'F'];
let dn = 0;
const cal = DAYS.map((day, i) => `<li${i === 5 ? ' class="wk"' : ''}><span class="dots">${day.map((m) => `<i ${A((0.9 + (dn++) * 0.085).toFixed(2), 'pop' + (m === 6 ? ' big' : ''))}></i>`).join('')}</span><b>${DOW[i % 5]}</b>${i % 5 === 0 ? `<small>Jan ${i === 0 ? 4 : 11}</small>` : ''}</li>`).join('');
const integration = `
<div class="intg">
  <div class="whow">
    <ul class="who">
      <li ${A(0.2)}>C-team</li><li ${A(0.35)}>VPs</li><li ${A(0.5)}>Direct reports</li>
    </ul>
    <svg class="brace a fade" style="--d:.6" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true"><path d="M2 1C9 1 10 6 10 13V39C10 46 11 50 18 50C11 50 10 54 10 61V87C10 94 9 99 2 99"/></svg>
  </div>
  <span class="arrow a gx" style="--d:.7"></span>
  <div class="calw">
    <p class="count a fade" style="--d:.8"><b data-count="${dn}" data-at="0.9" data-dur="${(dn * 0.085).toFixed(1)}" data-final="20 to 30">20 to 30</b> interviews in two weeks</p>
    <ol class="cal">${cal}</ol>
    <p class="key a fade" style="--d:.8"><i class="big"></i>60 minutes<i></i>30 minutes<span>Charlotte · Seattle · Denver · Zoom</span></p>
  </div>
  <span class="arrow a gx" style="--d:${(1.1 + dn * 0.085).toFixed(2)}"></span>
  <div class="out a" style="--d:${(1.5 + dn * 0.085).toFixed(2)}"><em>January 15</em><b>Synthesis and readout</b><small>Topics, key findings, next steps</small></div>
</div>`;

/* ------------------------------------------------------------------ 3 team */
const box = (x, y, w, h, t, cls, d, sub) => `<g ${A(d)}><rect class="bx ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/><text class="bt ${cls}" x="${x + w / 2}" y="${y + h / 2 + (sub ? -3 : 5)}">${t}</text>${sub ? `<text class="bs ${cls}" x="${x + w / 2}" y="${y + h / 2 + 15}">${sub}</text>` : ''}</g>`;
const LEADS = [300, 600, 900];
const teams = LEADS.map((cx, k) => [-74, 0, 74].map((dx, j) => `<rect ${A((2.0 + k * 0.15 + j * 0.05).toFixed(2))} class="tm${k === 2 ? ' hire' : ''}" x="${cx + dx - 31}" y="318" width="62" height="38" rx="7"/>`).join('')).join('');
const team = `
<svg class="org" viewBox="0 0 1200 410" role="img" aria-label="Chain of command: the CPO, three leads and their teams, with the head of technology, Sarah and the head of marketing as partners">
  <defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#6cc3f5" stroke-width="1.6"/></marker></defs>
  <path class="ln rule" ${A(0.9)} pathLength="1" d="M600 78V124M300 124H900M300 124V170M600 124V170M900 124V170"/>
  <path class="ln rule" ${A(1.8)} pathLength="1" d="M300 234V276M226 276H374M226 276V318M300 276V318M374 276V318M600 234V276M526 276H674M526 276V318M600 276V318M674 276V318"/>
  <path class="ln rule dsh" ${A(2.1)} d="M900 234V276M826 276H974M826 276V318M900 276V318M974 276V318"/>
  <path class="ln acc" ${A(0.6)} pathLength="1" d="M320 44H500"/>
  <text class="lb acc" ${A(0.7)} x="410" y="34">Partner</text>
  ${box(100, 12, 220, 64, 'Head of technology', 'dk', 0.5)}
  <path class="ln acc" ${A(0.75)} pathLength="1" d="M700 44H800M800 27V61M800 27H836M800 61H836"/>
  <text class="lb acc" ${A(0.85)} x="750" y="34">Partners</text>
  ${box(836, 10, 304, 32, 'Sarah · Analytics and strategy', 'dk sm', 0.9)}
  ${box(836, 46, 304, 32, 'Head of marketing', 'dk sm', 1.0)}
  ${box(500, 12, 200, 66, 'CPO', 'wh', 0.2)}
  ${box(185, 170, 230, 64, 'Senior director', 'dk', 1.2, 'Product')}
  ${box(485, 170, 230, 64, 'Senior director', 'dk', 1.35, 'Product')}
  ${box(785, 170, 230, 64, 'Head of design', 'hire', 1.5, 'To hire')}
  ${teams}
  <text class="lb" ${A(2.5)} x="362" y="114">Clarity down, feedback up</text>
  <circle class="pulse dn" cx="600" cy="80" r="4"/><circle class="pulse up" cx="600" cy="80" r="4"/>
  <path class="skip" ${A(3.2, 'fade')} d="M540 78C470 96 450 130 450 176V330" marker-end="url(#ah)"/>
  <path class="skip" ${A(3.6, 'fade')} d="M660 78C730 96 750 130 750 176V330" marker-end="url(#ah)"/>
  <text class="lb acc" ${A(3.3)} x="450" y="384">When a team is in trouble</text>
  <text class="lb acc" ${A(3.7)} x="750" y="384">Coaching rising leaders</text>
</svg>
<ol class="trk t3">
  <li class="on link a" style="--d:4.2"><div class="st"><em>By day 30</em><b>Set expectations</b><small>Outputs and outcomes for every role</small></div></li>
  <li class="on link a" style="--d:4.5"><div class="st"><em>By day 60</em><b>Assess</b><small>Every team member, one on one</small></div></li>
  <li class="on link a" style="--d:4.8"><div class="st"><em>By day 90</em><b>Act</b><small>Develop, redeploy or hire</small></div></li>
</ol>`;

/* ------------------------------------------------------------------ 4 core */
const QX = [80, 350, 620, 890, 1160];
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
      <li ${A(0.35)}>The Power of Choice</li>
      <li ${A(0.5)}>A Companion</li>
      <li ${A(0.65)}>Aligned Outcomes</li>
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
    <text ${A(4.4)} class="big" x="828" y="96" text-anchor="start"><tspan data-count="1" data-at="4.4" data-dur="0.6" data-final="$1M+">$1M+</tspan></text>
    <text ${A(4.5)} class="lb" x="829" y="122" text-anchor="start">profit, year one</text>
    <text ${A(2.6)} class="lb sm" x="${BETS[3].x}" y="${BETS[3].y + 28}">Decision</text>
    <text ${A(2.5)} class="lb sm" x="${BETS[2].x + 44}" y="${BETS[2].y + 5}" text-anchor="start">Stopped</text>
  </svg>
</div>`;

/* ------------------------------------------------------------ 6 disruption */
const M0 = 250, MW = (1170 - 250) / 12, mx = (m) => M0 + m * MW; // m = months from January 1
const PODS = [{ n: 'Pod A', y: 108, s: 0.7 }, { n: 'Pod B', y: 154, s: 1.6 }, { n: 'Pod C', y: 200, s: 2.6 }];
const podRow = (p, k) => {
  let out = `<text class="lb wh" ${A(0.4 + k * 0.5)} x="18" y="${p.y + 5}" text-anchor="start">${p.n}</text>`;
  out += [0, 1, 2].map((j) => `<circle ${A((0.5 + k * 0.5 + j * 0.06).toFixed(2), 'pop')} class="ppl" cx="${96 + j * 20}" cy="${p.y}" r="6"/>`).join('');
  out += `<path class="ln pod" ${A(0.9 + k * 0.5)} pathLength="1" d="M${mx(p.s)} ${p.y}H1170"/>`;
  let i = 0;
  for (let m = p.s; m <= 12.01; m += 0.75, i++) {
    const x = mx(m), d = (1.0 + k * 0.5 + i * 0.07).toFixed(2);
    out += i % 4 === 3 ? `<g ${A(d, 'pop')}>${dia(x, p.y, 'go')}</g>` : `<circle ${A(d, 'pop')} class="stn${i % 4 === 0 ? ' open' : ''}" cx="${x}" cy="${p.y}" r="5.5"/>`;
  }
  return out;
};
const RS = [['Stakeholder interviews', 0.5, -1], ['Market research', 1.5, 1], ['Provisional vision', 3, -1], ['Contextual inquiry', 4, 1], ['Synthesis', 5, -1], ['Concept design', 6, 1], ['Validation', 7, -1], ['Go-to-market', 8, 1]];
const disruption = `
<svg class="dis" viewBox="0 0 1200 470" role="img" aria-label="Three independent pods running repeating cycles through the year, and a research-led reset that reaches a phase gate in month nine and an alpha in month twelve">
  ${Array.from({ length: 12 }, (_, i) => `<text class="lb mo" x="${mx(i + 0.5)}" y="26">${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</text>`).join('')}
  <path class="axis" d="M${M0} 38H1170"/>
  <path class="tick mk" d="M${mx(3)} 38V44M${mx(3)} 98V224M${mx(3)} 290V400"/><text class="lb acc sm" x="${mx(3)}" y="62">Day 90</text>
  <text class="hd" ${A(0.2)} x="18" y="66" text-anchor="start">Three independent pods</text>
  <text class="lb" ${A(0.3)} x="18" y="88" text-anchor="start">PM · Designer · Engineer, principal level. No brief from me. They eat what they kill.</text>
  ${PODS.map(podRow).join('')}
  <g ${A(2.6, 'fade')}>
    <circle class="stn open" cx="${M0 + 6}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 20}" y="251" text-anchor="start">Open charter</text>
    <circle class="stn" cx="${M0 + 136}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 150}" y="251" text-anchor="start">Smallest test</text>
    <circle class="stn" cx="${M0 + 266}" cy="246" r="5.5"/><text class="lb sm" x="${M0 + 280}" y="251" text-anchor="start">Evidence review</text>
    ${dia(M0 + 420, 246, 'go')}<text class="lb sm" x="${M0 + 436}" y="251" text-anchor="start">Decision: scale, pivot or stop. Then again.</text>
  </g>
  <text class="hd" ${A(3.0)} x="18" y="300" text-anchor="start">Research-led reset</text>
  <text class="lb" ${A(3.0)} x="18" y="320" text-anchor="start">Led by me</text>
  <path class="ln res" ${A(3.2)} pathLength="1" d="M${M0} 344H${mx(8.5) - 12}"/>
  <path class="ln res2" ${A(4.9)} pathLength="1" d="M${mx(8.5) + 12} 344H${mx(12) - 10}"/>
  ${RS.map((r, i) => `<g ${A((3.3 + i * 0.18).toFixed(2), 'pop')}><circle class="stn res" cx="${mx(r[1])}" cy="344" r="6"/><text class="lb sm${r[0] === 'Provisional vision' ? ' wh' : ''}" x="${mx(r[1])}" y="${r[2] < 0 ? 326 : 370}">${r[0]}</text></g>`).join('')}
  <g ${A(4.8, 'pop')}>${dia(mx(8.5), 344, 'gate')}<text class="lb wh" x="${mx(8.5)}" y="322">Phase gate</text></g>
  <g ${A(5.4, 'pop')}><circle class="goal" cx="${mx(12) - 2}" cy="344" r="10"/><text class="lb wh" x="${mx(12)}" y="322" text-anchor="end">Alpha in market</text></g>
  <path class="skip" ${A(4.2, 'fade')} d="M${M0 + 30} 418V362" marker-end="url(#ah)"/>
  <text class="lb acc" ${A(4.0)} x="18" y="436" text-anchor="start">Hypotheses to invalidate</text>
  ${['Bank connectivity through MCP', 'Assistants as underwriting intelligence'].map((t, i) => { const w = [236, 300][i], x = [250, 498][i]; return `<g ${A((4.1 + i * 0.15).toFixed(2), 'drop')}><rect class="chip" x="${x}" y="420" width="${w}" height="30" rx="15"/><text class="lb" x="${x + w / 2}" y="440">${t}</text></g>`; }).join('')}
</svg>`;

/* ----------------------------------------------------------- 7 visiontypes */
const LIFE = ['Lead', 'MQL', 'Application', 'Offers and quotes', 'Review and selection', 'Funding or binding', 'Servicing', 'Regular engagement', 'Renewal or upgrade'];
const frames = (url, label, sub, d) => `
  <div class="vt a" style="--d:${d}">
    <h3>${label}</h3><p>${sub}</p>
    <div class="fr">
      <div class="desk"><i></i><div class="scr"><iframe title="${label}, desktop" data-src="${url}?embed=1" loading="lazy" tabindex="-1"></iframe></div></div>
      <div class="phone"><div class="scr"><iframe title="${label}, mobile" data-src="${url}?embed=1&path=insurance" loading="lazy" tabindex="-1"></iframe></div></div>
    </div>
  </div>`;
const visiontypes = `
<div class="vts">
  ${frames(VT_A, 'A. Inside ChatGPT', 'It could as easily be Muse, Grok, Instinct or another assistant.', 0.2)}
  ${frames(VT_B, 'B. LendingTree website and app', 'The same journey on LendingTree’s own surfaces.', 0.5)}
</div>
<ol class="life a" style="--d:.9">${LIFE.map((s, i) => `<li style="--k:${i}"><span>${s}</span></li>`).join('')}</ol>`;

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
  ${card(0.2, 'Integration', '<span data-count="30" data-at="0.3" data-final="20–30">20–30</span>', 'Leaders interviewed; synthesis read out to all', 'January 15')}
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
  <div class="th sm">
    <div class="th3">
      <div ${A(0.8, 'drop')}><b>Protect the core</b><small class="fg">≥ Plan</small></div>
      <div ${A(1.2, 'drop')}><b>Deliver new profit</b><small class="fg">$1M+</small></div>
      <div class="a drop new" style="--d:1.6"><b>Disrupt ourselves</b><small class="fg">3 pods · M9 gate · M12 alpha</small></div>
    </div>
    <div class="base a gx" style="--d:.2"><span>Raise the bar</span><i aria-hidden="true"></i><span>Learn fast</span><i aria-hidden="true"></i><span>Lead the team</span></div>
  </div>
  <div class="need">
    <h3 ${A(2.2)}>What I need</h3>
    <ol>
      <li ${A(2.5)}>An executive assistant or chief of staff</li>
      <li ${A(2.8)}>A head of design hire</li>
      <li ${A(3.1)}>Nine principal-level people for the three pods</li>
      <li ${A(3.4)}>A team for the research-led effort, staffed internally</li>
    </ol>
  </div>
  <div class="inv a" style="--d:4.0">
    <p>See where this could go.</p>
    <a class="btn pri" href="${VT_A}">Open visiontype A</a><a class="btn pri" href="${VT_B}">Open visiontype B</a>
  </div>
</div>`;

/* -------------------------------------------------------------- details */
const ul = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join('')}</ul>`;
const ol = (xs) => `<ol>${xs.map((x) => `<li>${x}</li>`).join('')}</ol>`;
const tbl = (head, rows) => `<div class="hs"><table><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
const lnk = (xs) => `<ul class="lk">${xs.map((x) => `<li><a href="${x[0]}">${x[1]}</a>${x[2] ? ` <span>${x[2]}</span>` : ''}</li>`).join('')}</ul>`;

const D = {
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
    ${ul(['The senior directors of product are my leads. A head of design joins them.', 'The head of technology, Sarah and the head of marketing are my partners. They and my other peers represent the product direction to their own teams wherever possible.', 'One clear line of communication, through the leads. They run the day-to-day and bring me decisions.', 'I step in directly when a team is in real trouble, and I make time to coach rising leaders.'])}
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
  { id: 'thesis', name: 'My first year', title: 'Protect the core. Deliver new profit. Disrupt ourselves.', sub: 'My first year at LendingTree', draw: open },
  { id: 'integration', name: 'Integration', title: 'Integration', sub: 'Two weeks of stakeholder interviews, then a readout', draw: integration, details: D.integration },
  { id: 'team', name: 'Team leadership', title: 'Team leadership', sub: 'A clear chain of command, and a team that keeps getting stronger', draw: team, details: D.team, links: [['/product/', 'How I do product']] },
  { id: 'core', name: 'Protecting the core', title: 'Protecting the core', sub: 'Safe with me, and growing', draw: core, details: D.core },
  { id: 'impact', name: 'Immediate impact', title: 'Immediate impact', sub: 'New profit in year one, from bets that earn their place', draw: impact, details: D.impact, links: [['/lendingtree/choice/', 'The Power of Choice'], ['/lendingtree/companion/', 'A Companion'], ['/lendingtree/outcomes/', 'Aligned Outcomes']] },
  { id: 'disruption', name: 'Disruption', title: 'Disruption', sub: 'Put LendingTree out of business: three pods and a research-led reset', draw: disruption, details: D.disruption },
  { id: 'visiontypes', name: 'Visiontypes', title: 'Visiontypes', sub: 'Where this could go, across the whole customer lifecycle', draw: visiontypes, links: [[VT_A, 'Open visiontype A'], [VT_B, 'Open visiontype B']] },
  { id: 'time', name: 'My time', title: 'My time', sub: 'Balance carefully, delegate everything I can', draw: time, details: D.time },
  { id: 'outcomes', name: 'Year-one outcomes', title: 'Year-one outcomes', sub: 'What I will commit to', draw: outcomes, details: D.outcomes },
  { id: 'plan', name: 'Year-one plan', title: 'Year-one plan', sub: 'Assumes a January 1 start', draw: plan, details: D.outcomes },
  { id: 'close', name: 'What I need', title: 'What I need', sub: 'Four asks, and an invitation', draw: close },
];
export const SLIDES = RAW.map((x) => ({ ...x, draw: fold(x.draw) }));
