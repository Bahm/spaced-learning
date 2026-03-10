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

      return Promise.all(
        decks.map(async (deck) => {
          const deckCards = await db.cards.where('deckId').equals(deck.id).toArray()
          const schedules = await db.schedules.bulkGet(deckCards.map((c) => c.id))
          // Cards with no schedule are new — always due. Cards with a schedule are due if due <= now.
          const dueCount = deckCards.filter((_, i) => {
            const s = schedules[i]
            return !s || s.due <= now
          }).length
          return { deck, dueCount, totalCount: deckCards.length }
        }),
      )
    },
    [],
    [],
  ) ?? []

export const useDecks = (): Deck[] =>
  useLiveQuery(() => db.decks.orderBy('createdAt').toArray(), [], []) ?? []
