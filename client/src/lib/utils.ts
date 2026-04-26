import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from '@/types/domain';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Map our internal language code to a real BCP-47 locale tag for `Intl`.
 * Keep this list in sync with `Language` to avoid silent fallbacks.
 */
const LOCALE_BY_LANGUAGE: Record<Language, string> = {
  en: 'en-US',
  ar: 'ar-EG',
};

export const localeFor = (language: Language): string =>
  LOCALE_BY_LANGUAGE[language] ?? 'en-US';

/**
 * Format a numeric amount as currency. All callers should pass an explicit
 * `language`/`currency` (typically via `useFormatCurrency`) so the output
 * matches the user's preferences instead of defaulting everyone to USD.
 */
export const formatCurrency = (
  value: number,
  language: Language = 'en',
  currency = 'USD',
): string => {
  try {
    return new Intl.NumberFormat(localeFor(language), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const formatNumber = (value: number, language: Language = 'en'): string =>
  new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 2 }).format(value);
