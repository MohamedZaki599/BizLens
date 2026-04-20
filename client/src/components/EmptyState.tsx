import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, subtitle, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="h-16 w-16 rounded-2xl bg-surface-high flex items-center justify-center mb-4 text-ink-muted">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
    {subtitle && <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{subtitle}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
