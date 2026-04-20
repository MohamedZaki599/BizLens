import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../utils/http-error';
import { env } from '../config/env';

// Centralized error formatter — all routes funnel here.
// Keep messages safe for clients; never leak stack traces in production.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { message: err.message, details: err.details ?? null },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res
        .status(409)
        .json({ error: { message: 'A record with these values already exists.' } });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: { message: 'Record not found.' } });
      return;
    }
  }

  // Unknown / unexpected error — log and send a generic message.
  // eslint-disable-next-line no-console
  console.error('[unhandled-error]', err);

  res.status(500).json({
    error: {
      message: 'Internal server error',
      ...(env.NODE_ENV !== 'production' && err instanceof Error
        ? { debug: err.message }
        : {}),
    },
  });
};
