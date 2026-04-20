'use client';

import { Sparkles } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

export const Footer = () => {
  const { language } = useUi();
  return (
    <footer className="py-10 border-t border-outline/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-bold text-base tracking-tight">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary">
            <Sparkles size={14} strokeWidth={1.8} />
          </span>
          BizLens
        </div>
        <p className="text-sm text-ink-muted">
          © {new Date().getFullYear()} BizLens — {t(language, 'footer.rights')}
        </p>
      </div>
    </footer>
  );
};
