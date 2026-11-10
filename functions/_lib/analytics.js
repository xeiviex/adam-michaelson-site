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
     is_bot INTEGER NOT NULL DEFAULT 0,
     is_owner INTEGER NOT NULL DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_pv_date ON page_views (date)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views (path)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views (visitor_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_date_path ON page_views (date, path)`,
  `CREATE INDEX IF NOT EXISTS idx_pv_owner ON page_views (is_owner)`,
  `CREATE TABLE IF NOT EXISTS site_visitors (
     visitor_id TEXT PRIMARY KEY,
     first_seen_at TEXT NOT NULL,
     last_seen_at TEXT NOT NULL,
     total_views INTEGER NOT NULL DEFAULT 1,
     is_owner INTEGER NOT NULL DEFAULT 0,
     device_label TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS idx_sv_last_seen ON site_visitors (last_seen_at)`,
  `CREATE INDEX IF NOT EXISTS idx_sv_owner ON site_visitors (is_owner)`
];

let schemaReady = false;

export async function ensureAnalyticsSchema(db) {
  if (!db) return;
  if (!schemaReady) {
    for (const sql of ANALYTICS_STATEMENTS) {
      try {
        await db.prepare(sql).run();
      } catch {}
    }
  }

  try {
    const pvCols = ((await db.prepare("PRAGMA table_info(page_views)").all()).results || []).map((c) => c.name);
    if (pvCols.length > 0 && !pvCols.includes("is_owner")) {
      await db.prepare("ALTER TABLE page_views ADD COLUMN is_owner INTEGER NOT NULL DEFAULT 0").run();
    }
  } catch (err) {
    console.error("pv migration error:", err);
  }

  try {
    const svCols = ((await db.prepare("PRAGMA table_info(site_visitors)").all()).results || []).map((c) => c.name);
    if (svCols.length > 0) {
      if (!svCols.includes("is_owner")) {
        await db.prepare("ALTER TABLE site_visitors ADD COLUMN is_owner INTEGER NOT NULL DEFAULT 0").run();
      }
      if (!svCols.includes("device_label")) {
        await db.prepare("ALTER TABLE site_visitors ADD COLUMN device_label TEXT").run();
      }
    }
  } catch (err) {
    console.error("sv migration error:", err);
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

export function detectDeviceLabel(request, customLabel = null) {
  if (customLabel) {
    if (/iphone/i.test(customLabel)) return "iPhone";
    if (/mac|macbook/i.test(customLabel)) return "MacBook Air";
    return customLabel;
  }
  const ua = request?.headers?.get?.("user-agent") || "";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/macintosh|mac os x/i.test(ua)) return "MacBook Air";
  return detectDevice(request);
}

export function formatLocation(cf) {
  if (!cf) return "";
  const city = cf.city || "";
  const region = cf.regionCode || cf.region || "";
  const country = cf.country || "";

  if (city && region) {
    return country === "US" ? `${city}, ${region}` : `${city}, ${region}, ${country}`;
  }
  if (city && country) {
    return country === "US" ? city : `${city}, ${country}`;
  }
  if (region && country) {
    return `${region}, ${country}`;
  }
  return country || "";
}

export function isOwnerRequest(request, url) {
  if (!request) return false;
  if (url) {
    const me = url.searchParams.get("me");
    const owner = url.searchParams.get("owner");
    if (me === "adam" || owner === "adam" || me === "1" || owner === "1") return true;
  }
  const cookieHeader = request.headers?.get?.("cookie") || "";
  if (/(?:^|;\s*)_am_owner=1/.test(cookieHeader)) return true;
  if (request.headers?.has?.("cf-access-jwt-assertion")) return true;
  return false;
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

export async function recordPageView(db, { request, url, visitorId, isReturning, isOwner = false, customDevice = null }) {
  if (!db) return;
  await ensureAnalyticsSchema(db);

  let owner = isOwner;
  let deviceLabel = detectDeviceLabel(request, customDevice);

  // If not flagged as owner in this request, check if visitor_id was already flagged previously
  if (!owner) {
    try {
      const existing = await db.prepare(
        `SELECT is_owner, device_label FROM site_visitors WHERE visitor_id = ?1`
      ).bind(visitorId).first();
      if (existing?.is_owner) {
        owner = true;
        if (existing.device_label) deviceLabel = existing.device_label;
      }
    } catch {}
  }

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
      `UPDATE site_visitors SET last_seen_at = ?1, total_views = total_views + 1, is_owner = MAX(is_owner, ?2), device_label = COALESCE(device_label, ?3) WHERE visitor_id = ?4`
    ).bind(createdAt, owner ? 1 : 0, owner ? deviceLabel : null, visitorId).run();
  } else {
    await db.prepare(
      `INSERT OR IGNORE INTO site_visitors (visitor_id, first_seen_at, last_seen_at, total_views, is_owner, device_label) VALUES (?1, ?2, ?2, 1, ?3, ?4)`
    ).bind(visitorId, createdAt, owner ? 1 : 0, owner ? deviceLabel : null).run();
  }

  await db.prepare(
    `INSERT INTO page_views (created_at, date, path, visitor_id, is_returning, referrer, referrer_source, country, city, device, is_bot, is_owner)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
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
    bot,
    owner ? 1 : 0
  ).run();
}

