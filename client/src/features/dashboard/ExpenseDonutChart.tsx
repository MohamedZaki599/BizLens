import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useExpenseComposition } from './useWidgets';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { formatCurrency } from '@/lib/utils';
import type { DashboardRange } from './dashboard.api';

const FALLBACK_COLORS = ['#7c5cff', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#84cc16'];

export const ExpenseDonutChart = ({ range }: { range?: DashboardRange }) => {
  const t = useT();
  const { data, isLoading } = useExpenseComposition(range);

  if (isLoading) {
    return (
      <div className="card" aria-busy>
        <Skeleton className="h-3 w-32 mb-4" />
        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="stat-label mb-4">{t('charts.composition.title')}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              animationDuration={600}
            >
              {data.map((entry, i) => (
                <Cell key={entry.id} fill={entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { share?: number } }> }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="rounded-xl bg-surface-lowest border border-outline/30 shadow-ambient p-3 text-xs">
                    <p className="font-medium text-ink">{d.name}</p>
                    <p className="text-ink-muted">{formatCurrency(d.value ?? 0)} ({d.payload?.share ?? 0}%)</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {data.map((entry, i) => (
            <div key={entry.id} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: entry.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
              />
              <span className="text-ink truncate flex-1">{entry.name}</span>
              <span className="text-ink-muted tabular-nums">{entry.share}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
