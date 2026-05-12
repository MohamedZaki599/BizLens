---
description: "Task list for Operational Signal & Assistant UX Refinement"
---

# Tasks: Operational Signal & Assistant UX Refinement

**Input**: Design documents from `/specs/001-improve-signal-assistant/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 [P] Verify development environment for monorepo (client/server)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Update Assistant API contract in `server/src/modules/dashboard/dashboard.routes.ts` to accept optional `signalKey`
- [ ] T004 [P] Define `AssistantContext` and `SignalInsight` types in `server/src/modules/dashboard/assistant.service.ts`
- [ ] T005 [P] Create `SignalAnalyst` system prompt template in `server/src/modules/dashboard/assistant.service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Reviewing a Financial Signal in Arabic (Priority: P1) 🎯 MVP

**Goal**: Fix RTL drawer layout and ensure action button visibility in Arabic mode.

**Independent Test**: Switch language to Arabic, open a signal card, and verify drawer slides from the left with visible resolve/investigate buttons.

### Implementation for User Story 1

- [ ] T006 [US1] Refactor `SignalWorkspacePanel.tsx` to use CSS logical properties (e.g., `start-0`, `border-s`) for layout stability
- [ ] T007 [US1] Update Framer Motion `initial`/`exit` x-offsets in `SignalWorkspacePanel.tsx` to align with RTL directionality
- [ ] T008 [US1] Implement sticky footer container for primary action buttons in `client/src/features/signals/components/SignalWorkspacePanel.tsx`

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Context-Aware AI Guidance (Priority: P2)

**Goal**: Make the AI assistant summarize specific signal data instead of generic greetings.

**Independent Test**: Open the assistant from a signal view and verify the message includes the signal's value and category.

### Implementation for User Story 2

- [ ] T009 [US2] Implement `generateSignalInsight` method in `server/src/modules/dashboard/assistant.service.ts` to fetch specific signal drivers
- [ ] T010 [US2] Update `buildAssistantDigest` in `assistant.service.ts` to prioritize signal-specific insights when `signalKey` is present
- [ ] T011 [US2] Update `SignalWorkspacePanel.tsx` to pass `activeSignalKey` to the assistant request payload

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Responsive Overlay & Reliable Actions (Priority: P3)

**Goal**: Ensure mobile responsiveness and remove non-functional placeholder actions.

**Independent Test**: Verify drawer layout on 320px viewport and ensure all buttons trigger functional routes.

### Implementation for User Story 3

- [ ] T012 [P] [US3] Audit and fix responsive constraints (flex/grid) in `client/src/features/signals/components/SignalWorkspacePanel.tsx` for small screens
- [ ] T013 [US3] Replace placeholder actions with functional handlers or deep-links in `SignalWorkspacePanel.tsx` and `assistant.service.ts`
- [ ] T014 [P] [US3] Verify safe-area padding for mobile devices in `SignalWorkspacePanel.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final audit and refinements

- [ ] T015 [P] Run `quickstart.md` validation across all viewports and languages
- [ ] T016 Final visual audit of RTL mirroring consistency
- [ ] T017 Validate Assistant Contextual Responses (SC-002): Audit responses for 5+ diverse signals ensuring 2+ data points, context relevance, and RTL consistency.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Phase 2 completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- T004 and T005 can run in parallel.
- US1 (Phase 3) and US2 (Phase 4) implementation tasks are largely in different files/layers and could be worked on in parallel once Phase 2 is complete.
- All [P] marked tasks are parallelizable.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3 (RTL & Button Visibility).
3. **STOP and VALIDATE**: Verify RTL drawer on mobile.
