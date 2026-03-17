#!/usr/bin/env bash
# update-reset-config.sh — Auto-update retrospection-config.json from observed quota reset times.
#
# When the quota-retry-wrapper detects a quota reset time, it logs the epoch timestamp
# to a calibration log file. This script reads the most recent entry and derives
# the resetDay (day of week) and resetHourUTC from it, then updates the config.
#
# Usage: ./update-reset-config.sh [calibration_log] [config_file]
#   calibration_log — path to the calibration log (default: same dir/quota-reset-calibration.log)
#   config_file     — path to retrospection-config.json (default: same dir/retrospection-config.json)
#
# The calibration log is a simple file with one epoch timestamp per line.
# Only the most recent (last) entry is used.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CALIBRATION_LOG="${1:-$SCRIPT_DIR/quota-reset-calibration.log}"
CONFIG_FILE="${2:-$SCRIPT_DIR/retrospection-config.json}"
LOG_PREFIX="[update-reset-config]"

log() { echo "$LOG_PREFIX $*"; }

# --- Validate inputs ---
if [ ! -f "$CALIBRATION_LOG" ]; then
  log "No calibration log found at $CALIBRATION_LOG. Nothing to do."
  exit 0
fi

if [ ! -f "$CONFIG_FILE" ]; then
  log "ERROR: Config file not found: $CONFIG_FILE"
  exit 1
fi

# --- Read most recent calibration entry ---
# Filter out empty lines, take the last non-empty line
RESET_EPOCH=$(grep -v '^[[:space:]]*$' "$CALIBRATION_LOG" | tail -1 || true)

if [ -z "$RESET_EPOCH" ]; then
  log "Calibration log is empty. Config unchanged."
  exit 0
fi

# Validate it's a number
if ! [[ "$RESET_EPOCH" =~ ^[0-9]+$ ]]; then
  log "ERROR: Invalid epoch in calibration log: $RESET_EPOCH"
  exit 1
fi

# --- Derive day-of-week and UTC hour from the epoch ---
RESET_DAY=$(date -u -d "@$RESET_EPOCH" +%A)
RESET_HOUR_UTC=$(date -u -d "@$RESET_EPOCH" +%-H)

log "Derived from epoch $RESET_EPOCH: resetDay=$RESET_DAY, resetHourUTC=$RESET_HOUR_UTC"

# --- Read current config values for comparison ---
CURRENT_DAY=$(jq -r '.resetDay' "$CONFIG_FILE")
CURRENT_HOUR=$(jq -r '.resetHourUTC' "$CONFIG_FILE")

if [ "$CURRENT_DAY" = "$RESET_DAY" ] && [ "$CURRENT_HOUR" = "$RESET_HOUR_UTC" ]; then
  log "Config already matches. No update needed."
  exit 0
fi

# --- Update config, preserving all other fields ---
log "Updating config: resetDay=$CURRENT_DAY→$RESET_DAY, resetHourUTC=$CURRENT_HOUR→$RESET_HOUR_UTC"

TMP_FILE=$(mktemp)
jq --arg day "$RESET_DAY" --argjson hour "$RESET_HOUR_UTC" \
  '.resetDay = $day | .resetHourUTC = $hour' "$CONFIG_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$CONFIG_FILE"

log "Config updated successfully."
