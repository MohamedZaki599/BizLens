import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

interface ContextualAssistantActionsProps {
  actions: { label: string; onClick: () => void }[];
  className?: string;
}

export const ContextualAssistantActions = ({ actions, className }: ContextualAssistantActionsProps) => {
  const t = useT();

  // Filter to only actions with valid handlers — FR-006: no placeholder actions allowed
  const validActions = (actions || []).filter(
    (action) => action && typeof action.onClick === 'function' && action.label,
  );

  if (validActions.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-outline/30", className)}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-brand-primary">
        <Sparkles size={14} />
        <span>{t('signal.card.askAi')}</span>
      </div>
      {validActions.map((action, idx) => (
        <Button
          key={idx}
          variant="tertiary"
          size="sm"
          className="min-h-[44px] text-xs rounded-full border border-brand-primary/20 text-ink hover:bg-brand-primary/5 hover:text-brand-primary hover:border-brand-primary/40 transition-colors"
          onClick={action.onClick}
        >
          {action.label}
          <ArrowRight size={12} className="opacity-50 rtl:rotate-180" />
        </Button>
      ))}
    </div>
  );
};
