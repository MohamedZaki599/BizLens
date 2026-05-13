import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type AssistantDigest } from '../api/dashboard.api';

export function useAssistantQuery(signalKey?: string | null) {
  return useQuery<AssistantDigest>({
    queryKey: ['assistant', signalKey ?? ''],
    queryFn: () => dashboardApi.assistant(signalKey || undefined),
    staleTime: 60_000,
    enabled: true,
  });
}
