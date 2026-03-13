import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Card } from '../domain/types'

export const useCards = (deckId?: string): Card[] | undefined =>
  useLiveQuery(
    () =>
      deckId
        ? db.cards.where('deckId').equals(deckId).sortBy('createdAt')
        : db.cards.orderBy('createdAt').toArray(),
    [deckId],
  )
