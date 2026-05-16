# Data Model: MVP Backend Intelligence Stabilization

**Feature**: 001-improve-signal-assistant  
**Date**: 2026-05-15  
**Status**: Complete

## Existing Entities (No Schema Changes)

> Architecture freeze: no schema rewrites. This document maps existing entities to stabilization concerns.

### FinancialSignal (Prisma model)

| Field | Type | Stabilization Role |
|-------|------|-------------------|
| userId | String | Scoping key for all queries |
| key | String (SignalKey enum) | Canonical signal identifier |
| value | Float | Primary computed metric |
| severity | SignalSeverity | Determines alert generation |
| trend | SignalTrend | Direction indicator |
| confidence | Float (0-1) | Data quality indicator |
| metadata | Json | Explainability context, drivers |
| ttlCategory | String | Cache/recomputation policy |
| status | SignalStatus | Lifecycle (NEW → RESOLVED) |
| generatedAt | DateTime | Freshness tracking |

**Stabilization Notes**:
- `metadata.explainability` must be populated by all generators (currently optional)
- `ttlCategory` drives dashboard cache invalidation
- `confidence` should reflect data completeness (partial month = lower confidence)

### Alert (Prisma model)

| Field | Type | Stabilization Role |
|-------|------|-------------------|
| userId | String | Scoping key |
| type | AlertType | Maps to signal keys |
| severity | AlertSeverity | Derived from signal severity |
| dedupeKey | String | Prevents duplicate alerts |
| actionJson | String | Deep-link payload |
| expiresAt | DateTime | Auto-cleanup |

**Stabilization Notes**:
- Alert generation should reference signal values (not re-query DB)
- `dedupeKey` format must be stable across recomputations
- `actionJson` must only contain routes that exist in the client router

### User (relevant fields)

| Field | Type | Stabilization Role |
|-------|------|-------------------|
| currency | String | Must propagate to all monetary formatting |
| language | String | Determines localization of signal messages |
| userMode | UserMode | Threshold selection for signal generation |

## Logical Relationships (Stabilization Flow)

```text
User.currency ──────────────────────────────────────────────────────┐
                                                                     │
Transaction[] ──→ DataCollector ──→ FinancialSnapshot                │
                                         │                           │
                                         ▼                           │
                              SignalEngine.compute()                  │
                                         │                           │
                                         ▼                           │
                              FinancialSignal[] (canonical)           │
                                    │    │    │                      │
                    ┌───────────────┘    │    └──────────────┐       │
                    ▼                    ▼                    ▼       │
            AlertEngine          DashboardAdapter      AssistantContext
            (consumes signals)   (maps to widgets)    (formats with currency)
                    │                    │                    │       │
                    ▼                    ▼                    ▼       ▼
              Alert[]            MetricsResult         AssistantDigest
              (persisted)        (API response)        (API response)
```

## New Logical Constructs (No Schema Changes)

### SignalToDashboardAdapter (application-layer mapping)

Maps signal values to dashboard widget format:

| Signal Key | Dashboard Widget | Mapping |
|-----------|-----------------|---------|
| PROFIT_MARGIN | totals.marginPct | Direct value |
| EXPENSE_GROWTH | changes.expense | value → pct, trend → direction |
| REVENUE_GROWTH | changes.income | value → pct, trend → direction |
| PROFIT_TREND | changes.profit | value → pct, trend → direction |
| TOP_EXPENSE_CATEGORY | breakdown.biggestExpense | metadata.categoryId → lookup |
| SPEND_SPIKE | warnings[] | severity ≥ warning → warning entry |
| CATEGORY_CONCENTRATION | warnings[] | severity ≥ warning → warning entry |

### InvestigationFilter (query parameters)

| Parameter | Type | Maps To |
|-----------|------|---------|
| category | string (UUID) | signal.metadata.explainability.sourceEntities |
| severity | 'none' \| 'info' \| 'warning' \| 'critical' | signal.severity |
| trend | 'up' \| 'down' \| 'flat' | signal.trend |
| dateFrom | ISO date string | signal.generatedAt >= |
| dateTo | ISO date string | signal.generatedAt <= |
| status | SignalStatus | signal.status |
| ttlCategory | string | signal.ttlCategory |

### CurrencyContext (passed through computation)

```typescript
interface CurrencyContext {
  code: string;      // e.g. 'USD', 'SAR', 'EGP'
  locale: string;    // e.g. 'en-US', 'ar-SA'
}
```

Propagation path:
1. `User.currency` + `User.language` → `CurrencyContext`
2. Passed to `formatMoney(amount, currency)` in all server-side formatting
3. Alert messages, insight messages, assistant notes all use user's currency

## Validation Rules

### Signal Determinism
- Same `FinancialSnapshot` + same `ThresholdConfig` → identical `FinancialSignal[]`
- No `Date.now()` calls inside generators (use `ctx.generatedAt`)
- No random values in signal computation

### Dashboard Consistency
- `dashboard.service.buildMetrics()` totals must equal sum of signal values for same period
- Trend windows must match signal engine windows (weekly = Mon-Sun, monthly = 1st-last)
- Rounding: all monetary values use `toSafeNumber()` (2 decimal places)

### Currency Consistency
- All `formatMoney()` calls must receive currency parameter
- No hardcoded `$` symbols in server-side code
- Client-side formatting uses `useFormatCurrency()` hook (already correct)

### Seed Integrity
- Freelancer persona → must produce SPEND_SPIKE signal for Marketing
- E-commerce persona → must produce SPEND_SPIKE for Ads
- Service business persona → must produce SPEND_SPIKE for Marketing
- All personas → must produce PROFIT_TREND signal
- No persona should produce contradictory alerts (e.g., "profit up" alert + "profit down" signal)
