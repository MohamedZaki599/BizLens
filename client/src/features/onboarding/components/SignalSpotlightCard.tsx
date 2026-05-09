import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Shield, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useT, useTi } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────

export interface SpotlightSignal {
  key: string;
  title: string;
  explanation: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'flat';
  confidence: number;
  category?: string;
  action?: { label: string; route: string };
}

interface SignalSpotlightCardProps {
  signal: SpotlightSignal;
  onAction?: (route: string) => void;
  className?: string;
}

// ─── Severity visual config ───────────────────────────────────────────────

const SEV = {
  info:     { bg: 'bg-primary/10',     border: 'border-primary/20',     text: 'text-primary',     dot: 'bg-primary',     glow: 'shadow-[0_0_0_1px_rgba(26,31,46,0.06)]' },
  success:  { bg: 'bg-secondary/10',   border: 'border-secondary/20',   text: 'text-secondary',   dot: 'bg-secondary',   glow: 'shadow-[0_0_0_1px_rgba(0,108,73,0.08)]' },
  warning:  { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-600',   dot: 'bg-amber-500',   glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.08)]' },
  critical: { bg: 'bg-danger/10',      border: 'border-danger/20',      text: 'text-danger',      dot: 'bg-danger',      glow: 'shadow-[0_0_0_1px_rgba(147,0,10,0.08)]' },
} as const;

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'up') return <TrendingUp size={15} strokeWidth={1.5} />;
  if (trend === 'down') return <TrendingDown size={15} strokeWidth={1.5} />;
  return <Minus size={15} strokeWidth={1.5} />;
};

// ─── Component ────────────────────────────────────────────────────────────

export const SignalSpotlightCard = ({ signal, onAction, className }: SignalSpotlightCardProps) => {
  const t = useT();
  const ti = useTi();
  const lang = useUiStore((s) => s.language);
  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const sev = SEV[signal.severity];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'rounded-2xl border p-5 md:p-6',
        'bg-surface-lowest',
        sev.border,
        sev.glow,
        className,
      )}
    >
      {/* Top bar: severity badge + trend */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
          sev.bg, sev.text,
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', sev.dot)} />
          {t(`signal.severity.${signal.severity}`)}
        </span>

        <span className="flex items-center gap-1 text-xs text-ink-muted">
          <TrendIcon trend={signal.trend} />
          {t(`signal.trend.${signal.trend}`)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-bold text-ink leading-snug">
        {signal.title}
      </h3>

      {/* Category tag */}
      {signal.category && (
        <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-high text-ink-muted">
          {signal.category}
        </span>
      )}

      {/* Explanation */}
      <p className="mt-3 text-sm text-ink-muted leading-relaxed">
        {signal.explanation}
      </p>

      {/* Footer: confidence + action */}
      <div className="mt-4 pt-4 border-t border-outline/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Shield size={13} className="text-ink-muted/50" />
          <span className="text-xs text-ink-muted/60">
            {ti('onboarding.firstSignal.confidence', { value: Math.round(signal.confidence * 100) })}
          </span>
        </div>

        {signal.action && (
          <button
            onClick={() => onAction?.(signal.action!.route)}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium',
              sev.text,
              'hover:underline underline-offset-2',
              'transition-colors focus-ring rounded',
            )}
          >
            {signal.action.label}
            <Arrow size={13} />
          </button>
        )}
      </div>
    </motion.article>
  );
};
