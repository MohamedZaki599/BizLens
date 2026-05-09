/**
 * Unit tests for threshold system.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { systemDefaults } from '../thresholds/defaults';
import { classifySeverity } from '../thresholds/threshold.types';

// ── systemDefaults ────────────────────────────────────────────────────────

test('defaults: SPEND_SPIKE_WARNING_PCT is 50', () => {
  assert.equal(systemDefaults.get('SPEND_SPIKE_WARNING_PCT'), 50);
});

test('defaults: CONCENTRATION_WARNING_PCT is 50', () => {
  assert.equal(systemDefaults.get('CONCENTRATION_WARNING_PCT'), 50);
});

test('defaults: STALE_DATA_DAYS is 3', () => {
  assert.equal(systemDefaults.get('STALE_DATA_DAYS'), 3);
});

test('defaults: EXPENSE_RATIO_CRITICAL is 1.0', () => {
  assert.equal(systemDefaults.get('EXPENSE_RATIO_CRITICAL'), 1.0);
});

test('defaults: returns all rules with descriptions', () => {
  const all = systemDefaults.getAll();
  assert.ok(all.length >= 16);
  for (const rule of all) {
    assert.ok(rule.key.length > 0);
    assert.equal(typeof rule.value, 'number');
    assert.ok(rule.description && rule.description.length > 0);
  }
});

// ── classifySeverity ──────────────────────────────────────────────────────

test('severity: info below warning', () => {
  assert.equal(classifySeverity(30, { warning: 50, critical: 100 }), 'info');
});

test('severity: warning at threshold', () => {
  assert.equal(classifySeverity(50, { warning: 50, critical: 100 }), 'warning');
});

test('severity: warning between thresholds', () => {
  assert.equal(classifySeverity(75, { warning: 50, critical: 100 }), 'warning');
});

test('severity: critical at threshold', () => {
  assert.equal(classifySeverity(100, { warning: 50, critical: 100 }), 'critical');
});

test('severity: critical above threshold', () => {
  assert.equal(classifySeverity(150, { warning: 50, critical: 100 }), 'critical');
});
