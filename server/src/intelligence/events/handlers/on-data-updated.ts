/**
 * Event handler: FINANCIAL_DATA_UPDATED → recompute signals.
 *
 * Triggered when transactions are created, updated, deleted, or imported.
 * Invalidates cached signals and triggers recomputation.
 */

import { eventBus } from '../event-bus';
import { signalEngine } from '../../engine/signal-engine';
import { logger } from '../../../config/logger';

export const registerOnDataUpdated = (): void => {
  eventBus.on('FINANCIAL_DATA_UPDATED', async (event) => {
    logger.debug('handler:on-data-updated', {
      userId: event.userId,
      trigger: event.trigger,
    });

    // Invalidate cache first, then recompute
    signalEngine.invalidate(event.userId);
    await signalEngine.recompute(event.userId);
  });
};
