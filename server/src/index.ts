import { env } from './config/env';
import { createApp } from './app';
import { logger } from './config/logger';
import { disconnect } from '@bizlens/database';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('server-listening', {
    url: `http://localhost:${env.PORT}`,
    env: env.NODE_ENV,
  });
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info('server-shutdown', { signal });
  server.close(async (err) => {
    if (err) {
      logger.error('server-shutdown-error', { message: err.message });
    }
    await disconnect();
    process.exit(err ? 1 : 0);
  });

  setTimeout(() => {
    logger.error('server-shutdown-timeout', { signal });
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled-rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught-exception', { message: err.message, stack: err.stack });
});
