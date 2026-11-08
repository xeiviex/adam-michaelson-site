/* Achieve prototype: the assistant behind /achieve, /achieve/messages and /achieve/chatgpt.
   POST { messages: [{role, content}], ctx: { step, amount, purpose, first, offerId, offers, persona, channel } } -> { text }
   Uses ANTHROPIC_API_KEY (already set for /api/chat). Optional ACHIEVE_MODEL overrides the model.
   Knowledge is server-side (public/achieve/shared/kb.js); the caller can only add light context, never change the rules.
   The client never sends a Social Security number or birth date. */
import Anthropic from "@anthropic-ai/sdk";
import { KNOWLEDGE_TEXT } from "../../public/achieve/shared/kb.js";
import { STEPS } from "../../public/achieve/shared/flow.js";

const RULES = `You are the assistant inside a prototype of Achieve's loan application. Visitors are going through a step-by-step flow (a form, delivered as a conversation) and can ask you anything at any time.

How you answer:
- Answer the question directly and briefly (usually 1 to 3 sentences, never more than about 80 words). Plain text, no markdown, no bullet symbols, no bold. One emoji at most, and only when it fits.
- Use the knowledge below. If you don't know, or it depends on their credit or Achieve's underwriting, say so plainly rather than guess. Never invent rates, approvals, fees or policies. The offers shown in this prototype are samples; say so if asked whether they're real.
- Tone: warm, reassuring, plain-spoken, never pushy, never judgmental about debt. Short sentences.
- Never ask for or accept a Social Security number, full date of birth, bank login or card number in chat. If they offer one, tell them to use the secure verification step and not to type it here.
- Do not re-ask the form question or tell them what to do next; the app brings them back to their step after you answer.
- If they ask for a person, say you'll bring in a consultant (the app handles it). If asked to change an answer or jump to a step, say they can click it in the progress list or say "take me to <step>".
- You are not giving financial, legal or tax advice. Give factual comparisons; mention the tradeoff when one option is cheaper but riskier.`;

const HUMAN = `You are playing Maya Reynolds, a friendly Achieve loan consultant who has just joined this chat. This is a prototype and the person knows Maya is simulated. Write as Maya in first person, warm and personal, 1 to 3 short sentences, plain text. You can see their progress in the application. You can offer to stay with them, and say they can hand the conversation back to the automated assistant any time. Everything else follows the rules above.`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

const clean = (v, n) => String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

export function contextBlock(ctx) {
  const c = ctx && typeof ctx === "object" ? ctx : {};
  const lines = [];
  const step = STEPS.find((s) => s.id === c.step);
  if (step) lines.push(`They are on the "${step.label}" step (${step.q}).`);
  if (clean(c.first, 40)) lines.push(`Their first name is ${clean(c.first, 40)}.`);
  if (num(c.amount)) lines.push(`Requested loan amount: $${num(c.amount)}.`);
  if (clean(c.purpose, 40)) lines.push(`Loan purpose: ${clean(c.purpose, 40)}.`);
  const ch = clean(c.channel, 12);
  if (ch === "messages") lines.push("They are texting by SMS/iMessage with an Achieve agent, so keep replies extra short.");
  if (ch === "chatgpt") lines.push("They are talking to you inside ChatGPT, so be conversational.");
  if (Array.isArray(c.offers) && c.offers.length) {
    const rows = c.offers.slice(0, 6).map((o) => `${clean(o.id, 12)}: ${clean(o.name, 40)} (${clean(o.short, 40)}), ${num(o.apr)}% APR ${clean(o.rateType, 10)}, $${num(o.monthly)}/month, ${num(o.term)} months, fee $${num(o.fee)}, est. total cost $${num(o.totalCost)}, funding ${clean(o.funding, 50)}${o.secured ? ", secured by their home" : ", unsecured"}`);
    lines.push("Sample Achieve offers shown to them (all are Achieve products; Achieve is the lender):\n" + rows.join("\n"));
    const open = c.offers.find((o) => o && o.id === c.offerId);
    if (open) lines.push(`They are looking at the details of the ${clean(open.name, 40)} (${clean(open.short, 40)}) offer, so "this offer" means that one.`);
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

  const ctx = body.ctx || {};
  const persona = ctx.persona === "human" ? HUMAN : "";
  const system = [
    { type: "text", text: RULES + "\n\nWhat you know:\n" + KNOWLEDGE_TEXT, cache_control: { type: "ephemeral" } },
    { type: "text", text: [persona, contextBlock(ctx)].filter(Boolean).join("\n\n") || "No extra context." },
  ];
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({ model: env.ACHIEVE_MODEL || "claude-sonnet-5-5", max_tokens: 350, system, messages });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return json({ error: "empty" }, 502);
    return json({ text });
  } catch (e) {
    console.error("achieve-assistant", e && e.status, e && e.message);
    return json({ error: "upstream" }, 502);
  }
}
