import { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTi } from '@/lib/i18n';
import { getFreshnessStatus } from '../utils/freshness';

interface Props {
  generatedAt: Date;
  ttlCategory?: string;
}

export const SignalFreshnessIndicator = ({ generatedAt, ttlCategory = 'dashboard' }: Props) => {
  const ti = useTi();
  const [timeAgo, setTimeAgo] = useState(() => formatDistanceToNowStrict(generatedAt, { addSuffix: false }));
  const status = getFreshnessStatus(generatedAt, ttlCategory);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNowStrict(generatedAt, { addSuffix: false }));
    }, 60000);
    return () => clearInterval(interval);
  }, [generatedAt]);

  const dotColor = {
    fresh: 'bg-emerald-500',
    stale: 'bg-amber-500',
    updating: 'bg-blue-500 animate-pulse',
  }[status];

  return (
    <div className="flex items-center gap-2 text-xs text-ink-muted">
      <span className={cn('block h-1.5 w-1.5 rounded-full', dotColor)} aria-hidden />
      <span>{ti('signal.freshness.updated', { time: timeAgo })}</span>
    </div>
  );
};
