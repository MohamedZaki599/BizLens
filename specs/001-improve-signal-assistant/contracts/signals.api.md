# API Contract: Signals (Stabilization)

**Base Path**: `/api/v1/signals`  
**Auth**: Bearer token (requireAuth middleware)

## GET /api/v1/signals

Returns all financial signals for the authenticated user with optional filtering.

### Query Parameters (NEW — Investigation Filtering)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userMode | string | No | Business type for threshold selection |
| category | string (UUID) | No | Filter by source category entity |
| severity | string | No | Filter: 'none', 'info', 'warning', 'critical' |
| trend | string | No | Filter: 'up', 'down', 'flat', 'unknown' |
| status | string | No | Filter: 'NEW', 'REVIEWED', 'INVESTIGATING', 'SNOOZED', 'RESOLVED' |
| dateFrom | ISO date | No | Signals generated on or after |
| dateTo | ISO date | No | Signals generated on or before |

### Response (200)

```json
{
  "signals": [
    {
      "id": "userId:SIGNAL_KEY",
      "userId": "uuid",
      "key": "SPEND_SPIKE",
      "value": 45.2,
      "severity": "WARNING",
      "trend": "UP",
      "confidence": 0.85,
      "metadata": {
        "description": "Localized human-readable description",
        "explainability": {
          "formula": "(thisWeek - avgWeek) / avgWeek * 100",
          "inputs": { "thisWeek": 2400, "avgWeek": 1650, "changePct": 45.2 },
          "thresholdContext": "Exceeded 30% spike threshold",
          "reasoningChain": ["Marketing spend increased 45% this week", "Driven by campaign spend"],
          "sourceEntities": ["category-uuid"]
        }
      },
      "status": "NEW",
      "snoozedUntil": null,
      "resolutionNotes": null,
      "ttlCategory": "dashboard",
      "generatedAt": "2026-05-15T10:00:00.000Z",
      "expiresAt": null
    }
  ]
}
```

## GET /api/v1/signals/:key

Returns a single signal by key.

### Response (200)

```json
{
  "signal": { /* same shape as array element above */ }
}
```

### Response (404)

```json
{ "error": "Signal \"INVALID_KEY\" not found" }
```

## POST /api/v1/signals/recompute

Forces fresh recomputation. Returns updated signal array.

### Request Body

```json
{ "userMode": "FREELANCER" }
```

### Response (200)

Same as GET /api/v1/signals response.

## PATCH /api/v1/signals/:key

Updates signal lifecycle status.

### Request Body

```json
{
  "status": "INVESTIGATING",
  "snoozedUntil": "2026-05-20T00:00:00.000Z",
  "resolutionNotes": "Reviewed with team"
}
```

### Response (200)

```json
{
  "signal": { /* updated signal */ }
}
```

## Localization Contracts (v0.2.0+)

All intelligence-layer outputs (signals, alerts, assistant notes, insights) now include structured localization payloads alongside legacy prose fields. Clients SHOULD migrate to localized payloads for full i18n support.

### LocalizedPayload (Signals)

Attached to each `FinancialSignal` via the `localized` field.

```typescript
interface LocalizedPayload {
  /** Key referencing the signal's summary translation template. */
  summaryKey: LocalizationKey;
  /** Raw interpolation params for the summary. */
  summaryParams: Record<string, number | string>;
  /** Optional key referencing a longer explanation template. */
  explanationKey?: LocalizationKey;
  /** Raw interpolation params for the explanation. */
  explanationParams?: Record<string, number | string>;
  /** Optional ordered list of reasoning chain keys for explainability. */
  reasoningKeys?: LocalizationKey[];
  /** Parallel array of params for each reasoning key entry. */
  reasoningParams?: Record<string, number | string>[];
}
```

### LocalizedAlert (Alerts)

Attached to each alert draft via the `localized` field.

```typescript
interface LocalizedAlert {
  /** Key referencing the alert title translation template. */
  titleKey: LocalizationKey;
  /** Raw interpolation params for the title. */
  titleParams: Record<string, number | string>;
  /** Key referencing the alert message translation template. */
  messageKey: LocalizationKey;
  /** Raw interpolation params for the message. */
  messageParams: Record<string, number | string>;
}
```

### LocalizedNote (Assistant Notes)

Attached to each assistant note via the `localized` field.

```typescript
interface LocalizedNote {
  /** Key referencing the note title translation template. */
  titleKey: LocalizationKey;
  /** Raw interpolation params for the title. */
  titleParams: Record<string, number | string>;
  /** Key referencing the note message translation template. */
  messageKey: LocalizationKey;
  /** Raw interpolation params for the message. */
  messageParams: Record<string, number | string>;
  /** Optional key referencing a metric label or value template. */
  metricKey?: LocalizationKey;
  /** Raw interpolation params for the metric. */
  metricParams?: Record<string, number | string>;
}
```

### Key Naming Convention

All localization keys follow a strict 3-segment dot-separated pattern:

```
{namespace}.{signal_key}.{field}
```

**Rules**:
- Lowercase only, underscores within segments
- Maximum 3 dot-separated segments
- No human-readable text — keys are identifiers only
- Pattern regex: `/^[a-z]+\.[a-z_]+\.[a-z_]+$/`

