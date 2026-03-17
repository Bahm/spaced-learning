import { useState, useEffect, type FormEvent } from 'react'
import { createDeck, DeckValidationError, PUBLIC_DECK_CATALOG } from '../domain/decks'
import {
  addDeck,
  permanentlyDeleteDeck,
  getDeckSnapshot,
  restoreDeck,
  archiveDeck,
  unarchiveDeck,
  uninstallPublicDeck,
  installPublicDeck,
  isPublicDeck,
} from '../db/deckRepo'
import { useDeckStats, useArchivedDecks, useUninstalledPublicDeckIds } from '../hooks/useDecks'
import type { Card, Deck } from '../domain/types'
import type { ScheduleRecord } from '../db/db'

interface Props {
  readonly onOpenDeck: (deckId: string, deckName: string) => void
  readonly onReviewDeck: (deckId: string, deckName: string) => void
}

interface UndoState {
  deck: Deck
  cards: Card[]
  schedules: ScheduleRecord[]
  timeoutId: ReturnType<typeof setTimeout>
}

export const DeckList = ({ onOpenDeck, onReviewDeck }: Props) => {
  const deckStatsRaw = useDeckStats()
  const archivedDecksRaw = useArchivedDecks()
  const uninstalledIdsRaw = useUninstalledPublicDeckIds()
  const isLoading = deckStatsRaw === undefined || archivedDecksRaw === undefined || uninstalledIdsRaw === undefined
  const deckStats = deckStatsRaw ?? []
  const archivedDecks = archivedDecksRaw ?? []
  const uninstalledIds = uninstalledIdsRaw ?? new Set<string>()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [undo, setUndo] = useState<UndoState | null>(null)

  useEffect(() => {
    return () => {
      if (undo) clearTimeout(undo.timeoutId)
    }
  }, [undo])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await addDeck(createDeck(newName))
      setNewName('')
    } catch (err) {
      setError(err instanceof DeckValidationError ? err.message : 'Failed to create deck')
    }
  }

  const handleRemoveActive = async (deckId: string) => {
    if (isPublicDeck(deckId)) {
      await uninstallPublicDeck(deckId)
    } else {
      await archiveDeck(deckId)
    }
  }

  const handleConfirmPermanentDelete = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)

    if (undo) {
      clearTimeout(undo.timeoutId)
      setUndo(null)
    }

    const snapshot = await getDeckSnapshot(id)
    await permanentlyDeleteDeck(id)
    const timeoutId = setTimeout(() => setUndo(null), 5000)
    setUndo({ ...snapshot, timeoutId })
  }

  const handleUndo = async () => {
    if (!undo) return
    clearTimeout(undo.timeoutId)
    await restoreDeck(undo.deck, undo.cards, undo.schedules)
    setUndo(null)
  }

  const handleInstall = async (catalogId: string, catalogName: string) => {
    await installPublicDeck(catalogId, catalogName)
  }

  const activeDeckIds = new Set(deckStats.map((s) => s.deck.id))
  const availableCatalogEntries = PUBLIC_DECK_CATALOG.filter(
    (entry) => !activeDeckIds.has(entry.id),
  )

  const pendingDeck = pendingDeleteId
    ? archivedDecks.find((d) => d.id === pendingDeleteId)
    : undefined

  if (isLoading) {
    return (
      <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ margin: 0 }}>My Decks</h2>
        <p style={{ color: '#888' }}>Loading…</p>
      </div>
    )
  }

  return (
    <div aria-busy="false" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>My Decks</h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New deck name"
          aria-label="Deck name"
          style={{ flex: 1, padding: '8px', background: '#1e1e2e', border: '1px solid #444', borderRadius: '4px', color: '#e0e0e0' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#4a4a8a', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Add Deck</button>
      </form>
      {error && <p style={{ color: 'red', margin: 0 }} role="alert">{error}</p>}

      {deckStats.length === 0 ? (
        <p style={{ color: '#888' }}>No active decks. Create one above or install from the catalog below.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {deckStats.map(({ deck, dueCount, totalCount }) => (
            <li
              key={deck.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#1e1e2e',
                borderRadius: '8px',
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{deck.name}</strong>
                <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '2px' }}>
                  {totalCount} card{totalCount !== 1 ? 's' : ''}
                  {dueCount > 0 && (
                    <span style={{ color: '#27ae60', marginLeft: '8px' }}>
                      · {dueCount} due
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onOpenDeck(deck.id, deck.name)}
                style={{ padding: '6px 14px', background: '#2980b9', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
              >
                Cards
              </button>
              <button
                onClick={() => onReviewDeck(deck.id, deck.name)}
                disabled={dueCount === 0}
                title={dueCount === 0 ? 'Add cards to this deck before reviewing' : undefined}
                style={{
                  padding: '6px 14px',
                  background: dueCount > 0 ? '#27ae60' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  color: dueCount > 0 ? '#fff' : '#666',
                  cursor: dueCount > 0 ? 'pointer' : 'default',
                }}
              >
                Review
              </button>
              <button
                onClick={() => handleRemoveActive(deck.id)}
                aria-label={isPublicDeck(deck.id) ? `Remove deck ${deck.name}` : `Archive deck ${deck.name}`}
                title={isPublicDeck(deck.id) ? 'Remove from My Decks (review history preserved)' : 'Archive deck'}
                style={{ background: 'none', border: '1px solid #555', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', color: '#ccc' }}
              >
                {isPublicDeck(deck.id) ? '✕' : '📦'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Public Decks Catalog ─────────────────────────────────────────────── */}
      {availableCatalogEntries.length > 0 && (
        <>
          <h2 style={{ margin: '16px 0 0' }}>Public Decks</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableCatalogEntries.map((entry) => {
              const wasUninstalled = uninstalledIds.has(entry.id)
              return (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: '#1e1e2e',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{entry.name}</strong>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '2px' }}>
                      {entry.description}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>
                      {entry.cardCount} cards
                      {wasUninstalled && (
                        <span style={{ color: '#e67e22', marginLeft: '8px' }}>· review history preserved</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleInstall(entry.id, entry.name)}
                    style={{ padding: '6px 14px', background: '#27ae60', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                  >
                    {wasUninstalled ? 'Reinstall' : 'Install'}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {/* ── Archived Decks ───────────────────────────────────────────────────── */}
      {archivedDecks.length > 0 && (
        <>
          <h2 style={{ margin: '16px 0 0' }}>Archived Decks</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {archivedDecks.map((deck) => (
              <li
                key={deck.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#1e1e2e',
                  borderRadius: '8px',
                  opacity: 0.7,
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{deck.name}</strong>
                </div>
                <button
                  onClick={() => unarchiveDeck(deck.id)}
                  style={{ padding: '6px 14px', background: '#2980b9', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                >
                  Unarchive
                </button>
                <button
                  onClick={() => setPendingDeleteId(deck.id)}
                  aria-label={`Delete deck ${deck.name}`}
                  style={{ padding: '6px 14px', background: '#c0392b', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── Confirm permanent delete dialog ──────────────────────────────────── */}
      {pendingDeck && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm deleting ${pendingDeck.name}`}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: '#1e1e2e', borderRadius: '12px', padding: '24px', maxWidth: '360px', width: '90%' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Permanently delete &ldquo;{pendingDeck.name}&rdquo;?</p>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: '0.9rem' }}>
              This will permanently delete all cards and review history. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPendingDeleteId(null)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                style={{ padding: '8px 16px', cursor: 'pointer', background: '#c0392b', border: 'none', borderRadius: '4px', color: '#fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {undo && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2a2a3e',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
          }}
        >
          <span>Deck deleted</span>
          <button
            onClick={handleUndo}
            style={{ padding: '4px 12px', cursor: 'pointer', borderRadius: '4px' }}
          >
            Undo
          </button>
        </div>
      )}
    </div>
  )
}
