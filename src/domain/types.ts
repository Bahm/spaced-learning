import type { Card as FSRSCard } from 'ts-fsrs'

export interface Deck {
  readonly id: string
  readonly name: string
  readonly createdAt: number
}

export interface Card {
  readonly id: string
  readonly front: string
  readonly back: string
  readonly createdAt: number
  readonly deckId: string
}

export type { FSRSCard }

export type Rating = 'again' | 'hard' | 'good' | 'easy'
