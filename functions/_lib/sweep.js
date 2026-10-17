/**
 * Transcript emails. A session is "closed" when the visitor leaves the page (immediate, via /api/chat/end)
 * or has been silent for EMAIL_IDLE_MINUTES (default 20). It is emailed once per batch of new messages:
 * if the visitor comes back and the chat continues, a later email carries the full, updated transcript.
 * Pages Functions have no scheduler, so the idle check runs opportunistically (throttled) on chat and admin
 * traffic, and can also be pinged by an external scheduler at /api/cron/sweep.
 */
import { ensureSchema } from "./schema.js";
import { sendEmail, emailConfigured } from "./email.js";
import { buildTranscriptEmail } from "./transcripts.js";

let lastSweep = 0;
export function resetSweepThrottle() { lastSweep = 0; }

const MAX_ATTEMPTS = 5;

/** Email one session's transcript if it has anything new. Returns "sent" | "skipped" | "failed". */
export async function emailSession({ db, env, sessionId }, fetchImpl) {
  if (!emailConfigured(env)) return "skipped";
  await ensureSchema(db);
  const session = await db.prepare("SELECT session_id, user_id, chat_type, mode, created_at, last_activity_at, message_count FROM chat_sessions WHERE session_id = ?1").bind(sessionId).first();
  if (!session) return "skipped";
  const messages = (await db.prepare("SELECT id, role, content, created_at FROM chat_messages WHERE session_id = ?1 ORDER BY id").bind(sessionId).all()).results;
  if (!messages.some((m) => m.role === "visitor")) return "skipped";
  const prev = await db.prepare("SELECT emailed_count, attempts FROM chat_emails WHERE session_id = ?1").bind(sessionId).first();
  const done = prev ? prev.emailed_count : 0;
  if (messages.length <= done || (prev && prev.attempts >= MAX_ATTEMPTS)) return "skipped";
  const cap = parseInt(env.EMAIL_DAILY_CAP, 10) || 100;
  const since = new Date(Date.now() - 86400e3).toISOString();
  if ((await db.prepare("SELECT COUNT(*) n FROM chat_emails WHERE sent_at > ?1").bind(since).first()).n >= cap) return "skipped";

  // Claim these messages first so two concurrent sweeps cannot send the same transcript twice.
  const claim = await db.prepare(
    "INSERT INTO chat_emails (session_id, emailed_count, attempts, sent_at) VALUES (?1, ?2, 0, ?3) ON CONFLICT(session_id) DO UPDATE SET emailed_count = excluded.emailed_count, sent_at = excluded.sent_at WHERE chat_emails.emailed_count < excluded.emailed_count"
  ).bind(sessionId, messages.length, new Date().toISOString()).run();
  if (!claim.meta || claim.meta.changes !== 1) return "skipped";

  const attachments = (await db.prepare("SELECT url FROM chat_attachments WHERE session_id = ?1").bind(sessionId).all()).results;
  const result = await sendEmail(env, buildTranscriptEmail({ env, session, messages, attachments }), fetchImpl);
  if (result.ok) return "sent";
  // Give the claim back so a later sweep retries (a few times), and keep the reason.
  await db.prepare("UPDATE chat_emails SET emailed_count = ?2, attempts = attempts + 1, sent_at = NULL WHERE session_id = ?1").bind(sessionId, done).run();
  try { await db.prepare("INSERT INTO chat_errors (created_at, session_id, status, message) VALUES (?1,?2,NULL,?3)").bind(new Date().toISOString(), sessionId, "transcript email: " + result.error).run(); } catch {}
  return "failed";
}

/** Email every session that has gone quiet. Throttled to once a minute per instance unless force is set. */
export async function sweepIdleSessions({ db, env, force = false }, fetchImpl) {
  if (!emailConfigured(env)) return { checked: 0, sent: 0 };
  if (!force && Date.now() - lastSweep < 60e3) return { checked: 0, sent: 0, throttled: true };
  lastSweep = Date.now();
  await ensureSchema(db);
  const idleMin = parseInt(env.EMAIL_IDLE_MINUTES, 10) || 20;
  const cutoff = new Date(Date.now() - idleMin * 60e3).toISOString();
  const since = (await db.prepare("SELECT value FROM chat_meta WHERE key = 'email_since'").first()).value;
  const due = (await db.prepare(
    `SELECT s.session_id FROM chat_sessions s LEFT JOIN chat_emails e ON e.session_id = s.session_id
      WHERE s.last_activity_at < ?1 AND s.last_activity_at >= ?2 AND s.message_count > COALESCE(e.emailed_count, 0) AND COALESCE(e.attempts, 0) < ?3
        AND EXISTS (SELECT 1 FROM chat_messages m WHERE m.session_id = s.session_id AND m.role = 'visitor')
      ORDER BY s.last_activity_at LIMIT 5`
  ).bind(cutoff, since, MAX_ATTEMPTS).all()).results;
  let sent = 0;
  for (const r of due) if ((await emailSession({ db, env, sessionId: r.session_id }, fetchImpl)) === "sent") sent++;
  return { checked: due.length, sent };
}
