/**
 * Turn published site pages into knowledge for the chat, so questions about them can be answered.
 * Sections are emitted as [PUBLIC] markdown. Reads the repo's own public/ folder at build time (no network, no secrets).
 * A page directory is picked up automatically, including any sub-page added later.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', mdash: "—", ndash: "–", middot: "·", hellip: "…", rarr: "→", larr: "←", times: "×", copy: "©" };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENT ? ENT[n.toLowerCase()] : m));

/** Visible text of an HTML page, without scripts, styles, svg, header, nav and footer chrome. */
export function htmlToText(html) {
  let h = html.replace(/<!--[\s\S]*?-->/g, " ");
  h = h.replace(/<(script|style|svg|noscript|header|nav|footer|head|title)\b[\s\S]*?<\/\1>/gi, " ");
  h = h.replace(/<(br|\/p|\/li|\/h[1-6]|\/div|\/section|\/tr|\/figcaption|\/blockquote|\/dt|\/dd)\b[^>]*>/gi, "\n");
  h = h.replace(/<(p|li|h[1-6]|div|section|tr|figcaption|blockquote)\b[^>]*>/gi, "\n");
  h = h.replace(/<[^>]+>/g, " ");
  return decode(h)
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

/** Prose-like string literals from a page's script (prototype wording); code, markup and short labels are dropped. */
export function scriptWording(js) {
  const re = /'((?:[^'\\\n]|\\.){20,})'|"((?:[^"\\\n]|\\.){20,})"|`([^`]{20,})`/g;
  const out = [];
  for (let m; (m = re.exec(js)); ) {
    const t = (m[1] || m[2] || m[3]).replace(/\\'/g, "'").replace(/\\"/g, '"').trim();
    if (/^[A-Z][^<>={}()[\];]*$/.test(t) && t.split(/\s+/).length >= 4 && !out.includes(t)) out.push(t);
  }
  return out;
}

const titleOf = (html, fallback) => {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? decode(m[1]).replace(/\s*\|\s*Adam Michaelson\s*$/i, "").trim() : fallback;
};

function pagesUnder(dir) {
  const found = [];
  const walk = (d) => {
    if (existsSync(join(d, "index.html"))) found.push(d);
    for (const n of readdirSync(d).sort()) {
      const p = join(d, n);
      if (statSync(p).isDirectory() && n !== "img") walk(p);
    }
  };
  walk(dir);
  return found;
}

/**
 * @param publicDir  path to the site's public/ folder
 * @param route      e.g. "lendingtree"
 * @param heading    section heading text (without tag)
 * @returns markdown section, or "" if the route has no pages
 */
export function siteSection(publicDir, route, heading) {
  const base = join(publicDir, route);
  if (!existsSync(base)) return "";
  const parts = [];
  for (const dir of pagesUnder(base)) {
    const html = readFileSync(join(dir, "index.html"), "utf8");
    const rel = dir.slice(publicDir.length).replace(/\\/g, "/") || "/";
    const text = htmlToText(html);
    if (!text) continue;
    let wording = [];
    for (const n of readdirSync(dir)) if (n.endsWith(".js")) wording = wording.concat(scriptWording(readFileSync(join(dir, n), "utf8")));
    parts.push(
      `### ${titleOf(html, rel)} (adam-michaelson.com${rel})\n${text}` +
        (wording.length ? `\n\nPrototype wording (sample data, not real offers or figures):\n${wording.map((w) => "- " + w).join("\n")}` : "")
    );
  }
  return parts.length ? `## ${heading} \\[PUBLIC\\]\n${parts.join("\n\n")}\n` : "";
}
