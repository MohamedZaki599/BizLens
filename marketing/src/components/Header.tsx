'use client';

import Link from 'next/link';
import { Languages, Moon, Sparkles, Sun } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

export const Header = () => {
  const { theme, language, toggleTheme, toggleLanguage } = useUi();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-outline/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary">
            <Sparkles size={16} strokeWidth={1.8} />
          </span>
          BizLens
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
          <a href="#problem" className="hover:text-ink transition-colors">
            {t(language, 'nav.problem')}
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            {t(language, 'nav.features')}
          </a>
          <a href="#compare" className="hover:text-ink transition-colors">
            {t(language, 'nav.compare')}
          </a>
          <a href="#why" className="hover:text-ink transition-colors">
            {t(language, 'nav.why')}
          </a>
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
            href={`${APP_URL}/login`}
            className="hidden sm:inline-flex h-9 px-3 items-center text-sm font-medium text-ink hover:text-primary transition-colors"
          >
            {t(language, 'nav.signIn')}
          </a>
          <a
            href={`${APP_URL}/register`}
            className="h-9 px-4 inline-flex items-center text-sm font-medium rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary hover:brightness-110 transition-all"
          >
            {t(language, 'cta.start')}
          </a>
        </div>
      </div>
    </header>
  );
};
