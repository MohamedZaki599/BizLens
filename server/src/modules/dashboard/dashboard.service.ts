import { Prisma } from '@prisma/client';
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import { prisma } from '../../config/prisma';
import {
  formatMoney,
  percentChange,
  shareOf,
  toSafeNumber,
} from '../../utils/safe-math';
import type { ResolvedRange } from './dashboard.range';

/**
 * Pure data-access helpers for the dashboard. Keep these functions free of
 * Express types so they're trivial to test and reuse from other modules
 * (e.g. background jobs, alert engine).
 */

export const aggregateByType = async (
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  from: Date | null,
  to: Date | null,
): Promise<number> => {
  const where: Prisma.TransactionWhereInput = { userId, type };
  if (from && to) where.date = { gte: from, lte: to };
  const result = await prisma.transaction.aggregate({ _sum: { amount: true }, where });
  return toSafeNumber(result._sum.amount);
};

export interface BiggestCategory {
  id: string;
  name: string;
  color: string | null;
  total: number;
  share: number;
}

export const biggestCategory = async (
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  from: Date | null,
  to: Date | null,
): Promise<BiggestCategory | null> => {
  const where: Prisma.TransactionWhereInput = { userId, type };
  if (from && to) where.date = { gte: from, lte: to };

  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 1,
  });
  if (grouped.length === 0) return null;

  const top = grouped[0];
  const totalAgg = await prisma.transaction.aggregate({ _sum: { amount: true }, where });
  const total = toSafeNumber(totalAgg._sum.amount);
  const cat = await prisma.category.findUnique({
    where: { id: top.categoryId },
    select: { id: true, name: true, color: true },
  });
  if (!cat) return null;

  return {
    id: cat.id,
    name: cat.name,
    color: cat.color,
    total: toSafeNumber(top._sum.amount),
    share: shareOf(toSafeNumber(top._sum.amount), total),
  };
};

export interface MetricsResult {
  range: { id: string; label: string; from: Date | null; to: Date | null };
  userMode: 'FREELANCER' | 'SHOP_OWNER' | 'STARTUP' | string;
  totals: { income: number; expense: number; profit: number; marginPct: number };
  changes: {
    income: ReturnType<typeof percentChange>;
    expense: ReturnType<typeof percentChange>;
    profit: ReturnType<typeof percentChange>;
  };
  previous: { income: number; expense: number; profit: number };
  breakdown: { biggestExpense: BiggestCategory | null; biggestIncome: BiggestCategory | null };
  transactionCount: number;
  warnings: Array<{ id: string; severity: 'warning' | 'critical'; message: string }>;
}

export const buildMetrics = async (
  userId: string,
  rangeId: string,
  r: ResolvedRange,
): Promise<MetricsResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { userMode: true },
  });

  const where: Prisma.TransactionWhereInput = { userId };
  if (r.from && r.to) where.date = { gte: r.from, lte: r.to };

  const [income, expense, count, prevIncome, prevExpense, biggestExp, biggestInc] =
    await Promise.all([
      aggregateByType(userId, 'INCOME', r.from, r.to),
      aggregateByType(userId, 'EXPENSE', r.from, r.to),
      prisma.transaction.count({ where }),
      aggregateByType(userId, 'INCOME', r.prevFrom, r.prevTo),
      aggregateByType(userId, 'EXPENSE', r.prevFrom, r.prevTo),
      biggestCategory(userId, 'EXPENSE', r.from, r.to),
      biggestCategory(userId, 'INCOME', r.from, r.to),
    ]);

  const profit = income - expense;
  const prevProfit = prevIncome - prevExpense;
  const margin = shareOf(profit, income);

  const profitChange = percentChange(profit, prevProfit);
  const incomeChange = percentChange(income, prevIncome);
  const expenseChange = percentChange(expense, prevExpense);

  const warnings: MetricsResult['warnings'] = [];
  if (income > 0 && expense > income) {
    warnings.push({
      id: 'spend-exceeds-income',
      severity: 'critical',
      message: 'Expenses exceed income for this period.',
    });
  }
  if (biggestExp && biggestExp.share >= 50) {
    warnings.push({
      id: 'concentrated-spend',
      severity: 'warning',
      message: `${biggestExp.name} accounts for ${biggestExp.share}% of spending.`,
    });
  }
  if (expenseChange.hasComparison && expenseChange.pct >= 30) {
    warnings.push({
      id: 'expense-spike',
      severity: 'warning',
      message: `Spending is up ${expenseChange.pct}% versus the previous period.`,
    });
  }

  return {
    range: { id: rangeId, label: r.label, from: r.from, to: r.to },
    userMode: user?.userMode ?? 'FREELANCER',
    totals: { income, expense, profit, marginPct: margin },
    changes: { income: incomeChange, expense: expenseChange, profit: profitChange },
    previous: { income: prevIncome, expense: prevExpense, profit: prevProfit },
    breakdown: { biggestExpense: biggestExp, biggestIncome: biggestInc },
    transactionCount: count,
    warnings,
  };
};

