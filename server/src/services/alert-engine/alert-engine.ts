import {
  AlertSeverity,
  AlertType,
  type Alert,
  prisma,
} from '@bizlens/database';
import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { logger } from '../../config/logger';
import {
  formatMoney,
  formatPctChange,
  percentChange,
  shareOf,
  toSafeNumber,
} from '../../utils/safe-math';
import { signalEngine } from '../../intelligence/engine/signal-engine';
import type { FinancialSignal } from '../../intelligence/signals/signal.types';

// ─── Types ────────────────────────────────────────────────────────────────

export interface AlertAction {
  label: string;
  type: 'navigate' | 'filter';
  payload: Record<string, string>;
}

interface DraftAlert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  dedupeKey: string;
  expiresAt?: Date;
  action?: AlertAction;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const sumByType = async (
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  from: Date,
  to: Date,
): Promise<number> => {
  const r = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { userId, type, date: { gte: from, lte: to } },
  });
  return toSafeNumber(r._sum.amount);
};

interface CategoryTotal {
  categoryId: string;
  name: string;
  total: number;
  color: string | null;
}

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
  const cats = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
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

const week = (d: Date): string => {
  // Stable ISO week key for dedup, e.g. "2026-W16".
  const ref = startOfWeek(d, { weekStartsOn: 1 });
  // crude week-of-year — enough for dedup keys.
  const start = new Date(ref.getFullYear(), 0, 1);
  const diff = (ref.getTime() - start.getTime()) / 86400000;
  const wk = Math.ceil((diff + start.getDay() + 1) / 7);
  return `${ref.getFullYear()}-W${wk.toString().padStart(2, '0')}`;
};

const month = (d: Date): string => format(d, 'yyyy-MM');

// ─── Rules ────────────────────────────────────────────────────────────────

/** Spend spike: a single category's weekly spend > 50% above its 4-wk avg. */
const ruleSpendSpike = async (userId: string, now: Date, currency = 'USD', signals?: FinancialSignal[]): Promise<DraftAlert[]> => {
  // Signal-based path: use SPEND_SPIKE signals if available
  const spikeSignals = signals?.filter((s) => s.key === 'SPEND_SPIKE');
  if (spikeSignals && spikeSignals.length > 0) {
    const drafts: DraftAlert[] = [];
    for (const sig of spikeSignals) {
      const categoryName = (sig.metadata.categoryName as string) ?? 'Unknown';
      const changePct = (sig.metadata.changePct as number) ?? sig.value;
      const currentAmount = (sig.metadata.currentAmount as number) ?? 0;
      const baselineAvg = (sig.metadata.baselineAvg as number) ?? 0;
      const categoryId = (sig.metadata.categoryId as string) ?? '';
      const severity: AlertSeverity = changePct >= 100 ? 'CRITICAL' : 'WARNING';
      drafts.push({
        type: 'SPEND_SPIKE_CATEGORY',
        severity,
        title: `${categoryName} spending spiked`,
        message: `Your ${categoryName} spending increased by ${formatPctChange(
          changePct,
        )} this week (${formatMoney(currentAmount, currency)} vs ~${formatMoney(baselineAvg, currency)} weekly average).`,
        dedupeKey: `spend-spike:${categoryId}:${week(now)}`,
        expiresAt: endOfWeek(now, { weekStartsOn: 1 }),
        action: {
          label: `Review ${categoryName}`,
          type: 'filter',
          payload: { categoryId, type: 'EXPENSE' },
        },
      });
    }
    return drafts;
  }

  // Fallback: DB query logic
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const baseStart = startOfWeek(subWeeks(now, 4), { weekStartsOn: 1 });
  const baseEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const [thisCats, baseCats] = await Promise.all([
    categoryTotals(userId, 'EXPENSE', thisStart, thisEnd),
    categoryTotals(userId, 'EXPENSE', baseStart, baseEnd),
  ]);
  if (thisCats.length === 0 || baseCats.length === 0) return [];

  const baseAvg = new Map<string, number>();
  for (const c of baseCats) baseAvg.set(c.categoryId, c.total / 4);

  const drafts: DraftAlert[] = [];
  for (const c of thisCats) {
    const avg = baseAvg.get(c.categoryId);
    if (!avg || avg < 25) continue;
    const change = percentChange(c.total, avg);
    if (!change.hasComparison || change.pct < 50) continue;
    const severity: AlertSeverity = change.pct >= 100 ? 'CRITICAL' : 'WARNING';
    drafts.push({
      type: 'SPEND_SPIKE_CATEGORY',
      severity,
      title: `${c.name} spending spiked`,
      message: `Your ${c.name} spending increased by ${formatPctChange(
        change.pct,
      )} this week (${formatMoney(c.total, currency)} vs ~${formatMoney(avg, currency)} weekly average).`,
      dedupeKey: `spend-spike:${c.categoryId}:${week(now)}`,
      expiresAt: endOfWeek(now, { weekStartsOn: 1 }),
      action: {
        label: `Review ${c.name}`,
        type: 'filter',
        payload: { categoryId: c.categoryId, type: 'EXPENSE' },
      },
    });
  }
  return drafts;
};

