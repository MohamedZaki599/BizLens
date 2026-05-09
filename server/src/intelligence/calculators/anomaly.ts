/**
 * Anomaly detection calculators — pure deterministic functions.
 *
 * NO database access. NO side effects.
 */

import { percentChange, type ChangeResult } from '../../utils/safe-math';
import type { CategoryInput } from './spending';

// ─── Category Anomaly Detection ───────────────────────────────────────────

export interface AnomalyResult {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  baselineAvg: number;
  changePct: number;
  change: ChangeResult;
}

/**
 * Detects categories whose current spend is anomalously high compared to
 * their historical average (e.g. 3-month baseline).
 *
 * @param current              Category totals for the current period
 * @param baselineAvgByCategory Average per-period spend per category
 * @param thresholdPct          Minimum % increase to flag as anomaly (e.g. 50)
 * @param minBaseline           Minimum baseline amount to avoid noise (e.g. 25)
 */
export const detectAnomalies = (
  current: CategoryInput[],
  baselineAvgByCategory: Map<string, number>,
  thresholdPct: number = 50,
  minBaseline: number = 25,
): AnomalyResult[] => {
  const results: AnomalyResult[] = [];

  for (const cat of current) {
    const baseline = baselineAvgByCategory.get(cat.categoryId);
    if (!baseline || baseline < minBaseline) continue;

    const change = percentChange(cat.total, baseline);
    if (!change.hasComparison || change.pct < thresholdPct) continue;

    results.push({
      categoryId: cat.categoryId,
      categoryName: cat.name,
      currentAmount: cat.total,
      baselineAvg: baseline,
      changePct: change.pct,
      change,
    });
  }

  return results.sort((a, b) => b.changePct - a.changePct);
};

// ─── Stale Data Detection ─────────────────────────────────────────────────

export interface StaleDataResult {
  daysSinceLastTransaction: number;
  totalTransactions: number;
  isStale: boolean;
  severity: 'none' | 'info' | 'warning';
}

/**
 * Determines if the user's data is stale (no recent transactions).
 *
 * @param daysSinceLastTx  Days since the last transaction (null = no transactions)
 * @param totalTx          Total transaction count
 * @param staleDays        Threshold to consider stale (e.g. 3)
 * @param warningDays      Threshold for warning severity (e.g. 7)
 * @param minTx            Minimum transactions before we flag staleness (e.g. 5)
 */
export const detectStaleData = (
  daysSinceLastTx: number | null,
  totalTx: number,
  staleDays: number = 3,
  warningDays: number = 7,
  minTx: number = 5,
): StaleDataResult => {
  if (daysSinceLastTx === null || totalTx < minTx) {
    return {
      daysSinceLastTransaction: daysSinceLastTx ?? 0,
      totalTransactions: totalTx,
      isStale: false,
      severity: 'none',
    };
  }

  const isStale = daysSinceLastTx >= staleDays;
  const severity = !isStale ? 'none' : daysSinceLastTx >= warningDays ? 'warning' : 'info';

  return {
    daysSinceLastTransaction: daysSinceLastTx,
    totalTransactions: totalTx,
    isStale,
    severity,
  };
};

// ─── Recurring Expense Detection ──────────────────────────────────────────

export interface RecurringCandidate {
  categoryId: string;
  categoryName: string;
  averageAmount: number;
  monthsDetected: number;
}

export interface RecurringInput {
  categoryId: string;
  categoryName: string;
  amount: number;
  yearMonth: string; // 'yyyy-MM'
}

/**
 * Detects likely recurring expenses by finding (category, amount-bucket)
 * pairs that appear across multiple consecutive months.
 *
 * @param transactions       Flat list of expense transactions with month info
 * @param minMonths          Minimum consecutive months to flag (e.g. 3)
 * @param minAmount          Minimum amount to consider (e.g. 5)
 * @param tolerancePct       % tolerance for amount matching (e.g. 5%)
 */
export const detectRecurringExpenses = (
  transactions: RecurringInput[],
  minMonths: number = 3,
  minAmount: number = 5,
  tolerancePct: number = 5,
): RecurringCandidate[] => {
  // Group by (categoryId, amount bucket)
  const buckets = new Map<
    string,
    { categoryId: string; categoryName: string; months: Set<string>; totalAmount: number; count: number }
  >();

  for (const tx of transactions) {
    if (tx.amount < minAmount) continue;

    // Bucket amounts into tolerance-wide bins
    const bucketSize = Math.max(1, tx.amount * (tolerancePct / 100));
    const bucketKey = Math.round(tx.amount / bucketSize);
    const key = `${tx.categoryId}:${bucketKey}`;

    const existing = buckets.get(key);
    if (existing) {
      existing.months.add(tx.yearMonth);
      existing.totalAmount += tx.amount;
      existing.count++;
    } else {
      buckets.set(key, {
        categoryId: tx.categoryId,
        categoryName: tx.categoryName,
        months: new Set([tx.yearMonth]),
        totalAmount: tx.amount,
        count: 1,
      });
    }
  }

  const results: RecurringCandidate[] = [];
  for (const b of buckets.values()) {
    if (b.months.size < minMonths) continue;
    results.push({
      categoryId: b.categoryId,
      categoryName: b.categoryName,
      averageAmount: Math.round(b.totalAmount / b.count),
      monthsDetected: b.months.size,
    });
  }

  return results.sort((a, b) => b.averageAmount - a.averageAmount);
};
