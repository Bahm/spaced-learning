#!/usr/bin/env bash
# fetch-weekly-reset.sh — Fetch weekly quota reset time from the Anthropic OAuth usage API
# and update retrospection-config.json with the correct resetDay and resetHourUTC.
#
# The Claude Code CLI stores OAuth credentials in ~/.claude/.credentials.json.
# This script reads the accessToken, calls the usage API, and extracts the
# seven_day.resets_at ISO 8601 timestamp to derive the next weekly reset day/hour.
#
# Usage: ./fetch-weekly-reset.sh [config_file]
#   config_file — path to retrospection-config.json (default: same dir/retrospection-config.json)
#
# Exit codes:
#   0 — success (config updated or already correct)
#   1 — error (credentials missing, API failure, etc.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${1:-$SCRIPT_DIR/retrospection-config.json}"
CREDENTIALS_FILE="${HOME}/.claude/.credentials.json"
USAGE_API_URL="https://api.anthropic.com/api/oauth/usage"
LOG_PREFIX="[fetch-weekly-reset]"

log() { echo "$LOG_PREFIX $*"; }

# --- Parse API response and update config ---
# Extracted as a function so tests can call it with mock data.
parse_and_update_config() {
  local api_response="$1"
  local config_file="$2"

  # Extract seven_day.resets_at from the response
  local resets_at
  resets_at=$(echo "$api_response" | jq -r '.seven_day.resets_at // empty' 2>/dev/null)

  if [ -z "$resets_at" ] || [ "$resets_at" = "null" ]; then
    log "No seven_day reset time in API response. Config unchanged."
    return 0
  fi

  # Parse ISO 8601 timestamp to derive day-of-week and UTC hour
  # Example: "2026-03-24T00:00:01.220149+00:00" → Tuesday, 0
  local reset_day reset_hour_utc
  reset_day=$(date -u -d "$resets_at" +%A 2>/dev/null) || {
    log "ERROR: Failed to parse resets_at timestamp: $resets_at"
    return 1
  }
  reset_hour_utc=$(date -u -d "$resets_at" +%-H 2>/dev/null) || {
    log "ERROR: Failed to extract hour from: $resets_at"
    return 1
  }

  log "API reports weekly reset: $reset_day at ${reset_hour_utc}:00 UTC (from $resets_at)"

  # Read current config for comparison
  local current_day current_hour
  current_day=$(jq -r '.resetDay' "$config_file")
  current_hour=$(jq -r '.resetHourUTC' "$config_file")

  if [ "$current_day" = "$reset_day" ] && [ "$current_hour" = "$reset_hour_utc" ]; then
    log "Config already matches. No update needed."
    return 0
  fi

  # Update config, preserving all other fields
  log "Updating config: resetDay=$current_day→$reset_day, resetHourUTC=$current_hour→$reset_hour_utc"

  local tmp_file
  tmp_file=$(mktemp)
  jq --arg day "$reset_day" --argjson hour "$reset_hour_utc" \
    '.resetDay = $day | .resetHourUTC = $hour' "$config_file" > "$tmp_file"
  mv "$tmp_file" "$config_file"

  log "Config updated successfully."
}

# --- Main (skipped when sourced for testing) ---
# If the script is being sourced (e.g., for testing), don't run main logic.
# Callers can invoke parse_and_update_config directly.
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then

  # Validate credentials file
  if [ ! -f "$CREDENTIALS_FILE" ]; then
    log "ERROR: Claude credentials not found at $CREDENTIALS_FILE"
    log "Run 'claude auth' to authenticate first."
    exit 1
  fi

  # Extract OAuth access token
  ACCESS_TOKEN=$(jq -r '.claudeAiOauth.accessToken // empty' "$CREDENTIALS_FILE" 2>/dev/null)
  if [ -z "$ACCESS_TOKEN" ]; then
    log "ERROR: No accessToken found in $CREDENTIALS_FILE"
    exit 1
  fi

  # Validate config file
  if [ ! -f "$CONFIG_FILE" ]; then
    log "ERROR: Config file not found: $CONFIG_FILE"
    exit 1
  fi

  # Call the usage API
  log "Fetching usage data from Anthropic API..."
  HTTP_RESPONSE=$(curl -s -w "\n%{http_code}" \
    "$USAGE_API_URL" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "anthropic-beta: oauth-2025-04-20" \
    -H "User-Agent: claude-code/2.0.32" 2>/dev/null) || {
    log "ERROR: curl failed to reach $USAGE_API_URL"
    exit 1
  }

  # Split response body and HTTP status code
  HTTP_BODY=$(echo "$HTTP_RESPONSE" | head -n -1)
  HTTP_CODE=$(echo "$HTTP_RESPONSE" | tail -1)

  if [ "$HTTP_CODE" != "200" ]; then
    log "ERROR: API returned HTTP $HTTP_CODE"
    log "Response: $HTTP_BODY"
    exit 1
  fi

  # Validate JSON response
  if ! echo "$HTTP_BODY" | jq . >/dev/null 2>&1; then
    log "ERROR: Invalid JSON response from API"
    exit 1
  fi

  parse_and_update_config "$HTTP_BODY" "$CONFIG_FILE"
fi
