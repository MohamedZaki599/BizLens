import { motion } from 'framer-motion';
import { Check, Circle, Sparkles } from 'lucide-react';
import { useTi } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useActivationProgress, useOnboardingStore, type ActivationMilestone } from '../store/onboarding-store';

interface ActivationProgressTrackerProps {
  className?: string;
}

const MILESTONES: ActivationMilestone[] = [
  'data_connected',
  'first_signal',
  'signal_reviewed',
  'first_action',
];

/**
 * ActivationProgressTracker — a compact, horizontal progress tracker
 * for the header or sticky bar. Unlike the full ActivationChecklist,
 * this is a minimal inline indicator with a segmented progress bar
 * and a completion counter.
 */
export const ActivationProgressTracker = ({ className }: ActivationProgressTrackerProps) => {
  const ti = useTi();
  const { completed, total } = useActivationProgress();
  const milestones = useOnboardingStore((s) => s.milestones);
  const showChecklist = useOnboardingStore((s) => s.showChecklist);

  // Hide when all milestones are done or checklist is dismissed
  if (!showChecklist || completed === total) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-xl',
        'bg-surface-lowest border border-outline/10',
        className,
      )}
    >
      {/* Icon */}
      <div className="h-7 w-7 rounded-lg bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0">
        <Sparkles size={14} strokeWidth={1.5} />
      </div>

      {/* Label + counter */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink truncate">
          {ti('activation.tracker.label', { completed, total })}
        </p>

        {/* Segmented progress bar */}
        <div className="flex items-center gap-1 mt-1.5">
          {MILESTONES.map((id) => (
            <div
              key={id}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                milestones[id] ? 'bg-primary-container' : 'bg-outline/20',
              )}
            />
          ))}
        </div>
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-1 shrink-0">
        {MILESTONES.map((id) => (
          <span
            key={id}
            className={cn(
              'flex items-center justify-center h-5 w-5 rounded-full transition-all duration-200',
              milestones[id]
                ? 'bg-primary-container/20 text-primary-container'
                : 'bg-surface-high text-ink-muted/40',
            )}
          >
            {milestones[id] ? (
              <Check size={10} strokeWidth={2.5} />
            ) : (
              <Circle size={6} />
            )}
          </span>
        ))}
      </div>
    </motion.div>
  );
};
