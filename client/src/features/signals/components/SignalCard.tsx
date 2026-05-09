import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { SignalFreshnessIndicator } from './SignalFreshnessIndicator';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { SignalTrendSparkline } from './SignalTrendSparkline';
import { ContextualAssistantActions } from './ContextualAssistantActions';
import { SignalLifecycleBadge } from './SignalLifecycleBadge';
import { Button } from '@/components/Button';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { ArrowRight } from 'lucide-react';

interface SignalCardProps {
  signal: PrioritySignalViewModel;
}

export const SignalCard = ({ signal }: SignalCardProps) => {
  const t = useT();
  const { openWorkspace } = useSignalWorkspace();

  const handleOpenWorkspace = () => {
    openWorkspace(signal.key);
  };

  const aiActions = [
    { label: t('signal.card.explainImpact'), onClick: () => console.log('Explain impact', signal.key) },
    { label: t('signal.card.showRelated'), onClick: () => console.log('Show related', signal.key) },
  ];

  return (
    <div 
      className="group flex flex-col bg-surface rounded-2xl border border-outline/30 p-5 shadow-sm transition-all hover:shadow-ambient hover:border-outline focus-within:ring-2 focus-within:ring-brand-primary/20"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <SignalSeverityBadge severity={signal.severity} />
          <SignalLifecycleBadge status={signal.status} />
        </div>
        <div className="flex items-center gap-3">
          <SignalTrendSparkline trend={signal.trend} />
          <ConfidenceIndicator confidence={signal.confidence} />
          <SignalFreshnessIndicator generatedAt={signal.generatedAt} />
        </div>
      </div>
      
      <div className="flex-1 cursor-pointer" onClick={handleOpenWorkspace}>
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink mb-2 group-hover:text-brand-primary transition-colors">{signal.title}</h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-4 line-clamp-2">{signal.explanation}</p>
        
        {signal.formattedValue && (
          <div className="mb-4 text-2xl font-bold tabular-nums text-ink">
            {signal.formattedValue}
          </div>
        )}
      </div>

      <div className="mt-auto space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-lowest border border-outline/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted mb-0.5">{t('signal.card.recommended')}</span>
            <span className="text-sm font-medium text-ink">{signal.recommendedAction}</span>
          </div>
          <Button 
            onClick={handleOpenWorkspace}
            className="shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90 rounded-lg px-4 h-9"
          >
            {t('signal.card.reviewCta')}
            <ArrowRight className="rtl:rotate-180" size={16} />
          </Button>
        </div>

        <ContextualAssistantActions actions={aiActions} />
      </div>
    </div>
  );
};
