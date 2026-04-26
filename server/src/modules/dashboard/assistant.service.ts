import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { prisma } from '../../config/prisma';
import {
  formatMoney,
  formatPctChange,
  percentChange,
  toSafeNumber,
} from '../../utils/safe-math';
import { aggregateByType } from './dashboard.service';
import { detectSubscriptions } from './subscriptions.service';

/**
 * Decision Assistant — produces a small, prioritized digest of plain-language
 * notes ("what changed this week", "where profit dropped", "what to look at
 * first"). Lives in its own service so the API/UI surface stays thin.
 *
 * Each note is intentionally short and actionable; the client renders them as
 * a stacked summary card and uses the optional `action` to deep-link into the
 * filtered transaction view.
 */

export type AssistantTone = 'positive' | 'neutral' | 'warning' | 'negative';
export type AssistantPriority = 'high' | 'normal';

export interface AssistantAction {
  label: string;
  type: 'filter' | 'navigate';
  payload: Record<string, string>;
}

export interface AssistantNote {
  id: string;
  kind:
    | 'weekly-pulse'
    | 'profit-trend'
    | 'expense-driver'
    | 'subscriptions'
    | 'stale-data'
    | 'forecast';
  title: string;
  message: string;
  metric?: string;
  tone: AssistantTone;
  priority: AssistantPriority;
  action?: AssistantAction;
}

export interface AssistantDigest {
  generatedAt: Date;
  headline: string;
  notes: AssistantNote[];
}

const HIGH_PRIORITY_KINDS = new Set<AssistantNote['kind']>([
  'profit-trend',
  'expense-driver',
  'forecast',
]);

/** Sort: high-priority first, then by tone severity (warning/negative first). */
const TONE_WEIGHT: Record<AssistantTone, number> = {
  negative: 0,
  warning: 1,
  neutral: 2,
  positive: 3,
};

const orderNotes = (notes: AssistantNote[]): AssistantNote[] =>
  [...notes].sort((a, b) => {
    const pa = a.priority === 'high' ? 0 : 1;
    const pb = b.priority === 'high' ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return TONE_WEIGHT[a.tone] - TONE_WEIGHT[b.tone];
  });

const weeklyPulse = async (userId: string, now: Date): Promise<AssistantNote | null> => {
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
  const lastEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  const [thisExp, thisInc, lastExp, lastInc] = await Promise.all([
    aggregateByType(userId, 'EXPENSE', thisStart, thisEnd),
    aggregateByType(userId, 'INCOME', thisStart, thisEnd),
    aggregateByType(userId, 'EXPENSE', lastStart, lastEnd),
    aggregateByType(userId, 'INCOME', lastStart, lastEnd),
  ]);

  if (thisExp + thisInc + lastExp + lastInc === 0) return null;

  const profit = thisInc - thisExp;
  const lastProfit = lastInc - lastExp;
  const change = percentChange(profit, lastProfit);

  let tone: AssistantTone = 'neutral';
  if (change.hasComparison) {
    if (profit < 0 && profit < lastProfit) tone = 'negative';
    else if (change.direction === 'down') tone = 'warning';
    else if (change.direction === 'up') tone = 'positive';
  } else if (profit < 0) {
    tone = 'warning';
  } else if (profit > 0) {
    tone = 'positive';
  }

  const message = change.hasComparison
    ? change.direction === 'flat'
      ? `Profit this week is roughly flat at ${formatMoney(profit)}.`
      : `You're ${change.direction === 'up' ? 'up' : 'down'} ${formatPctChange(
          change.pct,
        )} versus last week — profit ${
          profit >= 0 ? 'of' : 'down'
        } ${formatMoney(Math.abs(profit))}.`
    : `So far this week you're at ${formatMoney(profit)} profit (${formatMoney(
        thisInc,
      )} in, ${formatMoney(thisExp)} out).`;

  return {
    id: 'weekly-pulse',
    kind: 'weekly-pulse',
    title: 'This week so far',
    message,
    metric: change.hasComparison ? formatPctChange(change.pct) : formatMoney(profit),
    tone,
    priority: 'normal',
  };
};

