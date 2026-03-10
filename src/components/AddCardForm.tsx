import { useState, type FormEvent } from 'react'
import { createCard } from '../domain/cards'
import { addCard } from '../db/cardRepo'
import { upsertSchedule } from '../db/reviewRepo'
import { createNewSchedule } from '../domain/scheduler'
import { useDecks } from '../hooks/useDecks'

export const AddCardForm = () => {
  const decks = useDecks()
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [deckId, setDeckId] = useState('')
  const [error, setError] = useState('')

  // Default to the first deck when decks load
  const selectedDeckId = deckId || decks[0]?.id || ''

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!selectedDeckId) {
      setError('Create a deck first in the Decks tab')
      return
    }
    try {
      const card = createCard(front, back, selectedDeckId)
      await addCard(card)
      await upsertSchedule(card.id, createNewSchedule())
      setFront('')
      setBack('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h2>Add Card</h2>
      {error && <p style={{ color: 'red' }} role="alert">{error}</p>}
      <label>
        Deck
        <select
          value={selectedDeckId}
          onChange={(e) => setDeckId(e.target.value)}
          style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px', background: '#1e1e2e', border: '1px solid #444', borderRadius: '4px', color: '#e0e0e0' }}
        >
          {decks.length === 0 ? (
            <option value="">No decks — create one first</option>
          ) : (
            decks.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))
          )}
        </select>
      </label>
      <label>
        Front
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Question or prompt"
          rows={3}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <label>
        Back
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Answer"
          rows={3}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <button type="submit">Add Card</button>
    </form>
  )
}
