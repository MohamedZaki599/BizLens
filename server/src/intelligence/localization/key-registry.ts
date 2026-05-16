/**
 * Central localization key registry — exhaustive constant defining all
 * semantic translation keys used across the intelligence layer.
 *
 * Key naming convention: `{namespace}.{signal_key}.{field}`
 * - lowercase, underscores within segments, max 3 dot-separated segments
 * - No human-readable text — keys are identifiers only
 *
 * Consumers: signal generators, alert engine, assistant service, insight engine.
 */

// ─── Signal Keys (20) ─────────────────────────────────────────────────────
// One summary + explanation per signal type produced by the generators.

const SIGNAL_KEYS = {
  // Profitability signals
  'signals.profit_margin.summary': 'signals.profit_margin.summary',
  'signals.profit_margin.explanation': 'signals.profit_margin.explanation',
  'signals.revenue_growth.summary': 'signals.revenue_growth.summary',
  'signals.revenue_growth.explanation': 'signals.revenue_growth.explanation',
  'signals.profit_trend.summary': 'signals.profit_trend.summary',
  'signals.profit_trend.explanation': 'signals.profit_trend.explanation',
  'signals.profit_drop.summary': 'signals.profit_drop.summary',
  'signals.profit_drop.explanation': 'signals.profit_drop.explanation',
  'signals.expense_growth.summary': 'signals.expense_growth.summary',
  'signals.expense_growth.explanation': 'signals.expense_growth.explanation',

  // Spending signals
  'signals.burn_rate.summary': 'signals.burn_rate.summary',
  'signals.burn_rate.explanation': 'signals.burn_rate.explanation',
  'signals.expense_ratio.summary': 'signals.expense_ratio.summary',
  'signals.expense_ratio.explanation': 'signals.expense_ratio.explanation',
  'signals.top_expense_category.summary': 'signals.top_expense_category.summary',
  'signals.top_expense_category.explanation': 'signals.top_expense_category.explanation',
  'signals.top_income_category.summary': 'signals.top_income_category.summary',
  'signals.top_income_category.explanation': 'signals.top_income_category.explanation',
  'signals.category_concentration.summary': 'signals.category_concentration.summary',
  'signals.category_concentration.explanation': 'signals.category_concentration.explanation',
  'signals.spend_spike.summary': 'signals.spend_spike.summary',
  'signals.spend_spike.explanation': 'signals.spend_spike.explanation',
  'signals.weekly_spend_change.summary': 'signals.weekly_spend_change.summary',
  'signals.weekly_spend_change.explanation': 'signals.weekly_spend_change.explanation',

  // Forecast signals
  'signals.projected_expense.summary': 'signals.projected_expense.summary',
  'signals.projected_expense.explanation': 'signals.projected_expense.explanation',
  'signals.projected_income.summary': 'signals.projected_income.summary',
  'signals.projected_income.explanation': 'signals.projected_income.explanation',
  'signals.projected_profit.summary': 'signals.projected_profit.summary',
  'signals.projected_profit.explanation': 'signals.projected_profit.explanation',
  'signals.cash_runway_days.summary': 'signals.cash_runway_days.summary',
  'signals.cash_runway_days.explanation': 'signals.cash_runway_days.explanation',
  'signals.forecast_overspend.summary': 'signals.forecast_overspend.summary',
  'signals.forecast_overspend.explanation': 'signals.forecast_overspend.explanation',

  // Anomaly signals
  'signals.spending_anomaly.summary': 'signals.spending_anomaly.summary',
  'signals.spending_anomaly.explanation': 'signals.spending_anomaly.explanation',
  'signals.stale_data.summary': 'signals.stale_data.summary',
  'signals.stale_data.explanation': 'signals.stale_data.explanation',
  'signals.recurring_expense.summary': 'signals.recurring_expense.summary',
  'signals.recurring_expense.explanation': 'signals.recurring_expense.explanation',
} as const;

// ─── Alert Keys (8) ───────────────────────────────────────────────────────
// One title + message per alert rule type.

