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
      const decks = await db.decks.where('status').equals('active').sortBy('createdAt')
      const now = Date.now()

      return Promise.all(
        decks.map(async (deck) => {
          const deckCards = await db.cards.where('deckId').equals(deck.id).toArray()
          const schedules = await db.schedules.bulkGet(deckCards.map((c) => c.id))
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

export const useArchivedDecks = (): Deck[] =>
  useLiveQuery(
    () => db.decks.where('status').equals('archived').sortBy('createdAt'),
    [],
    [],
  ) ?? []

export const useUninstalledPublicDeckIds = (): Set<string> => {
  const ids = useLiveQuery(
    async () => {
      const uninstalled = await db.decks.where('status').equals('uninstalled').toArray()
      return uninstalled.map((d) => d.id)
    },
    [],
    [] as string[],
  ) ?? []
  return new Set(ids)
}

export const useDecks = (): Deck[] =>
  useLiveQuery(() => db.decks.orderBy('createdAt').toArray(), [], []) ?? []
