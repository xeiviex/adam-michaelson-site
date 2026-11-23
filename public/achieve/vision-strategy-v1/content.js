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

/* The six milestones, exactly as first proposed. routed = share of eligible traffic routed to DEX.
   unassisted = target share of DEX completions with no staff intervention. null = no target at that point. */
export const milestones = [
  { day: 30, text: 'MVP defined, with specifications, initial designs, and a working prototype.', routed: null, unassisted: null,
    gate: 'Completion, intervention and better-off definitions agreed. Segment and control group chosen.' },
  { day: 60, text: 'MVP usability and perception tested, integrations secured, and build underway.', routed: null, unassisted: null,
    gate: 'Test participants understand the program, fees and risks before they commit. Risk and Compliance review started.' },
  { day: 90, text: 'MVP refined from testing and live with 1% of eligible traffic.', routed: 1, unassisted: null,
    gate: 'Launch approved. Handoff to staff works at every step. Measurement and control group running.' },
  { day: 180, text: '10% of eligible traffic routed to DEX, with a target of at least 10% completion without staff intervention.', routed: 10, unassisted: 10,
    gate: 'Overall completion holds against the control. Early signals are no worse. No unresolved compliance findings.' },
  { day: 270, text: '50% of eligible traffic routed to DEX, with a target of at least 25% completion without staff intervention.', routed: 50, unassisted: 25,
    gate: 'First cohorts show three or more months of deposits. Operations ready for handoff volume. Cost per completion on plan.' },
  { day: 365, text: 'Up to 100% of eligible traffic routed to DEX, with a target of at least 50% completion without staff intervention.', routed: 100, unassisted: 50,
    gate: 'Projected contribution per DEX enrollment is positive. Better-off signals hold for every segment being expanded.' },
];

