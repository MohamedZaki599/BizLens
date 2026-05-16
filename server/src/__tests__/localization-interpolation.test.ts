/**
 * Interpolation Integrity Test
 *
 * Generates signals from a test snapshot and validates each signal's localized
 * payload against CONTRACT_SCHEMA using validatePayloadAgainstContract().
 *
 * Asserts:
 * - No missing params (required by schema but absent in payload)
 * - No extra params (present in payload but not in schema)
 * - All param values match expected types (number vs string)
 *
 * Validates: Requirements US8 — Frontend-Backend Contract Synchronization.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { systemDefaults } from '../intelligence/thresholds/defaults';
import { validatePayloadAgainstContract } from '../intelligence/localization/contract-validator';
import { CONTRACT_SCHEMA } from '../intelligence/localization/contract-schema';
import type { FinancialSnapshot } from '../intelligence/engine/data-collector';
import type { SignalGenerationContext } from '../intelligence/signals/signal.types';

// ─── Test Context ─────────────────────────────────────────────────────────

const CTX: SignalGenerationContext = {
  userId: 'interpolation-test-user',
  generatedAt: new Date('2026-05-15T10:00:00Z'),
};

// ─── Test Snapshot ────────────────────────────────────────────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'interpolation-test-user',
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

describe('Localization Interpolation Integrity', () => {
  const snapshot = createTestSnapshot();
  const signals = runAllGenerators(snapshot, CTX, systemDefaults);
  const localizedSignals = signals.filter((s) => s.localized);

  it('generates at least one signal with a localized payload', () => {
    assert.ok(
      localizedSignals.length > 0,
      'Expected at least one signal with a localized payload',
    );
  });

  describe('no missing params', () => {
    it('every localized signal has all params required by CONTRACT_SCHEMA', () => {
      const failures: string[] = [];

      for (const signal of localizedSignals) {
        const result = validatePayloadAgainstContract(signal.localized!, CONTRACT_SCHEMA);
        if (result.missingParams.length > 0) {
          failures.push(
            `Signal "${signal.key}" (key: ${signal.localized!.summaryKey}): missing params [${result.missingParams.join(', ')}]`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Missing params violations:\n${failures.join('\n')}`,
      );
    });
  });

  describe('no extra params', () => {
    it('every localized signal has no params beyond what CONTRACT_SCHEMA defines', () => {
      const failures: string[] = [];

      for (const signal of localizedSignals) {
        const result = validatePayloadAgainstContract(signal.localized!, CONTRACT_SCHEMA);
        if (result.extraParams.length > 0) {
          failures.push(
            `Signal "${signal.key}" (key: ${signal.localized!.summaryKey}): extra params [${result.extraParams.join(', ')}]`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Extra params violations:\n${failures.join('\n')}`,
      );
    });
  });

  describe('all param values match expected types', () => {
    it('every localized signal param type matches CONTRACT_SCHEMA (number vs string)', () => {
      const failures: string[] = [];

      for (const signal of localizedSignals) {
        const result = validatePayloadAgainstContract(signal.localized!, CONTRACT_SCHEMA);
        if (result.invalidTypes.length > 0) {
          failures.push(
            `Signal "${signal.key}" (key: ${signal.localized!.summaryKey}): type mismatches [${result.invalidTypes.join('; ')}]`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Type mismatch violations:\n${failures.join('\n')}`,
      );
    });
  });

  describe('full contract validation passes for all signals', () => {
    it('validatePayloadAgainstContract returns valid=true for every localized signal', () => {
      const failures: string[] = [];

      for (const signal of localizedSignals) {
        const result = validatePayloadAgainstContract(signal.localized!, CONTRACT_SCHEMA);
        if (!result.valid) {
          const issues = [
            ...result.missingParams.map((p) => `missing: ${p}`),
            ...result.extraParams.map((p) => `extra: ${p}`),
            ...result.invalidTypes,
          ];
          failures.push(
            `Signal "${signal.key}" (key: ${signal.localized!.summaryKey}): ${issues.join('; ')}`,
          );
        }
      }

      assert.deepEqual(
        failures,
        [],
        `Contract validation failures:\n${failures.join('\n')}`,
      );
    });
  });
});
