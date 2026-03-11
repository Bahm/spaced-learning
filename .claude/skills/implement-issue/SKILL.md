---
name: implement-issue
description: >
  Implement a feature or fix from a GitHub Issue or plain description for the spaced-learning
  project. Use this whenever the user says "implement issue #N", "work on issue", "add feature X",
  "fix bug Y", or describes any change to make to the codebase. Follows strict TDD: failing tests
  first, then implementation, then full verification before committing and creating a PR.
  After each session, promotes stable lessons from MEMORY.md into CLAUDE.md so project knowledge
  accumulates in the canonical docs rather than only in personal memory.
  Always use this skill rather than ad-hoc implementation — it ensures the TDD workflow,
  correct layering, automated verification, and living documentation are never skipped.
---

# Implement Issue

## Workflow

> **All 9 steps are mandatory on every PR** — including style-only, docs-only, and trivial fixes. The steps most tempting to skip on "simple" PRs (TDD in step 4, retrospection in step 9) are the ones where discipline pays off most.

### 1. Read the spec
- If given an issue number: `gh issue view <N>` to read title + body
- If given a description: treat that as the spec
- Confirm understanding before writing any code

### 2. Load project context
- CLAUDE.md is already in context — re-read the relevant sections
- Check for any applicable lessons in MEMORY.md
- If the change touches domain logic, DB schema, or scheduling: re-read the relevant source files

### 3. Create a feature branch
Always branch from an up-to-date `main` — never from another feature branch, even if one is already checked out. Pull first, then check remaining commits:
```bash
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; git checkout main && git pull && git checkout -b feature/<kebab-case-title>'
```
Keep branch name short (3-5 words max). Use `fix/` prefix for bugs, `feature/` for new functionality.

Each PR must have its own branch. If you are about to commit and the current branch already has an open PR, stop and create a new branch from `main` first.

**Before creating any PR**, verify no PR already exists for this branch:
```bash
gh pr list --state all --head $(git branch --show-current)
```
If a PR is MERGED or OPEN, do not create another one.

### 4. Write failing tests FIRST (TDD)
This is non-negotiable. Tests define the contract; implementation satisfies it.

- **Domain logic changes** → unit test in `tests/unit/<domain-file>.test.ts`
- **UI/flow changes** → E2E scenario in `tests/e2e/flashcards.spec.ts`
- **Both** if the change spans layers
- **Pure style/CSS changes** — not exempt. Write at least one E2E test asserting a behavioral property of the affected element: an attribute (`title`, `aria-label`, `disabled`), visibility, or role. If a change is truly behavior-free (e.g. a color value), write a minimal smoke test that exercises the affected element so future regressions are caught. "There's nothing to test" is almost never true — a missing `title` attribute on a disabled button is a behavioral gap that an E2E test can catch.

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
git status  # review ALL modified files — stage everything that belongs in this change
git add src/domain/... tests/unit/... # etc. — include .claude/skills/ changes too if applicable
git commit -m "$(cat <<'EOF'
feat: <what changed and why in one sentence>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 8. Create PR
Before pushing, confirm the PR for this branch is still open (not already merged):
```bash
gh pr list --state all --head $(git branch --show-current)
```
If status is MERGED, the branch is stale — create a new branch from main and start a new PR.

When triggered from a GitHub Issue (i.e. an issue number was given in step 1), include `Closes #<N>` in the PR body so GitHub auto-closes the issue on merge.

```bash
gh pr create --title "<concise title under 70 chars>" --body "$(cat <<'EOF'
## Summary
- <bullet: what changed>
- <bullet: why>

## Test plan
- [ ] Unit tests pass (`npx vitest run tests/unit`)
- [ ] E2E tests pass (`npx playwright test`)
- [ ] Type-check clean (`npx tsc --noEmit`)

Closes #<issue-number>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Omit the `Closes #N` line when there is no associated issue.

### 9. Consolidate learnings

**This step is mandatory — it applies to every PR, including style-only or trivial changes.** Do not skip it.

`npm run memory:sync` cannot run inside an active Claude Code session (it uses `claude -p` which would nest sessions). Instead, update MEMORY.md directly:

1. Read `/home/bahm/.claude/projects/-home-bahm-Projects-spaced-learning/memory/MEMORY.md`
2. Reflect on this implementation: errors hit and how they were fixed, architectural decisions, patterns discovered, pitfalls avoided
3. Edit MEMORY.md — add only new, stable lessons not already captured. No duplicates. Keep it concise. Also update any stale facts (e.g. test counts).
4. **Save lessons immediately** — if you identify a lesson during implementation (e.g. "the fix for the future is…"), write it to MEMORY.md and this SKILL.md in the same response. Stating a lesson without saving it means it will be forgotten.
5. **Promote stable lessons to CLAUDE.md** — after updating MEMORY.md, scan all lessons and ask: is this a stable technical fact about the codebase (not workflow meta) that isn't already in CLAUDE.md? If yes, add it. The distinction:
   - **Promote to CLAUDE.md**: domain invariants, DB/API quirks, test patterns, coding constraints
   - **Keep in MEMORY.md only**: git workflow rules, session-management meta, Claude-specific operating procedures
6. **Improve this skill via `/skill-creator`** — if any lessons from this session apply to the implement-issue *workflow itself* (a step that was skipped, a pattern that should be enforced, an instruction that was unclear), invoke `/skill-creator` to apply them as targeted edits to this SKILL.md. You don't need the full eval loop every time — a focused edit pass is enough for small improvements. Use the full eval loop when making substantial structural changes. The goal: the skill gets slightly better after every session, not only when problems are explicitly reported.
7. **Commit and push retrospection changes** — the edits above produce real file changes (MEMORY.md, CLAUDE.md, SKILL.md). Stage and commit them so they land on `main` when the PR merges. Use a `docs:` or `chore:` prefix:
   ```bash
   git add CLAUDE.md .claude/skills/implement-issue/SKILL.md
   # MEMORY.md lives outside the repo — no need to stage it
   git commit -m "docs: retrospection from <branch-name>"
   git push
   ```

---

## Project-specific reminders

- **nvm required**: every bash command must source nvm inline
- `Card.deckId` is required — always pass a valid deckId to `createCard`
- `ScheduleRecord` fields are **snake_case**: `elapsed_days`, `scheduled_days`, `learning_steps`, `last_review`
- Bumping the Dexie schema version requires carrying forward ALL previous index definitions
- `ensureDefaultDeck()` must be called on app startup — not just in migration callbacks
- After clearing IndexedDB in E2E tests: `waitForTimeout(1000)` before asserting — the 1000-card seed bulk insert takes longer than a single deck insert
- Button name `exact: true` when the label is a substring of another button (e.g. "Add" vs "Add Deck")
