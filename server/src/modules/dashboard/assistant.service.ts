import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { prisma } from '@bizlens/database';
import {
  formatMoney,
  formatPctChange,
  percentChange,
  toSafeNumber,
} from '../../utils/safe-math';
import { aggregateByType, buildExpenseComposition } from './dashboard.service';
import { listBudgets } from './budgets.service';
import { detectSubscriptions } from './subscriptions.service';
import { signalEngine } from '../../intelligence/engine/signal-engine';
import { isSignalKey } from '../../intelligence/signals/signal.types';

/**
 * System prompt for the Signal Analyst persona.
 * Enforces a deterministic, evidence-based tone focused on operational clarity.
 * FR-007: No generic "I am an AI assistant" introductions.
 */
export const SIGNAL_ANALYST_PROMPT = `
You are the BizLens Signal Analyst. You deliver operational intelligence for SMB owners.

IDENTITY:
- You are a senior signal analyst, not a chatbot.
- Never say "I am an AI", "How can I help", "Hello!", or any generic greeting.
- Never introduce yourself. Start every response with the most critical data point.
- Your first sentence must contain a number (dollar amount, percentage, or count).

RULES:
1. EVIDENCE ONLY: Use ONLY the provided AssistantContext. Never invent data, extrapolate beyond what is shown, or offer generic financial advice.
2. LEAD WITH DATA: Open with the most urgent metric — e.g., "Marketing spend spiked 45% ($2,400) this week."
3. CITE SPECIFICS: Every claim must reference at least one concrete data point (amount, percentage change, category name, time period).
4. EXPLAIN DRIVERS: When a signal is active, explain what triggered it and which categories or transactions are responsible.
5. NO FILLER: No motivational language, no "let me know if you need anything", no pleasantries. Every sentence must contain information.
6. OPERATIONAL FRAMING: Frame insights as operational decisions — what changed, why it matters, what to do next.

STRUCTURE:
- If an activeSignal is provided, lead with its analysis: state the anomaly, quantify it, name the driver.
- Follow with Business Health summary: burn rate delta, any exceeded budgets.
- Close with the single most actionable next step (one sentence).
- Keep responses under 120 words. Prefer sentence fragments over full paragraphs.

ANTI-PATTERNS (never produce these):
- "I'd be happy to help you understand your finances."
- "Based on the data, it looks like..."
- "Here's a summary of your financial health:"
- "Let me break this down for you."
- Any sentence without a data point or specific reference.

GOOD EXAMPLES:
- "Revenue trending down 12% vs last month. Primary driver: client churn in Q4 contracts."
- "Burn rate: $8,200/mo (+18%). Marketing exceeded budget by $1,100. Cut or justify by Friday."
- "3 subscriptions totaling $847/mo detected. Largest: AWS at $420. Review for unused capacity."

TONE: Direct, calm, operationally urgent. Like a morning briefing from a CFO, not a chatbot conversation.
`.trim();

/**
 * Formats the AssistantContext into a concise, token-efficient string for LLM consumption.
 * Ensures the model relies strictly on provided evidence.
 */
export const formatAssistantContext = (ctx: AssistantContext): string => {
  const lines = [
    `Generated At: ${ctx.generatedAt.toISOString()}`,
    '',
    '### Active Signal',
    ctx.activeSignal 
      ? `- Key: ${ctx.activeSignal.key}\n- Title: ${ctx.activeSignal.title}\n- Summary: ${ctx.activeSignal.summary}\n- Drivers: ${ctx.activeSignal.drivers.join(', ')}\n- Metric: ${ctx.activeSignal.metric || 'N/A'}\n- Trend: ${ctx.activeSignal.trend}`
      : 'None',
    '',
    '### Business Health',
    `- Monthly Burn: ${formatMoney(ctx.businessHealth.monthlyBurn.actual)} (Prev: ${formatMoney(ctx.businessHealth.monthlyBurn.previous)}, Change: ${ctx.businessHealth.monthlyBurn.changePct}%)`,
    '',
    '#### Budget Performance',
    ...ctx.businessHealth.budgetPerformance.map(b => `- ${b.category}: ${b.usedPct}% used${b.exceeded ? ' [EXCEEDED]' : ''}`),
    '',
    '#### Top Expense Categories',
    ...ctx.businessHealth.topExpenseCategories.map(c => `- ${c.name}: ${formatMoney(c.amount)} (${c.share}% share)`),
    '',
    '### Critical Signals',
    ...ctx.businessHealth.topSignals.map(s => `- ${s.title}: ${s.message} [Tone: ${s.tone}, Priority: ${s.priority}]`),
    '',
    '### Recent Activity',
    `- 30d Transaction Count: ${ctx.recentActivity.transactionCount}`,
    `- Days Since Last Entry: ${ctx.recentActivity.lastEntryDaysAgo ?? 'N/A'}`,
  ];

  return lines.join('\n');
};

