import { useState, useEffect } from 'react'
import { ReviewSession } from './components/ReviewSession'
import { CardList } from './components/CardList'
import { AddCardForm } from './components/AddCardForm'
import { DeckList } from './components/DeckList'
import { ensureDefaultDeck } from './db/deckRepo'

type Tab = 'review' | 'decks' | 'cards' | 'add'

type View =
  | { type: 'tab'; tab: Tab }
  | { type: 'deck-review'; deckId: string; deckName: string }

const TABS: { id: Tab; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'decks', label: 'Decks' },
  { id: 'cards', label: 'Cards' },
  { id: 'add', label: 'Add' },
]

export default function App() {
  const [view, setView] = useState<View>({ type: 'tab', tab: 'review' })

  useEffect(() => {
    void ensureDefaultDeck()
  }, [])

  const activeTab = view.type === 'tab' ? view.tab : null

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {view.type === 'deck-review' && (
          <button
            onClick={() => setView({ type: 'tab', tab: 'decks' })}
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
            aria-label="Back to decks"
          >
            ←
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          {view.type === 'deck-review' ? view.deckName : 'Spaced Learning'}
        </h1>
      </header>

      {view.type === 'tab' && (
        <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView({ type: 'tab', tab: id })}
              aria-pressed={activeTab === id}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === id ? '#4a4a8a' : '#2a2a3e',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: activeTab === id ? 'bold' : 'normal',
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <main>
        {view.type === 'deck-review' && <ReviewSession deckId={view.deckId} />}
        {view.type === 'tab' && activeTab === 'review' && <ReviewSession />}
        {view.type === 'tab' && activeTab === 'decks' && (
          <DeckList onReviewDeck={(deckId, deckName) => setView({ type: 'deck-review', deckId, deckName })} />
        )}
        {view.type === 'tab' && activeTab === 'cards' && <CardList />}
        {view.type === 'tab' && activeTab === 'add' && <AddCardForm />}
      </main>
    </div>
  )
}
