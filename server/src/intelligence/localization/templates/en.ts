/**
 * English message templates for financial signals.
 *
 * Signals are language-agnostic (numeric data only).
 * This module generates human-readable text at the API boundary.
 */

import type { FinancialSignal } from '../../signals/signal.types';
import { formatMoney, formatPctChange } from '../../../utils/safe-math';

type MessageTemplate = (signal: FinancialSignal) => string;

const m = (signal: FinancialSignal) => signal.metadata as Record<string, any>;

export const en: Record<string, MessageTemplate> = {
  PROFIT_MARGIN: (s) =>
    s.value >= 0
      ? `Your profit margin is ${s.value}%.`
      : `You're operating at a ${Math.abs(s.value)}% loss margin.`,

  REVENUE_GROWTH: (s) =>
    s.confidence === 0
      ? `No prior month to compare revenue against.`
      : `Revenue is ${s.trend} ${formatPctChange(s.value)} versus last month.`,

  EXPENSE_GROWTH: (s) =>
    s.confidence === 0
      ? `No prior month to compare expenses against.`
      : `Expenses are ${s.trend} ${formatPctChange(s.value)} versus last month.`,

  PROFIT_TREND: (s) =>
    m(s).isDropping
      ? `Profit is down ${formatPctChange(Math.abs(s.value))} versus last month (${formatMoney(
          m(s).currentProfit,
        )} vs ${formatMoney(m(s).previousProfit)}).`
      : `Profit is up ${formatPctChange(s.value)} versus last month.`,

  BURN_RATE: (s) =>
    `You're spending about ${formatMoney(s.value)} per day.`,

  EXPENSE_RATIO: (s) =>
    s.value >= 1
      ? `You're spending more than you earn (expense-to-income ratio: ${s.value}).`
      : `Your expense-to-income ratio is ${s.value} (${Math.round(s.value * 100)}% of earnings).`,

  TOP_EXPENSE_CATEGORY: (s) =>
    `${m(s).categoryName} is your largest expense at ${m(s).sharePct}% of total spend.`,

  TOP_INCOME_CATEGORY: (s) =>
    `${m(s).categoryName} drives ${m(s).sharePct}% of your revenue.`,

  CATEGORY_CONCENTRATION: (s) =>
    `${m(s).categoryName} accounts for ${s.value}% of spending — consider diversifying.`,

  SPEND_SPIKE: (s) =>
    `${m(s).categoryName} spending spiked ${formatPctChange(s.value)} above its baseline (${formatMoney(
      m(s).currentAmount,
    )} vs ~${formatMoney(m(s).baselineAvg)} average).`,

  WEEKLY_SPEND_CHANGE: (s) =>
    s.confidence === 0
      ? `No prior week to compare spending against.`
      : `Weekly spending is ${s.trend} ${formatPctChange(s.value)} (${formatMoney(
          m(s).thisWeek,
        )} vs ${formatMoney(m(s).lastWeek)} last week).`,

  PROJECTED_EXPENSE: (s) =>
    m(s).isOverspending
      ? `On track to spend ${formatMoney(s.value)} this month — ${formatPctChange(
          m(s).vsLastMonth,
        )} versus last month.`
      : `Projected expenses for the month: ${formatMoney(s.value)}.`,

  PROJECTED_INCOME: (s) =>
    `Projected income for the month: ${formatMoney(s.value)}.`,

  PROJECTED_PROFIT: (s) =>
    s.value >= 0
      ? `Projected profit: ${formatMoney(s.value)}.`
      : `On track for a ${formatMoney(Math.abs(s.value))} loss this month.`,

  CASH_RUNWAY_DAYS: (s) =>
    s.value <= 3
      ? `At the current rate, cash runs out in ${s.value} days.`
      : `Cash runway: approximately ${s.value} days at current pace.`,

  SPENDING_ANOMALY: (s) =>
    `${m(s).categoryName} is ${formatPctChange(s.value)} above its 3-month average — worth a closer look.`,

  STALE_DATA: (s) =>
    s.value >= 7
      ? `It's been ${s.value} days since your last transaction. Update your data to keep insights accurate.`
      : `You haven't logged a transaction in ${s.value} days — add the latest to keep trends fresh.`,

  RECURRING_EXPENSE: (s) =>
    `${m(s).categoryName} of about ${formatMoney(s.value)} repeats monthly (detected across ${
      m(s).monthsDetected
    } months).`,
};
