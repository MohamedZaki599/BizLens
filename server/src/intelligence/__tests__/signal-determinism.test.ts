/**
 * Signal Determinism Test
 *
 * Verifies that the same FinancialSnapshot + ThresholdConfig produces
 * identical FinancialSignal[] output across multiple runs.
 * This is a core stabilization requirement.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../signals/signal-registry';
import { systemDefaults } from '../thresholds/defaults';
import type { FinancialSnapshot } from '../engine/data-collector';
import type { SignalGenerationContext } from '../signals/signal.types';

// ─── Fixed test snapshot (deterministic input) ────────────────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'test-user-determinism',
  collectedAt: new Date('2026-05-15T10:00:00Z'),

  // Monthly totals
  monthIncome: 5200,
  monthExpense: 3800,
  monthProfit: 1400,
  monthTransactionCount: 47,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),

  // Previous month
  prevMonthIncome: 4620,
  prevMonthExpense: 3510,
  prevMonthProfit: 1110,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 500 },
    { categoryId: 'cat-software', name: 'Software & Tools', color: '#7c5cff', total: 850 },
    { categoryId: 'cat-coworking', name: 'Coworking', color: '#f59e0b', total: 680 },
  ],

  // Weekly
  weekIncome: 1300,
  weekExpense: 950,
  weekProfit: 350,
  prevWeekIncome: 1100,
  prevWeekExpense: 780,
  prevWeekProfit: 320,

  // Category breakdowns
  monthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 1200 },
    { categoryId: 'cat-software', name: 'Software & Tools', color: '#7c5cff', total: 900 },
    { categoryId: 'cat-coworking', name: 'Coworking', color: '#f59e0b', total: 700 },
    { categoryId: 'cat-meals', name: 'Meals & Coffee', color: '#84cc16', total: 600 },
    { categoryId: 'cat-equipment', name: 'Equipment', color: '#3b82f6', total: 400 },
  ],
  monthIncomeByCategory: [
    { categoryId: 'cat-projects', name: 'Client Projects', color: '#22c55e', total: 3500 },
    { categoryId: 'cat-retainers', name: 'Retainers', color: '#10b981', total: 1200 },
    { categoryId: 'cat-consulting', name: 'Consulting', color: '#06b6d4', total: 500 },
  ],
  threeMonthExpenseAvgByCategory: new Map([
    ['cat-marketing', 500],
    ['cat-software', 850],
    ['cat-coworking', 680],
    ['cat-meals', 580],
    ['cat-equipment', 350],
  ]),

  // Activity
  daysSinceLastTransaction: 0,
  totalTransactions: 250,
  lastTransactionAt: new Date('2026-05-15T09:00:00Z'),

  // Recurring detection data
  recentExpenseTransactions: [],
});

describe('Signal Determinism', () => {
  it('produces identical signals on repeated computation with same input', async () => {
    const snapshot = createTestSnapshot();
    const thresholds = systemDefaults;
    const ctx: SignalGenerationContext = {
      userId: 'test-user-determinism',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    // Run twice
    const run1 = runAllGenerators(snapshot, ctx, thresholds);
    const run2 = runAllGenerators(snapshot, ctx, thresholds);

    // Same number of signals
    assert.equal(run1.length, run2.length, 'Signal count should be identical');

    // Sort both by key for stable comparison
    const sorted1 = [...run1].sort((a, b) => a.key.localeCompare(b.key));
    const sorted2 = [...run2].sort((a, b) => a.key.localeCompare(b.key));

    for (let i = 0; i < sorted1.length; i++) {
      const s1 = sorted1[i];
      const s2 = sorted2[i];

      assert.equal(s1.key, s2.key, `Key mismatch at index ${i}`);
      assert.equal(s1.value, s2.value, `Value mismatch for ${s1.key}: ${s1.value} vs ${s2.value}`);
      assert.equal(s1.severity, s2.severity, `Severity mismatch for ${s1.key}`);
      assert.equal(s1.trend, s2.trend, `Trend mismatch for ${s1.key}`);
      assert.equal(s1.confidence, s2.confidence, `Confidence mismatch for ${s1.key}`);
    }
  });

  it('produces signals with complete explainability metadata', async () => {
    const snapshot = createTestSnapshot();
    const thresholds = systemDefaults;
    const ctx: SignalGenerationContext = {
      userId: 'test-user-determinism',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, thresholds);

    // Key signals that MUST have explainability
    const requiredExplainability = [
      'PROFIT_MARGIN',
      'REVENUE_GROWTH',
      'EXPENSE_GROWTH',
      'PROFIT_TREND',
      'SPEND_SPIKE',
      'WEEKLY_SPEND_CHANGE',
    ];

    for (const key of requiredExplainability) {
      const signal = signals.find((s) => s.key === key);
      if (!signal) continue; // Signal may not be generated if thresholds not met

      const exp = signal.metadata?.explainability;
      assert.ok(exp, `Signal "${key}" should have explainability metadata`);
      assert.ok(exp.formula, `Signal "${key}" should have explainability.formula`);
      assert.ok(
        exp.reasoningChain && exp.reasoningChain.length > 0,
        `Signal "${key}" should have non-empty explainability.reasoningChain`,
      );
    }
  });

  it('does not use Date.now() — signals use ctx.generatedAt', async () => {
    const snapshot = createTestSnapshot();
    const thresholds = systemDefaults;

    const fixedDate = new Date('2026-01-01T00:00:00Z');
    const ctx: SignalGenerationContext = {
      userId: 'test-user-determinism',
      generatedAt: fixedDate,
    };

    const signals = runAllGenerators(snapshot, ctx, thresholds);

    for (const signal of signals) {
      assert.deepEqual(
        signal.generatedAt,
        fixedDate,
        `Signal "${signal.key}" should use ctx.generatedAt, not Date.now()`,
      );
    }
  });

  it('SPEND_SPIKE is generated for Marketing category with 140% spike', async () => {
    const snapshot = createTestSnapshot();
    // Marketing: 1200 current vs 500 avg = 140% spike
    const thresholds = systemDefaults;
    const ctx: SignalGenerationContext = {
      userId: 'test-user-determinism',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, thresholds);
    const spike = signals.find(
      (s) => s.key === 'SPEND_SPIKE' && s.metadata?.categoryName === 'Marketing',
    );

    assert.ok(spike, 'Should generate SPEND_SPIKE for Marketing');
    assert.ok(spike.value >= 100, `Spike value should be >= 100%, got ${spike.value}`);
    assert.equal(spike.trend, 'up');
    assert.ok(
      spike.severity === 'warning' || spike.severity === 'critical',
      `Spike severity should be warning or critical, got ${spike.severity}`,
    );
  });
});
