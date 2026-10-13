import { writeFileSync, mkdirSync } from 'node:fs';
const ROOT = new URL('../public/me', import.meta.url).pathname;

// kind: 'chapters' (story sections) or 'cards' (activity grid)
const S = [
  { slug: 'history', title: 'Personal history', short: 'History', accent: 'orange',
    lead: 'Where I’m from, what I did as a kid, and the road that got me here.',
    intro: 'Where I’m from, what I did as a kid, and how the road wound its way to Eagle Mountain, Utah.',
    chapters: [
      ['Where I’m from', 'The places and people that shaped me before I had any say in it.', ['hometown-1', 'hometown-2', 'hometown-3']],
      ['As a kid', 'What I did with my days, who I did it with, and the trouble we found.', ['kid-1', 'kid-2', 'kid-3', 'kid-4']],
      ['Growing up', 'School, friends, first jobs, and the moments that pointed me somewhere.', ['teen-1', 'teen-2', 'teen-3']],
      ['Along the way', 'The stops between then and now.', ['way-1', 'way-2', 'way-3']],
    ], videos: ['history-1'] },
  { slug: 'family', title: 'Family', short: 'Family', accent: 'red',
    lead: 'My wife, my kids, and everything I’m doing it all for.',
    intro: 'My wife, my kids, and the life we’re building together.',
    chapters: [
      ['My wife', 'The person I get to do life with.', ['wife-1', 'wife-2', 'wife-3']],
      ['The kids', 'Our children, in their own words and in their own chaos.', ['kids-1', 'kids-2', 'kids-3', 'kids-4']],
      ['Together', 'Traditions, trips, and ordinary Tuesdays.', ['together-1', 'together-2', 'together-3', 'together-4']],
    ], videos: ['family-1', 'family-2'] },
  { slug: 'faith', title: 'Faith', short: 'Faith', accent: 'yellow',
    lead: 'I’m a member of The Church of Jesus Christ of Latter-day Saints. Here’s what I believe and why it matters to me.',
    intro: 'I’m a member of The Church of Jesus Christ of Latter-day Saints. This is what I believe and how it shapes the way I live.',
    chapters: [
      ['What I believe', 'The core of it, in my own words.', ['believe-1', 'believe-2']],
      ['Church and community', 'Membership, callings, and the people I serve alongside.', ['church-1', 'church-2', 'church-3']],
      ['Living it', 'How faith shows up in a normal week.', ['living-1', 'living-2']],
    ], extra: ['Mission and beliefs', '/me/mission-and-beliefs/', 'The quotes that guide what I’m here to do.'], videos: [] },
  { slug: 'music', title: 'Music', short: 'Music', accent: 'indigo',
    lead: 'Choirs, original songs, rock bands, and the artists I can’t stop listening to.',
    intro: 'Choirs, original songs, rock bands, and the artists I can’t stop listening to.',
    chapters: [
      ['Choirs', 'Singing with other people is its own kind of magic.', ['choir-1', 'choir-2', 'choir-3']],
      ['Original music', 'Songs I’ve written and recorded.', ['original-1', 'original-2']],
      ['Rock bands', 'Loud rooms, borrowed amps, and the bands I’ve played in.', ['band-1', 'band-2', 'band-3', 'band-4']],
      ['What I listen to', 'The music and artists I love.', ['listen-1', 'listen-2']],
    ], videos: ['music-1', 'music-2', 'music-3'] },
  { slug: 'outdoors', title: 'Outdoors', short: 'Outdoors', accent: 'green',
    lead: 'Rock climbing, mountain biking, hiking, 4x4, backpacking, kayaking, and shooting.',
    intro: 'Rock climbing, mountain biking, hiking, 4x4, backpacking, kayaking, and shooting. Wherever the road, trail, or river goes.',
    cards: [
      ['climbing', 'Rock climbing', 'Rope, rock, and the quiet focus of the next move.'],
      ['biking', 'Mountain biking', 'Singletrack, dirt, and the downhill you earned.'],
      ['hiking', 'Hiking', 'Trails, summits, and the long way back.'],
      ['4x4', '4x4', 'Off-road and out of cell range.'],
      ['backpacking', 'Backpacking', 'Everything I need on my back, for as many days as it takes.'],
      ['kayaking', 'Kayaking', 'Flat water, moving water, and the view from the river.'],
      ['shooting', 'Shooting', 'Range days, practice, and safe handling.'],
    ], videos: ['outdoors-1', 'outdoors-2', 'outdoors-3'] },
];

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;700&display=swap" rel="stylesheet">';
const head = (title, desc, accent, path) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Adam Michaelson</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#000000">
<meta property="og:title" content="${title} | Adam Michaelson">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="https://adam-michaelson.com/home-portrait.jpg">
${FONTS}
<link rel="stylesheet" href="/me/me.css?v=1">
<script>document.documentElement.classList.add('js');</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
</head>
<body${accent ? ` data-accent="${accent}"` : ''}>
<div class="wrap">
  <div class="topbar"><a href="${path === 'hub' ? '/' : '/me/'}">&lsaquo; ${path === 'hub' ? 'Adam Michaelson' : 'Get to know me'}</a><span>${path === 'hub' ? 'Eagle Mountain, Utah' : 'Adam Michaelson'}</span></div>
