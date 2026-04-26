import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

export const AUTH_COOKIE_NAME = 'bizlens_token';

export interface JwtPayload {
  sub: string; // user id
  email: string;
}

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;
const DAYS = 24 * HOURS;
const SEVEN_DAYS_MS = 7 * DAYS;

/**
 * Convert `JWT_EXPIRES_IN` (zeit/ms-style: '7d', '12h', '900s', '15m', or
 * a raw number-of-seconds string) into milliseconds. Falls back to 7 days
 * when the value is malformed so the cookie never out-lives the token.
 */
export const parseExpiresInMs = (raw: string): number => {
  if (!raw) return SEVEN_DAYS_MS;
  const trimmed = raw.trim();
  const match = /^(\d+)\s*(ms|s|m|h|d|w|y)?$/i.exec(trimmed);
  if (!match) return SEVEN_DAYS_MS;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return SEVEN_DAYS_MS;
  const unit = (match[2] ?? 's').toLowerCase();
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * SECONDS;
    case 'm':
      return value * MINUTES;
    case 'h':
      return value * HOURS;
    case 'd':
      return value * DAYS;
    case 'w':
      return value * 7 * DAYS;
    case 'y':
      return value * 365 * DAYS;
    default:
      return SEVEN_DAYS_MS;
  }
};

export const TOKEN_TTL_MS = parseExpiresInMs(env.JWT_EXPIRES_IN);

export const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string') throw new Error('Invalid token payload');
  return decoded as JwtPayload;
};

export const cookieOptions = () =>
  ({
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    // `strict` would break OAuth-style top-level redirects we may add later;
    // `lax` is the sweet spot for first-party API + SPA usage.
    sameSite: 'lax' as const,
    maxAge: TOKEN_TTL_MS,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  });
