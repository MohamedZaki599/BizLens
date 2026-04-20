import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DASHBOARD_KEY } from '@/features/transactions/useTransactions';
import { widgetsApi } from './widgets.api';
import type { DashboardRange } from './dashboard.api';

export const useForecast = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'forecast', range],
    queryFn: () => widgetsApi.forecast(range),
    staleTime: 60_000,
  });

export const useMoneyLeak = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'money-leak', range],
    queryFn: () => widgetsApi.moneyLeak(range),
    staleTime: 60_000,
  });

export const useWeeklySummary = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'weekly-summary'],
    queryFn: widgetsApi.weeklySummary,
    staleTime: 60_000,
  });

export const useActivityStatus = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'activity'],
    queryFn: widgetsApi.activity,
    staleTime: 30_000,
  });

export const useExpenseTrend = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'expense-trend'],
    queryFn: widgetsApi.expenseTrend,
    staleTime: 120_000,
  });

export const useExpenseComposition = (range?: DashboardRange) =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'expense-composition', range],
    queryFn: () => widgetsApi.expenseComposition(range),
    staleTime: 60_000,
  });

export const useSubscriptions = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'subscriptions'],
    queryFn: widgetsApi.subscriptions,
    staleTime: 120_000,
  });

export const useBudgets = () =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'budgets'],
    queryFn: widgetsApi.budgets,
    staleTime: 30_000,
  });

export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, amount }: { categoryId: string; amount: number }) =>
      widgetsApi.createBudget(categoryId, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => widgetsApi.deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
};

export const useImportTransactions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: widgetsApi.importTransactions,
    onSuccess: () => qc.invalidateQueries({ queryKey: DASHBOARD_KEY }),
  });
};
