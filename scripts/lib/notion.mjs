/** Minimal Notion REST client: page blocks -> flat block list for knowledge-filter. */

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";

async function get(path, token) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(API + path, {
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION },
    });
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    if (!res.ok) throw new Error(`Notion ${res.status} for ${path}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }
  throw new Error(`Notion request failed after retries: ${path}`);
}

export async function pageTitle(id, token) {
  const p = await get(`/pages/${id}`, token);
  for (const prop of Object.values(p.properties || {})) {
    if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  }
  return id;
}

async function children(id, token) {
  const out = [];
  let cursor;
  do {
    const q = `/blocks/${id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const r = await get(q, token);
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

function rich(rt = []) {
  return rt
    .map((t) => {
      let s = t.plain_text;
      if (!s) return "";
      const a = t.annotations || {};
      if (a.code) s = "`" + s + "`";
      if (a.bold) s = `**${s}**`;
      if (a.italic) s = `*${s}*`;
      // Keep external links; drop Notion-internal ones (they could point at private pages).
      const href = t.href;
      if (href && !/notion\.(so|site)|notion\.com/i.test(href)) s = `[${s}](${href})`;
      return s;
    })
    .join("");
}

const SKIP = new Set(["child_page", "child_database", "link_to_page", "synced_block", "unsupported", "table_of_contents", "breadcrumb", "image", "file", "pdf", "video", "embed", "bookmark", "link_preview"]);

/** Walk a page (depth-first, document order) into flat blocks. Never enters child pages. */
export async function pageBlocks(pageId, token) {
  const blocks = [];
  async function walk(id, depth, listCtx) {
    for (const b of await children(id, token)) {
      const t = b.type;
      const d = b[t] || {};
      if (SKIP.has(t)) continue; // fail closed: unknown/linked content is never included
      if (/^heading_[123]$/.test(t)) {
        blocks.push({ type: "heading", level: Number(t.slice(-1)), text: rich(d.rich_text) });
      } else {
        const indent = "  ".repeat(depth);
        const text = rich(d.rich_text);
        let md = null;
        if (t === "paragraph") md = text;
        else if (t === "bulleted_list_item") md = `${indent}- ${text}`;
        else if (t === "numbered_list_item") md = `${indent}1. ${text}`;
        else if (t === "to_do") md = `${indent}- [${d.checked ? "x" : " "}] ${text}`;
        else if (t === "quote") md = `> ${text}`;
        else if (t === "callout") md = `> ${text}`;
        else if (t === "toggle") md = text;
        else if (t === "code") md = "```\n" + text + "\n```";
        else if (t === "divider") md = "---";
        else if (t === "table_row") md = "| " + (d.cells || []).map(rich).join(" | ") + " |";
        else if (t === "column_list" || t === "column" || t === "table") md = null;
        else md = text || null;
        if (md !== null && md !== "") blocks.push({ type: "text", md });
      }
      if (b.has_children) await walk(b.id, /list_item|to_do|toggle/.test(t) ? depth + 1 : depth);
    }
  }
  await walk(pageId, 0);
  return blocks;
}
