#!/bin/bash
# post-session.sh
# Consolidates lessons learned from the latest Claude Code session into MEMORY.md.
#
# Usage:
#   npm run memory:sync        — run from a terminal OUTSIDE an active Claude Code session
#   (inside Claude Code)       — Claude should edit MEMORY.md directly; this script will not work there
#
# What it does:
#   1. Finds the most recent session transcript
#   2. Uses claude -p to extract new lessons and update MEMORY.md
#   3. Asks a reflective question: how could the workflow be more automated?

# Detect if we're running inside an active Claude Code session.
# Claude Code sets $CLAUDECODE in the environment; spawning `claude -p` inside
# another Claude Code process crashes both sessions.
if [ -n "$CLAUDECODE" ]; then
  echo "⚠️  Running inside Claude Code — cannot launch a nested claude subprocess."
  echo ""
  echo "Instead, ask Claude to update MEMORY.md directly:"
  echo "  'Please update MEMORY.md with lessons from this session'"
  echo ""
  echo "Or run this script from a terminal outside Claude Code:"
  echo "  npm run memory:sync"
  exit 0
fi

MEMORY_FILE="${HOME}/.claude/projects/-home-bahm-Projects-spaced-learning/memory/MEMORY.md"
SESSION_DIR="${HOME}/.claude/projects/-home-bahm-Projects-spaced-learning"

# Find the most recent session transcript
LATEST_SESSION=$(ls -t "${SESSION_DIR}"/*.jsonl 2>/dev/null | head -1)

if [ -z "$LATEST_SESSION" ]; then
  echo "No session transcripts found in ${SESSION_DIR}"
  exit 1
fi

echo "Consolidating lessons from: $(basename "$LATEST_SESSION")"
echo "Memory file: ${MEMORY_FILE}"
echo ""

claude -p "
You are consolidating lessons from a completed Claude Code session on the spaced-learning flashcard project.

Files to review:
- Session transcript: ${LATEST_SESSION}
- Current memory: ${MEMORY_FILE}

Tasks:
1. Read the session transcript. Focus on: errors encountered and how they were fixed, architectural decisions made, patterns discovered, bugs found, pitfalls hit.
2. Read the current MEMORY.md.
3. Update MEMORY.md using the Edit tool — add only new, stable lessons not already captured. Be concise. No duplicates. Keep existing structure.
4. Now ask yourself this question and answer it honestly: **What additional steps could be taken to make this AI-driven development workflow even more automated or effective?** Consider things like: missing hooks, missing skills, gaps in the TDD workflow, missing CI steps, memory consolidation gaps, or coordination inefficiencies. If you have ideas not already in MEMORY.md, add a brief 'Workflow improvement ideas' section. If nothing new, skip it.

Important: Only add genuinely new knowledge. Do not restate what is already there.
" --allowedTools "Read,Edit,Grep,Glob"
