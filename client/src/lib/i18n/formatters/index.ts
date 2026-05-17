/**
 * Locale-aware formatting utilities.
 *
 * All formatters are memoised via a WeakMap-keyed cache to avoid
 * recreating Intl objects on every render. Components should use
 * the React hooks (`useFormatCurrency`, `useFormatDate`, etc.)
 * which subscribe to the locale store and return stable callbacks.
 */

import { useCallback, useMemo } from 'react';
import { useUiStore } from '@/store/ui-store';
import type { Language } from '@/types/domain';

// ── BCP-47 locale map ─────────────────────────────────────────────────────

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-US',
  ar: 'ar-EG',
};

export const localeFor = (lang: Language): string => LOCALE_MAP[lang] ?? 'en-US';

// ── Formatter cache ───────────────────────────────────────────────────────

const nfCache = new Map<string, Intl.NumberFormat>();
const dtCache = new Map<string, Intl.DateTimeFormat>();

const getCachedNf = (locale: string, opts: Intl.NumberFormatOptions): Intl.NumberFormat => {
  const key = `${locale}:${JSON.stringify(opts)}`;
  let fmt = nfCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, opts);
    nfCache.set(key, fmt);
  }
  return fmt;
};

const getCachedDt = (locale: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
  const key = `${locale}:${JSON.stringify(opts)}`;
  let fmt = dtCache.get(key);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, opts);
    dtCache.set(key, fmt);
  }
  return fmt;
};

// ── Currency ──────────────────────────────────────────────────────────────

export const formatCurrency = (
  value: number,
  lang: Language = 'en',
  currency = 'USD',
): string => {
  try {
    return getCachedNf(localeFor(lang), {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

// ── Compact currency (e.g. $12.3K) ───────────────────────────────────────

export const formatCurrencyCompact = (
  value: number,
  lang: Language = 'en',
  currency = 'USD',
): string => {
  try {
    return getCachedNf(localeFor(lang), {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return formatCurrency(value, lang, currency);
  }
};

// ── Number ────────────────────────────────────────────────────────────────

export const formatNumber = (value: number, lang: Language = 'en'): string =>
  getCachedNf(localeFor(lang), { maximumFractionDigits: 2 }).format(value);

export const formatNumberCompact = (value: number, lang: Language = 'en'): string =>
  getCachedNf(localeFor(lang), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

// ── Percentage ────────────────────────────────────────────────────────────

export const formatPercent = (
  value: number,
  lang: Language = 'en',
  fractionDigits = 1,
): string =>
  getCachedNf(localeFor(lang), {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(value / 100); // Input is 0–100, Intl expects 0–1

// ── Dates ─────────────────────────────────────────────────────────────────

export const formatDate = (
  date: Date | string,
  lang: Language = 'en',
  style: 'short' | 'medium' | 'long' = 'medium',
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const opts: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
  };
  return getCachedDt(localeFor(lang), opts[style]).format(d);
};

export const formatRelativeDate = (
  date: Date | string,
  lang: Language = 'en',
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (lang === 'ar') {
    if (diffSec < 60) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHr < 24) return `منذ ${diffHr} ساعة`;
    if (diffDay < 7) return `منذ ${diffDay} يوم`;
    return formatDate(d, lang, 'medium');
  }

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d, lang, 'medium');
};

// ── React hooks (subscribe to store) ──────────────────────────────────────

export const useFormatCurrency = () => {
  const lang = useUiStore((s) => s.language);
  const currency = useUiStore((s) => s.currency);
  return useCallback(
    (value: number) => formatCurrency(value, lang, currency),
    [lang, currency],
  );
};

export const useFormatCurrencyCompact = () => {
  const lang = useUiStore((s) => s.language);
  const currency = useUiStore((s) => s.currency);
  return useCallback(
    (value: number) => formatCurrencyCompact(value, lang, currency),
    [lang, currency],
  );
};

export const useFormatNumber = () => {
  const lang = useUiStore((s) => s.language);
  return useCallback((value: number) => formatNumber(value, lang), [lang]);
};

export const useFormatPercent = () => {
  const lang = useUiStore((s) => s.language);
  return useCallback(
    (value: number, fractionDigits?: number) => formatPercent(value, lang, fractionDigits),
    [lang],
  );
};

export const useFormatDate = () => {
  const lang = useUiStore((s) => s.language);
  return useCallback(
    (date: Date | string, style?: 'short' | 'medium' | 'long') =>
      formatDate(date, lang, style),
    [lang],
  );
};

export const useFormatRelativeDate = () => {
  const lang = useUiStore((s) => s.language);
  return useCallback(
    (date: Date | string) => formatRelativeDate(date, lang),
    [lang],
  );
};

export const useLocale = () => {
  const lang = useUiStore((s) => s.language);
  return useMemo(() => ({
    language: lang,
    locale: localeFor(lang),
    dir: lang === 'ar' ? 'rtl' as const : 'ltr' as const,
    isRtl: lang === 'ar',
  }), [lang]);
};

// ── Static aliases (for adapters/utilities outside React components) ──────

/** Non-hook alias for formatCurrency — use in adapters/utilities outside React components. */
export { formatCurrency as formatCurrencyStatic };
