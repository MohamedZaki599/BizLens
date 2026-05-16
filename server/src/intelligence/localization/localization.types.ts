/**
 * Typed localization payload interfaces for the intelligence layer.
 *
 * These interfaces define the shape of localized data attached to signals,
 * alerts, assistant notes, and insight cards. All keys reference entries in
 * the central LOCALIZATION_KEYS registry. Params carry raw values only —
 * formatting is the responsibility of the consuming client/translation layer.
 *
 * Consumers: signal generators, alert engine, assistant service, insight engine.
 */

import type { LocalizationKey } from './key-registry';

// ─── Signal Localization ─────────────────────────────────────────────────

/**
 * Localized payload attached to a FinancialSignal.
 * Contains semantic translation keys and raw interpolation parameters.
 */
export interface LocalizedPayload {
  /** Key referencing the signal's summary translation template. */
  summaryKey: LocalizationKey;
  /** Raw interpolation params for the summary (numbers or short identifiers). */
  summaryParams: Record<string, number | string>;
  /** Optional key referencing a longer explanation template. */
  explanationKey?: LocalizationKey;
  /** Raw interpolation params for the explanation. */
  explanationParams?: Record<string, number | string>;
  /** Optional ordered list of reasoning chain keys for explainability. */
  reasoningKeys?: LocalizationKey[];
  /** Parallel array of params for each reasoning key entry. */
  reasoningParams?: Record<string, number | string>[];
}

// ─── Alert Localization ──────────────────────────────────────────────────

/**
 * Localized payload attached to an alert draft.
 * Provides semantic keys for alert title and message.
 */
export interface LocalizedAlert {
  /** Key referencing the alert title translation template. */
  titleKey: LocalizationKey;
  /** Raw interpolation params for the title. */
  titleParams: Record<string, number | string>;
  /** Key referencing the alert message translation template. */
  messageKey: LocalizationKey;
  /** Raw interpolation params for the message. */
  messageParams: Record<string, number | string>;
}

// ─── Assistant Note Localization ─────────────────────────────────────────

/**
 * Localized payload attached to an assistant note.
 * Provides semantic keys for note title, message, and optional metric.
 */
export interface LocalizedNote {
  /** Key referencing the note title translation template. */
  titleKey: LocalizationKey;
  /** Raw interpolation params for the title. */
  titleParams: Record<string, number | string>;
  /** Key referencing the note message translation template. */
  messageKey: LocalizationKey;
  /** Raw interpolation params for the message. */
  messageParams: Record<string, number | string>;
  /** Optional key referencing a metric label or value template. */
  metricKey?: LocalizationKey;
  /** Raw interpolation params for the metric. */
  metricParams?: Record<string, number | string>;
}
