---
paths:
  - ".claude/scripts/**"
  - ".github/**"
---

# Automation Infrastructure

## Self-hosted runner model

This project uses `--dangerously-skip-permissions` for automated CI runs on a self-hosted runner. This is intentional — the runner IS the local dev machine, and there is no human to approve prompts. The external best-practice recommendation to use wildcard permissions (`Bash(npm run *)`) does not apply to fully automated headless runs.

Security is enforced at other layers:
- GitHub Actions permission check (only collaborators with `write` access can trigger)
- Pre-commit hook (tsc + vitest gate commits)
- CI pipeline (tsc + vitest + Playwright + build verify PRs)
- `--max-budget-usd` caps spending per automated run

## nvm requirement

Every `run:` step in workflows and every bash command in scripts MUST source nvm:
```bash
export NVM_DIR="${HOME}/.nvm"
source "${NVM_DIR}/nvm.sh"
```
Node.js is NOT on the system PATH.

## Budget cap

All automated Claude CLI invocations MUST include `--max-budget-usd` to prevent runaway token costs. Set via `MAX_BUDGET_USD` env var in the workflow.

## GH_TOKEN gotcha

`unset GH_TOKEN` before `gh pr create` in self-hosted runner context. The Actions-provided `GH_TOKEN` is a restricted `github-actions[bot]` token that lacks PR creation permissions. Unsetting it falls back to the user's personal `gh auth` credentials.

## working-directory on every step

GitHub Actions steps don't inherit `working-directory` from the job level. Every step that needs repo context must set `working-directory` explicitly or use `--repo` with `gh` commands.
