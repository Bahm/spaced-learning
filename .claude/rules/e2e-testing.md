---
paths:
  - "tests/e2e/**"
---

# E2E Testing Patterns

- Clear IndexedDB before each test: `indexedDB.databases()` + `deleteDatabase('SpacedLearning')`, then `page.reload()`
- Fresh installs have no seed data — only `waitForTimeout(200)` needed for Dexie init
- Tests needing a public deck: call `installPublicDeck(page, deckName)` helper, which waits 1000ms for seed cards
- Playwright `webServer` config auto-starts the dev server

## Selector pitfalls

- Use `exact: true` when button label is a substring of another (e.g. `{ name: 'Add', exact: true }`)
- Avoid `getByText('partial')` when the string is a substring of other visible text — use `getByRole` with exact name
- `getByLabel` matches ANY `aria-label` via substring — nav buttons must not use words that appear in form labels (e.g. use `"← Decks"` not `"← Back"`)
- Use `getByRole('combobox')` to target `<select>` elements
- Test deck names must not contain button label substrings (e.g. "Review Count" collides with the Review button)

## Assertions

- For HTML attributes: `toHaveAttribute('attrName', /pattern/)`
- Do not assert CSS property values — test behavior (attributes, text, visibility), not style
- Multi-card add: assert heading card count after each `Add Card` click, don't batch then assert
