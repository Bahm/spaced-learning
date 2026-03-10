import { db } from './db'
import type { Deck } from '../domain/types'
import { createCard } from '../domain/cards'
import { VIETNAMESE_SEED_CARDS } from './seedData'

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

// Seeds the Vietnamese vocabulary deck on fresh installs — called on app startup.
export const ensureDefaultDeck = async (): Promise<void> => {
  const count = await db.decks.count()
  if (count === 0) {
    const deck: Deck = {
      id: crypto.randomUUID(),
      name: '1000 most common words in Vietnamese',
      createdAt: Date.now(),
    }
    await db.transaction('rw', db.decks, db.cards, async () => {
      await db.decks.add(deck)
      const cards = VIETNAMESE_SEED_CARDS.map(({ front, back }) =>
        createCard(front, back, deck.id),
      )
      await db.cards.bulkAdd(cards)
    })
  }
}