const ALERT_KEYS = {
  'alerts.spend_spike.title': 'alerts.spend_spike.title',
  'alerts.spend_spike.message': 'alerts.spend_spike.message',
  'alerts.expenses_exceed.title': 'alerts.expenses_exceed.title',
  'alerts.expenses_exceed.message': 'alerts.expenses_exceed.message',
  'alerts.profit_drop.title': 'alerts.profit_drop.title',
  'alerts.profit_drop.message': 'alerts.profit_drop.message',
  'alerts.category_concentration.title': 'alerts.category_concentration.title',
  'alerts.category_concentration.message': 'alerts.category_concentration.message',
  'alerts.weekly_spend_increase.title': 'alerts.weekly_spend_increase.title',
  'alerts.weekly_spend_increase.message': 'alerts.weekly_spend_increase.message',
  'alerts.stale_data.title': 'alerts.stale_data.title',
  'alerts.stale_data.message': 'alerts.stale_data.message',
  'alerts.forecast_overspend.title': 'alerts.forecast_overspend.title',
  'alerts.forecast_overspend.message': 'alerts.forecast_overspend.message',
  'alerts.recurring_detected.title': 'alerts.recurring_detected.title',
  'alerts.recurring_detected.message': 'alerts.recurring_detected.message',
} as const;

// ─── Assistant Keys (7) ───────────────────────────────────────────────────
// One title + message per assistant note kind.

const ASSISTANT_KEYS = {
  'assistant.weekly_pulse.title': 'assistant.weekly_pulse.title',
  'assistant.weekly_pulse.message': 'assistant.weekly_pulse.message',
  'assistant.profit_trend.title': 'assistant.profit_trend.title',
  'assistant.profit_trend.message': 'assistant.profit_trend.message',
  'assistant.expense_driver.title': 'assistant.expense_driver.title',
  'assistant.expense_driver.message': 'assistant.expense_driver.message',
  'assistant.subscriptions.title': 'assistant.subscriptions.title',
  'assistant.subscriptions.message': 'assistant.subscriptions.message',
  'assistant.stale_data.title': 'assistant.stale_data.title',
  'assistant.stale_data.message': 'assistant.stale_data.message',
  'assistant.forecast.title': 'assistant.forecast.title',
  'assistant.forecast.message': 'assistant.forecast.message',
  'assistant.signal_explanation.title': 'assistant.signal_explanation.title',
  'assistant.signal_explanation.message': 'assistant.signal_explanation.message',
} as const;

// ─── Insight Keys (6) ─────────────────────────────────────────────────────
// One title + message per insight kind.

const INSIGHT_KEYS = {
  'insights.weekly_comparison.title': 'insights.weekly_comparison.title',
  'insights.weekly_comparison.message': 'insights.weekly_comparison.message',
  'insights.monthly_comparison.title': 'insights.monthly_comparison.title',
  'insights.monthly_comparison.message': 'insights.monthly_comparison.message',
  'insights.top_expense.title': 'insights.top_expense.title',
  'insights.top_expense.message': 'insights.top_expense.message',
  'insights.top_income.title': 'insights.top_income.title',
  'insights.top_income.message': 'insights.top_income.message',
  'insights.profit_trend.title': 'insights.profit_trend.title',
  'insights.profit_trend.message': 'insights.profit_trend.message',
  'insights.spending_anomaly.title': 'insights.spending_anomaly.title',
  'insights.spending_anomaly.message': 'insights.spending_anomaly.message',
} as const;

// ─── Reasoning Keys (per signal key) ─────────────────────────────────────
// Structured reasoning chain references for explainability.

