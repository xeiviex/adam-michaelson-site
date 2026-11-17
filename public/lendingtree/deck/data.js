/* Content for the /lendingtree deck. One source for slide copy, ROI blocks, Gantt milestones and details overlays.
   The on-screen Gantt, the overlay milestone list, and the overview rollup are all built from `gantt` below.
   Everything about LendingTree products, partners, staffing and results is a PROPOSAL or an illustrative example. */

export const DAYS = [30, 60, 90, 180];
export const TBD = 'Baseline to establish';

/* Labels used in expanded details. */
export const TAGS = {
  commitment: 'Commitment',
  target: 'Target',
  dependency: 'Dependency',
  proposed: 'Proposed',
  illustrative: 'Illustrative',
};
export const TAG_HELP = {
  commitment: 'A deliverable the team can control.',
  target: 'An outcome to pursue and measure.',
  dependency: 'External access, approval, capacity, or validation needed to achieve it.',
};

/* Old /lendingtree/ fragments. Where the new deck has an equivalent section, map to it. Everything else only exists in the
   archive, so it goes to the same anchor on /lendingtree1/. The test suite checks every id in the archive is covered. */
export const LEGACY = {
  chapter: '#overview', impact: '#roadmap', solutions: '#down-funnel', s1: '#down-funnel', s2: '#down-funnel', s3: '#down-funnel',
};
export const LEGACY_ARCHIVE_IDS = ['problems', 'p1', 'p2', 'p3', 'notes']
  .concat(Array.from({ length: 23 }, (_, i) => 'n' + (i + 1)), Array.from({ length: 23 }, (_, i) => 'r' + (i + 1)));

const C = (x) => ({ t: 'commitment', x });
const G = (x) => ({ t: 'target', x });
const D = (x) => ({ t: 'dependency', x });
const P = (x) => ({ t: 'proposed', x });
const I = (x) => ({ t: 'illustrative', x });

const ms = (d, short, owner, commit, target, dep, evidence) => ({ d, short, owner, commit, target, dep, evidence });

