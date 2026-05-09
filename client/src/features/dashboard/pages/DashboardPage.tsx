import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboardQuery';
import type { DashboardRange } from '../types';
import { useDashboardFilter, useSetRange } from '../store/selectors';
import { useUrlSync } from '../hooks/useUrlSync';
import { WarningBanner } from '../components/WarningBanner';
import { StaleDataReminder } from '../components/StaleDataReminder';
import { ExpenseTrendChart } from '../components/ExpenseTrendChart';
import { ExpenseDonutChart } from '../components/ExpenseDonutChart';
import { NotificationBanner } from '@/features/alerts/NotificationBanner';
import { MODE_CONFIG } from '../mode-config';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';
import { useTransactions } from '@/features/transactions/useTransactions';
import { useCurrentUser } from '@/features/auth/useAuth';
import { Skeleton } from '@/components/Skeleton';
import type { TransactionType } from '@/types/domain';
import { DecisionQueue } from '@/features/signals/components/DecisionQueue';
import { ExecutiveFocusBar } from '@/features/signals/components/ExecutiveFocusBar';
import { SignalWorkspacePanel } from '@/features/signals/components/SignalWorkspacePanel';
import { useSignalsQuery } from '@/features/signals/hooks/useSignalsQuery';
import { ActivationChecklist, ActivationProgressTracker, NoDataEmpty, OperationalGuidanceCard } from '@/features/onboarding';

const RANGES: DashboardRange[] = ['this_month', 'last_month', 'last_30_days', 'all'];

export const DashboardPage = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  const { openQuickAdd } = useOutletContext<{
    openQuickAdd: (initialType?: TransactionType) => void;
  }>();
  useUrlSync();
  const range = useDashboardFilter('range');
  const setRange = useSetRange();
  const { data: user } = useCurrentUser();
  const metrics = useDashboardMetrics();
  const recent = useTransactions({ limit: 6 });
  const { data: signals } = useSignalsQuery('priority');

  const mode = metrics.data?.userMode ?? user?.userMode ?? 'FREELANCER';
  const cfg = MODE_CONFIG[mode];

  const hasNoData = metrics.data && metrics.data.totalIncome === 0 && metrics.data.totalExpenses === 0;
  const hasNoSignals = !signals || signals.length === 0;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-ink-muted mt-1">
            {user?.name ? `${t('dashboard.greeting')} ${user.name} — ` : ''}
            {t(cfg.headlineKey)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ActivationProgressTracker className="hidden md:flex" />
          
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
        </div>
      </header>

      <NotificationBanner />
      <StaleDataReminder onAdd={() => openQuickAdd('EXPENSE')} />
      {metrics.data?.warnings && <WarningBanner warnings={metrics.data.warnings} />}

      {/* Activation guidance — shown until all milestones are complete */}
      <ActivationChecklist />

      {hasNoData ? (
        <NoDataEmpty 
          onAddTransaction={() => openQuickAdd('EXPENSE')}
          onImport={() => {/* navigate to import */}}
        />
      ) : (
        <>
          {/* New Signal-Centric Decision Interface */}
          {signals && signals.length > 0 && <ExecutiveFocusBar signals={signals} />}
          
          {hasNoSignals && (
            <OperationalGuidanceCard 
              titleKey="guidance.reviewSignal.title"
              descKey="guidance.reviewSignal.desc"
              actionLabelKey="guidance.reviewSignal.action"
              onAction={() => {/* navigate or scroll to signals section if any */}}
              className="mb-8"
            />
          )}

          <DecisionQueue />
          
          <SignalWorkspacePanel />

          <section className="mt-12 mb-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink mb-4">{t('dashboard.historicalTrends')}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <ExpenseTrendChart />
              <ExpenseDonutChart />
            </div>
          </section>

          <section className="card mb-8">
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
        </>
      )}
    </div>
  );
};
