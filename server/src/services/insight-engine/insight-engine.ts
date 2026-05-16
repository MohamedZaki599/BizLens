import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';
import type { Prisma } from '@bizlens/database';
import { prisma } from '@bizlens/database';
import {
  formatMoney,
  formatPctChange,
  percentChange,
  shareOf,
  toSafeNumber,
} from '../../utils/safe-math';
import type { LocalizationKey } from '../../intelligence/localization/key-registry';

// ─── Types ────────────────────────────────────────────────────────────────

export type InsightTone = 'positive' | 'negative' | 'neutral' | 'warning';
export type InsightSeverity = 'info' | 'success' | 'warning' | 'critical';

/** A category we surface in actionable copy. */
export interface InsightAction {
  label: string;
  type: 'navigate' | 'filter';
  payload: Record<string, string>;
}

export interface Insight {
  id: string;
  /** Stable insight kind for analytics & deduping. */
  kind:
    | 'weekly-comparison'
    | 'monthly-comparison'
    | 'top-expense'
    | 'top-income'
    | 'profit-trend'
    | 'spending-anomaly'
    | 'budget-share'
    | 'first-data';
  /**
   * @deprecated Use `localized.titleKey` with interpolation params instead. Removal target: v0.3.0
   */
  title: string;
  /**
   * @deprecated Use `localized.messageKey` with interpolation params instead. Removal target: v0.3.0
   */
  message: string;
  tone: InsightTone;
  severity: InsightSeverity;
  /** Short headline metric (e.g. "+24%", "Marketing", "$1,240"). */
  metric?: string;
  /** Optional CTA payload — frontend renders as button if present. */
  action?: InsightAction;
  /** Lower number = higher priority. The primary insight has the lowest. */
  priority: number;
  /** Localized payload with semantic translation keys and raw params. */
  localized?: {
    titleKey: LocalizationKey;
    titleParams: Record<string, number | string>;
    messageKey: LocalizationKey;
    messageParams: Record<string, number | string>;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────

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

interface CategoryTotal {
  categoryId: string;
  name: string;
  total: number;
  type: 'INCOME' | 'EXPENSE';
  color: string | null;
}

const totalsByCategory = async (
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

  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });
  const byId = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map<CategoryTotal>((g) => ({
      categoryId: g.categoryId,
      name: byId.get(g.categoryId)?.name ?? 'Unknown',
      color: byId.get(g.categoryId)?.color ?? null,
      total: toSafeNumber(g._sum.amount),
      type,
    }))
    .sort((a, b) => b.total - a.total);
};

// ─── Insight generators ───────────────────────────────────────────────────

/** 
 * #1 Weekly comparison — week-over-week movement on the more volatile side.
 * @deprecated Overlaps with WEEKLY_SPEND_CHANGE signal generator.
 * // TODO: consolidate with signal engine — this generator computes the same
 * // week-over-week expense/income change that the WEEKLY_SPEND_CHANGE signal
 * // already provides. Kept for now because /insights has a different response format.
 */
