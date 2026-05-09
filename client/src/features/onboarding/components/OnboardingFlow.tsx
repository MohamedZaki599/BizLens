import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '../store/onboarding-store';
import { WelcomeScreen } from './WelcomeScreen';
import { BusinessContextSetup } from './BusinessContextSetup';
import { SignalPreparationState } from './SignalPreparationState';
import { FirstSignalReveal } from './FirstSignalReveal';
import type { OperationalGoal, DataSource } from '../store/onboarding-store';

/**
 * OnboardingFlow — full-screen orchestrator for the onboarding experience.
 *
 * Renders the appropriate stage component and manages transitions.
 * Once onboarding is complete, the parent route will stop rendering
 * this component and show the dashboard instead.
 */
export const OnboardingFlow = () => {
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
    setStage('first-signal');
  }, [setStage]);

  const handleFirstSignalContinue = useCallback(() => {
    completeOnboarding();
    completeMilestone('data_connected');
    navigate('/app', { replace: true });
  }, [completeOnboarding, completeMilestone, navigate]);

  const MOCK_SIGNAL = {
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
  };

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
          signal={MOCK_SIGNAL}
          onContinue={handleFirstSignalContinue}
        />
      )}
    </AnimatePresence>
  );
};
