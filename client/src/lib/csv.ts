import type { TransactionType } from '@/types/domain';

export interface ParsedRow {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  categoryId: string;
}

export interface ParseRowResult {
  ok: boolean;
  row?: ParsedRow;
  error?: 'amount' | 'date' | 'category';
}

export interface CsvMapping {
  amount: string;
  type: string;
  date: string;
  description: string;
}

/**
 * Validates a date string by parsing and round-tripping. Returns the ISO
 * representation when parsing succeeds, otherwise null. We never construct
 * unsafe `new Date(undefined)` values that ToISOString would silently turn
 * into "Invalid Date" strings.
 */
export const parseDateSafe = (value: string | undefined | null): string | null => {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const TYPE_MAP: Record<string, TransactionType> = {
  INCOME: 'INCOME',
  IN: 'INCOME',
  CREDIT: 'INCOME',
  REVENUE: 'INCOME',
  EARNINGS: 'INCOME',
  EXPENSE: 'EXPENSE',
  OUT: 'EXPENSE',
  DEBIT: 'EXPENSE',
  COST: 'EXPENSE',
  SPEND: 'EXPENSE',
};

const detectType = (raw: string | undefined): TransactionType => {
  const normalized = (raw ?? '').toString().trim().toUpperCase();
  return TYPE_MAP[normalized] ?? 'EXPENSE';
};

/**
 * Convert a single CSV row into a `ParsedRow` (or report why it was skipped).
 * Skips rows with non-numeric amounts, non-positive amounts, missing/invalid
 * dates, or no resolved category.
 */
export const parseCsvRow = (
  row: Record<string, string>,
  mapping: CsvMapping,
  defaultCategoryId: string,
): ParseRowResult => {
  const amt = parseFloat(row[mapping.amount] ?? '');
  if (!Number.isFinite(amt) || amt <= 0) return { ok: false, error: 'amount' };

  const date = parseDateSafe(row[mapping.date]);
  if (!date) return { ok: false, error: 'date' };

  if (!defaultCategoryId) return { ok: false, error: 'category' };

  return {
    ok: true,
    row: {
      amount: Number(amt.toFixed(2)),
      type: detectType(row[mapping.type]),
      date,
      description: (row[mapping.description] ?? '').toString().trim(),
      categoryId: defaultCategoryId,
    },
  };
};

export interface ParseSummary {
  rows: ParsedRow[];
  total: number;
  skipped: { amount: number; date: number; category: number };
}

export const parseCsvRows = (
  raw: Record<string, string>[],
  mapping: CsvMapping,
  defaultCategoryId: string,
): ParseSummary => {
  const summary: ParseSummary = {
    rows: [],
    total: raw.length,
    skipped: { amount: 0, date: 0, category: 0 },
  };

  for (const row of raw) {
    const result = parseCsvRow(row, mapping, defaultCategoryId);
    if (result.ok && result.row) {
      summary.rows.push(result.row);
    } else if (result.error) {
      summary.skipped[result.error] += 1;
    }
  }

  return summary;
};
