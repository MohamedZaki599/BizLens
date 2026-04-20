import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAlerts } from './useAlerts';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'bizlens.alerts.shown';

const loadShown = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

const saveShown = (set: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set).slice(-200)));
  } catch {
    // ignore
  }
};

const sendBrowserNotification = (title: string, body: string) => {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  if (document.hasFocus()) return;
  try {
    new Notification(title, { body, icon: '/favicon.ico', tag: 'bizlens-alert' });
  } catch {
    // Safari / older browsers may fail silently.
  }
};

export const AlertToastWatcher = () => {
  const navigate = useNavigate();
  const { data } = useAlerts();
  const shownRef = useRef<Set<string>>(loadShown());

  useEffect(() => {
    if (!data?.alerts) return;
    const fresh = data.alerts.filter(
      (a) => a.severity === 'CRITICAL' && !shownRef.current.has(a.id),
    );
    for (const a of fresh) {
      shownRef.current.add(a.id);

      sendBrowserNotification(a.title, a.message);

      toast.custom(
        (tt) => (
          <div
            className={cn(
              'flex items-start gap-3 p-3.5 rounded-2xl bg-surface-lowest border border-danger/30',
              'shadow-ambient backdrop-blur-xl max-w-sm',
              tt.visible ? 'animate-fade-in' : 'opacity-0',
            )}
            role="alert"
          >
            <span
              aria-hidden
              className="h-8 w-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0"
            >
              <AlertTriangle size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{a.title}</p>
              <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{a.message}</p>
              {a.action && (
                <button
                  onClick={() => {
                    toast.dismiss(tt.id);
                    if (a.action?.type === 'navigate' && a.action.payload.route) {
                      navigate(a.action.payload.route);
                    } else if (a.action?.type === 'filter' && a.action.payload.categoryId) {
                      const params = new URLSearchParams();
                      params.set('categoryId', a.action.payload.categoryId);
                      if (a.action.payload.type) params.set('type', a.action.payload.type);
                      navigate(`/app/transactions?${params.toString()}`);
                    }
                  }}
                  className="text-xs font-medium text-primary mt-1.5 hover:underline focus-ring rounded"
                >
                  {a.action.label} →
                </button>
              )}
            </div>
            <button
              onClick={() => toast.dismiss(tt.id)}
              className="text-ink-muted hover:text-ink p-1 rounded focus-ring"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ),
        { duration: 8000, position: 'top-right' },
      );
    }
    saveShown(shownRef.current);
  }, [data, navigate]);

  return null;
};