/** Expenses exceed income for the current month — critical cashflow signal. */
const ruleSpendExceedsIncome = async (userId: string, now: Date, currency = 'USD'): Promise<DraftAlert | null> => {
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const [inc, exp] = await Promise.all([
    sumByType(userId, 'INCOME', start, end),
    sumByType(userId, 'EXPENSE', start, end),
  ]);
  if (inc === 0 && exp === 0) return null;
  if (exp <= inc) return null;
  const overBy = exp - inc;
  return {
    type: 'EXPENSES_EXCEED_INCOME',
    severity: 'CRITICAL',
    title: 'Expenses exceed income',
    message: `You're spending ${formatMoney(overBy, currency)} more than you earn this month (${formatMoney(
      exp, currency,
    )} out vs ${formatMoney(inc, currency)} in).`,
    dedupeKey: `spend-exceeds-income:${month(now)}`,
    expiresAt: endOfMonth(now),
    action: {
      label: 'View transactions',
      type: 'navigate',
      payload: { route: '/app/transactions' },
    },
  };
};

/** Profit dropped vs last month with a clear culprit category. */
const ruleProfitDrop = async (userId: string, now: Date, currency = 'USD', signals?: FinancialSignal[]): Promise<DraftAlert | null> => {
  // Signal-based path: use PROFIT_TREND signal if available with isDropping=true
  const profitSignal = signals?.find(
    (s) => s.key === 'PROFIT_TREND' && s.metadata.isDropping === true,
  );
  if (profitSignal) {
    const pct = profitSignal.value;
    const currentProfit = (profitSignal.metadata.currentProfit as number) ?? 0;
    const previousProfit = (profitSignal.metadata.previousProfit as number) ?? 0;
    if (Math.abs(pct) < 15) return null;
    const severity: AlertSeverity = Math.abs(pct) >= 30 ? 'CRITICAL' : 'WARNING';
    return {
      type: 'PROFIT_DROP',
      severity,
      title: 'Profit dropped',
      message: `Your profit is down ${formatPctChange(pct)} versus last month (${formatMoney(
        currentProfit, currency,
      )} vs ${formatMoney(previousProfit, currency)}) — review your top expenses.`,
      dedupeKey: `profit-drop:${month(now)}`,
      expiresAt: endOfMonth(now),
    };
  }

  // Fallback: DB query logic
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const [inc, exp, lastInc, lastExp] = await Promise.all([
    sumByType(userId, 'INCOME', thisStart, thisEnd),
    sumByType(userId, 'EXPENSE', thisStart, thisEnd),
    sumByType(userId, 'INCOME', lastStart, lastEnd),
    sumByType(userId, 'EXPENSE', lastStart, lastEnd),
  ]);
  const profit = inc - exp;
  const lastProfit = lastInc - lastExp;
  if (lastProfit <= 0) return null;
  if (profit >= lastProfit) return null;

  const change = percentChange(profit, lastProfit);
  if (!change.hasComparison || Math.abs(change.pct) < 15) return null;

  // Find the worst-growing expense category.
  const [thisCats, lastCats] = await Promise.all([
    categoryTotals(userId, 'EXPENSE', thisStart, thisEnd),
    categoryTotals(userId, 'EXPENSE', lastStart, lastEnd),
  ]);
  const lastById = new Map(lastCats.map((c) => [c.categoryId, c.total]));
  const growth = thisCats
    .map((c) => ({ ...c, growth: c.total - (lastById.get(c.categoryId) ?? 0) }))
    .sort((a, b) => b.growth - a.growth);
  const culprit = growth[0]?.growth > 0 ? growth[0] : null;

  const severity: AlertSeverity = Math.abs(change.pct) >= 30 ? 'CRITICAL' : 'WARNING';
  return {
    type: 'PROFIT_DROP',
    severity,
    title: 'Profit dropped',
    message: culprit
      ? `Your profit is down ${formatPctChange(change.pct)} versus last month, mainly because ${
          culprit.name
        } expenses grew by ${formatMoney(culprit.growth, currency)}.`
      : `Your profit is down ${formatPctChange(change.pct)} versus last month — review your top expenses.`,
    dedupeKey: `profit-drop:${month(now)}`,
    expiresAt: endOfMonth(now),
    ...(culprit && {
      action: {
        label: `Review ${culprit.name}`,
        type: 'filter' as const,
        payload: { categoryId: culprit.categoryId, type: 'EXPENSE' },
      },
    }),
  };
};

