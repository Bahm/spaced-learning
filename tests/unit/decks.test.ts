import { describe, it, expect } from 'vitest'
import { createDeck, DeckValidationError } from '../../src/domain/decks'

describe('createDeck', () => {
  it('creates a deck with trimmed name', () => {
    const deck = createDeck('  Spanish  ')
    expect(deck.name).toBe('Spanish')
  })

  it('generates a unique id', () => {
    const a = createDeck('A')
    const b = createDeck('B')
    expect(a.id).not.toBe(b.id)
  })

  it('sets createdAt as a timestamp', () => {
    const before = Date.now()
    const deck = createDeck('Test')
    const after = Date.now()
    expect(deck.createdAt).toBeGreaterThanOrEqual(before)
    expect(deck.createdAt).toBeLessThanOrEqual(after)
  })

  it('throws DeckValidationError for empty name', () => {
    expect(() => createDeck('')).toThrow(DeckValidationError)
    expect(() => createDeck('   ')).toThrow(DeckValidationError)
  })
})
