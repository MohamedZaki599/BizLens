/**
 * Lightweight in-process event bus.
 *
 * Architecture:
 *  - Implements a simple pub/sub behind a clean interface.
 *  - Handlers are async and fire-and-forget (errors are logged, never thrown to publishers).
 *  - The interface is designed so the implementation can be swapped to BullMQ/Redis
 *    without changing any publisher or subscriber code.
 *
 * Future migration to BullMQ:
 *  - Replace InProcessEventBus with BullMQEventBus implementing the same IEventBus.
 *  - Handlers become workers consuming from named queues.
 *  - No business logic changes required.
 */

import type { DomainEvent, DomainEventType, EventPayload } from './event.types';
import { logger } from '../../config/logger';

// ─── Interface ────────────────────────────────────────────────────────────

export type EventHandler<T extends DomainEventType> = (event: EventPayload<T>) => Promise<void>;

export interface IEventBus {
  /** Subscribe a handler to a specific event type. */
  on<T extends DomainEventType>(type: T, handler: EventHandler<T>): void;

  /** Remove a handler. */
  off<T extends DomainEventType>(type: T, handler: EventHandler<T>): void;

  /** Publish an event. Handlers run asynchronously — publisher never blocks. */
  emit(event: DomainEvent): void;

  /** Await all pending handlers (useful for testing). */
  flush(): Promise<void>;
}

// ─── In-Process Implementation ────────────────────────────────────────────

class InProcessEventBus implements IEventBus {
  private handlers = new Map<DomainEventType, Set<EventHandler<any>>>();
  private pending: Promise<void>[] = [];

  on<T extends DomainEventType>(type: T, handler: EventHandler<T>): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off<T extends DomainEventType>(type: T, handler: EventHandler<T>): void {
    this.handlers.get(type)?.delete(handler);
  }

  emit(event: DomainEvent): void {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) return;

    logger.debug('event-bus:emit', {
      type: event.type,
      userId: 'userId' in event ? event.userId : undefined,
    });

    for (const handler of handlers) {
      const p = handler(event).catch((err: unknown) => {
        logger.error('event-bus:handler-failed', {
          type: event.type,
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
        });
      });
      this.pending.push(p);
    }
  }

  async flush(): Promise<void> {
    const batch = [...this.pending];
    this.pending = [];
    await Promise.allSettled(batch);
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────

/** The application-wide event bus instance. */
export const eventBus: IEventBus = new InProcessEventBus();
