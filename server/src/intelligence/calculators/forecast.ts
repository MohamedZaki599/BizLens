/**
 * Forecast calculators — pure deterministic functions.
 *
 * NO database access. NO side effects.
 */

import { round, percentChange, type ChangeResult } from '../../utils/safe-math';

// ─── Month-End Projection ─────────────────────────────────────────────────

export interface ProjectionResult {
  projectedIncome: number;
  projectedExpense: number;
  projectedProfit: number;
  dailyBurnRate: number;
  dailyEarnRate: number;
  remainingDays: number;
}

/**
 * Linear projection of month-end totals based on current pace.
 * @param actualIncome   Income so far this period
 * @param actualExpense  Expense so far this period
 * @param daysElapsed    Days elapsed in the period (≥ 1)
 * @param totalDays      Total days in the period
 */
export const projectMonthEnd = (
  actualIncome: number,
  actualExpense: number,
  daysElapsed: number,
  totalDays: number,
): ProjectionResult => {
  const elapsed = Math.max(1, daysElapsed);
  const total = Math.max(elapsed, totalDays);
  const remaining = Math.max(0, total - elapsed);

  const dailyEarnRate = round(actualIncome / elapsed);
  const dailyBurnRate = round(actualExpense / elapsed);

  const projectedIncome = round(dailyEarnRate * total);
  const projectedExpense = round(dailyBurnRate * total);
  const projectedProfit = round(projectedIncome - projectedExpense);

  return {
    projectedIncome,
    projectedExpense,
    projectedProfit,
    dailyBurnRate,
    dailyEarnRate,
    remainingDays: remaining,
  };
};

// ─── Cash Runway ──────────────────────────────────────────────────────────

/**
 * How many days until cash runs out at the current net burn rate.
 * Returns null if net burn rate is non-positive (not losing money).
 *
 * @param currentBalance  Available cash (profit so far this period)
 * @param dailyNetBurn    Daily net loss (positive = losing money)
 */
export const calculateCashRunway = (
  currentBalance: number,
  dailyNetBurn: number,
): number | null => {
  if (dailyNetBurn <= 0) return null; // Not burning cash
  if (currentBalance <= 0) return 0;   // Already negative
  return Math.floor(currentBalance / dailyNetBurn);
};

// ─── Forecast vs Previous Period ──────────────────────────────────────────

export interface ForecastComparisonResult {
  projectedExpense: number;
  previousExpense: number;
  expenseChange: ChangeResult;
  projectedProfit: number;
  previousProfit: number;
  profitChange: ChangeResult;
  isOverspending: boolean;
}

/**
 * Compare projected month-end against previous period actuals.
 */
export const compareForecastToPrevious = (
  projectedExpense: number,
  projectedProfit: number,
  previousExpense: number,
  previousProfit: number,
): ForecastComparisonResult => {
  const expenseChange = percentChange(projectedExpense, previousExpense);
  const profitChange = percentChange(projectedProfit, previousProfit);

  return {
    projectedExpense,
    previousExpense,
    expenseChange,
    projectedProfit,
    previousProfit,
    profitChange,
    isOverspending: expenseChange.hasComparison && expenseChange.pct > 0,
  };
};
