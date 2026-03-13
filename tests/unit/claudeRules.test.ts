import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join } from 'path'

const RULES_DIR = join(__dirname, '../../.claude/rules')
const SKILL_PATH = join(__dirname, '../../.claude/skills/implement-issue/SKILL.md')
const WRAPPER_SCRIPT_PATH = join(__dirname, '../../.claude/scripts/quota-retry-wrapper.sh')
const WORKFLOW_PATH = join(__dirname, '../../.github/workflows/implement-from-issue.yml')
const RETROSPECTION_SCRIPT_PATH = join(__dirname, '../../.claude/scripts/pre-reset-retrospection.sh')
const RETROSPECTION_CONFIG_PATH = join(__dirname, '../../.claude/scripts/retrospection-config.json')

describe('.claude/rules/ structure', () => {
  it('rules directory exists', () => {
    expect(existsSync(RULES_DIR)).toBe(true)
  })

  it('contains at least one .md rule file', () => {
    const files = readdirSync(RULES_DIR).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThanOrEqual(1)
  })

  it('all rule files have valid YAML frontmatter with paths', () => {
    const files = readdirSync(RULES_DIR).filter(f => f.endsWith('.md'))
    for (const file of files) {
      const content = readFileSync(join(RULES_DIR, file), 'utf-8')
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      expect(frontmatterMatch, `${file} must have YAML frontmatter`).not.toBeNull()

      const frontmatter = frontmatterMatch![1]!
      expect(frontmatter, `${file} frontmatter must include paths`).toContain('paths:')
    }
  })

  it('CLAUDE.md is under 200 lines (best practice limit)', () => {
    const claudeMd = readFileSync(join(__dirname, '../../CLAUDE.md'), 'utf-8')
    const lineCount = claudeMd.split('\n').length
    expect(lineCount).toBeLessThanOrEqual(200)
  })
})

describe('implement-issue skill best-practices audit', () => {
  const skillContent = readFileSync(SKILL_PATH, 'utf-8')

  it('step 9 includes a best-practices audit checklist', () => {
    expect(skillContent).toMatch(/best.practices audit/i)
  })

  it('audit checklist covers key areas: CLAUDE.md size, path-scoped rules, hooks', () => {
    expect(skillContent).toMatch(/CLAUDE\.md.*under.*200 lines|200.line/i)
    expect(skillContent).toMatch(/path-scoped rules/i)
    expect(skillContent).toMatch(/PostToolUse.*hook|tsc.*hook/i)
  })

  it('audit is positioned within step 9 (consolidate learnings)', () => {
    const step9Match = skillContent.match(/### 9\. Consolidate learnings([\s\S]*)$/)
    expect(step9Match, 'step 9 must exist').not.toBeNull()
    const step9Content = step9Match![1]!
    expect(step9Content).toMatch(/best.practices audit/i)
  })
})

describe('quota-retry wrapper script', () => {
  it('quota-retry-wrapper.sh exists', () => {
    expect(existsSync(WRAPPER_SCRIPT_PATH)).toBe(true)
  })

  it('contains quota error detection logic', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/quota|rate.limit|token.limit/i)
  })

  it('contains retry loop with max retries', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/MAX_RETRIES/)
    expect(content).toMatch(/while|for/)
  })

  it('parses reset time from error output', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/reset/i)
    expect(content).toMatch(/date|sleep/)
  })

  it('is executable (has shebang)', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    expect(content.startsWith('#!/')).toBe(true)
  })

  it('is_quota_error matches "You\'ve hit your limit" message', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    // Extract the is_quota_error grep pattern
    const grepMatch = content.match(/is_quota_error\(\)\s*\{[\s\S]*?grep\s+-qiP\s+'([^']+)'/)
    expect(grepMatch, 'is_quota_error must use grep -qiP with a pattern').not.toBeNull()
    const pattern = grepMatch![1]!
    // The actual Claude CLI message: "You've hit your limit · resets 11pm (Asia/Saigon)"
    const regex = new RegExp(pattern, 'i')
    expect(regex.test("You've hit your limit · resets 11pm (Asia/Saigon)")).toBe(true)
  })

  it('is_quota_error matches "hit your limit" without prefix', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    const grepMatch = content.match(/is_quota_error\(\)\s*\{[\s\S]*?grep\s+-qiP\s+'([^']+)'/)
    expect(grepMatch).not.toBeNull()
    const pattern = grepMatch![1]!
    const regex = new RegExp(pattern, 'i')
    expect(regex.test("hit your limit")).toBe(true)
  })

  it('parse_reset_time handles "resets <time> (<timezone>)" format', () => {
    const content = readFileSync(WRAPPER_SCRIPT_PATH, 'utf-8')
    // The script must have a pattern that can extract time from "resets 11pm (Asia/Saigon)"
    expect(content).toMatch(/resets?\s+\d|resets?\s+at|resets?\s+\S/i)
  })
})

