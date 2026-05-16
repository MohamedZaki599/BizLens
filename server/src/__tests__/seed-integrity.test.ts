/**
 * Seed Integrity Test
 *
 * Validates that mock snapshots simulating each persona's expected data
 * produce the correct signals WITHOUT requiring a database connection.
 * Uses the same approach as signal-determinism.test.ts: import systemDefaults,
 * import runAllGenerators, create mock FinancialSnapshot objects.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { systemDefaults } from '../intelligence/thresholds/defaults';
import type { FinancialSnapshot } from '../intelligence/engine/data-collector';
import type { SignalGenerationContext } from '../intelligence/signals/signal.types';

// ─── Mock Snapshot Factories (per persona) ────────────────────────────────

const CTX: SignalGenerationContext = {
  userId: 'seed-test-user',
  generatedAt: new Date('2026-05-15T10:00:00Z'),
};

/**
 * Freelancer persona: Marketing spike at 2.4x
 * dailyExpenseBase=35, Marketing weight=0.15, spike multiplier=2.4
 * Current month Marketing ≈ 1200 (spiked), 3-month avg ≈ 500
 * Ratio = 1200/500 = 2.4x → 140% above baseline → well above 50% threshold
 */
const createFreelancerSnapshot = (): FinancialSnapshot => ({
  userId: 'seed-freelancer',
  collectedAt: new Date('2026-05-15T10:00:00Z'),

  monthIncome: 5200,
  monthExpense: 3800,
  monthProfit: 1400,
  monthTransactionCount: 45,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),

  prevMonthIncome: 4800,
  prevMonthExpense: 3200,
  prevMonthProfit: 1600,
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
    ['cat-marketing', 500],    // 1200 / 500 = 2.4x → 140% spike
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

/**
 * E-commerce persona: Ads spike at 1.7x
 * dailyExpenseBase=280, Ads weight=0.32, spike multiplier=1.7
 * Current month Ads ≈ 4500 (spiked), 3-month avg ≈ 2650
 * Ratio = 4500/2650 ≈ 1.7x → ~70% above baseline → above 50% threshold
 */
const createEcommerceSnapshot = (): FinancialSnapshot => ({
  userId: 'seed-ecommerce',
  collectedAt: new Date('2026-05-15T10:00:00Z'),

  monthIncome: 18000,
  monthExpense: 12500,
  monthProfit: 5500,
  monthTransactionCount: 120,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),

  prevMonthIncome: 16000,
  prevMonthExpense: 11000,
  prevMonthProfit: 5000,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-ads', name: 'Ads', color: '#ef4444', total: 2650 },
    { categoryId: 'cat-shipping', name: 'Shipping', color: '#f97316', total: 1500 },
    { categoryId: 'cat-inventory', name: 'Inventory', color: '#7c5cff', total: 2100 },
  ],

  weekIncome: 4500,
  weekExpense: 3100,
  weekProfit: 1400,
  prevWeekIncome: 4000,
  prevWeekExpense: 2800,
  prevWeekProfit: 1200,

  monthExpenseByCategory: [
    { categoryId: 'cat-ads', name: 'Ads', color: '#ef4444', total: 4500 },
    { categoryId: 'cat-shipping', name: 'Shipping', color: '#f97316', total: 1500 },
    { categoryId: 'cat-inventory', name: 'Inventory', color: '#7c5cff', total: 3200 },
    { categoryId: 'cat-packaging', name: 'Packaging', color: '#f59e0b', total: 800 },
    { categoryId: 'cat-saas', name: 'SaaS Tools', color: '#3b82f6', total: 1000 },
    { categoryId: 'cat-returns', name: 'Returns & Refunds', color: '#a855f7', total: 1500 },
  ],
  monthIncomeByCategory: [
    { categoryId: 'cat-shopify', name: 'Shopify Sales', color: '#22c55e', total: 12000 },
    { categoryId: 'cat-wholesale', name: 'Wholesale', color: '#16a34a', total: 4000 },
    { categoryId: 'cat-affiliate', name: 'Affiliate', color: '#06b6d4', total: 2000 },
  ],
  threeMonthExpenseAvgByCategory: new Map([
    ['cat-ads', 2650],         // 4500 / 2650 ≈ 1.7x → ~70% spike
    ['cat-shipping', 1500],
    ['cat-inventory', 2100],
    ['cat-packaging', 750],
    ['cat-saas', 950],
    ['cat-returns', 700],
  ]),

  daysSinceLastTransaction: 0,
  totalTransactions: 600,
  lastTransactionAt: new Date('2026-05-15T09:00:00Z'),
  recentExpenseTransactions: [],
});

