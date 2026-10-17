/**
 * Alerts to Adam, behind a provider interface. Config chooses the provider (ALERT_PROVIDER, default "telegram").
 * Provider 1: Telegram bot (two-way, supports takeover). Provider 2: Twilio SMS, added once its campaign is approved.
 *
 * Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET (all secrets),
 *      ADMIN_BASE_URL (default https://adam-michaelson.com), ALERT_QUIET_HOURS (default "22-7"),
 *      ALERT_TZ (default America/Denver), ALERT_DAILY_CAP (default 50).
 * Alert text is plain text (no markup) because it contains visitor input.
 */
import { ensureSchema } from "./schema.js";
import { resolveSession, sendAsAdam, setMode, shortCode } from "./convo.js";

const now = () => new Date().toISOString();
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/* ---------------- providers ---------------- */

const telegram = {
  name: "telegram",
  configured: (env) => !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
  /** Returns { ok, id } where id is the provider's message id (used to route replies). */
  async send(env, text, fetchImpl = fetch) {
    const res = await fetchImpl(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: clip(text, 3500), disable_web_page_preview: true }),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: !!body.ok, id: body.result && String(body.result.message_id) };
  },
};

const twilio = {
  name: "twilio",
  configured: () => false, // enabled once the A2P campaign is approved
  async send() { return { ok: false }; },
};

export function provider(env) {
  const p = { telegram, twilio }[(env.ALERT_PROVIDER || "telegram").toLowerCase()] || telegram;
  return p.configured(env) ? p : null;
}

/* ---------------- policy ---------------- */

export function inQuietHours(env, date = new Date()) {
  const m = /^(\d{1,2})-(\d{1,2})$/.exec(env.ALERT_QUIET_HOURS || "22-7");
  if (!m) return false;
  const [start, end] = [+m[1], +m[2]];
  if (start === end) return false;
  let hour;
  try {
    hour = parseInt(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: env.ALERT_TZ || "America/Denver" }).format(date), 10) % 24;
  } catch { return false; }
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

const adminLink = (env, sessionId) => `${(env.ADMIN_BASE_URL || "https://adam-michaelson.com").replace(/\/$/, "")}/admin#${sessionId}`;

async function record(db, sessionId, kind, id) {
  await db.prepare("INSERT INTO chat_alerts (created_at, session_id, kind, provider_msg_id) VALUES (?1,?2,?3,?4)").bind(now(), sessionId, kind, id || null).run();
}

async function withinDailyCap(db, env) {
  const cap = parseInt(env.ALERT_DAILY_CAP, 10) || 50;
  const since = new Date(Date.now() - 86400e3).toISOString();
  return (await db.prepare("SELECT COUNT(*) n FROM chat_alerts WHERE created_at > ?1").bind(since).first()).n < cap;
}

/* ---------------- outbound alerts ---------------- */

/** First message of a new chat. Fit chats where a job description or link was sent get a "hot" alert. */
export async function alertNewSession({ db, env, sessionId, chatType, ip, text, hot = false }, fetchImpl) {
  const p = provider(env);
  if (!p || inQuietHours(env)) return;
  await ensureSchema(db);
  const prior = await db.prepare("SELECT COUNT(*) n FROM chat_alerts WHERE session_id = ?1 AND kind IN ('new','hot')").bind(sessionId).first();
  if (prior.n > 0 || !(await withinDailyCap(db, env))) return;
  const head = hot ? "🔥 Job description sent in fit chat" : chatType === "fit" ? "💬 New fit chat" : "💬 New chat";
  const r = await p.send(env, `${head} [${shortCode(sessionId)}] from ${ip}\n\n“${clip(text.replace(/\s+/g, " "), 300)}”\n\n${adminLink(env, sessionId)}\n\nReply to this message to answer as yourself.`, fetchImpl);
  if (r.ok) await record(db, sessionId, hot ? "hot" : "new", r.id);
}

