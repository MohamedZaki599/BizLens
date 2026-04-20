import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useExpenseTrend } from './useWidgets';
import { useT } from '@/lib/i18n';
import { Skeleton } from '@/components/Skeleton';
import { formatCurrency } from '@/lib/utils';

export const ExpenseTrendChart = () => {
  const t = useT();
  const { data, isLoading } = useExpenseTrend();

  if (isLoading) {
    return (
      <div className="card" aria-busy>
        <Skeleton className="h-3 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const chartData = data.map((m) => ({
    ...m,
    label: m.month.slice(5),
  }));

  return (
    <div className="card">
      <h3 className="stat-label mb-4">{t('charts.trend.title')}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-secondary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgb(var(--color-secondary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--color-danger))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgb(var(--color-danger))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-outline) / 0.2)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'rgb(var(--color-ink-muted))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgb(var(--color-ink-muted))' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip
            content={({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey?: string; color?: string; value?: number }>; label?: string }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-xl bg-surface-lowest border border-outline/30 shadow-ambient p-3 text-xs">
                  <p className="font-medium text-ink mb-1">{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                      {p.dataKey === 'income' ? t('charts.income') : t('charts.expense')}: {formatCurrency(p.value ?? 0)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="rgb(var(--color-secondary))"
            fill="url(#incomeGrad)"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="rgb(var(--color-danger))"
            fill="url(#expenseGrad)"
            strokeWidth={2}
            dot={false}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
