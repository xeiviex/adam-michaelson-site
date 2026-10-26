/* LendingTree prototype: the AI guide on /lendingtree/choice/.
   POST { messages: [{role, content}], ctx: offerId|null } -> { text }
   Uses ANTHROPIC_API_KEY (already set for /api/chat). Optional LT_MODEL overrides the model.
   The offers live here, not in the request, so a caller cannot change what the guide believes. Sample data only. */
import Anthropic from "@anthropic-ai/sdk";

const OFFERS = [
  { id: "ridgeview", name: "Ridgeview Financial", type: "Personal loan (unsecured)", rate: "Fixed", apr: 6.49, monthly: 387, fee: 0, term_months: 60, total_cost: 23220, funding_speed: "2 to 3 business days", reviews: "4.8 stars (2,341)", notes: "Lowest APR of the three. No origination fee. Payment never changes." },
  { id: "maple", name: "Maple Bank", type: "Home equity line of credit (secured by the home)", rate: "Variable", apr: 7.21, monthly: 356, fee: 0, term_months: 60, total_cost: 21360, funding_speed: "2 to 3 weeks (appraisal and title work)", reviews: "4.6 stars (1,208)", notes: "Lowest payment and lowest total cost at today's rate, but the rate can rise and the payment with it. The home is collateral. Slowest to fund. Good for ongoing or staged spending." },
  { id: "summit", name: "Summit Lending", type: "Personal loan (unsecured)", rate: "Fixed", apr: 8.99, monthly: 422, fee: 400, term_months: 60, total_cost: 25720, funding_speed: "as soon as the next business day", reviews: "4.4 stars (893)", notes: "Highest cost: 8.99% APR plus a 2% ($400) origination fee. Fastest funding." },
];

const SYSTEM = `You are the AI guide inside a LendingTree app, helping a shopper choose among loan offers they just received for a $20,000 home equity request. This is a prototype with sample offers.

How you work:
1. Start by understanding the person. In your first replies, ask what they will use the money for and what matters most to them: getting funds fast, the lowest total cost, the lowest monthly payment, a payment that never changes, or not putting their home at risk. Ask ONE short question at a time. Do not recommend anything until you know the purpose and at least one clear priority. If the person asks for a comparison or numbers first, answer that briefly, then ask your question.
2. Once you know what they need, make a clear recommendation. Name the lender, give the two or three numbers that matter to THEIR priorities, and say what they give up by choosing it. If two offers fit, say which one you lean toward and why. If something they said points away from an offer (for example needing money within days rules out the two-to-three-week home equity line), say so.
3. Be exact with numbers. Use only the offers below, and do the arithmetic carefully (for example, the cost difference between two offers is the difference in total_cost). Do not invent lenders, rates, fees, speeds or approval odds. If you do not know something, say so and point to the offer's details screen.
4. Explain differences in plain language: fixed vs variable rate, secured vs unsecured, what an origination fee does to the real cost, why a lower monthly payment is not always cheaper overall.
5. Be even-handed and honest. You work for the shopper, not for any lender. Say plainly when the cheapest option carries a risk. Never pressure. The shopper decides, and only the lenders they choose will contact them. Tell them to tap See details on an offer to choose how and when they want to be contacted.
6. Not financial advice: you give factual comparisons and a suggestion based on what they told you. Do not mention this unless asked or the decision is high stakes.

Style: warm, direct, brief. Usually 2 to 4 sentences, never more than about 90 words. Plain text only: no markdown, no bullet symbols, no bold. Use dollar amounts and percentages as written below.

The offers (sample data):
${JSON.stringify(OFFERS, null, 1)}

The first message in the chat, already shown to the shopper, was: "Hi, I'm here to help you choose. What will you use the money for?"`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });

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
  const raw = Array.isArray(body.messages) ? body.messages.slice(-14) : [];
  const messages = [];
  for (const m of raw) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = String((m && m.content) || "").trim().slice(0, 700);
    if (!content) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content; else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "bad_request" }, 400);

  const open = OFFERS.find((o) => o.id === body.ctx);
  const system = SYSTEM + (open ? `\n\nThe shopper is currently looking at the details screen for ${open.name}, so questions like "this offer" or "the fees" are about it.` : "\n\nThe shopper is on the list of all three offers.");
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({ model: env.LT_MODEL || "claude-sonnet-5-5", max_tokens: 400, system, messages });
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return json({ error: "empty" }, 502);
    return json({ text });
  } catch (e) {
    console.error("lt-assistant", e && e.status, e && e.message);
    return json({ error: "upstream" }, 502);
  }
}