const weeklyComparison = async (userId: string, _currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const [thisExp, lastExp, thisInc, lastInc] = await Promise.all([
    sumByType(userId, 'EXPENSE', thisStart, thisEnd),
    sumByType(userId, 'EXPENSE', lastStart, lastEnd),
    sumByType(userId, 'INCOME', thisStart, thisEnd),
    sumByType(userId, 'INCOME', lastStart, lastEnd),
  ]);

  if (thisExp + lastExp + thisInc + lastInc === 0) return null;

  const expChange = percentChange(thisExp, lastExp);
  const incChange = percentChange(thisInc, lastInc);

  // Pick the more meaningful side; never report when no comparison is possible.
  if (expChange.hasComparison && Math.abs(expChange.pct) >= Math.abs(incChange.pct)) {
    const tone: InsightTone = expChange.direction === 'up' ? 'warning' : 'positive';
    return {
      id: 'weekly-expense',
      kind: 'weekly-comparison',
      title: 'Weekly spending pulse',
      message:
        expChange.direction === 'flat'
          ? 'Your weekly spending is steady versus last week.'
          : `Your expenses are ${expChange.direction} ${formatPctChange(
              expChange.pct,
            )} versus last week.`,
      tone,
      severity: expChange.direction === 'up' && expChange.pct > 25 ? 'warning' : 'info',
      metric: formatPctChange(expChange.pct),
      priority: 30,
      localized: {
        titleKey: 'insights.weekly_comparison.title' as LocalizationKey,
        titleParams: { direction: expChange.direction },
        messageKey: 'insights.weekly_comparison.message' as LocalizationKey,
        messageParams: {
          direction: expChange.direction,
          changePct: expChange.pct,
          thisAmount: thisExp,
          lastAmount: lastExp,
          side: 'expense',
        },
      },
    };
  }

  if (incChange.hasComparison) {
    const tone: InsightTone =
      incChange.direction === 'up' ? 'positive' : incChange.direction === 'down' ? 'negative' : 'neutral';
    return {
      id: 'weekly-income',
      kind: 'weekly-comparison',
      title: 'Weekly revenue pulse',
      message:
        incChange.direction === 'flat'
          ? 'Your weekly income is steady versus last week.'
          : `Your income is ${incChange.direction} ${formatPctChange(
              incChange.pct,
            )} versus last week.`,
      tone,
      severity: 'info',
      metric: formatPctChange(incChange.pct),
      priority: 35,
      localized: {
        titleKey: 'insights.weekly_comparison.title' as LocalizationKey,
        titleParams: { direction: incChange.direction },
        messageKey: 'insights.weekly_comparison.message' as LocalizationKey,
        messageParams: {
          direction: incChange.direction,
          changePct: incChange.pct,
          thisAmount: thisInc,
          lastAmount: lastInc,
          side: 'income',
        },
      },
    };
  }

  // Have data this week, but nothing last week → no comparison; surface raw fact.
  return {
    id: 'weekly-debut',
    kind: 'first-data',
    title: 'No data to compare yet',
    message: 'Keep logging — week-over-week trends unlock once you have a full week of history.',
    tone: 'neutral',
    severity: 'info',
    priority: 90,
  };
};

/** #2 Monthly comparison — this-month vs last-month profit & spend. */
const monthlyComparison = async (userId: string, currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const [thisExp, lastExp] = await Promise.all([
    sumByType(userId, 'EXPENSE', thisStart, thisEnd),
    sumByType(userId, 'EXPENSE', lastStart, lastEnd),
  ]);

  if (thisExp === 0 && lastExp === 0) return null;

  const change = percentChange(thisExp, lastExp);
  if (!change.hasComparison) {
    return {
      id: 'monthly-debut',
      kind: 'monthly-comparison',
      title: 'Monthly trend',
      message: `You've spent ${formatMoney(thisExp, currency)} this month so far. Last month had no recorded spend to compare against.`,
      tone: 'neutral',
      severity: 'info',
      metric: formatMoney(thisExp, currency),
      priority: 50,
      localized: {
        titleKey: 'insights.monthly_comparison.title' as LocalizationKey,
        titleParams: { direction: 'flat' },
        messageKey: 'insights.monthly_comparison.message' as LocalizationKey,
        messageParams: { thisAmount: thisExp, lastAmount: lastExp, direction: 'flat' },
      },
    };
  }

  const tone: InsightTone =
    change.direction === 'up' ? 'warning' : change.direction === 'down' ? 'positive' : 'neutral';
  const severity: InsightSeverity = change.pct > 30 ? 'warning' : 'info';

  // WHY: identify the category whose change drove the most of the swing.
  let culpritName: string | null = null;
  let culpritId: string | null = null;
  if (change.direction !== 'flat') {
    const [thisCats, lastCats] = await Promise.all([
      totalsByCategory(userId, 'EXPENSE', thisStart, thisEnd),
      totalsByCategory(userId, 'EXPENSE', lastStart, lastEnd),
    ]);
    const lastById = new Map(lastCats.map((c) => [c.categoryId, c.total]));
    const swings = thisCats
      .map((c) => ({ ...c, swing: c.total - (lastById.get(c.categoryId) ?? 0) }))
      .sort((a, b) => (change.direction === 'up' ? b.swing - a.swing : a.swing - b.swing));
    const top = swings[0];
    if (top && Math.abs(top.swing) > 0) {
      culpritName = top.name;
      culpritId = top.categoryId;
    }
  }

  return {
    id: 'monthly-expense',
    kind: 'monthly-comparison',
    title: 'Monthly spending trend',
    message:
      change.direction === 'flat'
        ? 'Your monthly spending is in line with last month.'
        : culpritName
          ? `Your spending is ${change.direction} ${formatPctChange(change.pct)} versus last month, mainly because of ${culpritName}.`
          : `Your monthly spending is ${change.direction} ${formatPctChange(change.pct)} versus last month.`,
    tone,
    severity,
    metric: formatPctChange(change.pct),
    ...(culpritId
      ? {
          action: {
            label: `Review ${culpritName}`,
            type: 'filter' as const,
            payload: { categoryId: culpritId, type: 'EXPENSE' },
          },
        }
      : {}),
    priority: 25,
    localized: {
      titleKey: 'insights.monthly_comparison.title' as LocalizationKey,
      titleParams: { direction: change.direction },
      messageKey: 'insights.monthly_comparison.message' as LocalizationKey,
      messageParams: {
        direction: change.direction,
        changePct: change.pct,
        thisAmount: thisExp,
        lastAmount: lastExp,
        ...(culpritName ? { categoryName: culpritName } : {}),
      },
    },
  };
};

