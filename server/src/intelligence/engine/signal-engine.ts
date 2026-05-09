/**
 * Signal Engine — the central orchestrator for all financial intelligence.
 *
 * Pipeline:
 *  1. Collect financial data → FinancialSnapshot (single DB pass)
 *  2. Load threshold config (cached, per business-type)
 *  3. Run all signal generators → FinancialSignal[]
 *  4. Persist signals + snapshot
 *  5. Emit SIGNALS_RECOMPUTED event
 *
 * Observability:
 *  - Logs computation duration
 *  - Tracks signal count
 *  - Reports errors without crashing
 *
 * TTL-aware:
 *  - Checks if existing signals are still fresh before recomputing
 *  - dashboard: 5 min, alert: 30 min, analytical: 1-6 hours
 */

import { collectFinancialData } from './data-collector';
import { runAllGenerators } from '../signals/signal-registry';
import { getThresholdConfig } from '../thresholds/threshold-store';
import { eventBus } from '../events/event-bus';
import { logger } from '../../config/logger';
import type { FinancialSignal, SignalGenerationContext } from '../signals/signal.types';
import { prisma } from '@bizlens/database';

// ─── TTL Configuration ────────────────────────────────────────────────────

const TTL_MS: Record<string, number> = {
  dashboard: 5 * 60 * 1000,     // 5 minutes
  alert: 30 * 60 * 1000,        // 30 minutes
  analytical: 60 * 60 * 1000,   // 1 hour
};

// In-memory signal cache keyed by userId
const signalCache = new Map<
  string,
  { signals: FinancialSignal[]; computedAt: number }
>();

// ─── Public API ───────────────────────────────────────────────────────────

export const signalEngine = {
  /**
   * Compute all financial signals for a user. Returns cached signals if still fresh.
   *
   * @param userId      The user to compute for
   * @param force       Skip TTL check and force recomputation
   * @param userMode    Business type for threshold selection
   */
  async compute(
    userId: string,
    options: { force?: boolean; userMode?: string } = {},
  ): Promise<FinancialSignal[]> {
    const { force = false, userMode } = options;

    // Check cache freshness
    if (!force) {
      const cached = signalCache.get(userId);
      if (cached) {
        const minTtl = TTL_MS.dashboard; // Use the shortest TTL as cache check
        const age = Date.now() - cached.computedAt;
        if (age < minTtl) {
          logger.debug('signal-engine:cache-hit', { userId, ageMs: age });
          return cached.signals;
        }
      }
    }

    const startMs = performance.now();

    try {
      // Step 1: Collect financial data (single DB pass)
      const snapshot = await collectFinancialData(userId);

      // Step 2: Load threshold config
      const thresholds = await getThresholdConfig(userMode);

      // Step 3: Generate signals
      const ctx: SignalGenerationContext = {
        userId,
        generatedAt: snapshot.collectedAt,
      };
      const signals = runAllGenerators(snapshot, ctx, thresholds);

      const computeMs = Math.round(performance.now() - startMs);

      // Step 4: Cache
      signalCache.set(userId, { signals, computedAt: Date.now() });

      // Step 5: Persist snapshot (fire-and-forget)
      persistSnapshot(userId, signals, computeMs).catch((err) => {
        logger.error('signal-engine:persist-failed', {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      // Step 6: Emit event
      eventBus.emit({
        type: 'SIGNALS_RECOMPUTED',
        userId,
        signalCount: signals.length,
        computeMs,
        timestamp: new Date(),
      });

      logger.info('signal-engine:computed', {
        userId,
        signalCount: signals.length,
        computeMs,
      });

      return signals;
    } catch (err) {
      const computeMs = Math.round(performance.now() - startMs);
      logger.error('signal-engine:failed', {
        userId,
        computeMs,
        error: err instanceof Error ? err.message : String(err),
      });

      // Return cached signals if available (stale-while-revalidate)
      const cached = signalCache.get(userId);
      if (cached) {
        logger.warn('signal-engine:serving-stale', { userId });
        return cached.signals;
      }

      throw err;
    }
  },

  /**
   * Get the latest signals for a user, computing if needed.
   */
  async getSignals(userId: string, userMode?: string): Promise<FinancialSignal[]> {
    return this.compute(userId, { userMode });
  },

  /**
   * Find a specific signal by key from the latest computation.
   */
  async getSignal(userId: string, key: string, userMode?: string): Promise<FinancialSignal | undefined> {
    const signals = await this.getSignals(userId, userMode);
    return signals.find((s) => s.key === key);
  },

  /**
   * Force recomputation (e.g. after a transaction mutation).
   */
  async recompute(userId: string, userMode?: string): Promise<FinancialSignal[]> {
    return this.compute(userId, { force: true, userMode });
  },

  /**
   * Invalidate cached signals for a user (without recomputing).
   */
  invalidate(userId: string): void {
    signalCache.delete(userId);
  },
};

// ─── Persistence ──────────────────────────────────────────────────────────

const persistSnapshot = async (
  userId: string,
  signals: FinancialSignal[],
  computeMs: number,
): Promise<void> => {
  try {
    // Persist to SignalSnapshot table for historical analysis
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SignalSnapshot" (id, "userId", signals, "computeMs", "createdAt")
       VALUES (gen_random_uuid(), $1, $2::jsonb, $3, NOW())`,
      userId,
      JSON.stringify(signals),
      computeMs,
    );
  } catch {
    // Table may not exist yet (pre-migration). Non-fatal.
  }
};

// ─── Fire-and-Forget Helper ───────────────────────────────────────────────

/**
 * Recompute signals in the background. Errors are logged, never thrown.
 * Drop-in replacement for evaluateInBackground from the old alert engine.
 */
export const recomputeInBackground = (userId: string, userMode?: string): void => {
  signalEngine.recompute(userId, userMode).catch((err: unknown) => {
    logger.error('signal-engine:background-failed', {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
  });
};
