---
paths:
  - .claude/**
  - .github/**
---

# Superpowers Framework Integration

The Superpowers plugin (obra/superpowers) is installed globally on the self-hosted runner. It provides structured development skills that complement the project's existing automation.

## How superpowers fits with existing automation

The `/implement-issue` skill remains the primary automated workflow for issue-driven development. Superpowers skills are available as complementary tools:

| Superpowers skill | When to use | Relation to existing workflow |
|---|---|---|
| `/superpowers:brainstorming` | Complex features needing design exploration | Use before `/implement-issue` for ambiguous issues |
| `/superpowers:spec` | Writing detailed specs from brainstorming output | Feeds into implement-issue step 1 (read the spec) |
| `/superpowers:plan` | Breaking large specs into bite-sized tasks | Complements implement-issue step 5 (implement) |
| `/superpowers:tdd` | Interactive TDD with strict RED-GREEN-REFACTOR gates | Implement-issue step 4-5 already enforce TDD |
| `/superpowers:subagent` | Delegating parallel subtasks | Use for large changes spanning multiple layers |
| `/superpowers:review` | Code review and finalization | Complements implement-issue step 9 (retrospection) |

## Automated pipeline integration

For fully automated runs (GitHub Actions `auto-implement` label):
- The issue body serves as the spec — no interactive brainstorming needed
- `/implement-issue` drives the full TDD workflow end-to-end
- Superpowers TDD skill is NOT used in automated runs (would conflict with implement-issue's own TDD flow)

For interactive sessions:
- Use `/superpowers:brainstorming` for complex features before creating an issue
- Use `/superpowers:plan` to break large issues into sub-issues
- The implement-issue skill handles execution

## Retrospection and continuous improvement

Superpowers' review skill complements the project's existing continuous improvement infrastructure:
- **Pre-reset retrospection** (`.claude/scripts/pre-reset-retrospection.sh`) — automated quality improvements before quota reset
- **Implement-issue step 9** — mandatory retrospection after every PR
- **Superpowers review** — additional structured review during interactive sessions

The three mechanisms work at different scopes:
1. Superpowers review → per-change quality (interactive)
2. Implement-issue step 9 → per-PR lessons and best-practices audit (automated + interactive)
3. Pre-reset retrospection → periodic codebase-wide improvements (automated)

## Setup

Run `.claude/scripts/setup-superpowers.sh` once on the self-hosted runner. The script is idempotent.
