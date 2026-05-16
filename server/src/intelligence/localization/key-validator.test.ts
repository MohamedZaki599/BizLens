/**
 * Unit tests for key-validator.ts
 *
 * Validates the naming convention enforcement (isValidKey) and
 * parameter format rejection (validateParams).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidKey, validateParams } from './key-validator';

// ─── isValidKey ───────────────────────────────────────────────────────────

describe('isValidKey', () => {
  it('accepts valid 3-segment lowercase key', () => {
    assert.equal(isValidKey('signals.profit_margin.summary'), true);
  });

  it('accepts key with underscores in all segments', () => {
    assert.equal(isValidKey('alerts.spend_spike.title'), true);
  });

  it('accepts single-word segments', () => {
    assert.equal(isValidKey('confidence.high.label'), true);
  });

  it('rejects key with fewer than 3 segments', () => {
    assert.equal(isValidKey('signals.summary'), false);
  });

  it('rejects key with more than 3 segments', () => {
    assert.equal(isValidKey('signals.profit_margin.summary.extra'), false);
  });

  it('rejects key with uppercase letters', () => {
    assert.equal(isValidKey('Signals.profit_margin.summary'), false);
  });

  it('rejects key with numbers', () => {
    assert.equal(isValidKey('signals.profit2.summary'), false);
  });

  it('rejects key with hyphens', () => {
    assert.equal(isValidKey('signals.profit-margin.summary'), false);
  });

  it('rejects empty string', () => {
    assert.equal(isValidKey(''), false);
  });

  it('rejects key with spaces', () => {
    assert.equal(isValidKey('signals.profit margin.summary'), false);
  });

  it('rejects key with empty segment', () => {
    assert.equal(isValidKey('signals..summary'), false);
  });

  it('rejects key starting with underscore in a segment', () => {
    assert.equal(isValidKey('signals._profit.summary'), false);
  });
});

// ─── validateParams ───────────────────────────────────────────────────────

describe('validateParams', () => {
  it('accepts raw numbers', () => {
    const result = validateParams({ amount: 1234.56, count: 7 });
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('accepts short identifier strings', () => {
    const result = validateParams({ categoryName: 'marketing', trend: 'up' });
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('accepts mixed numbers and short strings', () => {
    const result = validateParams({ amount: 5200, category: 'payroll' });
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });

  it('rejects strings containing %', () => {
    const result = validateParams({ growth: '25.5%' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('%'));
  });

  it('rejects strings containing $', () => {
    const result = validateParams({ amount: '$1234' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('currency symbol'));
  });

  it('rejects strings containing €', () => {
    const result = validateParams({ price: '€99.99' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('currency symbol'));
  });

  it('rejects strings containing £', () => {
    const result = validateParams({ cost: '£500' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('currency symbol'));
  });

  it('rejects strings containing ¥', () => {
    const result = validateParams({ price: '¥10000' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('currency symbol'));
  });

  it('rejects formatted numbers like "1,234"', () => {
    const result = validateParams({ revenue: '1,234' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('formatted number'));
  });

  it('rejects formatted numbers like "12,345,678"', () => {
    const result = validateParams({ bigNumber: '12,345,678' });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('formatted number'));
  });

  it('rejects strings longer than 50 characters', () => {
    const longString = 'a'.repeat(51);
    const result = validateParams({ description: longString });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('exceeds'));
  });

  it('accepts strings exactly 50 characters', () => {
    const exactString = 'a'.repeat(50);
    const result = validateParams({ name: exactString });
    assert.equal(result.valid, true);
  });

  it('reports multiple issues for multiple invalid params', () => {
    const result = validateParams({
      amount: '$1,234',
      growth: '25%',
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.length >= 2);
  });

  it('rejects null values', () => {
    const result = validateParams({ value: null });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('null'));
  });

  it('rejects undefined values', () => {
    const result = validateParams({ value: undefined });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('undefined'));
  });

  it('rejects object values', () => {
    const result = validateParams({ nested: { foo: 'bar' } });
    assert.equal(result.valid, false);
    assert.ok(result.issues[0].includes('invalid type'));
  });

  it('accepts empty params object', () => {
    const result = validateParams({});
    assert.equal(result.valid, true);
    assert.equal(result.issues.length, 0);
  });
});
