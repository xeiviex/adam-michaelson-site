/**
 * Fetch a job posting from a URL the visitor pasted, for the fit chat.
 * Safety: https only, public hostnames only, no credentials/ports/IP literals,
 * redirects re-validated, 8s timeout, 1.5MB cap, text-like content types only.
 * The result is untrusted text and is only ever passed to the model as data.
 */

const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 3;
const UA = "Mozilla/5.0 (compatible; AdamMichaelsonSiteBot/1.0; +https://adam-michaelson.com)";

export class PostingError extends Error {
  constructor(message, detail) { super(message); this.detail = detail || ""; }
}

/** True when the whole message is a single link (scheme optional). */
export function looksLikeUrl(text) {
  const t = text.trim();
  if (!t || t.length > 2048 || /\s/.test(t)) return false;
  return /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/\S*)?$/i.test(t);
}

export function validateUrl(raw) {
  const t = raw.trim();
  let u;
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : "https://" + t);
  } catch {
    throw new PostingError("That doesn't look like a web link.");
  }
  if (u.protocol !== "https:") throw new PostingError("I can only open secure (https) links.");
  if (u.username || u.password) throw new PostingError("I can't open links that contain a username or password.");
  if (u.port && u.port !== "443") throw new PostingError("I can only open standard web addresses.");
  const h = u.hostname.toLowerCase();
  if (!h.includes(".") || h.includes(":") || /^[\d.]+$/.test(h) || h.startsWith("[")) throw new PostingError("Please use a normal website address, not an IP address.");
  if (/(^|\.)(localhost|local|internal|intranet|lan|home|corp|onion|test|invalid|example)$/.test(h)) throw new PostingError("That isn't a public website I can open.");
  if (h.includes("xn--")) throw new PostingError("I can't open links with look-alike characters in the address.");
  if (/\.(exe|msi|bat|cmd|sh|jar|zip|rar|7z|dmg|apk|iso|scr|pdf|docx?)$/i.test(u.pathname)) throw new PostingError("That link goes to a file, not a web page.");
  return u;
}

/** Stable key for a posting link: tracking parameters and fragments removed. */
export function cacheKey(raw) {
  const u = validateUrl(raw);
  for (const k of [...u.searchParams.keys()]) if (/^(utm_|gclid$|fbclid$|mc_|ref$|src$|source$|trk)/i.test(k)) u.searchParams.delete(k);
  u.hash = "";
  return u.toString();
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "-", mdash: "-", rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', bull: "-", hellip: "..." };
export function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Math.min(+n, 0x10ffff)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(Math.min(parseInt(n, 16), 0x10ffff)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

export function htmlToText(html) {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|head)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|section|article|li|ul|ol|h[1-6]|tr|table|br)\s*>|<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<[^>]+>/g, " ");
  s = decode(s);
  return s.replace(/[ \t\f\v ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function flatten(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => flatten(n, out));
  else if (node && typeof node === "object") {
    out.push(node);
    if (node["@graph"]) flatten(node["@graph"], out);
  }
  return out;
}

/** Many job boards embed schema.org JobPosting JSON-LD, which works even on script-rendered pages. */
export function extractJobPosting(html) {
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1].trim()); } catch { continue; }
    for (const n of flatten(data)) {
      const type = [].concat(n["@type"] || []);
      if (!type.includes("JobPosting") || !n.description) continue;
      const loc = []
        .concat(n.jobLocation || [])
        .map((l) => l && l.address && [l.address.addressLocality, l.address.addressRegion, l.address.addressCountry && (l.address.addressCountry.name || l.address.addressCountry)].filter(Boolean).join(", "))
        .filter(Boolean)
        .join("; ");
      const lines = [
        n.title && `Title: ${n.title}`,
        n.hiringOrganization && n.hiringOrganization.name && `Company: ${n.hiringOrganization.name}`,
        loc && `Location: ${loc}`,
        n.jobLocationType && `Location type: ${n.jobLocationType}`,
        n.employmentType && `Employment type: ${[].concat(n.employmentType).join(", ")}`,
        "",
        htmlToText(String(n.description)),
      ].filter((x) => typeof x === "string");
      return lines.join("\n").trim();
    }
  }
  return null;
}

async function readCapped(res) {
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BYTES) { await reader.cancel(); break; }
    chunks.push(value);
  }
  const buf = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
}


