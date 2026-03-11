import { useEffect, useRef } from 'react'
import { useReview } from '../hooks/useReview'
import { useReviewedToday } from '../hooks/useReviewedToday'
import type { Rating } from '../domain/types'

const RATINGS: { label: string; value: Rating; color: string; key: string }[] = [
  { label: 'Again', value: 'again', color: '#c0392b', key: '1' },
  { label: 'Hard', value: 'hard', color: '#e67e22', key: '2' },
  { label: 'Good', value: 'good', color: '#27ae60', key: '3' },
  { label: 'Easy', value: 'easy', color: '#2980b9', key: '4' },
]

interface Props {
  readonly deckId?: string
}

export const ReviewSession = ({ deckId }: Props = {}) => {
  const { currentCard, remaining, isRevealed, reveal, rate } = useReview(deckId)
  const reviewedToday = useReviewedToday()

  // Use refs so the stable event listener always has the latest values
  const isRevealedRef = useRef(isRevealed)
  const revealRef = useRef(reveal)
  const rateRef = useRef(rate)
  const hasCardRef = useRef(!!currentCard)
  isRevealedRef.current = isRevealed
  revealRef.current = reveal
  rateRef.current = rate
  hasCardRef.current = !!currentCard

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!hasCardRef.current) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (!isRevealedRef.current && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault()
        revealRef.current()
      } else if (isRevealedRef.current) {
        const idx = ['1', '2', '3', '4'].indexOf(e.key)
        if (idx !== -1) {
          const rating = RATINGS[idx]
          if (rating) void rateRef.current(rating.value)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, []) // stable: runs once, reads live values through refs

  if (!currentCard) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>All done!</h2>
        <p>No cards due for review. Great work!</p>
        {reviewedToday > 0 && (
          <p style={{ color: '#888' }}>Reviewed today: {reviewedToday}</p>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}>
        <span>{remaining} card{remaining !== 1 ? 's' : ''} remaining</span>
        {reviewedToday > 0 && <span>Reviewed today: {reviewedToday}</span>}
      </div>

      <div
        style={{
          background: '#1e1e2e',
          borderRadius: '8px',
          padding: '24px',
          minHeight: '120px',
        }}
      >
        <p style={{ fontSize: '1.2rem' }}>{currentCard.front}</p>
      </div>

      {!isRevealed ? (
        <button onClick={reveal} style={{ padding: '12px' }}>
          Show Answer
        </button>
      ) : (
        <>
          <div
            style={{
              background: '#16213e',
              borderRadius: '8px',
              padding: '24px',
              minHeight: '80px',
            }}
          >
            <p>{currentCard.back}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {RATINGS.map(({ label, value, color }) => (
              <button
                key={value}
                onClick={() => rate(value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: color,
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