export const slides = [
  { id: 'overview', name: 'Overview', q: [], cover: true },

  {
    id: 'dex-vision', name: 'DEX product vision', q: [7], title: 'DEX product vision',
    sub: 'Outcome first, then scope. A person can reach staff at every step.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Ideal outcome', items: ['90% or more of DEX completions without staff intervention.'] },
        { type: 'group', title: 'Problem', items: ['Human intervention is currently required at points that could be handled digitally.'] },
        { type: 'group', title: 'Scope', items: ['Conversational AI', 'Third-party data and services', 'Workflow automation', 'Handoffs to staff'] },
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
    ],
    details: [
      { type: 'table', title: 'KPIs', head: ['Pillar', 'KPI'], rows: [
        ['Solution', 'Volume of completions without staff intervention.'],
        ['Quality', 'NPS, plus a small set of measures for customer fit and outcomes.'],
        ['Adoption', 'Share of completions without staff intervention, with overall conversion and completion shown beside it.'],
        ['Economics', 'Profit per customer and completion volume.'],
      ] },
      { type: 'group', title: 'DEX completion', items: [
        { t: 'Definition', d: 'A funded enrollment: the agreement is signed and the first program deposit has cleared.' },
        { t: 'Why not the signature', d: 'A signature alone rewards a click. A cleared deposit shows real commitment and is visible within weeks.' },
        { t: 'Retention', d: 'Tracked as separate milestones (active at day 90, first settlement, remaining settlements) and never folded into completion.' },
      ] },
      { type: 'group', title: 'Staff intervention', items: [
        { t: 'Definition', d: 'Any staff interaction with the customer between the start of DEX and completion, including help the customer asked for.' },
        { t: 'Reported in three groups', d: 'Requested by the customer. Staff outreach to bring someone back. Required by process.' },
        { t: 'Not counted', d: 'Back-office review the customer never waits on. That is tracked as cost.' },
      ] },
      { type: 'table', title: 'The three rates', head: ['Rate', 'Numerator', 'Denominator', 'Why it is there'], rows: [
        ['Routing share', 'Eligible customers routed to DEX', 'All eligible customers', 'How much traffic DEX is trusted with.'],
        ['No-intervention share', 'DEX completions with no staff interaction', 'All DEX completions', 'The headline target: 10%, 25%, 50%, then 90%.'],
        ['Overall completion', 'Completions on any path, assisted or not', 'All eligible customers', 'Guardrail. The no-intervention share must not rise because fewer people finish.'],
      ] },
      { type: 'callout', tag: 'Needs a decision', text: 'My targets could be read two ways: as a share of completions that needed no staff, or as a share of routed customers who complete with no staff. I use the first. The second is a much harder target.' },
    ],
  },

  {
    id: 'dex-strategy', name: 'DEX product strategy', q: [8], title: 'DEX product strategy',
    sub: 'What I expect to find, and how I would respond. To be confirmed in the first 30 days.',
    blocks: [
      { type: 'matrix', cols: [
        { name: 'Solution',
          problem: 'People don’t engage with DEX.',
          policy: 'Be the faster and clearer path. Never remove the human option.',
          action: ['Internal learning: calls, staff interviews, funnel data.', 'External evidence from comparable flows.', 'Iterative experiments against a control group.'],
          kpis: ['Completion volume without staff intervention'] },
        { name: 'Quality',
          problem: 'People dislike or struggle with the experience.',
          policy: 'Minimize unnecessary UI. Make every required step clear and reassuring.',
          action: ['Integrations that fill in what is already known.', 'Consolidate steps and disclose progressively.', 'Usability and perception testing.'],
          kpis: ['NPS', 'Fit: 90-day cancellations', 'Outcomes: deposit consistency', 'Harm: complaints, exits worse off'] },
        { name: 'Adoption',
          problem: 'People abandon the flow or need staff outreach to return.',
          policy: 'Nudge toward an informed decision, not only toward finishing.',
          action: ['Helpful reminders and visible progress.', 'Rewards or gamification only where they support an informed decision.'],
          kpis: ['Milestone and overall conversion without staff intervention', 'Overall completion and outcomes, shown beside both'] },
        { name: 'Economics',
          problem: 'Automated delivery can still be expensive.',
          policy: 'Pay for a service only where it changes the outcome.',
          action: ['Build or buy, component by component.', 'Negotiate volume discounts.', 'Trigger paid services only where they add value.'],
          kpis: ['Profit per completion without staff intervention', 'Cost of exceptions and staff support'] },
      ] },
    ],
    details: [
      { type: 'callout', tag: 'Method', text: 'A diagnosed problem, a guiding policy, coherent action, and the KPIs that show whether it worked.', link: { label: 'How I build a strategy', url: '/product/strategy-framework/' } },
      { type: 'group', title: 'One guardrail on nudges', items: ['Drop any nudge that lifts completion and worsens 90-day cancellations.'] },
    ],
  },

  {
    id: 'dex-change', name: 'What changes', q: [8], title: 'What changes',
    sub: 'What I would start, stop and change to employ that strategy. Each is a hypothesis.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Start', items: ['Running a control group on the staff-led path from the first day.', 'Recording every staff contact as requested, recovery or required.'] },
        { type: 'group', title: 'Stop', items: ['Requiring a staff step where the customer has not asked for one and no rule requires it, if any exist.', 'Counting a completion at the signature.'] },
        { type: 'group', title: 'Change', items: ['Move staff time from routine steps to the moments people need a person.', 'Judge every nudge by outcomes as well as by completion.'] },
      ] },
    ],
  },

  {
    id: 'research', name: 'Research in parallel', q: [], title: 'Research in parallel',
    sub: 'Automating DEX starts immediately. Contextual research runs beside it and corrects it.',
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
    id: 'better-off', name: 'Are customers better off?', q: [], title: 'Are customers better off?',
    sub: 'One test under the whole strategy. It counts fees and setbacks, and it counts people who leave early.',
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
    id: 'year', name: 'A great year', q: [9], title: 'What makes it a great year',
    sub: 'Two targets, one opportunity and one constraint.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Working targets', items: ['50% of DEX completions without staff intervention.', 'A profitable DEX P&L by the end of 2027.'] },
        { type: 'group', title: 'Biggest opportunity', items: ['Getting V1 live. Everything else is learned from real customers on a real funnel.'] },
        { type: 'group', title: 'Biggest constraint', items: ['The time it takes to learn when outcomes take months to mature.'] },
      ] },
      { type: 'table', head: ['Readable within the year', 'Needs mature cohorts'], rows: [
        ['Completion, no-intervention share, overall completion', 'Share of enrolled debt resolved'],
        ['Deposit consistency and 90-day cancellations', 'Net benefit after fees'],
        ['Complaints, NPS, cost per completion', 'Graduation rate and what happens afterward'],
      ] },
    ],
    details: [
      { type: 'callout', tag: 'Needs definition', text: '**A year from now and the end of 2027.** The end of 2027 matches day 365 only with a start on January 1. Each month later moves day 365 a month into 2028. I would commit to day counts.' },
      { type: 'callout', tag: 'Needs definition', text: '**Profitable.** Revenue arrives when debts settle, so cohorts enrolled in 2027 will not have paid back in cash by December. I propose: projected contribution per DEX enrollment is positive and better than the staff-led path, using Achieve’s own cohort curves, with realized cash reported beside it.' },
    ],
  },

  {
    id: 'product-leads', name: 'Where Product leads', q: [10], title: 'Where Product should lead',
    sub: 'Product owns delivery of the DEX outcomes. Other teams lead their own domains, with Product supporting.',
    blocks: [
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
    ],
    details: [
      { type: 'callout', tag: 'Needs definition', text: '**Owning the DEX P&L.** Product can be accountable for the result, but it directly controls only the roadmap and the experiments. Engineering capacity, marketing spend, staffing and vendor contracts sit elsewhere. I propose Product is accountable for DEX contribution margin, with a named budget and agreed capacity from each team.' },
    ],
  },

  {
    id: 'first', name: 'What comes first', q: [11], title: 'What comes first',
    sub: 'A full-funnel MVP, live with 1% of eligible traffic. Narrow in audience, complete from end to end.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'In the MVP', items: ['Assessment and qualification.', 'Plan and honest expectations.', 'Agreement and consents.', 'Bank link and first deposit.', 'A handoff to staff at every step.', 'Measurement with a control group.', 'One segment and one channel.'] },
        { type: 'group', title: 'Can wait', items: ['Retention features beyond the first deposit.', 'Messaging, partner and embedded channels.', 'Edge cases in eligibility.', 'Rewards and gamification.', 'Replacing bought components with in-house builds.'] },
        { type: 'group', title: 'Could slow down to free capacity', items: ['Incremental tuning of the staff-led funnel.', 'New channel launches.', 'New post-graduation product work.', 'These are guesses. Which work would you actually slow down?'] },
      ] },
    ],
  },

  {
    id: 'milestones', name: 'Day 30 to day 365', q: [12, 13, 14], title: 'Day 30 to day 365',
    sub: 'A hypothesis-based plan, shaped by the executive interviews and calibrated by the contextual research running in parallel.',
    blocks: [
      { type: 'timeline' },
    ],
    details: [
      { type: 'callout', tag: 'How to read the plan', text: 'Every action here starts as a hypothesis. The executive stakeholder interviews shape it first. The contextual research running in parallel will calibrate it as findings arrive, so later milestones are the most likely to move.' },
      { type: 'callout', tag: 'Two things to keep in mind', text: 'Routing traffic to DEX never removes the human handoff. And at day 365 the oldest DEX cohort is about nine months old, so every expansion decision in year one rests on early signals.' },
      { type: 'table', title: 'Evidence needed to pass each milestone', head: ['Milestone', 'Working proposal', 'Evidence to proceed'], rows: 'milestones' },
    ],
  },

  {
    id: 'decisions', name: 'Decisions and dependencies', q: [15], title: 'Decisions and dependencies',
    sub: 'Three dependencies: budget, cross-functional capacity, and leadership approval to launch and expand.',
    blocks: [
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
    details: [
      { type: 'callout', tag: 'Your call', text: 'The approvers are my guess, and I would like to know where you want to be involved. My starting position is broad independence in execution, with alignment from C-level leaders, executives and department heads on the mandate and the rollout.' },
    ],
  },

  {
    id: 'react', name: 'What to react to', q: [], title: 'What I want you to react to',
    sub: 'The assumptions that would change the plan most if I have them wrong.',
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
