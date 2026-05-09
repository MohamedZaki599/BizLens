/**
 * Unit tests for forecast calculators.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectMonthEnd,
  calculateCashRunway,
  compareForecastToPrevious,
} from '../calculators/forecast';

// ── projectMonthEnd ───────────────────────────────────────────────────────

test('projectMonthEnd: linear projection', () => {
  const r = projectMonthEnd(5000, 3000, 15, 30);
  // Daily income = 5000/15 ≈ 333, projected = 333*30 ≈ 10000
  assert.ok(Math.abs(r.projectedIncome - 10000) < 10);
  assert.ok(Math.abs(r.projectedExpense - 6000) < 10);
  assert.equal(r.remainingDays, 15);
});

test('projectMonthEnd: end of month', () => {
  const r = projectMonthEnd(10000, 8000, 30, 30);
  assert.equal(r.remainingDays, 0);
});

test('projectMonthEnd: clamps elapsed to 1', () => {
  const r = projectMonthEnd(0, 0, 0, 30);
  assert.equal(r.projectedIncome, 0);
  assert.equal(r.projectedExpense, 0);
});

// ── calculateCashRunway ───────────────────────────────────────────────────

test('cashRunway: days until cash runs out', () => {
  assert.equal(calculateCashRunway(1000, 100), 10);
});

test('cashRunway: null when not losing money', () => {
  assert.equal(calculateCashRunway(1000, -50), null);
  assert.equal(calculateCashRunway(1000, 0), null);
});

test('cashRunway: 0 when already negative', () => {
  assert.equal(calculateCashRunway(-100, 50), 0);
});

// ── compareForecastToPrevious ─────────────────────────────────────────────

test('forecastComparison: detects overspending', () => {
  const r = compareForecastToPrevious(12000, 3000, 10000, 5000);
  assert.equal(r.isOverspending, true);
  assert.equal(r.expenseChange.pct, 20);
});

test('forecastComparison: detects underspending', () => {
  const r = compareForecastToPrevious(8000, 7000, 10000, 5000);
  assert.equal(r.isOverspending, false);
  assert.equal(r.expenseChange.pct, -20);
});
