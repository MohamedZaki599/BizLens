/**
 * Test bootstrap. Imported first by every test file that needs to load
 * modules depending on `config/env.ts`, so the strict env validation
 * (DATABASE_URL, JWT_SECRET) doesn't crash the test process.
 */
process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-at-least-16-chars-long';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
