import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { pool } from '@bizlens/database';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/error-handler';
import { notFoundHandler } from './middlewares/not-found';
import { requestId } from './middlewares/request-id';
import authRoutes from './modules/auth/auth.routes';
import categoryRoutes from './modules/categories/category.routes';
import transactionRoutes from './modules/transactions/transaction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import userRoutes from './modules/users/users.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import { initIntelligence } from './intelligence';

export const createApp = () => {
  const app = express();

  // Initialize intelligence event handlers
  initIntelligence();

  app.set('trust proxy', 1);
  app.use(requestId);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
      exposedHeaders: ['x-request-id'],
    }),
  );
  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParser());

  if (env.NODE_ENV !== 'test') {
    morgan.token('id', (req) => (req as { id?: string }).id ?? '-');
    const format =
      env.NODE_ENV === 'production'
        ? ':id :remote-addr :method :url :status :response-time ms'
        : ':id :method :url :status :response-time ms';
    app.use(
      morgan(format, {
        stream: { write: (line) => logger.info('http', { line: line.trim() }) },
      }),
    );
  }

  app.get('/health', async (_req, res) => {
    const start = Date.now();
    try {
      await pool.query('SELECT 1');
      res.json({
        status: 'ok',
        env: env.NODE_ENV,
        uptime: process.uptime(),
        db: {
          connected: true,
          latencyMs: Date.now() - start,
          pool: {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount,
          },
        },
      });
    } catch (err) {
      res.status(503).json({
        status: 'degraded',
        env: env.NODE_ENV,
        uptime: process.uptime(),
        db: {
          connected: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  });

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/transactions', transactionRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/alerts', alertRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
