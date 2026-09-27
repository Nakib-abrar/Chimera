import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "./Button";
import s from "./ui.module.css";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}

/** Right-side detail sheet (Level 3) — shared by Target Overview, Threat Map,
 *  Coverage Map, Findings (§8). */
export function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
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
    <>
      <div className={s.drawerOverlay} onClick={onClose} role="presentation" />
      <aside className={s.drawer} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Detail"}>
        <div className={s.drawerHead}>
          <div className="col" style={{ gap: 2, minWidth: 0 }}>
            {title && <div className="t-heading-md">{title}</div>}
            {subtitle && <div className="t-caption">{subtitle}</div>}
          </div>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className={s.drawerBody}>{children}</div>
      </aside>
    </>,
    document.body,
  );
}
