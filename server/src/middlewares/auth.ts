import type { RequestHandler } from 'express';
import { AUTH_COOKIE_NAME, verifyAccessToken } from '../modules/auth/auth.tokens';
import { HttpError } from '../utils/http-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

/**
 * Reads the JWT from the auth cookie (preferred) or `Authorization: Bearer ...`
 * header, verifies it, and attaches `req.user` for downstream handlers.
 */
export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice('Bearer '.length)
      : undefined;

    const token = cookieToken ?? headerToken;
    if (!token) throw HttpError.unauthorized('Authentication required');

    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(HttpError.unauthorized('Invalid or expired token'));
  }
};
