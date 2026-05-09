import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  ShoppingCart,
  Wrench,
  TrendingDown,
  TrendingUp,
  PieChart,
  Activity,
  FileSpreadsheet,
  Upload,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useT } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import type { OperationalGoal, DataSource } from '../store/onboarding-store';

interface BusinessContextSetupProps {
  onComplete: (ctx: {
    businessType: string;
    operationalGoal: OperationalGoal;
    dataSource: DataSource;
  }) => void;
  onBack: () => void;
}

// ─── Sub-step definitions ─────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { id: 'FREELANCER', icon: Briefcase, colorClass: 'text-primary-container' },
  { id: 'ECOMMERCE', icon: ShoppingCart, colorClass: 'text-secondary' },
  { id: 'SERVICE_BUSINESS', icon: Wrench, colorClass: 'text-primary' },
] as const;

const GOALS: { id: OperationalGoal; icon: typeof TrendingDown }[] = [
  { id: 'reduce_spending', icon: TrendingDown },
  { id: 'grow_revenue', icon: TrendingUp },
  { id: 'track_profitability', icon: PieChart },
  { id: 'monitor_cashflow', icon: Activity },
];

const DATA_SOURCES: { id: DataSource; icon: typeof FileSpreadsheet }[] = [
  { id: 'manual_entry', icon: FileSpreadsheet },
  { id: 'csv_import', icon: Upload },
  { id: 'connect_later', icon: Clock },
];

// ─── Component ────────────────────────────────────────────────────────────

export const BusinessContextSetup = ({ onComplete, onBack }: BusinessContextSetupProps) => {
  const t = useT();
  const lang = useUiStore((s) => s.language);
  const isRtl = lang === 'ar';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [goal, setGoal] = useState<OperationalGoal | null>(null);
  const [dataSource, setDataSource] = useState<DataSource | null>(null);

  const handleNext = () => {
    if (step === 0 && businessType) setStep(1);
    else if (step === 1 && goal) setStep(2);
    else if (step === 2 && dataSource) {
      onComplete({ businessType: businessType!, operationalGoal: goal!, dataSource });
    }
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  const canProceed = (step === 0 && businessType) || (step === 1 && goal) || (step === 2 && dataSource);

  const stepTitles = [
    t('onboarding.context.step1.title'),
    t('onboarding.context.step2.title'),
    t('onboarding.context.step3.title'),
  ];

  const stepSubtitles = [
    t('onboarding.context.step1.subtitle'),
    t('onboarding.context.step2.subtitle'),
    t('onboarding.context.step3.subtitle'),
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="relative z-10 max-w-md w-full">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-300 ease-quintessential',
                i === step ? 'w-8 bg-primary-container' : i < step ? 'w-2 bg-primary/40' : 'w-2 bg-outline/40',
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink text-center">
              {stepTitles[step]}
            </h2>
            <p className="text-sm text-ink-muted text-center mt-2 mb-8">
              {stepSubtitles[step]}
            </p>

            {/* Step 0: Business type */}
            {step === 0 && (
              <div className="grid gap-3">
                {BUSINESS_TYPES.map(({ id, icon: Icon, colorClass }) => (
                  <button
                    key={id}
                    onClick={() => setBusinessType(id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl border text-start',
                      'transition-all duration-200 ease-quintessential focus-ring',
                      businessType === id
                        ? 'border-primary-container bg-primary-container/10 shadow-glow'
                        : 'border-outline/20 bg-surface-lowest hover:border-outline/50 hover:bg-surface-low',
                    )}
                  >
                    <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0 bg-surface-high', colorClass)}>
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{t(`onboarding.context.type.${id}`)}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{t(`onboarding.context.type.${id}.desc`)}</p>
                    </div>
                    {businessType === id && (
                      <Check size={18} className="text-primary-container shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Operational goal */}
            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setGoal(id)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-5 rounded-2xl border text-center',
                      'transition-all duration-200 ease-quintessential focus-ring',
                      goal === id
                        ? 'border-primary-container bg-primary-container/10 shadow-glow'
                        : 'border-outline/20 bg-surface-lowest hover:border-outline/50',
                    )}
                  >
                    <div className={cn(
                      'h-11 w-11 rounded-xl flex items-center justify-center',
                      goal === id ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-high text-ink-muted',
                    )}>
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-ink leading-tight">
                      {t(`onboarding.context.goal.${id}`)}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Data source */}
            {step === 2 && (
              <div className="grid gap-3">
                {DATA_SOURCES.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setDataSource(id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-2xl border text-start',
                      'transition-all duration-200 ease-quintessential focus-ring',
                      dataSource === id
                        ? 'border-primary-container bg-primary-container/10 shadow-glow'
                        : 'border-outline/20 bg-surface-lowest hover:border-outline/50',
                    )}
                  >
                    <div className={cn(
                      'h-11 w-11 rounded-xl flex items-center justify-center shrink-0',
                      dataSource === id ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-high text-ink-muted',
                    )}>
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{t(`onboarding.context.source.${id}`)}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{t(`onboarding.context.source.${id}.desc`)}</p>
                    </div>
                    {dataSource === id && (
                      <Check size={18} className="text-primary-container shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors focus-ring px-3 py-2 rounded-lg"
          >
            <BackArrow size={16} />
            {t('onboarding.back')}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(
              'flex items-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm',
              'transition-all duration-200 ease-quintessential focus-ring',
              canProceed
                ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-glow hover:brightness-110 active:scale-[0.98]'
                : 'bg-surface-high text-ink-muted cursor-not-allowed',
            )}
          >
            {step === 2 ? t('onboarding.context.finish') : t('onboarding.next')}
            <Arrow size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
