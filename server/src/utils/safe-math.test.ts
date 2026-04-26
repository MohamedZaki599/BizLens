import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toSafeNumber,
  round,
  percentChange,
  shareOf,
  formatPctChange,
  formatMoney,
} from './safe-math';

test('toSafeNumber coerces null / NaN / Infinity to 0', () => {
  assert.equal(toSafeNumber(null), 0);
  assert.equal(toSafeNumber(undefined), 0);
  assert.equal(toSafeNumber(Number.NaN), 0);
  assert.equal(toSafeNumber(Number.POSITIVE_INFINITY), 0);
  assert.equal(toSafeNumber('12.5'), 12.5);
  assert.equal(toSafeNumber(7), 7);
});

test('round honors decimals and is NaN-safe', () => {
  assert.equal(round(1.235, 2), 1.24);
  assert.equal(round(Number.NaN, 2), 0);
  assert.equal(round(0.1 + 0.2, 1), 0.3);
});

test('percentChange flags hasComparison=false when previous is 0', () => {
  const r = percentChange(100, 0);
  assert.equal(r.hasComparison, false);
  assert.equal(r.pct, 0);
  assert.equal(r.delta, 100);
  assert.equal(r.direction, 'up');
});

test('percentChange computes signed pct against previous', () => {
  const up = percentChange(120, 100);
  assert.equal(up.hasComparison, true);
  assert.equal(up.pct, 20);
  assert.equal(up.direction, 'up');

  const down = percentChange(80, 100);
  assert.equal(down.pct, -20);
  assert.equal(down.direction, 'down');

  const flat = percentChange(100, 100);
  assert.equal(flat.direction, 'flat');
});

test('percentChange anchors against |previous| for sign flips', () => {
  // Loss → profit: previous = -100, current = +50 ⇒ delta is +150 vs |100|
  const r = percentChange(50, -100);
  assert.equal(r.hasComparison, true);
  assert.equal(r.delta, 150);
  assert.equal(r.pct, 150);
  assert.equal(r.direction, 'up');
});

test('shareOf clamps to [0, 100] and is divide-by-zero safe', () => {
  assert.equal(shareOf(50, 200), 25);
  assert.equal(shareOf(0, 0), 0);
  assert.equal(shareOf(300, 100), 100);
  assert.equal(shareOf(-50, 100), 0);
});

test('formatPctChange returns ±0% for zero', () => {
  assert.equal(formatPctChange(0), '±0%');
  assert.equal(formatPctChange(5), '+5%');
  assert.equal(formatPctChange(-3), '−3%');
  assert.equal(formatPctChange(Number.NaN), '±0%');
});

test('formatMoney falls back gracefully for unknown currency codes', () => {
  const usd = formatMoney(1234.5, 'USD');
  assert.match(usd, /1,234\.50/);
  const fallback = formatMoney(10, 'NOT_A_REAL_CODE');
  assert.match(fallback, /10/);
});
