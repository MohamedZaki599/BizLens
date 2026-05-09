/**
 * Profitability calculators — pure deterministic functions.
 *
 * NO database access. NO side effects. NO date logic.
 * Takes numbers in, returns numbers out.
 */

import { round, percentChange, shareOf, type ChangeResult } from '../../utils/safe-math';

// ─── Profit Margin ────────────────────────────────────────────────────────

export interface ProfitMarginResult {
  profit: number;
  marginPct: number;
}

/**
 * Calculate profit and margin percentage.
 * Margin = profit / income × 100. Returns 0% when income is 0.
 */
export const calculateProfitMargin = (
  income: number,
  expense: number,
): ProfitMarginResult => {
  const profit = round(income - expense);
  const marginPct = shareOf(profit, income);
  return { profit, marginPct };
};

// ─── Revenue Growth ───────────────────────────────────────────────────────

/**
 * Period-over-period revenue (income) growth.
 */
export const calculateRevenueGrowth = (
  currentIncome: number,
  previousIncome: number,
): ChangeResult => percentChange(currentIncome, previousIncome);

// ─── Expense Growth ───────────────────────────────────────────────────────

/**
 * Period-over-period expense growth.
 */
export const calculateExpenseGrowth = (
  currentExpense: number,
  previousExpense: number,
): ChangeResult => percentChange(currentExpense, previousExpense);

// ─── Profit Trend ─────────────────────────────────────────────────────────

export interface ProfitTrendResult {
  currentProfit: number;
  previousProfit: number;
  change: ChangeResult;
  isDropping: boolean;
}

/**
 * Compares current vs previous period profit.
 */
export const calculateProfitTrend = (
  currentIncome: number,
  currentExpense: number,
  previousIncome: number,
  previousExpense: number,
): ProfitTrendResult => {
  const currentProfit = round(currentIncome - currentExpense);
  const previousProfit = round(previousIncome - previousExpense);
  const change = percentChange(currentProfit, previousProfit);

  return {
    currentProfit,
    previousProfit,
    change,
    isDropping: change.hasComparison && currentProfit < previousProfit,
  };
};
