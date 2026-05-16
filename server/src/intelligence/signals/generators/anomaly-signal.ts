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
import { buildLocalizedPayload } from '../../localization/payload-builder';

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
    const anomalySignal = createSignal('SPENDING_ANOMALY', anomaly.changePct, {
      generatedAt,
      trend: 'up',
      severity: classifySeverity(anomaly.changePct, { warning: anomalyWarning, critical: anomalyCritical }),
      confidence: 1.0,
      metadata: {
        categoryId: anomaly.categoryId,
        categoryName: anomaly.categoryName,
        changePct: anomaly.changePct,
        currentAmount: anomaly.currentAmount,
        baselineAvg: anomaly.baselineAvg,
        explainability: {
          formula: '(currentAmount - baselineAvg) / baselineAvg * 100',
          inputs: {
            currentAmount: anomaly.currentAmount,
            baselineAvg: anomaly.baselineAvg,
            changePct: anomaly.changePct,
          },
          thresholdContext: `Exceeded ${anomalyWarning}% anomaly threshold (actual: ${Math.round(anomaly.changePct)}%)`,
          reasoningChain: [
            'reasoning.spending_anomaly.above_average',
            'reasoning.spending_anomaly.current_vs_baseline',
          ],
          reasoningParams: [
            { changePct: anomaly.changePct, threshold: anomalyWarning },
            { currentAmount: anomaly.currentAmount, baselineAvg: anomaly.baselineAvg },
          ],
          sourceEntities: [anomaly.categoryId],
        },
      },
      ttlCategory: 'alert',
    });
    anomalySignal.localized = buildLocalizedPayload(anomalySignal);
    signals.push(anomalySignal);
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
    const staleSignal = createSignal('STALE_DATA', staleResult.daysSinceLastTransaction, {
      generatedAt,
      trend: 'down',
      severity: staleResult.severity === 'warning' ? 'warning' : 'info',
      confidence: 1.0,
      metadata: {
        daysSince: staleResult.daysSinceLastTransaction,
        totalTransactions: staleResult.totalTransactions,
        lastTransactionAt: snapshot.lastTransactionAt?.toISOString() ?? null,
        explainability: {
          formula: 'today - lastTransactionDate (in days)',
          inputs: {
            daysSinceLastTransaction: staleResult.daysSinceLastTransaction,
            totalTransactions: staleResult.totalTransactions,
            staleDaysThreshold: staleDays,
          },
          thresholdContext: `No transactions for ${staleResult.daysSinceLastTransaction} days (threshold: ${staleDays} days)`,
          reasoningChain: [
            'reasoning.stale_data.days_since',
            'reasoning.stale_data.threshold',
            staleResult.severity === 'warning'
              ? 'reasoning.stale_data.approaching'
              : 'reasoning.stale_data.stale',
          ],
          reasoningParams: [
            { daysSince: staleResult.daysSinceLastTransaction },
            { threshold: staleDays },
            staleResult.severity === 'warning'
              ? { daysSince: staleResult.daysSinceLastTransaction, warningThreshold: staleWarningDays }
              : { daysSince: staleResult.daysSinceLastTransaction, threshold: staleDays },
          ],
        },
      },
      ttlCategory: 'alert',
    });
    staleSignal.localized = buildLocalizedPayload(staleSignal);
    signals.push(staleSignal);
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
    const recurringSignal = createSignal('RECURRING_EXPENSE', rec.averageAmount, {
      generatedAt,
      trend: 'flat',
      severity: 'info',
      confidence: rec.monthsDetected >= 4 ? 1.0 : 0.7,
      metadata: {
        categoryId: rec.categoryId,
        categoryName: rec.categoryName,
        monthsDetected: rec.monthsDetected,
        averageAmount: rec.averageAmount,
        explainability: {
          formula: 'averageAmount over monthsDetected months',
          inputs: {
            averageAmount: rec.averageAmount,
            monthsDetected: rec.monthsDetected,
            categoryId: rec.categoryId,
          },
          reasoningChain: [
            'reasoning.recurring_expense.pattern',
            'reasoning.recurring_expense.confidence',
          ],
          reasoningParams: [
            { categoryName: rec.categoryName, monthsDetected: rec.monthsDetected, averageAmount: rec.averageAmount },
            { monthsDetected: rec.monthsDetected, confidence: rec.monthsDetected >= 4 ? 1.0 : 0.7 },
          ],
          sourceEntities: [rec.categoryId],
        },
      },
      ttlCategory: 'analytical',
    });
    recurringSignal.localized = buildLocalizedPayload(recurringSignal);
    signals.push(recurringSignal);
  }

  return signals;
};
