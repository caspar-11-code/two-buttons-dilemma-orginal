/**
 * Cloudflare Worker — Two Buttons Dilemma stats API (v3, hardened)
 *
 * Security improvements vs v2:
 *  - Restricted CORS (only gamestheory.org)
 *  - Origin/Referer validation on POST
 *  - Strict UUID format validation for voter_id
 *  - Country code validation (must be 2-letter ISO)
 *  - Length cap on countries object
 *  - Rate-limit-friendly response codes
 *
 * Endpoints:
 *   GET  /api/stats           → { red, blue, total, countries }
 *   POST /api/vote            → body: { voter_id, choice }
 *                              returns { success | already_voted, choice, stats }
 *
 * Storage: Cloudflare KV namespace bound as `STATS`
 *   - "global"            → { red, blue, total }
 *   - "countries"         → { US: {red, blue, total}, PL: {...}, ... }
 *   - "voter:{uuid}"      → "red" | "blue"
 */

// Allowed origins. Add staging/dev URLs here if needed.
const ALLOWED_ORIGINS = [
  "https://gamestheory.org",
  "https://www.gamestheory.org",
  "https://twobuttons.gamestheory.org",
  // Add your Cloudflare Pages preview URL here if you use one for testing:
  // "https://two-buttons-dilemma-orginal.pages.dev",
];

// Strict UUID v4 format (RFC 4122)
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 2-letter ISO country code (or XX for unknown)
const COUNTRY_REGEX = /^[A-Z]{2}$/;

// Max number of countries we'll track (195 real + XX). If KV grows beyond this, reject.
const MAX_COUNTRIES = 250;

// ─── Rate limiting (KV-backed, per-IP) ───────────────────────────────────
// Limits per IP per time window. Adjust to taste:
const RATE_LIMITS = {
  vote:  { max: 5,  windowSec: 60 },   // 5 vote attempts per minute per IP
  stats: { max: 60, windowSec: 60 },   // 60 stats reads per minute per IP
};

/**
 * Rate-limit check using KV. Returns { allowed: boolean, retryAfter: number }
 * Note: KV is eventually consistent, so this isn't perfectly precise — but it's
 * good enough to stop scripted abuse. For really aggressive defence, use
 * Cloudflare WAF rules at the dashboard level (independent of this code).
 */
async function checkRateLimit(env, ip, kind) {
  const limit = RATE_LIMITS[kind];
  if (!limit) return { allowed: true, retryAfter: 0 };
  const key = `rl:${kind}:${ip}`;
  try {
    const raw = await env.STATS.get(key);
    const now = Math.floor(Date.now() / 1000);
    let entry = { count: 0, resetAt: now + limit.windowSec };
    if (raw) {
      try { entry = JSON.parse(raw); } catch { /* invalid, reset */ }
    }
    if (entry.resetAt <= now) {
      // Window expired, reset
      entry = { count: 0, resetAt: now + limit.windowSec };
    }
    entry.count = (entry.count || 0) + 1;
    if (entry.count > limit.max) {
      return { allowed: false, retryAfter: Math.max(1, entry.resetAt - now) };
    }
    // Persist with TTL = remaining window time (so KV cleans itself up)
    const ttl = Math.max(60, entry.resetAt - now);
    await env.STATS.put(key, JSON.stringify(entry), { expirationTtl: ttl });
    return { allowed: true, retryAfter: 0 };
  } catch (e) {
    // If KV fails, fail open (allow request) rather than blocking everyone
    return { allowed: true, retryAfter: 0 };
  }
}

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function isOriginAllowed(request) {
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  // Allow if Origin matches whitelist
  if (origin && ALLOWED_ORIGINS.includes(origin)) return true;
  // Fallback: check Referer (some browsers don't send Origin on same-origin requests)
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const refOrigin = refUrl.origin;
      if (ALLOWED_ORIGINS.includes(refOrigin)) return true;
    } catch (e) {
      // Malformed Referer, treat as failed
    }
  }
  return false;
}

