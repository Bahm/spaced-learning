import { db, type ScheduleRecord } from './db'
import type { FSRSCard } from '../domain/types'

const fsrsCardToRecord = (cardId: string, fsrsCard: FSRSCard): ScheduleRecord => ({
  cardId,
  due: fsrsCard.due.getTime(),
  stability: fsrsCard.stability,
  difficulty: fsrsCard.difficulty,
  elapsed_days: fsrsCard.elapsed_days,
  scheduled_days: fsrsCard.scheduled_days,
  reps: fsrsCard.reps,
  lapses: fsrsCard.lapses,
  learning_steps: fsrsCard.learning_steps,
  state: fsrsCard.state,
  last_review: fsrsCard.last_review?.getTime(),
})

const recordToFsrsCard = (record: ScheduleRecord): FSRSCard => ({
  due: new Date(record.due),
  stability: record.stability,
  difficulty: record.difficulty,
  elapsed_days: record.elapsed_days,
  scheduled_days: record.scheduled_days,
  reps: record.reps,
  lapses: record.lapses,
  learning_steps: record.learning_steps,
  state: record.state,
  last_review: record.last_review ? new Date(record.last_review) : undefined,
})

export const getSchedule = async (cardId: string): Promise<FSRSCard | undefined> => {
  const record = await db.schedules.get(cardId)
  return record ? recordToFsrsCard(record) : undefined
}

export const upsertSchedule = (cardId: string, fsrsCard: FSRSCard): Promise<string> =>
  db.schedules.put(fsrsCardToRecord(cardId, fsrsCard))

export const getReviewedTodayCount = (now: Date = new Date()): Promise<number> => {
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000
  return db.schedules
    .where('last_review')
    .between(startOfDay, endOfDay, true, false)
    .count()
}

export const getDueCardsByDeck = async (deckId: string, now: Date = new Date()) => {
  const deckCards = await db.cards.where('deckId').equals(deckId).toArray()
  const schedules = await db.schedules.bulkGet(deckCards.map((c) => c.id))
  // Cards with no schedule are new — always due. Cards with a schedule are due if due <= now.
  return deckCards.filter((_, i) => {
    const schedule = schedules[i]
    return !schedule || schedule.due <= now.getTime()
  })
}

export const getDueCards = async (now: Date = new Date()) => {
  // Only include cards from active decks
  const activeDecks = await db.decks.where('status').equals('active').toArray()
  const activeDeckIds = new Set(activeDecks.map((d) => d.id))
  const allCards = (await db.cards.toArray()).filter((c) => activeDeckIds.has(c.deckId))
  const schedules = await db.schedules.bulkGet(allCards.map((c) => c.id))
  // Cards with no schedule are new — always due. Cards with a schedule are due if due <= now.
  return allCards.filter((_, i) => {
    const schedule = schedules[i]
    return !schedule || schedule.due <= now.getTime()
  })
}
