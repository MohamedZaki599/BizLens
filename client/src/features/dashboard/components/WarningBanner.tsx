import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { DashboardWarning } from '@/types/domain';
import { cn } from '@/lib/utils';

interface WarningBannerProps {
  warnings: DashboardWarning[];
}

export const WarningBanner = ({ warnings }: WarningBannerProps) => {
  if (warnings.length === 0) return null;

  return (
    <div role="status" aria-live="polite" className="space-y-2">
      {warnings.map((w) => {
        const Icon = w.severity === 'critical' ? AlertTriangle : AlertCircle;
        return (
          <div
            key={w.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-2xl text-sm',
              w.severity === 'critical'
                ? 'bg-danger/10 text-danger'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0" aria-hidden />
            <p className="font-medium leading-relaxed">{w.message}</p>
          </div>
        );
      })}
    </div>
  );
};
