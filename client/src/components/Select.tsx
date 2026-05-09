import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...rest }, ref) => {
    const selectId = id ?? rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full h-11 rounded-xl bg-surface-lowest ps-3 pe-3 text-sm text-ink transition-all duration-200 ease-quintessential',
            'border border-transparent focus:border-primary/50 focus:outline-none appearance-none',
            error && 'border-danger/40',
            className,
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
