# Animation Plans

Generated from `find-animation-opportunities` audit on commit `08b4566`.

## Plans

| # | Title | Severity | Category | Status |
|---|-------|----------|----------|--------|
| 001 | Bottom player slide-in transition | HIGH | Preventing a jarring change | TODO |
| 002 | Completion screen staggered entrance | HIGH | Delight | TODO |
| 003 | Pronunciation score count-up | HIGH | Delight | TODO |
| 004 | Chip group press feedback | MEDIUM | Feedback | TODO |
| 005 | Empty state animation | MEDIUM | Delight | TODO |
| 006 | Add-word success toast | MEDIUM | Delight | TODO |

## Execution order

1. **001** (bottom player) — highest leverage, most frequent gap
2. **004** (chip press feedback) — quick win, isolated component
3. **002** (completion stagger) — builds on existing confetti moment
4. **003** (score count-up) — isolated to `learn.tsx`, no dependencies
5. **005** (empty state) — small, self-contained
6. **006** (add-word toast) — smallest change, uses existing Toast infrastructure

## Dependencies

- Plans 001, 004, 005, 006 are fully independent — no shared files, can execute in any order or in parallel.
- Plans 002 and 003 both touch `app/deck/learn.tsx` — execute sequentially to avoid merge conflicts. Run 002 before 003 (002 is higher leverage).
- All plans depend on the existing `lib/animation-utils.ts` tokens — no new tokens needed.
