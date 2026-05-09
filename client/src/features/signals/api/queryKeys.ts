export const signalKeys = {
  all: ['signals'] as const,
  lists: () => [...signalKeys.all, 'list'] as const,
  list: (filters: string) => [...signalKeys.lists(), { filters }] as const,
  details: () => [...signalKeys.all, 'detail'] as const,
  detail: (id: string) => [...signalKeys.details(), id] as const,
  byKey: (key: string) => [...signalKeys.all, 'by-key', key] as const,
};

export const insightKeys = {
  all: ['insights'] as const,
  dashboard: (filters: string) => [...insightKeys.all, 'dashboard', { filters }] as const,
};
