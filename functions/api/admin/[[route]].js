/**
 * /api/admin/*: data for the admin console. Every request must carry a valid Cloudflare Access
 * token for ADMIN_EMAIL (see _lib/adminauth.js), and every write must come from the console itself.
 */
import { verifyAccess } from "../../_lib/adminauth.js";
import { ensureSchema } from "../../_lib/schema.js";
import { ftsQuery } from "../../_lib/search.js";
import { sendAsAdam, setMode } from "../../_lib/convo.js";
import { provider, sendTest, setTelegramWebhook } from "../../_lib/alerts.js";
import { sweepIdleSessions } from "../../_lib/sweep.js";
import { emailConfigured } from "../../_lib/email.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });

const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;
const SEP_A = "\u0001", SEP_B = "\u0002"; // highlight markers used by snippet()

const dayStart = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d + "T00:00:00.000Z" : null);
const dayEnd = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || "") ? d + "T23:59:59.999Z" : null);

async function listConversations(db, url) {
  const p = url.searchParams;
  const type = ["intro", "fit"].includes(p.get("type")) ? p.get("type") : null;
  const mode = ["bot", "human"].includes(p.get("mode")) ? p.get("mode") : null;
  const fts = ftsQuery(p.get("q"));
  const limit = Math.min(parseInt(p.get("limit"), 10) || 50, 200);
  const rows = (await db.prepare(
    `SELECT s.session_id, s.user_id, s.chat_type, s.mode, s.created_at, s.last_activity_at, s.message_count,
            (SELECT content FROM chat_messages m WHERE m.session_id = s.session_id AND m.role = 'visitor' ORDER BY m.id LIMIT 1) AS preview
       FROM chat_sessions s
      WHERE (?1 IS NULL OR s.chat_type = ?1) AND (?2 IS NULL OR s.mode = ?2)
        AND (?3 IS NULL OR s.last_activity_at >= ?3) AND (?4 IS NULL OR s.created_at <= ?4)
        AND (?5 IS NULL OR s.session_id IN (SELECT m2.session_id FROM chat_messages_fts f JOIN chat_messages m2 ON m2.id = f.rowid WHERE chat_messages_fts MATCH ?5))
      ORDER BY s.last_activity_at DESC LIMIT ?6`
  ).bind(type, mode, dayStart(p.get("from")), dayEnd(p.get("to")), fts, limit).all()).results;
  let snippets = {};
  if (fts && rows.length) {
    const hits = (await db.prepare(
      `SELECT m.session_id, snippet(chat_messages_fts, 0, char(1), char(2), '…', 16) AS sn
         FROM chat_messages_fts JOIN chat_messages m ON m.id = chat_messages_fts.rowid
        WHERE chat_messages_fts MATCH ?1 ORDER BY m.id DESC LIMIT 400`
    ).bind(fts).all()).results;
    for (const h of hits) if (!snippets[h.session_id]) snippets[h.session_id] = h.sn;
  }
  return { conversations: rows.map((r) => ({ ...r, snippet: snippets[r.session_id] || null })) };
}

async function getConversation(db, url) {
  const id = url.searchParams.get("id") || "";
  if (!SESSION_RE.test(id)) return null;
  const after = parseInt(url.searchParams.get("after"), 10) || 0;
  const session = await db.prepare("SELECT session_id, user_id, chat_type, mode, created_at, last_activity_at, message_count FROM chat_sessions WHERE session_id = ?1").bind(id).first();
  if (!session) return null;
  const messages = (await db.prepare("SELECT id, role, content, created_at FROM chat_messages WHERE session_id = ?1 AND id > ?2 ORDER BY id LIMIT 500").bind(id, after).all()).results;
  const attachments = (await db.prepare("SELECT message_id, url FROM chat_attachments WHERE session_id = ?1").bind(id).all()).results;
  return { session, messages, attachments };
}

export async function onRequest({ request, env, params, waitUntil }) {
  // Fail closed: no valid Access token for the admin means this route does not exist.
  const who = await verifyAccess(request, env);
  if (!who || !env.SMS_OPTIN_DB) return new Response("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const db = env.SMS_OPTIN_DB;
  const route = [].concat(params.route || []).join("/");
  const url = new URL(request.url);
  const write = request.method === "POST";
  if (write) {
    // Writes only from the console itself (blocks cross-site form posts).
    if (request.headers.get("X-Admin") !== "1" || (request.headers.get("Origin") && new URL(request.headers.get("Origin")).host !== url.host)) return json({ error: "Forbidden" }, 403);
  } else if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);

  await ensureSchema(db);
  const sweep = sweepIdleSessions({ db, env }).catch(() => {});
  if (waitUntil) waitUntil(sweep);
  let body = {};
  if (write) { try { body = await request.json(); } catch { body = {}; } }

  switch (`${request.method} ${route}`) {
    case "GET conversations":
      return json(await listConversations(db, url));
    case "GET conversation": {
      const c = await getConversation(db, url);
      return c ? json(c) : json({ error: "Not found" }, 404);
    }
    case "POST reply": {
      const text = String(body.text || "").trim().slice(0, 2000);
      if (!SESSION_RE.test(body.sessionId || "") || !text) return json({ error: "Bad request" }, 400);
      return (await sendAsAdam(db, body.sessionId, text)) ? json({ ok: true }) : json({ error: "Not found" }, 404);
    }
    case "POST mode": {
      if (!SESSION_RE.test(body.sessionId || "")) return json({ error: "Bad request" }, 400);
      return (await setMode(db, body.sessionId, body.mode)) ? json({ ok: true }) : json({ error: "Bad request" }, 400);
    }
    case "GET status":
      return json({
        email: who.email,
        alertProvider: (env.ALERT_PROVIDER || "telegram").toLowerCase(),
        alertsConfigured: !!provider(env),
        emailConfigured: emailConfigured(env),
        telegram: { token: !!env.TELEGRAM_BOT_TOKEN, chatId: !!env.TELEGRAM_CHAT_ID, webhookSecret: !!env.TELEGRAM_WEBHOOK_SECRET },
      });
    case "POST telegram/webhook": {
      if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WEBHOOK_SECRET) return json({ ok: false, error: "Set TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET first." }, 400);
      return json(await setTelegramWebhook(env, url.origin));
    }
    case "POST telegram/test":
      return json(await sendTest(env));
    case "POST purge": {
      const days = Math.max(30, parseInt(body.days, 10) || 365);
      const cutoff = new Date(Date.now() - days * 86400e3).toISOString();
      const old = "(SELECT session_id FROM chat_sessions WHERE last_activity_at < ?1)";
      const counts = await db.prepare(`SELECT COUNT(*) n FROM chat_sessions WHERE last_activity_at < ?1`).bind(cutoff).first();
      await db.batch([
        db.prepare(`DELETE FROM chat_attachments WHERE session_id IN ${old}`).bind(cutoff),
        db.prepare(`DELETE FROM chat_messages WHERE session_id IN ${old}`).bind(cutoff),
        db.prepare(`DELETE FROM chat_alerts WHERE session_id IN ${old}`).bind(cutoff),
        db.prepare(`DELETE FROM chat_sessions WHERE last_activity_at < ?1`).bind(cutoff),
      ]);
      return json({ ok: true, deletedConversations: counts.n, olderThanDays: days });
    }
    default:
      return json({ error: "Not found" }, 404);
  }
}
