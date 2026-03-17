import { useState, useEffect, useRef, type FormEvent } from 'react'
import { createCard } from '../domain/cards'
import { addCard } from '../db/cardRepo'
import { upsertSchedule } from '../db/reviewRepo'
import { createNewSchedule } from '../domain/scheduler'

interface Props {
  readonly deckId: string
}

export const AddCardForm = ({ deckId }: Props) => {
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const card = createCard(front, back, deckId, explanation || undefined)
      await addCard(card)
      await upsertSchedule(card.id, createNewSchedule())
      setFront('')
      setBack('')
      setExplanation('')
      setSuccess(true)
      if (successTimer.current) clearTimeout(successTimer.current)
      successTimer.current = setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ margin: 0 }}>Add Card</h3>
      {error && <p style={{ color: 'red', margin: 0 }} role="alert">{error}</p>}
      {success && <p style={{ color: '#27ae60', margin: 0 }} role="status">Card added!</p>}
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
      <label>
        Explanation
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Optional — e.g. example usage in a sentence"
          rows={2}
          style={{ display: 'block', width: '100%', marginTop: '4px' }}
        />
      </label>
      <button type="submit" style={{ padding: '10px', background: '#4a4a8a', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Add Card</button>
    </form>
  )
}
