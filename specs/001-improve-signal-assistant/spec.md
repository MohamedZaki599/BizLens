# Feature Specification: Operational Signal & Assistant UX Refinement

**Feature Branch**: `001-improve-signal-assistant`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "Improve the BizLens operational signal review system and AI assistant behavior. Goals: fix broken RTL drawer layout, keep action buttons visible, improve signal review UX, make assistant contextual and data-aware, remove generic assistant responses, ensure responsive overlay behavior, prevent empty unused actions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reviewing a Financial Signal in Arabic (Priority: P1)

As a bilingual SMB owner using BizLens in Arabic, I want to review an operational signal in a drawer that respects RTL layout and keeps all action buttons visible, so I can take immediate action on financial insights without UI friction.

**Why this priority**: Core value of BizLens is "clarity to action". If the UI is broken in RTL or buttons are hidden, the user cannot take action.

**Independent Test**: Switch app language to Arabic, trigger a signal detail drawer. Verify layout is correctly mirrored, buttons (e.g., "Review Transactions") are visible and clickable, and the drawer is responsive on mobile.

**Acceptance Scenarios**:

1. **Given** the app is in Arabic mode, **When** I click on a signal card, **Then** the detail drawer slides in from the left (correct RTL), text is right-aligned, and primary action buttons are pinned/visible at the bottom.
2. **Given** a long signal description, **When** I scroll the drawer, **Then** the action buttons remain visible or easily accessible without overlapping content.

---

### User Story 2 - Context-Aware AI Guidance (Priority: P2)

As a user reviewing a specific signal (e.g., "Expense Spike in Marketing"), I want the AI assistant to provide a summary that is specific to that signal's data, so I don't get generic "I am here to help" responses.

**Why this priority**: Principle VII (Explainable Signals & Trust) requires signals to be drivers of action. A generic AI assistant undermines trust.

**Independent Test**: Open the AI assistant while a specific signal is active. Verify the assistant's initial response mentions the signal name and relevant data points (e.g., the 20% spike amount).

**Acceptance Scenarios**:

1. **Given** a signal is open in the UI, **When** I open the AI assistant, **Then** the assistant summarizes the specific signal and suggests actions related to that signal's category.
2. **Given** the assistant is open, **When** I ask "What happened?", **Then** it provides a data-driven explanation instead of a generic "I can help you track finances" response.

---

### User Story 3 - Responsive Overlay & Reliable Actions (Priority: P3)

As a mobile user, I want the signal review overlays to be responsive and free of empty actions, so I can reliably navigate the platform on any device.

**Why this priority**: Principle V (Fast Onboarding & Low Friction UX) and Principle VI (Responsive Layouts).

**Independent Test**: Use the app on a mobile-sized viewport. Open multiple overlays. Verify no layout breaks and no "Action" buttons lead to empty or non-functional states.

**Acceptance Scenarios**:

1. **Given** a mobile device, **When** I open the signal review system, **Then** the overlay adapts to the screen width and does not cut off metadata.
2. **Given** any interactive element in the assistant or drawer, **When** I click it, **Then** it performs a functional action (deep-link, filter, etc.) and never triggers a "coming soon" or empty state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **RTL Drawer Layout**: The signal detail drawer MUST support full RTL mirroring, including sliding direction, text alignment, and icon orientation.
- **FR-002**: **Action Visibility**: Primary action buttons in the detail drawer MUST be visible regardless of content length (e.g., via sticky footer or safe area padding).
- **FR-003**: **Contextual AI Injector**: The AI assistant MUST receive the current "Signal Context". The client only sends `signalKey`. The server-side insight generator is responsible for resolving signal type, metadata, anomaly details, and related operational context. This prevents client-side duplication and ensures trusted contextual analysis.
- **FR-004**: **Data-Aware Responses**: The AI assistant MUST summarize the current signal's data (amount, percentage change, period) in its opening response.
- **FR-005**: **Responsive Overlays**: All drawer and modal components MUST use flexible layouts (Flexbox/Grid) that prevent content overflow on screens down to 320px width.
- **FR-006**: **Action Validation**: Every interactive button or link in the signal system MUST map to a functional route or handler; no placeholder actions allowed.
- **FR-007**: **Assistant Prompt Hardening**: Remove all generic system prompts that lead to "I am an AI assistant" introductions in favor of "Signal Analyst" personas.

### Key Entities

- **Operational Signal**: Represents the financial anomaly or insight (Amount, Trend, Category, Deep Link).
- **Assistant Session**: Represents the data-aware interaction context between the user and the AI (History, Contextual Data, Recommendations).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of P1 signal action buttons are visible and clickable on both Desktop and Mobile viewports without manual scrolling to find them.
- **SC-002**: Assistant initial response contains at least 2 specific data points from the active signal in 90% of test cases.
- **SC-003**: Zero layout "breakage" (overlapping text or clipped elements) reported in RTL mode during responsive testing (320px to 1920px).
- **SC-004**: Zero interactive elements trigger a "no-op" or "placeholder" behavior in the signal review flow.

## Assumptions

- **A-001**: The existing AI assistant infrastructure supports passing custom context objects in the backend request.
- **A-002**: RTL support is implemented using CSS Logical Properties (`margin-inline-start`, etc.) or direction-aware classes.
- **A-003**: Mobile responsiveness will prioritize vertical scrolling for drawers.
