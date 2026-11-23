/* Content for /achieve/vision-strategy-v1/. Edit this file to revise the presentation; app.js only draws it.
   Every block carries a source: 'published' (Achieve's own statements), 'reading' (Adam's interpretation of
   public evidence) or 'proposal' (Adam's working proposal). Text supports **bold** only.
   Block types: group, row, matrix, flow, timeline, table, callout, details. */

export const meta = {
  title: 'Achieve: vision and strategy',
  version: 'v1',
  status: 'Draft for discussion',
  author: 'Adam Michaelson',
  audience: 'Prepared for the Achieve executive stakeholder interviews',
  note: 'Written before the interviews, from public information only. Each section answers a question I asked you first. Everything marked as my proposal is a starting position for you to correct.',
};

export const sources = {
  published: { label: 'Achieve published', help: 'Achieve’s own public statements, with a link to the source.' },
  reading: { label: 'My reading', help: 'My interpretation of public evidence. I have no inside knowledge.' },
  proposal: { label: 'My proposal', help: 'A working position for you to react to. Targets are discussion material.' },
};

const LINKS = {
  about: { label: 'achieve.com/about', url: 'https://www.achieve.com/about' },
  meet: { label: 'Press release: Meet Achieve', url: 'https://www.achieve.com/about/press/meet-achieve-the-leader-in-digital-personal-finance-built-for-everyday-people' },
  stroh: { label: 'Brad Stroh bio', url: 'https://www.achieve.com/about/brad-stroh' },
  pagaya: { label: 'Press release: Achieve and Pagaya', url: 'https://www.achieve.com/about/press/achieve-and-pagaya-launch-partnership-to-expand-access-to-personal-loans' },
};

