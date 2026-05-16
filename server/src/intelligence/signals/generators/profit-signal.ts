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

export const generateProfitSignals = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];
  const { generatedAt } = ctx;

  // ── Profit Margin ───────────────────────────────────────────────────
  const margin = calculateProfitMargin(snapshot.monthIncome, snapshot.monthExpense);
  signals.push(
    createSignal('PROFIT_MARGIN', margin.marginPct, {
      generatedAt,
      trend:
        margin.profit > 0 ? 'up' : margin.profit < 0 ? 'down' : 'flat',
      severity: margin.profit < 0 ? 'warning' : 'none',
      confidence: snapshot.monthTransactionCount >= 5 ? 1.0 : 0.5,
      metadata: {
        profit: margin.profit,
        income: snapshot.monthIncome,
        expense: snapshot.monthExpense,
        explainability: {
          formula: '(income - expense) / income * 100',
          inputs: { income: snapshot.monthIncome, expense: snapshot.monthExpense, profit: margin.profit },
          reasoningChain: [
            margin.profit < 0
              ? `Expenses (${snapshot.monthExpense}) exceed income (${snapshot.monthIncome}) — operating at a loss`
              : `Profit margin at ${margin.marginPct}% (${margin.profit} profit on ${snapshot.monthIncome} income)`,
          ],
        },
      },
      ttlCategory: 'dashboard',
    }),
  );

  // ── Revenue Growth ──────────────────────────────────────────────────
  const revenueGrowth = calculateRevenueGrowth(snapshot.monthIncome, snapshot.prevMonthIncome);
  signals.push(
    createSignal('REVENUE_GROWTH', revenueGrowth.pct, {
      generatedAt,
      trend: revenueGrowth.direction,
      confidence: revenueGrowth.hasComparison ? 1.0 : 0.0,
      metadata: {
        current: snapshot.monthIncome,
        previous: snapshot.prevMonthIncome,
        delta: revenueGrowth.delta,
        explainability: {
          formula: '(currentIncome - previousIncome) / |previousIncome| * 100',
          inputs: { current: snapshot.monthIncome, previous: snapshot.prevMonthIncome, changePct: revenueGrowth.pct },
          reasoningChain: [
            revenueGrowth.hasComparison
              ? `Revenue ${revenueGrowth.direction} ${Math.abs(revenueGrowth.pct)}% vs last month (${snapshot.monthIncome} vs ${snapshot.prevMonthIncome})`
              : 'No prior month data for revenue comparison',
          ],
        },
      },
      ttlCategory: 'dashboard',
    }),
  );

  // ── Expense Growth ──────────────────────────────────────────────────
  const expenseGrowth = calculateExpenseGrowth(snapshot.monthExpense, snapshot.prevMonthExpense);
  signals.push(
    createSignal('EXPENSE_GROWTH', expenseGrowth.pct, {
      generatedAt,
      trend: expenseGrowth.direction,
      severity: expenseGrowth.hasComparison && expenseGrowth.pct >= 30 ? 'warning' : 'none',
      confidence: expenseGrowth.hasComparison ? 1.0 : 0.0,
      metadata: {
        current: snapshot.monthExpense,
        previous: snapshot.prevMonthExpense,
        delta: expenseGrowth.delta,
        explainability: {
          formula: '(currentExpense - previousExpense) / |previousExpense| * 100',
          inputs: { current: snapshot.monthExpense, previous: snapshot.prevMonthExpense, changePct: expenseGrowth.pct },
          thresholdContext: expenseGrowth.pct >= 30 ? 'Exceeded 30% expense growth warning threshold' : undefined,
          reasoningChain: [
            expenseGrowth.hasComparison
              ? `Expenses ${expenseGrowth.direction} ${Math.abs(expenseGrowth.pct)}% vs last month (${snapshot.monthExpense} vs ${snapshot.prevMonthExpense})`
              : 'No prior month data for expense comparison',
          ],
        },
      },
      ttlCategory: 'dashboard',
    }),
  );

  // ── Profit Trend ────────────────────────────────────────────────────
  const profitTrend = calculateProfitTrend(
    snapshot.monthIncome,
    snapshot.monthExpense,
    snapshot.prevMonthIncome,
    snapshot.prevMonthExpense,
  );
  const dropWarning = thresholds.get('PROFIT_DROP_WARNING_PCT');
  const dropCritical = thresholds.get('PROFIT_DROP_CRITICAL_PCT');

  signals.push(
    createSignal('PROFIT_TREND', profitTrend.change.pct, {
      generatedAt,
      trend: profitTrend.change.direction,
      severity: profitTrend.isDropping
        ? classifySeverity(Math.abs(profitTrend.change.pct), { warning: dropWarning, critical: dropCritical })
        : 'none',
      confidence: profitTrend.change.hasComparison ? 1.0 : 0.0,
      metadata: {
        currentProfit: profitTrend.currentProfit,
        previousProfit: profitTrend.previousProfit,
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
                ? `Profit dropped ${Math.abs(profitTrend.change.pct)}% vs last month (${profitTrend.currentProfit} vs ${profitTrend.previousProfit})`
                : `Profit ${profitTrend.change.direction} ${Math.abs(profitTrend.change.pct)}% vs last month`
              : 'No prior month data for profit trend comparison',
          ],
        },
      },
      ttlCategory: 'dashboard',
    }),
  );

  return signals;
};
