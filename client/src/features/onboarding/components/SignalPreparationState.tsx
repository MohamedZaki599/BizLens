import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BarChart3, Sparkles, CheckCircle2 } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useRecomputeSignalsMutation } from '@/features/signals/hooks/useSignalsQuery';
import { cn } from '@/lib/utils';

interface SignalPreparationStateProps {
  onReady: () => void;
}

const STAGES = [
  { key: 'analyzing', icon: Activity, durationMs: 2200 },
  { key: 'detecting', icon: BarChart3, durationMs: 2000 },
  { key: 'preparing', icon: Sparkles, durationMs: 1800 },
  { key: 'ready', icon: CheckCircle2, durationMs: 800 },
] as const;

export const SignalPreparationState = ({ onReady }: SignalPreparationStateProps) => {
  const t = useT();
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const { mutate: recompute } = useRecomputeSignalsMutation();

  useEffect(() => {
    // Trigger real computation in background
    recompute();
  }, [recompute]);

  useEffect(() => {
    const totalMs = STAGES.reduce((a, s) => a + s.durationMs, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      setProgress(Math.min(100, (elapsed / totalMs) * 100));

      // Advance stages
      let acc = 0;
      for (let i = 0; i < STAGES.length; i++) {
        acc += STAGES[i].durationMs;
        if (elapsed < acc) {
          setStageIdx(i);
          break;
        }
      }

      if (elapsed >= totalMs) {
        clearInterval(interval);
        setStageIdx(STAGES.length - 1);
        setTimeout(onReady, 600);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onReady]);

  const current = STAGES[stageIdx];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      {/* Ambient pulse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary-container"
        />
      </div>

      <div className="relative z-10 max-w-sm w-full text-center">
        {/* Icon animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className={cn(
              'inline-flex items-center justify-center h-20 w-20 rounded-3xl mb-8',
              current.key === 'ready'
                ? 'bg-secondary/15 text-secondary'
                : 'bg-primary-container/15 text-primary-container',
            )}
          >
            <current.icon size={36} strokeWidth={1.3} />
          </motion.div>
        </AnimatePresence>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              {t(`onboarding.preparation.${current.key}.title`)}
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              {t(`onboarding.preparation.${current.key}.desc`)}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="mt-10 mx-auto max-w-xs">
          <div className="h-1.5 rounded-full bg-surface-high overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                current.key === 'ready'
                  ? 'bg-secondary'
                  : 'bg-gradient-to-r from-primary-container to-primary',
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="mt-3 text-xs text-ink-muted/60 tabular-nums">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
};
