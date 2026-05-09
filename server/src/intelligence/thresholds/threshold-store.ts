/**
 * Threshold store — reads thresholds from the DB, falls back to system defaults.
 *
 * Hierarchy: DB (per business-type) → DB (global) → system defaults.
 * Caches in memory for 5 minutes to avoid per-request DB hits.
 */

import { prisma } from '@bizlens/database';
import type { ThresholdKey, ThresholdConfig } from './threshold.types';
import { systemDefaults, DEFAULTS } from './defaults';
import { logger } from '../../config/logger';

interface CacheEntry {
  config: ThresholdConfig;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

/**
 * Build a ThresholdConfig for a given user mode by layering:
 * 1. System defaults
 * 2. Global DB overrides (userMode = null)
 * 3. Business-type DB overrides (userMode = specific mode)
 */
export const getThresholdConfig = async (
  userMode?: string | null,
): Promise<ThresholdConfig> => {
  const cacheKey = userMode ?? '__global__';
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.config;
  }

  try {
    const rows = await prisma.$queryRawUnsafe<
      Array<{ key: string; value: number; userMode: string | null }>
    >(
      `SELECT key, value, "userMode" FROM "IntelligenceThreshold" WHERE "userMode" IS NULL OR "userMode" = $1`,
      userMode ?? '',
    ).catch(() => []);

    // Build override map: specific userMode overrides global overrides
    const overrides = new Map<string, number>();
    for (const row of rows) {
      // Global overrides go first, specific overrides win
      if (row.userMode === null && !overrides.has(row.key)) {
        overrides.set(row.key, row.value);
      }
      if (row.userMode === userMode) {
        overrides.set(row.key, row.value);
      }
    }

    const config: ThresholdConfig = {
      get(key: ThresholdKey): number {
        return overrides.get(key) ?? systemDefaults.get(key);
      },
      getAll() {
        return Object.values(DEFAULTS).map((rule) => ({
          ...rule,
          value: overrides.get(rule.key) ?? rule.value,
        }));
      },
    };

    cache.set(cacheKey, { config, expiresAt: Date.now() + CACHE_TTL_MS });
    return config;
  } catch (err) {
    logger.warn('threshold-store-fallback', {
      message: 'Failed to load thresholds from DB, using system defaults',
      error: err instanceof Error ? err.message : String(err),
    });
    return systemDefaults;
  }
};

/** Invalidate the threshold cache (call after admin updates thresholds). */
export const invalidateThresholdCache = (): void => {
  cache.clear();
};