const MS_PER_DAY = 86_400_000;

export const buildForecast = async (userId: string, r: ResolvedRange) => {
  const now = new Date();
  const effectiveFrom = r.from ?? startOfMonth(now);
  const effectiveTo = r.to ?? endOfMonth(now);
  const totalDays = Math.max(
    1,
    Math.ceil((effectiveTo.getTime() - effectiveFrom.getTime()) / MS_PER_DAY),
  );
  const elapsed = Math.max(
    1,
    Math.ceil(
      (Math.min(now.getTime(), effectiveTo.getTime()) - effectiveFrom.getTime()) / MS_PER_DAY,
    ),
  );
  const remainingDays = Math.max(0, totalDays - elapsed);

  const [inc, exp, lastExp, lastInc] = await Promise.all([
    aggregateByType(userId, 'INCOME', effectiveFrom, now < effectiveTo ? now : effectiveTo),
    aggregateByType(userId, 'EXPENSE', effectiveFrom, now < effectiveTo ? now : effectiveTo),
    aggregateByType(userId, 'EXPENSE', r.prevFrom, r.prevTo),
    aggregateByType(userId, 'INCOME', r.prevFrom, r.prevTo),
  ]);

  const projectedIncome = (inc / elapsed) * totalDays;
  const projectedExpense = (exp / elapsed) * totalDays;
  const projectedProfit = projectedIncome - projectedExpense;

  const expChange = percentChange(projectedExpense, lastExp);
  const profitChange = percentChange(projectedProfit, lastInc - lastExp);

  let narrative = `Based on your activity so far, you're on track for ${formatMoney(
    projectedExpense,
  )} in expenses and ${formatMoney(projectedIncome)} in income — a projected profit of ${formatMoney(
    projectedProfit,
  )}.`;
  if (expChange.hasComparison && expChange.pct >= 15) {
    narrative = `If you continue at this rate, you'll spend about ${formatMoney(
      projectedExpense,
    )} this period — ${Math.round(expChange.pct)}% more than the prior period.`;
  } else if (projectedProfit < 0) {
    narrative = `If you continue at this rate, you'll end the period down ${formatMoney(
      Math.abs(projectedProfit),
    )}. Time to look at expenses.`;
  }

  return {
    asOf: now,
    remainingDays,
    actual: { income: inc, expense: exp, profit: inc - exp },
    projected: {
      income: projectedIncome,
      expense: projectedExpense,
      profit: projectedProfit,
    },
    vsLastMonth: { expense: expChange, profit: profitChange },
    narrative,
  };
};

