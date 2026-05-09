import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signalKeys } from '../api/queryKeys';
import { fetchSignals, fetchSignalByKey, forceRecomputeSignals, updateSignalStatus } from '../api/signalsApi';

export const useSignalsQuery = (filters: string = 'default') => {
  return useQuery({
    queryKey: signalKeys.list(filters),
    queryFn: fetchSignals,
    staleTime: 5 * 60 * 1000, // 5 minutes (matches dashboard TTL)
    refetchOnWindowFocus: true,
  });
};

export const useSignalByKeyQuery = (key: string) => {
  return useQuery({
    queryKey: signalKeys.byKey(key),
    queryFn: () => fetchSignalByKey(key),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!key,
  });
};

export const useRecomputeSignalsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: forceRecomputeSignals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signalKeys.all });
    },
  });
};

export const useUpdateSignalStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: { status: string; snoozedUntil?: string | null; resolutionNotes?: string } }) => 
      updateSignalStatus(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signalKeys.all });
    },
  });
};
