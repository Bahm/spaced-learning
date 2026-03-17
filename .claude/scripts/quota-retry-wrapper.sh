#!/usr/bin/env bash
# quota-retry-wrapper.sh — Wraps claude CLI with automatic retry on quota exhaustion.
#
# When the Claude CLI exits due to a token quota limit, this script:
# 1. Detects the quota error in stdout/stderr
# 2. Parses the reset time from the error message
# 3. Waits until the quota resets (+ 60s buffer)
# 4. Retries the command
#
# Usage: ./quota-retry-wrapper.sh <issue_number> <github_repo> <claude_args...>
#   issue_number  — GitHub issue number (for posting status comments, or "none" to skip)
#   github_repo   — GitHub repo in owner/repo format (or "none" to skip comments)
#   claude_args   — remaining args passed directly to `claude`
#
# Environment:
#   ANTHROPIC_API_KEY — required by claude CLI
#   MAX_RETRIES       — max quota retries (default: 2)
#   DEFAULT_WAIT_SECS — fallback wait if reset time can't be parsed (default: 3600)

set -euo pipefail

ISSUE_NUMBER="${1:?Usage: $0 <issue_number> <github_repo> <claude_args...>}"
GITHUB_REPO="${2:?Usage: $0 <issue_number> <github_repo> <claude_args...>}"
shift 2

MAX_RETRIES="${MAX_RETRIES:-2}"
DEFAULT_WAIT_SECS="${DEFAULT_WAIT_SECS:-3600}"
RETRY_COUNT=0

# Post a comment on the GitHub issue (if issue number and repo are provided)
post_comment() {
  local body="$1"
  if [ "$ISSUE_NUMBER" != "none" ] && [ "$GITHUB_REPO" != "none" ] && command -v gh &>/dev/null; then
    gh issue comment "$ISSUE_NUMBER" --repo "$GITHUB_REPO" --body "$body" 2>/dev/null || true
  fi
}

# Parse reset time from Claude CLI output.
# Matches patterns like:
#   "reset at 2026-03-16T00:00:00Z"
#   "resets on March 16, 2026"
#   "reset at 12:00 AM UTC on March 16"
#   "will reset on 2026-03-16 00:00:00"
parse_reset_time() {
  local output="$1"
  local reset_str

  # Try ISO 8601 timestamp first (most reliable)
  reset_str=$(echo "$output" | grep -oP '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[A-Z]*' | head -1)
  if [ -n "$reset_str" ]; then
    echo "$reset_str"
    return 0
  fi

  # Try "YYYY-MM-DD HH:MM:SS" format
  reset_str=$(echo "$output" | grep -oP '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}' | head -1)
  if [ -n "$reset_str" ]; then
    echo "$reset_str"
    return 0
  fi

  # Try natural language date after "reset at/on"
  reset_str=$(echo "$output" | grep -oiP '(?:reset(?:s)?|renew(?:s)?)\s+(?:at|on)\s+\K[^\n.!]+' | head -1)
  if [ -n "$reset_str" ]; then
    echo "$reset_str"
    return 0
  fi

  # Try "resets <month> <day>, <time> (<timezone>)" format (e.g. "resets Mar 17, 7am (Asia/Saigon)")
  reset_str=$(echo "$output" | grep -oiP '(?:reset(?:s)?)\s+\K[A-Z][a-z]{2}\s+\d{1,2},?\s*\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:\([^)]+\))?' | head -1)
  if [ -n "$reset_str" ]; then
    echo "$reset_str"
    return 0
  fi

  # Try "resets <time> (<timezone>)" format without date (e.g. "resets 11pm (Asia/Saigon)")
  reset_str=$(echo "$output" | grep -oiP '(?:reset(?:s)?)\s+\K\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*(?:\([^)]+\))?' | head -1)
  if [ -n "$reset_str" ]; then
    echo "$reset_str"
    return 0
  fi

  return 1
}

# Detect if the output contains a quota/rate-limit error
is_quota_error() {
  local output="$1"
  echo "$output" | grep -qiP 'quota|rate.limit|token.limit|usage.limit|billing|credit|exceeded.*limit|hit\s+(your\s+)?limit'
}

