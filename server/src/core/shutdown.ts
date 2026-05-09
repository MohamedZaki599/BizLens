import type { Server } from 'http';
import { prisma } from '@bizlens/database';
import { waitForActiveTasks } from './async/task-manager';
import { logger } from '../config/logger';

/**
 * Attaches handlers for SIGINT and SIGTERM to gracefully shut down the server.
 * This ensures that active requests finish, background tasks complete, and
 * the database connection pool is cleanly closed.
 * 
 * @param server The HTTP Server instance
 */
export const setupGracefulShutdown = (server: Server): void => {
  const shutdown = async (signal: string) => {
    logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

    // Force shutdown after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      logger.error('[Shutdown] Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000).unref();

    server.close(async (err) => {
      if (err) {
        logger.error('[Shutdown] Error closing HTTP server', { error: err.message });
      } else {
        logger.info('[Shutdown] HTTP server closed (no longer accepting new connections).');
      }

      try {
        // Wait for background tasks (like signal recomputation) to finish
        await waitForActiveTasks(5000);
        
        // Disconnect from the database safely
        await prisma.$disconnect();
        logger.info('[Shutdown] Database connections closed.');
        
        logger.info('[Shutdown] Graceful shutdown complete. Exiting.');
        process.exit(0);
      } catch (error) {
        logger.error('[Shutdown] Error during shutdown tasks', { 
          error: error instanceof Error ? error.message : String(error)
        });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
