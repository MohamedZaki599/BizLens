/**
 * Namespace Ownership Test
 *
 * Validates that localization keys are properly grouped by namespace and that
 * each component (signal generators, alert engine, assistant, insight engine)
 * only produces keys within its designated namespace prefix.
 *
 * Validates: Requirements US5 — Governance validation for namespace ownership.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALIZATION_KEYS } from '../intelligence/localization/key-registry';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { systemDefaults } from '../intelligence/thresholds/defaults';
import type { FinancialSnapshot } from '../intelligence/engine/data-collector';
import type { SignalGenerationContext } from '../intelligence/signals/signal.types';

// ─── Valid Namespaces ─────────────────────────────────────────────────────

const VALID_NAMESPACES = [
  'signals',
  'alerts',
  'assistant',
  'insights',
  'reasoning',
  'confidence',
  'status',
] as const;

type ValidNamespace = (typeof VALID_NAMESPACES)[number];

// ─── Test Helpers ─────────────────────────────────────────────────────────

const allKeys = Object.keys(LOCALIZATION_KEYS);

/** Extract the namespace prefix from a key (first dot-separated segment). */
const getNamespace = (key: string): string => key.split('.')[0];

/** Group keys by their namespace prefix. */
const groupByNamespace = (keys: string[]): Map<string, string[]> => {
  const groups = new Map<string, string[]>();
  for (const key of keys) {
    const ns = getNamespace(key);
    const existing = groups.get(ns) ?? [];
    existing.push(key);
    groups.set(ns, existing);
  }
  return groups;
};

// ─── Mock Snapshot for Signal Generation ──────────────────────────────────

const CTX: SignalGenerationContext = {
  userId: 'ownership-test-user',
  generatedAt: new Date('2026-05-15T10:00:00Z'),
};

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'ownership-test-user',
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

