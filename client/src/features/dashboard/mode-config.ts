import type { UserMode } from '@/types/domain';

/**
 * Per-mode dashboard tuning. Drives:
 *  - which KPIs are emphasized
 *  - the headline message
 *  - which secondary section is rendered
 *
 * Keep this declarative — no JSX here. UI components consume the config.
 */
export interface ModeConfig {
  headlineKey: string;
  /** Stat cards to emphasize (rendered in this order). */
  primaryStats: Array<'income' | 'expense' | 'profit' | 'margin' | 'count'>;
  /** Whether to surface the income breakdown card prominently. */
  showIncomeBreakdown: boolean;
  /** Whether to surface the expense breakdown card prominently. */
  showExpenseBreakdown: boolean;
  /** Mode-specific tip rendered as a soft banner. */
  tipKey: string;
}

export const MODE_CONFIG: Record<UserMode, ModeConfig> = {
  FREELANCER: {
    headlineKey: 'mode.freelancer.headline',
    primaryStats: ['income', 'profit', 'expense', 'count'],
    showIncomeBreakdown: true,
    showExpenseBreakdown: true,
    tipKey: 'mode.freelancer.tip',
  },
  ECOMMERCE: {
    headlineKey: 'mode.ecommerce.headline',
    primaryStats: ['expense', 'profit', 'income', 'margin'],
    showIncomeBreakdown: false,
    showExpenseBreakdown: true,
    tipKey: 'mode.ecommerce.tip',
  },
  SERVICE_BUSINESS: {
    headlineKey: 'mode.business.headline',
    primaryStats: ['profit', 'income', 'expense', 'margin'],
    showIncomeBreakdown: true,
    showExpenseBreakdown: true,
    tipKey: 'mode.business.tip',
  },
};