/** #3 Top expense category — actionable, with budget share. */
const topExpense = async (userId: string, _currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const totals = await totalsByCategory(userId, 'EXPENSE', start, end);
  if (totals.length === 0) return null;

  const top = totals[0];
  const totalExpense = totals.reduce((acc, c) => acc + c.total, 0);
  const share = shareOf(top.total, totalExpense);

  const high = share >= 40;
  const message = high
    ? `You're spending ${share}% of your budget on ${top.name} — consider optimizing this category.`
    : `${top.name} is your largest expense category this month at ${share}% of total spend.`;

  return {
    id: 'top-expense',
    kind: 'top-expense',
    title: high ? 'Concentrated spending' : 'Largest expense',
    message,
    tone: high ? 'warning' : 'neutral',
    severity: high ? 'warning' : 'info',
    metric: `${top.name} · ${share}%`,
    action: {
      label: `View ${top.name}`,
      type: 'filter',
      payload: { categoryId: top.categoryId, type: 'EXPENSE' },
    },
    priority: high ? 15 : 40,
    localized: {
      titleKey: 'insights.top_expense.title' as LocalizationKey,
      titleParams: { categoryName: top.name },
      messageKey: 'insights.top_expense.message' as LocalizationKey,
      messageParams: {
        categoryName: top.name,
        sharePct: share,
        amount: top.total,
        totalExpense,
      },
    },
  };
};

/** #3b Top income — surfaces the engine of growth. */
const topIncome = async (userId: string, _currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const totals = await totalsByCategory(userId, 'INCOME', start, end);
  if (totals.length === 0) return null;

  const top = totals[0];
  const total = totals.reduce((acc, c) => acc + c.total, 0);
  const share = shareOf(top.total, total);

  return {
    id: 'top-income',
    kind: 'top-income',
    title: 'Top earning category',
    message: `${top.name} drives ${share}% of your revenue this month — your strongest engine.`,
    tone: 'positive',
    severity: 'success',
    metric: `${top.name} · ${share}%`,
    action: {
      label: `View ${top.name}`,
      type: 'filter',
      payload: { categoryId: top.categoryId, type: 'INCOME' },
    },
    priority: 45,
    localized: {
      titleKey: 'insights.top_income.title' as LocalizationKey,
      titleParams: { categoryName: top.name },
      messageKey: 'insights.top_income.message' as LocalizationKey,
      messageParams: {
        categoryName: top.name,
        sharePct: share,
        amount: top.total,
        totalIncome: total,
      },
    },
  };
};

