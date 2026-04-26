import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

const HEADER = 'x-request-id';

/**
 * Attach a stable request id to every request — preferring an upstream
 * `x-request-id` header (proxy / load balancer) and falling back to a UUID.
 * The id is exposed on both `req.id` and the response header so logs and
 * client errors can be correlated end-to-end.
 */
export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.headers[HEADER];
  const id =
    typeof incoming === 'string' && incoming.length > 0 && incoming.length < 200
      ? incoming
      : randomUUID();
  req.id = id;
  res.setHeader(HEADER, id);
  next();
};
