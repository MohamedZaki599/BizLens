# Implementation Plan: MVP Backend Intelligence Stabilization

**Branch**: `001-improve-signal-assistant` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-improve-signal-assistant/spec.md`

## Summary

Stabilize the BizLens MVP backend intelligence and operational workflow architecture. This is a hardening pass — no new features, no schema changes, no architectural expansion. The goal is operational credibility: deterministic signal behavior, consistent dashboard metrics, coherent alert/investigation workflows, reliable currency propagation, and validated seed data integrity.

## Technical Context

**Language/Version**: TypeScript 5.6 (Node.js)
**Primary Dependencies**: Express 4.21, Prisma ORM, date-fns 4.1, Zod 3.23
**Storage**: PostgreSQL (via Prisma, `@bizlens/database` workspace package)
**Testing**: Node.js built-in test runner (`node --import tsx --test`)
**Target Platform**: Linux server (Docker), client is Vite + React 18 + TailwindCSS
**Project Type**: Web application (monorepo: `server/`, `client/`, `packages/database/`)
**Performance Goals**: Dashboard API < 500ms p95, signal computation < 2s
**Constraints**: Architecture freeze — no schema rewrites, no microservices, no distributed systems, no feature expansion
**Scale/Scope**: MVP demo — 3 demo personas, ~6 months of seeded data per persona

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Operational Clarity & Simplicity | ✅ PASS | Stabilization improves clarity without adding complexity |
| II. Actionable Signals | ✅ PASS | Ensures signals are canonical, deterministic, and actionable |
| III. Fast Onboarding & Low Friction UX | ✅ PASS | No UX changes — backend hardening only |
| IV. Explainable Signals & Trust | ✅ PASS | Deterministic behavior increases trust |
| V. Principled Avoidance | ✅ PASS | No new features, no complexity added |
| Architecture: Modular Monolith | ✅ PASS | No architectural changes |
| Engineering Workflow | ✅ PASS | Audit → identify violations → validate → plan → implement |

**Gate Result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-improve-signal-assistant/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
server/
├── src/
│   ├── intelligence/
│   │   ├── engine/
│   │   │   ├── signal-engine.ts        # Central signal orchestrator
│   │   │   └── data-collector.ts       # Single-pass DB data collection
│   │   ├── signals/
│   │   │   ├── signal-registry.ts      # Generator registration
│   │   │   ├── signal.types.ts         # FinancialSignal contract
│   │   │   └── generators/             # Profit, spending, forecast, anomaly
│   │   ├── calculators/                # Pure computation functions
│   │   ├── thresholds/                 # Configurable severity thresholds
│   │   ├── localization/               # Language-agnostic message building
│   │   └── events/                     # Event bus for SIGNALS_RECOMPUTED
│   ├── modules/
│   │   ├── dashboard/
│   │   │   ├── dashboard.service.ts    # Metrics, forecast, money-leak
│   │   │   ├── dashboard.routes.ts     # Express routes
│   │   │   └── assistant.service.ts    # AI assistant digest builder
│   │   ├── signals/
│   │   │   ├── signals.controller.ts   # Signal CRUD + lifecycle
│   │   │   └── signals.routes.ts       # Signal API routes
│   │   └── alerts/
│   │       └── alerts.routes.ts        # Alert API routes
│   ├── services/
│   │   ├── alert-engine/               # Alert generation from signals
│   │   └── insight-engine/             # Insight generation (dashboard cards)
│   └── utils/
│       └── safe-math.ts                # Monetary formatting, percent change
├── prisma/
│   ├── seed.ts                         # Basic seed
│   └── seed-rich-data.ts              # Deterministic demo data generator
└── package.json

client/
├── src/
│   ├── features/
│   │   ├── dashboard/                  # Dashboard widgets, hooks, API
│   │   ├── signals/                    # Signal cards, workspace panel
│   │   └── alerts/                     # Alert center, notifications
│   ├── lib/
│   │   ├── format.ts                   # Client-side formatting
│   │   └── safe-math.ts               # Client-side monetary math
│   └── types/
│       └── domain.ts                   # Shared domain types
└── package.json

packages/database/
├── prisma/schema.prisma                # Source-of-truth schema
└── src/                                # Prisma client export
```

**Structure Decision**: Existing monorepo structure with `server/`, `client/`, `packages/database/` workspaces. No structural changes needed — stabilization operates within existing boundaries.

## Complexity Tracking

> No violations — architecture freeze mode. No new patterns, no new abstractions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
