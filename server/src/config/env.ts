import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),
  LOG_SLOW_QUERIES: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  SLOW_QUERY_THRESHOLD_MS: z.coerce.number().optional().default(500),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Surface a helpful error and exit; we never want the API to boot with bad config.
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
