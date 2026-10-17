/** Turn free text into a safe FTS5 query: every word quoted (AND), the last one as a prefix. */
export function ftsQuery(q) {
  const words = String(q || "").toLowerCase().match(/[\p{L}\p{N}_']+/gu) || [];
  if (!words.length) return null;
  return words.map((w, i) => `"${w.replace(/"/g, '""')}"${i === words.length - 1 ? "*" : ""}`).join(" ");
}

