import { describe, it, expect } from 'vitest'
import { createNewSchedule, getNextSchedule } from '../../src/domain/scheduler'
import { State } from 'ts-fsrs'

describe('createNewSchedule', () => {
  it('returns a new card with zero state', () => {
    const schedule = createNewSchedule()
    expect(schedule.state).toBe(State.New)
    expect(schedule.reps).toBe(0)
    expect(schedule.lapses).toBe(0)
  })
})

describe('getNextSchedule', () => {
  it('returns an updated schedule after a Good rating', () => {
    const schedule = createNewSchedule()
    const now = new Date()
    const next = getNextSchedule(schedule, 'good', now)
    expect(next.reps).toBeGreaterThan(0)
    expect(next.due.getTime()).toBeGreaterThanOrEqual(now.getTime())
  })

  it('returns a schedule sooner for Again than for Good', () => {
    const schedule = createNewSchedule()
    const now = new Date()
    const again = getNextSchedule(schedule, 'again', now)
    const good = getNextSchedule(schedule, 'good', now)
    expect(again.due.getTime()).toBeLessThan(good.due.getTime())
  })

  it('returns a schedule later for Easy than for Good', () => {
    const schedule = createNewSchedule()
    const now = new Date()
    const good = getNextSchedule(schedule, 'good', now)
    const easy = getNextSchedule(schedule, 'easy', now)
    expect(easy.due.getTime()).toBeGreaterThan(good.due.getTime())
  })
})
