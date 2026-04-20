import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Initial focus selector inside the modal (CSS selector). Default: first focusable element. */
  initialFocus?: string;
  /** Disable closing when clicking the backdrop. */
  disableBackdropClose?: boolean;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Accessible glassmorphic modal.
 *
 * Implements:
 *  - Escape closes
 *  - Focus trap within the dialog
 *  - Returns focus to trigger on close
 *  - `role="dialog" aria-modal aria-labelledby aria-describedby`
 *  - Body scroll lock while open
 */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  initialFocus,
  disableBackdropClose,
}: ModalProps) => {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      // Focus trap.
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);

    // Initial focus — defer to next frame so refs are mounted.
    const focusTimer = window.setTimeout(() => {
      if (!dialogRef.current) return;
      const target = initialFocus
        ? dialogRef.current.querySelector<HTMLElement>(initialFocus)
        : dialogRef.current.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 0);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      // Restore focus to the element that opened the modal.
      triggerRef.current?.focus?.();
    };
  }, [open, onClose, initialFocus]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => !disableBackdropClose && onClose()}
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative z-10 w-full max-w-lg bg-surface-lowest/95 backdrop-blur-2xl',
          'rounded-3xl border-t border-white/10 shadow-ambient animate-fade-in',
          'max-h-[90vh] flex flex-col',
          className,
        )}
      >
        {(title || true) && (
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="font-display text-lg font-semibold tracking-tight text-ink"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-sm text-ink-muted mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-ink-muted hover:text-ink transition-colors p-1.5 rounded-lg hover:bg-surface-high focus-ring"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 pb-6 pt-2 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
