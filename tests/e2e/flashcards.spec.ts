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
