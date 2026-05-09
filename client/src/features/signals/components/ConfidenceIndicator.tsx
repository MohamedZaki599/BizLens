import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConfidenceIndicator = ({ confidence }: { confidence: number }) => {
  let level = 'Low';
  let color = 'text-danger';
  if (confidence > 0.8) {
    level = 'High';
    color = 'text-primary';
  } else if (confidence > 0.4) {
    level = 'Medium';
    color = 'text-warning';
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-muted" title={`Confidence: ${Math.round(confidence * 100)}%`}>
      <BarChart2 size={12} className={cn(color)} aria-hidden />
      <span>{level} confidence</span>
    </div>
  );
};
