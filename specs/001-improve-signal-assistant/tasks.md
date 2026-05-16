# Tasks: Final Real-World QA Stabilization Pass

**Input**: Design documents from `/specs/001-improve-signal-assistant/`
**Prerequisites**: plan.md ✓, spec.md ✓

**Tests**: Not applicable — this is a QA verification and fix pass, not feature development.

**Organization**: Tasks grouped by QA concern for sequential verification and fix cycles.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which QA concern this task belongs to
- Include exact file paths in descriptions

---

## Phase 1: Setup (Dev Server & Test Infrastructure)

**Purpose**: Start dev server and establish real browser testing baseline

- [~] T001 Start the client dev server via `npm run dev` in client/ and verify it serves at localhost — confirm no build errors prevent rendering
- [~] T002 [P] Start the server dev process via `npm run dev` in server/ and verify API responds — confirm backend is available for full-stack testing

---

## Phase 2: Foundational (Browser Rendering Baseline)

**Purpose**: Verify the app actually renders in a browser before detailed QA

**⚠️ CRITICAL**: No QA work can begin until rendering is confirmed

- [x] T003 Verify DashboardPage renders without runtime errors at default viewport — check browser console for React errors, hydration mismatches, or missing imports in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T004 [P] Verify AssistantPage renders without runtime errors — check for missing translation keys, undefined data access, or broken imports in client/src/pages/AssistantPage.tsx

**Checkpoint**: App renders — real QA testing can proceed

---

## Phase 3: Real Responsive QA (US1) 🎯 MVP

**Goal**: Verify actual rendering at 320px, 375px, 768px, 1024px, and ultra-wide. Fix real overflow, clipping, and wrapping issues discovered during browser testing.

**Independent Test**: Resize browser to 320px width — verify no horizontal scrollbar appears on any page.

### Implementation for Responsive QA

- [x] T005 [US1] Test DashboardPage at 320px viewport — verify ExecutiveFocusBar wraps correctly, range tabs don't create horizontal overflow, DecisionQueue cards are full-width, charts don't overflow their containers in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T006 [US1] Test DashboardPage at 375px viewport — verify header layout, signal cards spacing, and recent transactions list don't clip text or overflow in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T007 [P] [US1] Test AssistantPage at 320px viewport — verify NoteCard icon+content layout doesn't squeeze, headline text wraps with break-words, action buttons maintain 44px touch targets in client/src/pages/AssistantPage.tsx
- [x] T008 [US1] Test SignalWorkspacePanel modal at 320px — verify dialog content scrolls independently, footer stays pinned, action buttons don't overflow, confidence indicator doesn't clip in client/src/features/signals/components/SignalWorkspacePanel.tsx
- [x] T009 [P] [US1] Test QuickAddModal at 320px — verify form fields stack correctly (grid-cols-1), amount/date inputs don't overflow, category combobox dropdown doesn't clip, submit buttons stay visible in client/src/features/transactions/QuickAddModal.tsx
- [x] T010 [US1] Test DecisionQueue and ExecutiveFocusBar at 768px tablet — verify grid transitions from 1-col to 2-col correctly, no awkward single-card rows, focus bar doesn't wrap mid-word in client/src/features/signals/components/DecisionQueue.tsx

**Checkpoint**: Responsive rendering verified at all breakpoints — no overflow or clipping

---

## Phase 4: Real RTL QA (US2)

**Goal**: Verify actual Arabic-mode rendering in browser. Fix visual alignment, currency rendering, icon direction, and mixed-language issues discovered during real RTL testing.

**Independent Test**: Switch app to Arabic, navigate all pages — verify no English-first visual rhythm, correct icon mirroring, proper currency alignment.

### Implementation for RTL QA

