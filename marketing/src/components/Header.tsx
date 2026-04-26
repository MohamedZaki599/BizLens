'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Languages, Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';

interface NavItem {
  href: string;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '#problem', key: 'nav.problem' },
  { href: '#features', key: 'nav.features' },
  { href: '#compare', key: 'nav.compare' },
  { href: '#why', key: 'nav.why' },
];

export const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUi();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-outline/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary">
            <Sparkles size={16} strokeWidth={1.8} />
          </span>
          BizLens
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-sm text-ink-muted"
        >
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-ink transition-colors">
              {t(language, item.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-low flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label="Toggle language"
            title={language === 'en' ? 'العربية' : 'English'}
          >
            <Languages size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-low flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            href={siteConfig.links.login}
            className="hidden sm:inline-flex h-9 px-3 items-center text-sm font-medium text-ink hover:text-primary transition-colors"
          >
            {t(language, 'nav.signIn')}
          </a>
          <a
            href={siteConfig.links.register}
            className="hidden sm:inline-flex h-9 px-4 items-center text-sm font-medium rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary hover:brightness-110 transition-all"
          >
            {t(language, 'cta.start')}
          </a>

          <button
            onClick={() => setOpen(true)}
            className="md:hidden h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-low flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            aria-label={t(language, 'nav.openMenu')}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40">
          <button
            type="button"
            aria-label={t(language, 'nav.closeMenu')}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 top-0 bg-bg border-b border-outline/30 px-6 pt-4 pb-6 animate-fade-in"
          >
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 font-display font-bold text-lg tracking-tight"
              >
                <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary">
                  <Sparkles size={16} strokeWidth={1.8} />
                </span>
                BizLens
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label={t(language, 'nav.closeMenu')}
                className="h-9 w-9 rounded-lg bg-surface-high hover:bg-surface-low flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-1 text-base">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-xl text-ink hover:bg-surface-high transition-colors"
                >
                  {t(language, item.key)}
                </a>
              ))}
            </nav>
            <div className="mt-6 grid gap-3">
              <a
                href={siteConfig.links.register}
                className="h-11 px-4 inline-flex items-center justify-center text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary"
              >
                {t(language, 'cta.start')}
              </a>
              <a
                href={siteConfig.links.login}
                className="h-11 px-4 inline-flex items-center justify-center text-sm font-medium rounded-xl bg-surface-high text-ink"
              >
                {t(language, 'nav.signIn')}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
