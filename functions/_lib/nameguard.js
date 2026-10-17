/**
 * Keeps specific names (the children's) out of anything the visitor sees or the log stores.
 * Blocked names come from CHAT_BLOCKED_NAMES (secret, comma or newline separated) plus a built-in default.
 * A full name that merely shares a first name with a blocked name (a colleague, say) is allowed:
 * the built-in default plus CHAT_ALLOWED_NAMES (e.g. "Joshua Steimle").
 */
export const REPLACEMENT = "one of my kids";

const split = (v) => String(v || "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

export function blockedNames(env) {
  return [...new Set(["Joshua", ...split(env && env.CHAT_BLOCKED_NAMES)])];
}

export function allowedFullNames(env) {
  return [...new Set(["Joshua Steimle", ...split(env && env.CHAT_ALLOWED_NAMES)])];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function pattern(names, allowed = []) {
  if (!names.length) return null;
  // Longest first, so "Mary Ann" wins over "Mary". Whole words only; a possessive keeps working.
  const alt = [...names].sort((a, b) => b.length - a.length).map((n) => {
    const surnames = allowed
      .filter((full) => full.toLowerCase().startsWith(n.toLowerCase() + " "))
      .map((full) => esc(full.slice(n.length).trim()).replace(/\s+/g, "\\s+"));
    return surnames.length ? `${esc(n)}(?!\\s+(?:${surnames.join("|")})(?![A-Za-z0-9_]))` : esc(n);
  }).join("|");
  return new RegExp(`(?<![A-Za-z0-9_])(?:${alt})(['\\u2019]s)?(?![A-Za-z0-9_])`, "gi");
}

const sub = (m, poss) => (poss ? "one of my kids'" : REPLACEMENT);

/** Replace blocked names in a complete string. */
export function redact(text, names, allowed = []) {
  const re = pattern(names, allowed);
  return re ? text.replace(re, sub) : text;
}

/** Streaming version: push() text chunks as they arrive, flush() at the end. Names split across chunks are caught. */
export function makeNameFilter(names, allowed = []) {
  const re = pattern(names, allowed);
  const longest = (list) => Math.max(0, ...list.map((n) => n.length));
  // Text after a name that can still change whether it matches (the apostrophe-s, or an allowed surname).
  const margin = Math.max(3, longest(allowed.map((a) => a.split(/\s+/).slice(1).join(" "))) + 2);
  const hold = re ? longest(names) + margin : 0;
  let buf = "";
  return {
    push(chunk) {
      if (!re) return chunk;
      const whole = buf + chunk;
      const boundary = Math.max(0, whole.length - hold);
      let out = "", pos = 0, stop = whole.length;
      for (const m of whole.matchAll(re)) {
        const end = m.index + m[0].length;
        if (end > whole.length - margin) { stop = m.index; break; } // may still grow: wait for more text
        if (m.index >= boundary) break;                              // beyond what we emit now
        out += whole.slice(pos, m.index) + sub(m[0], m[1]);
        pos = end;
      }
      const limit = Math.min(boundary, stop);
      if (limit > pos) { out += whole.slice(pos, limit); pos = limit; }
      buf = whole.slice(pos);
      return out;
    },
    flush() {
      if (!re) return "";
      const out = buf.replace(re, sub);
      buf = "";
      return out;
    },
  };
}
