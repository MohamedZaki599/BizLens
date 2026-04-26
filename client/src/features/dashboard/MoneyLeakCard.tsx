import { Droplet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMoneyLeak } from './useWidgets';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { useFormatCurrency } from '@/lib/format';

import type { DashboardRange } from './dashboard.api';

export const MoneyLeakCard = ({ range }: { range?: DashboardRange }) => {
  const t = useT();
  const navigate = useNavigate();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useMoneyLeak(range);

  if (isLoading) {
    return (
      <div className="card flex flex-col gap-3" aria-busy>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card flex flex-col gap-3">
        <span className="stat-label inline-flex items-center gap-2">
          <Droplet size={12} aria-hidden /> {t('widgets.leak.title')}
        </span>
        <p className="text-sm text-ink-muted">{t('widgets.leak.empty')}</p>
      </div>
    );
  }

  return (
    <div className="card relative overflow-hidden flex flex-col gap-3 group">
      <div
        aria-hidden
        className="absolute -end-12 -top-12 h-40 w-40 rounded-full bg-danger/10 blur-3xl pointer-events-none"
      />
      <div className="flex items-center justify-between">
        <span className="stat-label inline-flex items-center gap-2">
          <Droplet size={12} className="text-danger" aria-hidden /> {t('widgets.leak.title')}
        </span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-danger/10 text-danger"
          aria-label={t('widgets.leak.severity')}
        >
          {t('widgets.leak.severity')}
        </span>
      </div>

      <div>
        <p className="font-display text-2xl font-semibold tracking-tight text-ink">
          {data.category.name}
        </p>
        <p className="text-sm text-ink-muted mt-1 leading-relaxed">{data.message}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.leak.extra')}
          </p>
          <p className="font-display text-lg font-semibold text-danger tabular-nums mt-0.5">
            +{formatCurrency(data.extra)}
          </p>
        </div>
        <div className="rounded-xl bg-surface-high p-3">
          <p className="text-[10px] uppercase tracking-wide text-ink-muted">
            {t('widgets.leak.annualized')}
          </p>
          <p className="font-display text-lg font-semibold text-ink tabular-nums mt-0.5">
            {formatCurrency(data.annualized)}
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const params = new URLSearchParams({
            categoryId: data.category.id,
            type: 'EXPENSE',
          });
          navigate(`/app/transactions?${params.toString()}`);
        }}
        className="self-start text-xs font-medium text-primary hover:underline mt-1 inline-flex items-center gap-1 focus-ring rounded"
      >
        {t('widgets.leak.cta')}
        <ArrowRight size={11} className="rtl:rotate-180" aria-hidden />
      </button>
    </div>
  );
};
