---
paths:
  - "src/db/**"
---

# DB Layer Rules

## Dexie conventions

- `upsertSchedule` uses `db.schedules.put()` — idempotent
- Deleting a card also deletes its schedule in a single transaction
- `permanentlyDeleteDeck` cascade-deletes: schedules → cards → deck inside `db.transaction('rw', ...)`
- Prefer `archiveDeck` (user decks) or `uninstallPublicDeck` (public) over permanent deletion
- `reviewRepo.ts` owns conversion between `FSRSCard` (Date objects) and `ScheduleRecord` (`.getTime()` numbers)

## Public decks

Defined in `PUBLIC_DECK_CATALOG` (`src/domain/decks.ts`). To add a new public deck:
1. Create `src/db/<name>SeedData.ts` exporting `SeedCard[]`
2. Add entry to `PUBLIC_DECK_CATALOG` in `decks.ts` (with hardcoded `cardCount`) and `SEED_CARD_MAP` in `deckRepo.ts`
3. A structural test verifies that `cardCount` in the catalog matches the actual seed data size

`installPublicDeck()` is the canonical pattern for StrictMode-safe idempotent effects.
