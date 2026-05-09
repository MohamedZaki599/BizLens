import { Prisma, prisma } from '@bizlens/database';
import { endOfDay, startOfDay } from 'date-fns';
import { z } from 'zod';
import { HttpError } from '../../utils/http-error';

/** Hard cap to keep a single import bounded in memory. */
export const IMPORT_MAX_ROWS = 5000;

const ImportRow = z.object({
  amount: z.number().positive().max(1_000_000_000),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z
    .string()
    .min(1)
    .refine((v) => !Number.isNaN(new Date(v).getTime()), {
      message: 'Invalid date',
    }),
  description: z.string().max(280).optional(),
  categoryId: z.string().uuid(),
});

/**
 * CSV import schema — each row is validated strictly (positive amount,
 * ISO-parseable date, valid type) before any database work happens, so
 * partial / corrupt imports never reach Postgres.
 */
export const ImportSchema = z.object({
  transactions: z
    .array(ImportRow)
    .min(1, 'No rows to import')
    .max(IMPORT_MAX_ROWS, `Import is limited to ${IMPORT_MAX_ROWS} rows at a time`),
  /**
   * When true (default), rows that match an existing transaction on
   * (userId, categoryId, amount, day) are skipped. When false, every row
   * is inserted — useful for users who genuinely have repeating same-day
   * charges they want to preserve (e.g. multiple coffees on a single day).
   */
  skipDuplicates: z.boolean().default(true),
});

export type ImportInput = z.infer<typeof ImportSchema>;
export type ImportRowInput = z.infer<typeof ImportRow>;

export interface ImportResult {
  imported: number;
  duplicatesSkipped: number;
  duplicateRows: Array<{
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    date: string;
    categoryId: string;
    description: string | null;
  }>;
}

const dedupKey = (row: { categoryId: string; amount: number; date: string }) => {
  const day = startOfDay(new Date(row.date)).toISOString();
  // Round to cents so floating-point noise from CSVs doesn't break dedup.
  const cents = Math.round(row.amount * 100);
  return `${row.categoryId}:${day}:${cents}`;
};

export const importTransactions = async (
  userId: string,
  input: ImportInput,
): Promise<ImportResult> => {
  const { transactions, skipDuplicates } = input;
  const catIds = [...new Set(transactions.map((t) => t.categoryId))];
  const validCats = await prisma.category.findMany({
    where: { id: { in: catIds }, userId },
    select: { id: true },
  });
  const validSet = new Set(validCats.map((c) => c.id));
  const invalid = catIds.filter((id) => !validSet.has(id));
  if (invalid.length > 0) {
    throw HttpError.badRequest(`Invalid category IDs: ${invalid.join(', ')}`);
  }

  let rowsToInsert: ImportRowInput[] = transactions;
  const duplicateRows: ImportResult['duplicateRows'] = [];

  if (skipDuplicates) {
    // Bound the duplicate-search window to the rows we actually have, so
    // we never scan the user's entire history.
    const dates = transactions.map((t) => new Date(t.date).getTime());
    const minDate = startOfDay(new Date(Math.min(...dates)));
    const maxDate = endOfDay(new Date(Math.max(...dates)));

    const existing = await prisma.transaction.findMany({
      where: {
        userId,
        categoryId: { in: catIds },
        date: { gte: minDate, lte: maxDate },
      },
      select: { amount: true, categoryId: true, date: true },
    });

    const existingKeys = new Set(
      existing.map((e) =>
        dedupKey({
          categoryId: e.categoryId,
          amount: Number(e.amount),
          date: e.date.toISOString(),
        }),
      ),
    );

    // Also dedup within the import payload itself.
    const seenInBatch = new Set<string>();
    rowsToInsert = [];
    for (const row of transactions) {
      const key = dedupKey(row);
      if (existingKeys.has(key) || seenInBatch.has(key)) {
        duplicateRows.push({
          amount: row.amount,
          type: row.type,
          date: row.date,
          categoryId: row.categoryId,
          description: row.description ?? null,
        });
        continue;
      }
      seenInBatch.add(key);
      rowsToInsert.push(row);
    }
  }

  const result =
    rowsToInsert.length === 0
      ? { count: 0 }
      : await prisma.transaction.createMany({
          data: rowsToInsert.map((t) => ({
            userId,
            categoryId: t.categoryId,
            amount: new Prisma.Decimal(t.amount.toFixed(2)),
            type: t.type,
            date: new Date(t.date),
            description: t.description ?? null,
          })),
        });

  // Best-effort activity touch — never block the import on this.
  await prisma.user
    .update({ where: { id: userId }, data: { lastActivityAt: new Date() } })
    .catch(() => undefined);

  return {
    imported: result.count,
    duplicatesSkipped: duplicateRows.length,
    duplicateRows: duplicateRows.slice(0, 25),
  };
};
