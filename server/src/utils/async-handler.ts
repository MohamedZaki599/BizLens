import type { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers so thrown errors are forwarded to the central
 * error middleware instead of crashing the process.
 */
export const asyncHandler =
  <TReq extends Request = Request, TRes extends Response = Response>(
    fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: TReq, res: TRes, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
