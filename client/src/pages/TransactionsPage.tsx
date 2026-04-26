import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Receipt,
  Trash2,
  X,
} from 'lucide-react';
import { useDeleteTransaction, useTransactions } from '@/features/transactions/useTransactions';
import { useCategories } from '@/features/categories/useCategories';
import { Skeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { Combobox } from '@/components/Combobox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useFormatCurrency } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';
import type { TransactionType } from '@/types/domain';

type Filter = TransactionType | 'ALL';

export const TransactionsPage = () => {
  const t = useT();
  const formatCurrency = useFormatCurrency();
  const { openQuickAdd } = useOutletContext<{
    openQuickAdd: (initialType?: TransactionType) => void;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = (searchParams.get('type') as Filter | null) ?? 'ALL';
  const initialCategory = searchParams.get('categoryId');

  const [filter, setFilter] = useState<Filter>(initialType);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategory);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (filter !== 'ALL') p.type = filter;
    if (categoryId) p.categoryId = categoryId;
    return p;
  }, [filter, categoryId]);

  // Sync filters → URL so deep-links from insights survive refresh.
  useEffect(() => {
    const next = new URLSearchParams();
    if (filter !== 'ALL') next.set('type', filter);
    if (categoryId) next.set('categoryId', categoryId);
    setSearchParams(next, { replace: true });
  }, [filter, categoryId, setSearchParams]);

  const { data, isLoading } = useTransactions(params);
  const { data: categories = [] } = useCategories();
  const del = useDeleteTransaction();

  const filteredCategories = useMemo(
    () => (filter === 'ALL' ? categories : categories.filter((c) => c.type === filter)),
    [filter, categories],
  );

  const activeCategory = categories.find((c) => c.id === categoryId);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setPendingDeleteId(id);
    try {
      await del.mutateAsync(id);
      toast.success(t('toast.transaction.deleted'));
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {t('transactions.title')}
          </h1>
          <p className="text-ink-muted mt-1">{t('transactions.subtitle')}</p>
        </div>
        <Button onClick={() => openQuickAdd(filter === 'ALL' ? 'EXPENSE' : filter)}>
          <Plus size={16} aria-hidden />
          {t('transactions.quickAdd')}
        </Button>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div
          role="tablist"
          aria-label={t('fields.type')}
          className="inline-flex p-1 rounded-xl bg-surface-high"
        >
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => {
                setFilter(f);
                if (f !== 'ALL' && categoryId) {
                  // Clear an out-of-type category so we don't show empty results.
                  const cat = categories.find((c) => c.id === categoryId);
                  if (cat && cat.type !== f) setCategoryId(null);
                }
              }}
              className={cn(
                'h-8 px-3 rounded-lg text-xs font-medium transition-all duration-200 ease-quintessential focus-ring',
                filter === f
                  ? 'bg-surface-lowest text-ink shadow-ambient'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              {f === 'ALL' ? t('common.all') : t(`type.${f}`)}
            </button>
          ))}
        </div>

        <div className="min-w-[14rem] max-w-xs flex-1">
          <Combobox
            value={categoryId}
            onChange={(v) => setCategoryId(v || null)}
            options={[
              { value: '', label: t('transactions.allCategories') },
              ...filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
                color: c.color ?? undefined,
                hint: t(`type.${c.type}`),
              })),
            ]}
            placeholder={t('transactions.allCategories')}
            searchPlaceholder={t('common.search')}
          />
        </div>

        {(filter !== 'ALL' || categoryId) && (
          <button
            onClick={() => {
              setFilter('ALL');
              setCategoryId(null);
            }}
            className="text-xs text-ink-muted hover:text-ink inline-flex items-center gap-1 px-2 h-8 rounded-lg hover:bg-surface-high focus-ring"
          >
            <X size={12} aria-hidden /> {t('common.clearFilters')}
          </button>
        )}
      </div>

      {activeCategory && (
        <p className="text-xs text-ink-muted">
          {t('transactions.filteredBy')}{' '}
          <span className="font-medium text-ink">{activeCategory.name}</span>
        </p>
      )}

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" aria-busy>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title={t('transactions.empty.title')}
            subtitle={
              params.type || params.categoryId
                ? t('transactions.empty.filtered')
                : t('transactions.empty.subtitle')
            }
            action={
              <Button onClick={() => openQuickAdd(filter === 'ALL' ? 'EXPENSE' : filter)}>
                <Plus size={16} aria-hidden />
                {t('transactions.empty.cta')}
              </Button>
            }
          />
        ) : (
          <ul>
            {data?.items.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-low/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: tx.category.color ? `${tx.category.color}22` : undefined }}
                  >
                    {tx.type === 'INCOME' ? (
                      <ArrowUpRight size={16} className="text-secondary" />
                    ) : (
                      <ArrowDownRight size={16} className="text-danger" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description || tx.category.name}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {tx.category.name} · {format(new Date(tx.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-sm font-semibold tabular-nums',
                      tx.type === 'INCOME' ? 'text-secondary' : 'text-danger',
                    )}
                  >
                    {tx.type === 'INCOME' ? '+' : '−'}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                  <button
                    onClick={() => setConfirmDeleteId(tx.id)}
                    disabled={pendingDeleteId === tx.id}
                    className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/5 transition-all focus-ring opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title={t('transactions.delete.confirm')}
        description={t('transactions.delete.description')}
        confirmLabel={t('common.delete')}
        destructive
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
