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

## Stopping the runner

```bash
cd ~/actions-runner
sudo ./svc.sh stop
```
