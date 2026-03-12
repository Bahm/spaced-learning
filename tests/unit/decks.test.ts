import { describe, it, expect } from 'vitest'
import { createDeck, DeckValidationError, PUBLIC_DECK_CATALOG } from '../../src/domain/decks'

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

  it('sets status to active', () => {
    const deck = createDeck('Test')
    expect(deck.status).toBe('active')
  })
})

describe('PUBLIC_DECK_CATALOG', () => {
  it('contains at least one entry', () => {
    expect(PUBLIC_DECK_CATALOG.length).toBeGreaterThan(0)
  })

  it('each entry has required fields', () => {
    for (const entry of PUBLIC_DECK_CATALOG) {
      expect(entry.id).toBeTruthy()
      expect(entry.name).toBeTruthy()
      expect(entry.description).toBeTruthy()
      expect(entry.cardCount).toBeGreaterThan(0)
    }
  })

  it('has unique IDs', () => {
    const ids = PUBLIC_DECK_CATALOG.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
