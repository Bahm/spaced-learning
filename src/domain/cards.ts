import type { Card } from './types'

export class CardValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CardValidationError'
  }
}

export const createCard = (front: string, back: string, deckId: string): Card => {
  if (front.trim().length === 0) {
    throw new CardValidationError('Front side cannot be empty')
  }
  if (back.trim().length === 0) {
    throw new CardValidationError('Back side cannot be empty')
  }
  return {
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
    createdAt: Date.now(),
    deckId,
  }
}
