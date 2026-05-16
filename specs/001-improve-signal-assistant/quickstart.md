# Quickstart: MVP Backend Intelligence Stabilization

**Feature**: 001-improve-signal-assistant  
**Date**: 2026-05-15

## Prerequisites

- Node.js 18+
- PostgreSQL running (Docker or local)
- `.env` configured in `server/` and `packages/database/`

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate:dev

# Seed demo data
npm run -w server db:seed:rich
```

## Verification Scenarios

### 1. Signal Determinism

**Test**: Run signal computation twice for the same user → identical output.

```bash
# Run signal determinism tests
cd server
node --import tsx --test src/intelligence/__tests__/signal-determinism.test.ts
```

**Expected**: All signal keys produce identical `value`, `severity`, `trend` on repeated computation with same input data.

### 2. Dashboard Consistency

**Test**: Compare dashboard metrics with signal values for the same time window.

```bash
cd server
node --import tsx --test src/modules/dashboard/__tests__/dashboard-consistency.test.ts
```

**Expected**:
- `metrics.totals.profit` matches signal-derived profit
- `metrics.changes.expense.direction` matches EXPENSE_GROWTH signal trend
- `metrics.warnings` are derived from signals with severity ≥ warning

### 3. Currency Propagation

**Test**: Set user currency to SAR, fetch dashboard/assistant → all monetary strings use SAR formatting.

```bash
cd server
node --import tsx --test src/__tests__/currency-propagation.test.ts
```

**Expected**:
- Alert messages use "SAR" or "ر.س" formatting
- Assistant notes use correct currency symbol
- Dashboard API returns raw numbers (client formats)
- Signal metadata descriptions use user's currency

### 4. Investigation Filtering

**Test**: Query signals with filter parameters → correct subset returned.

```bash
cd server
node --import tsx --test src/modules/signals/__tests__/signal-filtering.test.ts
```

**Expected**:
- `?severity=warning` → only WARNING/CRITICAL signals
- `?category=uuid` → only signals with that sourceEntity
- `?trend=up` → only UP trend signals
- Combined filters → intersection (AND logic)

### 5. Seed Integrity

**Test**: After seeding, verify each persona produces expected signals.

```bash
cd server
node --import tsx --test src/__tests__/seed-integrity.test.ts
```

**Expected**:
- Freelancer → SPEND_SPIKE (Marketing), PROFIT_TREND
- E-commerce → SPEND_SPIKE (Ads), EXPENSE_GROWTH
- Service Business → SPEND_SPIKE (Marketing), PROFIT_TREND
- No contradictory alert/signal pairs

### 6. Operational Workflow Coherence

**Test**: Signal → Alert → Assistant chain produces consistent narrative.

```bash
cd server
node --import tsx --test src/__tests__/workflow-coherence.test.ts
```

**Expected**:
- If signal says "Marketing +45%", alert says "Marketing spiked" (not different %)
- Assistant context references the same signal data
- Investigation filtering returns the triggering signal

## Manual Verification

### Start Development Servers

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

### Test Flow

1. Login as `demo+freelancer@bizlens.app` / `Demo123!`
2. Open Dashboard → verify metrics are consistent
3. Check Signals panel → verify SPEND_SPIKE for Marketing exists
4. Open signal detail → verify assistant provides contextual analysis
5. Filter signals by severity=warning → verify correct subset
6. Switch currency to SAR in settings → verify all monetary displays update

## Success Criteria

| Criterion | Verification Method |
|-----------|-------------------|
| Signal determinism | Automated test: same input → same output |
| Dashboard consistency | Automated test: signal values match dashboard |
| Currency propagation | Automated test: correct formatting per user pref |
| Investigation filtering | Automated test: filter params produce correct results |
| Seed integrity | Automated test: expected signals per persona |
| Workflow coherence | Automated test: signal→alert→assistant consistency |
| No duplicate computations | Code audit: dashboard reads signals, not raw DB |
| No contradictory alerts | Automated test: alert severity ≤ signal severity |
