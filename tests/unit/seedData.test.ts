import { describe, it, expect } from 'vitest'
import { VIETNAMESE_SEED_CARDS } from '../../src/db/seedData'

describe('VIETNAMESE_SEED_CARDS', () => {
  it('has exactly 1000 entries', () => {
    expect(VIETNAMESE_SEED_CARDS).toHaveLength(1000)
  })

  it('every entry has a non-empty front and back', () => {
    for (const card of VIETNAMESE_SEED_CARDS) {
      expect(card.front.trim()).not.toBe('')
      expect(card.back.trim()).not.toBe('')
    }
  })

  it('all fronts are unique', () => {
    const fronts = VIETNAMESE_SEED_CARDS.map((c) => c.front)
    expect(new Set(fronts).size).toBe(VIETNAMESE_SEED_CARDS.length)
  })

  it('every entry has a non-empty explanation', () => {
    for (const card of VIETNAMESE_SEED_CARDS) {
      expect(card.explanation, `Missing explanation for "${card.front}"`).toBeDefined()
      expect(card.explanation!.trim()).not.toBe('')
    }
  })
})
