# Tasks: Operational Signal & Assistant UX Refinement

**Input**: Design documents from `/specs/001-improve-signal-assistant/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/assistant.api.md ✅, quickstart.md ✅

**Mode**: FEATURE FREEZE — stabilization only. No new features, no new architecture, no new libraries unless already installed.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every description

---

## Phase 1: Setup (Audit & Baseline)

**Purpose**: Confirm the existing component primitives available before touching any story work. No code changes — read-only audit.

- [x] T001 Audit existing dialog/modal primitives in `client/src/components/` — confirm whether Radix UI Dialog or a custom primitive is already installed (check `client/package.json` and `client/src/components/`)
- [x] T002 Audit i18n translation keys for RTL-affected strings in `client/src/lib/i18n/` — list all keys used in `SignalWorkspacePanel.tsx`, `ExecutiveFocusBar.tsx`, and `DashboardPage.tsx`
- [x] T003 [P] Audit `client/src/features/signals/components/SignalWorkspacePanel.tsx` — document current layout issues: full-page sheet behavior, missing focus trap, missing body scroll lock, RTL x-offset calculation
- [x] T004 [P] Audit `client/src/features/signals/components/ExecutiveFocusBar.tsx` — document broken CTA: `Button` has no `onClick`, no navigation, no loading state

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared fixes that all three user stories depend on. Must complete before story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Add `signalKey` query param support to the assistant API client in `client/src/features/dashboard/api/dashboard.api.ts` — add `assistant(signalKey?: string): Promise<AssistantDigest>` method that calls `GET /dashboard/assistant?signalKey=<key>` matching the contract in `specs/001-improve-signal-assistant/contracts/assistant.api.md`
- [x] T006 Extend `useSignalWorkspace` Zustand store in `client/src/features/signals/hooks/useSignalWorkspace.ts` — add `bodyScrollLocked: boolean` state field and `lockBodyScroll()` / `unlockBodyScroll()` actions that toggle `document.body.style.overflow`
- [x] T007 Verify `client/src/lib/i18n/` contains RTL locale (`ar`) entries for all signal workspace keys (`signal.workspace.*`, `signal.focusBar.*`) — add any missing keys as empty strings to unblock rendering

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — RTL Drawer & Action Visibility (Priority: P1) 🎯 MVP

**Goal**: Bilingual Arabic users can open a signal detail panel that correctly mirrors layout, keeps action buttons pinned and visible, and works on mobile.

**Independent Test**: Switch app language to Arabic (`ar`), click any signal card, verify: drawer slides from left, text is right-aligned, primary action button is visible without scrolling, ESC closes the panel, overlay click closes the panel.

### Implementation for User Story 1

- [x] T008 [US1] Replace full-page sheet with centered responsive modal in `client/src/features/signals/components/SignalWorkspacePanel.tsx` — change `fixed inset-y-0 end-0 w-full max-w-md` to a centered dialog layout: `fixed inset-0 flex items-center justify-center p-4` with an inner `w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-surface shadow-2xl overflow-hidden`; keep AnimatePresence/motion but change animation from `x` slide to `scale` + `opacity` (initial: `{ opacity: 0, scale: 0.96 }`, animate: `{ opacity: 1, scale: 1 }`)
- [x] T009 [US1] Add focus trap to `SignalWorkspacePanel` in `client/src/features/signals/components/SignalWorkspacePanel.tsx` — on modal open, use `useEffect` to find all focusable elements within the modal container ref and implement Tab/Shift+Tab cycling; set initial focus to the close button; restore focus to the trigger element on close
- [x] T010 [US1] Add body scroll lock to `SignalWorkspacePanel` in `client/src/features/signals/components/SignalWorkspacePanel.tsx` — call `lockBodyScroll()` from the Zustand store (T006) in the `useEffect` that fires when `isOpen` becomes true; call `unlockBodyScroll()` on cleanup and on close
- [x] T011 [US1] Fix RTL layout in `SignalWorkspacePanel` in `client/src/features/signals/components/SignalWorkspacePanel.tsx` — remove manual `slideFrom` / `x` offset logic; replace hardcoded `$` currency symbol in `signal.value.toLocaleString()` with `useFormatCurrency()` hook (already used in `DashboardPage.tsx`); replace `gap-2`, `gap-3`, `gap-4` with `gap-x-2`, `gap-x-3`, `gap-x-4` where inline; replace `p-6` header/footer padding with `px-6 py-4`; add `dir="auto"` to the signal title `<h2>` and description `<p>` elements
- [x] T012 [US1] Fix icon direction in sticky footer of `SignalWorkspacePanel` in `client/src/features/signals/components/SignalWorkspacePanel.tsx` — the `<ArrowRight>` icon already has `rtl:rotate-180` but confirm it is inside a flex container that uses `justify-between`; add `aria-hidden="true"` to all decorative icons (`Check`, `Search`, `BellOff`, `ArrowRight`); add visible text labels to the `BellOff` snooze button (currently icon-only) using `<span className="sr-only">{t('signal.workspace.snooze')}</span>`
- [x] T013 [US1] Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the signal title `<h2>` id, and `aria-describedby` pointing to the description `<p>` id to the modal container `<motion.div>` in `client/src/features/signals/components/SignalWorkspacePanel.tsx`
- [x] T014 [US1] Verify sticky footer remains visible on 320px viewport in `SignalWorkspacePanel` — the footer already uses `sticky bottom-0`; confirm the scrollable content area uses `flex-1 overflow-y-auto` and the outer container uses `flex flex-col` with a fixed max-height (`max-h-[90vh]`); add `min-h-0` to the scrollable content div to prevent flex overflow

**Checkpoint**: US1 complete — RTL drawer works, buttons are visible, modal is accessible, body scroll is locked.

---

## Phase 4: User Story 2 — Context-Aware AI Guidance (Priority: P2)

**Goal**: When a user opens the assistant while a signal is active, the assistant's first note is specific to that signal's data — no generic greetings.

**Independent Test**: Open a signal in the workspace panel, then navigate to `/app/assistant`. Verify the first note in the digest references the signal name and at least one data point (amount or percentage). Verify no "How can I help you?" or "I am an AI" text appears anywhere.

### Implementation for User Story 2

- [x] T015 [US2] Add `signalKey` prop to the assistant API query in `client/src/features/dashboard/api/dashboard.api.ts` — the `assistant()` method added in T005 should accept `signalKey?: string` and append it as a query param when present
- [x] T016 [US2] Create `useAssistantQuery` hook in `client/src/features/dashboard/hooks/useDashboardQuery.ts` (or a new file `client/src/features/dashboard/hooks/useAssistantQuery.ts`) — use TanStack Query `useQuery` with key `['assistant', signalKey]`, call `dashboardApi.assistant(signalKey)`, set `staleTime: 60_000`; accept optional `signalKey?: string` param
- [x] T017 [US2] Read `activeSignalKey` from `useSignalWorkspace` store in the assistant page — locate the assistant page component (search `client/src/` for a route rendering the assistant digest) and pass `activeSignalKey` from the Zustand store to `useAssistantQuery`; if no assistant page exists yet, add the `signalKey` forwarding to wherever `GET /dashboard/assistant` is currently called
- [x] T018 [US2] Audit the assistant page rendering for fake AI phrasing — search `client/src/` for strings containing "AI", "assistant", "How can I help", "I'm here to help", "chat" and replace with operational language: rename section headers to "Operational Insights" or "Signal Analysis"; remove any typing animation or chat-bubble UI; ensure notes render as a flat feed of `AssistantNote` cards with `title`, `message`, `metric`, and optional `action` button
- [x] T019 [US2] Add `generatedAt` timestamp display to the assistant digest feed — wherever `AssistantDigest` is rendered, show `generatedAt` formatted as a relative time (e.g. "Updated 2 minutes ago") using `date-fns/formatDistanceToNow`; place it below the headline in muted text (`text-xs text-ink-muted`)
- [x] T020 [US2] Validate `AssistantNote` action buttons are functional — for each note with an `action` field, ensure the rendered button calls `navigate(action.payload.route)` for `type: 'navigate'` actions and dispatches a filter update for `type: 'filter'` actions; remove or hide any action button where `action` is undefined (no placeholder buttons per FR-006)

**Checkpoint**: US2 complete — assistant shows signal-specific data, no generic AI phrasing, all action buttons are functional.

---

## Phase 5: User Story 3 — Responsive Overlays & Reliable Actions (Priority: P3)

**Goal**: Mobile users get a layout that adapts to 320px width with no clipped content, and every interactive element performs a real action.

**Independent Test**: Open Chrome DevTools at 320px width. Open the signal workspace panel. Verify no content is clipped, the primary action button is visible, and clicking it navigates correctly. Verify the `ExecutiveFocusBar` "Review Priority Signals" CTA navigates to `/app/assistant?filter=priority` or smooth-scrolls to `#priority-decision-queue`.

