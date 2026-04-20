import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';
import { insightEngine } from '../../services/insight-engine/insight-engine';
import {
  formatMoney,
  percentChange,
  shareOf,
  toSafeNumber,
} from '../../utils/safe-math';

const router = Router();
router.use(requireAuth);

// ─── Shared range resolution ──────────────────────────────────────────────

const RANGE_ENUM = z.enum(['this_month', 'last_month', 'last_30_days', 'all']);
const RangeSchema = z.object({ range: RANGE_ENUM.optional().default('this_month') });

interface ResolvedRange {
  from: Date | null;
  to: Date | null;
  label: string;
  prevFrom: Date | null;
  prevTo: Date | null;
}

const resolveRange = (range: string): ResolvedRange => {
  const now = new Date();
  switch (range) {
    case 'last_month': {
      const ref = subMonths(now, 1);
      const prevRef = subMonths(now, 2);
      return {
        from: startOfMonth(ref),
        to: endOfMonth(ref),
        label: 'Last month',
        prevFrom: startOfMonth(prevRef),
        prevTo: endOfMonth(prevRef),
      };
    }
    case 'last_30_days': {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      const prevTo = new Date(from);
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 30);
      return { from, to: now, label: 'Last 30 days', prevFrom, prevTo };
    }
    case 'all':
      return { from: null, to: null, label: 'All time', prevFrom: null, prevTo: null };
    case 'this_month':
    default: {
      const ref = subMonths(now, 1);
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
        label: 'This month',
        prevFrom: startOfMonth(ref),
        prevTo: endOfMonth(ref),
      };
    }
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const aggregateByType = async (
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

interface BiggestCategory {
  id: string;
  name: string;
  color: string | null;
  total: number;
  share: number;
}

const biggestCategory = async (
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

// ─── Routes ───────────────────────────────────────────────────────────────

router.get(
  '/metrics',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { userMode: true },
    });

    const where: Prisma.TransactionWhereInput = { userId: req.user.id };
    if (r.from && r.to) where.date = { gte: r.from, lte: r.to };

    const [income, expense, count, prevIncome, prevExpense, biggestExp, biggestInc] =
      await Promise.all([
        aggregateByType(req.user.id, 'INCOME', r.from, r.to),
        aggregateByType(req.user.id, 'EXPENSE', r.from, r.to),
        prisma.transaction.count({ where }),
        aggregateByType(req.user.id, 'INCOME', r.prevFrom, r.prevTo),
        aggregateByType(req.user.id, 'EXPENSE', r.prevFrom, r.prevTo),
        biggestCategory(req.user.id, 'EXPENSE', r.from, r.to),
        biggestCategory(req.user.id, 'INCOME', r.from, r.to),
      ]);

    const profit = income - expense;
    const prevProfit = prevIncome - prevExpense;
    const margin = shareOf(profit, income);

    const profitChange = percentChange(profit, prevProfit);
    const incomeChange = percentChange(income, prevIncome);
    const expenseChange = percentChange(expense, prevExpense);

    const warnings: Array<{ id: string; severity: 'warning' | 'critical'; message: string }> = [];
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

    res.json({
      range: { id: range, label: r.label, from: r.from, to: r.to },
      userMode: user?.userMode ?? 'FREELANCER',
      totals: { income, expense, profit, marginPct: margin },
      changes: { income: incomeChange, expense: expenseChange, profit: profitChange },
      previous: { income: prevIncome, expense: prevExpense, profit: prevProfit },
      breakdown: { biggestExpense: biggestExp, biggestIncome: biggestInc },
      transactionCount: count,
      warnings,
    });
  }),
);

router.get(
  '/insights',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);
    const insights = await insightEngine.generate(req.user.id, r.from, r.to);
    res.json({ insights });
  }),
);

const SuggestSchema = z.object({ type: z.enum(['INCOME', 'EXPENSE']) });
router.get(
  '/suggested-category',
  validate(SuggestSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { type } = req.query as { type: 'INCOME' | 'EXPENSE' };
    const last = await prisma.transaction.findFirst({
      where: { userId: req.user.id, type },
      orderBy: { date: 'desc' },
      select: { category: { select: { id: true, name: true, color: true } } },
    });
    res.json({ category: last?.category ?? null });
  }),
);

router.get(
  '/forecast',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);
    const now = new Date();

    const effectiveFrom = r.from ?? startOfMonth(now);
    const effectiveTo = r.to ?? endOfMonth(now);
    const totalDays = Math.max(1, Math.ceil((effectiveTo.getTime() - effectiveFrom.getTime()) / 86_400_000));
    const elapsed = Math.max(1, Math.ceil((Math.min(now.getTime(), effectiveTo.getTime()) - effectiveFrom.getTime()) / 86_400_000));
    const remainingDays = Math.max(0, totalDays - elapsed);

    const [inc, exp, lastExp, lastInc] = await Promise.all([
      aggregateByType(req.user.id, 'INCOME', effectiveFrom, now < effectiveTo ? now : effectiveTo),
      aggregateByType(req.user.id, 'EXPENSE', effectiveFrom, now < effectiveTo ? now : effectiveTo),
      aggregateByType(req.user.id, 'EXPENSE', r.prevFrom, r.prevTo),
      aggregateByType(req.user.id, 'INCOME', r.prevFrom, r.prevTo),
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

    res.json({
      asOf: now,
      remainingDays,
      actual: { income: inc, expense: exp, profit: inc - exp },
      projected: { income: projectedIncome, expense: projectedExpense, profit: projectedProfit },
      vsLastMonth: { expense: expChange, profit: profitChange },
      narrative,
    });
  }),
);

