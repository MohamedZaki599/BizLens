import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from '@/features/categories/useCategories';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Input } from '@/components/Input';
import { Combobox } from '@/components/Combobox';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/Skeleton';
import { useT } from '@/lib/i18n';
import { extractErrorMessage } from '@/lib/api';
import type { Category, TransactionType } from '@/types/domain';

const Schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});
type FormData = z.infer<typeof Schema>;

const CategoryGroup = ({
  title,
  items,
  onDelete,
  pendingId,
  emptyText,
  defaultLabel,
  customLabel,
  deleteLabel,
}: {
  title: string;
  items: Category[];
  onDelete: (c: Category) => void;
  pendingId: string | null;
  emptyText: string;
  defaultLabel: string;
  customLabel: string;
  deleteLabel: string;
}) => (
  <div>
    <h2 className="stat-label mb-3">{title}</h2>
    {items.length === 0 ? (
      <p className="text-sm text-ink-muted py-4">{emptyText}</p>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <div
            key={c.id}
            className="card p-4 flex items-center justify-between gap-3 group hover:-translate-y-0.5 transition-transform duration-200 ease-quintessential"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                aria-hidden
                className="h-9 w-9 rounded-xl shrink-0"
                style={{ background: c.color ?? 'rgb(var(--color-surface-high))' }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-ink-muted">
                  {c.isDefault ? defaultLabel : customLabel}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(c)}
              disabled={pendingId === c.id}
              className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/5 transition-all focus-ring opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
              aria-label={`${deleteLabel} ${c.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const CategoriesPage = () => {
  const t = useT();
  const { data: categories = [], isLoading } = useCategories();
  const create = useCreateCategory();
  const remove = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Category | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: { type: 'EXPENSE', color: '#7c5cff', name: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await create.mutateAsync({
        name: data.name,
        type: data.type as TransactionType,
        color: data.color,
      });
      toast.success(t('toast.category.added'));
      reset({ type: 'EXPENSE', color: '#7c5cff', name: '' });
      setOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    setPendingId(confirmTarget.id);
    try {
      await remove.mutateAsync(confirmTarget.id);
      toast.success(t('toast.category.deleted'));
      setConfirmTarget(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    } finally {
      setPendingId(null);
    }
  };

  const income = categories.filter((c) => c.type === 'INCOME');
  const expense = categories.filter((c) => c.type === 'EXPENSE');
  const submitting = isSubmitting || create.isPending;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {t('categories.title')}
          </h1>
          <p className="text-ink-muted mt-1">{t('categories.subtitle')}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} aria-hidden />
          {t('categories.add')}
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, g) => (
            <div key={g}>
              <Skeleton className="h-3 w-32 mb-3" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={t('categories.empty.title')}
          subtitle={t('categories.empty.subtitle')}
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} aria-hidden />
              {t('categories.empty.cta')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <CategoryGroup
            title={t('categories.income')}
            items={income}
            onDelete={setConfirmTarget}
            pendingId={pendingId}
            emptyText={t('categories.empty.income')}
            defaultLabel={t('categories.default')}
            customLabel={t('categories.custom')}
            deleteLabel={t('common.delete')}
          />
          <CategoryGroup
            title={t('categories.expense')}
            items={expense}
            onDelete={setConfirmTarget}
            pendingId={pendingId}
            emptyText={t('categories.empty.expense')}
            defaultLabel={t('categories.default')}
            customLabel={t('categories.custom')}
            deleteLabel={t('common.delete')}
          />
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('categories.add')}
        description={t('categories.add.subtitle')}
        initialFocus="input[name='name']"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label={t('fields.name')}
            placeholder={t('categories.namePlaceholder')}
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Combobox
                  label={t('fields.type')}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.type?.message}
                  options={[
                    { value: 'EXPENSE', label: t('type.EXPENSE') },
                    { value: 'INCOME', label: t('type.INCOME') },
                  ]}
                />
              )}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="cat-color"
                className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted"
              >
                {t('fields.color')}
              </label>
              <input
                id="cat-color"
                type="color"
                aria-label={t('fields.color')}
                className="h-11 w-full rounded-xl bg-surface-lowest cursor-pointer border-0 focus-ring"
                {...register('color')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              {submitting ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmTarget !== null}
        title={`${t('categories.delete.title')} ${confirmTarget?.name ?? ''}`.trim()}
        description={t('categories.delete.description')}
        confirmLabel={t('common.delete')}
        destructive
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
