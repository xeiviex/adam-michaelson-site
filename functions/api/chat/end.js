/** POST /api/chat/end {sessionId}: sent by the browser as the visitor closes the page or the fit modal. Emails the transcript. */
import { emailSession } from "../../_lib/sweep.js";

const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;
const ok = () => new Response(null, { status: 204 });

export async function onRequestPost({ request, env, waitUntil }) {
  if (!env.SMS_OPTIN_DB) return ok();
  let body;
  try { body = await request.json(); } catch { return ok(); }
  if (!SESSION_RE.test((body && body.sessionId) || "")) return ok();
  const task = emailSession({ db: env.SMS_OPTIN_DB, env, sessionId: body.sessionId }).catch((e) => console.error("transcript email", e && e.message));
  if (waitUntil) waitUntil(task); else await task;
  return ok();
}

export const onRequest = () => new Response("Method not allowed", { status: 405 });
