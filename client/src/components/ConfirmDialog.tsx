import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/shared/ui/dialog';
import { Button } from './Button';
import { useT } from '@/lib/i18n';

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, show the destructive (red) button styling. */
  destructive?: boolean;
}

/**
 * Branded confirmation dialog built on the Radix Dialog primitives.
 *
 * Accessibility is handled by Radix: focus trap, ESC close, scroll lock,
 * aria-labelledby/describedby, and focus restoration are all automatic.
 */
export const ConfirmDialog = ({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
}: ConfirmDialogProps) => {
  const t = useT();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) setPending(false);
  }, [open]);

  const handleConfirm = async () => {
    try {
      setPending(true);
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !pending) onCancel();
      }}
    >
      <DialogContent size="sm" hideClose>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogBody>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                destructive ? 'bg-danger/10 text-danger' : 'bg-surface-high text-ink-muted'
              }`}
            >
              <AlertTriangle size={18} />
            </span>
            <div className="flex-1 min-w-0">
              {description && (
                <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            {cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={pending}
          >
            {confirmLabel ?? t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
