/**
 * System default thresholds — extracted from the hardcoded values scattered
 * across alert-engine.ts, insight-engine.ts, and dashboard.service.ts.
 *
 * These serve as the Level-1 fallback. The DB table (IntelligenceThreshold)
 * can override any of these per business-type.
 */

import type { ThresholdKey, ThresholdRule, ThresholdConfig } from './threshold.types';

const DEFAULTS: Record<ThresholdKey, ThresholdRule> = {
  // Spend spike detection (alert-engine L129-130)
  SPEND_SPIKE_WARNING_PCT: {
    key: 'SPEND_SPIKE_WARNING_PCT',
    value: 50,
    description: 'Category weekly spend above this % vs 4-week avg triggers a warning',
  },
  SPEND_SPIKE_CRITICAL_PCT: {
    key: 'SPEND_SPIKE_CRITICAL_PCT',
    value: 100,
    description: 'Category weekly spend above this % vs 4-week avg triggers critical',
  },

  // Concentration risk (alert-engine L244, insight-engine L274)
  CONCENTRATION_WARNING_PCT: {
    key: 'CONCENTRATION_WARNING_PCT',
    value: 50,
    description: 'Single category share of monthly expense above this triggers warning',
  },
  CONCENTRATION_CRITICAL_PCT: {
    key: 'CONCENTRATION_CRITICAL_PCT',
    value: 70,
    description: 'Single category share above this triggers critical',
  },

  // Profit drop (alert-engine L197)
  PROFIT_DROP_WARNING_PCT: {
    key: 'PROFIT_DROP_WARNING_PCT',
    value: 15,
    description: 'Month-over-month profit drop % that triggers warning',
  },
  PROFIT_DROP_CRITICAL_PCT: {
    key: 'PROFIT_DROP_CRITICAL_PCT',
    value: 30,
    description: 'Month-over-month profit drop % that triggers critical',
  },

  // Stale data (alert-engine L293)
  STALE_DATA_DAYS: {
    key: 'STALE_DATA_DAYS',
    value: 3,
    description: 'Days since last transaction before stale-data signal triggers',
  },
  STALE_DATA_WARNING_DAYS: {
    key: 'STALE_DATA_WARNING_DAYS',
    value: 7,
    description: 'Days since last transaction before stale-data becomes a warning',
  },

  // Forecast overspend (alert-engine L336)
  FORECAST_OVERSPEND_PCT: {
    key: 'FORECAST_OVERSPEND_PCT',
    value: 15,
    description: 'Projected expense vs last month % that triggers overspend signal',
  },

  // Weekly spend increase (alert-engine L271)
  WEEKLY_SPEND_INCREASE_PCT: {
    key: 'WEEKLY_SPEND_INCREASE_PCT',
    value: 25,
    description: 'Week-over-week expense increase % that triggers signal',
  },

  // Anomaly detection (insight-engine L438-444)
  ANOMALY_WARNING_PCT: {
    key: 'ANOMALY_WARNING_PCT',
    value: 50,
    description: 'Category spend vs 3-month avg above this % triggers anomaly warning',
  },
  ANOMALY_CRITICAL_PCT: {
    key: 'ANOMALY_CRITICAL_PCT',
    value: 100,
    description: 'Category spend vs 3-month avg above this % triggers critical anomaly',
  },

  // Expense ratio
  EXPENSE_RATIO_WARNING: {
    key: 'EXPENSE_RATIO_WARNING',
    value: 0.85,
    description: 'Expense-to-income ratio above this triggers warning',
  },
  EXPENSE_RATIO_CRITICAL: {
    key: 'EXPENSE_RATIO_CRITICAL',
    value: 1.0,
    description: 'Expense-to-income ratio above this (expenses > income) triggers critical',
  },

  // Recurring detection (alert-engine L362, L386)
  RECURRING_MIN_MONTHS: {
    key: 'RECURRING_MIN_MONTHS',
    value: 3,
    description: 'Minimum consecutive months to flag a recurring expense',
  },
  RECURRING_MIN_AMOUNT: {
    key: 'RECURRING_MIN_AMOUNT',
    value: 5,
    description: 'Minimum transaction amount to consider for recurring detection',
  },
};

/**
 * In-memory threshold config backed by system defaults.
 * The threshold-store.ts layer wraps this with DB overrides.
 */
export const systemDefaults: ThresholdConfig = {
  get(key: ThresholdKey): number {
    return DEFAULTS[key].value;
  },
  getAll(): ThresholdRule[] {
    return Object.values(DEFAULTS);
  },
};

export { DEFAULTS };
