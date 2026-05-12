/**
 * Intelligence Module — public API.
 *
 * This is the ONLY file that external modules should import from.
 * Encapsulates all internal details of the signal engine.
 */

// ── Engine ─────────────────────────────────────────────────────────────
export { signalEngine, recomputeInBackground } from './engine/signal-engine';
export { collectFinancialData } from './engine/data-collector';
export type { FinancialSnapshot, CategoryTotal } from './engine/data-collector';

// ── Signals ────────────────────────────────────────────────────────────
export type {
  FinancialSignal,
  SignalKey,
  SignalSeverity,
  SignalTrend,
  SignalGenerationContext,
} from './signals/signal.types';
export { createSignal, isSignalKey } from './signals/signal.types';

// ── Thresholds ─────────────────────────────────────────────────────────
export { systemDefaults } from './thresholds/defaults';
export { getThresholdConfig, invalidateThresholdCache } from './thresholds/threshold-store';
export type { ThresholdKey, ThresholdConfig, ThresholdRule } from './thresholds/threshold.types';
export { classifySeverity } from './thresholds/threshold.types';

// ── Events ─────────────────────────────────────────────────────────────
export { eventBus } from './events/event-bus';
export type { IEventBus } from './events/event-bus';
export type { DomainEvent, DomainEventType } from './events/event.types';

// ── Localization ───────────────────────────────────────────────────────
export { buildMessage, buildMessages } from './localization/message-builder';

// ── Calculators (for direct use in tests or isolated computations) ────
export * as calculators from './calculators';

// ── Bootstrap ──────────────────────────────────────────────────────────
import { registerOnDataUpdated } from './events/handlers/on-data-updated';
import { registerOnSignalsReady } from './events/handlers/on-signals-ready';

/**
 * Initialize the intelligence module.
 * Call this once during application startup (e.g. in app.ts or index.ts).
 */
export const initIntelligence = (): void => {
  registerOnDataUpdated();
  registerOnSignalsReady();
};
