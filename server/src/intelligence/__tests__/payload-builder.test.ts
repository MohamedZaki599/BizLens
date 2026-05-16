/**
 * Tests for the localized payload builder.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildLocalizedPayload } from '../localization/payload-builder';
import { createSignal } from '../signals/signal.types';
import type { FinancialSignal } from '../signals/signal.types';
import { LOCALIZATION_KEYS } from '../localization/key-registry';

describe('buildLocalizedPayload', () => {
  it('maps PROFIT_MARGIN signal to signals.profit_margin.summary key', () => {
    const signal = createSignal('PROFIT_MARGIN', 25.5, {
      metadata: {
        profit: 1400,
        income: 5200,
        expense: 3800,
        explainability: {
          formula: '(income - expense) / income * 100',
          inputs: { income: 5200, expense: 3800, profit: 1400 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    assert.equal(payload.summaryKey, 'signals.profit_margin.summary');
    assert.equal(payload.explanationKey, 'signals.profit_margin.explanation');
  });

  it('extracts raw numeric params from metadata', () => {
    const signal = createSignal('BURN_RATE', 150, {
      metadata: {
        totalExpense: 4500,
        daysElapsed: 30,
        explainability: {
          formula: 'totalExpense / daysElapsed',
          inputs: { totalExpense: 4500, daysElapsed: 30, burnRate: 150 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    assert.equal(payload.summaryParams.totalExpense, 4500);
    assert.equal(payload.summaryParams.daysElapsed, 30);
  });

  it('extracts string identifier params from metadata', () => {
    const signal = createSignal('TOP_EXPENSE_CATEGORY', 3000, {
      metadata: {
        categoryId: 'cat-001',
        categoryName: 'Marketing',
        sharePct: 45,
        totalExpense: 6700,
        explainability: {
          formula: 'topAmount / totalExpense * 100',
          inputs: { topAmount: 3000, totalExpense: 6700, sharePct: 45 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    assert.equal(payload.summaryParams.categoryId, 'cat-001');
    assert.equal(payload.summaryParams.categoryName, 'Marketing');
    assert.equal(payload.summaryParams.sharePct, 45);
    assert.equal(payload.summaryParams.totalExpense, 6700);
  });

  it('excludes explainability sub-object from params', () => {
    const signal = createSignal('PROFIT_MARGIN', 25, {
      metadata: {
        profit: 1000,
        explainability: {
          formula: 'test',
          inputs: { income: 5000, expense: 4000, profit: 1000 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    assert.equal('explainability' in payload.summaryParams, false);
  });

  it('produces valid localization keys for all standard signal types', () => {
    const signalKeys = [
      'PROFIT_MARGIN', 'REVENUE_GROWTH', 'PROFIT_TREND', 'PROFIT_DROP', 'EXPENSE_GROWTH',
      'BURN_RATE', 'EXPENSE_RATIO', 'TOP_EXPENSE_CATEGORY', 'TOP_INCOME_CATEGORY',
      'CATEGORY_CONCENTRATION', 'PROJECTED_EXPENSE', 'PROJECTED_INCOME', 'PROJECTED_PROFIT',
      'CASH_RUNWAY_DAYS', 'FORECAST_OVERSPEND', 'SPEND_SPIKE', 'SPENDING_ANOMALY',
      'WEEKLY_SPEND_CHANGE', 'STALE_DATA', 'RECURRING_EXPENSE',
    ] as const;

    for (const key of signalKeys) {
      const signal = createSignal(key, 100, { metadata: { value: 100 } });
      const payload = buildLocalizedPayload(signal);

      // Summary key should exist in registry
      assert.ok(
        payload.summaryKey in LOCALIZATION_KEYS,
        `Expected summaryKey "${payload.summaryKey}" to exist in LOCALIZATION_KEYS for signal "${key}"`,
      );

      // Explanation key should exist in registry
      assert.ok(
        payload.explanationKey && payload.explanationKey in LOCALIZATION_KEYS,
        `Expected explanationKey "${payload.explanationKey}" to exist in LOCALIZATION_KEYS for signal "${key}"`,
      );
    }
  });

  it('params contain only numbers and strings (no objects, arrays, booleans)', () => {
    const signal = createSignal('SPEND_SPIKE', 80, {
      metadata: {
        categoryId: 'cat-002',
        categoryName: 'Ads',
        currentAmount: 1200,
        baselineAvg: 500,
        explainability: {
          formula: '(currentAmount - baselineAvg) / baselineAvg * 100',
          inputs: { currentAmount: 1200, baselineAvg: 500, changePct: 140 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    for (const [key, value] of Object.entries(payload.summaryParams)) {
      const type = typeof value;
      assert.ok(
        type === 'number' || type === 'string',
        `Param "${key}" has type "${type}" — expected number or string`,
      );
    }
  });

  it('returns payload even when metadata is empty', () => {
    const signal = createSignal('PROFIT_MARGIN', 0, { metadata: {} });
    const payload = buildLocalizedPayload(signal);

    assert.equal(payload.summaryKey, 'signals.profit_margin.summary');
    assert.deepEqual(payload.summaryParams, {});
  });

  it('skips null and boolean metadata values in params', () => {
    const signal = createSignal('STALE_DATA', 5, {
      metadata: {
        totalTransactions: 42,
        lastTransactionAt: '2026-05-10T00:00:00Z',
        isStale: true as unknown,
        nullField: null as unknown,
        explainability: {
          formula: 'test',
          inputs: { daysSinceLastTransaction: 5 },
          reasoningChain: ['test'],
        },
      },
    });

    const payload = buildLocalizedPayload(signal);

    assert.equal(payload.summaryParams.totalTransactions, 42);
    assert.equal(payload.summaryParams.lastTransactionAt, '2026-05-10T00:00:00Z');
    assert.equal('isStale' in payload.summaryParams, false);
    assert.equal('nullField' in payload.summaryParams, false);
  });
});
