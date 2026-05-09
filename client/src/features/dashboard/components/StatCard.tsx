import { TrendingDown, TrendingUp, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';
import { Skeleton } from '@/components/Skeleton';
import { useT } from '@/lib/i18n';
import type { ChangeResult } from '@/types/domain';
import { formatPctChange } from '@/lib/safe-math';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'positive' | 'negative';
  caption?: string;
  loading?: boolean;
  /** Period-over-period change. When provided, renders a trend chip. */
  change?: ChangeResult;
  /** Custom value formatter (defaults to currency). */
  format?: (n: number) => string;
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink',
  positive: 'text-secondary',
  negative: 'text-danger',
};

const toneIconBg: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-surface-high text-ink-muted',
  positive: 'bg-secondary/10 text-secondary',
  negative: 'bg-danger/10 text-danger',
};

const TrendChip = ({
  change,
  positiveIsGood = true,
}: {
  change: ChangeResult;
  positiveIsGood?: boolean;
}) => {
  const t = useT();
  if (!change.hasComparison) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-high text-ink-muted">
        <Minus size={10} aria-hidden />
        {t('stat.noPriorData')}
      </span>
    );
  }

  const isUp = change.direction === 'up';
  const isFlat = change.direction === 'flat';
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;

  // Map direction → semantic color: for income/profit, "up" is good; for expense, "up" is bad.
  const good = isFlat ? false : positiveIsGood ? isUp : !isUp;
  const cls = isFlat
    ? 'bg-surface-high text-ink-muted'
    : good
      ? 'bg-secondary/10 text-secondary'
      : 'bg-danger/10 text-danger';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tabular-nums',
        cls,
      )}
    >
      <Icon size={10} aria-hidden />
      {formatPctChange(change.pct)}
    </span>
  );
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'default',
  caption,
  loading,
  change,
  format,
}: StatCardProps) => {
  const formatMoney = useFormatCurrency();
  const fmt = format ?? formatMoney;
  // Expense-style cards have positiveIsGood=false (rising spend = bad).
  const positiveIsGood = tone !== 'negative';

  return (
    <div className="card flex flex-col gap-4 hover:shadow-ambient transition-all duration-300 ease-quintessential hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        <span
          aria-hidden
          className={cn('h-9 w-9 rounded-xl flex items-center justify-center', toneIconBg[tone])}
        >
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-32" />
      ) : (
        <div className={cn('stat-value tabular-nums', toneText[tone])}>{fmt(value)}</div>
      )}
      <div className="flex items-center justify-between gap-2 min-h-[20px]">
        {change ? <TrendChip change={change} positiveIsGood={positiveIsGood} /> : <span />}
        {caption && <p className="text-xs text-ink-muted truncate">{caption}</p>}
      </div>
    </div>
  );
};
