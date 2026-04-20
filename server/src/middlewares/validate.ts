import type { RequestHandler } from 'express';
import { ZodError, type ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Zod-based request validator. Replaces the validated portion of the request
 * with the parsed (typed) value so downstream handlers consume safe data.
 */
export const validate =
  <T>(schema: ZodSchema<T>, target: ValidationTarget = 'body'): RequestHandler =>
  (req, _res, next) => {
    try {
      const parsed = schema.parse(req[target]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any)[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) return next(err);
      next(err);
    }
  };