router.get(
  '/money-leak',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);
    const now = new Date();

    const thisFrom = r.from ?? startOfMonth(now);
    const thisTo = r.to ?? endOfMonth(now);
    const baseStart = startOfMonth(subMonths(thisFrom, 3));
    const baseEnd = r.from ? new Date(r.from.getTime() - 86_400_000) : endOfMonth(subMonths(now, 1));
    if (baseEnd <= baseStart) return res.json({ leak: null });

    const baseMonths = Math.max(1, Math.round((baseEnd.getTime() - baseStart.getTime()) / (30 * 86_400_000)));

    const [thisCats, baseCats] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId: req.user.id, type: 'EXPENSE', date: { gte: thisFrom, lte: thisTo } },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId: req.user.id, type: 'EXPENSE', date: { gte: baseStart, lte: baseEnd } },
        _sum: { amount: true },
      }),
    ]);
    if (thisCats.length === 0) return res.json({ leak: null });

    const baseAvg = new Map<string, number>();
    for (const c of baseCats) baseAvg.set(c.categoryId, toSafeNumber(c._sum.amount) / baseMonths);

    const ranked = thisCats
      .map((c) => {
        const total = toSafeNumber(c._sum.amount);
        const avg = baseAvg.get(c.categoryId) ?? 0;
        return { categoryId: c.categoryId, total, avg, extra: total - avg };
      })
      .sort((a, b) => b.extra - a.extra);

    const top = ranked[0];
    if (!top || top.extra <= 0) return res.json({ leak: null });

    const cat = await prisma.category.findUnique({
      where: { id: top.categoryId },
      select: { id: true, name: true, color: true },
    });
    if (!cat) return res.json({ leak: null });

    const annualized = top.extra * 12;
    return res.json({
      leak: {
        category: cat,
        thisMonth: top.total,
        baselineAvg: top.avg,
        extra: top.extra,
        annualized,
        message: `${cat.name} is costing you ${formatMoney(
          top.extra,
        )} more this period than your baseline average — that's ${formatMoney(annualized)} a year if it sticks.`,
      },
    });
  }),
);

router.get(
  '/weekly-summary',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const now = new Date();
    const thisStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
    const lastStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const [inc, exp, lastInc, lastExp, count] = await Promise.all([
      aggregateByType(req.user.id, 'INCOME', thisStart, thisEnd),
      aggregateByType(req.user.id, 'EXPENSE', thisStart, thisEnd),
      aggregateByType(req.user.id, 'INCOME', lastStart, lastEnd),
      aggregateByType(req.user.id, 'EXPENSE', lastStart, lastEnd),
      prisma.transaction.count({
        where: { userId: req.user.id, date: { gte: thisStart, lte: thisEnd } },
      }),
    ]);

    res.json({
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
    });
  }),
);

router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const last = await prisma.transaction.findFirst({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
      select: { date: true },
    });
    const total = await prisma.transaction.count({ where: { userId: req.user.id } });
    const daysSince = last
      ? Math.max(0, Math.floor((Date.now() - last.date.getTime()) / 86_400_000))
      : null;
    res.json({
      lastTransactionAt: last?.date ?? null,
      daysSinceLastTransaction: daysSince,
      transactionsTotal: total,
      isStale: daysSince !== null && daysSince >= 3 && total >= 5,
    });
  }),
);

/** Monthly expense totals for the past 12 months — powers the trend chart. */
router.get(
  '/expense-trend',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const now = new Date();
    const months: Array<{ month: string; income: number; expense: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const ref = subMonths(now, i);
      const from = startOfMonth(ref);
      const to = endOfMonth(ref);
      const [inc, exp] = await Promise.all([
        aggregateByType(req.user.id, 'INCOME', from, to),
        aggregateByType(req.user.id, 'EXPENSE', from, to),
      ]);
      months.push({ month: format(from, 'yyyy-MM'), income: inc, expense: exp });
    }

    res.json({ months });
  }),
);

/** Expense composition for the selected range — powers the donut chart. */
router.get(
  '/expense-composition',
  validate(RangeSchema, 'query'),
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { range } = req.query as { range: string };
    const r = resolveRange(range);

    const where: Prisma.TransactionWhereInput = {
      userId: req.user.id,
      type: 'EXPENSE',
    };
    if (r.from && r.to) where.date = { gte: r.from, lte: r.to };

    const grouped = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 8,
    });

    if (grouped.length === 0) return res.json({ categories: [] });

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

    res.json({ categories });
  }),
);