/**
 * #4 Profit trend — month-over-month change.
 * @deprecated Overlaps with PROFIT_TREND signal generator.
 * // TODO: consolidate with signal engine — this generator computes the same
 * // month-over-month profit change that the PROFIT_TREND signal already provides.
 * // Kept for now because /insights has a different response format.
 */
const profitTrend = async (userId: string, currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const [thisInc, thisExp, lastInc, lastExp] = await Promise.all([
    sumByType(userId, 'INCOME', thisStart, thisEnd),
    sumByType(userId, 'EXPENSE', thisStart, thisEnd),
    sumByType(userId, 'INCOME', lastStart, lastEnd),
    sumByType(userId, 'EXPENSE', lastStart, lastEnd),
  ]);

  const thisProfit = thisInc - thisExp;
  const lastProfit = lastInc - lastExp;

  if (thisProfit === 0 && lastProfit === 0) return null;

  const change = percentChange(thisProfit, lastProfit);

  // No prior baseline → state the absolute number and skip percent.
  if (!change.hasComparison) {
    const tone: InsightTone = thisProfit >= 0 ? 'positive' : 'negative';
    return {
      id: 'profit-debut',
      kind: 'profit-trend',
      title: 'Monthly profit',
      message: `Your profit so far this month is ${formatMoney(thisProfit, currency)}.`,
      tone,
      severity: thisProfit < 0 ? 'warning' : 'info',
      metric: formatMoney(thisProfit, currency),
      priority: 20,
      localized: {
        titleKey: 'insights.profit_trend.title' as LocalizationKey,
        titleParams: { direction: 'flat' },
        messageKey: 'insights.profit_trend.message' as LocalizationKey,
        messageParams: { thisProfit, thisIncome: thisInc, thisExpense: thisExp },
      },
    };
  }

  // Detect an actionable drop.
  const dropped = thisProfit < lastProfit;
  const tone: InsightTone = dropped ? 'negative' : 'positive';
  const severity: InsightSeverity =
    dropped && Math.abs(change.pct) > 20 ? 'warning' : dropped ? 'info' : 'success';

  let actionLabel: string | undefined;
  let actionPayload: Record<string, string> | undefined;
  if (dropped) {
    // Find the category whose spend grew the most → recommend it for review.
    const [thisExpCats, lastExpCats] = await Promise.all([
      totalsByCategory(userId, 'EXPENSE', thisStart, thisEnd),
      totalsByCategory(userId, 'EXPENSE', lastStart, lastEnd),
    ]);
    const lastById = new Map(lastExpCats.map((c) => [c.categoryId, c.total]));
    const growth = thisExpCats
      .map((c) => ({ ...c, growth: c.total - (lastById.get(c.categoryId) ?? 0) }))
      .sort((a, b) => b.growth - a.growth);
    const culprit = growth[0];
    if (culprit && culprit.growth > 0) {
      actionLabel = `Review ${culprit.name}`;
      actionPayload = { categoryId: culprit.categoryId, type: 'EXPENSE' };
    }
  }

  return {
    id: 'profit-trend',
    kind: 'profit-trend',
    title: dropped ? 'Profit dropped' : 'Profit trending up',
    message: dropped
      ? `Your profit is down ${formatPctChange(change.pct)} versus last month${
          actionLabel ? ` — biggest expense growth came from ${actionLabel.replace('Review ', '')}.` : '.'
        }`
      : `Your profit is up ${formatPctChange(change.pct)} versus last month — keep it going.`,
    tone,
    severity,
    metric: formatPctChange(change.pct),
    ...(actionLabel && actionPayload
      ? { action: { label: actionLabel, type: 'filter', payload: actionPayload } }
      : {}),
    priority: dropped && Math.abs(change.pct) > 20 ? 10 : 20,
    localized: {
      titleKey: 'insights.profit_trend.title' as LocalizationKey,
      titleParams: { direction: change.direction },
      messageKey: 'insights.profit_trend.message' as LocalizationKey,
      messageParams: {
        direction: change.direction,
        changePct: change.pct,
        thisProfit,
        lastProfit,
        ...(actionPayload ? { categoryName: actionLabel!.replace('Review ', '') } : {}),
      },
    },
  };
};

