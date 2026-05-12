import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { SignalSeverity } from '../types';

export const SignalSeverityBadge = ({ severity }: { severity: SignalSeverity }) => {
  const t = useT();
  if (severity === 'NONE') return null;

  const map = {
    INFO: { icon: Info, color: 'text-primary bg-primary/10 border-primary/20' },
    WARNING: { icon: AlertTriangle, color: 'text-warning bg-warning/10 border-warning/20' },
    CRITICAL: { icon: AlertCircle, color: 'text-danger bg-danger/10 border-danger/20' },
  };

  const { icon: Icon, color } = map[severity];

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border', color)}>
      <Icon size={12} aria-hidden />
      {t(`signal.severity.${severity}`)}
    </span>
  );
};
