/**
 * Unit tests for contract-validator.ts
 *
 * Validates that validatePayloadAgainstContract correctly detects
 * missing params, extra params, type mismatches, and unknown keys.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePayloadAgainstContract } from './contract-validator';
import { CONTRACT_SCHEMA } from './contract-schema';
import type { LocalizedPayload } from './localization.types';

// ─── Valid Payloads ───────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — valid payloads', () => {
  it('returns valid for a payload matching the schema exactly', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.profit_margin.summary',
      summaryParams: { marginPct: 25.5, profit: 5200, income: 10000, expense: 4800 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, true);
    assert.deepEqual(result.missingParams, []);
    assert.deepEqual(result.extraParams, []);
    assert.deepEqual(result.invalidTypes, []);
  });

  it('returns valid for a key with no required params', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'confidence.high.label',
      summaryParams: {},
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, true);
    assert.deepEqual(result.missingParams, []);
    assert.deepEqual(result.extraParams, []);
    assert.deepEqual(result.invalidTypes, []);
  });

  it('returns valid for a key with string params', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.top_expense_category.summary',
      summaryParams: { categoryId: 'cat-001', categoryName: 'marketing', sharePct: 35.2, totalExpense: 8000 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, true);
  });
});

// ─── Missing Params ──────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — missing params', () => {
  it('detects a single missing param', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.profit_margin.summary',
      summaryParams: { marginPct: 25.5, profit: 5200, income: 10000 },
      // missing: expense
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.deepEqual(result.missingParams, ['expense']);
  });

  it('detects multiple missing params', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.revenue_growth.summary',
      summaryParams: { current: 5000 },
      // missing: previous, delta, changePct
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.equal(result.missingParams.length, 3);
    assert.ok(result.missingParams.includes('previous'));
    assert.ok(result.missingParams.includes('delta'));
    assert.ok(result.missingParams.includes('changePct'));
  });

  it('detects all params missing when summaryParams is empty', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.burn_rate.summary',
      summaryParams: {},
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.ok(result.missingParams.includes('totalExpense'));
    assert.ok(result.missingParams.includes('daysElapsed'));
  });
});

// ─── Extra Params ────────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — extra params', () => {
  it('detects a single extra param', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'confidence.high.label',
      summaryParams: { unexpected: 42 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.deepEqual(result.extraParams, ['unexpected']);
  });

  it('detects multiple extra params', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.burn_rate.summary',
      summaryParams: { totalExpense: 5000, daysElapsed: 30, foo: 'bar', baz: 99 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.ok(result.extraParams.includes('foo'));
    assert.ok(result.extraParams.includes('baz'));
  });
});

// ─── Invalid Types ───────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — invalid types', () => {
  it('detects number where string is expected', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.top_expense_category.summary',
      summaryParams: { categoryName: 123 as unknown as string, sharePct: 35.2, totalExpense: 8000 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.equal(result.invalidTypes.length, 1);
    assert.ok(result.invalidTypes[0].includes('categoryName'));
    assert.ok(result.invalidTypes[0].includes('expected string'));
    assert.ok(result.invalidTypes[0].includes('got number'));
  });

  it('detects string where number is expected', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.burn_rate.summary',
      summaryParams: { totalExpense: '5000' as unknown as number, daysElapsed: 30 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.equal(result.invalidTypes.length, 1);
    assert.ok(result.invalidTypes[0].includes('totalExpense'));
    assert.ok(result.invalidTypes[0].includes('expected number'));
    assert.ok(result.invalidTypes[0].includes('got string'));
  });

  it('detects multiple type mismatches', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.spend_spike.summary',
      summaryParams: {
        categoryId: 123 as unknown as string,
        categoryName: 42 as unknown as string,
        currentAmount: 500,
        baselineAvg: 300,
      },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.equal(result.invalidTypes.length, 2);
  });
});

// ─── Unknown Keys ────────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — unknown keys', () => {
  it('returns invalid for a key not in the schema', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = {
      summaryKey: 'signals.nonexistent.summary' as any,
      summaryParams: { foo: 'bar' },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.ok(result.invalidTypes[0].includes('Unknown key'));
  });

  it('returns empty missingParams and extraParams for unknown key', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = {
      summaryKey: 'unknown.key.here' as any,
      summaryParams: { anything: 123 },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.deepEqual(result.missingParams, []);
    assert.deepEqual(result.extraParams, []);
  });
});

// ─── Combined Issues ─────────────────────────────────────────────────────

describe('validatePayloadAgainstContract — combined issues', () => {
  it('reports missing, extra, and type issues simultaneously', () => {
    const payload: LocalizedPayload = {
      summaryKey: 'signals.profit_margin.summary',
      summaryParams: {
        marginPct: 'wrong' as unknown as number, // type mismatch
        profit: 5200,
        // missing: income, expense
        bonus: 100, // extra
      },
    };

    const result = validatePayloadAgainstContract(payload, CONTRACT_SCHEMA);

    assert.equal(result.valid, false);
    assert.ok(result.missingParams.length > 0);
    assert.ok(result.extraParams.length > 0);
    assert.ok(result.invalidTypes.length > 0);
  });
});