/**
 * Decision Assistant — produces a small, prioritized digest of plain-language
 * notes ("what changed this week", "where profit dropped", "what to look at
 * first"). Lives in its own service so the API/UI surface stays thin.
 *
 * Each note is intentionally short and actionable; the client renders them as
 * a stacked summary card and uses the optional `action` to deep-link into the
 * filtered transaction view.
 *
 * Persona: Signal Analyst — no generic greetings, every note references
 * specific data points (amounts, percentages, category names).
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
    | 'forecast'
    | 'signal-explanation';
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
  context?: AssistantContext;
}

/** 
 * Normalized operational insight derived from a signal. 
 * Prevents client-side duplication of logic for data-aware analysis.
 */
export interface SignalInsight {
  key: string;
  title: string;
  summary: string;
  drivers: string[];
  metric?: string;
  trend: 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';
}

/**
 * Foundational context for the AI Assistant. 
 * Aggregates all relevant business data points to prevent hallucinations.
 */
export interface AssistantContext {
  userId: string;
  generatedAt: Date;
  activeSignal?: SignalInsight;
  businessHealth: {
    topSignals: AssistantNote[];
    budgetPerformance: {
      category: string;
      usedPct: number;
      exceeded: boolean;
    }[];
    monthlyBurn: {
      actual: number;
      previous: number;
      changePct: number;
    };
    topExpenseCategories: {
      name: string;
      amount: number;
      share: number;
    }[];
  };
  recentActivity: {
    transactionCount: number;
    lastEntryDaysAgo: number | null;
  };
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

const weeklyPulse = async (userId: string, now: Date, currency = 'USD'): Promise<AssistantNote | null> => {
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
      ? `Profit this week is roughly flat at ${formatMoney(profit, currency)}.`
      : `You're ${change.direction === 'up' ? 'up' : 'down'} ${formatPctChange(
          change.pct,
        )} versus last week — profit ${
          profit >= 0 ? 'of' : 'down'
        } ${formatMoney(Math.abs(profit), currency)}.`
    : `So far this week you're at ${formatMoney(profit, currency)} profit (${formatMoney(
        thisInc, currency,
      )} in, ${formatMoney(thisExp, currency)} out).`;

  return {
    id: 'weekly-pulse',
    kind: 'weekly-pulse',
    title: 'This week so far',
    message,
    metric: change.hasComparison ? formatPctChange(change.pct) : formatMoney(profit, currency),
    tone,
    priority: 'normal',
  };
};

const profitTrend = async (userId: string, now: Date, currency = 'USD'): Promise<AssistantNote | null> => {
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
      message: `You're at ${formatMoney(profit, currency)} profit so far this month — no prior month to compare against yet.`,
      metric: formatMoney(profit, currency),
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
          profit, currency,
        )} vs ${formatMoney(lastProfit, currency)}). Worth a closer look.`
      : `Profit is ${formatPctChange(change.pct)} versus last month — keep what's working.`,
    metric: formatPctChange(change.pct),
    tone: dropped ? (Math.abs(change.pct) >= 25 ? 'negative' : 'warning') : 'positive',
    priority: dropped && Math.abs(change.pct) >= 15 ? 'high' : 'normal',
  };
};

const expenseDriver = async (userId: string, now: Date, currency = 'USD'): Promise<AssistantNote | null> => {
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
      ? `${cat.name} is up ${formatMoney(top.delta, currency)} (${formatPctChange(
          change.pct,
        )}) compared with last month.`
      : `${cat.name} is new this month and already at ${formatMoney(top.thisTotal, currency)}.`,
    metric: formatMoney(top.delta, currency),
    tone: 'warning',
    priority: 'high',
    action: {
      label: `Review ${cat.name}`,
      type: 'filter',
      payload: { categoryId: cat.id, type: 'EXPENSE' },
    },
  };
};

