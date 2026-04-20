import type { TransactionType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { HttpError } from '../../utils/http-error';

interface CreateInput {
  name: string;
  type: TransactionType;
  color?: string;
}

interface UpdateInput {
  name?: string;
  type?: TransactionType;
  color?: string;
}

export const categoryService = {
  list(userId: string, type?: TransactionType) {
    return prisma.category.findMany({
      where: { userId, ...(type ? { type } : {}) },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  },

  create(userId: string, input: CreateInput) {
    return prisma.category.create({
      data: { ...input, userId, isDefault: false },
    });
  },

  async update(userId: string, id: string, input: UpdateInput) {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) throw HttpError.notFound('Category not found');
    return prisma.category.update({ where: { id }, data: input });
  },

  async remove(userId: string, id: string) {
    const existing = await prisma.category.findFirst({
      where: { id, userId },
      include: { _count: { select: { transactions: true } } },
    });
    if (!existing) throw HttpError.notFound('Category not found');
    if (existing._count.transactions > 0) {
      throw HttpError.conflict(
        'Cannot delete a category that has transactions. Reassign or delete the transactions first.',
      );
    }
    await prisma.category.delete({ where: { id } });
    return { ok: true };
  },
};
