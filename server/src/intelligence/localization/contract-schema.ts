/**
 * Shared localization contract schema — maps every LocalizationKey to its
 * expected interpolation params with types.
 *
 * This schema is the single source of truth for what params each translation
 * key requires. Used by:
 * - contract-validator.ts to validate payloads at runtime
 * - frontend sync tests to verify translation dictionaries are complete
 * - interpolation integrity tests to catch param mismatches
 *
 * Params are raw values ONLY — numbers or short identifier strings.
 * No formatted strings (no $, %, currency symbols, or locale-formatted numbers).
 */

import type { LocalizationKey } from './key-registry';

// ─── Contract Entry Type ─────────────────────────────────────────────────

export interface ContractEntry {
  /** Expected interpolation params and their types. */
  params: Record<string, 'number' | 'string'>;
  /** Namespace this key belongs to (first segment of the key). */
  namespace: string;
  /** Whether this key is deprecated and scheduled for removal. */
  deprecated?: boolean;
}

// ─── Contract Schema Type ────────────────────────────────────────────────

export type ContractSchema = Record<LocalizationKey, ContractEntry>;

// ─── Schema Definition ───────────────────────────────────────────────────

export const CONTRACT_SCHEMA: ContractSchema = {
  // ═══════════════════════════════════════════════════════════════════════
  // SIGNALS NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  // ── Profit Margin ──────────────────────────────────────────────────
  'signals.profit_margin.summary': {
    params: { marginPct: 'number', profit: 'number', income: 'number', expense: 'number' },
    namespace: 'signals',
  },
  'signals.profit_margin.explanation': {
    params: { marginPct: 'number', profit: 'number', income: 'number', expense: 'number' },
    namespace: 'signals',
  },

  // ── Revenue Growth ─────────────────────────────────────────────────
  'signals.revenue_growth.summary': {
    params: { current: 'number', previous: 'number', delta: 'number', changePct: 'number' },
    namespace: 'signals',
  },
  'signals.revenue_growth.explanation': {
    params: { current: 'number', previous: 'number', delta: 'number', changePct: 'number' },
    namespace: 'signals',
  },

  // ── Profit Trend ───────────────────────────────────────────────────
  'signals.profit_trend.summary': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'signals',
  },
  'signals.profit_trend.explanation': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'signals',
  },

  // ── Profit Drop ────────────────────────────────────────────────────
  'signals.profit_drop.summary': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'signals',
  },
  'signals.profit_drop.explanation': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'signals',
  },

  // ── Expense Growth ─────────────────────────────────────────────────
  'signals.expense_growth.summary': {
    params: { current: 'number', previous: 'number', delta: 'number', changePct: 'number' },
    namespace: 'signals',
  },
  'signals.expense_growth.explanation': {
    params: { current: 'number', previous: 'number', delta: 'number', changePct: 'number' },
    namespace: 'signals',
  },

  // ── Burn Rate ──────────────────────────────────────────────────────
  'signals.burn_rate.summary': {
    params: { totalExpense: 'number', daysElapsed: 'number' },
    namespace: 'signals',
  },
  'signals.burn_rate.explanation': {
    params: { totalExpense: 'number', daysElapsed: 'number' },
    namespace: 'signals',
  },

  // ── Expense Ratio ──────────────────────────────────────────────────
  'signals.expense_ratio.summary': {
    params: { expense: 'number', income: 'number' },
    namespace: 'signals',
  },
  'signals.expense_ratio.explanation': {
    params: { expense: 'number', income: 'number' },
    namespace: 'signals',
  },

  // ── Top Expense Category ───────────────────────────────────────────
  'signals.top_expense_category.summary': {
    params: { categoryId: 'string', categoryName: 'string', sharePct: 'number', totalExpense: 'number' },
    namespace: 'signals',
  },
  'signals.top_expense_category.explanation': {
    params: { categoryId: 'string', categoryName: 'string', sharePct: 'number', totalExpense: 'number' },
    namespace: 'signals',
  },

  // ── Top Income Category ────────────────────────────────────────────
  'signals.top_income_category.summary': {
    params: { categoryId: 'string', categoryName: 'string', sharePct: 'number', totalIncome: 'number' },
    namespace: 'signals',
  },
  'signals.top_income_category.explanation': {
    params: { categoryId: 'string', categoryName: 'string', sharePct: 'number', totalIncome: 'number' },
    namespace: 'signals',
  },

  // ── Category Concentration ─────────────────────────────────────────
  'signals.category_concentration.summary': {
    params: { categoryId: 'string', categoryName: 'string' },
    namespace: 'signals',
  },
  'signals.category_concentration.explanation': {
    params: { categoryId: 'string', categoryName: 'string' },
    namespace: 'signals',
  },

  // ── Spend Spike ────────────────────────────────────────────────────
  'signals.spend_spike.summary': {
    params: { categoryId: 'string', categoryName: 'string', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'signals',
  },
  'signals.spend_spike.explanation': {
    params: { categoryId: 'string', categoryName: 'string', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'signals',
  },

  // ── Weekly Spend Change ────────────────────────────────────────────
  'signals.weekly_spend_change.summary': {
    params: { thisWeek: 'number', lastWeek: 'number', delta: 'number' },
    namespace: 'signals',
  },
  'signals.weekly_spend_change.explanation': {
    params: { thisWeek: 'number', lastWeek: 'number', delta: 'number' },
    namespace: 'signals',
  },

  // ── Projected Expense ──────────────────────────────────────────────
  'signals.projected_expense.summary': {
    params: { projectedAmount: 'number', actualExpense: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },
  'signals.projected_expense.explanation': {
    params: { projectedAmount: 'number', actualExpense: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },

  // ── Projected Income ───────────────────────────────────────────────
  'signals.projected_income.summary': {
    params: { projectedAmount: 'number', actualIncome: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },
  'signals.projected_income.explanation': {
    params: { projectedAmount: 'number', actualIncome: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },

  // ── Projected Profit ───────────────────────────────────────────────
  'signals.projected_profit.summary': {
    params: { projectedAmount: 'number', projectedIncome: 'number', projectedExpense: 'number' },
    namespace: 'signals',
  },
  'signals.projected_profit.explanation': {
    params: { projectedAmount: 'number', projectedIncome: 'number', projectedExpense: 'number' },
    namespace: 'signals',
  },

  // ── Cash Runway Days ───────────────────────────────────────────────
  'signals.cash_runway_days.summary': {
    params: { remainingDays: 'number', dailyRate: 'number', currentBalance: 'number' },
    namespace: 'signals',
  },
  'signals.cash_runway_days.explanation': {
    params: { remainingDays: 'number', dailyRate: 'number', currentBalance: 'number' },
    namespace: 'signals',
  },

  // ── Forecast Overspend ─────────────────────────────────────────────
  'signals.forecast_overspend.summary': {
    params: { projectedAmount: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },
  'signals.forecast_overspend.explanation': {
    params: { projectedAmount: 'number', dailyRate: 'number', remainingDays: 'number' },
    namespace: 'signals',
  },

  // ── Spending Anomaly ───────────────────────────────────────────────
  'signals.spending_anomaly.summary': {
    params: { categoryId: 'string', categoryName: 'string', changePct: 'number', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'signals',
  },
  'signals.spending_anomaly.explanation': {
    params: { categoryId: 'string', categoryName: 'string', changePct: 'number', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'signals',
  },

  // ── Stale Data ─────────────────────────────────────────────────────
  'signals.stale_data.summary': {
    params: { daysSince: 'number', totalTransactions: 'number' },
    namespace: 'signals',
  },
  'signals.stale_data.explanation': {
    params: { daysSince: 'number', totalTransactions: 'number' },
    namespace: 'signals',
  },

  // ── Recurring Expense ──────────────────────────────────────────────
  'signals.recurring_expense.summary': {
    params: { categoryName: 'string', monthsDetected: 'number', averageAmount: 'number' },
    namespace: 'signals',
  },
  'signals.recurring_expense.explanation': {
    params: { categoryName: 'string', monthsDetected: 'number', averageAmount: 'number' },
    namespace: 'signals',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ALERTS NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  'alerts.spend_spike.title': {
    params: { categoryName: 'string' },
    namespace: 'alerts',
  },
  'alerts.spend_spike.message': {
    params: { categoryName: 'string', changePct: 'number', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'alerts',
  },
  'alerts.expenses_exceed.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.expenses_exceed.message': {
    params: { overBy: 'number', expense: 'number', income: 'number' },
    namespace: 'alerts',
  },
  'alerts.profit_drop.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.profit_drop.message': {
    params: { pct: 'number', currentProfit: 'number', previousProfit: 'number' },
    namespace: 'alerts',
  },
  'alerts.category_concentration.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.category_concentration.message': {
    params: { categoryName: 'string', sharePct: 'number', totalAmount: 'number' },
    namespace: 'alerts',
  },
  'alerts.weekly_spend_increase.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.weekly_spend_increase.message': {
    params: { changePct: 'number', thisWeek: 'number', lastWeek: 'number' },
    namespace: 'alerts',
  },
  'alerts.stale_data.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.stale_data.message': {
    params: { daysSince: 'number' },
    namespace: 'alerts',
  },
  'alerts.forecast_overspend.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.forecast_overspend.message': {
    params: { projected: 'number', vsLastMonth: 'number' },
    namespace: 'alerts',
  },
  'alerts.recurring_detected.title': {
    params: {},
    namespace: 'alerts',
  },
  'alerts.recurring_detected.message': {
    params: { categoryName: 'string', amount: 'number', monthsDetected: 'number' },
    namespace: 'alerts',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ASSISTANT NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  'assistant.weekly_pulse.title': {
    params: {},
    namespace: 'assistant',
  },
  'assistant.weekly_pulse.message': {
    params: { profit: 'number', income: 'number', expense: 'number', changePct: 'number', direction: 'string' },
    namespace: 'assistant',
  },
  'assistant.profit_trend.title': {
    params: { direction: 'string' },
    namespace: 'assistant',
  },
  'assistant.profit_trend.message': {
    params: { profit: 'number', changePct: 'number', hasComparison: 'number' },
    namespace: 'assistant',
  },
  'assistant.expense_driver.title': {
    params: {},
    namespace: 'assistant',
  },
  'assistant.expense_driver.message': {
    params: { categoryName: 'string', delta: 'number', thisTotal: 'number', lastTotal: 'number', changePct: 'number' },
    namespace: 'assistant',
  },
  'assistant.subscriptions.title': {
    params: {},
    namespace: 'assistant',
  },
  'assistant.subscriptions.message': {
    params: { count: 'number', totalMonthly: 'number', totalAnnual: 'number', topName: 'string' },
    namespace: 'assistant',
  },
  'assistant.stale_data.title': {
    params: {},
    namespace: 'assistant',
  },
  'assistant.stale_data.message': {
    params: { daysSince: 'number' },
    namespace: 'assistant',
  },
  'assistant.forecast.title': {
    params: { variant: 'string' },
    namespace: 'assistant',
  },
  'assistant.forecast.message': {
    params: { projectedProfit: 'number', projectedExp: 'number', projectedInc: 'number' },
    namespace: 'assistant',
  },
  'assistant.signal_explanation.title': {
    params: { signalKey: 'string' },
    namespace: 'assistant',
  },
  'assistant.signal_explanation.message': {
    params: { signalKey: 'string', amount: 'number' },
    namespace: 'assistant',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // INSIGHTS NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  'insights.weekly_comparison.title': {
    params: { direction: 'string' },
    namespace: 'insights',
  },
  'insights.weekly_comparison.message': {
    params: { direction: 'string', changePct: 'number', thisAmount: 'number', lastAmount: 'number', side: 'string' },
    namespace: 'insights',
  },
  'insights.monthly_comparison.title': {
    params: { direction: 'string' },
    namespace: 'insights',
  },
  'insights.monthly_comparison.message': {
    params: { direction: 'string', changePct: 'number', thisAmount: 'number', lastAmount: 'number' },
    namespace: 'insights',
  },
  'insights.top_expense.title': {
    params: { categoryName: 'string' },
    namespace: 'insights',
  },
  'insights.top_expense.message': {
    params: { categoryName: 'string', sharePct: 'number', amount: 'number', totalExpense: 'number' },
    namespace: 'insights',
  },
  'insights.top_income.title': {
    params: { categoryName: 'string' },
    namespace: 'insights',
  },
  'insights.top_income.message': {
    params: { categoryName: 'string', sharePct: 'number', amount: 'number', totalIncome: 'number' },
    namespace: 'insights',
  },
  'insights.profit_trend.title': {
    params: { direction: 'string' },
    namespace: 'insights',
  },
  'insights.profit_trend.message': {
    params: { thisProfit: 'number', changePct: 'number' },
    namespace: 'insights',
  },
  'insights.spending_anomaly.title': {
    params: { categoryName: 'string' },
    namespace: 'insights',
  },
  'insights.spending_anomaly.message': {
    params: { categoryName: 'string', changePct: 'number', currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'insights',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // REASONING NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  // ── Profitability reasoning ────────────────────────────────────────
  'reasoning.profit_margin.loss': {
    params: { expense: 'number', income: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.profit_margin.healthy': {
    params: { marginPct: 'number', income: 'number', expense: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.revenue_growth.up': {
    params: { current: 'number', previous: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.revenue_growth.down': {
    params: { current: 'number', previous: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.revenue_growth.no_data': {
    params: {},
    namespace: 'reasoning',
  },
  'reasoning.expense_growth.up': {
    params: { current: 'number', previous: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.expense_growth.down': {
    params: { current: 'number', previous: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.expense_growth.no_data': {
    params: {},
    namespace: 'reasoning',
  },
  'reasoning.profit_trend.dropping': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.profit_trend.rising': {
    params: { currentProfit: 'number', previousProfit: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.profit_trend.no_data': {
    params: {},
    namespace: 'reasoning',
  },
  'reasoning.profit_drop.threshold': {
    params: { changePct: 'number' },
    namespace: 'reasoning',
  },

  // ── Spending reasoning ─────────────────────────────────────────────
  'reasoning.burn_rate.daily': {
    params: { totalExpense: 'number', daysElapsed: 'number', burnRate: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.burn_rate.low_confidence': {
    params: { daysElapsed: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.expense_ratio.exceeds': {
    params: { monthExpense: 'number', monthIncome: 'number', expenseRatio: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.expense_ratio.below': {
    params: { monthExpense: 'number', monthIncome: 'number', expenseRatio: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.top_expense_category.share': {
    params: { categoryName: 'string', topAmount: 'number', totalExpense: 'number', sharePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.top_income_category.share': {
    params: { categoryName: 'string', topAmount: 'number', totalIncome: 'number', sharePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.category_concentration.high': {
    params: { categoryName: 'string', sharePct: 'number', topAmount: 'number', totalExpense: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.spend_spike.above_average': {
    params: { categoryName: 'string', currentAmount: 'number', baselineAvg: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.weekly_spend_change.up': {
    params: { thisWeek: 'number', lastWeek: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.weekly_spend_change.down': {
    params: { thisWeek: 'number', lastWeek: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.weekly_spend_change.no_data': {
    params: {},
    namespace: 'reasoning',
  },

  // ── Forecast reasoning ─────────────────────────────────────────────
  'reasoning.projected_expense.rate': {
    params: { dailyBurnRate: 'number', daysElapsed: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.projected_expense.projection': {
    params: { projectedExpense: 'number', remainingDays: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.projected_income.rate': {
    params: { dailyEarnRate: 'number', daysElapsed: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.projected_income.projection': {
    params: { projectedIncome: 'number', remainingDays: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.projected_profit.positive': {
    params: { projectedIncome: 'number', projectedExpense: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.projected_profit.negative': {
    params: { projectedProfit: 'number', projectedExpense: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.cash_runway_days.burn': {
    params: { dailyBurnRate: 'number', dailyEarnRate: 'number', dailyNetBurn: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.cash_runway_days.runway': {
    params: { runwayDays: 'number', currentBalance: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.forecast_overspend.pace': {
    params: { projectedExpense: 'number', previousExpense: 'number', changePct: 'number' },
    namespace: 'reasoning',
  },

  // ── Anomaly reasoning ──────────────────────────────────────────────
  'reasoning.spending_anomaly.above_average': {
    params: { changePct: 'number', threshold: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.spending_anomaly.current_vs_baseline': {
    params: { currentAmount: 'number', baselineAvg: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.stale_data.days_since': {
    params: { daysSince: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.stale_data.threshold': {
    params: { threshold: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.stale_data.approaching': {
    params: { daysSince: 'number', warningThreshold: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.stale_data.stale': {
    params: { daysSince: 'number', threshold: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.recurring_expense.pattern': {
    params: { categoryName: 'string', monthsDetected: 'number', averageAmount: 'number' },
    namespace: 'reasoning',
  },
  'reasoning.recurring_expense.confidence': {
    params: { monthsDetected: 'number', confidence: 'number' },
    namespace: 'reasoning',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIDENCE NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  'confidence.high.label': {
    params: {},
    namespace: 'confidence',
  },
  'confidence.medium.label': {
    params: {},
    namespace: 'confidence',
  },
  'confidence.low.label': {
    params: {},
    namespace: 'confidence',
  },
  'confidence.none.label': {
    params: {},
    namespace: 'confidence',
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STATUS NAMESPACE
  // ═══════════════════════════════════════════════════════════════════════

  'status.new.label': {
    params: {},
    namespace: 'status',
  },
  'status.reviewed.label': {
    params: {},
    namespace: 'status',
  },
  'status.investigating.label': {
    params: {},
    namespace: 'status',
  },
  'status.snoozed.label': {
    params: {},
    namespace: 'status',
  },
  'status.resolved.label': {
    params: {},
    namespace: 'status',
  },
} as const;
