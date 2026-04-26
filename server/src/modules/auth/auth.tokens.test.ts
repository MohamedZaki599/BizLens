import '../../test/setup-env';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExpiresInMs } from './auth.tokens';

const SECONDS = 1000;
const DAYS = 24 * 60 * 60 * SECONDS;

test('parseExpiresInMs converts zeit/ms-style strings into ms', () => {
  assert.equal(parseExpiresInMs('7d'), 7 * DAYS);
  assert.equal(parseExpiresInMs('12h'), 12 * 60 * 60 * SECONDS);
  assert.equal(parseExpiresInMs('15m'), 15 * 60 * SECONDS);
  assert.equal(parseExpiresInMs('900s'), 900 * SECONDS);
  assert.equal(parseExpiresInMs('500ms'), 500);
});

test('parseExpiresInMs treats bare integers as seconds', () => {
  assert.equal(parseExpiresInMs('60'), 60 * SECONDS);
});

test('parseExpiresInMs falls back to 7 days for malformed input', () => {
  assert.equal(parseExpiresInMs(''), 7 * DAYS);
  assert.equal(parseExpiresInMs('garbage'), 7 * DAYS);
  assert.equal(parseExpiresInMs('-3d'), 7 * DAYS);
});
