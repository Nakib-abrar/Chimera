import type { ReactNode } from "react";
import s from "./screen.module.css";

interface ScreenProps {
  children: ReactNode;
  /** Full-bleed screens (console, graphs) fill height without padding. */
  bleed?: boolean;
}

/** Scrollable screen container with consistent gutters. */
export function Screen({ children, bleed }: ScreenProps) {
  return <div className={bleed ? s.bleed : s.scroll}>{children}</div>;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}

export function ScreenHeader({ title, subtitle, actions, meta }: ScreenHeaderProps) {
  return (
    <div className={s.header}>
      <div className="col" style={{ gap: 4, minWidth: 0 }}>
        <div className="row gap-md" style={{ flexWrap: "wrap" }}>
          <h1 className="t-heading-lg">{title}</h1>
          {meta}
        </div>
        {subtitle && <p className="t-body-sm t-mute" style={{ maxWidth: 680 }}>{subtitle}</p>}
      </div>
      {actions && <div className={s.headerActions}>{actions}</div>}
    </div>
  );
}

export function Section({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={s.section}>
      {(title || action) && (
        <div className="row between" style={{ marginBottom: "var(--space-md)" }}>
          {title && <h2 className="t-heading-md">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
