/**
 * Visibility filter for the chat knowledge base. Pure functions, no I/O.
 *
 * Input is a flat, document-ordered list of blocks:
 *   { type: "heading", level: 1|2|3, text: "Education [PUBLIC]" }
 *   { type: "text", md: "..." }            (everything that is not a heading)
 *
 * Rules (from the build spec):
 *  - A heading is tagged [PUBLIC] or [PRIVATE]. Untagged = not public.
 *  - An untagged sub-heading inherits the tag of its nearest tagged parent.
 *  - Content before the first heading (intro / legend paragraphs) is never public.
 *  - Only [PUBLIC] content is emitted, with tag text stripped.
 *  - A heading carrying both tags is treated as PRIVATE (fail closed).
 */

const TAG_RE = /\s*\\?\[(PUBLIC|PRIVATE)\\?\]\s*/gi;

export function parseTag(text) {
  const tags = new Set();
  for (const m of text.matchAll(TAG_RE)) tags.add(m[1].toUpperCase());
  if (tags.has("PRIVATE")) return "PRIVATE";
  if (tags.has("PUBLIC")) return "PUBLIC";
  return null;
}

export function stripTags(text) {
  return text.replace(TAG_RE, " ").replace(/\s+/g, " ").trim();
}

/** Tag every block with its effective visibility: "PUBLIC" | "PRIVATE" | null. */
export function classify(blocks) {
  const stack = []; // { level, tag } of tagged headings
  return blocks.map((b) => {
    if (b.type === "heading") {
      while (stack.length && stack[stack.length - 1].level >= b.level) stack.pop();
      const own = parseTag(b.text);
      if (own) stack.push({ level: b.level, tag: own });
      const tag = own ?? (stack.length ? stack[stack.length - 1].tag : null);
      return { ...b, visibility: tag };
    }
    return { ...b, visibility: stack.length ? stack[stack.length - 1].tag : null };
  });
}

/** Returns { markdown, publicSections, dropped } for one page. */
export function filterPage(title, blocks) {
  const classified = classify(blocks);
  const out = [];
  const dropped = []; // text of everything not emitted, used for the leak check
  let publicSections = 0;
  for (const b of classified) {
    const text = b.type === "heading" ? stripTags(b.text) : b.md;
    if (b.visibility === "PUBLIC") {
      if (b.type === "heading") {
        if (b.level === 2 || b.level === 1) publicSections++;
        out.push(`${"#".repeat(Math.min(b.level + 1, 6))} ${text}`);
      } else {
        out.push(b.md);
      }
    } else if (text) {
      dropped.push(text);
    }
  }
  return {
    markdown: out.length ? `# ${title}\n\n${out.join("\n\n")}\n` : "",
    publicSections,
    dropped,
  };
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Throws if the output contains anything it must not.
 *  - privateIds: hard-coded excluded page ids (any dash form)
 *  - dropped: text of non-public blocks from fetched pages (long enough to be distinctive)
 *  - canaries: optional extra phrases supplied out-of-band (never stored in the repo)
 */
export function assertNoLeak(markdown, { privateIds = [], dropped = [], canaries = [] } = {}) {
  const hay = norm(markdown);
  const hayNoDash = hay.replace(/-/g, "");
  const problems = [];
  for (const id of privateIds) {
    if (hayNoDash.includes(id.toLowerCase().replace(/-/g, ""))) problems.push(`private page id ${id} appears in output`);
  }
  if (/\[private\]|\\\[private\\\]/i.test(markdown)) problems.push("a [PRIVATE] tag appears in output");
  if (/not for public chat/i.test(markdown)) problems.push('"NOT FOR PUBLIC CHAT" appears in output');
  for (const c of canaries) {
    if (c && hay.includes(norm(c))) problems.push("a configured canary phrase appears in output");
  }
  for (const d of dropped) {
    const n = norm(d);
    if (n.length >= 40 && hay.includes(n)) problems.push(`non-public text appears in output: "${n.slice(0, 60)}..."`);
  }
  if (problems.length) {
    throw new Error("KNOWLEDGE LEAK CHECK FAILED:\n - " + problems.join("\n - "));
  }
}

/** Dev/test adapter: markdown text -> blocks (headings from #..### lines, paragraphs otherwise). */
export function markdownToBlocks(md) {
  const blocks = [];
  let buf = [];
  const flush = () => {
    if (buf.length) blocks.push({ type: "text", md: buf.join("\n") });
    buf = [];
  };
  for (const line of md.split("\n")) {
    const m = /^(#{1,3})\s+(.*)$/.exec(line);
    if (m) {
      flush();
      blocks.push({ type: "heading", level: m[1].length, text: m[2] });
    } else buf.push(line);
  }
  flush();
  return blocks;
}
