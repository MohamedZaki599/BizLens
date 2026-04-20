'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Language } from '@/lib/i18n';

type Theme = 'light' | 'dark';

interface UiState {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const Ctx = createContext<UiState | null>(null);

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedTheme = (typeof window !== 'undefined' && localStorage.getItem('mkt-theme')) as Theme | null;
    const storedLang = (typeof window !== 'undefined' && localStorage.getItem('mkt-lang')) as Language | null;
    if (storedTheme) setTheme(storedTheme);
    if (storedLang) setLanguage(storedLang);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('mkt-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('mkt-lang', language);
  }, [language]);

  return (
    <Ctx.Provider
      value={{
        theme,
        language,
        toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
        toggleLanguage: () => setLanguage((l) => (l === 'en' ? 'ar' : 'en')),
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useUi = (): UiState => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUi must be used inside <UiProvider>');
  return ctx;
};
