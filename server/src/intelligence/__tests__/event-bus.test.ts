/**
 * Unit tests for event bus.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import type { DomainEvent } from '../events/event.types';
import type { IEventBus } from '../events/event-bus';

// Create a fresh bus per test (don't use the singleton)
const createBus = (): IEventBus => {
  const handlers = new Map<string, Set<any>>();
  const pending: Promise<void>[] = [];

  return {
    on(type, handler) {
      if (!handlers.has(type)) handlers.set(type, new Set());
      handlers.get(type)!.add(handler);
    },
    off(type, handler) {
      handlers.get(type)?.delete(handler);
    },
    emit(event: DomainEvent) {
      const set = handlers.get(event.type);
      if (!set) return;
      for (const h of set) {
        pending.push(h(event).catch(() => {}));
      }
    },
    async flush() {
      const batch = [...pending];
      pending.length = 0;
      await Promise.allSettled(batch);
    },
  };
};

test('eventBus: delivers to registered handlers', async () => {
  const bus = createBus();
  let received = false;
  bus.on('FINANCIAL_DATA_UPDATED', async (e) => {
    assert.equal(e.userId, 'u1');
    received = true;
  });
  bus.emit({
    type: 'FINANCIAL_DATA_UPDATED',
    userId: 'u1',
    trigger: 'transaction_create',
    timestamp: new Date(),
  });
  await bus.flush();
  assert.equal(received, true);
});

test('eventBus: does not deliver to unrelated handlers', async () => {
  const bus = createBus();
  let called = false;
  bus.on('ALERT_TRIGGERED', async () => { called = true; });
  bus.emit({
    type: 'FINANCIAL_DATA_UPDATED',
    userId: 'u1',
    trigger: 'transaction_create',
    timestamp: new Date(),
  });
  await bus.flush();
  assert.equal(called, false);
});

test('eventBus: multiple handlers for same event', async () => {
  const bus = createBus();
  let count = 0;
  bus.on('SIGNALS_RECOMPUTED', async () => { count++; });
  bus.on('SIGNALS_RECOMPUTED', async () => { count++; });
  bus.emit({
    type: 'SIGNALS_RECOMPUTED',
    userId: 'u1',
    signalCount: 5,
    computeMs: 100,
    timestamp: new Date(),
  });
  await bus.flush();
  assert.equal(count, 2);
});

test('eventBus: handler errors do not crash', async () => {
  const bus = createBus();
  let passRan = false;
  bus.on('FINANCIAL_DATA_UPDATED', async () => { throw new Error('boom'); });
  bus.on('FINANCIAL_DATA_UPDATED', async () => { passRan = true; });
  bus.emit({
    type: 'FINANCIAL_DATA_UPDATED',
    userId: 'u1',
    trigger: 'import',
    timestamp: new Date(),
  });
  await bus.flush();
  assert.equal(passRan, true);
});

test('eventBus: off removes handlers', async () => {
  const bus = createBus();
  let called = false;
  const handler = async () => { called = true; };
  bus.on('FINANCIAL_DATA_UPDATED', handler);
  bus.off('FINANCIAL_DATA_UPDATED', handler);
  bus.emit({
    type: 'FINANCIAL_DATA_UPDATED',
    userId: 'u1',
    trigger: 'manual',
    timestamp: new Date(),
  });
  await bus.flush();
  assert.equal(called, false);
});
