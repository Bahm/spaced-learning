---
paths:
  - "src/domain/**"
---

# Domain Layer Rules

Pure functions only — zero imports from `db/` or `hooks/`.

## ts-fsrs API

`fsrs.repeat(card, now)` returns `IPreview`, keyed by **numeric** Rating values at runtime. Cast through `unknown`:

```typescript
const next = (result as unknown as Record<number, { card: FSRSCard } | undefined>)[fsrsRating]
```

Direct cast from `IPreview` to `Record<number, ...>` is rejected — the `unknown` step is required. See `scheduler.ts`.

Rating enum: `Again=1, Hard=2, Good=3, Easy=4` (Manual=0 unused).
