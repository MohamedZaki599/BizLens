import { Prisma } from '@prisma/client';

/**
 * Decimal-/null-/NaN-/Infinity-safe number coercion.
 *
 * The Prisma client returns `Decimal` for monetary columns; raw aggregates may
 * return `null` for empty result sets. Arithmetic on these (or on user input)
 * can silently produce `NaN` or `Infinity` and corrupt downstream insights.
 * Funnel ALL money math through these helpers.
 */
export const toSafeNumber = (
  value: Prisma.Decimal | number | string | null | undefined,
): number => {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value.toString());
  if (!Number.isFinite(n)) return 0;
  return n;
};

/** Round half-away-from-zero to N decimals, NaN-safe. */
export const round = (n: number, decimals = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

export interface ChangeResult {
  /** Percent change as a finite number, e.g. 15 means +15%. */
  pct: number;
  /** Absolute change. */
  delta: number;
  /** Whether a meaningful comparison can be drawn. False when previous is 0. */
  hasComparison: boolean;
  direction: 'up' | 'down' | 'flat';
}

/**
 * Period-over-period change with safe handling of:
 *  - previous = 0 → returns hasComparison=false (no division by zero)
 *  - sign changes (loss → profit) → still produces a finite pct anchored to |prev|
 *  - non-finite inputs → coerced to 0
 */
export const percentChange = (current: number, previous: number): ChangeResult => {
  const c = toSafeNumber(current);
  const p = toSafeNumber(previous);
  const delta = round(c - p);

  if (p === 0) {
    return {
      pct: 0,
      delta,
      hasComparison: false,
      direction: c === 0 ? 'flat' : c > 0 ? 'up' : 'down',
    };
  }

  const pct = round(((c - p) / Math.abs(p)) * 100, 1);
  const direction = pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat';
  return { pct, delta, hasComparison: true, direction };
};

/** Share of `part` within `total`, capped at [0, 100], divide-by-zero-safe. */
export const shareOf = (part: number, total: number): number => {
  const t = toSafeNumber(total);
  if (t === 0) return 0;
  const ratio = (toSafeNumber(part) / t) * 100;
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(100, round(ratio, 1)));
};

/** Format a percent change as a human-friendly string (`+15%`, `−4%`, `±0%`). */
export const formatPctChange = (pct: number): string => {
  if (!Number.isFinite(pct)) return '±0%';
  const rounded = Math.round(pct);
  if (rounded === 0) return '±0%';
  if (rounded > 0) return `+${rounded}%`;
  return `−${Math.abs(rounded)}%`;
};

export const formatMoney = (value: number, currency = 'USD'): string => {
  const safe = toSafeNumber(value);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
};
