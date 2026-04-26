import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
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
 * Branded confirmation dialog. Replaces `window.confirm` so destructive
 * actions match the rest of the UI, support i18n + RTL, and remain
 * accessible (focus trap, ESC, returns focus to trigger via `Modal`).
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
      // The dialog usually unmounts on success; reset here for the rare
      // case where the parent keeps it open after a failure.
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={pending ? () => undefined : onCancel}
      title={title}
      description={description}
      className="max-w-md"
    >
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

      <div className="flex justify-end gap-2 mt-6">
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
      </div>
    </Modal>
  );
};
