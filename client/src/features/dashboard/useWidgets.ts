import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QK } from '@/lib/query-keys';
import { widgetsApi } from './widgets.api';
import type { DashboardRange } from './dashboard.api';

export const useForecast = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'forecast', range],
    queryFn: () => widgetsApi.forecast(range),
    staleTime: 60_000,
  });

export const useMoneyLeak = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'money-leak', range],
    queryFn: () => widgetsApi.moneyLeak(range),
    staleTime: 60_000,
  });

export const useWeeklySummary = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'weekly-summary'],
    queryFn: widgetsApi.weeklySummary,
    staleTime: 60_000,
  });

export const useActivityStatus = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'activity'],
    queryFn: widgetsApi.activity,
    staleTime: 30_000,
  });

export const useExpenseTrend = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'expense-trend'],
    queryFn: widgetsApi.expenseTrend,
    staleTime: 120_000,
  });

export const useExpenseComposition = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'expense-composition', range],
    queryFn: () => widgetsApi.expenseComposition(range),
    staleTime: 60_000,
  });

export const useSubscriptions = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'subscriptions'],
    queryFn: widgetsApi.subscriptions,
    staleTime: 120_000,
  });

export const useBudgets = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'budgets'],
    queryFn: widgetsApi.budgets,
    staleTime: 30_000,
  });

export const useBudgetSuggestions = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'budget-suggestions'],
    queryFn: widgetsApi.budgetSuggestions,
    staleTime: 5 * 60_000,
  });

export const useAssistantDigest = () =>
  useQuery({
    queryKey: [...QK.dashboard.all, 'assistant'],
    queryFn: widgetsApi.assistant,
    staleTime: 60_000,
  });

const invalidateDataViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QK.dashboard.all });
  qc.invalidateQueries({ queryKey: QK.transactions.all });
  qc.invalidateQueries({ queryKey: QK.alerts.all });
};

const invalidateBudgetViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QK.dashboard.all });
  // Budget changes can trigger or clear alerts (over-budget rule), and
  // suggestions exclude already-budgeted categories — refresh both.
  qc.invalidateQueries({ queryKey: QK.alerts.all });
};

export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, amount }: { categoryId: string; amount: number }) =>
      widgetsApi.createBudget(categoryId, amount),
    onSuccess: () => invalidateBudgetViews(qc),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => widgetsApi.deleteBudget(id),
    onSuccess: () => invalidateBudgetViews(qc),
  });
};

export interface ImportPayload {
  transactions: Array<{
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description?: string;
    categoryId: string;
  }>;
  skipDuplicates?: boolean;
}

export const useImportTransactions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transactions, skipDuplicates }: ImportPayload) =>
      widgetsApi.importTransactions(transactions, { skipDuplicates }),
    // Import touches transactions, dashboards, and alert evaluation. Invalidate
    // every consumer so the UI immediately reflects the new rows.
    onSuccess: () => invalidateDataViews(qc),
  });
};
