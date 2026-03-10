import { useState, useEffect, type FormEvent } from 'react'
import { createDeck, DeckValidationError } from '../domain/decks'
import { addDeck, deleteDeck, getDeckSnapshot, restoreDeck } from '../db/deckRepo'
import { useDeckStats } from '../hooks/useDecks'
import type { Card, Deck } from '../domain/types'
import type { ScheduleRecord } from '../db/db'

interface Props {
  readonly onReviewDeck: (deckId: string, deckName: string) => void
}

interface UndoState {
  deck: Deck
  cards: Card[]
  schedules: ScheduleRecord[]
  timeoutId: ReturnType<typeof setTimeout>
}

export const DeckList = ({ onReviewDeck }: Props) => {
  const deckStats = useDeckStats()
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

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)

    if (undo) {
      clearTimeout(undo.timeoutId)
      setUndo(null)
    }

    const snapshot = await getDeckSnapshot(id)
    await deleteDeck(id)
    const timeoutId = setTimeout(() => setUndo(null), 5000)
    setUndo({ ...snapshot, timeoutId })
  }

  const handleUndo = async () => {
    if (!undo) return
    clearTimeout(undo.timeoutId)
    await restoreDeck(undo.deck, undo.cards, undo.schedules)
    setUndo(null)
  }

  const pendingDeck = pendingDeleteId
    ? deckStats.find((s) => s.deck.id === pendingDeleteId)
    : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Decks</h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New deck name"
          aria-label="Deck name"
          style={{ flex: 1, padding: '8px', background: '#1e1e2e', border: '1px solid #444', borderRadius: '4px', color: '#e0e0e0' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Add Deck</button>
      </form>
      {error && <p style={{ color: 'red', margin: 0 }} role="alert">{error}</p>}

      {deckStats.length === 0 ? (
        <p style={{ color: '#888' }}>No decks yet. Create one above.</p>
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
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>
                  {totalCount} card{totalCount !== 1 ? 's' : ''}
                  {dueCount > 0 && (
                    <span style={{ color: '#27ae60', marginLeft: '8px' }}>
                      · {dueCount} due
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onReviewDeck(deck.id, deck.name)}
                disabled={dueCount === 0}
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
                onClick={() => setPendingDeleteId(deck.id)}
                aria-label={`Delete deck ${deck.name}`}
                style={{ background: 'none', border: '1px solid #555', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', color: '#aaa' }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {pendingDeck && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Confirm deleting ${pendingDeck.deck.name}`}
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
            <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Delete &ldquo;{pendingDeck.deck.name}&rdquo;?</p>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: '0.9rem' }}>
              This will delete {pendingDeck.totalCount} card{pendingDeck.totalCount !== 1 ? 's' : ''} and all review history.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setPendingDeleteId(null)} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
