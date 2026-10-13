// Scaffolds the /product section (public/product/**) as plain static HTML.
//
//   node scripts/build-product.mjs           writes only pages that don't exist yet
//   node scripts/build-product.mjs --force   regenerates everything (overwrites hand-written content!)
//
// Run it once to stub pages. After that, edit the HTML directly. The default mode never
// touches a page that already exists, so adding a new topic below is safe.
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const force = process.argv.includes("--force");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------------- Content ---------------- */

const INTRO = {
  title: "How I do product",
  summary:
    "I've spent more than 25 years in product, from the only product builder on an early team to leading organizations of more than 40 across product management, UX, operations, and data science. I've done it at AtTask (Workfront), BambooHR, Lendio, and Aktify, in SaaS, fintech, and AI. What I've learned is simple. Great products come from discipline, from teams that expect excellence of themselves, and from systems you can count on.",
  principles: [
    ["Discipline", "Focused priorities, clear ownership, and visible measures of progress."],
    ["Excellence", "A team rooted in craft that keeps raising its own bar."],
    ["Reliable systems", "Operations that are stable, predictable, and reliable, and that drive positive ROI."],
  ],
};

const role = (slug, who) => ({
  slug,
  children: [
    {
      slug: "competencies",
      title: "Competencies",
      lede: `The skills I look for, and build, in ${who}.`,
      children: [], // competency pages are only defined for product managers (see PM_COMPETENCIES)
    },
    {
      slug: "outputs+outcomes",
      title: "Outputs & Outcomes",
      lede: `What ${who} produce, and what changes for customers and the business because of it.`,
    },
  ],
});

const PM_COMPETENCIES = [
  ["vision", "Vision", "Seeing where the product and the customer should be in a few years, and making it concrete enough that a team can build toward it."],
  ["strategy", "Strategy", "Choosing the bets that matter and what not to do, and tying each one back to a business result."],
  ["leadership", "Leadership", "Setting direction and standards, and earning trust from people who don't report to you."],
  ["project-management", "Project Management", "Planning, sequencing, and delivering on a cadence the rest of the company can rely on."],
  ["communication", "Communication", "Saying the right thing, clearly, to customers, engineers, and executives."],
  ["data-informed-decisions", "Data-Informed Decisions", "Using evidence to sharpen judgment, not to hide from it."],
  ["technical-skills", "Technical Skills & Input", "Enough technical depth to shape the solution and earn engineering's respect."],
  ["results-and-ownership", "Results & Ownership", "Owning the outcome after launch, not just the release."],
];

const pm = role("pm", "product managers");
pm.children[0].children = PM_COMPETENCIES.map(([slug, title, lede]) => ({ slug, title, lede, competency: true }));

const TOPICS = [
  {
    ...pm,
    title: "What makes a great product manager?",
    subtitle: "Competencies, outputs, and outcomes.",
    para: "A great product manager is part strategist, part operator, and part translator. They see where the product should go, make the tradeoffs that get it there, and own the result. I look at eight competencies, and then I look at what they produce and what changes because of it.",
  },
  {
    ...role("ux", "designers"),
    title: "What makes a great designer?",
    subtitle: "Craft, judgment, and customer impact.",
    para: "A great designer does more than make things look right. They understand the customer's problem, shape the whole experience, and prove it works. I look at craft and judgment, and then at what the work does for customers and the business.",
  },
  {
    ...role("eng", "engineers"),
    title: "What makes a great engineer?",
    subtitle: "Quality, reliability, and shipping what matters.",
    para: "A great engineer builds things that last. They write code you can trust, make systems stable and predictable, and care about the customer on the other end. I look at how they work, and at what they ship and how it holds up.",
  },
  {
    slug: "leader",
    title: "What makes a great product leader?",
    subtitle: "Director, VP, and CPO.",
    para: "The job changes as you move up. A director runs a team. A VP runs a system of teams. A CPO answers for the whole product business. I look at what each level owes the company, and how a leader builds a team that outgrows them.",
    children: role("leader", "product leaders").children,
  },
  {
    slug: "research",
    title: "Research",
    subtitle: "How I do it, from the trenches.",
    para: "Good research starts in the field. Sit with customers, watch how they actually work, test your assumptions, and then invest where the evidence points. This is how I do it, step by step.",
  },
  {
    slug: "leveling-up",
    title: "Leveling up",
    subtitle: "Performance, hiring, and growth.",
    para: "Teams get better on purpose. That takes clear expectations, honest feedback, a hiring pipeline that holds a high bar, and a plan for every person's growth. This is how I manage performance and build the bench.",
  },
  {
    slug: "measuring-success",
    title: "Measuring success",
    subtitle: "Release is just the beginning.",
    para: "Shipping isn't the finish line. Measure what happens after release: adoption, warranty, assessments, and what you learn. Then feed it back into the next iteration. That's how you know the investment paid off.",
  },
  {
    slug: "ai",
    title: "Thoughts on AI",
    subtitle: "Tool, UX, product, and the hype around it.",
    para: "AI is a useful tool, a new kind of UX, and sometimes a real product. It's also a source of hype and confusion, and even a kind of psychosis. Here's how I think about where it adds value, and where it's a feature, not a product.",
  },
  {
    slug: "30-60-90",
    title: "30-60-90 days",
    subtitle: "Starting a new product role well.",
    para: "The first three months set the tone. Listen first, build trust, find the quick wins, and then lay down a plan the team can believe in. Here's how I run my first 30, 60, and 90 days.",
  },
];

