/**
 * Contract validation utility — validates localized payloads against the
 * shared CONTRACT_SCHEMA to ensure param completeness and type correctness.
 *
 * Used by:
 * - Development-mode runtime checks in payload-builder.ts
 * - Interpolation integrity tests
 * - CI contract sync verification
 */

import type { LocalizedPayload } from './localization.types';
import type { ContractSchema } from './contract-schema';

// ─── Validation Result ───────────────────────────────────────────────────

export interface ValidationResult {
  /** Whether the payload fully satisfies the contract. */
  valid: boolean;
  /** Params required by the schema but missing from the payload. */
  missingParams: string[];
  /** Params present in the payload but not defined in the schema. */
  extraParams: string[];
  /** Params whose runtime type doesn't match the schema's expected type. */
  invalidTypes: string[];
}

// ─── Validator ───────────────────────────────────────────────────────────

/**
 * Validates a LocalizedPayload's summaryParams against the CONTRACT_SCHEMA
 * entry for its summaryKey.
 *
 * Checks:
 * 1. The summaryKey exists in the schema
 * 2. All required params from the schema are present in summaryParams
 * 3. No extra params exist that aren't defined in the schema
 * 4. Each param value matches the expected type (number vs string)
 *
 * @param payload - The localized payload to validate
 * @param schema - The contract schema to validate against
 * @returns A ValidationResult with details of any mismatches
 */
export function validatePayloadAgainstContract(
  payload: LocalizedPayload,
  schema: ContractSchema,
): ValidationResult {
  const missingParams: string[] = [];
  const extraParams: string[] = [];
  const invalidTypes: string[] = [];

  const entry = schema[payload.summaryKey];

  // Unknown key — not in schema
  if (!entry) {
    return {
      valid: false,
      missingParams: [],
      extraParams: [],
      invalidTypes: [`Unknown key: ${payload.summaryKey}`],
    };
  }

  const expectedParams = entry.params;
  const actualParams = payload.summaryParams;

  // Check for missing params (required by schema but absent in payload)
  for (const paramName of Object.keys(expectedParams)) {
    if (!(paramName in actualParams)) {
      missingParams.push(paramName);
    }
  }

  // Check for extra params (present in payload but not in schema)
  for (const paramName of Object.keys(actualParams)) {
    if (!(paramName in expectedParams)) {
      extraParams.push(paramName);
    }
  }

  // Check type mismatches for params that exist in both
  for (const [paramName, expectedType] of Object.entries(expectedParams)) {
    if (paramName in actualParams) {
      const actualValue = actualParams[paramName];
      const actualType = typeof actualValue;

      if (actualType !== expectedType) {
        invalidTypes.push(
          `${paramName}: expected ${expectedType}, got ${actualType}`,
        );
      }
    }
  }

  const valid =
    missingParams.length === 0 &&
    extraParams.length === 0 &&
    invalidTypes.length === 0;

  return { valid, missingParams, extraParams, invalidTypes };
}
