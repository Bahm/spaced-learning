import Dexie, { type EntityTable } from 'dexie'
import type { Card, Deck } from '../domain/types'
import type { SeedCard } from './seedData'

export interface ScheduleRecord {
  readonly cardId: string
  readonly due: number
  readonly stability: number
  readonly difficulty: number
  readonly elapsed_days: number
  readonly scheduled_days: number
  readonly reps: number
  readonly lapses: number
  readonly learning_steps: number
  readonly state: number
  readonly last_review?: number
}

const db = new Dexie('SpacedLearning') as Dexie & {
  cards: EntityTable<Card, 'id'>
  schedules: EntityTable<ScheduleRecord, 'cardId'>
  decks: EntityTable<Deck, 'id'>
}

db.version(1).stores({
  cards: 'id, createdAt',
  schedules: 'cardId, due, state',
})

db.version(2).stores({
  cards: 'id, createdAt',
  schedules: 'cardId, due, state, last_review',
})

db.version(3).stores({
  cards: 'id, createdAt, deckId',
  schedules: 'cardId, due, state, last_review',
  decks: 'id, createdAt',
}).upgrade(async (tx) => {
  await tx.table('decks').add({
    id: crypto.randomUUID(),
    name: 'Default',
    createdAt: Date.now(),
    status: 'active',
  })
  await tx.table('cards').toCollection().modify({ deckId: '' })
})

db.version(4).stores({
  cards: 'id, createdAt, deckId',
  schedules: 'cardId, due, state, last_review',
  decks: 'id, createdAt, status',
}).upgrade(async (tx) => {
  await tx.table('decks').toCollection().modify({ status: 'active' })
})

// Version 5: Backfill explanations from seed data onto existing public deck cards.
// Users who installed decks before the explanation feature was added have cards
// without explanations — this migration adds them by matching front text.
db.version(5).stores({
  cards: 'id, createdAt, deckId',
  schedules: 'cardId, due, state, last_review',
  decks: 'id, createdAt, status',
}).upgrade(async (tx) => {
  // Lazy-import seed data to avoid circular deps / bloating the main module
  const { VIETNAMESE_SEED_CARDS } = await import('./seedData')
  const { YOGA_SEED_CARDS } = await import('./yogaSeedData')
  const { SENTENCES_SEED_CARDS } = await import('./sentencesSeedData')

  const seedMap: Record<string, SeedCard[]> = {
    'default-vietnamese-deck': VIETNAMESE_SEED_CARDS,
    'default-yoga-deck': YOGA_SEED_CARDS,
    'default-sentences-deck': SENTENCES_SEED_CARDS,
  }

  for (const [deckId, seedCards] of Object.entries(seedMap)) {
    // Build a lookup from front text → explanation
    const explanationByFront = new Map<string, string>()
    for (const sc of seedCards) {
      if (sc.explanation) explanationByFront.set(sc.front, sc.explanation)
    }
    if (explanationByFront.size === 0) continue

    // Update existing cards that belong to this deck
    const existingCards = await tx.table('cards').where('deckId').equals(deckId).toArray()
    for (const card of existingCards) {
      const explanation = explanationByFront.get(card.front as string)
      if (explanation && !card.explanation) {
        await tx.table('cards').update(card.id as string, { explanation })
      }
    }
  }
})

export { db }
