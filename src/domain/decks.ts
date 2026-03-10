import type { Deck } from './types'

export class DeckValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DeckValidationError'
  }
}

export const createDeck = (name: string): Deck => {
  if (name.trim().length === 0) {
    throw new DeckValidationError('Deck name cannot be empty')
  }
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
  }
}
