/**
 * Localized payload builder — maps FinancialSignal data to semantic
 * translation keys with raw interpolation parameters.
 *
 * This module is the single point of translation-key assignment for signals.
 * It ensures all params are raw numbers or short identifiers (no formatting).
 * Validation is non-blocking: warnings are logged but payloads are still returned.
 */

import type { FinancialSignal, SignalKey } from '../signals/signal.types';
import type { LocalizedPayload } from './localization.types';
import { LOCALIZATION_KEYS, type LocalizationKey } from './key-registry';
import { isValidKey, validateParams } from './key-validator';
import { validatePayloadAgainstContract } from './contract-validator';
import { CONTRACT_SCHEMA } from './contract-schema';

// ─── Signal Key → Localization Key Mapping ───────────────────────────────

/**
 * Maps a SignalKey (e.g., 'PROFIT_MARGIN') to its lowercase dot-notation
 * equivalent used in the localization registry (e.g., 'profit_margin').
 */
function signalKeyToSegment(signalKey: SignalKey): string {
  return signalKey.toLowerCase();
}

/**
 * Resolves the summary localization key for a given signal key.
 */
function resolveSummaryKey(signalKey: SignalKey): string {
  return `signals.${signalKeyToSegment(signalKey)}.summary`;
}

/**
 * Resolves the explanation localization key for a given signal key.
 */
function resolveExplanationKey(signalKey: SignalKey): string {
  return `signals.${signalKeyToSegment(signalKey)}.explanation`;
}

// ─── Metadata → Params Extraction ────────────────────────────────────────

/**
 * Extracts raw numeric and short identifier params from signal metadata.
 * Filters out complex objects, arrays, and the explainability sub-object.
 */
function extractParams(metadata: FinancialSignal['metadata']): Record<string, number | string> {
  const params: Record<string, number | string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip the explainability sub-object — it's structural, not a param
    if (key === 'explainability') continue;

    if (typeof value === 'number') {
      params[key] = value;
    } else if (typeof value === 'string') {
      params[key] = value;
    }
    // Skip null, undefined, objects, arrays, booleans — not valid params
  }

  return params;
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Builds a LocalizedPayload for a given FinancialSignal by:
 * 1. Mapping signal.key to the corresponding localization summary/explanation keys
 * 2. Extracting raw numeric/identifier params from signal.metadata
 * 3. Validating the output keys and params (non-blocking — logs warnings)
 *
 * @param signal - The financial signal to build a localized payload for
 * @returns A LocalizedPayload with semantic translation keys and raw params
 */
export function buildLocalizedPayload(signal: FinancialSignal): LocalizedPayload {
  const summaryKey = resolveSummaryKey(signal.key);
  const explanationKey = resolveExplanationKey(signal.key);
  const summaryParams = extractParams(signal.metadata);

  // Validate summary key
  if (!isValidKey(summaryKey)) {
    console.warn(
      `[payload-builder] Invalid summary key "${summaryKey}" for signal "${signal.key}". ` +
      `Key does not match expected pattern.`,
    );
  } else if (!(summaryKey in LOCALIZATION_KEYS)) {
    console.warn(
      `[payload-builder] Summary key "${summaryKey}" not found in LOCALIZATION_KEYS registry ` +
      `for signal "${signal.key}".`,
    );
  }

  // Validate explanation key
  if (!isValidKey(explanationKey)) {
    console.warn(
      `[payload-builder] Invalid explanation key "${explanationKey}" for signal "${signal.key}". ` +
      `Key does not match expected pattern.`,
    );
  } else if (!(explanationKey in LOCALIZATION_KEYS)) {
    console.warn(
      `[payload-builder] Explanation key "${explanationKey}" not found in LOCALIZATION_KEYS registry ` +
      `for signal "${signal.key}".`,
    );
  }

  // Validate params (no pre-formatted values)
  const paramValidation = validateParams(summaryParams);
  if (!paramValidation.valid) {
    console.warn(
      `[payload-builder] Param validation issues for signal "${signal.key}": ` +
      paramValidation.issues.join('; '),
    );
  }

  // Build the payload — always return even if validation warns
  const payload: LocalizedPayload = {
    summaryKey: summaryKey as LocalizationKey,
    summaryParams,
    explanationKey: explanationKey as LocalizationKey,
    explanationParams: summaryParams,
  };

  // Development-mode contract validation (non-blocking, observability only)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);
      if (!result.valid) {
        const issues: string[] = [];
        if (result.missingParams.length > 0) {
          issues.push(`missing params: ${result.missingParams.join(', ')}`);
        }
        if (result.extraParams.length > 0) {
          issues.push(`extra params: ${result.extraParams.join(', ')}`);
        }
        if (result.invalidTypes.length > 0) {
          issues.push(`invalid types: ${result.invalidTypes.join(', ')}`);
        }
        console.warn(
          `[payload-builder] Contract mismatch for signal "${signal.key}" ` +
          `(key: "${payload.summaryKey}"): ${issues.join('; ')}`,
        );
      }
    } catch {
      // Never throw — contract validation is observability only
    }
  }

  return payload;
}
