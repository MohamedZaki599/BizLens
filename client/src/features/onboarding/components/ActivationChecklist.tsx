import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Database, Sparkles, Eye, Zap, X } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useOnboardingStore, useActivationProgress, type ActivationMilestone } from '../store/onboarding-store';

const MILESTONE_CONFIG: {
  id: ActivationMilestone;
  icon: typeof Database;
  colorDone: string;
}[] = [
  { id: 'data_connected', icon: Database, colorDone: 'text-secondary' },
  { id: 'first_signal', icon: Sparkles, colorDone: 'text-primary-container' },
  { id: 'signal_reviewed', icon: Eye, colorDone: 'text-primary' },
  { id: 'first_action', icon: Zap, colorDone: 'text-secondary' },
];

export const ActivationChecklist = () => {
  const t = useT();
  const { completed, total, percentage } = useActivationProgress();
  const milestones = useOnboardingStore((s) => s.milestones);
  const showChecklist = useOnboardingStore((s) => s.showChecklist);
  const [collapsed, setCollapsed] = useState(false);

  // Stable callback — avoids selecting a function from the store which
  // can create referential instability and infinite-render loops.
  const handleDismiss = useCallback(() => {
    useOnboardingStore.getState().dismissChecklist();
  }, []);

  // Don't render if all milestones are done or user dismissed
  if (!showChecklist || completed === total) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0">
            <Sparkles size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink truncate">
              {t('activation.title')}
            </h3>
            <p className="text-xs text-ink-muted">
              {completed} / {total} {t('activation.completed')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="h-8 w-8 rounded-lg hover:bg-surface-high flex items-center justify-center text-ink-muted transition-colors focus-ring"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={handleDismiss}
            className="h-8 w-8 rounded-lg hover:bg-surface-high flex items-center justify-center text-ink-muted transition-colors focus-ring"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-surface-high overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      {/* Milestone list */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-1">
              {MILESTONE_CONFIG.map(({ id, icon: Icon, colorDone }) => {
                const done = milestones[id];
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors duration-200',
                      done ? 'bg-surface-low/50' : 'bg-transparent',
                    )}
                  >
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      done
                        ? `bg-surface-high ${colorDone}`
                        : 'bg-surface-high text-ink-muted',
                    )}>
                      {done ? <Check size={16} strokeWidth={2} /> : <Icon size={16} strokeWidth={1.5} />}
                    </div>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-sm font-medium transition-colors',
                        done ? 'text-ink/60 line-through' : 'text-ink',
                      )}>
                        {t(`activation.milestone.${id}`)}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {t(`activation.milestone.${id}.hint`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
