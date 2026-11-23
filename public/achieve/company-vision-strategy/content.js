/* Content for /achieve/company-vision-strategy/: my answers to the six company questions (1 to 6).
   Same format as /achieve/vision-strategy-v1/content.js, drawn by /achieve/deck/app.js.
   Achieve's own statements sit under "What Achieve says"; everything else is my reading or my proposal. */
import { questions as allQuestions } from '../vision-strategy-v1/content.js';

export const questions = allQuestions;

export const meta = {
  context: 'Achieve: company vision and strategy',
  eyebrow: 'Achieve · Rough draft · v1',
  title: 'Company vision and strategy',
  author: 'Adam Michaelson',
  intro: 'This is a rough draft of my answers to the six company questions: vision, strategy, strengths, weaknesses, opportunities and threats. It is written from public information only, and I will calibrate it after the individual executive stakeholder interviews.',
};

const SOURCES = [
  { label: 'achieve.com/about', url: 'https://www.achieve.com/about' },
  { label: 'Press release: Meet Achieve', url: 'https://www.achieve.com/about/press/meet-achieve-the-leader-in-digital-personal-finance-built-for-everyday-people' },
  { label: 'Brad Stroh bio', url: 'https://www.achieve.com/about/brad-stroh' },
  { label: 'Press release: Achieve and Pagaya', url: 'https://www.achieve.com/about/press/achieve-and-pagaya-launch-partnership-to-expand-access-to-personal-loans' },
];

export const slides = [
  { id: 'overview', name: 'Overview', q: [], cover: true },

  {
    id: 'mission', name: 'Achieve’s mission', q: [1], title: 'Achieve’s mission',
    sub: 'Achieve’s published mission and public statements.',
    blocks: [
      { type: 'group', title: 'What Achieve says', wide: true, items: [
        { t: 'Mission', d: '\u201CTo empower everyday people to move forward on the path to a better financial future.\u201D' },
        { t: 'Approach', d: 'Achieve describes matching financial products, education, and engagement to individual needs through data, technology, and personalized human support.' },
        { t: 'Portfolio', d: 'Debt relief, personal loans, home equity loans, financial tools, and education.' },
        { t: 'Expansion', d: 'Brad Stroh’s bio describes the expansion from debt relief into a broader set of consumer financial solutions.' },
        { t: 'Partnership', d: 'The Pagaya partnership, a lending example, illustrates how Achieve can use a partner’s technology and data to broaden access while retaining the customer relationship and servicing.' },
      ] },
    ],
    details: [
      { type: 'links', title: 'Sources for what Achieve says', items: SOURCES },
    ],
  },

  {
    id: 'vision', name: 'A vision for debt relief', q: [1], title: 'A vision for debt relief',
    sub: 'My best ventured idea.',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Elevator pitch', items: ['We effectively help tens of thousands of people per month who are down on their luck to get out of excessive debt and set themselves up for financial security, and we do it with Rule of 40 economics.'] },
        { type: 'group', title: 'Problems', items: ['People with debt who have fallen on hard times are in an impossible situation and need / warrant relief.', 'People who are freed from this situation need to take steps to ensure this doesn’t happen again, and could use guidance in achieving key financial objectives.'] },
        { type: 'group', title: 'Ideal outcome', items: ['These people are freed from debt and achieve key financial objectives.'] },
        { type: 'group', title: 'Scope', items: ['A white-glove experience that helps them to get through all the necessary steps (automation, human touch, financial products).'] },
      ] },
    ],
    details: [
      { type: 'table', title: 'KPIs', head: ['Pillar', 'KPI'], rows: [
        ['Solution', '# of people freed from debt; # of people who graduate (to a post-program product)'],
        ['Quality', '% reduction in debt; days to debt free; average net worth of graduate'],
        ['Adoption', '% of people who come to us that get freed from debt; % of people who graduate'],
        ['Economics', 'Total revenue, CAC, revenue per customer, total profit'],
      ] },
    ],
  },

  {
    id: 'strategy', name: 'Company strategy', q: [2], title: 'Company strategy for debt relief',
    sub: 'My best ventured idea.',
    blocks: [
      { type: 'matrix', cols: [
        { name: 'Solution',
          problem: 'Can’t find them (or they can’t find us); those who come don’t match / fall out due to intent mismatch.',
          policy: 'Target marketing, top of funnel qualification.',
          action: 'Direct + partner channels + embedded.',
          kpis: 'Leads per month, MQLs per month.' },
        { name: 'Quality',
          problem: 'Not everyone who enrolls ends up better off, and the least is known about early exits.',
          policy: 'Recommend the path that leaves the person better off. Count everyone who enrolled.',
          action: ['Compare paths at intake.', 'Keep a net-benefit record by cohort.', 'Follow up with early exits.'],
          kpis: ['Net debt reduction after fees', 'Time to resolution', 'Share of exits worse off'] },
        { name: 'Adoption',
          problem: 'They fall out of the funnel due to fear, lost attention / commitment, etc.',
          policy: 'Build understanding and confidence at the moments people decide. An informed stop is a good outcome.',
          action: ['Explain what happens next before each commitment.', 'Check in at known drop points.', 'Record exits as avoidable or appropriate.'],
          kpis: ['Share of enrollees who resolve enrolled debt', 'Avoidable dropout rate'] },
        { name: 'Economics',
          problem: 'Acquisition and service are costly, and revenue arrives only when debts settle.',
          policy: 'Grow only where the customer and Achieve both come out ahead.',
          action: ['Shift spend to channels with the highest fit yield.', 'Automate steps that do not need a person.', 'Report unit economics by cohort.'],
          kpis: ['Acquisition cost per funded enrollment', 'Cost to serve', 'Contribution profit by cohort'] },
      ] },
    ],
  },

  {
    id: 'swot', name: 'Strengths, weaknesses, opportunities, threats', q: [3, 4, 5, 6], title: 'Strengths, weaknesses, opportunities, threats',
    blocks: [
      { type: 'row', blocks: [
        { type: 'group', title: 'Strengths', items: ['Starts where the need is greatest, with people other providers turn away.', 'A portfolio beyond one product, so a customer can keep moving forward.', 'Personalized human support alongside data and technology.', 'Willing to partner while keeping the customer relationship.'] },
        { type: 'group', title: 'Weaknesses', items: ['Onboarding leans on staff at steps that could be digital.', 'Outcomes take years, so learning is slow and revenue arrives late.', 'Less is known about people who leave early than about graduates.', 'Debt relief is poorly understood, and many people distrust the category.'] },
        { type: 'group', title: 'Opportunities', items: ['A digital, guided path that serves more people at lower cost.', 'Graduates who move on to a suitable next product.', 'Partner and embedded channels that reach people earlier.', 'Long customer relationships that show which path fits whom.'] },
        { type: 'group', title: 'Threats', items: ['Rule changes on fees, marketing, or automated financial guidance.', 'One harmful automated experience damaging trust at scale.', 'AI-first entrants, creditor hardship programs, and general AI assistants giving debt advice.', 'Credit cycles that change creditor behavior and funding.'] },
      ] },
    ],
  },
];
