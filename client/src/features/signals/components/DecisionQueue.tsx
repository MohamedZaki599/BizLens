import { useNavigate } from 'react-router-dom';
import { useSignalsQuery } from '../hooks/useSignalsQuery';
import { SignalCard } from './SignalCard';
import { useT } from '@/lib/i18n';
import type { PrioritySignalViewModel } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';
import { NoSignalsEmpty } from '@/features/onboarding';
import { Button } from '@/components/Button';

const MAX_VISIBLE = 3;

/** Group recurring expense signals into a single summary signal */
function groupAndPrioritize(signals: PrioritySignalViewModel[]): PrioritySignalViewModel[] {
  const sevMap = { CRITICAL: 3, WARNING: 2, INFO: 1, NONE: 0 };
  const sorted = [...signals].sort((a, b) => sevMap[b.severity] - sevMap[a.severity]);

  // Identify recurring expense signals (key contains RECURRING or SUBSCRIPTION)
  const recurringKeys = new Set(['RECURRING_EXPENSE', 'SUBSCRIPTION_DETECTED', 'RECURRING_CHARGE']);
  const recurring = sorted.filter(s => recurringKeys.has(s.key) || s.key.includes('RECURRING'));
  const nonRecurring = sorted.filter(s => !recurringKeys.has(s.key) && !s.key.includes('RECURRING'));

  // If multiple recurring signals exist, cluster them into one summary
  if (recurring.length > 1) {
    const highest = recurring[0];
    const grouped: PrioritySignalViewModel = {
      ...highest,
      id: 'grouped-recurring',
      title: `${recurring.length} recurring expense signals`,
      explanation: `${recurring.length} recurring charges detected across your subscriptions. Review to identify unnecessary spend.`,
      recommendedAction: highest.recommendedAction,
    };
    return [...nonRecurring.slice(0, MAX_VISIBLE - 1), grouped].slice(0, MAX_VISIBLE);
  }

  // Similarly, group category anomalies
  const anomalyKeys = ['CATEGORY_ANOMALY', 'EXPENSE_SPIKE', 'SPEND_SPIKE'];
  const anomalies = nonRecurring.filter(s => anomalyKeys.some(k => s.key.includes(k)));
  const others = nonRecurring.filter(s => !anomalyKeys.some(k => s.key.includes(k)));

  if (anomalies.length > 2) {
    const highest = anomalies[0];
    const grouped: PrioritySignalViewModel = {
      ...highest,
      id: 'grouped-anomalies',
      title: `${anomalies.length} expense anomalies`,
      explanation: `Detected spending anomalies across ${anomalies.length} categories. The most critical requires immediate review.`,
      recommendedAction: highest.recommendedAction,
    };
    return [...others, grouped].sort((a, b) => sevMap[b.severity] - sevMap[a.severity]).slice(0, MAX_VISIBLE);
  }

  return sorted.slice(0, MAX_VISIBLE);
}

export const DecisionQueue = () => {
  const t = useT();
  const navigate = useNavigate();
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
    title: s.metadata?.title || s.key.replace(/_/g, ' '),
    explanation: s.metadata?.description || t('signal.defaultExplanation'),
    recommendedAction: s.metadata?.action || t('signal.defaultAction'),
    freshness: 'fresh' as const,
    isStale: false,
    generatedAt: new Date(s.generatedAt),
  }));

  const visible = groupAndPrioritize(prioritySignals);
  const totalCount = signals.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink font-display">{t('signal.queue.title')}</h2>
          <p className="text-sm text-ink-muted mt-0.5">{t('signal.queue.subtitle')}</p>
        </div>
      </div>

      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>

          {totalCount > MAX_VISIBLE && (
            <div className="flex justify-center pt-2">
              <Button
                variant="tertiary"
                onClick={() => navigate('/app/assistant')}
                className="text-sm font-medium text-brand-primary hover:text-brand-primary/80"
              >
                {t('signal.queue.viewAll')}
                <ArrowRight size={16} className="rtl:rotate-180" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <NoSignalsEmpty />
      )}
    </div>
  );
};