### Implementation for User Story 3

- [x] T021 [US3] Fix broken "Review Priority Signals" CTA in `client/src/features/signals/components/ExecutiveFocusBar.tsx` — add `useNavigate` from `react-router-dom` and `useSignalsQuery` is already imported; wire the `<Button>` `onClick` to `navigate('/app/assistant?filter=priority')` as primary behavior; add `aria-label={t('signal.focusBar.reviewCta')}` to the button; add `disabled={criticalCount === 0 && awaitingReviewCount === 0}` with appropriate muted styling when no signals need review
- [x] T022 [US3] Add hover, focus-visible, and pressed states to the CTA button in `ExecutiveFocusBar.tsx` — ensure the `<Button>` component receives `className` additions for `focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2`; add `transition-opacity active:opacity-80` for pressed feedback; verify the button is keyboard-reachable (it is inside the normal DOM flow, so Tab should reach it)
- [x] T023 [US3] Fix `OperationalGuidanceCard` broken `onAction` in `client/src/features/dashboard/pages/DashboardPage.tsx` — replace the empty `onAction={() => {/* navigate or scroll */}}` callback with `onAction={() => { const el = document.getElementById('priority-decision-queue'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else navigate('/app/assistant'); }}` 
- [x] T024 [US3] Add `id="priority-decision-queue"` to the `<DecisionQueue />` wrapper section in `client/src/features/dashboard/pages/DashboardPage.tsx` — wrap `<DecisionQueue />` in `<section id="priority-decision-queue">` so the scroll target exists
- [x] T025 [US3] Audit `DecisionQueue` component in `client/src/features/signals/components/DecisionQueue.tsx` — verify all interactive elements have `min-h-[44px] min-w-[44px]` touch targets; add `focus-visible:ring-2` to any button missing it; verify no button has an empty or placeholder `onClick`
- [x] T026 [US3] Fix mobile overflow in `ExecutiveFocusBar.tsx` — the stats section uses `hidden md:flex` for the middle two stats; on mobile only the critical count and the CTA button show; add `overflow-x-auto` to the outer flex container and `shrink-0` to each stat block to prevent wrapping/clipping on 320px; add `gap-3` instead of `gap-6` on mobile using `gap-3 md:gap-6`
- [x] T027 [US3] Audit `SignalCard` component in `client/src/features/signals/components/SignalCard.tsx` — verify the card's action button (if any) has a real `onClick` handler; add `focus-visible:ring-2 focus-visible:ring-offset-2` to the card's interactive surface; ensure text does not overflow on 320px by adding `break-words` or `truncate` to title/description elements

