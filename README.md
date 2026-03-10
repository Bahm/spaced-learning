# Spaced Learning

A flashcard app powered by the [FSRS](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm) (Free Spaced Repetition Scheduler) algorithm.

All code in this project is written and reviewed by AI. To maintain quality and consistency, the AI is expected to:

- Continuously write and update documentation (including skills and architecture docs)
- Follow software engineering best practices
- Keep this README and related docs up to date as the project evolves

## Features

- Flashcard creation and management
- FSRS-based scheduling for optimal review intervals
- Review sessions with rating-based feedback

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict + noUncheckedIndexedAccess) |
| UI | React 19 + Vite 7 |
| PWA | vite-plugin-pwa 1.2 |
| Storage | Dexie.js v4 (IndexedDB) |
| FSRS algorithm | ts-fsrs v5 |
| Unit tests | Vitest v4 |
| E2E tests | Playwright 1.58 (Chromium) |
| Runtime | Node.js v24 via nvm |

## Getting Started

Node.js is installed via nvm. All commands must source nvm first:

```bash
# Install dependencies
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm install'

# Start dev server (http://localhost:5173)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npm run dev'

# Run unit tests
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx vitest run tests/unit'

# Run E2E tests (auto-starts dev server)
bash -c 'export NVM_DIR="${HOME}/.nvm"; source "${NVM_DIR}/nvm.sh"; npx playwright test'
```

## Project Structure

```
src/
  domain/     # Pure functions — no I/O, fully unit-tested
  db/         # Dexie/IndexedDB side effects (deckRepo, cardRepo, reviewRepo)
  hooks/      # React hooks bridging domain + db to UI
  components/ # Thin UI shells (DeckList, AddCardForm, CardList, ReviewSession)
  App.tsx     # Tab switcher + deck-review sub-view (no router library)
tests/
  unit/       # Vitest — covers src/domain/
  e2e/        # Playwright — covers full user flows
```

## Contributing

This project uses AI-assisted development. All changes should be accompanied by updated documentation and adhere to the established conventions in this repo.
