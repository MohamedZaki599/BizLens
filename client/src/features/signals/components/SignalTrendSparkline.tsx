import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { SignalTrend } from '../types';

export const SignalTrendSparkline = ({ trend }: { trend: SignalTrend }) => {
  const t = useT();
  if (trend === 'UNKNOWN') return null;

  const map = {
    UP: { icon: TrendingUp, key: 'signal.trend.up' },
    DOWN: { icon: TrendingDown, key: 'signal.trend.down' },
    FLAT: { icon: Minus, key: 'signal.trend.flat' },
  };

  const { icon: Icon, key } = map[trend];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-lowest border border-outline/20 text-xs font-medium text-ink-muted")}>
      <Icon size={14} aria-hidden />
      <span>{t(key)}</span>
    </div>
  );
};