function json(data, status = 200, request = null, extraHeaders = {}) {
  const cors = request ? getCorsHeaders(request) : {};
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const url = new URL(request.url);

    // GET /api/stats — read-only, less restrictive (any origin can read public stats)
    if (url.pathname === "/api/stats" && request.method === "GET") {
      // Rate limit per IP
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      const rl = await checkRateLimit(env, ip, "stats");
      if (!rl.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, request, {
          "Retry-After": String(rl.retryAfter),
        });
      }

      try {
        const [stats, countries] = await Promise.all([
          env.STATS.get("global", { type: "json", cacheTtl: 60 }),
          env.STATS.get("countries", { type: "json", cacheTtl: 60 }),
        ]);
        return json(
          {
            red: (stats && stats.red) || 0,
            blue: (stats && stats.blue) || 0,
            total: (stats && stats.total) || 0,
            countries: countries || {},
          },
          200,
          request,
          { "Cache-Control": "no-store" }
        );
      } catch (e) {
        return json({ error: "Stats unavailable" }, 503, request);
      }
    }

    // POST /api/vote — write, strict origin check
    if (url.pathname === "/api/vote" && request.method === "POST") {
      // Reject if origin not in allowlist (browser-only abuse mitigation)
      if (!isOriginAllowed(request)) {
        return json({ error: "Forbidden origin" }, 403, request);
      }

      // Rate limit per IP — strict for writes
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      const rl = await checkRateLimit(env, ip, "vote");
      if (!rl.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, request, {
          "Retry-After": String(rl.retryAfter),
        });
      }

      // Parse JSON safely
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }

      const { voter_id, choice } = body || {};

      // Strict validation
      if (typeof voter_id !== "string" || !UUID_V4_REGEX.test(voter_id)) {
        return json({ error: "Invalid voter ID" }, 400, request);
      }
      if (!["red", "blue"].includes(choice)) {
        return json({ error: "Invalid choice" }, 400, request);
      }

      const voterKey = `voter:${voter_id}`;

      // Already voted?
      try {
        const existing = await env.STATS.get(voterKey, { cacheTtl: 60 });
        if (existing) {
          const [stats, countries] = await Promise.all([
            env.STATS.get("global", { type: "json", cacheTtl: 60 }),
            env.STATS.get("countries", { type: "json", cacheTtl: 60 }),
          ]);
          return json(
            {
              already_voted: true,
              choice: existing,
              stats: {
                red: (stats && stats.red) || 0,
                blue: (stats && stats.blue) || 0,
                total: (stats && stats.total) || 0,
                countries: countries || {},
              },
            },
            200,
            request
          );
        }
      } catch (e) {
        return json({ error: "Storage unavailable" }, 503, request);
      }

      // Country detection — Cloudflare-trusted, can't be spoofed by client
      let country = (request.headers.get("cf-ipcountry") || "XX").toUpperCase();
      if (!COUNTRY_REGEX.test(country)) country = "XX";

      try {
        // Save voter record FIRST (idempotent claim of this voter_id)
        await env.STATS.put(voterKey, choice);

        // Update global aggregate (NOTE: not atomic — see worker.js comments)
        const stats = (await env.STATS.get("global", { type: "json", cacheTtl: 60 })) || {
          red: 0, blue: 0, total: 0,
        };
        stats[choice] = (stats[choice] || 0) + 1;
        stats.total = (stats.total || 0) + 1;
        await env.STATS.put("global", JSON.stringify(stats));

        // Update per-country aggregate
        const countries = (await env.STATS.get("countries", { type: "json", cacheTtl: 60 })) || {};
        // Cap on number of distinct countries
        if (!countries[country] && Object.keys(countries).length >= MAX_COUNTRIES) {
          // Shouldn't happen with real ISO codes, but defensive
          country = "XX";
        }
        if (!countries[country]) countries[country] = { red: 0, blue: 0, total: 0 };
        countries[country][choice] = (countries[country][choice] || 0) + 1;
        countries[country].total = (countries[country].total || 0) + 1;
        await env.STATS.put("countries", JSON.stringify(countries));

        return json(
          {
            success: true,
            choice,
            stats: { ...stats, countries },
          },
          200,
          request
        );
      } catch (e) {
        return json({ error: "Storage unavailable" }, 503, request);
      }
    }

    // ─── Scenario endpoints ────────────────────────────────────────────
    // GET  /api/scenario/:id/stats   → { cooperate, defect, total }
    // POST /api/scenario/:id/vote    → body: { voter_id, choice: 'cooperate'|'defect' }
    //                                  returns { success | already_voted, choice, stats }
    //
    // Storage:
    //   "scenario:{id}"            → { cooperate, defect, total }
    //   "scenario_voter:{id}:{uuid}" → "cooperate" | "defect"

    // Allow only known scenario IDs (mirrored from frontend SCENARIOS list)
    const ALLOWED_SCENARIO_IDS = ["strike", "shelter", "boycott", "whistleblower", "evacuation", "fishery", "donor", "blacklist", "climate", "uprising"];
    const SCENARIO_ID_REGEX = /^[a-z][a-z0-9_-]{0,31}$/;

    const scenarioStatsMatch = url.pathname.match(/^\/api\/scenario\/([^/]+)\/stats$/);
    if (scenarioStatsMatch && request.method === "GET") {
      const scenarioId = scenarioStatsMatch[1];
      if (!SCENARIO_ID_REGEX.test(scenarioId) || !ALLOWED_SCENARIO_IDS.includes(scenarioId)) {
        return json({ error: "Unknown scenario" }, 400, request);
      }
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      const rl = await checkRateLimit(env, ip, "stats");
      if (!rl.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, request, {
          "Retry-After": String(rl.retryAfter),
        });
      }
      try {
        const data = await env.STATS.get(`scenario:${scenarioId}`, { type: "json", cacheTtl: 60 });
        return json(
          {
            cooperate: (data && data.cooperate) || 0,
            defect: (data && data.defect) || 0,
            total: (data && data.total) || 0,
          },
          200,
          request,
          { "Cache-Control": "no-store" }
        );
      } catch (e) {
        return json({ error: "Stats unavailable" }, 503, request);
      }
    }

    const scenarioVoteMatch = url.pathname.match(/^\/api\/scenario\/([^/]+)\/vote$/);
    if (scenarioVoteMatch && request.method === "POST") {
      const scenarioId = scenarioVoteMatch[1];
      if (!SCENARIO_ID_REGEX.test(scenarioId) || !ALLOWED_SCENARIO_IDS.includes(scenarioId)) {
        return json({ error: "Unknown scenario" }, 400, request);
      }
      if (!isOriginAllowed(request)) {
        return json({ error: "Forbidden origin" }, 403, request);
      }
      const ip = request.headers.get("cf-connecting-ip") || "unknown";
      const rl = await checkRateLimit(env, ip, "vote");
      if (!rl.allowed) {
        return json({ error: "Rate limit exceeded" }, 429, request, {
          "Retry-After": String(rl.retryAfter),
        });
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400, request);
      }
      const { voter_id, choice } = body || {};
      if (typeof voter_id !== "string" || !UUID_V4_REGEX.test(voter_id)) {
        return json({ error: "Invalid voter ID" }, 400, request);
      }
      if (!["cooperate", "defect"].includes(choice)) {
        return json({ error: "Invalid choice" }, 400, request);
      }

      const voterKey = `scenario_voter:${scenarioId}:${voter_id}`;

      try {
        const existing = await env.STATS.get(voterKey, { cacheTtl: 60 });
        if (existing) {
          const data = (await env.STATS.get(`scenario:${scenarioId}`, { type: "json", cacheTtl: 60 })) || {
            cooperate: 0, defect: 0, total: 0,
          };
          return json(
            {
              already_voted: true,
              choice: existing,
              stats: data,
            },
            200,
            request
          );
        }
      } catch (e) {
        return json({ error: "Storage unavailable" }, 503, request);
      }

      try {
        await env.STATS.put(voterKey, choice);
        const data = (await env.STATS.get(`scenario:${scenarioId}`, { type: "json", cacheTtl: 60 })) || {
          cooperate: 0, defect: 0, total: 0,
        };
        data[choice] = (data[choice] || 0) + 1;
        data.total = (data.total || 0) + 1;
        await env.STATS.put(`scenario:${scenarioId}`, JSON.stringify(data));

        return json(
          {
            success: true,
            choice,
            stats: data,
          },
          200,
          request
        );
      } catch (e) {
        return json({ error: "Storage unavailable" }, 503, request);
      }
    }

    return json({ error: "Not found" }, 404, request);
  },
};
