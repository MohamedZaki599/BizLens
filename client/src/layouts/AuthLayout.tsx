import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  const t = useT();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary to-primary-container text-on-primary p-12 flex-col justify-between">
        <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <Sparkles size={22} strokeWidth={1.8} />
          {t('app.name')}
        </div>

        <div className="space-y-6 max-w-md animate-fade-in">
          <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tightest leading-[1.05]">
            Understand your business in under 10 seconds.
          </h1>
          <p className="text-on-primary/75 text-lg leading-relaxed">
            BizLens is your financial command center — built for freelancers, small shops, and
            service businesses who want clarity, not clutter.
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-on-primary/60">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          Live insights · Quick add · Beautiful dashboards
        </div>

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 -left-16 w-80 h-80 rounded-full bg-primary-container/40 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-bg">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
};
