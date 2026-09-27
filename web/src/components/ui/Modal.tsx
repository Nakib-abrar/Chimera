import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "@/lib/ui";
import { IconButton } from "./Button";
import s from "./ui.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  wide?: boolean;
  footer?: ReactNode;
  children: ReactNode;
  /** Hide the built-in header (for full-bleed modals like the switcher). */
  bare?: boolean;
  closeOnBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  wide,
  footer,
  children,
  bare,
  closeOnBackdrop = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={s.modalOverlay}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="presentation"
    >
      <div
        className={cx(s.modal, wide && s["modal--wide"])}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {!bare && (
          <div className={s.modalHead}>
            <div className="t-heading-md">{title}</div>
            <IconButton label="Close" onClick={onClose}>
              <X />
            </IconButton>
          </div>
        )}
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFoot}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
