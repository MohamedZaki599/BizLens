import { z } from 'zod';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';

/**
 * Range vocabulary used by the dashboard endpoints. Centralized here so the
 * route file, services, and tests share one source of truth.
 */
export const RANGE_ENUM = z.enum(['this_month', 'last_month', 'last_30_days', 'all']);
export const RangeSchema = z.object({
  range: RANGE_ENUM.optional().default('this_month'),
});

export type Range = z.infer<typeof RANGE_ENUM>;

export interface ResolvedRange {
  from: Date | null;
  to: Date | null;
  label: string;
  prevFrom: Date | null;
  prevTo: Date | null;
}

/**
 * Translate a range token into concrete window + comparison window.
 * The `prev*` window mirrors the requested span so YoY/MoM comparisons stay
 * apples-to-apples (e.g. 30d vs the prior 30d, this month vs last month).
 */
export const resolveRange = (range: string): ResolvedRange => {
  const now = new Date();
  switch (range) {
    case 'last_month': {
      const ref = subMonths(now, 1);
      const prevRef = subMonths(now, 2);
      return {
        from: startOfMonth(ref),
        to: endOfMonth(ref),
        label: 'Last month',
        prevFrom: startOfMonth(prevRef),
        prevTo: endOfMonth(prevRef),
      };
    }
    case 'last_30_days': {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      const prevTo = new Date(from);
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 30);
      return { from, to: now, label: 'Last 30 days', prevFrom, prevTo };
    }
    case 'all':
      return {
        from: null,
        to: null,
        label: 'All time',
        prevFrom: null,
        prevTo: null,
      };
    case 'this_month':
    default: {
      const ref = subMonths(now, 1);
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
        label: 'This month',
        prevFrom: startOfMonth(ref),
        prevTo: endOfMonth(ref),
      };
    }
  }
};
