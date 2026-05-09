export type SignalSeverity = 'NONE' | 'INFO' | 'WARNING' | 'CRITICAL';
export type SignalTrend = 'UP' | 'DOWN' | 'FLAT' | 'UNKNOWN';
export type SignalStatus = 'NEW' | 'REVIEWED' | 'INVESTIGATING' | 'SNOOZED' | 'RESOLVED';

export interface FinancialSignalDto {
  id: string;
  userId: string;
  key: string;
  value: number;
  severity: SignalSeverity;
  trend: SignalTrend;
  confidence: number;
  metadata: Record<string, any>;
  ttlCategory: string;
  status: SignalStatus;
  snoozedUntil: string | null;
  resolutionNotes: string | null;
  generatedAt: string; // ISO date string
  expiresAt: string | null;
}

export type FreshnessStatus = 'fresh' | 'stale' | 'updating';

// Example View Models we can map DTOs to

export interface BaseSignalViewModel {
  id: string;
  key: string;
  formattedValue: string;
  severity: SignalSeverity;
  trend: SignalTrend;
  confidence: number;
  status: SignalStatus;
  snoozedUntil: string | null;
  resolutionNotes: string | null;
  generatedAt: Date;
  freshness: FreshnessStatus;
  isStale: boolean;
}

export interface MetricCardViewModel extends BaseSignalViewModel {
  label: string;
  value: number;
  caption?: string;
  change?: {
    pct: number;
    direction: 'up' | 'down' | 'flat';
    hasComparison: boolean;
  };
}

export interface ForecastViewModel {
  projectedIncome: number;
  projectedExpense: number;
  projectedProfit: number;
  remainingDays: number;
  isOverspending: boolean;
  generatedAt: Date;
  freshness: FreshnessStatus;
}

export interface PrioritySignalViewModel extends BaseSignalViewModel {
  title: string;
  explanation: string;
  recommendedAction: string;
}
