import { ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { Button } from '@/components/Button';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';

interface SignalCardProps {
  signal: PrioritySignalViewModel;
}

export const SignalCard = ({ signal }: SignalCardProps) => {
  const t = useT();
  const { openWorkspace } = useSignalWorkspace();

  const handleOpenWorkspace = () => {
    openWorkspace(signal.key);
  };

  return (
    <div
      className="group flex flex-col bg-surface rounded-2xl border border-outline/30 p-5 shadow-sm transition-all hover:shadow-ambient hover:border-outline focus-within:ring-2 focus-within:ring-brand-primary/20"
    >
      {/* Header: severity only — no lifecycle/confidence/freshness clutter */}
      <div className="mb-3">
        <SignalSeverityBadge severity={signal.severity} />
      </div>

      {/* Content — clickable area */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={handleOpenWorkspace}>
        <h3 className="font-display text-base font-semibold tracking-tight text-ink mb-1.5 line-clamp-2 break-words group-hover:text-brand-primary transition-colors">
          {signal.title}
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 break-words">
          {signal.explanation}
        </p>

        {signal.formattedValue && (
          <div className="mt-3 text-xl font-bold tabular-nums text-ink truncate" dir="ltr">
            {signal.formattedValue}
          </div>
        )}
      </div>

      {/* Action footer — clean single CTA */}
      <div className="mt-4 pt-3 border-t border-outline/20">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-ink-muted truncate flex-1 min-w-0">
            {signal.recommendedAction}
          </span>
          <Button
            onClick={handleOpenWorkspace}
            className="shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-lg px-3 h-8 min-h-[44px] min-w-[44px] text-sm focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            {t('signal.card.reviewCta')}
            <ArrowRight className="rtl:rotate-180" size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
