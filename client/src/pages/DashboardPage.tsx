import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowDownRight,
  ArrowUpRight,
  Percent,
  Receipt,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useDashboardInsights, useDashboardMetrics } from '@/features/dashboard/useDashboard';
import type { DashboardRange } from '@/features/dashboard/dashboard.api';
import { InsightCard } from '@/features/dashboard/InsightCard';
import { StatCard } from '@/features/dashboard/StatCard';
import { BreakdownCard } from '@/features/dashboard/BreakdownCard';
import { WarningBanner } from '@/features/dashboard/WarningBanner';
import { MoneyLeakCard } from '@/features/dashboard/MoneyLeakCard';
import { ForecastCard } from '@/features/dashboard/ForecastCard';
import { WeeklySummaryCard } from '@/features/dashboard/WeeklySummaryCard';
import { StaleDataReminder } from '@/features/dashboard/StaleDataReminder';
import { ExpenseTrendChart } from '@/features/dashboard/ExpenseTrendChart';
import { ExpenseDonutChart } from '@/features/dashboard/ExpenseDonutChart';
import { NotificationBanner } from '@/features/alerts/NotificationBanner';
import { MODE_CONFIG } from '@/features/dashboard/mode-config';
import { useT } from '@/lib/i18n';
import { cn, formatCurrency } from '@/lib/utils';
import { useTransactions } from '@/features/transactions/useTransactions';
import { useCurrentUser } from '@/features/auth/useAuth';
import { Skeleton } from '@/components/Skeleton';
import type { Insight, TransactionType } from '@/types/domain';

const RANGES: DashboardRange[] = ['this_month', 'last_month', 'last_30_days', 'all'];

const STAT_ICON: Record<string, LucideIcon> = {
  income: ArrowUpRight,
  expense: ArrowDownRight,
  profit: Wallet,
  margin: Percent,
  count: Receipt,
};

