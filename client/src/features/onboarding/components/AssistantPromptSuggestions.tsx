import { motion } from 'framer-motion';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface AssistantPromptSuggestionsProps {
  /** If provided, each suggestion click triggers this callback. */
  onSelect?: (prompt: string) => void;
  /** Optional className for the container. */
  className?: string;
}

const SUGGESTION_KEYS = [
  'assistant.prompt.spending',
  'assistant.prompt.profit',
  'assistant.prompt.anomaly',
  'assistant.prompt.forecast',
] as const;

export const AssistantPromptSuggestions = ({
  onSelect,
  className,
}: AssistantPromptSuggestionsProps) => {
  const t = useT();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={cn('space-y-3', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-ink-muted">
        <MessageCircle size={14} strokeWidth={1.5} />
        <span className="text-xs font-medium uppercase tracking-wider">
          {t('assistant.suggestions.label')}
        </span>
      </div>

      {/* Prompt chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTION_KEYS.map((key, i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => onSelect?.(t(key))}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl',
              'bg-surface-lowest border border-outline/15',
              'text-sm text-ink-muted',
              'hover:text-ink hover:border-outline/30 hover:bg-surface-low',
              'active:scale-[0.98]',
              'transition-all duration-200 ease-quintessential focus-ring',
            )}
          >
            <Sparkles size={13} strokeWidth={1.5} className="text-primary-container/60" />
            {t(key)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
