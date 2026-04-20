import { useEffect, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Combobox } from '@/components/Combobox';
import { Button } from '@/components/Button';
import { useCategories } from '@/features/categories/useCategories';
import { useCreateTransaction } from './useTransactions';
import { transactionsApi } from './transactions.api';
import { useT } from '@/lib/i18n';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/domain';

const Schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .positive('Amount must be greater than 0')
    .max(99999999.99, 'Amount is too large'),
  date: z.string().min(1, 'Pick a date'),
  categoryId: z.string().uuid({ message: 'Pick a category' }),
  description: z.string().max(280).optional(),
});
type FormData = z.infer<typeof Schema>;

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional pre-selected type when opening from a contextual button. */
  initialType?: TransactionType;
}

const today = () => new Date().toISOString().slice(0, 10);

export const QuickAddModal = ({ open, onClose, initialType = 'EXPENSE' }: QuickAddModalProps) => {
  const t = useT();
  const create = useCreateTransaction();
  const { data: categories = [] } = useCategories();
  const amountRef = useRef<HTMLInputElement | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(Schema),
    defaultValues: {
      type: initialType,
      date: today(),
      amount: undefined as unknown as number,
      description: '',
      categoryId: '',
    },
  });

  const type = watch('type');

  // Smart suggestion: ask the API for the most recently used category for this type.
  const suggestion = useQuery({
    queryKey: ['suggested-category', type],
    queryFn: () => transactionsApi.suggestedCategory(type),
    enabled: open,
    staleTime: 30_000,
  });

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  // Whenever type changes (or modal opens), apply the smart suggestion if it
  // matches available categories — otherwise fall back to the first category.
  useEffect(() => {
    if (!open) return;
    const suggested = suggestion.data;
    const fallback = filteredCategories[0]?.id ?? '';
    const next =
      suggested && filteredCategories.some((c) => c.id === suggested.id)
        ? suggested.id
        : fallback;
    setValue('categoryId', next, { shouldValidate: false });
  }, [open, type, suggestion.data, filteredCategories, setValue]);

  // Reset on open with the right initial type so reopening is predictable.
  useEffect(() => {
    if (open) {
      reset({
        type: initialType,
        date: today(),
        amount: undefined as unknown as number,
        description: '',
        categoryId: '',
      });
    }
  }, [open, initialType, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await create.mutateAsync({
        amount: data.amount,
        type: data.type,
        date: data.date,
        categoryId: data.categoryId,
        description: data.description || undefined,
      });
      toast.success(t('toast.transaction.added'));
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const submitting = isSubmitting || create.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('transactions.add.title')}
      description={t('transactions.add.subtitle')}
      initialFocus="input[name='amount']"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Type pill toggle (radiogroup) */}
        <div
          role="radiogroup"
          aria-label={t('fields.type')}
          className="grid grid-cols-2 p-1 rounded-xl bg-surface-high"
        >
          {(['EXPENSE', 'INCOME'] as const).map((v) => {
            const active = type === v;
            const Icon = v === 'INCOME' ? ArrowUpRight : ArrowDownRight;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setValue('type', v, { shouldValidate: true })}
                className={cn(
                  'h-9 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium',
                  'transition-all duration-200 ease-quintessential focus-ring',
                  active
                    ? v === 'INCOME'
                      ? 'bg-secondary/15 text-secondary'
                      : 'bg-danger/10 text-danger'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                <Icon size={14} aria-hidden />
                {t(`type.${v}`)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('fields.amount')}
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            error={errors.amount?.message}
            autoComplete="off"
            {...register('amount')}
            ref={(el) => {
              register('amount').ref(el);
              amountRef.current = el;
            }}
          />
          <Input
            label={t('fields.date')}
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Combobox
              label={t('fields.category')}
              value={field.value}
              onChange={field.onChange}
              error={errors.categoryId?.message}
              placeholder={
                filteredCategories.length === 0
                  ? t('quickAdd.noCategories')
                  : t('quickAdd.selectCategory')
              }
              searchPlaceholder={t('quickAdd.searchCategory')}
              emptyText={t('quickAdd.noMatches')}
              disabled={filteredCategories.length === 0}
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
                color: c.color ?? undefined,
                hint:
                  suggestion.data?.id === c.id ? t('quickAdd.lastUsed') : undefined,
              }))}
            />
          )}
        />

        <Input
          label={t('fields.description')}
          placeholder={t('fields.description.placeholder')}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="tertiary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? t('common.adding') : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
