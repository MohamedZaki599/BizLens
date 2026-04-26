import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginSchema, RegisterSchema, UserModeEnum } from './auth.schemas';

test('RegisterSchema enforces minimum password length', () => {
  const r = RegisterSchema.safeParse({
    email: 'a@b.co',
    password: 'short',
  });
  assert.equal(r.success, false);
});

test('RegisterSchema lowercases emails', () => {
  const r = RegisterSchema.parse({
    email: 'Mixed.CASE@Example.COM',
    password: 'longenoughpw',
  });
  assert.equal(r.email, 'mixed.case@example.com');
});

test('RegisterSchema defaults userMode to FREELANCER', () => {
  const r = RegisterSchema.parse({ email: 'a@b.co', password: 'longenoughpw' });
  assert.equal(r.userMode, 'FREELANCER');
});

test('LoginSchema rejects invalid email shape', () => {
  const r = LoginSchema.safeParse({ email: 'not-an-email', password: 'x' });
  assert.equal(r.success, false);
});

test('UserModeEnum stays in sync with the documented modes', () => {
  assert.deepEqual(UserModeEnum.options, ['FREELANCER', 'ECOMMERCE', 'SERVICE_BUSINESS']);
});
