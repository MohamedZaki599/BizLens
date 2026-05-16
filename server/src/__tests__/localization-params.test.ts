/**
 * Param Determinism Test
 *
 * Validates that all localized summaryParams values are raw (unformatted) data:
 * - typeof 'number' OR short identifier strings
 * - No pre-formatted percentages (%), currency symbols ($, €, etc.)
 * - No formatted numbers (e.g., "1,234")
 * - No strings exceeding 50 characters
 *
 * This ensures all formatting is deferred to the client for locale-aware rendering.
 *
 * Validates: Requirements US5 — Governance validation for param determinism.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { systemDefaults } from '../intelligence/thresholds/defaults';
import { validateParams } from '../intelligence/localization/key-validator';
import type { FinancialSnapshot } from '../intelligence/engine/data-collector';
import type { SignalGenerationContext } from '../intelligence/signals/signal.types';

// ─── Test Context ─────────────────────────────────────────────────────────

const CTX: SignalGenerationContext = {
  userId: 'params-test-user',
  generatedAt: new Date('2026-05-15T10:00:00Z'),
};

// ─── Test Snapshot ────────────────────────────────────────────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'params-test-user',
  collectedAt: new Date('2026-05-15T10:00:00Z'),
  monthIncome: 5000,
  monthExpense: 3500,
  monthProfit: 1500,
  monthTransactionCount: 30,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),
  prevMonthIncome: 4500,
  prevMonthExpense: 3000,
  prevMonthProfit: 1500,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 400 },
    { categoryId: 'cat-software', name: 'Software', color: '#7c5cff', total: 800 },
  ],
  weekIncome: 1200,
  weekExpense: 900,
  weekProfit: 300,
  prevWeekIncome: 1100,
  prevWeekExpense: 750,
  prevWeekProfit: 350,
  monthExpenseByCategory: [
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 1200 },
    { categoryId: 'cat-software', name: 'Software', color: '#7c5cff', total: 900 },
    { categoryId: 'cat-rent', name: 'Rent', color: '#f59e0b', total: 700 },
    { categoryId: 'cat-meals', name: 'Meals', color: '#84cc16', total: 400 },
    { categoryId: 'cat-travel', name: 'Travel', color: '#3b82f6', total: 300 },
  ],
  monthIncomeByCategory: [
    { categoryId: 'cat-projects', name: 'Client Projects', color: '#22c55e', total: 3500 },
    { categoryId: 'cat-retainers', name: 'Retainers', color: '#10b981', total: 1500 },
  ],
  threeMonthExpenseAvgByCategory: new Map([
    ['cat-marketing', 400],
    ['cat-software', 800],
    ['cat-rent', 700],
    ['cat-meals', 380],
    ['cat-travel', 280],
  ]),
  daysSinceLastTransaction: 0,
  totalTransactions: 200,
  lastTransactionAt: new Date('2026-05-15T09:00:00Z'),
  recentExpenseTransactions: [],
});

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Localization Param Determinism', () => {
  const snapshot = createTestSnapshot();
  const signals = runAllGenerators(snapshot, CTX, systemDefaults);

  describe('summaryParams contain only raw values', () => {
    it('generates at least one signal with localized payload', () => {
      const localizedSignals = signals.filter((s) => s.localized);
      assert.ok(
        localizedSignals.length > 0,
        'Expected at least one signal with a localized payload',
      );
    });

    it('all summaryParams values are typeof number or short identifier strings', () => {
      const violations: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.summaryParams) continue;

        for (const [paramName, value] of Object.entries(signal.localized.summaryParams)) {
          if (typeof value === 'number') continue;

          if (typeof value === 'string') {
            if (value.length > 50) {
              violations.push(
                `Signal "${signal.key}" param "${paramName}": string exceeds 50 chars (${value.length} chars)`,
              );
            }
          } else {
            violations.push(
              `Signal "${signal.key}" param "${paramName}": unexpected type "${typeof value}"`,
            );
          }
        }
      }

      assert.deepEqual(violations, [], `Param type violations:\n${violations.join('\n')}`);
    });

    it('no summaryParams contain percentage symbols (%)', () => {
      const violations: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.summaryParams) continue;

        for (const [paramName, value] of Object.entries(signal.localized.summaryParams)) {
          if (typeof value === 'string' && value.includes('%')) {
            violations.push(
              `Signal "${signal.key}" param "${paramName}": contains "%" — value: "${value}"`,
            );
          }
        }
      }

      assert.deepEqual(violations, [], `Pre-formatted percentage violations:\n${violations.join('\n')}`);
    });

    it('no summaryParams contain currency symbols ($, €, £, etc.)', () => {
      const currencyPattern = /[$€£¥₹₽₩₪₫₴₦₱฿₡₲₵₸₺₼₾]/;
      const violations: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.summaryParams) continue;

        for (const [paramName, value] of Object.entries(signal.localized.summaryParams)) {
          if (typeof value === 'string' && currencyPattern.test(value)) {
            violations.push(
              `Signal "${signal.key}" param "${paramName}": contains currency symbol — value: "${value}"`,
            );
          }
        }
      }

      assert.deepEqual(violations, [], `Pre-formatted currency violations:\n${violations.join('\n')}`);
    });

    it('no summaryParams contain formatted numbers (e.g., "1,234")', () => {
      const formattedNumberPattern = /\d{1,3}[,]\d{3}/;
      const violations: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.summaryParams) continue;

        for (const [paramName, value] of Object.entries(signal.localized.summaryParams)) {
          if (typeof value === 'string' && formattedNumberPattern.test(value)) {
            violations.push(
              `Signal "${signal.key}" param "${paramName}": contains formatted number — value: "${value}"`,
            );
          }
        }
      }

      assert.deepEqual(violations, [], `Formatted number violations:\n${violations.join('\n')}`);
    });
  });

  describe('validateParams utility confirms all signals pass', () => {
    it('every signal.localized.summaryParams passes validateParams()', () => {
      const failures: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.summaryParams) continue;

        const result = validateParams(signal.localized.summaryParams);
        if (!result.valid) {
          failures.push(
            `Signal "${signal.key}": ${result.issues.join('; ')}`,
          );
        }
      }

      assert.deepEqual(failures, [], `validateParams failures:\n${failures.join('\n')}`);
    });

    it('every signal.localized.explanationParams passes validateParams()', () => {
      const failures: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.explanationParams) continue;

        const result = validateParams(signal.localized.explanationParams);
        if (!result.valid) {
          failures.push(
            `Signal "${signal.key}": ${result.issues.join('; ')}`,
          );
        }
      }

      assert.deepEqual(failures, [], `explanationParams validateParams failures:\n${failures.join('\n')}`);
    });

    it('every signal.localized.reasoningParams passes validateParams()', () => {
      const failures: string[] = [];

      for (const signal of signals) {
        if (!signal.localized?.reasoningParams) continue;

        for (let i = 0; i < signal.localized.reasoningParams.length; i++) {
          const params = signal.localized.reasoningParams[i];
          const result = validateParams(params);
          if (!result.valid) {
            failures.push(
              `Signal "${signal.key}" reasoningParams[${i}]: ${result.issues.join('; ')}`,
            );
          }
        }
      }

      assert.deepEqual(failures, [], `reasoningParams validateParams failures:\n${failures.join('\n')}`);
    });
  });
});
