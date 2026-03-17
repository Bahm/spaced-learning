---
paths:
  - .claude/**
  - .github/**
---

# gstack Integration

[gstack](https://github.com/garrytan/gstack) is a skill pack for Claude Code by Garry Tan. It provides role-based specialist skills that complement the project's existing automation.

## How gstack fits with existing automation

The `/implement-issue` skill remains the primary automated workflow. gstack skills add depth in specific areas:

| gstack skill | Role | When to use | Relation to existing workflow |
|---|---|---|---|
| `/review` | Paranoid staff engineer | Deep code review beyond CI | Complements implement-issue step 9 retrospection |
| `/qa` | QA + fix engineer | Find and fix bugs with browser | Use after implementation for thorough QA |
| `/qa-only` | QA reporter | Bug reporting without fixes | Use for audit/assessment without changes |
| `/qa-design-review` | Designer + frontend eng | Visual/UX audit with fixes | Use for UI-focused changes |
| `/browse` | QA engineer | Headless browser testing | Supplements Playwright E2E tests |
| `/retro` | Engineering manager | Retrospective with feedback | Complements pre-reset retrospection |

Skills less relevant to this solo project (but available): `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/ship`, `/setup-browser-cookies`, `/document-release`.

## Automated pipeline integration

For fully automated runs (GitHub Actions `auto-implement` label):
- `/implement-issue` drives the full TDD workflow end-to-end
- gstack's `/review` can be used as an additional review pass in step 9
- gstack's `/qa` is NOT used in automated runs (would conflict with implement-issue's own test flow)

For interactive sessions:
- Use `/review` for deep code review after completing a feature
- Use `/qa` to test the app in a headless browser and fix issues
- Use `/retro` for structured retrospectives

## Coexistence with Superpowers

gstack and Superpowers serve different purposes and coexist:
- **Superpowers** — thinking frameworks: brainstorming, planning, TDD methodology
- **gstack** — execution specialists: code review, QA, browser automation, retrospectives

## Setup

Run `.claude/scripts/setup-gstack.sh` once on the self-hosted runner. The script is idempotent. The workflow also runs it automatically before each issue implementation.
