import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignalSeverity } from '../types';

export const SignalSeverityBadge = ({ severity }: { severity: SignalSeverity }) => {
  if (severity === 'NONE') return null;

  const map = {
    INFO: { icon: Info, color: 'text-primary bg-primary/10 border-primary/20', label: 'Info' },
    WARNING: { icon: AlertTriangle, color: 'text-warning bg-warning/10 border-warning/20', label: 'Warning' },
    CRITICAL: { icon: AlertCircle, color: 'text-danger bg-danger/10 border-danger/20', label: 'Critical' },
  };

  const { icon: Icon, color, label } = map[severity];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border', color)}>
      <Icon size={12} aria-hidden />
      {label}
    </span>
  );
};
