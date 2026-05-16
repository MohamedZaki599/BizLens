/**
 * Currency Propagation Test
 *
 * Validates that formatMoney() correctly formats monetary values
 * with the appropriate currency symbol for all supported currencies.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney } from '../utils/safe-math';

describe('Currency Propagation — formatMoney()', () => {
  it('formatMoney(1234.56, "USD") contains $', () => {
    const result = formatMoney(1234.56, 'USD');
    assert.ok(result.includes('$'), `Expected "$" in "${result}"`);
  });

  it('formatMoney(1234.56, "SAR") contains SAR symbol', () => {
    const result = formatMoney(1234.56, 'SAR');
    // SAR can be formatted as ر.س or SAR or SR depending on locale
    const hasSAR = result.includes('ر.س') || result.includes('SAR') || result.includes('SR');
    assert.ok(hasSAR, `Expected SAR symbol in "${result}"`);
  });

  it('formatMoney(1234.56, "EGP") contains EGP symbol', () => {
    const result = formatMoney(1234.56, 'EGP');
    // EGP can be formatted as ج.م or EGP or E£ depending on locale
    const hasEGP = result.includes('ج.م') || result.includes('EGP') || result.includes('E£');
    assert.ok(hasEGP, `Expected EGP symbol in "${result}"`);
  });

  it('formatMoney(1234.56, "EUR") contains €', () => {
    const result = formatMoney(1234.56, 'EUR');
    assert.ok(result.includes('€'), `Expected "€" in "${result}"`);
  });

  it('formatMoney(0, "USD") handles zero', () => {
    const result = formatMoney(0, 'USD');
    assert.ok(result.includes('$'), `Expected "$" in "${result}"`);
    assert.ok(result.includes('0'), `Expected "0" in "${result}"`);
  });

  it('formatMoney(-500, "USD") handles negative', () => {
    const result = formatMoney(-500, 'USD');
    assert.ok(result.includes('$'), `Expected "$" in "${result}"`);
    // Negative values should contain a minus sign or be wrapped in parens
    const hasNegative = result.includes('-') || result.includes('(') || result.includes('\u2212');
    assert.ok(hasNegative, `Expected negative indicator in "${result}"`);
  });
});
