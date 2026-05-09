/**
 * Spending signal generator — burn rate, expense ratio, concentration, spikes.
 */

import type { FinancialSnapshot } from '../../engine/data-collector';
import type { FinancialSignal, SignalGenerationContext } from '../signal.types';
import { createSignal } from '../signal.types';
import {
  calculateBurnRate,
  calculateExpenseRatio,
  calculateConcentration,
  detectSpendSpikes,
  calculateWeeklySpendChange,
} from '../../calculators/spending';
import type { ThresholdConfig } from '../../thresholds/threshold.types';
import { classifySeverity } from '../../thresholds/threshold.types';

export const generateSpendingSignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // ── Burn Rate ───────────────────────────────────────────────────────
  const burnRate = calculateBurnRate(snapshot.monthExpense, snapshot.monthDaysElapsed);
  signals.push(
    createSignal('BURN_RATE', burnRate, {
      generatedAt,
      severity: 'none',
      confidence: snapshot.monthDaysElapsed >= 7 ? 1.0 : 0.5,
      metadata: { totalExpense: snapshot.monthExpense, daysElapsed: snapshot.monthDaysElapsed },
      ttlCategory: 'dashboard',
    }),
  );

  // ── Expense Ratio ──────────────────────────────────────────────────
  const expenseRatio = calculateExpenseRatio(snapshot.monthExpense, snapshot.monthIncome);
  const ratioWarning = thresholds.get('EXPENSE_RATIO_WARNING');
  const ratioCritical = thresholds.get('EXPENSE_RATIO_CRITICAL');

  signals.push(
    createSignal('EXPENSE_RATIO', expenseRatio, {
      generatedAt,
      trend: expenseRatio > 1 ? 'up' : 'flat',
      severity: classifySeverity(expenseRatio, { warning: ratioWarning, critical: ratioCritical }),
      confidence: snapshot.monthIncome > 0 ? 1.0 : 0.3,
      metadata: { expense: snapshot.monthExpense, income: snapshot.monthIncome },
      ttlCategory: 'dashboard',
    }),
  );

  // ── Top Expense Category ───────────────────────────────────────────
  const concentration = calculateConcentration(
    snapshot.monthExpenseByCategory.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      total: c.total,
    })),
  );

  if (concentration) {
    const concWarning = thresholds.get('CONCENTRATION_WARNING_PCT');
    const concCritical = thresholds.get('CONCENTRATION_CRITICAL_PCT');

    signals.push(
      createSignal('TOP_EXPENSE_CATEGORY', concentration.topAmount, {
        generatedAt,
        severity: classifySeverity(concentration.sharePct, { warning: concWarning, critical: concCritical }),
        confidence: 1.0,
        metadata: {
          categoryId: concentration.topCategoryId,
          categoryName: concentration.topCategoryName,
          sharePct: concentration.sharePct,
          totalExpense: concentration.totalAmount,
        },
        ttlCategory: 'dashboard',
      }),
    );

    signals.push(
      createSignal('CATEGORY_CONCENTRATION', concentration.sharePct, {
        generatedAt,
        severity: classifySeverity(concentration.sharePct, { warning: concWarning, critical: concCritical }),
        confidence: 1.0,
        metadata: {
          categoryId: concentration.topCategoryId,
          categoryName: concentration.topCategoryName,
        },
        ttlCategory: 'alert',
      }),
    );
  }

  // ── Top Income Category ────────────────────────────────────────────
  const incomeConcentration = calculateConcentration(
    snapshot.monthIncomeByCategory.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      total: c.total,
    })),
  );

  if (incomeConcentration) {
    signals.push(
      createSignal('TOP_INCOME_CATEGORY', incomeConcentration.topAmount, {
        generatedAt,
        severity: 'none',
        confidence: 1.0,
        metadata: {
          categoryId: incomeConcentration.topCategoryId,
          categoryName: incomeConcentration.topCategoryName,
          sharePct: incomeConcentration.sharePct,
          totalIncome: incomeConcentration.totalAmount,
        },
        ttlCategory: 'dashboard',
      }),
    );
  }

  // ── Spend Spikes (weekly vs 4-week avg) ────────────────────────────
  const spikes = detectSpendSpikes(
    snapshot.monthExpenseByCategory.map((c) => ({
      categoryId: c.categoryId,
      name: c.name,
      total: c.total,
    })),
    snapshot.threeMonthExpenseAvgByCategory,
  );

  const spikeWarning = thresholds.get('SPEND_SPIKE_WARNING_PCT');
  const spikeCritical = thresholds.get('SPEND_SPIKE_CRITICAL_PCT');

  for (const spike of spikes.slice(0, 3)) {
    if (spike.changePct >= spikeWarning) {
      signals.push(
        createSignal('SPEND_SPIKE', spike.changePct, {
          generatedAt,
          trend: 'up',
          severity: classifySeverity(spike.changePct, { warning: spikeWarning, critical: spikeCritical }),
          confidence: 1.0,
          metadata: {
            categoryId: spike.categoryId,
            categoryName: spike.categoryName,
            currentAmount: spike.currentAmount,
            baselineAvg: spike.baselineAvg,
          },
          ttlCategory: 'alert',
        }),
      );
    }
  }

  // ── Weekly Spend Change ────────────────────────────────────────────
  const weeklyChange = calculateWeeklySpendChange(snapshot.weekExpense, snapshot.prevWeekExpense);
  const weeklyThreshold = thresholds.get('WEEKLY_SPEND_INCREASE_PCT');

  signals.push(
    createSignal('WEEKLY_SPEND_CHANGE', weeklyChange.pct, {
      generatedAt,
      trend: weeklyChange.direction,
      severity:
        weeklyChange.hasComparison && weeklyChange.pct >= weeklyThreshold ? 'warning' : 'none',
      confidence: weeklyChange.hasComparison ? 1.0 : 0.0,
      metadata: {
        thisWeek: snapshot.weekExpense,
        lastWeek: snapshot.prevWeekExpense,
        delta: weeklyChange.delta,
      },
      ttlCategory: 'alert',
    }),
  );

  return signals;
};
