import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';

interface LogPayload {
  [key: string]: unknown;
}

const emit = (level: LogLevel, msg: string, payload?: LogPayload) => {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    msg,
    ...(payload ?? {}),
  };

  // Keep this as JSON in production for log aggregators; readable in dev.
  if (env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(
      JSON.stringify(entry),
    );
  } else {
    // eslint-disable-next-line no-console
    (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(
      `[${entry.time}] ${level.toUpperCase()} ${msg}`,
      payload ?? '',
    );
  }
};

export const logger = {
  debug: (msg: string, payload?: LogPayload) => emit('debug', msg, payload),
  info: (msg: string, payload?: LogPayload) => emit('info', msg, payload),
  warn: (msg: string, payload?: LogPayload) => emit('warn', msg, payload),
  error: (msg: string, payload?: LogPayload) => emit('error', msg, payload),
};
