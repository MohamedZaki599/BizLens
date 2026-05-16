/**
 * Standardized enum constants for the localization layer.
 *
 * These constants define the canonical values for confidence levels,
 * trend directions, signal statuses, and severities used across the
 * intelligence layer. All use `as const` for type narrowing.
 *
 * Consumers: signal generators, alert engine, assistant service, insight engine.
 */

// ─── Confidence Levels ───────────────────────────────────────────────────

export const CONFIDENCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  NONE: 'none',
} as const;

/** Union type of all valid confidence level values. */
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[keyof typeof CONFIDENCE_LEVELS];

// ─── Trend Directions ────────────────────────────────────────────────────

export const TREND_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  FLAT: 'flat',
  UNKNOWN: 'unknown',
} as const;

/** Union type of all valid trend direction values. */
export type TrendDirection = typeof TREND_DIRECTIONS[keyof typeof TREND_DIRECTIONS];

// ─── Signal Statuses ─────────────────────────────────────────────────────

export const SIGNAL_STATUSES = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  INVESTIGATING: 'investigating',
  SNOOZED: 'snoozed',
  RESOLVED: 'resolved',
} as const;

/** Union type of all valid signal status values. */
export type SignalStatus = typeof SIGNAL_STATUSES[keyof typeof SIGNAL_STATUSES];

// ─── Severities ──────────────────────────────────────────────────────────

export const SEVERITIES = {
  NONE: 'none',
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

/** Union type of all valid severity values. */
export type Severity = typeof SEVERITIES[keyof typeof SEVERITIES];
