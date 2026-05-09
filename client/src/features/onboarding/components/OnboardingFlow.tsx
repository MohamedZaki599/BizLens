import { useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../store/onboarding-store';
import { useT } from '@/lib/i18n';
import { WelcomeScreen } from './WelcomeScreen';
import { BusinessContextSetup } from './BusinessContextSetup';
import { SignalPreparationState } from './SignalPreparationState';
import { FirstSignalReveal } from './FirstSignalReveal';
import type { OperationalGoal, DataSource } from '../store/onboarding-store';

/**
 * OnboardingFlow — full-screen orchestrator for the onboarding experience.
 */
export const OnboardingFlow = () => {
  const t = useT();
  const navigate = useNavigate();
  const stage = useOnboardingStore((s) => s.stage);
  const setStage = useOnboardingStore((s) => s.setStage);
  const setBusinessContext = useOnboardingStore((s) => s.setBusinessContext);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const completeMilestone = useOnboardingStore((s) => s.completeMilestone);

  const handleWelcomeContinue = useCallback(() => {
    setStage('business-context');
  }, [setStage]);

  const handleContextComplete = useCallback(
    (ctx: { businessType: string; operationalGoal: OperationalGoal; dataSource: DataSource }) => {
      setBusinessContext(ctx);
      setStage('signal-preparation');
    },
    [setBusinessContext, setStage],
  );

  const handleContextBack = useCallback(() => {
    setStage('welcome');
  }, [setStage]);

  const handlePreparationReady = useCallback(() => {
    completeMilestone('first_signal');
    setStage('first-signal');
  }, [setStage, completeMilestone]);

  const handleFirstSignalContinue = useCallback(() => {
    completeOnboarding();
    completeMilestone('data_connected'); // Mark data as "connected" since they finished the setup sequence
    navigate('/app', { replace: true });
  }, [completeOnboarding, completeMilestone, navigate]);

  const mockSignal = useMemo(() => ({
    key: 'first-spending-anomaly',
    title: t('onboarding.firstSignal.mock.title'),
    explanation: t('onboarding.firstSignal.mock.desc'),
    severity: 'warning' as const,
    trend: 'up' as const,
    confidence: 0.94,
    action: {
      label: t('onboarding.firstSignal.mock.action'),
      route: '/app/signals/first-spending-anomaly',
    },
  }), [t]);

  return (
    <AnimatePresence mode="wait">
      {stage === 'welcome' && (
        <WelcomeScreen key="welcome" onContinue={handleWelcomeContinue} />
      )}
      {stage === 'business-context' && (
        <BusinessContextSetup
          key="context"
          onComplete={handleContextComplete}
          onBack={handleContextBack}
        />
      )}
      {stage === 'signal-preparation' && (
        <SignalPreparationState key="prep" onReady={handlePreparationReady} />
      )}
      {stage === 'first-signal' && (
        <FirstSignalReveal
          key="reveal"
          signal={mockSignal}
          onContinue={handleFirstSignalContinue}
        />
      )}
    </AnimatePresence>
  );
};