const REASONING_KEYS = {
  // Profitability reasoning
  'reasoning.profit_margin.loss': 'reasoning.profit_margin.loss',
  'reasoning.profit_margin.healthy': 'reasoning.profit_margin.healthy',
  'reasoning.revenue_growth.up': 'reasoning.revenue_growth.up',
  'reasoning.revenue_growth.down': 'reasoning.revenue_growth.down',
  'reasoning.revenue_growth.no_data': 'reasoning.revenue_growth.no_data',
  'reasoning.expense_growth.up': 'reasoning.expense_growth.up',
  'reasoning.expense_growth.down': 'reasoning.expense_growth.down',
  'reasoning.expense_growth.no_data': 'reasoning.expense_growth.no_data',
  'reasoning.profit_trend.dropping': 'reasoning.profit_trend.dropping',
  'reasoning.profit_trend.rising': 'reasoning.profit_trend.rising',
  'reasoning.profit_trend.no_data': 'reasoning.profit_trend.no_data',
  'reasoning.profit_drop.threshold': 'reasoning.profit_drop.threshold',

  // Spending reasoning
  'reasoning.burn_rate.daily': 'reasoning.burn_rate.daily',
  'reasoning.burn_rate.low_confidence': 'reasoning.burn_rate.low_confidence',
  'reasoning.expense_ratio.exceeds': 'reasoning.expense_ratio.exceeds',
  'reasoning.expense_ratio.below': 'reasoning.expense_ratio.below',
  'reasoning.top_expense_category.share': 'reasoning.top_expense_category.share',
  'reasoning.top_income_category.share': 'reasoning.top_income_category.share',
  'reasoning.category_concentration.high': 'reasoning.category_concentration.high',
  'reasoning.spend_spike.above_average': 'reasoning.spend_spike.above_average',
  'reasoning.weekly_spend_change.up': 'reasoning.weekly_spend_change.up',
  'reasoning.weekly_spend_change.down': 'reasoning.weekly_spend_change.down',
  'reasoning.weekly_spend_change.no_data': 'reasoning.weekly_spend_change.no_data',

  // Forecast reasoning
  'reasoning.projected_expense.rate': 'reasoning.projected_expense.rate',
  'reasoning.projected_expense.projection': 'reasoning.projected_expense.projection',
  'reasoning.projected_income.rate': 'reasoning.projected_income.rate',
  'reasoning.projected_income.projection': 'reasoning.projected_income.projection',
  'reasoning.projected_profit.positive': 'reasoning.projected_profit.positive',
  'reasoning.projected_profit.negative': 'reasoning.projected_profit.negative',
  'reasoning.cash_runway_days.burn': 'reasoning.cash_runway_days.burn',
  'reasoning.cash_runway_days.runway': 'reasoning.cash_runway_days.runway',
  'reasoning.forecast_overspend.pace': 'reasoning.forecast_overspend.pace',

  // Anomaly reasoning
  'reasoning.spending_anomaly.above_average': 'reasoning.spending_anomaly.above_average',
  'reasoning.spending_anomaly.current_vs_baseline': 'reasoning.spending_anomaly.current_vs_baseline',
  'reasoning.stale_data.days_since': 'reasoning.stale_data.days_since',
  'reasoning.stale_data.threshold': 'reasoning.stale_data.threshold',
  'reasoning.stale_data.approaching': 'reasoning.stale_data.approaching',
  'reasoning.stale_data.stale': 'reasoning.stale_data.stale',
  'reasoning.recurring_expense.pattern': 'reasoning.recurring_expense.pattern',
  'reasoning.recurring_expense.confidence': 'reasoning.recurring_expense.confidence',
} as const;

// ─── Confidence Keys (4 levels) ──────────────────────────────────────────

const CONFIDENCE_KEYS = {
  'confidence.high.label': 'confidence.high.label',
  'confidence.medium.label': 'confidence.medium.label',
  'confidence.low.label': 'confidence.low.label',
  'confidence.none.label': 'confidence.none.label',
} as const;

// ─── Status Keys (5 states) ──────────────────────────────────────────────

const STATUS_KEYS = {
  'status.new.label': 'status.new.label',
  'status.reviewed.label': 'status.reviewed.label',
  'status.investigating.label': 'status.investigating.label',
  'status.snoozed.label': 'status.snoozed.label',
  'status.resolved.label': 'status.resolved.label',
} as const;

// ─── Combined Registry ───────────────────────────────────────────────────

/**
 * Exhaustive localization key registry. Every key emitted by the intelligence
 * layer MUST exist in this constant. Governance tests validate completeness.
 */
export const LOCALIZATION_KEYS = {
  ...SIGNAL_KEYS,
  ...ALERT_KEYS,
  ...ASSISTANT_KEYS,
  ...INSIGHT_KEYS,
  ...REASONING_KEYS,
  ...CONFIDENCE_KEYS,
  ...STATUS_KEYS,
} as const;

/**
 * Union type of all valid localization keys.
 * Use this to type-check any key reference at compile time.
 */
export type LocalizationKey = keyof typeof LOCALIZATION_KEYS;
