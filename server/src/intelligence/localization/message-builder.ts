/**
 * Message builder — generates localized messages from financial signals.
 *
 * Keeps signal computation and message generation fully decoupled.
 * Signals are numeric/structured; messages are per-locale text.
 */

import type { FinancialSignal } from '../signals/signal.types';
import { en } from './templates/en';

type MessageTemplates = Record<string, (signal: FinancialSignal) => string>;

const LOCALES: Record<string, MessageTemplates> = {
  en,
  // ar: ar, // Add when Arabic templates are created
};

/**
 * Generate a human-readable message from a signal.
 * Falls back to English if locale/template is missing.
 */
export const buildMessage = (
  signal: FinancialSignal,
  locale: string = 'en',
): string => {
  const templates = LOCALES[locale] ?? LOCALES.en;
  const template = templates[signal.key];
  if (!template) {
    return `Signal ${signal.key}: ${signal.value}`;
  }
  return template(signal);
};

/**
 * Generate messages for all signals in batch.
 */
export const buildMessages = (
  signals: FinancialSignal[],
  locale: string = 'en',
): Map<string, string> => {
  const result = new Map<string, string>();
  for (const signal of signals) {
    result.set(signal.key, buildMessage(signal, locale));
  }
  return result;
};
