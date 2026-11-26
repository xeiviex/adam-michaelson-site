/* LendingTree visiontypes: the live agent behind both prototypes, so a visitor can play with them and ask anything.
   POST { surface, path, stage, step, selected, held, messages: [{role, content}] } -> { text, action }
     surface  "lifecycle" (LendingTree website and app), "assistant" (inside ChatGPT) or "embedded" (inside a car marketplace's purchase flow)
     path     "loan" or "insurance"
     stage    where the person is in the journey (a short label the prototype sends, such as "offers" or "servicing")
     step     one line on what is on screen and what the next step of the flow is
     selected the offer or quote id they chose, if any
     held     true once they have closed a loan or bound a policy in this session
   action tells the prototype what to do after showing the text:
     "continue"  carry on with the flow where it was (the default)
     "pause"     they want to stop or think about it: end the flow gracefully
     "loan" / "insurance"  they want to switch to the other kind of shopping
     "home"      they want to see what they already hold (loans and accounts, or policies)
     "restart"   they want to start over
   Uses ANTHROPIC_API_KEY (already set for /api/chat). Optional LT_MODEL overrides the model.
   The sample data is imported here, not taken from the request, so a caller cannot change what the agent believes. */
import Anthropic from "@anthropic-ai/sdk";
import { PERSON, BANKS, LOANS, POLICIES, HELOC_OFFERS, HELOC_ESTIMATE, AUTO_QUOTES, AUTO_CURRENT, LIFECYCLE } from "../../public/lendingtree/visiontypes/shared/data.js";
import * as EMB from "../../public/lendingtree/visiontypes/embedded/data.js";

const ACTIONS = ["continue", "pause", "loan", "insurance", "home", "restart"];

const FACTS = JSON.stringify({
  person: PERSON, bank_accounts: BANKS, loans_already_held: LOANS.filter((l) => !l.isNew), policies_held: POLICIES,
  home_equity_offers: HELOC_OFFERS, home_equity_estimate: HELOC_ESTIMATE,
  auto_insurance_quotes: AUTO_QUOTES, current_auto_policy: AUTO_CURRENT, lifecycle: LIFECYCLE,
}, null, 1);

/* The embedded visiontype: buying a used truck on a car marketplace, financed and insured in the purchase flow. */
const EMB_CAR = EMB.LISTINGS.find((c) => c.id === EMB.HERO_ID) || EMB.LISTINGS[0];
const EMB_FACTS = JSON.stringify({
  person: PERSON, marketplace: EMB.MARKET, vehicle: EMB_CAR, price_breakdown: EMB.priceBreakdown(EMB_CAR), fees: EMB.FEES,
  financing_defaults: EMB.FINANCE, applicant: EMB.APPLICANT, auto_loan_offers: EMB.AUTO_LOAN_OFFERS, recommended_lender_by_term_months: EMB.LOAN_RECOMMEND,
  current_auto_policy: EMB.CURRENT_POLICY, cost_to_add_the_truck_to_the_current_policy_per_year: EMB.ADD_TO_CURRENT, current_policy_with_the_truck_added: EMB.CURRENT_WITH_TACOMA,
  two_vehicle_quotes: EMB.TWO_CAR_QUOTES, recommended_carrier: EMB.INSURANCE_RECOMMEND, delivery: EMB.DELIVERY,
}, null, 1);

const BASE = `You are the LendingTree agent in a product prototype ("visiontype") that shows how LendingTree could guide a person through the whole lifecycle of a loan or an insurance policy: shopping, comparing, applying, signing, then servicing and renewal. Everything is sample data for a fictional person, Alex Rivera. Nothing here is a real offer.

Your job in every reply:
1. Answer what the person actually asked, plainly and correctly, using only the facts below. Do the arithmetic carefully. If the facts do not cover it, say what you do not know rather than inventing a lender, rate, fee, date or approval odds.
2. Then guide them back to the step they were on, in one short sentence, so the journey keeps moving. The current step is described in the context at the end.
3. Act as an advisor who works for the person, not for any lender or carrier. Be even-handed. Never pressure.
4. If they clearly want out of the current flow, respect it and do not steer them back: wanting to stop or think it over, wanting to shop for the other kind of product, wanting to see what they already have, or wanting to start again. Choose the matching action.
5. If they ask about something unrelated to their money, loans or insurance, answer in a sentence if it is harmless, then bring them back.

Style: warm, direct, brief. Usually 2 to 3 sentences, never more than about 70 words. Plain text only: no markdown, no lists, no bold. No em dashes. Use dollar amounts and percentages as written in the facts.

Reply with a single JSON object and nothing else: {"text": "<what you say>", "action": "<one of ${ACTIONS.join(", ")}>"}.
Use "continue" unless rule 4 applies. "pause" = stop or think about it. "loan" or "insurance" = switch to shopping for that. "home" = show what they already hold. "restart" = start over.

Facts (sample data):
`;

