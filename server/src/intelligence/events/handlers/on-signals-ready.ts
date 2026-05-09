/**
 * Event handler: SIGNALS_RECOMPUTED → evaluate alert thresholds.
 *
 * When fresh signals are available, the alert engine evaluates threshold rules.
 * This decouples alert generation from signal computation.
 *
 * Note: For MVP, this calls the existing alert engine. As the refactor
 * progresses, the alert engine will consume signals directly instead of
 * querying the DB independently.
 */

import { eventBus } from '../event-bus';
import { evaluateInBackground } from '../../../services/alert-engine/alert-engine';
import { logger } from '../../../config/logger';

export const registerOnSignalsReady = (): void => {
  eventBus.on('SIGNALS_RECOMPUTED', async (event) => {
    logger.debug('handler:on-signals-ready', {
      userId: event.userId,
      signalCount: event.signalCount,
      computeMs: event.computeMs,
    });

    // For MVP: delegate to existing alert engine
    // Future: alert engine reads signals instead of querying DB
    evaluateInBackground(event.userId);
  });
};
