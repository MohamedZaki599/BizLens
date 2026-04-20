import { api } from '@/lib/api';
import type { Category, Transaction, TransactionType } from '@/types/domain';

export interface CreateTransactionPayload {
  amount: number;
  type: TransactionType;
  date: string;
  description?: string;
  categoryId: string;
}

export interface ListTransactionsParams {
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  cursor?: string;
}

export const transactionsApi = {
  async list(
    params: ListTransactionsParams = {},
  ): Promise<{ items: Transaction[]; nextCursor: string | null }> {
    const { data } = await api.get<{ items: Transaction[]; nextCursor: string | null }>(
      '/transactions',
      { params },
    );
    return data;
  },
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const { data } = await api.post<{ transaction: Transaction }>('/transactions', payload);
    return data.transaction;
  },
  async update(id: string, payload: Partial<CreateTransactionPayload>): Promise<Transaction> {
    const { data } = await api.patch<{ transaction: Transaction }>(`/transactions/${id}`, payload);
    return data.transaction;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },
  /** Smart category pre-fill — returns the user's most recently used category for a type. */
  async suggestedCategory(type: TransactionType): Promise<Category | null> {
    const { data } = await api.get<{ category: Category | null }>('/dashboard/suggested-category', {
      params: { type },
    });
    return data.category;
  },
};
