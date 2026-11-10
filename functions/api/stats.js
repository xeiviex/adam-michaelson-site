/**
 * GET /api/stats
 * Secure API endpoint for querying site visitor metrics, page rank, return users, and daily trends.
 * Supports authentication via query parameter (?key=...), Authorization Bearer token, or X-Stats-Key header.
 * Filter parameter:
 *   - filter=visitors_only (default): excludes owner traffic (Adam's MacBook Air & iPhone)
 *   - filter=owner_only: shows only owner activity
 *   - filter=all: shows all traffic combined
 */
import { getStats } from "../_lib/analytics.js";

export const DEFAULT_STATS_KEY = "am_stats_k9x2m4p8v7w1n5q3";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });

export function isAuthorized(request, env) {
  const expectedKey = env?.STATS_KEY || DEFAULT_STATS_KEY;
  const url = new URL(request.url);

  // 1. Query parameter
  if (url.searchParams.get("key") === expectedKey) return true;

  // 2. Authorization header: Bearer <key>
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    if (auth.slice(7).trim() === expectedKey) return true;
  }

  // 3. Custom header
  const customHeader = request.headers.get("x-stats-key");
  if (customHeader === expectedKey) return true;

  return false;
}

export async function onRequestGet({ request, env }) {
  if (!isAuthorized(request, env)) {
    return json({ error: "Unauthorized. Provide valid key parameter or Bearer token." }, 401);
  }

  const url = new URL(request.url);
  const days = url.searchParams.get("days") || "30";
  const path = url.searchParams.get("path") || null;
  const includeBots = ["1", "true", "yes"].includes(url.searchParams.get("bots") || "");
  const filter = url.searchParams.get("filter") || "visitors_only";

  try {
    const data = await getStats(env?.SMS_OPTIN_DB, { days, path, includeBots, filter });
    return json(data);
  } catch (err) {
    return json({ error: "Failed to query analytics", message: err.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, X-Stats-Key, Content-Type"
    }
  });
}
