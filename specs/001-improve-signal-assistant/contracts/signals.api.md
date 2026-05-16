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

## Stabilization Requirements

1. All signals MUST include `metadata.explainability` with at minimum `formula` and `reasoningChain`
2. `metadata.description` MUST be populated via `buildMessage()` localization
3. Filtering MUST be deterministic — same params → same results
4. Currency formatting in `metadata.description` MUST use user's currency preference
5. Signal values MUST be consistent with dashboard metrics for the same time window
