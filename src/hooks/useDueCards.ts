import { useLiveQuery } from 'dexie-react-hooks'
import { getDueCards } from '../db/reviewRepo'
import type { Card } from '../domain/types'

export const useDueCards = (): Card[] =>
  useLiveQuery(() => getDueCards(), [], []) ?? []
