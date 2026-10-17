/**
 * GET /api/chat/poll?sessionId=...&after=<id>
 * Lets the visitor's chat pick up live messages from Adam and learn whether a human is in the conversation.
 * Only Adam's messages and the session mode are returned (never other visitors' data; the session id is unguessable).
 */
const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

import { sweepIdleSessions } from "../../_lib/sweep.js";

export async function onRequestGet({ request, env, waitUntil }) {
  if (!env.SMS_OPTIN_DB) return json({ mode: "bot", messages: [] });
  const url = new URL(request.url);
  const sid = url.searchParams.get("sessionId") || "";
  if (!SESSION_RE.test(sid)) return json({ error: "Bad request" }, 400);
  const after = parseInt(url.searchParams.get("after"), 10) || 0;
  const db = env.SMS_OPTIN_DB;
  if (waitUntil) waitUntil(sweepIdleSessions({ db, env }).catch(() => {}));
  const session = await db.prepare("SELECT mode FROM chat_sessions WHERE session_id = ?1").bind(sid).first();
  if (!session) return json({ mode: "bot", messages: [] });
  const messages = (await db.prepare("SELECT id, content, created_at FROM chat_messages WHERE session_id = ?1 AND role = 'adam' AND id > ?2 ORDER BY id LIMIT 20").bind(sid, after).all()).results;
  return json({ mode: session.mode, messages });
}

export const onRequest = () => json({ error: "Method not allowed" }, 405);
