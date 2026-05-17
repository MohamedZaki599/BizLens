import { TrendingUp, Target } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';
import { useSignalsQuery } from '@/features/signals/hooks/useSignalsQuery';
import { mapSignalsToForecastVM } from '@/features/signals/adapters/signalAdapters';
import { SignalStatusBadge } from '@/components/shared/ui/signal-status-badge';

export const ForecastCard = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  
  // Refactored to consume centralized signals rather than local dashboard query
  const { data: signals, isLoading, isFetching } = useSignalsQuery('dashboard');
  
  const vm = signals ? mapSignalsToForecastVM(signals, isFetching) : null;

  if (isLoading) {
    return (
      <div className="card flex flex-col gap-3" aria-busy>
        <div className="flex justify-between items-start">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!vm) return null;

  const negative = vm.projectedProfit < 0;

  return (
    <div className="card relative overflow-hidden flex flex-col gap-3">
      <div
        aria-hidden
        className={cn(
          'absolute -start-12 -bottom-12 h-40 w-40 rounded-full blur-3xl pointer-events-none',
          negative ? 'bg-danger/15' : 'bg-secondary/10',
        )}
      />
      
      <div className="flex items-start justify-between">
        <span className="stat-label inline-flex items-center gap-2">
          <Target size={12} className="text-primary" aria-hidden /> {t('widgets.forecast.title')}
        </span>
        <SignalStatusBadge status={vm.freshness} generatedAt={vm.generatedAt} />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.forecast.income')}
          </p>
          <p className="font-display text-base font-semibold text-secondary tabular-nums mt-0.5" dir="ltr">
            {formatCurrency(vm.projectedIncome)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.forecast.expense')}
          </p>
          <p className="font-display text-base font-semibold text-danger tabular-nums mt-0.5" dir="ltr">
            {formatCurrency(vm.projectedExpense)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.forecast.profit')}
          </p>
          <p
            className={cn(
              'font-display text-base font-semibold tabular-nums mt-0.5',
              negative ? 'text-danger' : 'text-ink',
            )}
            dir="ltr"
          >
            {formatCurrency(vm.projectedProfit)}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-ink-muted inline-flex items-center gap-1 mt-1">
        <TrendingUp size={11} aria-hidden />
        {vm.remainingDays} {t('widgets.forecast.daysLeft')}
      </p>
    </div>
  );
};
