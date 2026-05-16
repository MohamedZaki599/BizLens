# API Contract: Dashboard (Stabilization)

**Base Path**: `/api/v1/dashboard`  
**Auth**: Bearer token (requireAuth middleware)

## Stabilization Focus

Dashboard endpoints must consume canonical signal values where possible, rather than independently computing metrics. This ensures consistency between what signals report and what the dashboard displays.

## GET /api/v1/dashboard/metrics

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| range | string | Yes | 'this-month', 'last-month', 'this-week', 'last-week', 'last-30', 'last-90', 'all' |

### Response (200)

```json
{
  "range": { "id": "this-month", "label": "This Month", "from": "2026-05-01", "to": "2026-05-31" },
  "userMode": "FREELANCER",
  "totals": {
    "income": 5200.00,
    "expense": 3800.00,
    "profit": 1400.00,
    "marginPct": 26.92
  },
  "changes": {
    "income": { "pct": 12.5, "delta": 580, "hasComparison": true, "direction": "up" },
    "expense": { "pct": 8.3, "delta": 290, "hasComparison": true, "direction": "up" },
    "profit": { "pct": 22.1, "delta": 254, "hasComparison": true, "direction": "up" }
  },
  "previous": { "income": 4620, "expense": 3510, "profit": 1110 },
  "breakdown": {
    "biggestExpense": { "id": "uuid", "name": "Marketing", "color": "#ef4444", "total": 1200, "share": 31.6 },
    "biggestIncome": { "id": "uuid", "name": "Client Projects", "color": "#22c55e", "total": 3500, "share": 67.3 }
  },
  "transactionCount": 47,
  "warnings": [
    { "id": "expense-spike", "severity": "warning", "message": "Spending is up 30% versus the previous period." }
  ]
}
```

### Stabilization Requirements

1. `totals` values MUST be consistent with signal engine values for the same period
2. `changes` direction MUST match signal `trend` for corresponding signal keys
3. `warnings` MUST be derived from signal severity (not independently computed)
4. All monetary values use `toSafeNumber()` — 2 decimal precision
5. Trend windows: weekly = Monday-Sunday, monthly = 1st-last day
6. Rounding: percentages rounded to 1 decimal place

## GET /api/v1/dashboard/assistant

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| signalKey | string | No | Active signal key for contextual analysis |

### Response (200)

```json
{
  "generatedAt": "2026-05-15T10:00:00.000Z",
  "headline": "Spend Spike: +45%",
  "notes": [
    {
      "id": "signal-explanation:SPEND_SPIKE",
      "kind": "signal-explanation",
      "title": "Spend Spike",
      "message": "Spend Spike is at $2,400 (+45%) this month. Marketing campaign drove the increase.",
      "metric": "+45%",
      "tone": "warning",
      "priority": "high",
      "action": {
        "label": "Review Marketing",
        "type": "filter",
        "payload": { "categoryId": "uuid", "type": "EXPENSE" }
      }
    }
  ],
  "context": {
    "userId": "uuid",
    "generatedAt": "2026-05-15T10:00:00.000Z",
    "activeSignal": {
      "key": "SPEND_SPIKE",
      "title": "spend spike",
      "summary": "Marketing spend increased 45% this week",
      "drivers": ["Marketing spend increased 45% this week", "Driven by campaign spend"],
      "metric": "$2,400",
      "trend": "UP"
    },
    "businessHealth": { "..." : "..." },
    "recentActivity": { "transactionCount": 47, "lastEntryDaysAgo": 0 }
  }
}
```

### Stabilization Requirements

1. When `signalKey` is provided, `headline` MUST reference the signal (not generic)
2. `notes[0]` MUST be the signal-explanation note when signalKey is active
3. All monetary values in notes MUST use user's currency preference
4. `context.activeSignal` MUST be populated from canonical signal engine data
5. No generic greetings or "I am an AI" language in any note
6. Every note MUST contain at least one specific data point

## Consistency Rules (Cross-Endpoint)

| Dashboard Metric | Must Match Signal |
|-----------------|-------------------|
| `totals.profit` | Sum of income signals - expense signals for same range |
| `changes.expense.direction` | `EXPENSE_GROWTH` signal trend |
| `changes.profit.direction` | `PROFIT_TREND` signal trend |
| `warnings[].message` | Derived from signal with severity ≥ warning |
| `breakdown.biggestExpense` | `TOP_EXPENSE_CATEGORY` signal metadata |