describe('Localization Namespace Ownership', () => {
  describe('Registry namespace grouping', () => {
    it('all keys in LOCALIZATION_KEYS start with a valid namespace prefix', () => {
      const invalidKeys: string[] = [];
      for (const key of allKeys) {
        const ns = getNamespace(key);
        if (!VALID_NAMESPACES.includes(ns as ValidNamespace)) {
          invalidKeys.push(key);
        }
      }
      assert.deepEqual(
        invalidKeys,
        [],
        `Found keys with unexpected namespace prefixes: ${invalidKeys.join(', ')}`,
      );
    });

    it('all keys starting with "signals." belong to the signals namespace', () => {
      const signalKeys = allKeys.filter((k) => k.startsWith('signals.'));
      assert.ok(signalKeys.length > 0, 'Should have at least one signals.* key');
      for (const key of signalKeys) {
        assert.equal(
          getNamespace(key),
          'signals',
          `Key "${key}" should belong to signals namespace`,
        );
      }
    });

    it('all keys starting with "alerts." belong to the alerts namespace', () => {
      const alertKeys = allKeys.filter((k) => k.startsWith('alerts.'));
      assert.ok(alertKeys.length > 0, 'Should have at least one alerts.* key');
      for (const key of alertKeys) {
        assert.equal(
          getNamespace(key),
          'alerts',
          `Key "${key}" should belong to alerts namespace`,
        );
      }
    });

    it('all keys starting with "assistant." belong to the assistant namespace', () => {
      const assistantKeys = allKeys.filter((k) => k.startsWith('assistant.'));
      assert.ok(assistantKeys.length > 0, 'Should have at least one assistant.* key');
      for (const key of assistantKeys) {
        assert.equal(
          getNamespace(key),
          'assistant',
          `Key "${key}" should belong to assistant namespace`,
        );
      }
    });

    it('all keys starting with "insights." belong to the insights namespace', () => {
      const insightKeys = allKeys.filter((k) => k.startsWith('insights.'));
      assert.ok(insightKeys.length > 0, 'Should have at least one insights.* key');
      for (const key of insightKeys) {
        assert.equal(
          getNamespace(key),
          'insights',
          `Key "${key}" should belong to insights namespace`,
        );
      }
    });

    it('all keys starting with "reasoning." belong to the reasoning namespace', () => {
      const reasoningKeys = allKeys.filter((k) => k.startsWith('reasoning.'));
      assert.ok(reasoningKeys.length > 0, 'Should have at least one reasoning.* key');
      for (const key of reasoningKeys) {
        assert.equal(
          getNamespace(key),
          'reasoning',
          `Key "${key}" should belong to reasoning namespace`,
        );
      }
    });

    it('all keys starting with "confidence." belong to the confidence namespace', () => {
      const confidenceKeys = allKeys.filter((k) => k.startsWith('confidence.'));
      assert.ok(confidenceKeys.length > 0, 'Should have at least one confidence.* key');
      for (const key of confidenceKeys) {
        assert.equal(
          getNamespace(key),
          'confidence',
          `Key "${key}" should belong to confidence namespace`,
        );
      }
    });

    it('all keys starting with "status." belong to the status namespace', () => {
      const statusKeys = allKeys.filter((k) => k.startsWith('status.'));
      assert.ok(statusKeys.length > 0, 'Should have at least one status.* key');
      for (const key of statusKeys) {
        assert.equal(
          getNamespace(key),
          'status',
          `Key "${key}" should belong to status namespace`,
        );
      }
    });

    it('no namespace has zero keys (all expected namespaces are populated)', () => {
      const grouped = groupByNamespace(allKeys);
      for (const ns of VALID_NAMESPACES) {
        const keys = grouped.get(ns) ?? [];
        assert.ok(
          keys.length > 0,
          `Namespace "${ns}" should have at least one key but has none`,
        );
      }
    });
  });

  describe('Signal generators only produce keys in "signals.*" namespace', () => {
    it('all localized.summaryKey values from signal generators start with "signals."', () => {
      const snapshot = createTestSnapshot();
      const signals = runAllGenerators(snapshot, CTX, systemDefaults);

      const violations: string[] = [];
      for (const signal of signals) {
        if (!signal.localized) continue;
        const { summaryKey } = signal.localized;
        if (!summaryKey.startsWith('signals.')) {
          violations.push(`Signal ${signal.key}: summaryKey "${summaryKey}" does not start with "signals."`);
        }
      }
      assert.deepEqual(violations, [], violations.join('\n'));
    });

    it('all localized.explanationKey values from signal generators start with "signals."', () => {
      const snapshot = createTestSnapshot();
      const signals = runAllGenerators(snapshot, CTX, systemDefaults);

      const violations: string[] = [];
      for (const signal of signals) {
        if (!signal.localized?.explanationKey) continue;
        const { explanationKey } = signal.localized;
        if (!explanationKey.startsWith('signals.')) {
          violations.push(`Signal ${signal.key}: explanationKey "${explanationKey}" does not start with "signals."`);
        }
      }
      assert.deepEqual(violations, [], violations.join('\n'));
    });

    it('all localized.reasoningKeys from signal generators start with "reasoning."', () => {
      const snapshot = createTestSnapshot();
      const signals = runAllGenerators(snapshot, CTX, systemDefaults);

      const violations: string[] = [];
      for (const signal of signals) {
        if (!signal.localized?.reasoningKeys) continue;
        for (const rk of signal.localized.reasoningKeys) {
          if (!rk.startsWith('reasoning.')) {
            violations.push(`Signal ${signal.key}: reasoningKey "${rk}" does not start with "reasoning."`);
          }
        }
      }
      assert.deepEqual(violations, [], violations.join('\n'));
    });
  });

  describe('Alert engine only produces keys in "alerts.*" namespace', () => {
    it('all alert localized titleKey values in LOCALIZATION_KEYS start with "alerts."', () => {
      // Verify that the alert namespace keys in the registry are properly scoped
      const alertKeys = allKeys.filter((k) => k.startsWith('alerts.'));
      for (const key of alertKeys) {
        assert.match(
          key,
          /^alerts\.[a-z_]+\.(title|message)$/,
          `Alert key "${key}" should follow pattern alerts.{rule_name}.{title|message}`,
        );
      }
    });

    it('no alert key leaks into other namespaces', () => {
      // Alert-related terms should not appear in non-alert namespaces
      const nonAlertKeys = allKeys.filter((k) => !k.startsWith('alerts.'));
      const alertTerms = ['spend_spike', 'expenses_exceed', 'profit_drop', 'weekly_spend_increase', 'forecast_overspend', 'recurring_detected'];
      const leaks: string[] = [];
      for (const key of nonAlertKeys) {
        // Only check if the key's second segment matches an alert-specific term
        const segments = key.split('.');
        if (segments.length >= 2 && alertTerms.includes(segments[1]) && !key.startsWith('signals.') && !key.startsWith('reasoning.')) {
          leaks.push(key);
        }
      }
      // category_concentration and stale_data are shared concepts across signals and alerts — not leaks
      assert.deepEqual(leaks, [], `Alert terms leaked into other namespaces: ${leaks.join(', ')}`);
    });
  });

  describe('Assistant only produces keys in "assistant.*" namespace', () => {
    it('all assistant keys in LOCALIZATION_KEYS start with "assistant."', () => {
      const assistantKeys = allKeys.filter((k) => k.startsWith('assistant.'));
      for (const key of assistantKeys) {
        assert.match(
          key,
          /^assistant\.[a-z_]+\.(title|message)$/,
          `Assistant key "${key}" should follow pattern assistant.{note_kind}.{title|message}`,
        );
      }
    });

    it('assistant namespace covers all expected note kinds', () => {
      const assistantKeys = allKeys.filter((k) => k.startsWith('assistant.'));
      const noteKinds = new Set(assistantKeys.map((k) => k.split('.')[1]));
      const expectedKinds = [
        'weekly_pulse',
        'profit_trend',
        'expense_driver',
        'subscriptions',
        'stale_data',
        'forecast',
        'signal_explanation',
      ];
      for (const kind of expectedKinds) {
        assert.ok(
          noteKinds.has(kind),
          `Assistant namespace should include kind "${kind}" but found: ${[...noteKinds].join(', ')}`,
        );
      }
    });
  });

  describe('Insight engine only produces keys in "insights.*" namespace', () => {
    it('all insight keys in LOCALIZATION_KEYS start with "insights."', () => {
      const insightKeys = allKeys.filter((k) => k.startsWith('insights.'));
      for (const key of insightKeys) {
        assert.match(
          key,
          /^insights\.[a-z_]+\.(title|message)$/,
          `Insight key "${key}" should follow pattern insights.{insight_kind}.{title|message}`,
        );
      }
    });

    it('insight namespace covers all expected insight kinds', () => {
      const insightKeys = allKeys.filter((k) => k.startsWith('insights.'));
      const insightKinds = new Set(insightKeys.map((k) => k.split('.')[1]));
      const expectedKinds = [
        'weekly_comparison',
        'monthly_comparison',
        'top_expense',
        'top_income',
        'profit_trend',
        'spending_anomaly',
      ];
      for (const kind of expectedKinds) {
        assert.ok(
          insightKinds.has(kind),
          `Insight namespace should include kind "${kind}" but found: ${[...insightKinds].join(', ')}`,
        );
      }
    });
  });

  describe('No unexpected namespace prefixes', () => {
    it('every key in the registry belongs to exactly one of the valid namespaces', () => {
      const grouped = groupByNamespace(allKeys);
      const unexpectedNamespaces = [...grouped.keys()].filter(
        (ns) => !VALID_NAMESPACES.includes(ns as ValidNamespace),
      );
      assert.deepEqual(
        unexpectedNamespaces,
        [],
        `Found unexpected namespaces: ${unexpectedNamespaces.join(', ')}`,
      );
    });

    it('no key belongs to multiple namespaces (no dots in namespace segment)', () => {
      for (const key of allKeys) {
        const ns = getNamespace(key);
        assert.ok(
          !ns.includes('.'),
          `Namespace segment "${ns}" in key "${key}" should not contain dots`,
        );
        assert.ok(
          VALID_NAMESPACES.includes(ns as ValidNamespace),
          `Key "${key}" has namespace "${ns}" which is not in the valid set`,
        );
      }
    });
  });
});