- [x] T011 [US2] Test DashboardPage in Arabic mode — verify header text right-aligned, range tabs flow RTL, signal cards mirror correctly, currency amounts render with correct dir="ltr" isolation in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T012 [US2] Test AssistantPage in Arabic mode — verify NoteCard rail appears on right (start-0 in RTL), ArrowRight icons rotate 180°, priority badges align correctly, headline text is right-aligned in client/src/pages/AssistantPage.tsx
- [x] T013 [P] [US2] Test SignalWorkspacePanel in Arabic mode — verify close button appears at top-start (left in RTL), action buttons in footer align correctly, severity badges and confidence indicators mirror properly in client/src/features/signals/components/SignalWorkspacePanel.tsx
- [x] T014 [US2] Test chart legends and tooltips in Arabic mode — verify ExpenseDonutChart legend text aligns right, tooltip positions correctly relative to cursor, chart axis labels don't clip in client/src/features/dashboard/components/ExpenseDonutChart.tsx and ExpenseTrendChart.tsx
- [x] T015 [P] [US2] Test QuickAddModal in Arabic mode — verify form labels right-aligned, combobox dropdown opens correctly, type toggle pills mirror, submit/cancel button order respects RTL in client/src/features/transactions/QuickAddModal.tsx

**Checkpoint**: RTL rendering verified — Arabic-native UX confirmed

---

## Phase 5: Accessibility Reality Check (US3)

**Goal**: Verify actual keyboard-only navigation works. Fix real focus trapping, tab order, and screen-reader issues discovered during keyboard testing.

**Independent Test**: Unplug mouse, navigate entire app using only Tab/Shift+Tab/Enter/Escape — verify all interactive elements are reachable and operable.

### Implementation for Accessibility QA

- [x] T016 [US3] Test keyboard navigation on DashboardPage — verify Tab moves through range tabs → signal cards → chart sections → recent transactions in logical order, all buttons activate with Enter/Space in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T017 [US3] Test keyboard navigation in SignalWorkspacePanel — verify focus is trapped inside modal when open, Tab cycles through action buttons, ESC closes and restores focus to trigger element in client/src/features/signals/components/SignalWorkspacePanel.tsx
- [x] T018 [P] [US3] Test keyboard navigation in QuickAddModal — verify focus moves to first input on open, Tab cycles through type toggle → amount → date → category → description → buttons, ESC closes in client/src/features/transactions/QuickAddModal.tsx
- [x] T019 [US3] Verify focus-visible states are actually visible in browser — check that focus-ring utility produces a visible ring on Button, Input, Select, Combobox, and tab buttons when focused via keyboard in client/src/components/Button.tsx and client/src/index.css
- [x] T020 [P] [US3] Verify prefers-reduced-motion is respected — enable reduced-motion in OS/browser settings, confirm no animations play (dialog transitions, fade-ins, loading spinners should be instant) in client/src/index.css

**Checkpoint**: Keyboard-only navigation works — all interactive elements reachable and operable

---

## Phase 6: Modal Interaction QA (US4)

**Goal**: Verify actual modal behavior in browser — overlay clicks, scroll locking, internal scrolling, stacked modals, and mobile height behavior.

**Independent Test**: Open SignalWorkspacePanel, scroll page behind it — verify body is scroll-locked. Click overlay — verify modal closes.

### Implementation for Modal QA

- [x] T021 [US4] Test SignalWorkspacePanel overlay behavior — verify clicking overlay closes modal, body scroll is locked when open, internal content scrolls independently, footer stays pinned at bottom in client/src/features/signals/components/SignalWorkspacePanel.tsx
- [x] T022 [US4] Test QuickAddModal on mobile viewport (375px) — verify modal doesn't exceed 90dvh, form content scrolls if needed, submit button stays visible, keyboard doesn't push modal off-screen in client/src/features/transactions/QuickAddModal.tsx
- [x] T023 [P] [US4] Test ConfirmDialog stacking safety — open a modal, trigger a confirm dialog from within it, verify both render correctly without z-index conflicts or overlay doubling in client/src/components/ConfirmDialog.tsx
- [x] T024 [US4] Test focus restoration after modal close — open SignalWorkspacePanel from a signal card, close it, verify focus returns to the signal card that triggered it (not lost to body) in client/src/features/signals/components/SignalWorkspacePanel.tsx

**Checkpoint**: Modal interactions verified — overlay, scroll lock, stacking, and focus restoration all work

---

## Phase 7: Operational Trust & Copy QA (US5)

**Goal**: Audit all user-facing copy for remaining fake AI tone, vague intelligence wording, or unclear operational language. Every insight must feel measurable and explainable.

**Independent Test**: Read every visible string on AssistantPage and DashboardPage — verify none contain "AI", "smart", "intelligent", "powered", or conversational personality.

### Implementation for Trust QA

