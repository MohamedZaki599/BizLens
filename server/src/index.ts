import { env } from './config/env';
import { createApp } from './app';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('server-listening', {
    url: `http://localhost:${env.PORT}`,
    env: env.NODE_ENV,
  });
});

import { setupGracefulShutdown } from './core/shutdown';

setupGracefulShutdown(server);

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled-rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught-exception', { message: err.message, stack: err.stack });
});
