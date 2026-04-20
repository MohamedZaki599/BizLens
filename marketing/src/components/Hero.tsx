'use client';

import { AlertTriangle, ArrowRight, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

export const Hero = () => {
  const { language } = useUi();
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-32 -left-24 h-80 w-80 rounded-full bg-primary-container/30 blur-3xl" />
        <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-high text-xs font-medium text-ink-muted">
            <Sparkles size={13} className="text-primary-container" />
            {t(language, 'hero.eyebrow')}
          </div>

          <h1 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tightest leading-[1.05]">
            {t(language, 'hero.title')}
          </h1>

          <p className="mt-5 text-lg text-ink-muted leading-relaxed max-w-xl">
            {t(language, 'hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`${APP_URL}/register`}
              className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-medium hover:brightness-110 transition-all"
            >
              {t(language, 'cta.start')}
              <ArrowRight size={16} />
            </a>
            <a
              href={`${APP_URL}/login`}
              className="h-12 px-6 inline-flex items-center gap-2 rounded-xl bg-surface-high text-ink hover:bg-surface-low font-medium transition-all"
            >
              {t(language, 'cta.primary')}
            </a>
          </div>

          <p className="mt-5 text-xs text-ink-muted">{t(language, 'hero.proof')}</p>
        </div>

        {/* Floating dashboard mockup */}
        <div className="relative animate-fade-in [animation-delay:120ms]">
          <div className="absolute -inset-6 bg-gradient-to-br from-primary-container/20 to-secondary/20 blur-2xl rounded-3xl" />

          {/* Live alert toast — visualizes the new alert system */}
          <div className="absolute -top-4 end-4 z-10 flex items-start gap-2 p-3 rounded-2xl bg-surface-lowest/95 backdrop-blur-xl border border-danger/30 shadow-2xl max-w-[260px] animate-fade-in [animation-delay:600ms]">
            <span
              aria-hidden
              className="h-7 w-7 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0"
            >
              <AlertTriangle size={13} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-ink leading-snug">
                {t(language, 'hero.alert.title')}
              </p>
              <p className="text-[10px] text-ink-muted mt-0.5 leading-relaxed">
                {t(language, 'hero.alert.body')}
              </p>
            </div>
          </div>

          <div className="relative rounded-3xl bg-surface-lowest/90 backdrop-blur-xl border-t border-white/10 shadow-2xl p-6 animate-float">
            {/* Insight strip */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-primary to-primary-container text-on-primary">
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">
                {t(language, 'hero.insight.title')}
              </p>
              <p className="font-display text-base font-semibold mt-1.5 leading-snug">
                {t(language, 'hero.insight.body')}
              </p>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl p-4 bg-surface-low">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {t(language, 'hero.metric.income')}
                </p>
                <p className="font-display text-2xl font-semibold mt-1.5">$12,480</p>
                <p className="text-xs text-secondary mt-1 inline-flex items-center gap-1">
                  <TrendingUp size={12} /> +18% MoM
                </p>
              </div>
              <div className="rounded-xl p-4 bg-surface-low">
                <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {t(language, 'hero.metric.profit')}
                </p>
                <p className="font-display text-2xl font-semibold mt-1.5">$7,920</p>
                <p className="text-xs text-secondary mt-1 inline-flex items-center gap-1">
                  <ArrowUpRight size={12} /> 63% margin
                </p>
              </div>
            </div>

            {/* Mini list */}
            <ul className="mt-4 space-y-2">
              {[
                ['Client retainer · Acme Co.', '+$2,400', 'pos'],
                ['Software · Figma', '−$15', 'neg'],
                ['Consulting · M.A.', '+$1,200', 'pos'],
              ].map(([label, val, tone]) => (
                <li
                  key={label}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-surface-low"
                >
                  <span className="text-sm text-ink truncate">{label}</span>
                  <span
                    className={`text-sm font-semibold ${tone === 'pos' ? 'text-secondary' : 'text-danger'}`}
                  >
                    {val}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
