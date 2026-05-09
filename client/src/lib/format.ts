/**
 * Backward-compatible format re-exports.
 * The canonical implementations now live in `lib/i18n/formatters/`.
 */
export { useFormatCurrency, useFormatNumber } from './i18n/formatters';

/**
 * A reasonable curated list of currencies for the settings picker.
 */
export const SUPPORTED_CURRENCIES: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'USD', label: 'US Dollar (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'GBP', label: 'British Pound (GBP)' },
  { code: 'EGP', label: 'Egyptian Pound (EGP)' },
  { code: 'SAR', label: 'Saudi Riyal (SAR)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)' },
  { code: 'AUD', label: 'Australian Dollar (AUD)' },
  { code: 'INR', label: 'Indian Rupee (INR)' },
];
