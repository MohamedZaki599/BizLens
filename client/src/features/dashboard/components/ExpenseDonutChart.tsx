import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import { useExpenseComposition } from '../hooks/useDashboardQuery';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { useFormatCurrency } from '@/lib/format';

const FALLBACK_COLORS = ['#7c5cff', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#84cc16'];

export const ExpenseDonutChart = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useExpenseComposition();

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
              content={({ active, payload }: TooltipContentProps) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0];
                const inner = entry.payload as { share?: number } | undefined;
                return (
                  <div className="rounded-xl bg-surface-lowest border border-outline/30 shadow-ambient p-3 text-xs">
                    <p className="font-medium text-ink">{String(entry.name ?? '')}</p>
                    <p className="text-ink-muted">
                      {formatCurrency(Number(entry.value ?? 0))} ({inner?.share ?? 0}%)
                    </p>
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
