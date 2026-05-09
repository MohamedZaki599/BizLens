import type { DashboardFilters, DashboardRange } from '../types';
import { defaultFilters } from '../store/dashboardStore';

export const serializeDashboardFilters = (filters: DashboardFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.range && filters.range !== defaultFilters.range) {
    params.set('range', filters.range);
  }

  if (filters.range === 'custom' && filters.customRange) {
    params.set('startDate', filters.customRange.startDate);
    params.set('endDate', filters.customRange.endDate);
  }

  if (filters.channels && filters.channels.length > 0) {
    params.set('channels', filters.channels.join(','));
  }

  if (filters.segments && filters.segments.length > 0) {
    params.set('segments', filters.segments.join(','));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  return params;
};

export const parseDashboardParams = (params: URLSearchParams): DashboardFilters => {
  const filters: DashboardFilters = { ...defaultFilters };

  const range = params.get('range') as DashboardRange | 'custom' | null;
  if (range) {
    filters.range = range;
  }

  if (range === 'custom') {
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    if (startDate && endDate) {
      filters.customRange = { startDate, endDate };
    } else {
      // Fallback if custom dates are missing
      filters.range = defaultFilters.range;
    }
  }

  const channels = params.get('channels');
  if (channels) {
    filters.channels = channels.split(',').filter(Boolean);
  }

  const segments = params.get('segments');
  if (segments) {
    filters.segments = segments.split(',').filter(Boolean);
  }

  const search = params.get('search');
  if (search) {
    filters.search = search;
  }

  return filters;
};

export const normalizeFilters = (filters: DashboardFilters): DashboardFilters => {
  // Sort arrays for deterministic query keys
  return {
    ...filters,
    channels: filters.channels ? [...filters.channels].sort() : undefined,
    segments: filters.segments ? [...filters.segments].sort() : undefined,
  };
};