export const buildMoneyLeak = async (userId: string, r: ResolvedRange) => {
  const now = new Date();
  const thisFrom = r.from ?? startOfMonth(now);
  const thisTo = r.to ?? endOfMonth(now);
  const baseStart = startOfMonth(subMonths(thisFrom, 3));
  const baseEnd = r.from
    ? new Date(r.from.getTime() - MS_PER_DAY)
    : endOfMonth(subMonths(now, 1));
  if (baseEnd <= baseStart) return null;

  const baseMonths = Math.max(
    1,
    Math.round((baseEnd.getTime() - baseStart.getTime()) / (30 * MS_PER_DAY)),
  );

  const [thisCats, baseCats] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: thisFrom, lte: thisTo } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: baseStart, lte: baseEnd } },
      _sum: { amount: true },
    }),
  ]);
  if (thisCats.length === 0) return null;

  const baseAvg = new Map<string, number>();
  for (const c of baseCats)
    baseAvg.set(c.categoryId, toSafeNumber(c._sum.amount) / baseMonths);

  const ranked = thisCats
    .map((c) => {
      const total = toSafeNumber(c._sum.amount);
      const avg = baseAvg.get(c.categoryId) ?? 0;
      return { categoryId: c.categoryId, total, avg, extra: total - avg };
    })
    .sort((a, b) => b.extra - a.extra);

  const top = ranked[0];
  if (!top || top.extra <= 0) return null;

  const cat = await prisma.category.findUnique({
    where: { id: top.categoryId },
    select: { id: true, name: true, color: true },
  });
  if (!cat) return null;

  const annualized = top.extra * 12;
  return {
    category: cat,
    thisMonth: top.total,
    baselineAvg: top.avg,
    extra: top.extra,
    annualized,
    message: `${cat.name} is costing you ${formatMoney(
      top.extra,
    )} more this period than your baseline average — that's ${formatMoney(
      annualized,
    )} a year if it sticks.`,
  };
};

export const buildWeeklySummary = async (userId: string) => {
  const now = new Date();
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const [inc, exp, lastInc, lastExp, count] = await Promise.all([
    aggregateByType(userId, 'INCOME', thisStart, thisEnd),
    aggregateByType(userId, 'EXPENSE', thisStart, thisEnd),
    aggregateByType(userId, 'INCOME', lastStart, lastEnd),
    aggregateByType(userId, 'EXPENSE', lastStart, lastEnd),
    prisma.transaction.count({
      where: { userId, date: { gte: thisStart, lte: thisEnd } },
    }),
  ]);

  return {
    week: {
      from: thisStart,
      to: thisEnd,
      label: `${format(thisStart, 'MMM d')} – ${format(thisEnd, 'MMM d')}`,
    },
    totals: { income: inc, expense: exp, profit: inc - exp, count },
    previous: { income: lastInc, expense: lastExp, profit: lastInc - lastExp },
    changes: {
      income: percentChange(inc, lastInc),
      expense: percentChange(exp, lastExp),
      profit: percentChange(inc - exp, lastInc - lastExp),
    },
  };
};

export const buildExpenseTrend = async (userId: string) => {
  const now = new Date();
  const months: Array<{ month: string; income: number; expense: number }> = [];

  for (let i = 11; i >= 0; i--) {
    const ref = subMonths(now, i);
    const from = startOfMonth(ref);
    const to = endOfMonth(ref);
    const [inc, exp] = await Promise.all([
      aggregateByType(userId, 'INCOME', from, to),
      aggregateByType(userId, 'EXPENSE', from, to),
    ]);
    months.push({ month: format(from, 'yyyy-MM'), income: inc, expense: exp });
  }

  return { months };
};

export const buildExpenseComposition = async (userId: string, r: ResolvedRange) => {
  const where: Prisma.TransactionWhereInput = { userId, type: 'EXPENSE' };
  if (r.from && r.to) where.date = { gte: r.from, lte: r.to };

  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 8,
  });
  if (grouped.length === 0) return { categories: [] };

  const cats = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(cats.map((c) => [c.id, c]));
  const total = grouped.reduce((s, g) => s + toSafeNumber(g._sum.amount), 0);

  const categories = grouped.map((g) => {
    const cat = byId.get(g.categoryId);
    const amount = toSafeNumber(g._sum.amount);
    return {
      id: g.categoryId,
      name: cat?.name ?? 'Unknown',
      color: cat?.color ?? '#888',
      amount,
      share: shareOf(amount, total),
    };
  });

  return { categories };
};
