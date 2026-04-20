import { api } from '@/lib/api';
import type { DashboardMetrics, Insight } from '@/types/domain';

export type DashboardRange = 'this_month' | 'last_month' | 'last_30_days' | 'all';

export const dashboardApi = {
  async metrics(range: DashboardRange = 'this_month'): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics', { params: { range } });
    return data;
  },
  async insights(range: DashboardRange = 'this_month'): Promise<Insight[]> {
    const { data } = await api.get<{ insights: Insight[] }>('/dashboard/insights', { params: { range } });
    return data.insights;
  },
};
