/**
 * Dashboard Adapter Unit Tests
 *
 * Tests deriveWarnings(), deriveMetrics(), and validateConsistency()
 * with mock signal arrays.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveWarnings, deriveMetrics, validateConsistency } from '../dashboard-adapter';
import type { FinancialSignal } from '../../signals/signal.types';

// ─── Helpers ──────────────────────────────────────────────────────────────

const makeSignal = (overrides: Partial<FinancialSignal>): FinancialSignal => ({
  key: 'SPEND_SPIKE',
  value: 75,
  severity: 'none',
  trend: 'flat',
  confidence: 1.0,
  metadata: {
    explainability: {
      formula: 'test',
      inputs: { a: 1 },
      reasoningChain: ['Test reasoning'],
    },
  },
  generatedAt: new Date('2026-05-15T10:00:00Z'),
  ttlCategory: 'dashboard',
  status: 'NEW',
  snoozedUntil: null,
  resolutionNotes: null,
  ...overrides,
});

// ─── deriveWarnings() ─────────────────────────────────────────────────────

describe('deriveWarnings()', () => {
  it('returns warnings for signals with severity warning or critical', () => {
    const signals: FinancialSignal[] = [
      makeSignal({ key: 'SPEND_SPIKE', severity: 'warning', value: 80 }),
      makeSignal({ key: 'PROFIT_DROP', severity: 'critical', value: 35 }),
    ];

    const warnings = deriveWarnings(signals);

    assert.ok(warnings.length >= 2, `Expected at least 2 warnings, got ${warnings.length}`);
    const severities = warnings.map((w) => w.severity);
    assert.ok(severities.includes('warning'), 'Should include a warning');
    assert.ok(severities.includes('critical'), 'Should include a critical');
  });

  it('returns empty for signals with severity none or info', () => {
    const signals: FinancialSignal[] = [
      makeSignal({ key: 'SPEND_SPIKE', severity: 'none', value: 10 }),
      makeSignal({ key: 'PROFIT_DROP', severity: 'info', value: 5 }),
      makeSignal({ key: 'PROFIT_TREND', severity: 'info', value: 12 }),
    ];

    const warnings = deriveWarnings(signals);

    assert.equal(warnings.length, 0, 'Should return no warnings for none/info severity');
  });
});

// ─── deriveMetrics() ──────────────────────────────────────────────────────

describe('deriveMetrics()', () => {
  it('extracts profitTrend, expenseGrowth, revenueGrowth correctly', () => {
    const signals: FinancialSignal[] = [
      makeSignal({ key: 'PROFIT_TREND', value: 12.5, trend: 'up' }),
      makeSignal({ key: 'EXPENSE_GROWTH', value: 8.3, trend: 'up', severity: 'info' }),
      makeSignal({ key: 'REVENUE_GROWTH', value: -3.2, trend: 'down' }),
    ];

    const metrics = deriveMetrics(signals);

    assert.ok(metrics.profitTrend, 'profitTrend should be present');
    assert.equal(metrics.profitTrend!.direction, 'up');
    assert.equal(metrics.profitTrend!.pct, 12.5);

    assert.ok(metrics.expenseGrowth, 'expenseGrowth should be present');
    assert.equal(metrics.expenseGrowth!.direction, 'up');
    assert.equal(metrics.expenseGrowth!.pct, 8.3);

    assert.ok(metrics.revenueGrowth, 'revenueGrowth should be present');
    assert.equal(metrics.revenueGrowth!.direction, 'down');
    assert.equal(metrics.revenueGrowth!.pct, -3.2);
  });
});

// ─── validateConsistency() ────────────────────────────────────────────────

describe('validateConsistency()', () => {
  it('detects direction mismatches between dashboard and signals', () => {
    const signals: FinancialSignal[] = [
      makeSignal({ key: 'EXPENSE_GROWTH', value: 15, trend: 'up' }),
      makeSignal({ key: 'PROFIT_TREND', value: 10, trend: 'up' }),
    ];

    // Dashboard says expense is down, but signal says up → mismatch
    const result = validateConsistency(
      { expense: { direction: 'down', pct: -5 }, profit: { direction: 'up', pct: 10 } },
      signals,
    );

    assert.equal(result.consistent, false, 'Should detect inconsistency');
    assert.ok(result.issues.length > 0, 'Should have at least one issue');
    assert.ok(
      result.issues[0].includes('Expense direction mismatch'),
      'Issue should mention expense direction mismatch',
    );
  });

  it('reports consistent when directions match', () => {
    const signals: FinancialSignal[] = [
      makeSignal({ key: 'EXPENSE_GROWTH', value: 15, trend: 'up' }),
      makeSignal({ key: 'PROFIT_TREND', value: 10, trend: 'up' }),
    ];

    const result = validateConsistency(
      { expense: { direction: 'up', pct: 15 }, profit: { direction: 'up', pct: 10 } },
      signals,
    );

    assert.equal(result.consistent, true, 'Should be consistent');
    assert.equal(result.issues.length, 0, 'Should have no issues');
  });
});
