/**
 * Explainability Language-Agnostic Test
 *
 * Verifies that every signal's explainability.reasoningChain entries are
 * language-agnostic: each entry must either match the localization key pattern
 * OR be a pure formula/data reference (no English articles).
 *
 * After T011, all reasoningChain entries should be localization keys.
 * This test enforces that no English prose leaks into the reasoning chain.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../signals/signal-registry';
import { systemDefaults } from '../thresholds/defaults';
import type { FinancialSnapshot } from '../engine/data-collector';
import type { SignalGenerationContext } from '../signals/signal.types';

// ─── Constants ────────────────────────────────────────────────────────────

// Valid localization key pattern: 3 dot-separated segments, each lowercase letters/underscores
const LOCALIZATION_KEY_PATTERN = /^[a-z][a-z_]*\.[a-z][a-z_]*\.[a-z][a-z_]*$/;

// English articles/common words that indicate prose leakage
const ENGLISH_ARTICLES = ['the', 'a', 'is', 'are', 'your'];

// Word-boundary regex for each article to avoid false positives in identifiers
const ARTICLE_PATTERNS = ENGLISH_ARTICLES.map(
  (word) => new RegExp(`\\b${word}\\b`, 'i'),
);

// ─── Test Snapshot ────────────────────────────────────────────────────────

const createTestSnapshot = (): FinancialSnapshot => ({
  userId: 'test-user-explainability-prose',
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

// ─── Helper ───────────────────────────────────────────────────────────────

/**
 * Checks if a reasoning chain entry is a pure formula/data reference.
 * Pure formulas contain math operators, numbers, variable names, or parentheses
 * but no English articles.
 */
function containsEnglishArticles(entry: string): string[] {
  const found: string[] = [];
  for (let i = 0; i < ARTICLE_PATTERNS.length; i++) {
    if (ARTICLE_PATTERNS[i].test(entry)) {
      found.push(ENGLISH_ARTICLES[i]);
    }
  }
  return found;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Explainability Language-Agnostic (No Prose in ReasoningChain)', () => {
  const snapshot = createTestSnapshot();
  const ctx: SignalGenerationContext = {
    userId: 'test-user-explainability-prose',
    generatedAt: new Date('2026-05-15T10:00:00Z'),
  };
  const signals = runAllGenerators(snapshot, ctx, systemDefaults);

  it('generates at least one signal with explainability', () => {
    const withExplainability = signals.filter(
      (s) => s.metadata?.explainability?.reasoningChain?.length,
    );
    assert.ok(
      withExplainability.length > 0,
      'Should have at least one signal with explainability.reasoningChain',
    );
  });

  it('every reasoningChain entry matches localization key pattern OR is a pure formula/data reference (no English articles)', () => {
    const violations: string[] = [];

    for (const signal of signals) {
      const chain = signal.metadata?.explainability?.reasoningChain;
      if (!chain || chain.length === 0) continue;

      for (const entry of chain) {
        // If it matches the localization key pattern, it's valid
        if (LOCALIZATION_KEY_PATTERN.test(entry)) {
          continue;
        }

        // Otherwise, it must be a pure formula/data reference with no English articles
        const articlesFound = containsEnglishArticles(entry);
        if (articlesFound.length > 0) {
          violations.push(
            `Signal "${signal.key}" has prose in reasoningChain: "${entry}" (contains: ${articlesFound.join(', ')})`,
          );
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `ReasoningChain entries with English prose detected:\n  ${violations.join('\n  ')}`,
    );
  });
});