**Checkpoint**: US3 complete — CTA navigates correctly, mobile layout is stable, all buttons are functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: RTL consistency pass, dashboard hierarchy cleanup, and accessibility hardening across all touched files.

- [x] T028 [P] Dashboard hierarchy cleanup in `client/src/features/dashboard/pages/DashboardPage.tsx` — remove the `OperationalGuidanceCard` when signals exist (it currently renders even when `hasNoSignals` is false due to the `hasNoSignals &&` guard being correct — verify the guard is working); ensure `ExecutiveFocusBar` only renders when `signals.length > 0` (already gated); reduce visual noise by removing the `mt-12` top margin on the historical trends section to `mt-8`
- [x] T029 [P] RTL spacing audit across signal components — in `client/src/features/signals/components/SignalCard.tsx`, `SignalSeverityBadge.tsx`, `SignalLifecycleBadge.tsx`: replace `ml-*` with `ms-*`, `mr-*` with `me-*`, `pl-*` with `ps-*`, `pr-*` with `pe-*`, `left-*` with `start-*`, `right-*` with `end-*` where these are used for inline spacing
- [x] T030 [P] RTL currency alignment in `SignalWorkspacePanel.tsx` — the hardcoded `$` prefix on `signal.value.toLocaleString()` must be replaced with `useFormatCurrency()(signal.value)` (already imported in `DashboardPage.tsx`); add `dir="ltr"` and `className="tabular-nums"` to the value display `<div>` so numeric values always render LTR even in RTL context
- [x] T031 [P] Keyboard navigation audit — verify Tab order in `DashboardPage.tsx` is logical: range tabs → ExecutiveFocusBar CTA → DecisionQueue cards → signal workspace trigger; add `tabIndex={0}` and `onKeyDown` (Enter/Space → click) to any non-button interactive element found during audit
- [x] T032 Run quickstart.md verification steps — manually verify: (1) Arabic mode drawer slides correctly, (2) assistant shows signal-specific data, (3) mobile 320px layout has no clipped buttons; document any remaining issues as deferred debt in a comment block at the bottom of this file

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately, read-only
- **Foundational (Phase 2)**: Depends on Phase 1 audit findings — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (T006 body scroll lock store)
- **US2 (Phase 4)**: Depends on Phase 2 (T005 assistant API method)
- **US3 (Phase 5)**: Depends on Phase 2 completion; T023/T024 depend on each other
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on T006 (body scroll lock store) — otherwise independent
- **US2 (P2)**: Depends on T005 (assistant API client) — otherwise independent of US1
- **US3 (P3)**: Depends on T024 (scroll target ID) before T023 (scroll behavior) — otherwise independent

