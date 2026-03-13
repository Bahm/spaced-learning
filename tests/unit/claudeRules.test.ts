import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const RULES_DIR = join(__dirname, '../../.claude/rules')
const SKILL_PATH = join(__dirname, '../../.claude/skills/implement-issue/SKILL.md')
const WRAPPER_SCRIPT_PATH = join(__dirname, '../../.claude/scripts/quota-retry-wrapper.sh')
const WORKFLOW_PATH = join(__dirname, '../../.github/workflows/implement-from-issue.yml')

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
