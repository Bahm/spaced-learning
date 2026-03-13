import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const RULES_DIR = join(__dirname, '../../.claude/rules')

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