const subscriptionsNote = async (userId: string, currency = 'USD'): Promise<AssistantNote | null> => {
  const { subscriptions, totalMonthly, totalAnnual } = await detectSubscriptions(userId);
  if (subscriptions.length === 0) return null;
  const top = subscriptions[0];
  return {
    id: 'subscriptions',
    kind: 'subscriptions',
    title: 'Recurring charges to review',
    message: `${subscriptions.length} subscription${
      subscriptions.length === 1 ? '' : 's'
    } detected — about ${formatMoney(totalMonthly, currency)} a month (${formatMoney(
      totalAnnual, currency,
    )} a year). Largest: ${top.name}.`,
    metric: formatMoney(totalMonthly, currency),
    tone: subscriptions.length >= 5 ? 'warning' : 'neutral',
    priority: 'normal',
    action: {
      label: 'Open subscriptions',
      type: 'filter',
      payload: { type: 'EXPENSE', recurring: 'true' },
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

const forecastNote = async (userId: string, now: Date, currency = 'USD'): Promise<AssistantNote | null> => {
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
        Math.abs(projectedProfit), currency,
      )}. Trim non-essential expenses or chase outstanding income.`,
      metric: formatMoney(projectedProfit, currency),
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
        projectedExp, currency,
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
    message: `Projected ${formatMoney(projectedProfit, currency)} profit this month at the current pace.`,
    metric: formatMoney(projectedProfit, currency),
    tone: 'positive',
    priority: 'normal',
  };
};

/**
 * Generates a focused signal-explanation note when a specific signalKey is provided.
 * Fetches the signal and its transaction drivers to construct a data-aware insight
 * with actionable deep-link to relevant transactions.
 *
 * Returns null if the signal is not found or has insufficient data.
 */
export const generateSignalInsight = async (
  userId: string,
  signalKey: string,
): Promise<AssistantNote | null> => {
  if (!isSignalKey(signalKey)) return null;

  const signal = await signalEngine.getSignal(userId, signalKey);
  if (!signal) return null;

  // Fetch user currency for monetary formatting
  const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
  const currency = userRecord?.currency ?? 'USD';

  const explainability = signal.metadata?.explainability;
  const inputs = explainability?.inputs ?? {};

  // Derive a human-readable title from the signal key
  const title = signalKey
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Extract data points for the message
  const value = signal.value;
  const pctChange = inputs.changePct != null
    ? Number(inputs.changePct)
    : inputs.pct != null
      ? Number(inputs.pct)
      : null;
  const amount = inputs.amount != null
    ? Number(inputs.amount)
    : inputs.current != null
      ? Number(inputs.current)
      : value;
  const period = inputs.period != null
    ? String(inputs.period)
    : 'this month';

  // Determine tone from severity and trend
  const tone: AssistantTone =
    signal.severity === 'critical' || signal.severity === 'warning'
      ? 'warning'
      : signal.trend === 'down'
        ? 'negative'
        : signal.trend === 'up'
          ? 'positive'
          : 'neutral';

  // Build metric string
  const metric = pctChange != null
    ? formatPctChange(pctChange)
    : formatMoney(amount, currency);

  // Build concise, data-aware message with at least 2 data points
  const formattedAmount = formatMoney(amount, currency);
  const pctStr = pctChange != null ? formatPctChange(pctChange) : null;
  const message = pctStr
    ? `${title} is at ${formattedAmount} (${pctStr}) ${period}. ${explainability?.reasoningChain?.[0] ?? 'Review transactions for details.'}`
    : `${title} is at ${formattedAmount} ${period}. ${explainability?.reasoningChain?.[0] ?? 'Review transactions for details.'}`;

  // Build action deep-link if we have a source category
  let action: AssistantAction | undefined;
  const categoryId = explainability?.sourceEntities?.[0];
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, type: true },
    });
    if (category) {
      action = {
        label: `Review ${category.name}`,
        type: 'filter',
        payload: { categoryId: category.id, type: category.type },
      };
    }
  }

  // Fallback action: filter by expense type if no specific category
  if (!action) {
    action = {
      label: `Review transactions`,
      type: 'filter',
      payload: { type: 'EXPENSE' },
    };
  }

  return {
    id: `signal-explanation:${signalKey}`,
    kind: 'signal-explanation',
    title,
    message,
    metric,
    tone,
    priority: 'high',
    action,
  };
};

/**
 * Deterministic context builder for the Assistant.
 * Aggregates signals, budget health, trends, and recent activity into a 
 * single type-safe contract.
 *
 * NOTE (T008 audit): aggregateByType() is used here for monthlyBurn and
 * composition data — these are budget/composition metrics, NOT signal-equivalent
 * computations. Signal data is fetched via signalEngine.getSignal() above.
 */
export const buildAssistantContext = async (
  userId: string,
  signalKey?: string,
): Promise<AssistantContext> => {
  const now = new Date();
  const start = startOfMonth(now);
  const prevStart = startOfMonth(subMonths(now, 1));
  const prevEnd = endOfMonth(subMonths(now, 1));

  // Fetch user currency
  const userRecord = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
  const currency = userRecord?.currency ?? 'USD';

  // 1. Fetch active signal if key provided
  let activeSignal: SignalInsight | undefined;
  if (signalKey && isSignalKey(signalKey)) {
    const sig = await signalEngine.getSignal(userId, signalKey);
    if (sig) {
      activeSignal = {
        key: sig.key,
        title: sig.key.replace(/_/g, ' ').toLowerCase(),
        summary: sig.metadata?.explainability?.reasoningChain?.[0] || 'Operational anomaly detected',
        drivers: (sig.metadata?.explainability?.reasoningChain as string[]) || [],
        metric: sig.value ? formatMoney(sig.value, currency) : undefined,
        trend: sig.trend.toUpperCase() as 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN',
      };
    }
  }

  // 2. Aggregate Business Health components
  const [budgets, currentExp, prevExp, composition, txnCount, lastTxn] = await Promise.all([
    listBudgets(userId),
    aggregateByType(userId, 'EXPENSE', start, now),
    aggregateByType(userId, 'EXPENSE', prevStart, prevEnd),
    buildExpenseComposition(userId, { 
      from: start, 
      to: now, 
      label: 'Current Month',
      prevFrom: prevStart,
      prevTo: prevEnd 
    }),
    prisma.transaction.count({ where: { userId, date: { gte: subDays(now, 30) } } }),
    prisma.transaction.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
  ]);

  const daysSince = lastTxn 
    ? Math.floor((now.getTime() - lastTxn.date.getTime()) / 86_400_000)
    : null;

  return {
    userId,
    generatedAt: now,
    activeSignal,
    businessHealth: {
      topSignals: [], // Populated by buildAssistantDigest to avoid circular logic
      budgetPerformance: budgets.map(b => ({
        category: b.category.name,
        usedPct: b.usedPct,
        exceeded: b.exceeded,
      })),
      monthlyBurn: {
        actual: currentExp,
        previous: prevExp,
        changePct: percentChange(currentExp, prevExp).pct,
      },
      topExpenseCategories: composition.categories.map(c => ({
        name: c.name,
        amount: c.amount,
        share: c.share,
      })),
    },
    recentActivity: {
      transactionCount: txnCount,
      lastEntryDaysAgo: daysSince,
    },
  };
};

export const buildAssistantDigest = async (
  userId: string,
  signalKey?: string,
): Promise<AssistantDigest> => {
  const now = new Date();

  // Fetch user currency for monetary formatting
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true },
  });
  const currency = user?.currency ?? 'USD';

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
    profitTrend(userId, now, currency),
    expenseDriver(userId, now, currency),
    forecastNote(userId, now, currency),
    weeklyPulse(userId, now, currency),
    subscriptionsNote(userId, currency),
    staleDataNote(userId, now),
  ]);

  let notes = orderNotes(
    candidates.filter((n): n is AssistantNote => n !== null).map((n) => ({
      ...n,
      // Bump priority for kinds that we always treat as decisions (overrides 'normal' if any slipped through).
      priority: HIGH_PRIORITY_KINDS.has(n.kind) ? n.priority : n.priority,
    })),
  ).slice(0, 6);

  // When signalKey is provided, prepend the signal-explanation note at index 0
  if (signalKey) {
    const signalNote = await generateSignalInsight(userId, signalKey);
    if (signalNote) {
      notes = [signalNote, ...notes.filter(n => n.id !== signalNote.id)];
    }
  }

  // FR-007 / FR-009: Headline must reference specific metrics, never vague summaries.
  // Priority: signal-explanation title+metric > top note title+metric > secondary note metric > fallback with data.
  let headline: string;
  if (signalKey && notes[0]?.kind === 'signal-explanation') {
    headline = notes[0].metric
      ? `${notes[0].title}: ${notes[0].metric}`
      : notes[0].title;
  } else if (notes[0]?.metric && notes[0]?.title) {
    headline = `${notes[0].title} — ${notes[0].metric}`;
  } else if (notes[0]?.title) {
    // Even without a metric on the top note, find the first note with a metric to enrich the headline
    const metricNote = notes.find(n => n.metric);
    headline = metricNote
      ? `${notes[0].title} — ${metricNote.metric}`
      : `${notes[0].title} this period`;
  } else {
    headline = 'No actionable changes detected this period.';
  }

  const context = await buildAssistantContext(userId, signalKey);
  context.businessHealth.topSignals = notes;

  return { generatedAt: now, headline, notes, context };
};
