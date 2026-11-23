/* Content for /achieve/vision-strategy-v1/. Edit this file to revise the deck; app.js only draws it.
   Each slide has a title, one main drawing (blocks) and optional details that open in a sheet.
   Text supports **bold** only. Block types: row, group, matrix, flow, gantt, qa, table, callout.
   The company vision and strategy answers (questions 1 to 6) are skipped for now; the earlier draft of
   the first two is in git history (commit 0b35f69). */

export const meta = {
  context: 'Achieve DEX: direction and 2027 plan',
  eyebrow: 'Achieve · Rough draft · v1',
  title: 'DEX product direction and 2027 plan',
  author: 'Adam Michaelson',
  intro: 'This is a rough draft of the DEX product direction and a plan for 2027. It skips the company vision and strategy questions (1 to 6), and I will calibrate it after the individual executive stakeholder interviews.',
};

/* The interview questions, in order. 1 to 6 are asked in the interviews and not answered in this deck. */
export const questions = {
  1: 'What is the vision for the company? This should be in terms of why you exist, what the ideal “Utopia” is that the company creates AND the ideal outcome that the company achieves.',
  2: 'What is the strategy of the company? That is, how do we go about achieving the vision? What are the key elements? Are there any elements missing? Is there something we’re doing today that we need to stop doing? Are there things we’re not doing today that we need to be doing?',
  3: 'What are Achieve’s greatest strengths?',
  4: 'What are Achieve’s greatest weaknesses?',
  5: 'What are Achieve’s greatest opportunities?',
  6: 'What are Achieve’s greatest threats?',
  7: 'What is the vision for the DEX product? Tell me what the ideal state looks like? This should be first in terms of outcomes, and second in terms of scope.',
  8: 'What is the strategy for the DEX product? That is, what are the things we should do (in terms of principles, practices, and scope) that will deliver the outcomes? What needs to change about what we’re doing today in order to employ this strategy?',
  9: 'A year from now, what needs to be materially different for you and the rest of the exec team to call it a great year? Where do you see the biggest opportunity or constraint?',
  10: 'Of the outcomes you just named, where should Product lead, and where should it help another team succeed?',
  11: 'Where would you want me to concentrate first? What would you be comfortable slowing down to make room for that?',
  12: 'What do you expect by day 30?',
  13: 'What do you expect by day 60?',
  14: 'What do you expect by day 90?',
  15: 'Which people, dependencies, or decisions will most affect whether I can deliver? Where would you expect me to act independently, and where would you want to be involved?',
};

/* The six milestones in Adam's original words. routed = share of traffic on DEX.
   unassisted = target completion rate without humans. null = no target at that point. */
export const milestones = [
  { day: 30, text: 'MVP defined with specifications, initial designs, and working prototype.', routed: null, unassisted: null },
  { day: 60, text: 'MVP usability / perception tested, integrations acquired and build underway.', routed: null, unassisted: null },
  { day: 90, text: 'MVP calibrated and online with 1% of traffic.', routed: 1, unassisted: null },
  { day: 180, text: '10% traffic; showing at least 10% completion rates without humans.', routed: 10, unassisted: 10 },
  { day: 270, text: '50% traffic; showing at least 25% completion rates without humans.', routed: 50, unassisted: 25 },
  { day: 365, text: '100% traffic; showing at least 50% completion rates without humans.', routed: 100, unassisted: 50 },
];

/* Which months each milestone's bar covers on the 12-month plan (from, to), 1-based and end-exclusive. */
const SPAN = { 30: [1, 2], 60: [2, 3], 90: [3, 4], 180: [4, 7], 270: [7, 10], 365: [10, 13] };

