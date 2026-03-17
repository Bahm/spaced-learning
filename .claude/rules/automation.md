---
description: Rules for the fully automated GitHub Actions → Claude Code pipeline
paths:
  - .github/**
  - .claude/scripts/**
  - .claude/skills/**
---

# Automation rules

This project uses a **self-hosted GitHub Actions runner** that triggers Claude Code
CLI headless via `--dangerously-skip-permissions` when an issue is labeled
`auto-implement`. Humans interact only through GitHub Issues and PR reviews.

## Security model

- `--dangerously-skip-permissions` is correct here — no human is at the terminal.
  The external best-practice recommendation to use `/permissions` with wildcards
  applies to interactive sessions, not headless CI.
- The runner executes on a trusted single-user machine; the workflow gates on
  actor write-permission before proceeding.

## nvm

Node.js is installed via nvm, **not** the system PATH. Every `run:` step and
every bash command inside Claude must source nvm inline:

```bash
export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"
```

## GH_TOKEN

The GitHub Actions `${{ github.token }}` is a restricted `github-actions[bot]`
token. It **cannot** create PRs with full permissions. Always `unset GH_TOKEN`
before running `gh pr create` so `gh` falls back to the user's personal
`gh auth` credentials stored on the runner.

## Budget cap

Every automated Claude invocation **must** include `--max-budget-usd <N>` to
prevent runaway costs. The current cap is set in `implement-from-issue.yml`.
The retrospection script also enforces a cap via `retrospection-config.json`.

## Plugin setup

Before each automated run, the workflow installs:

- **superpowers** — via `.claude/scripts/setup-superpowers.sh` (idempotent)
- **gstack** — via `.claude/scripts/setup-gstack.sh` (idempotent)

Both scripts check if already installed and skip if so.
