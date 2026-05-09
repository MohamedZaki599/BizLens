/**
 * Anomaly & activity signal generator — anomalies, stale data, recurring expenses.
 */

import type { FinancialSnapshot } from '../../engine/data-collector';
import type { FinancialSignal, SignalGenerationContext } from '../signal.types';
import { createSignal } from '../signal.types';
import {
  detectAnomalies,
  detectStaleData,
  detectRecurringExpenses,
} from '../../calculators/anomaly';
import type { ThresholdConfig } from '../../thresholds/threshold.types';
import { classifySeverity } from '../../thresholds/threshold.types';

export const generateAnomalySignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // ── Spending Anomalies ─────────────────────────────────────────────
  const anomalyWarning = thresholds.get('ANOMALY_WARNING_PCT');
  const anomalyCritical = thresholds.get('ANOMALY_CRITICAL_PCT');

  const anomalies = detectAnomalies(
    snapshot.monthExpenseByCategory.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      total: c.total,
    })),
    snapshot.threeMonthExpenseAvgByCategory,
    anomalyWarning,
  );

  for (const anomaly of anomalies.slice(0, 3)) {
    signals.push(
      createSignal('SPENDING_ANOMALY', anomaly.changePct, {
        generatedAt,
        trend: 'up',
        severity: classifySeverity(anomaly.changePct, { warning: anomalyWarning, critical: anomalyCritical }),
        confidence: 1.0,
        metadata: {
          categoryId: anomaly.categoryId,
          categoryName: anomaly.categoryName,
          currentAmount: anomaly.currentAmount,
          baselineAvg: anomaly.baselineAvg,
        },
        ttlCategory: 'alert',
      }),
    );
  }

  // ── Stale Data ─────────────────────────────────────────────────────
  const staleDays = thresholds.get('STALE_DATA_DAYS');
  const staleWarningDays = thresholds.get('STALE_DATA_WARNING_DAYS');

  const staleResult = detectStaleData(
    snapshot.daysSinceLastTransaction,
    snapshot.totalTransactions,
    staleDays,
    staleWarningDays,
  );

  if (staleResult.isStale) {
    signals.push(
      createSignal('STALE_DATA', staleResult.daysSinceLastTransaction, {
        generatedAt,
        trend: 'down',
        severity: staleResult.severity === 'warning' ? 'warning' : 'info',
        confidence: 1.0,
        metadata: {
          totalTransactions: staleResult.totalTransactions,
          lastTransactionAt: snapshot.lastTransactionAt?.toISOString() ?? null,
        },
        ttlCategory: 'alert',
      }),
    );
  }

  // ── Recurring Expenses ─────────────────────────────────────────────
  const minMonths = thresholds.get('RECURRING_MIN_MONTHS');
  const minAmount = thresholds.get('RECURRING_MIN_AMOUNT');

  const recurring = detectRecurringExpenses(
    snapshot.recentExpenseTransactions,
    minMonths,
    minAmount,
  );

  for (const rec of recurring.slice(0, 5)) {
    signals.push(
      createSignal('RECURRING_EXPENSE', rec.averageAmount, {
        generatedAt,
        trend: 'flat',
        severity: 'info',
        confidence: rec.monthsDetected >= 4 ? 1.0 : 0.7,
        metadata: {
          categoryId: rec.categoryId,
          categoryName: rec.categoryName,
          monthsDetected: rec.monthsDetected,
        },
        ttlCategory: 'analytical',
      }),
    );
  }

  return signals;
};
