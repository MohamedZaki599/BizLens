'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';
import { Header } from './Header';
import { Footer } from './Footer';

interface LegalPageProps {
  titleKey: string;
  updatedKey: string;
  bodyKey: string;
}

export const LegalPage = ({ titleKey, updatedKey, bodyKey }: LegalPageProps) => {
  const { language } = useUi();
  return (
    <>
      <Header />
      <main className="py-16 md:py-20">
        <article className="max-w-3xl mx-auto px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden />
            {t(language, 'legal.back')}
          </Link>
          <h1 className="mt-6 font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, titleKey)}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{t(language, updatedKey)}</p>
          <div className="mt-8 prose prose-zinc max-w-none text-ink-muted leading-relaxed">
            <p>{t(language, bodyKey)}</p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};