# Calculate seconds to wait until the parsed reset time
calculate_wait_secs() {
  local reset_str="$1"
  local reset_epoch now_epoch wait_secs

  # Handle "(Asia/Saigon)" timezone suffix — extract timezone from parens
  local tz_override=""
  local paren_re='[(]([^)]+)[)]'
  if [[ "$reset_str" =~ $paren_re ]]; then
    tz_override="${BASH_REMATCH[1]}"
    # Remove the parenthesized timezone from the time string
    reset_str=$(echo "$reset_str" | sed 's/\s*([^)]*)//g' | xargs)
  fi

  # Strip commas — GNU date doesn't accept "Mar 17, 7am" but does accept "Mar 17 7am"
  reset_str=$(echo "$reset_str" | tr -d ',')

  # Check if the string contains a month name (multi-day format like "Mar 17, 7am")
  local has_date=false
  local month_re='^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+'
  if [[ "$reset_str" =~ $month_re ]]; then
    has_date=true
  fi

  if [ -n "$tz_override" ]; then
    if [ "$has_date" = true ]; then
      # Date+time format: "Mar 17, 7am" — pass directly to date -d
      reset_epoch=$(TZ="$tz_override" date -d "$reset_str" +%s 2>/dev/null) || return 1
    else
      # Time-only format: "11pm" — try today first, then tomorrow
      reset_epoch=$(TZ="$tz_override" date -d "today $reset_str" +%s 2>/dev/null) || \
        reset_epoch=$(TZ="$tz_override" date -d "tomorrow $reset_str" +%s 2>/dev/null) || return 1
    fi
  else
    reset_epoch=$(date -d "$reset_str" +%s 2>/dev/null) || return 1
  fi

  now_epoch=$(date +%s)

  if [ "$reset_epoch" -le "$now_epoch" ]; then
    if [ -n "$tz_override" ] && [ "$has_date" = false ]; then
      # Time-only and in the past for today — try tomorrow
      reset_epoch=$(TZ="$tz_override" date -d "tomorrow $reset_str" +%s 2>/dev/null) || return 1
    elif [ -n "$tz_override" ] && [ "$has_date" = true ]; then
      # Date+time in the past — try next year (unlikely but handle gracefully)
      reset_epoch=$(TZ="$tz_override" date -d "$reset_str next year" +%s 2>/dev/null) || return 1
    else
      return 1
    fi
  fi

  if [ "$reset_epoch" -le "$now_epoch" ]; then
    return 1
  fi

  wait_secs=$(( reset_epoch - now_epoch + 60 ))  # 60s buffer
  echo "$wait_secs"
  return 0
}

# Temporary file for capturing output (cleaned up on exit)
OUTPUT_FILE=$(mktemp)
trap 'rm -f "$OUTPUT_FILE"' EXIT

while true; do
  echo "--- Running claude CLI (attempt $((RETRY_COUNT + 1))/$((MAX_RETRIES + 1))) ---"

  # Run claude, tee output for both display and capture
  set +e
  claude "$@" 2>&1 | tee "$OUTPUT_FILE"
  EXIT_CODE=${PIPESTATUS[0]}
  set -e

  if [ "$EXIT_CODE" -eq 0 ]; then
    exit 0
  fi

  OUTPUT=$(cat "$OUTPUT_FILE")

  # Check if this is a quota error
  if is_quota_error "$OUTPUT"; then
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -gt "$MAX_RETRIES" ]; then
      echo "::error::Max quota retries ($MAX_RETRIES) exceeded. Giving up."
      post_comment "❌ **Claude Code** hit the token quota $((MAX_RETRIES + 1)) times and gave up. Manual intervention needed."
      exit 1
    fi

    # Try to parse reset time
    WAIT_SECS="$DEFAULT_WAIT_SECS"
    if RESET_STR=$(parse_reset_time "$OUTPUT"); then
      if PARSED_WAIT=$(calculate_wait_secs "$RESET_STR"); then
        WAIT_SECS="$PARSED_WAIT"
        echo "Quota reset time detected: $RESET_STR"
      else
        echo "Could not calculate wait from reset time '$RESET_STR'. Using default wait."
      fi
    else
      echo "Could not parse quota reset time from output. Using default wait of ${DEFAULT_WAIT_SECS}s."
    fi

    RESUME_TIME=$(date -d "+${WAIT_SECS} seconds" '+%Y-%m-%d %H:%M:%S %Z')
    echo "⏳ Waiting ${WAIT_SECS}s for quota reset (resuming at $RESUME_TIME)..."
    post_comment "⏳ **Claude Code** hit the token quota. Waiting for quota reset — will auto-resume at **$RESUME_TIME** (attempt $RETRY_COUNT/$MAX_RETRIES)."

    sleep "$WAIT_SECS"

    echo "⏰ Wait complete. Retrying..."
    post_comment "🔄 **Claude Code** is resuming work on this issue after quota reset (attempt $((RETRY_COUNT + 1))/$((MAX_RETRIES + 1)))."
  else
    # Non-quota error — don't retry
    echo "Claude exited with code $EXIT_CODE (not a quota error). Not retrying."
    exit "$EXIT_CODE"
  fi
done
