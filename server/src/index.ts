import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[bizlens-api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: NodeJS.Signals) => {
  // eslint-disable-next-line no-console
  console.log(`[bizlens-api] received ${signal}, shutting down gracefully…`);
  server.close((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
