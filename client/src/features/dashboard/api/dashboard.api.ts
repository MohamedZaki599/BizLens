import { api } from '@/lib/api';
import type { DashboardMetrics, Insight } from '@/types/domain';
import type { DashboardFilters } from '../types';

export const dashboardApi = {
  async metrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const params: Record<string, any> = { range: filters.range };
    if (filters.range === 'custom' && filters.customRange) {
      params.startDate = filters.customRange.startDate;
      params.endDate = filters.customRange.endDate;
    }
    if (filters.channels?.length) params.channels = filters.channels.join(',');
    if (filters.segments?.length) params.segments = filters.segments.join(',');
    if (filters.search) params.search = filters.search;

    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics', { params });
    return data;
  },
  
  async insights(filters: DashboardFilters): Promise<Insight[]> {
    const params: Record<string, any> = { range: filters.range };
    if (filters.range === 'custom' && filters.customRange) {
      params.startDate = filters.customRange.startDate;
      params.endDate = filters.customRange.endDate;
    }
    if (filters.channels?.length) params.channels = filters.channels.join(',');
    if (filters.segments?.length) params.segments = filters.segments.join(',');
    if (filters.search) params.search = filters.search;

    const { data } = await api.get<{ insights: Insight[] }>('/dashboard/insights', { params });
    return data.insights;
  },
};
