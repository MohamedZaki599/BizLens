import { useMemo, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { useImportTransactions } from '@/features/dashboard/useWidgets';
import { useCategories } from '@/features/categories/useCategories';
import { useT, useTi } from '@/lib/i18n';
import { Button } from '@/components/Button';
import { Combobox } from '@/components/Combobox';
import { parseCsvRows, type CsvMapping } from '@/lib/csv';
import { extractErrorMessage } from '@/lib/api';

const initialMapping: CsvMapping = { amount: '', type: '', date: '', description: '' };

export const ImportPage = () => {
  const t = useT();
  const ti = useTi();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useCategories();
  const importMut = useImportTransactions();

  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<CsvMapping>(initialMapping);
  const [defaultCategoryId, setDefaultCategoryId] = useState('');
  const [imported, setImported] = useState<number | null>(null);
  const [duplicateCount, setDuplicateCount] = useState<number | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

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
        const lower = h.map((c) => c.toLowerCase());
        setMapping({
          amount: h[lower.findIndex((c) => c.includes('amount') || c.includes('value'))] ?? h[0] ?? '',
          type: h[lower.findIndex((c) => c.includes('type'))] ?? '',
          date: h[lower.findIndex((c) => c.includes('date'))] ?? h[1] ?? '',
          description:
            h[
              lower.findIndex(
                (c) => c.includes('desc') || c.includes('note') || c.includes('memo'),
              )
            ] ?? '',
        });
        setImported(null);
      },
    });
  };

  const summary = useMemo(
    () => parseCsvRows(rawRows, mapping, defaultCategoryId),
    [rawRows, mapping, defaultCategoryId],
  );

  const handleImport = async () => {
    if (summary.rows.length === 0) return;
    try {
      const result = await importMut.mutateAsync({
        transactions: summary.rows,
        skipDuplicates,
      });
      setImported(result.imported);
      setDuplicateCount(result.duplicatesSkipped);
      if (result.imported > 0) {
        toast.success(ti('import.success', { count: result.imported }));
      }
      if (result.duplicatesSkipped > 0) {
        toast(ti('import.duplicates', { count: result.duplicatesSkipped }), {
          icon: 'ℹ️',
        });
      }
      setRawRows([]);
    } catch (err) {
      toast.error(extractErrorMessage(err, t('toast.error.generic')));
    }
  };

  const catOptions = (categories ?? [])
    .filter((c) => c.type === 'EXPENSE')
    .map((c) => ({ value: c.id, label: c.name }));

  const totalSkipped =
    summary.skipped.amount + summary.skipped.date + summary.skipped.category;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('import.title')}</h1>
        <p className="text-ink-muted mt-1">{t('import.subtitle')}</p>
      </header>

      {imported !== null && (
        <div className="card space-y-2 bg-secondary/10 border border-secondary/20">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-secondary shrink-0" aria-hidden />
            <p className="text-sm font-medium text-secondary">
              {ti('import.success', { count: imported })}
            </p>
          </div>
          {duplicateCount !== null && duplicateCount > 0 && (
            <p className="text-xs text-ink-muted ms-8">
              {ti('import.duplicates', { count: duplicateCount })}
            </p>
          )}
        </div>
      )}

      <div className="card space-y-5">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
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
              <FileSpreadsheet size={14} aria-hidden />
              {ti('import.preview', { count: rawRows.length })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(['amount', 'date', 'type', 'description'] as const).map((field) => (
                <div key={field}>
                  <label
                    htmlFor={`csv-mapping-${field}`}
                    className="stat-label block mb-1"
                  >
                    {field}
                  </label>
                  <select
                    id={`csv-mapping-${field}`}
                    className="w-full h-9 px-3 rounded-lg bg-surface-high text-sm focus-ring"
                    value={mapping[field]}
                    onChange={(e) =>
                      setMapping((m) => ({ ...m, [field]: e.target.value }))
                    }
                  >
                    <option value="">—</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
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

            {totalSkipped > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-danger/5 text-danger text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden />
                <p>
                  {ti('import.skipped', {
                    skipped: totalSkipped,
                    total: summary.total,
                  })}
                </p>
              </div>
            )}

            <label className="flex items-start gap-2 text-xs text-ink-muted cursor-pointer select-none">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 accent-primary"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
              />
              <span>
                <span className="block font-medium text-ink">
                  {t('import.skipDuplicates.label')}
                </span>
                <span className="block">{t('import.skipDuplicates.help')}</span>
              </span>
            </label>

            {summary.rows.length > 0 ? (
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importMut.isPending}
                loading={importMut.isPending}
              >
                {importMut.isPending
                  ? t('import.importing')
                  : ti('import.submit', { count: summary.rows.length })}
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
