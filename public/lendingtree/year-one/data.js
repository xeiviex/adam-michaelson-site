/* Content for /lendingtree/year-one/: the outcome cards, the Gantt and the milestone list all read from here.
   Time is in weeks from the start date, 1 to 48, four weeks to a month. Every target is a DRAFT until Day 30. */

export const META = {
  eyebrow: 'Draft · v1',
  title: 'Year one: outcomes and plan',
  intro: 'What I would commit to in the first year, and the milestones toward it. Every target is a draft until the stakeholder interviews are done and Finance confirms the baselines at day 30.',
  planNote: 'Assumes a start date of January 1, 2027. Each month is drawn as four weeks.',
};

export const WEEKS = 48;
/* Labels under the month axis, keyed by month number. */
export const CHECKPOINTS = { 1: 'Day 30', 2: 'Day 60', 3: 'Day 90', 6: 'Month 6', 9: 'Month 9', 12: 'Year 1' };

/* status: 'draft' = my proposed number, 'open' = cannot be set before baselines. */
export const TRACKS = [
  {
    id: 'integration', name: 'Integration', sub: 'People, culture, strategy, work in flight, commitments',
    card: { value: '~30', unit: 'leaders interviewed', by: 'January 15', status: 'draft',
      points: ['The C-team, VPs and my direct reports', 'A synthesis with key findings and next steps, read out to everyone interviewed'] },
    bars: [
      { s: 1, e: 2, row: 1, label: 'Stakeholder interviews' },
      { s: 3, e: 4, row: 2, label: 'Readout, confirm the plan' },
    ],
    ms: [
      { w: 2, t: 'Stakeholder interviews complete', ev: 'Synthesis read out in groups' },
      { w: 4, t: 'Year-one targets calibrated and committed', ev: 'Baselines confirmed by Finance; this page updated' },
    ],
  },
  {
    id: 'team', name: 'Team leadership', sub: 'A clear chain of command and a stronger team',
    card: { value: '100%', unit: 'of teams led by a named, accountable lead', by: 'Day 60', status: 'draft',
      points: ['Written expectations for every role by day 30', 'Every team member assessed by day 60', 'Changes made by day 90'] },
    bars: [
      { s: 1, e: 4, row: 1, label: 'Set expectations', short: 'Expect' },
      { s: 5, e: 8, row: 1, label: 'Assess every team member', short: 'Assess' },
      { s: 9, e: 12, row: 1, label: 'Act: develop, redeploy, hire', short: 'Act' },
      { s: 13, e: 48, row: 1, label: 'Level up: operating cadence, coaching, quarterly reviews', light: true },
    ],
    ms: [
      { w: 4, t: 'Role expectations published', ev: 'Outputs and outcomes for every role' },
      { w: 8, t: 'Every team member assessed', ev: 'One on one, with guidance' },
      { w: 12, t: 'Changes made', ev: 'Roles filled or in the hiring pipeline' },
    ],
  },
  {
    id: 'core', name: 'Protecting the core', sub: 'Safe, and growing',
    card: { value: '≥ Plan', unit: 'on the company plan’s core targets', by: 'Every quarter', status: 'open',
      points: ['Jointly accountable with the leaders who own them today', 'Roadblocks removed; in-flight work scored on ROI'] },
    bars: [
      { s: 1, e: 4, row: 1, label: 'Learn, baseline KPIs', short: 'Baseline', light: true },
      { s: 5, e: 48, row: 1, label: 'Understand, remove roadblocks, simplify' },
    ],
    ms: [
      { w: 12, t: 'Core KPI review, quarter 1', ev: 'Actuals against plan' },
      { w: 24, t: 'Core KPI review, quarter 2', ev: 'Actuals against plan' },
      { w: 36, t: 'Core KPI review, quarter 3', ev: 'Actuals against plan' },
      { w: 48, t: 'Core KPI review, year one', ev: 'Actuals against plan' },
    ],
  },
  {
    id: 'impact', name: 'Immediate impact', sub: 'New profit, proven by experiment',
    card: { value: '$1M+', unit: 'in new profit, booked and as a run rate', by: 'Within year one', status: 'draft',
      points: ['Every bet has a written kill rule and a decision date', 'After day 90 an owner runs each bet, or we stop it'] },
    bars: [
      { s: 1, e: 12, row: 1, label: 'First bets: choose, test, decide' },
      { s: 13, e: 48, row: 1, label: 'Owners scale the winners', light: true },
    ],
    ms: [
      { w: 4, t: 'First bets chosen', ev: 'Each with a hypothesis, a kill rule and a decision date' },
      { w: 12, t: 'Each surviving bet has an owner', ev: 'The rest are stopped' },
      { w: 48, t: '$1M+ in new profit', ev: 'Booked, and as a run rate; reconciled by Finance' },
    ],
  },
  {
    id: 'disruption', name: 'Disruption', sub: 'Three independent pods and a research-led reset',
    card: { value: '3 × 3', unit: 'three pods of three principals, running', by: 'Day 90', status: 'draft',
      points: ['Research-led reset: provisional vision at day 90', 'Executive phase gate in month 9', 'Alpha in market in month 12'] },
    bars: [
      { s: 1, e: 12, row: 1, label: 'Pods: staff and start', light: true },
      { s: 13, e: 48, row: 1, label: 'Pods: test, review, decide, repeat' },
      { s: 1, e: 16, row: 2, label: 'Research: interviews, market, contextual inquiry' },
      { s: 17, e: 32, row: 2, label: 'Synthesis, concept, validation, go-to-market' },
      { s: 33, e: 36, row: 2, label: 'Phase gate', short: 'Gate' },
      { s: 37, e: 48, row: 2, label: 'Build the alpha' },
    ],
    ms: [
      { w: 12, t: 'Three pods running, 100% allocated', ev: 'Nine principals named' },
      { w: 12, t: 'Provisional vision and strategy', ev: 'Reviewed with the executive team' },
      { w: 36, t: 'Executive phase gate', ev: 'The executive team commits, revises or stops' },
      { w: 48, t: 'Alpha in market', ev: 'First customers on the new model' },
    ],
  },
];

