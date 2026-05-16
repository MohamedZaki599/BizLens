/**
 * Profit signal generator — produces profitability-related signals from snapshot data.
 */

import type { FinancialSnapshot } from '../../engine/data-collector';
import type { FinancialSignal, SignalGenerationContext } from '../signal.types';
import { createSignal } from '../signal.types';
import {
  calculateProfitMargin,
  calculateRevenueGrowth,
  calculateExpenseGrowth,
  calculateProfitTrend,
} from '../../calculators/profitability';
import type { ThresholdConfig } from '../../thresholds/threshold.types';
import { classifySeverity } from '../../thresholds/threshold.types';
import { buildLocalizedPayload } from '../../localization/payload-builder';

export const generateProfitSignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // ── Profit Margin ───────────────────────────────────────────────────
  const margin = calculateProfitMargin(snapshot.monthIncome, snapshot.monthExpense);
  const profitMarginSignal = createSignal('PROFIT_MARGIN', margin.marginPct, {
    generatedAt,
    trend:
      margin.profit > 0 ? 'up' : margin.profit < 0 ? 'down' : 'flat',
    severity: margin.profit < 0 ? 'warning' : 'none',
    confidence: snapshot.monthTransactionCount >= 5 ? 1.0 : 0.5,
    metadata: {
      marginPct: margin.marginPct,
      profit: margin.profit,
      income: snapshot.monthIncome,
      expense: snapshot.monthExpense,
      explainability: {
        formula: '(income - expense) / income * 100',
        inputs: { income: snapshot.monthIncome, expense: snapshot.monthExpense, profit: margin.profit },
        reasoningChain: [
          margin.profit < 0
            ? 'reasoning.profit_margin.loss'
            : 'reasoning.profit_margin.healthy',
        ],
        reasoningParams: [
          margin.profit < 0
            ? { expense: snapshot.monthExpense, income: snapshot.monthIncome }
            : { marginPct: margin.marginPct, income: snapshot.monthIncome, expense: snapshot.monthExpense },
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  profitMarginSignal.localized = buildLocalizedPayload(profitMarginSignal);
  signals.push(profitMarginSignal);

  // ── Revenue Growth ──────────────────────────────────────────────────
  const revenueGrowth = calculateRevenueGrowth(snapshot.monthIncome, snapshot.prevMonthIncome);
  const revenueGrowthSignal = createSignal('REVENUE_GROWTH', revenueGrowth.pct, {
    generatedAt,
    trend: revenueGrowth.direction,
    confidence: revenueGrowth.hasComparison ? 1.0 : 0.0,
    metadata: {
      current: snapshot.monthIncome,
      previous: snapshot.prevMonthIncome,
      delta: revenueGrowth.delta,
      changePct: revenueGrowth.pct,
      explainability: {
        formula: '(currentIncome - previousIncome) / |previousIncome| * 100',
        inputs: { current: snapshot.monthIncome, previous: snapshot.prevMonthIncome, changePct: revenueGrowth.pct },
        reasoningChain: [
          revenueGrowth.hasComparison
            ? revenueGrowth.direction === 'up' ? 'reasoning.revenue_growth.up' : 'reasoning.revenue_growth.down'
            : 'reasoning.revenue_growth.no_data',
        ],
        reasoningParams: [
          revenueGrowth.hasComparison
            ? { current: snapshot.monthIncome, previous: snapshot.prevMonthIncome, changePct: revenueGrowth.pct }
            : {},
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  revenueGrowthSignal.localized = buildLocalizedPayload(revenueGrowthSignal);
  signals.push(revenueGrowthSignal);

  // ── Expense Growth ──────────────────────────────────────────────────
  const expenseGrowth = calculateExpenseGrowth(snapshot.monthExpense, snapshot.prevMonthExpense);
  const expenseGrowthSignal = createSignal('EXPENSE_GROWTH', expenseGrowth.pct, {
    generatedAt,
    trend: expenseGrowth.direction,
    severity: expenseGrowth.hasComparison && expenseGrowth.pct >= 30 ? 'warning' : 'none',
    confidence: expenseGrowth.hasComparison ? 1.0 : 0.0,
    metadata: {
      current: snapshot.monthExpense,
      previous: snapshot.prevMonthExpense,
      delta: expenseGrowth.delta,
      changePct: expenseGrowth.pct,
      explainability: {
        formula: '(currentExpense - previousExpense) / |previousExpense| * 100',
        inputs: { current: snapshot.monthExpense, previous: snapshot.prevMonthExpense, changePct: expenseGrowth.pct },
        thresholdContext: expenseGrowth.pct >= 30 ? 'Exceeded 30% expense growth warning threshold' : undefined,
        reasoningChain: [
          expenseGrowth.hasComparison
            ? expenseGrowth.direction === 'up' ? 'reasoning.expense_growth.up' : 'reasoning.expense_growth.down'
            : 'reasoning.expense_growth.no_data',
        ],
        reasoningParams: [
          expenseGrowth.hasComparison
            ? { current: snapshot.monthExpense, previous: snapshot.prevMonthExpense, changePct: expenseGrowth.pct }
            : {},
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  expenseGrowthSignal.localized = buildLocalizedPayload(expenseGrowthSignal);
  signals.push(expenseGrowthSignal);

  // ── Profit Trend ────────────────────────────────────────────────────
  const profitTrend = calculateProfitTrend(
    snapshot.monthIncome,
    snapshot.monthExpense,
    snapshot.prevMonthIncome,
    snapshot.prevMonthExpense,
  );
  const dropWarning = thresholds.get('PROFIT_DROP_WARNING_PCT');
  const dropCritical = thresholds.get('PROFIT_DROP_CRITICAL_PCT');

  const profitTrendSignal = createSignal('PROFIT_TREND', profitTrend.change.pct, {
    generatedAt,
    trend: profitTrend.change.direction,
    severity: profitTrend.isDropping
      ? classifySeverity(Math.abs(profitTrend.change.pct), { warning: dropWarning, critical: dropCritical })
      : 'none',
    confidence: profitTrend.change.hasComparison ? 1.0 : 0.0,
    metadata: {
      currentProfit: profitTrend.currentProfit,
      previousProfit: profitTrend.previousProfit,
      changePct: profitTrend.change.pct,
      isDropping: profitTrend.isDropping,
      explainability: {
        formula: '(currentProfit - previousProfit) / |previousProfit| * 100',
        inputs: {
          currentProfit: profitTrend.currentProfit,
          previousProfit: profitTrend.previousProfit,
          changePct: profitTrend.change.pct,
        },
        thresholdContext: profitTrend.isDropping
          ? `Profit dropped ${Math.abs(profitTrend.change.pct)}% (warning: ${dropWarning}%, critical: ${dropCritical}%)`
          : undefined,
        reasoningChain: [
          profitTrend.change.hasComparison
            ? profitTrend.isDropping
              ? 'reasoning.profit_trend.dropping'
              : 'reasoning.profit_trend.rising'
            : 'reasoning.profit_trend.no_data',
        ],
        reasoningParams: [
          profitTrend.change.hasComparison
            ? { currentProfit: profitTrend.currentProfit, previousProfit: profitTrend.previousProfit, changePct: profitTrend.change.pct }
            : {},
        ],
      },
    },
    ttlCategory: 'dashboard',
  });
  profitTrendSignal.localized = buildLocalizedPayload(profitTrendSignal);
  signals.push(profitTrendSignal);

  return signals;
};
