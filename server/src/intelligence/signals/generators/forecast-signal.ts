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
import { buildLocalizedPayload } from '../../localization/payload-builder';

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

  const projectedExpenseSignal = createSignal('PROJECTED_EXPENSE', projection.projectedExpense, {
    generatedAt,
    confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
    metadata: {
      projectedAmount: projection.projectedExpense,
      actualExpense: snapshot.monthExpense,
      dailyRate: projection.dailyBurnRate,
      remainingDays: projection.remainingDays,
      explainability: {
        formula: 'actualExpense + (dailyBurnRate * remainingDays)',
        inputs: {
          actualExpense: snapshot.monthExpense,
          dailyBurnRate: projection.dailyBurnRate,
          remainingDays: projection.remainingDays,
          daysElapsed: snapshot.monthDaysElapsed,
          totalDays: snapshot.monthTotalDays,
        },
        reasoningChain: [
          'reasoning.projected_expense.rate',
          'reasoning.projected_expense.projection',
        ],
        reasoningParams: [
          { dailyBurnRate: projection.dailyBurnRate, daysElapsed: snapshot.monthDaysElapsed },
          { projectedExpense: projection.projectedExpense, remainingDays: projection.remainingDays },
        ],
      },
    },
    ttlCategory: 'analytical',
  });
  projectedExpenseSignal.localized = buildLocalizedPayload(projectedExpenseSignal);
  signals.push(projectedExpenseSignal);

  const projectedIncomeSignal = createSignal('PROJECTED_INCOME', projection.projectedIncome, {
    generatedAt,
    confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
    metadata: {
      projectedAmount: projection.projectedIncome,
      actualIncome: snapshot.monthIncome,
      dailyRate: projection.dailyEarnRate,
      remainingDays: projection.remainingDays,
      explainability: {
        formula: 'actualIncome + (dailyEarnRate * remainingDays)',
        inputs: {
          actualIncome: snapshot.monthIncome,
          dailyEarnRate: projection.dailyEarnRate,
          remainingDays: projection.remainingDays,
          daysElapsed: snapshot.monthDaysElapsed,
          totalDays: snapshot.monthTotalDays,
        },
        reasoningChain: [
          'reasoning.projected_income.rate',
          'reasoning.projected_income.projection',
        ],
        reasoningParams: [
          { dailyEarnRate: projection.dailyEarnRate, daysElapsed: snapshot.monthDaysElapsed },
          { projectedIncome: projection.projectedIncome, remainingDays: projection.remainingDays },
        ],
      },
    },
    ttlCategory: 'analytical',
  });
  projectedIncomeSignal.localized = buildLocalizedPayload(projectedIncomeSignal);
  signals.push(projectedIncomeSignal);

  const projectedProfitSignal = createSignal('PROJECTED_PROFIT', projection.projectedProfit, {
    generatedAt,
    trend: projection.projectedProfit > 0 ? 'up' : projection.projectedProfit < 0 ? 'down' : 'flat',
    severity: projection.projectedProfit < 0 ? 'critical' : 'none',
    confidence: snapshot.monthDaysElapsed >= 14 ? 0.9 : 0.6,
    metadata: {
      projectedAmount: projection.projectedProfit,
      projectedIncome: projection.projectedIncome,
      projectedExpense: projection.projectedExpense,
      explainability: {
        formula: 'projectedIncome - projectedExpense',
        inputs: {
          projectedIncome: projection.projectedIncome,
          projectedExpense: projection.projectedExpense,
          projectedProfit: projection.projectedProfit,
        },
        reasoningChain: [
          'reasoning.projected_profit.positive',
          projection.projectedProfit < 0
            ? 'reasoning.projected_profit.negative'
            : 'reasoning.projected_profit.positive',
        ],
        reasoningParams: [
          { projectedIncome: projection.projectedIncome, projectedExpense: projection.projectedExpense },
          projection.projectedProfit < 0
            ? { projectedProfit: projection.projectedProfit, projectedExpense: projection.projectedExpense }
            : { projectedProfit: projection.projectedProfit, projectedIncome: projection.projectedIncome },
        ],
      },
    },
    ttlCategory: 'analytical',
  });
  projectedProfitSignal.localized = buildLocalizedPayload(projectedProfitSignal);
  signals.push(projectedProfitSignal);

  // ── Cash Runway ────────────────────────────────────────────────────
  const netBurnRate = projection.dailyBurnRate - projection.dailyEarnRate;
  const runway = calculateCashRunway(snapshot.monthProfit, netBurnRate);

  if (runway !== null) {
    const cashRunwaySignal = createSignal('CASH_RUNWAY_DAYS', runway, {
      generatedAt,
      trend: runway <= 7 ? 'down' : 'flat',
      severity: runway <= 3 ? 'critical' : runway <= 7 ? 'warning' : 'info',
      confidence: snapshot.monthDaysElapsed >= 7 ? 0.8 : 0.4,
      metadata: {
        remainingDays: runway,
        dailyRate: netBurnRate,
        currentBalance: snapshot.monthProfit,
        explainability: {
          formula: 'currentBalance / dailyNetBurn',
          inputs: {
            currentBalance: snapshot.monthProfit,
            dailyNetBurn: netBurnRate,
            dailyBurnRate: projection.dailyBurnRate,
            dailyEarnRate: projection.dailyEarnRate,
            runwayDays: runway,
          },
          thresholdContext: runway <= 3
            ? `Critical: only ${runway} days of runway remaining`
            : runway <= 7
              ? `Warning: only ${runway} days of runway remaining`
              : undefined,
          reasoningChain: [
            'reasoning.cash_runway_days.burn',
            'reasoning.cash_runway_days.runway',
          ],
          reasoningParams: [
            { dailyBurnRate: projection.dailyBurnRate, dailyEarnRate: projection.dailyEarnRate, dailyNetBurn: netBurnRate },
            { runwayDays: runway, currentBalance: snapshot.monthProfit },
          ],
        },
      },
      ttlCategory: 'analytical',
    });
    cashRunwaySignal.localized = buildLocalizedPayload(cashRunwaySignal);
    signals.push(cashRunwaySignal);
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
