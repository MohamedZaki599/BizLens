/**
 * Unit tests for anomaly detection calculators.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectAnomalies,
  detectStaleData,
  detectRecurringExpenses,
} from '../calculators/anomaly';

// ── detectAnomalies ───────────────────────────────────────────────────────

test('anomalies: detects above threshold', () => {
  const current = [
    { categoryId: 'a', name: 'Marketing', total: 300 },
    { categoryId: 'b', name: 'Rent', total: 110 },
  ];
  const baseline = new Map([['a', 100], ['b', 100]]);
  const anomalies = detectAnomalies(current, baseline, 50);
  assert.equal(anomalies.length, 1);
  assert.equal(anomalies[0].categoryId, 'a');
  assert.equal(anomalies[0].changePct, 200);
});

test('anomalies: ignores low baseline', () => {
  const current = [{ categoryId: 'a', name: 'X', total: 100 }];
  const baseline = new Map([['a', 10]]);
  assert.equal(detectAnomalies(current, baseline, 50, 25).length, 0);
});

test('anomalies: returns empty when none', () => {
  const current = [{ categoryId: 'a', name: 'X', total: 100 }];
  const baseline = new Map([['a', 100]]);
  assert.equal(detectAnomalies(current, baseline, 50).length, 0);
});

// ── detectStaleData ───────────────────────────────────────────────────────

test('staleData: detects stale after threshold', () => {
  const r = detectStaleData(5, 10, 3, 7);
  assert.equal(r.isStale, true);
  assert.equal(r.severity, 'info');
});

test('staleData: warning-level staleness', () => {
  const r = detectStaleData(10, 20, 3, 7);
  assert.equal(r.isStale, true);
  assert.equal(r.severity, 'warning');
});

test('staleData: not stale when recent', () => {
  const r = detectStaleData(1, 10, 3, 7);
  assert.equal(r.isStale, false);
  assert.equal(r.severity, 'none');
});

test('staleData: not stale with few transactions', () => {
  const r = detectStaleData(10, 2, 3, 7, 5);
  assert.equal(r.isStale, false);
});

test('staleData: handles null days', () => {
  const r = detectStaleData(null, 0);
  assert.equal(r.isStale, false);
});

// ── detectRecurringExpenses ───────────────────────────────────────────────

test('recurring: detects across months', () => {
  const txns = [
    { categoryId: 'a', categoryName: 'Netflix', amount: 15, yearMonth: '2026-01' },
    { categoryId: 'a', categoryName: 'Netflix', amount: 15, yearMonth: '2026-02' },
    { categoryId: 'a', categoryName: 'Netflix', amount: 15, yearMonth: '2026-03' },
  ];
  const r = detectRecurringExpenses(txns, 3, 5);
  assert.equal(r.length, 1);
  assert.equal(r[0].categoryName, 'Netflix');
  assert.equal(r[0].monthsDetected, 3);
});

test('recurring: ignores below minimum months', () => {
  const txns = [
    { categoryId: 'a', categoryName: 'Netflix', amount: 15, yearMonth: '2026-01' },
    { categoryId: 'a', categoryName: 'Netflix', amount: 15, yearMonth: '2026-02' },
  ];
  assert.equal(detectRecurringExpenses(txns, 3, 5).length, 0);
});

test('recurring: ignores small amounts', () => {
  const txns = [
    { categoryId: 'a', categoryName: 'X', amount: 2, yearMonth: '2026-01' },
    { categoryId: 'a', categoryName: 'X', amount: 2, yearMonth: '2026-02' },
    { categoryId: 'a', categoryName: 'X', amount: 2, yearMonth: '2026-03' },
  ];
  assert.equal(detectRecurringExpenses(txns, 3, 5).length, 0);
});
