/**
 * Privacy-respecting, lightweight analytics for adam-michaelson.com.
 * Persisted in Cloudflare D1 (SMS_OPTIN_DB).
 * Zero external trackers, completely adblock-proof, zero performance impact.
 */

export const ANALYTICS_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS page_views (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at TEXT NOT NULL,
     date TEXT NOT NULL,
     path TEXT NOT NULL,
     visitor_id TEXT NOT NULL,
     is_returning INTEGER NOT NULL DEFAULT 0,
     referrer TEXT,
     referrer_source TEXT,
     country TEXT,
     city TEXT,
     device TEXT,
     is_bot INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_pv_date ON page_views (date)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views (path)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views (visitor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_date_path ON page_views (date, path)`,
  `CREATE TABLE IF NOT EXISTS site_visitors (
     visitor_id TEXT PRIMARY KEY,
     first_seen_at TEXT NOT NULL,
     last_seen_at TEXT NOT NULL,
     total_views INTEGER NOT NULL DEFAULT 1
   )`,
  `CREATE INDEX IF NOT EXISTS idx_sv_last_seen ON site_visitors (last_seen_at)`
];

let schemaReady = false;

export async function ensureAnalyticsSchema(db) {
  if (schemaReady || !db) return;
  for (const sql of ANALYTICS_STATEMENTS) {
    await db.prepare(sql).run();
  }
  schemaReady = true;
}

export function resetAnalyticsSchemaCache() {
  schemaReady = false;
}

const BOT_RE = /bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|embedly|quora link preview|pinterest|googlebot|bingbot|yandex|duckduckgo|baiduspider|headlesschrome/i;

export function isBot(userAgent) {
  return BOT_RE.test(userAgent || "");
}

export function detectDevice(request) {
  const cfDevice = request?.headers?.get?.("cf-device-type");
  if (cfDevice) return cfDevice.toLowerCase();
  const ua = request?.headers?.get?.("user-agent") || "";
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|android|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

export function categorizeReferrer(refUrl, siteHost = "adam-michaelson.com") {
  if (!refUrl) return "direct";
  try {
    const u = new URL(refUrl);
    const host = u.hostname.toLowerCase();
    if (host === siteHost || host.endsWith("." + siteHost)) return "internal";
    if (host.includes("linkedin.")) return "linkedin";
    if (host.includes("google.")) return "google";
    if (host.includes("t.co") || host.includes("twitter.") || host.includes("x.com")) return "twitter/x";
    if (host.includes("github.")) return "github";
    if (host.includes("facebook.")) return "facebook";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("bing.")) return "bing";
    if (host.includes("duckduckgo.")) return "duckduckgo";
    if (host.includes("substack.")) return "substack";
    if (host.includes("news.ycombinator.com")) return "hacker-news";
    return host.replace(/^www\./, "");
  } catch {
    return "other";
  }
}

export function getVisitorId(request) {
  const cookieHeader = request?.headers?.get?.("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)_am_vid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function normalizePath(rawPath) {
  if (!rawPath) return "/";
  let p = rawPath.split("?")[0].split("#")[0].trim();
  if (!p.startsWith("/")) p = "/" + p;
  // Ensure trailing slash for directory-style pages (except files with extensions)
  if (!p.endsWith("/") && !/\.[a-z0-9]+$/i.test(p)) {
    p = p + "/";
  }
  return p;
}

export async function recordPageView(db, { request, url, visitorId, isReturning }) {
  if (!db) return;
  await ensureAnalyticsSchema(db);

  const now = new Date();
  const createdAt = now.toISOString();
  const date = createdAt.slice(0, 10);
  const path = normalizePath(url?.pathname || "/");
  const userAgent = request?.headers?.get?.("user-agent") || "";
  const bot = isBot(userAgent) ? 1 : 0;
  const rawReferrer = request?.headers?.get?.("referer") || "";
  const referrerSource = categorizeReferrer(rawReferrer, url?.hostname);

  const country = request?.cf?.country || "";
  const city = request?.cf?.city || "";
  const device = detectDevice(request);

  if (isReturning) {
    await db.prepare(
      `UPDATE site_visitors SET last_seen_at = ?1, total_views = total_views + 1 WHERE visitor_id = ?2`
    ).bind(createdAt, visitorId).run();
  } else {
    await db.prepare(
      `INSERT OR IGNORE INTO site_visitors (visitor_id, first_seen_at, last_seen_at, total_views) VALUES (?1, ?2, ?2, 1)`
    ).bind(visitorId, createdAt).run();
  }

  await db.prepare(
    `INSERT INTO page_views (created_at, date, path, visitor_id, is_returning, referrer, referrer_source, country, city, device, is_bot)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
  ).bind(
    createdAt,
    date,
    path,
    visitorId,
    isReturning ? 1 : 0,
    rawReferrer ? rawReferrer.slice(0, 500) : null,
    referrerSource,
    country,
    city,
    device,
    bot
  ).run();
}

