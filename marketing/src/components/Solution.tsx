'use client';

import { Activity, Sparkles, Zap } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const steps = [
  { key: 's1', icon: Zap },
  { key: 's2', icon: Activity },
  { key: 's3', icon: Sparkles },
] as const;

export const Solution = () => {
  const { language } = useUi();
  return (
    <section id="solution" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {t(language, 'solution.eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'solution.title')}
          </h2>
          <p className="mt-4 text-lg text-ink-muted leading-relaxed">
            {t(language, 'solution.subtitle')}
          </p>
        </div>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ key, icon: Icon }, idx) => (
            <li
              key={key}
              className="relative rounded-2xl p-6 bg-gradient-to-br from-surface-lowest to-surface-low border border-outline/30"
            >
              <span
                aria-hidden
                className="absolute -top-3 start-6 h-7 w-7 rounded-lg bg-primary text-on-primary text-xs font-semibold flex items-center justify-center shadow-ambient"
              >
                {idx + 1}
              </span>
              <span
                aria-hidden
                className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {t(language, `solution.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {t(language, `solution.${key}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
