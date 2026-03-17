import { describe, it, expect } from 'vitest'
import { createCard, updateCardFields, CardValidationError } from '../../src/domain/cards'

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

  it('creates a card with an optional explanation', () => {
    const card = createCard('Q', 'A', DECK_ID, 'Example usage in a sentence')
    expect(card.explanation).toBe('Example usage in a sentence')
  })

  it('trims explanation whitespace', () => {
    const card = createCard('Q', 'A', DECK_ID, '  spaced  ')
    expect(card.explanation).toBe('spaced')
  })

  it('omits explanation when not provided', () => {
    const card = createCard('Q', 'A', DECK_ID)
    expect(card.explanation).toBeUndefined()
  })

  it('omits explanation when empty or whitespace-only', () => {
    const card = createCard('Q', 'A', DECK_ID, '')
    expect(card.explanation).toBeUndefined()
    const card2 = createCard('Q', 'A', DECK_ID, '   ')
    expect(card2.explanation).toBeUndefined()
  })
})

describe('updateCardFields', () => {
  const original = createCard('Old front', 'Old back', DECK_ID, 'Old explanation')

  it('updates front and back with trimmed values', () => {
    const updated = updateCardFields(original, '  New front  ', '  New back  ')
    expect(updated.front).toBe('New front')
    expect(updated.back).toBe('New back')
  })

  it('preserves id, createdAt, and deckId', () => {
    const updated = updateCardFields(original, 'New Q', 'New A')
    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.deckId).toBe(original.deckId)
  })

  it('updates explanation when provided', () => {
    const updated = updateCardFields(original, 'Q', 'A', 'New explanation')
    expect(updated.explanation).toBe('New explanation')
  })

  it('removes explanation when empty or whitespace-only', () => {
    const updated = updateCardFields(original, 'Q', 'A', '   ')
    expect(updated.explanation).toBeUndefined()
  })

  it('removes explanation when not provided', () => {
    const updated = updateCardFields(original, 'Q', 'A')
    expect(updated.explanation).toBeUndefined()
  })

  it('throws CardValidationError for empty front', () => {
    expect(() => updateCardFields(original, '', 'A')).toThrow(CardValidationError)
    expect(() => updateCardFields(original, '   ', 'A')).toThrow(CardValidationError)
  })

  it('throws CardValidationError for empty back', () => {
    expect(() => updateCardFields(original, 'Q', '')).toThrow(CardValidationError)
    expect(() => updateCardFields(original, 'Q', '   ')).toThrow(CardValidationError)
  })

  it('returns a new object, does not mutate original', () => {
    const updated = updateCardFields(original, 'New Q', 'New A')
    expect(updated).not.toBe(original)
    expect(original.front).toBe('Old front')
  })
})
