# T001 — Dashboard Widget Hierarchy Audit

**File**: `client/src/features/dashboard/pages/DashboardPage.tsx`  
**Date**: Audit performed during Phase 1 Setup  
**Purpose**: Document which components compete for visual attention and identify the primary operational zone.

---

## Current Render Order (top to bottom)

| # | Component | Visual Weight | Notes |
|---|-----------|--------------|-------|
| 1 | **Header** (h1 + range tabs) | Medium | `text-2xl font-bold` title, range tabs in `bg-surface-high` pill group |
| 2 | **ActivationProgressTracker** | Low | Hidden on mobile (`hidden md:flex`), inline in header |
| 3 | **NotificationBanner** | Medium-High | Colored background (`bg-primary/10` or `bg-secondary/10`), icon + CTA button |
| 4 | **StaleDataReminder** | Medium-High | Amber background, border, 9×9 icon container, CTA button — draws attention |
| 5 | **WarningBanner** | High | Red/amber backgrounds, `rounded-2xl`, bold text — intentionally alarming |
| 6 | **ActivationChecklist** | High | Uses `.card` class (full border, padding, shadow), animated progress bar, gradient, milestone list with icons |
| 7 | **ExecutiveFocusBar** | Medium | Subtle `bg-surface-high/60`, thin border (`border-outline/15`), single-line text, small icon |
| 8 | **DecisionQueue** | High | Section heading (`text-lg font-semibold`), grid of SignalCards with borders, shadows, severity badges, colored accents |
| 9 | **SignalWorkspacePanel** | N/A (modal) | Only visible when triggered |
| 10 | **ExpenseTrendChart** | Medium-High | `.card` wrapper (border, padding, rounded-2xl), 220px tall chart with colored gradients |
| 11 | **ExpenseDonutChart** | Medium-High | `.card` wrapper, 180×180 donut with vivid category colors, legend |
| 12 | **Recent Transactions** | Medium | List with icons, amounts, category colors — familiar data density |

---

## Components Competing for Visual Attention

### Problem: Multiple "loud" elements above the fold

1. **ActivationChecklist vs. ExecutiveFocusBar + DecisionQueue**  
   The ActivationChecklist uses the `.card` class (same visual weight as charts), has an animated gradient progress bar, and occupies significant vertical space with its milestone list. On first-time user dashboards, it renders *above* the operational zone and pushes ExecutiveFocusBar + DecisionQueue below the fold.

2. **NotificationBanner + StaleDataReminder + WarningBanner stack**  
   These three banners can stack (up to 3 colored blocks) between the header and the operational zone. Each uses colored backgrounds and icons. Together they create a "wall of alerts" that competes with the signal zone for urgency.

3. **Charts have equal visual weight to the signal zone**  
   Both `ExpenseTrendChart` and `ExpenseDonutChart` use the same `.card` class as the ActivationChecklist. They have:
   - Same border treatment (`border-outline/10`)
   - Same padding (`p-6`)
   - Same rounded corners (`rounded-2xl`)
   - Vivid gradient fills and category colors
   
   There is currently only a `pt-4 border-t border-outline/10` separator and a small `text-sm font-medium text-ink-muted` heading distinguishing them from the primary zone. This is insufficient — the charts *feel* like peers to the signal cards, not subordinates.

4. **ExecutiveFocusBar is too subtle relative to DecisionQueue**  
   The FocusBar uses `bg-surface-high/60` (60% opacity background) and `border-outline/15` — it's intentionally calm but risks being overlooked when surrounded by louder elements. It should remain calm but needs the surrounding noise reduced so it can breathe.

---

## Identified Primary Operational Zone

Per spec decision (FR-008, Clarification 2026-05-15):

```
ExecutiveFocusBar + DecisionQueue = PRIMARY OPERATIONAL ZONE
```

### Current state of the primary zone:

- **ExecutiveFocusBar**: Lightweight status strip. Shows count of signals needing attention + "Review" CTA. Correctly calm and informational. ✓
- **DecisionQueue**: Shows up to 3 prioritized SignalCards in a responsive grid. Has proper heading hierarchy (`text-lg font-semibold`), severity-based card styling, and clear CTAs. ✓

### What's working:
- The code already labels these sections with comments: `/* A. Operational Focus */` and `/* B. Priority Signals */`
- DecisionQueue groups and prioritizes signals intelligently (max 3 visible)
- SignalCard has priority-based visual hierarchy (critical gets accent border + shadow)
- Charts section is already labeled `/* C. Supporting Trends — secondary, visually receded */`

### What's NOT working:
- The visual weight of charts is identical to signal cards (same `.card` treatment)
- The separator between primary and secondary zones is too weak (`pt-4 border-t border-outline/10`)
- Banners and ActivationChecklist can push the primary zone below the fold
- No spacing/breathing room distinguishes the primary zone from surrounding content

---

## Recommended Changes for Phase 3 (T005–T009)

### To establish clear primary zone dominance:

1. **Increase separation before charts section** — larger `pt-` value, possibly `pt-8` or `mt-8`, to create clear visual break
2. **Reduce chart visual weight** — lighter borders (`border-outline/5`), remove or reduce shadow, use `text-ink-muted` for headings, possibly reduce chart heading from `stat-label` to even smaller
3. **Reduce chart section heading** — currently `text-sm font-medium text-ink-muted` which is already small, but the `.card` wrapper gives charts equal presence
4. **Add opacity or muted treatment to charts** — consider `opacity-90` or lighter card background
5. **Recent transactions section** — already tertiary, just needs consistent reduced treatment
6. **ExecutiveFocusBar badge noise** — ensure only highest-severity uses strong color (T009)

### What should NOT change:
- ExecutiveFocusBar's calm tone is correct — don't make it louder
- DecisionQueue's card-based layout is correct — it should remain the dominant visual element
- Banner components serve system-level alerts — they should remain visible but are transient

---

## Summary

The dashboard currently has **4 competing visual zones** at similar weight:
1. Alert banners (transient but loud)
2. Onboarding checklist (temporary but large)
3. **ExecutiveFocusBar + DecisionQueue** (intended primary)
4. Charts (intended secondary but visually equal)

The fix is to **reduce zones 3 and 4** so that zone 3 (the operational zone) naturally dominates through contrast, not by making it louder.
