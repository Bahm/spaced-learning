import { useCards } from '../hooks/useCards'
import { deleteCard } from '../db/cardRepo'

export const CardList = () => {
  const cards = useCards()

  if (cards.length === 0) {
    return <p>No cards yet. Add some!</p>
  }

  return (
    <div>
      <h2>All Cards ({cards.length})</h2>
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
              onClick={() => deleteCard(card.id)}
              aria-label={`Delete card: ${card.front}`}
              style={{ background: 'none', border: '1px solid #555', cursor: 'pointer', padding: '4px 8px' }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
