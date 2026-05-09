import { create } from 'zustand';
import type { DashboardState, DashboardFilters, CustomDateRange, DashboardRange } from '../types';

export const defaultFilters: DashboardFilters = {
  range: 'this_month',
};

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: defaultFilters,
  ui: {
    isFiltersExpanded: false,
  },

  setRange: (range: DashboardRange | 'custom') =>
    set((state) => ({ filters: { ...state.filters, range } })),

  setCustomRange: (customRange: CustomDateRange) =>
    set((state) => ({ filters: { ...state.filters, customRange, range: 'custom' } })),

  setChannels: (channels: string[]) =>
    set((state) => ({ filters: { ...state.filters, channels } })),

  setSegments: (segments: string[]) =>
    set((state) => ({ filters: { ...state.filters, segments } })),

  setSearch: (search: string) =>
    set((state) => ({ filters: { ...state.filters, search } })),

  setFilters: (filters: Partial<DashboardFilters>) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  toggleFiltersExpanded: () =>
    set((state) => ({ ui: { ...state.ui, isFiltersExpanded: !state.ui.isFiltersExpanded } })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