/** A visitor wrote while Adam has the conversation: forward it. Not silenced by quiet hours. */
export async function forwardVisitorMessage({ db, env, sessionId, text }, fetchImpl) {
  const p = provider(env);
  if (!p) return;
  await ensureSchema(db);
  const since = new Date(Date.now() - 3600e3).toISOString();
  const recent = await db.prepare("SELECT COUNT(*) n FROM chat_alerts WHERE session_id = ?1 AND kind = 'fwd' AND created_at > ?2").bind(sessionId, since).first();
  if (recent.n >= 20) return;
  const r = await p.send(env, `↩️ [${shortCode(sessionId)}] visitor:\n${clip(text, 1000)}\n\nReply to this message to answer, or send "#${shortCode(sessionId)} /bot" to hand back.`, fetchImpl);
  if (r.ok) await record(db, sessionId, "fwd", r.id);
}

/* ---------------- inbound: Telegram webhook ---------------- */

const HELP = [
  "Chat takeover",
  "• Reply to any alert to answer that visitor as yourself (the chat switches to you).",
  "• #a3f2 your message: answer a specific chat by its code.",
  "• A plain message goes to the most recent chat that alerted you.",
  "• /bot hands the most recent chat back to the assistant; #a3f2 /bot hands back a specific one.",
].join("\n");

async function reply(env, text, fetchImpl) {
  await telegram.send(env, text, fetchImpl).catch(() => {});
}

/** Handle one Telegram update. Returns a short status string (the HTTP response is always 200). */
export async function handleTelegramUpdate({ db, env, update }, fetchImpl) {
  const msg = update && update.message;
  if (!msg || typeof msg.text !== "string") return "ignored";
  const fromId = String(msg.chat && msg.chat.id);
  if (!env.TELEGRAM_CHAT_ID) {
    // Setup help: tells the sender their own chat id so it can be saved as TELEGRAM_CHAT_ID.
    if (env.TELEGRAM_BOT_TOKEN) await fetchImpl(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: fromId, text: `Your chat id is ${fromId}. Save it as the TELEGRAM_CHAT_ID secret to finish setup.` }) }).catch(() => {});
    return "setup";
  }
  if (fromId !== String(env.TELEGRAM_CHAT_ID)) return "ignored"; // only Adam can send commands
  await ensureSchema(db);
  let text = msg.text.trim();
  if (!text || text === "/start" || text === "/help") { await reply(env, HELP, fetchImpl); return "help"; }

  // Which session does this refer to?
  let target = null;
  const coded = /^#([a-z0-9_-]{4,64})\s*([\s\S]*)$/i.exec(text);
  if (coded) {
    target = await resolveSession(db, coded[1]);
    text = coded[2].trim();
    if (!target || target === "ambiguous") { await reply(env, target ? "That code matches more than one chat. Use more characters." : `No chat found for #${coded[1]}.`, fetchImpl); return "nomatch"; }
  } else if (msg.reply_to_message) {
    const row = await db.prepare("SELECT session_id FROM chat_alerts WHERE provider_msg_id = ?1 ORDER BY id DESC LIMIT 1").bind(String(msg.reply_to_message.message_id)).first();
    if (row) target = await resolveSession(db, row.session_id);
  }
  if (!target) {
    const last = await db.prepare("SELECT session_id FROM chat_alerts ORDER BY id DESC LIMIT 1").first();
    target = last ? await resolveSession(db, last.session_id) : null;
    if (!target) { await reply(env, "No recent chat to answer. Wait for an alert.", fetchImpl); return "nomatch"; }
  }
  if (target === "ambiguous") return "ignored";
  const sid = target.session_id;

  if (text === "/bot") {
    await setMode(db, sid, "bot");
    await reply(env, `✓ #${shortCode(sid)} is back with the assistant.`, fetchImpl);
    return "handback";
  }
  if (!text) { await reply(env, "Nothing to send.", fetchImpl); return "empty"; }
  await sendAsAdam(db, sid, text.slice(0, 2000));
  await reply(env, `✓ Sent to #${shortCode(sid)}. You're now in the conversation; send /bot to hand back.`, fetchImpl);
  return "sent";
}

/** Register the webhook with Telegram (called from the admin console). */
export async function setTelegramWebhook(env, baseUrl, fetchImpl = fetch) {
  const res = await fetchImpl(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`, secret_token: env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"] }),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: !!body.ok, description: body.description || "" };
}

export async function sendTest(env, fetchImpl) {
  const p = provider(env);
  if (!p) return { ok: false, reason: "not configured" };
  return p.send(env, "✅ Test alert from adam-michaelson.com. Alerts are working.", fetchImpl);
}
