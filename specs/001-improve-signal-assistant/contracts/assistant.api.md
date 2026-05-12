# Contract: Assistant API (Contextual Update)

## GET /api/v1/dashboard/assistant

Retrieves the prioritized digest for the Decision Assistant.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signalKey` | `string` | No | If provided, the response will prioritize an explanation for this specific signal. |

### Response Schema (200 OK)
```json
{
  "generatedAt": "2026-05-11T12:00:00Z",
  "headline": "...",
  "notes": [
    {
      "id": "signal-explanation:expense_spike_marketing",
      "kind": "signal-explanation",
      "title": "Expense Spike in Marketing",
      "message": "Marketing spend is up 45% ($2,400) this week, primarily due to ad platform billing.",
      "metric": "+45%",
      "tone": "warning",
      "priority": "high",
      "action": {
        "label": "Review Marketing Transactions",
        "type": "filter",
        "payload": { "categoryId": "cat_123", "type": "EXPENSE" }
      }
    },
    ...
  ]
}
```

### Error Responses
- **401 Unauthorized**: User is not authenticated.
- **404 Not Found**: If `signalKey` is provided but does not exist (fallback to generic digest).
