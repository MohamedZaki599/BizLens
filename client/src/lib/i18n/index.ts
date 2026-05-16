/**
 * BizLens i18n — Modular localization architecture
 *
 * This barrel re-exports the translation hooks from the original i18n module
 * AND the new modular pieces (financial terminology, signal messages, formatters).
 *
 * Backward-compatible: all existing `useT()` / `t()` calls continue to work.
 */

// Re-export everything from the original i18n (t, ti, useT, useTi)
export { t, ti, useT, useTi } from './core';

// Re-export financial terminology
export { financialTermsEn, financialTermsAr } from './terminology/financial';

// Re-export signal messages
export { signalMessagesEn, signalMessagesAr } from './messages/signals';

// Re-export Arabic plural helper
export { arPlural, type ArabicPluralForms } from './plural';

// Re-export formatters
export {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatNumberCompact,
  formatPercent,
  formatDate,
  formatRelativeDate,
  useFormatCurrency,
  useFormatCurrencyCompact,
  useFormatNumber,
  useFormatPercent,
  useFormatDate,
  useFormatRelativeDate,
  useLocale,
  localeFor,
} from './formatters';
