'use client';

import { Check, Minus } from 'lucide-react';
import { useUi } from '@/app/providers';
import { t } from '@/lib/i18n';

type Cell = boolean | 'partial';

interface Row {
  key: string;
  bizlens: Cell;
  excel: Cell;
  notion: Cell;
  qb: Cell;
}

const rows: Row[] = [
  { key: 'compare.row.alerts', bizlens: true, excel: false, notion: false, qb: 'partial' },
  { key: 'compare.row.insights', bizlens: true, excel: false, notion: false, qb: false },
  { key: 'compare.row.forecast', bizlens: true, excel: 'partial', notion: false, qb: 'partial' },
  { key: 'compare.row.leak', bizlens: true, excel: false, notion: false, qb: false },
  { key: 'compare.row.fast', bizlens: true, excel: false, notion: 'partial', qb: false },
  { key: 'compare.row.modes', bizlens: true, excel: false, notion: false, qb: false },
  { key: 'compare.row.bilingual', bizlens: true, excel: 'partial', notion: 'partial', qb: false },
];

const Mark = ({ value, language }: { value: Cell; language: 'en' | 'ar' }) => {
  if (value === true) {
    return (
      <span
        aria-label={t(language, 'compare.cell.yes')}
        className="inline-flex h-6 w-6 rounded-full bg-secondary/15 text-secondary items-center justify-center"
      >
        <Check size={14} strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (value === 'partial') {
    return (
      <span
        aria-label={t(language, 'compare.cell.partial')}
        className="inline-flex h-6 w-6 rounded-full bg-amber-500/15 text-amber-500 items-center justify-center text-[11px] font-semibold"
      >
        ~
      </span>
    );
  }
  return (
    <span
      aria-label={t(language, 'compare.cell.no')}
      className="inline-flex h-6 w-6 rounded-full bg-surface-high text-ink-muted items-center justify-center"
    >
      <Minus size={14} strokeWidth={2.5} aria-hidden />
    </span>
  );
};

export const Compare = () => {
  const { language } = useUi();
  return (
    <section
      id="compare"
      className="relative py-24 md:py-32 bg-gradient-to-b from-transparent to-surface-low/40"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            {t(language, 'compare.title')}
          </h2>
          <p className="mt-3 text-lg text-ink-muted leading-relaxed">
            {t(language, 'compare.subtitle')}
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-outline/30 bg-surface-lowest">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-outline/30 bg-surface-low/40">
                <th className="text-start font-medium text-xs uppercase tracking-wide text-ink-muted px-5 py-4">
                  {t(language, 'compare.col.capability')}
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold tracking-wide text-primary">
                  {t(language, 'compare.col.you')}
                </th>
                <th className="px-4 py-4 text-center text-xs font-medium tracking-wide text-ink-muted">
                  {t(language, 'compare.col.excel')}
                </th>
                <th className="px-4 py-4 text-center text-xs font-medium tracking-wide text-ink-muted">
                  {t(language, 'compare.col.notion')}
                </th>
                <th className="px-4 py-4 text-center text-xs font-medium tracking-wide text-ink-muted">
                  {t(language, 'compare.col.qb')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.key}
                  className="border-b border-outline/20 last:border-b-0 hover:bg-surface-low/30 transition-colors"
                >
                  <td className="px-5 py-4 text-ink font-medium">{t(language, r.key)}</td>
                  <td className="px-4 py-4 text-center bg-primary/[0.04]">
                    <Mark value={r.bizlens} language={language} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Mark value={r.excel} language={language} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Mark value={r.notion} language={language} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Mark value={r.qb} language={language} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
