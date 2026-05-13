import { useCallback } from 'react';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { useSignalByKeyQuery, useUpdateSignalStatusMutation } from '../hooks/useSignalsQuery';
import { X, Check, Search, BellOff, ArrowRight } from 'lucide-react';
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

export const SignalWorkspacePanel = () => {
  const t = useT();
  const { isRtl } = useLocale();
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

  // Extract reasoning from signal metadata
  const reasoningChain: string[] = metadata?.explainability?.reasoningChain || [];
  const description =
    metadata?.description ||
    metadata?.explainability?.thresholdContext ||
    t('signal.defaultExplanation');
  const actionLabel = metadata?.action || t('signal.workspace.reviewTransactions');
  const actionRoute = metadata?.payload?.route || '/app/transactions';

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent size="md" hideClose={false}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-ink-muted">
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
                {metadata?.title || signal.key.replace(/_/g, ' ')}
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
                <section className="mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                    {t('signal.workspace.whyTitle')}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-ink">
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
              <div className="text-xs text-ink-muted">
                {t('signal.workspace.confidence')}: {Math.round(signal.confidence * 100)}%
              </div>
            </DialogBody>

            {/* Sticky footer — actions */}
            <DialogFooter className="flex-col gap-3 items-stretch">
              <Button
                className="w-full justify-between bg-brand-primary text-white hover:bg-brand-primary/90 h-11 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                onClick={() => {
                  navigate(actionRoute);
                  closeWorkspace();
                }}
              >
                {actionLabel}
                <ArrowRight size={16} className="rtl:rotate-180" aria-hidden="true" />
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 text-secondary border-secondary/30 hover:bg-secondary/10 focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  <Check size={16} aria-hidden="true" />
                  {t('signal.workspace.resolve')}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={() => handleUpdateStatus('INVESTIGATING')}
                >
                  <Search size={16} aria-hidden="true" />
                  {t('signal.workspace.investigate')}
                </Button>
                <Button
                  variant="tertiary"
                  size="sm"
                  className="text-ink-muted focus-visible:ring-2 focus-visible:ring-offset-2"
                  title={t('signal.workspace.snooze')}
                  aria-label={t('signal.workspace.snooze')}
                  onClick={() => handleUpdateStatus('SNOOZED')}
                >
                  <BellOff size={18} aria-hidden="true" />
                  <span className="sr-only">{t('signal.workspace.snooze')}</span>
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
