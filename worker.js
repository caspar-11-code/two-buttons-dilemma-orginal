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
  // Add your Cloudflare Pages preview URL here if you use one for testing:
  // "https://two-buttons-dilemma-orginal.pages.dev",
];

// Strict UUID v4 format (RFC 4122)
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 2-letter ISO country code (or XX for unknown)
const COUNTRY_REGEX = /^[A-Z]{2}$/;

// Max number of countries we'll track (195 real + XX). If KV grows beyond this, reject.
const MAX_COUNTRIES = 250;

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

    return json({ error: "Not found" }, 404, request);
  },
};