export async function getStats(db, { days = 30, path = null, includeBots = false } = {}) {
  if (!db) return { error: "No database" };
  await ensureAnalyticsSchema(db);

  let sinceDate = null;
  const numDays = days === "all" ? 0 : Math.max(1, parseInt(days, 10) || 30);
  if (days !== "all") {
    sinceDate = new Date(Date.now() - (numDays - 1) * 86400000).toISOString().slice(0, 10);
  }

  const normPath = path ? normalizePath(path) : null;
  const maxBot = includeBots ? 1 : 0;

  // 1. Overall totals
  const totalsRow = await db.prepare(
    `SELECT
       COUNT(*) AS total_views,
       COUNT(DISTINCT visitor_id) AS unique_visitors,
       COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors,
       COUNT(DISTINCT path || '::' || visitor_id) AS unique_page_views
     FROM page_views
     WHERE is_bot <= ?3
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)`
  ).bind(sinceDate, normPath, maxBot).first() || {};

  const totalViews = Number(totalsRow.total_views || 0);
  const uniqueVisitors = Number(totalsRow.unique_visitors || 0);
  const returningVisitors = Number(totalsRow.returning_visitors || 0);
  const uniquePageViews = Number(totalsRow.unique_page_views || 0);
  const returnRatePct = uniqueVisitors > 0 ? Math.round((returningVisitors / uniqueVisitors) * 1000) / 10 : 0;

  // 2. Page rank (most viewed pages descending)
  const pageRankRows = (await db.prepare(
    `SELECT
       path,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors,
       COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors
     FROM page_views
     WHERE is_bot <= ?2
       AND (?1 IS NULL OR date >= ?1)
     GROUP BY path
     ORDER BY views DESC, unique_visitors DESC
     LIMIT 50`
  ).bind(sinceDate, maxBot).all()).results || [];

  // 3. Daily trends over time
  const dailyRows = (await db.prepare(
    `SELECT
       date,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors,
       COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY date
     ORDER BY date ASC`
  ).bind(sinceDate, normPath, maxBot).all()).results || [];

  // 4. Return users per page
  const returnUsersRows = (await db.prepare(
    `SELECT
       path,
       COUNT(*) AS returning_views,
       COUNT(DISTINCT visitor_id) AS returning_unique_visitors
     FROM page_views
     WHERE is_bot <= ?2
       AND is_returning = 1
       AND (?1 IS NULL OR date >= ?1)
     GROUP BY path
     ORDER BY returning_views DESC, returning_unique_visitors DESC
     LIMIT 50`
  ).bind(sinceDate, maxBot).all()).results || [];

  // 5. Top referrers
  const referrerRows = (await db.prepare(
    `SELECT
       referrer_source,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND referrer_source != 'internal'
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY referrer_source
     ORDER BY views DESC
     LIMIT 15`
  ).bind(sinceDate, normPath, maxBot).all()).results || [];

  // 6. Device breakdown
  const deviceRows = (await db.prepare(
    `SELECT
       device,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY device
     ORDER BY views DESC`
  ).bind(sinceDate, normPath, maxBot).all()).results || [];

  // 7. Top countries
  const countryRows = (await db.prepare(
    `SELECT
       country,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND country != ''
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY country
     ORDER BY views DESC
     LIMIT 10`
  ).bind(sinceDate, normPath, maxBot).all()).results || [];

  return {
    query: {
      days: days === "all" ? "all" : numDays,
      since_date: sinceDate,
      path: normPath,
      include_bots: includeBots
    },
    totals: {
      total_views: totalViews,
      unique_page_views: uniquePageViews,
      unique_visitors: uniqueVisitors,
      returning_visitors: returningVisitors,
      return_rate_pct: returnRatePct
    },
    page_rank: pageRankRows.map((r) => ({
      path: r.path,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors),
      returning_visitors: Number(r.returning_visitors)
    })),
    daily_trends: dailyRows.map((r) => ({
      date: r.date,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors),
      returning_visitors: Number(r.returning_visitors)
    })),
    return_users_per_page: returnUsersRows.map((r) => ({
      path: r.path,
      returning_views: Number(r.returning_views),
      returning_unique_visitors: Number(r.returning_unique_visitors)
    })),
    top_referrers: referrerRows.map((r) => ({
      source: r.referrer_source,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors)
    })),
    devices: deviceRows.map((r) => ({
      device: r.device,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors)
    })),
    top_countries: countryRows.map((r) => ({
      country: r.country,
      views: Number(r.views),
      unique_visitors: Number(r.unique_visitors)
    }))
  };
}
