import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { useSignalByKeyQuery, useUpdateSignalStatusMutation } from '../hooks/useSignalsQuery';
import { X, Check, Search, BellOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { SignalLifecycleBadge } from './SignalLifecycleBadge';
import { useT, useLocale } from '@/lib/i18n';
import { useOnboardingStore } from '@/features/onboarding';
import { useNavigate } from 'react-router-dom';

export const SignalWorkspacePanel = () => {
  const t = useT();
  const { isRtl } = useLocale();
  const { isOpen, activeSignalKey, closeWorkspace } = useSignalWorkspace();
  const { data: signal, isLoading } = useSignalByKeyQuery(activeSignalKey || '');
  const { mutate: updateStatus } = useUpdateSignalStatusMutation();
  const completeMilestone = useOnboardingStore((s) => s.completeMilestone);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && activeSignalKey) {
      completeMilestone('signal_reviewed');
    }
  }, [isOpen, activeSignalKey, completeMilestone]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWorkspace();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeWorkspace]);

  if (!isOpen) return null;

  const handleUpdateStatus = (status: 'REVIEWED' | 'INVESTIGATING' | 'SNOOZED' | 'RESOLVED') => {
    if (activeSignalKey) {
      updateStatus({ key: activeSignalKey, payload: { status } });
      completeMilestone('first_action');
      if (status === 'RESOLVED') closeWorkspace();
    }
  };

  const slideFrom = isRtl ? '-100%' : '100%';

  // Extract reasoning from signal metadata
  const reasoningChain: string[] = signal?.metadata?.explainability?.reasoningChain || [];
  const description = signal?.metadata?.description || signal?.metadata?.explainability?.thresholdContext || t('signal.defaultExplanation');
  const actionLabel = signal?.metadata?.action || t('signal.workspace.reviewTransactions');
  const actionRoute = signal?.metadata?.payload?.route || '/app/transactions';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWorkspace}
            className="fixed inset-0 bg-ink/20 backdrop-blur-[2px] z-40"
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 end-0 z-50 w-full max-w-md bg-surface shadow-2xl border-s border-outline/30 flex flex-col sm:max-w-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-ink-muted">{t('signal.workspace.loading')}</div>
            ) : signal ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline/30">
                  <div className="flex items-center gap-3">
                    <SignalSeverityBadge severity={signal.severity} />
                    <SignalLifecycleBadge status={(signal as any).status || 'NEW'} />
                  </div>
                  <Button variant="tertiary" size="sm" onClick={closeWorkspace} className="rounded-full p-2" aria-label={t('common.close')}>
                    <X size={20} />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Signal title + value */}
                  <section>
                    <h2 className="text-xl font-display font-semibold text-ink mb-2 break-words">
                      {signal.metadata?.title || signal.key.replace(/_/g, ' ')}
                    </h2>
                    {signal.value != null && (
                      <div className="text-2xl font-bold tabular-nums text-ink mb-3">
                        ${signal.value.toLocaleString()}
                      </div>
                    )}
                    <p className="text-sm text-ink-muted leading-relaxed break-words">
                      {description}
                    </p>
                  </section>

                  {/* Operational reasoning — only if real data exists */}
                  {reasoningChain.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                        {t('signal.workspace.whyTitle')}
                      </h3>
                      <ul className="space-y-1.5 text-sm text-ink">
                        {reasoningChain.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-ink-muted shrink-0" />
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
                </div>

                {/* Sticky footer — actions */}
                <div className="p-6 border-t border-outline/30 bg-surface-lowest flex flex-col gap-4 sticky bottom-0 z-10 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
                  <Button
                    className="w-full justify-between bg-brand-primary text-white hover:bg-brand-primary/90 h-11"
                    onClick={() => {
                      navigate(actionRoute);
                      closeWorkspace();
                    }}
                  >
                    {actionLabel}
                    <ArrowRight size={16} className="rtl:rotate-180" />
                  </Button>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1 text-secondary border-secondary/30 hover:bg-secondary/10"
                      onClick={() => handleUpdateStatus('RESOLVED')}
                    >
                      <Check size={16} /> {t('signal.workspace.resolve')}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleUpdateStatus('INVESTIGATING')}
                    >
                      <Search size={16} /> {t('signal.workspace.investigate')}
                    </Button>
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="text-ink-muted"
                      title={t('signal.workspace.snooze')}
                      onClick={() => handleUpdateStatus('SNOOZED')}
                    >
                      <BellOff size={18} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-ink-muted">{t('signal.workspace.notFound')}</div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
