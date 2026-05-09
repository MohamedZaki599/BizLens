import { TrendingUp, Target } from 'lucide-react';
import { useForecast } from '../hooks/useDashboardQuery';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';

export const ForecastCard = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useForecast();

  if (isLoading) {
    return (
      <div className="card flex flex-col gap-3" aria-busy>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const negative = data.projected.profit < 0;

  return (
    <div className="card relative overflow-hidden flex flex-col gap-3">
      <div
        aria-hidden
        className={cn(
          'absolute -start-12 -bottom-12 h-40 w-40 rounded-full blur-3xl pointer-events-none',
          negative ? 'bg-danger/15' : 'bg-secondary/10',
        )}
      />
      <span className="stat-label inline-flex items-center gap-2">
        <Target size={12} className="text-primary" aria-hidden /> {t('widgets.forecast.title')}
      </span>

      <p className="text-sm text-ink leading-relaxed">{data.narrative}</p>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.forecast.income')}
          </p>
          <p className="font-display text-base font-semibold text-secondary tabular-nums mt-0.5">
            {formatCurrency(data.projected.income)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.forecast.expense')}
          </p>
          <p className="font-display text-base font-semibold text-danger tabular-nums mt-0.5">
            {formatCurrency(data.projected.expense)}
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
          >
            {formatCurrency(data.projected.profit)}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-ink-muted inline-flex items-center gap-1 mt-1">
        <TrendingUp size={11} aria-hidden />
        {data.remainingDays} {t('widgets.forecast.daysLeft')}
      </p>
    </div>
  );
};
