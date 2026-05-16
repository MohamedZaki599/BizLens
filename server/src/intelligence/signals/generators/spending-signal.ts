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
import { buildLocalizedPayload } from '../../localization/payload-builder';

export const generateSpendingSignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // ── Burn Rate ───────────────────────────────────────────────────────
  const burnRate = calculateBurnRate(snapshot.monthExpense, snapshot.monthDaysElapsed);
  const burnRateSignal = createSignal('BURN_RATE', burnRate, {
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
          'reasoning.burn_rate.daily',
          snapshot.monthDaysElapsed < 7
            ? 'reasoning.burn_rate.low_confidence'
            : 'reasoning.burn_rate.daily',
        ],
        reasoningParams: [
          { totalExpense: snapshot.monthExpense, daysElapsed: snapshot.monthDaysElapsed, burnRate },
          snapshot.monthDaysElapsed < 7
            ? { daysElapsed: snapshot.monthDaysElapsed }
            : { totalExpense: snapshot.monthExpense, daysElapsed: snapshot.monthDaysElapsed, burnRate },
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  burnRateSignal.localized = buildLocalizedPayload(burnRateSignal);
  signals.push(burnRateSignal);

  // ── Expense Ratio ──────────────────────────────────────────────────
  const expenseRatio = calculateExpenseRatio(snapshot.monthExpense, snapshot.monthIncome);
  const ratioWarning = thresholds.get('EXPENSE_RATIO_WARNING');
  const ratioCritical = thresholds.get('EXPENSE_RATIO_CRITICAL');

  const expenseRatioSignal = createSignal('EXPENSE_RATIO', expenseRatio, {
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
          'reasoning.expense_ratio.exceeds',
          expenseRatio > 1
            ? 'reasoning.expense_ratio.exceeds'
            : 'reasoning.expense_ratio.below',
        ],
        reasoningParams: [
          { monthExpense: snapshot.monthExpense, monthIncome: snapshot.monthIncome, expenseRatio },
          expenseRatio > 1
            ? { monthExpense: snapshot.monthExpense, monthIncome: snapshot.monthIncome, expenseRatio }
            : { monthExpense: snapshot.monthExpense, monthIncome: snapshot.monthIncome, expenseRatio },
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  expenseRatioSignal.localized = buildLocalizedPayload(expenseRatioSignal);
  signals.push(expenseRatioSignal);

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

    const topExpenseSignal = createSignal('TOP_EXPENSE_CATEGORY', concentration.topAmount, {
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
            'reasoning.top_expense_category.share',
            'reasoning.top_expense_category.share',
          ],
          reasoningParams: [
            { categoryName: concentration.topCategoryName, topAmount: concentration.topAmount, totalExpense: concentration.totalAmount, sharePct: concentration.sharePct },
            { categoryName: concentration.topCategoryName, topAmount: concentration.topAmount, totalExpense: concentration.totalAmount, sharePct: concentration.sharePct },
          ],
          sourceEntities: [concentration.topCategoryId],
        },
      },
      ttlCategory: 'dashboard',
    });
    topExpenseSignal.localized = buildLocalizedPayload(topExpenseSignal);
    signals.push(topExpenseSignal);

    const concentrationSignal = createSignal('CATEGORY_CONCENTRATION', concentration.sharePct, {
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
            'reasoning.category_concentration.high',
            'reasoning.category_concentration.high',
          ],
          reasoningParams: [
            { categoryName: concentration.topCategoryName, sharePct: concentration.sharePct, topAmount: concentration.topAmount, totalExpense: concentration.totalAmount },
            { categoryName: concentration.topCategoryName, sharePct: concentration.sharePct, topAmount: concentration.topAmount, totalExpense: concentration.totalAmount },
          ],
          sourceEntities: [concentration.topCategoryId],
        },
      },
      ttlCategory: 'alert',
    });
    concentrationSignal.localized = buildLocalizedPayload(concentrationSignal);
    signals.push(concentrationSignal);
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
    const topIncomeSignal = createSignal('TOP_INCOME_CATEGORY', incomeConcentration.topAmount, {
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
            'reasoning.top_income_category.share',
            'reasoning.top_income_category.share',
          ],
          reasoningParams: [
            { categoryName: incomeConcentration.topCategoryName, topAmount: incomeConcentration.topAmount, totalIncome: incomeConcentration.totalAmount, sharePct: incomeConcentration.sharePct },
            { categoryName: incomeConcentration.topCategoryName, topAmount: incomeConcentration.topAmount, totalIncome: incomeConcentration.totalAmount, sharePct: incomeConcentration.sharePct },
          ],
          sourceEntities: [incomeConcentration.topCategoryId],
        },
      },
      ttlCategory: 'dashboard',
    });
    topIncomeSignal.localized = buildLocalizedPayload(topIncomeSignal);
    signals.push(topIncomeSignal);
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
      const spikeSignal = createSignal('SPEND_SPIKE', spike.changePct, {
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
              'reasoning.spend_spike.above_average',
              'reasoning.spend_spike.above_average',
            ],
            reasoningParams: [
              { categoryName: spike.categoryName, currentAmount: spike.currentAmount, baselineAvg: spike.baselineAvg, changePct: spike.changePct },
              { categoryName: spike.categoryName, currentAmount: spike.currentAmount, baselineAvg: spike.baselineAvg, changePct: spike.changePct },
            ],
            sourceEntities: [spike.categoryId],
          },
        },
        ttlCategory: 'alert',
      });
      spikeSignal.localized = buildLocalizedPayload(spikeSignal);
      signals.push(spikeSignal);
    }
  }

  // ── Weekly Spend Change ────────────────────────────────────────────
  const weeklyChange = calculateWeeklySpendChange(snapshot.weekExpense, snapshot.prevWeekExpense);
  const weeklyThreshold = thresholds.get('WEEKLY_SPEND_INCREASE_PCT');

  const weeklyChangeSignal = createSignal('WEEKLY_SPEND_CHANGE', weeklyChange.pct, {
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
            ? weeklyChange.direction === 'up' ? 'reasoning.weekly_spend_change.up' : 'reasoning.weekly_spend_change.down'
            : 'reasoning.weekly_spend_change.no_data',
        ],
        reasoningParams: [
          weeklyChange.hasComparison
            ? { thisWeek: snapshot.weekExpense, lastWeek: snapshot.prevWeekExpense, changePct: weeklyChange.pct }
            : {},
        ],
      },
    },
    ttlCategory: 'alert',
  });
  weeklyChangeSignal.localized = buildLocalizedPayload(weeklyChangeSignal);
  signals.push(weeklyChangeSignal);

  return signals;
};