/* The interview questions, word for word from the stakeholder interview sheet. */
const ASK = {
  1: 'What is the vision for the company? This should be in terms of why you exist, what the ideal \u201CUtopia\u201D is that the company creates AND the ideal outcome that the company achieves.',
  2: 'What is the strategy of the company? That is, how do we go about achieving the vision? What are the key elements? Are there any elements missing? Is there something we\u2019re doing today that we need to stop doing? Are there things we\u2019re not doing today that we need to be doing?',
  3: 'What is the vision for the DEX product? Tell me what the ideal state looks like? This should be first in terms of outcomes, and second in terms of scope.',
  4: 'What is the strategy for the DEX product? That is, what are the things we should do (in terms of principles, practices, and scope) that will deliver the outcomes? What needs to change about what we\u2019re doing today in order to employ this strategy?',
  5: 'A year from now, what needs to be materially different for you and the rest of the exec team to call it a great year? Where do you see the biggest opportunity or constraint?',
  6: 'Of the outcomes you just named, where should Product lead, and where should it help another team succeed?',
  7: 'Where would you want me to concentrate first? What would you be comfortable slowing down to make room for that?',
  8: 'What do you expect by day 30? By day 60? By day 90?',
  11: 'Which people, dependencies, or decisions will most affect whether I can deliver? Where would you expect me to act independently, and where would you want to be involved?',
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

export const sections = [
  {
    id: 'mission', ask: ASK[1], q: [1], title: 'Achieve’s mission, and my reading for debt relief',
    lead: 'I start from what Achieve says about itself, then say how I read it for debt relief.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'published', title: 'What Achieve says', links: [LINKS.about, LINKS.meet, LINKS.stroh, LINKS.pagaya], items: [
          { t: 'Mission', d: '“To empower everyday people to move forward on the path to a better financial future.”' },
          { t: 'Approach', d: 'Match financial products, education and engagement to individual needs through data, technology and personalized human support.' },
          { t: 'Portfolio', d: 'Debt relief, personal loans, home equity loans, financial tools and education.' },
          { t: 'Direction', d: 'An expansion from debt relief into a broader set of consumer financial solutions.' },
        ] },
        { type: 'group', src: 'reading', title: 'How I read it', items: [
          { t: 'Entry point', d: 'Debt relief serves the people in the most acute hardship. The rest of the portfolio is what makes “moving forward” possible afterward.' },
          { t: 'Human support is part of the product', d: 'Achieve names personalized human support next to data and technology. I read automation as a way to use people where they matter most.' },
          { t: 'Partners, with Achieve owning the relationship', d: 'In the Pagaya partnership, a lending example, Achieve uses a partner’s technology and data and keeps the customer relationship and servicing.' },
        ] },
      ] },
      { type: 'group', src: 'proposal', title: 'A vision for debt relief, within that mission', items: [
        { t: 'Elevator pitch', d: 'Help people facing financial hardship get out from under excessive debt and build lasting financial security, at scale and with strong economics.' },
        { t: 'Problem', d: 'People who fall on hard times can face a debt burden they can’t realistically manage. After relief, they may need help avoiding a repeat and reaching their next financial goals.' },
        { t: 'Ideal outcome', d: 'Members resolve the debt they came to address and make measurable progress toward financial security. Achieve delivers that outcome at scale and profitably.' },
        { t: 'Scope', d: 'A guided experience combining automation, human support and appropriate financial products, from initial assessment through debt resolution and the next financial milestone.' },
      ] },
      { type: 'callout', tag: 'Ambitions to discuss', text: '**Tens of thousands of people per month** is my stretch idea for scale. For economics I had **Rule of 40** in mind (revenue growth rate plus profit margin of 40% or more). That is a company-level measure and you know the real numbers, so I would rather ask how Achieve defines strong economics for debt relief.' },
      { type: 'details', summary: 'KPIs for the vision', blocks: [
        { type: 'table', src: 'proposal', head: ['Pillar', 'KPI', 'Note'], rows: [
          ['Solution', 'People who resolve enrolled debt (graduates). People who move into an appropriate post-program product.', 'Two separate counts.'],
          ['Quality', 'Net debt reduction after fees. Time to resolution. Graduate net worth, or a proxy.', 'Proxy to choose: for example, debt-to-income and credit score 12 months after graduation.'],
          ['Adoption', 'Share of people entering the funnel who resolve enrolled debt. Share of eligible graduates who adopt an appropriate next product.', 'See the distinction below.'],
          ['Economics', 'Total revenue. Acquisition cost. Revenue per customer. Total profit.', 'Revenue arrives when debts settle, so cohort views matter.'],
        ] },
        { type: 'group', src: 'proposal', title: 'Graduating is not the same as adopting another product', items: [
          { t: 'Graduation', d: 'All enrolled debt is resolved. This is the program outcome and the measure of success for debt relief.' },
          { t: 'Next-product adoption', d: 'A separate, later event. Counted only among graduates who are eligible and for whom the product is suitable. It is never a condition of graduating and never part of the graduation rate.' },
        ] },
      ] },
    ],
  },

  {
    id: 'company-strategy', ask: ASK[2], q: [2], title: 'Company strategy for debt relief',
    lead: 'My working view of how to advance the mission in debt relief. Each problem is a hypothesis from outside the company.',
    blocks: [
      { type: 'matrix', src: 'proposal', cols: [
        { name: 'Solution',
          problem: 'The right people may struggle to find Achieve, and some who come in are a poor fit.',
          policy: 'Spend to reach people Achieve can actually help. Qualify early, and point poor fits to a better option quickly.',
          action: ['Target acquisition by hardship and debt profile.', 'Move qualification into the first minutes.', 'Explore direct, partner and embedded channels.'],
          kpis: ['Monthly leads', 'Marketing-qualified leads', 'Fit yield: funded enrollments that reach a first settlement, per 100 leads, by channel'] },
        { name: 'Quality',
          problem: 'Not everyone who enrolls ends up better off, and the least is known about people who exit early.',
          policy: 'Recommend the path that leaves the person better off, even when that is not debt relief. Count everyone who enrolled.',
          action: ['Compare paths at intake: debt relief, a consolidation loan, credit counseling, or bankruptcy advice.', 'Keep a net-benefit record for every enrollment cohort.', 'Follow up with people who exit early.'],
          kpis: ['Net debt reduction after fees', 'Time to resolution', 'Share of exits who leave worse off', 'Graduate net worth proxy'] },
        { name: 'Adoption',
          problem: 'People can disengage because of fear, friction, or loss of attention or commitment.',
          policy: 'Build understanding and confidence at the moments people decide. An informed decision to stop is a good outcome.',
          action: ['Explain what happens next before each commitment: first deposit, first creditor contact, first settlement.', 'Check in at known drop points.', 'Record every exit as avoidable or appropriate, with a reason.'],
          kpis: ['Share of enrollees who resolve enrolled debt', 'Avoidable dropout rate', 'Appropriate exits, reported separately', 'Next-product adoption among eligible graduates'] },
        { name: 'Economics',
          problem: 'Acquisition and service are costly, and revenue arrives only when debts settle.',
          policy: 'Grow only where the customer and Achieve both come out ahead. Lower cost through better fit and automation, never through less help.',
          action: ['Shift spend toward channels with the highest fit yield.', 'Automate steps where people do not need a person.', 'Report unit economics by enrollment cohort.'],
          kpis: ['Acquisition cost per funded enrollment', 'Cost to serve per enrolled customer', 'Revenue per customer', 'Contribution profit by cohort'] },
      ] },
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Start', items: ['Measuring net benefit for everyone who enrolls, including early exits.', 'Reporting channels by fit yield as well as lead volume.'] },
        { type: 'group', src: 'proposal', title: 'Stop', items: ['Treating a signed agreement as the success event.', 'Judging channels on lead volume alone.'] },
        { type: 'group', src: 'proposal', title: 'Change', items: ['Report graduation and next-product adoption as separate outcomes.', 'Classify exits as avoidable or appropriate before trying to reduce them.'] },
      ] },
      { type: 'callout', tag: 'Method', text: 'Both matrices use the same frame: a diagnosed problem, a guiding policy, coherent action, and the KPIs that show whether it worked.', link: { label: 'How I build a strategy', url: '/product/strategy-framework/' } },
    ],
  },

  {
    id: 'dex-vision', ask: ASK[3], q: [3], title: 'DEX product vision',
    lead: 'Outcome first, then scope. DEX is the digital path through debt-relief onboarding and retention, and a person can reach staff at every step.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Ideal outcome', items: ['Long-term ambition: 90% or more of DEX completions without staff intervention.', 'A clear path to human support whenever a customer needs or asks for it.'] },
        { type: 'group', src: 'proposal', title: 'Problem hypothesis', items: ['Human intervention is currently required at points that could be handled digitally.', 'The first job is to establish where people genuinely need help, and where better design, data or automation could remove friction.'] },
        { type: 'group', src: 'proposal', title: 'Scope', items: ['Conversational AI', 'Third-party data and services', 'Workflow automation', 'Handoffs to staff'] },
      ] },
      { type: 'flow', src: 'proposal', caption: 'Where DEX starts, where a completion is counted, and what retention covers', steps: [
        { name: 'Eligible traffic', note: 'Everyone who could be offered DEX', zone: 'before' },
        { name: 'Routed to DEX', note: 'DEX starts here', zone: 'onboard', mark: 'Start' },
        { name: 'Assessment and plan', note: 'Qualification, debts, expectations', zone: 'onboard' },
        { name: 'Agreement', note: 'Consents and signature', zone: 'onboard' },
        { name: 'First deposit clears', note: 'Counted as a DEX completion', zone: 'onboard', mark: 'Completion' },
        { name: 'Active at day 90', note: 'Retention milestone', zone: 'retain' },
        { name: 'First settlement', note: 'Retention milestone', zone: 'retain' },
        { name: 'Graduation', note: 'Program outcome, beyond DEX', zone: 'after' },
      ] },
      { type: 'table', src: 'proposal', head: ['Pillar', 'KPI'], rows: [
        ['Solution', 'Volume of completions without staff intervention.'],
        ['Quality', 'NPS, plus a small set of measures for customer fit and outcomes.'],
        ['Adoption', 'Share of completions without staff intervention, with overall conversion and completion shown beside it.'],
        ['Economics', 'Profit per customer and completion volume.'],
      ] },
      { type: 'details', summary: 'Definitions: completion, staff intervention, and the three rates', blocks: [
        { type: 'group', src: 'proposal', title: 'DEX completion', items: [
          { t: 'Definition', d: 'A funded enrollment: the agreement is signed and the first program deposit has cleared.' },
          { t: 'Why not the signature', d: 'A signature alone rewards a click. A cleared deposit shows real commitment and is visible within weeks.' },
          { t: 'Retention', d: 'Tracked as separate milestones (active at day 90, first settlement) and never folded into completion.' },
        ] },
        { type: 'group', src: 'proposal', title: 'Staff intervention', items: [
          { t: 'Definition', d: 'Any staff interaction with the customer between the start of DEX and completion, including help the customer asked for.' },
          { t: 'Reported in three groups', d: 'Requested by the customer. Staff outreach to bring someone back. Required by process.' },
          { t: 'Not counted', d: 'Back-office review the customer never waits on. That is tracked as cost.' },
        ] },
        { type: 'table', src: 'proposal', head: ['Rate', 'Numerator', 'Denominator', 'Why it is there'], rows: [
          ['Routing share', 'Eligible customers routed to DEX', 'All eligible customers', 'How much traffic DEX is trusted with.'],
          ['No-intervention share', 'DEX completions with no staff interaction', 'All DEX completions', 'The headline target: 10%, 25%, 50%, then 90%.'],
          ['Overall completion', 'Completions on any path, assisted or not', 'All eligible customers', 'Guardrail. The no-intervention share must not rise because fewer people finish.'],
        ] },
        { type: 'callout', tag: 'Needs a decision', text: 'My targets could be read two ways: as a share of completions that needed no staff, or as a share of routed customers who complete with no staff. I use the first. The second is a much harder target.' },
      ] },
    ],
  },

  {
    id: 'dex-strategy', ask: ASK[4], q: [4], title: 'DEX product strategy',
    lead: 'The same frame applied to the product. Each problem is what I expect to find, to be confirmed in the first 30 days.',
    blocks: [
      { type: 'matrix', src: 'proposal', cols: [
        { name: 'Solution',
          problem: 'People don’t engage with DEX.',
          policy: 'Earn engagement by being the faster and clearer path. Never remove the human option.',
          action: ['Internal learning: calls, staff interviews, funnel data.', 'External evidence from comparable digital flows.', 'Iterative experiments against a control group.'],
          kpis: ['Completion volume without staff intervention'] },
        { name: 'Quality',
          problem: 'People dislike or struggle with the experience.',
          policy: 'Minimize unnecessary UI. Make every required step clear and reassuring.',
          action: ['Integrations that fill in what is already known.', 'Consolidate steps and disclose progressively.', 'Usability and perception testing on every iteration.'],
          kpis: ['NPS', 'Fit: cancellations in the first 90 days', 'Outcomes: deposit consistency', 'Harm: complaints, and exits who leave worse off'] },
        { name: 'Adoption',
          problem: 'People abandon the flow or require staff outreach to return.',
          policy: 'Nudge toward an informed decision, not only toward finishing.',
          action: ['Helpful reminders and visible progress.', 'Rewards or gamification only where they support an informed decision.', 'Drop any nudge that lifts completion and worsens 90-day cancellations.'],
          kpis: ['Milestone conversion without staff intervention', 'Overall conversion without staff intervention', 'Overall completion and outcomes, shown beside both'] },
        { name: 'Economics',
          problem: 'Automated delivery can still be expensive.',
          policy: 'Pay for a service only where it changes the outcome.',
          action: ['Compare building in-house with buying, component by component.', 'Negotiate volume discounts.', 'Trigger paid services only at the point they add value.'],
          kpis: ['Profit per completion without staff intervention', 'Cost of exceptions and staff support, shown beside it'] },
      ] },
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Start', items: ['Running a control group on the staff-led path from the first day.', 'Recording every staff contact as requested, recovery or required.'] },
        { type: 'group', src: 'proposal', title: 'Stop', items: ['Requiring a staff step where the customer has not asked for one and no rule requires it, if any exist.', 'Counting a completion at the signature.'] },
        { type: 'group', src: 'proposal', title: 'Change', items: ['Move staff time from routine steps to the moments people need a person.', 'Judge every nudge by outcomes as well as by completion.'] },
      ] },
    ],
  },

  {
    id: 'better-off', q: [2, 4], title: 'Are customers better off?',
    lead: 'One test sits under both strategies. It counts fees and setbacks, and it counts people who leave early.',
    blocks: [
      { type: 'group', src: 'proposal', title: 'The test', items: [
        { t: 'Net benefit per enrolled customer', d: 'Enrolled debt resolved, minus settlements paid, minus fees, minus any growth in balances not yet settled.' },
        { t: 'Who is counted', d: 'Everyone who enrolled, including people who exit early. Measuring graduates alone would hide the people most likely to be harmed.' },
        { t: 'Compared with', d: 'Their position on the day they enrolled, and with a control group on the staff-led path.' },
      ] },
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Early signals, in weeks to months', items: ['Deposit consistency across the first three deposits.', 'Cancellations in the first 90 days, with reasons.', 'Complaints and refund requests.', 'Time to first settlement.', 'Creditor legal action.'] },
        { type: 'group', src: 'proposal', title: 'Mature outcomes, in years', items: ['Share of enrolled debt resolved.', 'Net benefit after fees.', 'Share of exits who leave worse off.', 'Graduation rate.', 'Financial position after graduation.'] },
      ] },
      { type: 'table', src: 'proposal', head: ['If the evidence shows', 'Then'], rows: [
        ['A segment whose early signals predict a net loss for the customer', 'Change eligibility for that segment, or route it to another path.'],
        ['DEX cohorts trailing the control group on early signals by more than an agreed margin', 'Revise the experience before adding traffic.'],
        ['More DEX customers leaving worse off, complaints above an agreed level, or overall completion below the control', 'Pause expansion.'],
      ] },
      { type: 'callout', tag: 'Needs definition', text: 'The margins and levels above are set with Risk, Compliance and Finance before the 1% launch, so the decision rule exists before the results do.' },
    ],
  },

  {
    id: 'year', ask: ASK[5], q: [5], title: 'What makes it a great year',
    lead: 'Two targets, one opportunity and one constraint. I read \u201Ca year from now\u201D as day 365.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Working targets', items: ['50% of DEX completions without staff intervention.', 'A profitable DEX P&L by the end of 2027, as first drafted.'] },
        { type: 'group', src: 'proposal', title: 'Biggest opportunity', items: ['Getting V1 live. Everything else is learned from real customers on a real funnel.'] },
        { type: 'group', src: 'proposal', title: 'Biggest constraint', items: ['The time it takes to learn when outcomes take months to mature.'] },
      ] },
      { type: 'table', src: 'proposal', head: ['Readable within the year', 'Needs mature cohorts'], rows: [
        ['Completion, no-intervention share, overall completion', 'Share of enrolled debt resolved'],
        ['Deposit consistency and 90-day cancellations', 'Net benefit after fees'],
        ['Complaints, NPS, cost per completion', 'Graduation rate and what happens afterward'],
      ] },
      { type: 'callout', tag: 'Needs definition', text: '**A year from now and the end of 2027.** I first wrote these targets for the end of 2027. That matches day 365 only with a start on January 1, and each month later moves day 365 a month into 2028. I would commit to day counts.' },
      { type: 'callout', tag: 'Needs definition', text: '**Profitable.** Revenue arrives when debts settle, so cohorts enrolled in 2027 will not have paid back in cash by December. I propose: projected contribution per DEX enrollment is positive and better than the staff-led path, using Achieve’s own cohort curves, with realized cash reported beside it.' },
    ],
  },

  {
    id: 'product-leads', ask: ASK[6], q: [6], title: 'Where Product should lead',
    lead: 'Product owns delivery of the DEX outcomes. Other teams lead their own domains, with Product supporting.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'Product leads', items: ['The outcome definitions and targets.', 'The roadmap and what comes first.', 'Experiment design and the reading of results.', 'The recommendation to expand, hold or pause.'] },
        { type: 'group', src: 'proposal', title: 'Another team leads, Product supports', items: [
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
    id: 'first', ask: ASK[7], q: [7], title: 'What comes first',
    lead: 'A full-funnel MVP, live with 1% of eligible traffic. Narrow in audience, complete from end to end.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'In the MVP', items: ['Assessment and qualification.', 'Plan and honest expectations.', 'Agreement and consents.', 'Bank link and first deposit.', 'A handoff to staff at every step.', 'Measurement with a control group.', 'One segment and one channel, chosen with Risk and Compliance.'] },
        { type: 'group', src: 'proposal', title: 'Can wait', items: ['Retention features beyond the first deposit.', 'Messaging, partner and embedded channels.', 'Edge cases in eligibility.', 'Rewards and gamification.', 'Replacing bought components with in-house builds.'] },
        { type: 'group', src: 'proposal', title: 'Could slow down to free capacity', items: ['Incremental tuning of the staff-led funnel.', 'New channel launches.', 'New post-graduation product work.'] },
      ] },
      { type: 'callout', tag: 'Your call', text: 'I can’t see the current roadmap, so the last column is a guess at categories. Which work would you actually slow down?' },
    ],
  },

  {
    id: 'milestones', ask: ASK[8], q: [8, 9, 10], title: 'Day 30 to day 365',
    lead: 'Days 30, 60 and 90 answer the three questions. Days 180 to 365 show where they lead. Dates are targets that depend on evidence.',
    blocks: [
      { type: 'timeline', src: 'proposal' },
      { type: 'callout', tag: 'Read this with the chart', text: 'Routing traffic to DEX never removes the human handoff. And at day 365 the oldest DEX cohort is about nine months old, so every expansion decision in year one rests on early signals.' },
      { type: 'details', summary: 'Evidence needed to pass each milestone', blocks: [
        { type: 'table', src: 'proposal', head: ['Milestone', 'Working proposal', 'Evidence to proceed'], rows: 'milestones' },
      ] },
    ],
  },

  {
    id: 'decisions', ask: ASK[11], q: [11], title: 'Decisions and dependencies',
    lead: 'Three dependencies: budget, cross-functional capacity, and leadership approval to launch and expand an automated path.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', src: 'proposal', title: 'I decide', items: ['The roadmap and priorities within the mandate.', 'Experiments within the approved traffic share.', 'Experience and wording within approved disclosures.', 'Vendor choices within budget.', 'Pausing or rolling back DEX, at any time.'] },
        { type: 'group', src: 'proposal', title: 'I consult', items: ['Engineering on architecture and capacity.', 'Operations on handoffs and staffing.', 'Marketing on traffic and promises.', 'Data and Finance on measurement and the model.', 'Risk and Compliance on eligibility, disclosures and consent.'] },
        { type: 'group', src: 'proposal', title: 'Explicit approval', items: [
          { t: 'Budget', d: 'The President of Debt Relief, with Finance.' },
          { t: 'Launch at 1%', d: 'The President of Debt Relief, with Risk and Compliance sign-off.' },
          { t: 'Each traffic expansion', d: 'A named leadership group, against gates agreed in advance.' },
          { t: 'Eligibility changes', d: 'Risk and Compliance.' },
        ] },
      ] },
      { type: 'callout', tag: 'Your call', text: 'The approvers are my guess, and I would like to know where you want to be involved. My starting position is broad independence in execution, with alignment from C-level leaders, executives and department heads on the mandate and the rollout.' },
    ],
  },

  {
    id: 'react', q: [], title: 'What I want you to react to',
    lead: 'The assumptions that would change the plan most if I have them wrong.',
    blocks: [
      { type: 'asks', src: 'proposal', items: [
        { t: 'Completion', d: 'Is a funded enrollment (signed, first deposit cleared) the right place to count a DEX completion?' },
        { t: 'Intervention', d: 'Should help the customer asked for count as intervention? Is any human step legally required?' },
        { t: 'Better off', d: 'Is “better off than the day they enrolled” the right comparison, or should it be against the alternatives?' },
        { t: 'The targets', d: 'Are 10%, 25% and 50% in year one, and 90% long term, ambitious, realistic, or neither?' },
        { t: 'Profitable', d: 'How does Achieve define a profitable product line when revenue arrives at settlement?' },
        { t: 'The calendar', d: 'Is the year-one commitment a date, such as the end of 2027, or a day count from my start?' },
        { t: 'P&L ownership', d: 'What budget and capacity would come with accountability for the DEX P&L?' },
        { t: 'Approval', d: 'Who approves the launch and each traffic expansion?' },
        { t: 'Scale and economics', d: 'Is tens of thousands of people per month the right order of magnitude? How do you define strong economics?' },
        { t: 'Capacity', d: 'What would you slow down to make room for the MVP?' },
        { t: 'Where DEX ends', d: 'How far into retention should DEX reach: day 90, first settlement, or graduation?' },
      ] },
    ],
  },
];
