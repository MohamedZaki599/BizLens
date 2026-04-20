import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { Insight, InsightSeverity, InsightTone } from '@/types/domain';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/Skeleton';
import { useT } from '@/lib/i18n';

interface InsightCardProps {
  insights: Insight[] | undefined;
  loading?: boolean;
  onAction?: (insight: Insight) => void;
}

const toneIcon = (tone: InsightTone): LucideIcon => {
  switch (tone) {
    case 'positive':
      return TrendingUp;
    case 'negative':
      return TrendingDown;
    case 'warning':
      return AlertTriangle;
    default:
      return Sparkles;
  }
};

const severityBadge: Record<InsightSeverity, string> = {
  info: 'bg-white/10 text-on-primary/80',
  success: 'bg-secondary/20 text-secondary',
  warning: 'bg-amber-400/20 text-amber-200',
  critical: 'bg-danger/25 text-on-primary',
};

const severityLabelKey: Record<InsightSeverity, string> = {
  info: 'insight.severity.info',
  success: 'insight.severity.success',
  warning: 'insight.severity.warning',
  critical: 'insight.severity.critical',
};

export const InsightCard = ({ insights, loading, onAction }: InsightCardProps) => {
  const t = useT();

  if (loading) {
    return (
      <div
        aria-busy
        aria-live="polite"
        className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-primary to-primary-container"
      >
        <Skeleton className="h-3 w-24 bg-white/20" />
        <Skeleton className="h-7 w-3/4 mt-4 bg-white/20" />
        <Skeleton className="h-4 w-1/2 mt-2 bg-white/20" />
      </div>
    );
  }

  const primary = insights?.[0];
  const secondary = (insights ?? []).slice(1, 3);

  if (!primary) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-7 bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-glow">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0"
          >
            <Sparkles size={22} strokeWidth={1.6} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-on-primary/70">
              {t('dashboard.insights.label')}
            </p>
            <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight mt-1.5">
              {t('dashboard.noInsights')}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const PrimaryIcon = toneIcon(primary.tone);

  return (
    <section
      aria-label={t('dashboard.insights.label')}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-glow"
    >
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="absolute -end-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -start-10 -bottom-16 h-48 w-48 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
      />

      {/* Primary insight */}
      <div className="relative p-7 pb-6">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center shrink-0"
          >
            <PrimaryIcon size={22} strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.14em]',
                  severityBadge[primary.severity],
                )}
              >
                {t(severityLabelKey[primary.severity])}
              </span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-on-primary/70">
                {primary.title}
              </span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight mt-2 leading-snug">
              {primary.message}
            </h3>
            {primary.action && onAction && (
              <button
                onClick={() => onAction(primary)}
                className={cn(
                  'mt-4 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg',
                  'bg-white/15 hover:bg-white/25 backdrop-blur text-sm font-medium',
                  'transition-all duration-200 ease-quintessential focus-ring',
                )}
              >
                {primary.action.label}
                <ArrowRight size={14} aria-hidden className="rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary insights */}
      {secondary.length > 0 && (
        <div className="relative grid sm:grid-cols-2 gap-px bg-white/10">
          {secondary.map((i) => {
            const Icon = toneIcon(i.tone);
            return (
              <button
                key={i.id}
                onClick={() => i.action && onAction?.(i)}
                disabled={!i.action}
                className={cn(
                  'group flex items-start gap-3 p-5 text-start backdrop-blur-sm',
                  'bg-gradient-to-br from-white/5 to-transparent',
                  i.action
                    ? 'hover:bg-white/10 cursor-pointer transition-colors focus-ring'
                    : 'cursor-default',
                )}
              >
                <div
                  aria-hidden
                  className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"
                >
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-on-primary/60">
                    {i.title}
                  </p>
                  <p className="text-sm font-medium mt-1 leading-snug line-clamp-2">{i.message}</p>
                  {i.action && (
                    <p className="text-xs mt-1.5 text-on-primary/80 group-hover:text-on-primary inline-flex items-center gap-1">
                      {i.action.label}
                      <ArrowRight size={11} className="rtl:rotate-180" aria-hidden />
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
