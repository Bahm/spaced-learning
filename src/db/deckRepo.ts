import { db, type ScheduleRecord } from './db'
import type { Card, Deck } from '../domain/types'
import { createCard } from '../domain/cards'
import type { SeedCard } from './seedData'
import { VIETNAMESE_SEED_CARDS } from './seedData'
import { YOGA_SEED_CARDS } from './yogaSeedData'
import { SENTENCES_SEED_CARDS } from './sentencesSeedData'
import { FOOD_SEED_CARDS } from './foodSeedData'

export const addDeck = (deck: Deck): Promise<string> => db.decks.add(deck)

export const DEFAULT_DECK_ID = 'default-vietnamese-deck'
export const YOGA_DECK_ID = 'default-yoga-deck'
export const SENTENCES_DECK_ID = 'default-sentences-deck'
export const FOOD_DECK_ID = 'default-food-deck'

/** Map of public deck IDs to their seed card data. */
const SEED_CARD_MAP: Record<string, SeedCard[]> = {
  [DEFAULT_DECK_ID]: VIETNAMESE_SEED_CARDS,
  [YOGA_DECK_ID]: YOGA_SEED_CARDS,
  [SENTENCES_DECK_ID]: SENTENCES_SEED_CARDS,
  [FOOD_DECK_ID]: FOOD_SEED_CARDS,
}

/** Checks whether a given deck ID is a public (catalog) deck. */
export const isPublicDeck = (deckId: string): boolean => deckId in SEED_CARD_MAP

// ── Lifecycle actions ──────────────────────────────────────────────────────────

export const archiveDeck = (id: string): Promise<number> =>
  db.decks.update(id, { status: 'archived' })

export const unarchiveDeck = (id: string): Promise<number> =>
  db.decks.update(id, { status: 'active' })

export const uninstallPublicDeck = (id: string): Promise<number> =>
  db.decks.update(id, { status: 'uninstalled' })

/** Installs (or reinstalls) a public deck from the catalog. */
export const installPublicDeck = async (catalogId: string, catalogName: string): Promise<void> => {
  const seedCards = SEED_CARD_MAP[catalogId]
  if (!seedCards) throw new Error(`Unknown public deck: ${catalogId}`)

  await db.transaction('rw', db.decks, db.cards, async () => {
    const existing = await db.decks.get(catalogId)
    if (existing) {
      // Reinstall — just flip status back to active (cards+schedules preserved)
      await db.decks.update(catalogId, { status: 'active' })
    } else {
      // Fresh install
      const deck: Deck = {
        id: catalogId,
        name: catalogName,
        createdAt: Date.now(),
        status: 'active',
      }
      await db.decks.put(deck)
      const cards = seedCards.map(({ front, back, explanation }) =>
        createCard(front, back, deck.id, explanation),
      )
      await db.cards.bulkAdd(cards)
    }
  })
}

// ── Permanent delete (cascade) ──────────────────────────────────────────────────

export const permanentlyDeleteDeck = async (id: string): Promise<void> => {
  await db.transaction('rw', db.decks, db.cards, db.schedules, async () => {
    const cards = await db.cards.where('deckId').equals(id).toArray()
    const cardIds = cards.map((c) => c.id)
    await db.schedules.bulkDelete(cardIds)
    await db.cards.where('deckId').equals(id).delete()
    await db.decks.delete(id)
  })
}

// ── Snapshot / Restore (for undo) ────────────────────────────────────────────────

/** Captures deck + all its cards + their schedules before deletion, for undo. */
export const getDeckSnapshot = async (id: string): Promise<{ deck: Deck; cards: Card[]; schedules: ScheduleRecord[] }> => {
  const deck = await db.decks.get(id)
  if (!deck) throw new Error(`Deck ${id} not found`)
  const cards = await db.cards.where('deckId').equals(id).toArray()
  const scheduleOrUndefined = await db.schedules.bulkGet(cards.map((c) => c.id))
  const schedules = scheduleOrUndefined.filter((s): s is ScheduleRecord => s !== undefined)
  return { deck, cards, schedules }
}

/** Re-inserts a previously deleted deck with all its cards and schedules. */
export const restoreDeck = async (deck: Deck, cards: Card[], schedules: ScheduleRecord[]): Promise<void> => {
  await db.transaction('rw', db.decks, db.cards, db.schedules, async () => {
    await db.decks.put(deck)
    await db.cards.bulkPut(cards)
    if (schedules.length > 0) await db.schedules.bulkPut(schedules)
  })
}
