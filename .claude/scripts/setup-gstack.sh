#!/bin/bash
# Setup script for gstack (Claude Code skill pack by Garry Tan)
# https://github.com/garrytan/gstack
#
# gstack provides role-based specialist skills: code review, QA,
# design review, retrospectives, and headless browser automation.
# It complements the project's existing /implement-issue skill.
#
# This script is idempotent — safe to run multiple times.
# Run once on the self-hosted runner after initial setup.

set -euo pipefail

GSTACK_DIR="$HOME/.claude/skills/gstack"

echo "=== gstack Setup ==="

# Check if Claude Code CLI is available
if ! command -v claude &>/dev/null; then
  echo "Error: 'claude' CLI not found in PATH."
  echo "Install Claude Code first: https://docs.anthropic.com/en/docs/claude-code"
  exit 1
fi

# Check if gstack is already installed
if [ -d "$GSTACK_DIR" ] && [ -f "$GSTACK_DIR/setup" ]; then
  echo "✓ gstack already exists at $GSTACK_DIR — skipping clone."
else
  echo "Cloning gstack..."
  git clone https://github.com/garrytan/gstack.git "$GSTACK_DIR"
  echo "✓ Cloned to $GSTACK_DIR."
fi

# Run the gstack setup script (idempotent — builds browser binary, installs deps)
echo "Running gstack setup..."
cd "$GSTACK_DIR"
./setup
echo "✓ gstack setup complete."

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Key gstack skills for this project:"
echo "  /review               — Paranoid staff-engineer code review"
echo "  /qa                   — QA + fix: test, find bugs, fix with atomic commits"
echo "  /qa-only              — QA report only (no fixes)"
echo "  /qa-design-review     — Design audit + frontend fixes"
echo "  /browse               — Headless browser automation"
echo "  /retro                — Team-aware retrospective"
echo ""
echo "Integration notes:"
echo "  - /implement-issue remains the primary automated workflow"
echo "  - gstack skills are available for interactive and automated sessions"
echo "  - See .claude/rules/gstack-integration.md for details"
