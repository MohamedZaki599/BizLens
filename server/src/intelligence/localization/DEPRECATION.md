# Localization Deprecation Tracking

> **Removal Target**: v0.3.0  
> **Status**: Transition period — both legacy prose fields and new localized payloads are populated.

---

## Overview

As part of the backend intelligence localization initiative, all human-readable prose fields are being replaced with semantic translation keys and raw interpolation parameters. This enables full i18n/l10n support (including RTL languages like Arabic) without embedding language-specific text in the API layer.

During the transition period, **both** the deprecated prose fields and the new `localized` payloads are populated in API responses. Consumers should migrate to the localized equivalents before the removal target version.

---

## Deprecated Fields

### 1. FinancialSignal — `metadata.description`

| Property | `metadata.description` |
|----------|------------------------|
| **Type** | `string \| undefined` |
| **Location** | `server/src/intelligence/signals/signal.types.ts` |
| **Replacement** | `localized.summaryKey` + `localized.summaryParams` |
| **Replacement Type** | `LocalizedPayload` (from `localization.types.ts`) |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{
  "metadata": {
    "description": "Profit margin is 25.5% — income $5,200, expenses $3,800"
  }
}
```

**After (localized)**:
```json
{
  "localized": {
    "summaryKey": "signals.profit_margin.summary",
    "summaryParams": { "marginPct": 25.5, "income": 5200, "expense": 3800 }
  }
}
```

---

### 2. DraftAlert — `title`

| Property | `title` |
|----------|---------|
| **Type** | `string` |
| **Location** | `server/src/services/alert-engine/alert-localization.types.ts` |
| **Replacement** | `localized.titleKey` + `localized.titleParams` |
| **Replacement Type** | `LocalizedAlert` (from `localization.types.ts`) |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "title": "Spending spike in Marketing" }
```

**After (localized)**:
```json
{
  "localized": {
    "titleKey": "alerts.spend_spike.title",
    "titleParams": { "categoryName": "Marketing" }
  }
}
```

---

### 3. DraftAlert — `message`

| Property | `message` |
|----------|-----------|
| **Type** | `string` |
| **Location** | `server/src/services/alert-engine/alert-localization.types.ts` |
| **Replacement** | `localized.messageKey` + `localized.messageParams` |
| **Replacement Type** | `LocalizedAlert` (from `localization.types.ts`) |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "message": "Marketing spending jumped 45% ($2,400 vs $1,655 baseline)" }
```

**After (localized)**:
```json
{
  "localized": {
    "messageKey": "alerts.spend_spike.message",
    "messageParams": { "categoryName": "Marketing", "changePct": 45, "currentAmount": 2400, "baselineAvg": 1655 }
  }
}
```

---

### 4. AssistantNote — `title`

| Property | `title` |
|----------|---------|
| **Type** | `string` |
| **Location** | `server/src/modules/dashboard/assistant.service.ts` |
| **Replacement** | `localized.titleKey` + `localized.titleParams` |
| **Replacement Type** | `LocalizedNote` (from `localization.types.ts`) |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "title": "Profit is sliding" }
```

**After (localized)**:
```json
{
  "localized": {
    "titleKey": "assistant.profit_trend.title",
    "titleParams": { "direction": "down" }
  }
}
```

---

### 5. AssistantNote — `message`

| Property | `message` |
|----------|-----------|
| **Type** | `string` |
| **Location** | `server/src/modules/dashboard/assistant.service.ts` |
| **Replacement** | `localized.messageKey` + `localized.messageParams` |
| **Replacement Type** | `LocalizedNote` (from `localization.types.ts`) |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "message": "Profit is -18% versus last month ($3,200 vs $3,900). Worth a closer look." }
```

**After (localized)**:
```json
{
  "localized": {
    "messageKey": "assistant.profit_trend.message",
    "messageParams": { "profit": 3200, "lastProfit": 3900, "changePct": -18, "hasComparison": 1 }
  }
}
```

---

### 6. AssistantDigest — `headline`

| Property | `headline` |
|----------|------------|
| **Type** | `string` |
| **Location** | `server/src/modules/dashboard/assistant.service.ts` |
| **Replacement** | `headlineKey` + `headlineParams` |
| **Replacement Type** | `LocalizationKey` + `Record<string, number \| string>` |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "headline": "Profit is sliding" }
```

**After (localized)**:
```json
{
  "headlineKey": "assistant.profit_trend.title",
  "headlineParams": { "direction": "down" }
}
```

---

### 7. Insight — `title`

