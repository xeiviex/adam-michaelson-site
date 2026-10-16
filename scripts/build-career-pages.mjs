// Generates public/bio/<slug>/index.html for each career page from scripts/career/data.mjs.
// Run: node scripts/build-career-pages.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './career/data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'bio');
const total = pages.length;
const pad = (n) => String(n).padStart(2, '0');
const label = (p) => (p.part ? `${p.name} (${p.part})` : p.name);
const esc = (s) => s.replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;');

const placeholder = (caption, cls = '') => `
          <figure class="ph ${cls}">
            <svg class="ph-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>
            <figcaption><span class="ph-tag">Photo placeholder</span>${esc(caption)}</figcaption>
          </figure>`;

const tile = (img, cls) => `
          <figure class="photo ${cls}"${img.aspect ? ` style="aspect-ratio: ${img.aspect}"` : ''}>
            <img src="${img.src}" alt="${esc(img.alt)}" width="${img.width}" height="${img.height}" loading="lazy" style="object-position: ${img.position || '50% 50%'}">
          </figure>`;

const media = (photos, kind) => `
        <div class="media media-${kind}${photos.length === 1 && photos[0].aspect ? ' media-fit' : ''}">${photos.map((c, i) => (typeof c === 'string' ? placeholder(c, `ph-${i + 1}`) : tile(c, `ph-${i + 1}`))).join('')}
        </div>`;

const photo = (img) => `
        <div class="media media-single${img.aspect ? ' media-fit' : ''}">
          <figure class="photo"${img.aspect ? ` style="aspect-ratio: ${img.aspect}"` : ''}>
            <img src="${img.src}" alt="${esc(img.alt)}" width="${img.width}" height="${img.height}" style="object-position: ${img.position || '50% 50%'}" fetchpriority="high">
          </figure>
        </div>`;

const points = (items) =>
  `<ul class="points">${items.map((p) => `
          <li><strong>${esc(p.h)}</strong> ${esc(p.t)}</li>`).join('')}
        </ul>`;

const paras = (items) => items.map((t) => `<p>${t}</p>`).join('\n        ');

function section(id, n, label, s, kind) {
  return `
    <section class="panel" id="${id}" data-label="${label}">
      <div class="wrap split">
        <div class="copy">
          <span class="eyebrow"><span class="n">${n}</span> · ${label}</span>
          <h2>${esc(s.title)}</h2>
          <p class="subtitle">${esc(s.sub)}</p>
          ${paras(s.body)}
          ${s.points ? points(s.points) : ''}
        </div>${s.photoNote ? `
        <div class="media-col">${media(s.photos, kind)}
          <p class="photo-note">${esc(s.photoNote)}</p>
        </div>` : media(s.photos, kind)}
      </div>
    </section>`;
}

function render(p, i) {
  const prev = pages[i - 1];
  const next = p.s5.next;
  const labels = ['Overview', 'The charter', 'The approach', 'Output & outcomes', 'Learnings & what’s next'];
  const ids = ['overview', 'charter', 'approach', 'outcomes', 'next'];

  const hero = `
    <section class="panel hero" id="overview" data-label="${labels[0]}">
      <div class="wrap split">
        <div class="copy">
          ${p.logo
            ? `<a class="logo-link" href="${p.site}" target="_blank" rel="noopener noreferrer" aria-label="Visit the ${esc(p.name)} website (opens in a new tab)"><img class="logo" src="${p.logo}" alt="${esc(p.name)} logo" height="40"></a>`
            : `<div class="logo-ph" role="img" aria-label="${esc(p.name)} logo placeholder"><span>${esc(p.name)}</span><small>Logo placeholder</small></div>`}
          <span class="eyebrow"><span class="n">Chapter ${pad(i + 1)}</span>${p.part ? ` · ${p.part}` : ''} · ${p.years}</span>
          <h1>${esc(p.name)}</h1>
          <p class="job">${esc(p.role)}</p>
          <p class="facts">${esc(p.facts)}</p>
          <p>${esc(p.about)}</p>
          <p>${esc(p.mine)}</p>
          <ul class="stats">${p.heroStats.map((s) => `
            <li><span class="num">${esc(s.num)}</span><span class="what">${esc(s.label)}</span></li>`).join('')}
          </ul>
        </div>${p.heroImage ? photo(p.heroImage) : media([p.heroPhoto], 'single')}
      </div>
    </section>`;

  const nextHref = next.slug ? `/bio/${next.slug}/` : next.href;
  const nextCta = next.slug ? 'Continue to the next chapter' : next.cta;
  const last = `
    <section class="panel" id="next" data-label="${labels[4]}">
      <div class="wrap split">
        <div class="copy">
          <span class="eyebrow"><span class="n">05</span> · ${labels[4]}</span>
          <h2>${esc(p.s5.title)}</h2>
          <p class="subtitle">${esc(p.s5.sub)}</p>
          ${paras(p.s5.body)}
          <a class="next-card" href="${nextHref}">
            <span class="next-label">${next.slug ? 'Next · ' : ''}${esc(next.label)}</span>
            <span class="next-teaser">${esc(next.teaser)}</span>
            <span class="more">${nextCta} <span class="arrow" aria-hidden="true">→</span></span>
          </a>
        </div>${media(p.s5.photos || ['The moment the milestone landed: the team, together'], 'single')}
      </div>
    </section>`;

  return `<!DOCTYPE html>
<html lang="en" data-accent="${p.accent}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.part ? `${p.name}, ${p.part}` : p.name)} (${p.years}) — Adam Michaelson</title>
<meta name="description" content="${esc(p.role)} at ${esc(p.name)}, ${p.years}. ${esc(p.mine)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/bio/bio.css?v=4">
<link rel="stylesheet" href="/bio/career.css?v=15">
<script>document.documentElement.classList.add('js');</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body class="career">

<header class="topbar">
  <div class="wrap">
    <a class="more" href="/bio/"><span class="arrow" aria-hidden="true">←</span> Executive Bio</a>
    <nav class="chapters" aria-label="Career chapters">${pages.map((q, j) => `<a href="/bio/${q.slug}/"${j === i ? ' aria-current="page"' : ''} title="${esc(label(q))} · ${q.years}"><span class="sr">${esc(label(q))}</span></a>`).join('')}</nav>
    <span class="count">Chapter ${i + 1} of ${total}</span>
  </div>
</header>

<nav class="dots" aria-label="Sections">${ids.map((id, k) => `<a href="#${id}" data-label="${labels[k]}"><span class="sr">${labels[k]}</span></a>`).join('')}</nav>

<main>
${hero}
${section('charter', '02', labels[1], p.s2, 'collage')}
${section('approach', '03', labels[2], p.s3, 'single')}
${section('outcomes', '04', labels[3], p.s4, 'montage')}
${last}
</main>

<footer class="foot">
  <div class="wrap">
    <span>Executive Bio<span class="dot">·</span><a class="link" href="/">Adam Michaelson</a></span>
    <span>${prev ? `<a class="link" href="/bio/${prev.slug}/">← ${esc(label(prev))}</a>` : '<a class="link" href="/bio/">← Executive bio</a>'}</span>
  </div>
</footer>

<script src="/bio/career.js?v=2"></script>
</body>
</html>
`;
}

for (const [i, p] of pages.entries()) {
  const dir = join(root, p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), render(p, i));
  console.log('wrote', `public/bio/${p.slug}/index.html`);
}
