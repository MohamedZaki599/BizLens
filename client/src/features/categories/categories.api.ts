import { api } from '@/lib/api';
import type { Category, TransactionType } from '@/types/domain';

export interface CreateCategoryPayload {
  name: string;
  type: TransactionType;
  color?: string;
}

export const categoriesApi = {
  async list(type?: TransactionType): Promise<Category[]> {
    const { data } = await api.get<{ categories: Category[] }>('/categories', {
      params: type ? { type } : undefined,
    });
    return data.categories;
  },
  async create(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await api.post<{ category: Category }>('/categories', payload);
    return data.category;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