export const SLIDES = [
  /* ---------------------------------------------------------------- 1 */
  {
    id: 'overview', nav: 'Overview', kicker: '1 of 7 · Overview', title: 'From lead generation to financial products platform',
    message: 'Win the offer decision first, then earn the right to serve and measure the customer across the lifecycle.',
    econ: 'Incremental contribution from offer-stage pilots and new channels, net of channel costs and displaced match fees. Conditional on partner participation.',
    measure: 'One event spine counted once per transaction, holdouts for every test, and Finance reconciling results to observed costs.',
    metrics: [
      { k: 'Incremental contribution', v: TBD, note: 'Conditional on partners' },
      { k: 'Capacity redeployed', v: 'Team-months, set at Day 60', note: '' },
      { k: 'Evidence for more investment', v: 'Lift vs holdout, mature outcomes', note: 'And partner economics' },
    ],
    gantt: [
      ms(30, 'Baseline economics, audit work, align sponsorship', 'Product lead with Finance partner', 'Baseline economics and an audit of in-flight work', 'Sponsors named for lender and carrier alphas', 'Finance, product and engineering data access', 'Baselines signed off by Finance; sponsors confirmed'),
      ms(60, 'Commit six-month plan, target alpha scope', 'Product lead and CTO', 'Six-month delivery plan and alpha scope', 'At least one meaningful release per team per month', 'CTO agreement on team topology and capacity', 'Plan approved by the executive team'),
      ms(90, 'Publish provisional direction, review early proof', 'Product lead', 'Provisional vision and strategy published', 'Early proof from the first alphas', 'Alpha partners introduced and ready', 'First instrumented data reviewed against baselines'),
      ms(180, 'Review economics and evidence; scale, revise, or stop', 'Executive team with Finance partner', 'Economics and evidence review for each strategy', 'An explicit scale, revise, or stop decision per strategy', 'Enough mature outcomes to read', 'Decisions recorded with the evidence behind them'),
    ],
    details: {
      title: 'Overview details',
      intro: 'The proposal in one paragraph: LendingTree earns most of its revenue at the handoff. The next chapter starts earlier, with better offers and quotes, and earns more reasons to stay in the customer relationship. Everything below is proposed and open to calibration.',
      sections: [
        { h: 'How to read the labels', blocks: [
          { ul: [C('A deliverable the team can control.'), G('An outcome to pursue and measure.'), D('External access, approval, capacity, or validation needed to achieve it.')] },
          { p: 'Milestones below are proposed and uncalibrated. Partner participation, conversion lift, production volume, and revenue are targets that depend on partners and evidence, never commitments.' },
        ] },
        { h: 'What I need from leadership', blocks: [
          { ol: [
            'Executive introductions and sponsorship for lender and carrier alphas.',
            'Authority to reallocate roadmap capacity to the highest-return work.',
            'Close alignment with the CTO on team topology and architecture.',
            'Approval for targeted hiring or contractors and for bounded experiments.',
            'Agreement on performance measures and a review cadence.',
          ] },
        ] },
        { h: 'Research runs alongside delivery', blocks: [
          { p: 'The research track starts on day one and continues past Day 180. Delivery milestones in this deck cover the first six months. The research months below are from the archived October 2026 plan and are proposed timing.' },
          { table: { cap: 'Research track, with checkpoints after Day 180 marked', head: ['Work', 'Timing', 'After Day 180?'], rows: [
            ['Stakeholder interviews, C-level through director, weighted by role', 'Month 1', 'No'],
            ['Market research: opportunities, threats, trends, analogs', 'Months 1 to 2', 'No'],
            ['Internal analysis: sales, support, transactions, partnerships, costs, architecture', 'Months 1 to 2', 'No'],
            ['Contextual research with lenders, carriers, partners and shoppers', 'Months 2 to 4', 'No'],
            ['Provisional vision and strategy (Day 90)', 'Month 3', 'No'],
            ['Synthesis with leaders', 'Month 5', 'No'],
            ['Concept design', 'Month 6', 'Edge of Day 180'],
            ['Validation with stakeholders and target personas', 'Month 7', 'Yes'],
            ['Go-to-market plan with marketing leadership', 'Month 8', 'Yes'],
            ['Executive phase gate: the C-team formally commits', 'Month 9', 'Yes'],
          ] } },
        ] },
        { h: 'Common measurement model', blocks: [
          { p: 'Every eligible journey emits the same events, joined by journey and transaction identifiers. Funnel and unit economics are reported by channel, vertical, partner, and cohort. Finance reconciles results to observed costs, displaced economics, and the base case.' },
          { ol: ['Source and consent', 'Offer request', 'Returned offer or quote', 'Presentation', 'Selection', 'Handoff', 'Application', 'Funded or bound outcome, where available'], cls: 'spine' },
          { p: 'Each transaction and its contribution count once in the portfolio rollup. Channel is a dimension, not a separate ledger. An embedded partner can originate a journey that also uses MCP or shared fulfillment, and both are recorded on the same transaction.' },
        ] },
        { h: 'Milestone rollup by strategy', blocks: [{ rollup: true }] },
        { h: 'Planning assumptions and open items', blocks: [
          { ul: [
            P('The archive cites three alpha partners as an example. The split across lenders and carriers is not confirmed, so no allocation is published here.'),
            P('Pilot thresholds reused from the archive keep their original cohort, metric definition, and proposed status. See the down-funnel details.'),
            D('Internal baselines for revenue per lead, contact rates, funded and bound rates, and channel costs are not yet available.'),
          ] },
        ] },
        { h: 'Archived strategy', blocks: [
          { links: [{ href: '/lendingtree1/', text: 'October 2026 strategy', note: 'the original page, unchanged' }, { href: '/lendingtree1/#notes', text: 'Source notes', note: 'footnotes and citations from the archive' }] },
        ] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 2 */
  {
    id: 'roadmap', nav: 'Roadmap ROI', kicker: '2 of 7 · Roadmap ROI optimization', title: 'Put capacity behind the strongest returns',
    message: 'Score every in-flight commitment, then fund a capacity-constrained six-month roadmap.',
    econ: 'Return from the work we keep, spending we avoid, and engineering time we move to higher-return work.',
    measure: 'Finance and product score each initiative on forward cost and benefit. Sunk cost is excluded. Projected results are compared with observed ones at Day 180.',
    metrics: [{ k: 'Projected return of retained work', v: TBD }, { k: 'Avoidable spending', v: TBD }, { k: 'Engineering capacity redeployed', v: TBD }],
    gantt: [
      ms(30, 'Score portfolio, propose stop, start, continue', 'Product lead, Engineering lead, Finance partner', 'Scored inventory of in-flight work with validated costs and dependencies', 'Proposed stop, start, continue, and re-scope decisions', 'Cost and effort data from engineering and Finance', 'Every initiative has a forward cost, benefit range, and confidence'),
      ms(60, 'Approve reallocations, commit six-month roadmap', 'Product lead and CTO', 'Six-month roadmap within capacity', 'At least one meaningful release per team per month', 'Sales, Marketing, and Operations review of sequencing', 'Roadmap and capacity reallocations approved'),
      ms(90, 'Verify releases, refresh major assumptions', 'Product lead with Finance partner', 'Release check against the roadmap and refreshed assumptions', 'Release cadence held; major assumptions updated', 'Release and cost actuals', 'Actuals compared with the Day 60 plan'),
      ms(180, 'Compare projected and observed economics, revise allocations', 'Executive team with Finance partner', 'Projected versus observed economics review', 'Allocations revised toward observed returns', 'Mature outcomes and cost actuals', 'Variance explained and decisions recorded'),
    ],
    details: {
      title: 'Roadmap ROI details',
      intro: 'The roadmap is a portfolio decision.',
      sections: [
        { h: 'How we calculate ROI', blocks: [
          { ol: [
            'Estimate what each initiative adds from here: the new contribution it brings in (revenue minus the costs that come with it), plus any savings it creates elsewhere. This is its benefit.',
            'Subtract what it still costs: the remaining build cost and the added running cost. Benefit minus remaining cost is its net value.',
            'ROI is net value divided by that remaining cost: (benefit \u2212 remaining cost) \u00f7 remaining cost.',
            'Money already spent does not count. Only what is still ahead of us does.',
            'Where a benefit is uncertain, reduce it by how confident we are. Never reduce the costs.',
            'Engineering time is the constraint, so rank discretionary work by net value per team-month. Mandatory work stays in regardless.',
            'Stopping work saves its remaining cost once. Do not also count that as a saving.',
            'Compare the proposed roadmap with today\u2019s roadmap, then have Finance check projected against observed results at Day 180.',
          ] },
        ] },
        { h: 'How the work gets done', blocks: [
          { ol: [
            'Product, engineering, and Finance inventory every in-flight initiative.',
            'Validate remaining cost, effort, and dependencies with the teams doing the work.',
            'Identify mandatory work and sunk cost. Sunk cost stays out of forward ROI.',
            'Score the rest on forward net value and net value per constrained team-month.',
            'Review sequencing with Sales, Marketing, and Operations before committing.',
          ] },
          { ul: [C('Day 60 planning goal: at least one meaningful release per team per month.'), G('Spending avoided and capacity redeployed, compared with the observed result at Day 180.'), D('Credible cost and effort data from engineering and Finance.')] },
        ] },
        { h: 'Measures', blocks: [{ measure: 'roadmap' }] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 3 */
  {
    id: 'down-funnel', nav: 'Down-funnel', kicker: '3 of 7 · Down-funnel lending and insurance', title: 'Own the offer decision first',
    message: 'Generate, compare, and select useful offers and quotes first. Later lifecycle stages follow the evidence.',
    econ: 'Revenue per eligible shopper and incremental contribution margin, net of displaced match-fee contribution and partner acquisition costs.',
    measure: 'Eligible cohorts versus comparable existing flows, by vertical and partner, with funded and bound outcomes read as they mature.',
    metrics: [
      { k: 'Selection conversion', v: TBD }, { k: 'Revenue per eligible shopper', v: TBD },
      { k: 'Incremental contribution margin', v: TBD }, { k: 'Lender or carrier acquisition economics', v: TBD },
    ],
    gantt: [
      ms(30, 'Choose cohorts, map the experience, baseline economics, request introductions', 'Product lead with Partnership lead', 'One lending and one insurance cohort, experience map, baseline economics', 'Executive introductions to prospective lender and carrier alphas', 'Executive sponsorship; internal data access', 'Cohorts and baselines agreed with Finance'),
      ms(60, 'Offer and quote prototypes, documented partner contracts, instrumented test plan', 'Lending and Insurance team leads with Legal and compliance', 'Working offer and quote prototypes, contract terms, test plan with holdout', 'Partners agree to pilot terms', 'Partner legal review; compliance sign-off on consent and disclosures', 'Prototype walkthrough; contracts documented; test plan approved'),
      ms(90, 'Target a limited alpha with sponsored partners, subject to readiness', 'Lending and Insurance team leads', 'Limited alpha for the chosen cohorts', 'Offer coverage and time to usable offer tracked from first traffic', 'Sponsored partners ready; consent and disclosure gates cleared', 'First instrumented funnel data against the holdout'),
      ms(180, 'Review conversion, economics, mature outcomes; decide next capability', 'Executive team with Finance partner', 'Review of conversion, economics, and mature outcomes where available', 'A funded decision on the next lifecycle capability', 'Enough mature outcomes to read', 'Decision recorded with cohort evidence'),
    ],
    details: {
      title: 'Down-funnel details',
      intro: 'The first investment is the offer decision. Later stages stay visible on the map and in the plan so the roadmap is sequential, not accidental.',
      sections: [
        { h: 'Proposed flow: one lending and one insurance segment', blocks: [
          { ol: [
            'Capture only the data required for the offer or quote.',
            'Show comparable terms with freshness and eligibility context.',
            'Capture the shopper’s choice and consent.',
            'Hand off to the selected partner.',
            'Report downstream status where the partner provides it.',
          ] },
          { p: 'Segments are not chosen yet. The archive piloted a home equity segment for lending and auto for insurance. Both stay proposals until the Day 30 cohort choice.' },
        ] },
        { h: 'When an offer is not ready', blocks: [
          { states: [
            ['Pending', 'The partner has not responded yet.', 'Show progress and keep other offers usable. Time-box the wait.'],
            ['Expired', 'The terms are past their freshness window.', 'Refresh on request, or show a clear “updated” label.'],
            ['Ineligible', 'The shopper does not meet partner criteria.', 'Say so plainly and show eligible options.'],
            ['Unavailable', 'The partner cannot serve this request.', 'Remove it and offer the standard match path as the fallback.'],
          ] },
          { p: 'Indicative terms are an estimate from the shopper’s inputs. An offer is terms a partner can honor, with an expiry and conditions. The experience labels which is which and never presents an estimate as an offer.' },
        ] },
        { h: 'What each side gains', blocks: [
          { ul: [
            G('Shopper: comparable options and a say in who follows up.'),
            G('Lender or carrier: a shopper who chose them, better-qualified requests, and outcome visibility.'),
            D('Executive sponsor: introductions to lenders and carriers, and approval for the pilot terms.'),
          ] },
        ] },
        { h: 'Tie to the archived prototypes', blocks: [
          { ul: [
            'Choice: the initial offer comparison and shopper control over outreach.',
            'Aligned Outcomes: the status reporting that closes the feedback loop and measures this pilot.',
            'Companion: a later renewal use case once the offer stage works.',
          ] },
          { links: [{ href: '/lendingtree/choice/', text: 'The Power of Choice', note: 'prototype' }, { href: '/lendingtree/companion/', text: 'A Companion', note: 'prototype' }, { href: '/lendingtree/outcomes/', text: 'Aligned Outcomes', note: 'prototype' }] },
        ] },
        { h: 'Pilot thresholds carried over from the archive', blocks: [
          { p: 'These keep their original cohort, metric definition, and proposed status. They have not been recalibrated.' },
          { table: { cap: 'Archived pilot thresholds (proposed)', head: ['Pilot', 'Cohort', 'Metric', 'Proposed decision rule'], rows: [
            ['Choice', 'One home equity segment, at least 5,000 leads reaching the options step', 'Selection rate; funded rate per selection; revenue per lead against a control that keeps today’s flow', 'Double down at 40% or more selection, funded rate per selection at least 1.5 times today’s funded rate per lead, and revenue per lead at or above control. Kill under 25% selection, or if lenders will not pay break-even.'],
            ['Companion', 'About 2,000 recent insurance quote shoppers who opt in', 'Policies connected per user; 90-day retention; quote starts per active user against cold traffic', 'Double down when half connect two or more policies, 35% are active at 90 days, and quote starts run at twice the cold-traffic rate.'],
            ['Aligned Outcomes', 'Insurance first, with three alpha auto carriers', 'Reporting coverage (an outcome inside 14 days); conversion per lead against control', 'Double down at 80% coverage and a 10% conversion lift. Kill under 40% coverage.'],
          ] } },
        ] },
        { h: 'Measures', blocks: [
          { p: 'Compare eligible cohorts with comparable existing flows, and show outcomes by vertical and by partner. Track offer coverage, time to usable offer, selection, applications, and funded or bound outcomes as they mature, plus customer complaints and displaced match-fee contribution.' },
          { measure: 'down-funnel' },
        ] },
        { h: 'Review gates', blocks: [
          { ul: [
            D('Consent: language names only the partner the shopper chose, with a clear opt-out.'),
            D('Disclosures: reviewed for each product before any shopper sees an offer.'),
            D('Fair lending: matching and ranking tested before launch and monitored after.'),
            D('Data use: only what the offer or quote needs; retention and sharing reviewed.'),
            D('Partner economics: compensation model validated, with no pay-on-close or paid placement in mortgage or home equity.'),
          ] },
          { p: 'Legal and compliance owners validate the pilot design and the compensation model before launch.' },
        ] },
        { h: 'Open items', blocks: [{ ul: [P('Number and split of alpha partners across lenders and carriers.'), P('Chosen lending and insurance segments.'), D('Executive introductions to the first partners.')] }] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 4 */
  {
    id: 'mcp', nav: 'MCP/API', kicker: '4 of 7 · MCP/API', title: 'Make LendingTree usable in AI-native channels',
    message: 'Expose safe LendingTree capabilities through MCP and a shared API, starting with what already exists.',
    econ: 'Incremental transaction volume and revenue from AI-native channels, less channel costs, after removing volume we would have won anyway.',
    measure: 'Production-active integrations, transacting journeys, and incremental versus gross channel volume, on the common event spine.',
    metrics: [
      { k: 'Active integrations', v: TBD }, { k: 'Incremental volume and revenue', v: TBD }, { k: 'Contribution margin after channel costs', v: TBD },
    ],
    gantt: [
      ms(30, 'Inventory capabilities, choose use cases, set contracts and controls with the CTO', 'Principal architect with CTO', 'Capability inventory, first use cases, draft contracts and controls', 'Use cases ranked by incremental value and risk', 'CTO agreement on standards and control model', 'Inventory reviewed; first use cases approved'),
      ms(60, 'Sandbox, sample integration, reference docs', 'MCP/API team lead', 'Sandbox, one sample integration, reference documentation', 'A developer can reach a first successful call without help', 'Security review of the sandbox', 'Sample integration runs end to end in the sandbox'),
      ms(90, 'Target an instrumented design-partner pilot with tested handoffs', 'MCP/API team lead with Partnership lead', 'Instrumented pilot with one or more design partners', 'Consented handoffs tested end to end', 'Design partner ready; staging gate passed', 'Events flowing on the common spine'),
      ms(180, 'Target production transactions where gates clear; review incremental economics', 'MCP/API team lead with Finance partner', 'Production release where partner and control gates clear', 'First incremental transactions measured', 'Partner and compliance gates; production readiness', 'Incremental volume separated from gross; economics reviewed'),
    ],
    details: {
      title: 'MCP/API details',
      intro: 'Two layers. The programmatic API holds the business capabilities. The MCP adapter exposes them to assistants and agents. Both reuse the same underlying capabilities as the embedded experience.',
      sections: [
        { h: 'MCP adapter versus API', blocks: [
          { ul: ['The API is the stable, versioned programmatic contract any integration can use.', 'The MCP adapter maps selected API capabilities to tools an AI client can discover and call, with the same authorization.'] },
        ] },
        { h: 'Proposed capability sequence', blocks: [
          { ol: ['Discovery and eligibility', 'Offer or quote request', 'Offer retrieval', 'Consented handoff', 'Status, as partners support it'] },
          { p: 'Start with existing capabilities that can be exposed safely. Add new offer-stage capabilities as they become available.' },
        ] },
        { h: 'Illustrative tool contract', blocks: [
          { code: '// Illustrative only. Names and fields are not a final contract.\ntool: get_offers\ninput: {\n  vertical: "lending" | "insurance",   // required\n  eligibility: { /* minimum fields for the offer */ },\n  consent: { scope: "offer_request", granted_at, journey_id }  // required\n}\nresult: {\n  offers: [{ offer_id, partner, terms, expires_at, kind: "indicative" | "honorable" }],\n  journey_id\n}\nerrors: consent_missing | not_eligible | partner_unavailable | rate_limited | stale_offer', cap: 'A tool call never hands off or commits the shopper on its own. A consequential step needs a visible human confirmation.' },
        ] },
        { h: 'Controls', blocks: [
          { ul: [
            C('Partner authentication and authorization, scoped per partner and per capability.'),
            C('Rate limits, audit logs, and observability on every call.'),
            C('Versioned contracts with a deprecation policy.'),
            C('Tenant isolation so one partner never sees another’s data.'),
            C('Human confirmation for consequential steps such as handoff.'),
          ] },
        ] },
        { h: 'Readiness, shown honestly', blocks: [
          { table: { cap: 'Proposed environment status', head: ['Environment', 'Meaning', 'Proposed status'], rows: [
            ['Sandbox', 'Synthetic data, open to developers', 'Target by Day 60'],
            ['Staging', 'Realistic data, design partners only, tested handoffs', 'Target by Day 90'],
            ['Production', 'Live transactions, only where partner and control gates clear', 'Target by Day 180, conditional'],
          ] } },
        ] },
        { h: 'Measures', blocks: [{ measure: 'mcp' }] },
        { h: 'Count things separately', blocks: [{ ul: ['Production-active integrations, not registrations.', 'Transacting journeys, not tool calls.', 'Incremental volume, not gross channel volume.'] }] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 5 */
  {
    id: 'embedded', nav: 'Embedded', kicker: '5 of 7 · Embedded', title: 'Put a configurable experience inside partner products',
    message: 'A configurable SDK places a LendingTree module in partner products, on the same shared services.',
    econ: 'Incremental contribution margin from partner-sourced, qualified volume, after acquisition cost, incentives, revenue share, and servicing.',
    measure: 'Fully loaded CAC and conversion by partner cohort, with displaced owned-channel volume removed.',
    metrics: [
      { k: 'Partner-sourced qualified volume', v: TBD }, { k: 'Fully loaded CAC', v: TBD }, { k: 'Conversion', v: TBD }, { k: 'Incremental contribution margin', v: TBD },
    ],
    gantt: [
      ms(30, 'Choose partner archetypes, define configurable boundaries', 'Embedded team lead with Partnership lead', 'Partner archetypes and a boundary between partner and central settings', 'Design partner candidates identified', 'Partner interviews; compliance input on central controls', 'Boundaries reviewed with Legal and the CTO'),
      ms(60, 'Reference SDK and test host or sandbox', 'Embedded team lead', 'Reference SDK, configuration schema, and a test host', 'A partner engineer can integrate the reference in a sandbox', 'Shared services contracts from the CTO', 'Reference integration passes acceptance tests'),
      ms(90, 'Target a consented launch with a design partner after acceptance testing', 'Embedded team lead with Legal and compliance', 'Consented launch with one design partner', 'Time to first integration measured', 'Design partner ready; consent and disclosure review passed', 'Partner-sourced journeys tracked by cohort'),
      ms(180, 'Review repeatability, acquisition economics, case for scaling', 'Executive team with Finance partner', 'Review of repeatability and acquisition economics', 'A decision on scaling to more partners', 'Enough partner volume to read', 'Fully loaded CAC and conversion by cohort'),
    ],
    details: {
      title: 'Embedded details',
      intro: 'Partners configure how the module looks and where it sits. LendingTree enforces what must not change: consent, disclosures, offer integrity, security, and attribution.',
      sections: [
        { h: 'Reference integration and live preview', blocks: [{ embedlab: true }] },
        { h: 'What partners can change, and what we enforce', blocks: [
          { table: { cap: 'Proposed boundary', head: ['Partners configure', 'LendingTree enforces centrally'], rows: [
            ['Theme: colors, type, logo', 'Consent capture and wording'],
            ['Placement and entry point', 'Required disclosures'],
            ['Vertical: lending or insurance', 'Offer integrity: terms shown are the terms returned'],
            ['Enabled journey steps', 'Security, authentication, and data handling'],
            ['Prefill, only when the shopper consents', 'Attribution and event reporting'],
            ['Offer presentation within approved layouts', 'Handoff rules to the selected partner'],
          ] } },
        ] },
        { h: 'Integration checklist', blocks: [
          { ol: ['Register the host and receive sandbox keys.', 'Install the SDK and set the configuration.', 'Pass acceptance tests for consent, disclosures, and events.', 'Review accessibility and degraded states.', 'Launch to a consented design cohort.', 'Review economics by cohort.'] },
        ] },
        { h: 'Versioning, accessibility, and degradation', blocks: [
          { ul: [
            C('Semantic versions with a published deprecation window.'),
            C('Keyboard access, labels, and contrast meeting WCAG 2.2 AA in the module.'),
            C('If the SDK or a shared service fails, the module shows a clear message and a link to the standard LendingTree experience.'),
          ] },
        ] },
        { h: 'Measures', blocks: [{ measure: 'embedded' }] },
        { h: 'Isolate these costs', blocks: [{ ul: ['Partner acquisition cost and incentives.', 'Revenue share and servicing.', 'Displaced owned-channel volume.', 'Conversion by cohort.'] }] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 6 */
  {
    id: 'disruption', nav: 'Disruption', kicker: '6 of 7 · Disruption', title: 'Fund three open-charter experiments',
    message: 'Three principal-led pods look for threats and opportunities, and earn funding through evidence.',
    econ: 'Quantified exposure avoided or opportunity found, valued as option value until evidence supports a projected size.',
    measure: 'Each pod commits to a falsifiable hypothesis, a smallest credible test, an evidence threshold, and a review date.',
    metrics: [
      { k: 'Quantified exposure to disruption', v: TBD }, { k: 'Evidence-backed opportunity size', v: TBD },
      { k: 'Cost and return of experiments', v: 'Where observable' }, { k: 'Scale, pivot, or stop decisions', v: 'Counted at each review' },
    ],
    gantt: [
      ms(30, 'Name leads, set boundaries, scan threats and opportunities', 'Product lead with CTO', 'Pod leads named, time and spend bounds set, scan of threats and opportunities', 'Three charters opened, not yet filled in', 'Principals available and released from other work', 'Leads and bounds agreed by the executive team'),
      ms(60, 'Select testable hypotheses, launch early tests', 'Pod principals', 'One falsifiable hypothesis and test per pod', 'Early tests running with comparison cohorts', 'Access to customers and partners', 'Charters complete with baseline and evidence threshold'),
      ms(90, 'Review first evidence: stop, pivot, or deepen', 'Pod principals and executive team', 'First-evidence review', 'A decision on each test: stop, pivot, or deepen', 'Tests have run long enough to read', 'Evidence compared with the threshold'),
      ms(180, 'Investment decisions; assign owners to work graduating into delivery', 'Executive team with Finance partner', 'Investment decisions and ownership for graduating work', 'Each pod ends with scale, pivot, or stop', 'Delivery team capacity for graduating work', 'Decision log with evidence and owner'),
    ],
    details: {
      title: 'Disruption details',
      intro: 'Pods are lean on purpose. The three charters stay open until the principals shape them. Nothing here predicts what they will find.',
      sections: [
        { h: 'How a pod works', blocks: [{ ul: [
          C('A principal owns the pod, with lean staffing and a time and spend bound.'),
          D('Access to customers and partners to run real tests.'),
          C('Findings return to the portfolio review, never to a side channel.'),
          G('An experiment graduates to a delivery team only after the executive review names an owner and capacity.'),
        ] }] },
        { h: 'Charter template, identical for all three pods', blocks: [
          { table: { cap: 'Open charters. All fields stay blank until the principals shape them.', head: ['Field', 'Pod A', 'Pod B', 'Pod C'], rows: [
            ['Threat or opportunity', 'To be set', 'To be set', 'To be set'],
            ['Baseline', 'To be set', 'To be set', 'To be set'],
            ['Falsifiable hypothesis', 'To be set', 'To be set', 'To be set'],
            ['Smallest credible test', 'To be set', 'To be set', 'To be set'],
            ['Evidence threshold', 'To be set', 'To be set', 'To be set'],
            ['Review date', 'To be set', 'To be set', 'To be set'],
          ] } },
          { p: 'Each charter also names a comparison cohort or holdout, and the earliest credible review window.' },
        ] },
        { h: 'Illustrative question areas', blocks: [{ ul: [
          I('Customer behavior: what happens to shopping when an assistant compares offers before the shopper reaches a marketplace?'),
          I('Technology: which parts of matching could an agent do better than a form?'),
          I('Distribution: which partner surfaces could replace paid acquisition?'),
          I('Business model: where does outcome-based pricing beat match fees?'),
        ] }] },
        { h: 'Option value versus realized economics', blocks: [
          { p: 'Option value and projected opportunity are not results. A pod reports exposure and opportunity size with the evidence behind each number. Only observed contribution counts as realized economics.' },
          { p: 'Executive review ends every cycle with an explicit decision: scale, pivot, or stop.' },
        ] },
        { h: 'Measures', blocks: [{ measure: 'disruption' }] },
      ],
    },
  },

  /* ---------------------------------------------------------------- 7 */
  {
    id: 'teams', nav: 'Teams', kicker: '7 of 7 · Team optimization', title: 'Deliver more value per dollar with the CTO',
    message: 'Set expectations per role, assess every team member, act on what we learn, and keep hiring open.',
    econ: 'More outcomes per delivery dollar, from clear expectations, the right people in the right roles, and gaps filled quickly.',
    measure: 'Outputs and outcomes per role against written expectations, plus lead time, release cadence, quality, and cost per team.',
    metrics: [
      { k: 'Delivery throughput', v: TBD }, { k: 'Quality', v: TBD }, { k: 'Business outcomes per team', v: TBD }, { k: 'Cost efficiency', v: TBD },
    ],
    gantt: [
      ms(30, 'Set output and outcome expectations per role; open the hiring pipeline', 'Product lead and CTO', 'Written expectations for outputs and outcomes per role; hiring pipeline open', 'Every product team member knows what is expected', 'CTO alignment on roles and team missions', 'Expectations published and reviewed with each team'),
      ms(60, 'Assess each team member\u2019s capabilities and engagement; agree actions', 'Product lead and CTO', 'An assessment of each product team member against the expectations', 'An agreed action for every gap: develop, redeploy, hire, or contract', 'Executive approval for staffing actions and budget', 'Assessments complete and actions approved'),
      ms(90, 'Changes made, new people on board, their assessment begun', 'Product lead and CTO', 'Staffing changes made; new employees or contractors onboarded', 'Assessment of new team members under way', 'Candidates available from the pipeline', 'Roles filled; first check-ins against expectations'),
      ms(180, 'Review outputs, outcomes, and cost per team; adjust', 'Executive team with CTO and Finance partner', 'Review of outputs, outcomes, and cost per team', 'Value per dollar improving against the Day 30 baseline', 'Enough delivery history to read', 'Decisions recorded with the evidence'),
    ],
    details: {
      title: 'Team optimization details',
      intro: '',
      sections: [
        { h: 'Expectations per role', blocks: [
          { p: 'Every role gets written expectations in two parts. Outputs are what the role produces. Outcomes are the results it is accountable for.' },
          { ul: [C('Expectations for product, design, and engineering roles, agreed with the CTO.'), C('Each team owns named outcomes, not a list of features.')] },
        ] },
        { h: 'Assessment', blocks: [
          { p: 'Each product team member is assessed against those expectations on two things: capability and engagement. Managers and the CTO take part. Individual results stay private.' },
        ] },
        { h: 'Action', blocks: [
          { ul: ['Develop: coaching and a clear plan where the gap is closable.', 'Redeploy: move people to the work that fits them and the missions.', 'Hire selectively, or use contractors, where a gap justifies the cost.', G('By Day 90: changes made, new people on board, and their assessment begun.')] },
        ] },
        { h: 'Continuous hiring pipeline', blocks: [
          { p: 'The pipeline opens on day one and stays open. When a gap appears, candidates are already in conversation, for employees and contractors alike.' },
          { ul: [D('Approval for targeted hiring or contractors.')] },
        ] },
        { h: 'Team structure and shared architecture', blocks: [
          { p: 'Illustrative, to validate with the CTO against the actual organization. The CTO co-designs the topology and owns architectural direction.' },
          { ul: [
            I('Lending Down-Funnel: offers, comparison, and handoff for lending.'),
            I('Insurance Down-Funnel: quotes, comparison, and handoff for insurance.'),
            I('MCP/API: the programmatic contract and the AI-native adapter.'),
            I('Embedded: the SDK, partner configuration, and test host.'),
            I('Three principal-led disruption pods, with their own charters and bounds.'),
          ] },
          { p: 'Shopping, MCP/API, and Embedded sit on the same shared capabilities: identity and consent, offers and eligibility, partner integrations, transaction orchestration, analytics and economics, security and compliance. The CTO and a designated principal architect own the standards and contracts. Teams agree on shared schemas, API versions, ownership, access and consent boundaries, and observability.' },
          { p: 'Launch federated. Reassess a dedicated platform team if fragmentation, reliability, or repeat integration bottlenecks make it worthwhile.' },
        ] },
        { h: 'Measures', blocks: [{ measure: 'teams' }] },
      ],
    },
  },
];

/* Measurement rows shown in each strategy's details: [measure, baseline, denominator, window, source, accountable role, cadence, uncertainty/threshold]. */
export const MEASURE_HEAD = ['Measure', 'Baseline', 'Denominator and window', 'Source', 'Owner and cadence', 'Uncertainty and decision threshold'];
const TB = 'Baseline to establish';
export const MEASURES = {
  roadmap: [
    ['Projected return of retained work', TB, 'Net value over cost base, over the planning horizon', 'Finance and product scoring', 'Finance partner, monthly', 'Wide until effort and cost data are validated. Threshold TBD at Day 60.'],
    ['Avoidable spending', TB, 'Remaining cost of stopped or deferred work', 'Finance and engineering', 'Finance partner, monthly', 'Counted once; sunk cost excluded.'],
    ['Engineering capacity redeployed', TB, 'Team-months moved from stopped to started work', 'Engineering plan', 'CTO, monthly', 'Time shown separately from cash savings.'],
  ],
  'down-funnel': [
    ['Selection conversion', TB, 'Selections per shopper shown offers, per week', 'Event spine', 'Lending and Insurance leads, weekly', 'Compare with holdout. Archived Choice threshold: double down at 40% or more (proposed).'],
    ['Revenue per eligible shopper', TB, 'Revenue over eligible shoppers in cohort, matured window', 'Event spine and Finance', 'Finance partner, monthly', 'Includes displaced match-fee contribution. Threshold TBD.'],
    ['Incremental contribution margin', TB, 'Contribution versus holdout, per cohort', 'Finance reconciliation', 'Finance partner, monthly', 'Read after outcomes mature; earliest credible window about 90 days after launch.'],
    ['Lender or carrier acquisition economics', TB, 'Partner cost and incentives per funded or bound outcome', 'Partnerships and Finance', 'Partnership lead, monthly', 'Depends on partner agreement.'],
    ['Offer coverage and time to usable offer', TB, 'Requests with at least one usable offer; seconds to first offer', 'Event spine', 'Team leads, weekly', 'Threshold TBD at Day 60.'],
    ['Complaints and displaced match-fee contribution', TB, 'Per 1,000 shoppers; match fees lost versus holdout', 'Support and Finance', 'Compliance and Finance, monthly', 'Any rise in complaints pauses the pilot for review.'],
  ],
  mcp: [
    ['Active integrations', TB, 'Production-active integrations, not registrations', 'API gateway', 'MCP/API lead, monthly', 'Registrations reported separately.'],
    ['Incremental volume and revenue', TB, 'Transacting journeys net of volume we would have won anyway', 'Event spine and Finance', 'Finance partner, monthly', 'Needs a comparison cohort. Earliest credible window: first production quarter.'],
    ['Contribution margin after channel costs', TB, 'Contribution per transacting journey', 'Finance', 'Finance partner, monthly', 'Threshold TBD at Day 90.'],
  ],
  embedded: [
    ['Partner-sourced qualified volume', TB, 'Qualified journeys originating on partner surfaces, per month', 'Event spine', 'Embedded lead, monthly', 'Counted once even when MCP or shared fulfillment is also used.'],
    ['Fully loaded CAC', TB, 'Acquisition cost, incentives, revenue share, and servicing per outcome', 'Finance', 'Finance partner, monthly', 'Isolated by partner cohort.'],
    ['Conversion', TB, 'Outcomes per qualified journey, by cohort', 'Event spine', 'Embedded lead, weekly', 'Compare with owned-channel baseline.'],
    ['Incremental contribution margin', TB, 'After displaced owned-channel volume', 'Finance reconciliation', 'Finance partner, monthly', 'Threshold TBD at Day 90.'],
    ['Time to first integration', TB, 'Days from kickoff to first live journey', 'Integration log', 'Embedded lead, per partner', 'Repeatability target TBD.'],
  ],
  disruption: [
    ['Exposure to disruption', TB, 'Revenue or margin at risk, with the assumption stated', 'Pod evidence', 'Pod principal, per review', 'Reported as exposure, not realized loss.'],
    ['Evidence-backed opportunity size', TB, 'Addressable contribution supported by test evidence', 'Pod evidence and Finance', 'Pod principal, per review', 'Option value until the evidence threshold is met.'],
    ['Cost and return of experiments', TB, 'Spend and observed return per pod, where observable', 'Finance', 'Finance partner, per review', 'Comparison cohort or holdout named in each charter.'],
    ['Scale, pivot, or stop decisions', 'Zero at start', 'Decisions made against the evidence threshold', 'Review log', 'Executive team, Day 90 and Day 180', 'Earliest credible review: Day 90.'],
  ],
  teams: [
    ['Delivery throughput', TB, 'Lead time and releases per team per month', 'Delivery tooling', 'CTO and product lead, monthly', 'Teams are comparable only after baselines are set.'],
    ['Quality', TB, 'Escaped defects and incidents per release', 'Incident and defect data', 'CTO, monthly', 'Threshold TBD at Day 60.'],
    ['Business outcomes per team', TB, 'Outcome owned by each team, per its mission', 'Event spine', 'Team leads, monthly', 'Each team has one named outcome.'],
    ['Outputs and outcomes per role', TB, 'Roles meeting written expectations, per quarter', 'Manager and CTO assessment', 'Product lead and CTO, quarterly', 'Individual results stay private; reported in aggregate.'],
    ['Cost efficiency', TB, 'Fully loaded team cost per outcome', 'Finance', 'Finance partner, quarterly', 'Contractors and hires tracked separately.'],
  ],
};

/* Derived views: used by the on-screen Gantt, the overlay list, and the overview rollup, so they cannot drift apart. */
export function rollup() {
  return SLIDES.slice(1).map((s) => ({ id: s.id, nav: s.nav, cells: DAYS.map((d) => s.gantt.find((m) => m.d === d)) }));
}

/* One-line labels that fit inside the plan bars. The first three bars are each one sixth of the width, so keep them short. */
export const BARS = {
  overview: ['Baseline, sponsors', 'Commit the plan', 'Interim direction', 'Review economics: scale, revise, or stop'],
  roadmap: ['Score the portfolio', 'Commit the roadmap', 'Verify releases', 'Compare projected with observed; reallocate'],
  'down-funnel': ['Cohorts, baselines', 'Working prototypes', 'Limited alpha', 'Review outcomes; fund the next capability'],
  mcp: ['Pick use cases', 'Sandbox and docs', 'Partner pilot', 'Production where gates clear; review economics'],
  embedded: ['Partner archetypes', 'Reference SDK', 'Partner launch', 'Review repeatability and the case to scale'],
  disruption: ['Name leads, scan', 'Launch first tests', 'Review evidence', 'Investment decisions; graduate work to delivery'],
  teams: ['Set expectations', 'Assess the team', 'Make the changes', 'Review outputs, outcomes, and cost per team'],
};