`;
const foot = `  <footer><span>Adam Michaelson · Eagle Mountain, Utah</span><span><a href="/">Home</a> · <a href="/bio/">Work with me</a> · <a href="/me/">Get to know me</a></span></footer>
</div>
<script src="/me/me.js?v=1"></script>
</body>
</html>
`;
// Placeholder-aware image. alt is descriptive so it still reads if the file is swapped.
const img = (slug, name, label, cls = '', extra = '') =>
  `<div class="ph zoom ${cls}" data-label="${label}"${extra}><img src="/me/${slug}/photos/${name}.jpg" alt="${label}" loading="lazy" decoding="async"></div>`;
const vid = (slug, name) =>
  `<div class="ph" data-label="Video: ${name}.mp4"><video controls preload="metadata" playsinline poster="/me/${slug}/videos/${name}.jpg"><source src="/me/${slug}/videos/${name}.mp4" type="video/mp4"></video></div>`;
const shape = ['', 'wide', '', '', '', ''];

// ---- hub
let hub = head('Get to know me', 'Adam Michaelson: personal history, family, faith, music and the outdoors.', '', 'hub') + `
  <header class="hub-head rv">
    <span class="eyebrow">Get to know me</span>
    <h1>Beyond the résumé.</h1>
    <p>The rest of the story: where I’m from, the people I do it for, what I believe, the music I make and love, and where I go when I’m not at a desk.</p>
  </header>
`;
S.forEach((s) => {
  hub += `  <section class="facet">
    ${img(s.slug, 'cover', `${s.title} cover photo`, 'rv', ' style="--ar:4/3"')}
    <div class="txt">
      <span class="eyebrow rv">${s.short}</span>
      <h2 class="rv">${s.title}</h2>
      <p class="rv">${s.lead}</p>
      <div class="rv"><a class="btn" href="/me/${s.slug}/">${s.title} &rarr;</a></div>
    </div>
  </section>
`;
});
hub += foot;
writeFileSync(`${ROOT}/index.html`, hub);

// ---- sub-pages
S.forEach((s, i) => {
  const prev = S[(i + S.length - 1) % S.length], next = S[(i + 1) % S.length];
  let h = head(s.title, s.intro, s.accent, 'sub') + `
  <header class="page-head rv">
    <span class="eyebrow">${s.short}</span>
    <h1>${s.title}</h1>
    <p class="intro">${s.intro}</p>
  </header>
  ${img(s.slug, 'cover', `${s.title} cover photo`, 'hero-ph rv')}
`;
  if (s.chapters) {
    s.chapters.forEach(([t, blurb, photos], ci) => {
      h += `  <section class="chapter">
    <h2 class="rv">${t}</h2>
    <div class="body rv">
      <p>${blurb}</p>
      <div class="gallery">
${photos.map((p, k) => '        ' + img(s.slug, p, `${t}: photo ${k + 1}`, shape[(k + ci) % shape.length])).join('\n')}
      </div>
    </div>
  </section>
`;
    });
    if (s.extra) h += `  <section class="chapter"><h2 class="rv">${s.extra[0]}</h2><div class="body rv"><p>${s.extra[2]}</p><div><a class="btn" href="${s.extra[1]}">${s.extra[0]} &rarr;</a></div></div></section>\n`;
  } else {
    h += `  <section class="cards">\n` + s.cards.map(([k, t, p]) =>
      `    <article class="card rv">\n      ${img(s.slug, k, `${t} photo`)}\n      <h3>${t}</h3>\n      <p>${p}</p>\n    </article>`).join('\n') + `\n  </section>\n`;
  }
  if (s.videos.length) h += `  <section class="chapter">
    <h2 class="rv">Video</h2>
    <div class="body rv"><div class="videos">
${s.videos.map((v) => '      ' + vid(s.slug, v)).join('\n')}
    </div></div>
  </section>
`;
  h += `  <nav class="pager" aria-label="More about me">
    <a class="prev" href="/me/${prev.slug}/"><small>&lsaquo; Previous</small><b>${prev.title}</b></a>
    <a class="next" href="/me/${next.slug}/"><small>Next &rsaquo;</small><b>${next.title}</b></a>
  </nav>
` + foot;
  mkdirSync(`${ROOT}/${s.slug}`, { recursive: true });
  writeFileSync(`${ROOT}/${s.slug}/index.html`, h);
  for (const d of ['photos', 'videos']) { mkdirSync(`${ROOT}/${s.slug}/${d}`, { recursive: true }); writeFileSync(`${ROOT}/${s.slug}/${d}/.gitkeep`, ''); }
});