**Examples**:
- `signals.profit_margin.summary`
- `alerts.spend_spike.title`
- `reasoning.burn_rate.daily`
- `confidence.high.label`

### Namespaces

| Namespace | Owner | Description |
|-----------|-------|-------------|
| `signals` | Signal generators | Signal summary and explanation keys |
| `alerts` | Alert engine | Alert title and message keys |
| `assistant` | Assistant service | Assistant note title and message keys |
| `insights` | Insight engine | Insight card title and message keys |
| `reasoning` | Signal generators | Explainability reasoning chain keys |
| `confidence` | Shared | Confidence level labels (high, medium, low, none) |
| `status` | Shared | Signal lifecycle status labels |

### Param Types

Interpolation parameters (`summaryParams`, `titleParams`, `messageParams`, etc.) carry **raw values only**:

- **Numbers**: Raw numeric values (e.g., `25.5`, `3800`, `45`). No pre-formatted currency, no percentage symbols, no thousand separators.
- **Short identifier strings**: Category names, signal keys, or other short identifiers (e.g., `"Marketing"`, `"freelancer"`). Maximum 50 characters.

**Prohibited param values**:
- Formatted currency strings (e.g., `"$1,234.56"`)
- Percentage-formatted strings (e.g., `"45%"`)
- Strings containing `%`, `$`, or currency symbols
- Pre-formatted numbers with thousand separators (e.g., `"1,234"`)
- Long prose or sentences

Formatting is the sole responsibility of the consuming client/translation layer.

### Deprecation Schedule

The following legacy prose fields are **deprecated as of v0.2.0** and scheduled for removal in **v0.3.0**:

| Deprecated Field | Replacement | Removal Target |
|-----------------|-------------|----------------|
| `FinancialSignal.metadata.description` | `signal.localized.summaryKey` + `summaryParams` | v0.3.0 |
| `Alert.title` | `alert.localized.titleKey` + `titleParams` | v0.3.0 |
| `Alert.message` | `alert.localized.messageKey` + `messageParams` | v0.3.0 |
| `AssistantNote.title` | `note.localized.titleKey` + `titleParams` | v0.3.0 |
| `AssistantNote.message` | `note.localized.messageKey` + `messageParams` | v0.3.0 |
| `AssistantDigest.headline` | `digest.headlineKey` + `headlineParams` | v0.3.0 |
| `Insight.title` | `insight.localized.titleKey` + `titleParams` | v0.3.0 |
| `Insight.message` | `insight.localized.messageKey` + `messageParams` | v0.3.0 |

**Migration path**: During the transition period (v0.2.x), API responses include both legacy prose fields and new `localized` payloads. Clients should migrate to consuming `localized` fields and performing client-side interpolation using their translation layer.

**Response header**: Endpoints serving deprecated fields include the header `X-Deprecated-Fields: description,title,message,headline` to signal the deprecation to API consumers.

### Updated Signal Response Shape (v0.2.0)

```json
{
  "signals": [
    {
      "id": "userId:SIGNAL_KEY",
      "userId": "uuid",
      "key": "SPEND_SPIKE",
      "value": 45.2,
      "severity": "WARNING",
      "trend": "UP",
      "confidence": 0.85,
      "metadata": {
        "description": "(deprecated) Localized human-readable description",
        "explainability": {
          "formula": "(thisWeek - avgWeek) / avgWeek * 100",
          "inputs": { "thisWeek": 2400, "avgWeek": 1650, "changePct": 45.2 },
          "thresholdContext": "Exceeded 30% spike threshold",
          "reasoningChain": ["reasoning.spend_spike.above_average"],
          "sourceEntities": ["category-uuid"]
        }
      },
      "localized": {
        "summaryKey": "signals.spend_spike.summary",
        "summaryParams": { "categoryName": "Marketing", "changePct": 45.2 },
        "explanationKey": "signals.spend_spike.explanation",
        "explanationParams": { "currentAmount": 2400, "baselineAvg": 1650, "changePct": 45.2 },
        "reasoningKeys": ["reasoning.spend_spike.above_average"],
        "reasoningParams": [{ "changePct": 45.2, "threshold": 30 }]
      },
      "status": "NEW",
      "snoozedUntil": null,
      "resolutionNotes": null,
      "ttlCategory": "dashboard",
      "generatedAt": "2026-05-15T10:00:00.000Z",
      "expiresAt": null
    }
  ]
}
```

---

## Stabilization Requirements

1. All signals MUST include `metadata.explainability` with at minimum `formula` and `reasoningChain`
2. `metadata.description` MUST be populated via `buildMessage()` localization (deprecated — use `localized.summaryKey` instead)
3. Filtering MUST be deterministic — same params → same results
4. Currency formatting in `metadata.description` MUST use user's currency preference (deprecated — clients handle formatting via `localized.summaryParams`)
5. Signal values MUST be consistent with dashboard metrics for the same time window
6. All signals MUST include `localized` payload with valid keys from the central `LOCALIZATION_KEYS` registry
7. All `localized` param values MUST be raw numbers or short identifier strings — no pre-formatted values