/** Concentration risk: one category > 50% of monthly spend. */
const ruleCategoryConcentration = async (
  userId: string,
  now: Date,
  currency = 'USD',
): Promise<DraftAlert | null> => {
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const cats = await categoryTotals(userId, 'EXPENSE', start, end);
  if (cats.length === 0) return null;
  const total = cats.reduce((acc, c) => acc + c.total, 0);
  const top = cats[0];
  const share = shareOf(top.total, total);
  if (share < 50) return null;
  return {
    type: 'CATEGORY_CONCENTRATION',
    severity: share >= 70 ? 'WARNING' : 'INFO',
    title: 'Concentrated spending',
    message: `${share}% of your monthly spend is on ${top.name}. Consider diversifying or optimizing this category.`,
    dedupeKey: `concentration:${top.categoryId}:${month(now)}`,
    expiresAt: endOfMonth(now),
    action: {
      label: `View ${top.name}`,
      type: 'filter',
      payload: { categoryId: top.categoryId, type: 'EXPENSE' },
    },
  };
};

/** Weekly spend up >25% vs last week. */
const ruleWeeklySpendIncrease = async (userId: string, now: Date, currency = 'USD', signals?: FinancialSignal[]): Promise<DraftAlert | null> => {
  // Signal-based path: use WEEKLY_SPEND_CHANGE signal if available with severity >= 'warning'
  const weeklySignal = signals?.find(
    (s) => s.key === 'WEEKLY_SPEND_CHANGE' && (s.severity === 'warning' || s.severity === 'critical'),
  );
  if (weeklySignal) {
    const thisWeek = (weeklySignal.metadata.thisWeek as number) ?? 0;
    const lastWeek = (weeklySignal.metadata.lastWeek as number) ?? 0;
    const changePct = (weeklySignal.metadata.changePct as number) ?? weeklySignal.value;
    return {
      type: 'WEEKLY_SPEND_INCREASE',
      severity: changePct >= 50 ? 'WARNING' : 'INFO',
      title: 'Weekly spending up',
      message: `Your spending is ${formatPctChange(changePct)} higher this week (${formatMoney(
        thisWeek, currency,
      )} vs ${formatMoney(lastWeek, currency)} last week).`,
      dedupeKey: `weekly-spend-up:${week(now)}`,
      expiresAt: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }

  // Fallback: DB query logic
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const [thisExp, lastExp] = await Promise.all([
    sumByType(userId, 'EXPENSE', thisStart, thisEnd),
    sumByType(userId, 'EXPENSE', lastStart, lastEnd),
  ]);
  const change = percentChange(thisExp, lastExp);
  if (!change.hasComparison || change.pct < 25) return null;
  return {
    type: 'WEEKLY_SPEND_INCREASE',
    severity: change.pct >= 50 ? 'WARNING' : 'INFO',
    title: 'Weekly spending up',
    message: `Your spending is ${formatPctChange(change.pct)} higher this week (${formatMoney(
      thisExp, currency,
    )} vs ${formatMoney(lastExp, currency)} last week).`,
    dedupeKey: `weekly-spend-up:${week(now)}`,
    expiresAt: endOfWeek(now, { weekStartsOn: 1 }),
  };
};

/** Stale data: no transactions in last 3 days but the user has past activity. */
const ruleStaleData = async (userId: string, now: Date): Promise<DraftAlert | null> => {
  const last = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });
  if (!last) return null;
  const days = differenceInCalendarDays(now, last.date);
  if (days < 3) return null;
  // Require at least 5 historical transactions so we don't nag brand-new users.
  const total = await prisma.transaction.count({ where: { userId } });
  if (total < 5) return null;

  // Bucket by 3-day windows so we don't recreate every minute.
  const bucket = Math.floor(days / 3) * 3;
  return {
    type: 'STALE_DATA',
    severity: days >= 7 ? 'WARNING' : 'INFO',
    title: 'Time to log new transactions',
    message:
      days >= 7
        ? `It's been ${days} days since your last transaction. Update your data to keep insights accurate.`
        : `You haven't logged a transaction in ${days} days — add the latest to keep trends fresh.`,
    dedupeKey: `stale-data:${bucket}d:${format(now, 'yyyy-MM-dd')}`,
    expiresAt: subDays(now, -3),
    action: {
      label: 'Add transaction',
      type: 'navigate',
      payload: { route: '/app/transactions', openQuickAdd: 'true' },
    },
  };
};