/* Milestones in time order, numbered once so the Gantt and the list agree. */
export function milestones() {
  const all = [];
  TRACKS.forEach((tr, i) => tr.ms.forEach((m) => all.push({ ...m, track: tr.id, name: tr.name, order: i })));
  all.sort((a, b) => a.w - b.w || a.order - b.order);
  all.forEach((m, i) => { m.n = i + 1; });
  return all;
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATES = { 2: 'Jan 15', 4: 'Jan 31', 8: 'Mar 1', 12: 'Mar 31', 24: 'Jun 30', 36: 'Sep 30', 48: 'Dec 31' };
export function when(w) { return DATES[w] || MONTHS[Math.ceil(w / 4) - 1]; }

/* My time, as a share of the week, by phase. Draft. Each column adds to 100. */
export const PHASES = ['Jan 1 to 15', 'Jan 16 to 31', 'February', 'March', 'Apr to Jun', 'Jul to Dec'];
export const ALLOC = [
  { id: 'onboarding', name: 'General onboarding', pct: [10, 0, 0, 0, 0, 0] },
  { id: 'integration', pct: [60, 20, 0, 0, 0, 0], keep: 'The interviews and the readout.', give: 'Scheduling, note capture and follow-ups.' },
  { id: 'team', pct: [10, 20, 25, 20, 25, 20], keep: 'Choosing and coaching the leads; expectations and assessments.', give: 'Day-to-day team management, to the leads.' },
  { id: 'core', pct: [10, 20, 20, 15, 20, 20], keep: 'The KPI review and roadblocks that need my level.', give: 'Running the core roadmap, to the senior directors, with Sarah\u2019s help in the transition.' },
  { id: 'impact', pct: [0, 15, 25, 25, 0, 0], keep: 'Choosing the bets and the kill or scale calls.', give: 'Build, launch and monitoring, to an owner per bet.' },
  { id: 'disruption', pct: [0, 5, 10, 20, 40, 50], keep: 'Leading the research-led effort.', give: 'Each pod, to its principals.' },
  { id: 'buffer', name: 'Unplanned', pct: [10, 20, 20, 20, 15, 10] },
];
