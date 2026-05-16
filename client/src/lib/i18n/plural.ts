/**
 * Arabic plural forms helper.
 * Arabic has 4 relevant forms for UI: singular (1), dual (2), few (3-10), many (11+).
 *
 * Usage:
 *   arPlural(count, { one: 'إشارة', two: 'إشارتان', few: 'إشارات', many: 'إشارة' })
 *   // 1 → "إشارة واحدة"
 *   // 2 → "إشارتان"
 *   // 5 → "5 إشارات"
 *   // 15 → "15 إشارة"
 */
export interface ArabicPluralForms {
  /** Singular (count = 1). Rendered WITHOUT the number prefix. */
  one: string;
  /** Dual (count = 2). Rendered WITHOUT the number prefix. */
  two: string;
  /** Few (count = 3-10). Rendered WITH the number prefix. */
  few: string;
  /** Many (count >= 11). Rendered WITH the number prefix (tamyiz form). */
  many: string;
}

/**
 * Returns the correct Arabic plural form for a given count.
 * Follows Arabic grammar rules for number-noun agreement.
 */
export function arPlural(count: number, forms: ArabicPluralForms): string {
  if (count === 0) return forms.few; // "لا إشارات" pattern handled by caller
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  if (count >= 3 && count <= 10) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}
