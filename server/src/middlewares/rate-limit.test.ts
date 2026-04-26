import '../test/setup-env';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { NextFunction, Request, Response } from 'express';
import { createRateLimiter } from './rate-limit';
import { HttpError } from '../utils/http-error';

interface FakeReq {
  ip?: string;
  headers: Record<string, string>;
}

const buildReq = (ip = '1.2.3.4'): FakeReq => ({ ip, headers: {} });

const run = (mw: ReturnType<typeof createRateLimiter>, req: FakeReq) =>
  new Promise<unknown>((resolve) => {
    const next: NextFunction = (err) => resolve(err);
    mw(req as unknown as Request, {} as Response, next);
  });

test('createRateLimiter passes requests under the cap', async () => {
  const mw = createRateLimiter({ windowMs: 1000, max: 3 });
  const req = buildReq();
  for (let i = 0; i < 3; i++) {
    const result = await run(mw, req);
    assert.equal(result, undefined);
  }
});

test('createRateLimiter rejects with 429 once the cap is exceeded', async () => {
  const mw = createRateLimiter({ windowMs: 1000, max: 2, message: 'slow down' });
  const req = buildReq('5.6.7.8');
  await run(mw, req);
  await run(mw, req);
  const blocked = await run(mw, req);

  assert.ok(blocked instanceof HttpError);
  assert.equal((blocked as HttpError).status, 429);
  assert.equal((blocked as HttpError).message, 'slow down');
});

test('createRateLimiter scopes counts per key', async () => {
  const keys: string[] = [];
  const mw = createRateLimiter({
    windowMs: 1000,
    max: 1,
    keyOf: (req) => {
      const k = (req.headers['x-key'] as string | undefined) ?? 'anon';
      keys.push(k);
      return k;
    },
  });

  const reqA: FakeReq = { headers: { 'x-key': 'A' } };
  const reqB: FakeReq = { headers: { 'x-key': 'B' } };

  assert.equal(await run(mw, reqA), undefined);
  assert.equal(await run(mw, reqB), undefined);
  const blockedA = await run(mw, reqA);
  assert.ok(blockedA instanceof HttpError);
  assert.equal((blockedA as HttpError).status, 429);
});
