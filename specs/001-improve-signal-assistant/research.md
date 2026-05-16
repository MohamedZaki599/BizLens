# Research: MVP Backend Intelligence Stabilization

**Feature**: 001-improve-signal-assistant  
**Date**: 2026-05-15  
**Status**: Complete

## Research Tasks & Findings

### 1. Signal Engine Architecture — Canonical Source of Truth

**Decision**: The `signalEngine` in `server/src/intelligence/engine/signal-engine.ts` is the single canonical source for all financial signals.

**Rationale**: The signal engine already follows a clean pipeline (collect → threshold → generate → persist → emit). All consumers (dashboard, alerts, insights, assistant) should read from signals — never compute metrics independently.

**Current Issues Identified**:
- `dashboard.service.ts` computes its own metrics (income, expense, profit, warnings) independently of the signal engine
- `insight-engine.ts` duplicates signal-like computations (weekly comparison, monthly comparison, spending anomaly) that overlap with signal generators
- `alert-engine.ts` independently computes the same financial aggregates (spend spikes, profit drops) that the signal engine already produces
- `assistant.service.ts` calls `aggregateByType` directly instead of consuming signals

**Alternatives Considered**:
- Rewrite all services to consume signals only → Rejected: too invasive for architecture freeze
- Add a thin adapter layer that maps signals to dashboard/insight/alert formats → **Selected**: minimal change, preserves existing APIs

### 2. Deterministic Demo Scenarios

**Decision**: Replace random-seeded jitter with operational business scenarios that produce predictable, internally consistent signal/alert/investigation states.

**Rationale**: Current seed uses `seedRandom()` with jitter — produces different absolute values each run (though deterministic per seed). The problem: signals, alerts, and dashboard metrics may not align because they're computed independently at different times.

**Approach**:
- Keep the deterministic PRNG for transaction generation (it's already stable per seed)
- Add a scenario validation layer that verifies seeded data produces expected signals
- Ensure each persona triggers specific, documented signal states (e.g., freelancer always has a Marketing spike)

**Alternatives Considered**:
- Hard-code all transaction amounts → Rejected: loses realism
- Use snapshot-based fixtures → Rejected: brittle, hard to maintain

### 3. Operational Workflow Alignment (Signals → Alerts → Investigations)

**Decision**: Establish a clear data flow: Signal Engine → Alert Engine (consumes signals) → Investigation context (references signal + alert).

**Rationale**: Currently, the alert engine independently queries the database for the same metrics the signal engine already computes. This creates potential inconsistency where a signal says "spending up 45%" but the alert says "spending up 43%" due to timing differences.

**Approach**:
- Alert engine should consume signal output rather than re-querying
- Investigation filtering should reference signal keys for traceability
- Dashboard metrics should be derivable from signal values

### 4. Investigation Filtering

**Decision**: Implement deterministic filtering on the signals endpoint with support for category, vendor, amount range, date window, and anomaly tags.

**Rationale**: Currently `GET /api/v1/signals` returns all signals without filtering. For investigation workflows, users need to narrow signals by relevant criteria.

**Approach**:
- Add query parameters to the signals endpoint: `category`, `severity`, `trend`, `dateFrom`, `dateTo`
- Filter at the application layer (signals are already in-memory after computation)
- Support anomaly tag filtering via signal metadata keys

### 5. Currency Propagation

**Decision**: Currency preference must flow from `User.currency` through all monetary formatting in signals, alerts, dashboard, and assistant context.

**Rationale**: Currently `safe-math.ts` uses `formatMoney()` which defaults to USD formatting. The user's currency preference (stored in `User.currency`) is not propagated to server-side formatting.

**Current State**:
- Server: `formatMoney()` in `utils/safe-math.ts` — no currency parameter, defaults to `$` prefix
- Client: `useFormatCurrency()` hook reads user currency from auth context — correct
- Gap: Server-side responses (alerts, insights, assistant) use hardcoded `$` formatting

**Approach**:
- Add `currency` parameter to `formatMoney()` server-side
- Pass user currency through signal engine context
- Ensure all API responses that include formatted monetary strings use the user's currency

### 6. Dashboard Consistency

**Decision**: Dashboard widgets must consume canonical signal values rather than computing their own metrics.

**Rationale**: Multiple dashboard endpoints (`/metrics`, `/forecast`, `/money-leak`, `/weekly-summary`) independently query the database and compute aggregates. This creates potential inconsistency with signal values.

**Approach**:
- Add a signal-to-dashboard adapter that maps signal values to dashboard widget format
- Standardize trend windows (signal engine uses fixed windows; dashboard should match)
- Standardize rounding rules (use `toSafeNumber()` consistently)
- Respect signal TTL for dashboard cache invalidation

### 7. Seed Integrity Validation

**Decision**: Add a validation script that runs after seeding to verify operational plausibility.

**Rationale**: Seeded data must produce non-contradictory signals. For example, if a persona has a "Marketing spike" scenario, the signal engine must actually produce a SPEND_SPIKE signal for that category.

**Approach**:
- After seeding, run signal computation for each demo user
- Validate that expected signals are produced (e.g., freelancer → SPEND_SPIKE for Marketing)
- Validate that alerts don't contradict signals
- Validate that dashboard metrics are consistent with signal values

### 8. Testing Strategy

**Decision**: Use Node.js built-in test runner (`node --import tsx --test`) with focused test files per concern.

**Rationale**: Project already uses this pattern (see existing `.test.ts` files). No new test framework needed.

**Test Categories**:
- Signal determinism: Same input → same output (pure function tests for generators)
- Dashboard consistency: Signal values match dashboard metric values
- Currency propagation: Formatted strings use correct currency symbol
- Investigation filtering: Query params produce correct filtered results
- Seed integrity: Seeded data produces expected signal states
- Operational workflow coherence: Signal → Alert → Investigation chain is consistent

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | Node.js built-in (`--test`) | Already in use, no new deps |
| Signal adapter pattern | Thin mapping layer | Minimal change, preserves APIs |
| Currency formatting | Extend `formatMoney()` with currency param | Single point of change |
| Filtering | Application-layer on cached signals | Signals already in memory |
| Validation | Post-seed script | Non-invasive, can run in CI |

## Constraints Confirmed

- ✅ No schema rewrites (Prisma schema unchanged)
- ✅ No microservices (stays modular monolith)
- ✅ No distributed systems (single process)
- ✅ No feature expansion (stabilization only)
- ✅ Architecture freeze (no new patterns or abstractions)
