import type { FinancialSignalDto, MetricCardViewModel, ForecastViewModel, PrioritySignalViewModel } from '../types';

import { getFreshnessStatus } from '../utils/freshness';

export const mapSignalToMetricCardVM = (
  signal: FinancialSignalDto,
  label: string,
  isFetching: boolean = false
): MetricCardViewModel => {
  const generatedAt = new Date(signal.generatedAt);
  const freshness = getFreshnessStatus(generatedAt, signal.ttlCategory, isFetching);

  let change;
  // Try to extract change metadata if available
  if (signal.metadata?.delta !== undefined && signal.metadata?.previous !== undefined) {
    change = {
      pct: signal.value, // value is often the pct for growth signals
      direction: signal.trend === 'UP' ? 'up' : signal.trend === 'DOWN' ? 'down' : 'flat',
      hasComparison: signal.confidence > 0,
    } as const;
  }

  return {
    id: signal.id,
    key: signal.key,
    formattedValue: String(signal.value), // Usually format Currency in UI, but keep raw here or formatted
    severity: signal.severity,
    trend: signal.trend,
    confidence: signal.confidence,
    generatedAt,
    freshness,
    isStale: freshness === 'stale',
    label,
    value: signal.value,
    caption: `Updated ${generatedAt.toLocaleTimeString()}`,
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
    formattedValue: String(signal.value),
    severity: signal.severity,
    trend: signal.trend,
    confidence: signal.confidence,
    generatedAt,
    freshness,
    isStale: freshness === 'stale',
    title: signal.metadata?.title || signal.key.replace(/_/g, ' '),
    explanation: signal.metadata?.explanation || 'No explanation provided.',
    recommendedAction: signal.metadata?.recommendedAction || 'Monitor closely.',
  };
};
