import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { AlertCircle } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { FinancialSignalDto } from '../types';

interface ExecutiveFocusBarProps {
  signals: FinancialSignalDto[];
}

/**
 * ExecutiveFocusBar — lightweight operational status strip.
 * Shows a single-line summary of what needs attention today.
 * Calm, not alarming. Informational, not decorative.
 */
export const ExecutiveFocusBar = ({ signals }: ExecutiveFocusBarProps) => {
  const t = useT();
  const navigate = useNavigate();

  const awaitingReviewCount = signals.filter(
    (s) => s.status === 'NEW' || (s.severity === 'CRITICAL' && s.status !== 'RESOLVED' && s.status !== 'SNOOZED'),
  ).length;

  if (awaitingReviewCount === 0) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-surface-high/60 border border-outline/15">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
          <AlertCircle size={14} aria-hidden="true" />
        </div>
        <p className="text-sm text-ink truncate">
          <span className="font-semibold tabular-nums">{awaitingReviewCount}</span>
          {' '}
          <span className="text-ink-muted">{t('signal.focusBar.needsAttention')}</span>
        </p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/app/assistant?filter=priority')}
        aria-label={t('signal.focusBar.reviewCta')}
        className="shrink-0 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
      >
        {t('signal.focusBar.reviewCta')}
      </Button>
    </div>
  );
};
