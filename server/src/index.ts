import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('server-listening', {
    url: `http://localhost:${env.PORT}`,
    env: env.NODE_ENV,
  });
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info('server-shutdown', { signal });
  server.close((err) => {
    if (err) {
      logger.error('server-shutdown-error', { message: err.message });
      process.exit(1);
    }
    process.exit(0);
  });
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
