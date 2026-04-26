'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

export const Footer = () => {
  const { language } = useUi();
  const year = new Date().getFullYear();

  return (
    <footer className="py-10 border-t border-outline/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-display font-bold text-base tracking-tight">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary">
            <Sparkles size={14} strokeWidth={1.8} />
          </span>
          BizLens
        </div>

        <nav aria-label="Legal" className="flex items-center gap-5 text-sm text-ink-muted">
          <a href="#pricing" className="hover:text-ink transition-colors">
            {t(language, 'nav.pricing')}
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            {t(language, 'nav.faq')}
          </a>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            {t(language, 'footer.privacy')}
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors">
            {t(language, 'footer.terms')}
          </Link>
        </nav>

        <p className="text-sm text-ink-muted">
          © {year} BizLens — {t(language, 'footer.rights')}
        </p>
      </div>
    </footer>
  );
};
