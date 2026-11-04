// Endorsement quotes for the carousels on /bio/ and each company page.
// To add a quote, copy one entry and edit it. Fields:
//   q      the quote text (no surrounding quote marks needed)
//   by     key from PEOPLE below (add a new person there if needed)
//   pages  where it shows: 'main' (/bio/), 'lendio1', 'lendio2', 'bamboohr', 'aktify', 'workfront', 'optum', 'altabank'
//   post   optional link to the full post; shown as "see full post here"
// The carousel shuffles order on each visit and spaces each person out, so order here doesn't matter.
(function () {
  var BROCK_POST = 'https://www.linkedin.com/posts/brockblake_anyone-looking-for-a-strong-product-leader-activity-7515563601546461184-E0KT';
  var STEVE_POST = 'https://www.linkedin.com/posts/stephenballard_as-a-design-leader-you-remember-the-product-activity-7515859545248727041-Esqm';

  var PEOPLE = {
    brock:   { name: 'Brock Blake',     role: 'CEO at Lendio' },
    spencer: { name: 'Spencer Grider',  role: 'VP at Sprout Marketing' },
    romney:  { name: 'Romney Williams', role: 'CEO at Dryout' },
    paul:    { name: 'Paul O’Donnelle', role: 'VP of Engineering, Lendio' },
    mart:    { name: 'Mart Withers',    role: 'Co-Founder, Estate Share' },
    sam:     { name: 'Sam Strong',      role: 'Principal PM at Encino' },
    steve:   { name: 'Steve Ballard',   role: 'Head of Design at BambooHR and Workfront' },
    abe:     { name: 'Abe Knell',       role: 'Co-Founder, Head of Sales at Workfront' },
    trent:   { name: 'Trent Miskin',    role: 'Co-Founder and CTO at Lendio' },
    patrick: { name: "Patrick Hendry", role: "Senior Product Manager at Entrata" },
    jason: { name: "Jason Ferriante", role: "VP of Data Science at SecurityScorecard" },
    luke: { name: "Luke Eastman", role: "UX Designer" },
    brenda: { name: "Brenda Pfeifer", role: "Quality Assurance Manager at Workfront" },
    jessie: { name: "Jessie Warner", role: "Fractional CMO" },
    jonathan: { name: "Jonathan Rejholec", role: "VP Product at BambooHR" },
    sean: { name: "Sean Stephenson", role: "VP of Architecture at SAP Taulia" },
    russ: { name: "Russ Drury", role: "Director of Customer Success at Hubstaff" },
    qwade: { name: "Q Wade Billings", role: "Director of Global IT Ops and Security, Workfront" },
    brett: { name: "Brett Garlick", role: "VP of HR at Progrexion" },
    bruce: { name: "Bruce Miller", role: "CIO at AltaBank" },
    greg: { name: "Greg Jepperson", role: "SVP at Yellowstone Bank" },
    joel: { name: "Joel Meyer", role: "CPO at Vimocity" },
    brent: { name: "Brent Olson", role: "Lead Engineer at Optum Insight" },
    ty: { name: "Ty Kiisel", role: "VP Marketing at Workfront and Lendio" },
    joshua: { name: "Joshua Steimle", role: "CEO at MWI" },
    tolman: { name: "Adam Tolman", role: "Head of Product Design at DX" }
  };

  var QUOTES = [
    // Brock Blake (Lendio, last-month and leadership post)
    { by: 'brock', pages: ['main', 'lendio2'], post: BROCK_POST, q: 'Anyone looking for a strong product leader? Someone who can lead product vision, strategy, and execution? Adam Michaelson is that guy.' },
    { by: 'brock', pages: ['main', 'lendio2'], post: BROCK_POST, q: 'He is a 10xer.' },
    { by: 'brock', pages: ['main', 'lendio2'], post: BROCK_POST, q: 'He builds product organizations. Adam is focused on product craft and on elevating both the organization’s output and his team’s careers. He is equally at home as the only product person in a company and as the leader of a large organization across PM and UX, and his influence extends across the entire company either way.' },
    { by: 'brock', pages: ['main', 'lendio2'], post: BROCK_POST, q: 'He builds with AI himself. In his last month at Lendio, Adam shipped multiple features to production and contributed over 60k lines of code, forward deployed with AI. He can set AI product strategy with a CEO and also get in and build it, making him a great fit as a CPO in today’s landscape.' },

    { by: 'spencer', pages: ['main', 'lendio1'], q: 'Michaelson is easily one of my top 5 people I’ve ever worked with.' },
    { by: 'romney',  pages: ['main', 'lendio1'], q: 'On top of his immense skill set and high performance, Adam is a high character guy who is a total pleasure to be around.' },
    { by: 'paul',    pages: ['main', 'lendio2'], q: 'Adam is amazing. He’s one of those guys that I would absolutely jump at the chance to work with again.' },
    { by: 'mart',    pages: ['main', 'bamboohr'], q: 'Adam is smart and driven, and he leads with humility. Working alongside and for him is an amazing experience! I have witnessed this firsthand.' },
    { by: 'sam',     pages: ['main', 'lendio2'], q: 'Adam is awesome, a great product leader!' },

    // Steve Ballard
    { by: 'steve', pages: ['main', 'bamboohr', 'workfront'], post: STEVE_POST, q: 'As a design leader, you remember the product partners who made your best work possible. Adam Michaelson is one of those people for me.' },
    { by: 'steve', pages: ['main', 'bamboohr', 'workfront'], post: STEVE_POST, q: 'What made Adam different was that he didn’t just manage the product. He got into the research, spent time with customers, worked through the details with design and engineering, and cared deeply about whether we were actually solving the right problems.' },
    { by: 'steve', pages: ['main', 'bamboohr', 'workfront'], post: STEVE_POST, q: 'Adam pays attention to the details, understands how people think and work, and keeps pushing until the product gets it right. He knows that’s how you build products people love and deliver real business results.' },
    { by: 'steve', pages: ['main', 'bamboohr', 'workfront'], post: STEVE_POST, q: 'Working with Adam was one of the best experiences of my career, and he became a close friend along the way. I’d jump at the chance to work with him again.' },

    { by: 'abe', pages: ['main', 'workfront'], q: 'We were lucky to have such a strong group and Adam Michaelson was tops.' },

    // Trent Miskin (both Lendio tenures)
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'Adam is a world-class product leader with the talent, capacity and drive to take products and platforms all the way from early executive or customer research-driven ideas to deployment and ultimate success.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'Adam knows the entire product lifecycle and stack, including engineering, data science/AI, UX, and the art and science of product management.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'He speaks the language of each [group] and has a real appreciation for the needs and expertise of each layer of product.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'One of the great things about working with him is how often he recognizes the contributions and talents of people on the team, not just in product, including the small things that are sometimes overlooked by others.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'He is data-driven and feels strongly about being measured by real business outcomes.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'He executes fast while also being able to step back and set long-term vision.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'There is never a concern about whether he will accomplish what you need or what he agrees to.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'Strategically, Adam draws on a deep well of experience and is not flustered when new problems are brought to him.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'He will debate hard with you, but will also commit fully to whatever decision is ultimately made and work toward its success.' },
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'The fact that I have now brought him back for a second long stint together is a testament to the trust I have in him and how much I enjoy working with him.' },

    // Added Nov 2026
    { by: 'patrick', pages: ['main', 'lendio2'], q: "Adam has a natural flair for leadership, and his innate ability to inspire meaningful change and execute a grand vision for product organizations is exceptional." },
    { by: 'patrick', pages: ['main', 'lendio2'], q: "His guidance and teachings have been instrumental in shaping my approach to product management, and I am grateful for the invaluable lessons he imparted during our time together at Lendio." },
    { by: 'patrick', pages: ['main', 'lendio2'], q: "What sets Adam apart is his unwavering commitment to listening and understanding the viewpoints of his team members. He is approachable, empathetic, and an excellent listener, making him someone I could confide in without hesitation. He has fostered an open and collaborative environment at Lendio, which has led to an increase in cross-functional collaboration and a more unified product vision." },
    { by: 'patrick', pages: ['main', 'lendio2'], q: "I highly recommend Adam for any role that requires a visionary leader with a talent for driving change, inspiring innovation, and building high-performing teams." },
    { by: 'jason', pages: ['main', 'lendio1'], q: "Adam is a visionary product leader, and a key driving force behind Lendio’s success. Lendio’s revenue has grown more than 300% in the last few years, and Adam’s redesign of our entire system / product made that possible." },
    { by: 'jason', pages: ['main', 'lendio1'], q: "Adam is insightful, thoughtful, and a team player. At Lendio, our mantra is ‘humble & hungry’. Adam exudes this; he gave up his office so that various teams could have a place to collaborate." },
    { by: 'luke', pages: ['main', 'lendio1'], q: "Not only does Adam check all the boxes for a great product team leader as well as a great person, but Adam has a talent for making the product team feel like a family. Some might question the value of this skill. Can you be an effective team leader without it? Yes. But when you are spending so much time with the people on your team, having a team that feels like a family makes the experience of working together so much more enjoyable. I’ll always be grateful for the privilege of working with Adam." },
    { by: 'brenda', pages: ['main', 'workfront'], q: "I worked with Adam while he was Product Team Lead at AtTask (now workfront). During the years I worked with Adam I was impressed at his ability to deliver quality designs that delighted customers and team members alike. He has a fantastic ability to analyze customer needs and create elegant solutions. He studies the market, the product, and the customer to drive innovation. His professionalism and easy going attitude, made you want to work with him. I highly recommend Adam." },
    { by: 'jessie', pages: ['main', 'lendio1'], q: "Adam is a phenomenal person and leader. He’s the most talented product executive I’ve ever worked with and he truly know his stuff. If you’re looking for innovation, leadership, creativity, process, research, design, and pure awesomeness, then look no further than Adam Michaelson. I would highly recommend him to any organization looking for a strong leader and innovator." },
    { by: 'jonathan', pages: ['main', 'bamboohr', 'lendio1', 'workfront'], q: "Adam takes products that have had some success, and he makes them game-changing. He has perfected the art of customer inquiry, and coupled with his creativity, he crafts innovative solutions for people’s needs." },
    { by: 'jonathan', pages: ['main', 'bamboohr', 'lendio1', 'workfront'], q: "Adam is a visionary. He thinks big and he delivers big. Not because he’s some cowboy, but because his vision is created, adjusted, and improved every day by his investigations, tests, and validations." },
    { by: 'jonathan', pages: ['main', 'bamboohr', 'lendio1', 'workfront'], q: "Adam is a leader. Everyone on the team and many across the company look to Adam as a mentor and someone they could rally around. Not because he demands leadership, but because he respects and listens to every person with whom he interacts." },
    { by: 'sean', pages: ['main', 'workfront'], q: "Adam is a talented product leader who understands how to work with developers to build great software. I worked with him for years at AtTask and would not hesitate to recommend him to anyone seeking to build a great product team." },
    { by: 'russ', pages: ['main', 'workfront'], q: "Adam is an exceptional product visionary. The role he has played in the last 5 years at AtTask has shaped the way the current solution is now offered to market as a compelling work management solution. I have worked with Adam frequently over the years and respect and trust his ideas and vision. To quote a Steve Jobs-ism Adam is definitely ‘skating to where the puck is going, not where it has come from’." },
    { by: 'qwade', pages: ['main', 'workfront'], q: "Adam is one of the finest product leaders I have had the privilege of working with. Because my job relies so heavily on a well thought out and designed product, it is crucial to have talented people in the product leadership, and Adam is one of the best. He cares tremendously about product quality and usability, and that shows in his work." },
    { by: 'brett', pages: ['main', 'optum'], q: "Adam is the most dedicated energetic person I have ever worked with. He is eager to learn and provide results. He is positive and works well with all levels. He cares about his coworkers and is open to other opinions and ideas." },
    { by: 'brett', pages: ['main', 'optum'], q: "If I were going into business with someone, Adam would be my first choice. Bottom line is Adam does whatever it takes to get the job done. He isn’t afraid to work and is very resourceful. I am hopeful to have a chance to work with Adam again in the future." },
    { by: 'bruce', pages: ['main', 'altabank'], q: "Adam Michaelson is tenacious! He knows that quality work prevails and he ensures that his work measures up." },
    { by: 'greg', pages: ['main', 'altabank'], q: "Adam is detail oriented, thorough, and persistent with everything he does. He is an excellent manager and always follows through to make sure everything reaches a successful outcome." },
    { by: 'joel', pages: ['main', 'workfront'], q: "He is amazingly effective at getting others to align and work together to deliver a solution. Adam has many strengths, but the skills that standout include his ability to define a solution and execute on that solution; he blends his project management background with best practices in product management. Adam has such a positive, can-do attitude that it is infectious. I’d work with Adam again, anytime – without hesitation." },
    { by: 'brent', pages: ['main', 'optum'], q: "Adam is one of the hardest workers I have encountered in the professional business world. His level of intellect, coupled with his organization skills and rich technology background provide any team with amazing outcomes." },
    { by: 'brent', pages: ['main', 'optum'], q: "His character and work ethic speak for themselves, which in turn motivate other members of the team to strive for high levels of performance." },
    { by: 'ty', pages: ['main', 'workfront', 'lendio1'], q: "Adam demonstrates a capacity to absorb complex data and identify the critical information needed to guide future product development designed to meet future customer needs." },
    { by: 'ty', pages: ['main', 'workfront', 'lendio1'], q: "Adam’s communication skills allow him to interact with customers and team members in any capacity. An engaging and affable personality, combined with his professional capabilities, make Adam a great partner and leader." },
    { by: 'joshua', pages: ['main', 'altabank'], q: "I was impressed with Adam’s professionalism, organizational abilities, and technical knowledge." },
    { by: 'tolman', pages: ['main', 'lendio1', 'lendio2'], q: "Some product leaders make you a better designer simply by the way they work alongside you – Adam Michaelson is one of those leaders." },
    { by: 'tolman', pages: ['main', 'lendio1', 'lendio2'], q: "Adam demonstrates a rare combination of deep product thinking, genuine appreciation for research and design, and the ability to get things done. He’s a leader who digs into the details." },
    { by: 'tolman', pages: ['main', 'lendio1', 'lendio2'], q: "Adam cares about what happens after launch. Not just what shipped, but whether it created real value for customers and the business." },
    { by: 'tolman', pages: ['main', 'lendio1', 'lendio2'], q: "I’ve worked with a lot of killer product leaders over the years, and Adam absolutely stands out among them. He’s thoughtful, collaborative, grounded in customer needs, and knows how to turn good ideas into meaningful outcomes. He’s also an all-around solid human who’s a joy to work with." },
    { by: 'romney', pages: ['main', 'lendio1'], q: "Adam is top-flight in his craft and a really high caliber and genuine person." }
  ];

  window.BIO_QUOTES = QUOTES.map(function (x) {
    var p = PEOPLE[x.by];
    return { q: x.q, by: x.by, name: p.name, role: p.role, pages: x.pages, post: x.post || null };
  });
})();
