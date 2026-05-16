/**
 * Seed Integrity Validator
 *
 * Runs after seeding to verify that demo data produces expected signals
 * and no contradictory alert/signal pairs exist.
 *
 * Usage: npx tsx src/test/validate-seed.ts
 */

import 'dotenv/config';
import { prisma } from '@bizlens/database';
import { collectFinancialData } from '../intelligence/engine/data-collector';
import { runAllGenerators } from '../intelligence/signals/signal-registry';
import { getThresholdConfig } from '../intelligence/thresholds/threshold-store';
import type { FinancialSignal, SignalKey } from '../intelligence/signals/signal.types';

// ─── Expected Signal States Per Persona ───────────────────────────────────

interface ExpectedSignalState {
  key: SignalKey;
  /** If true, signal MUST be present. If false, signal SHOULD be present but is optional. */
  required: boolean;
  /** Expected severity (if specified). */
  severity?: FinancialSignal['severity'];
  /** Expected trend (if specified). */
  trend?: FinancialSignal['trend'];
  /** Minimum value threshold. */
  minValue?: number;
}

interface PersonaExpectation {
  email: string;
  label: string;
  expectedSignals: ExpectedSignalState[];
  /** Signals that should NOT be present (contradictions). */
  forbiddenSignals?: SignalKey[];
}

const PERSONA_EXPECTATIONS: PersonaExpectation[] = [
  {
    email: 'demo+freelancer@bizlens.app',
    label: 'Freelancer (Sara)',
    expectedSignals: [
      { key: 'SPEND_SPIKE', required: true, severity: 'warning', trend: 'up' },
      { key: 'PROFIT_TREND', required: true },
      { key: 'PROFIT_MARGIN', required: true },
      { key: 'EXPENSE_GROWTH', required: true },
      { key: 'BURN_RATE', required: true },
    ],
  },
  {
    email: 'demo+ecommerce@bizlens.app',
    label: 'E-commerce (Karim)',
    expectedSignals: [
      { key: 'SPEND_SPIKE', required: true, trend: 'up' },
      { key: 'PROFIT_TREND', required: true },
      { key: 'EXPENSE_GROWTH', required: true },
      { key: 'BURN_RATE', required: true },
    ],
  },
  {
    email: 'demo+business@bizlens.app',
    label: 'Service Business (Lina)',
    expectedSignals: [
      { key: 'SPEND_SPIKE', required: true, trend: 'up' },
      { key: 'PROFIT_TREND', required: true },
      { key: 'PROFIT_MARGIN', required: true },
      { key: 'BURN_RATE', required: true },
    ],
  },
];

// ─── Plausibility Checks ──────────────────────────────────────────────────

interface PlausibilityResult {
  pass: boolean;
  issues: string[];
}

const checkPlausibility = (signals: FinancialSignal[]): PlausibilityResult => {
  const issues: string[] = [];

  // Check: all signals have confidence > 0
  for (const s of signals) {
    if (s.confidence <= 0) {
      issues.push(`Signal "${s.key}" has zero confidence — data may be insufficient`);
    }
  }

  // Check: no contradictory profit signals
  const profitTrend = signals.find((s) => s.key === 'PROFIT_TREND');
  const profitMargin = signals.find((s) => s.key === 'PROFIT_MARGIN');
  if (profitTrend && profitMargin) {
    // If profit margin is positive but trend says "down" with critical severity, that's suspicious
    if (profitMargin.value > 30 && profitTrend.severity === 'critical') {
      issues.push(
        `Contradiction: PROFIT_MARGIN is healthy (${profitMargin.value}%) but PROFIT_TREND is critical`,
      );
    }
  }

  // Check: SPEND_SPIKE category should exist in expense categories
  const spikes = signals.filter((s) => s.key === 'SPEND_SPIKE');
  for (const spike of spikes) {
    if (!spike.metadata?.categoryName) {
      issues.push(`SPEND_SPIKE signal missing categoryName in metadata`);
    }
  }

  return { pass: issues.length === 0, issues };
};

// ─── Main Validation ──────────────────────────────────────────────────────

interface ValidationResult {
  persona: string;
  signalCount: number;
  expectedPassed: number;
  expectedFailed: string[];
  plausibility: PlausibilityResult;
  pass: boolean;
}

