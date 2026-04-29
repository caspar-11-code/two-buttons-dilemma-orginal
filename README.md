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

---
---

# 🇵🇱 Wersja polska

## Dwa Przyciski

**Interaktywny dylemat moralny · Test tego, kim się stajesz, kiedy nikt nie patrzy.**

🌐 Strona: [gamestheory.org](https://gamestheory.org)

---

## O co chodzi?

Masz dwa przyciski. Czerwony i niebieski. Tak samo każda inna osoba na Ziemi.

- Jeśli **ponad 50%** ludzkości wybierze niebieski → wszyscy żyją.
- Jeśli **50% lub mniej** wybierze niebieski → wszyscy, którzy wybrali niebieski, giną. Czerwoni przeżywają.
- Jeśli **wszyscy** wybiorą czerwony → wszyscy żyją.

Czerwony to bezpieczny wybór. Niebieski to akt zaufania.

Gra zapisuje twój **pierwszy klik** jako prawdziwy głos w globalnym liczniku. Każda kolejna gra to już tylko symulacja, która odsłania jedno nowe pytanie podważające twój wybór. 16 pytań, 8 archetypów osobowości, mapa świata kooperacji oraz 6 esejów to narzędzia, które mają cię zmusić do siedzenia w niewygodnej luce między **tym, co byś powiedział, że wybierzesz** a **tym, jak naprawdę działasz, kiedy nikt nie patrzy**.

To nie jest gra. To dokładnie struktura kooperacji klimatycznej, szczepień, podatków i każdego problemu zbiorowego działania w historii ludzkości.

---

## Funkcjonalności

### 🎮 Rdzeń rozgrywki
- **Dylemat dwóch przycisków** z trwałym globalnym licznikiem głosów
- **Jeden głos na urządzenie** (anonimowy losowy ID w localStorage)
- **16 odblokowywanych pytań** podważających wybór — osiem dla czerwonego, osiem dla niebieskiego, odsłaniane po jednym na grę
- **Statystyki globalne na żywo** — łączna liczba głosów, % czerwonego, % niebieskiego
- **Pasek postępu** pokazujący "dystans do uratowania ludzkości" z dramatyczną wizualną reakcją gdy niebieski przekracza 50%

### 🌍 Geografia
- **Mapa świata na żywo** kolorowana wg poziomu kooperacji w każdym kraju (używa nagłówka `cf-ipcountry` z Cloudflare)
- **Top 5 najbardziej kooperatywnych / najbardziej egoistycznych** krajów
- **Tooltipy** pokazujące liczbę głosów i % niebieskiego per kraj

### 👤 Typ moralny
- **8 archetypów moralnych** odblokowanych po 5 rundach (Kalkulator, Pragmatyk, Niezdecydowany, Wierzący, Męczennik, Aktor, Obserwator)
- Każdy archetyp zawiera: nazwę, krótki opis, prowokacyjny cytat, 3-akapitowy opis
- **Generowanie obrazka do udostępnienia** — 1200×630 PNG ze statystykami i typem, idealny do social media (Open Graph)
- **"Skopiuj wynik"** do bezpośredniego udostępnienia tekstem
- Polska wersja używa poprawnego **narzędnika** ("Jestem Kalkulatorem", "Jestem Męczennikiem")

### 📚 Sześć esejów · "Głębiej"
Długie teksty odblokowane po odkryciu wszystkich 16 pytań i oddaniu głosu (lub przez "pomiń zabawę" po głosie). Każdy ~3 minuty czytania, ze źródłami:

1. **Kant kontra Mill** — etyka deontologiczna vs utylitarna
2. **Schelling i punkt skupienia** — teoria gier · dlaczego czerwony jest "oczywisty"
3. **Klimat, szczepienia, podatki** — twój wybór wraca, codziennie
4. **Dlaczego Szwajcaria działa** — instytucje ponad silnymi przywódcami
5. **Powstanie Warszawskie a kalkulacja** — kiedy niebieski to jedyny wybór
6. **Gdy "kolektyw" zabija** — Mao, Pol Pot, Stalin · ciemna strona przymuszonego niebieskiego

Każdy esej celowo niewygodny dla innej strony ideologicznej.

### 🎵 Dźwięk
Web Audio API (bez plików zewnętrznych):
- Różne tony kliknięć dla czerwonego (niski) i niebieskiego (wysoki)
- Dźwięk śmierci kiedy niebieski przegrywa (opadający dron)
- Akord triumfu kiedy niebieski wygrywa (wstępujący C-E-G)
- Ciężki ton kiedy czerwony wygrywa
- Toggle w pasku górnym, zapisany w localStorage, domyślnie WŁĄCZONY

### 🌧️ Atmosfera
- **Animowany histogram** aktywności głosujących — kropki spadają ciągle, biased w kierunku aktualnego globalnego stosunku niebieski/czerwony
- **Animowany favicon** mrugający na zmianę czerwony/niebieski co sekundę
- **Pytanie prowokacyjne** pojawiające się co drugą grę ("Jaki procent musiałby być, żebyś nacisnął niebieski?")

### 🥚 Easter eggi
Trzy ukryte odkrycia, każde jednorazowe:
- **10× czerwony z rzędu** → "Dlaczego jeszcze grasz, skoro już znasz odpowiedź?"
- **Oba przyciski w <250ms** → Ukryte pytanie #17 o odmowę wybierania
- **3:33 lokalnie** → Ukryte pytanie #18 o to, kim się stajesz, kiedy nawet twój występ ucichł

### 🌐 Internacjonalizacja
- Pełne tłumaczenia **angielski** i **polski**
- Auto-detekcja języka przeglądarki z możliwością zmiany
- Obsługa parametru URL (`?lang=pl` lub `?lang=en`)
- Zlokalizowany tekst do udostępnienia, generowanie obrazka, meta tagi SEO

### 🛡️ Prywatność
- **Bez analityki, bez trackerów stron trzecich, bez reklam**
- Anonimowy losowy ID w localStorage (jeden głos na urządzenie)
- Tylko kod kraju wykryty przez Cloudflare (bez przechowywania IP, bez precyzyjnej lokalizacji)
- Banner ciasteczek przy pierwszym wejściu, pełny modal polityki prywatności w stopce
- Zgodność z RODO/GDPR

### ❓ System pomocy
- Przycisk `?` w pasku górnym otwiera przewodnik wyjaśniający wszystkie funkcje
- 9 sekcji: zasady, głosowanie, odblokowywanie, mapa, profil, dźwięk, języki, prywatność, wskazówki
- Zlokalizowany w PL i EN

---

## Architektura

### Frontend
**Pojedynczy plik HTML** — bez build stepu, frameworków, bez zależności.
- Vanilla JavaScript (~5000 linii)
- CSS z design tokenami, ciemny motyw
- SVG mapa świata (uproszczone kontynenty + pozycje kropek)
- Canvas API dla obrazków do udostępnienia i animowanego histogramu
- Web Audio API dla generowanego dźwięku

Hostowane na **Cloudflare Pages** z auto-deploy z GitHub.

### Backend
**Cloudflare Worker** + namespace **KV** (`STATS`):

```
GET  /api/stats      → { red, blue, total, countries: { PL: {...}, US: {...} } }
POST /api/vote       → body: { voter_id, choice }
                       zwraca { success | already_voted, choice, stats }
```

Klucze KV:
- `global` → `{ red, blue, total }`
- `countries` → `{ "US": {red,blue,total}, "PL": {...}, ... }`
- `voter:{uuid}` → `"red"` | `"blue"` (egzekwowanie jednego głosu)

KV cacheTtl: 60s. Wykrywanie kraju przez nagłówek `cf-ipcountry`.

### Licencja
**[PolyForm Noncommercial 1.0.0](LICENSE)** — bezpłatne dla każdego niekomercyjnego użycia, w tym akademickiego, edukacyjnego, projektów osobistych. Użycie komercyjne wymaga zgody.

---

## Setup (dla developerów)

Pełny przewodnik wdrożenia Cloudflare Worker + KV: **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)**.

