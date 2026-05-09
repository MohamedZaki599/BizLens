/**
 * BizLens Design Tokens — Spacing, radius, shadows, overlays, surfaces.
 */

/** Semantic spacing scale (maps to Tailwind spacing where possible). */
export const spacing = {
  /** Dialog internal padding. */
  dialogPadding: 'px-6 py-5',
  /** Dialog body padding. */
  dialogBody: 'px-6 pb-6 pt-2',
  /** Dialog footer padding (with top border). */
  dialogFooter: 'px-6 py-4',
  /** Card internal padding. */
  card: 'p-6',
  /** Section gap. */
  sectionGap: 'space-y-6',
} as const;

/** Semantic border-radius values. */
export const radius = {
  dialog: 'rounded-2xl',
  card: 'rounded-2xl',
  button: 'rounded-xl',
  input: 'rounded-xl',
  badge: 'rounded-full',
  pill: 'rounded-full',
} as const;

/** Semantic shadow values. */
export const shadow = {
  dialog: 'shadow-ambient',
  card: 'shadow-sm',
  dropdown: 'shadow-ambient',
  elevated: 'shadow-lg',
} as const;

/** Overlay / backdrop styles. */
export const overlay = {
  /** Standard backdrop for dialogs. */
  dialog: 'bg-black/40 backdrop-blur-sm',
  /** Lighter overlay for drawers. */
  drawer: 'bg-black/20 backdrop-blur-[2px]',
} as const;

/** Surface hierarchy — maps to CSS variable-powered Tailwind utilities. */
export const surface = {
  /** Dialog content surface. */
  dialog: 'bg-surface-lowest border border-outline/10',
  /** Card surface. */
  card: 'bg-surface-lowest border border-outline/10',
  /** Elevated surface (dropdowns, popovers). */
  elevated: 'bg-surface-lowest border border-outline/30',
  /** Recessed surface (input wells, code blocks). */
  recessed: 'bg-surface-low',
} as const;
