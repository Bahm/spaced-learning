# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git safety — merged-branch check

Before ANY `git commit` or `git push`, run: `gh pr list --state all --head $(git branch --show-current)`. If MERGED, **stop** — checkout main, pull, create a new branch. Pushing to a merged branch strands commits silently.

## Automation layer

This project is configured for (mostly) hands-off AI development. Key automation:

| Artifact | Location | What it does |
|---|---|---|
| PostToolUse tsc hook | `.claude/settings.json` | Runs `tsc --noEmit` after every file edit; output fed back into Claude's context |
| Pre-commit hook | `.git/hooks/pre-commit` | Blocks commits with type errors or failing unit tests |
| CI workflow | `.github/workflows/ci.yml` | Runs type-check + unit tests + E2E + build on every push/PR |
| implement-issue skill | `.claude/skills/implement-issue/` | End-to-end TDD workflow: issue → tests → implementation → commit → PR |
| Auto-implement workflow | `.github/workflows/implement-from-issue.yml` | Label issue `auto-implement` → Claude CLI runs on self-hosted runner → PR created. Includes PR-existence verification step. |
| Memory consolidation | `.claude/scripts/post-session.sh` | Run `npm run memory:sync` at session end to extract lessons + ask "what could be more automated?" |

**Intended workflow:**
1. Create a GitHub Issue describing the feature/fix
2. Ask Claude to `/implement-issue <N>` — it reads the issue, writes failing tests, implements, verifies, commits, creates a PR
3. CI verifies the PR automatically
4. Review the diff and merge

---

## About this project

A PWA flashcard app for Android using the FSRS (Free Spaced Repetition Scheduler) algorithm. Offline-first, no backend, installable via "Add to Home Screen". All code is AI-written. The README expects AI to keep all documentation (including this file) up to date as the project evolves.

## Commands

**CRITICAL**: Node.js is installed via nvm, not the system PATH. Every shell command must source nvm inline — the Bash tool does not persist shell state between invocations.

```bash
# Dev server
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm run dev'

# Unit tests (all)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit'

# Unit tests (single file)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit/cards.test.ts'

# E2E tests (auto-starts dev server)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx playwright test'

# Type-check
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx tsc --noEmit'

# Production build
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm run build'
```

If you see `npm: command not found`, you forgot to source nvm.

## Architecture

The core principle is **separation of pure logic from side effects**:

- `src/domain/` — pure functions only, zero imports from `db/` or `hooks/`. Unit-tested first.
- `src/db/` — Dexie/IndexedDB side effects. Never imported by `domain/`.
- `src/hooks/` — React hooks for **reactive reads** via `useLiveQuery` from `dexie-react-hooks`.
- `src/components/` — thin UI shells. No raw `db.*` calls; repo functions are fine.
- `App.tsx` — tab switcher (Review / Decks) + deck-detail and deck-review sub-views using a `View` union type. No router library.

**Read path**: hooks use `useLiveQuery` → Dexie re-fires on table mutation → component re-renders.
**Write path**: components call repo functions directly (e.g. `addCard`, `upsertSchedule`, `deleteCard`) — no hook needed for writes.
`useReview` is the exception: it manages the review session state machine and orchestrates both reads (`useLiveQuery` for due cards) and writes (`upsertSchedule` after rating).

## DB schema

Three Dexie tables (current schema version: 4):

```
decks:     id (PK), createdAt, status
cards:     id (PK), createdAt, deckId
schedules: cardId (PK), due, state, last_review
```

`Card.deckId` is required. `Deck.status` is `'active' | 'archived' | 'uninstalled'` — active decks appear in My Decks, archived are soft-deleted user decks, uninstalled are public decks removed from My Decks (cards+schedules preserved in DB). The v3 Dexie migration creates a "Default" deck and backfills `deckId` on pre-existing cards. The v4 migration adds the `status` index and sets all existing decks to `'active'`.

**No auto-seeding on startup.** Fresh installs start with empty My Decks and a Public Decks catalog. Public decks are defined in `PUBLIC_DECK_CATALOG` (`src/domain/decks.ts`). Users install them on demand via `installPublicDeck()` in `deckRepo.ts`. To add a new public deck: create `src/db/<name>SeedData.ts` exporting `SeedCard[]`, add an entry to `PUBLIC_DECK_CATALOG` and `SEED_CARD_MAP` in `deckRepo.ts`.

`ScheduleRecord` fields are **snake_case** to match ts-fsrs's own `FSRSCard` type (`elapsed_days`, `scheduled_days`, `learning_steps`, `last_review`). Never use camelCase for these. When adding a new Dexie index, use the exact snake_case field name.

`reviewRepo.ts` owns all conversion between `FSRSCard` (ts-fsrs native, uses `Date` objects) and `ScheduleRecord` (Dexie, stores dates as `.getTime()` numbers). Use `getDueCardsByDeck(deckId)` for deck-scoped review, `getDueCards()` for global review.

