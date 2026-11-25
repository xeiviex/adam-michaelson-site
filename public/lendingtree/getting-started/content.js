/* Content for /lendingtree/getting-started/, drawn by /achieve/deck/app.js. Edit this file to revise the deck.
   One slide per topic of the video: a title, one drawing (blocks) and details that open in a sheet.
   Text supports **bold** only. Every number here is a draft until the stakeholder interviews are done.
   Assumes a start date of January 1, 2027. */

export const meta = {
  context: 'Getting started at LendingTree',
  eyebrow: 'LendingTree · Draft · v1',
  title: 'Getting started at LendingTree',
  author: 'Adam Michaelson',
  intro: 'How I will approach my first year: learn fast, lead the team, protect the core, deliver new profit early, and start the work that disrupts us before someone else does. This is a draft, and I will calibrate it after the stakeholder interviews.',
};

export const questions = {};

const L = (label, url) => ({ label, url });

export const slides = [
  { id: 'overview', name: 'Overview', q: [], cover: true },

  {
    id: 'approach', name: 'The approach', q: [], title: 'Seven parts, one year',
    sub: 'Each part has its own slide. The last one puts numbers and dates on all of them.',
    blocks: [
      { type: 'asks', items: [
        { t: 'Integration', d: 'Two weeks of stakeholder interviews to learn the people, culture, strategy, work in flight and commitments.' },
        { t: 'Team leadership', d: 'A clear structure of trusted leads, written expectations and a team that keeps getting stronger.' },
        { t: 'Protecting the core', d: 'The core business is supported, simplified and hits its KPIs.' },
        { t: 'Immediate impact', d: 'Experiments and MVPs that reach $1M+ in annualized profit from new work.' },
        { t: 'Disruption', d: 'Deep research and dedicated teams working to put LendingTree out of business.' },
        { t: 'Visiontypes', d: 'Prototypes of where this could go: inside a consumer AI assistant, and across the full customer lifecycle.' },
        { t: 'Year-one outcomes and plan', d: 'What I will commit to, the milestones, and how my time makes it feasible.' },
      ] },
    ],
  },

  {
    id: 'integration', name: 'Integration', q: [], title: 'Integration: learn fast, from the people who know',
    sub: 'Interviews are scheduled before I start and finished by January 15.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'What I need to learn', items: ['The people', 'The culture', 'The vision and strategy', 'The work in flight', 'Current commitments'] },
        { type: 'group', title: 'How', items: ['One-on-one interviews with every C-level and VP leader.', 'The same core questions for everyone, so answers can be compared.', 'Time with the product team in the work itself.'] },
        { type: 'group', title: 'Outcome by January 15', items: ['A written readout, shared with the executive team.', 'A leadership view of vision and strategy, weighted by role.', 'Year-one targets and this plan, calibrated.'] },
      ] },
    ],
    details: [
      { type: 'group', title: 'Core interview questions', items: [
        'What is the vision for the company: why it exists, and the ideal outcome it achieves?',
        'What is the strategy? What is missing, and what should we stop doing?',
        'What are LendingTree’s greatest strengths, weaknesses, opportunities and threats?',
        'A year from now, what needs to be materially different for you to call it a great year?',
        'Where should Product lead, and where should it help another team succeed?',
        'Where would you want me to concentrate first? What would you slow down to make room?',
        'What do you expect by day 30, day 60 and day 90?',
        'Which people, dependencies or decisions will most affect whether I can deliver?',
      ] },
      { type: 'links', title: 'More detail', items: [L('How I run internal stakeholder interviews', '/product/internal-stakeholder-interviews/'), L('How I approach the first 30, 60 and 90 days', '/product/30-60-90/')] },
    ],
  },

  {
    id: 'team', name: 'Team leadership', q: [], title: 'Team leadership: structure, trust, and a stronger team',
    sub: 'A small group of capable leads runs the day-to-day. I spend my time with them and on the work only I can do.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Structure', items: ['Every team has one named, accountable lead.', 'Leads own outcomes and bring me decisions, not status.', 'A steady operating cadence: weekly with leads, monthly with teams, quarterly reviews.'] },
        { type: 'group', title: 'Trust', items: ['Listen first. Learn the team dynamics before changing them.', 'Written expectations for every role: outputs and outcomes.', 'Do what I say I will do, visibly and on time.'] },
        { type: 'group', title: 'Leveling up', items: ['Assess every team member on capability and engagement.', 'Coach one-on-one where the gap is closing.', 'Develop, redeploy or hire where it is not. The hiring pipeline stays open.'] },
      ] },
      { type: 'table', head: ['By', 'Milestone'], rows: [
        ['Day 30', 'Role expectations published and reviewed with each team.'],
        ['Day 60', 'Team leads named and running their teams. Every team member assessed.'],
        ['Day 90', 'Staffing changes made. New people on board.'],
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('How I lead product teams', '/product/leader/'), L('Leveling up a team', '/product/leveling-up/'), L('Assessments', '/product/assessments/')] },
    ],
  },

  {
    id: 'core', name: 'Protecting the core', q: [], title: 'Protecting the core: it pays for everything else',
    sub: 'The existing product leadership and team keep running the core business. My job is to help them win.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Understand', items: ['Spend time with the team in the work.', 'Learn the KPIs, the drivers behind them and the plan to hit them.'] },
        { type: 'group', title: 'Remove roadblocks', items: ['Clear the decisions and dependencies that are stuck.', 'Protect the team’s capacity from new work.'] },
        { type: 'group', title: 'Simplify', items: ['Score in-flight work on forward cost and return.', 'Stop or re-scope what does not earn its place.'] },
        { type: 'group', title: 'Hit the goals', items: ['Core KPIs at or above plan, every quarter.', 'Reviewed quarterly against actuals with Finance.'] },
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('Scoring the roadmap on ROI', '/lendingtree/#roadmap'), L('How I measure success', '/product/principles/measuring/')] },
    ],
  },

  {
    id: 'impact', name: 'Immediate impact', q: [], title: 'Immediate impact: $1M+ in annualized profit from new work',
    sub: 'Small bets, measured honestly. Kill the underperformers quickly and put more behind the ones that pay.',
    blocks: [
      { type: 'flow', caption: 'Every bet follows the same path, with a kill rule written before it starts', steps: [
        { name: 'Ideas', note: 'Mine, and what the interviews surface', zone: 'before' },
        { name: 'Bet', note: 'Hypothesis, cost, kill rule', zone: 'onboard', mark: 'By day 30' },
        { name: 'Experiment or MVP', note: 'Smallest credible test', zone: 'onboard', mark: 'By day 60' },
        { name: 'Measure', note: 'Against a holdout, with Finance', zone: 'onboard' },
        { name: 'Kill or scale', note: 'Decided within 60 days', zone: 'done', mark: 'Decision' },
        { name: 'Scale the winners', note: 'More resources behind good bets', zone: 'retain' },
      ] },
      { type: 'row', blocks: [
        { type: 'group', title: 'Target', items: ['$1M+ in annualized profit from new work, by December 31.', 'Profit means net of what it costs to build and run.'] },
        { type: 'group', title: 'Who does the work', items: ['I commit my own time to the first bets.', 'Each bet that survives gets one owner and a small team.'] },
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('Year-one outcomes and plan', '/lendingtree/year-one/'), L('MVP scoping', '/product/mvp-scoping/')] },
    ],
  },

  {
    id: 'disruption', name: 'Disruption', q: [], title: 'Disruption: put LendingTree out of business before someone else does',
    sub: 'The first 90 days are light: planning, staffing and getting ready for contextual research. After that the teams are 100% allocated.',
    blocks: [
      { type: 'tracks', link: 'Research findings feed the teams. Team evidence sharpens the research.', tracks: [
        { name: 'Disruption teams', note: 'Dedicated people, 100% allocated, with open charters', steps: ['Staff and charter', 'First experiments', 'Evidence review', 'Phase gate', 'Alpha in market'] },
        { name: 'Deep research', note: 'A team that includes me', steps: ['Market research', 'Contextual research', 'Synthesis', 'Concept design', 'Validation'] },
      ] },
      { type: 'table', head: ['By', 'Milestone'], rows: [
        ['March 31', 'Disruption teams staffed and 100% allocated. Research plan ready.'],
        ['June 30', 'Deep research synthesized and shared with leaders.'],
        ['September 30', 'Executive phase gate: commit, revise or stop.'],
        ['December 31', 'Alpha in market.'],
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('Disruption pods and charters', '/lendingtree/#disruption'), L('Contextual inquiry', '/product/contextual-inquiry/')] },
    ],
  },

  {
    id: 'visiontypes', name: 'Visiontypes', q: [], title: 'Visiontypes: showing where this could go',
    sub: 'Prototypes of the ideas forming from what I have learned so far. They are a starting point for the conversation, on mobile and desktop.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'A. Inside a consumer AI assistant', items: ['How LendingTree operates when the shopper starts in an assistant such as ChatGPT or Gemini.', 'Offers, comparison and handoff, with consent, in the conversation.'] },
        { type: 'group', title: 'B. The full customer lifecycle', items: ['One relationship from first interest to renewal.', 'LendingTree stays useful after the handoff.'] },
      ] },
      { type: 'flow', caption: 'The lifecycle the second visiontype covers', steps: [
        { name: 'Lead', note: '', zone: 'before' },
        { name: 'MQL', note: '', zone: 'before' },
        { name: 'Application', note: '', zone: 'onboard' },
        { name: 'Offers and quotes', note: '', zone: 'onboard' },
        { name: 'Review and selection', note: '', zone: 'onboard' },
        { name: 'Funding or binding', note: '', zone: 'done' },
        { name: 'Servicing', note: '', zone: 'retain' },
        { name: 'Regular engagement', note: '', zone: 'retain' },
        { name: 'Renewal or upgrade', note: '', zone: 'after' },
      ] },
    ],
    details: [
      { type: 'links', title: 'Earlier prototypes', items: [L('The Power of Choice', '/lendingtree/choice/'), L('A Companion', '/lendingtree/companion/'), L('Aligned Outcomes', '/lendingtree/outcomes/')] },
    ],
  },

  {
    id: 'time', name: 'My time', q: [], title: 'My time: balance carefully, delegate everything I can',
    sub: 'Draft share of my week in each phase. A tenth stays open for what I cannot see yet.',
    blocks: [
      { type: 'table', head: ['', 'Jan 1 to 15', 'Jan 16 to 31', 'February', 'March', 'Apr to Jun', 'Jul to Dec'], rows: [
        ['Integration', '60%', '20%', '', '', '', ''],
        ['Team leadership', '10%', '20%', '25%', '20%', '15%', '15%'],
        ['Protecting the core', '10%', '20%', '20%', '15%', '15%', '15%'],
        ['Immediate impact', '', '15%', '25%', '25%', '20%', '15%'],
        ['Disruption', '', '5%', '10%', '20%', '35%', '45%'],
        ['Visiontypes', '10%', '10%', '10%', '10%', '5%', ''],
        ['Unplanned', '10%', '10%', '10%', '10%', '10%', '10%'],
      ] },
    ],
    details: [
      { type: 'table', title: 'What I keep and what I delegate', head: ['Part', 'I keep', 'I delegate'], rows: [
        ['Integration', 'The interviews and the readout.', 'Scheduling, note capture and follow-ups.'],
        ['Team leadership', 'Choosing and coaching the team leads; expectations and assessments.', 'Day-to-day team management, to the team leads.'],
        ['Protecting the core', 'The KPI review and roadblocks that need my level.', 'Running the core roadmap, to the existing product leadership.'],
        ['Immediate impact', 'Choosing the bets and the kill or scale calls.', 'Build, launch and monitoring, to one owner per bet.'],
        ['Disruption', 'A seat in the deep research and the vision that comes out of it.', 'Leading each disruption team, to its principal.'],
        ['Visiontypes', 'The concept and the story.', 'Later versions and polish, to design.'],
      ] },
    ],
  },

  {
    id: 'outcomes', name: 'Year-one outcomes', q: [], title: 'Year one: what I will commit to',
    sub: 'Draft targets. They become commitments once Finance confirms the baselines at day 30.',
    blocks: [
      { type: 'table', head: ['Part', 'Target', 'By'], rows: [
        ['Integration', 'Every C-level and VP leader interviewed; written readout shared', 'January 15'],
        ['Team leadership', '100% of teams led by a named, accountable lead', 'March 1'],
        ['Protecting the core', 'Core KPIs at or above plan', 'Every quarter'],
        ['Immediate impact', '**$1M+** in annualized profit from new work', 'December 31'],
        ['Disruption', 'One concept through the executive phase gate; alpha in market', 'September 30; December 31'],
        ['Visiontypes', 'Two visiontypes on mobile and desktop', 'January 31'],
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('Outcome cards, the full plan and milestones', '/lendingtree/year-one/')] },
    ],
  },

  {
    id: 'plan', name: 'Year-one plan', q: [], title: 'Year one: the plan',
    sub: 'Month 1 is January 2027.',
    blocks: [
      { type: 'gantt', months: 12, lanes: [
        { name: 'Foundation', note: 'Learn, lead and protect', rows: [
          { t: 'Integration', d: 'Interviews and readout', from: 1, to: 2, ms: 'Jan 15' },
          { t: 'Team leadership', d: 'Expectations, leads, changes', from: 1, to: 4, ms: 'Day 90' },
          { t: 'Protecting the core', d: 'KPIs at or above plan', from: 1, to: 13 },
          { t: 'Visiontypes', d: 'Version 1, then version 2', from: 1, to: 4 },
        ] },
        { name: 'New value', note: 'Deliver early, then disrupt', rows: [
          { t: 'Immediate impact', d: 'First experiments and MVPs', from: 1, to: 4 },
          { t: 'Scale the winners', d: 'Kill or scale; new bets', from: 4, to: 13, ms: '$1M+' },
          { t: 'Disruption: plan and staff', d: 'Light', from: 1, to: 4 },
          { t: 'Deep research', d: 'Teams 100% allocated', from: 4, to: 7 },
          { t: 'Concept and validation', d: '', from: 7, to: 9 },
          { t: 'Phase gate', d: 'Executive team', from: 9, to: 10, ms: 'Commit', gate: true },
          { t: 'Build the alpha', d: 'In market by year end', from: 10, to: 13 },
        ] },
      ] },
    ],
    details: [
      { type: 'links', title: 'More detail', items: [L('Outcome cards, the full plan and milestones', '/lendingtree/year-one/')] },
    ],
  },
];