- [x] T025 [US5] Audit all visible strings on AssistantPage in browser — verify headline, note titles, note messages, action labels, empty states all use operational language (not AI personality) in client/src/pages/AssistantPage.tsx
- [x] T026 [US5] Audit all visible strings on DashboardPage in browser — verify section headings, signal card text, guidance cards, and empty states use metric-based language in client/src/features/dashboard/pages/DashboardPage.tsx
- [x] T027 [P] [US5] Audit signal workspace panel copy — verify signal explanations, action labels, confidence descriptions, and contextual assistant actions use operational wording in client/src/features/signals/components/SignalWorkspacePanel.tsx and ContextualAssistantActions.tsx
- [x] T028 [US5] Audit server-generated assistant notes — verify buildAssistantDigest() in server/src/modules/dashboard/assistant.service.ts produces headlines and messages that reference specific metrics, not vague summaries
- [x] T029 [P] [US5] Audit onboarding and guidance copy — verify OperationalGuidanceCard, ActivationChecklist, and empty states in client/src/features/onboarding/ use clear operational language without marketing fluff

**Checkpoint**: All user-facing copy is operational, measurable, and trustworthy

---

## Phase 8: Polish & Final Verification

**Purpose**: Final cross-cutting verification and issue documentation

- [x] T030 [P] Run TypeScript compilation check (`npx tsc --noEmit` in client/) — verify zero type errors after all QA fixes
- [x] T031 [P] Run ESLint check (`npx eslint src/` in client/) — verify no new lint errors introduced during QA fixes
- [x] T032 Test full user journey in Arabic at 375px — open dashboard → click signal → review workspace → navigate to assistant → add transaction → verify entire flow works without breaks
- [x] T033 Test full user journey in English at 1024px — same flow as T032 but in English desktop — verify no regressions from RTL/responsive fixes
- [x] T034 Document all unresolved issues, edge cases, and deferred technical debt — create a summary of what was found, what was fixed, and what remains as known limitations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all QA work
- **Responsive QA (Phase 3)**: Depends on Foundational — app must render first
- **RTL QA (Phase 4)**: Depends on Foundational — can run in parallel with Phase 3
- **Accessibility QA (Phase 5)**: Depends on Foundational — can run in parallel with Phases 3/4
- **Modal QA (Phase 6)**: Depends on Foundational — can run in parallel with Phases 3/4/5
- **Trust QA (Phase 7)**: Depends on Foundational — can run in parallel with Phases 3-6
- **Polish (Phase 8)**: Depends on all previous phases

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T003 and T004 can run in parallel (Phase 2)
- Phases 3, 4, 5, 6, 7 can all run in parallel after Phase 2
- T007, T009 can run in parallel within Phase 3
- T013, T015 can run in parallel within Phase 4
- T018, T020 can run in parallel within Phase 5
- T023 can run in parallel within Phase 6
- T027, T029 can run in parallel within Phase 7
- T030, T031 can run in parallel within Phase 8

### Critical Path

```
Phase 1 → Phase 2 → Phase 3 → Phase 8
                  ↘ Phase 4 ↗
                  ↘ Phase 5 ↗
                  ↘ Phase 6 ↗
                  ↘ Phase 7 ↗
```

---

## Implementation Strategy

### MVP First (Responsive QA Only)

1. Complete Phase 1: Dev server running
2. Complete Phase 2: App renders
3. Complete Phase 3: Responsive verified at all breakpoints
4. **STOP and VALIDATE**: No overflow or clipping at 320px-ultrawide
5. This alone confirms mobile-readiness

### Incremental Delivery

1. Setup + Foundational → App running
2. Responsive QA → Mobile-verified → Core confidence
3. RTL QA → Arabic-native → International quality
4. Accessibility QA → Keyboard-only works → Inclusive UX
5. Modal QA → Interactions verified → Interaction confidence
6. Trust QA → Copy audited → Operational credibility
7. Polish → Final validation → Ship-ready

---

## Notes

- [P] tasks = different files/concerns, no dependencies
- [Story] label maps task to QA concern (US1-US5)
- FEATURE FREEZE: fix ONLY real issues discovered during testing
- Do NOT refactor, redesign, or add features
- Do NOT claim "verified" without actual browser interaction
- Document issues found even if not fixable in this pass
- Each fix must be minimal and targeted — no cascading changes
