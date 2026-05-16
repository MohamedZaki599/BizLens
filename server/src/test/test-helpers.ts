/**
 * Shared test utilities for stabilization tests.
 * Provides factories for mock data and assertion helpers for signals.
 */

import type { FinancialSignal, SignalKey } from '../intelligence/signals/signal.types';

// ─── Mock Factories ───────────────────────────────────────────────────────

export interface MockUserOptions {
  id?: string;
  currency?: string;
  language?: string;
  userMode?: 'FREELANCER' | 'ECOMMERCE' | 'SERVICE_BUSINESS';
}

export const createMockUser = (opts: MockUserOptions = {}) => ({
  id: opts.id ?? 'test-user-001',
  email: 'test@bizlens.app',
  name: 'Test User',
  currency: opts.currency ?? 'USD',
  language: opts.language ?? 'en',
  userMode: opts.userMode ?? 'FREELANCER',
  passwordHash: 'hashed',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  lastActivityAt: new Date(),
  notificationsSeenAt: null,
  theme: 'light',
});

export interface MockTransactionOptions {
  userId?: string;
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  date?: Date;
  description?: string;
}

export const createMockTransaction = (opts: MockTransactionOptions = {}) => ({
  id: `txn-${Math.random().toString(36).slice(2, 10)}`,
  userId: opts.userId ?? 'test-user-001',
  amount: opts.amount ?? 100,
  type: opts.type ?? 'EXPENSE',
  categoryId: opts.categoryId ?? 'cat-001',
  date: opts.date ?? new Date(),
  description: opts.description ?? null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export interface MockSignalOptions {
  key?: SignalKey;
  value?: number;
  severity?: FinancialSignal['severity'];
  trend?: FinancialSignal['trend'];
  confidence?: number;
  metadata?: FinancialSignal['metadata'];
  ttlCategory?: FinancialSignal['ttlCategory'];
}

export const createMockSignal = (opts: MockSignalOptions = {}): FinancialSignal => ({
  key: opts.key ?? 'PROFIT_MARGIN',
  value: opts.value ?? 25.5,
  severity: opts.severity ?? 'none',
  trend: opts.trend ?? 'flat',
  confidence: opts.confidence ?? 1.0,
  metadata: opts.metadata ?? {
    explainability: {
      formula: 'test formula',
      inputs: { test: 1 },
      reasoningChain: ['Test reasoning'],
    },
  },
  generatedAt: new Date('2026-05-15T10:00:00Z'),
  ttlCategory: opts.ttlCategory ?? 'dashboard',
  status: 'NEW',
  snoozedUntil: null,
  resolutionNotes: null,
});

// ─── Assertion Helpers ────────────────────────────────────────────────────

/**
 * Asserts two signal arrays are equivalent (same keys, same values, same severity/trend).
 * Ignores generatedAt timestamps.
 */
export const assertSignalsEqual = (
  actual: FinancialSignal[],
  expected: FinancialSignal[],
): { pass: boolean; message: string } => {
  if (actual.length !== expected.length) {
    return {
      pass: false,
      message: `Signal count mismatch: got ${actual.length}, expected ${expected.length}`,
    };
  }

  const sortedActual = [...actual].sort((a, b) => a.key.localeCompare(b.key));
  const sortedExpected = [...expected].sort((a, b) => a.key.localeCompare(b.key));

  for (let i = 0; i < sortedActual.length; i++) {
    const a = sortedActual[i];
    const e = sortedExpected[i];

    if (a.key !== e.key) {
      return { pass: false, message: `Signal key mismatch at index ${i}: got "${a.key}", expected "${e.key}"` };
    }
    if (a.value !== e.value) {
      return { pass: false, message: `Signal "${a.key}" value mismatch: got ${a.value}, expected ${e.value}` };
    }
    if (a.severity !== e.severity) {
      return { pass: false, message: `Signal "${a.key}" severity mismatch: got "${a.severity}", expected "${e.severity}"` };
    }
    if (a.trend !== e.trend) {
      return { pass: false, message: `Signal "${a.key}" trend mismatch: got "${a.trend}", expected "${e.trend}"` };
    }
  }

  return { pass: true, message: 'Signals are equivalent' };
};

/**
 * Asserts a signal has complete explainability metadata.
 */
export const assertSignalHasExplainability = (
  signal: FinancialSignal,
): { pass: boolean; message: string } => {
  const exp = signal.metadata?.explainability;
  if (!exp) {
    return { pass: false, message: `Signal "${signal.key}" missing metadata.explainability` };
  }
  if (!exp.formula) {
    return { pass: false, message: `Signal "${signal.key}" missing explainability.formula` };
  }
  if (!exp.reasoningChain || exp.reasoningChain.length === 0) {
    return { pass: false, message: `Signal "${signal.key}" missing explainability.reasoningChain` };
  }
  return { pass: true, message: `Signal "${signal.key}" has complete explainability` };
};

/**
 * Asserts a monetary string contains the expected currency symbol.
 */
export const assertCurrencyFormat = (
  formatted: string,
  currency: string,
): { pass: boolean; message: string } => {
  const symbols: Record<string, string[]> = {
    USD: ['$', 'USD'],
    EUR: ['€', 'EUR'],
    GBP: ['£', 'GBP'],
    SAR: ['ر.س', 'SAR', 'SR'],
    EGP: ['ج.م', 'EGP', 'E£'],
    AED: ['د.إ', 'AED'],
  };

  const expected = symbols[currency] ?? [currency];
  const found = expected.some((sym) => formatted.includes(sym));

  if (!found) {
    return {
      pass: false,
      message: `Expected "${formatted}" to contain currency symbol for ${currency} (one of: ${expected.join(', ')})`,
    };
  }
  return { pass: true, message: `Currency format correct for ${currency}` };
};
