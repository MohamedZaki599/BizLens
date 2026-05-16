import { useNavigate, useOutletContext } from 'react-router-dom';
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
import { useT, useFormatDate } from '@/lib/i18n';
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
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();
  const formatDate = useFormatDate();
  const { openQuickAdd } = useOutletContext<{
    openQuickAdd: (initialType?: TransactionType) => void;
  }>();
  useUrlSync();
  const range = useDashboardFilter('range');
  const setRange = useSetRange();
  const { data: user } = useCurrentUser();
  const metrics = useDashboardMetrics();
  const recent = useTransactions({ limit: 5 });
  const { data: signals } = useSignalsQuery('priority');

  const mode = metrics.data?.userMode ?? user?.userMode ?? 'FREELANCER';
  const cfg = MODE_CONFIG[mode];

  const hasNoData = metrics.data && metrics.data.totals.income === 0 && metrics.data.totals.expense === 0;
  const hasNoSignals = !signals || signals.length === 0;

  return (
    <div className="space-y-5 relative">
      {/* Header — calm, informational */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {user?.name ? `${user.name} — ` : ''}
            {t(cfg.headlineKey)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ActivationProgressTracker className="hidden md:flex" />
          
          <div
            role="tablist"
            aria-label={t('dashboard.range.label')}
            className="inline-flex flex-wrap p-0.5 rounded-lg bg-surface-high overflow-x-auto max-w-full"
          >
            {RANGES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-2.5 rounded-md text-xs font-medium transition-all duration-150 focus-ring min-h-[44px] flex items-center justify-center',
                  range === r
                    ? 'bg-surface-lowest text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {t(`dashboard.range.${r}`)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* System notifications — minimal */}
      <NotificationBanner />
      <StaleDataReminder onAdd={() => openQuickAdd('EXPENSE')} />
      {metrics.data?.warnings && <WarningBanner warnings={metrics.data.warnings} />}

      {/* Activation — shown until milestones complete */}
      <ActivationChecklist />

      {hasNoData ? (
        <NoDataEmpty 
          onAddTransaction={() => openQuickAdd('EXPENSE')}
          onImport={() => navigate('/app/import')}
        />
      ) : (
        <>
          {/* A. Operational Focus — what needs attention today */}
          {signals && signals.length > 0 && <ExecutiveFocusBar signals={signals} />}

          {/* B. Priority Signals — the decision queue */}
          <section id="priority-decision-queue">
            {hasNoSignals ? (
              <OperationalGuidanceCard 
                titleKey="guidance.reviewSignal.title"
                descKey="guidance.reviewSignal.desc"
                actionLabelKey="guidance.reviewSignal.action"
                onAction={() => navigate('/app/assistant')}
              />
            ) : (
              <DecisionQueue />
            )}
          </section>

          {/* Signal workspace modal */}
          <SignalWorkspacePanel />

          {/* C. Supporting Trends — secondary, visually receded */}
          <section className="pt-8 mt-4 border-t border-outline/10">
            <h2 className="text-sm font-medium text-ink-muted opacity-80 mb-3">{t('dashboard.historicalTrends')}</h2>
            <div className="grid gap-4 lg:grid-cols-2 opacity-90">
              <ExpenseTrendChart />
              <ExpenseDonutChart />
            </div>
          </section>

          {/* Recent transactions — tertiary */}
          <section className="pt-8 mt-4 border-t border-outline/10 opacity-90">
            <h2 className="text-sm font-medium text-ink-muted opacity-80 mb-3">
              {t('dashboard.recent')}
            </h2>
            {recent.isLoading ? (
              <div className="space-y-2" aria-busy>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recent.data?.items.length === 0 ? (
              <p className="text-xs text-ink-muted py-4 text-center">{t('dashboard.recent.empty')}</p>
            ) : (
              <ul className="divide-y divide-outline/15">
                {recent.data?.items.map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        aria-hidden
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: tx.category.color ? `${tx.category.color}15` : undefined }}
                      >
                        {tx.type === 'INCOME' ? (
                          <ArrowUpRight size={14} className="text-secondary" />
                        ) : (
                          <ArrowDownRight size={14} className="text-danger" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate text-ink">
                          {tx.description || tx.category.name}
                        </p>
                        <p className="text-[11px] text-ink-muted">
                          {tx.category.name} · {formatDate(new Date(tx.date), 'short')}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium tabular-nums shrink-0',
                        tx.type === 'INCOME' ? 'text-secondary' : 'text-ink',
                      )}
                      dir="ltr"
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
