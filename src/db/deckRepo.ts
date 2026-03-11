import { db, type ScheduleRecord } from './db'
import type { Card, Deck } from '../domain/types'
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

/** Captures deck + all its cards + their schedules before deletion, for undo. */
export const getDeckSnapshot = async (id: string): Promise<{ deck: Deck; cards: Card[]; schedules: ScheduleRecord[] }> => {
  const deck = await db.decks.get(id)
  if (!deck) throw new Error(`Deck ${id} not found`)
  const cards = await db.cards.where('deckId').equals(id).toArray()
  const scheduleOrUndefined = await db.schedules.bulkGet(cards.map((c) => c.id))
  const schedules = scheduleOrUndefined.filter((s): s is ScheduleRecord => s !== undefined)
  return { deck, cards, schedules }
}

/** Re-inserts a previously deleted deck with all its cards and schedules. */
export const restoreDeck = async (deck: Deck, cards: Card[], schedules: ScheduleRecord[]): Promise<void> => {
  await db.transaction('rw', db.decks, db.cards, db.schedules, async () => {
    await db.decks.put(deck)
    await db.cards.bulkPut(cards)
    if (schedules.length > 0) await db.schedules.bulkPut(schedules)
  })
}

export const DEFAULT_DECK_ID = 'default-vietnamese-deck'

// Seeds the Vietnamese vocabulary deck on fresh installs — called on app startup.
// Uses a fixed ID so concurrent calls (e.g. React StrictMode double-invoke) are idempotent.
export const ensureDefaultDeck = async (): Promise<void> => {
  await db.transaction('rw', db.decks, db.cards, async () => {
    const existing = await db.decks.get(DEFAULT_DECK_ID)
    if (existing) return
    const deck: Deck = {
      id: DEFAULT_DECK_ID,
      name: '1000 most common words in Vietnamese',
      createdAt: Date.now(),
    }
    await db.decks.put(deck)
    const cards = VIETNAMESE_SEED_CARDS.map(({ front, back }) =>
      createCard(front, back, deck.id),
    )
    await db.cards.bulkAdd(cards)
  })
}
