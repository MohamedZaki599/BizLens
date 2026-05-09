import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { SignalStatus } from '../types';
import { CircleDashed, CheckCircle2, Search, BellOff, Check } from 'lucide-react';

interface SignalLifecycleBadgeProps {
  status: SignalStatus;
  className?: string;
}

const iconMap = {
  NEW: CircleDashed,
  REVIEWED: CheckCircle2,
  INVESTIGATING: Search,
  SNOOZED: BellOff,
  RESOLVED: Check,
};

const colorMap: Record<SignalStatus, string> = {
  NEW: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  REVIEWED: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  INVESTIGATING: 'bg-warning/10 text-warning border-warning/20',
  SNOOZED: 'bg-surface-highest text-ink-muted border-outline',
  RESOLVED: 'bg-success/10 text-success border-success/20',
};

export const SignalLifecycleBadge = ({ status, className }: SignalLifecycleBadgeProps) => {
  const t = useT();
  const safeStatus = status && iconMap[status] ? status : 'NEW';
  const Icon = iconMap[safeStatus];
  const colorClass = colorMap[safeStatus];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium", colorClass, className)}>
      <Icon size={12} />
      <span>{t(`signal.status.${safeStatus}`)}</span>
    </div>
  );
};