/** Greenhouse postings: direct board links, embed links, and company pages carrying ?gh_jid=. */
export function greenhouseTarget(u) {
  const h = u.hostname.toLowerCase();
  const num = /^\d{3,15}$/;
  const token = /^[a-z0-9_-]{1,64}$/i;
  if (/(^|\.)greenhouse\.io$/.test(h)) {
    const m = /^\/([^/]+)\/jobs\/(\d+)/.exec(u.pathname);
    if (m && token.test(m[1]) && num.test(m[2])) return { boards: [m[1]], id: m[2] };
    const f = u.searchParams.get("for"), t = u.searchParams.get("token");
    if (f && t && token.test(f) && num.test(t)) return { boards: [f], id: t };
    return null;
  }
  const id = u.searchParams.get("gh_jid");
  if (id && num.test(id)) {
    // Company career pages usually use the company name as the board token.
    const labels = h.replace(/^www\./, "").split(".");
    const sld = labels.length >= 2 ? labels[labels.length - 2] : labels[0];
    const boards = [sld].filter((b) => token.test(b));
    return { boards, id };
  }
  return null;
}

async function fetchGreenhouse(target, fetchImpl) {
  for (const board of target.boards) {
    try {
      const res = await fetchImpl(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${target.id}`, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const j = JSON.parse(await readCapped(res));
      if (!j || !j.content) continue;
      const text = [
        j.title && `Title: ${j.title}`,
        `Company: ${board}`,
        j.location && j.location.name && `Location: ${j.location.name}`,
        "",
        htmlToText(decode(String(j.content))),
      ].filter((x) => typeof x === "string").join("\n").trim();
      if (text.length >= 300) return text;
    } catch {
      /* try the next candidate, then fall back to reading the page */
    }
  }
  return null;
}

const CANT_READ = "I couldn't read that page. Many job sites block automated readers or need a login. Could you paste the text of the job description here instead?";

/** The job number or UUID in a posting link, if any. */
function jobIdOf(u) {
  const m = /(?:^|[/=_-])(\d{5,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?=$|[/?&#_-])/i.exec(u.pathname + u.search);
  return m ? m[1] : null;
}

async function readPage(startUrl, fetchImpl, maxChars) {
  let url = startUrl;
  let res;
  for (let hop = 0; ; hop++) {
    try {
      res = await fetchImpl(url.toString(), {
        redirect: "manual",
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1", "Accept-Language": "en-US,en;q=0.9" },
        signal: AbortSignal.timeout(8000),
      });
    } catch (e) {
      throw new PostingError(CANT_READ, "fetch failed: " + String((e && e.message) || e).slice(0, 120));
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      if (hop >= MAX_REDIRECTS) throw new PostingError(CANT_READ, "too many redirects");
      url = validateUrl(new URL(res.headers.get("location"), url).toString());
      continue;
    }
    break;
  }
  if (!res.ok) throw new PostingError(CANT_READ, `HTTP ${res.status} from ${url.hostname}`);
  const type = (res.headers.get("content-type") || "").toLowerCase();
  if (!/text\/html|application\/xhtml|text\/plain/.test(type)) throw new PostingError("That link doesn't go to a web page I can read.", "content-type " + type.slice(0, 60));
  const html = await readCapped(res);
  const structured = extractJobPosting(html);
  let text = structured || htmlToText(html);
  if (text.length < 300) throw new PostingError(CANT_READ, `only ${text.length} chars of text from ${url.hostname}${structured ? "" : " (no JobPosting data)"}`);
  const id = jobIdOf(startUrl);
  if (id && !url.toString().includes(id)) {
    throw new PostingError("That link sent me to a page that isn't the job posting, so the role may be closed or moved. Could you paste the text of the job description here instead?", `redirected away from job id ${id} to ${url.hostname}${url.pathname}`);
  }
  return { url: url.toString(), text: text.slice(0, maxChars) };
}

/** Returns { url, text }. Throws PostingError with a visitor-safe message. */
export async function fetchPosting(raw, { fetchImpl = fetch, maxChars = 20000 } = {}) {
  const url = validateUrl(raw);
  const gh = greenhouseTarget(url);
  if (gh) {
    const text = await fetchGreenhouse(gh, fetchImpl);
    if (text) return { url: url.toString(), text: text.slice(0, maxChars) };
  }
  try {
    return await readPage(url, fetchImpl, maxChars);
  } catch (e) {
    // Company career pages that embed Greenhouse: the embed link needs only the job number.
    if (gh && e instanceof PostingError && !/(^|\.)greenhouse\.io$/.test(url.hostname)) {
      try {
        return await readPage(validateUrl("https://job-boards.greenhouse.io/embed/job_app?token=" + gh.id), fetchImpl, maxChars);
      } catch {
        /* report the original failure */
      }
    }
    throw e;
  }
}
