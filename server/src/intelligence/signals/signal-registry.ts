/**
 * Signal registry — central list of all signal generators.
 *
 * Adding a new signal type only requires:
 *  1. Create a generator in signals/generators/
 *  2. Register it here
 *  3. Optionally add threshold defaults
 */

import type { FinancialSnapshot } from '../engine/data-collector';
import type { FinancialSignal, SignalGenerationContext } from './signal.types';
import type { ThresholdConfig } from '../thresholds/threshold.types';
import { generateProfitSignals } from './generators/profit-signal';
import { generateSpendingSignals } from './generators/spending-signal';
import { generateForecastSignals } from './generators/forecast-signal';
import { generateAnomalySignals } from './generators/anomaly-signal';

type RegisteredGenerator = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
) => FinancialSignal[];

/** All registered signal generators. Order does not matter — signals are keyed. */
const registry: RegisteredGenerator[] = [
  generateProfitSignals,
  generateSpendingSignals,
  generateForecastSignals,
  generateAnomalySignals,
];

/**
 * Run all registered generators against a snapshot and return the combined signals.
 * Each generator independently handles its own errors via try-catch so a single
 * broken generator never takes down the whole pipeline.
 */
export const runAllGenerators = (
  snapshot: FinancialSnapshot,
  ctx: SignalGenerationContext,
  thresholds: ThresholdConfig,
): FinancialSignal[] => {
  const signals: FinancialSignal[] = [];

  for (const generator of registry) {
    try {
      const batch = generator(snapshot, ctx, thresholds);
      signals.push(...batch);
    } catch {
      // Individual generator failure is non-fatal — logged upstream by the engine
    }
  }

  return signals;
};
