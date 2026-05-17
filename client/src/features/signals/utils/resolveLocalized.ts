import { t, ti } from '@/lib/i18n';
import type { SignalLocalizedPayload } from '../types';

/** Detects unresolved localization keys that leaked through translation. */
const isRawKey = (str: string): boolean => /^[a-z]+(\.[a-z_]+){1,3}$/.test(str);

/** Detects unresolved interpolation placeholders like {amount} or {ratioPct}. */
const hasUnresolvedPlaceholders = (str: string): boolean => /\{[a-zA-Z_]+\}/.test(str);

/**
 * Resolves a localized signal title to a rendered string.
 * Uses translation keys with interpolation when available.
 * Falls back to deprecated prose with a dev warning.
 */
export function resolveSignalTitle(
  localized: SignalLocalizedPayload | undefined,
  fallbackTitle: string | undefined,
  signalKey: string,
): string {
  if (localized?.summaryKey) {
    // Ensure params is a valid object to prevent skipping interpolation entirely
    const safeParams = localized.summaryParams && typeof localized.summaryParams === 'object'
      ? localized.summaryParams
      : {};
    const resolved = ti(localized.summaryKey, safeParams);
    // Safety: if resolution returned a raw key or has unresolved placeholders, fall through
    if (resolved && !isRawKey(resolved) && !hasUnresolvedPlaceholders(resolved)) return resolved;
  }
  if (fallbackTitle) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[i18n] Missing localized.summaryKey for signal "${signalKey}", using deprecated prose fallback`,
      );
    }
    return fallbackTitle;
  }
  return signalKey.replace(/_/g, ' ');
}

/**
 * Resolves a localized signal explanation to a rendered string.
 * Falls back to deprecated description prose or a default i18n key.
 */
export function resolveSignalExplanation(
  localized: SignalLocalizedPayload | undefined,
  fallbackDescription: string | undefined,
  signalKey: string,
  defaultKey = 'signal.defaultExplanation',
): string {
  if (localized?.explanationKey) {
    // Ensure params is a valid object to prevent skipping interpolation entirely
    const safeParams = localized.explanationParams && typeof localized.explanationParams === 'object'
      ? localized.explanationParams
      : {};
    const resolved = ti(localized.explanationKey, safeParams);
    // Safety: if resolution returned a raw key or has unresolved placeholders, fall through
    if (resolved && !isRawKey(resolved) && !hasUnresolvedPlaceholders(resolved)) return resolved;
  }
  if (fallbackDescription) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[i18n] Missing localized.explanationKey for signal "${signalKey}", using deprecated prose fallback`,
      );
    }
    return fallbackDescription;
  }
  return t(defaultKey);
}

/**
 * Resolves localized reasoning chain entries.
 * Falls back to deprecated reasoning array from metadata.
 */
export function resolveSignalReasoning(
  localized: SignalLocalizedPayload | undefined,
  fallbackReasoning: string[] | undefined,
): string[] {
  if (localized?.reasoningKeys && localized.reasoningKeys.length > 0) {
    return localized.reasoningKeys.map((key, i) => {
      // Ensure params is a valid object to prevent skipping interpolation entirely
      const params = localized.reasoningParams?.[i];
      const safeParams = params && typeof params === 'object' ? params : {};
      return ti(key, safeParams);
    });
  }
  return fallbackReasoning || [];
}
