import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QK } from '@/lib/query-keys';
import { widgetsApi } from '../api/widgets.api';

const invalidateDataViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QK.dashboard.all });
  qc.invalidateQueries({ queryKey: QK.transactions.all });
  qc.invalidateQueries({ queryKey: QK.alerts.all });
};

const invalidateBudgetViews = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: QK.dashboard.all });
  qc.invalidateQueries({ queryKey: QK.alerts.all });
};

export const useCreateBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, amount }: { categoryId: string; amount: number }) =>
      widgetsApi.createBudget(categoryId, amount),
    onSuccess: () => invalidateBudgetViews(qc),
  });
};

export const useDeleteBudget = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => widgetsApi.deleteBudget(id),
    onSuccess: () => invalidateBudgetViews(qc),
  });
};

export interface ImportPayload {
  transactions: Array<{
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    description?: string;
    categoryId: string;
  }>;
  skipDuplicates?: boolean;
}

export const useImportTransactions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ transactions, skipDuplicates }: ImportPayload) =>
      widgetsApi.importTransactions(transactions, { skipDuplicates }),
    onSuccess: () => invalidateDataViews(qc),
  });
};
