import { Prisma } from '@prisma/client';
import { format, startOfMonth, subMonths } from 'date-fns';
import { prisma } from '../../config/prisma';
import { toSafeNumber } from '../../utils/safe-math';

/**
 * Heuristic recurring-charge detector.
 *
 * We bucket transactions by `(category, ~$0.05 amount bucket, lowercased
 * description)` and treat any bucket that appears in 3+ distinct months over
 * the last 6 months as a likely subscription.
 *
 * This is intentionally simple — anything fancier (e.g. fuzzy merchant
 * matching) belongs in its own service once we have real bank-feed data.
 */
const MIN_AMOUNT = 3;
const MIN_MONTHS = 3;
const LOOKBACK_MONTHS = 5;

interface Bucket {
  name: string;
  categoryId: string;
  category: { id: string; name: string; color: string | null };
  description: string | null;
  amount: number;
  months: Set<string>;
  lastDate: Date;
}

export const detectSubscriptions = async (userId: string) => {
  const now = new Date();
  const start = startOfMonth(subMonths(now, LOOKBACK_MONTHS));

  const txns = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', date: { gte: start } },
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

  const buckets = new Map<string, Bucket>();

  for (const t of txns) {
    const amt = toSafeNumber(t.amount as unknown as Prisma.Decimal);
    if (amt < MIN_AMOUNT) continue;
    const bucket = Math.round(amt * 20) / 20;
    const key = `${t.categoryId}:${bucket}:${(t.description ?? '').toLowerCase().trim()}`;
    const month = format(t.date, 'yyyy-MM');
    const existing = buckets.get(key);
    if (existing) {
      existing.months.add(month);
      if (t.date > existing.lastDate) existing.lastDate = t.date;
    } else {
      buckets.set(key, {
        name: t.description || t.category.name,
        categoryId: t.categoryId,
        category: t.category,
        description: t.description,
        amount: amt,
        months: new Set([month]),
        lastDate: t.date,
      });
    }
  }

  const subscriptions = Array.from(buckets.values())
    .filter((b) => b.months.size >= MIN_MONTHS)
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

  return { subscriptions, totalMonthly, totalAnnual };
};