const validatePersona = async (expectation: PersonaExpectation): Promise<ValidationResult> => {
  const user = await prisma.user.findUnique({
    where: { email: expectation.email },
    select: { id: true, userMode: true },
  });

  if (!user) {
    return {
      persona: expectation.label,
      signalCount: 0,
      expectedPassed: 0,
      expectedFailed: [`User not found: ${expectation.email}`],
      plausibility: { pass: false, issues: ['User not found'] },
      pass: false,
    };
  }

  const snapshot = await collectFinancialData(user.id);
  const thresholds = await getThresholdConfig(user.userMode);
  const signals = runAllGenerators(snapshot, { userId: user.id, generatedAt: new Date() }, thresholds);

  const expectedFailed: string[] = [];
  let expectedPassed = 0;

  for (const expected of expectation.expectedSignals) {
    const found = signals.find((s) => s.key === expected.key);

    if (!found) {
      if (expected.required) {
        expectedFailed.push(`Missing required signal: ${expected.key}`);
      }
      continue;
    }

    // Check severity if specified
    if (expected.severity && found.severity !== expected.severity) {
      expectedFailed.push(
        `${expected.key}: expected severity "${expected.severity}", got "${found.severity}"`,
      );
      continue;
    }

    // Check trend if specified
    if (expected.trend && found.trend !== expected.trend) {
      expectedFailed.push(
        `${expected.key}: expected trend "${expected.trend}", got "${found.trend}"`,
      );
      continue;
    }

    // Check minimum value if specified
    if (expected.minValue !== undefined && found.value < expected.minValue) {
      expectedFailed.push(
        `${expected.key}: value ${found.value} below minimum ${expected.minValue}`,
      );
      continue;
    }

    expectedPassed++;
  }

  // Check forbidden signals
  if (expectation.forbiddenSignals) {
    for (const forbidden of expectation.forbiddenSignals) {
      if (signals.find((s) => s.key === forbidden)) {
        expectedFailed.push(`Forbidden signal present: ${forbidden}`);
      }
    }
  }

  const plausibility = checkPlausibility(signals);

  return {
    persona: expectation.label,
    signalCount: signals.length,
    expectedPassed,
    expectedFailed,
    plausibility,
    pass: expectedFailed.length === 0 && plausibility.pass,
  };
};

export const validateSeed = async (): Promise<{ allPassed: boolean; results: ValidationResult[] }> => {
  const results: ValidationResult[] = [];

  for (const expectation of PERSONA_EXPECTATIONS) {
    const result = await validatePersona(expectation);
    results.push(result);
  }

  const allPassed = results.every((r) => r.pass);
  return { allPassed, results };
};

// ─── CLI Entry Point ──────────────────────────────────────────────────────

const main = async () => {
  // Skip if DATABASE_URL is not set (CI without database)
  if (!process.env.DATABASE_URL) {
    console.log('⏭  Skipping seed validation — DATABASE_URL not set.\n');
    return;
  }

  // Verify database connectivity before running validation
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.log('⏭  Skipping seed validation — database not reachable.\n');
    return;
  }

  console.log('🔍  Validating seed integrity…\n');

  const { allPassed, results } = await validateSeed();

  for (const result of results) {
    const icon = result.pass ? '✔' : '✗';
    console.log(`  ${icon} ${result.persona}: ${result.signalCount} signals generated`);
    console.log(`    Expected: ${result.expectedPassed}/${result.expectedPassed + result.expectedFailed.length} passed`);

    if (result.expectedFailed.length > 0) {
      for (const failure of result.expectedFailed) {
        console.log(`    ⚠ ${failure}`);
      }
    }

    if (!result.plausibility.pass) {
      for (const issue of result.plausibility.issues) {
        console.log(`    ⚠ Plausibility: ${issue}`);
      }
    }
    console.log('');
  }

  if (allPassed) {
    console.log('✅  All seed integrity checks passed.\n');
  } else {
    console.log('❌  Some seed integrity checks failed.\n');
    process.exit(1);
  }
};

// Only run if executed directly (not imported)
// Skip when run by the test runner — this script requires a seeded database
if (require.main === module) {
  main()
    .catch((err) => {
      console.error('Validation failed:', err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
