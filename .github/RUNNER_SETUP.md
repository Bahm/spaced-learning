# Self-hosted Runner Setup

This project uses a self-hosted GitHub Actions runner on the local development machine to run `claude --dangerously-skip-permissions` in response to GitHub Issues labeled `auto-implement`.

## Why self-hosted?

The `claude` CLI must run locally: it reads/writes project files, runs the dev server, executes Playwright E2E tests against a real browser, and commits/pushes via the local git identity. None of this works in an ephemeral GitHub-hosted runner.

## One-time setup

### 1. Register the runner

1. Go to **Settings → Actions → Runners → New self-hosted runner** in the GitHub repo
2. Select Linux / x64
3. Follow the download and configuration steps shown (creates a `actions-runner/` directory)
4. When prompted for runner name/labels, the default is fine

### 2. Install as a system service

```bash
cd ~/actions-runner
sudo ./svc.sh install
sudo ./svc.sh start
```

Verify it's running:
```bash
sudo ./svc.sh status
```

The runner will now start automatically on boot and process jobs in the background.

### 3. Add `ANTHROPIC_API_KEY` secret

Go to **Settings → Secrets and variables → Actions → New repository secret**:

- Name: `ANTHROPIC_API_KEY`
- Value: your Anthropic API key

The workflow passes this to `claude` so it can call the model.

### 4. Create the `auto-implement` label

```bash
gh label create auto-implement --color 0075ca --description "Trigger Claude Code to implement this issue automatically"
```

## Using it

1. Create a GitHub Issue describing the feature or fix
2. Add the `auto-implement` label to the issue
3. The workflow triggers immediately; Claude Code will:
   - Read the issue
   - Create a branch from `main`
   - Write failing tests
   - Implement the feature
   - Verify all tests pass
   - Commit and open a PR that auto-closes the issue

A comment is posted to the issue when Claude starts. If the run fails, a failure comment is posted with a link to the workflow logs.

## Security note

Any repository collaborator with permission to add labels can trigger an automated run. Restrict who can add labels via GitHub's repository role settings if needed. The runner process runs as your local user account, so it has full access to your machine.

## Quota-aware retrospection (cron job)

The project includes a script that runs Claude Code for self-improvement before the weekly token quota resets. When most of the quota would otherwise go unused, this reclaims it for code quality work.

### How it works

1. A cron job runs `.claude/scripts/quota-retrospection.sh` every 15 minutes
2. The script checks if we're within the configured lead time before quota reset (default: 2 hours)
3. If the runner is idle (no active GitHub Actions workflow runs), it launches a Claude Code session
4. The session has a `--max-budget-usd` cap to avoid over-spending
5. A state file prevents duplicate runs in the same reset cycle

### Setup

Edit the config to match your quota reset schedule:

```bash
# .claude/scripts/retrospection-config.json
# quota_reset_cron: cron expression for when your quota resets (default: Friday midnight)
# retrospection_lead_hours: how many hours before reset to start (default: 2)
# max_budget_usd: spending cap per retrospection session (default: 5.00)
```

Install the cron job:

```bash
# Run every 15 minutes — the script self-gates on the time window
(crontab -l 2>/dev/null; echo "*/15 * * * * /home/bahm/Projects/spaced-learning/.claude/scripts/quota-retrospection.sh >> /tmp/retrospection.log 2>&1") | crontab -
```

Verify:

```bash
crontab -l | grep retrospection
```

### Manual usage

```bash
npm run retrospection:dry    # Preview what would happen
npm run retrospection:force  # Run immediately, skip time/idle checks
npm run retrospection        # Normal run (respects time window)
```

### Limitations

- **No direct quota API**: The Claude Code CLI doesn't expose subscription quota usage. The script uses a time-based heuristic (run N hours before reset) rather than checking actual remaining percentage.
- **Budget cap as proxy**: `--max-budget-usd` caps spending per session but doesn't map 1:1 to subscription tokens.
- **Requires `gh` auth**: The script uses `gh` to check runner status and create PRs. Ensure `gh auth login` is configured.

## Stopping the runner

```bash
cd ~/actions-runner
sudo ./svc.sh stop
```
