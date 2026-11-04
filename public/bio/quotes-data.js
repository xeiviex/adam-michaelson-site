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
    trent:   { name: 'Trent Miskin',    role: 'Co-Founder and CTO at Lendio' }
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
    { by: 'trent', pages: ['main', 'lendio1', 'lendio2'], q: 'The fact that I have now brought him back for a second long stint together is a testament to the trust I have in him and how much I enjoy working with him.' }
  ];

  window.BIO_QUOTES = QUOTES.map(function (x) {
    var p = PEOPLE[x.by];
    return { q: x.q, by: x.by, name: p.name, role: p.role, pages: x.pages, post: x.post || null };
  });
})();
