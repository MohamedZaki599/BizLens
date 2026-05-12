import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

export const ConfidenceIndicator = ({ confidence }: { confidence: number }) => {
  const t = useT();
  let levelKey = 'signal.confidence.low';
  let color = 'text-danger';
  if (confidence > 0.8) {
    levelKey = 'signal.confidence.high';
    color = 'text-primary';
  } else if (confidence > 0.4) {
    levelKey = 'signal.confidence.medium';
    color = 'text-warning';
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-muted" title={`${Math.round(confidence * 100)}%`}>
      <BarChart2 size={12} className={cn(color)} aria-hidden />
      <span>{t(levelKey)}</span>
    </div>
  );
};
