# Two Buttons

A test of who you become when no one is watching.

An interactive moral dilemma game grounded in game theory and behavioral research. Pick red or blue. Discover the questions that challenge your choice.

**Play it:** [open `index.html`](./index.html) in any browser, or host it on GitHub Pages.

---

## What it is

Every human on Earth gets the same message: two buttons, one private choice.

- If more than 50% of humanity picks **blue** → everyone lives.
- If 50% or fewer pick blue → blues die, reds live.
- If everyone picks red → everyone lives.

Red is the dominant strategy: 100% survival regardless of what others do. Blue is an act of faith: cooperative, idealistic, deadly if too few people share your faith.

The game uses a realistic distribution of simulated humanity (most people pick red, occasionally enough pick blue for everyone to survive) and confronts you with **16 questions** that systematically dismantle whichever side you chose.

## Features

- **Probabilistic simulation** — based on documented cooperation rates in one-shot anonymous prisoner's dilemma games (~37% cooperation, Sally 1995)
- **Four distinct emotional outcomes** — shame, weight, triumph, death — each tuned to the gap between your choice and humanity's actual behavior
- **Reality check panel** — six research findings spanning surveys → laboratory → real history (Holocaust rescuers, COVID compliance, public goods games)
- **16 unlockable questions** — 8 challenging blue, 8 challenging red, revealed one at a time. Forces you to play both sides if you want the full collection
- **Pattern recognition** — after 3+ plays, the game tells you what your choice pattern reveals about you compared to documented research
- **Bilingual** — English and Polish, auto-detected from browser locale, manually switchable

## Research basis

The game is built on real findings from social psychology and experimental economics:

- Sally, D. (1995). *Conversation and cooperation in social dilemmas: A meta-analysis of experiments from 1958 to 1992.*
- Darley, J., & Latané, B. (1968). *Bystander intervention in emergencies: Diffusion of responsibility.*
- Oliner, S. P., & Oliner, P. M. (1988). *The altruistic personality: Rescuers of Jews in Nazi Europe.*
- Fehr, E., & Gächter, S. (2000). *Cooperation and punishment in public goods experiments.*

The pattern is consistent: the more real the risk, the lower the cooperation rate. Surveys yield ~70% claimed altruism. Laboratory games with token stakes yield ~37%. Occupied Europe under Nazi rule yielded <1% active rescuers.

## Setup

No build step. No dependencies. No tracking.

```bash
git clone <this-repo>
cd two-buttons-dilemma
# Open index.html in any browser
```

To host on GitHub Pages: push to a public repo and enable Pages from the main branch root.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE) — free for personal, academic, research, and other non-commercial use. **Commercial use requires a separate license** — contact the copyright holder.

---

# Dwa przyciski (PL)

Test tego, kim się stajesz, kiedy nikt nie patrzy.

Interaktywny dylemat moralny oparty na teorii gier i badaniach behawioralnych. Wybierz czerwony albo niebieski. Odkryj 16 pytań, które podważają twój wybór.

## Czym to jest

Każdy człowiek na Ziemi otrzymuje tę samą wiadomość — dwa przyciski, jeden prywatny wybór.

- Jeśli ponad 50% ludzkości wybierze **niebieski** → wszyscy żyją.
- Jeśli 50% lub mniej → niebiescy giną, czerwoni żyją.
- Jeśli wszyscy wybiorą czerwony → wszyscy żyją.

Czerwony to strategia dominująca: 100% przeżycia niezależnie od innych. Niebieski to akt wiary — kooperacja, idealizm, śmierć jeśli za mało ludzi podziela tę wiarę.

Gra wykorzystuje realistyczny rozkład symulowanej ludzkości i konfrontuje cię z **16 pytaniami**, które systematycznie demontują twój wybór — niezależnie od tego, którą stronę wybierzesz.

## Funkcje

- Symulacja probabilistyczna oparta na udokumentowanych poziomach kooperacji w jednorazowych dylematach więźnia
- Cztery różne emocjonalne zakończenia: wstyd, ciężar, triumf, śmierć
- Panel "co mówią badania" z sześcioma poziomami: ankiety → laboratorium → historia (Holokaust, COVID, gra dóbr publicznych)
- 16 odblokowywanych pytań — 8 podważa niebieski, 8 czerwony
- Rozpoznawanie wzorca po 3+ grach
- Dwujęzyczność: polski i angielski

## Licencja

[PolyForm Noncommercial 1.0.0](./LICENSE) — darmowa do użytku osobistego, akademickiego, badawczego i innego niekomercyjnego. **Użytek komercyjny wymaga osobnej licencji** — skontaktuj się z autorem.
