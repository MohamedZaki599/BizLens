export type UserMode = 'FREELANCER' | 'ECOMMERCE' | 'SERVICE_BUSINESS';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'ar';

export interface User {
  id: string;
  email: string;
  name: string | null;
  userMode: UserMode;
  language: Language;
  theme: Theme;
  currency: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string | null;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: string | number;
  type: TransactionType;
  date: string;
  description: string | null;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'type' | 'color'>;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeResult {
  pct: number;
  delta: number;
  hasComparison: boolean;
  direction: 'up' | 'down' | 'flat';
}

export interface CategoryBreakdown {
  id: string;
  name: string;
  color: string | null;
  total: number;
  share: number;
}

export interface DashboardWarning {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
}

export interface DashboardMetrics {
  range: { id: string; label: string; from: string | null; to: string | null };
  userMode: UserMode;
  totals: { income: number; expense: number; profit: number; marginPct: number };
  changes: { income: ChangeResult; expense: ChangeResult; profit: ChangeResult };
  previous: { income: number; expense: number; profit: number };
  breakdown: {
    biggestExpense: CategoryBreakdown | null;
    biggestIncome: CategoryBreakdown | null;
  };
  transactionCount: number;
  warnings: DashboardWarning[];
}

export type InsightTone = 'positive' | 'negative' | 'neutral' | 'warning';
export type InsightSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface InsightAction {
  label: string;
  type: 'navigate' | 'filter';
  payload: Record<string, string>;
}

export interface Insight {
  id: string;
  kind: string;
  title: string;
  message: string;
  tone: InsightTone;
  severity: InsightSeverity;
  metric?: string;
  action?: InsightAction;
  priority: number;
}

// ─── Alerts ───────────────────────────────────────────────────────────────

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType =
  | 'SPEND_SPIKE_CATEGORY'
  | 'EXPENSES_EXCEED_INCOME'
  | 'PROFIT_DROP'
  | 'CATEGORY_CONCENTRATION'
  | 'WEEKLY_SPEND_INCREASE'
  | 'STALE_DATA'
  | 'RECURRING_DETECTED'
  | 'FORECAST_OVERSPEND'
  | 'WEEKLY_SUMMARY';

export interface AlertActionPayload {
  label: string;
  type: 'navigate' | 'filter';
  payload: Record<string, string>;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  action: AlertActionPayload | null;
  isRead: boolean;
  createdAt: string;
  expiresAt: string | null;
}

// ─── Forecast / Money Leak / Weekly summary ───────────────────────────────

export interface Forecast {
  asOf: string;
  remainingDays: number;
  actual: { income: number; expense: number; profit: number };
  projected: { income: number; expense: number; profit: number };
  vsLastMonth: { expense: ChangeResult; profit: ChangeResult };
  narrative: string;
}

export interface MoneyLeak {
  category: { id: string; name: string; color: string | null };
  thisMonth: number;
  baselineAvg: number;
  extra: number;
  annualized: number;
  message: string;
}

export interface WeeklySummary {
  week: { from: string; to: string; label: string };
  totals: { income: number; expense: number; profit: number; count: number };
  previous: { income: number; expense: number; profit: number };
  changes: { income: ChangeResult; expense: ChangeResult; profit: ChangeResult };
}

export interface ActivityStatus {
  lastTransactionAt: string | null;
  daysSinceLastTransaction: number | null;
  transactionsTotal: number;
  isStale: boolean;
}
