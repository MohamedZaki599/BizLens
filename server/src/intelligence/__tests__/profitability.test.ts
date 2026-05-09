/**
 * Unit tests for profitability calculators.
 * Pure functions — no mocking needed.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProfitMargin,
  calculateRevenueGrowth,
  calculateExpenseGrowth,
  calculateProfitTrend,
} from '../calculators/profitability';

// ── calculateProfitMargin ─────────────────────────────────────────────────

test('profitMargin: positive when income > expense', () => {
  const r = calculateProfitMargin(10000, 7000);
  assert.equal(r.profit, 3000);
  assert.equal(r.marginPct, 30);
});

test('profitMargin: negative when expense > income', () => {
  const r = calculateProfitMargin(5000, 8000);
  assert.equal(r.profit, -3000);
  // shareOf clamps negative values to 0
  assert.equal(r.marginPct, 0);
});

test('profitMargin: 0% when income is 0', () => {
  const r = calculateProfitMargin(0, 500);
  assert.equal(r.profit, -500);
  assert.equal(r.marginPct, 0);
});

test('profitMargin: 100% when expense is 0', () => {
  const r = calculateProfitMargin(10000, 0);
  assert.equal(r.profit, 10000);
  assert.equal(r.marginPct, 100);
});

test('profitMargin: both zero', () => {
  const r = calculateProfitMargin(0, 0);
  assert.equal(r.profit, 0);
  assert.equal(r.marginPct, 0);
});

// ── calculateRevenueGrowth ────────────────────────────────────────────────

test('revenueGrowth: detects growth', () => {
  const r = calculateRevenueGrowth(12000, 10000);
  assert.equal(r.pct, 20);
  assert.equal(r.direction, 'up');
  assert.equal(r.hasComparison, true);
});

test('revenueGrowth: detects decline', () => {
  const r = calculateRevenueGrowth(8000, 10000);
  assert.equal(r.pct, -20);
  assert.equal(r.direction, 'down');
});

test('revenueGrowth: no comparison when previous is 0', () => {
  const r = calculateRevenueGrowth(5000, 0);
  assert.equal(r.hasComparison, false);
});

// ── calculateExpenseGrowth ────────────────────────────────────────────────

test('expenseGrowth: detects increase', () => {
  const r = calculateExpenseGrowth(15000, 10000);
  assert.equal(r.pct, 50);
  assert.equal(r.direction, 'up');
});

test('expenseGrowth: detects decrease', () => {
  const r = calculateExpenseGrowth(7000, 10000);
  assert.equal(r.pct, -30);
  assert.equal(r.direction, 'down');
});

// ── calculateProfitTrend ──────────────────────────────────────────────────

test('profitTrend: detects dropping profit', () => {
  const r = calculateProfitTrend(10000, 8000, 10000, 5000);
  assert.equal(r.currentProfit, 2000);
  assert.equal(r.previousProfit, 5000);
  assert.equal(r.isDropping, true);
});

test('profitTrend: detects rising profit', () => {
  const r = calculateProfitTrend(15000, 8000, 10000, 7000);
  assert.equal(r.currentProfit, 7000);
  assert.equal(r.previousProfit, 3000);
  assert.equal(r.isDropping, false);
});

test('profitTrend: no previous period', () => {
  const r = calculateProfitTrend(5000, 3000, 0, 0);
  assert.equal(r.currentProfit, 2000);
  assert.equal(r.previousProfit, 0);
  assert.equal(r.change.hasComparison, false);
  assert.equal(r.isDropping, false);
});
