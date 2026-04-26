import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Trash2, Wallet, AlertTriangle } from 'lucide-react';
import {
  useBudgets,
  useBudgetSuggestions,
  useCreateBudget,
  useDeleteBudget,
} from '@/features/dashboard/useWidgets';
import { useCategories } from '@/features/categories/useCategories';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Combobox } from '@/components/Combobox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useT, useTi } from '@/lib/i18n';
import { useFormatCurrency } from '@/lib/format';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { BudgetItem } from '@/features/dashboard/widgets.api';

const Schema = z.object({
  categoryId: z.string().uuid(),
  amount: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .pipe(z.number().positive('Amount must be greater than 0').max(99999999.99)),
});
type FormData = z.infer<typeof Schema>;

interface BudgetFormState {
  open: boolean;
  editing: BudgetItem | null;
}

const BudgetCard = ({
  b,
  formatCurrency,
  onEdit,
  onDelete,
  exceededLabel,
  usedLabelTemplate,
  remainingLabelTemplate,
  deleteLabel,
  ti,
}: {
  b: BudgetItem;
  formatCurrency: (n: number) => string;
  onEdit: (b: BudgetItem) => void;
  onDelete: (b: BudgetItem) => void;
  exceededLabel: string;
  usedLabelTemplate: string;
  remainingLabelTemplate: string;
  deleteLabel: string;
  ti: ReturnType<typeof useTi>;
}) => {
  const tone = b.exceeded ? 'danger' : b.usedPct >= 80 ? 'amber' : 'primary';
  return (
    <div className="card p-5 group hover:-translate-y-0.5 transition-transform duration-200 ease-quintessential">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="h-9 w-9 rounded-xl shrink-0"
            style={{ background: b.category.color ?? 'rgb(var(--color-surface-high))' }}
          />
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onEdit(b)}
              className="text-sm font-medium truncate text-start hover:text-primary focus-ring rounded"
            >
              {b.category.name}
            </button>
            <p className="text-xs text-ink-muted tabular-nums mt-0.5">
              {formatCurrency(b.used)} / {formatCurrency(b.limit)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onDelete(b)}
          className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/5 transition-all focus-ring opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`${deleteLabel} ${b.category.name}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-4">
        <div
          className="h-2 w-full rounded-full bg-surface-high overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={b.usedPct}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-quintessential',
              tone === 'danger' && 'bg-danger',
              tone === 'amber' && 'bg-amber-500',
              tone === 'primary' && 'bg-primary',
            )}
            style={{ width: `${Math.max(2, b.usedPct)}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={cn(
              'tabular-nums',
              b.exceeded ? 'text-danger font-semibold' : 'text-ink-muted',
            )}
          >
            {ti(usedLabelTemplate, { pct: b.usedPct })}
          </span>
          {b.exceeded ? (
            <span className="inline-flex items-center gap-1 text-danger font-semibold">
              <AlertTriangle size={12} aria-hidden />
              {exceededLabel}
            </span>
          ) : (
            <span className="text-ink-muted tabular-nums">
              {ti(remainingLabelTemplate, { amount: formatCurrency(b.remaining) })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const BudgetsPage = () => {
  const t = useT();
  const ti = useTi();
  const formatCurrency = useFormatCurrency();
  const { data, isLoading } = useBudgets();
  const { data: suggestionsData } = useBudgetSuggestions();
  const { data: categories = [] } = useCategories('EXPENSE');
  const create = useCreateBudget();
  const remove = useDeleteBudget();

  const [form, setForm] = useState<BudgetFormState>({ open: false, editing: null });
  const [confirmTarget, setConfirmTarget] = useState<BudgetItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const budgets = data?.budgets ?? [];

  const stats = useMemo(() => {
    const totalCap = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalUsed = budgets.reduce((acc, b) => acc + b.used, 0);
    const overCount = budgets.filter((b) => b.exceeded).length;
    return { totalCap, totalUsed, overCount };
  }, [budgets]);

  // Categories that don't yet have a budget — only show those when creating.
  const usedCategoryIds = useMemo(() => new Set(budgets.map((b) => b.categoryId)), [budgets]);
  const availableCategories = useMemo(
    () =>
      categories.filter(
        (c) => !usedCategoryIds.has(c.id) || form.editing?.categoryId === c.id,
      ),
    [categories, usedCategoryIds, form.editing?.categoryId],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { categoryId: '', amount: 0 },
  });

  // Sync the form whenever we open it for create/edit.
  useEffect(() => {
    if (!form.open) return;
    reset({
      categoryId: form.editing?.categoryId ?? availableCategories[0]?.id ?? '',
      amount: form.editing?.limit ?? 0,
    });
  }, [form.open, form.editing, availableCategories, reset]);

  const closeForm = () => setForm({ open: false, editing: null });

  const onSubmit = async (values: FormData) => {
    try {
      await create.mutateAsync({ categoryId: values.categoryId, amount: values.amount });
      toast.success(t('toast.budget.saved'));
      closeForm();
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setPendingId(confirmTarget.id);
    try {
      await remove.mutateAsync(confirmTarget.id);
      toast.success(t('toast.budget.deleted'));
      setConfirmTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    } finally {
      setPendingId(null);
    }
  };

  const submitting = isSubmitting || create.isPending;
  const noCategoriesAvailable = !form.editing && availableCategories.length === 0;

  // Only show suggestions for categories that don't already have a budget
  // (the backend filters too, but this keeps the UI in sync after a fresh add).
  const suggestions = useMemo(
    () =>
      (suggestionsData?.suggestions ?? []).filter((s) => !usedCategoryIds.has(s.category.id)),
    [suggestionsData, usedCategoryIds],
  );

  const handleAcceptSuggestion = async (categoryId: string, amount: number) => {
    try {
      await create.mutateAsync({ categoryId, amount });
      toast.success(t('toast.budget.saved'));
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('budgets.title')}</h1>
          <p className="text-ink-muted mt-1">{t('budgets.subtitle')}</p>
        </div>
        <Button
          onClick={() => setForm({ open: true, editing: null })}
          disabled={categories.length === 0}
        >
          <Plus size={16} aria-hidden />
          {t('budgets.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-4" aria-busy>
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t('budgets.empty.title')}
          subtitle={t('budgets.empty.subtitle')}
          action={
            <Button
              onClick={() => setForm({ open: true, editing: null })}
              disabled={categories.length === 0}
            >
              <Plus size={16} aria-hidden />
              {t('budgets.empty.cta')}
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card flex items-center gap-4">
              <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Wallet size={18} aria-hidden />
              </span>
              <div>
                <p className="stat-label">{t('budgets.totalCap')}</p>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {formatCurrency(stats.totalCap)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Wallet size={18} aria-hidden />
              </span>
              <div>
                <p className="stat-label">{t('budgets.totalUsed')}</p>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {formatCurrency(stats.totalUsed)}
                </p>
              </div>
            </div>
            <div className="card flex items-center gap-4">
              <span
                className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center',
                  stats.overCount > 0
                    ? 'bg-danger/10 text-danger'
                    : 'bg-success/10 text-success',
                )}
              >
                <AlertTriangle size={18} aria-hidden />
              </span>
              <div>
                <p className="stat-label">{t('budgets.overBudgetCount').split('{count}')[0].trim() || 'Over budget'}</p>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {stats.overCount}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                b={b}
                formatCurrency={formatCurrency}
                onEdit={(item) => setForm({ open: true, editing: item })}
                onDelete={setConfirmTarget}
                exceededLabel={t('budgets.exceeded')}
                usedLabelTemplate="budgets.used"
                remainingLabelTemplate="budgets.remaining"
                deleteLabel={t('common.delete')}
                ti={ti}
              />
            ))}
          </div>
        </>
      )}

      {suggestions.length > 0 && (
        <section aria-labelledby="budget-suggestions-heading" className="card space-y-4">
          <div>
            <h2
              id="budget-suggestions-heading"
              className="font-display text-lg font-semibold tracking-tight"
            >
              {t('budgets.suggestions.title')}
            </h2>
            <p className="text-xs text-ink-muted mt-1">{t('budgets.suggestions.subtitle')}</p>
          </div>
          <ul className="divide-y divide-outline/30">
            {suggestions.map((s) => (
              <li
                key={s.category.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    aria-hidden
                    className="h-9 w-9 rounded-xl shrink-0"
                    style={{ background: s.category.color ?? 'rgb(var(--color-surface-high))' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.category.name}</p>
                    <p className="text-xs text-ink-muted tabular-nums mt-0.5">
                      {ti('budgets.suggestions.average', {
                        amount: formatCurrency(s.averageMonthly),
                      })}{' '}
                      · {t('budgets.suggested')}: {formatCurrency(s.suggested)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAcceptSuggestion(s.category.id, s.suggested)}
                  disabled={create.isPending}
                >
                  <Plus size={14} aria-hidden />
                  {t('budgets.suggestions.add')}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal
        open={form.open}
        onClose={closeForm}
        title={form.editing ? `${t('budgets.add')} — ${form.editing.category.name}` : t('budgets.add')}
        description={t('budgets.add.subtitle')}
        initialFocus="input[name='amount']"
      >
        {noCategoriesAvailable ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">{t('budgets.noCategoryAvailable')}</p>
            <div className="flex justify-end">
              <Button type="button" variant="tertiary" onClick={closeForm}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Combobox
                  label={t('fields.category')}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                  disabled={!!form.editing}
                  options={availableCategories.map((c) => ({
                    value: c.id,
                    label: c.name,
                    color: c.color,
                  }))}
                />
              )}
            />
            <Input
              label={t('budgets.amount')}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder={t('budgets.amountPlaceholder')}
              error={errors.amount?.message}
              {...register('amount')}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="tertiary"
                onClick={closeForm}
                disabled={submitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={submitting} disabled={submitting}>
                {submitting ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={`${t('budgets.delete.title')} ${confirmTarget?.category.name ?? ''}`.trim()}
        description={t('budgets.delete.description')}
        confirmLabel={t('common.delete')}
        destructive
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
