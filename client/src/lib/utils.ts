import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
};

export const formatNumber = (value: number, locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
