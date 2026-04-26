import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';
import { toSafeNumber } from '../../utils/safe-math';

export const BudgetCreateSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
});

export type BudgetCreateInput = z.infer<typeof BudgetCreateSchema>;

/**
 * Return all budgets for a user with this-month spent / remaining figures.
 *
 * Uses a single `groupBy` to compute spent across every budgeted category.
 */
export const listBudgets = async (userId: string) => {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { category: { select: { id: true, name: true, color: true, type: true } } },
    orderBy: { amount: 'desc' },
  });
  if (budgets.length === 0) return [];

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const grouped = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'EXPENSE',
      categoryId: { in: budgets.map((b) => b.categoryId) },
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  });
  const usedById = new Map(
    grouped.map((g) => [g.categoryId, toSafeNumber(g._sum.amount)]),
  );

  return budgets.map((b) => {
    const used = usedById.get(b.categoryId) ?? 0;
    const limit = toSafeNumber(b.amount);
    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category,
      limit,
      used,
      remaining: Math.max(0, limit - used),
      usedPct: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0,
      exceeded: used > limit,
    };
  });
};

export const upsertBudget = async (userId: string, input: BudgetCreateInput) => {
  const cat = await prisma.category.findFirst({
    where: { id: input.categoryId, userId, type: 'EXPENSE' },
  });
  if (!cat) {
    throw HttpError.badRequest('Category not found or not an expense category.');
  }

  return prisma.budget.upsert({
    where: { userId_categoryId: { userId, categoryId: input.categoryId } },
    update: { amount: new Prisma.Decimal(input.amount.toFixed(2)) },
    create: {
      userId,
      categoryId: input.categoryId,
      amount: new Prisma.Decimal(input.amount.toFixed(2)),
    },
    include: { category: { select: { id: true, name: true, color: true, type: true } } },
  });
};

export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
  await prisma.budget.deleteMany({ where: { id: budgetId, userId } });
};

export interface SuggestedBudget {
  category: { id: string; name: string; color: string | null };
  averageMonthly: number;
  /** Suggested cap, rounded to a friendly increment of 5/10. */
  suggested: number;
  monthsObserved: number;
}

/**
 * Suggest budget caps for the user's top expense categories that aren't yet
 * budgeted. The suggestion = ceil(avg_monthly_spend * 1.10) rounded to a
 * friendly $5/$10 increment, using the trailing 3 calendar months as the
 * baseline.
 */
export const suggestBudgets = async (userId: string): Promise<SuggestedBudget[]> => {
  const now = new Date();
  const start = startOfMonth(subMonths(now, 3));
  const end = endOfMonth(subMonths(now, 1));
  const months = 3;

  const [grouped, existing] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 12,
    }),
    prisma.budget.findMany({ where: { userId }, select: { categoryId: true } }),
  ]);

  const budgeted = new Set(existing.map((b) => b.categoryId));
  const candidates = grouped.filter((g) => !budgeted.has(g.categoryId)).slice(0, 6);
  if (candidates.length === 0) return [];

  const cats = await prisma.category.findMany({
    where: { id: { in: candidates.map((c) => c.categoryId) } },
    select: { id: true, name: true, color: true, type: true },
  });
  const byId = new Map(cats.map((c) => [c.id, c]));

  return candidates
    .map((c) => {
      const cat = byId.get(c.categoryId);
      if (!cat || cat.type !== 'EXPENSE') return null;
      const avg = toSafeNumber(c._sum.amount) / months;
      if (avg <= 0) return null;
      const padded = avg * 1.1;
      // Round up to nearest $5 below $200, $10 below $1000, $50 above.
      const step = padded < 200 ? 5 : padded < 1000 ? 10 : 50;
      const suggested = Math.ceil(padded / step) * step;
      return {
        category: { id: cat.id, name: cat.name, color: cat.color },
        averageMonthly: Math.round(avg * 100) / 100,
        suggested,
        monthsObserved: months,
      } satisfies SuggestedBudget;
    })
    .filter((s): s is SuggestedBudget => s !== null);
};
