import { ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { cn } from '@/lib/utils';

interface SignalCardProps {
  signal: PrioritySignalViewModel;
}

/**
 * SignalCard — operational signal summary.
 * Each card answers: what changed, why it matters, what to do next.
 * Calm, scannable, actionable.
 */
export const SignalCard = ({ signal }: SignalCardProps) => {
  const t = useT();
  const { openWorkspace } = useSignalWorkspace();

  return (
    <button
      type="button"
      onClick={() => openWorkspace(signal.key)}
      className={cn(
        'group flex flex-col text-start w-full bg-surface rounded-xl border border-outline/20 p-4',
        'transition-all duration-150 ease-out',
        'hover:border-outline/40 hover:shadow-sm',
        'focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        'active:scale-[0.99]',
      )}
    >
      {/* What changed */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display text-sm font-semibold text-ink leading-snug line-clamp-2 break-words group-hover:text-brand-primary transition-colors">
          {signal.title}
        </h3>
        <SignalSeverityBadge severity={signal.severity} />
      </div>

      {/* Why it matters */}
      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 break-words mb-3">
        {signal.explanation}
      </p>

      {/* Metric + action */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-outline/10">
        {signal.formattedValue && (
          <span className="text-base font-semibold tabular-nums text-ink" dir="ltr">
            {signal.formattedValue}
          </span>
        )}
        <span className="ms-auto inline-flex items-center gap-1 text-xs font-medium text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity">
          {t('signal.card.reviewCta')}
          <ArrowRight size={12} className="rtl:rotate-180" aria-hidden />
        </span>
      </div>
    </button>
  );
};
