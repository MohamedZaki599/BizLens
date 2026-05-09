# BizLens Backend Infrastructure: Productionizing the Modular Monolith

This document outlines the strategy for productionizing the BizLens backend. It strictly adheres to the constraints of a modular monolith architecture, avoiding premature distributed systems (no Kafka, Redis, or microservices) while laying the groundwork for future scalability.

## 1. Architectural Principles

*   **Modular Monolith:** All code runs in a single Node.js process. Modules communicate via explicit function calls or a lightweight in-process event bus.
*   **Operational Simplicity:** Deployments should consist of a single Docker container and a PostgreSQL database.
*   **Deterministic In-Process Asynchrony:** Background tasks (like signal recomputation) run in-process using Promises, tracked securely without external queues.
*   **Observability First:** Structured logging, request IDs, and slow-query instrumentation are prioritized over complex metrics scraping.

## 2. Folder Structure Enhancements

We will refine the existing structure to centralize the async runtime and observability features.

```text
server/src/
├── config/
│   ├── env.ts          # Zod environment validation (already exists)
│   ├── logger.ts       # Winston structured logging (already exists)
│   └── database.ts     # Prisma client with slow-query extension
├── core/               # Cross-cutting infrastructure concerns
│   ├── async/          # Centralized background task manager
│   ├── events/         # Lightweight event bus abstraction
│   ├── shutdown.ts     # Graceful shutdown handler
│   └── observability/  # Metrics and instrumentation
├── intelligence/       # Unified Signal Engine (already structured)
│   ├── engine/
│   ├── signals/
│   ├── events/         # Domain-specific event handlers
│   └── calculators/
├── middlewares/
│   ├── request-id.ts   # X-Request-ID injection
│   ├── error-handler.ts
│   └── logger.ts       # Morgan integration
└── modules/            # Business domains (auth, transactions, signals, etc.)
```

## 3. Core Infrastructure Implementations

### 3.1. Centralized Async Runtime (`core/async/task-manager.ts`)

Instead of floating `Promise.catch` blocks, all background tasks (like signal recomputation) must go through a centralized task manager. This prevents unhandled rejections and allows graceful shutdown to wait for active tasks.

```typescript
// core/async/task-manager.ts
import { logger } from '../../config/logger';

const activeTasks = new Set<Promise<any>>();

export const runInBackground = (name: string, task: () => Promise<void>) => {
  const promise = task().catch((err) => {
    logger.error(`Background task failed: ${name}`, { error: err.message, stack: err.stack });
  }).finally(() => {
    activeTasks.delete(promise);
  });
  
  activeTasks.add(promise);
};

export const waitForActiveTasks = async (timeoutMs = 5000) => {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Task timeout')), timeoutMs));
  await Promise.race([Promise.all(activeTasks), timeout]).catch(e => logger.warn(e.message));
};
```

### 3.2. Deterministic In-Process Event Abstraction (`core/events/event-bus.ts`)

The event bus remains in-process but is abstracted to allow future swapping with BullMQ/Redis if needed.

```typescript
// core/events/event-bus.ts
import { runInBackground } from '../async/task-manager';
import { logger } from '../../config/logger';

type EventHandler<T> = (event: T) => Promise<void>;

class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  on<T>(event: string, handler: EventHandler<T>) {
    const current = this.handlers.get(event) || [];
    this.handlers.set(event, [...current, handler]);
  }

  emit<T>(eventName: string, payload: T) {
    const handlers = this.handlers.get(eventName) || [];
    for (const handler of handlers) {
      // Execute asynchronously and track safely
      runInBackground(`Event:${eventName}`, async () => { await handler(payload); });
    }
  }
}

export const eventBus = new EventBus();
```

### 3.3. Graceful Shutdown Handling (`core/shutdown.ts`)

Ensures that active requests, background tasks, and database connections are closed cleanly during SIGTERM.

```typescript
import { Server } from 'http';
import { prisma } from '@bizlens/database';
import { waitForActiveTasks } from './async/task-manager';
import { logger } from '../config/logger';

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown.`);
    
    server.close(async () => {
      logger.info('HTTP server closed.');
      await waitForActiveTasks();
      await prisma.$disconnect();
      logger.info('Database connections closed. Exiting.');
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
```

### 3.4. Prisma Slow-Query Instrumentation

Attach Prisma middleware or extensions to log queries that take longer than a defined threshold.

```typescript
// config/database.ts
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const start = performance.now();
      const result = await query(args);
      const duration = performance.now() - start;
      
      if (duration > 500) { // Log queries slower than 500ms
        logger.warn(`Slow Query: ${model}.${operation}`, { duration, args });
      }
      return result;
    },
  },
});
```

## 4. Deployment & Infrastructure

### 4.1. Production-Safe Dockerfile

A multi-stage Dockerfile optimizing for size and security.

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/database/package.json packages/database/
RUN npm ci
COPY . .
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npm run build --workspace=@bizlens/server

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/database/package.json packages/database/
# Install only production dependencies
RUN npm ci --omit=dev

COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 4000
CMD ["node", "server/dist/index.js"]
```

### 4.2. Safe Migration Workflow

Database migrations are executed as a separate step before deploying the application code.

**Deployment Steps (e.g., via GitHub Actions or Railway):**
1.  **Build:** Create the Docker image.
2.  **Migrate:** Run `npx prisma migrate deploy` against the target database.
3.  **Deploy:** Roll out the new Docker container.

*Never run `migrate dev` in production.*

### 4.3. Minimal Deployment Topology

*   **Compute:** Render Web Service, Railway App, or a simple VPS running Docker Compose.
*   **Database:** Managed PostgreSQL instance (e.g., Supabase, Neon, or Render Postgres).
*   **No Caching Layer:** Avoid Redis for now; rely on in-memory mapping and fast DB queries.

## 5. Production Hardening Checklist

- [ ] **Environment Validation:** Ensure `zod` validates all required env vars at startup.
- [ ] **Rate Limiting:** Apply `express-rate-limit` (especially on `/auth` endpoints).
- [ ] **Helmet:** Configure HTTP headers for security (already partially implemented).
- [ ] **CORS:** Restrict allowed origins strictly to the production frontend URL.
- [ ] **Structured Logging:** Ensure Winston outputs JSON in production for easy ingestion by Datadog/CloudWatch.
- [ ] **Healthchecks:** Maintain the existing `/health` endpoint covering DB connectivity and memory usage.

## 6. Scaling Boundaries & Future Upgrade Path

When the single Node.js process starts bottlenecking, scale in this specific order:

1.  **Vertical Scaling:** Increase CPU/RAM on the single instance.
2.  **Horizontal Scaling (Stateless):** Run multiple instances of the monolithic container behind a load balancer. (Requires no architectural changes, as the state is in Postgres).
3.  **Background Queue Extraction:** If signal computation becomes too heavy, *then* introduce Redis + BullMQ. The `core/async/task-manager.ts` and `core/events/event-bus.ts` boundaries make this a localized change. Replace in-process `runInBackground` with `queue.add()`.
