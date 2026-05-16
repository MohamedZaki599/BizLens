# Tasks: Backend Intelligence Localization - Semantic Contracts & Governance

**Input**: Design documents from `/specs/001-improve-signal-assistant/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Explicitly requested - governance validation tests included.

**Organization**: Tasks grouped by localization concern with governance woven throughout.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which localization concern this task belongs to (US1-US7)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Central Registry & Type Contracts)

**Purpose**: Define the centralized localization key registry, typed contracts, and naming conventions before any refactoring

- [x] T001 Create central localization key registry at server/src/intelligence/localization/key-registry.ts - define exhaustive LOCALIZATION_KEYS constant with typed namespaces: signals.* (20 keys), alerts.* (8 keys), assistant.* (7 keys), insights.* (6 keys), reasoning.* (per signal key), confidence.* (4 levels), status.* (5 states); export type LocalizationKey = keyof typeof LOCALIZATION_KEYS
- [x] T002 [P] Create typed localization payload interfaces at server/src/intelligence/localization/localization.types.ts - define: LocalizedPayload { summaryKey: LocalizationKey; summaryParams: Record<string, number | string>; explanationKey?: LocalizationKey; explanationParams?: Record<string, number | string>; reasoningKeys?: LocalizationKey[]; reasoningParams?: Record<string, number | string>[] }; LocalizedAlert { titleKey: LocalizationKey; titleParams: Record<string, number | string>; messageKey: LocalizationKey; messageParams: Record<string, number | string> }; LocalizedNote { titleKey: LocalizationKey; titleParams: Record<string, number | string>; messageKey: LocalizationKey; messageParams: Record<string, number | string>; metricKey?: LocalizationKey; metricParams?: Record<string, number | string> }
- [x] T003 [P] Create naming convention validator at server/src/intelligence/localization/key-validator.ts - export isValidKey(key: string): boolean that enforces pattern: namespace.signal_key.field (lowercase, underscores, max 3 segments); export validateParams(params: Record<string, unknown>): { valid: boolean; issues: string[] } that rejects pre-formatted values (strings containing %, $, currency symbols, or formatted numbers like "1,234")

---

## Phase 2: Foundational (Signal Type Extension & Enum Standardization)

**Purpose**: Extend FinancialSignal contract and standardize all enumerations

- [x] T004 Extend FinancialSignal type in server/src/intelligence/signals/signal.types.ts - add optional `localized?: LocalizedPayload` field; import LocalizedPayload from localization.types.ts; add JSDoc marking existing metadata.description as @deprecated
- [x] T005 [P] Create standardized enum constants at server/src/intelligence/localization/enums.ts - export: CONFIDENCE_LEVELS = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low', NONE: 'none' } as const; TREND_DIRECTIONS = { UP: 'up', DOWN: 'down', FLAT: 'flat', UNKNOWN: 'unknown' } as const; SIGNAL_STATUSES = { NEW: 'new', REVIEWED: 'reviewed', INVESTIGATING: 'investigating', SNOOZED: 'snoozed', RESOLVED: 'resolved' } as const; SEVERITIES = { NONE: 'none', INFO: 'info', WARNING: 'warning', CRITICAL: 'critical' } as const
- [x] T006 [P] Create localized payload builder at server/src/intelligence/localization/payload-builder.ts - export buildLocalizedPayload(signal: FinancialSignal): LocalizedPayload that maps signal.key + signal.metadata to semantic translation keys using LOCALIZATION_KEYS registry; params must be raw numbers/identifiers only (no formatMoney, no formatPctChange); validate output with isValidKey() before returning

---

## Phase 3: Signal Generator Localization (US1)

**Goal**: All signal generators produce localized payloads with semantic keys.

- [x] T007 [US1] Update profit-signal.ts to populate localized payload - in server/src/intelligence/signals/generators/profit-signal.ts, after creating each signal (PROFIT_MARGIN, REVENUE_GROWTH, EXPENSE_GROWTH, PROFIT_TREND), call buildLocalizedPayload() and attach to signal.localized; ensure summaryParams use raw values like {marginPct: 25.5, income: 5200, expense: 3800} not formatted strings
- [x] T008 [US1] Update spending-signal.ts to populate localized payload - in server/src/intelligence/signals/generators/spending-signal.ts, for BURN_RATE, EXPENSE_RATIO, TOP_EXPENSE_CATEGORY, TOP_INCOME_CATEGORY, CATEGORY_CONCENTRATION, SPEND_SPIKE, WEEKLY_SPEND_CHANGE; params must include categoryName as identifier, amounts as raw numbers
- [x] T009 [US1] Update forecast-signal.ts to populate localized payload - in server/src/intelligence/signals/generators/forecast-signal.ts, for PROJECTED_EXPENSE, PROJECTED_INCOME, PROJECTED_PROFIT, CASH_RUNWAY_DAYS; params include projectedAmount, remainingDays, dailyRate as raw numbers
- [x] T010 [P] [US1] Update anomaly-signal.ts to populate localized payload - in server/src/intelligence/signals/generators/anomaly-signal.ts, for SPENDING_ANOMALY, STALE_DATA, RECURRING_EXPENSE; params include categoryName, changePct, daysSince, monthsDetected as raw values
- [x] T011 [US1] Refactor explainability reasoningChain to be language-agnostic - in all 4 generators, replace English prose in reasoningChain with structured template references using key format

---

## Phase 4: Alert Engine Localization (US2)

**Goal**: Alert engine produces alerts with semantic translation keys.

- [x] T012 [US2] Create alert localization types at server/src/services/alert-engine/alert-localization.types.ts - define LocalizedAlertDraft extending DraftAlert with optional `localized?: LocalizedAlert`; mark title/message fields with @deprecated JSDoc
- [x] T013 [US2] Add localized payloads to ruleSpendSpike - in server/src/services/alert-engine/alert-engine.ts, add localized: { titleKey: 'alerts.spend_spike.title', titleParams: {categoryName}, messageKey: 'alerts.spend_spike.message', messageParams: {categoryName, changePct, currentAmount, baselineAvg} } to each spike draft
- [x] T014 [US2] Add localized payloads to ruleProfitDrop and ruleSpendExceedsIncome - add localized fields with keys 'alerts.profit_drop.title/message' and 'alerts.expenses_exceed.title/message' with raw numeric params
- [x] T015 [P] [US2] Add localized payloads to ruleWeeklySpendIncrease, ruleForecastOverspend, ruleCategoryConcentration, ruleStaleData, ruleRecurringDetected - add localized fields with appropriate namespace keys and raw params to all remaining rules
- [x] T016 [US2] Update alert persistence to store localized field - in server/src/services/alert-engine/alert-engine.ts persist(), serialize localized field into a new localizedJson text field on the Alert model (store as JSON string alongside existing actionJson); if schema freeze prevents this, store in metadata comment only

---

## Phase 5: Assistant & Insight Localization (US3)

**Goal**: Assistant notes and insight cards use semantic keys.

- [x] T017 [US3] Add localized payloads to assistant note generators - in server/src/modules/dashboard/assistant.service.ts, add localized: LocalizedNote to weeklyPulse, profitTrend, expenseDriver, forecastNote, subscriptionsNote, staleDataNote, generateSignalInsight return objects; keys follow 'assistant.{kind}.title/message' pattern
- [x] T018 [US3] Add localized headline to AssistantDigest - extend AssistantDigest interface with headlineKey: LocalizationKey and headlineParams: Record<string, number|string>; populate based on top note's localized titleKey
- [x] T019 [P] [US3] Add localized payloads to insight engine generators - in server/src/services/insight-engine/insight-engine.ts, extend Insight interface with optional `localized?: { titleKey: string; titleParams: Record<string, number|string>; messageKey: string; messageParams: Record<string, number|string> }`; populate in weeklyComparison, monthlyComparison, topExpense, topIncome, profitTrend, spendingAnomaly

---

## Phase 6: API Response Compatibility Layer (US4)

**Goal**: API responses include both legacy prose (deprecated) and new localized fields.

- [x] T020 [US4] Update signals controller to include localized field - in server/src/modules/signals/signals.controller.ts getSignals/getSignalByKey/recomputeSignals, include signal.localized in normalized response object alongside existing metadata.description
- [x] T021 [US4] Update dashboard routes to include localized fields - in server/src/modules/dashboard/dashboard.routes.ts, ensure /assistant response includes headlineKey/headlineParams; ensure /insights response includes insight.localized
- [x] T022 [P] [US4] Add deprecation response headers - add middleware or inline header `X-Deprecated-Fields: description,title,message,headline` to /signals, /insights, /assistant endpoints in server/src/modules/dashboard/dashboard.routes.ts and server/src/modules/signals/signals.routes.ts

---

## Phase 7: Governance Validation & Testing (US5)

**Goal**: Automated tests enforce localization governance.

- [x] T023 [P] [US5] Write key registry completeness test - create server/src/__tests__/localization-registry.test.ts verifying: every SignalKey has a corresponding entry in LOCALIZATION_KEYS; every alert type has entries; no duplicate keys across namespaces
- [x] T024 [P] [US5] Write param determinism test - create server/src/__tests__/localization-params.test.ts verifying: generate signals from test snapshot, for each signal.localized.summaryParams, assert all values are typeof 'number' or short identifier strings (no %, $, formatted numbers, no strings > 50 chars)
- [x] T025 [P] [US5] Write prose leakage detection test - create server/src/__tests__/localization-no-prose.test.ts verifying: generate signals, for each signal.localized.summaryKey, assert it matches pattern /^[a-z]+\.[a-z_]+\.[a-z_]+$/; assert no summaryKey contains spaces or capital letters
- [x] T026 [US5] Write explainability language-agnostic test - create server/src/intelligence/__tests__/explainability-no-prose.test.ts verifying: for each signal's explainability.reasoningChain entry, assert it matches a localization key pattern OR is a pure formula/data reference (no English articles: "the", "a", "is", "are", "your")
- [x] T027 [P] [US5] Write namespace ownership test - create server/src/__tests__/localization-ownership.test.ts verifying: signal generators only produce keys starting with 'signals.*'; alert engine only produces keys starting with 'alerts.*'; assistant only produces keys starting with 'assistant.*'; insight engine only produces keys starting with 'insights.*'

---

## Phase 8: Explainability Cleanup (US6)

**Goal**: Explainability metadata is fully language-agnostic.

- [x] T028 [US6] Refactor reasoningChain in profit-signal.ts - replace English prose with localization key references: e.g., replace `Expenses (${x}) exceed income (${y}) - operating at a loss` with key reference `reasoning.profit_margin.loss` and attach params {expense: x, income: y} in a parallel reasoningParams array in metadata
- [x] T029 [US6] Refactor reasoningChain in spending-signal.ts - replace all English prose entries with key references following pattern 'reasoning.{signal_key}.{variant}' with corresponding params
- [x] T030 [P] [US6] Refactor reasoningChain in anomaly-signal.ts and forecast-signal.ts - replace English prose with key references in both files

---

## Phase 9: Deprecation Tracking & Documentation (US7)

**Goal**: All legacy prose fields are formally deprecated with removal timeline documented.

- [x] T031 [US7] Add @deprecated JSDoc to all legacy prose fields - mark: FinancialSignal metadata.description, Alert title/message, AssistantNote title/message, AssistantDigest headline, Insight title/message with @deprecated and note "Use localized.summaryKey/messageKey instead. Removal target: v0.3.0"
- [x] T032 [US7] Create deprecation tracking document - create server/src/intelligence/localization/DEPRECATION.md documenting: all deprecated fields, their replacement localized equivalents, removal timeline, frontend migration checklist
- [x] T033 [P] [US7] Update contracts documentation - update specs/001-improve-signal-assistant/contracts/signals.api.md to document the LocalizedPayload structure, key naming convention, param types, and deprecation schedule

---

## Phase 10: Polish & Transition to Contract Sync

**Purpose**: Verify existing phases compile and pass before adding contract synchronization

- [x] T034 Run full test suite - execute `node --import tsx --test` across all test files in server/src/ and verify zero failures
- [x] T035 [P] Verify key registry covers all signal types - run a script/test that generates signals from the test snapshot and asserts every signal.localized.summaryKey exists in LOCALIZATION_KEYS
- [x] T036 [P] Verify no new dependencies added - check server/package.json has no new entries in dependencies or devDependencies
- [x] T037 Run TypeScript build verification - execute `npx tsc --noEmit --project tsconfig.build.json` in server/ and confirm zero errors
- [x] T038 Verify architecture freeze compliance - confirm no new Prisma models, no new API routes, no new middleware; only localization refactoring within existing boundaries

---

## Phase 11: Frontend-Backend Contract Synchronization (US8)

**Goal**: Guarantee that every localization key emitted by the backend exists in frontend translation resources.

- [x] T039 [US8] Create shared localization contract schema at server/src/intelligence/localization/contract-schema.ts - export a typed CONTRACT_SCHEMA mapping each LocalizationKey to its required params with types: Record<LocalizationKey, { params: Record<string, 'number' | 'string'>; namespace: string; deprecated?: boolean }>
- [x] T040 [US8] Create contract validation utility at server/src/intelligence/localization/contract-validator.ts - export validatePayloadAgainstContract(payload: LocalizedPayload, schema: typeof CONTRACT_SCHEMA): { valid: boolean; missingParams: string[]; extraParams: string[]; invalidTypes: string[] } that checks summaryParams match the schema's expected params for that key
- [x] T041 [P] [US8] Create frontend translation key inventory test at server/src/__tests__/localization-frontend-sync.test.ts - read client/src/lib/i18n/core.ts (or equivalent translation dictionary), extract all defined translation keys, then verify every key in LOCALIZATION_KEYS has a corresponding entry in the frontend dictionary for both 'en' and 'ar' namespaces
- [x] T042 [US8] Create interpolation integrity test at server/src/__tests__/localization-interpolation.test.ts - generate signals from test snapshot, for each signal.localized, validate against CONTRACT_SCHEMA: assert no missing params, no extra params, all param values match expected types (number vs string)
- [x] T043 [P] [US8] Add development-mode validation to payload-builder - in server/src/intelligence/localization/payload-builder.ts, when NODE_ENV !== 'production', call validatePayloadAgainstContract() after building each payload and log warnings for any mismatches (non-blocking, observability only)
- [x] T044 [US8] Create backward compatibility assertion test at server/src/__tests__/localization-backward-compat.test.ts - verify that signals still include legacy metadata.description field alongside new localized field; verify API response shape hasn't changed for existing consumers

---

## Phase 12: Final Polish & Validation

**Purpose**: Final build verification, full test run, architecture compliance

- [x] T045 Run full test suite - execute `node --import tsx --test` across all test files in server/src/ and verify zero failures
- [x] T046 [P] Verify key registry covers all signal types - run a script/test that generates signals from the test snapshot and asserts every signal.localized.summaryKey exists in LOCALIZATION_KEYS
- [x] T047 [P] Verify no new dependencies added - check server/package.json has no new entries in dependencies or devDependencies
- [x] T048 Run TypeScript build verification - execute `npx tsc --noEmit --project tsconfig.build.json` in server/ and confirm zero errors
- [x] T049 Verify architecture freeze compliance - confirm no new Prisma models, no new API routes, no new middleware; only localization refactoring within existing boundaries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all localization work
- **Signal Generators (Phase 3)**: Depends on Phase 2
- **Alert Engine (Phase 4)**: Depends on Phase 2 - can run in parallel with Phase 3
- **Assistant & Insights (Phase 5)**: Depends on Phase 2 - can run in parallel with Phases 3/4
- **API Compatibility (Phase 6)**: Depends on Phases 3-5 completion
- **Governance Testing (Phase 7)**: Depends on Phases 3-5 (needs localized payloads to test)
- **Explainability Cleanup (Phase 8)**: Depends on Phase 3
- **Deprecation (Phase 9)**: Depends on Phases 3-6 completion
- **Polish/Transition (Phase 10)**: Depends on Phases 1-9
- **Contract Synchronization (Phase 11)**: Depends on Phase 10 (needs all localization in place)
- **Final Validation (Phase 12)**: Depends on all previous phases

### Critical Path

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 6 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12
                   -> Phase 4 ->
                   -> Phase 5 ->
                   -> Phase 8 -> (after Phase 3)
                             -> Phase 7 ->
```
