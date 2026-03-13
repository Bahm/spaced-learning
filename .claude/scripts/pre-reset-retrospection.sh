#!/usr/bin/env bash
# pre-reset-retrospection.sh — Run quality-focused retrospection before weekly quota reset.
#
# Designed for cron (every 15 minutes). Self-gates:
#   1. Only runs within `windowHours` before the configured quota reset time
#   2. Only runs if the runner is idle (no active claude processes, no lock file)
#
# Usage:
#   ./pre-reset-retrospection.sh              # normal (cron) mode
#   ./pre-reset-retrospection.sh --dry-run    # show what would happen, don't execute
#   ./pre-reset-retrospection.sh --force      # skip time-window check, run immediately
#
# Configuration: retrospection-config.json (same directory)
#   resetDay      — day of week when quota resets (e.g. "Monday")
#   resetHourUTC  — UTC hour (0-23) of reset
#   windowHours   — hours before reset to start retrospection
#   maxBudgetUsd  — spending cap per session
#   tasks         — prioritized list of improvement tasks

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$SCRIPT_DIR/retrospection-config.json"
LOCK_FILE="/tmp/pre-reset-retrospection.lock"
LOG_PREFIX="[retrospection]"

# --- Flags ---
DRY_RUN=false
FORCE=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --force)   FORCE=true ;;
    *)         echo "$LOG_PREFIX Unknown flag: $arg" >&2; exit 1 ;;
  esac
done

log() { echo "$LOG_PREFIX $*"; }

# --- Load config ---
if [ ! -f "$CONFIG_FILE" ]; then
  log "ERROR: Config file not found: $CONFIG_FILE"
  exit 1
fi

RESET_DAY=$(jq -r '.resetDay' "$CONFIG_FILE")
RESET_HOUR_UTC=$(jq -r '.resetHourUTC' "$CONFIG_FILE")
WINDOW_HOURS=$(jq -r '.windowHours' "$CONFIG_FILE")
MAX_BUDGET_USD=$(jq -r '.maxBudgetUsd' "$CONFIG_FILE")
TASKS=$(jq -r '.tasks | join("\n- ")' "$CONFIG_FILE")

# --- Time window check ---
# Calculate next reset time and check if we're within the window
check_time_window() {
  local now_epoch reset_epoch window_start_epoch

  now_epoch=$(date +%s)

  # Find the next occurrence of resetDay at resetHourUTC
  # Start from today, look forward up to 7 days
  for days_ahead in $(seq 0 7); do
    local candidate
    candidate=$(date -u -d "+${days_ahead} days" +%A)
    if [ "$candidate" = "$RESET_DAY" ]; then
      reset_epoch=$(date -u -d "+${days_ahead} days ${RESET_HOUR_UTC}:00:00" +%s)
      # If the reset time is in the past today, skip to next week
      if [ "$reset_epoch" -le "$now_epoch" ] && [ "$days_ahead" -eq 0 ]; then
        continue
      fi
      break
    fi
  done

  if [ -z "${reset_epoch:-}" ]; then
    log "ERROR: Could not calculate next reset time for $RESET_DAY"
    return 1
  fi

  window_start_epoch=$(( reset_epoch - WINDOW_HOURS * 3600 ))

  if [ "$now_epoch" -ge "$window_start_epoch" ] && [ "$now_epoch" -lt "$reset_epoch" ]; then
    local hours_left=$(( (reset_epoch - now_epoch) / 3600 ))
    log "Within window: ~${hours_left}h until reset on $RESET_DAY at ${RESET_HOUR_UTC}:00 UTC"
    return 0
  else
    local next_window
    next_window=$(date -d "@$window_start_epoch" '+%Y-%m-%d %H:%M %Z')
    log "Outside window. Next window opens: $next_window"
    return 1
  fi
}

# --- Idle check ---
check_idle() {
  # Check for stale lock file (older than 2 hours = probably crashed)
  if [ -f "$LOCK_FILE" ]; then
    local lock_age
    lock_age=$(( $(date +%s) - $(stat -c %Y "$LOCK_FILE") ))
    if [ "$lock_age" -gt 7200 ]; then
      log "Removing stale lock file (age: ${lock_age}s)"
      rm -f "$LOCK_FILE"
    else
      log "Lock file exists (age: ${lock_age}s). Another session is running."
      return 1
    fi
  fi

  # Check for active claude CLI processes
  if pgrep -f 'claude' > /dev/null 2>&1; then
    log "Active claude process detected. Runner is busy."
    return 1
  fi

  log "Runner is idle."
  return 0
}

# --- Main ---
log "Starting (dry_run=$DRY_RUN, force=$FORCE)"

# Time window gate (skip if --force)
if [ "$FORCE" = false ]; then
  if ! check_time_window; then
    log "Not in time window. Exiting."
    exit 0
  fi
fi

# Idle gate
if ! check_idle; then
  log "Runner is busy. Exiting."
  exit 0
fi

if [ "$DRY_RUN" = true ]; then
  log "DRY RUN — would run retrospection with:"
  log "  Budget: \$${MAX_BUDGET_USD}"
  log "  Tasks:"
  log "  - $TASKS"
  log "  Project: $PROJECT_DIR"
  exit 0
fi

# --- Acquire lock ---
trap 'rm -f "$LOCK_FILE"' EXIT
echo $$ > "$LOCK_FILE"

# --- Set up git branch ---
cd "$PROJECT_DIR"

# Source nvm
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/dev/null
source "${NVM_DIR}/nvm.sh"

BRANCH_NAME="chore/pre-reset-retrospection-$(date +%Y%m%d-%H%M)"

git checkout main
git pull
git checkout -b "$BRANCH_NAME"

# --- Run Claude ---
log "Running claude with --max-budget-usd $MAX_BUDGET_USD"

PROMPT="You are running in a pre-quota-reset retrospection window. Focus on quality improvements.

Tasks (in priority order):
- $TASKS

Rules:
- Work in $PROJECT_DIR
- Run tests after changes: npx vitest run tests/unit && npx tsc --noEmit
- Only commit changes that pass all checks
- Keep changes focused and reviewable
- Do NOT create new features — focus on quality, tests, and cleanup"

claude --dangerously-skip-permissions \
  --max-budget-usd "$MAX_BUDGET_USD" \
  -p "$PROMPT" || true

# --- Check for changes and create PR ---
if git diff --quiet && git diff --cached --quiet; then
  log "No changes made. Cleaning up branch."
  git checkout main
  git branch -D "$BRANCH_NAME"
  exit 0
fi

log "Changes detected. Committing and creating PR."

git add -A
git commit -m "$(cat <<'EOF'
chore: pre-reset retrospection improvements

Automated quality improvements run during the pre-quota-reset window.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"

git push -u origin "$BRANCH_NAME"

# Unset GH_TOKEN to use personal gh auth (avoids github-actions[bot] token issues)
unset GH_TOKEN 2>/dev/null || true

gh pr create \
  --title "chore: pre-reset retrospection $(date +%Y-%m-%d)" \
  --body "$(cat <<'EOF'
## Summary
- Automated quality improvements from pre-quota-reset retrospection window
- Tasks: fix tests, remove dead code, improve coverage, refactor

## Test plan
- [ ] Unit tests pass
- [ ] Type-check clean
- [ ] Changes are focused and reviewable

🤖 Generated with [Claude Code](https://claude.com/claude-code) (pre-reset retrospection)
EOF
)"

log "Done. PR created on branch $BRANCH_NAME."
