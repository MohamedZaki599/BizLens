/**
 * Explainability Completeness Test
 *
 * Verifies that every signal with severity > 'none' has complete
 * explainability metadata: formula, reasoningChain, and inputs.
 * Reuses the test snapshot from signal-determinism.test.ts.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../signals/signal-registry';
import { systemDefaults } from '../thresholds/defaults';
import type { FinancialSnapshot } from '../engine/data-collector';
import type { SignalGenerationContext } from '../signals/signal.types';

// ─── Test Snapshot (same as signal-determinism.test.ts) ───────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'test-user-explainability',
  collectedAt: new Date('2026-05-15T10:00:00Z'),

  monthIncome: 5200,
  monthExpense: 3800,
  monthProfit: 1400,
  monthTransactionCount: 47,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),

  prevMonthIncome: 4620,
  prevMonthExpense: 3510,
  prevMonthProfit: 1110,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 500 },
    { categoryId: 'cat-software', name: 'Software & Tools', color: '#7c5cff', total: 850 },
    { categoryId: 'cat-coworking', name: 'Coworking', color: '#f59e0b', total: 680 },
  ],

  weekIncome: 1300,
  weekExpense: 950,
  weekProfit: 350,
  prevWeekIncome: 1100,
  prevWeekExpense: 780,
  prevWeekProfit: 320,

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

  daysSinceLastTransaction: 0,
  totalTransactions: 250,
  lastTransactionAt: new Date('2026-05-15T09:00:00Z'),
  recentExpenseTransactions: [],
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Explainability Completeness', () => {
  it('every signal with severity > none has metadata.explainability', () => {
    const snapshot = createTestSnapshot();
    const ctx: SignalGenerationContext = {
      userId: 'test-user-explainability',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, systemDefaults);
    const actionable = signals.filter((s) => s.severity !== 'none');

    assert.ok(actionable.length > 0, 'Should have at least one signal with severity > none');

    for (const signal of actionable) {
      assert.ok(
        signal.metadata?.explainability,
        `Signal "${signal.key}" (severity: ${signal.severity}) missing metadata.explainability`,
      );
    }
  });

  it('explainability has non-empty formula', () => {
    const snapshot = createTestSnapshot();
    const ctx: SignalGenerationContext = {
      userId: 'test-user-explainability',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, systemDefaults);
    const actionable = signals.filter((s) => s.severity !== 'none');

    for (const signal of actionable) {
      const exp = signal.metadata?.explainability;
      if (!exp) continue; // Covered by previous test
      assert.ok(
        exp.formula && exp.formula.length > 0,
        `Signal "${signal.key}" has empty explainability.formula`,
      );
    }
  });

  it('explainability has non-empty reasoningChain array', () => {
    const snapshot = createTestSnapshot();
    const ctx: SignalGenerationContext = {
      userId: 'test-user-explainability',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, systemDefaults);
    const actionable = signals.filter((s) => s.severity !== 'none');

    for (const signal of actionable) {
      const exp = signal.metadata?.explainability;
      if (!exp) continue;
      assert.ok(
        Array.isArray(exp.reasoningChain) && exp.reasoningChain.length > 0,
        `Signal "${signal.key}" has empty explainability.reasoningChain`,
      );
    }
  });

  it('explainability has inputs object', () => {
    const snapshot = createTestSnapshot();
    const ctx: SignalGenerationContext = {
      userId: 'test-user-explainability',
      generatedAt: new Date('2026-05-15T10:00:00Z'),
    };

    const signals = runAllGenerators(snapshot, ctx, systemDefaults);
    const actionable = signals.filter((s) => s.severity !== 'none');

    for (const signal of actionable) {
      const exp = signal.metadata?.explainability;
      if (!exp) continue;
      assert.ok(
        exp.inputs && typeof exp.inputs === 'object',
        `Signal "${signal.key}" has missing or invalid explainability.inputs`,
      );
    }
  });
});
