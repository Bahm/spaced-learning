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

> ⛔ **BEFORE ANY `git commit` or `git push`**, run this check — no exceptions:
> ```bash
> gh pr list --state all --head $(git branch --show-current)
> ```
> If the result shows **MERGED**, the branch is dead. **Stop.** Do not commit. Do not push. Checkout `main`, pull, create a new branch, then continue. This rule exists because pushing to a merged branch strands commits silently — it happened twice in one session and the commits had to be cherry-picked to recover them.

> **All 9 steps are mandatory on every PR** — including style-only, docs-only, and trivial fixes. The steps most tempting to skip on "simple" PRs (TDD in step 4, retrospection in step 9) are the ones where discipline pays off most.

### 1. Read the spec
- If given an issue number: `gh issue view <N> --json title,body,labels,comments` to read the full issue context including all comments. Comments often contain updated instructions, clarifications, or scope changes from the user — they are as important as the original body.
- If given a description: treat that as the spec
- Confirm understanding before writing any code

### 2. Load project context
- CLAUDE.md is already in context — re-read the relevant sections
- Check for any applicable lessons in MEMORY.md
- If the change touches domain logic, DB schema, or scheduling: re-read the relevant source files

### 3. Create a feature branch
**First, check the current branch status** — before doing anything else, run:
```bash
git branch --show-current
gh pr list --state all --head $(git branch --show-current)
```
If the current branch has a MERGED PR, it is stale. Do not commit or push to it. Checkout main, pull, and create a fresh branch. This check must happen at the start of every session, not just before committing.

Always branch from an up-to-date `main` — never from another feature branch, even if one is already checked out. Pull first, then check remaining commits:
```bash
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; git checkout main && git pull && git checkout -b feature/<kebab-case-title>'
```
Keep branch name short (3-5 words max). Use `fix/` prefix for bugs, `feature/` for new functionality.

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
**First**, verify the branch is not stale — this is the gate that prevents stranded commits:
```bash
gh pr list --state all --head $(git branch --show-current)
# If MERGED → stop, checkout main, pull, create new branch. Do NOT proceed.
```

Then stage specific files only (never `git add -A` — avoids accidentally staging `.env` or large binaries):
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

**Close existing open PRs for the same issue** — when triggered from a GitHub Issue, check for any existing open PRs that reference `Closes #<N>`. If found, close them with a comment explaining they are superseded, before creating the new PR:
```bash
# Find and close existing open PRs for this issue
EXISTING_PRS=$(gh pr list --state open --search "Closes #<issue-number>" --json number --jq '.[].number')
for PR_NUM in $EXISTING_PRS; do
  gh pr close "$PR_NUM" --comment "Superseded by a new PR for issue #<issue-number> (scope was updated)."
done
```
This prevents duplicate PRs when an issue's scope is updated and the workflow re-runs.

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
5. **Promote stable lessons to CLAUDE.md** — after updating MEMORY.md, scan all lessons and ask: would this lesson help during ad-hoc work when no skill is loaded? If yes, it belongs in CLAUDE.md (which is always in context), not just in a skill or MEMORY.md. A lesson saved only to a skill is invisible when the mistake happens outside that skill's scope. The distinction:
   - **Promote to CLAUDE.md**: anything that applies to general work — git safety checks, domain invariants, DB/API quirks, test patterns, coding constraints
   - **Keep in MEMORY.md only**: lessons that are purely about Claude's internal operating procedures and wouldn't affect code or git actions
6. **Best-practices audit** — routinely verify the project follows Claude Code best practices. Check each item and fix any drift:
   - [ ] `CLAUDE.md` is under 200 lines (move verbose content to path-scoped rules in `.claude/rules/`)
   - [ ] Path-scoped rules exist in `.claude/rules/` for each major code area (`src/domain/`, `src/db/`, `tests/e2e/`) with valid YAML frontmatter and `paths:` keys
   - [ ] PostToolUse hook runs `tsc --noEmit` after Edit/Write (in `.claude/settings.json`)
   - [ ] Notification hook is configured for user attention prompts
   - [ ] Pre-commit hook blocks broken commits (tsc + vitest)
   - [ ] No stale or redundant content duplicated between CLAUDE.md and path-scoped rules
   - [ ] Automated workflow has `--max-budget-usd` cap to prevent runaway costs
   - [ ] Automation rules file (`.claude/rules/automation.md`) covers self-hosted runner model, nvm, GH_TOKEN, budget caps
   - [ ] CLAUDE.md `schema version N` matches the highest `db.version(N)` in `src/db/db.ts`
   - [ ] All workflow `run:` steps using `gh`/`git` have `working-directory:` set
   - [ ] Structural tests in `claudeRules.test.ts` back the audit items above (so drift is caught in CI, not just manually)
   If any item is missing or broken, fix it in this step and include the fix in the commit. This audit exists because best practices drift silently — PR #33 applied them once, but without a recurring check they erode over time.
7. **Improve this skill** — if any lessons from this session apply to the implement-issue *workflow itself* (a step that was skipped, a pattern that should be enforced, an instruction that was unclear), apply them as targeted edits to this SKILL.md. In interactive sessions, use `/skill-creator` for the full eval loop when making substantial structural changes. In automated runs, make direct edits. The goal: the skill gets slightly better after every session.
8. **Commit and push retrospection changes** — the edits above produce real file changes (MEMORY.md, CLAUDE.md, SKILL.md). Stage and commit them so they land on `main` when the PR merges. Use a `docs:` or `chore:` prefix:
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
- `statSync().mode` is safe for git-tracked scripts (git preserves executable bit) but NOT for `.git/hooks/` or generated files
- New public decks must be added to ALL migration seedMaps — a structural test enforces this
