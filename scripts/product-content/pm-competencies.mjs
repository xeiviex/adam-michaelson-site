// Written content for /product/pm/competencies/<slug>/, adapted from Adam's "Product Manager Competencies" doc.
// Section shape: { h: heading, p: paragraph(s), ul: [items] }. An item is a string or { t, sub: [strings] }.
// Inline: **bold** and [text](url). Private Drive/Docs links and "training assets" entries are intentionally left out
// (this repo and site are public).

export const PM_COMPETENCY_CONTENT = {
  vision: [
    { h: "What it is", ul: [
      "The product manager's view of a future state",
      "A statement of this ideal destination",
      "Focused on the person you are serving",
      "Something that makes the world (or the world of the person you serve) a better place",
      "Infinite in nature -- that is, you may always strive for this ideal; even if you can get to the ideal state for a time, there is probably a propensity to fall out of it.",
      "A north star -- something that always shows you the direction you should be going",
      "Inspires and creates a movement -- for the people you serve, the market, and the people you lead",
    ] },
    { h: "Why it's important", ul: [
      "Gives the product, you and everyone else clear purpose and direction",
      "Helps in guiding strategy, research, scope, and prioritization",
      "Ensures that you are driven by lasting principles rather than vanity metrics",
    ] },
    { h: "When you need it", ul: [
      "When you're taking over a product, you'll need to create/update it",
      "In the creation of product strategy (identification of problems, policies, action)",
      "Creating KPIs for measuring whether you're moving toward the ideal",
      "When you communicate with anyone about your product (research, roadmap, etc.)",
      "Working with product marketing to create training, messaging, content, etc.",
      "Every year, you should validate and/or refresh it",
      "Alignment and prioritization of roadmap, scoping features, etc.",
    ] },
    { h: "How to get it", ul: [
      "**Empathy.** You need to understand the people you serve, their context, their challenges and their goals. Do this through demographic studies, interviews and contextual inquiry.",
      "**Company vision.** Dive into the history, purpose and direction of the company. If there is a stated vision (like \"survive and thrive\"), you will need to explore where that came from and how that aligns with the other research you've done.",
      "**Higher-level product vision.** If there is a higher level product vision, you will need to comprehend that product vision first (including the background) and compare it to what you learn from your other research.",
      "**Be creative and visionary.** As you immerse yourself in the research, you must intuit your purpose and north star. You will know it when you come to it because it will match the obstacles and objectives of the people you serve, it will align with the company and overarching product vision, and it will resonate with everyone involved.",
      "**Validate and evangelize.** Once you have the embryo of your vision, draft something that communicates the context and the dream. Share it with the people the vision is focused on, as well as internal stakeholders (execs, product leaders, leaders from other areas in the company) and measure how well it resonates. Stick with your findings, but don't be too stubborn -- be open to the need for adjustment.",
    ] },
    { h: "Examples", ul: [
      "[\"I Have a Dream\"](https://www.youtube.com/watch?v=vP4iY1TtS3s) -- Martin Luther King, Jr.",
      "The Greatest Showman -- people are fascinated with the exotic and the macabre; \"the noblest art is that of making others happy.\"",
      "Google: \"to provide access to the world's information in one click.\"",
      "Apple (under Steve Jobs): \"To make a contribution to the world by making tools for the mind that advance humankind.\"",
      "Amazon: \"to be Earth's most customer-centric company, where customers can find and discover anything they might want to buy online.\"",
      "Tesla: \"To accelerate the world's transition to sustainable energy.\"",
      "BambooHR: \"Set people free to do great work.\"",
      "Drawing a line -- The Three Amigos",
      "We Are Marshall",
    ] },
    { h: "Resources", ul: ["Start with Why"] },
    { h: "The competency", p: "A product manager must be able to create a vision out of a myriad of inputs. You have to be able to see something that is not there -- something new and inspiring to you and others, and which resonates in the target market." },
    { h: "Outputs and deliverables", p: "A north star that comes from compelling research, which you are passionate about, that is meaningful, that aligns with the overarching product/company vision/mission and that inspires others -- internally and externally. This should be reviewed, revised (as needed), and validated annually.", ul: [
      "**Synthesis of research.** Must be done at least annually, but should be ongoing. Must include (but is not limited to) stakeholder interviews, market research (landscape, literature, trends, etc.), usage/usability data, business data (revenue, conversion, NPS, etc.), sales and support records, customer feedback, contextual/on-site visits.",
      { t: "**A deck** that articulates the people we serve, the problem (including research around it) and the conceptual solution. A vision statement should cover these bases:", sub: [
        "**Mission / \"I have a dream\".** There should be a clear statement of what the future looks like -- something striking, resonating, compelling and inspiring. This must be derived from and validated by the research.",
        "**Why, How, What.** A statement of what we're passionate about in the domain of the product, the product principles, and the scope of the product. This must roll up to the overarching product vision.",
      ] },
      "A method for quantifiably measuring our progress toward the ideal state",
      "A visualization of the complete scope (either as a concept, planned design, or existing solution)",
    ] },
    { h: "Outcomes", ul: [
      "Quantifiable (and significant) validation from the target market",
      "Internal alignment in terms of understanding and resonance",
      "Significant quantifiable market validation of the designed solution",
      "Data to show that we are actually solving the problem",
    ] },
  ],

  strategy: [
    { h: "What it is", p: "A repeatable framework that targets specific and meaningful problems, employs effective policies, and prescribes coherent action." },
    { h: "Why it's important", p: "Mitigates obstacles between where we are and the vision. Creates and maintains the underpinnings of a brand. Disciplined adherence to strategy ensures that we move toward and attain the vision." },
    { h: "When you need it", ul: [
      "When you create a vision.",
      "When you encounter a new problem.",
      "When you conclude that your strategy is ineffective.",
    ] },
    { h: "How to get it", ul: [
      "**Understand.** Identify the problems, gaps, and obstacles between you and the vision. Consider the governing principles and direction. Find out the whole story, the history, and the brutal facts.",
      "**Establish policy.** What proven principles best apply to the problems at hand? Set boundaries and easy to understand rules that make it easy to know what you will and won't do.",
      "**Design the moves.** Use analogies. Exploit opportunities (and weaknesses of the opponent). Leverage strengths. Be creative, but sensible and efficient.",
    ] },
    { h: "Examples", ul: [
      "The Battle of Cannae",
      "Chess: win the game, then work backward to strategies",
      "Jack Lengyel (We Are Marshall): didn't have a strong offensive line, so he ran the veer, helped the kids get through, and kept playing",
      "AtTask: focus on the front-line worker to drive adoption of project management (validated 4x and 5x adoption by the two key personas)",
      "P.T. Barnum (\"the noblest art is that of making others happy\"): make people happy, because people are fascinated with the exotic and the macabre, so recruit the exotic and macabre and bring it to the people",
      "BambooHR: Complete Solution, Top Quality, Proven Principles, Actual Results",
    ] },
    { h: "Resources", ul: [
      "[Good Strategy, Bad Strategy](http://goodbadstrategy.com/)",
      "Great by Choice",
    ] },
    { h: "The competency", p: "You have the ability to take the vision and infer/outline the tactical steps necessary to attain the dream. Specifically, you 1) identify the persistent problems that bar the way toward the vision, 2) create effective policies and employ proven tools that address the problems/exploit opportunities, and 3) outline specific (even repeatable) action that creates a path to/ensures the vision." },
    { h: "Outputs and deliverables", p: "A path toward the vision in terms of persistent problems to solve, policies that address the problems, and coherent action toward the vision. The strategy should be reviewed, revised (as needed), and validated quarterly. Include these assets:", ul: [
      "A kernel of product strategy: the problems, the policies, and the coherent action",
      "Alignment with / from all key stakeholders",
      "A roadmap (a high level ordered list/schedule of steps toward the vision for the next 1-3 years)",
    ] },
    { h: "Outcomes", ul: [
      "Internal alignment in terms of understanding and resonance",
      "Validation that the strategy is working, in terms of the product's ROI framework and KPIs",
    ] },
  ],

  leadership: [
    { h: "What it is", p: "The ability to inspire and motivate people to change and follow a cause." },
    { h: "Why it's important and why you need it", ul: [
      "Creates alignment around your vision and strategy",
      "Creates momentum and more efficient progress toward the vision",
    ] },
    { h: "How to get it", ul: [
      "**Be an expert in your craft.** It is difficult to lead (and for others to follow you) if you don't have a firm grasp on, deep experience in, and proven results through your discipline.",
      "**Get out of your boxes.** Don't waste time blaming others or circumstances, focus on what you can truly change: yourself. Humility is the key to developing character and winning the hearts of those you serve.",
      "**\"Dress the part\".** This means that you present yourself in a way that instills confidence and trust. Those around you should feel comfortable calling you their leader, and whether you like it or not, how you look, communicate, your calm assertiveness, your confidence and every other way you convey yourself creates a presence and charisma. A leader must be able to command the respect of others by how they are perceived. Think George Washington.",
      "**Get a compelling vision.** \"Where there is no vision, the people [are leaderless].\" Those you lead need to be converted to a purpose. It is your job to ignite their passion through a dream that truly resonates.",
      "**Recruit, create, and delegate genius by [multiplying](https://thewisemangroup.com/books/multipliers/) others.** You cannot do it alone, and if you try, the results will be somewhere between lackluster and disastrous. Take a leap of faith and trust those around you by challenging them and adding their strengths to the movement. This is how you get a flywheel moving.",
    ] },
    { h: "Examples", ul: [
      "Joan of Arc",
      "George Washington",
      "Mother Teresa",
      "Ernest Shackleton",
      "Indra Devi",
      "Florence Nightingale",
      "Martin Luther King, Jr.",
      "Gandhi",
      "The Level 5 leaders in Good to Great",
    ] },
    { h: "Resources", ul: [
      "Linchpin (becoming the expert)",
      "Leadership and Self Deception (emotional intelligence)",
      "Multipliers (creating genius in others)",
      "Leaders Eat Last (building others first)",
      "Good to Great (Level 5 leadership)",
    ] },
    { h: "The competency", p: "You are able to take chaos and create organization through your own efforts and (more importantly) by inspiring, motivating, and empowering others to make change. You are able to bring alignment and focus to disparate groups and people." },
    { h: "Outputs and deliverables", p: "Collective movement toward and alignment with the product vision.", ul: [
      "Relationship building",
      "Communication of product direction",
      "Tactics for multiplying others",
    ] },
    { h: "Outcomes", ul: [
      "Trust, from the team and stakeholders",
      "Clarity and organization around specific goals",
      "An army of converted leaders who (along with you) are delivering ROI toward the product",
    ] },
  ],

  "project-management": [
    { h: "What it is", p: "Effective planning and getting things done efficiently, on time, and at minimized risk." },
    { h: "Why it's important", ul: [
      "Delivers the scope toward the vision",
      "Identifies and organizes all required tasks",
      "A realistic plan allows us to prioritize and project resource requirements and timelines",
      "Effective project management deftly navigates change and mitigates risk",
      "Consistent project management enables us to more accurately estimate and to build out checklists (and templates) that increase quality assurance",
    ] },
    { h: "When you need it", ul: ["Research projects", "Design projects", "Development", "Release management"] },
    { h: "How to get it", ul: [
      "Start with yourself: break down your work into tasks, order them, schedule them, make this a daily and weekly ritual.",
      "For each project ensure you have: a clear, detailed, aligned, and prioritized breakdown of tasks; everything scheduled with dates and dependencies; consistent and regular coordination and communication; regular scope management practices to ensure you are minimizing risk and ambiguity.",
      "Make a habit of taking notes and organizing them -- these will help you to keep track of requirements, tasks, risks and other elements of project scope. A good project manager has all the information.",
      "Get comfortable with cutting scope and setting deadlines -- what is essential and what can be postponed? A good project manager whittles the scope down to minimal, but always has a backup strategy for prioritization in case of change.",
      "**Get estimates for everything.** Whenever a task is identified, always ask \"how long will that take\", write down the estimate (this helps to create the timeline), and then manage closely to the estimates to mitigate risk.",
      "**Identify dependencies.** Make sure you know what needs to be done before / after each task. This will give you the critical path for the project and help to manage the timeline.",
      "**Identify risk and create backup plans.** Make a habit of asking \"What could go wrong with this?\" and \"What would we do if this went south?\" Make sure that people are aware of and assigned to the mitigation plans.",
      "**Update the project plan and copy it for future plans.** Each project is a valuable record and ultimately a template for similar projects in the future. If you start a plan from scratch each time, you are not learning from the past. Each plan should learn from and be better than the previous.",
    ] },
    { h: "Resources", ul: ["The Checklist Manifesto", "PMBOK"] },
    { h: "The competency", p: "You are able to take the strategy and break it down into specific projects, tasks, and steps. You are able to manage scope, timeline, risk, alignment, coordinate meetings and the details of the work from research to brainstorming and design, from estimation and development to release and monitoring." },
    { h: "Outputs and deliverables", p: "An ordered, prioritized, vetted, fleshed out, and estimated list of specifications and Jira tickets that provide the necessary instructions and designs for development to execute. The product backlog should always be ahead of dev by months.", ul: [
      { t: "**A 6 month backlog**, measured in estimated work, as follows (all of which is in Jira):", sub: [
        "**Ready-ready work for the next 2 months.** Detailed specs that have answered all outstanding questions, include detailed designs, and have a breakdown of work into atomic tasks that are estimated in story points / days. The total estimates ensure that the respective dev team could easily pull anything off of that prioritized list and stay busy for at least 2 months.",
        "**Ready to estimate work, totaling 2 months in ROM estimates.** Well-defined specs with enough detail and design to be ready for detailed project planning. The project planning has not been done yet, and all we have is an epic in Jira plus the spec and designs to cover the high level flows.",
        "**Ready for design work, totaling 2 months in ROM estimates.** A collection of rough specs (problem defined, general scope outlined, may have some sketches / concepts) that have an early ROM estimate and have been prioritized for design to start diving in and fleshing out.",
      ] },
      "A broken down, ordered timeline with dependencies and deadlines -- managed and shown to be on-time, on-quality, with minimized risk, and well-managed warranty / assessments.",
      "At least one specification per PM per month.",
      "**Weekly demos in production.** Each demo shows clear incremental progress toward the monthly releases. It also reveals that not only are you ensuring things get done, but that it is broken down sufficiently.",
      "**Monthly releases.** A deployment to customers. Each product swimlane should have one per month. This includes a plan for warranty, monitoring, iteration and assessment.",
    ] },
    { h: "Outcomes", ul: [
      "ROI in terms of progress toward vision, improved quality, increased adoption, and economic gains",
      "A reputation (internally and externally) of stability, predictability, reliability",
    ] },
  ],

  communication: [
    { h: "What it is", p: "Receiving and conveying ideas and information so that people understand and progress is made." },
    { h: "Why it's important", ul: [
      "You understand others' perspectives and the dynamics at play",
      "People catch the vision, understand the product strategy, and anticipate the roadmap",
      "Everyone is aware of the status and action being taken",
      "Issues are resolved, progress is made and change is navigated efficiently",
    ] },
    { h: "When you need it", ul: [
      "Coordination in research, design, scoping, and planning",
      "Status meetings and presentations (in person and otherwise)",
      "Written communication in emails, texts, Slack, etc.",
      "Conflict resolution",
    ] },
    { h: "How to get it", ul: [
      "Identify your key stakeholders, get to know them, their goals, their communication styles / preferences",
      "[\"Seek first to understand, then to be understood\"](https://www.franklincovey.com/the-7-habits/habit-5/)",
      "[\"Start with heart\"](https://cruciallearning.com/blog/crucial-conversations-skill-summary-start-with-heart/)",
      "Set up regular channels and triggers for communicating direction and status",
      "Learn and apply principles of conflict resolution",
      "Establish, repeat and reinforce clarity",
      "Learn how to expertly format and deliver communication in various formats (in-person, Slack, email, presentation, documentation, etc.)",
    ] },
    { h: "Resources", ul: [
      "The 7 Habits of Highly Effective People (Habit 5)",
      "[The Advantage](https://www.tablegroup.com/books/the-advantage/) (disciplines 2, 3, and 4)",
      "Crucial Conversations",
      "Radical Candor",
      "The Anatomy of Peace",
    ] },
    { h: "The competency", p: "You are an effective communicator from email and phone conversations to in-person presentations (including the formatting and delivery) and negotiations -- both internal and external. You are a good listener and have an outward mindset. You are not hasty or hot headed. You're able to calmly respond to feedback, questions and concerns about you, your work, and the product. You come across as professional, confident, intelligent, direct, creative, personable, and as a leader.\n\nThe quality of your communication is clearly superior, such that others look to you to help draft content, communicate topics, demonstrate product, engage with customers, etc. Your communication is rarely misunderstood, is well-received, and is efficient at communicating large and complex topics in short.\n\nThe frequency of your communication and your use of comprehensive / correct channels ensures that people are always in the know. Due to the efficiency / quality of your communication, it doesn't suffer from \"banner blindness\" and is well-consumed / adopted." },
    { h: "Outputs and deliverables", p: "The product manager must work with the product marketing, support, dev, UX, and exec teams to get alignment, get feedback, and ensure the highest quality, customer experience, and ROI (in terms of vision, adoption, and business value). Each of these teams should always be well-informed and aligned with the vision, strategy, and status.", ul: [
      "Regular 1:1s with team and key stakeholders (weekly, monthly, or whatever is best) with sufficient time to address all major concerns",
      "Regular alignment sessions with key stakeholder groups, and gathering their feedback",
      "Ad-hoc updates and feedback sessions with key stakeholders",
      "Release communication (internal and external) as well as demonstrations and conveying the roadmap to key audiences",
    ] },
    { h: "Outcomes", p: "The following can be demonstrated between you, your key stakeholders and the relevant audiences (internal and external):", ul: [
      "Shared understanding",
      "Improved relationships/trust",
      "Coordinated action",
      "ROI that was driven through / with excellent communication",
    ] },
  ],

  "data-informed-decisions": [
    { h: "What it is", p: "Hypothesizing, experimenting, observing, learning, creating and building on theories." },
    { h: "Why it's important", ul: [
      "There is no way to know what will work until you actually try it out",
      "The quickest way to the best solution is experimentation and iteration",
      "The best solutions are based on (scientifically / quantitatively) proven principles -- theories",
    ] },
    { h: "When you need it", ul: [
      "**Research** -- to define hypotheses and set up experiments and observations that lead to theories that we can design around",
      "**Design** -- create concepts to test out, observe, and iterate, reform/refine the theories",
      "**Monitoring** -- after a solution is deployed, observe, learn, iterate, reform/refine theories",
    ] },
    { h: "How to do it", ul: [
      "**Research.** Conduct primary and secondary research, and quantify (to relative significance) all of the results of your research in a synthesis.",
      "**Hypothesis.** After you've conducted enough research to venture a guess, share that with others for validation; this will be in the form of a concept (could be mocks or a clickable prototype), charter or specification.",
      "**Experiments.** Either validation sessions (with mocks / concepts) or the release to users of a solution developed based on your specification(s), along with monitoring to learn / validate.",
      "**Share findings.** Return to your research participants and key stakeholders to report on the quantitative / qualitative findings and to share next steps.",
      "**Develop a theory.** With the data from the experiment and the feedback from the sharing sessions, calibrate the validated learnings / findings and document them in the form of a documented and well-laid-out theory (i.e. \"this persona behaves this way and prefers to use these kinds of tools in this way and doing so yields this kind of ROI\"), which becomes a product principle.",
      "**Build on a theory.** Conduct new research to find problems and design solutions in the space of your theories, validating them in a similar way.",
      "**Iterate.** Decide whether to pivot or persevere.",
      "**Be objective.** It's not all roses. Make sure to balance the case for with the case against.",
    ] },
    { h: "Resources", ul: [
      "The Lean Startup",
      "Solving Product",
      "About Face",
      "Trustworthy Online Controlled Experiments",
    ] },
    { h: "The competency", p: "You are able to postulate meaningful hypotheses and create a method for invalidating them. You carefully gather, store, and analyze data through observation. You routinely challenge perceptions and keep a healthy skepticism until hypotheses can be validated. You work hard to eliminate bias by triangulating the truth through several tests of the hypothesis. Your work leads you to the development of theories backed by experimentation and data." },
    { h: "Outputs and deliverables", p: "Data backed and well-referenced/triangulated findings through experimentation and observation. Well-documented findings referenced in charters, specifications, and reports.", ul: [
      "Regular research with monthly (at least) syntheses shared to the team",
      "Validation data (customer feedback on product, usability tests, perception tests, etc.)",
      "Assessments of monitored releases on judgment days",
    ] },
    { h: "Outcomes", ul: [
      "Product roadmap/specs based on scientific data",
      "Validated learnings",
    ] },
  ],

  "technical-skills": [
    { h: "What it is", p: "Being a valuable partner for each of the cross-functional leads (engineering, UX, data science, marketing, etc.) in the product delivery process." },
    { h: "Why it's important", ul: [
      "With a solid partner, the solution designer can create the best solution",
      "You can appreciate why certain things work and why others don't",
      "The process is more efficient if you comprehend and leverage basic principles",
    ] },
    { h: "When you need it", ul: [
      "**Research:** contextual inquiry, persona development, systems analysis, gathering data",
      "**Design:** brainstorming, giving meaningful feedback, writing specs that give guidance, are specific enough to be helpful, and/or speak in the language of the respective discipline",
      "**Release strategy:** understanding principles of UX as well as architecture can help you to create a phased release that is efficient and empathetic",
    ] },
    { h: "How to do it", ul: [
      "**User research.** Make it a priority to plan and carry out contextual inquiry (on-site visits) with target customers/users and at least act as a coordinator for persona research/development.",
      "**Technology research.** Make it a priority to plan and carry out systems analysis and market research around technology and patterns that could be leveraged toward an ideal solution.",
      "**Know the principles.** Educate yourself and get comfortable with the principles of UX and system architecture so that you can be a valuable contributor to brainstorming and design feedback. You need to be able to cite principles and understand proven concepts rather than just saying \"I like this\" or \"I don't like that\".",
      "**User testing.** Make sure that every design is tested with target users. If it's a huge change or new product, it needs to be done comprehensively and methodically. If it's a small change to an existing product/feature, you can get by with quick and dirty guerrilla testing.",
      "**Design validation.** Pre- and post-development/release, you need to coordinate running designs by stakeholders and target customers/users to validate that you are maintaining/promoting the brand and that you have a solid aesthetic and interaction design.",
    ] },
    { h: "Resources", ul: [
      "About Face",
      "The Design of Everyday Things",
      "[Laws of UX](https://lawsofux.com/)",
      "Don't Make Me Think",
    ] },
    { h: "The competency", p: "You are able to be a helpful partner in the process of product creation, from concept to feedback on visual/interactive designs and high level system architecture. You don't only understand and are versed in the principles and processes behind product design, but you are also able to employ them intelligently in a conversation with a solution designer in the context of your product -- to the extent that you are a meaningful contributor." },
    { h: "Outputs and deliverables", p: "Maximized quality in every aspect of the product's design (in terms of its performance). Validated solution designs referenced in the specification and (optionally) in the Jira ticket. On the UX side:", ul: [
      "A monthly synthesis of user research shared with the team",
      "Validated (usability tested, perception tested, design system compliant) mocks for specs on at least a monthly basis",
      "A system-wide quality-of-experience (QX) score per year / major release, and adjustments based on the audit",
    ] },
    { h: "Outcomes", ul: [
      "Top/improved QX scores",
      "Clear ROI attributed to design",
    ] },
  ],

  "results-and-ownership": [
    { h: "What it is", p: "Following through to ensure that things get done and, more importantly, that the anticipated benefits are delivered. But if the minimum value is not delivered, true ownership means that you iterate to ensure ROI or pivot." },
    { h: "Why it's important", ul: [
      "As a business, we can't rely on simply shipping product -- we need to know that it's actually delivering ROI, quantitatively",
      "The product manager is entrusted with scarce (and expensive) resources, our brand, and the customer's expectations",
      "Without demonstrated ROI, the product manager is at best a project manager and at worst a liability",
    ] },
    { h: "When you need it and how to do it", ul: [
      "**Research:** Pay attention to (and dive deep on) the magnitude of the problems and opportunities you observe.",
      "**Definition:** Define the magnitude of the expected benefit based on your assessment of the magnitude of the problem / opportunity -- and how it should be measured.",
      "**Design:** Validate (through testing, interviews, etc.) that the solution will deliver the expected benefit -- and to the desired magnitude.",
      "**Dev:** Put together the mechanisms for gathering the data to track ROI.",
      "**Release:** Deploy the mechanisms for gathering the data to track ROI, and start the cadence of reporting on ROI.",
      "**Assess:** Monitor, report, iterate, validate, and when the judgment day arrives, make the hard decisions.",
      "**Product KPI tracking:** Your business outcomes should be quantified by comprehensive data.",
    ] },
    { h: "Resources", ul: ["The Goal", "Extreme Ownership (Chapter 1)"] },
    { h: "The competency", p: "You are willing, proactive and effective at seeing your work through. You get started and create a path forward with minimal direction -- you see yourself as the leader. Although you are good at knowing when/how to delegate, you are not satisfied with passing the buck. You take responsibility for all outcomes relating to your work, you ensure quality, and do the right thing for the users, for the business, for your team, and for the product." },
    { h: "Outputs and deliverables", p: "The product manager is on the hook for ROI. Monitoring and iterating on learnings are key to maximizing ROI and minimizing loss. The product manager demonstrates this accountability to the product, design, dev, product marketing, support, and exec teams. The aim is a way to clearly measure whether the product is moving toward the vision, whether it has the appropriate adoption, and whether it is generating the expected business value. This includes managing a P&L (even if it's estimated).", ul: [
      "**Product KPIs.** Definitions, goals, and data showing progress toward goals. Published, for measuring ROI of the product (vision, quality, adoption, economics).",
      "**Product metrics.** Definitions, parameters, and data showing status.",
      "**A balanced P&L.** Revenue, costs, and net over time, tracked monthly and specific to the product.",
      "Proactive steps toward gathering feedback (on the product, direction, team, etc.) and taking action on the feedback",
    ] },
    { h: "Outcomes", ul: [
      "Improved product KPIs over time",
      "Adjustments and data-backed improvements as a result of feedback and action",
      "A P&L that shows profitability or a trend toward it",
    ] },
  ],
};
