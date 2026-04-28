# Two Buttons · Dwa Przyciski

**An interactive moral dilemma · A test of who you become when no one is watching.**

🌐 Live: [gamestheory.org](https://gamestheory.org)

---

## What is this?

You have two buttons. Red and blue. So does every other person on Earth.

- If **more than 50%** of humanity picks blue → everyone lives.
- If **50% or fewer** pick blue → everyone who picked blue dies. Reds survive.
- If **everyone** picks red → everyone lives.

Red is the safe choice. Blue is an act of trust.

The game records your **first click** as a real vote in a global counter. After that, every play runs only as a simulation that reveals one new question challenging your choice. The 16 questions, the personality archetypes, the world map of cooperation, and the six in-depth essays are tools to make you sit with the uncomfortable gap between **what you'd say you'd choose** and **what you actually do when no one is watching**.

This is not a game. This is the structure of climate cooperation, vaccinations, taxes, and every collective action problem in human history.

---

## Features

### 🎮 Core gameplay
- **Two-button moral dilemma** with persistent global vote counter
- **One vote per device** (anonymous random ID in localStorage)
- **16 unlockable questions** that challenge your choice — eight challenge red, eight challenge blue, revealed one per play
- **Real-time global statistics** — total votes, red %, blue %
- **Progress bar** showing "distance to humanity passing the test" with dramatic visual feedback when blue exceeds 50%

### 🌍 Geography
- **Live world map** colored by per-country cooperation rates (uses Cloudflare's `cf-ipcountry` header)
- **Top 5 most cooperative / most self-interested** country rankings
- **Tooltips** showing votes and blue % per country

### 👤 Personality typing
- **8 moral archetypes** unlocked after 5 rounds (Calculator, Pragmatist, Hesitant, Believer, Martyr, Performer, Observer)
- Each archetype includes: name, tagline, provocative quote, 3-paragraph description
- **Shareable image generation** — 1200×630 PNG with personality data, perfect for social media (Open Graph)
- **"Copy result"** for direct text sharing
- Polish version uses correct **instrumental case** (e.g. "Jestem Kalkulatorem")

### 📚 Six essays · "Deeper"
Long-form content unlocked after completing all 16 questions and casting a vote (or via "skip the game" option after voting). Each ~3 min read with sources:

1. **Kant vs Mill** — deontological vs utilitarian ethics
2. **Schelling and the focal point** — game theory · why red feels "obvious"
3. **Climate, vaccines, taxes** — your choice returns, every day
4. **Why Switzerland works** — institutions over strong leaders
5. **The Warsaw Uprising and calculation** — when blue is the only choice
6. **When "the collective" kills** — Mao, Pol Pot, Stalin · the dark side of forced blue

Each essay deliberately uncomfortable for a different ideological side.

### 🎵 Sound design
Web Audio API (no external files):
- Distinct click tones for red (low) vs blue (high)
- Death sound when blue loses (descending drone)
- Triumph chord when blue wins (ascending C-E-G)
- Heavy tone when red wins
- Toggle in top bar, persisted in localStorage, ON by default

### 🌧️ Atmospheric details
- **Animated histogram** of voter activity — dots fall continuously, biased toward current global blue/red ratio
- **Animated favicon** alternating red/blue every second
- **Provocative threshold question** appearing every other game ("What % would you need before pressing blue?")

### 🥚 Easter eggs
Three hidden discoveries, one-time only:
- **10× red streak** → "Why are you still playing if you already know the answer?"
- **Both buttons in <250ms** → Hidden question #17 about refusing to choose
- **3:33 AM local time** → Hidden question #18 about who you become when even your performance has gone quiet

### 🌐 Internationalization
- Full **English** and **Polish** translations
- Browser language auto-detection with manual override
- URL parameter support (`?lang=pl` or `?lang=en`)
- Localized share text, image generation, and SEO meta tags

### 🛡️ Privacy
- **No analytics, no third-party trackers, no advertising**
- Anonymous random ID in localStorage (one vote per device)
- Cloudflare-detected country code only (no IP storage, no precise location)
- Cookie banner on first visit, full privacy policy modal in footer
- GDPR/RODO compliant

### ❓ Help system
- `?` button in top bar opens guide explaining all features
- 9 sections covering rules, voting, unlocks, map, profile, sound, languages, privacy, tips
- Localized in PL and EN

---

## Architecture

### Frontend
**Single-file static HTML** — no build step, no framework, no dependencies.
- Vanilla JavaScript (~5000 lines)
- CSS with design tokens, dark theme
- SVG world map (simplified continental outlines + dot positions)
- Canvas API for shareable images and animated histogram
- Web Audio API for procedural sound

Hosted on **Cloudflare Pages** with auto-deploy from GitHub.

### Backend
**Cloudflare Worker** + **KV namespace** (`STATS`):

```
GET  /api/stats      → { red, blue, total, countries: { PL: {...}, US: {...} } }
POST /api/vote       → body: { voter_id, choice }
                       returns { success | already_voted, choice, stats }
```

KV keys:
- `global` → `{ red, blue, total }`
- `countries` → `{ "US": {red,blue,total}, "PL": {...}, ... }`
- `voter:{uuid}` → `"red"` | `"blue"` (one-vote enforcement)

KV cacheTtl: 60s. Country detection via `cf-ipcountry` header.

### License
**[PolyForm Noncommercial 1.0.0](LICENSE)** — free for any non-commercial use including academic, educational, personal projects. Commercial use requires permission.

---

## Setup (for developers)

See **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)** for the full Cloudflare Worker + KV deployment guide.

Short version:
1. Fork the repo
2. Connect to Cloudflare Pages (auto-deploys `index.html`)
3. Create a Cloudflare Worker, paste `worker.js`, bind a KV namespace as `STATS`
4. Update `API_BASE` constant in `index.html` to your Worker URL
5. Optionally seed initial stats in KV (`global` key with `{"red":N,"blue":M,"total":N+M}`)

---

## Sources & inspiration

The game's questions and essays draw on:

- **Sally (1995)** — meta-analysis of cooperation rates in prisoner's dilemma experiments (~37% baseline)
- **Darley & Latané (1968)** — bystander effect research
- **Oliner & Oliner (1988)** — *The Altruistic Personality* (Holocaust rescuers)
- **Fehr & Gächter (2000)** — punishment in cooperation games
- **Schelling (1960)** — *The Strategy of Conflict* · focal points
- **Kant (1785)** — *Groundwork of the Metaphysics of Morals*
- **Mill (1863)** — *Utilitarianism*
- **Acemoglu & Robinson (2012)** — *Why Nations Fail*
- **Dikötter** — *Mao's Great Famine*
- **Hayek (1944)** — *The Road to Serfdom*

The dilemma format itself echoes thought experiments in social choice theory and global coordination problems.

---

## Roadmap

- [ ] More languages (DE, ES, FR, IT)
- [ ] "Last chance" mechanic — allow re-vote once after all questions discovered
- [ ] More essays (extended library)
- [ ] Compare with friends mode (shareable comparison URLs)
- [ ] Class/group rooms for educational use

---

## Contact

This is a personal project. Issues, suggestions, and translations welcome via GitHub issues.

For privacy questions or vote removal requests: open an issue.

---

*If everyone you know is going to die anyway, what matters is the kind of person you choose to be on the way there.*
