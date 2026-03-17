import type { Deck, PublicDeckDefinition } from './types'

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
    status: 'active',
  }
}

export const PUBLIC_DECK_CATALOG: readonly PublicDeckDefinition[] = [
  {
    id: 'default-vietnamese-deck',
    name: '1000 most common words in Vietnamese',
    description: 'Learn the most frequently used Vietnamese words with English translations.',
    cardCount: 1000,
  },
  {
    id: 'default-yoga-deck',
    name: 'Vietnamese yoga vocabulary',
    description: 'Phrases an instructor or student might say in a yoga class, in Vietnamese.',
    cardCount: 256,
  },
  {
    id: 'default-sentences-deck',
    name: '100 everyday Vietnamese sentences',
    description: 'Common sentences for daily conversations, shopping, dining, and getting around.',
    cardCount: 100,
  },
  {
    id: 'default-food-deck',
    name: 'Vietnamese food & dining',
    description: 'Dishes, ingredients, cooking terms, and restaurant phrases for food lovers.',
    cardCount: 163,
  },
]
