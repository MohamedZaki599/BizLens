/**
 * Signal-to-Dashboard Adapter
 *
 * Maps canonical FinancialSignal[] to dashboard widget formats.
 * Ensures dashboard metrics are derived from signals rather than
 * independently computed, maintaining consistency.
 */

import type { FinancialSignal, SignalKey } from '../signals/signal.types';

// ─── Types ────────────────────────────────────────────────────────────────

export interface DashboardWarning {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
  signalKey: SignalKey;
}

export interface SignalDerivedMetrics {
  warnings: DashboardWarning[];
  profitTrend: { direction: 'up' | 'down' | 'flat'; pct: number } | null;
  expenseGrowth: { direction: 'up' | 'down' | 'flat'; pct: number } | null;
  revenueGrowth: { direction: 'up' | 'down' | 'flat'; pct: number } | null;
  topExpenseCategory: { categoryId: string; name: string; share: number } | null;
}

// ─── Warning Derivation ───────────────────────────────────────────────────

/** Signal keys that should generate dashboard warnings when severity >= warning. */
const WARNING_SIGNAL_KEYS: SignalKey[] = [
  'SPEND_SPIKE',
  'SPENDING_ANOMALY',
  'CATEGORY_CONCENTRATION',
  'FORECAST_OVERSPEND',
  'PROFIT_DROP',
  'EXPENSE_GROWTH',
];

/**
 * Derives dashboard warnings from signals with severity >= warning.
 * Replaces inline threshold checks in dashboard.service.ts.
 */
export const deriveWarnings = (signals: FinancialSignal[]): DashboardWarning[] => {
  const warnings: DashboardWarning[] = [];

  for (const signal of signals) {
    if (signal.severity !== 'warning' && signal.severity !== 'critical') continue;
    if (!WARNING_SIGNAL_KEYS.includes(signal.key)) continue;

    const message = buildWarningMessage(signal);
    if (!message) continue;

    warnings.push({
      id: signal.key.toLowerCase().replace(/_/g, '-'),
      severity: signal.severity === 'critical' ? 'critical' : 'warning',
      message,
      signalKey: signal.key,
    });
  }

  return warnings;
};

/**
 * Builds a human-readable warning message from a signal.
 * Uses explainability metadata when available.
 */
const buildWarningMessage = (signal: FinancialSignal): string | null => {
  const exp = signal.metadata?.explainability;
  const chain = exp?.reasoningChain;

  // Use the first reasoning chain entry if available
  if (chain && chain.length > 0) {
    return chain[0];
  }

  // Fallback: generate from signal key and value
  switch (signal.key) {
    case 'SPEND_SPIKE':
      return `Spending spiked ${Math.round(signal.value)}% above baseline.`;
    case 'SPENDING_ANOMALY':
      return `Unusual spending pattern detected (${Math.round(signal.value)}% above average).`;
    case 'CATEGORY_CONCENTRATION':
      return `${Math.round(signal.value)}% of spending concentrated in one category.`;
    case 'FORECAST_OVERSPEND':
      return `On track to overspend by ${Math.round(signal.value)}% versus last period.`;
    case 'PROFIT_DROP':
      return `Profit dropped ${Math.round(Math.abs(signal.value))}% versus last period.`;
    case 'EXPENSE_GROWTH':
      return `Expenses grew ${Math.round(signal.value)}% versus previous period.`;
    default:
      return null;
  }
};

// ─── Metric Derivation ────────────────────────────────────────────────────

/**
 * Extracts dashboard-relevant metrics from the signal array.
 * Used to validate consistency between signal values and dashboard computations.
 */
export const deriveMetrics = (signals: FinancialSignal[]): SignalDerivedMetrics => {
  const byKey = new Map(signals.map((s) => [s.key, s]));

  const profitTrend = byKey.get('PROFIT_TREND');
  const expenseGrowth = byKey.get('EXPENSE_GROWTH');
  const revenueGrowth = byKey.get('REVENUE_GROWTH');
  const topExpense = byKey.get('TOP_EXPENSE_CATEGORY');

  return {
    warnings: deriveWarnings(signals),
    profitTrend: profitTrend
      ? { direction: profitTrend.trend === 'unknown' ? 'flat' : profitTrend.trend, pct: profitTrend.value }
      : null,
    expenseGrowth: expenseGrowth
      ? { direction: expenseGrowth.trend === 'unknown' ? 'flat' : expenseGrowth.trend, pct: expenseGrowth.value }
      : null,
    revenueGrowth: revenueGrowth
      ? { direction: revenueGrowth.trend === 'unknown' ? 'flat' : revenueGrowth.trend, pct: revenueGrowth.value }
      : null,
    topExpenseCategory: topExpense?.metadata?.categoryId
      ? {
          categoryId: topExpense.metadata.categoryId as string,
          name: (topExpense.metadata.categoryName as string) ?? 'Unknown',
          share: topExpense.value,
        }
      : null,
  };
};

// ─── Consistency Validation ───────────────────────────────────────────────

export interface ConsistencyResult {
  consistent: boolean;
  issues: string[];
}

/**
 * Validates that dashboard-computed values are consistent with signal values.
 * Used in tests and seed validation.
 */
export const validateConsistency = (
  dashboardChanges: { expense: { direction: string; pct: number }; profit: { direction: string; pct: number } },
  signals: FinancialSignal[],
): ConsistencyResult => {
  const issues: string[] = [];
  const byKey = new Map(signals.map((s) => [s.key, s]));

  // Check expense growth direction consistency
  const expSignal = byKey.get('EXPENSE_GROWTH');
  if (expSignal && expSignal.trend !== 'unknown') {
    const signalDir = expSignal.trend;
    const dashDir = dashboardChanges.expense.direction;
    if (signalDir !== dashDir) {
      issues.push(
        `Expense direction mismatch: signal says "${signalDir}", dashboard says "${dashDir}"`,
      );
    }
  }

  // Check profit trend direction consistency
  const profitSignal = byKey.get('PROFIT_TREND');
  if (profitSignal && profitSignal.trend !== 'unknown') {
    const signalDir = profitSignal.trend;
    const dashDir = dashboardChanges.profit.direction;
    if (signalDir !== dashDir) {
      issues.push(
        `Profit direction mismatch: signal says "${signalDir}", dashboard says "${dashDir}"`,
      );
    }
  }

  return { consistent: issues.length === 0, issues };
};
