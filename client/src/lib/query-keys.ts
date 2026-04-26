/**
 * Centralized React Query keys.
 *
 * Owning query keys in one place makes invalidation explicit and prevents
 * features from coupling to each other's internal cache structure. Mutations
 * should invalidate using these constants rather than passing through other
 * features' modules.
 */

export const QK = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
  alerts: {
    all: ['alerts'] as const,
  },
} as const;

export type QueryKey = readonly unknown[];
