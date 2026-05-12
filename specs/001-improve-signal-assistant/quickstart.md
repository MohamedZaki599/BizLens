# Quickstart: Operational Signal & Assistant UX Refinement

## Verification Steps

### 1. RTL Drawer Stability
- Start the app: `npm run dev:client`
- Navigate to Settings and switch language to **Arabic**.
- Go to Dashboard and click any Signal card.
- **Verify**:
  - The drawer slides in from the **left**.
  - All text is right-aligned (`text-right` or `dir="rtl"`).
  - The close button is on the top-right (logical top-start).
  - The "Resolve" and "Investigate" buttons are visible at the bottom without scrolling.

### 2. Data-Aware Assistant
- Open a signal (e.g., "Expense Spike").
- Click the "Ask Assistant" or "AI Guide" section in the drawer.
- **Verify**:
  - The assistant opens.
  - The first message summarizes the **active signal**'s data.
  - No generic "How can I help you?" introduction.

### 3. Responsive Button Visibility
- Open Chrome DevTools and toggle **Mobile View** (320px width).
- Trigger the signal drawer.
- **Verify**:
  - The primary "Action" button is visible above the fold or in a sticky footer.
  - No content overlaps the bottom buttons.

## Technical Implementation Notes

- **CSS**: Use `sticky bottom-0` for the drawer footer.
- **Framer Motion**: Use `layout` prop to handle automatic direction flipping if the container has `dir="rtl"`.
- **API**: The `AssistantDigest` payload now includes a `kind: 'signal-explanation'` note at index 0 when `signalKey` is passed.
