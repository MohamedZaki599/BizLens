/**
 * Legacy Modal wrapper.
 *
 * This component preserves the existing `<Modal>` API while delegating
 * to the new Radix-based Dialog primitive system under the hood.
 *
 * Existing consumers (QuickAddModal, CategoriesPage, BudgetsPage) can
 * continue using `<Modal open onClose title description>` unchanged.
 * New code should prefer the composable `<Dialog>` primitives directly.
 *
 * @see components/shared/ui/dialog
 */
import { type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  type DialogSize,
} from '@/components/shared/ui/dialog';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** @deprecated — Radix handles initial focus automatically. */
  initialFocus?: string;
  /** Disable closing when clicking the backdrop. */
  disableBackdropClose?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: DialogSize;
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  className,
  disableBackdropClose,
  size = 'md',
}: ModalProps) => (
  <Dialog
    open={open}
    onOpenChange={(isOpen) => {
      if (!isOpen && !disableBackdropClose) onClose();
    }}
  >
    <DialogContent size={size} className={className}>
      {(title || description) && (
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      <DialogBody>{children}</DialogBody>
    </DialogContent>
  </Dialog>
);
