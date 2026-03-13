# CLAUDE.md

## Git safety — merged-branch check

Before ANY `git commit` or `git push`, run: `gh pr list --state all --head $(git branch --show-current)`. If MERGED, **stop** — checkout main, pull, create a new branch.

## Commands

**CRITICAL**: Node.js is installed via nvm, not the system PATH. Every shell command must source nvm inline.

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

## Architecture

Separation of pure logic from side effects:

- `src/domain/` — pure functions only, zero imports from `db/` or `hooks/`
- `src/db/` — Dexie/IndexedDB side effects
- `src/hooks/` — reactive reads via `useLiveQuery`
- `src/components/` — thin UI shells; repo functions for writes, hooks for reads

## DB schema

Three Dexie tables (schema version 4). See `src/db/db.ts` for full definitions.

`Card.deckId` is required. `Deck.status` is `'active' | 'archived' | 'uninstalled'`.

`ScheduleRecord` fields are **snake_case** (`elapsed_days`, `scheduled_days`, `learning_steps`, `last_review`) to match ts-fsrs. Never use camelCase.

## Coding constraints

- No classes except `Error` subclasses. Domain functions return new objects — never mutate.
- `useLiveQuery` returns `undefined` on first render. Do NOT provide defaults — return `T | undefined` from hooks so components can distinguish "loading" (`undefined`) from "empty" (`[]`/`0`). Use `aria-busy` on containers during loading.
- `noUncheckedIndexedAccess` is enabled — always null-check array/index access.
- Cards with no schedule entry are treated as immediately due.
- React StrictMode runs effects twice in dev — guard `useEffect` side effects with check-then-write inside a single Dexie transaction.
- Use `title={condition ? 'Explanation' : undefined}` on disabled buttons to explain why.

## Tests

Unit tests cover `src/domain/` only. E2E tests cover full user flows in Chromium.

See `.claude/rules/e2e-testing.md` for Playwright-specific patterns and pitfalls.

## Compaction guidance

When compacting, preserve: the nvm sourcing requirement, snake_case field names for ScheduleRecord, the architecture layering rules, and any in-progress file paths.

## Workflow

1. Create a GitHub Issue describing the feature/fix
2. `/implement-issue <N>` — TDD workflow: failing tests → implementation → commit → PR
3. CI verifies automatically; review and merge
