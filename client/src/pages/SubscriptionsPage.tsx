import { CreditCard, RefreshCw, Inbox, ArrowUpDown } from 'lucide-react';
import { useSubscriptions } from '@/features/dashboard/hooks/useDashboardQuery';
import { useT, useTi } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { useFormatCurrency } from '@/lib/format';

export const SubscriptionsPage = () => {
  const t = useT();
  const ti = useTi();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useSubscriptions();

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('subscriptions.title')}</h1>
        <p className="text-ink-muted mt-1">{t('subscriptions.subtitle')}</p>
      </header>

      {isLoading ? (
        <div className="space-y-3" aria-busy>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.subscriptions.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-surface-high items-center justify-center text-ink-muted mb-4">
            <Inbox size={24} />
          </div>
          <p className="text-sm text-ink-muted">{t('subscriptions.empty')}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card flex items-center gap-4">
              <span className="h-10 w-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
                <RefreshCw size={18} />
              </span>
              <div>
                <p className="stat-label">{t('subscriptions.totalMonthly')}</p>
                <p className="font-display text-2xl font-semibold text-danger tabular-nums">
                  {formatCurrency(data.totalMonthly)}
                  <span className="text-xs text-ink-muted font-normal ms-1">{t('subscriptions.perMonth')}</span>
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ArrowUpDown size={18} />
              </span>
              <div>
                <p className="stat-label">{t('subscriptions.totalAnnual')}</p>
                <p className="font-display text-2xl font-semibold text-ink tabular-nums">
                  {formatCurrency(data.totalAnnual)}
                  <span className="text-xs text-ink-muted font-normal ms-1">{t('subscriptions.perYear')}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <ul className="divide-y divide-outline/30">
              {data.subscriptions.map((sub, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: sub.category.color ? `${sub.category.color}22` : 'rgb(var(--color-surface-high))' }}
                    >
                      <CreditCard size={16} style={{ color: sub.category.color ?? undefined }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{sub.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-ink-muted">{sub.category.name}</span>
                        <span className="text-[10px] text-ink-muted">·</span>
                        <span className="text-xs text-ink-muted">
                          {ti('subscriptions.months', { count: sub.monthsDetected })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-semibold text-danger tabular-nums">
                      {formatCurrency(sub.monthlyCost)}{t('subscriptions.perMonth')}
                    </p>
                    <p className="text-xs text-ink-muted tabular-nums">
                      {formatCurrency(sub.annualCost)}{t('subscriptions.perYear')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
