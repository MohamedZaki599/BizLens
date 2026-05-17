'use client';

import {
  Bell,
  Brain,
  Droplet,
  Palette,
  Target,
  UserCog,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

interface FeatureItem {
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
}

const ITEMS: FeatureItem[] = [
  { icon: Bell, titleKey: 'features.f1.title', bodyKey: 'features.f1.body' },
  { icon: Brain, titleKey: 'features.f2.title', bodyKey: 'features.f2.body' },
  { icon: Droplet, titleKey: 'features.f3.title', bodyKey: 'features.f3.body' },
  { icon: Target, titleKey: 'features.f4.title', bodyKey: 'features.f4.body' },
  { icon: Zap, titleKey: 'features.f5.title', bodyKey: 'features.f5.body' },
  { icon: UserCog, titleKey: 'features.f6.title', bodyKey: 'features.f6.body' },
];

void Palette;

export const Features = () => {
  const { language } = useUi();
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'features.title')}
          </h2>
          <p className="mt-4 text-ink-muted text-lg">{t(language, 'features.subtitle')}</p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ITEMS.map(({ icon: Icon, titleKey, bodyKey }, idx) => (
            <div
              key={titleKey}
              className={`rounded-3xl p-6 bg-surface-lowest hover:-translate-y-0.5 transition-transform duration-300 ease-quintessential ${idx < 2 ? 'border border-primary/15' : ''}`}
            >
              <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">
                {t(language, titleKey)}
              </h3>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">{t(language, bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
