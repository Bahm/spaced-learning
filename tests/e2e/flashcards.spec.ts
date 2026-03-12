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
    // Brief wait for Dexie initialization (no seed data to wait for)
    await page.waitForTimeout(200)
  })

  // Helper: install a public deck from the catalog
  const installPublicDeck = async (page: import('@playwright/test').Page, deckName: string) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    const catalogRow = page.locator('li').filter({ hasText: deckName }).first()
    await catalogRow.getByRole('button', { name: /Install/ }).click()
    // Wait for seed cards to be inserted
    await page.waitForTimeout(1000)
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  test('only Review and Decks tabs are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Review' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decks' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cards' })).not.toBeVisible()
    await expect(page.getByRole('button', { name: 'Add', exact: true })).not.toBeVisible()
  })

  test('mobile nav shows both tabs at 390px width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await expect(page.getByRole('button', { name: 'Review' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Decks' })).toBeVisible()
  })

  // ── Deck detail: add & view cards ───────────────────────────────────────────

  test('opening a deck shows its cards and an add form', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')
    const seedRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await seedRow.getByRole('button', { name: 'Cards' }).click()

    // Should show AddCardForm (no deck selector — deckId is injected)
    await expect(page.getByLabel('Front')).toBeVisible()
    await expect(page.getByLabel('Back')).toBeVisible()
    // Should NOT show a deck <select>
    await expect(page.getByRole('combobox')).not.toBeVisible()
  })

  test('add a card from within a deck and see it in the card list', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('French')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'French' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('What is the capital of France?')
    await page.getByLabel('Back').fill('Paris')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await expect(page.getByText('What is the capital of France?')).toBeVisible()
    await expect(page.getByText('→ Paris')).toBeVisible()
  })

  test('add card form shows success feedback after adding', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')
    const seedRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await seedRow.getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('Test front')
    await page.getByLabel('Back').fill('Test back')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('status')).toBeVisible()
  })

  test('add card form shows error for empty fields', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')
    const seedRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await seedRow.getByRole('button', { name: 'Cards' }).click()
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    // Also test front filled but back empty
    await page.getByLabel('Front').fill('Some question')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByRole('alert')).toContainText('Back')
  })

  test('card count updates after add and delete', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Count Test')
    await page.getByRole('button', { name: 'Add Deck' }).click()
    await page.locator('li').filter({ hasText: 'Count Test' }).getByRole('button', { name: 'Cards' }).click()

    const heading = page.getByRole('heading', { name: /Cards/ })
    await expect(heading).toContainText('0')

    await page.getByLabel('Front').fill('Test front')
    await page.getByLabel('Back').fill('Test back')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(heading).toContainText('1')

    await page.getByRole('button', { name: 'Delete card: Test front' }).click()
    await expect(heading).toContainText('0')
  })

  test('delete a card then undo restores it', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Undo Test')
    await page.getByRole('button', { name: 'Add Deck' }).click()
    await page.locator('li').filter({ hasText: 'Undo Test' }).getByRole('button', { name: 'Cards' }).click()

    await page.getByLabel('Front').fill('Capital of Japan')
    await page.getByLabel('Back').fill('Tokyo')
    await page.getByRole('button', { name: 'Add Card' }).click()
    await expect(page.getByText('Capital of Japan')).toBeVisible()

    await page.getByRole('button', { name: 'Delete card: Capital of Japan' }).click()
    await expect(page.getByText('Capital of Japan')).not.toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByText('Capital of Japan')).toBeVisible()
  })

  // ── Deck management ─────────────────────────────────────────────────────────

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
    await expect(emptyDeckRow.getByRole('button', { name: 'Review' })).toBeDisabled()
  })

  test('disabled Review button has a tooltip explaining why', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Tooltip Test')
    await page.getByRole('button', { name: 'Add Deck' }).click()
    const emptyDeckRow = page.locator('li').filter({ hasText: 'Tooltip Test' })
    const reviewBtn = emptyDeckRow.getByRole('button', { name: 'Review' })
    await expect(reviewBtn).toHaveAttribute('title', /cards/i)
  })

  test('archive a user deck and unarchive it', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('History')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    // Archive it
    await page.locator('li').filter({ hasText: 'History' }).getByRole('button', { name: /archive deck history/i }).click()

    // Should appear in Archived section
    await expect(page.getByRole('heading', { name: 'Archived Decks' })).toBeVisible()
    const archivedRow = page.locator('li').filter({ hasText: 'History' })
    await expect(archivedRow).toBeVisible()

    // Unarchive
    await archivedRow.getByRole('button', { name: 'Unarchive' }).click()

    // Should be back in My Decks
    await expect(page.getByRole('heading', { name: 'Archived Decks' })).not.toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'History' })).toBeVisible()
  })

  test('permanently delete an archived deck with confirmation and undo', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Geography')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'Geography' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('Largest country by area')
    await page.getByLabel('Back').fill('Russia')
    await page.getByRole('button', { name: 'Add Card' }).click()

    // Archive it
    await page.getByRole('button', { name: '← Decks' }).click()
    await page.locator('li').filter({ hasText: 'Geography' }).getByRole('button', { name: /archive deck geography/i }).click()

    // Permanently delete from archived section
    const archivedRow = page.locator('li').filter({ hasText: 'Geography' })
    await archivedRow.getByRole('button', { name: /delete deck geography/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Cancel keeps it
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('li').filter({ hasText: 'Geography' })).toBeVisible()

    // Now actually delete
    await archivedRow.getByRole('button', { name: /delete deck geography/i }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.locator('li').filter({ hasText: 'Geography' })).not.toBeVisible()

    // Undo restores it
    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.locator('li').filter({ hasText: 'Geography' })).toBeVisible()
  })

  // ── Public Decks ──────────────────────────────────────────────────────────

  test('fresh install shows public decks catalog', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await expect(page.getByRole('heading', { name: 'Public Decks' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'Vietnamese yoga vocabulary' })).toBeVisible()
  })

  test('install a public deck from catalog', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')

    // Should now appear in My Decks
    const myDeckRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await expect(myDeckRow.getByRole('button', { name: 'Cards' })).toBeVisible()
    await expect(myDeckRow.getByRole('button', { name: 'Review' })).not.toBeDisabled()
  })

  test('remove a public deck and reinstall it', async ({ page }) => {
    await installPublicDeck(page, 'Vietnamese yoga vocabulary')

    // Remove (uninstall) the deck
    const myDeckRow = page.locator('li').filter({ hasText: 'Vietnamese yoga vocabulary' }).first()
    await myDeckRow.getByRole('button', { name: /remove deck/i }).click()

    // Should reappear in Public Decks with "Reinstall" label
    const catalogRow = page.locator('li').filter({ hasText: 'Vietnamese yoga vocabulary' }).first()
    await expect(catalogRow.getByRole('button', { name: 'Reinstall' })).toBeVisible()
    await expect(catalogRow.getByText('review history preserved')).toBeVisible()

    // Reinstall
    await catalogRow.getByRole('button', { name: 'Reinstall' }).click()
    await page.waitForTimeout(200)

    // Should be back in My Decks
    const reinstalledRow = page.locator('li').filter({ hasText: 'Vietnamese yoga vocabulary' }).first()
    await expect(reinstalledRow.getByRole('button', { name: 'Cards' })).toBeVisible()
  })

  // ── Review ───────────────────────────────────────────────────────────────────

  test('Review button is enabled for deck with unscheduled cards', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')
    const seedDeckRow = page.locator('li').filter({ hasText: '1000 most common words in Vietnamese' }).first()
    await expect(seedDeckRow).toBeVisible()
    await expect(seedDeckRow.getByRole('button', { name: 'Review' })).not.toBeDisabled()
  })

  test('review a card with Good rating removes it from the due queue', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Math')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'Math' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('What is 2 + 2?')
    await page.getByLabel('Back').fill('4')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: '← Decks' }).click()
    await page.locator('li').filter({ hasText: 'Math' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('What is 2 + 2?')).toBeVisible()
    await page.getByRole('button', { name: 'Show Answer' }).click()
    await page.getByRole('button', { name: 'Good' }).click()
    await expect(page.getByText('All done!')).toBeVisible()
  })

  test('create a deck and review only its cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('Spanish')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'Spanish' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('Hola')
    await page.getByLabel('Back').fill('Hello')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: '← Decks' }).click()
    await page.locator('li').filter({ hasText: 'Spanish' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Hola')).toBeVisible()
    await page.getByRole('button', { name: 'Show Answer' }).click()
    await page.getByRole('button', { name: 'Good' }).click()
    await expect(page.getByText('All done!')).toBeVisible()
  })

  test('global Review tab reviews all due cards from installed decks', async ({ page }) => {
    await installPublicDeck(page, '1000 most common words in Vietnamese')
    // Use nav scope to click the Review tab (not the deck row's Review button)
    await page.getByRole('navigation').getByRole('button', { name: 'Review' }).click()
    // Installed deck has 1000 unscheduled (due) cards
    await expect(page.getByText(/cards remaining/)).toBeVisible()
  })

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────

  test('keyboard shortcut Space reveals answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('KB Test')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'KB Test' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('Press space')
    await page.getByLabel('Back').fill('Done')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: '← Decks' }).click()
    await page.locator('li').filter({ hasText: 'KB Test' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Press space')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(page.getByText('Done')).toBeVisible()
  })

  test('keyboard shortcuts 1-4 rate cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Decks' }).click()
    await page.getByLabel('Deck name').fill('KB Rate')
    await page.getByRole('button', { name: 'Add Deck' }).click()

    await page.locator('li').filter({ hasText: 'KB Rate' }).getByRole('button', { name: 'Cards' }).click()
    await page.getByLabel('Front').fill('Rate me')
    await page.getByLabel('Back').fill('Answer')
    await page.getByRole('button', { name: 'Add Card' }).click()

    await page.getByRole('button', { name: '← Decks' }).click()
    await page.locator('li').filter({ hasText: 'KB Rate' }).getByRole('button', { name: 'Review' }).click()
    await expect(page.getByText('Rate me')).toBeVisible()
    await page.keyboard.press('Space')
    await expect(page.getByRole('button', { name: 'Good' })).toBeVisible()
    await page.keyboard.press('3')
    await expect(page.getByText('All done!')).toBeVisible()
  })
})
