import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Database,
  Radio,
  CheckCircle2,
  Activity,
  BarChart3,
  MessageCircle,
  Plus,
  Upload,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ─── Empty State Variants ─────────────────────────────────────────────────

export type EmptyStateVariant =
  | 'no-data'
  | 'no-signals'
  | 'resolved-empty'
  | 'assistant-idle'
  | 'no-trends';

interface EmptyStatePanelProps {
  variant: EmptyStateVariant;
  action?: ReactNode;
  className?: string;
}

interface VariantConfig {
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
}

const variantMap: Record<EmptyStateVariant, VariantConfig> = {
  'no-data': {
    icon: Database,
    gradient: 'from-primary-container/12 to-transparent',
    iconColor: 'text-primary-container',
  },
  'no-signals': {
    icon: Radio,
    gradient: 'from-primary/10 to-transparent',
    iconColor: 'text-primary',
  },
  'resolved-empty': {
    icon: CheckCircle2,
    gradient: 'from-secondary/12 to-transparent',
    iconColor: 'text-secondary',
  },
  'assistant-idle': {
    icon: MessageCircle,
    gradient: 'from-primary-container/10 to-transparent',
    iconColor: 'text-primary-container',
  },
  'no-trends': {
    icon: BarChart3,
    gradient: 'from-primary/8 to-transparent',
    iconColor: 'text-primary',
  },
};

export const EmptyStatePanel = ({ variant, action, className }: EmptyStatePanelProps) => {
  const t = useT();
  const config = variantMap[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6 rounded-2xl',
        'bg-gradient-to-b border border-outline/10',
        config.gradient,
        className,
      )}
    >
      {/* Icon container */}
      <div className={cn(
        'h-16 w-16 rounded-2xl flex items-center justify-center mb-5',
        'bg-surface-lowest/80 border border-outline/10',
        config.iconColor,
      )}>
        <Icon size={28} strokeWidth={1.3} />
      </div>

      {/* Copy */}
      <h3 className="font-display text-lg font-semibold text-ink">
        {t(`empty.${variant}.title`)}
      </h3>
      <p className="mt-2 text-sm text-ink-muted max-w-sm leading-relaxed">
        {t(`empty.${variant}.desc`)}
      </p>

      {/* Guidance hint */}
      <p className="mt-4 text-xs text-ink-muted/60 max-w-xs leading-relaxed">
        {t(`empty.${variant}.hint`)}
      </p>

      {/* Action slot */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </motion.div>
  );
};

// ─── Quick Empty State Presets ────────────────────────────────────────────

interface NoDataEmptyProps {
  onAddTransaction?: () => void;
  onImport?: () => void;
}

export const NoDataEmpty = ({ onAddTransaction, onImport }: NoDataEmptyProps) => {
  const t = useT();

  return (
    <EmptyStatePanel
      variant="no-data"
      action={
        <div className="flex items-center gap-3">
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className={cn(
                'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
                'bg-gradient-to-r from-primary to-primary-container text-on-primary',
                'font-medium text-sm shadow-glow',
                'hover:brightness-110 active:scale-[0.98]',
                'transition-all duration-200 ease-quintessential focus-ring',
              )}
            >
              <Plus size={16} />
              {t('empty.no-data.addCta')}
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              className={cn(
                'inline-flex items-center gap-2 h-10 px-5 rounded-xl',
                'border border-outline/30 text-ink-muted',
                'font-medium text-sm',
                'hover:bg-surface-high hover:text-ink',
                'transition-all duration-200 ease-quintessential focus-ring',
              )}
            >
              <Upload size={16} />
              {t('empty.no-data.importCta')}
            </button>
          )}
        </div>
      }
    />
  );
};

export const NoSignalsEmpty = () => (
  <EmptyStatePanel variant="no-signals" />
);

export const ResolvedQueueEmpty = () => (
  <EmptyStatePanel variant="resolved-empty" />
);

export const AssistantIdleEmpty = () => {
  const t = useT();
  return (
    <EmptyStatePanel
      variant="assistant-idle"
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['ask1', 'ask2', 'ask3'].map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-lowest border border-outline/15 text-xs text-ink-muted hover:text-ink hover:border-outline/30 transition-colors cursor-pointer"
            >
              <Activity size={12} />
              {t(`empty.assistant-idle.prompt.${key}`)}
            </span>
          ))}
        </div>
      }
    />
  );
};

export const NoTrendsEmpty = () => (
  <EmptyStatePanel variant="no-trends" />
);
