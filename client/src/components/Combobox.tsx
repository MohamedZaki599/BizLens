import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
  /** Optional sub-label shown right-aligned (e.g. category type). */
  hint?: string;
  /** Optional swatch color rendered as a leading dot. */
  color?: string | null;
  disabled?: boolean;
}

interface ComboboxProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  disabled?: boolean;
  /** Test/automation id forwarded to the trigger button. */
  id?: string;
  /** Optional renderer for the selected value pill. */
  renderSelected?: (opt: ComboboxOption) => ReactNode;
  className?: string;
  /** Used by parent forms to uniquely associate label / error. */
  name?: string;
}

/**
 * A fully accessible, RTL-aware Combobox (searchable select).
 *
 * Features:
 *  - Keyboard navigation (Arrow Up/Down, Home/End, Enter, Escape, Tab to dismiss)
 *  - Type-ahead filtering with case- and diacritic-insensitive matching
 *  - Outside-click + Escape close
 *  - ARIA `combobox` + `listbox` + `option` roles, `aria-activedescendant`
 *  - Logical CSS properties so it mirrors correctly in RTL
 *  - Works with React Hook Form via controlled `value` / `onChange`
 *
 * No external dependency — built on plain React + lucide icons.
 */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      value,
      onChange,
      options,
      label,
      placeholder = 'Select…',
      searchPlaceholder = 'Search…',
      emptyText = 'Nothing matches.',
      error,
      disabled,
      id,
      renderSelected,
      className,
      name,
    },
    ref,
  ) => {
    const reactId = useId();
    const triggerId = id ?? `cmb-${reactId}`;
    const listboxId = `${triggerId}-list`;
    const labelId = `${triggerId}-label`;
    const errorId = `${triggerId}-error`;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const selected = useMemo(
      () => options.find((o) => o.value === value) ?? null,
      [options, value],
    );

    const filtered = useMemo(() => {
      if (!query.trim()) return options;
      const norm = (s: string) =>
        s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const q = norm(query);
      return options.filter((o) => norm(o.label).includes(q) || norm(o.hint ?? '').includes(q));
    }, [query, options]);

    // Reset highlight whenever the filter changes / popover opens.
    useEffect(() => {
      if (!open) return;
      const idx = filtered.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }, [open, filtered, value]);

    // Focus the search input when opening for instant type-ahead.
    useEffect(() => {
      if (open) {
        const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
        return () => window.clearTimeout(timer);
      }
    }, [open]);

    // Outside click → close.
    useEffect(() => {
      if (!open) return;
      const onClick = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
      };
      window.addEventListener('mousedown', onClick);
      return () => window.removeEventListener('mousedown', onClick);
    }, [open]);

    // Keep the active option scrolled into view.
    useEffect(() => {
      if (!open || !listRef.current) return;
      const el = listRef.current.querySelector<HTMLLIElement>(
        `[data-cmb-index="${activeIndex}"]`,
      );
      el?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    const select = useCallback(
      (opt: ComboboxOption) => {
        if (opt.disabled) return;
        onChange(opt.value);
        setOpen(false);
        setQuery('');
      },
      [onChange],
    );

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          setActiveIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          setActiveIndex((i) =>
            filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length,
          );
          break;
        case 'Home':
          if (open) {
            e.preventDefault();
            setActiveIndex(0);
          }
          break;
        case 'End':
          if (open) {
            e.preventDefault();
            setActiveIndex(Math.max(0, filtered.length - 1));
          }
          break;
        case 'Enter':
          if (open && filtered[activeIndex]) {
            e.preventDefault();
            select(filtered[activeIndex]);
          } else if (!open) {
            e.preventDefault();
            setOpen(true);
          }
          break;
        case 'Escape':
          if (open) {
            e.preventDefault();
            setOpen(false);
          }
          break;
        case 'Tab':
          if (open) setOpen(false);
          break;
        default:
          break;
      }
    };

    return (
      <div className={cn('space-y-1.5', className)} ref={containerRef}>
        {label && (
          <label
            id={labelId}
            htmlFor={triggerId}
            className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            id={triggerId}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-labelledby={label ? labelId : undefined}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            aria-disabled={disabled || undefined}
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            onKeyDown={onKeyDown}
            data-name={name}
            className={cn(
              'w-full h-11 rounded-xl bg-surface-lowest ps-3 pe-10 text-sm text-start',
              'flex items-center gap-2 transition-all duration-200 ease-quintessential',
              'border border-transparent focus:outline-none',
              open && 'border-primary/50',
              error && 'border-danger/40',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'hover:bg-surface-low',
            )}
          >
            {selected ? (
              renderSelected ? (
                renderSelected(selected)
              ) : (
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  {selected.color && (
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: selected.color }}
                    />
                  )}
                  <span className="truncate text-ink">{selected.label}</span>
                </span>
              )
            ) : (
              <span className="text-ink-muted/80 truncate flex-1">{placeholder}</span>
            )}
            <ChevronDown
              size={16}
              className={cn(
                'text-ink-muted absolute end-3 top-1/2 -translate-y-1/2 transition-transform duration-200',
                open && 'rotate-180',
              )}
              aria-hidden
            />
          </button>

          {open && (
            <div
              className={cn(
                'absolute z-50 mt-2 w-full overflow-hidden rounded-xl bg-surface-lowest',
                'border border-outline/40 shadow-ambient backdrop-blur-xl',
                'animate-fade-in',
              )}
            >
              <div className="flex items-center gap-2 border-b border-outline/30 px-3 h-10">
                <Search size={14} className="text-ink-muted shrink-0" aria-hidden />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
                  aria-controls={listboxId}
                  aria-activedescendant={
                    filtered[activeIndex]
                      ? `${triggerId}-opt-${filtered[activeIndex].value}`
                      : undefined
                  }
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-ink-muted hover:text-ink p-0.5 rounded"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                aria-labelledby={label ? labelId : undefined}
                className="max-h-64 overflow-y-auto py-1"
              >
                {filtered.length === 0 ? (
                  <li className="px-3 py-6 text-sm text-center text-ink-muted">{emptyText}</li>
                ) : (
                  filtered.map((opt, idx) => {
                    const isActive = idx === activeIndex;
                    const isSelected = opt.value === value;
                    return (
                      <li
                        key={opt.value}
                        id={`${triggerId}-opt-${opt.value}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={opt.disabled || undefined}
                        data-cmb-index={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => select(opt)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                          isActive ? 'bg-surface-high' : '',
                          opt.disabled && 'opacity-50 cursor-not-allowed',
                        )}
                      >
                        {opt.color !== undefined && (
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              background:
                                opt.color ?? 'rgb(var(--color-surface-highest))',
                            }}
                          />
                        )}
                        <span className="flex-1 min-w-0 truncate text-ink">{opt.label}</span>
                        {opt.hint && (
                          <span className="text-xs text-ink-muted shrink-0">{opt.hint}</span>
                        )}
                        {isSelected && (
                          <Check size={14} className="text-primary shrink-0" aria-hidden />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Combobox.displayName = 'Combobox';
