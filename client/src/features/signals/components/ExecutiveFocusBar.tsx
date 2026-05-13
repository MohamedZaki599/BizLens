import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { AlertCircle, FileSearch, ShieldAlert } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { FinancialSignalDto } from '../types';

interface ExecutiveFocusBarProps {
  signals: FinancialSignalDto[];
}

export const ExecutiveFocusBar = ({ signals }: ExecutiveFocusBarProps) => {
  const t = useT();
  const navigate = useNavigate();

  const criticalCount = signals.filter(
    (s) => s.severity === 'CRITICAL' && s.status !== 'RESOLVED' && s.status !== 'SNOOZED',
  ).length;
  const investigatingCount = signals.filter((s) => s.status === 'INVESTIGATING').length;
  const awaitingReviewCount = signals.filter((s) => s.status === 'NEW').length;

  const hasActionableSignals = criticalCount > 0 || awaitingReviewCount > 0;

  return (
    <div className="sticky top-0 z-20 w-full mb-6 bg-surface p-4 rounded-xl border border-outline shadow-sm flex items-center justify-between gap-3 md:gap-6 overflow-x-auto">
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-danger/10 text-danger">
            <ShieldAlert size={16} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm text-ink-muted">{t('signal.focusBar.critical')}</div>
            <div className="text-xl font-semibold tabular-nums text-ink">{criticalCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-outline/50 hidden md:block" aria-hidden="true" />

        <div className="items-center gap-2 hidden md:flex shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning">
            <FileSearch size={16} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm text-ink-muted">{t('signal.focusBar.investigating')}</div>
            <div className="text-xl font-semibold tabular-nums text-ink">{investigatingCount}</div>
          </div>
        </div>

        <div className="w-px h-8 bg-outline/50 hidden md:block" aria-hidden="true" />

        <div className="items-center gap-2 hidden md:flex shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary">
            <AlertCircle size={16} aria-hidden="true" />
          </div>
          <div>
            <div className="text-sm text-ink-muted">{t('signal.focusBar.awaitingReview')}</div>
            <div className="text-xl font-semibold tabular-nums text-ink">{awaitingReviewCount}</div>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <Button
          onClick={() => navigate('/app/assistant?filter=priority')}
          disabled={!hasActionableSignals}
          aria-label={t('signal.focusBar.reviewCta')}
          className="focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-opacity active:opacity-80"
        >
          {t('signal.focusBar.reviewCta')}
        </Button>
      </div>
    </div>
  );
};
