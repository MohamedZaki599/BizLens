import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { widgetsApi } from '../api/widgets.api';
import { dashboardKeys } from '../utils/queryKeys';
import { useDashboardFilters } from '../store/selectors';

export const useDashboardMetrics = () => {
  const filters = useDashboardFilters();
  return useQuery({
    queryKey: dashboardKeys.metrics(filters),
    queryFn: () => dashboardApi.metrics(filters),
    staleTime: 30_000,
  });
};

export const useDashboardInsights = () => {
  const filters = useDashboardFilters();
  return useQuery({
    queryKey: dashboardKeys.insights(filters),
    queryFn: () => dashboardApi.insights(filters),
    staleTime: 60_000,
  });
};

export const useForecast = () => {
  const filters = useDashboardFilters();
  return useQuery({
    queryKey: dashboardKeys.forecast(filters),
    queryFn: () => widgetsApi.forecast(filters),
    staleTime: 60_000,
  });
};

export const useMoneyLeak = () => {
  const filters = useDashboardFilters();
  return useQuery({
    queryKey: dashboardKeys.moneyLeak(filters),
    queryFn: () => widgetsApi.moneyLeak(filters),
    staleTime: 60_000,
  });
};

export const useWeeklySummary = () =>
  useQuery({
    queryKey: dashboardKeys.weeklySummary(),
    queryFn: widgetsApi.weeklySummary,
    staleTime: 60_000,
  });

export const useActivityStatus = () =>
  useQuery({
    queryKey: dashboardKeys.activity(),
    queryFn: widgetsApi.activity,
    staleTime: 30_000,
  });

export const useExpenseTrend = () =>
  useQuery({
    queryKey: dashboardKeys.expenseTrend(),
    queryFn: widgetsApi.expenseTrend,
    staleTime: 120_000,
  });

export const useExpenseComposition = () => {
  const filters = useDashboardFilters();
  return useQuery({
    queryKey: dashboardKeys.expenseComposition(filters),
    queryFn: () => widgetsApi.expenseComposition(filters),
    staleTime: 60_000,
  });
};

export const useSubscriptions = () =>
  useQuery({
    queryKey: dashboardKeys.subscriptions(),
    queryFn: widgetsApi.subscriptions,
    staleTime: 120_000,
  });

export const useBudgets = () =>
  useQuery({
    queryKey: dashboardKeys.budgets(),
    queryFn: widgetsApi.budgets,
    staleTime: 30_000,
  });

export const useBudgetSuggestions = () =>
  useQuery({
    queryKey: dashboardKeys.budgetSuggestions(),
    queryFn: widgetsApi.budgetSuggestions,
    staleTime: 5 * 60_000,
  });

export const useAssistantDigest = () =>
  useQuery({
    queryKey: dashboardKeys.assistant(),
    queryFn: widgetsApi.assistant,
    staleTime: 60_000,
  });
