// ─── Onboarding ───────────────────────────────────────────────────────────
export { OnboardingFlow } from './components/OnboardingFlow';
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

// ─── Guidance & Assistant ─────────────────────────────────────────────────
export { AssistantPromptSuggestions } from './components/AssistantPromptSuggestions';
export { AssistantDrawer } from './components/AssistantDrawer';
export { useAssistantStore } from './store/assistant-store';
export { OperationalGuidanceCard } from './components/OperationalGuidanceCard';

// ─── Store ────────────────────────────────────────────────────────────────
export { useOnboardingStore } from './store/onboarding-store';
export type { OnboardingStage, MilestoneKey } from './store/onboarding-store';
