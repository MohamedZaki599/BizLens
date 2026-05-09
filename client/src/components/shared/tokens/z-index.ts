/**
 * BizLens Design Tokens — Centralized z-index scale.
 *
 * Every z-index in the app should reference these tokens
 * to prevent z-fighting and make layer ordering auditable.
 */
export const zIndex = {
  /** App-level chrome (sidebar) */
  sidebar: 30,
  /** Floating action buttons */
  fab: 30,
  /** Sticky headers / bars */
  header: 20,
  /** Dropdown menus, popovers, tooltips */
  dropdown: 40,
  /** Drawer / slide-over panels */
  drawer: 40,
  /** Dialog overlay backdrop */
  dialogOverlay: 50,
  /** Dialog content panel */
  dialogContent: 50,
  /** Toast notifications */
  toast: 60,
} as const;
