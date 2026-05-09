import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────

export type OnboardingStage =
  | 'welcome'
  | 'business-context'
  | 'signal-preparation'
  | 'first-signal'
  | 'complete';

export type ActivationMilestone =
  | 'data_connected'
  | 'first_signal'
  | 'signal_reviewed'
  | 'first_action';

export type OperationalGoal =
  | 'reduce_spending'
  | 'grow_revenue'
  | 'track_profitability'
  | 'monitor_cashflow';

export type DataSource =
  | 'manual_entry'
  | 'csv_import'
  | 'connect_later';

export interface BusinessContext {
  businessType: string | null;
  operationalGoal: OperationalGoal | null;
  dataSource: DataSource | null;
}

interface OnboardingState {
  // Onboarding flow
  stage: OnboardingStage;
  hasCompletedOnboarding: boolean;
  businessContext: BusinessContext;
  
  // Activation milestones
  milestones: Record<ActivationMilestone, boolean>;
  showChecklist: boolean;
  
  // Actions
  setStage: (stage: OnboardingStage) => void;
  completeOnboarding: () => void;
  setBusinessContext: (ctx: Partial<BusinessContext>) => void;
  completeMilestone: (milestone: ActivationMilestone) => void;
  toggleChecklist: () => void;
  dismissChecklist: () => void;
  reset: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────

const initialMilestones: Record<ActivationMilestone, boolean> = {
  data_connected: false,
  first_signal: false,
  signal_reviewed: false,
  first_action: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      stage: 'welcome',
      hasCompletedOnboarding: false,
      businessContext: {
        businessType: null,
        operationalGoal: null,
        dataSource: null,
      },
      milestones: { ...initialMilestones },
      showChecklist: true,

      setStage: (stage) => set({ stage }),
      
      completeOnboarding: () =>
        set({ hasCompletedOnboarding: true, stage: 'complete' }),
      
      setBusinessContext: (ctx) =>
        set((state) => ({
          businessContext: { ...state.businessContext, ...ctx },
        })),

      completeMilestone: (milestone) =>
        set((state) => ({
          milestones: { ...state.milestones, [milestone]: true },
        })),
      
      toggleChecklist: () =>
        set((state) => ({ showChecklist: !state.showChecklist })),
      
      dismissChecklist: () => set({ showChecklist: false }),

      reset: () =>
        set({
          stage: 'welcome',
          hasCompletedOnboarding: false,
          businessContext: { businessType: null, operationalGoal: null, dataSource: null },
          milestones: { ...initialMilestones },
          showChecklist: true,
        }),
    }),
    { name: 'bizlens-onboarding' },
  ),
);

// ─── Derived Selectors ────────────────────────────────────────────────────
// IMPORTANT: Zustand selectors must return referentially stable values.
// Returning new objects inside selectors causes infinite re-render loops.
// We select primitives and derive the object via useMemo instead.

const MILESTONE_COUNT = Object.keys(initialMilestones).length;

export const useActivationProgress = () => {
  const milestones = useOnboardingStore((s) => s.milestones);

  return useMemo(() => {
    const completed = Object.values(milestones).filter(Boolean).length;
    return {
      completed,
      total: MILESTONE_COUNT,
      percentage: Math.round((completed / MILESTONE_COUNT) * 100),
    };
  }, [milestones]);
};

export const useNeedsOnboarding = () =>
  useOnboardingStore((s) => !s.hasCompletedOnboarding);
