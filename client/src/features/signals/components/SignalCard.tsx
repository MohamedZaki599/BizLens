import { ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { cn } from '@/lib/utils';

/** Last-resort defense: humanize a signal key if raw localization key leaked through */
const safeTitle = (title: string, signalKey: string): string => {
  if (/^[a-z]+(\.[a-z_]+){1,3}$/.test(title)) {
    return signalKey.replace(/_/g, ' ');
  }
  return title;
};

/** If explanation is a raw localization key, suppress it entirely */
const safeExplanation = (text: string): string => {
  if (/^[a-z]+(\.[a-z_]+){1,3}$/.test(text)) return '';
  return text;
};

interface SignalCardProps {
  signal: PrioritySignalViewModel;
  /** Whether this is the top-priority recommended signal */
  recommended?: boolean;
}

/**
 * SignalCard — operational signal with priority-based visual hierarchy.
 *
 * Critical: subtle start-border accent, always-visible action
 * Normal: calm weight, hover-reveal action
 * Resolved: reduced emphasis, softer typography
 */
export const SignalCard = ({ signal, recommended = false }: SignalCardProps) => {
  const t = useT();
  const { openWorkspace } = useSignalWorkspace();

  const isCritical = signal.severity === 'CRITICAL';
  const isResolved = signal.status === 'RESOLVED' || signal.status === 'SNOOZED';

  return (
    <button
      type="button"
      onClick={() => openWorkspace(signal.key)}
      className={cn(
        'group relative flex flex-col text-start w-full rounded-xl p-4',
        'transition-all duration-150 ease-out',
        'focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        'active:scale-[0.99]',
        // Priority-based visual treatment
        isCritical && !isResolved
          ? 'bg-surface border border-outline/30 shadow-sm hover:shadow-md hover:border-outline/50'
          : isResolved
            ? 'bg-surface-high/40 border border-outline/10 opacity-75 hover:opacity-100'
            : 'bg-surface border border-outline/20 hover:border-outline/35 hover:shadow-sm',
        // Recommended signal gets subtle elevation
        recommended && !isResolved && 'ring-1 ring-brand-primary/10 shadow-sm',
      )}
    >
      {/* Critical accent border */}
      {isCritical && !isResolved && (
        <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-danger/60" aria-hidden />
      )}

      {/* What changed */}
      <div className="flex items-start justify-between gap-3 mb-2 rtl:mb-3">
        <h3 className={cn(
          'font-display text-sm font-semibold leading-snug rtl:leading-relaxed line-clamp-2 break-words transition-colors',
          isResolved
            ? 'text-ink-muted'
            : 'text-ink group-hover:text-brand-primary',
        )}>
          {safeTitle(signal.title, signal.key)}
        </h3>
        <SignalSeverityBadge severity={signal.severity} />
      </div>

      {/* Why it matters */}
      <p className={cn(
        'text-xs leading-relaxed rtl:leading-loose line-clamp-2 break-words mb-3 rtl:mb-4',
        isResolved ? 'text-ink-muted/70' : 'text-ink-muted',
      )}>
        {safeExplanation(signal.explanation)}
      </p>

      {/* Metric + action */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-outline/10">
        {signal.formattedValue && (
          <span className={cn(
            'text-base font-semibold tabular-nums',
            isResolved ? 'text-ink-muted' : 'text-ink',
          )} dir="ltr">
            {signal.formattedValue}
          </span>
        )}
        <span className={cn(
          'ms-auto inline-flex items-center gap-1.5 text-xs font-medium',
          'px-3 min-h-[36px] rounded-lg',
          'bg-primary/10 text-primary border border-primary/15',
          'transition-all duration-150',
          'group-hover:bg-primary/15 group-hover:border-primary/25',
          'group-focus-visible:bg-primary/15',
          'group-active:scale-[0.98]',
          // Critical: always visible. Others: hover-reveal
          isCritical && !isResolved ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
        )}>
          {t('signal.card.reviewCta')}
          <ArrowRight size={12} className="rtl:rotate-180" aria-hidden />
        </span>
      </div>
    </button>
  );
};
