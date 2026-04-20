import { useState, useEffect } from 'react';
import { BellRing, X, Check } from 'lucide-react';
import { useT } from '@/lib/i18n';

export const NotificationBanner = () => {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('bizlens.notif.dismissed');
      if (!dismissed) setVisible(true);
    }
    if (Notification.permission === 'granted') setGranted(true);
  }, []);

  if (!visible && !granted) return null;

  if (granted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/10 text-secondary text-xs font-medium">
        <Check size={14} aria-hidden />
        {t('notifications.enabled')}
      </div>
    );
  }

  const handleEnable = async () => {
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setGranted(true);
        setVisible(false);
      }
    } catch {
      // Ignore.
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('bizlens.notif.dismissed', '1');
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-primary/10 text-primary">
      <div className="flex items-center gap-2 text-xs font-medium">
        <BellRing size={14} aria-hidden />
        {t('notifications.permission')}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleEnable}
          className="text-xs font-medium px-2.5 py-1 rounded-lg bg-primary text-on-primary hover:brightness-110 transition-all focus-ring"
        >
          {t('notifications.enable')}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded text-primary/60 hover:text-primary focus-ring"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
