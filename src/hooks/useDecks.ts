import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Deck } from '../domain/types'

export interface DeckStats {
  readonly deck: Deck
  readonly dueCount: number
  readonly totalCount: number
}

export const useDeckStats = (): DeckStats[] =>
  useLiveQuery(
    async () => {
      const decks = await db.decks.orderBy('createdAt').toArray()
      const now = Date.now()
      const dueRecords = await db.schedules.where('due').belowOrEqual(now).toArray()
      const dueCardIdSet = new Set(dueRecords.map((r) => r.cardId))

      return Promise.all(
        decks.map(async (deck) => {
          const deckCards = await db.cards.where('deckId').equals(deck.id).toArray()
          const dueCount = deckCards.filter((c) => dueCardIdSet.has(c.id)).length
          return { deck, dueCount, totalCount: deckCards.length }
        }),
      )
    },
    [],
    [],
  ) ?? []

export const useDecks = (): Deck[] =>
  useLiveQuery(() => db.decks.orderBy('createdAt').toArray(), [], []) ?? []