### Within Each User Story

- US1: T008 (modal layout) → T009 (focus trap) → T010 (scroll lock) → T011 (RTL) → T012 (icons) → T013 (aria) → T014 (viewport)
- US2: T015 (API param) → T016 (query hook) → T017 (page wiring) → T018 (phrasing audit) → T019 (timestamp) → T020 (action validation)
- US3: T024 (scroll target) → T023 (scroll behavior) | T021 (CTA nav) → T022 (CTA states) | T025–T027 (parallel audits)

### Parallel Opportunities

- T003 and T004 (Phase 1 audits) can run in parallel
- T029, T030, T031 (Phase 6 polish) can all run in parallel
- T025, T026, T027 (US3 component audits) can run in parallel
- US2 and US3 can begin in parallel once Phase 2 is complete

---

## Parallel Example: User Story 1

```
# These US1 tasks touch different concerns and can overlap:
T011 — RTL layout fixes (CSS/classes only)
T012 — Icon direction + aria-hidden (markup only)
T013 — ARIA attributes (markup only)

# These must be sequential:
T008 (modal layout) → T009 (focus trap needs modal ref) → T010 (scroll lock needs open state)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Audit (read-only, fast)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: US1 (T008–T014) — RTL drawer + modal rebuild
4. **STOP and VALIDATE**: Run quickstart.md step 1 (RTL drawer) and step 3 (mobile 320px)
5. Ship US1 fix — this is the highest-trust signal for Arabic users

### Incremental Delivery

1. Setup + Foundational → baseline stable
2. US1 → RTL drawer fixed, modal accessible → validate → ship
3. US2 → assistant shows signal data → validate → ship
4. US3 → CTA works, mobile stable → validate → ship
5. Polish → RTL spacing, dashboard cleanup → validate → ship

### Single Developer Strategy

Work sequentially: Phase 1 → Phase 2 → US1 → US2 → US3 → Polish.
Each phase is independently testable before moving on.

---

## Deferred Technical Debt

> Items explicitly out of scope for this stabilization pass. Document here to avoid scope creep.

- Full Radix UI Dialog migration (if not already installed) — evaluate after US1 ships
- i18n completeness audit beyond signal workspace keys
- `AssistantNote` kind `'signal-explanation'` is defined in the API contract but not yet in the `AssistantNote` type union in `server/src/modules/dashboard/assistant.service.ts` — add it in a follow-up
- `SignalWorkspacePanel` currently re-fetches signal data on every open — add `staleTime` to `useSignalByKeyQuery` in a follow-up
- `ExecutiveFocusBar` sticky positioning (`sticky top-0 z-20`) may conflict with app shell header on some viewports — evaluate after US3 ships

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps each task to its user story for traceability
- NO new libraries unless already in `client/package.json`
- NO new routes, no new API endpoints beyond the `signalKey` query param already defined in the contract
- Commit after each phase checkpoint
- Stop at each checkpoint to validate the story independently before proceeding


---

## Phase 7: Second Stabilization Pass (Post-MVP)

**Purpose**: Complete remaining UX credibility, RTL consistency, accessibility hardening, and operational trust improvements.

- [x] T033 [P] Dashboard hierarchy cleanup — reduce `space-y-6` to `space-y-5` for tighter rhythm; demote historical trends heading from `text-xl font-bold` to `text-lg font-semibold text-ink-muted`; reduce section card border to `border-outline/20` in `client/src/features/dashboard/pages/DashboardPage.tsx`
- [x] T034 [P] Assistant page trust repositioning — replace `Sparkles` icon with `Activity` icon; change headline section from `bg-primary/5 border-primary/15` to `bg-surface-high/50 border-outline/20`; change refresh button from `variant="ghost"` to `variant="secondary" size="sm"`; add `aria-label` to refresh button in `client/src/pages/AssistantPage.tsx`
- [x] T035 [P] Assistant NoteCard action button touch target — add `min-h-[44px] px-1 -mx-1` to action button; add `rtl:rotate-180` to ArrowRight icon in `client/src/pages/AssistantPage.tsx`
- [x] T036 [P] RTL currency fix in DecisionQueue — replace hardcoded `$${s.value.toLocaleString()}` with `formatCurrency(Number(s.value))` using `useFormatCurrency` hook; add `dir="ltr"` to SignalCard value display in `client/src/features/signals/components/DecisionQueue.tsx` and `client/src/features/signals/components/SignalCard.tsx`
- [x] T037 [P] DecisionQueue "View All" button accessibility — add `min-h-[44px]`, `focus-visible:ring-2 focus-visible:ring-offset-2`, and `aria-hidden` to ArrowRight icon in `client/src/features/signals/components/DecisionQueue.tsx`
- [x] T038 Verify TypeScript compilation passes with zero errors after all changes

---

## Second Pass Verification

**Completed stabilization areas:**
- ✅ Dashboard hierarchy: reduced visual competition, demoted secondary sections
- ✅ Assistant trust: removed Sparkles/AI iconography, neutral headline styling, operational tone
- ✅ RTL currency: all hardcoded `$` replaced with `useFormatCurrency()`, `dir="ltr"` on numeric values
- ✅ Touch targets: all action buttons meet 44px minimum
- ✅ Focus states: `focus-visible:ring-2` on all interactive elements
- ✅ Reduced motion: already handled globally in `index.css`
- ✅ Modal consistency: all modals use shared Radix Dialog primitive
- ✅ TypeScript: zero compilation errors

**Deferred to next pass:**
- Manual RTL viewport testing (requires running app)
- Manual 320px responsive screenshots
- Screen reader testing (requires assistive technology)
- ExpenseTrendChart axis formatter still uses hardcoded `$` (chart library limitation — would need custom formatter prop)
- i18n key audit for untranslated strings beyond signal workspace scope
