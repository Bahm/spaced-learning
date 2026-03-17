import { useState, useEffect, type FormEvent } from 'react'
import { useCards } from '../hooks/useCards'
import { deleteCard, getCardSnapshot, restoreCard, updateCard } from '../db/cardRepo'
import { updateCardFields, CardValidationError } from '../domain/cards'
import type { Card } from '../domain/types'
import type { ScheduleRecord } from '../db/db'

interface UndoState {
  card: Card
  schedule: ScheduleRecord | undefined
  timeoutId: ReturnType<typeof setTimeout>
}

interface Props {
  readonly deckId: string
  readonly deckName: string
}

const EditCardForm = ({ card, onSave, onCancel }: {
  readonly card: Card
  readonly onSave: (updated: Card) => void
  readonly onCancel: () => void
}) => {
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [explanation, setExplanation] = useState(card.explanation ?? '')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const updated = updateCardFields(card, front, back, explanation || undefined)
      onSave(updated)
    } catch (err) {
      setError(err instanceof CardValidationError ? err.message : 'Failed to update card')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: '#1e1e2e', borderRadius: '4px' }}>
      {error && <p style={{ color: 'red', margin: 0 }} role="alert">{error}</p>}
      <label>
        Front
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          rows={2}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <label>
        Back
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          rows={2}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <label>
        Explanation
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Optional"
          rows={2}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" style={{ padding: '6px 12px', background: '#4a4a8a', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Save</button>
        <button type="button" onClick={onCancel} style={{ padding: '6px 12px', background: 'none', border: '1px solid #555', borderRadius: '4px', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
      </div>
    </form>
  )
}

export const CardList = ({ deckId, deckName }: Props) => {
  const cardsRaw = useCards(deckId)
  const isLoading = cardsRaw === undefined
  const cards = cardsRaw ?? []
  const [undo, setUndo] = useState<UndoState | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (undo) clearTimeout(undo.timeoutId)
    }
  }, [undo])

  const handleDelete = async (id: string) => {
    if (undo) {
      clearTimeout(undo.timeoutId)
      setUndo(null)
    }
    setEditingCardId(null)
    const snapshot = await getCardSnapshot(id)
    await deleteCard(id)
    const timeoutId = setTimeout(() => setUndo(null), 7000)
    setUndo({ ...snapshot, timeoutId })
  }

  const handleUndo = async () => {
    if (!undo) return
    clearTimeout(undo.timeoutId)
    await restoreCard(undo.card, undo.schedule)
    setUndo(null)
  }

  const handleSave = async (updated: Card) => {
    await updateCard(updated)
    setEditingCardId(null)
  }

  return (
    <div aria-busy={isLoading}>
      <h2>{deckName} — Cards {isLoading ? '' : `(${cards.length})`}</h2>
      {!isLoading && cards.length === 0 && !undo && <p style={{ color: '#888' }}>No cards yet. Add one above.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cards.map((card) => (
          <li
            key={card.id}
            style={{
              padding: '8px',
              borderBottom: '1px solid #333',
            }}
          >
            {editingCardId === card.id ? (
              <EditCardForm
                card={card}
                onSave={handleSave}
                onCancel={() => setEditingCardId(null)}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{card.front}</strong>
                  <span style={{ color: '#aaa', marginLeft: '8px' }}>→ {card.back}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setEditingCardId(card.id)}
                    aria-label={`Edit card: ${card.front}`}
                    style={{ background: 'none', border: '1px solid #555', cursor: 'pointer', padding: '4px 8px', color: '#5dade2' }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    aria-label={`Delete card: ${card.front}`}
                    style={{ background: 'none', border: '1px solid #555', cursor: 'pointer', padding: '4px 8px', color: '#e74c3c' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

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
          <span>Card deleted</span>
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
