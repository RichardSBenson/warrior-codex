# Warrior Codex

Train as warriors trained. Six ranks, ten trials, verified.

React PWA built to the Architecture & Design Protocol — Clean Architecture, offline-first,
domain layer tested. **60 tests passing.**

---

## Running it

```bash
npm install
npm run dev      # local dev server
npm test         # Vitest — 60 tests, domain and design system
npm run build    # production build into dist/
```

## Deploying

The app is at the **repository root**. Vercel's Root Directory setting should be `/`,
not a subfolder. Push to `main` and it rebuilds.

## Structure

```
src/
├── domain/            no React, no storage, no side effects
│   ├── entities/      Rank, Trial, Movement, Record, StandingOrder, Program
│   ├── useCases/      ScoreAssessment, TestSchedule, AnimatePose, SelectVoice
│   ├── interfaces/    repository contracts
│   └── __tests__/     mirrors the domain structure
├── data/
│   ├── repositories/  LocalStorageRepository
│   ├── sources/       static JSON
│   └── mappers/
├── presentation/      the only layer that knows about React
│   ├── components/    MovementFigure
│   ├── screens/       Assessment, Training, Profile, Orders
│   ├── context/
│   └── hooks/
├── design/            tokens, theme, uiKit
└── infrastructure/    Firebase, camera, GPS — empty until Module 4+
```

**The dependency rule.** Infrastructure → Presentation → Data → Domain. Dependencies
point inward and never outward. Domain imports nothing.

## The ladder

Recruit · Soldier · Warrior · **Veteran** · Warlord · Legend

Rank four is Veteran. Not Elite, not Vanguard. The program PDFs still say Elite and
need updating to match — `RANKS`, `RANK_COLORS`, `REVEAL_FLAVOR` and `RANK_LORE` are
already correct here.

`rankForTest` and `overallRank` return a rank **index**, not a name. Your rank is your
weakest attempted trial; an unattempted trial does not drag you down, it simply is not
counted yet.

## Two rules that are easy to break

**Never hardcode a visual value.** Every colour comes from `design/tokens.js`. `uiKit.js`
re-exports them so screens are unchanged, but tokens is the source of truth.

**A training-mode floor is not a target.** The protocol's floors for the exercise name
(18px) and set/rep numbers (16px) are identical to the browsing sizes, meaning training
mode would not enlarge them at all. `trainingSizes` clears the floor; a test fails if any
value drops to or below the browsing size.

## Changed in this migration

- Repo flattened to the root — nested `warrior_codex_repo/` is gone
- Folders renamed to protocol layers: `usecases` → `domain/useCases`, `adapters` →
  `data/repositories`, `ui` → `presentation`
- Vitest added, 60 tests written against the existing domain logic
- Colour constants centralised in `design/tokens.js`
- **Bug fixed:** dead hang thresholds were `[15, 30, 60, 90, 30, 60]` — Warlord and
  Legend sat below Veteran, so a 90-second hang scored Legend. Now
  `[15, 30, 60, 90, 110, 165]`, matching the program documents.

No application logic was rewritten. Only import paths moved.
