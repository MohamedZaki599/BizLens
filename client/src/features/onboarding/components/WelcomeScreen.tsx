import { motion, Variants } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.12, duration: 0.6, ease: [0.23, 1, 0.32, 1] as any },
  }),
};

export const WelcomeScreen = ({ onContinue }: WelcomeScreenProps) => {
  const t = useT();
  const lang = useUiStore((s) => s.language);
  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const pillars = [
    {
      icon: Zap,
      title: t('onboarding.welcome.pillar1.title'),
      desc: t('onboarding.welcome.pillar1.desc'),
      gradient: 'from-primary-container/20 to-primary/10',
      iconColor: 'text-primary-container',
    },
    {
      icon: Shield,
      title: t('onboarding.welcome.pillar2.title'),
      desc: t('onboarding.welcome.pillar2.desc'),
      gradient: 'from-secondary/15 to-secondary/5',
      iconColor: 'text-secondary',
    },
    {
      icon: Sparkles,
      title: t('onboarding.welcome.pillar3.title'),
      desc: t('onboarding.welcome.pillar3.desc'),
      gradient: 'from-primary/10 to-primary-container/10',
      iconColor: 'text-primary',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 start-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-container/8 blur-[120px]" />
        <div className="absolute bottom-1/4 start-1/3 w-[400px] h-[400px] rounded-full bg-secondary/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-glow mb-8"
        >
          <Sparkles className="text-on-primary" size={28} strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-4xl md:text-5xl font-bold tracking-tightest text-ink"
        >
          {t('onboarding.welcome.title')}
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-4 text-lg text-ink-muted max-w-md mx-auto leading-relaxed"
        >
          {t('onboarding.welcome.subtitle')}
        </motion.p>

        {/* Value pillars */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 grid gap-3"
        >
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              custom={3 + i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={cn(
                'flex items-start gap-4 p-4 rounded-2xl text-start',
                'bg-gradient-to-br border border-outline/10',
                p.gradient,
              )}
            >
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center shrink-0',
                'bg-surface-lowest/60',
                p.iconColor,
              )}>
                <p.icon size={20} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{p.title}</p>
                <p className="text-sm text-ink-muted mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onClick={onContinue}
          className={cn(
            'mt-10 inline-flex items-center gap-2 h-12 px-8 rounded-xl',
            'bg-gradient-to-r from-primary to-primary-container text-on-primary',
            'font-semibold text-base shadow-glow',
            'hover:brightness-110 active:scale-[0.98]',
            'transition-all duration-200 ease-quintessential focus-ring',
          )}
        >
          {t('onboarding.welcome.cta')}
          <Arrow size={18} />
        </motion.button>

        {/* Trust signal */}
        <motion.p
          custom={7}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 text-xs text-ink-muted/60"
        >
          {t('onboarding.welcome.trust')}
        </motion.p>
      </div>
    </div>
  );
};
