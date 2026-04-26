import { useCallback } from 'react';
import { useUiStore } from '@/store/ui-store';
import { formatCurrency, formatNumber } from './utils';

/**
 * Returns a currency formatter bound to the user's current language +
 * currency preferences. Components should prefer this over calling
 * `formatCurrency` directly so the output reacts to preference changes.
 */
export const useFormatCurrency = () => {
  const language = useUiStore((s) => s.language);
  const currency = useUiStore((s) => s.currency);
  return useCallback(
    (value: number) => formatCurrency(value, language, currency),
    [language, currency],
  );
};

export const useFormatNumber = () => {
  const language = useUiStore((s) => s.language);
  return useCallback((value: number) => formatNumber(value, language), [language]);
};

/**
 * A reasonable curated list of currencies for the settings picker.
 * Not exhaustive — users can still set anything via the API.
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
