import type { FinancialSignalDto, MetricCardViewModel, ForecastViewModel, PrioritySignalViewModel } from '../types';
import { getFreshnessStatus } from '../utils/freshness';
import { resolveSignalTitle, resolveSignalExplanation } from '../utils/resolveLocalized';

export const mapSignalToMetricCardVM = (
  signal: FinancialSignalDto,
  label: string,
  isFetching: boolean = false
): MetricCardViewModel => {
  const generatedAt = new Date(signal.generatedAt);
  const freshness = getFreshnessStatus(generatedAt, signal.ttlCategory, isFetching);

  let change;
  if (signal.metadata?.delta !== undefined && signal.metadata?.previous !== undefined) {
    change = {
      pct: signal.value,
      direction: signal.trend === 'UP' ? 'up' : signal.trend === 'DOWN' ? 'down' : 'flat',
      hasComparison: signal.confidence > 0,
    } as const;
  }

  return {
    id: signal.id,
    key: signal.key,
    formattedValue: String(signal.value),
    severity: signal.severity,
    trend: signal.trend,
    confidence: signal.confidence,
    status: signal.status,
    snoozedUntil: signal.snoozedUntil,
    resolutionNotes: signal.resolutionNotes,
    generatedAt,
    freshness,
    isStale: freshness === 'stale',
    label,
    value: signal.value,
    caption: resolveSignalExplanation(signal.localized, signal.metadata?.description as string | undefined, signal.key),
    change,
  };
};

export const mapSignalsToForecastVM = (
  signals: FinancialSignalDto[],
  isFetching: boolean = false
): ForecastViewModel | null => {
  const incomeSignal = signals.find((s) => s.key === 'PROJECTED_INCOME');
  const expenseSignal = signals.find((s) => s.key === 'PROJECTED_EXPENSE');
  const profitSignal = signals.find((s) => s.key === 'PROJECTED_PROFIT');

  if (!incomeSignal || !expenseSignal || !profitSignal) return null;

  const generatedAt = new Date(profitSignal.generatedAt);
  const freshness = getFreshnessStatus(generatedAt, profitSignal.ttlCategory, isFetching);

  return {
    projectedIncome: incomeSignal.value,
    projectedExpense: expenseSignal.value,
    projectedProfit: profitSignal.value,
    remainingDays: incomeSignal.metadata?.remainingDays ?? 0,
    isOverspending: expenseSignal.metadata?.isOverspending ?? false,
    generatedAt,
    freshness,
  };
};

export const mapSignalToPriorityVM = (
  signal: FinancialSignalDto,
  isFetching: boolean = false
): PrioritySignalViewModel => {
  const generatedAt = new Date(signal.generatedAt);
  const freshness = getFreshnessStatus(generatedAt, signal.ttlCategory, isFetching);

  return {
    id: signal.id,
    key: signal.key,
    formattedValue: '',
    severity: signal.severity,
    trend: signal.trend,
    confidence: signal.confidence,
    status: signal.status,
    snoozedUntil: signal.snoozedUntil,
    resolutionNotes: signal.resolutionNotes,
    generatedAt,
    freshness,
    isStale: freshness === 'stale',
    title: resolveSignalTitle(signal.localized, signal.metadata?.title as string | undefined, signal.key),
    explanation: resolveSignalExplanation(signal.localized, signal.metadata?.description as string | undefined, signal.key),
    recommendedAction: signal.metadata?.recommendedAction || signal.metadata?.action || 'Review transaction details',
  };
};
