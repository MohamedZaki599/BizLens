import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TransactionType } from '@/types/domain';
import { categoriesApi, type CreateCategoryPayload } from './categories.api';

export const CATEGORIES_KEY = ['categories'] as const;

export const useCategories = (type?: TransactionType) =>
  useQuery({
    queryKey: [...CATEGORIES_KEY, type ?? 'all'],
    queryFn: () => categoriesApi.list(type),
    staleTime: 60_000,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
};
