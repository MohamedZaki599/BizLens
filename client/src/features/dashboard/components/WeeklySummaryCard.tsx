import { ArrowDownRight, ArrowUpRight, CalendarDays, Wallet } from 'lucide-react';
import { useWeeklySummary } from '../hooks/useDashboardQuery';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';
import { formatPctChange } from '@/lib/safe-math';

const Row = ({
  label,
  value,
  pct,
  hasComparison,
  positiveIsGood,
  formatCurrency,
}: {
  label: string;
  value: number;
  pct: number;
  hasComparison: boolean;
  positiveIsGood: boolean;
  formatCurrency: (value: number) => string;
}) => {
  const tone = !hasComparison
    ? 'neutral'
    : (positiveIsGood ? pct > 0 : pct < 0)
      ? 'positive'
      : pct === 0
        ? 'neutral'
        : 'negative';
  const cls =
    tone === 'positive'
      ? 'text-secondary'
      : tone === 'negative'
        ? 'text-danger'
        : 'text-ink-muted';
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold tabular-nums">{formatCurrency(value)}</span>
        <span className={cn('text-[10px] font-medium tabular-nums', cls)}>
          {hasComparison ? formatPctChange(pct) : '—'}
        </span>
      </div>
    </div>
  );
};

export const WeeklySummaryCard = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useWeeklySummary();

  if (isLoading) {
    return (
      <div className="card flex flex-col gap-3" aria-busy>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="stat-label inline-flex items-center gap-2">
          <CalendarDays size={12} className="text-primary" aria-hidden /> {t('widgets.week.title')}
        </span>
        <span className="text-[10px] text-ink-muted tabular-nums">{data.week.label}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold text-ink tabular-nums">
          {formatCurrency(data.totals.profit)}
        </span>
        <span className="text-[11px] text-ink-muted">
          {t('widgets.week.netForWeek')} · {data.totals.count} {t('widgets.week.transactions')}
        </span>
      </div>

      <div className="divide-y divide-outline/30 -my-1">
        <Row
          label={t('dashboard.totalIncome')}
          value={data.totals.income}
          pct={data.changes.income.pct}
          hasComparison={data.changes.income.hasComparison}
          positiveIsGood
          formatCurrency={formatCurrency}
        />
        <Row
          label={t('dashboard.totalExpense')}
          value={data.totals.expense}
          pct={data.changes.expense.pct}
          hasComparison={data.changes.expense.hasComparison}
          positiveIsGood={false}
          formatCurrency={formatCurrency}
        />
        <Row
          label={t('dashboard.netProfit')}
          value={data.totals.profit}
          pct={data.changes.profit.pct}
          hasComparison={data.changes.profit.hasComparison}
          positiveIsGood
          formatCurrency={formatCurrency}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-1">
        <span className="inline-flex items-center gap-1 text-[10px] text-ink-muted">
          <ArrowUpRight size={11} className="text-secondary" aria-hidden />
          {t('type.INCOME')}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-ink-muted">
          <ArrowDownRight size={11} className="text-danger" aria-hidden />
          {t('type.EXPENSE')}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-ink-muted">
          <Wallet size={11} aria-hidden />
          {t('dashboard.netProfit')}
        </span>
      </div>
    </div>
  );
};
