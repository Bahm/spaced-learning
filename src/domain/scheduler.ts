import { FSRS, Rating as FSRSRating, createEmptyCard } from 'ts-fsrs'
import type { FSRSCard, Rating } from './types'

const fsrs = new FSRS({})

export const createNewSchedule = (): FSRSCard => createEmptyCard()

const ratingMap: Record<Rating, FSRSRating> = {
  again: FSRSRating.Again,
  hard: FSRSRating.Hard,
  good: FSRSRating.Good,
  easy: FSRSRating.Easy,
}

export const getNextSchedule = (
  fsrsCard: FSRSCard,
  rating: Rating,
  now: Date = new Date(),
): FSRSCard => {
  const result = fsrs.repeat(fsrsCard, now)
  const fsrsRating = ratingMap[rating]
  // result is keyed by numeric FSRSRating value
  const next = (result as unknown as Record<number, { card: FSRSCard } | undefined>)[fsrsRating]
  if (!next) throw new Error(`No schedule for rating: ${rating}`)
  return next.card
}
