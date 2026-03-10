import Dexie, { type EntityTable } from 'dexie'
import type { Card, Deck } from '../domain/types'

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
  const defaultDeck: Deck = {
    id: crypto.randomUUID(),
    name: 'Default',
    createdAt: Date.now(),
  }
  await tx.table('decks').add(defaultDeck)
  await tx.table('cards').toCollection().modify({ deckId: defaultDeck.id })
})

export { db }
