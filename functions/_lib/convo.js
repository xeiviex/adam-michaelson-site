/** Conversation actions shared by the admin console and the Telegram webhook. */
const now = () => new Date().toISOString();

export const shortCode = (sessionId) => sessionId.slice(0, 4).toLowerCase();

/** Find a session by full id or by its 4+ character short code. Returns a row, "ambiguous", or null. */
export async function resolveSession(db, ref) {
  const r = String(ref || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  if (r.length < 4) return null;
  const rows = (await db.prepare("SELECT session_id, mode, chat_type FROM chat_sessions WHERE lower(session_id) LIKE ?1 ORDER BY last_activity_at DESC LIMIT 2").bind(r + "%").all()).results;
  if (rows.length === 0) return null;
  if (rows.length > 1 && rows[0].session_id.toLowerCase() !== r) return "ambiguous";
  return rows[0];
}

/** Adam says something in a conversation: logs it and puts the session in human mode. */
export async function sendAsAdam(db, sessionId, text) {
  const t = now();
  const session = await db.prepare("SELECT user_id FROM chat_sessions WHERE session_id = ?1").bind(sessionId).first();
  if (!session) return false;
  await db.batch([
    db.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?1,?2,'adam',?3,?4)").bind(session.user_id, sessionId, text, t),
    db.prepare("UPDATE chat_sessions SET mode = 'human', last_activity_at = ?2, message_count = message_count + 1 WHERE session_id = ?1").bind(sessionId, t),
  ]);
  return true;
}

export async function setMode(db, sessionId, mode) {
  if (mode !== "bot" && mode !== "human") return false;
  const r = await db.prepare("UPDATE chat_sessions SET mode = ?2, last_activity_at = ?3 WHERE session_id = ?1").bind(sessionId, mode, now()).run();
  return true;
}