## ts-fsrs API quirks

`fsrs.repeat(card, now)` returns `IPreview`, keyed by **numeric** Rating values at runtime but without a numeric index signature in TypeScript. Cast through `unknown`:

```typescript
const next = (result as unknown as Record<number, { card: FSRSCard } | undefined>)[fsrsRating]
```

A direct cast from `IPreview` to `Record<number, ...>` is rejected by TypeScript — the `unknown` intermediate step is required. See `src/domain/scheduler.ts` for the canonical usage.

Rating enum: `Again=1, Hard=2, Good=3, Easy=4` (Manual=0 unused).

## Coding constraints

- Don't define classes except to subclass built-in `Error` (see `CardValidationError` in `cards.ts`). FSRS uses classes internally; our wrappers stay functional.
- Domain functions return new objects — never mutate.
- `useLiveQuery` returns `undefined` on first render; always provide a default (`?? []` or `?? 0`).
- `upsertSchedule` uses `db.schedules.put()` — idempotent.
- Deleting a card also deletes its schedule in a single Dexie transaction. Permanently deleting a deck (`permanentlyDeleteDeck`) cascade-deletes all its cards and schedules (schedules → cards → deck, inside one `db.transaction('rw', ...)`). For active decks, prefer `archiveDeck` (user decks) or `uninstallPublicDeck` (public decks) over permanent deletion.
- `useReview(deckId?)` accepts an optional `deckId` — when provided it calls `getDueCardsByDeck`, otherwise `getDueCards`.
- `noUncheckedIndexedAccess` is enabled — array/index access returns `T | undefined`; always null-check.
- Cards with no schedule entry are treated as immediately due. `getDueCards`/`getDueCardsByDeck` use `bulkGet` on all card IDs and include any card whose schedule is missing or whose `due` timestamp is ≤ now.
- React StrictMode (active in dev) runs effects twice. Any `useEffect` with side effects must be truly idempotent — guard with a check-then-write inside a single Dexie transaction, not a count check before it. See `installPublicDeck()` for the canonical pattern.
- When a `useEffect` event listener needs live state but should only register once, store the live values in refs and read them inside the stable handler. See `ReviewSession.tsx` keyboard shortcut handler for the canonical pattern.
- Use `title={condition ? 'Explanation text' : undefined}` on `<button disabled>` elements to explain why they are disabled. Omitting the `title` when condition is false avoids a blank `title=""` attribute.

## Tests

Unit tests cover `src/domain/` only (pure functions). E2E tests cover full user flows in Chromium.

E2E tests clear IndexedDB before each test via `indexedDB.databases()` + `deleteDatabase`, then `page.reload()`. Fresh installs have no seed data, so only a brief `waitForTimeout(200)` is needed for Dexie init. Tests that need a public deck must call `installPublicDeck(page, deckName)` (helper in the test file), which clicks Install and waits 1000ms for seed cards. The Playwright `webServer` config auto-starts the dev server if not already running.

The runtime IndexedDB database name is `'SpacedLearning'` (set in the Dexie constructor in `db.ts`). Use this when manually clearing storage: `indexedDB.deleteDatabase('SpacedLearning')`.

When matching buttons by name, use `exact: true` if the label is a substring of another button's label (e.g. `getByRole('button', { name: 'Add', exact: true })` to avoid matching "Add Deck" too).

For HTML attribute assertions (tooltips, ARIA attributes), use `toHaveAttribute('attrName', /pattern/)`. Do not try to assert CSS property values in Playwright — test behavior (attributes, text, visibility), not style.

Avoid `page.getByText('partial')` when that string appears as a substring of other visible text — e.g. `getByText('Answer')` matches the "Show Answer" button. Prefer `getByRole` with an exact name, or assert on a more specific element.

**`getByLabel` aria-label collision**: Playwright's `getByLabel` matches ANY element with a matching `aria-label` attribute (not just form controls) using substring matching. Nav buttons with `aria-label` values that are substrings of form field labels will collide. Design nav button `aria-label` values to avoid substrings of field labels (e.g. use `"← Decks"` not `"← Back"` when a "Back" textarea exists). Use `getByRole('combobox')` to target `<select>` elements specifically.

`App.tsx` navigation uses a `View` union type — no router:

```typescript
type Tab = 'review' | 'decks'
type View =
  | { type: 'tab'; tab: Tab }
  | { type: 'deck-review'; deckId: string; deckName: string }
  | { type: 'deck-detail'; deckId: string; deckName: string }
```

Tab nav (Review / Decks) is hidden in sub-views (`deck-review`, `deck-detail`); a back arrow (`aria-label="← Decks"`) navigates to the Decks tab. Cards are viewed and added from within a deck (`DeckDetail` component = `AddCardForm` + `CardList` scoped to a `deckId`). `AddCardForm` requires a `deckId` prop — no deck selector shown to the user.
