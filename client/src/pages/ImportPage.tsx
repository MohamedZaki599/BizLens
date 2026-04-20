import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useImportTransactions } from '@/features/dashboard/useWidgets';
import { useCategories } from '@/features/categories/useCategories';
import { useT, useTi } from '@/lib/i18n';
import { Button } from '@/components/Button';
import { Combobox } from '@/components/Combobox';
import { Skeleton } from '@/components/Skeleton';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/types/domain';

interface ParsedRow {
  amount: number;
  type: TransactionType;
  date: string;
  description: string;
  categoryId: string;
}

export const ImportPage = () => {
  const t = useT();
  const ti = useTi();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useCategories();
  const importMut = useImportTransactions();

  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ amount: string; type: string; date: string; description: string }>({
    amount: '', type: '', date: '', description: '',
  });
  const [defaultCategoryId, setDefaultCategoryId] = useState('');
  const [imported, setImported] = useState<number | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setRawRows(result.data);
        const h = result.meta.fields ?? [];
        setHeaders(h);
        // Auto-detect common column names.
        const lower = h.map((c) => c.toLowerCase());
        setMapping({
          amount: h[lower.findIndex((c) => c.includes('amount'))] ?? h[0] ?? '',
          type: h[lower.findIndex((c) => c.includes('type'))] ?? '',
          date: h[lower.findIndex((c) => c.includes('date'))] ?? h[1] ?? '',
          description: h[lower.findIndex((c) => c.includes('desc') || c.includes('note') || c.includes('memo'))] ?? '',
        });
        setImported(null);
      },
    });
  };

  const parsed: ParsedRow[] = rawRows
    .map((row) => {
      const amt = parseFloat(row[mapping.amount]);
      if (isNaN(amt) || amt <= 0) return null;
      const rawType = (row[mapping.type] ?? '').toUpperCase();
      const type: TransactionType = rawType === 'INCOME' ? 'INCOME' : 'EXPENSE';
      const date = row[mapping.date];
      if (!date) return null;
      return {
        amount: amt,
        type,
        date: new Date(date).toISOString(),
        description: row[mapping.description] ?? '',
        categoryId: defaultCategoryId,
      };
    })
    .filter((r): r is ParsedRow => r !== null && !!r.categoryId);

  const handleImport = async () => {
    if (parsed.length === 0) return;
    try {
      const result = await importMut.mutateAsync(parsed);
      setImported(result.imported);
      toast.success(ti('import.success', { count: result.imported }));
      setRawRows([]);
    } catch {
      toast.error(t('toast.error.generic'));
    }
  };

  const catOptions = (categories ?? [])
    .filter((c) => c.type === 'EXPENSE')
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('import.title')}</h1>
        <p className="text-ink-muted mt-1">{t('import.subtitle')}</p>
      </header>

      {imported !== null && (
        <div className="card flex items-center gap-3 bg-secondary/10 border border-secondary/20">
          <CheckCircle size={20} className="text-secondary shrink-0" />
          <p className="text-sm font-medium text-secondary">{ti('import.success', { count: imported })}</p>
        </div>
      )}

      <div className="card space-y-5">
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={16} aria-hidden />
          {t('import.upload')}
        </Button>

        {rawRows.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <FileSpreadsheet size={14} />
              {ti('import.preview', { count: rawRows.length })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(['amount', 'date', 'type', 'description'] as const).map((field) => (
                <div key={field}>
                  <label className="stat-label block mb-1">{field}</label>
                  <select
                    className="w-full h-9 px-3 rounded-lg bg-surface-high text-sm focus-ring"
                    value={mapping[field]}
                    onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                  >
                    <option value="">—</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="stat-label block mb-1">{t('fields.category')}</label>
              <Combobox
                options={catOptions}
                value={defaultCategoryId}
                onChange={setDefaultCategoryId}
                placeholder={t('quickAdd.selectCategory')}
                searchPlaceholder={t('quickAdd.searchCategory')}
              />
            </div>

            {parsed.length > 0 ? (
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importMut.isPending}
              >
                {importMut.isPending
                  ? t('import.importing')
                  : ti('import.submit', { count: parsed.length })}
              </Button>
            ) : (
              <p className="text-sm text-ink-muted">{t('import.empty')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