/* The research track: the same steps and timing as the plan on /lendingtree1/, with the people named for Achieve. */
const RESEARCH = [
  { t: 'Stakeholder interviews', d: 'C-level, VP and director leaders, one on one. Synthesized into a leadership vision weighted by role, CEO heaviest.', when: 'Month 1', from: 1, to: 2 },
  { t: 'Market research', d: 'Primary and secondary: opportunities, threats, trends and analogs.', when: 'Months 1–2', from: 1, to: 3 },
  { t: 'Internal reflection', d: 'Sales, support, transactions, partnerships, revenue, costs, architecture, processes and people, read for strengths and weaknesses.', when: 'Months 1–2', from: 1, to: 3 },
  { t: 'Provisional vision and strategy', d: 'An interim direction, roadmap and commitments to carry us to month 12.', when: 'Month 3', from: 3, to: 4, ms: 'Day 90' },
  { t: 'Contextual inquiry', d: 'On-site with customers and the staff who serve them. Paid sessions, surveys and usability studies, with Achieve leaders in the room.', when: 'Months 2–4', from: 2, to: 5 },
  { t: 'Synthesis', d: 'Leaders and I triangulate the findings into a formal analysis and an updated product direction.', when: 'Month 5', from: 5, to: 6 },
  { t: 'Concept design', d: 'A cross-functional team designs solutions to the findings: prototypes, decks and an updated vision and strategy.', when: 'Month 6', from: 6, to: 7 },
  { t: 'Validation', d: 'One-on-one reactions from internal stakeholders and target personas. Calibrate and refine.', when: 'Month 7', from: 7, to: 8 },
  { t: 'Go-to-market plan', d: 'With marketing leadership: how we release, drive and measure the new direction, by milestone.', when: 'Month 8', from: 8, to: 9 },
  { t: 'Phase gate', d: 'The C-team formally commits. No surprises: each member has shaped the plan along the way.', when: 'Month 9', from: 9, to: 10, ms: 'Commit', gate: true },
];

