/**
 * Client-side mirror of the server safe-math helpers. Use these for any
 * calculation derived from user-entered or API-returned values to avoid
 * `NaN`/`Infinity` ever leaking into the UI.
 */

export const toSafeNumber = (value: number | string | null | undefined): number => {
  if (value == null) return 0;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
};

export const round = (n: number, decimals = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
};

export interface ChangeResult {
  pct: number;
  delta: number;
  hasComparison: boolean;
  direction: 'up' | 'down' | 'flat';
}

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

export const shareOf = (part: number, total: number): number => {
  const t = toSafeNumber(total);
  if (t === 0) return 0;
  const ratio = (toSafeNumber(part) / t) * 100;
  if (!Number.isFinite(ratio)) return 0;
  return Math.max(0, Math.min(100, round(ratio, 1)));
};

export const formatPctChange = (pct: number, hasComparison = true): string => {
  if (!hasComparison) return '—';
  if (!Number.isFinite(pct)) return '±0%';
  const rounded = Math.round(pct);
  if (rounded === 0) return '±0%';
  if (rounded > 0) return `+${rounded}%`;
  return `−${Math.abs(rounded)}%`;
};
