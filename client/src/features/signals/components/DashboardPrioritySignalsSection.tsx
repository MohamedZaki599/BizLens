import { useSignalsQuery } from '../hooks/useSignalsQuery';
import { mapSignalToPriorityVM } from '../adapters/signalAdapters';
import { SignalCard } from './SignalCard';
import { Skeleton } from '@/components/Skeleton';
import { AlertCircle } from 'lucide-react';

export const DashboardPrioritySignalsSection = () => {
  const { data, isLoading, isError, isFetching } = useSignalsQuery('dashboard');

  if (isLoading) {
    return (
      <section className="mb-8 animate-fade-in" aria-busy="true">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">What Changed</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[280px] w-full rounded-2xl" />
          <Skeleton className="h-[280px] w-full rounded-2xl hidden md:block" />
          <Skeleton className="h-[280px] w-full rounded-2xl hidden lg:block" />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="mb-8">
        <div className="p-4 bg-danger/10 text-danger rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">Failed to load priority signals.</p>
        </div>
      </section>
    );
  }

  // Filter out the raw signals that we consider "Priority" (e.g. WARNING or CRITICAL, or top 3)
  // For now, let's sort by severity and pick top 3
  const sorted = [...data].sort((a, b) => {
    const weights = { CRITICAL: 3, WARNING: 2, INFO: 1, NONE: 0 };
    return weights[b.severity] - weights[a.severity];
  });
  
  const topSignals = sorted.slice(0, 3).filter(s => s.severity !== 'NONE');

  if (topSignals.length === 0) {
    return null; // Don't show the section if no priority signals
  }

  const viewModels = topSignals.map(s => mapSignalToPriorityVM(s, isFetching));

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">What Changed</h2>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-high text-ink-muted border border-outline/10">
          AI Curated Signals
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {viewModels.map(vm => (
          <SignalCard key={vm.id} signal={vm} />
        ))}
      </div>
    </section>
  );
};
