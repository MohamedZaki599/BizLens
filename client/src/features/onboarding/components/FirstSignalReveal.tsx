import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import { useT, useTi } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { AssistantPromptSuggestions } from './AssistantPromptSuggestions';

interface FirstSignalRevealProps {
  signal?: {
    key: string;
    title: string;
    explanation: string;
    severity: 'info' | 'success' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'flat';
    confidence: number;
    action?: { label: string; route: string };
  } | null;
  onContinue: () => void;
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp size={18} strokeWidth={1.5} />;
  if (trend === 'down') return <TrendingDown size={18} strokeWidth={1.5} />;
  return <Minus size={18} strokeWidth={1.5} />;
};

const severityConfig = {
  info: { bg: 'bg-primary/10', border: 'border-primary/20', text: 'text-primary', dot: 'bg-primary' },
  success: { bg: 'bg-secondary/10', border: 'border-secondary/20', text: 'text-secondary', dot: 'bg-secondary' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600', dot: 'bg-amber-500' },
  critical: { bg: 'bg-danger/10', border: 'border-danger/20', text: 'text-danger', dot: 'bg-danger' },
};

export const FirstSignalReveal = ({ signal, onContinue }: FirstSignalRevealProps) => {
  const t = useT();
  const ti = useTi();
  const lang = useUiStore((s) => s.language);
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  // Fallback if no signal is available yet
  const hasSignal = signal != null;
  const sev = hasSignal ? severityConfig[signal.severity] : severityConfig.info;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      {/* Ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary/15 text-secondary mb-5">
            <Sparkles size={26} strokeWidth={1.3} />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            {t('onboarding.firstSignal.title')}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {t('onboarding.firstSignal.subtitle')}
          </p>
        </motion.div>

        {/* Signal Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'rounded-3xl border p-6 md:p-8',
            'bg-surface-lowest',
            sev.border,
          )}
        >
          {hasSignal ? (
            <>
              {/* Severity & Trend row */}
              <div className="flex items-center justify-between mb-4">
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', sev.bg, sev.text)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', sev.dot)} />
                  {t(`signal.severity.${signal.severity}`)}
                </span>
                <span className="flex items-center gap-1 text-xs text-ink-muted">
                  <TrendIcon trend={signal.trend} />
                  {t(`signal.trend.${signal.trend}`)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-bold text-ink">
                {signal.title}
              </h3>

              {/* Explanation */}
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">
                {signal.explanation}
              </p>

              {/* Confidence */}
              <div className="mt-5 flex items-center gap-2">
                <Shield size={14} className="text-ink-muted/60" />
                <span className="text-xs text-ink-muted/60">
                  {ti('onboarding.firstSignal.confidence', { value: Math.round(signal.confidence * 100) })}
                </span>
              </div>

              {/* Next action */}
              {signal.action && (
                <div className="mt-5 pt-5 border-t border-outline/15">
                  <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-2">
                    {t('onboarding.firstSignal.nextStep')}
                  </p>
                  <p className="text-sm text-ink font-medium">
                    {signal.action.label}
                  </p>
                </div>
              )}

              {/* Contextual Assistant Support */}
              <div className="mt-6 pt-5 border-t border-outline/15">
                <AssistantPromptSuggestions />
              </div>
            </>
          ) : (
            /* No signal available — educational empty state */
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-surface-high text-ink-muted mb-4">
                <Sparkles size={24} strokeWidth={1.3} />
              </div>
              <p className="text-sm font-medium text-ink">
                {t('onboarding.firstSignal.noSignal.title')}
              </p>
              <p className="text-xs text-ink-muted mt-1.5 max-w-xs mx-auto leading-relaxed">
                {t('onboarding.firstSignal.noSignal.desc')}
              </p>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mt-8"
        >
          <button
            onClick={onContinue}
            className={cn(
              'inline-flex items-center gap-2 h-12 px-8 rounded-xl',
              'bg-gradient-to-r from-primary to-primary-container text-on-primary',
              'font-semibold text-base shadow-glow',
              'hover:brightness-110 active:scale-[0.98]',
              'transition-all duration-200 ease-quintessential focus-ring',
            )}
          >
            {t('onboarding.firstSignal.cta')}
            <Arrow size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
