/**
 * Keeps specific names (the children's) out of anything the visitor sees or the log stores.
 * Names come from CHAT_BLOCKED_NAMES (secret, comma or newline separated) plus a built-in default.
 */
export const REPLACEMENT = "one of my kids";

export function blockedNames(env) {
  const fromEnv = String((env && env.CHAT_BLOCKED_NAMES) || "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  return [...new Set(["Joshua", ...fromEnv])];
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function pattern(names) {
  if (!names.length) return null;
  // Longest first, so "Mary Ann" wins over "Mary". Whole words only; a possessive keeps working.
  const alt = [...names].sort((a, b) => b.length - a.length).map(esc).join("|");
  return new RegExp(`(?<![A-Za-z0-9_])(?:${alt})(['\u2019]s)?(?![A-Za-z0-9_])`, "gi");
}

const sub = (m, poss) => (poss ? "one of my kids'" : REPLACEMENT);

/** Replace blocked names in a complete string. */
export function redact(text, names) {
  const re = pattern(names);
  return re ? text.replace(re, sub) : text;
}

/** Streaming version: push() text chunks as they arrive, flush() at the end. Names split across chunks are caught. */
export function makeNameFilter(names) {
  const re = pattern(names);
  const hold = re ? Math.max(...names.map((n) => n.length)) + 3 : 0; // keep a tail this long
  let buf = "";
  return {
    push(chunk) {
      if (!re) return chunk;
      // A match touching the end of the buffer may still grow ("Joshua" -> "Joshuas" or "Joshua's"), so wait for more text.
      const whole = buf + chunk;
      buf = whole.replace(re, (m, poss, offset) => (offset + m.length > whole.length - 2 ? m : sub(m, poss)));
      if (buf.length <= hold) return "";
      const out = buf.slice(0, buf.length - hold);
      buf = buf.slice(buf.length - hold);
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
