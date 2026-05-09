/**
 * Domain event type definitions.
 *
 * These events form the backbone of the intelligence pipeline:
 *   Transaction CRUD → FINANCIAL_DATA_UPDATED
 *                     → Signal Engine computes
 *                     → SIGNALS_RECOMPUTED
 *                     → Alert Engine evaluates
 *                     → ALERT_TRIGGERED (if applicable)
 *
 * All events are typed discriminated unions for exhaustive handling.
 */

export interface FinancialDataUpdatedEvent {
  type: 'FINANCIAL_DATA_UPDATED';
  userId: string;
  trigger: 'transaction_create' | 'transaction_update' | 'transaction_delete' | 'import' | 'manual';
  timestamp: Date;
}

export interface SignalsRecomputedEvent {
  type: 'SIGNALS_RECOMPUTED';
  userId: string;
  signalCount: number;
  computeMs: number;
  timestamp: Date;
}

export interface AlertTriggeredEvent {
  type: 'ALERT_TRIGGERED';
  userId: string;
  alertId: string;
  alertType: string;
  severity: string;
  timestamp: Date;
}

export interface InsightGeneratedEvent {
  type: 'INSIGHT_GENERATED';
  userId: string;
  insightCount: number;
  timestamp: Date;
}

/** Union of all domain events. */
export type DomainEvent =
  | FinancialDataUpdatedEvent
  | SignalsRecomputedEvent
  | AlertTriggeredEvent
  | InsightGeneratedEvent;

/** Event type string literals for subscription. */
export type DomainEventType = DomainEvent['type'];

/** Extract the event payload for a given event type. */
export type EventPayload<T extends DomainEventType> = Extract<DomainEvent, { type: T }>;
