import { db } from './db'
import type { Card } from '../domain/types'

export const addCard = (card: Card): Promise<string> => db.cards.add(card)

export const getAllCards = (): Promise<Card[]> =>
  db.cards.orderBy('createdAt').toArray()

export const getCardsByDeck = (deckId: string): Promise<Card[]> =>
  db.cards.where('deckId').equals(deckId).sortBy('createdAt')

export const deleteCard = async (id: string): Promise<void> => {
  await db.transaction('rw', db.cards, db.schedules, async () => {
    await db.cards.delete(id)
    await db.schedules.delete(id)
  })
}
