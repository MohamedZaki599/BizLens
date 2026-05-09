import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  RefreshCw,
  Sparkles,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react';
import { useAssistantDigest } from '@/features/dashboard/hooks/useDashboardQuery';
import type { AssistantNote, AssistantTone } from '@/features/dashboard/api/widgets.api';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useT, useTi } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const toneIcon: Record<AssistantTone, LucideIcon> = {
  positive: CheckCircle2,
  neutral: Info,
  warning: AlertTriangle,
  negative: TrendingDown,
};

const toneClasses: Record<AssistantTone, { chip: string; rail: string; metric: string }> = {
  positive: {
    chip: 'bg-secondary/10 text-secondary',
    rail: 'bg-secondary/60',
    metric: 'text-secondary',
  },
  neutral: {
    chip: 'bg-primary/10 text-primary',
    rail: 'bg-primary/40',
    metric: 'text-ink',
  },
  warning: {
    chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    rail: 'bg-amber-500/60',
    metric: 'text-amber-600 dark:text-amber-300',
  },
  negative: {
    chip: 'bg-danger/10 text-danger',
    rail: 'bg-danger/70',
    metric: 'text-danger',
  },
};

const useFormatTime = () => {
  const lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  return useMemo(
    () =>
      new Intl.DateTimeFormat(lang, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [lang],
  );
};

const NoteCard = ({ note }: { note: AssistantNote }) => {
  const t = useT();
  const navigate = useNavigate();
  const Icon = toneIcon[note.tone];
  const tone = toneClasses[note.tone];

  const handleAction = () => {
    if (!note.action) return;
    if (note.action.type === 'navigate' && note.action.payload.route) {
      navigate(note.action.payload.route);
      return;
    }
    if (note.action.type === 'filter' && note.action.payload.categoryId) {
      const params = new URLSearchParams();
      params.set('categoryId', note.action.payload.categoryId);
      if (note.action.payload.type) params.set('type', note.action.payload.type);
      navigate(`/app/transactions?${params.toString()}`);
    }
  };

  return (
    <article
      className={cn(
        'card relative overflow-hidden p-5 sm:p-6',
        note.priority === 'high' && 'ring-1 ring-primary/15 shadow-ambient',
      )}
    >
      <span aria-hidden className={cn('absolute inset-y-0 start-0 w-1', tone.rail)} />
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            'h-10 w-10 shrink-0 rounded-xl flex items-center justify-center',
            tone.chip,
          )}
        >
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="font-display text-base font-semibold tracking-tight text-ink">
              {note.title}
            </h3>
            {note.metric && (
              <span className={cn('text-xs font-medium tabular-nums', tone.metric)}>
                {note.metric}
              </span>
            )}
            <span className="ms-auto text-[10px] uppercase tracking-wide text-ink-muted">
              {note.priority === 'high'
                ? t('assistant.priority.high')
                : t('assistant.priority.normal')}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{note.message}</p>
          {note.action && (
            <div className="mt-3">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-ring rounded"
              >
                {note.action.label}
                <ArrowRight size={12} aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export const AssistantPage = () => {
  const t = useT();
  const ti = useTi();
  const formatTime = useFormatTime();
  const { data, isLoading, isFetching, refetch } = useAssistantDigest();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight inline-flex items-center gap-2">
            <Sparkles size={22} className="text-primary" aria-hidden />
            {t('assistant.title')}
          </h1>
          <p className="text-ink-muted mt-1">{t('assistant.subtitle')}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          loading={isFetching}
        >
          <RefreshCw size={14} aria-hidden />
          {t('assistant.refresh')}
        </Button>
      </header>

      {isLoading ? (
        <div className="grid gap-4" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data || data.notes.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t('assistant.empty.title')}
          subtitle={t('assistant.empty.subtitle')}
        />
      ) : (
        <>
          <section className="card bg-primary/5 border-primary/15">
            <p className="text-xs uppercase tracking-wide text-primary font-medium">
              {t('assistant.headline')}
            </p>
            <p className="font-display text-lg sm:text-xl font-semibold text-ink mt-1.5 leading-snug">
              {data.headline}
            </p>
            <p className="text-[11px] text-ink-muted mt-2">
              {ti('assistant.generatedAt', {
                time: formatTime.format(new Date(data.generatedAt)),
              })}
            </p>
          </section>

          <div className="grid gap-3">
            {data.notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
