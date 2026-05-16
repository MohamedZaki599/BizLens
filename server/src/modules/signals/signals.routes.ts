import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth';
import { getSignals, getSignalByKey, recomputeSignals, updateSignal } from './signals.controller';

const router = Router();

// All signal routes require authentication
router.use(requireAuth);

// Deprecation notice for legacy prose fields being replaced by localized keys
router.use((_req, res, next) => {
  res.setHeader('X-Deprecated-Fields', 'description,title,message,headline');
  next();
});

/**
 * GET /api/v1/signals
 * List all current signals for the authenticated user (TTL-aware cache).
 */
router.get('/', getSignals);

/**
 * GET /api/v1/signals/:key
 * Get a single signal by its signal key.
 */
router.get('/:key', getSignalByKey);

/**
 * POST /api/v1/signals/recompute
 * Force-recompute all signals (e.g. after bulk import or manual refresh).
 */
router.post('/recompute', recomputeSignals);

/**
 * PATCH /api/v1/signals/:key
 * Update a signal's lifecycle state (status, snoozedUntil, etc).
 */
router.patch('/:key', updateSignal);

export default router;
