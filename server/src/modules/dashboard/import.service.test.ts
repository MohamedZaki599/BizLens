import '../../test/setup-env';
import test from 'node:test';
import assert from 'node:assert/strict';
import { ImportSchema, IMPORT_MAX_ROWS } from './import.service';

const baseRow = {
  amount: 12.5,
  type: 'EXPENSE' as const,
  date: '2026-01-15',
  description: 'Coffee',
  categoryId: '11111111-1111-1111-1111-111111111111',
};

test('ImportSchema accepts a minimal valid row', () => {
  const result = ImportSchema.safeParse({ transactions: [baseRow] });
  assert.equal(result.success, true);
});

test('ImportSchema rejects a non-positive amount', () => {
  const result = ImportSchema.safeParse({
    transactions: [{ ...baseRow, amount: 0 }],
  });
  assert.equal(result.success, false);
});

test('ImportSchema rejects an unparseable date', () => {
  const result = ImportSchema.safeParse({
    transactions: [{ ...baseRow, date: 'not a date' }],
  });
  assert.equal(result.success, false);
});

test('ImportSchema rejects a malformed categoryId', () => {
  const result = ImportSchema.safeParse({
    transactions: [{ ...baseRow, categoryId: 'cat-1' }],
  });
  assert.equal(result.success, false);
});

test('ImportSchema rejects an empty payload', () => {
  const result = ImportSchema.safeParse({ transactions: [] });
  assert.equal(result.success, false);
});

test(`ImportSchema enforces the ${IMPORT_MAX_ROWS}-row cap`, () => {
  const tooMany = Array.from({ length: IMPORT_MAX_ROWS + 1 }, () => baseRow);
  const result = ImportSchema.safeParse({ transactions: tooMany });
  assert.equal(result.success, false);
});

test('ImportSchema rejects unknown transaction types', () => {
  const result = ImportSchema.safeParse({
    transactions: [{ ...baseRow, type: 'TRANSFER' as unknown as 'INCOME' }],
  });
  assert.equal(result.success, false);
});

test('ImportSchema defaults skipDuplicates to true when omitted', () => {
  const result = ImportSchema.safeParse({ transactions: [baseRow] });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.skipDuplicates, true);
  }
});

test('ImportSchema honors an explicit skipDuplicates=false flag', () => {
  const result = ImportSchema.safeParse({
    transactions: [baseRow],
    skipDuplicates: false,
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.skipDuplicates, false);
  }
});
