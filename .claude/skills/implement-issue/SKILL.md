---
name: implement-issue
description: >
  Implement a feature or fix from a GitHub Issue or plain description for the spaced-learning
  project. Use this whenever the user says "implement issue #N", "work on issue", "add feature X",
  "fix bug Y", or describes any change to make to the codebase. Follows strict TDD: failing tests
  first, then implementation, then full verification before committing and creating a PR.
  Always use this skill rather than ad-hoc implementation — it ensures the TDD workflow,
  correct layering, and automated verification are never skipped.
---

# Implement Issue

## Workflow

### 1. Read the spec
- If given an issue number: `gh issue view <N>` to read title + body
- If given a description: treat that as the spec
- Confirm understanding before writing any code

### 2. Load project context
- CLAUDE.md is already in context — re-read the relevant sections
- Check for any applicable lessons in MEMORY.md
- If the change touches domain logic, DB schema, or scheduling: re-read the relevant source files

### 3. Create a feature branch
```bash
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; git checkout -b feature/<kebab-case-title>'
```
Keep branch name short (3-5 words max). Use `fix/` prefix for bugs, `feature/` for new functionality.

### 4. Write failing tests FIRST (TDD)
This is non-negotiable. Tests define the contract; implementation satisfies it.

- **Domain logic changes** → unit test in `tests/unit/<domain-file>.test.ts`
- **UI/flow changes** → E2E scenario in `tests/e2e/flashcards.spec.ts`
- **Both** if the change spans layers

Run to confirm they fail (passing tests at this stage means the feature already exists or the test is wrong):
```bash
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit'
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx playwright test'
```

### 5. Implement
Follow the layering strictly:
- **New logic** → `src/domain/` (pure function, no I/O)
- **New DB query** → `src/db/` (repo function)
- **New reactive read** → `src/hooks/` (`useLiveQuery`)
- **UI changes** → `src/components/` (thin shell, no direct Dexie calls)

The PostToolUse hook runs `tsc --noEmit` after every file edit — watch for type errors in the hook output and fix them immediately rather than accumulating.

Implement the minimum needed to make the tests pass. No extra features.

### 6. Verify
All three must be clean:
```bash
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx tsc --noEmit'
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit'
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx playwright test'
```

### 7. Commit
Stage specific files only (never `git add -A` — avoids accidentally staging `.env` or large binaries):
```bash
git add src/domain/... tests/unit/... # etc.
git commit -m "$(cat <<'EOF'
feat: <what changed and why in one sentence>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 8. Create PR
```bash
gh pr create --title "<concise title under 70 chars>" --body "$(cat <<'EOF'
## Summary
- <bullet: what changed>
- <bullet: why>

## Test plan
- [ ] Unit tests pass (`npx vitest run tests/unit`)
- [ ] E2E tests pass (`npx playwright test`)
- [ ] Type-check clean (`npx tsc --noEmit`)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 9. Consolidate learnings
`npm run memory:sync` cannot run inside an active Claude Code session (it uses `claude -p` which would nest sessions). Instead, update MEMORY.md directly:

1. Read `/home/bahm/.claude/projects/-home-bahm-Projects-spaced-learning/memory/MEMORY.md`
2. Reflect on this implementation: errors hit and how they were fixed, architectural decisions, patterns discovered, pitfalls avoided
3. Edit MEMORY.md — add only new, stable lessons not already captured. No duplicates. Keep it concise.
4. Ask: **what additional steps could make this workflow more automated or effective?** If you have concrete ideas not already in MEMORY.md, add a brief "Workflow improvement ideas" section.

---

## Project-specific reminders

- **nvm required**: every bash command must source nvm inline
- `Card.deckId` is required — always pass a valid deckId to `createCard`
- `ScheduleRecord` fields are **snake_case**: `elapsed_days`, `scheduled_days`, `learning_steps`, `last_review`
- Bumping the Dexie schema version requires carrying forward ALL previous index definitions
- `ensureDefaultDeck()` must be called on app startup — not just in migration callbacks
- After clearing IndexedDB in E2E tests: `waitForTimeout(1000)` before asserting — the 1000-card seed bulk insert takes longer than a single deck insert
- Button name `exact: true` when the label is a substring of another button (e.g. "Add" vs "Add Deck")
