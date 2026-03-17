---
name: spaced-learning-guide
description: >
  Use this skill whenever working on the spaced-learning repository — a PWA flashcard app using
  FSRS spaced repetition. Trigger on ANY of: running tests, adding features, debugging, refactoring,
  reviewing code, or asking questions about the architecture. This skill contains the canonical
  reference for the stack (React 19 + Vite 7 + TypeScript strict + Dexie v4 + ts-fsrs v5 +
  Vitest v4 + Playwright), all key API quirks, the domain/db/hooks/components architecture,
  run commands, DB schema, and coding conventions. Always consult this before making changes.
---

# Spaced Learning — Codebase Guide

## Project overview

A PWA flashcard app for Android using the FSRS (Free Spaced Repetition Scheduler) algorithm.
Offline-first, no backend, installable via "Add to Home Screen". All code is AI-written with
a strong TDD discipline: pure functions first, side effects isolated, E2E-verified.

---

## Stack

| Layer | Choice | Version |
|---|---|---|
| Language | TypeScript (strict + noUncheckedIndexedAccess) | 5.x |
| UI | React | 19 |
| Bundler / Dev server | Vite | 7 |
| PWA | vite-plugin-pwa | 1.2 |
| Storage | Dexie.js (IndexedDB wrapper) | 4 |
| FSRS algorithm | ts-fsrs | 5 |
| Unit tests | Vitest | 4 |
| E2E tests | Playwright (Chromium only) | 1.58 |
| Runtime (local) | Node.js via nvm | v24 |

---

## Running commands

**CRITICAL**: Node.js is installed via nvm, not system PATH. Every bash command must source nvm first:

```bash
# Dev server
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm run dev'

# Unit tests
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit'

# E2E tests (starts dev server automatically via webServer config)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx playwright test'

# Type-check
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx tsc --noEmit'

# Production build
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm run build'

# Install packages
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm install <pkg>'
```

The pattern `bash -c 'export NVM_DIR=...'` is required because the Bash tool does not persist
shell state between invocations; the nvm sourcing must be inline every time.

---

## File structure

```
src/
  domain/           # Pure functions — no I/O, no React, fully unit-tested
    types.ts        # Deck, Card, FSRSCard, Rating types
    decks.ts        # createDeck(name): Deck — validates, generates UUID+timestamp
    cards.ts        # createCard(front, back, deckId): Card — validates, generates UUID+timestamp
    scheduler.ts    # createNewSchedule(), getNextSchedule(fsrsCard, rating, now)
  db/               # Dexie side-effects (impure)
    db.ts           # Dexie instance + schema (decks + cards + schedules tables, v5)
    deckRepo.ts     # addDeck, deleteDeck, archiveDeck, installPublicDeck, etc.
    cardRepo.ts     # addCard, updateCard, deleteCard, getCardSnapshot, restoreCard
    reviewRepo.ts   # getSchedule, upsertSchedule, getDueCards, getDueCardsByDeck, getReviewedTodayCount
  hooks/            # React hooks bridging domain + db to UI
    useCards.ts     # useLiveQuery → cards by deck or all
    useDecks.ts     # useDeckStats(), useArchivedDecks(), useUninstalledPublicDeckIds()
    useReview.ts    # review session state machine (reveal, rate); accepts optional deckId
    useReviewedToday.ts  # count of cards reviewed today
  components/       # Thin UI shells, minimal logic
    AddCardForm.tsx  # includes deck selector dropdown
    CardList.tsx
    DeckList.tsx    # deck list with due counts + inline deck creation
    ReviewSession.tsx  # accepts optional deckId prop for deck-scoped review
  App.tsx           # View state: tab (Review|Decks|Cards|Add) or deck-review sub-view
  main.tsx          # React root mount
  test-setup.ts     # @testing-library/jest-dom import for Vitest
tests/
  unit/             # Vitest — covers domain/ functions
    cards.test.ts
    decks.test.ts
    scheduler.test.ts
  e2e/              # Playwright — user flows end-to-end
    flashcards.spec.ts
public/
  icon.svg          # PWA icon (SVG placeholder)
index.html          # HTML entry point (Vite)
vite.config.ts      # Vite + vite-plugin-pwa config
vitest.config.ts    # jsdom environment, globals: true
playwright.config.ts # Chromium only, baseURL localhost:5173
tsconfig.json       # strict: true, noUncheckedIndexedAccess: true
```

---

## Core data model

```typescript
// domain/types.ts
interface Deck {
  id: string          // crypto.randomUUID()
  name: string        // trimmed, non-empty
  createdAt: number   // Date.now()
}

interface Card {
  id: string          // crypto.randomUUID()
  front: string       // trimmed, non-empty
  back: string        // trimmed, non-empty
  createdAt: number   // Date.now()
  deckId: string      // required — FK to Deck.id
}

type Rating = 'again' | 'hard' | 'good' | 'easy'
// Wraps FSRS numeric ratings: Again=1, Hard=2, Good=3, Easy=4
```

---

## DB schema (Dexie v4, version 5)

```typescript
// db/db.ts — current schema
db.version(5).stores({
  decks:     'id, createdAt, status',
  cards:     'id, createdAt, deckId',   // keyed by UUID string
  schedules: 'cardId, due, state, last_review',  // keyed by cardId
})
```

**Migration notes:**
- v3: creates "Default" deck and backfills `deckId` on all pre-existing cards.
- v4: adds `status` index to decks, sets all existing decks to `'active'`.
- v5: backfills `explanation` field on existing public deck cards by matching `front` text to seed data.
- Dexie upgrade callbacks don't run on fresh installs — always call seed functions on app startup too.
- When bumping schema, always carry forward all previous index definitions unchanged.