export const DashboardPage = () => {
  const t = useT();
  const navigate = useNavigate();
  const { openQuickAdd } = useOutletContext<{
    openQuickAdd: (initialType?: TransactionType) => void;
  }>();
  const [range, setRange] = useState<DashboardRange>('this_month');
  const { data: user } = useCurrentUser();
  const metrics = useDashboardMetrics(range);
  const insights = useDashboardInsights(range);
  const recent = useTransactions({ limit: 6 });

  const mode = metrics.data?.userMode ?? user?.userMode ?? 'FREELANCER';
  const cfg = MODE_CONFIG[mode];

  const handleInsightAction = (i: Insight) => {
    if (i.action?.type === 'filter' && i.action.payload.categoryId) {
      const params = new URLSearchParams();
      params.set('categoryId', i.action.payload.categoryId);
      if (i.action.payload.type) params.set('type', i.action.payload.type);
      navigate(`/app/transactions?${params.toString()}`);
    }
  };

  const goToCategory = (categoryId: string, type: 'INCOME' | 'EXPENSE') => {
    const params = new URLSearchParams({ categoryId, type });
    navigate(`/app/transactions?${params.toString()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-ink-muted mt-1">
            {user?.name ? `${t('dashboard.greeting')} ${user.name} — ` : ''}
            {t(cfg.headlineKey)}
          </p>
        </div>

        <div
          role="tablist"
          aria-label={t('dashboard.range.label')}
          className="inline-flex p-1 rounded-xl bg-surface-high"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 ease-quintessential focus-ring',
                range === r
                  ? 'bg-surface-lowest text-ink shadow-ambient'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {t(`dashboard.range.${r}`)}
            </button>
          ))}
        </div>
      </header>

      <NotificationBanner />

      <StaleDataReminder onAdd={() => openQuickAdd('EXPENSE')} />

      {metrics.data?.warnings && <WarningBanner warnings={metrics.data.warnings} />}

      <InsightCard
        insights={insights.data}
        loading={insights.isLoading}
        onAction={handleInsightAction}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cfg.primaryStats.map((statId) => {
          const Icon = STAT_ICON[statId];
          if (statId === 'income') {
            return (
              <StatCard
                key="income"
                label={t('dashboard.totalIncome')}
                value={metrics.data?.totals.income ?? 0}
                icon={Icon}
                tone="positive"
                loading={metrics.isLoading}
                change={metrics.data?.changes.income}
              />
            );
          }
          if (statId === 'expense') {
            return (
              <StatCard
                key="expense"
                label={t('dashboard.totalExpense')}
                value={metrics.data?.totals.expense ?? 0}
                icon={Icon}
                tone="negative"
                loading={metrics.isLoading}
                change={metrics.data?.changes.expense}
              />
            );
          }
          if (statId === 'profit') {
            const v = metrics.data?.totals.profit ?? 0;
            return (
              <StatCard
                key="profit"
                label={t('dashboard.netProfit')}
                value={v}
                icon={Icon}
                tone={v > 0 ? 'positive' : v < 0 ? 'negative' : 'default'}
                loading={metrics.isLoading}
                change={metrics.data?.changes.profit}
              />
            );
          }
          if (statId === 'margin') {
            return (
              <StatCard
                key="margin"
                label={t('dashboard.margin')}
                value={metrics.data?.totals.marginPct ?? 0}
                format={(n) => `${n}%`}
                icon={Icon}
                tone="default"
                loading={metrics.isLoading}
              />
            );
          }
          return (
            <div key="count" className="card flex flex-col gap-4 hover:shadow-ambient transition-all duration-300 ease-quintessential hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="stat-label">{t('dashboard.txnCount')}</span>
                <span
                  aria-hidden
                  className="h-9 w-9 rounded-xl bg-surface-high text-ink-muted flex items-center justify-center"
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>
              </div>
              {metrics.isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="stat-value tabular-nums">
                  {metrics.data?.transactionCount ?? 0}
                </div>
              )}
              <p className="text-xs text-ink-muted">{metrics.data?.range.label}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <MoneyLeakCard range={range} />
        <ForecastCard range={range} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ExpenseTrendChart />
        <ExpenseDonutChart range={range} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {cfg.showExpenseBreakdown && (
          <BreakdownCard
            title={t('dashboard.biggestExpense')}
            data={metrics.data?.breakdown.biggestExpense}
            loading={metrics.isLoading}
            emptyText={t('dashboard.breakdown.empty')}
            tone="negative"
            viewLabel={t('common.view')}
            onView={(id) => goToCategory(id, 'EXPENSE')}
          />
        )}
        {cfg.showIncomeBreakdown && (
          <BreakdownCard
            title={t('dashboard.biggestIncome')}
            data={metrics.data?.breakdown.biggestIncome}
            loading={metrics.isLoading}
            emptyText={t('dashboard.breakdown.empty')}
            tone="positive"
            viewLabel={t('common.view')}
            onView={(id) => goToCategory(id, 'INCOME')}
          />
        )}
        <WeeklySummaryCard />
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {t('dashboard.recent')}
          </h2>
        </div>
        {recent.isLoading ? (
          <div className="space-y-3" aria-busy>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recent.data?.items.length === 0 ? (
          <p className="text-sm text-ink-muted py-6 text-center">{t('dashboard.recent.empty')}</p>
        ) : (
          <ul className="divide-y divide-outline/30">
            {recent.data?.items.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: tx.category.color ? `${tx.category.color}22` : undefined }}
                  >
                    {tx.type === 'INCOME' ? (
                      <ArrowUpRight size={16} className="text-secondary" />
                    ) : (
                      <ArrowDownRight size={16} className="text-danger" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description || tx.category.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {tx.category.name} · {format(new Date(tx.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums shrink-0',
                    tx.type === 'INCOME' ? 'text-secondary' : 'text-danger',
                  )}
                >
                  {tx.type === 'INCOME' ? '+' : '−'}
                  {formatCurrency(Number(tx.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
