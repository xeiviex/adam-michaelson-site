import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { d1 } from "./helpers.mjs";
import {
  ensureAnalyticsSchema,
  resetAnalyticsSchemaCache,
  recordPageView,
  getStats,
  categorizeReferrer,
  isBot,
  detectDevice,
  detectDeviceLabel,
  isOwnerRequest,
  getVisitorId,
  normalizePath
} from "../functions/_lib/analytics.js";
import { isAuthorized, onRequestGet, DEFAULT_STATS_KEY } from "../functions/api/stats.js";

function freshAnalyticsDb() {
  resetAnalyticsSchemaCache();
  const sqlite = new DatabaseSync(":memory:");
  return { sqlite, db: d1(sqlite) };
}

test("detects bots vs human user agents", () => {
  assert.equal(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
  assert.equal(isBot("Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"), true);
  assert.equal(isBot("Twitterbot/1.0"), true);
  assert.equal(isBot("LinkedInBot/1.0 (compatible; Mozilla/5.0)"), true);
  assert.equal(isBot("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"), false);
  assert.equal(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"), false);
});

test("detects device labels (MacBook Air vs iPhone)", () => {
  const macReq = new Request("https://adam-michaelson.com/", {
    headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  });
  assert.equal(detectDeviceLabel(macReq), "MacBook Air");

  const iphoneReq = new Request("https://adam-michaelson.com/", {
    headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15" }
  });
  assert.equal(detectDeviceLabel(iphoneReq), "iPhone");

  const customReq = new Request("https://adam-michaelson.com/");
  assert.equal(detectDeviceLabel(customReq, "iphone"), "iPhone");
  assert.equal(detectDeviceLabel(customReq, "macbook"), "MacBook Air");
});

test("recognizes owner request via query param, cookie, or CF Access header", () => {
  const normalReq = new Request("https://adam-michaelson.com/");
  assert.equal(isOwnerRequest(normalReq, new URL("https://adam-michaelson.com/")), false);

  const queryReq1 = new Request("https://adam-michaelson.com/?owner=adam");
  assert.equal(isOwnerRequest(queryReq1, new URL("https://adam-michaelson.com/?owner=adam")), true);

  const queryReq2 = new Request("https://adam-michaelson.com/?me=adam");
  assert.equal(isOwnerRequest(queryReq2, new URL("https://adam-michaelson.com/?me=adam")), true);

  const cookieReq = new Request("https://adam-michaelson.com/", {
    headers: { cookie: "session=123; _am_owner=1" }
  });
  assert.equal(isOwnerRequest(cookieReq, new URL("https://adam-michaelson.com/")), true);

  const accessReq = new Request("https://adam-michaelson.com/", {
    headers: { "cf-access-jwt-assertion": "valid.token.here" }
  });
  assert.equal(isOwnerRequest(accessReq, new URL("https://adam-michaelson.com/")), true);
});

test("categorizes referrers cleanly", () => {
  assert.equal(categorizeReferrer(null), "direct");
  assert.equal(categorizeReferrer(""), "direct");
  assert.equal(categorizeReferrer("https://www.linkedin.com/feed/"), "linkedin");
  assert.equal(categorizeReferrer("https://www.google.com/search?q=adam+michaelson"), "google");
  assert.equal(categorizeReferrer("https://t.co/abc123xyz"), "twitter/x");
  assert.equal(categorizeReferrer("https://news.ycombinator.com/item?id=123"), "hacker-news");
  assert.equal(categorizeReferrer("https://adam-michaelson.com/bio/"), "internal");
  assert.equal(categorizeReferrer("https://github.com/xeiviex"), "github");
});

test("normalizes paths consistently", () => {
  assert.equal(normalizePath("/"), "/");
  assert.equal(normalizePath("/bio"), "/bio/");
  assert.equal(normalizePath("/bio/"), "/bio/");
  assert.equal(normalizePath("/product/pm"), "/product/pm/");
  assert.equal(normalizePath("/index.html"), "/index.html");
  assert.equal(normalizePath("/bio?utm_source=linkedin"), "/bio/");
});

test("extracts visitor id from cookies", () => {
  const reqNoCookie = new Request("https://adam-michaelson.com/");
  assert.equal(getVisitorId(reqNoCookie), null);

  const reqWithCookie = new Request("https://adam-michaelson.com/", {
    headers: { cookie: "other=123; _am_vid=user-uuid-456; something=abc" }
  });
  assert.equal(getVisitorId(reqWithCookie), "user-uuid-456");
});

test("records pageviews and computes full analytics", async () => {
  const { db } = freshAnalyticsDb();

  const req1 = new Request("https://adam-michaelson.com/bio/", {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "referer": "https://www.linkedin.com/in/recruiter"
    }
  });

  // First visit for Visitor A
  await recordPageView(db, {
    request: req1,
    url: new URL("https://adam-michaelson.com/bio/"),
    visitorId: "visitor-A",
    isReturning: false
  });

  // Second visit for Visitor A (different page, returning)
  await recordPageView(db, {
    request: req1,
    url: new URL("https://adam-michaelson.com/product/"),
    visitorId: "visitor-A",
    isReturning: true
  });

  // First visit for Visitor B (same page /bio/)
  await recordPageView(db, {
    request: req1,
    url: new URL("https://adam-michaelson.com/bio/"),
    visitorId: "visitor-B",
    isReturning: false
  });

  // Bot visit (should be excluded by default)
  const botReq = new Request("https://adam-michaelson.com/bio/", {
    headers: { "user-agent": "Googlebot/2.1" }
  });
  await recordPageView(db, {
    request: botReq,
    url: new URL("https://adam-michaelson.com/bio/"),
    visitorId: "bot-1",
    isReturning: false
  });

  // Query stats
  const stats = await getStats(db, { days: 30 });

  assert.equal(stats.totals.total_views, 3);
  assert.equal(stats.totals.unique_visitors, 2);
  assert.equal(stats.totals.returning_visitors, 1);
  assert.equal(stats.totals.return_rate_pct, 50);

  // Check page rank (most viewed pages descending)
  assert.equal(stats.page_rank.length, 2);
  assert.equal(stats.page_rank[0].path, "/bio/");
  assert.equal(stats.page_rank[0].views, 2);
  assert.equal(stats.page_rank[0].unique_visitors, 2);
  assert.equal(stats.page_rank[1].path, "/product/");
  assert.equal(stats.page_rank[1].views, 1);

  // Check return users per page
  assert.equal(stats.return_users_per_page.length, 1);
  assert.equal(stats.return_users_per_page[0].path, "/product/");
  assert.equal(stats.return_users_per_page[0].returning_views, 1);

  // Check referrers
  assert.equal(stats.top_referrers.length, 1);
  assert.equal(stats.top_referrers[0].source, "linkedin");

  // Including bots when requested
  const botStats = await getStats(db, { days: 30, includeBots: true });
  assert.equal(botStats.totals.total_views, 4);
});

test("recognizes and isolates owner traffic (MacBook Air & iPhone)", async () => {
  const { db } = freshAnalyticsDb();

  // 1. External recruiter visit
  const recruiterReq = new Request("https://adam-michaelson.com/bio/", {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  await recordPageView(db, {
    request: recruiterReq,
    url: new URL("https://adam-michaelson.com/bio/"),
    visitorId: "recruiter-123",
    isReturning: false,
    isOwner: false
  });

  // 2. Adam visiting from MacBook Air (?owner=adam)
  const macReq = new Request("https://adam-michaelson.com/?owner=adam", {
    headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  });
  await recordPageView(db, {
    request: macReq,
    url: new URL("https://adam-michaelson.com/?owner=adam"),
    visitorId: "adam-mac-vid",
    isReturning: false,
    isOwner: true
  });

  // 3. Adam visiting later from MacBook Air WITHOUT ?owner=adam (auto-recognized via DB visitor record)
  const macReq2 = new Request("https://adam-michaelson.com/product/", {
    headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" }
  });
  await recordPageView(db, {
    request: macReq2,
    url: new URL("https://adam-michaelson.com/product/"),
    visitorId: "adam-mac-vid",
    isReturning: true,
    isOwner: false // should be auto-promoted by visitor_id in DB!
  });

  // 4. Adam visiting from iPhone (?owner=adam)
  const iphoneReq = new Request("https://adam-michaelson.com/bio/?owner=adam", {
    headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15" }
  });
  await recordPageView(db, {
    request: iphoneReq,
    url: new URL("https://adam-michaelson.com/bio/?owner=adam"),
    visitorId: "adam-iphone-vid",
    isReturning: false,
    isOwner: true
  });

  // Query default: visitors_only (Adam's views MUST be excluded!)
  const visitorStats = await getStats(db, { filter: "visitors_only" });
  assert.equal(visitorStats.totals.total_views, 1);
  assert.equal(visitorStats.totals.unique_visitors, 1);
  assert.equal(visitorStats.page_rank.length, 1);
  assert.equal(visitorStats.page_rank[0].path, "/bio/");

  // Owner activity is reported separately
  assert.equal(visitorStats.owner_activity.total_views, 3);
  assert.equal(visitorStats.owner_activity.unique_devices, 2);
  const macEntry = visitorStats.owner_activity.devices.find((d) => d.device === "MacBook Air");
  const iphoneEntry = visitorStats.owner_activity.devices.find((d) => d.device === "iPhone");
  assert.ok(macEntry);
  assert.equal(macEntry.views, 2);
  assert.ok(iphoneEntry);
  assert.equal(iphoneEntry.views, 1);

  // Query filter=owner_only
  const ownerStats = await getStats(db, { filter: "owner_only" });
  assert.equal(ownerStats.totals.total_views, 3);
  assert.equal(ownerStats.totals.unique_visitors, 2);

  // Query filter=all
  const allStats = await getStats(db, { filter: "all" });
  assert.equal(allStats.totals.total_views, 4);
});

test("/api/stats authentication and response", async () => {
  const { db } = freshAnalyticsDb();

  // Seed sample data
  await recordPageView(db, {
    request: new Request("https://adam-michaelson.com/"),
    url: new URL("https://adam-michaelson.com/"),
    visitorId: "test-v1",
    isReturning: false
  });

  const env = { SMS_OPTIN_DB: db, STATS_KEY: "my_secret_token_123" };

  // 1. Unauthorized without key
  const unauthReq = new Request("https://adam-michaelson.com/api/stats");
  const unauthRes = await onRequestGet({ request: unauthReq, env });
  assert.equal(unauthRes.status, 401);

  // 2. Authorized via query param
  const queryReq = new Request(`https://adam-michaelson.com/api/stats?key=my_secret_token_123&days=7`);
  const queryRes = await onRequestGet({ request: queryReq, env });
  assert.equal(queryRes.status, 200);
  const data = await queryRes.json();
  assert.equal(data.totals.total_views, 1);
  assert.equal(data.query.days, 7);

  // 3. Authorized via Bearer header
  const bearerReq = new Request("https://adam-michaelson.com/api/stats", {
    headers: { authorization: "Bearer my_secret_token_123" }
  });
  const bearerRes = await onRequestGet({ request: bearerReq, env });
  assert.equal(bearerRes.status, 200);

  // 4. Default key when env.STATS_KEY is not set
  const defEnv = { SMS_OPTIN_DB: db };
  const defReq = new Request(`https://adam-michaelson.com/api/stats?key=${DEFAULT_STATS_KEY}`);
  const defRes = await onRequestGet({ request: defReq, env: defEnv });
  assert.equal(defRes.status, 200);
});
