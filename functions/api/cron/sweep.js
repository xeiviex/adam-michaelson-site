/**
 * GET or POST /api/cron/sweep with header "X-Cron-Secret: <CRON_SECRET>": emails transcripts of every chat that has gone quiet.
 * Optional: point any free scheduler at this every few minutes so transcripts are sent on time even when the site is quiet.
 */
import { sweepIdleSessions } from "../../_lib/sweep.js";

export async function onRequest({ request, env }) {
  const given = request.headers.get("X-Cron-Secret") || "";
  const want = env.CRON_SECRET || "";
  let diff = given.length ^ want.length;
  for (let i = 0; i < Math.min(given.length, want.length); i++) diff |= given.charCodeAt(i) ^ want.charCodeAt(i);
  if (!want || diff !== 0) return new Response("Not found", { status: 404 });
  if (!env.SMS_OPTIN_DB) return new Response("Not configured", { status: 503 });
  return new Response(JSON.stringify(await sweepIdleSessions({ db: env.SMS_OPTIN_DB, env, force: true })), { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