`ScheduleRecord` stores all FSRS fields as flat numbers (dates as `.getTime()` timestamps).
`reviewRepo.ts` handles the conversion between `FSRSCard` (ts-fsrs native) and `ScheduleRecord`.

**Exact `ScheduleRecord` field names** — use these exactly (snake_case to match ts-fsrs):

```typescript
interface ScheduleRecord {
  cardId: string          // FK to Card.id — also the Dexie primary key
  due: number             // Date.getTime()
  stability: number
  difficulty: number
  elapsed_days: number    // snake_case — matches ts-fsrs FSRSCard field
  scheduled_days: number  // snake_case — matches ts-fsrs FSRSCard field
  reps: number
  lapses: number
  learning_steps: number  // snake_case — matches ts-fsrs FSRSCard field
  state: number           // FSRS State enum (0=New, 1=Learning, 2=Review, 3=Relearning)
  last_review?: number    // Date.getTime() | undefined — snake_case
}
```

**Important:** All multi-word fields use **snake_case** (matching ts-fsrs's own FSRSCard type),
not camelCase. When adding new Dexie indexes, use the exact field name.

---

## ts-fsrs API quirks — IMPORTANT

### `fsrs.repeat()` return type

`fsrs.repeat(card, now)` returns an `IPreview` object keyed by **numeric** Rating values.
TypeScript does not allow direct indexing with our `FSRSRating` enum, so cast through `unknown`:

```typescript
import { FSRS, Rating as FSRSRating, createEmptyCard } from 'ts-fsrs'

const fsrs = new FSRS({})
const result = fsrs.repeat(fsrsCard, now)

// CORRECT — cast through unknown:
const next = (result as unknown as Record<number, { card: FSRSCard } | undefined>)[fsrsRating]

// WRONG — TypeScript error:
const next = result[fsrsRating]
```

### Rating enum values

```typescript
Rating.Manual = 0  // unused
Rating.Again  = 1
Rating.Hard   = 2
Rating.Good   = 3
Rating.Easy   = 4
```

### `createEmptyCard()`

Returns a new FSRSCard with `state: State.New (0)`, `reps: 0`, `lapses: 0`.
No arguments needed.

---

## Key architectural constraints

1. **No classes in our code** — except subclassing built-in `Error` (e.g. `CardValidationError`, `DeckValidationError`). FSRS uses classes internally; our wrappers stay functional.
2. **Immutable data** — domain functions return new objects, never mutate.
3. **Pure domain layer** — `src/domain/` has zero imports from `src/db/` or `src/hooks/`.
4. **Tests before implementation** — unit tests written first for all domain functions.
5. **No router library** — navigation is a `View` union type in `App.tsx` state.
6. **`Card.deckId` is required** — never create a card without a valid `deckId`.

---

## Coding conventions

- All domain functions are named exports (no default exports in domain/).
- `CardValidationError` extends `Error` for validation failures in `cards.ts`.
- `useLiveQuery` from `dexie-react-hooks` provides reactive DB queries; always supply
  a default (`?? []`) since it returns `undefined` on first render.
- `upsertSchedule` uses `db.schedules.put()` — idempotent create-or-replace.
- When a card is deleted, its schedule is also deleted in a single Dexie transaction.

---

## PWA configuration

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Manifest: `name: Spaced Learning`, `display: standalone`, `background_color: #1a1a2e`
- Icons: `icon-192.png` and `icon-512.png` referenced in manifest (SVG placeholder in `public/`)
- Service worker (`dist/sw.js`) generated by Workbox on build

---

## Test coverage summary

| Suite | File | Count | What's tested |
|---|---|---|---|
| Unit | cards.test.ts | 6 | createCard: trim, deckId stored, UUID uniqueness, timestamp, validation errors |
| Unit | decks.test.ts | 4 | createDeck: trim, UUID uniqueness, timestamp, validation error |
| Unit | scheduler.test.ts | 4 | createNewSchedule state, Again < Good < Easy due ordering |
| E2E | flashcards.spec.ts | 4 | add card, review Good → queue empty, empty form error, create deck + deck-scoped review |

E2E tests clear IndexedDB via `indexedDB.databases()` + `deleteDatabase` before each test, then `page.reload()` + `waitForTimeout(200)` to let `ensureDefaultDeck()` run.

---

## Common pitfalls

- **Forgetting nvm**: `npm: command not found` means you forgot to source nvm.
- **`noUncheckedIndexedAccess`**: Array access returns `T | undefined`; always null-check.
- **Dexie `useLiveQuery` returns `undefined`**: Use `?? []` default on every hook.
- **ts-fsrs `repeat()` type error**: Use `as unknown as Record<number, ...>` cast.
- **E2E test isolation**: Tests share IndexedDB; `beforeEach` must reload after clearing DB and wait for `ensureDefaultDeck()`.
- **Dexie migration vs fresh install**: Upgrade callbacks only run when the DB version increases. For fresh installs (no prior DB), always call `ensureDefaultDeck()` on app startup — don't rely on upgrade callbacks for seeding.
- **Deck deletion cascade**: `deleteDeck` deletes all cards AND their schedules. Use `db.transaction('rw', ...)` to keep it atomic.
- **`createCard` now requires `deckId`**: Every call site must supply a valid deck ID. The `AddCardForm` component handles this via the deck selector dropdown.