/**
 * Forecast: if the daily spend rate continues, project month-end and warn when
 * the run-rate exceeds last month's expense by ≥ 15%.
 */
const ruleForecastOverspend = async (userId: string, now: Date, currency = 'USD', signals?: FinancialSignal[]): Promise<DraftAlert | null> => {
  // Signal-based path: use PROJECTED_EXPENSE signal if available with isOverspending=true
  const forecastSignal = signals?.find(
    (s) => s.key === 'PROJECTED_EXPENSE' && s.metadata.isOverspending === true,
  );
  if (forecastSignal) {
    const vsLastMonth = (forecastSignal.metadata.vsLastMonth as number) ?? forecastSignal.value;
    const projected = (forecastSignal.metadata.projected as number) ?? forecastSignal.value;
    const dayOfMonth = Math.max(1, now.getDate());
    // Only meaningful past the first week of the month.
    if (dayOfMonth < 7) return null;
    return {
      type: 'FORECAST_OVERSPEND',
      severity: vsLastMonth >= 40 ? 'WARNING' : 'INFO',
      title: 'On track to overspend',
      message: `If you continue at this rate, you'll spend about ${formatMoney(
        projected, currency,
      )} this month — ${formatPctChange(vsLastMonth)} versus last month.`,
      dedupeKey: `forecast-overspend:${month(now)}:${Math.floor(dayOfMonth / 7)}`,
      expiresAt: endOfMonth(now),
    };
  }

  // Fallback: DB query logic
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const exp = await sumByType(userId, 'EXPENSE', start, now);
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = end.getDate();
  const projected = (exp / dayOfMonth) * daysInMonth;

  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));
  const lastExp = await sumByType(userId, 'EXPENSE', lastStart, lastEnd);
  if (lastExp === 0) return null;

  const change = percentChange(projected, lastExp);
  if (!change.hasComparison || change.pct < 15) return null;
  // Only meaningful past the first week of the month.
  if (dayOfMonth < 7) return null;

  return {
    type: 'FORECAST_OVERSPEND',
    severity: change.pct >= 40 ? 'WARNING' : 'INFO',
    title: 'On track to overspend',
    message: `If you continue at this rate, you'll spend about ${formatMoney(
      projected, currency,
    )} this month — ${formatPctChange(change.pct)} versus last month.`,
    dedupeKey: `forecast-overspend:${month(now)}:${Math.floor(dayOfMonth / 7)}`,
    expiresAt: endOfMonth(now),
  };
};

/**
 * Recurring detection: same {category, amount±5%} appearing on similar days
 * for 3 consecutive months → likely subscription.
 */
const ruleRecurringDetected = async (userId: string, now: Date, currency = 'USD'): Promise<DraftAlert[]> => {
  const start = startOfMonth(subMonths(now, 3));
  const txns = await prisma.transaction.findMany({
    where: { userId, type: 'EXPENSE', date: { gte: start, lte: now } },
    select: { id: true, amount: true, categoryId: true, category: { select: { name: true } }, date: true },
  });
  if (txns.length < 9) return [];

  // Group by (categoryId, rounded amount bucket).
  const buckets = new Map<string, { name: string; categoryId: string; months: Set<string>; amount: number }>();
  for (const t of txns) {
    const amt = toSafeNumber(t.amount);
    if (amt < 5) continue;
    // Bucket amounts into ~5% bins.
    const bucket = Math.round(amt / Math.max(1, amt * 0.05));
    const key = `${t.categoryId}:${bucket}`;
    const m = format(t.date, 'yyyy-MM');
    const existing = buckets.get(key);
    if (existing) existing.months.add(m);
    else
      buckets.set(key, {
        name: t.category.name,
        categoryId: t.categoryId,
        months: new Set([m]),
        amount: amt,
      });
  }

  const drafts: DraftAlert[] = [];
  for (const b of buckets.values()) {
    if (b.months.size < 3) continue;
    drafts.push({
      type: 'RECURRING_DETECTED',
      severity: 'INFO',
      title: 'Recurring expense detected',
      message: `${b.name} of about ${formatMoney(b.amount, currency)} repeats monthly — looks like a subscription you can review.`,
      dedupeKey: `recurring:${b.categoryId}:${Math.round(b.amount)}`,
      expiresAt: endOfMonth(now),
      action: {
        label: `Open ${b.name}`,
        type: 'filter',
        payload: { categoryId: b.categoryId, type: 'EXPENSE' },
      },
    });
  }
  return drafts;
};

