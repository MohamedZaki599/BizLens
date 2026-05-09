import { QK } from '@/lib/query-keys';
import type { DashboardFilters } from '../types';
import { normalizeFilters } from './filters';

export const dashboardKeys = {
  all: QK.dashboard.all,
  metrics: (filters: DashboardFilters) => [...dashboardKeys.all, 'metrics', normalizeFilters(filters)] as const,
  insights: (filters: DashboardFilters) => [...dashboardKeys.all, 'insights', normalizeFilters(filters)] as const,
  forecast: (filters: DashboardFilters) => [...dashboardKeys.all, 'forecast', normalizeFilters(filters)] as const,
  moneyLeak: (filters: DashboardFilters) => [...dashboardKeys.all, 'money-leak', normalizeFilters(filters)] as const,
  weeklySummary: () => [...dashboardKeys.all, 'weekly-summary'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
  expenseTrend: () => [...dashboardKeys.all, 'expense-trend'] as const,
  expenseComposition: (filters: DashboardFilters) => [...dashboardKeys.all, 'expense-composition', normalizeFilters(filters)] as const,
  subscriptions: () => [...dashboardKeys.all, 'subscriptions'] as const,
  budgets: () => [...dashboardKeys.all, 'budgets'] as const,
  budgetSuggestions: () => [...dashboardKeys.all, 'budget-suggestions'] as const,
  assistant: () => [...dashboardKeys.all, 'assistant'] as const,
};