/** Recurring transaction detection — powers subscription manager. */
router.get(
  '/subscriptions',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const now = new Date();
    const start = startOfMonth(subMonths(now, 5));

    const txns = await prisma.transaction.findMany({
      where: { userId: req.user.id, type: 'EXPENSE', date: { gte: start } },
      select: {
        id: true,
        amount: true,
        categoryId: true,
        category: { select: { id: true, name: true, color: true } },
        description: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    // Group by (categoryId, amount bucket, description) to detect repeating patterns.
    const buckets = new Map<
      string,
      {
        name: string;
        categoryId: string;
        category: { id: string; name: string; color: string | null };
        description: string | null;
        amount: number;
        months: Set<string>;
        lastDate: Date;
      }
    >();

    for (const t of txns) {
      const amt = toSafeNumber(t.amount as unknown as Prisma.Decimal);
      if (amt < 3) continue;
      const bucket = Math.round(amt * 20) / 20;
      const key = `${t.categoryId}:${bucket}:${(t.description ?? '').toLowerCase().trim()}`;
      const m = format(t.date, 'yyyy-MM');
      const existing = buckets.get(key);
      if (existing) {
        existing.months.add(m);
        if (t.date > existing.lastDate) existing.lastDate = t.date;
      } else {
        buckets.set(key, {
          name: t.description || t.category.name,
          categoryId: t.categoryId,
          category: t.category,
          description: t.description,
          amount: amt,
          months: new Set([m]),
          lastDate: t.date,
        });
      }
    }

    const subscriptions = Array.from(buckets.values())
      .filter((b) => b.months.size >= 3)
      .map((b) => ({
        name: b.name,
        category: b.category,
        monthlyCost: b.amount,
        annualCost: b.amount * 12,
        monthsDetected: b.months.size,
        lastChargedAt: b.lastDate,
      }))
      .sort((a, b) => b.annualCost - a.annualCost);

    const totalMonthly = subscriptions.reduce((s, sub) => s + sub.monthlyCost, 0);
    const totalAnnual = totalMonthly * 12;

    res.json({ subscriptions, totalMonthly, totalAnnual });
  }),
);

/** CSV import — bulk create transactions from parsed rows. */
router.post(
  '/import',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const schema = z.object({
      transactions: z.array(
        z.object({
          amount: z.number().positive(),
          type: z.enum(['INCOME', 'EXPENSE']),
          date: z.string(),
          description: z.string().optional(),
          categoryId: z.string().uuid(),
        }),
      ),
    });
    const { transactions } = schema.parse(req.body);

    // Verify all categories belong to this user.
    const catIds = [...new Set(transactions.map((t) => t.categoryId))];
    const validCats = await prisma.category.findMany({
      where: { id: { in: catIds }, userId: req.user.id },
      select: { id: true },
    });
    const validSet = new Set(validCats.map((c) => c.id));
    const invalid = catIds.filter((id) => !validSet.has(id));
    if (invalid.length > 0) {
      throw HttpError.badRequest(`Invalid category IDs: ${invalid.join(', ')}`);
    }

    const result = await prisma.transaction.createMany({
      data: transactions.map((t) => ({
        userId: req.user!.id,
        categoryId: t.categoryId,
        amount: new Prisma.Decimal(t.amount.toFixed(2)),
        type: t.type,
        date: new Date(t.date),
        description: t.description ?? null,
      })),
    });

    // Touch activity.
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastActivityAt: new Date() },
    }).catch(() => undefined);

    res.json({ imported: result.count });
  }),
);

/** Budget endpoints — per-category monthly budgets. */
router.get(
  '/budgets',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id },
      include: { category: { select: { id: true, name: true, color: true, type: true } } },
      orderBy: { amount: 'desc' },
    });

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const result = await Promise.all(
      budgets.map(async (b) => {
        const spent = await aggregateByType(req.user!.id, 'EXPENSE', monthStart, monthEnd);
        const catSpent = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            userId: req.user!.id,
            categoryId: b.categoryId,
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd },
          },
        });
        const used = toSafeNumber(catSpent._sum.amount);
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
      }),
    );

    res.json({ budgets: result });
  }),
);

const BudgetCreateSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
});

router.post(
  '/budgets',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const body = BudgetCreateSchema.parse(req.body);
    const cat = await prisma.category.findFirst({
      where: { id: body.categoryId, userId: req.user.id, type: 'EXPENSE' },
    });
    if (!cat) throw HttpError.badRequest('Category not found or not an expense category.');

    const budget = await prisma.budget.upsert({
      where: { userId_categoryId: { userId: req.user.id, categoryId: body.categoryId } },
      update: { amount: new Prisma.Decimal(body.amount.toFixed(2)) },
      create: {
        userId: req.user.id,
        categoryId: body.categoryId,
        amount: new Prisma.Decimal(body.amount.toFixed(2)),
      },
      include: { category: { select: { id: true, name: true, color: true, type: true } } },
    });
    res.json({ budget });
  }),
);

router.delete(
  '/budgets/:id',
  asyncHandler(async (req, res) => {
    if (!req.user) throw HttpError.unauthorized();
    const { id } = req.params;
    await prisma.budget.deleteMany({ where: { id, userId: req.user.id } });
    res.status(204).send();
  }),
);

void subDays;

export default router;
