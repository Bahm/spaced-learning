import { useState, useEffect, useCallback } from 'react'
import { ReviewSession } from './components/ReviewSession'
import { DeckList } from './components/DeckList'
import { DeckDetail } from './components/DeckDetail'

type Tab = 'review' | 'decks'

type View =
  | { type: 'tab'; tab: Tab }
  | { type: 'deck-review'; deckId: string; deckName: string }
  | { type: 'deck-detail'; deckId: string; deckName: string }

const TABS: { id: Tab; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'decks', label: 'Decks' },
]

export default function App() {
  const [view, setViewState] = useState<View>({ type: 'tab', tab: 'review' })

  const navigate = useCallback((newView: View) => {
    const isSubView = newView.type === 'deck-review' || newView.type === 'deck-detail'
    if (isSubView) {
      history.pushState(newView, '')
    } else {
      history.replaceState(newView, '')
    }
    setViewState(newView)
  }, [])

  useEffect(() => {
    // Set initial state so popstate has something to land on
    history.replaceState(view, '')

    const onPopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state === 'object' && 'type' in e.state) {
        setViewState(e.state as View)
      } else {
        setViewState({ type: 'tab', tab: 'review' })
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeTab = view.type === 'tab' ? view.tab : null
  const isSubView = view.type === 'deck-review' || view.type === 'deck-detail'
  const subViewName = isSubView ? view.deckName : ''

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isSubView && (
          <button
            onClick={() => history.back()}
            aria-label="← Decks"
            style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
          >
            ←
          </button>
        )}
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          {isSubView ? subViewName : 'Spaced Learning'}
        </h1>
      </header>

      {!isSubView && (
        <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => navigate({ type: 'tab', tab: id })}
              aria-pressed={activeTab === id}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === id ? '#4a4a8a' : '#37375a',
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
        {view.type === 'deck-detail' && <DeckDetail deckId={view.deckId} deckName={view.deckName} />}
        {view.type === 'tab' && activeTab === 'review' && <ReviewSession />}
        {view.type === 'tab' && activeTab === 'decks' && (
          <DeckList
            onOpenDeck={(deckId, deckName) => navigate({ type: 'deck-detail', deckId, deckName })}
            onReviewDeck={(deckId, deckName) => navigate({ type: 'deck-review', deckId, deckName })}
          />
        )}
      </main>
    </div>
  )
}
