import type { Card as FSRSCard } from 'ts-fsrs'

export type DeckStatus = 'active' | 'archived' | 'uninstalled'

export interface Deck {
  readonly id: string
  readonly name: string
  readonly createdAt: number
  readonly status: DeckStatus
}

export interface PublicDeckDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly cardCount: number
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
