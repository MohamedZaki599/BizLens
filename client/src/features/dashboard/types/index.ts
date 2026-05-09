export type DashboardRange = 'this_month' | 'last_month' | 'last_30_days' | 'all';

export interface CustomDateRange {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string;
}

export interface DashboardFilters {
  range: DashboardRange | 'custom';
  customRange?: CustomDateRange;
  channels?: string[];
  segments?: string[];
  search?: string;
}

export interface DashboardUIState {
  isFiltersExpanded: boolean;
}

export interface DashboardState {
  filters: DashboardFilters;
  ui: DashboardUIState;
  
  // Actions
  setRange: (range: DashboardRange | 'custom') => void;
  setCustomRange: (customRange: CustomDateRange) => void;
  setChannels: (channels: string[]) => void;
  setSegments: (segments: string[]) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  toggleFiltersExpanded: () => void;
  resetFilters: () => void;
}
