import { ArrowRight } from 'lucide-react';
import type { CategoryBreakdown } from '@/types/domain';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';

interface BreakdownCardProps {
  title: string;
  data: CategoryBreakdown | null | undefined;
  loading?: boolean;
  emptyText: string;
  tone?: 'positive' | 'negative' | 'neutral';
  onView?: (id: string) => void;
  viewLabel?: string;
}

const toneBar: Record<NonNullable<BreakdownCardProps['tone']>, string> = {
  positive: 'bg-secondary',
  negative: 'bg-danger',
  neutral: 'bg-primary-container',
};

export const BreakdownCard = ({
  title,
  data,
  loading,
  emptyText,
  tone = 'neutral',
  onView,
  viewLabel = 'View',
}: BreakdownCardProps) => {
  const formatCurrency = useFormatCurrency();
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="stat-label">{title}</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-2 w-full" />
        </div>
      ) : !data ? (
        <p className="text-sm text-ink-muted py-2">{emptyText}</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold tracking-tight truncate">
                {data.name}
              </p>
              <p className="text-sm text-ink-muted tabular-nums">
                {formatCurrency(data.total)} · {data.share}%
              </p>
            </div>
            {onView && (
              <button
                onClick={() => onView(data.id)}
                className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline focus-ring rounded"
              >
                {viewLabel}
                <ArrowRight size={11} className="rtl:rotate-180" aria-hidden />
              </button>
            )}
          </div>

          <div
            className="h-2 w-full rounded-full bg-surface-high overflow-hidden"
            role="progressbar"
            aria-valuenow={data.share}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${data.name} share`}
          >
            <div
              className={cn('h-full transition-all duration-700 ease-quintessential', toneBar[tone])}
              style={{
                width: `${data.share}%`,
                background: data.color ?? undefined,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};