export async function getStats(db, { days = 30, path = null, includeBots = false, filter = "visitors_only" } = {}) {
  if (!db) return { error: "No database" };
  await ensureAnalyticsSchema(db);

  let sinceDate = null;
  const numDays = days === "all" ? 0 : Math.max(1, parseInt(days, 10) || 30);
  if (days !== "all") {
    sinceDate = new Date(Date.now() - (numDays - 1) * 86400000).toISOString().slice(0, 10);
  }

  const normPath = path ? normalizePath(path) : null;
  const maxBot = includeBots ? 1 : 0;

  // Owner filter:
  // "visitors_only" (default): is_owner = 0
  // "owner_only": is_owner = 1
  // "all": no owner filter (is_owner >= 0)
  const minOwner = filter === "owner_only" ? 1 : 0;
  const maxOwner = filter === "visitors_only" ? 0 : 1;

  // 1. Overall totals
  const totalsRow = await db.prepare(
    `SELECT
       COUNT(*) AS total_views,
       COUNT(DISTINCT visitor_id) AS unique_visitors,
       COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors,
       COUNT(DISTINCT path || '::' || visitor_id) AS unique_page_views
     FROM page_views
     WHERE is_bot <= ?3
       AND is_owner >= ?4 AND is_owner <= ?5
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)`
  ).bind(sinceDate, normPath, maxBot, minOwner, maxOwner).first() || {};

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
       AND is_owner >= ?3 AND is_owner <= ?4
       AND (?1 IS NULL OR date >= ?1)
     GROUP BY path
     ORDER BY views DESC, unique_visitors DESC
     LIMIT 50`
  ).bind(sinceDate, maxBot, minOwner, maxOwner).all()).results || [];

  // 3. Daily trends over time
  const dailyRows = (await db.prepare(
    `SELECT
       date,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors,
       COUNT(DISTINCT CASE WHEN is_returning = 1 THEN visitor_id END) AS returning_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND is_owner >= ?4 AND is_owner <= ?5
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY date
     ORDER BY date ASC`
  ).bind(sinceDate, normPath, maxBot, minOwner, maxOwner).all()).results || [];

  // 4. Return users per page
  const returnUsersRows = (await db.prepare(
    `SELECT
       path,
       COUNT(*) AS returning_views,
       COUNT(DISTINCT visitor_id) AS returning_unique_visitors
     FROM page_views
     WHERE is_bot <= ?2
       AND is_owner >= ?3 AND is_owner <= ?4
       AND is_returning = 1
       AND (?1 IS NULL OR date >= ?1)
     GROUP BY path
     ORDER BY returning_views DESC, returning_unique_visitors DESC
     LIMIT 50`
  ).bind(sinceDate, maxBot, minOwner, maxOwner).all()).results || [];

  // 5. Top referrers
  const referrerRows = (await db.prepare(
    `SELECT
       referrer_source,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND is_owner >= ?4 AND is_owner <= ?5
       AND referrer_source != 'internal'
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY referrer_source
     ORDER BY views DESC
     LIMIT 15`
  ).bind(sinceDate, normPath, maxBot, minOwner, maxOwner).all()).results || [];

  // 6. Device breakdown
  const deviceRows = (await db.prepare(
    `SELECT
       device,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND is_owner >= ?4 AND is_owner <= ?5
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY device
     ORDER BY views DESC`
  ).bind(sinceDate, normPath, maxBot, minOwner, maxOwner).all()).results || [];

  // 7. Top countries
  const countryRows = (await db.prepare(
    `SELECT
       country,
       COUNT(*) AS views,
       COUNT(DISTINCT visitor_id) AS unique_visitors
     FROM page_views
     WHERE is_bot <= ?3
       AND is_owner >= ?4 AND is_owner <= ?5
       AND country != ''
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)
     GROUP BY country
     ORDER BY views DESC
     LIMIT 10`
  ).bind(sinceDate, normPath, maxBot, minOwner, maxOwner).all()).results || [];

  // 8. Owner activity summary (isolated from public stats)
  const ownerTotals = await db.prepare(
    `SELECT
       COUNT(*) AS total_views,
       COUNT(DISTINCT visitor_id) AS unique_devices
     FROM page_views
     WHERE is_owner = 1
       AND (?1 IS NULL OR date >= ?1)
       AND (?2 IS NULL OR path = ?2)`
  ).bind(sinceDate, normPath).first() || {};

  const ownerDeviceRows = (await db.prepare(
    `SELECT
       COALESCE(sv.device_label, pv.device) AS device,
       COUNT(*) AS views,
       MAX(pv.created_at) AS last_seen
     FROM page_views pv
     LEFT JOIN site_visitors sv ON sv.visitor_id = pv.visitor_id
     WHERE pv.is_owner = 1
       AND (?1 IS NULL OR pv.date >= ?1)
     GROUP BY device
     ORDER BY views DESC`
  ).bind(sinceDate).all()).results || [];

  return {
    query: {
      days: days === "all" ? "all" : numDays,
      since_date: sinceDate,
      path: normPath,
      include_bots: includeBots,
      filter
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
    ,
    owner_activity: {
      total_views: Number(ownerTotals.total_views || 0),
      unique_devices: Number(ownerTotals.unique_devices || 0),
      devices: ownerDeviceRows.map((r) => ({
        device: r.device,
        views: Number(r.views),
        last_seen: r.last_seen
      }))
    }
  };
}
