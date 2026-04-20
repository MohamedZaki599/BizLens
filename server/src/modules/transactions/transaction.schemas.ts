import { z } from 'zod';
import { TransactionTypeEnum } from '../categories/category.schemas';

const amount = z.coerce
  .number({ invalid_type_error: 'Amount must be a number' })
  .positive('Amount must be greater than 0')
  .max(99999999.99, 'Amount is too large')
  .refine(
    (n) => Number.isFinite(n) && Math.round(n * 100) / 100 === n,
    'Amount can have at most 2 decimal places',
  );

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be ISO YYYY-MM-DD or full ISO 8601'));

export const CreateTransactionSchema = z.object({
  amount,
  type: TransactionTypeEnum,
  date: isoDate,
  description: z.string().max(280).optional(),
  categoryId: z.string().uuid(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial();

export const ListTransactionsQuerySchema = z.object({
  type: TransactionTypeEnum.optional(),
  categoryId: z.string().uuid().optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  cursor: z.string().uuid().optional(),
});

export const TransactionParamsSchema = z.object({ id: z.string().uuid() });

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof ListTransactionsQuerySchema>;
