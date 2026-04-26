'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const QUESTIONS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export const FAQ = () => {
  const { language } = useUi();
  const [openId, setOpenId] = useState<string | null>(QUESTIONS[0]);

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'faq.title')}
          </h2>
          <p className="mt-4 text-ink-muted">{t(language, 'faq.subtitle')}</p>
        </div>

        <div className="mt-10 divide-y divide-outline/30 border border-outline/30 rounded-2xl overflow-hidden bg-surface-lowest">
          {QUESTIONS.map((id) => {
            const open = openId === id;
            return (
              <div key={id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : id)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start hover:bg-surface-high/50 transition-colors"
                >
                  <span className="font-medium text-ink">{t(language, `faq.${id}.q`)}</span>
                  <ChevronDown
                    size={16}
                    aria-hidden
                    className={`text-ink-muted transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-5 -mt-1 text-sm text-ink-muted leading-relaxed animate-fade-in">
                    {t(language, `faq.${id}.a`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
