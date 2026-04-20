import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCheck,
  Inbox,
  Info,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  useAlerts,
  useDismissAlert,
  useMarkAlertRead,
  useMarkAllAlertsRead,
} from './useAlerts';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { AlertItem, AlertSeverity } from '@/types/domain';

const severityIcon: Record<AlertSeverity, LucideIcon> = {
  INFO: Info,
  WARNING: AlertCircle,
  CRITICAL: AlertTriangle,
};

const severityChip: Record<AlertSeverity, string> = {
  INFO: 'bg-primary/10 text-primary',
  WARNING: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  CRITICAL: 'bg-danger/10 text-danger',
};

const severityRail: Record<AlertSeverity, string> = {
  INFO: 'bg-primary/40',
  WARNING: 'bg-amber-500/60',
  CRITICAL: 'bg-danger/70',
};

const formatRelative = (iso: string, lang: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'just now';
  if (mins < 60) return lang === 'ar' ? `قبل ${mins} د` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return lang === 'ar' ? `قبل ${hours} س` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return lang === 'ar' ? `قبل ${days} ي` : `${days}d ago`;
};

export const AlertCenter = ({ language }: { language: string }) => {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useAlerts();
  const markRead = useMarkAlertRead();
  const markAll = useMarkAllAlertsRead();
  const dismiss = useDismissAlert();

  const unread = data?.unread ?? 0;
  const alerts = data?.alerts ?? [];

  // Outside-click close.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('mousedown', handler);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const handleAction = (a: AlertItem) => {
    if (!a.isRead) markRead.mutate(a.id);
    if (a.action) {
      if (a.action.type === 'navigate' && a.action.payload.route) {
        navigate(a.action.payload.route);
      } else if (a.action.type === 'filter' && a.action.payload.categoryId) {
        const params = new URLSearchParams();
        params.set('categoryId', a.action.payload.categoryId);
        if (a.action.payload.type) params.set('type', a.action.payload.type);
        navigate(`/app/transactions?${params.toString()}`);
      }
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('alerts.label')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-highest flex items-center justify-center text-ink-muted hover:text-ink transition-colors focus-ring"
      >
        <Bell size={16} aria-hidden />
        {unread > 0 && (
          <span
            aria-label={`${unread} unread`}
            className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-on-primary text-[10px] font-semibold flex items-center justify-center tabular-nums shadow-ambient"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t('alerts.label')}
          className={cn(
            'absolute end-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] z-40',
            'rounded-2xl bg-surface-lowest border border-outline/40 shadow-ambient backdrop-blur-xl',
            'animate-fade-in flex flex-col max-h-[32rem]',
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline/30">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" aria-hidden />
              <h2 className="font-display font-semibold text-sm tracking-tight">
                {t('alerts.label')}
              </h2>
              {unread > 0 && (
                <span className="text-[10px] uppercase tracking-wide text-ink-muted">
                  {unread} {t('alerts.unread')}
                </span>
              )}
            </div>
            <button
              onClick={() => markAll.mutate()}
              disabled={unread === 0}
              className="text-[11px] inline-flex items-center gap-1 text-ink-muted hover:text-ink disabled:opacity-50 focus-ring rounded px-1"
            >
              <CheckCheck size={12} aria-hidden />
              {t('alerts.markAll')}
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-ink-muted">{t('common.loading')}</div>
            ) : alerts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div
                  aria-hidden
                  className="inline-flex h-12 w-12 rounded-2xl bg-surface-high items-center justify-center text-ink-muted mb-3"
                >
                  <Inbox size={20} />
                </div>
                <p className="text-sm font-medium text-ink">{t('alerts.empty.title')}</p>
                <p className="text-xs text-ink-muted mt-1">{t('alerts.empty.subtitle')}</p>
              </div>
            ) : (
              <ul role="list" className="divide-y divide-outline/30">
                {alerts.map((a) => {
                  const Icon = severityIcon[a.severity];
                  return (
                    <li
                      key={a.id}
                      className={cn(
                        'group relative flex gap-3 p-3.5 hover:bg-surface-low/60 transition-colors',
                        !a.isRead && 'bg-primary/[0.04]',
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'absolute start-0 inset-y-0 w-[3px] rounded-r',
                          severityRail[a.severity],
                          a.isRead && 'opacity-40',
                        )}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                          severityChip[a.severity],
                        )}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug text-ink">{a.title}</p>
                          <span className="text-[10px] text-ink-muted shrink-0 mt-0.5 tabular-nums">
                            {formatRelative(a.createdAt, language)}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{a.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {a.action && (
                            <button
                              onClick={() => handleAction(a)}
                              className="text-[11px] font-medium text-primary hover:underline focus-ring rounded"
                            >
                              {a.action.label}
                            </button>
                          )}
                          {!a.isRead && (
                            <button
                              onClick={() => markRead.mutate(a.id)}
                              className="text-[11px] text-ink-muted hover:text-ink focus-ring rounded"
                            >
                              {t('alerts.markRead')}
                            </button>
                          )}
                          <button
                            onClick={() => dismiss.mutate(a.id)}
                            className="text-[11px] text-ink-muted hover:text-danger focus-ring rounded ms-auto inline-flex items-center gap-0.5"
                            aria-label={t('alerts.dismiss')}
                          >
                            <X size={11} aria-hidden />
                            {t('alerts.dismiss')}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
