# Two Buttons · Dwa Przyciski · Deux Boutons

**An interactive moral dilemma · A test of who you become when no one is watching.**

🌐 Live: [gamestheory.org](https://gamestheory.org)
🌍 EN · PL · FR (auto-detect, manual override, `?lang=` URL param)

---

## What is this?

You have two buttons. Red and blue. So does every other person on Earth.

- If **more than 50%** of humanity picks blue → everyone lives.
- If **50% or fewer** pick blue → everyone who picked blue dies. Reds survive.
- If **everyone** picks red → everyone lives.

Red is the safe choice. Blue is an act of trust.

The game records your **first click** as a real vote in a global counter. After that, every play runs only as a simulation that reveals one new question challenging your choice. Sixteen questions, eight personality archetypes, a world map of cooperation, six in-depth essays, and ten real-world scenarios — all tools to make you sit with the uncomfortable gap between **what you'd say you'd choose** and **what you actually do when no one is watching**.

This is not a game. This is the structure of climate cooperation, vaccinations, taxes, and every collective action problem in human history.

---

## Features

### 🎮 Core gameplay
- **Two-button moral dilemma** with persistent global vote counter
- **One vote per device** (anonymous random UUID v4 in localStorage)
- **16 unlockable questions** that challenge your choice — eight challenge red, eight challenge blue, revealed one per play
- **Real-time global statistics** — total votes, red %, blue %
- **Progress bar** showing distance to humanity passing the test, with dramatic visual feedback when blue exceeds 50%

### 🌍 Geography
- **Live world map** colored by per-country cooperation rates (uses Cloudflare's `cf-ipcountry` header)
- **Top 5 most cooperative / most self-interested** country rankings
- Tooltips showing votes and blue % per country

### 👤 Personality typing
- **8 moral archetypes** unlocked after 5 rounds (Calculator, Pragmatist, Hesitant, Believer, Martyr, Performer, Observer)
- Each archetype includes name, tagline, provocative quote, 3-paragraph description
- **Shareable image generation** — 1200×630 PNG with personality data, perfect for social media
- "Copy result" for direct text sharing
- Polish version uses correct **instrumental case** ("Jestem Kalkulatorem")
- French version uses correct masculine articles ("Je suis le Calculateur")

### 📚 Six essays · "Deeper"
Long-form content unlocked after completing all 16 questions and casting a vote (or via "skip the game" option after voting). Each ~3 min read with sources:

1. **Kant vs Mill** — deontological vs utilitarian ethics
2. **Schelling and the focal point** — game theory · why red feels "obvious"
3. **Climate, vaccines, taxes** — your choice returns, every day
4. **Why Switzerland works** — institutions over strong leaders
5. **The Warsaw Uprising and calculation** — when blue is the only choice
6. **When "the collective" kills** — Mao, Pol Pot, Stalin · the dark side of forced blue

Each essay deliberately uncomfortable for a different ideological side.

### 🎯 Ten real-world scenarios · "Choice Summary"
Concrete coordination dilemmas with the same threshold structure as the core game, but in situations players can recognize. Each tracks how the world votes per scenario, with four context-dependent interpretations of your result (cooperate/defect × threshold met/missed):

1. **The strike** — workplace · 60% threshold
2. **The evacuation** — hurricane warning · 40% (early movers)
3. **The shelter** — nuclear shelter · 30% (inverted: 30% must leave so the rest survive)
4. **The boycott** — labor abuses · 25%
5. **The whistleblower** — corporate fraud · 58%
6. **The bone marrow registry** — public health · 30%
7. **The shared fishery** — commons collapse · 70%
8. **The blacklist** — sexual harassment claim · 50%
9. **The climate strike** — emissions reduction · 50%
10. **The uprising** — occupied city · 50%

After answering scenarios, the **Choice Summary** view shows:
- Your cooperation pattern (X of Y answered)
- Visual signature of all ten scenarios (colored dots — blue cooperate, red defect, dashed pending)
- Statistical comparison: "you cooperated more than X% of players"
- **Top 3 ranking** where you stood out for cooperation (chose cooperate while most defected)
- **Top 3 ranking** where you stood out for self-interest (chose defect while most cooperated)
- Available progressively from the first answer, not just at the end

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

### 🌐 Internationalisation
- Full **English**, **Polish**, and **French** translations (each ~190 keys)
- Browser language auto-detection with manual override
- URL parameter support (`?lang=pl`, `?lang=fr`, `?lang=en`)
- Localised share text, image generation, SEO meta tags
- Sub-screens (questions, essays, scenarios, signature) re-render on language switch

### 🛡️ Privacy & security
- **No analytics, no third-party trackers, no advertising**
- Anonymous random UUID v4 in localStorage (one vote per device)
- Cloudflare-detected country code only (no IP storage, no precise location)
- Cookie banner on first visit, full privacy policy modal in footer
- GDPR/RODO compliant
- **Hardened Cloudflare Worker:**
  - Restricted CORS (only gamestheory.org)
  - Origin/Referer validation on POST
  - Strict UUID v4 regex validation
  - KV-backed rate limiting (5 vote/min/IP, 60 stats/min/IP)
  - Country code validation (ISO 3166-1 alpha-2)
- **Hardened response headers** (`_headers` file):
  - Content Security Policy with strict directives
  - HSTS preload (2 years)
  - X-Frame-Options DENY
  - Cross-Origin-Opener-Policy / Resource-Policy
  - Permissions-Policy locking down geolocation, camera, microphone, payment, USB
- **`.well-known/security.txt`** (RFC 9116) for vulnerability disclosure

### ❓ Help system
- `?` button in top bar opens guide explaining all features
- Sections covering rules, voting, unlocks, map, profile, sound, languages, privacy, tips
- Localised in EN, PL, and FR

---

## Architecture

### Frontend
**Single-file static HTML** — no build step, no framework, no dependencies.
- Vanilla JavaScript (~7000 lines)
- CSS with design tokens, dark theme
- SVG world map (simplified continental outlines + dot positions)
- Canvas API for shareable images and animated histogram
- Web Audio API for procedural sound

Hosted on **Cloudflare Pages** with auto-deploy from GitHub.

### Backend
**Cloudflare Worker** + KV namespace (`STATS`):

```
GET  /api/stats                     → { red, blue, total, countries }
POST /api/vote                      → { voter_id, choice }
GET  /api/scenario/:id/stats        → { cooperate, defect, total }
POST /api/scenario/:id/vote         → { voter_id, choice }
```

KV keys:
- `global` → `{ red, blue, total }`
- `countries` → `{ "US": {red,blue,total}, "PL": {...}, ... }`
- `voter:{uuid}` → `"red"` | `"blue"`
- `scenario:{id}` → `{ cooperate, defect, total }`
- `scenario_voter:{id}:{uuid}` → `"cooperate"` | `"defect"`
- `rl:vote:{ip}` / `rl:stats:{ip}` → rate-limit counters

KV `cacheTtl: 60`. Country detection via `cf-ipcountry` header (Cloudflare-trusted, can't be spoofed by client).

### License
**[PolyForm Noncommercial 1.0.0](LICENSE)** — free for any non-commercial use including academic, educational, and personal projects. Commercial use requires permission.

---

## Setup (for developers)

See **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)** for the full Cloudflare Worker + KV deployment guide.

Short version:
1. Fork the repo
2. Connect to Cloudflare Pages (auto-deploys `index.html`, `_headers`, `.well-known/`)
3. Create a Cloudflare Worker, paste `worker.js`, bind a KV namespace as `STATS`
4. Update `API_BASE` in `index.html` and `ALLOWED_ORIGINS` in `worker.js` to your domain
5. Optionally seed initial stats in KV (`global` key with `{"red":N,"blue":M,"total":N+M}`)

---

## Sources & inspiration

- **Sally (1995)** — meta-analysis of cooperation rates in prisoner's dilemma experiments (~47% baseline)
- **Darley & Latané (1968)** — bystander effect research
- **Oliner & Oliner (1988)** — *The Altruistic Personality* (Holocaust rescuers)
- **Fehr & Gächter (2000)** — punishment in cooperation games
- **Schelling (1960)** — *The Strategy of Conflict* · focal points
- **Kant (1785)** — *Groundwork of the Metaphysics of Morals*
- **Mill (1863)** — *Utilitarianism*
- **Hardin (1968)** — *The Tragedy of the Commons*
- **Acemoglu & Robinson (2012)** — *Why Nations Fail*
- **Dikötter** — *Mao's Great Famine*
- **Hayek (1944)** — *The Road to Serfdom*

---

## Roadmap

- [x] Three languages (EN, PL, FR)
- [x] Ten real-world scenarios with global statistics
- [x] Choice Summary with statistical comparison and top 3 rankings
- [x] Hardened security (CSP, HSTS preload, security.txt, rate limiting)
- [ ] More languages (DE, ES, IT)
- [ ] "Last chance" mechanic — allow re-vote once after all questions discovered
- [ ] More essays (extended library)
- [ ] Compare-with-friends mode (shareable comparison URLs)
- [ ] Class/group rooms for educational use
- [ ] More scenarios (potential: vaccine, jury, conscription)

---

## Contact

Personal project. Issues, suggestions, and translations welcome via GitHub issues.

Privacy questions or vote removal requests: open an issue.

---

*If everyone you know is going to die anyway, what matters is the kind of person you choose to be on the way there.*

---
---

# 🇵🇱 Wersja polska

## Dwa Przyciski

**Interaktywny dylemat moralny · Test tego, kim się stajesz, kiedy nikt nie patrzy.**

🌐 Strona: [gamestheory.org](https://gamestheory.org)
🌍 PL · EN · FR (auto-wykrywanie języka, zmiana ręczna, parametr `?lang=` w URL)

---

## O co chodzi?

Masz dwa przyciski. Czerwony i niebieski. Tak samo każda inna osoba na Ziemi.

- Jeśli **ponad 50%** ludzkości wybierze niebieski → wszyscy żyją.
- Jeśli **50% lub mniej** wybierze niebieski → wszyscy, którzy wybrali niebieski, giną. Czerwoni przeżywają.
- Jeśli **wszyscy** wybiorą czerwony → wszyscy żyją.

Czerwony to bezpieczny wybór. Niebieski to akt zaufania.

Gra zapisuje twój **pierwszy klik** jako prawdziwy głos w globalnym liczniku. Każda kolejna gra to już tylko symulacja, która odsłania jedno nowe pytanie podważające twój wybór. 16 pytań, 8 archetypów osobowości, mapa świata kooperacji, 6 esejów oraz 10 realnych scenariuszy — wszystko po to, żeby cię zmusić do siedzenia w niewygodnej luce między **tym, co byś powiedział, że wybierzesz** a **tym, jak naprawdę działasz, kiedy nikt nie patrzy**.

To nie jest gra. To dokładnie struktura kooperacji klimatycznej, szczepień, podatków i każdego problemu zbiorowego działania w historii ludzkości.

---

## Funkcjonalności

### 🎮 Rdzeń rozgrywki
- **Dylemat dwóch przycisków** z trwałym globalnym licznikiem głosów
- **Jeden głos na urządzenie** (anonimowy losowy UUID v4 w localStorage)
- **16 odblokowywanych pytań** podważających wybór — osiem dla czerwonego, osiem dla niebieskiego
- **Statystyki globalne na żywo** — łączna liczba głosów, % czerwonego, % niebieskiego
- **Pasek postępu** pokazujący "dystans do uratowania ludzkości"

### 🌍 Geografia
- **Mapa świata na żywo** kolorowana wg poziomu kooperacji w każdym kraju
- **Top 5 najbardziej kooperatywnych / najbardziej egoistycznych** krajów
- Tooltipy z liczbą głosów i % niebieskiego

### 👤 Typ moralny
- **8 archetypów** odblokowanych po 5 rundach (Kalkulator, Pragmatyk, Niezdecydowany, Wierzący, Męczennik, Aktor, Obserwator)
- Każdy: nazwa, krótki opis, prowokacyjny cytat, 3-akapitowy opis
- **Generowanie obrazka do udostępnienia** — 1200×630 PNG idealny do social media
- "Skopiuj wynik" do udostępnienia tekstem
- Polska wersja używa poprawnego **narzędnika** ("Jestem Kalkulatorem")

### 📚 Sześć esejów · "Głębiej"
Długie teksty odblokowane po odkryciu wszystkich 16 pytań i oddaniu głosu. Każdy ~3 minuty czytania, ze źródłami:

1. **Kant kontra Mill** — etyka deontologiczna vs utylitarna
2. **Schelling i punkt skupienia** — teoria gier
3. **Klimat, szczepienia, podatki** — twój wybór wraca codziennie
4. **Dlaczego Szwajcaria działa** — instytucje ponad silnymi przywódcami
5. **Powstanie Warszawskie a kalkulacja** — kiedy niebieski to jedyny wybór
6. **Gdy "kolektyw" zabija** — Mao, Pol Pot, Stalin

Każdy esej celowo niewygodny dla innej strony ideologicznej.

### 🎯 Dziesięć scenariuszy · "Podsumowanie wyborów"
Konkretne dylematy koordynacyjne o tej samej strukturze progowej co główna gra, ale w sytuacjach rozpoznawalnych. Każdy z czterema kontekstowymi interpretacjami wyniku:

1. **Strajk** — praca · próg 60%
2. **Ewakuacja** — ostrzeżenie przed huraganem · 40%
3. **Schron** — schron przeciwatomowy · 30% (odwrócony: 30% musi wyjść, by reszta przeżyła)
4. **Bojkot** — łamanie praw pracowniczych · 25%
5. **Sygnalista** — oszustwo korporacyjne · 58%
6. **Rejestr dawców szpiku** — zdrowie publiczne · 30%
7. **Wspólne łowisko** — wyczerpanie zasobu · 70%
8. **Czarna lista** — molestowanie · 50%
9. **Strajk klimatyczny** — redukcja emisji · 50%
10. **Powstanie** — okupowane miasto · 50%

Po odpowiedzi widać **Podsumowanie wyborów**:
- Wzorzec kooperacji (X z Y odpowiedzianych)
- Wizualny "podpis" z 10 kropek (niebieski = kooperacja, czerwony = dezercja, przerywany = bez odpowiedzi)
- Porównanie statystyczne: "kooperowałeś bardziej niż X% graczy"
- **Top 3** sytuacji gdzie wyróżniłeś się kooperacją
- **Top 3** sytuacji gdzie wyróżniłeś się egoizmem
- Dostępne progresywnie od pierwszej odpowiedzi

### 🎵 Dźwięk
Web Audio API (bez plików zewnętrznych). Toggle w pasku górnym, domyślnie WŁĄCZONY.

### 🌧️ Atmosfera
- Animowany histogram głosów (kropki spadają zgodnie z aktualnym ratio)
- Animowany favicon (czerwone/niebieskie naprzemiennie)
- Pytanie progowe co drugą grę

### 🥚 Easter eggi
- **10× czerwony z rzędu** → ukryta refleksja
- **Oba przyciski w <250ms** → Pytanie #17 o odmowę wybierania
- **3:33 lokalnie** → Pytanie #18 o nocną tożsamość

### 🌐 Internacjonalizacja
- Pełne tłumaczenia **PL, EN, FR** (~190 kluczy każdy)
- Auto-detekcja z możliwością zmiany
- `?lang=pl` / `?lang=en` / `?lang=fr` w URL
- Podstrony (pytania, eseje, scenariusze) przerenderowują się na zmianę języka

### 🛡️ Prywatność i bezpieczeństwo
- **Bez analityki, bez trackerów stron trzecich, bez reklam**
- Anonimowy losowy UUID v4 w localStorage
- Tylko kod kraju z Cloudflare (bez IP, bez lokalizacji)
- Banner cookie + pełna polityka prywatności w stopce
- Zgodność z RODO/GDPR
- **Wzmocniony Worker:**
  - Ograniczone CORS (tylko gamestheory.org)
  - Walidacja Origin/Referer na POST
  - Walidacja UUID v4 (regex)
  - Rate limiting przez KV (5 głosów/min/IP, 60 statystyk/min/IP)
  - Walidacja kodu kraju (ISO 3166-1 alpha-2)
- **Wzmocnione nagłówki HTTP:**
  - CSP, HSTS preload (2 lata), X-Frame-Options DENY
  - COOP / Cross-Origin-Resource-Policy
  - Permissions-Policy blokuje geolokację, kamerę, mikrofon, płatności, USB
- **`.well-known/security.txt`** (RFC 9116)

### ❓ System pomocy
Przycisk `?` w pasku górnym otwiera 9-sekcyjny przewodnik. Zlokalizowany w PL/EN/FR.

---

## Architektura

### Frontend
**Pojedynczy plik HTML** — bez build stepu, frameworków, bez zależności.
- Vanilla JavaScript (~7000 linii)
- CSS z design tokenami, ciemny motyw
- SVG mapa świata
- Canvas API dla obrazków i histogramu
- Web Audio API dla dźwięku

Hostowane na **Cloudflare Pages** z auto-deploy z GitHub.

### Backend
**Cloudflare Worker** + KV namespace (`STATS`):

```
GET  /api/stats                     → { red, blue, total, countries }
POST /api/vote                      → { voter_id, choice }
GET  /api/scenario/:id/stats        → { cooperate, defect, total }
POST /api/scenario/:id/vote         → { voter_id, choice }
```

Klucze KV:
- `global` → `{ red, blue, total }`
- `countries` → `{ "US": {...}, "PL": {...}, ... }`
- `voter:{uuid}` → `"red"` | `"blue"`
- `scenario:{id}` → `{ cooperate, defect, total }`
- `scenario_voter:{id}:{uuid}` → `"cooperate"` | `"defect"`
- `rl:vote:{ip}` / `rl:stats:{ip}` → liczniki rate limit

### Licencja
**[PolyForm Noncommercial 1.0.0](LICENSE)** — bezpłatne dla każdego niekomercyjnego użycia.

---

## Setup (dla developerów)

Pełny przewodnik wdrożenia: **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)**.

W skrócie:
1. Sforkuj repo
2. Połącz z Cloudflare Pages (auto-deploy)
3. Stwórz Cloudflare Worker, wklej `worker.js`, podepnij namespace KV jako `STATS`
4. Zaktualizuj `API_BASE` w `index.html` i `ALLOWED_ORIGINS` w `worker.js`
5. Opcjonalnie zasil początkowe statystyki w KV

---

## Źródła i inspiracje

Wszystkie te same publikacje co w sekcji EN powyżej.

---

## Roadmapa

- [x] Trzy języki (EN, PL, FR)
- [x] Dziesięć realnych scenariuszy z globalnymi statystykami
- [x] Podsumowanie wyborów z porównaniem statystycznym i Top 3 rankingami
- [x] Wzmocnione bezpieczeństwo (CSP, HSTS preload, security.txt, rate limiting)
- [ ] Więcej języków (DE, ES, IT)
- [ ] "Ostatnia szansa" — re-vote po odkryciu wszystkich pytań
- [ ] Więcej esejów
- [ ] Compare-with-friends mode
- [ ] Pokoje klasowe/grupowe
- [ ] Więcej scenariuszy

---

## Kontakt

Projekt osobisty. Issue, sugestie i tłumaczenia mile widziane przez issues na GitHub.

---

*Skoro wszyscy, których znasz, i tak umrą, liczy się tylko, jakim człowiekiem zdecydujesz się być po drodze.*

---
---

# 🇫🇷 Version française

## Deux Boutons

**Un dilemme moral interactif · Un test de qui tu deviens quand personne ne regarde.**

🌐 Site : [gamestheory.org](https://gamestheory.org)
🌍 FR · EN · PL (détection automatique, override manuel, paramètre URL `?lang=`)

---

## De quoi s'agit-il ?

Tu as deux boutons. Rouge et bleu. Comme chaque autre personne sur Terre.

- Si **plus de 50%** de l'humanité choisit bleu → tout le monde survit.
- Si **50% ou moins** choisissent bleu → tous ceux qui ont choisi bleu meurent. Les rouges survivent.
- Si **tout le monde** choisit rouge → tout le monde survit.

Rouge est le choix sûr. Bleu est un acte de confiance.

Le jeu enregistre ton **premier clic** comme un vrai vote dans un compteur global. Chaque partie suivante n'est qu'une simulation qui révèle une nouvelle question. 16 questions, 8 archétypes, une carte mondiale de coopération, 6 essais et 10 scénarios réels — tous des outils pour te faire t'asseoir avec l'écart inconfortable entre **ce que tu dirais que tu choisirais** et **ce que tu fais réellement quand personne ne regarde**.

Ce n'est pas un jeu. C'est la structure de la coopération climatique, des vaccinations, des impôts, et de chaque problème d'action collective.

---

## Fonctionnalités

### 🎮 Cœur du jeu
Mécanique standard avec compteur global persistant, un vote par appareil (UUID v4 anonyme), 16 questions débloquables, statistiques globales en direct.

### 🌍 Géographie
Carte mondiale colorée selon les taux de coopération par pays, classements Top 5 des plus coopératifs / les plus égoïstes.

### 👤 Type moral
Huit archétypes débloqués après 5 rounds, image partageable 1200×630 PNG, version française avec articles corrects ("Je suis le Calculateur").

### 📚 Six essais · « Plus en profondeur »
1. **Kant contre Mill**
2. **Schelling et le point focal**
3. **Climat, vaccins, impôts**
4. **Pourquoi la Suisse fonctionne**
5. **L'Insurrection de Varsovie et le calcul**
6. **Quand « le collectif » tue**

### 🎯 Dix scénarios · « Résumé de tes choix »
Dilemmes de coordination concrets avec la même structure de seuil que le jeu principal :

1. **La grève** — travail · seuil 60%
2. **L'évacuation** — alerte ouragan · 40%
3. **L'abri** — abri antinucléaire · 30% (inversé)
4. **Le boycott** — abus du travail · 25%
5. **Le lanceur d'alerte** — fraude corporative · 58%
6. **Le registre de moelle osseuse** — santé publique · 30%
7. **La pêcherie commune** — surexploitation · 70%
8. **La liste noire** — harcèlement · 50%
9. **La grève climatique** — réduction d'émissions · 50%
10. **L'insurrection** — ville occupée · 50%

Le **Résumé de tes choix** montre :
- Schéma de coopération (X sur Y répondus)
- Signature visuelle de 10 points
- Comparaison : « tu as coopéré plus que X% des joueurs »
- **Top 3** où tu t'es démarqué par la coopération
- **Top 3** où tu t'es démarqué par l'égoïsme
- Disponible progressivement depuis la première réponse

### 🎵 Son
Web Audio API. Toggle dans la barre du haut, ACTIVÉ par défaut.

### 🌧️ Détails atmosphériques
Histogramme animé, favicon alternant, question de seuil provocatrice.

### 🥚 Easter eggs
- **10× rouge à la suite**
- **Les deux boutons en <250ms** → Question cachée #17
- **3:33 heure locale** → Question cachée #18

### 🌐 Internationalisation
Trois langues complètes (EN, PL, FR), ~190 clés chacune. Auto-détection, `?lang=`, sub-écrans se re-rendent au changement.

### 🛡️ Confidentialité et sécurité
- **Pas d'analytics, pas de trackers tiers, pas de publicité**
- UUID v4 anonyme en localStorage
- Code pays Cloudflare uniquement (pas d'IP)
- RGPD/GDPR conforme
- **Worker durci** : CORS restreint, validation Origin/Referer/UUID, rate limiting via KV
- **En-têtes HTTP durcis** : CSP, HSTS preload (2 ans), X-Frame-Options DENY, COOP, Permissions-Policy
- **`.well-known/security.txt`** (RFC 9116)

### ❓ Système d'aide
Bouton `?` ouvre un guide en 9 sections. Localisé EN/PL/FR.

---

## Architecture

### Frontend
Fichier HTML statique unique, vanilla JS (~7000 lignes), CSS avec design tokens, SVG, Canvas API, Web Audio API. Hébergé sur Cloudflare Pages.

### Backend
Cloudflare Worker + KV (`STATS`). Endpoints :

```
GET  /api/stats
POST /api/vote
GET  /api/scenario/:id/stats
POST /api/scenario/:id/vote
```

### Licence
**[PolyForm Noncommercial 1.0.0](LICENSE)**.

---

## Setup (pour développeurs)

Voir **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)**.

---

## Sources et inspirations

Mêmes publications que dans la section EN ci-dessus.

---

## Roadmap

- [x] Trois langues (EN, PL, FR)
- [x] Dix scénarios réels avec statistiques globales
- [x] Résumé de tes choix avec comparaison statistique et Top 3
- [x] Sécurité durcie (CSP, HSTS preload, security.txt, rate limiting)
- [ ] Plus de langues (DE, ES, IT)
- [ ] Mécanique « dernière chance »
- [ ] Plus d'essais
- [ ] Mode « comparer avec des amis »
- [ ] Salons de classe/groupe
- [ ] Plus de scénarios

---

## Contact

Projet personnel. Issues, suggestions et traductions bienvenues via GitHub.

---

*Si tous ceux que tu connais vont mourir de toute façon, ce qui compte est le genre de personne que tu choisis d'être en chemin.*
