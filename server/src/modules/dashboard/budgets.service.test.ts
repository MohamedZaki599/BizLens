import '../../test/setup-env';
import test from 'node:test';
import assert from 'node:assert/strict';
import { BudgetCreateSchema } from './budgets.service';

test('BudgetCreateSchema accepts a positive amount with a UUID category', () => {
  const result = BudgetCreateSchema.safeParse({
    categoryId: '11111111-1111-1111-1111-111111111111',
    amount: 1000,
  });
  assert.equal(result.success, true);
});

test('BudgetCreateSchema rejects a negative or zero amount', () => {
  for (const amount of [0, -1, Number.NaN]) {
    const result = BudgetCreateSchema.safeParse({
      categoryId: '11111111-1111-1111-1111-111111111111',
      amount,
    });
    assert.equal(result.success, false, `should reject amount=${amount}`);
  }
});

test('BudgetCreateSchema rejects a malformed category id', () => {
  const result = BudgetCreateSchema.safeParse({
    categoryId: 'not-a-uuid',
    amount: 100,
  });
  assert.equal(result.success, false);
});