/* ---------------- Templates ---------------- */

const FONTS =
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;700&display=swap";

function shell({ title, description, body, depth }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#000000">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/product/product.css?v=1">
<script>document.documentElement.classList.add('js');</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body>
<header class="bar"><div class="in">
  <a class="nm" href="/">Adam Michaelson</a>
  <a class="back" href="/product/">Product</a>
</div></header>
<div class="wrap">
${body}
  <footer>
    <span>Eagle Mountain, Utah · open to remote</span>
    <span><a href="mailto:hello@adam-michaelson.com">hello@adam-michaelson.com</a> · <a href="https://www.linkedin.com/in/adammichaelson" target="_blank" rel="noopener">LinkedIn</a></span>
  </footer>
</div>
<script src="/product/product.js?v=1" defer></script>
</body>
</html>
`;
}

const href = (path) => "/product/" + (path.length ? path.join("/") + "/" : "");

function indexPage() {
  const principles = INTRO.principles
    .map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`)
    .join("\n      ");
  const sections = TOPICS.map((t, i) => {
    const kids = t.children
      ? `\n    <div class="list" data-rvg aria-label="${esc(t.title)}">
${t.children.map((c) => `      <a href="${href([t.slug, c.slug])}"><b>${esc(c.title)}</b></a>`).join("\n")}
    </div>`
      : "";
    return `  <section class="lead" id="${t.slug}">
    <div class="txt">
      <span class="eyebrow rv">${String(i + 1).padStart(2, "0")}</span>
      <h2 class="rv">${esc(t.title)}</h2>
      <p class="sub rv">${esc(t.subtitle)}</p>
      <p class="rv">${esc(t.para)}</p>
      <div class="btn-row rv"><a class="btn" href="${href([t.slug])}">Learn more &rarr;</a></div>
    </div>${kids}
  </section>`;
  }).join("\n\n");

  const body = `  <section class="hero">
    <span class="eyebrow rv">Product</span>
    <h1 class="rv">${esc(INTRO.title)}</h1>
    <p class="summary rv">${esc(INTRO.summary)}</p>
    <div class="principles" data-rvg>
      ${principles}
    </div>
  </section>

${sections}
`;
  return shell({
    title: "How I do product | Adam Michaelson",
    description: "How Adam Michaelson does product: discipline, teams rooted in excellence, and systems that are stable, predictable, and reliable.",
    body,
  });
}

function childPage(node, trail) {
  // trail: array of nodes from the top-level topic down to this node
  const path = trail.map((n) => n.slug);
  const crumbs = [`<a href="/product/">Product</a>`]
    .concat(trail.slice(0, -1).map((n, i) => `<a href="${href(path.slice(0, i + 1))}">${esc(n.title)}</a>`))
    .join('<i aria-hidden="true">/</i>');
  const parent = trail.length > 1 ? trail[trail.length - 2] : null;
  const eyebrow = parent ? parent.title : "Product";

  const kids = node.children && node.children.length
    ? `
    <section class="block">
      <h2>In this section</h2>
      <div class="list">
${node.children.map((c) => `        <a href="${href([...path, c.slug])}"><b>${esc(c.title)}</b>${c.lede ? `<span>${esc(c.lede)}</span>` : ""}</a>`).join("\n")}
      </div>
    </section>`
    : "";

  const sections = (node.competency
    ? ["What it is", "What good looks like", "Where it goes wrong", "How I develop it"]
    : trail.length === 1
      ? ["Overview", "How I do it", "Common mistakes"]
      : ["Overview", "What I look for", "How I measure it"]
  ).map((h) => `    <section class="block">
      <h2>${esc(h)}</h2>
      <p class="stub">Written content coming.</p>
    </section>`).join("\n");

  const lede = node.para || node.lede || "";
  const body = `  <article class="page">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbs}</nav>
    <span class="eyebrow rv">${esc(eyebrow)}</span>
    <h1 class="rv">${esc(node.title)}</h1>
    ${node.subtitle ? `<p class="sub rv">${esc(node.subtitle)}</p>` : ""}
    ${lede ? `<p class="lede rv">${esc(lede)}</p>` : ""}

    <!-- VIDEO: replace the placeholder div with e.g.
         <iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="${esc(node.title)}" allowfullscreen loading="lazy"></iframe>
         or a <video controls src="..."></video>. The .video wrapper keeps it 16:9. -->
    <div class="video rv"><div class="ph">Video coming soon</div></div>
${kids}
${sections}
  </article>
`;
  return shell({
    title: `${node.title} | Adam Michaelson`,
    description: lede || node.title,
    body,
  });
}

/* ---------------- Write ---------------- */

let written = 0, skipped = 0;
function write(path, html) {
  const file = join(root, "product", ...path, "index.html");
  if (existsSync(file) && !force) { skipped++; return; }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  written++;
}

write([], indexPage());
(function walk(nodes, trail) {
  for (const n of nodes) {
    const t = [...trail, n];
    write(t.map((x) => x.slug), childPage(n, t));
    if (n.children) walk(n.children, t);
  }
})(TOPICS, []);

console.log(`product pages: ${written} written, ${skipped} left alone${force ? " (--force)" : ""}`);
