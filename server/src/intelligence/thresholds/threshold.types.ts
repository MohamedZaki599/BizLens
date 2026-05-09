/**
 * Threshold system — configurable limits that drive signal severity and alert generation.
 *
 * Hierarchy (MVP):
 *  1. System defaults (hardcoded fallback)
 *  2. Business-type presets (per UserMode)
 *  3. Future: per-user overrides (architecture supports it, not yet exposed)
 *
 * The threshold store reads from the DB table first, falls back to defaults.
 */

import type { SignalSeverity } from '../signals/signal.types';

// ─── Threshold Keys ───────────────────────────────────────────────────────

export type ThresholdKey =
  | 'SPEND_SPIKE_WARNING_PCT'
  | 'SPEND_SPIKE_CRITICAL_PCT'
  | 'CONCENTRATION_WARNING_PCT'
  | 'CONCENTRATION_CRITICAL_PCT'
  | 'PROFIT_DROP_WARNING_PCT'
  | 'PROFIT_DROP_CRITICAL_PCT'
  | 'STALE_DATA_DAYS'
  | 'STALE_DATA_WARNING_DAYS'
  | 'FORECAST_OVERSPEND_PCT'
  | 'WEEKLY_SPEND_INCREASE_PCT'
  | 'ANOMALY_WARNING_PCT'
  | 'ANOMALY_CRITICAL_PCT'
  | 'EXPENSE_RATIO_WARNING'
  | 'EXPENSE_RATIO_CRITICAL'
  | 'RECURRING_MIN_MONTHS'
  | 'RECURRING_MIN_AMOUNT';

// ─── Types ────────────────────────────────────────────────────────────────

export interface ThresholdRule {
  key: ThresholdKey;
  value: number;
  description: string;
}

export interface ThresholdConfig {
  get(key: ThresholdKey): number;
  getAll(): ThresholdRule[];
}

/** Severity bracket: { warning: 50, critical: 100 } → classify(60) = 'warning' */
export interface SeverityBracket {
  warning: number;
  critical: number;
}

// ─── Severity Classification ──────────────────────────────────────────────

/**
 * Given a value and a bracket, return the appropriate severity.
 * Values below warning → 'info', between → 'warning', above critical → 'critical'.
 */
export const classifySeverity = (
  value: number,
  bracket: SeverityBracket,
): SignalSeverity => {
  if (value >= bracket.critical) return 'critical';
  if (value >= bracket.warning) return 'warning';
  return 'info';
};
