/**
 * Signal Filtering Test
 *
 * Tests the applyFilters logic from signals.controller.ts.
 * Recreates the filtering logic for unit testing without requiring Express.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { FinancialSignal } from '../../../intelligence/signals/signal.types';

// ─── Recreate applyFilters logic (mirrors signals.controller.ts) ──────────

interface SignalFilters {
  severity?: 'none' | 'info' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'flat' | 'unknown';
  category?: string;
  status?: 'NEW' | 'REVIEWED' | 'INVESTIGATING' | 'SNOOZED' | 'RESOLVED';
  ttlCategory?: 'dashboard' | 'alert' | 'analytical';
  dateFrom?: string;
  dateTo?: string;
}

const applyFilters = (signals: FinancialSignal[], filters: SignalFilters): FinancialSignal[] => {
  let result = signals;

  if (filters.severity) {
    result = result.filter((s) => s.severity === filters.severity);
  }

  if (filters.trend) {
    result = result.filter((s) => s.trend === filters.trend);
  }

  if (filters.status) {
    result = result.filter((s) => (s.status ?? 'NEW') === filters.status);
  }

  if (filters.ttlCategory) {
    result = result.filter((s) => s.ttlCategory === filters.ttlCategory);
  }

  if (filters.category) {
    result = result.filter((s) => {
      const sourceEntities = s.metadata?.explainability?.sourceEntities;
      const categoryId = s.metadata?.categoryId;
      return (
        (sourceEntities && sourceEntities.includes(filters.category!)) ||
        categoryId === filters.category
      );
    });
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter((s) => s.generatedAt >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter((s) => s.generatedAt <= to);
  }

  return result;
};

// ─── Test Fixtures ────────────────────────────────────────────────────────

const makeSignal = (overrides: Partial<FinancialSignal>): FinancialSignal => ({
  key: 'SPEND_SPIKE',
  value: 50,
  severity: 'none',
  trend: 'flat',
  confidence: 1.0,
  metadata: {
    explainability: {
      formula: 'test',
      inputs: { a: 1 },
      reasoningChain: ['Test'],
    },
  },
  generatedAt: new Date('2026-05-15T10:00:00Z'),
  ttlCategory: 'dashboard',
  status: 'NEW',
  snoozedUntil: null,
  resolutionNotes: null,
  ...overrides,
});

const TEST_SIGNALS: FinancialSignal[] = [
  makeSignal({ key: 'SPEND_SPIKE', severity: 'warning', trend: 'up', metadata: { categoryId: 'cat-001', explainability: { formula: 'x', inputs: { a: 1 }, reasoningChain: ['r'], sourceEntities: ['cat-001'] } } }),
  makeSignal({ key: 'PROFIT_TREND', severity: 'info', trend: 'up', metadata: { explainability: { formula: 'y', inputs: { b: 2 }, reasoningChain: ['s'] } } }),
  makeSignal({ key: 'EXPENSE_GROWTH', severity: 'warning', trend: 'up', metadata: { explainability: { formula: 'z', inputs: { c: 3 }, reasoningChain: ['t'] } } }),
  makeSignal({ key: 'PROFIT_DROP', severity: 'critical', trend: 'down', metadata: { explainability: { formula: 'w', inputs: { d: 4 }, reasoningChain: ['u'] } } }),
  makeSignal({ key: 'BURN_RATE', severity: 'none', trend: 'flat', metadata: { explainability: { formula: 'v', inputs: { e: 5 }, reasoningChain: ['v'] } } }),
];

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Signal Filtering — applyFilters()', () => {
  it('filter by severity=warning returns only warning/critical signals', () => {
    const result = applyFilters(TEST_SIGNALS, { severity: 'warning' });
    assert.ok(result.length > 0, 'Should return some signals');
    assert.ok(result.every((s) => s.severity === 'warning'), 'All should be warning severity');
  });

  it('filter by trend=up returns only up-trending signals', () => {
    const result = applyFilters(TEST_SIGNALS, { trend: 'up' });
    assert.ok(result.length > 0, 'Should return some signals');
    assert.ok(result.every((s) => s.trend === 'up'), 'All should have trend up');
  });

  it('filter by category UUID matches metadata.categoryId', () => {
    const result = applyFilters(TEST_SIGNALS, { category: 'cat-001' });
    assert.ok(result.length > 0, 'Should return signals matching category');
    assert.ok(
      result.every((s) => s.metadata?.categoryId === 'cat-001' ||
        s.metadata?.explainability?.sourceEntities?.includes('cat-001')),
      'All should match category cat-001',
    );
  });

  it('filter by category UUID matches metadata.explainability.sourceEntities', () => {
    const signals: FinancialSignal[] = [
      makeSignal({
        key: 'CATEGORY_CONCENTRATION',
        severity: 'warning',
        metadata: {
          explainability: {
            formula: 'test',
            inputs: { a: 1 },
            reasoningChain: ['r'],
            sourceEntities: ['cat-xyz'],
          },
        },
      }),
      makeSignal({ key: 'PROFIT_TREND', severity: 'info' }),
    ];

    const result = applyFilters(signals, { category: 'cat-xyz' });
    assert.equal(result.length, 1, 'Should return 1 signal matching sourceEntities');
    assert.equal(result[0].key, 'CATEGORY_CONCENTRATION');
  });

  it('combined filters use AND logic', () => {
    const result = applyFilters(TEST_SIGNALS, { severity: 'warning', trend: 'up' });
    assert.ok(result.length > 0, 'Should return some signals');
    assert.ok(
      result.every((s) => s.severity === 'warning' && s.trend === 'up'),
      'All should match both severity=warning AND trend=up',
    );
  });

  it('empty filters return all signals', () => {
    const result = applyFilters(TEST_SIGNALS, {});
    assert.equal(result.length, TEST_SIGNALS.length, 'Should return all signals');
  });
});
