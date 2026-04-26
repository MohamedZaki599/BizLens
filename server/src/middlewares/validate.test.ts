import test from 'node:test';
import assert from 'node:assert/strict';
import { z, ZodError } from 'zod';
import type { Request, Response } from 'express';
import { validate } from './validate';

const stubRes = (): Response =>
  ({} as unknown as Response);

const stubReq = (overrides: Partial<Request> = {}): Request =>
  ({ body: {}, query: {}, params: {}, ...overrides } as Request);

test('validate replaces the target with the parsed value on success', () => {
  const schema = z.object({ name: z.string().trim() });
  const req = stubReq({ body: { name: '  hi  ' } as Request['body'] });
  let nextErr: unknown = 'unset';
  validate(schema)(req, stubRes(), (err) => {
    nextErr = err;
  });
  assert.equal(nextErr, undefined);
  assert.deepEqual(req.body, { name: 'hi' });
});

test('validate forwards ZodError to next() instead of throwing', () => {
  const schema = z.object({ n: z.number() });
  const req = stubReq({ body: { n: 'oops' } as Request['body'] });
  let captured: unknown;
  validate(schema)(req, stubRes(), (err) => {
    captured = err;
  });
  assert.ok(captured instanceof ZodError);
});

test('validate supports query and params targets', () => {
  const schema = z.object({ id: z.string().uuid() });
  const valid = '11111111-1111-4111-8111-111111111111';
  const reqQ = stubReq({ query: { id: valid } as Request['query'] });
  let nextErrQ: unknown = 'unset';
  validate(schema, 'query')(reqQ, stubRes(), (err) => {
    nextErrQ = err;
  });
  assert.equal(nextErrQ, undefined);
  assert.deepEqual(reqQ.query, { id: valid });

  const reqP = stubReq({ params: { id: 'nope' } as unknown as Request['params'] });
  let nextErrP: unknown;
  validate(schema, 'params')(reqP, stubRes(), (err) => {
    nextErrP = err;
  });
  assert.ok(nextErrP instanceof ZodError);
});
