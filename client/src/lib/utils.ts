import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Re-export formatters for backward compat — callers that imported from utils.ts
export { formatCurrency, formatNumber, localeFor } from './i18n/formatters';
