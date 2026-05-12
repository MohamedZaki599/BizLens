# Implementation Plan: Operational Signal & Assistant UX Refinement

**Branch**: `001-improve-signal-assistant` | **Date**: 2026-05-11 | **Spec**: [spec.md](file:///d:/BizLens/specs/001-improve-signal-assistant/spec.md)
**Input**: Feature specification from `/specs/001-improve-signal-assistant/spec.md`

## Summary

This feature focuses on refining the operational signal review experience and making the AI assistant contextual and data-aware. Key improvements include fixing the RTL drawer layout for Arabic users, ensuring action button visibility, and hardening the AI assistant's persona to be a data-driven "Signal Analyst" instead of a generic assistant.

## Technical Context

**Language/Version**: TypeScript, Node.js 18+  
**Primary Dependencies**: React 18, Vite, Express, Prisma 5.22, Tailwind CSS, TanStack React Query, Zustand, Zod  
**Storage**: PostgreSQL  
**Testing**: `node:test` + `tsx` (Native Node testing)  
**Target Platform**: Responsive Web (Desktop, Tablet, Mobile)
**Project Type**: Full-stack Web Application (Client, Server, Marketing monorepo)  
**Performance Goals**: Visible buttons on all viewports; contextual AI response initialization < 2s.  
**Constraints**: Full RTL (Arabic) support; zero placeholder buttons; data-aware AI context.  
**Scale/Scope**: Refinement of `client/src/features/dashboard` and `server/src/services/assistant.service.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Clarity**: Does it answer "What should I do Monday?" (Signals provide direct deep-links to action).
- [x] **RTL Support**: Mandatory for Arabic (FR-001).
- [x] **No Placeholders**: All buttons must be functional (FR-006).
- [x] **Explainable Signals**: AI assistant summarizes drivers, not just totals (FR-004).
- [x] **Principled Avoidance**: No new heavy infra (Kafka/Microservices); staying within modular monolith.

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
client/
├── src/
│   ├── features/
│   │   ├── dashboard/   # Signal review UI
│   │   └── assistant/   # AI assistant UI
│   └── components/ui/   # Shared drawer/modal components
server/
├── src/
│   ├── services/
│   │   ├── assistant.service.ts # AI logic
│   │   └── dashboard.service.ts # Signal data
│   └── api/
│       └── v1/          # Endpoints
```

**Structure Decision**: Monorepo structure with existing `client` and `server` workspaces.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