const SURFACE = {
  embedded: "You are speaking inside the purchase flow of an independent used-car marketplace, in a financing and insurance module provided by LendingTree. The person is buying a truck there and has not left that site. Speak as LendingTree's guide inside that flow. The action \"home\" here means showing the order summary.",
  lifecycle: "You are speaking inside LendingTree's own website and app, as LendingTree's guide. Speak as LendingTree (\"I\" or \"we\").",
  assistant: "You are speaking inside a general consumer AI assistant (shown as ChatGPT) that has connected to LendingTree through MCP. Speak as the assistant, an advisor who brings in the LendingTree agent for offers, quotes and account data. Credit LendingTree when you use its data.",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
const clip = (v, n) => String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, n);

export function parseReply(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const o = JSON.parse(m[0]);
      const text = clip(o.text, 900);
      if (text) return { text, action: ACTIONS.includes(o.action) ? o.action : "continue" };
    } catch {}
  }
  const text = clip(s.replace(/^\{?\s*"?text"?\s*:\s*"?/, "").replace(/"?\s*,?\s*"action"[\s\S]*$/, ""), 900);
  return text ? { text, action: "continue" } : null;
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
  const raw = Array.isArray(body.messages) ? body.messages.slice(-14) : [];
  const messages = [];
  for (const m of raw) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = clip(m && m.content, 700);
    if (!content) continue;
    const last = messages[messages.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content; else messages.push({ role, content });
  }
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "bad_request" }, 400);

  const surface = body.surface === "assistant" ? "assistant" : body.surface === "embedded" ? "embedded" : "lifecycle";
  const emb = surface === "embedded";
  const path = body.path === "insurance" ? "insurance" : "loan";
  const picks = emb ? (path === "loan" ? EMB.AUTO_LOAN_OFFERS : EMB.TWO_CAR_QUOTES) : path === "loan" ? HELOC_OFFERS : AUTO_QUOTES;
  const chosen = picks.find((o) => o.id === body.selected);
  const context = [
    SURFACE[surface],
    emb
      ? `The person is on the ${path === "loan" ? "financing step (an auto loan for the truck they are buying)" : "insurance step (adding the truck to their Progressive policy, or moving both vehicles to another carrier)"}.`
      : `The person is on the ${path === "loan" ? "loan path (a home equity line for a backyard deck)" : "insurance path (replacing their Progressive auto policy)"}.`,
    `Stage: ${clip(body.stage, 60) || "unknown"}.`,
    clip(body.step, 300) ? `What is on screen and what comes next: ${clip(body.step, 300)}` : "",
    chosen ? `They have chosen ${chosen.lender || chosen.carrier}.` : "They have not chosen an offer yet.",
    body.held ? `They have already closed or bound in this session, so that ${path === "loan" ? (emb ? "auto loan" : "home equity line") : "auto policy"} is now something they hold.` : "",
  ].filter(Boolean).join("\n");

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({ model: env.LT_MODEL || "claude-sonnet-5-5", max_tokens: 400, system: BASE + (emb ? EMB_FACTS : FACTS) + "\n\nContext for this reply:\n" + context, messages });
    const out = parseReply(res.content.filter((b) => b.type === "text").map((b) => b.text).join(""));
    if (!out) return json({ error: "empty" }, 502);
    return json(out);
  } catch (e) {
    console.error("vt-assistant", e && e.status, e && e.message);
    return json({ error: "upstream" }, 502);
  }
}