const profitTrend = async (userId: string, now: Date): Promise<AssistantNote | null> => {
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const [thisInc, thisExp, lastInc, lastExp] = await Promise.all([
    aggregateByType(userId, 'INCOME', thisStart, thisEnd),
    aggregateByType(userId, 'EXPENSE', thisStart, thisEnd),
    aggregateByType(userId, 'INCOME', lastStart, lastEnd),
    aggregateByType(userId, 'EXPENSE', lastStart, lastEnd),
  ]);

  const profit = thisInc - thisExp;
  const lastProfit = lastInc - lastExp;
  if (profit === 0 && lastProfit === 0) return null;

  const change = percentChange(profit, lastProfit);

  if (!change.hasComparison) {
    return {
      id: 'profit-baseline',
      kind: 'profit-trend',
      title: 'Profit this month',
      message: `You're at ${formatMoney(profit)} profit so far this month — no prior month to compare against yet.`,
      metric: formatMoney(profit),
      tone: profit >= 0 ? 'positive' : 'warning',
      priority: 'normal',
    };
  }

  const dropped = profit < lastProfit;
  return {
    id: 'profit-trend',
    kind: 'profit-trend',
    title: dropped ? 'Profit is sliding' : 'Profit is climbing',
    message: dropped
      ? `Profit is ${formatPctChange(change.pct)} versus last month (${formatMoney(
          profit,
        )} vs ${formatMoney(lastProfit)}). Worth a closer look.`
      : `Profit is ${formatPctChange(change.pct)} versus last month — keep what's working.`,
    metric: formatPctChange(change.pct),
    tone: dropped ? (Math.abs(change.pct) >= 25 ? 'negative' : 'warning') : 'positive',
    priority: dropped && Math.abs(change.pct) >= 15 ? 'high' : 'normal',
  };
};

const expenseDriver = async (userId: string, now: Date): Promise<AssistantNote | null> => {
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const [thisGrouped, lastGrouped] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: thisStart, lte: thisEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'EXPENSE', date: { gte: lastStart, lte: lastEnd } },
      _sum: { amount: true },
    }),
  ]);

  if (thisGrouped.length === 0) return null;

  const lastById = new Map(
    lastGrouped.map((g) => [g.categoryId, toSafeNumber(g._sum.amount)]),
  );

  const swings = thisGrouped
    .map((g) => ({
      categoryId: g.categoryId,
      thisTotal: toSafeNumber(g._sum.amount),
      lastTotal: lastById.get(g.categoryId) ?? 0,
    }))
    .map((s) => ({ ...s, delta: s.thisTotal - s.lastTotal }))
    .sort((a, b) => b.delta - a.delta);

  const top = swings[0];
  if (!top || top.delta <= 0) return null;
  // Only call out swings of meaningful size to avoid noise.
  if (top.delta < 25) return null;

  const cat = await prisma.category.findUnique({
    where: { id: top.categoryId },
    select: { id: true, name: true },
  });
  if (!cat) return null;

  const change = percentChange(top.thisTotal, top.lastTotal);
  return {
    id: `expense-driver:${cat.id}`,
    kind: 'expense-driver',
    title: 'Biggest swing this month',
    message: change.hasComparison
      ? `${cat.name} is up ${formatMoney(top.delta)} (${formatPctChange(
          change.pct,
        )}) compared with last month.`
      : `${cat.name} is new this month and already at ${formatMoney(top.thisTotal)}.`,
    metric: formatMoney(top.delta),
    tone: 'warning',
    priority: 'high',
    action: {
      label: `Review ${cat.name}`,
      type: 'filter',
      payload: { categoryId: cat.id, type: 'EXPENSE' },
    },
  };
};

const subscriptionsNote = async (userId: string): Promise<AssistantNote | null> => {
  const { subscriptions, totalMonthly, totalAnnual } = await detectSubscriptions(userId);
  if (subscriptions.length === 0) return null;
  const top = subscriptions[0];
  return {
    id: 'subscriptions',
    kind: 'subscriptions',
    title: 'Recurring charges to review',
    message: `${subscriptions.length} subscription${
      subscriptions.length === 1 ? '' : 's'
    } detected — about ${formatMoney(totalMonthly)} a month (${formatMoney(
      totalAnnual,
    )} a year). Largest: ${top.name}.`,
    metric: formatMoney(totalMonthly),
    tone: subscriptions.length >= 5 ? 'warning' : 'neutral',
    priority: 'normal',
    action: {
      label: 'Open subscriptions',
      type: 'navigate',
      payload: { route: '/app/subscriptions' },
    },
  };
};

