import { api } from '@/lib/api';
import type {
  ActivityStatus,
  Forecast,
  MoneyLeak,
  WeeklySummary,
} from '@/types/domain';
import type { DashboardRange } from './dashboard.api';

export interface ExpenseTrendMonth {
  month: string;
  income: number;
  expense: number;
}

export interface ExpenseCompositionItem {
  id: string;
  name: string;
  color: string;
  amount: number;
  share: number;
}

export interface SubscriptionItem {
  name: string;
  category: { id: string; name: string; color: string | null };
  monthlyCost: number;
  annualCost: number;
  monthsDetected: number;
  lastChargedAt: string;
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  category: { id: string; name: string; color: string | null; type: string };
  limit: number;
  used: number;
  remaining: number;
  usedPct: number;
  exceeded: boolean;
}

export const widgetsApi = {
  async forecast(range?: DashboardRange): Promise<Forecast> {
    const { data } = await api.get<Forecast>('/dashboard/forecast', { params: { range } });
    return data;
  },
  async moneyLeak(range?: DashboardRange): Promise<MoneyLeak | null> {
    const { data } = await api.get<{ leak: MoneyLeak | null }>('/dashboard/money-leak', { params: { range } });
    return data.leak;
  },
  async weeklySummary(): Promise<WeeklySummary> {
    const { data } = await api.get<WeeklySummary>('/dashboard/weekly-summary');
    return data;
  },
  async activity(): Promise<ActivityStatus> {
    const { data } = await api.get<ActivityStatus>('/dashboard/activity');
    return data;
  },
  async expenseTrend(): Promise<ExpenseTrendMonth[]> {
    const { data } = await api.get<{ months: ExpenseTrendMonth[] }>('/dashboard/expense-trend');
    return data.months;
  },
  async expenseComposition(range?: DashboardRange): Promise<ExpenseCompositionItem[]> {
    const { data } = await api.get<{ categories: ExpenseCompositionItem[] }>('/dashboard/expense-composition', { params: { range } });
    return data.categories;
  },
  async subscriptions(): Promise<{ subscriptions: SubscriptionItem[]; totalMonthly: number; totalAnnual: number }> {
    const { data } = await api.get('/dashboard/subscriptions');
    return data;
  },
  async budgets(): Promise<{ budgets: BudgetItem[] }> {
    const { data } = await api.get('/dashboard/budgets');
    return data;
  },
  async createBudget(categoryId: string, amount: number): Promise<void> {
    await api.post('/dashboard/budgets', { categoryId, amount });
  },
  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/dashboard/budgets/${id}`);
  },
  async importTransactions(transactions: Array<{ amount: number; type: 'INCOME' | 'EXPENSE'; date: string; description?: string; categoryId: string }>): Promise<{ imported: number }> {
    const { data } = await api.post('/dashboard/import', { transactions });
    return data;
  },
};
