import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QK } from '@/lib/query-keys';
import {
  transactionsApi,
  type CreateTransactionPayload,
  type ListTransactionsParams,
} from './transactions.api';

/**
 * Re-exports for backwards compatibility — feature code should now import
 * from `@/lib/query-keys` directly.
 */
export const TRANSACTIONS_KEY = QK.transactions.all;
export const DASHBOARD_KEY = QK.dashboard.all;

export const useTransactions = (params: ListTransactionsParams = {}) =>
  useQuery({
    queryKey: [...QK.transactions.all, params],
    queryFn: () => transactionsApi.list(params),
    staleTime: 30_000,
  });

const invalidateTransactionViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QK.transactions.all });
  qc.invalidateQueries({ queryKey: QK.dashboard.all });
  qc.invalidateQueries({ queryKey: QK.alerts.all });
};

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsApi.create(payload),
    onSuccess: () => invalidateTransactionViews(qc),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => invalidateTransactionViews(qc),
  });
};
