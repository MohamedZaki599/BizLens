/**
 * Backward Compatibility Assertion Test
 *
 * Verifies that signals still include the legacy metadata.description field
 * alongside the new localized field in the API response shape, ensuring
 * existing consumers are not broken by the localization refactoring.
 *
 * The API controller normalizes signals by falling back to buildMessage()
 * when metadata.description is not set directly. This test verifies that
 * normalization layer preserves backward compatibility.
 *
 * Asserts:
 * - Every signal's normalized API response includes metadata.description (string, non-empty)
 * - Every signal includes the new localized field alongside the legacy field
 * - API response shape is preserved: key, value, severity, confidence, metadata (with description), localized
 *
 * Validates: Requirements US8 — Frontend-Backend Contract Synchronization (backward compatibility).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { systemDefaults } from '../intelligence/thresholds/defaults';
import { buildMessage } from '../intelligence/localization/message-builder';
import type { FinancialSnapshot } from '../intelligence/engine/data-collector';
import type { SignalGenerationContext, FinancialSignal } from '../intelligence/signals/signal.types';

// ─── Test Context ─────────────────────────────────────────────────────────

const CTX: SignalGenerationContext = {
  userId: 'backward-compat-test-user',
  generatedAt: new Date('2026-06-10T12:00:00Z'),
};

// ─── Test Snapshot ────────────────────────────────────────────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'backward-compat-test-user',
  collectedAt: new Date('2026-06-10T12:00:00Z'),
  monthIncome: 6000,
  monthExpense: 4200,
  monthProfit: 1800,
  monthTransactionCount: 45,
  monthDaysElapsed: 10,
  monthTotalDays: 30,
  monthStart: new Date('2026-06-01T00:00:00Z'),
  monthEnd: new Date('2026-06-30T23:59:59Z'),
  prevMonthIncome: 5500,
  prevMonthExpense: 3800,
  prevMonthProfit: 1700,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 500 },
    { categoryId: 'cat-software', name: 'Software', color: '#7c5cff', total: 900 },
    { categoryId: 'cat-rent', name: 'Rent', color: '#f59e0b', total: 700 },
  ],
  weekIncome: 1500,
  weekExpense: 1100,
  weekProfit: 400,
  prevWeekIncome: 1300,
  prevWeekExpense: 900,
  prevWeekProfit: 400,
  monthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 1400 },
    { categoryId: 'cat-software', name: 'Software', color: '#7c5cff', total: 1000 },
    { categoryId: 'cat-rent', name: 'Rent', color: '#f59e0b', total: 800 },
    { categoryId: 'cat-meals', name: 'Meals', color: '#84cc16', total: 500 },
    { categoryId: 'cat-travel', name: 'Travel', color: '#3b82f6', total: 500 },
  ],
  monthIncomeByCategory: [
    { categoryId: 'cat-projects', name: 'Client Projects', color: '#22c55e', total: 4000 },
    { categoryId: 'cat-retainers', name: 'Retainers', color: '#10b981', total: 2000 },
  ],
  threeMonthExpenseAvgByCategory: new Map([
    ['cat-marketing', 500],
    ['cat-software', 900],
    ['cat-rent', 700],
    ['cat-meals', 450],
    ['cat-travel', 350],
  ]),
  daysSinceLastTransaction: 1,
  totalTransactions: 250,
  lastTransactionAt: new Date('2026-06-09T15:00:00Z'),
  recentExpenseTransactions: [],
});

// ─── Normalize signal to API response shape (mirrors signals.controller.ts) ──

interface NormalizedSignalResponse {
  key: string;
  value: number;
  severity: string;
  trend: string;
  confidence: number;
  metadata: { description: string; [key: string]: unknown };
  localized: FinancialSignal['localized'] | null;
  status: string;
  ttlCategory: string;
  generatedAt: string;
}

const normalizeSignal = (s: FinancialSignal): NormalizedSignalResponse => ({
  key: s.key,
  value: s.value,
  severity: s.severity.toUpperCase(),
  trend: s.trend.toUpperCase(),
  confidence: s.confidence,
  metadata: {
    ...s.metadata,
    description: s.metadata?.description || buildMessage(s),
  },
  localized: s.localized ?? null,
  status: s.status || 'NEW',
  ttlCategory: s.ttlCategory,
  generatedAt: s.generatedAt.toISOString(),
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Backward Compatibility — Legacy metadata.description preserved', () => {
  const snapshot = createTestSnapshot();
  const signals = runAllGenerators(snapshot, CTX, systemDefaults);
  const normalized = signals.map(normalizeSignal);

  it('generates signals from the test snapshot', () => {
    assert.ok(signals.length > 0, 'Expected at least one signal to be generated');
  });

  describe('legacy metadata.description field is preserved in API response', () => {
    it('every normalized signal includes metadata.description as a non-empty string', () => {
      const failures: string[] = [];

      for (const signal of normalized) {
        if (
          typeof signal.metadata.description !== 'string' ||
          signal.metadata.description.trim().length === 0
        ) {
          failures.push(
            `Signal "${signal.key}": metadata.description is missing or empty (got: ${JSON.stringify(signal.metadata.description)})`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Legacy metadata.description violations:\n${failures.join('\n')}`,
      );
    });
  });

  describe('new localized field coexists with legacy field', () => {
    it('every normalized signal includes both metadata.description AND localized field', () => {
      const failures: string[] = [];

      for (const signal of normalized) {
        const hasDescription =
          typeof signal.metadata.description === 'string' &&
          signal.metadata.description.trim().length > 0;
        const hasLocalized =
          signal.localized != null &&
          typeof signal.localized.summaryKey === 'string' &&
          signal.localized.summaryKey.length > 0;

        if (!hasDescription || !hasLocalized) {
          const missing: string[] = [];
          if (!hasDescription) missing.push('metadata.description');
          if (!hasLocalized) missing.push('localized');
          failures.push(
            `Signal "${signal.key}": missing [${missing.join(', ')}]`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Coexistence violations (both legacy and localized must be present):\n${failures.join('\n')}`,
      );
    });
  });

  describe('API response shape is unchanged for existing consumers', () => {
    it('every normalized signal has the expected fields: key, value, severity, confidence, metadata, localized', () => {
      const requiredFields: (keyof NormalizedSignalResponse)[] = [
        'key',
        'value',
        'severity',
        'confidence',
        'metadata',
        'localized',
      ];

      const failures: string[] = [];

      for (const signal of normalized) {
        for (const field of requiredFields) {
          if (signal[field] === undefined) {
            failures.push(
              `Signal "${signal.key}": missing required field "${field}"`,
            );
          }
        }
      }

      assert.deepEqual(
        failures,
        [],
        `API shape violations:\n${failures.join('\n')}`,
      );
    });

    it('metadata.description is a string (not an object or array)', () => {
      for (const signal of normalized) {
        assert.equal(
          typeof signal.metadata.description,
          'string',
          `Signal "${signal.key}": metadata.description should be a string, got ${typeof signal.metadata.description}`,
        );
      }
    });

    it('localized.summaryKey is a string matching the key pattern', () => {
      const keyPattern = /^[a-z]+\.[a-z_]+\.[a-z_]+$/;

      const failures: string[] = [];

      for (const signal of normalized) {
        if (!signal.localized) {
          failures.push(`Signal "${signal.key}": localized field is null`);
          continue;
        }
        if (!keyPattern.test(signal.localized.summaryKey)) {
          failures.push(
            `Signal "${signal.key}": localized.summaryKey "${signal.localized.summaryKey}" does not match pattern namespace.signal_key.field`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Localized key pattern violations:\n${failures.join('\n')}`,
      );
    });

    it('localized.summaryParams is a plain object with number or string values', () => {
      const failures: string[] = [];

      for (const signal of normalized) {
        if (!signal.localized) {
          failures.push(`Signal "${signal.key}": localized field is null`);
          continue;
        }
        const params = signal.localized.summaryParams;
        if (typeof params !== 'object' || params === null || Array.isArray(params)) {
          failures.push(
            `Signal "${signal.key}": localized.summaryParams is not a plain object`,
          );
          continue;
        }
        for (const [paramKey, paramValue] of Object.entries(params)) {
          if (typeof paramValue !== 'number' && typeof paramValue !== 'string') {
            failures.push(
              `Signal "${signal.key}": param "${paramKey}" has invalid type "${typeof paramValue}" (expected number or string)`,
            );
          }
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Localized summaryParams violations:\n${failures.join('\n')}`,
      );
    });

    it('signal severity is one of the expected uppercase enum values', () => {
      const validSeverities = ['NONE', 'INFO', 'WARNING', 'CRITICAL'];

      for (const signal of normalized) {
        assert.ok(
          validSeverities.includes(signal.severity),
          `Signal "${signal.key}": severity "${signal.severity}" is not a valid value`,
        );
      }
    });

    it('signal confidence is a number between 0 and 1', () => {
      for (const signal of normalized) {
        assert.equal(
          typeof signal.confidence,
          'number',
          `Signal "${signal.key}": confidence should be a number`,
        );
        assert.ok(
          signal.confidence >= 0 && signal.confidence <= 1,
          `Signal "${signal.key}": confidence ${signal.confidence} is out of range [0, 1]`,
        );
      }
    });
  });
});
