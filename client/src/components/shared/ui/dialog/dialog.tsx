/**
 * BizLens Dialog Primitive System
 *
 * Built on @radix-ui/react-dialog for production-grade accessibility:
 *   - Focus trapping
 *   - Body scroll lock
 *   - Escape key handling
 *   - Focus restoration to trigger
 *   - Portal rendering
 *   - aria-labelledby / aria-describedby
 *
 * Usage:
 *   <Dialog open={open} onOpenChange={setOpen}>
 *     <DialogContent size="md">
 *       <DialogHeader>
 *         <DialogTitle>Title</DialogTitle>
 *         <DialogDescription>Subtitle</DialogDescription>
 *       </DialogHeader>
 *       <DialogBody>...content...</DialogBody>
 *       <DialogFooter>...buttons...</DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

// ── Size map ──────────────────────────────────────────────────────────────

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  fullscreen: 'max-w-none w-screen h-screen !rounded-none',
} as const;

export type DialogSize = keyof typeof sizeClasses;

// ── Root ──────────────────────────────────────────────────────────────────

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogPortal = RadixDialog.Portal;

// ── Overlay ───────────────────────────────────────────────────────────────

export const DialogOverlay = forwardRef<
  ElementRef<typeof RadixDialog.Overlay>,
  ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/40 backdrop-blur-sm',
      'dialog-overlay-animate',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

// ── Content ───────────────────────────────────────────────────────────────

interface DialogContentProps
  extends ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  size?: DialogSize;
  /** Hide the close button (e.g. for confirm dialogs with explicit buttons). */
  hideClose?: boolean;
}

export const DialogContent = forwardRef<
  ElementRef<typeof RadixDialog.Content>,
  DialogContentProps
>(({ className, children, size = 'md', hideClose = false, ...props }, ref) => {
  const t = useT();
  return (
    <DialogPortal>
      <DialogOverlay />
      <RadixDialog.Content
        ref={ref}
        dir={props.dir}
        className={cn(
          // Centering layer
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          // Disable pointer events on this wrapper — only the panel should receive clicks.
          // Radix handles overlay dismiss via the Overlay component.
        )}
        {...props}
      >
        <div
          className={cn(
            // Panel
            'relative w-full bg-surface-lowest border border-outline/10',
            'rounded-2xl shadow-ambient',
            // Responsive: use dvh for mobile browsers, fallback to vh
            'max-h-[90dvh] flex flex-col',
            // Ensure usable on 320px viewports
            'min-w-0',
            // Animation
            'dialog-content-animate',
            // Size
            sizeClasses[size],
            className,
          )}
          // Stop clicks on the panel from bubbling to the overlay
          onClick={(e) => e.stopPropagation()}
        >
          {children}
          {!hideClose && (
            <RadixDialog.Close
              className={cn(
                'absolute top-4 end-4 p-1.5 rounded-lg',
                'text-ink-muted hover:text-ink hover:bg-surface-high',
                'transition-colors focus-ring',
              )}
              aria-label={t('common.close')}
            >
              <X size={18} />
            </RadixDialog.Close>
          )}
        </div>
      </RadixDialog.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

// ── Header ────────────────────────────────────────────────────────────────

interface DialogHeaderProps {
  className?: string;
  children: ReactNode;
}

export const DialogHeader = ({ className, children }: DialogHeaderProps) => (
  <div className={cn('flex flex-col gap-1 px-6 pt-5 pb-3 shrink-0', className)}>
    {children}
  </div>
);

// ── Title ─────────────────────────────────────────────────────────────────

export const DialogTitle = forwardRef<
  ElementRef<typeof RadixDialog.Title>,
  ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={cn(
      'font-display text-lg font-semibold tracking-tight text-ink pe-8',
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

// ── Description ───────────────────────────────────────────────────────────

export const DialogDescription = forwardRef<
  ElementRef<typeof RadixDialog.Description>,
  ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn('text-sm text-ink-muted', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

// ── Body ──────────────────────────────────────────────────────────────────

interface DialogBodyProps {
  className?: string;
  children: ReactNode;
}

export const DialogBody = ({ className, children }: DialogBodyProps) => (
  <div className={cn('px-6 pb-6 pt-2 overflow-y-auto flex-1 min-h-0', className)}>
    {children}
  </div>
);

// ── Footer ────────────────────────────────────────────────────────────────

interface DialogFooterProps {
  className?: string;
  children: ReactNode;
}

export const DialogFooter = ({ className, children }: DialogFooterProps) => (
  <div
    className={cn(
      'flex items-center justify-end gap-2 px-6 py-4',
      'border-t border-outline/10',
      // Sticky footer: always visible regardless of content length (FR-002)
      'sticky bottom-0 bg-surface-lowest shrink-0',
      // Safe area padding for mobile devices
      'pb-[max(1rem,env(safe-area-inset-bottom))]',
      className,
    )}
  >
    {children}
  </div>
);

// ── Close (re-export for use as button wrapper) ──────────────────────────

export const DialogClose = RadixDialog.Close;
