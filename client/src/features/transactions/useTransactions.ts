import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transactionsApi,
  type CreateTransactionPayload,
  type ListTransactionsParams,
} from './transactions.api';

export const TRANSACTIONS_KEY = ['transactions'] as const;
export const DASHBOARD_KEY = ['dashboard'] as const;

export const useTransactions = (params: ListTransactionsParams = {}) =>
  useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => transactionsApi.list(params),
    staleTime: 30_000,
  });

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
  qc.invalidateQueries({ queryKey: DASHBOARD_KEY });
};

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionsApi.create(payload),
    onSuccess: () => invalidateAll(qc),
  });
};

export const useDeleteTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => invalidateAll(qc),
  });
};
