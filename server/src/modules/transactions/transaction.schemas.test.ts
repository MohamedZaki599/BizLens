import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CreateTransactionSchema,
  ListTransactionsQuerySchema,
  TransactionParamsSchema,
  UpdateTransactionSchema,
} from './transaction.schemas';

const validCategory = '11111111-1111-4111-8111-111111111111';

test('CreateTransactionSchema accepts a minimal valid row', () => {
  const r = CreateTransactionSchema.parse({
    amount: 12.5,
    type: 'EXPENSE',
    date: '2026-04-01',
    categoryId: validCategory,
  });
  assert.equal(r.amount, 12.5);
  assert.equal(r.type, 'EXPENSE');
  assert.equal(r.categoryId, validCategory);
});

test('CreateTransactionSchema coerces numeric strings', () => {
  const r = CreateTransactionSchema.parse({
    amount: '99.99',
    type: 'INCOME',
    date: '2026-04-01',
    categoryId: validCategory,
  });
  assert.equal(r.amount, 99.99);
});

test('CreateTransactionSchema rejects amounts with > 2 decimals', () => {
  assert.throws(() =>
    CreateTransactionSchema.parse({
      amount: 1.234,
      type: 'EXPENSE',
      date: '2026-04-01',
      categoryId: validCategory,
    }),
  );
});

test('CreateTransactionSchema rejects non-positive amounts', () => {
  for (const bad of [0, -1, -0.01]) {
    assert.throws(() =>
      CreateTransactionSchema.parse({
        amount: bad,
        type: 'EXPENSE',
        date: '2026-04-01',
        categoryId: validCategory,
      }),
    );
  }
});

test('CreateTransactionSchema accepts both date-only and full ISO timestamps', () => {
  for (const date of ['2026-04-01', '2026-04-01T12:34:56.000Z', '2026-04-01T12:34:56+02:00']) {
    const r = CreateTransactionSchema.parse({
      amount: 10,
      type: 'EXPENSE',
      date,
      categoryId: validCategory,
    });
    assert.equal(r.date, date);
  }
});

test('CreateTransactionSchema rejects malformed dates', () => {
  for (const date of ['2026/04/01', '04-01-2026', 'yesterday', '']) {
    assert.throws(() =>
      CreateTransactionSchema.parse({
        amount: 10,
        type: 'EXPENSE',
        date,
        categoryId: validCategory,
      }),
    );
  }
});

test('CreateTransactionSchema rejects malformed categoryId', () => {
  assert.throws(() =>
    CreateTransactionSchema.parse({
      amount: 10,
      type: 'EXPENSE',
      date: '2026-04-01',
      categoryId: 'not-a-uuid',
    }),
  );
});

test('CreateTransactionSchema clamps description max length', () => {
  const tooLong = 'x'.repeat(281);
  assert.throws(() =>
    CreateTransactionSchema.parse({
      amount: 10,
      type: 'EXPENSE',
      date: '2026-04-01',
      categoryId: validCategory,
      description: tooLong,
    }),
  );
});

test('UpdateTransactionSchema accepts partial payloads', () => {
  const r = UpdateTransactionSchema.parse({ amount: 5 });
  assert.equal(r.amount, 5);
  assert.equal(r.type, undefined);
});

test('ListTransactionsQuerySchema applies a default limit of 50', () => {
  const r = ListTransactionsQuerySchema.parse({});
  assert.equal(r.limit, 50);
});

test('ListTransactionsQuerySchema clamps limit between 1 and 200', () => {
  assert.throws(() => ListTransactionsQuerySchema.parse({ limit: 0 }));
  assert.throws(() => ListTransactionsQuerySchema.parse({ limit: 201 }));
});

test('ListTransactionsQuerySchema requires UUIDs for cursor and category filter', () => {
  assert.throws(() => ListTransactionsQuerySchema.parse({ cursor: 'abc' }));
  assert.throws(() => ListTransactionsQuerySchema.parse({ categoryId: 'abc' }));
});

test('TransactionParamsSchema requires a UUID id', () => {
  assert.throws(() => TransactionParamsSchema.parse({ id: 'nope' }));
  const r = TransactionParamsSchema.parse({ id: validCategory });
  assert.equal(r.id, validCategory);
});
