import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDueCards, getDueCardsByDeck, getSchedule, upsertSchedule } from '../db/reviewRepo'
import { createNewSchedule, getNextSchedule } from '../domain/scheduler'
import type { Card, Rating } from '../domain/types'

interface ReviewState {
  readonly currentCard: Card | null
  readonly remaining: number
  readonly isLoading: boolean
  readonly isRevealed: boolean
  readonly reveal: () => void
  readonly rate: (rating: Rating) => Promise<void>
}

export const useReview = (deckId?: string): ReviewState => {
  const [isRevealed, setIsRevealed] = useState(false)

  const dueCards =
    useLiveQuery(
      () => (deckId ? getDueCardsByDeck(deckId) : getDueCards()),
      [deckId],
    )
  const isLoading = dueCards === undefined
  const currentCard = dueCards?.[0] ?? null

  const reveal = () => setIsRevealed(true)

  const rate = async (rating: Rating): Promise<void> => {
    if (!currentCard) return
    const existing = await getSchedule(currentCard.id)
    const fsrsCard = existing ?? createNewSchedule()
    const next = getNextSchedule(fsrsCard, rating)
    await upsertSchedule(currentCard.id, next)
    setIsRevealed(false)
  }

  return {
    currentCard,
    remaining: dueCards?.length ?? 0,
    isLoading,
    isRevealed,
    reveal,
    rate,
  }
}
