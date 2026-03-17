import { describe, it, expect } from 'vitest'
import { FOOD_SEED_CARDS } from '../../src/db/foodSeedData'

describe('FOOD_SEED_CARDS', () => {
  it('has exactly 163 entries', () => {
    expect(FOOD_SEED_CARDS.length).toBe(163)
  })

  it('every entry has a non-empty front and back', () => {
    for (const card of FOOD_SEED_CARDS) {
      expect(card.front.trim()).not.toBe('')
      expect(card.back.trim()).not.toBe('')
    }
  })

  it('all fronts are unique', () => {
    const fronts = FOOD_SEED_CARDS.map((c) => c.front)
    expect(new Set(fronts).size).toBe(FOOD_SEED_CARDS.length)
  })

  it('fronts are in Vietnamese (contain diacritical characters)', () => {
    const allFronts = FOOD_SEED_CARDS.map((c) => c.front).join(' ')
    const vietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
    expect(vietnameseChars.test(allFronts)).toBe(true)
  })

  it('every entry has a non-empty explanation', () => {
    for (const card of FOOD_SEED_CARDS) {
      expect(card.explanation, `Missing explanation for "${card.front}"`).toBeDefined()
      expect(card.explanation!.trim()).not.toBe('')
    }
  })

  it('backs are in English', () => {
    for (const card of FOOD_SEED_CARDS) {
      const asciiRatio = card.back.split('').filter((c) => c.charCodeAt(0) < 128).length / card.back.length
      expect(asciiRatio).toBeGreaterThan(0.8)
    }
  })
})
