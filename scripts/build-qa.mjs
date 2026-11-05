#!/usr/bin/env node
/** Generates public/q-and-a/index.html from scripts/qa/data.mjs. */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTIONS } from "./qa/data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const count = SECTIONS.reduce((n, s) => n + s.items.length, 0);
const nav = SECTIONS.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join("");
const body = SECTIONS.map(
  (s) => `<section class="qa-sec" id="${s.id}">
  <h2>${esc(s.title)}</h2>
${s.items.map(([q, a]) => `  <details class="qa"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n")}
</section>`
).join("\n");

const html = `<!DOCTYPE html>
<html lang="en" data-accent="blue">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Interview Q&amp;A | Adam Michaelson</title>
<meta name="description" content="${count} questions I get asked in interviews about product leadership, strategy, AI and building teams, with my answers.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:ital,wght@0,400;0,700;0,800;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/bio/bio.css?v=8">
<link rel="stylesheet" href="/q-and-a/qa.css?v=1">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0089c4">
<link rel="stylesheet" href="/site-bar.css?v=1">
</head>
<body>
<header class="sbar"><div class="in">
  <a class="nm" href="/">Adam Michaelson</a>
  <nav class="trail" aria-label="Breadcrumb"><a href="/product/">Product</a><a href="/q-and-a/" aria-current="page">Q&amp;A</a></nav>
</div></header>

<header class="qa-head">
  <div class="wrap">
    <span class="eyebrow">Q&amp;A</span>
    <h1 class="name">Questions I get asked</h1>
    <p class="lede">The questions that come up most in interviews, and how I answer them. Where I've been asked the same thing more than once, the answers are combined.</p>
    <nav class="qa-jump" aria-label="Sections">${nav}</nav>
  </div>
</header>

<main class="wrap" id="qa">
${body}
</main>

<footer class="foot">
  <div class="wrap">
    <span>Q&amp;A<span class="dot">·</span><a class="link" href="/">Adam Michaelson</a></span>
  </div>
</footer>
</body>
</html>
`;
writeFileSync(join(root, "public/q-and-a/index.html"), html);
console.log(`wrote public/q-and-a/index.html (${count} questions)`);
