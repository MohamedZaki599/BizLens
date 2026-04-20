import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leadingIcon, className, id, ...rest }, ref) => {
    const reactId = useId();
    const inputId = id ?? rest.name ?? `inp-${reactId}`;
    const errorId = `${inputId}-err`;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-muted"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span
              aria-hidden
              className="absolute inset-y-0 start-0 flex items-center ps-3 text-ink-muted"
            >
              {leadingIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'w-full h-11 rounded-xl bg-surface-lowest ps-3 pe-3 text-sm text-ink',
              'placeholder:text-ink-muted/70 transition-all duration-200 ease-quintessential',
              'border border-transparent focus:border-primary/50 focus:outline-none',
              leadingIcon && 'ps-10',
              error && 'border-danger/40 focus:border-danger/60',
              className,
            )}
            {...rest}
          />
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
Input.displayName = 'Input';
