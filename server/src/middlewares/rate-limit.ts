import type { RequestHandler } from 'express';
import { HttpError } from '../utils/http-error';

interface BucketState {
  count: number;
  resetAt: number;
}

interface LimiterOptions {
  /** Window duration in milliseconds. */
  windowMs: number;
  /** Max requests allowed per key per window. */
  max: number;
  /** Optional key extractor — defaults to client IP. */
  keyOf?: (req: Parameters<RequestHandler>[0]) => string;
  /** Human-friendly message returned on lockout. */
  message?: string;
}

/**
 * Lightweight, dependency-free token-bucket rate limiter for hot endpoints
 * like login/register. Suitable for a single Node process — swap in a
 * Redis-backed limiter if/when the API runs horizontally.
 */
export const createRateLimiter = ({
  windowMs,
  max,
  keyOf,
  message,
}: LimiterOptions): RequestHandler => {
  const buckets = new Map<string, BucketState>();

  return (req, _res, next) => {
    const key = keyOf
      ? keyOf(req)
      : (req.ip ||
          (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
          'anonymous');

    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      const retryInSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      next(
        new HttpError(429, message ?? 'Too many requests, please try again shortly.', {
          retryAfterSeconds: retryInSeconds,
        }),
      );
      return;
    }

    bucket.count += 1;
    next();
  };
};

/**
 * Periodically evict expired buckets so this Map doesn't grow unbounded
 * over the process lifetime. Call once at boot.
 */
export const startRateLimiterSweeper = (
  ...limiters: Array<{ buckets?: Map<string, BucketState> }>
): NodeJS.Timeout => {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const limiter of limiters) {
      if (!limiter.buckets) continue;
      for (const [k, v] of limiter.buckets.entries()) {
        if (v.resetAt <= now) limiter.buckets.delete(k);
      }
    }
  }, 60_000);
  interval.unref?.();
  return interval;
};
