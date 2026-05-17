import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useT, arPlural } from '@/lib/i18n';
import { useUiStore } from '@/store/ui-store';
import type { FinancialSignalDto, SignalSeverity } from '../types';

interface ExecutiveFocusBarProps {
  signals: FinancialSignalDto[];
}

/** Severity-based visual config: only the highest severity gets strong color */
const severityStyles: Record<SignalSeverity, { icon: string; bg: string; size: number }> = {
  CRITICAL: { icon: 'text-danger', bg: 'bg-danger/10', size: 14 },
  WARNING: { icon: 'text-brand-primary', bg: 'bg-brand-primary/10', size: 14 },
  INFO: { icon: 'text-ink-muted', bg: 'bg-surface-high', size: 12 },
  NONE: { icon: 'text-ink-muted', bg: 'bg-surface-high', size: 12 },
};

/** Muted style for secondary severity badges */
const mutedStyle = { icon: 'text-ink-muted/60', bg: 'bg-surface-high/40', size: 12 };

function getHighestSeverity(signals: FinancialSignalDto[]): SignalSeverity {
  const order: SignalSeverity[] = ['CRITICAL', 'WARNING', 'INFO', 'NONE'];
  for (const sev of order) {
    if (signals.some((s) => s.severity === sev)) return sev;
  }
  return 'NONE';
}

/**
 * ExecutiveFocusBar — lightweight operational status strip.
 * Shows a single-line summary of what needs attention today.
 * Calm, not alarming. Informational, not decorative.
 *
 * Only the highest-severity signal uses strong color treatment.
 * Secondary severity counts use muted tones to reduce badge noise.
 */
export const ExecutiveFocusBar = ({ signals }: ExecutiveFocusBarProps) => {
  const t = useT();
  const navigate = useNavigate();
  const language = useUiStore((s) => s.language);

  const actionableSignals = signals.filter(
    (s) => s.status === 'NEW' || (s.severity === 'CRITICAL' && s.status !== 'RESOLVED' && s.status !== 'SNOOZED'),
  );

  const awaitingReviewCount = actionableSignals.length;

  if (awaitingReviewCount === 0) return null;

  const highestSeverity = getHighestSeverity(actionableSignals);
  const primaryStyle = severityStyles[highestSeverity];

  // Group counts by severity for inline breakdown
  const criticalCount = actionableSignals.filter((s) => s.severity === 'CRITICAL').length;
  const warningCount = actionableSignals.filter((s) => s.severity === 'WARNING').length;
  const infoCount = actionableSignals.filter((s) => s.severity === 'INFO' || s.severity === 'NONE').length;

  const SeverityIcon = highestSeverity === 'CRITICAL' ? AlertCircle
    : highestSeverity === 'WARNING' ? AlertTriangle
    : Info;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 rtl:px-5 py-3 rounded-xl bg-surface-high/60 border border-outline/15">
      <div className="flex items-center gap-3 rtl:gap-4 min-w-0">
        {/* Primary severity icon — strong color only for highest severity */}
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${primaryStyle.bg} ${primaryStyle.icon} shrink-0`}>
          <SeverityIcon size={primaryStyle.size} aria-hidden="true" />
        </div>

        <div className="flex items-center gap-2 rtl:gap-3 min-w-0">
          {/* Primary count — highest severity gets strong treatment */}
          {criticalCount > 0 && (
            <span className={`text-sm tabular-nums font-semibold ${highestSeverity === 'CRITICAL' ? 'text-danger' : mutedStyle.icon}`}>
              {criticalCount}
            </span>
          )}

          {/* Secondary counts — always muted */}
          {warningCount > 0 && (
            <span className={`text-sm tabular-nums ${highestSeverity === 'WARNING' && criticalCount === 0 ? 'font-semibold text-ink' : 'text-ink-muted/60'}`}>
              {criticalCount > 0 && '+ '}{warningCount}
            </span>
          )}
          {infoCount > 0 && (
            <span className="text-sm tabular-nums text-ink-muted/50">
              {(criticalCount > 0 || warningCount > 0) && '+ '}{infoCount}
            </span>
          )}

          <span className="text-sm text-ink-muted truncate">
            {language === 'ar'
              ? arPlural(awaitingReviewCount, {
                  one: 'إشارة تتطلب انتباهك',
                  two: 'إشارتان تتطلبان انتباهك',
                  few: 'إشارات تتطلب انتباهك',
                  many: 'إشارة تتطلب انتباهك',
                })
              : `${awaitingReviewCount} ${t('signal.focusBar.needsAttention')}`}
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate('/app/assistant?filter=priority')}
        aria-label={t('signal.focusBar.reviewCta')}
        className="shrink-0 min-h-[44px] min-w-[44px]"
      >
        {t('signal.focusBar.reviewCta')}
      </Button>
    </div>
  );
};
