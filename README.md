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

## Security posture

The app is a static PWA with no backend and no account. Everything a user
produces lives in `localStorage` on their own device. That shapes the threat
model: there is no server to attack and no data of anyone else's to reach.
What remains is worth doing properly.

**Headers** are set in `vercel.json`. A content security policy restricts
scripts to the origin, `frame-ancestors 'none'` and `X-Frame-Options: DENY`
prevent the app being framed for clickjacking, `Referrer-Policy: no-referrer`
stops URLs leaking outward, and `Permissions-Policy` denies camera, microphone,
geolocation and payment.

`style-src` must allow `'unsafe-inline'` because every component styles itself
with inline style objects. That is a real weakening of the policy and the reason
it matters that nothing in this codebase uses `dangerouslySetInnerHTML`. If the
styling ever moves to CSS files, tighten it.

**Camera and geolocation are denied at the header level.** Module 8 needs the
camera and Module 11 needs geolocation. Both will fail silently until
`Permissions-Policy` is changed to `camera=(self)` and `geolocation=(self)`.
That is deliberate — permissions should be granted when a feature ships, not
years ahead of it.

**Stored values are untrusted.** `data/repositories/validate.js` sanitises every
read: unknown trial ids are dropped, scores must be finite and non-negative, a
start date must parse and must not be in the future, record counters are clamped
to whole numbers, and the Proving Ground override must name a real rank inside
real bounds. Prototype keys never survive a read. An unreadable value becomes
the fallback and the app carries on.

**The Proving Ground** is enabled by `?dev=1`, after which the parameter is
stripped from the URL and history so the link cannot be forwarded to switch it
on for someone else invisibly. It changes only which session is displayed. It
writes no result, advances no rank and touches no record.
