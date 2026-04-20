import { z } from 'zod';

export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE']);

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  type: TransactionTypeEnum,
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, 'Color must be a hex value')
    .optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const ListCategoriesQuerySchema = z.object({
  type: TransactionTypeEnum.optional(),
});

export const CategoryParamsSchema = z.object({ id: z.string().uuid() });
