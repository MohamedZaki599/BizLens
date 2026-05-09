/**
 * Forecast signal generator — projected month-end, cash runway.
 */

import type { FinancialSnapshot } from '../../engine/data-collector';
import type { FinancialSignal, SignalGenerationContext } from '../signal.types';
import { createSignal } from '../signal.types';
import {
  projectMonthEnd,
  calculateCashRunway,
  compareForecastToPrevious,
} from '../../calculators/forecast';
import type { ThresholdConfig } from '../../thresholds/threshold.types';

export const generateForecastSignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // Only meaningful after the first week
  if (snapshot.monthDaysElapsed < 7) return signals;

  // ── Month-End Projection ───────────────────────────────────────────
  const projection = projectMonthEnd(
    snapshot.monthIncome,
    snapshot.monthExpense,
    snapshot.monthDaysElapsed,
    snapshot.monthTotalDays,
  );

  signals.push(
    createSignal('PROJECTED_EXPENSE', projection.projectedExpense, {
      generatedAt,
      confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
      metadata: {
        actualExpense: snapshot.monthExpense,
        dailyBurnRate: projection.dailyBurnRate,
        remainingDays: projection.remainingDays,
      },
      ttlCategory: 'analytical',
    }),
  );

  signals.push(
    createSignal('PROJECTED_INCOME', projection.projectedIncome, {
      generatedAt,
      confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
      metadata: {
        actualIncome: snapshot.monthIncome,
        dailyEarnRate: projection.dailyEarnRate,
        remainingDays: projection.remainingDays,
      },
      ttlCategory: 'analytical',
    }),
  );

  signals.push(
    createSignal('PROJECTED_PROFIT', projection.projectedProfit, {
      generatedAt,
      trend: projection.projectedProfit > 0 ? 'up' : projection.projectedProfit < 0 ? 'down' : 'flat',
      severity: projection.projectedProfit < 0 ? 'critical' : 'none',
      confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
      metadata: {
        projectedIncome: projection.projectedIncome,
        projectedExpense: projection.projectedExpense,
      },
      ttlCategory: 'analytical',
    }),
  );

  // ── Cash Runway ────────────────────────────────────────────────────
  const netBurnRate = projection.dailyBurnRate - projection.dailyEarnRate;
  const runway = calculateCashRunway(snapshot.monthProfit, netBurnRate);

  if (runway !== null) {
    signals.push(
      createSignal('CASH_RUNWAY_DAYS', runway, {
        generatedAt,
        trend: runway <= 7 ? 'down' : 'flat',
        severity: runway <= 3 ? 'critical' : runway <= 7 ? 'warning' : 'info',
        confidence: snapshot.monthDaysElapsed >= 7 ? 0.8 : 0.4,
        metadata: { dailyNetBurn: netBurnRate, currentBalance: snapshot.monthProfit },
        ttlCategory: 'analytical',
      }),
    );
  }

  // ── Forecast vs Previous Period ────────────────────────────────────
  const comparison = compareForecastToPrevious(
    projection.projectedExpense,
    projection.projectedProfit,
    snapshot.prevMonthExpense,
    snapshot.prevMonthProfit,
  );

  const overspendThreshold = thresholds.get('FORECAST_OVERSPEND_PCT');
  if (comparison.expenseChange.hasComparison && comparison.expenseChange.pct >= overspendThreshold) {
    // Enhance the PROJECTED_EXPENSE signal with overspend severity
    const idx = signals.findIndex((s) => s.key === 'PROJECTED_EXPENSE');
    if (idx >= 0) {
      signals[idx] = {
        ...signals[idx],
        severity: comparison.expenseChange.pct >= 40 ? 'warning' : 'info',
        metadata: {
          ...signals[idx].metadata,
          vsLastMonth: comparison.expenseChange.pct,
          previousExpense: snapshot.prevMonthExpense,
          isOverspending: true,
        },
      };
    }
  }

  return signals;
};
