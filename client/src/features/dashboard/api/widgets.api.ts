import { api } from '@/lib/api';
import type {
  ActivityStatus,
  Forecast,
  MoneyLeak,
  WeeklySummary,
} from '@/types/domain';
import type { DashboardFilters } from '../types';

export interface ExpenseTrendMonth {
  month: string;
  income: number;
  expense: number;
}

export interface ExpenseCompositionItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  share: number;
}

export interface SubscriptionItem {
  name: string;
  category: { id: string; name: string; color: string | null };
  monthlyCost: number;
  annualCost: number;
  monthsDetected: number;
  lastChargedAt: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  category: { id: string; name: string; color: string | null; type: string };
  limit: number;
  used: number;
  remaining: number;
  usedPct: number;
  exceeded: boolean;
}

export interface SuggestedBudget {
  category: { id: string; name: string; color: string | null };
  averageMonthly: number;
  suggested: number;
  monthsObserved: number;
}

export interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  duplicateRows: Array<{
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    categoryId: string;
    description: string | null;
  }>;
}

export type AssistantTone = 'positive' | 'neutral' | 'warning' | 'negative';
export type AssistantPriority = 'high' | 'normal';

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
  localized?: {
    titleKey: string;
    titleParams?: Record<string, string | number>;
    messageKey: string;
    messageParams?: Record<string, string | number>;
  };
  action?: {
    label: string;
    labelKey?: string;
    type: 'filter' | 'navigate';
    payload: Record<string, string>;
  };
}

export interface AssistantDigest {
  generatedAt: string;
  headline: string;
  headlineKey?: string;
  headlineParams?: Record<string, string | number>;
  notes: AssistantNote[];
}

const buildParams = (filters?: DashboardFilters) => {
  if (!filters) return {};
  const params: Record<string, string | number | boolean | string[] | undefined> = { range: filters.range };
  if (filters.range === 'custom' && filters.customRange) {
    params.startDate = filters.customRange.startDate;
    params.endDate = filters.customRange.endDate;
  }
  if (filters.channels?.length) params.channels = filters.channels.join(',');
  if (filters.segments?.length) params.segments = filters.segments.join(',');
  if (filters.search) params.search = filters.search;
  return params;
};

export const widgetsApi = {
  async forecast(filters?: DashboardFilters): Promise<Forecast> {
    const { data } = await api.get<Forecast>('/dashboard/forecast', { params: buildParams(filters) });
    return data;
  },
  async moneyLeak(filters?: DashboardFilters): Promise<MoneyLeak | null> {
    const { data } = await api.get<{ leak: MoneyLeak | null }>('/dashboard/money-leak', { params: buildParams(filters) });
    return data.leak;
  },
  async weeklySummary(): Promise<WeeklySummary> {
    const { data } = await api.get<WeeklySummary>('/dashboard/weekly-summary');
    return data;
  },
  async activity(): Promise<ActivityStatus> {
    const { data } = await api.get<ActivityStatus>('/dashboard/activity');
    return data;
  },
  async expenseTrend(): Promise<ExpenseTrendMonth[]> {
    const { data } = await api.get<{ months: ExpenseTrendMonth[] }>('/dashboard/expense-trend');
    return data.months;
  },
  async expenseComposition(filters?: DashboardFilters): Promise<ExpenseCompositionItem[]> {
    const { data } = await api.get<{ categories: ExpenseCompositionItem[] }>('/dashboard/expense-composition', { params: buildParams(filters) });
    return data.categories;
  },
  async subscriptions(): Promise<{ subscriptions: SubscriptionItem[]; totalMonthly: number; totalAnnual: number }> {
    const { data } = await api.get('/dashboard/subscriptions');
    return data;
  },
  async budgets(): Promise<{ budgets: BudgetItem[] }> {
    const { data } = await api.get('/dashboard/budgets');
    return data;
  },
  async budgetSuggestions(): Promise<{ suggestions: SuggestedBudget[] }> {
    const { data } = await api.get('/dashboard/budgets/suggestions');
    return data;
  },
  async createBudget(categoryId: string, amount: number): Promise<void> {
    await api.post('/dashboard/budgets', { categoryId, amount });
  },
  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/dashboard/budgets/${id}`);
  },
  async importTransactions(
    transactions: Array<{
      amount: number;
      type: 'INCOME' | 'EXPENSE';
      date: string;
      description?: string;
      categoryId: string;
    }>,
    options: { skipDuplicates?: boolean } = {},
  ): Promise<ImportResult> {
    const { data } = await api.post('/dashboard/import', {
      transactions,
      ...(options.skipDuplicates !== undefined ? { skipDuplicates: options.skipDuplicates } : {}),
    });
    return data;
  },
  async assistant(signalKey?: string): Promise<AssistantDigest> {
    const params: Record<string, string> = {};
    if (signalKey) params.signalKey = signalKey;
    const { data } = await api.get<AssistantDigest>('/dashboard/assistant', { params });
    return data;
  },
};
