/* Content for /lendingtree/year-one/: the outcome cards, the Gantt and the milestone list all read from here.
   Time is in weeks from the start date, 1 to 48, four weeks to a month. Every target is a DRAFT until Day 30. */

export const META = {
  eyebrow: 'Draft · v1',
  title: 'Year one: outcomes and plan',
  intro: 'What I will commit to in the first year, and the milestones toward it. Every target is a draft until the stakeholder interviews are done and Finance confirms the baselines at Day 30.',
  planNote: 'Months run from my start date. A month is drawn as four weeks.',
};

export const WEEKS = 48;
/* Labels under the month axis, keyed by month number. */
export const CHECKPOINTS = { 1: 'Day 30', 2: 'Day 60', 3: 'Day 90', 6: 'Month 6', 9: 'Month 9', 12: 'Year 1' };

/* status: 'draft' = my proposed number, 'open' = cannot be set before baselines. */
export const TRACKS = [
  {
    id: 'integration', name: 'Integration', sub: 'People, culture, strategy, work in flight, commitments',
    card: { value: '2 weeks', unit: 'to a full readout', by: 'Week 2', status: 'draft',
      points: ['Every C-level and VP leader interviewed', 'Readout covers people, culture, vision and strategy, work in flight and current commitments'] },
    bars: [
      { s: 1, e: 2, row: 1, label: 'Stakeholder interviews' },
      { s: 3, e: 4, row: 2, label: 'Play back, confirm the plan' },
    ],
    ms: [
      { w: 2, t: 'Stakeholder interviews complete', ev: 'Written readout shared with the C-team' },
      { w: 4, t: 'Year-one targets calibrated and committed', ev: 'Baselines confirmed by Finance; this page updated' },
    ],
  },
  {
    id: 'team', name: 'Team leadership', sub: 'Trusted lieutenants, clear expectations, a stronger team',
    card: { value: '100%', unit: 'of teams led by a named lieutenant', by: 'Day 60', status: 'draft',
      points: ['Written expectations for every role by Day 30', 'Every team member assessed by Day 60', 'Staffing changes made by Day 90'] },
    bars: [
      { s: 1, e: 4, row: 1, label: 'Observe, set expectations', short: 'Observe', light: true },
      { s: 5, e: 8, row: 1, label: 'Name lieutenants', short: 'Appoint' },
      { s: 9, e: 12, row: 1, label: 'Make changes', short: 'Adjust' },
      { s: 13, e: 48, row: 1, label: 'Level up: operating cadence, coaching, quarterly reviews' },
    ],
    ms: [
      { w: 4, t: 'Role expectations published', ev: 'Reviewed with each team' },
      { w: 8, t: 'Lieutenants named and running their teams', ev: 'Operating cadence in place' },
      { w: 12, t: 'Staffing changes made', ev: 'Roles filled or in the hiring pipeline' },
    ],
  },
  {
    id: 'core', name: 'Protect the core', sub: 'The core business is supported and hits its goals',
    card: { value: '≥ 100%', unit: 'of plan on core KPIs', by: 'Every quarter', status: 'open',
      points: ['The KPIs the business already runs on, confirmed with Finance by Day 30', 'Roadblocks removed and work simplified for the existing product team'] },
    bars: [
      { s: 1, e: 4, row: 1, label: 'Learn, baseline KPIs', short: 'Baseline', light: true },
      { s: 5, e: 48, row: 1, label: 'Remove roadblocks, simplify, hit the plan' },
    ],
    ms: [
      { w: 12, t: 'Core KPI review, quarter 1', ev: 'Actuals against plan' },
      { w: 24, t: 'Core KPI review, quarter 2', ev: 'Actuals against plan' },
      { w: 36, t: 'Core KPI review, quarter 3', ev: 'Actuals against plan' },
      { w: 48, t: 'Core KPI review, year one', ev: 'Actuals against plan' },
    ],
  },
  {
    id: 'impact', name: 'Immediate impact', sub: 'New ROI greater than my comp',
    card: { value: '> 1×', unit: 'my comp in net new contribution', by: 'Month 6', status: 'draft',
      points: ['First experiment live by Day 60', 'Each bet gets a kill or scale decision within 60 days', 'Year-end multiple set at Day 90'] },
    bars: [
      { s: 3, e: 4, row: 1, label: 'Choose the first bets', short: '' },
      { s: 5, e: 12, row: 1, label: 'First experiments, MVPs' },
      { s: 13, e: 24, row: 1, label: 'Monitor, iterate, kill or scale' },
      { s: 25, e: 48, row: 1, label: 'Scale the winners, place new bets' },
    ],
    ms: [
      { w: 4, t: 'First bets chosen', ev: 'Each with a hypothesis, a cost and a kill rule' },
      { w: 8, t: 'First experiment live', ev: 'Instrumented, with a holdout' },
      { w: 24, t: 'New contribution passes 1× comp', ev: 'Reconciled by Finance' },
    ],
  },
  {
    id: 'disruption', name: 'Disruption', sub: 'Dedicated teams working to put LendingTree out of business',
    card: { value: '1', unit: 'concept through the executive phase gate', by: 'Month 9', status: 'draft',
      points: ['Disruption teams staffed and 100% allocated by Day 90', 'Deep research complete by Month 6', 'Alpha in market by Month 12'] },
    bars: [
      { s: 1, e: 12, row: 1, label: 'Plan, staff, prepare research', light: true },
      { s: 13, e: 24, row: 1, label: 'Deep research, first experiments' },
      { s: 25, e: 36, row: 1, label: 'Synthesis, concept, validation' },
      { s: 37, e: 48, row: 1, label: 'Build the alpha' },
    ],
    ms: [
      { w: 12, t: 'Disruption teams 100% allocated', ev: 'People named and released from other work' },
      { w: 24, t: 'Research synthesis shared', ev: 'Reviewed with leaders' },
      { w: 36, t: 'Executive phase gate', ev: 'The C-team commits, revises or stops' },
      { w: 48, t: 'Alpha in market', ev: 'First customers on the new model' },
    ],
  },
  {
    id: 'visiontypes', name: 'Visiontypes', sub: 'Inside a consumer AI assistant; the full customer lifecycle',
    card: { value: '2', unit: 'visiontypes, on mobile and desktop', by: 'Day 30', status: 'draft',
      points: ['LendingTree inside a consumer AI assistant', 'The full lifecycle, from lead to renewal', 'Second version with the provisional vision at Day 90'] },
    bars: [
      { s: 1, e: 4, row: 1, label: 'Version 1' },
      { s: 5, e: 12, row: 1, label: 'Version 2 from what I learn', short: 'Version 2' },
      { s: 13, e: 24, row: 1, label: 'Used as research stimulus', light: true },
    ],
    ms: [
      { w: 4, t: 'Visiontypes shown to the C-team', ev: 'Both prototypes, mobile and desktop' },
      { w: 12, t: 'Provisional vision and version 2', ev: 'Published with the Day 90 review' },
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

export function when(w) {
  if (w === 2) return 'Week 2';
  if (w === 4) return 'Day 30';
  if (w === 8) return 'Day 60';
  if (w === 12) return 'Day 90';
  return 'Month ' + Math.ceil(w / 4);
}

/* My time, as a share of the week, by phase. Draft. Each column adds to 100. */
export const PHASES = ['Weeks 1 to 2', 'Weeks 3 to 4', 'Days 31 to 60', 'Days 61 to 90', 'Months 4 to 6', 'Months 7 to 12'];
export const ALLOC = [
  { id: 'integration', pct: [60, 20, 0, 0, 0, 0], keep: 'The interviews themselves and the readout.', give: 'Scheduling, note capture and follow-ups.' },
  { id: 'team', pct: [10, 20, 25, 20, 15, 15], keep: 'Choosing and coaching the lieutenants; expectations and assessments.', give: 'Day-to-day team management, to the lieutenants.' },
  { id: 'core', pct: [10, 20, 20, 15, 15, 15], keep: 'The KPI review and clearing roadblocks that need my level.', give: 'Running the core roadmap, to the existing product lead and team.' },
  { id: 'impact', pct: [0, 15, 25, 25, 20, 15], keep: 'Choosing the bets and the kill or scale calls.', give: 'Build, launch and monitoring, to one owner per bet.' },
  { id: 'disruption', pct: [0, 5, 10, 20, 35, 45], keep: 'A seat in the deep research and the vision that comes out of it.', give: 'Leading each disruption team, to its principal.' },
  { id: 'visiontypes', pct: [10, 10, 10, 10, 5, 0], keep: 'The concept and the story.', give: 'Later versions and polish, to design.' },
  { id: 'buffer', name: 'Unplanned', pct: [10, 10, 10, 10, 10, 10], keep: 'Held open for what I cannot see yet.', give: '' },
];
