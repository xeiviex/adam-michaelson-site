/* Content for /achieve/vision-strategy-v1/. Edit this file to revise the deck; app.js only draws it.
   Each slide has a title, one main drawing (blocks) and optional details that open in a sheet.
   Text supports **bold** only. Block types: row, group, matrix, flow, tracks, timeline, table, callout, asks.
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

export const slides = [
  { id: 'overview', name: 'Overview', q: [], cover: true },

  {
    id: 'dex-vision', name: 'DEX product vision', q: [7], title: 'DEX product vision',
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
    id: 'research', name: 'Research in parallel', q: [], title: 'Research in parallel',
    sub: 'In addition to the immediate start of automating DEX, we will engage in contextual research.',
    blocks: [
      { type: 'tracks', tracks: [
        { name: 'Build', note: 'Starts on day one, from hypotheses and the executive interviews', steps: ['Define the MVP', 'Test and build', 'Live at 1%', 'Expand on evidence'] },
        { name: 'Learn', note: 'Contextual research with customers and staff, in parallel', steps: ['Go to the field', 'Watch, then ask', 'Test assumptions', 'Synthesize'] },
      ], link: 'What the research finds recalibrates the plan' },
      { type: 'row', blocks: [
        { type: 'group', title: 'Go to the field', items: ['Sit with customers and with the staff who serve them, where the work actually happens.'] },
        { type: 'group', title: 'Watch, then ask', items: ['See how people really make decisions about debt before asking them to explain it.'] },
        { type: 'group', title: 'Test assumptions', items: ['Bring the DEX hypotheses and try to prove them wrong.'] },
        { type: 'group', title: 'Invest where evidence points', items: ['Turn what we saw into patterns, then change the roadmap to match.'] },
      ] },
    ],
    details: [
      { type: 'group', title: 'To be filled in', items: [
        { t: 'Who we visit', d: 'Placeholder. For example: people considering debt relief, new enrollees, people who left early, graduates, and the staff who serve each of them.' },
        { t: 'How many and how often', d: 'Placeholder. Number of sessions per round and the cadence of rounds.' },
        { t: 'How sessions run', d: 'Placeholder. Where we observe, what we record, and who from the team attends.' },
        { t: 'How findings are shared', d: 'Placeholder. The synthesis format, and when each round feeds the roadmap.' },
      ] },
    ],
  },

  {
    id: 'better-off', name: 'Are people better off?', q: [], title: 'Are people better off?',
    sub: 'After fees and setbacks, including people who leave early.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'The test', items: [
          { t: 'Net benefit per enrolled customer', d: 'Enrolled debt resolved, minus settlements paid, fees, and growth in unsettled balances.' },
          { t: 'Who is counted', d: 'Everyone who enrolled, including early exits.' },
          { t: 'Compared with', d: 'Their position at enrollment, and a control group on the staff-led path.' },
        ] },
        { type: 'group', title: 'Early signals, in weeks to months', items: ['Deposit consistency across the first three deposits.', 'Cancellations in the first 90 days, with reasons.', 'Complaints and refund requests.', 'Time to first settlement.', 'Creditor legal action.'] },
        { type: 'group', title: 'Mature outcomes, in years', items: ['Share of enrolled debt resolved.', 'Net benefit after fees.', 'Share of exits who leave worse off.', 'Graduation rate.', 'Financial position after graduation.'] },
      ] },
    ],
    details: [
      { type: 'table', title: 'What would make us change course', head: ['If the evidence shows', 'Then'], rows: [
        ['A segment whose early signals predict a net loss for the customer', 'Change eligibility for that segment, or route it to another path.'],
        ['DEX cohorts trailing the control group on early signals by more than an agreed margin', 'Revise the experience before adding traffic.'],
        ['More DEX customers leaving worse off, complaints above an agreed level, or overall completion below the control', 'Pause expansion.'],
      ] },
      { type: 'callout', tag: 'Needs definition', text: 'The margins and levels are set with Risk, Compliance and Finance before the 1% launch, so the decision rule exists before the results do.' },
    ],
  },

  {
    id: 'year', name: 'A great year', q: [9], title: 'What makes 2027 a great year?',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'By end of 2027', items: ['50% of completions required no human intervention.', 'Profitable DEX P&L.'] },
        { type: 'group', title: 'Biggest opportunity', items: ['Get V1 into place.'] },
        { type: 'group', title: 'Biggest constraint', items: ['Time required for iterations (since completion can take months).'] },
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
    ],
  },

  {
    id: 'product-leads', name: 'Where Product leads', q: [10], title: 'Where should Product lead?',
    blocks: [
      { type: 'group', items: ['Product owns all of the 2027 outcomes, but will need to coordinate with other teams.'] },
    ],
    details: [
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
    ],
  },

  {
    id: 'first', name: 'What comes first', q: [11], title: 'What comes first?',
    blocks: [
      { type: 'group', items: ['Get MVP (full funnel) online with 1% traffic.'] },
    ],
    details: [
      { type: 'row', blocks: [
        { type: 'group', title: 'In the MVP', items: ['Assessment and qualification.', 'Plan and honest expectations.', 'Agreement and consents.', 'Bank link and first deposit.', 'A handoff to staff at every step.', 'Measurement with a control group.', 'One segment and one channel.'] },
        { type: 'group', title: 'Can wait', items: ['Retention features beyond the first deposit.', 'Messaging, partner and embedded channels.', 'Edge cases in eligibility.', 'Rewards and gamification.', 'Replacing bought components with in-house builds.'] },
        { type: 'group', title: 'Could slow down to free capacity', items: ['Incremental tuning of the staff-led funnel.', 'New channel launches.', 'New post-graduation product work.', 'These are guesses. Which work would you actually slow down?'] },
      ] },
    ],
  },

  {
    id: 'milestones', name: 'Milestones', q: [12, 13, 14], title: 'What do I expect by each milestone?',
    sub: 'The action in this plan is hypothesis-based and influenced by the executive stakeholder interviews. It will eventually be calibrated by the contextual research going on in parallel.',
    blocks: [
      { type: 'timeline', routedLabel: 'Traffic', unassistedLabel: 'Completion rate without humans' },
    ],
  },

  {
    id: 'decisions', name: 'Decisions and dependencies', q: [15], title: 'Decisions and dependencies',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Dependencies', items: ['Budget.', 'Allowance for turning on fully-automated (stakeholder alignment).'] },
        { type: 'group', title: 'Independence', items: ['I’ll be independent on everything, but I must get alignment/approval from all C-level, execs, and department heads.'] },
      ] },
    ],
    details: [
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
    id: 'react', name: 'What to react to', q: [], title: 'What I want you to react to',
    sub: 'Assumptions and decisions.',
    blocks: [
      { type: 'asks', items: [
        { t: 'Completion', d: 'Is a funded enrollment (signed, first deposit cleared) the right place to count a DEX completion?' },
        { t: 'Intervention', d: 'Should help the customer asked for count as intervention? Is any human step legally required?' },
        { t: 'Better off', d: 'Is “better off than the day they enrolled” the right comparison, or should it be against the alternatives?' },
        { t: 'The targets', d: 'Are 10%, 25% and 50% in year one, and 90% long term, ambitious, realistic, or neither?' },
        { t: 'Profitable', d: 'How does Achieve define a profitable product line when revenue arrives at settlement?' },
        { t: 'The calendar', d: 'Is the year-one commitment a date, such as the end of 2027, or a day count from my start?' },
        { t: 'P&L ownership', d: 'What budget and capacity would come with accountability for the DEX P&L?' },
        { t: 'Approval', d: 'Who approves the launch and each traffic expansion?' },
        { t: 'Capacity', d: 'What would you slow down to make room for the MVP?' },
        { t: 'Where DEX ends', d: 'How far into retention should DEX reach: day 90, first settlement, or graduation?' },
      ] },
    ],
  },
];
