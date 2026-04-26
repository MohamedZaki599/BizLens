import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRange, RANGE_ENUM } from './dashboard.range';

test('resolveRange handles every documented token', () => {
  for (const token of RANGE_ENUM.options) {
    const r = resolveRange(token);
    assert.ok('label' in r, `missing label for ${token}`);
    if (token === 'all') {
      assert.equal(r.from, null);
      assert.equal(r.to, null);
      assert.equal(r.prevFrom, null);
      assert.equal(r.prevTo, null);
    } else {
      assert.ok(r.from instanceof Date);
      assert.ok(r.to instanceof Date);
      assert.ok(r.from!.getTime() <= r.to!.getTime(), 'from <= to');
    }
  }
});

test('resolveRange("this_month") returns the current month and prev = last month', () => {
  const r = resolveRange('this_month');
  const now = new Date();
  assert.equal(r.from!.getMonth(), now.getMonth());
  assert.equal(r.from!.getDate(), 1);
  assert.equal(r.prevTo!.getMonth(), (now.getMonth() + 11) % 12);
});

test('resolveRange("last_30_days") spans ~30 days and matches comparison length', () => {
  const r = resolveRange('last_30_days');
  const span = r.to!.getTime() - r.from!.getTime();
  const prevSpan = r.prevTo!.getTime() - r.prevFrom!.getTime();
  const day = 24 * 60 * 60 * 1000;
  // Both windows should be ~30 days. Allow generous slack for DST shifts and
  // for the small gap between the two `new Date()` reads inside resolveRange.
  assert.ok(Math.abs(span - 30 * day) < 4 * 60 * 60 * 1000, `span=${span}`);
  assert.ok(Math.abs(prevSpan - 30 * day) < 4 * 60 * 60 * 1000, `prevSpan=${prevSpan}`);
});

test('resolveRange falls back to this_month for unknown tokens', () => {
  const fallback = resolveRange('not-a-range');
  const expected = resolveRange('this_month');
  assert.equal(fallback.label, expected.label);
});
