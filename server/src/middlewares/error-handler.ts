import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@bizlens/database';
import { HttpError } from '../utils/http-error';
import { env } from '../config/env';
import { logger } from '../config/logger';

/**
 * Centralized error formatter — every route funnels here.
 *
 * Responsibilities:
 *  1. Map known error shapes (HttpError, Zod, Prisma) to client-safe responses.
 *  2. Surface validation details only when they're safe to read.
 *  3. Log unexpected errors with the request id so production support can
 *     correlate them to the original request.
 */
const PRISMA_TO_HTTP: Record<string, { status: number; message: string }> = {
  // Unique constraint violation.
  P2002: { status: 409, message: 'A record with these values already exists.' },
  // Record not found (update/delete by id that doesn't exist).
  P2025: { status: 404, message: 'Record not found.' },
  // Foreign key constraint failed.
  P2003: { status: 400, message: 'Referenced record is missing or invalid.' },
  // Record not found in connect/connectOrCreate.
  P2018: { status: 400, message: 'A connected record could not be found.' },
  // Required relation violation.
  P2014: { status: 400, message: 'Operation would violate a required relationship.' },
  // Value too long for column.
  P2000: { status: 400, message: 'Provided value is too long for one of the fields.' },
  // Value out of range.
  P2020: { status: 400, message: 'Provided value is out of the allowed range.' },
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = (req as { id?: string }).id;

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { message: err.message, details: err.details ?? null, requestId },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
        requestId,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = PRISMA_TO_HTTP[err.code];
    if (mapped) {
      res.status(mapped.status).json({
        error: { message: mapped.message, code: err.code, requestId },
      });
      return;
    }
    // Fall through for unknown codes — logged below for follow-up triage.
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      error: { message: 'Invalid query parameters.', requestId },
    });
    logger.warn('prisma-validation-error', { requestId, message: err.message });
    return;
  }

  logger.error('unhandled-error', {
    requestId,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(500).json({
    error: {
      message: 'Internal server error',
      requestId,
      ...(env.NODE_ENV !== 'production' && err instanceof Error
        ? { debug: err.message }
        : {}),
    },
  });
};
