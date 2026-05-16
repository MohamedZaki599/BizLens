# T002 — RTL Physical Direction CSS Audit

**Scope**: `client/src/components/` and `client/src/features/`  
**Date**: Audit performed during Phase 1 stabilization  
**Status**: ✅ Codebase is overwhelmingly RTL-ready

---

## Summary

The codebase is **already well-converted to CSS logical properties**. The vast majority of components use `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-` correctly. Only **2 files** have physical direction issues that need RTL fixes.

---

## Files Needing RTL Fixes

### 1. `client/src/features/alerts/AlertCenter.tsx`

| Line | Current Class | Issue | Fix |
|------|--------------|-------|-----|
| ~181 | `rounded-r` | Physical rounding on severity rail positioned at `start-0`. In RTL the rail moves to the right side but `rounded-r` still rounds the right corners. | Replace with `rounded-e` (Tailwind logical border-radius) |

**Context**: The severity rail uses `absolute start-0 inset-y-0 w-[3px] rounded-r` — the positioning is already logical (`start-0`), but the rounding is physical.

---

### 2. `client/src/features/dashboard/components/ExpenseTrendChart.tsx`

| Line | Current Code | Issue | Fix |
|------|-------------|-------|-----|
| ~41 | `margin={{ top: 4, right: 4, left: 0, bottom: 0 }}` | Recharts `<AreaChart>` margin prop uses physical `left`/`right` | Low priority — this is a **Recharts library API** constraint, not a CSS class. Recharts does not support logical properties in its margin prop. Consider swapping `left`↔`right` values dynamically based on `dir` attribute if pixel-perfect RTL chart margins are needed. |

---

## Files Already Using Logical Properties Correctly ✅

The following files were audited and confirmed to use logical properties throughout:

### `client/src/components/`

| File | Logical Properties Used |
|------|------------------------|
| `Input.tsx` | `start-0`, `ps-3`, `pe-3`, `ps-10` |
| `Combobox.tsx` | `ps-3`, `pe-10`, `text-start`, `end-3` |
| `Select.tsx` | `ps-3`, `pe-3` |
| `Button.tsx` | No directional properties needed |
| `ConfirmDialog.tsx` | No directional properties needed |
| `EmptyState.tsx` | No directional properties needed |
| `Skeleton.tsx` | No directional properties needed |
| `Modal.tsx` | No directional properties needed |
| `shared/ui/dialog/dialog.tsx` | `end-4`, `pe-8` |

### `client/src/features/signals/components/`

| File | Logical Properties / RTL Handling |
|------|----------------------------------|
| `SignalCard.tsx` | `text-start`, `start-0`, `ms-auto`, `dir="ltr"` on numbers |
| `DecisionQueue.tsx` | `rtl:rotate-180` on ArrowRight |
| `SignalWorkspacePanel.tsx` | `rtl:rotate-180` on ArrowRight, `dir="ltr"` on currency, `dir="auto"` on text |
| `ContextualAssistantActions.tsx` | `rtl:rotate-180` on ArrowRight |

### `client/src/features/dashboard/components/`

| File | Logical Properties / RTL Handling |
|------|----------------------------------|
| `InsightCard.tsx` | `-end-16`, `-start-10`, `text-start`, `rtl:rotate-180` |
| `MoneyLeakCard.tsx` | `-end-12`, `rtl:rotate-180` |
| `ForecastCard.tsx` | `-start-12` |
| `BreakdownCard.tsx` | `rtl:rotate-180` |

### `client/src/features/dashboard/pages/`

| File | Logical Properties / RTL Handling |
|------|----------------------------------|
| `DashboardPage.tsx` | `dir="ltr"` on currency amounts (correct) |

### `client/src/features/alerts/`

| File | Logical Properties Used |
|------|------------------------|
| `AlertCenter.tsx` | `start-0`, `end-0`, `ms-auto`, `-end-1` (except `rounded-r` — see above) |

### `client/src/features/onboarding/components/`

| File | Logical Properties Used |
|------|----------------------------------|
| `SignalPreparationState.tsx` | `start-1/2` |
| `WelcomeScreen.tsx` | `start-1/2`, `start-1/3`, `text-start` |
| `FirstSignalReveal.tsx` | `start-1/2` |
| `BusinessContextSetup.tsx` | `text-start` |

### `client/src/pages/`

| File | Logical Properties / RTL Handling |
|------|----------------------------------|
| `AssistantPage.tsx` | `start-0` (NoteCard rail), `ms-auto`, `rtl:rotate-180` on ArrowRight |

---

## Patterns NOT Found (Confirmed Absent)

The following physical direction patterns were searched for and **not found** anywhere in the audited scope:

- ❌ `ml-*` / `mr-*` (physical margin-left/right) — **None found**
- ❌ `pl-*` / `pr-*` (physical padding-left/right) — **None found**
- ❌ `left-*` / `right-*` (physical positioning) — **None found**
- ❌ `text-left` / `text-right` (physical text alignment) — **None found**
- ❌ `border-l-*` / `border-r-*` (physical border sides) — **None found**
- ❌ `rounded-l-*` (physical border-radius left) — **None found**
- ❌ `float-left` / `float-right` — **None found**
- ❌ `space-x-*` without `space-x-reverse` — **None found**
- ❌ `-ml-*` / `-mr-*` (negative physical margins) — **None found**

---

## Correct RTL Patterns Already in Use

1. **Logical margin/padding**: `ms-`, `me-`, `ps-`, `pe-` ✅
2. **Logical positioning**: `start-`, `end-` ✅
3. **Logical text alignment**: `text-start`, `text-end` ✅
4. **Icon flipping**: `rtl:rotate-180` on directional arrows ✅
5. **Number direction**: `dir="ltr"` on financial amounts ✅
6. **Auto direction**: `dir="auto"` on user-generated text ✅

---

## Conclusion

**Files needing fixes: 2**

| Priority | File | Issue |
|----------|------|-------|
| High | `client/src/features/alerts/AlertCenter.tsx` | `rounded-r` → `rounded-e` |
| Low | `client/src/features/dashboard/components/ExpenseTrendChart.tsx` | Recharts API uses physical `left`/`right` in margin prop (library constraint) |

The codebase demonstrates excellent RTL discipline. The conversion to logical properties has been thoroughly applied. Only the `rounded-r` in AlertCenter is a genuine Tailwind physical direction class that needs replacement.