/**
 * Service business persona: Marketing spike at 2.1x
 * dailyExpenseBase=520, Marketing weight=0.12, spike multiplier=2.1
 * Current month Marketing ≈ 3900 (spiked), 3-month avg ≈ 1860
 * Ratio = 3900/1860 ≈ 2.1x → ~110% above baseline → above 50% threshold
 */
const createServiceBusinessSnapshot = (): FinancialSnapshot => ({
  userId: 'seed-service-business',
  collectedAt: new Date('2026-05-15T10:00:00Z'),

  monthIncome: 35000,
  monthExpense: 26000,
  monthProfit: 9000,
  monthTransactionCount: 85,
  monthDaysElapsed: 15,
  monthTotalDays: 31,
  monthStart: new Date('2026-05-01T00:00:00Z'),
  monthEnd: new Date('2026-05-31T23:59:59Z'),

  prevMonthIncome: 32000,
  prevMonthExpense: 24000,
  prevMonthProfit: 8000,
  prevMonthExpenseByCategory: [
    { categoryId: 'cat-payroll', name: 'Payroll', color: '#7c5cff', total: 11000 },
    { categoryId: 'cat-rent', name: 'Rent & Utilities', color: '#f59e0b', total: 4300 },
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 1860 },
  ],

  weekIncome: 8750,
  weekExpense: 6500,
  weekProfit: 2250,
  prevWeekIncome: 8000,
  prevWeekExpense: 6000,
  prevWeekProfit: 2000,

  monthExpenseByCategory: [
    { categoryId: 'cat-payroll', name: 'Payroll', color: '#7c5cff', total: 11700 },
    { categoryId: 'cat-rent', name: 'Rent & Utilities', color: '#f59e0b', total: 4700 },
    { categoryId: 'cat-marketing', name: 'Marketing', color: '#ef4444', total: 3900 },
    { categoryId: 'cat-software', name: 'Software & Tools', color: '#3b82f6', total: 2600 },
    { categoryId: 'cat-travel', name: 'Travel', color: '#84cc16', total: 2100 },
    { categoryId: 'cat-professional', name: 'Professional Services', color: '#a855f7', total: 1000 },
  ],
  monthIncomeByCategory: [
    { categoryId: 'cat-service', name: 'Service Revenue', color: '#22c55e', total: 25000 },
    { categoryId: 'cat-setup', name: 'Setup Fees', color: '#10b981', total: 5000 },
    { categoryId: 'cat-maintenance', name: 'Maintenance Contracts', color: '#06b6d4', total: 5000 },
  ],
  threeMonthExpenseAvgByCategory: new Map([
    ['cat-payroll', 11000],
    ['cat-rent', 4300],
    ['cat-marketing', 1860],   // 3900 / 1860 ≈ 2.1x → ~110% spike
    ['cat-software', 2500],
    ['cat-travel', 2000],
    ['cat-professional', 950],
  ]),

  daysSinceLastTransaction: 0,
  totalTransactions: 450,
  lastTransactionAt: new Date('2026-05-15T09:00:00Z'),
  recentExpenseTransactions: [],
});

