import { api } from '@/lib/api';
import type { DashboardMetrics, Insight } from '@/types/domain';
import type { DashboardFilters } from '../types';

export interface AssistantAction {
  label: string;
  type: 'filter' | 'navigate';
  payload: Record<string, string>;
}

export interface AssistantNote {
  id: string;
  kind: string;
  title: string;
  message: string;
  metric?: string;
  tone: 'positive' | 'neutral' | 'warning' | 'negative';
  priority: 'high' | 'normal';
  action?: AssistantAction;
}

export interface AssistantDigest {
  generatedAt: string;
  headline: string;
  notes: AssistantNote[];
}

export const dashboardApi = {
  async assistant(signalKey?: string): Promise<AssistantDigest> {
    const params: Record<string, string> = {};
    if (signalKey) params.signalKey = signalKey;
    const { data } = await api.get<AssistantDigest>('/dashboard/assistant', { params });
    return data;
  },

  async metrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const params: Record<string, string | number | boolean | string[] | undefined> = { range: filters.range };
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
    const params: Record<string, string | number | boolean | string[] | undefined> = { range: filters.range };
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
