import { test, expect } from '@playwright/test'

test.describe('Flashcard app', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Clear IndexedDB between tests
    await page.evaluate(async () => {
      const dbs = await indexedDB.databases()
      for (const db of dbs) {
        if (db.name) indexedDB.deleteDatabase(db.name)
      }
    })
    await page.reload()
    // Wait for seed deck + 1000 cards to be inserted on fresh install
    await page.waitForTimeout(1000)
  })

  test('add a card and see it in the card list', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click()

    // Default deck is pre-selected; just fill front and back
    await page.getByLabel('Front').fill('What is the capital of France?')
    await page.getByLabel('Back').fill('Paris')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Cards' }).click()
    await expect(page.getByText('What is the capital of France?')).toBeVisible()
    await expect(page.getByText('Paris')).toBeVisible()
  })

  test('review a card with Good rating removes it from the due queue temporarily', async ({ page }) => {
    // Create a dedicated deck so we can review it in isolation
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Math')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Deck').selectOption({ label: 'Math' })
    await page.getByLabel('Front').fill('What is 2 + 2?')
    await page.getByLabel('Back').fill('4')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Decks' }).click()
    await page.locator('li').filter({ hasText: 'Math' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('What is 2 + 2?')).toBeVisible()

    await page.getByRole('button', { name: 'Show Answer' }).click()
    await expect(page.getByText('4')).toBeVisible()
    await page.getByRole('button', { name: 'Good' }).click()

    await expect(page.getByText('All done!')).toBeVisible()
  })

  test('add card form shows error for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click()
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    // Also test front filled but back empty
    await page.getByLabel('Front').fill('Some question')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('alert')).toContainText('Back')
  })

  test('add card form shows success feedback after adding', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Front').fill('What is 1 + 1?')
    await page.getByLabel('Back').fill('2')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('empty deck name shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByRole('button', { name: 'Add Deck' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('Review button is disabled for empty decks', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Empty Deck')
    await page.getByRole('button', { name: 'Add Deck' }).click()
    const emptyDeckRow = page.locator('li').filter({ hasText: 'Empty Deck' })
    const reviewBtn = emptyDeckRow.getByRole('button', { name: 'Review' })
    await expect(reviewBtn).toBeDisabled()
  })

  test('card count updates after add and delete', async ({ page }) => {
    await page.getByRole('button', { name: 'Cards' }).click()
    const heading = page.getByRole('heading', { name: /All Cards/ })
    const initialText = await heading.textContent()
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] ?? '0')

    // Add a card
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Front').fill('Test front')
    await page.getByLabel('Back').fill('Test back')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Cards' }).click()
    await expect(heading).toContainText(String(initialCount + 1))

    // Delete the card
    await page.getByRole('button', { name: 'Delete card: Test front' }).click()
    await expect(heading).toContainText(String(initialCount))
  })

  test('keyboard shortcut Space reveals answer', async ({ page }) => {
    // Create an isolated deck for this test
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('KB Test')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Deck').selectOption({ label: 'KB Test' })
    await page.getByLabel('Front').fill('Press space')
    await page.getByLabel('Back').fill('Done')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Decks' }).click()
    await page.locator('li').filter({ hasText: 'KB Test' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Press space')).toBeVisible()

    await page.keyboard.press('Space')
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('keyboard shortcuts 1-4 rate cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('KB Rate')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Deck').selectOption({ label: 'KB Rate' })
    await page.getByLabel('Front').fill('Rate me')
    await page.getByLabel('Back').fill('Answer')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Decks' }).click()
    await page.locator('li').filter({ hasText: 'KB Rate' }).getByRole('button', { name: 'Review' }).click()
    // Wait for the card to appear, then press Space to reveal
    await expect(page.getByText('Rate me')).toBeVisible()
    await page.keyboard.press('Space')
    // Rating buttons appear after reveal (more specific than checking 'Answer' text which matches 'Show Answer' too)
    await expect(page.getByRole('button', { name: 'Good' })).toBeVisible()

    await page.keyboard.press('3')
    await expect(page.getByText('All done!')).toBeVisible()
  })

  test('mobile nav shows all tabs at 390px width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const tabs = ['Review', 'Decks', 'Cards', 'Add']
    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('delete a card then undo restores it', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Front').fill('Capital of Japan')
    await page.getByLabel('Back').fill('Tokyo')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: 'Cards' }).click()
    await expect(page.getByText('Capital of Japan')).toBeVisible()

    await page.getByRole('button', { name: 'Delete card: Capital of Japan' }).click()
    await expect(page.getByText('Capital of Japan')).not.toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByText('Capital of Japan')).toBeVisible()
  })

  test('delete a deck requires confirmation and cancel keeps it', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('History')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'History' }).getByRole('button', { name: /delete deck history/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('History')).toBeVisible()
  })

  test('delete a deck then undo restores it', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Geography')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    // Add a card to the deck
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Deck').selectOption({ label: 'Geography' })
    await page.getByLabel('Front').fill('Largest country by area')
    await page.getByLabel('Back').fill('Russia')
    await page.getByRole('button', { name: 'Add Card' }).click()

    // Delete the deck (confirm)
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.locator('li').filter({ hasText: 'Geography' }).getByRole('button', { name: /delete deck geography/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Geography')).not.toBeVisible()

    // Undo — deck and card come back
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByText('Geography')).toBeVisible()
  })

  test('Review button is enabled for deck with unscheduled cards', async ({ page }) => {
    // The seed deck has 1000 cards, none reviewed (no schedule entries)
    // The Review button must be enabled because unscheduled cards are immediately due
    await page.getByRole('button', { name: 'Decks' }).click()
    const seedDeckRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await expect(seedDeckRow).toBeVisible()
    const reviewBtn = seedDeckRow.getByRole('button', { name: 'Review' })
    await expect(reviewBtn).not.toBeDisabled()
  })

  test('create a deck and review only its cards', async ({ page }) => {
    // Create a second deck
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Spanish')
    await page.getByRole('button', { name: 'Add Deck' }).click()
    await expect(page.getByText('Spanish')).toBeVisible()

    // Add a card to the Spanish deck
    await page.getByRole('button', { name: 'Add', exact: true }).click()
    await page.getByLabel('Deck').selectOption({ label: 'Spanish' })
    await page.getByLabel('Front').fill('Hola')
    await page.getByLabel('Back').fill('Hello')
    await page.getByRole('button', { name: 'Add Card' }).click()

    // Review the Spanish deck — should only show the Spanish card
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.locator('li').filter({ hasText: 'Spanish' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Hola')).toBeVisible()

    // Rate Good and queue should be empty for this deck
    await page.getByRole('button', { name: 'Show Answer' }).click()
    await page.getByRole('button', { name: 'Good' }).click()
    await expect(page.getByText('All done!')).toBeVisible()
  })
})
