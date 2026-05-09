import { logger } from '../../config/logger';

/**
 * A set of all currently running background tasks.
 * This ensures that tasks are not prematurely terminated during graceful shutdown.
 */
const activeTasks = new Set<Promise<any>>();

/**
 * Run a task in the background, ensuring any errors are caught and logged,
 * and that the task is tracked for graceful shutdown.
 * 
 * @param name A descriptive name for the task (used in logging)
 * @param task The asynchronous function to execute
 */
export const runInBackground = (name: string, task: () => Promise<void>): void => {
  const promise = task()
    .catch((err: unknown) => {
      logger.error(`Background task failed: ${name}`, { 
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
    })
    .finally(() => {
      activeTasks.delete(promise);
    });

  activeTasks.add(promise);
};

/**
 * Wait for all tracked background tasks to complete, or until the timeout is reached.
 * Call this during graceful shutdown to allow in-flight tasks (like signal recomputation) to finish.
 * 
 * @param timeoutMs Maximum time to wait in milliseconds
 */
export const waitForActiveTasks = async (timeoutMs = 5000): Promise<void> => {
  if (activeTasks.size === 0) {
    return;
  }

  logger.info(`Waiting for ${activeTasks.size} active background tasks to complete...`);

  const timeout = new Promise<void>((_, reject) => 
    setTimeout(() => reject(new Error('Task wait timeout exceeded')), timeoutMs)
  );

  try {
    await Promise.race([Promise.all(Array.from(activeTasks)), timeout]);
    logger.info('All background tasks completed successfully.');
  } catch (error) {
    logger.warn('Not all background tasks completed before timeout.', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
