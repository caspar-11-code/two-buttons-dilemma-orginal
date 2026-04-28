/**
 * Cloudflare Worker — Two Buttons Dilemma stats API (v2 with geo)
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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extraHeaders },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/stats" && request.method === "GET") {
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
        { "Cache-Control": "no-store" }
      );
    }

    if (url.pathname === "/api/vote" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      const { voter_id, choice } = body || {};

      if (
        typeof voter_id !== "string" ||
        voter_id.length < 8 ||
        voter_id.length > 64 ||
        !["red", "blue"].includes(choice)
      ) {
        return json({ error: "Invalid request" }, 400);
      }

      const voterKey = `voter:${voter_id}`;
      const existing = await env.STATS.get(voterKey, { cacheTtl: 60 });
      if (existing) {
        const [stats, countries] = await Promise.all([
          env.STATS.get("global", { type: "json", cacheTtl: 60 }),
          env.STATS.get("countries", { type: "json", cacheTtl: 60 }),
        ]);
        return json({
          already_voted: true,
          choice: existing,
          stats: {
            red: (stats && stats.red) || 0,
            blue: (stats && stats.blue) || 0,
            total: (stats && stats.total) || 0,
            countries: countries || {},
          },
        });
      }

      const country = (request.headers.get("cf-ipcountry") || "XX").toUpperCase();

      await env.STATS.put(voterKey, choice);

      const stats = (await env.STATS.get("global", { type: "json", cacheTtl: 60 })) || {
        red: 0, blue: 0, total: 0,
      };
      stats[choice] = (stats[choice] || 0) + 1;
      stats.total = (stats.total || 0) + 1;
      await env.STATS.put("global", JSON.stringify(stats));

      const countries = (await env.STATS.get("countries", { type: "json", cacheTtl: 60 })) || {};
      if (!countries[country]) countries[country] = { red: 0, blue: 0, total: 0 };
      countries[country][choice] = (countries[country][choice] || 0) + 1;
      countries[country].total = (countries[country].total || 0) + 1;
      await env.STATS.put("countries", JSON.stringify(countries));

      return json({
        success: true,
        choice,
        stats: { ...stats, countries },
      });
    }

    return json({ error: "Not found" }, 404);
  },
};