W skrócie:
1. Sforkuj repo
2. Połącz z Cloudflare Pages (auto-deploy z `index.html`)
3. Stwórz Cloudflare Worker, wklej `worker.js`, podepnij namespace KV jako `STATS`
4. Zaktualizuj stałą `API_BASE` w `index.html` na URL twojego Workera
5. Opcjonalnie zasil początkowe statystyki w KV (klucz `global` z `{"red":N,"blue":M,"total":N+M}`)

---

## Źródła i inspiracje

Pytania i eseje gry czerpią z:

- **Sally (1995)** — meta-analiza poziomów kooperacji w eksperymentach z dylematem więźnia (~37% baseline)
- **Darley & Latané (1968)** — efekt świadków
- **Oliner & Oliner (1988)** — *The Altruistic Personality* (ratujący Żydów w Holocauście)
- **Fehr & Gächter (2000)** — kary w grach kooperacyjnych
- **Schelling (1960)** — *The Strategy of Conflict* · punkty skupienia
- **Kant (1785)** — *Uzasadnienie metafizyki moralności*
- **Mill (1863)** — *Utylitaryzm*
- **Acemoglu & Robinson (2012)** — *Dlaczego narody upadają*
- **Dikötter** — *Wielki głód Mao*
- **Hayek (1944)** — *Droga do zniewolenia*

