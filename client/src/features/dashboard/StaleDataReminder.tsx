import { Clock, Plus } from 'lucide-react';
import { useActivityStatus } from './useWidgets';
import { useT, useTi } from '@/lib/i18n';

interface Props {
  onAdd: () => void;
}

export const StaleDataReminder = ({ onAdd }: Props) => {
  const t = useT();
  const ti = useTi();
  const { data } = useActivityStatus();
  if (!data || !data.isStale || data.daysSinceLastTransaction == null) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden
          className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0"
        >
          <Clock size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug">
            {ti('reminder.stale.title', { days: data.daysSinceLastTransaction })}
          </p>
          <p className="text-xs opacity-80">{t('reminder.stale.subtitle')}</p>
        </div>
      </div>
      <button
        onClick={onAdd}
        className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-xs font-medium transition-colors focus-ring"
      >
        <Plus size={13} aria-hidden />
        {t('reminder.stale.cta')}
      </button>
    </div>
  );
};
