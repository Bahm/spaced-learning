# Plan: GitHub Action Resilience with CCS

> Issue: #23 — Github Action for implementing issues: Resilience
>
> **This is a plan document. No functional changes are included.**

## Problem

When the local runner's Anthropic API token hits its quota limit mid-run, the `claude` CLI fails and the entire GitHub Action fails. The issue comment says "❌ error" but gives no actionable detail about _why_, and there is no automatic recovery.

## Proposed Solution: CCS (Claude Code Switch)

[CCS](https://github.com/kaitranntt/ccs) is a universal AI profile manager for Claude Code. Its key feature for this use case is **automatic failover**: when one account's quota is exhausted, CCS transparently switches to another account with remaining capacity.

## Current Architecture

```
GitHub Issue (labeled auto-implement)
  → implement-from-issue.yml
    → self-hosted runner
      → claude --dangerously-skip-permissions -p "/implement-issue #N ..."
        → uses ANTHROPIC_API_KEY from GitHub Secrets
```

Single point of failure: one API key, one provider, no fallback.

## Target Architecture

```
GitHub Issue (labeled auto-implement)
  → implement-from-issue.yml
    → self-hosted runner
      → CCS manages provider selection + automatic failover
        → claude (routed through CCS)
          → Primary: Anthropic API key A
          → Fallback 1: Anthropic API key B (different billing account)
          → Fallback 2: OAuth-based provider (e.g. Claude subscription)
```

## Implementation Steps

### Step 1: Install CCS on the runner machine

```bash
npm install -g @kaitranntt/ccs
ccs doctor  # verify installation
```

Add this to `.github/RUNNER_SETUP.md` as a prerequisite.

### Step 2: Configure CCS profiles

Run `ccs config` to open the dashboard, or edit `~/.ccs/config.yaml` directly. Set up at least two profiles:

| Profile | Provider | Purpose |
|---------|----------|---------|
| `api-primary` | Anthropic API (key A) | Default — used for all runs |
| `api-fallback` | Anthropic API (key B) | Engaged when primary quota is exhausted |
| `oauth-backup` | Claude subscription (OAuth) | Last resort if both API keys are spent |

The automatic failover feature means no code changes are needed — CCS detects quota exhaustion and switches profiles transparently.

### Step 3: Update the workflow to use CCS

Replace the direct `claude` invocation with CCS-managed invocation:

```yaml
# Before
- name: Run implement-issue via Claude Code CLI
  run: |
    export NVM_DIR="${HOME}/.nvm"
    source "${NVM_DIR}/nvm.sh"
    claude --dangerously-skip-permissions -p \
      "/implement-issue #${{ github.event.issue.number }}. ..."
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

# After
- name: Run implement-issue via Claude Code CLI (CCS-managed)
  run: |
    export NVM_DIR="${HOME}/.nvm"
    source "${NVM_DIR}/nvm.sh"
    # CCS handles provider selection and automatic failover.
    # API keys are stored in ~/.ccs/config.yaml on the runner,
    # NOT in GitHub Secrets (CCS manages credentials locally).
    claude --dangerously-skip-permissions -p \
      "/implement-issue #${{ github.event.issue.number }}. ..."
```

**Key change**: Remove `ANTHROPIC_API_KEY` from the workflow env block. CCS manages credentials locally on the runner machine via `~/.ccs/config.yaml`, so secrets no longer need to be passed through GitHub Actions.

### Step 4: Add health check step

Add a pre-flight check to the workflow that verifies CCS is healthy and at least one profile has available quota:

```yaml
- name: Verify CCS health
  run: |
    export NVM_DIR="${HOME}/.nvm"
    source "${NVM_DIR}/nvm.sh"
    ccs doctor
    ccs cliproxy doctor
```

If the health check fails, the workflow fails fast with a clear error instead of starting a long run that will fail mid-implementation.

### Step 5: Improve failure comments

Enhance the failure comment to include which provider was in use and whether failover was attempted. This can be done by capturing CCS logs:

```yaml
- name: Comment on issue (failure)
  if: failure()
  uses: actions/github-script@f28e40c7f34bde8b3046d885e986cb6290c5673b # v7
  with:
    script: |
      const body = [
        '❌ **Claude Code** encountered an error.',
        '',
        `Check the [workflow run](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}) for details.`,
        '',
        'If this was a quota issue, CCS should have attempted automatic failover.',
        'Run `ccs cliproxy doctor` on the runner to check provider status.'
      ].join('\n');
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body
      })
```

### Step 6: Update RUNNER_SETUP.md

Document CCS as a runner prerequisite:
- Installation command
- How to add/edit profiles
- How to verify quota status
- How failover works

## Rollout Plan

1. **Phase 1** (low risk): Install CCS on the runner, configure primary profile only (mirrors current single-key behavior). Verify existing workflow still works unchanged.
2. **Phase 2**: Add a second API key profile. Test failover by temporarily invalidating the primary key and triggering an auto-implement issue.
3. **Phase 3**: Add the health check step and improved failure comments to the workflow.
4. **Phase 4**: Add OAuth backup profile for maximum resilience.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| CCS adds a dependency that could itself fail | Health check step fails fast; can revert to direct `claude` invocation by restoring `ANTHROPIC_API_KEY` env var |
| CCS config contains secrets on disk | Runner already stores git credentials and has full machine access (documented security model) |
| CCS version updates could break the workflow | Pin CCS version in installation: `npm install -g @kaitranntt/ccs@<version>` |
| Failover to a weaker model could produce lower-quality PRs | Configure CCS profiles to only use Claude Opus 4.6 across all providers |

## Out of Scope

- Multi-runner setups (we use a single self-hosted runner)
- Provider-specific model selection (all profiles should target the same model)
- Cost optimization across providers (goal is resilience, not cost savings)
