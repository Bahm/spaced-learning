#!/bin/bash
# quota-retrospection.sh
#
# Runs a Claude Code retrospection/self-improvement session when the weekly
# token quota is about to reset. Designed to be called by a cron job.
#
# Prerequisites:
#   - Claude Code CLI installed and authenticated (`claude` in PATH after nvm)
#   - GitHub CLI (`gh`) authenticated
#   - Self-hosted runner environment (local machine)
#
# Usage:
#   .claude/scripts/quota-retrospection.sh          # normal run
#   .claude/scripts/quota-retrospection.sh --force   # skip idle check and state check
#   .claude/scripts/quota-retrospection.sh --dry-run # show what would happen without running
#
# Cron example (run every 15 minutes, script self-gates on time window):
#   */15 * * * * /home/bahm/Projects/spaced-learning/.claude/scripts/quota-retrospection.sh >> /tmp/retrospection.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/retrospection-config.json"

# --- Parse flags ---
FORCE=false
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --dry-run) DRY_RUN=true ;;
  esac
done

# --- Source nvm ---
export NVM_DIR="${HOME}/.nvm"
if [ -s "${NVM_DIR}/nvm.sh" ]; then
  source "${NVM_DIR}/nvm.sh"
else
  echo "ERROR: nvm not found at ${NVM_DIR}/nvm.sh"
  exit 1
fi

# --- Load config ---
if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: Config file not found: ${CONFIG_FILE}"
  exit 1
fi

LEAD_HOURS=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).retrospection_lead_hours)")
MAX_BUDGET=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).max_budget_usd)")
GITHUB_REPO=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).github_repo)")
REPO_PATH=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).repo_path)")
STATE_FILE=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).state_file)")
RETRO_PROMPT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).retrospection_prompt)")

# --- Determine quota reset time ---
# The quota resets weekly. We parse the cron expression to find the next reset.
# For simplicity, we extract day-of-week (0=Sun..6=Sat) and hour from the cron.
RESET_CRON=$(node -e "console.log(JSON.parse(require('fs').readFileSync('${CONFIG_FILE}','utf-8')).quota_reset_cron)")
RESET_DOW=$(echo "$RESET_CRON" | awk '{print $5}')  # day of week
RESET_HOUR=$(echo "$RESET_CRON" | awk '{print $2}')  # hour

CURRENT_DOW=$(date +%u)  # 1=Mon..7=Sun (ISO)
CURRENT_HOUR=$(date +%H)

# Convert cron DOW (0=Sun, 5=Fri) to ISO DOW (1=Mon..7=Sun)
if [ "$RESET_DOW" -eq 0 ]; then
  RESET_DOW_ISO=7
else
  RESET_DOW_ISO=$RESET_DOW
fi

# Calculate hours until reset
HOURS_UNTIL_RESET=$(( (RESET_DOW_ISO - CURRENT_DOW) * 24 + (RESET_HOUR - CURRENT_HOUR) ))
if [ "$HOURS_UNTIL_RESET" -lt 0 ]; then
  HOURS_UNTIL_RESET=$((HOURS_UNTIL_RESET + 168))  # wrap to next week
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') — Quota retrospection check"
echo "  Hours until reset: ${HOURS_UNTIL_RESET}"
echo "  Lead window: ${LEAD_HOURS}h"
echo "  Max budget: \$${MAX_BUDGET}"

# --- Check if we're in the retrospection window ---
if [ "$FORCE" = false ] && [ "$HOURS_UNTIL_RESET" -gt "$LEAD_HOURS" ]; then
  echo "  Not in retrospection window (${HOURS_UNTIL_RESET}h > ${LEAD_HOURS}h). Skipping."
  exit 0
fi

echo "  ✓ In retrospection window"

# --- Check state file for last run ---
if [ "$FORCE" = false ] && [ -f "$STATE_FILE" ]; then
  LAST_RUN_EPOCH=$(node -e "
    const s = JSON.parse(require('fs').readFileSync('${STATE_FILE}','utf-8'));
    console.log(s.last_run_epoch || 0)
  ")
  CURRENT_EPOCH=$(date +%s)
  # Don't run again if last run was less than LEAD_HOURS ago
  COOLDOWN_SECONDS=$((LEAD_HOURS * 3600))
  ELAPSED=$((CURRENT_EPOCH - LAST_RUN_EPOCH))
  if [ "$ELAPSED" -lt "$COOLDOWN_SECONDS" ]; then
    echo "  Already ran ${ELAPSED}s ago (cooldown: ${COOLDOWN_SECONDS}s). Skipping."
    exit 0
  fi
fi

echo "  ✓ No recent run in state file"

# --- Check if self-hosted runner is idle ---
# Look for in-progress workflow runs on the repo
if [ "$FORCE" = false ]; then
  ACTIVE_RUNS=$(gh run list --repo "$GITHUB_REPO" --status in_progress --json databaseId --jq 'length' 2>/dev/null || echo "0")
  if [ "$ACTIVE_RUNS" -gt 0 ]; then
    echo "  Runner busy (${ACTIVE_RUNS} active workflow runs). Skipping."
    exit 0
  fi
  echo "  ✓ Runner is idle"
fi

# --- Dry run check ---
if [ "$DRY_RUN" = true ]; then
  echo "  [DRY RUN] Would launch retrospection with budget \$${MAX_BUDGET}"
  echo "  Prompt: ${RETRO_PROMPT:0:100}..."
  exit 0
fi

# --- Update state file ---
mkdir -p "$(dirname "$STATE_FILE")"
node -e "
  const fs = require('fs');
  const state = { last_run_epoch: Math.floor(Date.now()/1000), last_run_iso: new Date().toISOString() };
  fs.writeFileSync('${STATE_FILE}', JSON.stringify(state, null, 2));
"
echo "  ✓ State file updated"

# --- Run Claude Code retrospection ---
echo "  Launching Claude Code retrospection..."
cd "$REPO_PATH"

# Ensure we're on main with latest
git checkout main
git pull

# Create a retrospection branch
BRANCH_NAME="chore/retrospection-$(date +%Y%m%d-%H%M)"
git checkout -b "$BRANCH_NAME"

# Unset GH_TOKEN to use personal gh auth (avoid restricted Actions token)
unset GH_TOKEN 2>/dev/null || true

claude --dangerously-skip-permissions -p "${RETRO_PROMPT}" \
  --max-budget-usd "$MAX_BUDGET" \
  --allowedTools "Bash,Read,Edit,Write,Glob,Grep" \
  2>&1 | tee /tmp/retrospection-output.log

CLAUDE_EXIT=$?

echo "  Claude exited with code: ${CLAUDE_EXIT}"

# --- Verify a PR was created ---
PR_EXISTS=$(gh pr list --repo "$GITHUB_REPO" --head "$BRANCH_NAME" --state open --json number --jq 'length' 2>/dev/null || echo "0")

if [ "$PR_EXISTS" -eq 0 ]; then
  echo "  ⚠ No PR was created. Check /tmp/retrospection-output.log for details."
  # Clean up the branch if empty
  git checkout main
  git branch -D "$BRANCH_NAME" 2>/dev/null || true
else
  echo "  ✓ PR created successfully"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') — Retrospection complete"
