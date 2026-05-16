import type { RequestHandler } from 'express';
import { z } from 'zod';
import { signalEngine } from '../../intelligence';
import { buildMessage } from '../../intelligence/localization/message-builder';
import { isSignalKey } from '../../intelligence/signals/signal.types';
import type { FinancialSignal } from '../../intelligence/signals/signal.types';
import { asyncHandler } from '../../utils/async-handler';
import { HttpError } from '../../utils/http-error';

// ─── Filter Schema ────────────────────────────────────────────────────────

const SignalFilterSchema = z.object({
  userMode: z.string().optional(),
  category: z.string().uuid().optional(),
  severity: z.enum(['none', 'info', 'warning', 'critical']).optional(),
  trend: z.enum(['up', 'down', 'flat', 'unknown']).optional(),
  status: z.enum(['NEW', 'REVIEWED', 'INVESTIGATING', 'SNOOZED', 'RESOLVED']).optional(),
  ttlCategory: z.enum(['dashboard', 'alert', 'analytical']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
}).strict().partial();

/**
 * Applies filter parameters to a signal array (AND logic for combined filters).
 */
const applyFilters = (signals: FinancialSignal[], filters: z.infer<typeof SignalFilterSchema>): FinancialSignal[] => {
  let result = signals;

  if (filters.severity) {
    result = result.filter((s) => s.severity === filters.severity);
  }

  if (filters.trend) {
    result = result.filter((s) => s.trend === filters.trend);
  }

  if (filters.status) {
    result = result.filter((s) => (s.status ?? 'NEW') === filters.status);
  }

  if (filters.ttlCategory) {
    result = result.filter((s) => s.ttlCategory === filters.ttlCategory);
  }

  if (filters.category) {
    result = result.filter((s) => {
      const sourceEntities = s.metadata?.explainability?.sourceEntities;
      const categoryId = s.metadata?.categoryId;
      return (
        (sourceEntities && sourceEntities.includes(filters.category!)) ||
        categoryId === filters.category
      );
    });
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    result = result.filter((s) => s.generatedAt >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    result = result.filter((s) => s.generatedAt <= to);
  }

  return result;
};

/**
 * GET /api/v1/signals
 * Returns all financial signals for the authenticated user.
 * Supports optional filtering by severity, trend, category, status, and date range.
 * Serves from in-memory cache if still within TTL, otherwise recomputes.
 */
export const getSignals: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const userMode = req.query.userMode as string | undefined;

  // Parse and validate filter params (non-strict to allow userMode passthrough)
  const filterResult = SignalFilterSchema.safeParse(req.query);

  if (!filterResult.success) {
    // Check if the query has filter-like params that failed validation
    const filterKeys = ['category', 'severity', 'trend', 'status', 'ttlCategory', 'dateFrom', 'dateTo'];
    const hasFilterParams = filterKeys.some((key) => key in (req.query as Record<string, unknown>));

    if (hasFilterParams) {
      const issues = filterResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      res.status(400).json({
        error: 'Invalid filter parameters',
        details: issues,
      });
      return;
    }
  }

  const filters = filterResult.success ? filterResult.data : {};

  let signals = await signalEngine.getSignals(userId, userMode);

  // Apply investigation filters
  signals = applyFilters(signals, filters);

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
    status: s.status || 'NEW',
    snoozedUntil: s.snoozedUntil ? new Date(s.snoozedUntil).toISOString() : null,
    resolutionNotes: s.resolutionNotes || null,
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

  if (!isSignalKey(key)) {
    throw HttpError.notFound(`Signal "${key}" not found`);
  }

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
      status: signal.status || 'NEW',
      snoozedUntil: signal.snoozedUntil ? new Date(signal.snoozedUntil).toISOString() : null,
      resolutionNotes: signal.resolutionNotes || null,
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
    status: s.status || 'NEW',
    snoozedUntil: s.snoozedUntil ? new Date(s.snoozedUntil).toISOString() : null,
    resolutionNotes: s.resolutionNotes || null,
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

  if (!isSignalKey(key)) {
    throw HttpError.notFound(`Signal "${key}" not found`);
  }

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
      status: signal.status,
      snoozedUntil: signal.snoozedUntil ? new Date(signal.snoozedUntil).toISOString() : null,
      resolutionNotes: signal.resolutionNotes,
      ttlCategory: signal.ttlCategory,
      generatedAt: signal.generatedAt.toISOString(),
      expiresAt: null,
    },
  });
});
