/**
 * BizLens Design Tokens — Motion / animation constants.
 *
 * All easing curves and durations should be pulled from here
 * so transitions feel consistent across the product.
 */

/** Named easing curves. */
export const ease = {
  /** The signature BizLens easing — fast start, gentle deceleration. */
  quintessential: 'cubic-bezier(0.23, 1, 0.32, 1)',
  /** Subtle elastic for playful micro-interactions. */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Standard ease-out for most transitions. */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Linear (for spinners, progress). */
  linear: 'linear',
} as const;

/** Named durations in milliseconds. */
export const duration = {
  instant: 100,
  fast: 150,
  normal: 200,
  smooth: 300,
  slow: 500,
} as const;

/** Pre-composed CSS transition strings. */
export const transition = {
  fast: `${duration.fast}ms ${ease.quintessential}`,
  normal: `${duration.normal}ms ${ease.quintessential}`,
  smooth: `${duration.smooth}ms ${ease.out}`,
} as const;
