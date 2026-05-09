/**
 * Spending calculators — pure deterministic functions.
 *
 * NO database access. NO side effects. NO date logic.
 */

import { round, shareOf, percentChange, type ChangeResult } from '../../utils/safe-math';

// ─── Burn Rate ────────────────────────────────────────────────────────────

/**
 * Daily burn rate = total expense / days elapsed.
 * Returns 0 if days <= 0.
 */
export const calculateBurnRate = (
  totalExpense: number,
  daysElapsed: number,
): number => {
  if (daysElapsed <= 0) return 0;
  return round(totalExpense / daysElapsed);
};

// ─── Expense Ratio ────────────────────────────────────────────────────────

/**
 * Expense-to-income ratio.
 * 0.8 = spending 80% of income.
 * > 1.0 = spending more than earning.
 * Returns Infinity-safe 0 when income is 0.
 */
export const calculateExpenseRatio = (
  expense: number,
  income: number,
): number => {
  if (income <= 0) return expense > 0 ? 999 : 0;
  return round(expense / income, 3);
};

// ─── Category Concentration ───────────────────────────────────────────────

export interface ConcentrationResult {
  topCategoryId: string;
  topCategoryName: string;
  topAmount: number;
  totalAmount: number;
  sharePct: number;
}

export interface CategoryInput {
  categoryId: string;
  name: string;
  total: number;
}

/**
 * Finds the single highest-spending category and its share of total.
 * Input must be pre-sorted by total (descending) or unsorted (we sort internally).
 */
export const calculateConcentration = (
  categories: CategoryInput[],
): ConcentrationResult | null => {
  if (categories.length === 0) return null;
  const sorted = [...categories].sort((a, b) => b.total - a.total);
  const top = sorted[0];
  const totalAmount = sorted.reduce((s, c) => s + c.total, 0);
  if (totalAmount <= 0) return null;

  return {
    topCategoryId: top.categoryId,
    topCategoryName: top.name,
    topAmount: top.total,
    totalAmount,
    sharePct: shareOf(top.total, totalAmount),
  };
};

// ─── Spend Spike Detection ────────────────────────────────────────────────

export interface SpendSpikeResult {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  baselineAvg: number;
  changePct: number;
  change: ChangeResult;
}

/**
 * Detects categories whose current spend exceeds baseline average by threshold%.
 * Returns all spiking categories sorted by severity (highest % first).
 */
export const detectSpendSpikes = (
  current: CategoryInput[],
  baselineAvgByCategory: Map<string, number>,
  minBaseline: number = 25,
): SpendSpikeResult[] => {
  const results: SpendSpikeResult[] = [];

  for (const cat of current) {
    const avg = baselineAvgByCategory.get(cat.categoryId);
    if (!avg || avg < minBaseline) continue;

    const change = percentChange(cat.total, avg);
    if (!change.hasComparison) continue;

    results.push({
      categoryId: cat.categoryId,
      categoryName: cat.name,
      currentAmount: cat.total,
      baselineAvg: avg,
      changePct: change.pct,
      change,
    });
  }

  return results
    .filter((r) => r.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct);
};

// ─── Weekly Spend Change ──────────────────────────────────────────────────

/**
 * Week-over-week spending change.
 */
export const calculateWeeklySpendChange = (
  thisWeekExpense: number,
  lastWeekExpense: number,
): ChangeResult => percentChange(thisWeekExpense, lastWeekExpense);
