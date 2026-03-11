import { useState, useEffect } from 'react'
import { useCards } from '../hooks/useCards'
import { deleteCard, getCardSnapshot, restoreCard } from '../db/cardRepo'
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

export const CardList = ({ deckId, deckName }: Props) => {
  const cards = useCards(deckId)
  const [undo, setUndo] = useState<UndoState | null>(null)

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
    const snapshot = await getCardSnapshot(id)
    await deleteCard(id)
    const timeoutId = setTimeout(() => setUndo(null), 5000)
    setUndo({ ...snapshot, timeoutId })
  }

  const handleUndo = async () => {
    if (!undo) return
    clearTimeout(undo.timeoutId)
    await restoreCard(undo.card, undo.schedule)
    setUndo(null)
  }

  return (
    <div>
      <h2>{deckName} — Cards ({cards.length})</h2>
      {cards.length === 0 && !undo && <p style={{ color: '#888' }}>No cards yet. Add one above.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {cards.map((card) => (
          <li
            key={card.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              borderBottom: '1px solid #333',
            }}
          >
            <div>
              <strong>{card.front}</strong>
              <span style={{ color: '#888', marginLeft: '8px' }}>→ {card.back}</span>
            </div>
            <button
              onClick={() => handleDelete(card.id)}
              aria-label={`Delete card: ${card.front}`}
              style={{ background: 'none', border: '1px solid #555', cursor: 'pointer', padding: '4px 8px' }}
            >
              ✕
            </button>
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
