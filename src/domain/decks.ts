import type { Deck, PublicDeckDefinition } from './types'
import { VIETNAMESE_SEED_CARDS } from '../db/seedData'
import { YOGA_SEED_CARDS } from '../db/yogaSeedData'
import { SENTENCES_SEED_CARDS } from '../db/sentencesSeedData'

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

export const PUBLIC_DECK_CATALOG: PublicDeckDefinition[] = [
  {
    id: 'default-vietnamese-deck',
    name: '1000 most common words in Vietnamese',
    description: 'Learn the most frequently used Vietnamese words with English translations.',
    cardCount: VIETNAMESE_SEED_CARDS.length,
  },
  {
    id: 'default-yoga-deck',
    name: 'Vietnamese yoga vocabulary',
    description: 'Phrases an instructor or student might say in a yoga class, in Vietnamese.',
    cardCount: YOGA_SEED_CARDS.length,
  },
  {
    id: 'default-sentences-deck',
    name: '100 everyday Vietnamese sentences',
    description: 'Common sentences for daily conversations, shopping, dining, and getting around.',
    cardCount: SENTENCES_SEED_CARDS.length,
  },
]
