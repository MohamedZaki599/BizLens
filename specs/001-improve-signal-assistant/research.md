# Research: Operational Signal & Assistant UX Refinement

## RTL & Drawer Layout (React/Tailwind/Framer Motion)

### Decision: Semantic Alignment of Animation & Placement
The current `SignalWorkspacePanel.tsx` uses `end-0` with a manual `isRtl ? '-100%' : '100%'` calculation for Framer Motion. While technically correct, it's brittle.
- **Refinement**: We will use CSS logical properties for the slide animation where possible, or ensure that the `x` offset explicitly matches the `right` (LTR) or `left` (RTL) pinning.
- **Sticky Footer**: The current implementation has a `flex-1 overflow-y-auto` area followed by a footer. This is the correct pattern, but we will ensure the `flex-col` container has a fixed `h-full` or `inset-y-0` to prevent layout collapse on mobile.

## Contextual AI Assistant behavior

### Decision: Context Injection via Query Params/State
The AI assistant currently generates a generic digest. To make it data-aware:
- **Client-side**: When the assistant is opened from the `SignalWorkspacePanel`, we will append the `signalId` or `signalKey` to the assistant request.
- **Server-side**: In `assistant.service.ts`, we will implement `generateSignalInsight(userId, signalKey)`. This will fetch the specific signal and its related transaction drivers to construct a focused response.
- **Persona**: The system prompt will be updated to "Signal Analyst" mode, removing generic "I am an AI" greetings.

## Responsive Overlay & Placeholder Prevention

### Decision: Strict Handler Validation
- **Button Visibility**: We will move primary "Action" buttons (e.g., "Review Transactions") into a fixed "Primary Action Bar" below the header or above the footer, ensuring they never scroll out of view.
- **No-Op Guards**: We will audit `SignalWorkspacePanel.tsx` and `assistant.service.ts` to ensure every `AssistantAction` has a corresponding implementation in the client's router or state manager. Any action without a handler must be filtered out before rendering.

## Findings Summary

| Topic | Problem | Solution |
|-------|---------|----------|
| RTL Animation | Manual x-offset calculation mismatch | Align `motion` initial/exit with `end-0` logic |
| Action Visibility | Buttons buried in scrollable content | Move primary actions to sticky container |
| AI Context | Generic "Hello" messages | Inject `activeSignalKey` into assistant payload |
| Empty Actions | Placeholder buttons in metadata | Validate `action` payload before rendering |
