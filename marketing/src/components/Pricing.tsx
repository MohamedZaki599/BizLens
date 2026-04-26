'use client';

import { Check } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';
import { siteConfig } from '@/lib/site';

interface Plan {
  id: 'free' | 'pro' | 'team';
  highlight?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    features: ['pricing.free.f1', 'pricing.free.f2', 'pricing.free.f3'],
  },
  {
    id: 'pro',
    highlight: true,
    features: ['pricing.pro.f1', 'pricing.pro.f2', 'pricing.pro.f3', 'pricing.pro.f4'],
  },
  {
    id: 'team',
    features: ['pricing.team.f1', 'pricing.team.f2', 'pricing.team.f3'],
  },
];

export const Pricing = () => {
  const { language } = useUi();
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'pricing.title')}
          </h2>
          <p className="mt-4 text-ink-muted text-lg leading-relaxed">
            {t(language, 'pricing.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-7 border transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary border-transparent shadow-2xl scale-[1.02]'
                  : 'bg-surface-lowest border-outline/30'
              }`}
            >
              {plan.highlight && (
                <span className="absolute top-3 end-3 text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-1 rounded-full bg-white/15">
                  {t(language, 'pricing.popular')}
                </span>
              )}
              <p
                className={`text-sm font-medium ${
                  plan.highlight ? 'text-on-primary/80' : 'text-ink-muted'
                }`}
              >
                {t(language, `pricing.${plan.id}.name`)}
              </p>
              <p className="mt-3 font-display text-4xl font-bold tracking-tight">
                {t(language, `pricing.${plan.id}.price`)}
              </p>
              <p
                className={`mt-1 text-sm ${
                  plan.highlight ? 'text-on-primary/80' : 'text-ink-muted'
                }`}
              >
                {t(language, `pricing.${plan.id}.cadence`)}
              </p>
              <ul className="mt-6 space-y-2.5">
                {plan.features.map((featKey) => (
                  <li key={featKey} className="flex items-start gap-2 text-sm">
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        plan.highlight ? 'text-on-primary' : 'text-secondary'
                      }`}
                      aria-hidden
                    />
                    <span>{t(language, featKey)}</span>
                  </li>
                ))}
              </ul>
              <a
                href={siteConfig.links.register}
                className={`mt-6 inline-flex items-center justify-center w-full h-11 rounded-xl font-medium text-sm transition-all ${
                  plan.highlight
                    ? 'bg-white text-primary hover:bg-white/95'
                    : 'bg-surface-high hover:bg-surface-low text-ink'
                }`}
              >
                {t(language, `pricing.${plan.id}.cta`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
