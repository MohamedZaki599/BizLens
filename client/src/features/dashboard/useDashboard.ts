import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type DashboardRange } from './dashboard.api';
import { DASHBOARD_KEY } from '@/features/transactions/useTransactions';

export const useDashboardMetrics = (range: DashboardRange = 'this_month') =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'metrics', range],
    queryFn: () => dashboardApi.metrics(range),
    staleTime: 30_000,
  });

export const useDashboardInsights = (range: DashboardRange = 'this_month') =>
  useQuery({
    queryKey: [...DASHBOARD_KEY, 'insights', range],
    queryFn: () => dashboardApi.insights(range),
    staleTime: 60_000,
  });
