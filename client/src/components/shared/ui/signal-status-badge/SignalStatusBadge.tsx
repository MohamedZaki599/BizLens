import React from 'react';
import { RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreshnessStatus } from '@/features/signals/types';
import { formatSignalAge } from '@/features/signals/utils/freshness';

interface SignalStatusBadgeProps {
  status: FreshnessStatus;
  generatedAt?: Date | string;
  className?: string;
}

export const SignalStatusBadge: React.FC<SignalStatusBadgeProps> = ({
  status,
  generatedAt,
  className,
}) => {
  const ageLabel = generatedAt ? formatSignalAge(generatedAt) : '';

  const config = {
    fresh: {
      icon: CheckCircle2,
      label: 'Live',
      color: 'text-secondary bg-secondary/10',
      tooltip: `Updated ${ageLabel}`,
    },
    stale: {
      icon: Clock,
      label: 'Stale',
      color: 'text-warning bg-warning/10',
      tooltip: `Data might be outdated. Last updated ${ageLabel}`,
    },
    updating: {
      icon: RefreshCw,
      label: 'Updating',
      color: 'text-primary bg-primary/10',
      tooltip: 'Refreshing data...',
    },
  };

  const { icon: Icon, label, color, tooltip } = config[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors',
        color,
        className
      )}
      title={tooltip}
      role="status"
      aria-label={`${label}. ${tooltip}`}
    >
      <Icon
        size={12}
        className={cn({ 'animate-spin': status === 'updating' })}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
};
