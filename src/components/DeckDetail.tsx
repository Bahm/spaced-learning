import { AddCardForm } from './AddCardForm'
import { CardList } from './CardList'

interface Props {
  readonly deckId: string
  readonly deckName: string
}

export const DeckDetail = ({ deckId, deckName }: Props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <AddCardForm deckId={deckId} />
    <hr style={{ border: 'none', borderTop: '1px solid #333', margin: 0 }} />
    <CardList deckId={deckId} deckName={deckName} />
  </div>
)
