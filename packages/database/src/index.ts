import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, type PoolConfig } from 'pg';

export { Prisma, PrismaClient } from '@prisma/client';
export type {
  User,
  Category,
  Transaction,
  Alert,
  Budget,
  TransactionType,
  UserMode,
  AlertType,
  AlertSeverity,
} from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
  __pool?: Pool;
};

const createPool = (): Pool => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('@bizlens/database: DATABASE_URL environment variable is required');
  }

  const sslDisabled = process.env.DATABASE_SSL === 'false';
  const config: PoolConfig = {
    connectionString,
    ssl: sslDisabled ? undefined : { rejectUnauthorized: true },
  };

  const p = new Pool(config);

  p.on('error', (err) => {
    console.error(JSON.stringify({ level: 'error', time: new Date().toISOString(), msg: 'pg-pool-error', message: err.message }));
  });

  return p;
};

const createPrisma = (pool: Pool): PrismaClient => {
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  // Slow-query instrumentation
  return client.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const duration = Math.round(performance.now() - start);

        if (duration > 500) {
          console.warn(JSON.stringify({ 
            level: 'warn', 
            time: new Date().toISOString(), 
            msg: `Slow Query: ${model || 'Unknown'}.${operation}`, 
            durationMs: duration 
          }));
        }

        return result;
      },
    },
  }) as PrismaClient; // Cast to retain standard type for exports
};

export const pool = globalForPrisma.__pool ?? createPool();
export const prisma = globalForPrisma.__prisma ?? createPrisma(pool);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
  globalForPrisma.__pool = pool;
}

export const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.warn('[@bizlens/database] prisma disconnect error:', err instanceof Error ? err.message : String(err));
  }
  try {
    await pool.end();
  } catch (err) {
    console.warn('[@bizlens/database] pool end error:', err instanceof Error ? err.message : String(err));
  }
};
