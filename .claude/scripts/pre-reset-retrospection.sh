#!/usr/bin/env bash
# pre-reset-retrospection.sh — Run retrospection/self-improvement before weekly quota reset.
#
# Designed to be run by cron every 15 minutes. The script checks whether we're
# within the configured time window before the weekly quota reset. If so, and
# the runner is idle, it launches Claude Code for quality-focused retrospection
# and creates a PR with any improvements.
#
# Usage: ./pre-reset-retrospection.sh [--dry-run] [--force]
#   --dry-run   Print what would happen without running Claude
#   --force     Skip the time-window check (still checks idle)
#
# Config: .claude/scripts/retrospection-config.json
#   resetDay      — day of week quota resets (e.g. "Monday")
#   resetHourUTC  — hour (0-23) quota resets in UTC
#   windowHours   — hours before reset to start retrospection
#   maxBudgetUsd  — --max-budget-usd cap for the Claude session
#   tasks         — list of retrospection task descriptions
#
# Cron example (every 15 min):
#   */15 * * * * cd /home/bahm/Projects/spaced-learning && .claude/scripts/pre-reset-retrospection.sh >> /tmp/pre-reset-retrospection.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/retrospection-config.json"
LOCK_FILE="/tmp/pre-reset-retrospection.lock"

# Parse flags
DRY_RUN=false
FORCE=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --force)   FORCE=true ;;
  esac
done

# --- Config ---

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: Config file not found: $CONFIG_FILE"
  exit 1
fi

