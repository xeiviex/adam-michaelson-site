/* Achieve debt relief prototype: the assistant behind /achieve.
   POST { messages: [{role, content}], ctx: { stage, step, first, deposit, months, debts } } -> { text }
   Uses ANTHROPIC_API_KEY (already set for /api/chat). Optional ACHIEVE_MODEL overrides the model.
   Knowledge is server-side (public/achieve/debt-knowledge.js); the caller adds light context only.
   The client never sends a Social Security number, bank login or account number. */
import Anthropic from "@anthropic-ai/sdk";
import { DEBT_KNOWLEDGE } from "../../public/achieve/debt-knowledge.js";

const STAGES = ["lead", "qualify", "consult", "enroll", "deposit", "build", "negotiate", "free"];

const RULES = `You are the assistant inside a prototype of Achieve's debt relief experience. People move through a guided journey and can ask you anything at any time.

How you answer:
- Answer directly and briefly, usually 1 to 3 sentences and never more than about 90 words. Plain text, no markdown, no bullets, no bold. At most one emoji, only when it fits.
- Use the knowledge below. If you do not know, or it depends on their creditors or their specifics, say so plainly instead of guessing. Never invent fees, rates, results or policies.
- Be honest about downsides (credit impact, creditor calls, lawsuits, taxes) whenever the question touches them. Never promise a result, a credit score outcome or a timeline. Label estimates as estimates.
- Tone: warm, calm, plain-spoken, never pushy, never judgmental about debt. Short sentences.
- Never ask for or accept a Social Security number, full date of birth, bank login, card number or account number in chat. If offered, tell them to use the secure step instead.
- If they mention a lawsuit, legal papers, a wage garnishment or a court date, treat it as urgent: tell them to contact their specialist right away at (833) 435-2021 and not to ignore it.
- If they seem to be in distress about money, be kind and brief, and point to their specialist.
- You are not giving legal, tax or investment advice. For those, say a professional can help and share the general fact.
- Do not tell them what to click next. The app keeps them on their step after you answer.
- If they ask for a person, say a specialist can help and share the prototype number.`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const clean = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

export function contextBlock(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const lines = [];
  const idx = STAGES.indexOf(clean(c.stage, 20));
  if (idx >= 0) lines.push(`They are on stage ${idx + 1} of 8 (${STAGES[idx]}).`);
  if (clean(c.first, 40)) lines.push(`Their first name is ${clean(c.first, 40)}.`);
  if (num(c.deposit)) lines.push(`Their sample monthly deposit is $${num(c.deposit)}.`);
  if (num(c.months)) lines.push(`Their sample plan estimate is about ${num(c.months)} months.`);
  if (Array.isArray(c.debts) && c.debts.length) {
    lines.push("Their sample debts:\n" + c.debts.slice(0, 8).map((d) => `${clean(d.name, 40)} (${clean(d.kind, 20)}), $${num(d.balance)}`).join("\n"));
  }
  return lines.join("\n");
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503);
  const origin = request.headers.get("Origin");
  if (origin) {
    let h = "";
    try { h = new URL(origin).hostname; } catch {}
    if (h !== new URL(request.url).hostname && h !== "localhost") return json({ error: "forbidden" }, 403);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad_request" }, 400); }
  const raw = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const messages = [];
  for (const m of raw) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = clean(m && m.content, 600);
    if (!content) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content; else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "bad_request" }, 400);

  const system = [
    { type: "text", text: RULES + "\n\nWhat you know:\n" + DEBT_KNOWLEDGE, cache_control: { type: "ephemeral" } },
    { type: "text", text: contextBlock(body.ctx) || "No extra context." },
  ];
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({ model: env.ACHIEVE_MODEL || "claude-sonnet-5-5", max_tokens: 350, system, messages });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return json({ error: "empty" }, 502);
    return json({ text });
  } catch (e) {
    console.error("achieve-debt-assistant", e && e.status, e && e.message);
    return json({ error: "upstream" }, 502);
  }
}
