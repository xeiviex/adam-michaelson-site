/**
 * POST /api/chat  { sessionId, mode: "intro"|"fit", message }
 *
 * Streams the reply as server-sent events:  data: {"t":"text"}  ...  data: {"done":true}
 * History is loaded server-side from D1, never trusted from the client.
 * Every visitor and bot message is logged (chat_messages). Binding: SMS_OPTIN_DB.
 * Secrets: ANTHROPIC_API_KEY (required), CHAT_PRIVATE_GUIDANCE (optional).
 */
import Anthropic from "@anthropic-ai/sdk";
import knowledge from "../_generated/knowledge.js";
import { getConfig } from "../_lib/config.js";
import { buildSystem } from "../_lib/prompts.js";
import { looksLikeUrl, fetchPosting, PostingError } from "../_lib/jobfetch.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;
const now = () => new Date().toISOString();

export async function onRequestPost({ request, env, waitUntil }) {
  const cfg = getConfig(env);
  if (!env.ANTHROPIC_API_KEY || !env.SMS_OPTIN_DB) return json({ error: "Chat is not configured." }, 503);
  if (!knowledge) return json({ error: "Chat knowledge has not been built." }, 503);

  const origin = request.headers.get("Origin");
  if (origin) {
    let h = "";
    try { h = new URL(origin).hostname; } catch {}
    if (h !== new URL(request.url).hostname && h !== "localhost") return json({ error: "Forbidden." }, 403);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Malformed request." }, 400); }
  const sessionId = String(body.sessionId || "");
  const mode = body.mode === "fit" ? "fit" : body.mode === "intro" ? "intro" : null;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!SESSION_RE.test(sessionId) || !mode || !message) return json({ error: "Bad request." }, 400);
  if (message.length > cfg.maxMessageChars[mode]) {
    return json({ error: `That message is too long (max ${cfg.maxMessageChars[mode]} characters).` }, 413);
  }

  const db = env.SMS_OPTIN_DB;
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const ts = now();

  // Session (chat type is fixed by its first message).
  let session = await db.prepare("SELECT chat_type, mode, message_count FROM chat_sessions WHERE session_id = ?1").bind(sessionId).first();
  if (!session) {
    await db.prepare("INSERT INTO chat_sessions (session_id, user_id, chat_type, created_at, last_activity_at) VALUES (?1,?2,?3,?4,?4)")
      .bind(sessionId, ip, mode, ts).run();
    session = { chat_type: mode, mode: "bot", message_count: 0 };
  }
  const chatType = session.chat_type;

  // Abuse limits.
  const visitorTurns = (await db.prepare("SELECT COUNT(*) n FROM chat_messages WHERE session_id = ?1 AND role = 'visitor'").bind(sessionId).first()).n;
  if (visitorTurns >= cfg.maxTurns[chatType]) {
    return json({ error: `We've reached the limit for this conversation. Text me at ${cfg.contactPhone} or email ${cfg.contactEmail} and we'll pick it up.` }, 429);
  }
  const hourAgo = new Date(Date.now() - 3600e3).toISOString();
  const ipCount = (await db.prepare("SELECT COUNT(*) n FROM chat_messages WHERE user_id = ?1 AND role = 'visitor' AND created_at > ?2").bind(ip, hourAgo).first()).n;
  if (ipCount >= cfg.perIpPerHour) return json({ error: "You're sending messages quickly. Please try again a little later." }, 429);
  const dayAgo = new Date(Date.now() - 86400e3).toISOString();
  const dayCount = (await db.prepare("SELECT COUNT(*) n FROM chat_messages WHERE role = 'visitor' AND created_at > ?1").bind(dayAgo).first()).n;
  if (dayCount >= cfg.dailyLimit) {
    return json({ error: `I'm at capacity right now. Text me at ${cfg.contactPhone} or email ${cfg.contactEmail}.` }, 503);
  }

  // Log the visitor message before calling the model.
  const logged = await db.batch([
    db.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?1,?2,'visitor',?3,?4)").bind(ip, sessionId, message, ts),
    db.prepare("UPDATE chat_sessions SET last_activity_at = ?2, message_count = message_count + 1 WHERE session_id = ?1").bind(sessionId, ts),
  ]);
  const messageId = logged[0] && logged[0].meta && logged[0].meta.last_row_id;

  // Takeover hook (admin pass): a human is handling this session, so the bot stays quiet.
  if (session.mode === "human") return json({ human: true });

  // Fit chat: a lone link is fetched server-side and its text is stored with the message.
  const enc = new TextEncoder();
  const send = (c, o) => c.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
  const cannedReply = async (text) => {
    const t2 = now();
    await db.batch([
      db.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?1,?2,'bot',?3,?4)").bind(ip, sessionId, text, t2),
      db.prepare("UPDATE chat_sessions SET last_activity_at = ?2, message_count = message_count + 1 WHERE session_id = ?1").bind(sessionId, t2),
    ]);
    const body = new ReadableStream({ start(c) { send(c, { t: text }); send(c, { done: true }); c.close(); } });
    return new Response(body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store" } });
  };
  if (chatType === "fit" && looksLikeUrl(message)) {
    try {
      const posting = await fetchPosting(message, { maxChars: cfg.maxMessageChars.fit });
      await db.prepare("INSERT INTO chat_attachments (session_id, message_id, url, content, created_at) VALUES (?1,?2,?3,?4,?5)")
        .bind(sessionId, messageId, posting.url, posting.text, now()).run();
    } catch (e) {
      return cannedReply(e instanceof PostingError ? e.message : "I couldn't read that page. Could you paste the text of the job description here instead?");
    }
  }

  // History from D1, merged into strictly alternating turns.
  const rows = (await db.prepare(
    "SELECT m.role, m.content, a.url AS att_url, a.content AS att_text FROM chat_messages m LEFT JOIN chat_attachments a ON a.message_id = m.id " +
    "WHERE m.session_id = ?1 AND m.role IN ('visitor','bot') ORDER BY m.id DESC LIMIT 40").bind(sessionId).all()).results.reverse();
  const messages = [];
  for (const r of rows) {
    const role = r.role === "visitor" ? "user" : "assistant";
    const content = r.att_text
      ? `${r.content}\n\nThe text of that posting, fetched from ${r.att_url}:\n<job_posting>\n${r.att_text}\n</job_posting>`
      : r.content;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const system = buildSystem(cfg, chatType, knowledge, env.CHAT_PRIVATE_GUIDANCE);
  const FALLBACK = `I can't answer that one here. Text me at ${cfg.contactPhone} or email ${cfg.contactEmail}.`;

  const stream = new ReadableStream({
    async start(controller) {
      let text = "";
      try {
        const s = client.messages.stream({
          model: cfg.model,
          max_tokens: cfg.maxTokens[chatType],
          system,
          messages,
          thinking: { type: "between_tools" },
          output_config: { effort: cfg.effort },
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            text += ev.delta.text;
            send(controller, { t: ev.delta.text });
          }
        }
        const final = await s.finalMessage();
        console.log("chat usage", JSON.stringify({ cache_read: final.usage.cache_read_input_tokens, cache_write: final.usage.cache_creation_input_tokens, input: final.usage.input_tokens, output: final.usage.output_tokens }));
        if (final.stop_reason === "refusal" && !text) {
          try {
            await db.prepare("INSERT INTO chat_errors (created_at, session_id, status, message) VALUES (?1,?2,NULL,?3)")
              .bind(now(), sessionId, "refusal " + JSON.stringify(final.stop_details || {}).slice(0, 300)).run();
          } catch {}
          text = FALLBACK;
          send(controller, { t: text });
        }
        send(controller, { done: true });
      } catch (e) {
        console.error("chat error", e && e.status, e && e.message);
        try {
          await db.prepare("INSERT INTO chat_errors (created_at, session_id, status, message) VALUES (?1,?2,?3,?4)")
            .bind(now(), sessionId, e && e.status ? e.status : null, String((e && e.message) || e).slice(0, 600)).run();
        } catch {}
        if (!text) {
          text = FALLBACK;
          send(controller, { t: text });
        }
        send(controller, { done: true, error: true });
      }
      try {
        const t2 = now();
        await db.batch([
          db.prepare("INSERT INTO chat_messages (user_id, session_id, role, content, created_at) VALUES (?1,?2,'bot',?3,?4)").bind(ip, sessionId, text, t2),
          db.prepare("UPDATE chat_sessions SET last_activity_at = ?2, message_count = message_count + 1 WHERE session_id = ?1").bind(sessionId, t2),
        ]);
      } catch (e) { console.error("chat log error", e && e.message); }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}

// Method-specific handlers win over onRequest, so this only answers non-POST requests.
export const onRequest = () => json({ error: "Method not allowed." }, 405);