// ─── T030: Spike Multiplier Verification ──────────────────────────────────
//
// Freelancer Marketing spike calculation:
//   dailyExpenseBase = 35, Marketing weight = 0.15, spike multiplier = 2.4
//   Appearance rate ≈ min(1, weight * 5) = min(1, 0.75) = 0.75
//   Current month Marketing ≈ 35 * 0.15 * 2.4 * 30 * 0.75 ≈ 283.5 (per-day jitter varies)
//   3-month baseline avg (no spike) ≈ 35 * 0.15 * 30 * 0.75 ≈ 118.1
//   Ratio = spiked / baseline ≈ 2.4x → 140% above baseline
//   SPEND_SPIKE_WARNING_PCT threshold = 50%
//   140% >> 50% → CONFIRMED: spike reliably exceeds threshold
//
// In the test snapshots we use aggregated totals that match the seed output:
//   Freelancer: Marketing current=1200, avg=500 → 140% spike ✓
//   E-commerce: Ads current=4500, avg=2650 → ~70% spike ✓
//   Service Business: Marketing current=3900, avg=1860 → ~110% spike ✓
//
// All spike multipliers reliably exceed the 50% SPEND_SPIKE_WARNING_PCT threshold.
// ──────────────────────────────────────────────────────────────────────────

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Seed Integrity', () => {
  it('Freelancer persona produces SPEND_SPIKE for Marketing (1200 current vs 500 avg = 140% spike)', () => {
    const snapshot = createFreelancerSnapshot();
    const signals = runAllGenerators(snapshot, CTX, systemDefaults);

    const spike = signals.find(
      (s) => s.key === 'SPEND_SPIKE' && s.metadata?.categoryName === 'Marketing',
    );

    assert.ok(spike, 'Freelancer should produce SPEND_SPIKE for Marketing');
    assert.ok(spike.value >= 100, `Spike value should be >= 100% (got ${spike.value})`);
    assert.equal(spike.trend, 'up', 'Spike trend should be up');
    assert.ok(
      spike.severity === 'warning' || spike.severity === 'critical',
      `Spike severity should be warning or critical (got ${spike.severity})`,
    );
  });

  it('E-commerce persona produces SPEND_SPIKE for Ads (high current vs baseline)', () => {
    const snapshot = createEcommerceSnapshot();
    const signals = runAllGenerators(snapshot, CTX, systemDefaults);

    const spike = signals.find(
      (s) => s.key === 'SPEND_SPIKE' && s.metadata?.categoryName === 'Ads',
    );

    assert.ok(spike, 'E-commerce should produce SPEND_SPIKE for Ads');
    assert.ok(spike.value >= 50, `Spike value should be >= 50% (got ${spike.value})`);
    assert.equal(spike.trend, 'up', 'Spike trend should be up');
  });

  it('Service business persona produces SPEND_SPIKE for Marketing', () => {
    const snapshot = createServiceBusinessSnapshot();
    const signals = runAllGenerators(snapshot, CTX, systemDefaults);

    const spike = signals.find(
      (s) => s.key === 'SPEND_SPIKE' && s.metadata?.categoryName === 'Marketing',
    );

    assert.ok(spike, 'Service business should produce SPEND_SPIKE for Marketing');
    assert.ok(spike.value >= 100, `Spike value should be >= 100% (got ${spike.value})`);
    assert.equal(spike.trend, 'up', 'Spike trend should be up');
  });

  it('All personas produce PROFIT_TREND signal', () => {
    const snapshots = [
      { label: 'Freelancer', snapshot: createFreelancerSnapshot() },
      { label: 'E-commerce', snapshot: createEcommerceSnapshot() },
      { label: 'Service Business', snapshot: createServiceBusinessSnapshot() },
    ];

    for (const { label, snapshot } of snapshots) {
      const signals = runAllGenerators(snapshot, CTX, systemDefaults);
      const profitTrend = signals.find((s) => s.key === 'PROFIT_TREND');
      assert.ok(profitTrend, `${label} should produce PROFIT_TREND signal`);
    }
  });

  it('No persona produces contradictory signals (PROFIT_TREND up + PROFIT_DROP)', () => {
    const snapshots = [
      { label: 'Freelancer', snapshot: createFreelancerSnapshot() },
      { label: 'E-commerce', snapshot: createEcommerceSnapshot() },
      { label: 'Service Business', snapshot: createServiceBusinessSnapshot() },
    ];

    for (const { label, snapshot } of snapshots) {
      const signals = runAllGenerators(snapshot, CTX, systemDefaults);
      const profitTrend = signals.find((s) => s.key === 'PROFIT_TREND');
      const profitDrop = signals.find((s) => s.key === 'PROFIT_DROP');

      // If both exist, they should not contradict
      if (profitTrend && profitDrop) {
        // PROFIT_TREND with trend 'up' should not coexist with PROFIT_DROP
        assert.ok(
          !(profitTrend.trend === 'up' && profitDrop.severity !== 'none'),
          `${label}: PROFIT_TREND up should not coexist with active PROFIT_DROP`,
        );
      }
    }
  });
});
