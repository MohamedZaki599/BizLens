import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignalWorkspace } from '../hooks/useSignalWorkspace';
import { useSignalByKeyQuery, useUpdateSignalStatusMutation } from '../hooks/useSignalsQuery';
import { X, Check, Search, BellOff, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { SignalSeverityBadge } from './SignalSeverityBadge';
import { SignalLifecycleBadge } from './SignalLifecycleBadge';
import { SignalTrendSparkline } from './SignalTrendSparkline';
import { useT, useLocale } from '@/lib/i18n';
import { AssistantPromptSuggestions } from '@/features/onboarding';

export const SignalWorkspacePanel = () => {
  const t = useT();
  const { isRtl } = useLocale();
  const { isOpen, activeSignalKey, closeWorkspace } = useSignalWorkspace();
  const { data: signal, isLoading } = useSignalByKeyQuery(activeSignalKey || '');
  const { mutate: updateStatus } = useUpdateSignalStatusMutation();

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
      if (status === 'RESOLVED') closeWorkspace();
    }
  };

  // RTL: panel slides from the start edge (right in RTL, left in LTR... wait, drawers usually open from the end edge)
  // Actually for a detail panel we open from the inline-end side.
  const slideFrom = isRtl ? '-100%' : '100%';

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
            className="fixed inset-y-0 end-0 z-50 w-full max-w-md bg-surface shadow-2xl border-s border-outline/30 flex flex-col"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-ink-muted">{t('signal.workspace.loading')}</div>
            ) : signal ? (
              <>
                <div className="flex items-center justify-between p-6 border-b border-outline/30">
                  <div className="flex items-center gap-3">
                    <SignalSeverityBadge severity={signal.severity} />
                    <SignalLifecycleBadge status={(signal as any).status || 'NEW'} />
                  </div>
                  <Button variant="tertiary" size="sm" onClick={closeWorkspace} className="rounded-full p-2" aria-label={t('common.close')}>
                    <X size={20} />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <section>
                    <h2 className="text-2xl font-display font-semibold text-ink mb-2">
                      {signal.key.replace(/_/g, ' ')}
                    </h2>
                    <div className="flex items-center gap-3 mb-4">
                      <SignalTrendSparkline trend={signal.trend} />
                      <span className="text-sm text-ink-muted">
                        {t('signal.workspace.confidence')}: {Math.round(signal.confidence * 100)}%
                      </span>
                    </div>
                    {signal.value && (
                      <div className="text-3xl font-bold tabular-nums text-ink mb-4">
                        ${signal.value.toLocaleString()}
                      </div>
                    )}
                    <p className="text-ink-muted leading-relaxed">
                      {signal.metadata?.description || t('signal.defaultExplanation')}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold uppercase text-ink-muted mb-3">{t('signal.workspace.whyTitle')}</h3>
                    <div className="p-4 bg-surface-lowest rounded-xl border border-outline/50">
                      <ul className="space-y-2 text-sm text-ink list-disc ps-4">
                        <li>Recent spike in category spending</li>
                        <li>Historical baseline exceeded by 15%</li>
                        <li>Correlated with recurring vendor increase</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold uppercase text-ink-muted mb-3">{t('signal.workspace.actionsTitle')}</h3>
                    <div className="space-y-3">
                      <Button className="w-full justify-between bg-brand-primary text-white hover:bg-brand-primary/90 h-11">
                        {signal.metadata?.action || t('signal.workspace.reviewTransactions')}
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </Button>
                      <Button variant="secondary" className="w-full justify-between h-11">
                        {t('signal.workspace.adjustThreshold')}
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </Button>
                    </div>
                  </section>
                  
                  <section>
                    <div className="p-5 bg-gradient-to-br from-primary-container/10 to-transparent border border-primary-container/20 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg bg-primary-container/15 flex items-center justify-center text-primary-container">
                          <Sparkles size={14} />
                        </div>
                        <h3 className="text-sm font-semibold text-ink">
                          {t('signal.workspace.aiGuide')}
                        </h3>
                      </div>
                      <p className="text-xs text-ink-muted leading-relaxed mb-4">
                        {t('signal.workspace.aiDescription')}
                      </p>
                      <AssistantPromptSuggestions 
                        onSelect={(prompt) => console.log('Assistant prompt:', prompt)}
                        className="mt-2"
                      />
                    </div>
                  </section>
                </div>

                <div className="p-6 border-t border-outline/30 bg-surface-lowest flex items-center gap-3">
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
