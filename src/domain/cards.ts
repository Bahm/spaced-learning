import type { Card } from './types'

export class CardValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CardValidationError'
  }
}

export const updateCardFields = (card: Card, front: string, back: string, explanation?: string): Card => {
  if (front.trim().length === 0) {
    throw new CardValidationError('Front side cannot be empty')
  }
  if (back.trim().length === 0) {
    throw new CardValidationError('Back side cannot be empty')
  }
  const trimmed = explanation?.trim()
  return {
    id: card.id,
    front: front.trim(),
    back: back.trim(),
    ...(trimmed ? { explanation: trimmed } : {}),
    createdAt: card.createdAt,
    deckId: card.deckId,
  }
}

export const createCard = (front: string, back: string, deckId: string, explanation?: string): Card => {
  if (front.trim().length === 0) {
    throw new CardValidationError('Front side cannot be empty')
  }
  if (back.trim().length === 0) {
    throw new CardValidationError('Back side cannot be empty')
  }
  const trimmed = explanation?.trim()
  return {
    id: crypto.randomUUID(),
    front: front.trim(),
    back: back.trim(),
    ...(trimmed ? { explanation: trimmed } : {}),
    createdAt: Date.now(),
    deckId,
  }
}
