import { useState, type FormEvent } from 'react'
import { createDeck, DeckValidationError } from '../domain/decks'
import { addDeck, deleteDeck } from '../db/deckRepo'
import { useDeckStats } from '../hooks/useDecks'

interface Props {
  readonly onReviewDeck: (deckId: string, deckName: string) => void
}

export const DeckList = ({ onReviewDeck }: Props) => {
  const deckStats = useDeckStats()
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

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
                onClick={() => deleteDeck(deck.id)}
                aria-label={`Delete deck ${deck.name}`}
                style={{ background: 'none', border: '1px solid #555', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', color: '#aaa' }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
