import { describe, it, expect } from 'vitest'
import { createCard, CardValidationError } from '../../src/domain/cards'

const DECK_ID = 'test-deck-id'

describe('createCard', () => {
  it('creates a card with trimmed front and back', () => {
    const card = createCard('  Hello  ', '  World  ', DECK_ID)
    expect(card.front).toBe('Hello')
    expect(card.back).toBe('World')
  })

  it('stores the deckId', () => {
    const card = createCard('Q', 'A', DECK_ID)
    expect(card.deckId).toBe(DECK_ID)
  })

  it('generates a unique id', () => {
    const a = createCard('Q', 'A', DECK_ID)
    const b = createCard('Q', 'A', DECK_ID)
    expect(a.id).not.toBe(b.id)
  })

  it('sets createdAt as a timestamp', () => {
    const before = Date.now()
    const card = createCard('Q', 'A', DECK_ID)
    const after = Date.now()
    expect(card.createdAt).toBeGreaterThanOrEqual(before)
    expect(card.createdAt).toBeLessThanOrEqual(after)
  })

  it('throws CardValidationError for empty front', () => {
    expect(() => createCard('', 'A', DECK_ID)).toThrow(CardValidationError)
    expect(() => createCard('   ', 'A', DECK_ID)).toThrow(CardValidationError)
  })

  it('throws CardValidationError for empty back', () => {
    expect(() => createCard('Q', '', DECK_ID)).toThrow(CardValidationError)
    expect(() => createCard('Q', '   ', DECK_ID)).toThrow(CardValidationError)
  })
})
