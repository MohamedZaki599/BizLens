/**
 * Backward-compatible re-export.
 * All consumers import from '@/lib/i18n' — this file now delegates
 * to the new modular architecture under '@/lib/i18n/'.
 */
export { t, ti, useT, useTi } from './i18n/core';
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
} from './i18n/formatters';
export { financialTermsEn, financialTermsAr } from './i18n/terminology/financial';
export { signalMessagesEn, signalMessagesAr } from './i18n/messages/signals';
