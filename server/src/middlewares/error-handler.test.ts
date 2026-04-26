import '../test/setup-env';
import test from 'node:test';
import assert from 'node:assert/strict';
import { z, ZodError } from 'zod';
import { errorHandler } from './error-handler';
import { HttpError } from '../utils/http-error';

interface CapturedResponse {
  status: number;
  body: unknown;
}

const fakeReq = (id = 'req-test'): { id: string } => ({ id });

const fakeRes = () => {
  const captured: Partial<CapturedResponse> = {};
  const res: any = {
    status(code: number) {
      captured.status = code;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
  };
  return { res, captured };
};

test('errorHandler maps HttpError verbatim', () => {
  const err = HttpError.notFound('No such transaction');
  const { res, captured } = fakeRes();
  errorHandler(err, fakeReq() as any, res, () => undefined);

  assert.equal(captured.status, 404);
  assert.deepEqual((captured.body as any).error.message, 'No such transaction');
  assert.equal((captured.body as any).error.requestId, 'req-test');
});

test('errorHandler returns 400 with field errors for ZodError', () => {
  const Schema = z.object({ amount: z.number().positive() });
  let zodErr: ZodError | null = null;
  try {
    Schema.parse({ amount: -1 });
  } catch (e) {
    zodErr = e as ZodError;
  }
  assert.ok(zodErr);

  const { res, captured } = fakeRes();
  errorHandler(zodErr, fakeReq() as any, res, () => undefined);
  assert.equal(captured.status, 400);
  assert.equal((captured.body as any).error.message, 'Validation failed');
  assert.ok((captured.body as any).error.details);
});

test('errorHandler degrades to 500 for unknown errors', () => {
  const err = new Error('boom');
  const { res, captured } = fakeRes();
  errorHandler(err, fakeReq() as any, res, () => undefined);
  assert.equal(captured.status, 500);
  assert.equal((captured.body as any).error.message, 'Internal server error');
});
