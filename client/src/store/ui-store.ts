import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Theme } from '@/types/domain';

/**
 * Currency code persisted alongside theme/language. We keep the type loose
 * (any ISO 4217 code) but expose a curated default list elsewhere.
 */
export type Currency = string;

interface UiState {
  theme: Theme;
  language: Language;
  currency: Currency;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'en',
      currency: 'USD',
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next });
        applyTheme(next);
      },
      setLanguage: (language) => {
        set({ language });
        applyLanguage(language);
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'bizlens-ui',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyTheme(state.theme);
        applyLanguage(state.language);
      },
    },
  ),
);

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const applyLanguage = (lang: Language) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
};
