/**
 * Unit tests for spending calculators.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBurnRate,
  calculateExpenseRatio,
  calculateConcentration,
  detectSpendSpikes,
  calculateWeeklySpendChange,
} from '../calculators/spending';

// ── calculateBurnRate ─────────────────────────────────────────────────────

test('burnRate: calculates daily rate', () => {
  assert.equal(calculateBurnRate(3000, 30), 100);
});

test('burnRate: returns 0 when days is 0', () => {
  assert.equal(calculateBurnRate(3000, 0), 0);
});

test('burnRate: returns 0 when days is negative', () => {
  assert.equal(calculateBurnRate(3000, -5), 0);
});

// ── calculateExpenseRatio ─────────────────────────────────────────────────

test('expenseRatio: normal ratio', () => {
  assert.equal(calculateExpenseRatio(8000, 10000), 0.8);
});

test('expenseRatio: overspending (ratio > 1)', () => {
  assert.equal(calculateExpenseRatio(12000, 10000), 1.2);
});

test('expenseRatio: zero income', () => {
  assert.equal(calculateExpenseRatio(5000, 0), 999);
});

test('expenseRatio: both zero', () => {
  assert.equal(calculateExpenseRatio(0, 0), 0);
});

// ── calculateConcentration ────────────────────────────────────────────────

test('concentration: finds top category', () => {
  const r = calculateConcentration([
    { categoryId: 'a', name: 'Rent', total: 5000 },
    { categoryId: 'b', name: 'Food', total: 3000 },
    { categoryId: 'c', name: 'Travel', total: 2000 },
  ]);
  assert.ok(r !== null);
  assert.equal(r!.topCategoryName, 'Rent');
  assert.equal(r!.sharePct, 50);
});

test('concentration: empty categories', () => {
  assert.equal(calculateConcentration([]), null);
});

test('concentration: total is 0', () => {
  assert.equal(calculateConcentration([{ categoryId: 'a', name: 'X', total: 0 }]), null);
});

// ── detectSpendSpikes ─────────────────────────────────────────────────────

test('spendSpikes: detects above baseline', () => {
  const current = [
    { categoryId: 'a', name: 'Marketing', total: 300 },
    { categoryId: 'b', name: 'Rent', total: 100 },
  ];
  const baseline = new Map([['a', 100], ['b', 90]]);
  const spikes = detectSpendSpikes(current, baseline);
  assert.ok(spikes.length >= 1);
  assert.equal(spikes[0].categoryId, 'a');
  assert.equal(spikes[0].changePct, 200);
});

test('spendSpikes: ignores below minBaseline', () => {
  const current = [{ categoryId: 'a', name: 'X', total: 50 }];
  const baseline = new Map([['a', 10]]);
  assert.equal(detectSpendSpikes(current, baseline).length, 0);
});

test('spendSpikes: empty when no spikes', () => {
  const current = [{ categoryId: 'a', name: 'X', total: 100 }];
  const baseline = new Map([['a', 100]]);
  assert.equal(detectSpendSpikes(current, baseline).length, 0);
});

// ── calculateWeeklySpendChange ────────────────────────────────────────────

test('weeklyChange: detects increase', () => {
  const r = calculateWeeklySpendChange(1500, 1000);
  assert.equal(r.pct, 50);
  assert.equal(r.direction, 'up');
});

test('weeklyChange: detects decrease', () => {
  const r = calculateWeeklySpendChange(800, 1000);
  assert.equal(r.pct, -20);
  assert.equal(r.direction, 'down');
});
