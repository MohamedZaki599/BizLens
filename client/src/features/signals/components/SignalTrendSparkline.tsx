import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignalTrend } from '../types';

export const SignalTrendSparkline = ({ trend }: { trend: SignalTrend }) => {
  if (trend === 'UNKNOWN') return null;

  const map = {
    UP: { icon: TrendingUp, color: 'text-danger bg-danger/10', label: 'Trending up' }, // UP can be good or bad depending on the metric, but usually a sparkline is agnostic, wait, let's keep it neutral or use context. Since we only know "UP" or "DOWN", we can just use secondary/primary colors or rely on severity for color. Let's make it neutral-muted to avoid confusing color semantics.
    DOWN: { icon: TrendingDown, color: 'text-ink-muted bg-surface-lowest', label: 'Trending down' },
    FLAT: { icon: Minus, color: 'text-ink-muted bg-surface-lowest', label: 'Flat trend' },
  };

  const mapNeutral = {
    UP: { icon: TrendingUp, color: 'text-ink-muted' },
    DOWN: { icon: TrendingDown, color: 'text-ink-muted' },
    FLAT: { icon: Minus, color: 'text-ink-muted' },
  };

  const { icon: Icon, color } = mapNeutral[trend];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-lowest border border-outline/20 text-xs font-medium", color)}>
      <Icon size={14} aria-hidden />
      <span>{trend === 'UP' ? 'Rising' : trend === 'DOWN' ? 'Falling' : 'Stable'}</span>
    </div>
  );
};
