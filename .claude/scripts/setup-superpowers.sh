#!/bin/bash
# Setup script for the Superpowers framework (Claude Code plugin)
# https://github.com/obra/superpowers
#
# Superpowers provides structured development skills: brainstorming,
# spec writing, planning, TDD, subagent delegation, and review.
# It complements the project's existing /implement-issue skill.
#
# This script is idempotent — safe to run multiple times.
# Run once on the self-hosted runner after initial setup.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=== Superpowers Plugin Setup ==="

# Check if Claude Code CLI is available
if ! command -v claude &>/dev/null; then
  echo "Error: 'claude' CLI not found in PATH."
  echo "Install Claude Code first: https://docs.anthropic.com/en/docs/claude-code"
  exit 1
fi

# Check if superpowers marketplace is already added
if claude /plugin marketplace list 2>/dev/null | grep -q "superpowers-marketplace"; then
  echo "✓ Superpowers marketplace already added — skipping."
else
  echo "Adding superpowers marketplace..."
  claude /plugin marketplace add obra/superpowers-marketplace
  echo "✓ Marketplace added."
fi

# Check if superpowers plugin is already installed
if claude /plugin list 2>/dev/null | grep -q "superpowers"; then
  echo "✓ Superpowers plugin already installed — skipping."
else
  echo "Installing superpowers plugin (global)..."
  claude /plugin install superpowers@superpowers-marketplace --global
  echo "✓ Superpowers installed globally."
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Available superpowers skills:"
echo "  /superpowers:brainstorming  — Socratic design exploration"
echo "  /superpowers:spec           — Write a detailed spec from design"
echo "  /superpowers:plan           — Break spec into bite-sized tasks"
echo "  /superpowers:tdd            — RED-GREEN-REFACTOR with gates"
echo "  /superpowers:subagent       — Delegate subtasks to child agents"
echo "  /superpowers:review         — Code review and finalization"
echo ""
echo "Integration notes:"
echo "  - /implement-issue remains the primary automated workflow"
echo "  - Superpowers skills are available for interactive sessions"
echo "  - See .claude/rules/superpowers-integration.md for details"
