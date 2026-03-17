import { db, type ScheduleRecord } from './db'
import type { Card } from '../domain/types'

export const addCard = (card: Card): Promise<string> => db.cards.add(card)

export const getAllCards = (): Promise<Card[]> =>
  db.cards.orderBy('createdAt').toArray()

export const getCardsByDeck = (deckId: string): Promise<Card[]> =>
  db.cards.where('deckId').equals(deckId).sortBy('createdAt')

export const updateCard = (card: Card): Promise<string> => db.cards.put(card)

export const deleteCard = async (id: string): Promise<void> => {
  await db.transaction('rw', db.cards, db.schedules, async () => {
    await db.cards.delete(id)
    await db.schedules.delete(id)
  })
}

/** Captures card + its schedule record before deletion, for undo. */
export const getCardSnapshot = async (id: string): Promise<{ card: Card; schedule: ScheduleRecord | undefined }> => {
  const card = await db.cards.get(id)
  if (!card) throw new Error(`Card ${id} not found`)
  const schedule = await db.schedules.get(id)
  return { card, schedule }
}

/** Re-inserts a previously deleted card and its schedule. */
export const restoreCard = async (card: Card, schedule: ScheduleRecord | undefined): Promise<void> => {
  await db.transaction('rw', db.cards, db.schedules, async () => {
    await db.cards.put(card)
    if (schedule) await db.schedules.put(schedule)
  })
}
