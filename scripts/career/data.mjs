// Content for the seven /bio/<company>/ career pages, in chronological order.
// Figures and titles follow the 2026e résumé; stories come from the Notion
// "Adam's Professional Biography" page (PUBLIC sections only).
// Strings may contain HTML entities. `photos` entries are placeholder captions
// describing the photo to be supplied later.

export const pages = [
  // ───────────────────────────── 1 · ALTA BANK
  {
    slug: 'altabank',
    name: 'Alta Bank',
    accent: 'altabank',
    logo: '/bio/logos/altabank.png',
    site: 'https://www.altabank.com',
    years: '2001–2005',
    role: 'Online Banking Manager',
    facts: 'Banking · 300 employees · $1B in assets',
    about:
      'A Utah community bank (then Bank of American Fork) with about 300 employees and $1 billion in assets, built on relationships and branches, and just beginning to meet customers online.',
    mine:
      'Hired in 2001, while still a student at BYU, to stand up consumer and business online banking from scratch, and to build the team that would support it.',
    heroStats: [
      { num: '8,000', label: 'weekly online users in 6 months' },
      { num: '2', label: 'online banking products launched' },
      { num: '4', label: 'person support team, hired from zero' },
    ],
    heroPhoto: 'Alta Bank headquarters building, with signage',
    s2: {
      title: 'Open the bank’s second front door',
      sub: 'The charter: personal and business online banking, and the people to run them.',
      body: [
        'In the early 2000s a community bank competed on relationships. Its customers (households, and the shop owners and tradespeople on Main Street) were starting to expect that they could check a balance, move money, or run payroll without driving to a branch.',
        'The bank had a public website but no real online banking. My job was to change that, for two very different audiences, and to make sure someone was there to help when they got stuck.',
      ],
      points: [
        { h: 'Consumers', t: 'a simple, trustworthy way to bank from home.' },
        { h: 'Businesses', t: 'cash management and payroll without a trip to the branch.' },
        { h: 'The public site', t: 'a front door that matched what the bank was becoming.' },
        { h: 'Support', t: 'a function that did not exist yet.' },
      ],
      photos: [
        'A family checking their balance at the home computer',
        'A local shop owner at the counter, paperwork and a PC beside the register',
        'Bank tellers and branch staff helping a customer',
      ],
    },
    s3: {
      title: 'Start with customers, then build the machine around them',
      sub: 'Research, design, pricing, and go-to-market, all led by one small team.',
      body: [
        'I led the research, navigation, and interaction design for the public-site redesign, then rebuilt the site itself. For each online banking product, I led the customer inquiry: what people would actually use, what they would pay for, and how we should take it to market.',
        'Support was designed before launch, not after. I designed the systems and practices, hired the customer service team, and put automation around the day-to-day running of the online services department so a small team could serve a growing base.',
      ],
      quote: null,
      photos: ['Working session with the online services team around the desks and monitors'],
    },
    s4: {
      title: '8,000 weekly users in six months',
      sub: 'Two products, one website, and a support team, all in market.',
      body: [
        'Consumer online banking reached 8,000 weekly users within six months of launch. Business online banking followed, with cash management and payroll, and I led inquiry, pricing, and go-to-market for both.',
        'We measured what a bank can measure honestly: weekly active use, and how many customers needed help to get there.',
      ],
      points: [
        { h: 'Consumer online banking', t: '8,000 weekly users in 6 months.' },
        { h: 'Business online banking', t: 'cash management and payroll, launched.' },
        { h: 'Public website', t: 'research-led redesign and rebuild.' },
        { h: 'Customer support', t: 'systems designed, team of 4 hired and managed.' },
      ],
      photos: [
        'Screens of consumer and business online banking',
        'Customers using online banking',
        'The support team at work',
        'The redesigned public website',
      ],
    },
    s5: {
      title: 'Own the whole experience',
      sub: 'What stuck, and why I was ready for something bigger.',
      body: [
        'A launch is as much a support and go-to-market problem as a software one. The products only worked because the pricing, the website, the help desk, and the automation were designed together, and that stayed with me.',
        'By 2005, personal and business online banking were live, the support team was trained and running on automation, and the department no longer needed me to hold it together. That was the milestone. I graduated from BYU in 2006 and went looking for a bigger, more complex problem.',
      ],
      next: {
        slug: 'optum',
        label: 'Optum Insight · 2006–2008',
        teaser: 'From one bank’s website to 21 interlocking applications at a $1.6B healthtech company, and a monthly release cadence nobody thought was possible.',
      },
    },
  },

  // ───────────────────────────── 2 · OPTUM
  {
    slug: 'optum',
    name: 'Optum Insight',
    accent: 'optum',
    logo: '/bio/logos/optum.png',
    site: 'https://www.optum.com',
    years: '2006–2008',
    role: 'Senior Project Manager, Release Manager',
    facts: 'Healthtech · 4,500 employees · $1.6B in annual revenue',
    about:
      'The data and analytics arm of UnitedHealth Group, then called Ingenix and later rebranded Optum Insight: 4,500 people and $1.6 billion in annual revenue, with offices in West Valley, Utah.',
    mine:
      'Hired to bring a monthly release cadence to 21 business-critical applications, managing the business analyst and engineering backlogs behind them.',
    heroStats: [
      { num: '21', label: 'applications under one release process' },
      { num: 'Monthly', label: 'release cadence, established' },
      { num: '$600M', label: 'SaaS revenue booked' },
    ],
    heroPhoto: 'Optum Insight offices, with signage',
    s2: {
      title: 'Twenty-one applications, one calendar',
      sub: 'The charter: bring order to a release process everyone was frustrated with.',
      body: [
        'The company ran on 21 applications, and they were nothing alike. Some were purchased (Cognos, Microsoft Project); some were fully custom, built in-house. Together they covered CRM, invoicing, marketing automation, ticketing, infrastructure automation, auditing, marketing websites, and inventory.',
        'Every department wanted its changes first, and there was no shared way to decide. The people I served were the VPs and teams who depended on these systems, and the analysts and engineers who had to build what they asked for.',
      ],
      points: [
        { h: 'The problem', t: 'competing priorities across many departments, with no agreed way to choose.' },
        { h: 'The risk', t: 'revenue-critical systems released unpredictably.' },
        { h: 'The ask', t: 'a stable, predictable, reliable monthly release.' },
      ],
      photos: [
        'Business analysts and department leads at a planning table',
        'Engineers at their desks in the West Valley office',
        'Finance and operations teams who relied on these systems',
      ],
    },
    s3: {
      title: 'A rubric people could trust',
      sub: 'Prioritization built with the VPs who had to live with it.',
      body: [
        'I started with research and collaboration, working directly with VPs across departments to understand what each system meant to their business. Together we built a prioritization process and a rubric that made trade-offs visible, so the answer to "why not mine?" was never a mystery.',
        'On top of that, I managed the backlogs: business analysts handled research and specification, and I coordinated the engineering teams to build what was specified, all on one release process spanning the 21 applications.',
      ],
      quote: null,
      photos: ['Prioritization working session with department VPs at a whiteboard'],
    },
    s4: {
      title: 'A well-oiled monthly release',
      sub: 'Predictable cadence, aligned departments, and a revenue milestone.',
      body: [
        'Releases moved from ad hoc to a monthly rhythm across all 21 applications, with departments aligned behind a shared backlog. Among the things we shipped were automated renewals, which helped book $600 million in SaaS revenue.',
        'The measure that mattered most was the one stakeholders gave us: people who had been very frustrated with the process told us we had brought order to chaos.',
      ],
      points: [
        { h: 'Backlog prioritization', t: 'one rubric, applied across departments.' },
        { h: 'Monthly releases', t: 'established and kept across 21 apps.' },
        { h: 'Automated renewals', t: 'released, with $600M in SaaS revenue booked.' },
      ],
      photos: [
        'The release calendar and prioritization rubric',
        'Automated renewals workflow screens',
        'Release-day war room with engineers and analysts',
        'Department leads reviewing the monthly release',
      ],
    },
    s5: {
      title: 'Predictability is a product',
      sub: 'What I took with me, and what I went looking for.',
      body: [
        'Process is something you design for the people inside it. The rubric worked because the VPs had helped build it, and the cadence worked because it was dependable month after month. Trust came from keeping the promise, not from the plan.',
        'Once the process was running on a regular cadence and the feedback was strong, I wanted to try a startup. While researching alternatives to Microsoft Project for my own team, I found AtTask, and learned they were hiring their very first product manager.',
      ],
      next: {
        slug: 'workfront',
        label: 'Workfront (then AtTask) · 2008–2011',
        teaser: 'The first product hire at a Utah startup, a three-month field research project, and the redesign that changed how the company grew.',
      },
    },
  },

  // ───────────────────────────── 3 · WORKFRONT
  {
    slug: 'workfront',
    name: 'Workfront',
    accent: 'workfront',
    logo: '/bio/logos/workfront.png',
    site: 'https://www.workfront.com',
    years: '2008–2011',
    role: 'Product Team Lead',
    facts: 'B2B SaaS · 75 to 350 employees · $10M to $100M in annual revenue',
    about:
      'Work-management software for enterprise teams. Founded in Utah as AtTask, it rebranded to Workfront and later became part of Adobe’s business suite.',
    mine:
      'First product hire, recruited to give a fully engineering-led company a product vision and direction for its next phase of growth.',
    heroStats: [
      { num: '$10M → $50M', label: 'revenue in three years' },
      { num: '4x · 5x', label: 'persona adoption validated' },
      { num: '30', label: 'clients and prospects studied on site' },
    ],
    heroPhoto: 'Workfront headquarters, with signage',
    s2: {
      title: 'Give the product a point of view',
      sub: 'The charter: vision and strategy for the next phase, in a company that had never had a product manager.',
      body: [
        'AtTask had always been led by engineering. They hired me as their first product manager to set a vision and strategy for what came next. Steve Ballard joined as head of design and became a mentor in user research. Josh Custer, from the implementation team, became a PM alongside me.',
        'Josh and I pitched the C-team on a strategy built around renewals: deepen adoption among the key personas, grounded in jobs-to-be-done and in immediate value that makes the product sticky. We got buy-in to go find out who those people really were.',
      ],
      points: [
        { h: 'Mark', t: 'the executive, who needs visibility.' },
        { h: 'Jen', t: 'the project manager, our primary persona.' },
        { h: 'Chris', t: 'the frontline worker, who gets assigned tasks.' },
      ],
      photos: [
        'Chris, a frontline worker, at his desk with a notepad and a small whiteboard',
        'Jen, a project manager, in her workday',
        'Mark, an executive, reviewing a dashboard',
      ],
    },
    s3: {
      title: 'Go sit next to them',
      sub: 'Three months, about 30 sites, and a lot of notepads.',
      body: [
        'We spent roughly three months visiting about 30 clients and non-clients in our target market, among them Nike, Merck, ESPN, and Train. We split into teams and watched five to ten people per site at their own desks, doing normal work for 30 to 60 minutes each, to see what a phone call with a primary contact never could.',
        'We tested three persona hypotheses. The finding that mattered: frontline workers kept running their work somewhere else, on a notepad, a small whiteboard, or a private spreadsheet. The project manager’s tool was the project manager’s, and they tracked their own work their own way.',
      ],
      quote: null,
      photos: ['Our research team on site, observing people at their desks'],
    },
    s4: {
      title: 'My Work: a workspace for Chris',
      sub: 'A new area of the product, a new data model, and a six-month beta.',
      body: [
        'We built “My Work,” a workspace for the frontline worker, plus a team space that had not existed before, and a data model compatible with the existing one. Work could now flow from Jen to Chris and bubble back up to Mark’s dashboards. Research took three months, building and iterating three to four more, then a six-month beta with testers drawn from the people we had studied.',
        'Two details came straight from watching people. Jen could only request work, in a tab called “Work Requests,” because Chris wanted to feel in control. And when adoption stalled on a button labeled “Accept,” we relabeled it “Work on it,” and requests started moving.',
      ],
      points: [
        { h: '4x', t: 'adoption by frontline workers (Chris).' },
        { h: '5x', t: 'adoption by project managers (Jen), driven by Chris.' },
        { h: '2–3x', t: 'adoption by executives (Mark).' },
      ],
      photos: [
        'The My Work workspace',
        'The Work Requests tab and the “Work on it” button',
        'The team space',
        'Frontline workers using the product in the beta',
      ],
    },
    s5: {
      title: 'Redesign the whole product, then pick a lane',
      sub: 'How the strategy scaled, and why I was ready to leave.',
      body: [
        'After My Work, we redesigned every other area of the product around the same visual language and flows, adding social elements: connecting, sharing, and conversation. It meant a new data model and, in effect, a rewrite over several years.',
        'Revenue grew from about $10M to $50M in three years. A dedicated marketing team then caught Adobe’s eye. With the redesign in place and the growth realized, I was ready for what was next, and Lendio’s CMO reached out to set up lunch with the CEO.',
      ],
      next: {
        slug: 'lendio1',
        label: 'Lendio · 2012–2016',
        teaser: 'First product hire, then COO: a SaaS product demoed live in six months, and a pivot to a marketplace that reached $100M in loans in two years.',
      },
    },
  },

  // ───────────────────────────── 4 · LENDIO (1)
  {
    slug: 'lendio1',
    name: 'Lendio',
    accent: 'blue',
    logo: '/bio/logos/lendio.png',
    site: 'https://www.lendio.com',
    years: '2012–2016',
    role: 'COO, Head of Product',
    facts: 'Fintech · 30 to 100 employees · $6M to $20M in annual revenue',
    about:
      'An online marketplace for small business loans. When I arrived it was a lead-generation business selling small business loan leads, mostly through landing pages.',
    mine:
      'Recruited as VP of Product, the first product hire, to change the business model through product. Later promoted to COO, with 20 direct and indirect reports across UX, customer service, implementation, people ops, and IT.',
    heroStats: [
      { num: '$100M', label: 'in loans in two years' },
      { num: '20', label: 'SaaS clients in three months' },
      { num: '0 → 10', label: 'product team, built from zero' },
    ],
    heroPhoto: 'Lendio headquarters, with signage',
    s2: {
      title: 'Change the business with product',
      sub: 'The charter: build a SaaS product for lenders, in a company that had never had a product team.',
      body: [
        'Lendio sold leads for small business loans, mostly in the subprime market. The hypothesis was that if the lenders buying those leads had a tool to manage them, they would see their conversion rates, work the funnel better, and Lendio would earn recurring SaaS revenue.',
        'The people at the center were small business owners, often under pressure, and the loan officers, brokers, and underwriters working their deals. I set a goal before the research started: demo a live product at the American Bankers Association conference in New Orleans in the fall of 2012.',
      ],
      points: [
        { h: 'Small business owners', t: 'needing options, fast, from people they can trust.' },
        { h: 'Loan officers and underwriters', t: 'juggling paper, spreadsheets, phones, and texts.' },
        { h: 'Lenders', t: 'buying leads with little visibility into what happened to them.' },
      ],
      photos: [
        'A small business owner at work in their shop',
        'A loan officer’s desk: paper, spreadsheet, desk phone, and mobile phone',
        'A bank branch and its lending team',
      ],
    },
    s3: {
      title: 'Research first: options, speed, and trust',
      sub: 'Thirty contextual inquiries, a conference room covered in sticky notes.',
      body: [
        'With lead designer Adam Tolman and CTO Trent Miskin, I ran contextual research that reached 30 enterprises, 100 personas, and 100 business owners, then spent weeks synthesizing. Every insight went onto a sticky note, the notes covered the conference room, and we grouped them: <strong>options, speed, and trust</strong>.',
        'Two things came out of it. There was clearly an opportunity to organize origination for loan officers and underwriters, which became the SaaS product. And there was an opportunity to help small business owners directly, which became the idea for a marketplace.',
      ],
      quote: null,
      photos: ['The team at the conference-room wall of sticky notes, mid-synthesis'],
    },
    s4: {
      title: 'A SaaS product, then a marketplace',
      sub: 'Built in six months, validated in three, then deliberately set aside.',
      body: [
        'We designed the SaaS product around integrated communication: CRM workflow, email, texting, telephony, calendar, and document management. Engineering took a bootcamp in Angular, then built what was at the time one of the largest Angular apps in the world. We demoed it live at the ABA conference and had 20 clients on it within three months.',
        'In parallel, four loan specialists ran an MVP of the marketplace on that same product. When it validated, I proposed pausing the SaaS and sunsetting it for clients, several of whom offered to buy it. We then built lender scoring and a North Star metric: a survey six months after funding asking whether the owner was still in business, better off, and better off because of Lendio. Roughly 90%, 89%, and 92% said yes.',
      ],
      points: [
        { h: 'ABA launch', t: 'from ambiguity to a live demo in 6 months.' },
        { h: '20 SaaS clients', t: 'signed within 3 months.' },
        { h: 'Marketplace MVP', t: '$0 to $100M in loans in 2 years; $16B cumulative by 2026.' },
      ],
      photos: [
        'The SaaS product on screen at the ABA conference in New Orleans',
        'The marketplace: one application, multiple offers',
        'Loan specialists working with small business owners',
        'The product, UX, and engineering team',
      ],
    },
    s5: {
      title: 'Principles that outlasted the product',
      sub: 'What we codified, and why I was ready to move on.',
      body: [
        'The research gave us lasting principles (options, speed, and trust) that shaped everything we built after. I grew the product team from zero to ten across PM, UX, implementation, and support, and later took on customer service, people ops, and IT as COO. Shutting down the SaaS product was hard, but handing clients a clean migration was part of earning the trust we were selling.',
        'By 2016 the marketplace was closing loans at an exponentially growing rate and revenue had climbed from about $6M toward $20M. The next step was automating applications and building a lender API, and the milestone I came for was done. BambooHR’s founders called.',
      ],
      next: {
        slug: 'bamboohr',
        label: 'BambooHR · 2016–2019',
        teaser: 'Taking over performance management, partnering with PhD organizational psychologists, and bringing payroll into a $300M HR platform.',
      },
    },
  },

  // ───────────────────────────── 5 · BAMBOOHR
  {
    slug: 'bamboohr',
    name: 'BambooHR',
    accent: 'bamboohr',
    logo: '/bio/logos/bamboohr.png',
    site: 'https://www.bamboohr.com',
    years: '2016–2019',
    role: 'Director of Product Management',
    facts: 'B2B SaaS · 600 employees · $300M in annual revenue',
    about:
      'HR software for growing companies: employee records, hiring, onboarding, and time off, built for small and mid-sized businesses.',
    mine:
      'Recruited by the founders to add new product lines. I led the organizational health product area with 3 direct reports (PMs), and mentored 10 more.',
    heroStats: [
      { num: '$25M', label: 'P&L for the performance management add-on' },
      { num: '+$30M', label: 'ARR from payroll' },
      { num: '+$10M', label: 'ARR from engagement' },
    ],
    heroPhoto: 'BambooHR headquarters, with signage',
    s2: {
      title: 'Grow past core HR',
      sub: 'The charter: new product lines on a platform known for one thing.',
      body: [
        'BambooHR was a strong core HR system. The founders wanted more: add-on products that deepened the relationship with the companies and employees already using it. They asked me to lead product for three areas.',
        'The people we served were HR leaders and managers at growing companies, and the employees whose reviews, feedback, and paychecks all ran through the product.',
      ],
      points: [
        { h: 'Performance management', t: 'already started; get it to market.' },
        { h: 'Engagement', t: 'eNPS, pulse surveys, and analytics for organizational health.' },
        { h: 'Payroll', t: 'a gap in the platform I thought was hard to defend.' },
      ],
      photos: [
        'An HR leader at a growing company reviewing their team’s data',
        'A manager and employee in a one-on-one review',
        'Employees at work in a growing office',
      ],
    },
    s3: {
      title: 'Let the science lead',
      sub: 'Multi-year research with PhDs in organizational behavior.',
      body: [
        'For performance management, I partnered with three PhDs in organizational behavior on a multi-year research project to measure what actually causes performance to change, a "smoking gun" instead of the usual assumptions, and then built the product on those principles.',
        'I hired PMs to fill out the organizational health area and guided each through their product: an eNPS add-on with configurable, white-labelable surveys and ML-driven suggestions, a pulse survey feature, and a general analytics package. On payroll, I pushed for the company to get into it, and guided a PM through due diligence on a Bay Area payroll company that BambooHR then acquired.',
      ],
      quote: null,
      photos: ['Working session with the PhD researchers and the product team at a whiteboard'],
    },
    s4: {
      title: 'Three new lines of business',
      sub: 'Performance management, engagement, and payroll, each with its own revenue.',
      body: [
        'Performance management launched as a new add-on product line with a $25 million P&L. The engagement suite (eNPS, Pulse Surveys, and Analytics) added about $10 million. I then took over the integration and migration of the acquired payroll company, distributing the work of shoring up the experience and migrating customers across the PM team, and payroll added about $30 million in ARR.',
        'The company itself ended the period at roughly $300 million in annual revenue.',
      ],
      points: [
        { h: 'Performance management', t: 'new add-on product line, $25M P&L.' },
        { h: 'Payroll', t: 'acquisition integration and migration, +$30M ARR.' },
        { h: 'Engagement', t: 'eNPS, Pulse Surveys, and Analytics, +$10M ARR.' },
      ],
      photos: [
        'The performance management product',
        'The eNPS and pulse survey dashboards',
        'Payroll running inside BambooHR',
        'The product management team',
      ],
    },
    s5: {
      title: 'Teach the PMs to run their own',
      sub: 'What I took away, and why I was ready to move.',
      body: [
        'The best part of the role was the people: three PMs reporting to me and ten more I mentored, each guided through the hardest part of their first big product (an acquisition, an ML feature, a research-backed launch). Evidence-based product work, with scientists in the room, became part of how I operate.',
        'The new lines were launched, integrated, and growing, and the team could run them. Once I reached that milestone, I knew it was time to move on. A friend from Lendio was building an AI company and wanted me to build its product organization.',
      ],
      next: {
        slug: 'aktify',
        label: 'Aktify · 2019–2021',
        teaser: 'Employee number sixteen at a conversational AI startup: human-in-the-loop training, linguists on the team, and a profitable P&L.',
      },
    },
  },

  // ───────────────────────────── 6 · AKTIFY
  {
    slug: 'aktify',
    name: 'Aktify',
    accent: 'aktify',
    logo: '/bio/logos/aktify.png',
    site: 'https://www.aktify.com',
    years: '2019–2021',
    role: 'VP of Product',
    facts: 'AI · 70 employees · $20M in annual revenue',
    about:
      'A conversational AI company building performance-based chatbots for sales and customer service, with agents trained for each client’s context.',
    mine:
      'C-team member with 20 direct and indirect reports (directors, AI PMs, analytics engineers, NLU analysts). Recruited to build the product team and create the vision and strategy.',
    heroStats: [
      { num: '71% → 88%', label: 'model accuracy' },
      { num: '2 → 20', label: 'product organization in 12 months' },
      { num: '24%', label: 'EBITDA, $4.8M annualized' },
    ],
    heroPhoto: 'Aktify offices, with signage',
    s2: {
      title: 'Teach the models, and scale the teaching',
      sub: 'The charter: a product team, a vision, and a way to train models at scale.',
      body: [
        'I joined as roughly employee number sixteen, recruited by Jason Ferriante, a friend and chief data scientist I had worked with at Lendio. My job was to build the product team and decide where the company was going.',
        'One thing stood out immediately: the process for training the conversational models did not scale. Accuracy sat at 71%, and every improvement was hand-built. The people who suffered for it were the clients’ customers, who talked to the agents, often when no human was awake.',
      ],
      points: [
        { h: 'The problem', t: 'a non-scalable process for curating and training models.' },
        { h: 'The customers', t: 'clients who deployed agents for sales and for service.' },
        { h: 'The users', t: 'people talking to those agents, any hour of the day.' },
      ],
      photos: [
        'A customer chatting with a client’s website agent on their phone',
        'A clinic front desk and website using an Aktify agent',
        'Sales and service teams reviewing agent conversations',
      ],
    },
    s3: {
      title: 'Humans in the loop, linguists on the team',
      sub: 'Two moves at once: build the tooling, and staff the teaching.',
      body: [
        'First, I chartered an internal system to automate and manage curating, monitoring, building, and deploying models, and hired Seth Christensen as Director of User Experience to research and design it.',
        'Second, I assembled a team of affordable experts. I recruited “NLU analysts” from the linguistics departments at BYU and the University of Utah: graduates in a niche field who were not sure how they would use their degrees. The model flagged conversations it handled poorly, aggregated them, and sent them to the linguists to say how the conversation should have gone.',
      ],
      quote: null,
      photos: ['The product, design, and NLU analyst team reviewing flagged conversations'],
    },
    s4: {
      title: 'Accuracy up, team built, profitable',
      sub: 'A human-in-the-loop system, an organization, and a business that paid for itself.',
      body: [
        'Model accuracy rose from 71% to 88%, and training became efficient and repeatable. The product organization grew from 2 to 20 people in 12 months, spanning AI product managers, NLU analysts, analytics, and UX, with Ashley Wilson (PhD) and Cassandra Darley as PMs and analytics engineer Austin Adair, whom I promoted and trained into product.',
        'I also created a vision and strategy for a consumer-centric conversational AI product, which attracted $150 million in VC funding that we chose to decline, and ran the P&L of a $20 million business at a 24% EBITDA margin.',
      ],
      points: [
        { h: 'Conversational AI training', t: 'HITL model training; accuracy 71% to 88%.' },
        { h: 'Product organization', t: 'AI PM, NLU, analytics, and UX teams; 2 to 20 in 12 months.' },
        { h: 'Vision and strategy', t: 'consumer-centric AI; attracted and declined $150M in VC funding.' },
        { h: 'P&L', t: '$20M business at 24% EBITDA ($4.8M annualized).' },
      ],
      photos: [
        'The model-training management tool',
        'NLU analysts reviewing conversations',
        'An agent conversation in a client’s experience',
        'The Aktify product team',
      ],
    },
    s5: {
      title: 'The most rewarding outcome',
      sub: 'What the work meant, and why I was ready to move.',
      body: [
        'My favorite result came from a nationwide chain of rehabilitation clinics with an agent on its website. Analysts saw people reach out in the middle of the night, some in real crisis. Trained for that context, the agent could stay with them through the night and hand them to a human who could help.',
        'With the training infrastructure, the human-in-the-loop process, and the strategy in place, and the business profitable, I had delivered what I came for. Trent Miskin and Brock Blake had been trying to bring me back to Lendio, and the timing finally worked.',
      ],
      next: {
        slug: 'lendio2',
        label: 'Lendio · 2022–2026',
        teaser: 'Back as SVP of Product to bring banks into the marketplace, which became lender SaaS, embedded lending, and Forward Flow.',
      },
    },
  },

  // ───────────────────────────── 7 · LENDIO (2)
  {
    slug: 'lendio2',
    name: 'Lendio',
    accent: 'blue',
    logo: '/bio/logos/lendio.png',
    site: 'https://www.lendio.com',
    years: '2022–2026',
    role: 'SVP of Product',
    facts: 'Fintech · 300 employees · $100M in annual revenue',
    about:
      'Now the largest online marketplace for small business loans. This time the company had grown to 300 people and $100 million in annual revenue.',
    mine:
      'Recruited for a second time to lead the product team and create new product lines, with 40 direct and indirect reports across directors, PMs, and UX designers.',
    heroStats: [
      { num: '$9B', label: 'in capital attracted (Forward Flow)' },
      { num: '$20M', label: 'annual loans, Lender SaaS' },
      { num: '$18M', label: 'annual loans, Embedded lending' },
    ],
    heroPhoto: 'Lendio headquarters, with signage',
    s2: {
      title: 'Bring the banks into the marketplace',
      sub: 'The charter: a lender SaaS product that could attract banks and automate their underwriting.',
      body: [
        'Up to then the marketplace offered mostly fintech and alternative lenders, and Lendio’s loans skewed subprime. But many of the owners who arrived were prime-qualified. Banks held their deposits, yet generally steered clear of loans under $1 million as too costly and risky to underwrite.',
        'The strategy was to return to the idea behind the original SaaS product, a lender tool with recurring revenue, and to make bank-quality options available to small business owners. It also played into the “options” principle that had guided Lendio from the start.',
      ],
      points: [
        { h: 'Small business owners', t: 'prime-qualified, needing cheaper and larger options.' },
        { h: 'Bank lenders', t: 'wanting small business customers, not trusting full automation.' },
        { h: 'Marketplace sellers', t: 'wanting better products to offer applicants.' },
      ],
      photos: [
        'A small business owner at a truck, bakery oven, or shop counter',
        'A community bank’s lending officers',
        'The Lendio sales team on a call with an applicant',
      ],
    },
    s3: {
      title: 'Take the front line, go from 0 to 1',
      sub: 'When the first approach failed, I asked to lead it myself.',
      body: [
        'I began by managing from a high level. One group was building an acquired, never-released underwriting tool. It had no roadmap and no release plan, and when the target was missed I stepped in. That effort ended in a total loss that pre-dated me and took about a year to manage out.',
        'I then asked the C-team to let me lead as a front-line leader and pick my own PMs and engineers. I interviewed each of them and told them honestly how hard it would be, a filter in the style of Shackleton, so only people ready for something hard would sign on. We met daily for a month, formed pods, set a beta date, and built for three months.',
      ],
      quote: null,
      photos: ['The 0-to-1 team in a pod working session, mid-build'],
    },
    s4: {
      title: 'Three new business lines',
      sub: 'Intelligent Lending, Embedded Lending, and Forward Flow.',
      body: [
        '<strong>Intelligent Lending</strong> gave banks automated decisioning, a white-labeled application, core-system integration, CRA targeting, and instant offers. We demoed in-house, landed a beta bank, and added a second within a month.',
        '<strong>Embedded lending</strong> put that application inside the products of Paychex, Lowe’s, and Dun &amp; Bradstreet. <strong>Forward Flow</strong> let a capital source say “fund loans that look like this” while Lendio automated origination and closing, earning on acquisition and on loan performance.',
      ],
      points: [
        { h: 'Lender SaaS', t: 'automated bank origination, $20M in annual loans.' },
        { h: 'Embedded lending', t: 'small business service providers, $18M in annual loans.' },
        { h: 'Forward Flow', t: 'AI decisioning and capital deployment, $9B in capital attracted.' },
      ],
      photos: [
        'The lender portal and decisioning screens',
        'A white-labeled application on a partner’s site',
        'Bank partners and capital sources',
        'The product team shipping',
      ],
    },
    s5: {
      title: 'Earn trust, then automate',
      sub: 'What I learned, how the team adapted, and why I moved on.',
      body: [
        'Banks did not trust full automation at first, so we sequenced the strategy: a lender portal with a clear audit trail of every decision, then, once trust was earned, full automation and Forward Flow. To raise the craft of a 40-person team, I set agreed standards and a 30-, 60-, and 90-day path. Those who delivered called it the biggest leveling up of their careers.',
        'In my last month I shipped 12 production features with Claude Code. My milestones were met, but Lendio’s core business was shrinking while the new lines had not yet grown large enough to offset it. Rather than leave my team to carry the cuts, I chose to move on.',
      ],
      next: {
        slug: null,
        label: 'What’s next',
        teaser: 'Looking for my next product leadership role in AI, SaaS, or fintech.',
        href: '/bio/',
        cta: 'Back to the executive bio',
      },
    },
  },
];
