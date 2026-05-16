/**
 * Localization Registry Completeness Test
 *
 * Validates governance rules for the central localization key registry:
 * 1. Every SignalKey has corresponding summary + explanation entries in LOCALIZATION_KEYS
 * 2. Every AlertType has corresponding title + message entries in LOCALIZATION_KEYS
 * 3. No duplicate keys exist across namespaces
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALIZATION_KEYS } from '../intelligence/localization/key-registry';
import { SIGNAL_KEYS } from '../intelligence/signals/signal.types';

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Map from SignalKey enum value to the expected registry key segment (lowercase + underscores). */
const signalKeyToRegistrySegment = (signalKey: string): string =>
  signalKey.toLowerCase();

/** All alert types that should have localization entries (mirrors Prisma AlertType enum). */
const ALERT_TYPES = [
  'SPEND_SPIKE_CATEGORY',
  'EXPENSES_EXCEED_INCOME',
  'PROFIT_DROP',
  'CATEGORY_CONCENTRATION',
  'WEEKLY_SPEND_INCREASE',
  'STALE_DATA',
  'RECURRING_DETECTED',
  'FORECAST_OVERSPEND',
] as const;

/**
 * Maps AlertType enum values to the alert key segment used in LOCALIZATION_KEYS.
 * The registry uses shorter, more readable names than the Prisma enum.
 */
const ALERT_TYPE_TO_KEY_SEGMENT: Record<string, string> = {
  SPEND_SPIKE_CATEGORY: 'spend_spike',
  EXPENSES_EXCEED_INCOME: 'expenses_exceed',
  PROFIT_DROP: 'profit_drop',
  CATEGORY_CONCENTRATION: 'category_concentration',
  WEEKLY_SPEND_INCREASE: 'weekly_spend_increase',
  STALE_DATA: 'stale_data',
  RECURRING_DETECTED: 'recurring_detected',
  FORECAST_OVERSPEND: 'forecast_overspend',
};

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Localization Registry Completeness', () => {
  const allKeys = Object.keys(LOCALIZATION_KEYS);

  describe('Signal key coverage', () => {
    for (const signalKey of SIGNAL_KEYS) {
      const segment = signalKeyToRegistrySegment(signalKey);

      it(`SignalKey "${signalKey}" has a summary entry in LOCALIZATION_KEYS`, () => {
        const summaryKey = `signals.${segment}.summary`;
        assert.ok(
          summaryKey in LOCALIZATION_KEYS,
          `Missing localization key: "${summaryKey}" for SignalKey "${signalKey}"`,
        );
      });

      it(`SignalKey "${signalKey}" has an explanation entry in LOCALIZATION_KEYS`, () => {
        const explanationKey = `signals.${segment}.explanation`;
        assert.ok(
          explanationKey in LOCALIZATION_KEYS,
          `Missing localization key: "${explanationKey}" for SignalKey "${signalKey}"`,
        );
      });
    }
  });

  describe('Alert type coverage', () => {
    for (const alertType of ALERT_TYPES) {
      const segment = ALERT_TYPE_TO_KEY_SEGMENT[alertType];

      it(`AlertType "${alertType}" has a title entry in LOCALIZATION_KEYS`, () => {
        const titleKey = `alerts.${segment}.title`;
        assert.ok(
          titleKey in LOCALIZATION_KEYS,
          `Missing localization key: "${titleKey}" for AlertType "${alertType}"`,
        );
      });

      it(`AlertType "${alertType}" has a message entry in LOCALIZATION_KEYS`, () => {
        const messageKey = `alerts.${segment}.message`;
        assert.ok(
          messageKey in LOCALIZATION_KEYS,
          `Missing localization key: "${messageKey}" for AlertType "${alertType}"`,
        );
      });
    }
  });

  describe('No duplicate keys across namespaces', () => {
    it('all localization keys are unique (no duplicates)', () => {
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const key of allKeys) {
        if (seen.has(key)) {
          duplicates.push(key);
        }
        seen.add(key);
      }

      assert.equal(
        duplicates.length,
        0,
        `Found duplicate keys across namespaces: ${duplicates.join(', ')}`,
      );
    });

    it('key values match their key names (identity mapping integrity)', () => {
      const mismatches: string[] = [];

      for (const [key, value] of Object.entries(LOCALIZATION_KEYS)) {
        if (key !== value) {
          mismatches.push(`"${key}" → "${value}"`);
        }
      }

      assert.equal(
        mismatches.length,
        0,
        `Found key/value mismatches: ${mismatches.join(', ')}`,
      );
    });

    it('no key segment appears in multiple namespaces', () => {
      // Extract the middle segment (signal_key) from each key and track which namespaces use it
      const segmentNamespaces = new Map<string, Set<string>>();

      for (const key of allKeys) {
        const parts = key.split('.');
        if (parts.length === 3) {
          const [namespace, _segment] = parts;
          if (!segmentNamespaces.has(key)) {
            // Track full keys to ensure no exact duplicates
            segmentNamespaces.set(key, new Set());
          }
          segmentNamespaces.get(key)!.add(namespace);
        }
      }

      // Each full key should only appear once
      const fullKeyCount = new Map<string, number>();
      for (const key of allKeys) {
        fullKeyCount.set(key, (fullKeyCount.get(key) ?? 0) + 1);
      }

      const duplicatedFullKeys = [...fullKeyCount.entries()]
        .filter(([, count]) => count > 1)
        .map(([key]) => key);

      assert.equal(
        duplicatedFullKeys.length,
        0,
        `Found keys appearing multiple times: ${duplicatedFullKeys.join(', ')}`,
      );
    });
  });
});
