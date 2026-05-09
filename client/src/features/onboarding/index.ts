// ─── Flow ─────────────────────────────────────────────────────────────────
export { OnboardingFlow } from './components/OnboardingFlow';

// ─── Activation ───────────────────────────────────────────────────────────
export { ActivationChecklist } from './components/ActivationChecklist';
export { ActivationProgressTracker } from './components/ActivationProgressTracker';

// ─── Empty States ─────────────────────────────────────────────────────────
export {
  EmptyStatePanel,
  NoDataEmpty,
  NoSignalsEmpty,
  ResolvedQueueEmpty,
  AssistantIdleEmpty,
  NoTrendsEmpty,
} from './components/EmptyStatePanel';

// ─── Signal ───────────────────────────────────────────────────────────────
export { SignalSpotlightCard } from './components/SignalSpotlightCard';

// ─── Guidance & Assistant ─────────────────────────────────────────────────
export { AssistantPromptSuggestions } from './components/AssistantPromptSuggestions';
export { OperationalGuidanceCard } from './components/OperationalGuidanceCard';

// ─── Store ────────────────────────────────────────────────────────────────
export {
  useOnboardingStore,
  useNeedsOnboarding,
  useActivationProgress,
} from './store/onboarding-store';

export type {
  OnboardingStage,
  ActivationMilestone,
  OperationalGoal,
  DataSource,
  BusinessContext,
} from './store/onboarding-store';
