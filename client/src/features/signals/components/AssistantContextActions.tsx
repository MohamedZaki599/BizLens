import { Sparkles, ArrowRight, HelpCircle, Wrench } from 'lucide-react';
import { Button } from '@/components/Button';

export const AssistantContextActions = ({ signalId }: { signalId: string }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-outline/20">
      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-ink-muted hover:text-primary">
        <HelpCircle size={14} className="me-1.5" />
        Ask AI Why
      </Button>
      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-ink-muted hover:text-primary">
        <Sparkles size={14} className="me-1.5" />
        Explain Impact
      </Button>
      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-ink-muted hover:text-primary">
        <Wrench size={14} className="me-1.5" />
        Suggested Fix
      </Button>
    </div>
  );
};
