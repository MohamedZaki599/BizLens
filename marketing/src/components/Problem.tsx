'use client';

import { AlertTriangle, Eye, Microscope } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const points = [
  { key: 'p1', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
  { key: 'p2', icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'p3', icon: Microscope, color: 'text-primary-container', bg: 'bg-primary-container/10' },
] as const;

export const Problem = () => {
  const { language } = useUi();
  return (
    <section
      id="problem"
      className="relative py-20 md:py-28 bg-gradient-to-b from-transparent to-surface-low/40"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-danger">
            {t(language, 'problem.eyebrow')}
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'problem.title')}
          </h2>
          <p className="mt-4 text-lg text-ink-muted leading-relaxed">
            {t(language, 'problem.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {points.map(({ key, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="rounded-2xl p-6 bg-surface-lowest border border-outline/30 hover:border-outline/60 transition-all"
            >
              <span
                aria-hidden
                className={`h-11 w-11 rounded-xl flex items-center justify-center ${bg} ${color}`}
              >
                <Icon size={20} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {t(language, `problem.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {t(language, `problem.${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
