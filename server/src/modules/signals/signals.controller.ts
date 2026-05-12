import type { RequestHandler } from 'express';
import { signalEngine } from '../../intelligence';
import { buildMessage } from '../../intelligence/localization/message-builder';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';

/**
 * GET /api/v1/signals
 * Returns all financial signals for the authenticated user.
 * Serves from in-memory cache if still within TTL, otherwise recomputes.
 */
export const getSignals: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const userMode = req.query.userMode as string | undefined;

  const signals = await signalEngine.getSignals(userId, userMode);

  // Normalize severity to uppercase to match the frontend DTO contract
  const normalized = signals.map((s) => ({
    id: `${userId}:${s.key}`, // stable composite ID
    userId,
    key: s.key,
    value: s.value,
    severity: s.severity.toUpperCase() as 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL',
    trend: s.trend.toUpperCase() as 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN',
    confidence: s.confidence,
    metadata: {
      ...s.metadata,
      description: s.metadata?.description || buildMessage(s),
    },
    status: (s as any).status || 'NEW',
    snoozedUntil: (s as any).snoozedUntil ? new Date((s as any).snoozedUntil).toISOString() : null,
    resolutionNotes: (s as any).resolutionNotes || null,
    ttlCategory: s.ttlCategory,
    generatedAt: s.generatedAt.toISOString(),
    expiresAt: null,
  }));

  res.json({ signals: normalized });
});

/**
 * GET /api/v1/signals/:key
 * Returns a single signal by its key for the authenticated user.
 */
export const getSignalByKey: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { key } = req.params;

  const signal = await signalEngine.getSignal(userId, key);

  if (!signal) {
    throw HttpError.notFound(`Signal "${key}" not found`);
  }

  res.json({
    signal: {
      id: `${userId}:${signal.key}`,
      userId,
      key: signal.key,
      value: signal.value,
      severity: signal.severity.toUpperCase(),
      trend: signal.trend.toUpperCase(),
      confidence: signal.confidence,
      metadata: {
        ...signal.metadata,
        description: signal.metadata?.description || buildMessage(signal),
      },
      status: (signal as any).status || 'NEW',
      snoozedUntil: (signal as any).snoozedUntil ? new Date((signal as any).snoozedUntil).toISOString() : null,
      resolutionNotes: (signal as any).resolutionNotes || null,
      ttlCategory: signal.ttlCategory,
      generatedAt: signal.generatedAt.toISOString(),
      expiresAt: null,
    },
  });
});

/**
 * POST /api/v1/signals/recompute
 * Forces a fresh recomputation of all signals for the authenticated user.
 * Use after bulk transaction imports or manual refresh triggers.
 */
export const recomputeSignals: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const userMode = req.body?.userMode as string | undefined;

  const signals = await signalEngine.recompute(userId, userMode);

  const normalized = signals.map((s) => ({
    id: `${userId}:${s.key}`,
    userId,
    key: s.key,
    value: s.value,
    severity: s.severity.toUpperCase(),
    trend: s.trend.toUpperCase(),
    confidence: s.confidence,
    metadata: {
      ...s.metadata,
      description: s.metadata?.description || buildMessage(s),
    },
    status: (s as any).status || 'NEW',
    snoozedUntil: (s as any).snoozedUntil ? new Date((s as any).snoozedUntil).toISOString() : null,
    resolutionNotes: (s as any).resolutionNotes || null,
    ttlCategory: s.ttlCategory,
    generatedAt: s.generatedAt.toISOString(),
    expiresAt: null,
  }));

  res.json({ signals: normalized });
});

/**
 * PATCH /api/v1/signals/:key
 * Update the lifecycle status of a signal.
 */
export const updateSignal: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { key } = req.params;
  const { status, snoozedUntil, resolutionNotes } = req.body;

  const signal = await signalEngine.updateSignalStatus(userId, key, {
    status,
    snoozedUntil: snoozedUntil ? new Date(snoozedUntil) : null,
    resolutionNotes,
  });

  res.json({
    signal: {
      id: `${userId}:${signal.key}`,
      userId,
      key: signal.key,
      value: signal.value,
      severity: signal.severity.toUpperCase(),
      trend: signal.trend.toUpperCase(),
      confidence: signal.confidence,
      metadata: signal.metadata,
      status: (signal as any).status,
      snoozedUntil: (signal as any).snoozedUntil ? new Date((signal as any).snoozedUntil).toISOString() : null,
      resolutionNotes: (signal as any).resolutionNotes,
      ttlCategory: signal.ttlCategory,
      generatedAt: signal.generatedAt.toISOString(),
      expiresAt: null,
    },
  });
});
