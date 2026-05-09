import { useSignalsQuery } from '../hooks/useSignalsQuery';
import { SignalCard } from './SignalCard';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { Loader2 } from 'lucide-react';
import { NoSignalsEmpty } from '@/features/onboarding';

export const DecisionQueue = () => {
  const t = useT();
  const { data: signals, isLoading, isError } = useSignalsQuery('priority');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand-primary" />
        <p>{t('signal.queue.loading')}</p>
      </div>
    );
  }

  if (isError || !signals) {
    return (
      <div className="p-6 bg-danger/5 border border-danger/20 rounded-xl text-danger text-center">
        {t('signal.queue.error')}
      </div>
    );
  }

  const prioritySignals: PrioritySignalViewModel[] = signals.map(s => ({
    ...s,
    formattedValue: s.value ? `$${s.value.toLocaleString()}` : '',
    title: s.key.replace(/_/g, ' '),
    explanation: s.metadata?.description || t('signal.defaultExplanation'),
    recommendedAction: s.metadata?.action || t('signal.defaultAction'),
    freshness: 'fresh',
    isStale: false,
    generatedAt: new Date(s.generatedAt),
  }));

  const sorted = [...prioritySignals].sort((a, b) => {
    const sevMap = { CRITICAL: 3, WARNING: 2, INFO: 1, NONE: 0 };
    return sevMap[b.severity] - sevMap[a.severity];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink font-display">{t('signal.queue.title')}</h2>
          <p className="text-sm text-ink-muted mt-1">{t('signal.queue.subtitle')}</p>
        </div>
      </div>
      
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sorted.map(signal => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      ) : (
        <NoSignalsEmpty />
      )}
    </div>
  );
};
