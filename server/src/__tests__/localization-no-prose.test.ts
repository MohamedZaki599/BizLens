/**
 * Prose Leakage Detection Test
 *
 * Validates that all localization keys in the central registry follow the
 * semantic key naming convention and contain no human-readable prose.
 *
 * Key pattern: namespace.signal_key.field (lowercase, underscores, 3 segments)
 * No spaces, no capital letters — keys are identifiers only.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { LOCALIZATION_KEYS } from '../intelligence/localization/key-registry';

// Valid key pattern: 3 dot-separated segments, each lowercase letters/underscores
// Each segment must start with a lowercase letter
const KEY_PATTERN = /^[a-z][a-z_]*\.[a-z][a-z_]*\.[a-z][a-z_]*$/;

describe('Localization No-Prose (Key Format Governance)', () => {
  const allKeys = Object.keys(LOCALIZATION_KEYS);

  it('registry is non-empty', () => {
    assert.ok(allKeys.length > 0, 'LOCALIZATION_KEYS should contain at least one key');
  });

  it('every key matches the semantic pattern /^[a-z][a-z_]*\\.[a-z][a-z_]*\\.[a-z][a-z_]*$/', () => {
    const violations: string[] = [];

    for (const key of allKeys) {
      if (!KEY_PATTERN.test(key)) {
        violations.push(key);
      }
    }

    assert.equal(
      violations.length,
      0,
      `Keys violating pattern: [\n  ${violations.join(',\n  ')}\n]`,
    );
  });

  it('no key contains spaces', () => {
    const withSpaces = allKeys.filter((key) => key.includes(' '));

    assert.equal(
      withSpaces.length,
      0,
      `Keys containing spaces: [\n  ${withSpaces.join(',\n  ')}\n]`,
    );
  });

  it('no key contains capital letters', () => {
    const withCaps = allKeys.filter((key) => /[A-Z]/.test(key));

    assert.equal(
      withCaps.length,
      0,
      `Keys containing capital letters: [\n  ${withCaps.join(',\n  ')}\n]`,
    );
  });
});