const staleDataNote = async (userId: string, now: Date): Promise<AssistantNote | null> => {
  const last = await prisma.transaction.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
    select: { date: true },
  });
  if (!last) return null;
  const days = Math.floor((now.getTime() - last.date.getTime()) / 86_400_000);
  if (days < 4) return null;
  const total = await prisma.transaction.count({ where: { userId } });
  if (total < 5) return null;
  return {
    id: 'stale-data',
    kind: 'stale-data',
    title: 'Logs are out of date',
    message: `It's been ${days} days since your last entry. Add the latest transactions so the rest of these numbers stay honest.`,
    tone: 'warning',
    priority: 'high',
    action: {
      label: 'Add transaction',
      type: 'navigate',
      payload: { route: '/app/transactions', openQuickAdd: 'true' },
    },
  };
};

const forecastNote = async (userId: string, now: Date): Promise<AssistantNote | null> => {
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const dayOfMonth = Math.max(1, now.getDate());
  if (dayOfMonth < 7) return null;

  const [thisExp, thisInc] = await Promise.all([
    aggregateByType(userId, 'EXPENSE', start, now),
    aggregateByType(userId, 'INCOME', start, now),
  ]);
  const daysInMonth = end.getDate();
  const projectedExp = (thisExp / dayOfMonth) * daysInMonth;
  const projectedInc = (thisInc / dayOfMonth) * daysInMonth;
  const projectedProfit = projectedInc - projectedExp;

  if (projectedExp === 0 && projectedInc === 0) return null;

  const lastExp = await aggregateByType(
    userId,
    'EXPENSE',
    startOfMonth(subMonths(now, 1)),
    endOfMonth(subMonths(now, 1)),
  );
  const expChange = percentChange(projectedExp, lastExp);

  if (projectedProfit < 0) {
    return {
      id: 'forecast-loss',
      kind: 'forecast',
      title: 'Heading for a loss',
      message: `On this pace you'll end the month down ${formatMoney(
        Math.abs(projectedProfit),
      )}. Trim non-essential expenses or chase outstanding income.`,
      metric: formatMoney(projectedProfit),
      tone: 'negative',
      priority: 'high',
    };
  }
  if (expChange.hasComparison && expChange.pct >= 15) {
    return {
      id: 'forecast-overspend',
      kind: 'forecast',
      title: 'Spending is accelerating',
      message: `If the rest of the month tracks today's pace, you'll spend ${formatMoney(
        projectedExp,
      )} — ${formatPctChange(expChange.pct)} versus last month.`,
      metric: formatPctChange(expChange.pct),
      tone: 'warning',
      priority: 'high',
    };
  }
  return {
    id: 'forecast-on-track',
    kind: 'forecast',
    title: 'On pace for the month',
    message: `Projected ${formatMoney(projectedProfit)} profit this month at the current pace.`,
    metric: formatMoney(projectedProfit),
    tone: 'positive',
    priority: 'normal',
  };
};

export const buildAssistantDigest = async (userId: string): Promise<AssistantDigest> => {
  const now = new Date();

  const txnCount = await prisma.transaction.count({
    where: { userId, date: { gte: subDays(now, 30) } },
  });

  if (txnCount === 0) {
    return {
      generatedAt: now,
      headline: 'Nothing to review yet — add your first transactions to unlock summaries.',
      notes: [],
    };
  }

  const candidates = await Promise.all([
    profitTrend(userId, now),
    expenseDriver(userId, now),
    forecastNote(userId, now),
    weeklyPulse(userId, now),
    subscriptionsNote(userId),
    staleDataNote(userId, now),
  ]);

  const notes = orderNotes(
    candidates.filter((n): n is AssistantNote => n !== null).map((n) => ({
      ...n,
      // Bump priority for kinds that we always treat as decisions (overrides 'normal' if any slipped through).
      priority: HIGH_PRIORITY_KINDS.has(n.kind) ? n.priority : n.priority,
    })),
  ).slice(0, 6);

  const headline = notes[0]?.message ?? "You're up to date — nothing critical to look at this week.";

  return { generatedAt: now, headline, notes };
};
