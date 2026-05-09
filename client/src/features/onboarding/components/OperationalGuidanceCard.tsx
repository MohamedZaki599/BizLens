import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────

interface OperationalGuidanceCardProps {
  /** i18n key for the card title. */
  titleKey: string;
  /** i18n key for the card description. */
  descKey: string;
  /** Optional icon override (defaults to Lightbulb). */
  icon?: ReactNode;
  /** Route to navigate to when the action is clicked. */
  actionRoute?: string;
  /** i18n key for the action label. */
  actionLabelKey?: string;
  /** Callback when the action is clicked. */
  onAction?: () => void;
  /** Optional className. */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────

/**
 * OperationalGuidanceCard — a contextual guidance card that provides
 * educational content and a soft CTA. Used throughout the app to
 * guide users toward their next operational milestone.
 *
 * Design principles:
 *   - calm and non-intrusive
 *   - single clear action
 *   - educational without being patronizing
 *   - visually lightweight
 */
export const OperationalGuidanceCard = ({
  titleKey,
  descKey,
  icon,
  actionLabelKey,
  onAction,
  className,
}: OperationalGuidanceCardProps) => {
  const t = useT();
  const lang = useUiStore((s) => s.language);
  const Arrow = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl',
        'bg-gradient-to-br from-primary-container/8 to-transparent',
        'border border-primary-container/12',
        className,
      )}
    >
      {/* Icon */}
      <div className="h-10 w-10 rounded-xl bg-primary-container/15 text-primary-container flex items-center justify-center shrink-0">
        {icon ?? <Lightbulb size={20} strokeWidth={1.3} />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink leading-snug">
          {t(titleKey)}
        </p>
        <p className="mt-1 text-xs text-ink-muted leading-relaxed">
          {t(descKey)}
        </p>

        {actionLabelKey && onAction && (
          <button
            onClick={onAction}
            className={cn(
              'inline-flex items-center gap-1.5 mt-3',
              'text-xs font-medium text-primary-container',
              'hover:underline underline-offset-2',
              'transition-colors focus-ring rounded',
            )}
          >
            {t(actionLabelKey)}
            <Arrow size={13} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