| Property | `title` |
|----------|---------|
| **Type** | `string` |
| **Location** | `server/src/services/insight-engine/insight-engine.ts` |
| **Replacement** | `localized.titleKey` + `localized.titleParams` |
| **Replacement Type** | `{ titleKey: LocalizationKey; titleParams: Record<string, number \| string> }` |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "title": "Spending up this week" }
```

**After (localized)**:
```json
{
  "localized": {
    "titleKey": "insights.weekly_comparison.title",
    "titleParams": { "direction": "up" }
  }
}
```

---

### 8. Insight — `message`

| Property | `message` |
|----------|-----------|
| **Type** | `string` |
| **Location** | `server/src/services/insight-engine/insight-engine.ts` |
| **Replacement** | `localized.messageKey` + `localized.messageParams` |
| **Replacement Type** | `{ messageKey: LocalizationKey; messageParams: Record<string, number \| string> }` |
| **Removal Target** | v0.3.0 |

**Before (deprecated)**:
```json
{ "message": "You spent $3,400 this week — up 22% from last week's $2,787." }
```

**After (localized)**:
```json
{
  "localized": {
    "messageKey": "insights.weekly_comparison.message",
    "messageParams": { "thisAmount": 3400, "lastAmount": 2787, "changePct": 22 }
  }
}
```

---

## Removal Timeline

| Milestone | Version | Description |
|-----------|---------|-------------|
| **Deprecation announced** | v0.1.0 | `@deprecated` JSDoc added to all legacy fields. `localized` payloads populated alongside prose. |
| **API deprecation headers** | v0.2.0 | `X-Deprecated-Fields` response header added to `/signals`, `/insights`, `/assistant` endpoints. |
| **Removal** | v0.3.0 | Legacy prose fields (`description`, `title`, `message`, `headline`) removed from type contracts and API responses. |

---

## Frontend Migration Checklist

Use this checklist to track frontend migration from deprecated prose fields to localized key-based rendering.

### Prerequisites

- [ ] Translation dictionaries exist for all supported locales (`en`, `ar` at minimum)
- [ ] Translation dictionaries contain entries for every key in `LOCALIZATION_KEYS` registry
- [ ] An interpolation utility is available (e.g., `i18next`, `intl-messageformat`, or custom)
- [ ] Number/currency/percentage formatters respect the user's locale settings

### Signal Cards

- [ ] Replace rendering of `signal.metadata.description` with lookup of `signal.localized.summaryKey`
- [ ] Pass `signal.localized.summaryParams` to the interpolation utility
- [ ] Format numeric params (`marginPct`, `income`, `expense`, etc.) using locale-aware formatters
- [ ] Handle missing `localized` field gracefully (fallback to `metadata.description` during transition)

### Alert Components

- [ ] Replace rendering of `alert.title` with lookup of `alert.localized.titleKey`
- [ ] Replace rendering of `alert.message` with lookup of `alert.localized.messageKey`
- [ ] Pass `alert.localized.titleParams` and `alert.localized.messageParams` to interpolation
- [ ] Format currency amounts and percentages using locale-aware formatters
- [ ] Handle missing `localized` field gracefully (fallback to prose `title`/`message`)

### Assistant Notes

- [ ] Replace rendering of `note.title` with lookup of `note.localized.titleKey`
- [ ] Replace rendering of `note.message` with lookup of `note.localized.messageKey`
- [ ] Pass `note.localized.titleParams` and `note.localized.messageParams` to interpolation
- [ ] If `note.localized.metricKey` is present, render the metric using that key + `metricParams`
- [ ] Handle missing `localized` field gracefully (fallback to prose `title`/`message`)

### Assistant Digest Headline

- [ ] Replace rendering of `digest.headline` with lookup of `digest.headlineKey`
- [ ] Pass `digest.headlineParams` to the interpolation utility
- [ ] Handle missing `headlineKey` gracefully (fallback to prose `headline`)

### Insight Cards

- [ ] Replace rendering of `insight.title` with lookup of `insight.localized.titleKey`
- [ ] Replace rendering of `insight.message` with lookup of `insight.localized.messageKey`
- [ ] Pass `insight.localized.titleParams` and `insight.localized.messageParams` to interpolation
- [ ] Handle missing `localized` field gracefully (fallback to prose `title`/`message`)

### General

- [ ] Remove all direct string rendering of deprecated fields from components
- [ ] Verify RTL layout renders correctly with interpolated translations
- [ ] Test with Arabic locale to confirm bidirectional text handling
- [ ] Confirm no hardcoded English text leaks through params (params must be raw numbers or identifiers)
- [ ] Add integration tests verifying localized rendering for each component type
- [ ] Monitor `X-Deprecated-Fields` header in API responses — once removed, legacy fallbacks can be deleted

---

## Key Naming Convention

All localization keys follow the pattern:

```
{namespace}.{signal_key}.{field}
```

- **namespace**: `signals`, `alerts`, `assistant`, `insights`, `reasoning`, `confidence`, `status`
- **signal_key**: lowercase with underscores (e.g., `profit_margin`, `spend_spike`)
- **field**: `title`, `message`, `summary`, `explanation`, etc.

Examples:
- `signals.profit_margin.summary`
- `alerts.spend_spike.title`
- `assistant.weekly_pulse.message`
- `insights.monthly_comparison.title`
- `reasoning.profit_margin.loss`

---

## Param Contract Rules

1. **Raw values only** — params must be `number` or short identifier `string` (category names, signal keys)
2. **No pre-formatted values** — no currency symbols (`$`), percentage signs (`%`), thousands separators (`,`), or locale-specific formatting
3. **No prose** — param values must never contain sentences, articles, or human-readable text
4. **Formatting is the client's responsibility** — the consuming frontend/translation layer applies locale-aware formatting (currency, percentage, date, number)

---

## References

- Type definitions: `server/src/intelligence/localization/localization.types.ts`
- Key registry: `server/src/intelligence/localization/key-registry.ts`
- Key validator: `server/src/intelligence/localization/key-validator.ts`
- Payload builder: `server/src/intelligence/localization/payload-builder.ts`
- API deprecation headers: `X-Deprecated-Fields` on `/signals`, `/insights`, `/assistant` endpoints
