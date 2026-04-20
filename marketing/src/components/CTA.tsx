'use client';

import { ArrowRight } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

export const CTA = () => {
  const { language } = useUi();
  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container text-on-primary p-10 md:p-14 text-center">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <h2 className="relative font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'cta.section.title')}
          </h2>
          <p className="relative mt-3 text-on-primary/80 text-lg max-w-xl mx-auto">
            {t(language, 'cta.section.body')}
          </p>
          <a
            href={`${APP_URL}/register`}
            className="relative mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-primary font-semibold hover:bg-white/95 transition-all"
          >
            {t(language, 'cta.start')}
            <ArrowRight size={16} className="rtl:rotate-180" />
          </a>
          <p className="relative mt-4 text-on-primary/70 text-xs">
            {t(language, 'cta.section.note')}
          </p>
        </div>
      </div>
    </section>
  );
};
