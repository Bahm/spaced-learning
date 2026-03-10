import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Card } from '../domain/types'

export const useCards = (): Card[] =>
  useLiveQuery(() => db.cards.orderBy('createdAt').toArray(), [], []) ?? []