Sam format dylematu nawiązuje do eksperymentów myślowych z teorii wyboru społecznego i problemów koordynacji globalnej.

---

## Roadmapa

- [ ] Więcej języków (DE, ES, FR, IT)
- [ ] Mechanika "Ostatnia szansa" — możliwość raz zmienić swój głos po odkryciu wszystkich pytań
- [ ] Więcej esejów (rozszerzona biblioteka)
- [ ] Tryb "Porównaj ze znajomymi" (URL-e z porównaniem do udostępnienia)
- [ ] Pokoje klasowe/grupowe do użytku edukacyjnego

---

## Kontakt

To projekt osobisty. Issue, sugestie i tłumaczenia mile widziane przez issues na GitHub.

W kwestii prywatności lub usunięcia głosu: otwórz issue.

---

*Skoro wszyscy, których znasz, i tak umrą, liczy się tylko, jakim człowiekiem zdecydujesz się być po drodze.*

---
---

# 🇫🇷 Version française

## Deux Boutons

**Un dilemme moral interactif · Un test de qui tu deviens quand personne ne regarde.**

🌐 Site : [gamestheory.org](https://gamestheory.org)

---

## De quoi s'agit-il ?

Tu as deux boutons. Rouge et bleu. Comme chaque autre personne sur Terre.

- Si **plus de 50%** de l'humanité choisit bleu → tout le monde survit.
- Si **50% ou moins** choisissent bleu → tous ceux qui ont choisi bleu meurent. Les rouges survivent.
- Si **tout le monde** choisit rouge → tout le monde survit.

Rouge est le choix sûr. Bleu est un acte de confiance.

Le jeu enregistre ton **premier clic** comme un vrai vote dans un compteur global. Après ça, chaque partie n'est qu'une simulation qui révèle une nouvelle question remettant en cause ton choix. Les 16 questions, les archétypes de personnalité, la carte mondiale de coopération et les six essais approfondis sont des outils pour te faire t'asseoir avec l'écart inconfortable entre **ce que tu dirais que tu choisirais** et **ce que tu fais réellement quand personne ne regarde**.

Ce n'est pas un jeu. C'est la structure de la coopération climatique, des vaccinations, des impôts, et de chaque problème d'action collective dans l'histoire humaine.

---

## Fonctionnalités

### 🎮 Cœur du jeu
- **Dilemme à deux boutons** avec compteur global persistant
- **Un vote par appareil** (ID anonyme aléatoire dans localStorage)
- **16 questions débloquables** qui contestent ton choix — huit contestent rouge, huit contestent bleu, révélées une par partie
- **Statistiques globales en direct** — votes totaux, % rouge, % bleu
- **Barre de progression** montrant la « distance pour que l'humanité réussisse le test » avec retour visuel dramatique quand bleu dépasse 50%

### 🌍 Géographie
- **Carte mondiale en direct** colorée selon les taux de coopération par pays (utilise l'en-tête `cf-ipcountry` de Cloudflare)
- **Top 5 pays les plus coopératifs / les plus égoïstes**
- **Tooltips** affichant les votes et le % bleu par pays

### 👤 Type moral
- **8 archétypes moraux** débloqués après 5 rounds (Calculateur, Pragmatique, Indécis, Croyant, Martyr, Acteur, Observateur)
- Chaque archétype contient : nom, accroche, citation provocatrice, description en 3 paragraphes
- **Génération d'image partageable** — 1200×630 PNG avec données de personnalité, parfait pour les réseaux sociaux (Open Graph)
- **« Copier le résultat »** pour partage direct par texte

### 📚 Six essais · « Plus en profondeur »
Textes longs débloqués après avoir découvert les 16 questions et voté (ou via l'option « passer le jeu » après le vote). Chacun ~3 min de lecture, avec sources :

1. **Kant contre Mill** — éthique déontologique vs utilitariste
2. **Schelling et le point focal** — théorie des jeux · pourquoi rouge semble « évident »
3. **Climat, vaccins, impôts** — ton choix revient, chaque jour
4. **Pourquoi la Suisse fonctionne** — institutions plutôt que leaders forts
5. **L'Insurrection de Varsovie et le calcul** — quand bleu est le seul choix
6. **Quand « le collectif » tue** — Mao, Pol Pot, Staline · le côté sombre du bleu imposé

Chaque essai délibérément inconfortable pour un côté idéologique différent.

### 🎵 Sound design
Web Audio API (sans fichiers externes) :
- Tons de clic distincts pour rouge (grave) vs bleu (aigu)
- Son de mort quand bleu perd (drone descendant)
- Accord de triomphe quand bleu gagne (ascendant C-E-G)
- Ton lourd quand rouge gagne
- Toggle dans la barre du haut, persisté dans localStorage, ACTIVÉ par défaut

### 🌧️ Détails atmosphériques
- **Histogramme animé** de l'activité des votants — les points tombent en continu, biais selon le ratio bleu/rouge global
- **Favicon animé** alternant rouge/bleu chaque seconde
- **Question de seuil provocatrice** apparaissant toutes les deux parties (« Quel % faudrait-il avant que tu cliques bleu ? »)

### 🥚 Easter eggs
Trois découvertes cachées, une seule fois chacune :
- **10× rouge à la suite** → « Pourquoi joues-tu encore si tu connais déjà la réponse ? »
- **Les deux boutons en <250ms** → Question cachée #17 sur le refus de choisir
- **3:33 heure locale** → Question cachée #18 sur qui tu deviens quand même ta performance s'est tue

### 🌐 Internationalisation
- Traductions complètes **anglais**, **polonais** et **français**
- Détection automatique de la langue du navigateur avec override manuel
- Support du paramètre URL (`?lang=fr`, `?lang=pl`, `?lang=en`)
- Texte de partage, génération d'image et meta tags SEO localisés

### 🛡️ Confidentialité
- **Pas d'analytics, pas de trackers tiers, pas de publicité**
- ID anonyme aléatoire dans localStorage (un vote par appareil)
- Code pays détecté par Cloudflare uniquement (pas de stockage IP, pas de localisation précise)
- Banner cookie à la première visite, modal de politique de confidentialité complète dans le pied de page
- Conforme RGPD/GDPR

### ❓ Système d'aide
- Bouton `?` dans la barre du haut ouvre un guide expliquant toutes les fonctionnalités
- 9 sections couvrant règles, vote, déblocages, carte, profil, son, langues, confidentialité, astuces
- Localisé en EN, PL et FR

---

## Architecture

### Frontend
**Fichier HTML statique unique** — pas de build step, pas de framework, pas de dépendances.
- JavaScript vanilla (~5500 lignes)
- CSS avec design tokens, thème sombre
- Carte SVG du monde (contours continentaux simplifiés + positions de points)
- Canvas API pour images partageables et histogramme animé
- Web Audio API pour son procédural

Hébergé sur **Cloudflare Pages** avec auto-deploy depuis GitHub.

### Backend
**Cloudflare Worker** + namespace **KV** (`STATS`) :

```
GET  /api/stats      → { red, blue, total, countries: { PL: {...}, US: {...} } }
POST /api/vote       → body: { voter_id, choice }
                       retourne { success | already_voted, choice, stats }
```

Clés KV :
- `global` → `{ red, blue, total }`
- `countries` → `{ "US": {red,blue,total}, "PL": {...}, ... }`
- `voter:{uuid}` → `"red"` | `"blue"` (application d'un vote)

KV cacheTtl : 60s. Détection pays via en-tête `cf-ipcountry`.

### Licence
**[PolyForm Noncommercial 1.0.0](LICENSE)** — gratuit pour tout usage non commercial incluant académique, éducatif, projets personnels. L'usage commercial nécessite une autorisation.

---

## Setup (pour développeurs)

Voir **[SETUP_GLOBAL_STATS.md](SETUP_GLOBAL_STATS.md)** pour le guide complet de déploiement Cloudflare Worker + KV.

Version courte :
1. Forke le repo
2. Connecte à Cloudflare Pages (auto-deploy de `index.html`)
3. Crée un Cloudflare Worker, colle `worker.js`, lie un namespace KV comme `STATS`
4. Mets à jour la constante `API_BASE` dans `index.html` avec ton URL Worker
5. Optionnellement, sème les stats initiales dans KV (clé `global` avec `{"red":N,"blue":M,"total":N+M}`)

---

## Sources et inspirations

Les questions et essais du jeu s'inspirent de :

- **Sally (1995)** — méta-analyse des taux de coopération dans les expériences de dilemme du prisonnier (~37% baseline)
- **Darley & Latané (1968)** — recherche sur l'effet du témoin
- **Oliner & Oliner (1988)** — *The Altruistic Personality* (sauveteurs juifs pendant l'Holocauste)
- **Fehr & Gächter (2000)** — punition dans les jeux coopératifs
- **Schelling (1960)** — *La Stratégie du conflit* · points focaux
- **Kant (1785)** — *Fondements de la métaphysique des mœurs*
- **Mill (1863)** — *L'Utilitarisme*
- **Acemoglu & Robinson (2012)** — *Why Nations Fail*
- **Dikötter** — *La Grande Famine de Mao*
- **Hayek (1944)** — *La Route de la servitude*

Le format même du dilemme fait écho aux expériences de pensée en théorie du choix social et aux problèmes de coordination globale.

---

## Roadmap

- [x] Trois langues (EN, PL, FR)
- [ ] Plus de langues (DE, ES, IT)
- [ ] Mécanique « dernière chance » — autoriser un re-vote après que toutes les questions sont découvertes
- [ ] Plus d'essais (bibliothèque étendue)
- [ ] Mode « comparer avec des amis » (URLs de comparaison partageables)
- [ ] Salons de classe/groupe pour usage éducatif

---

## Contact

C'est un projet personnel. Issues, suggestions et traductions bienvenues via les issues GitHub.

Pour les questions de confidentialité ou les demandes de suppression de vote : ouvre une issue.

---

*Si tous ceux que tu connais vont mourir de toute façon, ce qui compte est le genre de personne que tu choisis d'être en chemin.*
