# Data Model: Operational Signal & Assistant UX Refinement

## API Entities (Dynamic Context)

### AssistantContext (Query Parameters)
This object is passed to the assistant service to provide localized context.
- `signalKey` (optional): `string` - The unique identifier of the active signal being reviewed.
- `locale`: `string` - The user's current language (e.g., 'en', 'ar').

### SignalInsight (Assistant Response Override)
When a `signalKey` is provided, the assistant response is tailored:
- `id`: `string` - `signal-explanation:<signalKey>`
- `kind`: `string` - `signal-explanation`
- `title`: `string` - Derived from signal name
- `message`: `string` - Data-aware explanation of the signal drivers
- `action`: `AssistantAction` (optional) - Deep link to relevant transactions

## Component States (Frontend)

### SignalWorkspacePanel State
- `isRtl`: `boolean` - Used to flip Framer Motion coordinates and Tailwind logical properties.
- `pinnedActions`: `boolean` - Flag to keep primary buttons in a fixed footer.
- `contextualAssistantOpen`: `boolean` - Track if the assistant was opened from within a signal view.
