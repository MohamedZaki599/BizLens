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

import type { LocalizedPayload } from '../localization/localization.types';

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
  | 'PROFIT_DROP'
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
  | 'FORECAST_OVERSPEND'
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
  metadata: {
    /**
     * Human-readable description of the signal.
     * @deprecated Use `localized.summaryKey` with interpolation params instead. Removal target: v0.3.0.
     */
    description?: string;
    /** Explainability context required for all signals for auditability and operational insights. */
    explainability?: {
      /** The specific formulas or calculation steps used (e.g., "(ThisWeek - LastWeek) / LastWeek") */
      formula: string;
      /** The raw numeric inputs that went into the formula */
      inputs: Record<string, number | string>;
      /** Why this signal triggered (e.g., "Exceeded 30% threshold for High Volatility") */
      thresholdContext?: string;
      /** English-readable reasoning chain for LLM context or debugging */
      reasoningChain: string[];
      /** Parallel array of interpolation params for each reasoningChain entry (raw values only). */
      reasoningParams?: Record<string, number | string>[];
      /** IDs of the primary entities involved (e.g., Category UUID) */
      sourceEntities?: string[];
    };
    [key: string]: unknown;
  };

  /**
   * Localized payload containing semantic translation keys and raw interpolation parameters.
   * Replaces legacy prose fields (metadata.description) with language-agnostic contracts.
   */
  localized?: LocalizedPayload;

  /** When this signal was computed. */
  generatedAt: Date;

  /**
   * TTL category — determines cache/recomputation policy.
   * Consumers use this to decide whether to recompute or serve cached.
   */
  ttlCategory: 'dashboard' | 'alert' | 'analytical';

  /** Lifecycle status. */
  status?: 'NEW' | 'REVIEWED' | 'INVESTIGATING' | 'SNOOZED' | 'RESOLVED';

  /** If snoozed, until when. */
  snoozedUntil?: Date | string | null;

  /** Notes provided during resolution/snooze. */
  resolutionNotes?: string | null;
}

// ─── Operational Insight Contract ─────────────────────────────────────────

export interface OperationalInsight {
  id: string;
  signalKey: SignalKey;
  severity: 'info' | 'success' | 'warning' | 'critical';
  urgency: 'low' | 'medium' | 'high';
  
  /** Short, actionable summary (e.g., "Marketing spend spiked 40%") */
  summary: string;
  
  /** Plain-language explanation using explainability metadata */
  explanation: string;
  
  /** Recommended action */
  action?: {
    label: string;
    type: 'navigate' | 'filter' | 'review';
    payload: Record<string, unknown>;
  };
  
  confidence: number;
}

// ─── Signal Generation Context ────────────────────────────────────────────

/** Passed to every signal generator so it knows what scope to compute for. */
export interface SignalGenerationContext {
  userId: string;
  generatedAt: Date;
  /** User's preferred currency code (e.g. 'USD', 'SAR'). Used for monetary formatting in metadata. */
  currency?: string;
}

/** A generator function that produces zero or more signals from a data snapshot. */
export type SignalGenerator<TSnapshot> = (
  snapshot: TSnapshot,
  ctx: SignalGenerationContext,
) => FinancialSignal[];

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Runtime set of all valid signal keys — kept in sync with SignalKey type. */
export const SIGNAL_KEYS: readonly SignalKey[] = [
  'PROFIT_MARGIN', 'REVENUE_GROWTH', 'PROFIT_TREND', 'PROFIT_DROP', 'EXPENSE_GROWTH',
  'BURN_RATE', 'EXPENSE_RATIO', 'TOP_EXPENSE_CATEGORY', 'TOP_INCOME_CATEGORY', 'CATEGORY_CONCENTRATION',
  'PROJECTED_EXPENSE', 'PROJECTED_INCOME', 'PROJECTED_PROFIT', 'CASH_RUNWAY_DAYS', 'FORECAST_OVERSPEND',
  'SPEND_SPIKE', 'SPENDING_ANOMALY', 'WEEKLY_SPEND_CHANGE',
  'STALE_DATA', 'RECURRING_EXPENSE',
] as const;

const signalKeySet: ReadonlySet<string> = new Set(SIGNAL_KEYS);

/** Type guard: narrows a string to SignalKey at runtime. */
export const isSignalKey = (value: string): value is SignalKey => signalKeySet.has(value);

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
