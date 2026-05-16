/**
 * Naming convention validator for localization keys and parameters.
 *
 * Key pattern: `{namespace}.{signal_key}.{field}`
 * - Exactly 3 dot-separated segments
 * - Each segment: lowercase letters and underscores only
 *
 * Param validation rejects pre-formatted values to ensure all formatting
 * happens on the client side (locale-aware).
 */

/**
 * Valid key pattern: exactly 3 dot-separated segments,
 * each segment lowercase letters and underscores only.
 * Example: `signals.profit_margin.summary`
 */
const KEY_PATTERN = /^[a-z][a-z_]*\.[a-z][a-z_]*\.[a-z][a-z_]*$/;

/**
 * Currency symbols that indicate pre-formatted monetary values.
 */
const CURRENCY_SYMBOLS = /[$€£¥₹₽₩₪₫₴₦₱฿₡₲₵₸₺₼₾]/;

/**
 * Formatted number pattern: digits with comma/period grouping (e.g., "1,234" or "1.234.567").
 * Matches numbers with at least one grouping separator followed by digits.
 */
const FORMATTED_NUMBER_PATTERN = /\d{1,3}[,]\d{3}/;

/**
 * Maximum allowed length for string parameter values.
 * Strings longer than this are likely pre-formatted prose.
 */
const MAX_PARAM_STRING_LENGTH = 50;

/**
 * Validates that a localization key follows the naming convention:
 * `namespace.signal_key.field` — lowercase, underscores, exactly 3 segments.
 *
 * @param key - The localization key to validate
 * @returns true if the key matches the required pattern
 */
export function isValidKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

/**
 * Validates that parameter values are raw (unformatted) data suitable for
 * client-side locale-aware formatting.
 *
 * Rejects:
 * - Strings containing `%` (pre-formatted percentages)
 * - Strings containing `$`, `€`, `£`, `¥`, or other currency symbols
 * - Strings containing formatted numbers like "1,234"
 * - Non-number, non-string values
 *
 * @param params - The parameters record to validate
 * @returns Validation result with list of issues found
 */
export function validateParams(
  params: Record<string, unknown>,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const [paramName, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      issues.push(`Param "${paramName}" is ${value}`);
      continue;
    }

    if (typeof value === 'number') {
      // Numbers are always valid (raw values)
      continue;
    }

    if (typeof value !== 'string') {
      issues.push(
        `Param "${paramName}" has invalid type "${typeof value}" (expected number or string)`,
      );
      continue;
    }

    // String-specific checks
    const str = value as string;

    if (str.includes('%')) {
      issues.push(
        `Param "${paramName}" contains "%" — pass raw number instead of pre-formatted percentage`,
      );
    }

    if (CURRENCY_SYMBOLS.test(str)) {
      issues.push(
        `Param "${paramName}" contains currency symbol — pass raw number instead of pre-formatted amount`,
      );
    }

    if (FORMATTED_NUMBER_PATTERN.test(str)) {
      issues.push(
        `Param "${paramName}" contains formatted number — pass raw number instead (e.g., 1234 not "1,234")`,
      );
    }

    if (str.length > MAX_PARAM_STRING_LENGTH) {
      issues.push(
        `Param "${paramName}" exceeds ${MAX_PARAM_STRING_LENGTH} chars — likely pre-formatted prose`,
      );
    }
  }

  return { valid: issues.length === 0, issues };
}
