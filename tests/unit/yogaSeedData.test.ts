import { describe, it, expect } from 'vitest'
import { YOGA_SEED_CARDS } from '../../src/db/yogaSeedData'

describe('YOGA_SEED_CARDS', () => {
  it('has a reasonable number of entries (at least 50)', () => {
    expect(YOGA_SEED_CARDS.length).toBeGreaterThanOrEqual(50)
  })

  it('every entry has a non-empty front and back', () => {
    for (const card of YOGA_SEED_CARDS) {
      expect(card.front.trim()).not.toBe('')
      expect(card.back.trim()).not.toBe('')
    }
  })

  it('all fronts are unique', () => {
    const fronts = YOGA_SEED_CARDS.map((c) => c.front)
    expect(new Set(fronts).size).toBe(YOGA_SEED_CARDS.length)
  })

  it('fronts are in Vietnamese (not English)', () => {
    // Yoga vocabulary should have Vietnamese fronts — check that common Vietnamese
    // diacritical characters appear across the dataset
    const allFronts = YOGA_SEED_CARDS.map((c) => c.front).join(' ')
    const vietnameseChars = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
    expect(vietnameseChars.test(allFronts)).toBe(true)
  })
})
