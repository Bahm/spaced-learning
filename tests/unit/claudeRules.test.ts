import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync, accessSync, constants } from 'fs'
import { join } from 'path'

const RULES_DIR = join(__dirname, '../../.claude/rules')
const SKILL_PATH = join(__dirname, '../../.claude/skills/implement-issue/SKILL.md')
const RETRO_SCRIPT = join(__dirname, '../../.claude/scripts/quota-retrospection.sh')
const RETRO_CONFIG = join(__dirname, '../../.claude/scripts/retrospection-config.json')

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

describe('quota-aware retrospection infrastructure', () => {
  it('config file exists and is valid JSON', () => {
    expect(existsSync(RETRO_CONFIG)).toBe(true)
    const config = JSON.parse(readFileSync(RETRO_CONFIG, 'utf-8'))
    expect(config).toBeDefined()
  })

  it('config has required fields', () => {
    const config = JSON.parse(readFileSync(RETRO_CONFIG, 'utf-8'))
    expect(config).toHaveProperty('quota_reset_cron')
    expect(config).toHaveProperty('retrospection_lead_hours')
    expect(config).toHaveProperty('max_budget_usd')
    expect(config).toHaveProperty('github_repo')
    expect(config).toHaveProperty('repo_path')
  })

  it('config values are within reasonable ranges', () => {
    const config = JSON.parse(readFileSync(RETRO_CONFIG, 'utf-8'))
    expect(config.retrospection_lead_hours).toBeGreaterThan(0)
    expect(config.retrospection_lead_hours).toBeLessThanOrEqual(24)
    expect(config.max_budget_usd).toBeGreaterThan(0)
    expect(config.max_budget_usd).toBeLessThanOrEqual(50)
  })

  it('retrospection script exists and is executable', () => {
    expect(existsSync(RETRO_SCRIPT)).toBe(true)
    expect(() => accessSync(RETRO_SCRIPT, constants.X_OK)).not.toThrow()
  })

  it('script sources nvm before running node/claude commands', () => {
    const script = readFileSync(RETRO_SCRIPT, 'utf-8')
    expect(script).toContain('nvm.sh')
  })

  it('script checks runner idle status before launching', () => {
    const script = readFileSync(RETRO_SCRIPT, 'utf-8')
    expect(script).toMatch(/gh.*run.*list|workflow.*run/i)
  })

  it('script uses a state file to prevent duplicate runs per cycle', () => {
    const script = readFileSync(RETRO_SCRIPT, 'utf-8')
    expect(script).toMatch(/state|lock|last.run/i)
  })

  it('script passes --max-budget-usd to claude CLI', () => {
    const script = readFileSync(RETRO_SCRIPT, 'utf-8')
    expect(script).toContain('--max-budget-usd')
  })
})