export const slides = [
  { id: 'overview', name: 'Overview', q: [], cover: true },

  {
    id: 'dex-vision', name: 'DEX product vision', q: [7], title: 'DEX product vision',
    sub: 'This is a brainstormed first take. Each additional executive stakeholder interview will help to calibrate this. Research post-start will then be the next calibration.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Ideal outcome', items: ['The vast majority (90%+) of customers require no human touch.'] },
        { type: 'group', title: 'Problem', items: ['Humans are required for engagement / conversion.'] },
        { type: 'group', title: 'Scope', items: ['Conversational AI', 'Third-party data / services', 'Automation'] },
      ] },
      { type: 'flow', caption: 'Where DEX starts, where a completion is counted, and what retention covers', steps: [
        { name: 'Eligible traffic', note: 'Could be offered DEX', zone: 'before' },
        { name: 'Routed to DEX', note: 'DEX starts here', zone: 'onboard', mark: 'Start' },
        { name: 'Assessment and plan', note: 'Qualification, debts, expectations', zone: 'onboard' },
        { name: 'Agreement', note: 'Consents and signature', zone: 'onboard' },
        { name: 'First deposit clears', note: 'A DEX completion', zone: 'done', mark: 'Completion' },
        { name: 'Active at day 90', note: 'Still depositing', zone: 'retain', mark: 'Retention' },
        { name: 'First settlement', note: 'First debt resolved', zone: 'retain' },
        { name: 'Remaining settlements', note: 'Each enrolled debt', zone: 'retain' },
        { name: 'Graduation', note: 'All enrolled debt resolved', zone: 'after' },
      ] },
      { type: 'table', title: 'KPIs', details: 'dex-vision', head: ['Pillar', 'KPI'], rows: [
        ['Solution', 'Volume completion with 0 human touch'],
        ['Quality', 'NPS'],
        ['Adoption', '% completions with 0 human touch'],
        ['Economics', 'Profit per customer; completion volume'],
      ] },
    ],
    inlineDetails: true,
    details: [
      { type: 'group', title: 'DEX completion', items: [
        { t: 'Definition', d: 'A funded enrollment: the agreement is signed and the first program deposit has cleared.' },
        { t: 'Why not the signature', d: 'A signature alone rewards a click. A cleared deposit shows real commitment and is visible within weeks.' },
        { t: 'Retention', d: 'Tracked as separate milestones (active at day 90, first settlement, remaining settlements) and never folded into completion.' },
      ] },
      { type: 'group', title: 'Staff intervention', items: [
        { t: 'Definition', d: 'Any staff interaction with the customer between the start of DEX and completion, including help the customer asked for.' },
        { t: 'Reported in three groups', d: 'Requested by the customer. Staff outreach to bring someone back. Required by process.' },
      ] },
      { type: 'table', title: 'The three rates', head: ['Rate', 'Numerator', 'Denominator', 'Why it is there'], rows: [
        ['Routing share', 'Eligible customers routed to DEX', 'All eligible customers', 'How much traffic DEX is trusted with.'],
        ['No-intervention share', 'DEX completions with no staff interaction', 'All DEX completions', 'The headline target: 10%, 25%, 50%, then 90%.'],
        ['Overall completion', 'Completions on any path, assisted or not', 'All eligible customers', 'Guardrail. The no-intervention share must not rise because fewer people finish.'],
      ] },
    ],
  },

  {
    id: 'dex-strategy', name: 'DEX product strategy', q: [8], title: 'DEX product strategy',
    sub: 'This is a brainstormed first take. Each additional executive stakeholder interview will help to calibrate this. Research post-start will then be the next calibration.',
    blocks: [
      { type: 'matrix', cols: [
        { name: 'Solution',
          problem: 'People don’t engage with the DEX.',
          policy: 'Employ best practices for engagement (internally learned, industry trends, innovation).',
          action: 'Research-backed tactics, iterative experimentation.',
          kpis: 'Volume completion with 0 human touch.',
          targets: ['50% by end of 2027', '80% by end of 2028', '90% by end of 2029'] },
        { name: 'Quality',
          problem: 'People don’t like the experience.',
          policy: 'The best UI is no UI; delight.',
          action: 'Integrations, reduction/consolidation, progressive disclosure, usability / perception testing calibrations.',
          kpis: 'NPS.',
          targets: ['50 for mid-funnel fall-offs', '70 for graduates'] },
        { name: 'Adoption',
          problem: 'People bail out OR require humans to bring them back in.',
          policy: 'Make it rewarding.',
          action: 'Gamification, rewards.',
          kpis: 'Conversion by milestone (without humans), overall conversion (without humans).',
          targets: ['50% from start to agreement', '50% from agreement to completion', '75% from completion to graduation'] },
        { name: 'Economics',
          problem: 'Non-human costs are excessive.',
          policy: 'Maximize what we can do in-house / without a service provider, get volume discounts, optimize service location in funnel.',
          action: 'Integrations, in-house solutions.',
          kpis: 'Profit per completion without humans.',
          targets: ['20% contribution margin per no-human-touch customer by end of 2027', '25% contribution margin per no-human-touch customer by end of 2028', '30% contribution margin per no-human-touch customer by end of 2029'] },
      ] },
    ],
  },

  {
    id: 'milestones', name: 'Milestones and research', q: [12, 13, 14], title: 'What do I expect by each milestone?',
    sub: 'The action in this plan is hypothesis-based and influenced by the executive stakeholder interviews. It will eventually be calibrated by the contextual research going on in parallel.',
    blocks: [
      { type: 'gantt', title: 'Two tracks, one plan', details: 'milestones', months: 12, lanes: [
        { name: 'Immediate impact', note: 'While we will do deep research to get empathy, context, and insights toward the best possible solution, we will start immediately with some strong hypotheses and drive for fast ROI in the form of learnings and KPIs.', rows: milestones.map((m) => ({ t: `Day ${m.day}`, d: m.text, from: SPAN[m.day][0], to: SPAN[m.day][1], ms: `Day ${m.day}` })) },
        { name: 'Version 1', note: 'In parallel with the immediate impact through MVP and iterative learnings, we’ll conduct deep research (market, contextual, introspection, etc.) toward empathy, context, and insights that will become our foundation for a full version 1 and beyond.', numbered: true, rows: RESEARCH },
      ] },
    ],
    inlineDetails: true,
    details: [
      { type: 'table', title: 'Contextual research, step by step', head: ['Step', 'What happens', 'When'], rows: RESEARCH.map((r) => [r.t, r.d, r.when]) },
    ],
  },

  {
    id: 'other', name: 'Other questions', q: [9, 10, 11, 15], title: 'Other questions',
    blocks: [
      { type: 'qa', items: [
        { q: 9, t: 'By end of 2027', d: '50% of completions required no human intervention; profitable DEX P&L.' },
        { q: 9, t: 'Biggest opportunity', d: 'Get V1 into place.' },
        { q: 9, t: 'Biggest constraint', d: 'Time required for iterations (since completion can take months).' },
        { q: 10, t: 'Where Product leads', d: 'Product owns all of the 2027 outcomes, but will need to coordinate with other teams.' },
        { q: 11, t: 'What comes first', d: 'Get MVP (full funnel) online with 1% traffic.' },
        { q: 15, t: 'Dependencies', d: 'Budget; allowance for turning on fully-automated (stakeholder alignment).' },
        { q: 15, t: 'Independence', d: 'I’ll be independent on everything, but I must get alignment/approval from all C-level, execs, and department heads.' },
      ] },
    ],
    details: [
      { type: 'table', head: ['Early signals', 'Outcomes that require mature cohorts'], rows: [
        ['Completion, no-intervention share, overall completion', 'Share of enrolled debt resolved'],
        ['Deposit consistency and 90-day cancellations', 'Net benefit after fees'],
        ['Complaints, NPS, cost per completion', 'Graduation rate and what happens afterward'],
      ] },
      { type: 'callout', tag: 'Needs definition', text: '**A year from now and the end of 2027.** The end of 2027 matches day 365 only with a start on January 1. Each month later moves day 365 a month into 2028. I would commit to day counts.' },
      { type: 'callout', tag: 'Needs definition', text: '**Profitable.** Revenue arrives when debts settle, so cohorts enrolled in 2027 will not have paid back in cash by December. I propose: projected contribution per DEX enrollment is positive and better than the staff-led path, using Achieve’s own cohort curves, with realized cash reported beside it.' },
      { type: 'row', blocks: [
        { type: 'group', title: 'Product leads', items: ['The outcome definitions and targets.', 'The roadmap and what comes first.', 'Experiment design and the reading of results.', 'The recommendation to expand, hold or pause.'] },
        { type: 'group', title: 'Another team leads, Product supports', wide: true, items: [
          { t: 'Engineering', d: 'Architecture, build and reliability.' },
          { t: 'Design', d: 'The experience, and usability and perception research.' },
          { t: 'Operations', d: 'Staff handoffs, staffing and exceptions.' },
          { t: 'Marketing', d: 'Acquisition, channels and what customers are promised.' },
          { t: 'Data', d: 'Measurement and the validity of experiments.' },
          { t: 'Finance', d: 'The P&L model and the definition of profitable.' },
          { t: 'Risk and Compliance', d: 'Eligibility, disclosures and consent, with authority to stop.' },
        ] },
      ] },
      { type: 'callout', tag: 'Needs definition', text: '**Owning the DEX P&L.** Product can be accountable for the result, but it directly controls only the roadmap and the experiments. Engineering capacity, marketing spend, staffing and vendor contracts sit elsewhere. I propose Product is accountable for DEX contribution margin, with a named budget and agreed capacity from each team.' },
      { type: 'row', blocks: [
        { type: 'group', title: 'In the MVP', items: ['Assessment and qualification.', 'Plan and honest expectations.', 'Agreement and consents.', 'Bank link and first deposit.', 'A handoff to staff at every step.', 'Measurement with a control group.', 'One segment and one channel.'] },
        { type: 'group', title: 'Can wait', items: ['Retention features beyond the first deposit.', 'Messaging, partner and embedded channels.', 'Edge cases in eligibility.', 'Rewards and gamification.', 'Replacing bought components with in-house builds.'] },
        { type: 'group', title: 'Could slow down to free capacity', items: ['Incremental tuning of the staff-led funnel.', 'New channel launches.', 'New post-graduation product work.', 'These are guesses. Which work would you actually slow down?'] },
      ] },
      { type: 'row', blocks: [
        { type: 'group', title: 'I decide', items: ['The roadmap and priorities within the mandate.', 'Experiments within the approved traffic share.', 'Experience and wording within approved disclosures.', 'Vendor choices within budget.', 'Pausing or rolling back DEX, at any time.'] },
        { type: 'group', title: 'I consult', items: ['Engineering on architecture and capacity.', 'Operations on handoffs and staffing.', 'Marketing on traffic and promises.', 'Data and Finance on measurement and the model.', 'Risk and Compliance on eligibility, disclosures and consent.'] },
        { type: 'group', title: 'Explicit approval', items: [
          { t: 'Budget', d: 'The President of Debt Relief, with Finance.' },
          { t: 'Launch at 1%', d: 'The President of Debt Relief, with Risk and Compliance sign-off.' },
          { t: 'Each traffic expansion', d: 'A named leadership group, against gates agreed in advance.' },
          { t: 'Eligibility changes', d: 'Risk and Compliance.' },
        ] },
      ] },
    ],
  },

  {
    id: 'right-thing', name: 'Do the right thing', q: [], title: 'Do the right thing',
    sub: 'For those who come to us, are we ensuring that what we offer is the right thing and when we do help them, are they better off?',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Solution fit', plain: true, items: [
          'When people come to us, we have a highly tuned process for identifying the best possible solution, which may be debt relief, a consolidation loan, credit counseling, bankruptcy, or something else.',
          'We leverage partnerships where they need something we don’t natively provide.',
          'But where they advance with us, we have high certainty and can demonstrate through any audit that we gathered the right information and made a sound recommendation.',
          'Furthermore, we actively block people from going down the path of our products (or any product) if they don’t match.',
        ] },
        { type: 'group', title: 'Are they better off?', plain: true, items: [
          'We proactively survey and gather data to determine the welfare of our customers at every stage of the process.',
          'Our objective is to ensure that everyone we touch is better off for having worked with us.',
        ], note: 'Still to define: the exact data, measures, and targets.' },
      ] },
    ],
  },
];