RESET_DAY=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['resetDay'])")
RESET_HOUR_UTC=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['resetHourUTC'])")
WINDOW_HOURS=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['windowHours'])")
MAX_BUDGET=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE'))['maxBudgetUsd'])")
TASKS=$(python3 -c "
import json
tasks = json.load(open('$CONFIG_FILE'))['tasks']
print('\n'.join(f'- {t}' for t in tasks))
")

# --- Time window check ---

# Calculate next reset time and check if we're in the window
in_retrospection_window() {
  local now_epoch reset_epoch window_start_epoch
  now_epoch=$(date +%s)

  # Find the next occurrence of RESET_DAY at RESET_HOUR_UTC
  # Start from today, check up to 7 days ahead
  for i in $(seq 0 7); do
    local candidate
    candidate=$(date -u -d "+${i} days" +%Y-%m-%d)
    local candidate_day
    candidate_day=$(date -u -d "$candidate" +%A)
    if [ "$candidate_day" = "$RESET_DAY" ]; then
      reset_epoch=$(date -u -d "${candidate} ${RESET_HOUR_UTC}:00:00" +%s)
      # If the reset time is in the past (earlier today), try next week
      if [ "$reset_epoch" -le "$now_epoch" ] && [ "$i" -eq 0 ]; then
        continue
      fi
      break
    fi
  done

  if [ -z "${reset_epoch:-}" ]; then
    echo "Could not determine next reset time for $RESET_DAY"
    return 1
  fi

  window_start_epoch=$((reset_epoch - WINDOW_HOURS * 3600))
  local hours_until_reset=$(( (reset_epoch - now_epoch) / 3600 ))

  if [ "$now_epoch" -ge "$window_start_epoch" ] && [ "$now_epoch" -lt "$reset_epoch" ]; then
    echo "In retrospection window: ${hours_until_reset}h until reset (window: ${WINDOW_HOURS}h before)"
    return 0
  else
    echo "Outside retrospection window: ${hours_until_reset}h until reset (window starts ${WINDOW_HOURS}h before)"
    return 1
  fi
}

# --- Idle check ---

# Check if the runner is idle (no other Claude or implement-issue process running)
is_runner_idle() {
  # Check for lock file from a previous run
  if [ -f "$LOCK_FILE" ]; then
    local lock_pid
    lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
    if [ -n "$lock_pid" ] && kill -0 "$lock_pid" 2>/dev/null; then
      echo "Runner is busy: previous retrospection still running (PID $lock_pid)"
      return 1
    else
      # Stale lock file — clean up
      rm -f "$LOCK_FILE"
    fi
  fi

  # Check for any running Claude CLI processes (implement-issue or other)
  if pgrep -f "claude.*--dangerously-skip-permissions" >/dev/null 2>&1; then
    echo "Runner is busy: another Claude CLI session is active"
    return 1
  fi

  echo "Runner is idle"
  return 0
}

# --- Main ---

echo "=== Pre-reset retrospection check: $(date) ==="

# Check time window (skip with --force)
if [ "$FORCE" = false ]; then
  if ! in_retrospection_window; then
    echo "Skipping: not in retrospection window"
    exit 0
  fi
else
  echo "Force mode: skipping time-window check"
fi

# Check if runner is idle
if ! is_runner_idle; then
  echo "Skipping: runner is not idle"
  exit 0
fi

# Create lock file
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

BRANCH_NAME="chore/pre-reset-retrospection-$(date +%Y%m%d-%H%M)"

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "=== DRY RUN ==="
  echo "Would create branch: $BRANCH_NAME"
  echo "Would run Claude with --max-budget-usd $MAX_BUDGET"
  echo "Tasks:"
  echo "$TASKS"
  echo "==============="
  exit 0
fi

# Source nvm
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/dev/null
source "${NVM_DIR}/nvm.sh"

cd "$PROJECT_DIR"

# Ensure we're on a clean main
git checkout main
git pull

# Create retrospection branch
git checkout -b "$BRANCH_NAME"

echo "Starting retrospection with --max-budget-usd $MAX_BUDGET..."

# Run Claude for retrospection
# Use quota-retry-wrapper if available, otherwise direct
PROMPT="You are running a pre-reset retrospection session on the spaced-learning project.
Your weekly token quota resets soon. Use the remaining budget for quality improvements.

Focus on these tasks (in priority order):
$TASKS

Rules:
- Run npx tsc --noEmit and npx vitest run tests/unit before and after changes
- Only commit changes that pass type-check and tests
- Keep changes focused and atomic — one concern per commit
- Do NOT add new features — this is maintenance and quality only
- When done, commit all changes with descriptive messages

After making improvements, create a PR with:
  gh pr create --title 'chore: pre-reset retrospection $(date +%Y-%m-%d)' --body 'Automated quality improvements before weekly quota reset.'
"

unset GH_TOKEN
claude --dangerously-skip-permissions \
  --max-budget-usd "$MAX_BUDGET" \
  -p "$PROMPT" || {
    EXIT_CODE=$?
    echo "Claude exited with code $EXIT_CODE"
    # If there are uncommitted changes, commit them before giving up
    if [ -n "$(git status --porcelain)" ]; then
      echo "Committing remaining changes before exit..."
      git add -A
      git commit -m "chore: partial retrospection (Claude exited with code $EXIT_CODE)"
      git push -u origin "$BRANCH_NAME"
      gh pr create \
        --title "chore: pre-reset retrospection $(date +%Y-%m-%d) (partial)" \
        --body "Automated quality improvements before weekly quota reset. Claude exited early (code $EXIT_CODE)."
    fi
    exit "$EXIT_CODE"
  }

# Verify a PR was created
PR_COUNT=$(gh pr list --state open --head "$BRANCH_NAME" --json number --jq 'length')
if [ "$PR_COUNT" -eq 0 ]; then
  echo "Claude finished but no PR was created. Checking for changes..."
  if [ -n "$(git diff main --stat)" ]; then
    echo "Changes exist but no PR — creating one now."
    git push -u origin "$BRANCH_NAME"
    gh pr create \
      --title "chore: pre-reset retrospection $(date +%Y-%m-%d)" \
      --body "Automated quality improvements before weekly quota reset."
  else
    echo "No changes were made. Nothing to do."
    git checkout main
    git branch -d "$BRANCH_NAME"
  fi
else
  echo "PR created successfully."
fi

echo "=== Retrospection complete: $(date) ==="