describe('implement-issue skill prevents duplicate PRs', () => {
  const skillContent = readFileSync(SKILL_PATH, 'utf-8')

  it('step 8 instructs to check for existing open PRs for the same issue', () => {
    const step8Match = skillContent.match(/### 8\. Create PR([\s\S]*?)(?=### 9\.|$)/)
    expect(step8Match, 'step 8 must exist').not.toBeNull()
    const step8Content = step8Match![1]!
    expect(step8Content).toMatch(/gh pr list.*Closes #|existing.*open.*PR|duplicate.*PR/i)
  })

  it('step 8 instructs to close superseded PRs before creating a new one', () => {
    const step8Match = skillContent.match(/### 8\. Create PR([\s\S]*?)(?=### 9\.|$)/)
    expect(step8Match, 'step 8 must exist').not.toBeNull()
    const step8Content = step8Match![1]!
    expect(step8Content).toMatch(/gh pr close|close.*superseded|close.*existing/i)
  })
})

describe('implement-from-issue workflow prevents duplicate PRs', () => {
  const workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8')

  it('has a step to close existing PRs for the same issue before running Claude', () => {
    expect(workflowContent).toMatch(/close.*existing.*PR|Close existing PR|supersed/i)
  })
})

describe('implement-issue skill reads issue comments', () => {
  const skillContent = readFileSync(SKILL_PATH, 'utf-8')

  it('step 1 instructs to read issue comments, not just title and body', () => {
    const step1Match = skillContent.match(/### 1\. Read the spec([\s\S]*?)(?=### 2\.)/)
    expect(step1Match, 'step 1 must exist').not.toBeNull()
    const step1Content = step1Match![1]!
    expect(step1Content).toMatch(/comments/i)
  })

  it('uses gh issue view with --json that includes comments field', () => {
    const step1Match = skillContent.match(/### 1\. Read the spec([\s\S]*?)(?=### 2\.)/)
    expect(step1Match, 'step 1 must exist').not.toBeNull()
    const step1Content = step1Match![1]!
    expect(step1Content).toMatch(/--json.*comments|comments.*--json/i)
  })
})

describe('implement-from-issue workflow passes issue comments to Claude', () => {
  const workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8')

  it('fetches issue comments before running Claude', () => {
    expect(workflowContent).toMatch(/gh issue view.*comments|issue.*comments/i)
  })

  it('passes issue context including comments to the Claude prompt', () => {
    // The prompt or an env var should contain the issue comments
    expect(workflowContent).toMatch(/ISSUE_CONTEXT|issue_context|comments/i)
  })
})

describe('implement-from-issue workflow uses quota retry', () => {
  const workflowContent = readFileSync(WORKFLOW_PATH, 'utf-8')

  it('references the quota-retry-wrapper script', () => {
    expect(workflowContent).toMatch(/quota-retry-wrapper/)
  })

  it('has timeout sufficient for quota retry waits', () => {
    const timeoutMatch = workflowContent.match(/timeout-minutes:\s*(\d+)/)
    expect(timeoutMatch).not.toBeNull()
    const timeout = parseInt(timeoutMatch![1]!, 10)
    expect(timeout).toBeGreaterThanOrEqual(180)
  })

  it('posts a comment when waiting for quota reset', () => {
    expect(workflowContent).toMatch(/quota.*reset|waiting.*quota/i)
  })
})

describe('pre-reset retrospection script', () => {
  it('pre-reset-retrospection.sh exists', () => {
    expect(existsSync(RETROSPECTION_SCRIPT_PATH)).toBe(true)
  })

  it('is executable (has shebang)', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content.startsWith('#!/')).toBe(true)
  })

  it('has executable permissions', () => {
    const stat = statSync(RETROSPECTION_SCRIPT_PATH)
    const isExecutable = (stat.mode & 0o111) !== 0
    expect(isExecutable).toBe(true)
  })

  it('checks if runner is idle before starting', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/claude.*process|pgrep|pidof|lock/i)
  })

  it('calculates time window relative to quota reset', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/windowHours|window_hours|WINDOW/i)
    expect(content).toMatch(/resetDay|reset_day|RESET_DAY/i)
  })

  it('uses --max-budget-usd as spending cap', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/max-budget-usd/)
  })

  it('creates a branch for retrospection changes', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/git checkout -b|git switch -c/)
  })

  it('creates a PR for retrospection changes', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/gh pr create/)
  })

  it('supports --dry-run and --force flags', () => {
    const content = readFileSync(RETROSPECTION_SCRIPT_PATH, 'utf-8')
    expect(content).toMatch(/dry.run/i)
    expect(content).toMatch(/force/i)
  })
})

describe('retrospection-config.json', () => {
  it('exists with required fields', () => {
    expect(existsSync(RETROSPECTION_CONFIG_PATH)).toBe(true)
    const config = JSON.parse(readFileSync(RETROSPECTION_CONFIG_PATH, 'utf-8'))
    expect(config).toHaveProperty('resetDay')
    expect(config).toHaveProperty('resetHourUTC')
    expect(config).toHaveProperty('windowHours')
    expect(config).toHaveProperty('maxBudgetUsd')
    expect(config).toHaveProperty('tasks')
  })

  it('has sensible defaults', () => {
    const config = JSON.parse(readFileSync(RETROSPECTION_CONFIG_PATH, 'utf-8'))
    expect(typeof config.resetDay).toBe('string')
    expect(config.resetHourUTC).toBeGreaterThanOrEqual(0)
    expect(config.resetHourUTC).toBeLessThanOrEqual(23)
    expect(config.windowHours).toBeGreaterThan(0)
    expect(config.maxBudgetUsd).toBeGreaterThan(0)
    expect(Array.isArray(config.tasks)).toBe(true)
    expect(config.tasks.length).toBeGreaterThan(0)
  })
})

describe('package.json has retrospection npm scripts', () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'))

  it('has retrospection script', () => {
    expect(pkg.scripts.retrospection).toMatch(/pre-reset-retrospection/)
  })

  it('has retrospection:dry script', () => {
    expect(pkg.scripts['retrospection:dry']).toMatch(/dry-run/)
  })

  it('has retrospection:force script', () => {
    expect(pkg.scripts['retrospection:force']).toMatch(/force/)
  })
})
