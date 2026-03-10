import { db } from './db'
import type { Deck } from '../domain/types'

export const addDeck = (deck: Deck): Promise<string> => db.decks.add(deck)

export const getAllDecks = (): Promise<Deck[]> =>
  db.decks.orderBy('createdAt').toArray()

export const deleteDeck = async (id: string): Promise<void> => {
  await db.transaction('rw', db.decks, db.cards, db.schedules, async () => {
    const cards = await db.cards.where('deckId').equals(id).toArray()
    const cardIds = cards.map((c) => c.id)
    await db.schedules.bulkDelete(cardIds)
    await db.cards.where('deckId').equals(id).delete()
    await db.decks.delete(id)
  })
}

// Ensures at least one deck exists — called on app startup for fresh installs.
export const ensureDefaultDeck = async (): Promise<void> => {
  const count = await db.decks.count()
  if (count === 0) {
    await db.decks.add({
      id: crypto.randomUUID(),
      name: 'Default',
      createdAt: Date.now(),
    })
  }
}
