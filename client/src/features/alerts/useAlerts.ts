import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from './alerts.api';

export const ALERTS_KEY = ['alerts'] as const;

export const useAlerts = () =>
  useQuery({
    queryKey: ALERTS_KEY,
    queryFn: alertsApi.list,
    // Refresh in the background — engagement signal.
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });

const invalidate = (qc: ReturnType<typeof useQueryClient>) =>
  qc.invalidateQueries({ queryKey: ALERTS_KEY });

export const useMarkAlertRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => invalidate(qc),
  });
};

export const useMarkAllAlertsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => invalidate(qc),
  });
};

export const useDismissAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.dismiss(id),
    onSuccess: () => invalidate(qc),
  });
};