// ─── Persistence ──────────────────────────────────────────────────────────

const persist = async (userId: string, drafts: DraftAlert[]): Promise<Alert[]> => {
  if (drafts.length === 0) return [];

  // Upsert each — idempotent on (userId, dedupeKey).
  const results = await Promise.all(
    drafts.map((d) =>
      prisma.alert.upsert({
        where: { userId_dedupeKey: { userId, dedupeKey: d.dedupeKey } },
        update: {
          // Re-surface previously dismissed alerts only if their content meaningfully changed.
          severity: d.severity,
          message: d.message,
          title: d.title,
          actionJson: d.action ? JSON.stringify(d.action) : null,
          expiresAt: d.expiresAt ?? null,
        },
        create: {
          userId,
          type: d.type,
          severity: d.severity,
          title: d.title,
          message: d.message,
          actionJson: d.action ? JSON.stringify(d.action) : null,
          dedupeKey: d.dedupeKey,
          expiresAt: d.expiresAt ?? null,
        },
      }),
    ),
  );
  return results;
};

// ─── Public API ───────────────────────────────────────────────────────────

export const alertEngine = {
  /**
   * Evaluate all rules for a user and persist any new alerts. Idempotent —
   * same input data within the same dedup window produces no new rows.
   * Designed to be called:
   *   - on transaction create / update / delete
   *   - on dashboard fetch (cheap rate-limited refresh)
   *   - on a daily cron
   */
  async evaluate(userId: string, at: Date = new Date()): Promise<Alert[]> {
    // Fetch user currency for monetary formatting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });
    const currency = user?.currency ?? 'USD';

    // Fetch signals from signal engine for signal-consuming rules
    let signals: FinancialSignal[] = [];
    try {
      signals = await signalEngine.getSignals(userId);
    } catch (err) {
      logger.warn('alert-engine:signal-fetch-failed', {
        userId,
        message: err instanceof Error ? err.message : String(err),
      });
      // Continue with empty signals — rules will fall back to DB queries
    }

    const [
      spike,
      exceeds,
      profitDrop,
      concentration,
      weeklyUp,
      stale,
      forecast,
      recurring,
    ] = await Promise.all([
      ruleSpendSpike(userId, at, currency, signals),
      ruleSpendExceedsIncome(userId, at, currency),
      ruleProfitDrop(userId, at, currency, signals),
      ruleCategoryConcentration(userId, at, currency),
      ruleWeeklySpendIncrease(userId, at, currency, signals),
      ruleStaleData(userId, at),
      ruleForecastOverspend(userId, at, currency, signals),
      ruleRecurringDetected(userId, at, currency),
    ]);

    const drafts: DraftAlert[] = [
      ...spike,
      ...(exceeds ? [exceeds] : []),
      ...(profitDrop ? [profitDrop] : []),
      ...(concentration ? [concentration] : []),
      ...(weeklyUp ? [weeklyUp] : []),
      ...(stale ? [stale] : []),
      ...(forecast ? [forecast] : []),
      ...recurring,
    ];

    return persist(userId, drafts);
  },

  /** Returns the user's active alerts, newest first. */
  async list(userId: string): Promise<Alert[]> {
    const now = new Date();
    return prisma.alert.findMany({
      where: {
        userId,
        isDismissed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    });
  },

  async unreadCount(userId: string): Promise<number> {
    const now = new Date();
    return prisma.alert.count({
      where: {
        userId,
        isRead: false,
        isDismissed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
  },

  async markRead(userId: string, id: string): Promise<void> {
    await prisma.alert.updateMany({ where: { id, userId }, data: { isRead: true } });
  },

  async markAllRead(userId: string): Promise<void> {
    await prisma.alert.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  },

  async dismiss(userId: string, id: string): Promise<void> {
    await prisma.alert.updateMany({
      where: { id, userId },
      data: { isDismissed: true, isRead: true },
    });
  },
};

/**
 * Fire-and-forget evaluator: log errors but never throw. Use after mutations
 * so a failing rule never blocks user-visible work.
 */
export const evaluateInBackground = (userId: string): void => {
  alertEngine.evaluate(userId).catch((err: unknown) => {
    logger.error('alert-engine-failed', {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
  });
};
