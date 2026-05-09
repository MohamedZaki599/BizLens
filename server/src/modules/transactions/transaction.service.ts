import { Prisma, prisma } from '@bizlens/database';
import { HttpError } from '../../utils/http-error';
import { evaluateInBackground } from '../../services/alert-engine/alert-engine';
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from './transaction.schemas';

const touchActivity = (userId: string): void => {
  // Track user activity so the stale-data rule and re-engagement banners work.
  prisma.user
    .update({ where: { id: userId }, data: { lastActivityAt: new Date() } })
    .catch(() => undefined);
};

const include = {
  category: { select: { id: true, name: true, type: true, color: true } },
} as const;

const ensureCategoryBelongsToUser = async (
  userId: string,
  categoryId: string,
  type?: 'INCOME' | 'EXPENSE',
) => {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw HttpError.badRequest('Selected category does not exist for this user.');
  if (type && category.type !== type) {
    throw HttpError.badRequest(
      `Category type (${category.type}) does not match transaction type (${type}).`,
    );
  }
  return category;
};

export const transactionService = {
  async list(userId: string, q: ListTransactionsQuery) {
    const where: Prisma.TransactionWhereInput = { userId };
    if (q.type) where.type = q.type;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.from || q.to) {
      where.date = {};
      if (q.from) where.date.gte = new Date(q.from);
      if (q.to) where.date.lte = new Date(q.to);
    }

    const items = await prisma.transaction.findMany({
      where,
      include,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: q.limit + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (items.length > q.limit) {
      const next = items.pop();
      nextCursor = next?.id ?? null;
    }

    return { items, nextCursor };
  },

  async create(userId: string, input: CreateTransactionInput) {
    await ensureCategoryBelongsToUser(userId, input.categoryId, input.type);
    const created = await prisma.transaction.create({
      data: {
        userId,
        categoryId: input.categoryId,
        amount: new Prisma.Decimal(input.amount),
        type: input.type,
        date: new Date(input.date),
        description: input.description,
      },
      include,
    });
    touchActivity(userId);
    evaluateInBackground(userId);
    return created;
  },

  async update(userId: string, id: string, input: UpdateTransactionInput) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw HttpError.notFound('Transaction not found');

    if (input.categoryId || input.type) {
      const nextCategoryId = input.categoryId ?? existing.categoryId;
      const nextType = input.type ?? existing.type;
      await ensureCategoryBelongsToUser(userId, nextCategoryId, nextType);
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...(input.amount !== undefined ? { amount: new Prisma.Decimal(input.amount) } : {}),
        ...(input.type ? { type: input.type } : {}),
        ...(input.date ? { date: new Date(input.date) } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      },
      include,
    });
    touchActivity(userId);
    evaluateInBackground(userId);
    return updated;
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) throw HttpError.notFound('Transaction not found');
    await prisma.transaction.delete({ where: { id } });
    evaluateInBackground(userId);
    return { ok: true };
  },
};
