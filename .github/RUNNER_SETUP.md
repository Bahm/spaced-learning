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

### 5. Install the Superpowers plugin

The [Superpowers framework](https://github.com/obra/superpowers) provides structured development skills (brainstorming, planning, TDD, review) that complement the project's `/implement-issue` workflow.

```bash
cd /home/bahm/Projects/spaced-learning
.claude/scripts/setup-superpowers.sh
```

The script is idempotent — safe to run multiple times. The workflow also runs it automatically before each issue implementation.

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

## Quota auto-retry

The workflow uses `.claude/scripts/quota-retry-wrapper.sh` to automatically handle token quota exhaustion. When the Claude CLI exits due to a quota limit:

1. The wrapper detects the quota error in the output
2. Parses the reset time from the error message (ISO 8601, datetime, or natural language)
3. Posts a status comment on the GitHub issue
4. Sleeps until the quota resets (+ 60s buffer)
5. Retries the full command

Configuration via environment variables in the workflow:
- `MAX_RETRIES` — number of quota retries (default: 2)
- `DEFAULT_WAIT_SECS` — fallback wait if reset time can't be parsed (default: 3600s = 1 hour)

The workflow timeout is set to 360 minutes (6 hours) to accommodate quota waits. GitHub Actions enforces a hard limit of 6 hours per job.

## Pre-reset retrospection

Before the weekly quota resets, idle quota can be used for automated quality improvements (dead code removal, test coverage, refactoring). The script `.claude/scripts/pre-reset-retrospection.sh` self-gates on both a time window and runner idleness.

### Configuration

Edit `.claude/scripts/retrospection-config.json`:

| Field | Description | Default |
|---|---|---|
| `resetDay` | Day of week quota resets | `"Monday"` |
| `resetHourUTC` | UTC hour of reset (0-23) | `0` |
| `windowHours` | Hours before reset to start | `2` |
| `maxBudgetUsd` | Spending cap per session | `5` |
| `tasks` | Prioritized task list | See file |

### Cron setup

Run every 15 minutes — the script self-gates so it only acts within the window:

```bash
crontab -e
# Add:
*/15 * * * * cd /home/bahm/Projects/spaced-learning && .claude/scripts/pre-reset-retrospection.sh >> /tmp/pre-reset-retrospection.log 2>&1
```

### Manual usage

```bash
npm run retrospection:dry    # preview what would happen
npm run retrospection:force  # skip time-window check, run now
npm run retrospection        # normal mode (respects time window)
```

## Stopping the runner

```bash
cd ~/actions-runner
sudo ./svc.sh stop
```
