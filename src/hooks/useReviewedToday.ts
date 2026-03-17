import { useLiveQuery } from 'dexie-react-hooks'
import { getReviewedTodayCount } from '../db/reviewRepo'

export const useReviewedToday = (): number | undefined =>
  useLiveQuery(() => getReviewedTodayCount(), [])
