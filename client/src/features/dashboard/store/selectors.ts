import { useDashboardStore } from './dashboardStore';
import type { DashboardFilters } from '../types';

export const useDashboardFilters = () => useDashboardStore((state) => state.filters);

export const useDashboardFilter = <K extends keyof DashboardFilters>(key: K) =>
  useDashboardStore((state) => state.filters[key]);

export const useDashboardUI = () => useDashboardStore((state) => state.ui);

// Individual action selectors to avoid creating a new object on every render
export const useSetRange = () => useDashboardStore((state) => state.setRange);
export const useSetCustomRange = () => useDashboardStore((state) => state.setCustomRange);
export const useSetChannels = () => useDashboardStore((state) => state.setChannels);
export const useSetSegments = () => useDashboardStore((state) => state.setSegments);
export const useSetSearch = () => useDashboardStore((state) => state.setSearch);
export const useSetFilters = () => useDashboardStore((state) => state.setFilters);
export const useToggleFiltersExpanded = () => useDashboardStore((state) => state.toggleFiltersExpanded);
export const useResetFilters = () => useDashboardStore((state) => state.resetFilters);
