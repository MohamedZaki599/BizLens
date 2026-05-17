import { useCallback } from 'react';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { useSignalByKeyQuery, useUpdateSignalStatusMutation } from '../hooks/useSignalsQuery';
import { Check, Search, BellOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { SignalLifecycleBadge } from './SignalLifecycleBadge';
import { useT, useLocale } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/format';
import { useOnboardingStore } from '@/features/onboarding';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/shared/ui/dialog';
import { resolveSignalTitle, resolveSignalExplanation, resolveSignalReasoning } from '../utils/resolveLocalized';

export const SignalWorkspacePanel = () => {
  const t = useT();
  const { dir } = useLocale();
  const formatCurrency = useFormatCurrency();
  const { isOpen, activeSignalKey, closeWorkspace } = useSignalWorkspace();
  const { data: signal, isLoading } = useSignalByKeyQuery(activeSignalKey || '');
  const { mutate: updateStatus } = useUpdateSignalStatusMutation();
  const completeMilestone = useOnboardingStore((s) => s.completeMilestone);
  const navigate = useNavigate();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeWorkspace();
    },
    [closeWorkspace],
  );

  const handleUpdateStatus = useCallback(
    (status: 'REVIEWED' | 'INVESTIGATING' | 'SNOOZED' | 'RESOLVED') => {
      if (activeSignalKey) {
        updateStatus({ key: activeSignalKey, payload: { status } });
        completeMilestone('first_action');
        if (status === 'RESOLVED') closeWorkspace();
      }
    },
    [activeSignalKey, updateStatus, completeMilestone, closeWorkspace],
  );

  // Mark signal as reviewed when opened
  if (isOpen && activeSignalKey) {
    completeMilestone('signal_reviewed');
  }

  interface SignalMetadata {
    title?: string;
    description?: string;
    action?: string;
    explainability?: {
      reasoningChain?: string[];
      thresholdContext?: string;
    };
    payload?: {
      route?: string;
    };
  }

  const metadata = signal?.metadata as SignalMetadata | undefined;

  // Resolve localized fields with fallback to deprecated prose
  const title = resolveSignalTitle(
    signal?.localized,
    metadata?.title,
    signal?.key || '',
  );
  const description = resolveSignalExplanation(
    signal?.localized,
    (metadata?.description || metadata?.explainability?.thresholdContext) as string | undefined,
    signal?.key || '',
  );
  const reasoningChain: string[] = resolveSignalReasoning(
    signal?.localized,
    metadata?.explainability?.reasoningChain,
  ).filter(entry => {
    // Remove unresolved localization keys that slipped through
    if (!entry || entry.trim() === '') return false;
    if (/^[a-z]+(\.[a-z_]+){1,3}$/.test(entry)) return false;
    // Remove entries with unresolved interpolation placeholders
    if (/\{[a-zA-Z_]+\}/.test(entry)) return false;
    return true;
  });
  const actionLabel = (signal?.localized as any)?.actionKey
    ? t((signal?.localized as any).actionKey) || metadata?.action || t('signal.workspace.reviewTransactions')
    : metadata?.action || t('signal.workspace.reviewTransactions');
  const actionRoute = metadata?.payload?.route || '/app/transactions';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size="md" hideClose={false} dir={dir}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-ink-muted" aria-busy>
            {t('signal.workspace.loading')}
          </div>
        ) : signal ? (
          <>
            {/* Header with badges */}
            <DialogHeader className="flex-row items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <SignalSeverityBadge severity={signal.severity} />
                <SignalLifecycleBadge status={signal.status || 'NEW'} />
              </div>
            </DialogHeader>

            {/* Title + Description (used for aria-labelledby/describedby by Radix) */}
            <div className="px-6 pb-2">
              <DialogTitle className="text-xl font-display font-semibold text-ink break-words" dir="auto">
                {title}
              </DialogTitle>
              {signal.value != null && (
                <div
                  className="text-2xl font-bold tabular-nums text-ink mt-2"
                  dir="ltr"
                >
                  {formatCurrency(Number(signal.value))}
                </div>
              )}
              <DialogDescription className="mt-2 text-sm text-ink-muted leading-relaxed break-words" dir="auto">
                {description}
              </DialogDescription>
            </div>

            {/* Scrollable body */}
            <DialogBody className="min-h-0">
              {/* Operational reasoning — only if real data exists */}
              {reasoningChain.length > 0 && (
                <section className="mb-4 rtl:mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2 rtl:mb-3">
                    {t('signal.workspace.whyTitle')}
                  </h3>
                  <ul className="space-y-1.5 rtl:space-y-2.5 text-sm text-ink">
                    {reasoningChain.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink-muted shrink-0"
                          aria-hidden="true"
                        />
                        <span className="break-words">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Confidence */}
              <div className="text-xs text-ink-muted mb-4 rtl:mb-6">
                {t('signal.workspace.confidence')}: {Math.round(signal.confidence * 100)}%
              </div>

              {/* Contextual intelligence actions — embedded, not separate */}
              <div className="flex flex-wrap gap-2 rtl:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/app/assistant?signalKey=${activeSignalKey}`);
                    closeWorkspace();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-high/80 border border-outline/15 text-xs text-ink-muted hover:text-ink hover:border-outline/30 transition-all duration-150 focus-ring min-h-[44px] max-w-full"
                >
                  <span className="truncate">{t('signal.workspace.askWhy')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/app/assistant?signalKey=${activeSignalKey}`);
                    closeWorkspace();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-high/80 border border-outline/15 text-xs text-ink-muted hover:text-ink hover:border-outline/30 transition-all duration-150 focus-ring min-h-[44px] max-w-full"
                >
                  <span className="truncate">{t('signal.workspace.explainImpact')}</span>
                </button>
              </div>
            </DialogBody>

            {/* Sticky footer — lifecycle actions */}
            <DialogFooter className="flex-col gap-3 items-stretch">
              <Button
                className="w-full justify-between bg-brand-primary text-white hover:bg-brand-primary/90 h-11 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all duration-150 min-w-0"
                onClick={() => {
                  navigate(actionRoute);
                  closeWorkspace();
                }}
              >
                <span className="truncate">{actionLabel}</span>
                <ArrowRight size={16} className="shrink-0 rtl:rotate-180" aria-hidden="true" />
              </Button>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 min-w-0 focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-150"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  <Check size={14} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{t('signal.workspace.resolve')}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 min-w-0 focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-150"
                  onClick={() => handleUpdateStatus('INVESTIGATING')}
                >
                  <Search size={14} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{t('signal.workspace.investigate')}</span>
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  className="shrink-0 text-ink-muted focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-150"
                  title={t('signal.workspace.snooze')}
                  aria-label={t('signal.workspace.snooze')}
                  onClick={() => handleUpdateStatus('SNOOZED')}
                >
                  <BellOff size={16} aria-hidden="true" />
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-ink-muted">
            {t('signal.workspace.notFound')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
