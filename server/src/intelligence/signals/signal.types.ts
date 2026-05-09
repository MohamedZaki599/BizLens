/**
 * FinancialSignal — the universal output contract for all intelligence computations.
 *
 * Every calculator, generator, and engine in the intelligence module ultimately
 * produces one or more of these. Consumers (alerts, insights, dashboard, assistant)
 * read signals — they never compute financial metrics directly.
 *
 * Design rules:
 *  - Signals are language-agnostic (no human-readable text — localization is separate).
 *  - Signals are deterministic given the same input data.
 *  - Signals carry enough metadata to reconstruct context without re-querying.
 */

// ─── Enums ────────────────────────────────────────────────────────────────

export type SignalSeverity = 'none' | 'info' | 'warning' | 'critical';
export type SignalTrend = 'up' | 'down' | 'flat' | 'unknown';

// ─── Signal Keys ──────────────────────────────────────────────────────────

/** Exhaustive list of all signal types the engine can produce. */
export type SignalKey =
  // Profitability signals
  | 'PROFIT_MARGIN'
  | 'REVENUE_GROWTH'
  | 'PROFIT_TREND'
  | 'EXPENSE_GROWTH'
  // Spending signals
  | 'BURN_RATE'
  | 'EXPENSE_RATIO'
  | 'TOP_EXPENSE_CATEGORY'
  | 'TOP_INCOME_CATEGORY'
  | 'CATEGORY_CONCENTRATION'
  // Forecast signals
  | 'PROJECTED_EXPENSE'
  | 'PROJECTED_INCOME'
  | 'PROJECTED_PROFIT'
  | 'CASH_RUNWAY_DAYS'
  // Anomaly signals
  | 'SPEND_SPIKE'
  | 'SPENDING_ANOMALY'
  | 'WEEKLY_SPEND_CHANGE'
  // Activity signals
  | 'STALE_DATA'
  | 'RECURRING_EXPENSE';

// ─── Signal Contract ──────────────────────────────────────────────────────

export interface FinancialSignal {
  /** Unique signal type identifier. */
  key: SignalKey;

  /** Primary computed numeric value. */
  value: number;

  /** How critical this signal is. */
  severity: SignalSeverity;

  /** Direction of movement compared to baseline/previous period. */
  trend: SignalTrend;

  /**
   * Confidence score 0–1.
   *  - 1.0 = full data, high-quality comparison
   *  - 0.5 = partial data (e.g. only a few days into the month)
   *  - 0.0 = no baseline data available
   */
  confidence: number;

  /** Signal-specific structured data. Never used for display — only for downstream logic. */
  metadata: Record<string, unknown>;

  /** When this signal was computed. */
  generatedAt: Date;

  /**
   * TTL category — determines cache/recomputation policy.
   * Consumers use this to decide whether to recompute or serve cached.
   */
  ttlCategory: 'dashboard' | 'alert' | 'analytical';
}

// ─── Signal Generation Context ────────────────────────────────────────────

/** Passed to every signal generator so it knows what scope to compute for. */
export interface SignalGenerationContext {
  userId: string;
  generatedAt: Date;
}

/** A generator function that produces zero or more signals from a data snapshot. */
export type SignalGenerator<TSnapshot> = (
  snapshot: TSnapshot,
  ctx: SignalGenerationContext,
) => FinancialSignal[];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Create a signal with sensible defaults. */
export const createSignal = (
  key: SignalKey,
  value: number,
  overrides: Partial<Omit<FinancialSignal, 'key' | 'value'>> = {},
): FinancialSignal => ({
  key,
  value,
  severity: 'none',
  trend: 'unknown',
  confidence: 1.0,
  metadata: {},
  generatedAt: new Date(),
  ttlCategory: 'dashboard',
  ...overrides,
});
