'use client';

import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

export const Why = () => {
  const { language } = useUi();
  return (
    <section id="why" className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          {t(language, 'why.title')}
        </h2>
        <p className="mt-4 font-display text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
          {t(language, 'why.subtitle')}
        </p>
        <p className="mt-6 text-ink-muted text-lg leading-relaxed">{t(language, 'why.body')}</p>
      </div>
    </section>
  );
};
