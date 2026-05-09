/**
 * Data Collector — the SINGLE entry point for all financial data queries.
 *
 * Replaces the 11+ duplicated `sumByType` / `categoryTotals` calls that are
 * scattered across dashboard.service, insight-engine, alert-engine, and
 * assistant.service.
 *
 * Call `collectFinancialData(userId)` ONCE, then pass the resulting
 * FinancialSnapshot to every calculator and signal generator.
 */

import { prisma, type Prisma } from '@bizlens/database';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  differenceInCalendarDays,
  format,
} from 'date-fns';
import { toSafeNumber } from '../../utils/safe-math';

// ─── Snapshot Types ───────────────────────────────────────────────────────

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string | null;
  total: number;
}

export interface FinancialSnapshot {
  userId: string;
  collectedAt: Date;

  // Current month
  monthIncome: number;
  monthExpense: number;
  monthProfit: number;
  monthTransactionCount: number;
  monthExpenseByCategory: CategoryTotal[];
  monthIncomeByCategory: CategoryTotal[];

  // Previous month (for month-over-month comparisons)
  prevMonthIncome: number;
  prevMonthExpense: number;
  prevMonthProfit: number;
  prevMonthExpenseByCategory: CategoryTotal[];

  // Current week
  weekIncome: number;
  weekExpense: number;
  weekProfit: number;

  // Previous week
  prevWeekIncome: number;
  prevWeekExpense: number;
  prevWeekProfit: number;

  // 3-month baseline expense averages per category (for anomaly detection)
  threeMonthExpenseAvgByCategory: Map<string, number>;

  // Activity
  lastTransactionAt: Date | null;
  daysSinceLastTransaction: number | null;
  totalTransactions: number;

  // Period metadata
  monthDaysElapsed: number;
  monthTotalDays: number;
  monthStart: Date;
  monthEnd: Date;

  // Recurring expense data (last 3 months of expense txns)
  recentExpenseTransactions: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    yearMonth: string;
  }>;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────

const sumByType = async (
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  from: Date,
  to: Date,
): Promise<number> => {
  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { userId, type, date: { gte: from, lte: to } },
  });
  return toSafeNumber(result._sum.amount);
};

const categoryTotals = async (
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  from: Date,
  to: Date,
): Promise<CategoryTotal[]> => {
  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type, date: { gte: from, lte: to } },
    _sum: { amount: true },
  });
  if (grouped.length === 0) return [];

  const catIds = grouped.map((g) => g.categoryId);
  const cats = await prisma.category.findMany({
    where: { id: { in: catIds } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(cats.map((c) => [c.id, c]));

  return grouped
    .map((g) => ({
      categoryId: g.categoryId,
      name: byId.get(g.categoryId)?.name ?? 'Unknown',
      color: byId.get(g.categoryId)?.color ?? null,
      total: toSafeNumber(g._sum.amount),
    }))
    .sort((a, b) => b.total - a.total);
};

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Collect ALL financial data needed for signal generation in a single pass.
 * This function batches DB queries aggressively via Promise.all.
 */
export const collectFinancialData = async (
  userId: string,
  now: Date = new Date(),
): Promise<FinancialSnapshot> => {
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const prevMonthStart = startOfMonth(subMonths(now, 1));
  const prevMonthEnd = endOfMonth(subMonths(now, 1));
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const baselineStart = startOfMonth(subMonths(now, 4)); // 3 months before prev month
  const baselineEnd = prevMonthEnd;

  // ─── Batch 1: All aggregations in parallel ────────────────────────────
  const [
    monthIncome,
    monthExpense,
    monthTxCount,
    prevMonthIncome,
    prevMonthExpense,
    weekIncome,
    weekExpense,
    prevWeekIncome,
    prevWeekExpense,
    monthExpCats,
    monthIncCats,
    prevMonthExpCats,
    baselineExpCats,
    lastTx,
    totalTx,
  ] = await Promise.all([
    sumByType(userId, 'INCOME', monthStart, monthEnd),
    sumByType(userId, 'EXPENSE', monthStart, monthEnd),
    prisma.transaction.count({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
    }),
    sumByType(userId, 'INCOME', prevMonthStart, prevMonthEnd),
    sumByType(userId, 'EXPENSE', prevMonthStart, prevMonthEnd),
    sumByType(userId, 'INCOME', weekStart, weekEnd),
    sumByType(userId, 'EXPENSE', weekStart, weekEnd),
    sumByType(userId, 'INCOME', prevWeekStart, prevWeekEnd),
    sumByType(userId, 'EXPENSE', prevWeekStart, prevWeekEnd),
    categoryTotals(userId, 'EXPENSE', monthStart, monthEnd),
    categoryTotals(userId, 'INCOME', monthStart, monthEnd),
    categoryTotals(userId, 'EXPENSE', prevMonthStart, prevMonthEnd),
    categoryTotals(userId, 'EXPENSE', baselineStart, baselineEnd),
    prisma.transaction.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
    prisma.transaction.count({ where: { userId } }),
  ]);

  // ─── 3-month baseline averages ────────────────────────────────────────
  const threeMonthExpenseAvgByCategory = new Map<string, number>();
  // Baseline is 3 months (months -4 to -1), so divide by 3
  for (const cat of baselineExpCats) {
    threeMonthExpenseAvgByCategory.set(cat.categoryId, cat.total / 3);
  }

  // ─── Activity ─────────────────────────────────────────────────────────
  const daysSinceLastTransaction = lastTx
    ? differenceInCalendarDays(now, lastTx.date)
    : null;

  // ─── Recurring data (last 3 months of expense txns) ───────────────────
  const recurringStart = startOfMonth(subMonths(now, 3));
  const recentTxns = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', date: { gte: recurringStart, lte: now } },
    select: {
      amount: true,
      categoryId: true,
      category: { select: { name: true } },
      date: true,
    },
  });

  const recentExpenseTransactions = recentTxns.map((tx) => ({
    categoryId: tx.categoryId,
    categoryName: tx.category.name,
    amount: toSafeNumber(tx.amount),
    yearMonth: format(tx.date, 'yyyy-MM'),
  }));

  // ─── Period metadata ──────────────────────────────────────────────────
  const monthDaysElapsed = Math.max(1, now.getDate());
  const monthTotalDays = monthEnd.getDate();

  return {
    userId,
    collectedAt: now,

    monthIncome,
    monthExpense,
    monthProfit: monthIncome - monthExpense,
    monthTransactionCount: monthTxCount,
    monthExpenseByCategory: monthExpCats,
    monthIncomeByCategory: monthIncCats,

    prevMonthIncome,
    prevMonthExpense,
    prevMonthProfit: prevMonthIncome - prevMonthExpense,
    prevMonthExpenseByCategory: prevMonthExpCats,

    weekIncome,
    weekExpense,
    weekProfit: weekIncome - weekExpense,

    prevWeekIncome,
    prevWeekExpense,
    prevWeekProfit: prevWeekIncome - prevWeekExpense,

    threeMonthExpenseAvgByCategory,

    lastTransactionAt: lastTx?.date ?? null,
    daysSinceLastTransaction,
    totalTransactions: totalTx,

    monthDaysElapsed,
    monthTotalDays,
    monthStart,
    monthEnd,

    recentExpenseTransactions,
  };
};
