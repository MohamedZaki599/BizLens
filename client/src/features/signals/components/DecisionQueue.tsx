import { useNavigate } from 'react-router-dom';
import { useSignalsQuery } from '../hooks/useSignalsQuery';
import { SignalCard } from './SignalCard';
import { useT, useTi, arPlural } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { useFormatCurrency } from '@/lib/format';
import type { PrioritySignalViewModel } from '../types';
import { Loader2, ArrowRight } from 'lucide-react';
import { NoSignalsEmpty } from '@/features/onboarding';
import { Button } from '@/components/Button';
import { resolveSignalTitle, resolveSignalExplanation } from '../utils/resolveLocalized';

const MAX_VISIBLE = 3;

/** Group recurring expense signals into a single summary signal */
function groupAndPrioritize(
  signals: PrioritySignalViewModel[],
  ti: (key: string, vars: Record<string, string | number>) => string,
  language: 'en' | 'ar',
): PrioritySignalViewModel[] {
  const sevMap = { CRITICAL: 3, WARNING: 2, INFO: 1, NONE: 0 };
  const sorted = [...signals].sort((a, b) => sevMap[b.severity] - sevMap[a.severity]);

  const recurringKeys = new Set(['RECURRING_EXPENSE', 'SUBSCRIPTION_DETECTED', 'RECURRING_CHARGE']);
  const recurring = sorted.filter(s => recurringKeys.has(s.key) || s.key.includes('RECURRING'));
  const nonRecurring = sorted.filter(s => !recurringKeys.has(s.key) && !s.key.includes('RECURRING'));

  if (recurring.length > 1) {
    const highest = recurring[0];
    const recurringTitle = language === 'ar'
      ? arPlural(recurring.length, {
          one: 'إشارة مصروف متكرر',
          two: 'إشارتا مصروف متكرر',
          few: 'إشارات مصروفات متكررة',
          many: 'إشارة لمصروفات متكررة',
        })
      : ti('signal.grouped.recurring.title', { count: recurring.length });
    const grouped: PrioritySignalViewModel = {
      ...highest,
      id: 'grouped-recurring',
      title: recurringTitle,
      explanation: ti('signal.grouped.recurring.explanation', { count: recurring.length }),
      recommendedAction: highest.recommendedAction,
    };
    return [...nonRecurring.slice(0, MAX_VISIBLE - 1), grouped].slice(0, MAX_VISIBLE);
  }

  const anomalyKeys = ['CATEGORY_ANOMALY', 'EXPENSE_SPIKE', 'SPEND_SPIKE'];
  const anomalies = nonRecurring.filter(s => anomalyKeys.some(k => s.key.includes(k)));
  const others = nonRecurring.filter(s => !anomalyKeys.some(k => s.key.includes(k)));

  if (anomalies.length > 2) {
    const highest = anomalies[0];
    const anomaliesTitle = language === 'ar'
      ? arPlural(anomalies.length, {
          one: 'انحراف في المصروفات',
          two: 'انحرافان في المصروفات',
          few: 'انحرافات في المصروفات',
          many: 'انحرافًا في المصروفات',
        })
      : ti('signal.grouped.anomalies.title', { count: anomalies.length });
    const grouped: PrioritySignalViewModel = {
      ...highest,
      id: 'grouped-anomalies',
      title: anomaliesTitle,
      explanation: ti('signal.grouped.anomalies.explanation', { count: anomalies.length }),
      recommendedAction: highest.recommendedAction,
    };
    return [...others, grouped].sort((a, b) => sevMap[b.severity] - sevMap[a.severity]).slice(0, MAX_VISIBLE);
  }

  return sorted.slice(0, MAX_VISIBLE);
}

export const DecisionQueue = () => {
  const t = useT();
  const ti = useTi();
  const navigate = useNavigate();
  const language = useUiStore((s) => s.language);
  const { data: signals, isLoading, isError } = useSignalsQuery('priority');
  const formatCurrency = useFormatCurrency();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-ink-muted">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-brand-primary" />
        <p className="text-sm">{t('signal.queue.loading')}</p>
      </div>
    );
  }

  if (isError || !signals) {
    return (
      <div className="p-5 bg-danger/5 border border-danger/15 rounded-xl text-danger text-center text-sm">
        {t('signal.queue.error')}
      </div>
    );
  }

  const prioritySignals: PrioritySignalViewModel[] = signals.map(s => ({
    ...s,
    formattedValue: s.value ? formatCurrency(Number(s.value)) : '',
    title: resolveSignalTitle(s.localized, s.metadata?.title as string | undefined, s.key),
    explanation: resolveSignalExplanation(s.localized, s.metadata?.description as string | undefined, s.key),
    recommendedAction: s.metadata?.action || t('signal.defaultAction'),
    freshness: 'fresh' as const,
    isStale: false,
    generatedAt: new Date(s.generatedAt),
  }));

  const visible = groupAndPrioritize(prioritySignals, ti, language);
  const totalCount = signals.length;

  if (visible.length === 0) {
    return <NoSignalsEmpty />;
  }

  return (
    <div className="space-y-3 rtl:space-y-4">
      {/* Attention guidance — recommended next review */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider rtl:tracking-normal text-ink-muted">
            {t('signal.queue.recommended')}
          </p>
          <h2 className="text-lg font-semibold text-ink font-display mt-0.5 rtl:mt-1">
            {t('signal.queue.title')}
          </h2>
        </div>
        {totalCount > MAX_VISIBLE && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => navigate('/app/assistant')}
            className="text-xs font-medium text-brand-primary hover:text-brand-primary/80 min-h-[44px] focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {t('signal.queue.viewAll')}
            <ArrowRight size={14} className="rtl:rotate-180" aria-hidden />
          </Button>
        )}
      </div>

      {/* Signal cards — first card is the recommended focal point */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 rtl:gap-4">
        {visible.map((signal, index) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            recommended={index === 0}
          />
        ))}
      </div>
    </div>
  );
};
