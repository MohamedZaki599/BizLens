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
      metadata: {
        totalExpense: snapshot.monthExpense,
        daysElapsed: snapshot.monthDaysElapsed,
        explainability: {
          formula: 'totalExpense / daysElapsed',
          inputs: {
            totalExpense: snapshot.monthExpense,
            daysElapsed: snapshot.monthDaysElapsed,
            burnRate,
          },
          reasoningChain: [
            `Daily burn rate: ${snapshot.monthExpense} spent over ${snapshot.monthDaysElapsed} days = ${Math.round(burnRate)}/day`,
            snapshot.monthDaysElapsed < 7
              ? 'Low confidence: fewer than 7 days of data this month'
              : 'Full confidence: 7+ days of spending data available',
          ],
        },
      },
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
      metadata: {
        expense: snapshot.monthExpense,
        income: snapshot.monthIncome,
        explainability: {
          formula: 'monthExpense / monthIncome',
          inputs: {
            monthExpense: snapshot.monthExpense,
            monthIncome: snapshot.monthIncome,
            expenseRatio,
          },
          thresholdContext: expenseRatio >= ratioWarning
            ? `Expense ratio ${expenseRatio.toFixed(2)} exceeds ${ratioWarning} warning threshold`
            : undefined,
          reasoningChain: [
            `Expense-to-income ratio: ${snapshot.monthExpense} / ${snapshot.monthIncome} = ${expenseRatio.toFixed(2)}`,
            expenseRatio > 1
              ? 'Spending exceeds income this month'
              : `Spending is ${Math.round((1 - expenseRatio) * 100)}% below income`,
          ],
        },
      },
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
          explainability: {
            formula: 'topAmount / totalExpense * 100',
            inputs: {
              topAmount: concentration.topAmount,
              totalExpense: concentration.totalAmount,
              sharePct: concentration.sharePct,
            },
            thresholdContext: concentration.sharePct >= concWarning
              ? `Top category exceeds ${concWarning}% concentration threshold (actual: ${Math.round(concentration.sharePct)}%)`
              : undefined,
            reasoningChain: [
              `${concentration.topCategoryName} accounts for ${Math.round(concentration.sharePct)}% of total expenses`,
              `Amount: ${concentration.topAmount} out of ${concentration.totalAmount} total`,
            ],
            sourceEntities: [concentration.topCategoryId],
          },
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
          explainability: {
            formula: 'topAmount / totalExpense * 100',
            inputs: {
              topAmount: concentration.topAmount,
              totalExpense: concentration.totalAmount,
              sharePct: concentration.sharePct,
            },
            thresholdContext: concentration.sharePct >= concWarning
              ? `Concentration exceeds ${concWarning}% threshold (actual: ${Math.round(concentration.sharePct)}%)`
              : undefined,
            reasoningChain: [
              `Spending is concentrated: ${concentration.topCategoryName} at ${Math.round(concentration.sharePct)}%`,
              `This indicates high dependency on a single expense category`,
            ],
            sourceEntities: [concentration.topCategoryId],
          },
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
          explainability: {
            formula: 'topAmount / totalIncome * 100',
            inputs: {
              topAmount: incomeConcentration.topAmount,
              totalIncome: incomeConcentration.totalAmount,
              sharePct: incomeConcentration.sharePct,
            },
            reasoningChain: [
              `${incomeConcentration.topCategoryName} accounts for ${Math.round(incomeConcentration.sharePct)}% of total income`,
              `Amount: ${incomeConcentration.topAmount} out of ${incomeConcentration.totalAmount} total`,
            ],
            sourceEntities: [incomeConcentration.topCategoryId],
          },
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
            explainability: {
              formula: '(currentAmount - baselineAvg) / baselineAvg * 100',
              inputs: {
                currentAmount: spike.currentAmount,
                baselineAvg: spike.baselineAvg,
                changePct: spike.changePct,
              },
              thresholdContext: `Exceeded ${spikeWarning}% spike threshold (actual: ${Math.round(spike.changePct)}%)`,
              reasoningChain: [
                `${spike.categoryName} spend spiked ${Math.round(spike.changePct)}% above 3-month average`,
                `Current: ${spike.currentAmount}, Baseline avg: ${spike.baselineAvg}`,
              ],
              sourceEntities: [spike.categoryId],
            },
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
        explainability: {
          formula: '(thisWeek - lastWeek) / |lastWeek| * 100',
          inputs: {
            thisWeek: snapshot.weekExpense,
            lastWeek: snapshot.prevWeekExpense,
            changePct: weeklyChange.pct,
          },
          thresholdContext: weeklyChange.pct >= weeklyThreshold
            ? `Exceeded ${weeklyThreshold}% weekly increase threshold`
            : undefined,
          reasoningChain: [
            weeklyChange.hasComparison
              ? `Weekly spending ${weeklyChange.direction} ${Math.abs(weeklyChange.pct)}% (${snapshot.weekExpense} vs ${snapshot.prevWeekExpense} last week)`
              : 'No prior week data for comparison',
          ],
        },
      },
      ttlCategory: 'alert',
    }),
  );

  return signals;
};