/**
 * #5 Spending anomaly — flags a category whose this-month spend is dramatically
 * higher than its 3-month average (excluding categories with no history).
 * @deprecated Overlaps with SPENDING_ANOMALY signal generator.
 * // TODO: consolidate with signal engine — this generator computes the same
 * // baseline-vs-current anomaly detection that the SPENDING_ANOMALY signal
 * // already provides. Kept for now because /insights has a different response format.
 */
const spendingAnomaly = async (userId: string, _currency = 'USD'): Promise<Insight | null> => {
  const now = new Date();
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const baselineStart = startOfMonth(subMonths(now, 3));
  const baselineEnd = endOfMonth(subMonths(now, 1));

  const [thisCats, baselineCats] = await Promise.all([
    totalsByCategory(userId, 'EXPENSE', thisStart, thisEnd),
    totalsByCategory(userId, 'EXPENSE', baselineStart, baselineEnd),
  ]);
  if (thisCats.length === 0 || baselineCats.length === 0) return null;

  // Average per month over the baseline window (3 months).
  const baselineAvgById = new Map<string, number>();
  for (const c of baselineCats) baselineAvgById.set(c.categoryId, c.total / 3);

  const anomalies = thisCats
    .map((c) => {
      const baseline = baselineAvgById.get(c.categoryId) ?? 0;
      // Need a meaningful baseline to call something an "anomaly".
      if (baseline < 25) return null;
      const change = percentChange(c.total, baseline);
      if (!change.hasComparison) return null;
      return { ...c, baseline, pct: change.pct };
    })
    .filter((x): x is CategoryTotal & { baseline: number; pct: number } => x !== null)
    .filter((x) => x.pct >= 50)
    .sort((a, b) => b.pct - a.pct);

  const top = anomalies[0];
  if (!top) return null;

  const severity: InsightSeverity = top.pct >= 100 ? 'critical' : 'warning';
  return {
    id: 'spending-anomaly',
    kind: 'spending-anomaly',
    title: 'Unusual spending detected',
    message: `${top.name} is ${formatPctChange(top.pct)} above its 3-month average — worth a closer look.`,
    tone: 'warning',
    severity,
    metric: `${top.name} · ${formatPctChange(top.pct)}`,
    action: {
      label: `Review ${top.name}`,
      type: 'filter',
      payload: { categoryId: top.categoryId, type: 'EXPENSE' },
    },
    priority: severity === 'critical' ? 5 : 12,
    localized: {
      titleKey: 'insights.spending_anomaly.title' as LocalizationKey,
      titleParams: { categoryName: top.name },
      messageKey: 'insights.spending_anomaly.message' as LocalizationKey,
      messageParams: {
        categoryName: top.name,
        changePct: top.pct,
        currentAmount: top.total,
        baselineAvg: top.baseline,
      },
    },
  };
};

// ─── Public API ───────────────────────────────────────────────────────────

export const insightEngine = {
  /**
   * Generates a prioritized, deduped list of insights.
   * The frontend treats `insights[0]` as the primary insight and renders the
   * rest as secondary cards.
   *
   * Insights are intentionally pinned to fixed comparison windows
   * (this-month vs last-month, this-week vs last-week, 3-month baseline) so
   * comparisons stay meaningful regardless of the dashboard's selected range.
   * The `/insights` route therefore does not forward a `range` parameter.
   */
  async generate(userId: string, currency = 'USD'): Promise<Insight[]> {
    const candidates = await Promise.all([
      spendingAnomaly(userId, currency),
      profitTrend(userId, currency),
      topExpense(userId, currency),
      monthlyComparison(userId, currency),
      weeklyComparison(userId, currency),
      topIncome(userId, currency),
    ]);

    const sorted = candidates
      .filter((i): i is Insight => i !== null)
      .sort((a, b) => a.priority - b.priority);

    // Dedupe by kind so we don't show two profit-trend insights, etc.
    const seen = new Set<string>();
    const unique: Insight[] = [];
    for (const i of sorted) {
      if (seen.has(i.kind)) continue;
      seen.add(i.kind);
      unique.push(i);
    }

    return unique.slice(0, 5);
  },
};

export type { Prisma };
