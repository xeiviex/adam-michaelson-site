/** POST /api/telegram/webhook: Telegram delivers Adam's replies here. Authenticated by the secret token Telegram echoes back. */
import { handleTelegramUpdate } from "../../_lib/alerts.js";

const ok = (body = "ok") => new Response(body, { status: 200 });

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.SMS_OPTIN_DB || !env.TELEGRAM_WEBHOOK_SECRET) return new Response("Not configured", { status: 503 });
  if (!safeEqual(request.headers.get("X-Telegram-Bot-Api-Secret-Token") || "", env.TELEGRAM_WEBHOOK_SECRET)) return new Response("Unauthorized", { status: 401 });
  let update;
  try { update = await request.json(); } catch { return ok(); }
  try { await handleTelegramUpdate({ db: env.SMS_OPTIN_DB, env, update }, fetch); } catch (e) { console.error("telegram webhook error", e && e.message); }
  return ok();
}

export const onRequest = () => new Response("Method not allowed", { status: 405 });
