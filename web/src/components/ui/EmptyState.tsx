import type { ReactNode } from "react";
import s from "./ui.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}

/** First-class empty state — line-art + heading + one-line guidance + action (9.4). */
export function EmptyState({ icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className={s.empty}>
      {icon && <div className={s.emptyArt}>{icon}</div>}
      <div className="t-heading-md">{title}</div>
      {hint && <p className="t-body-sm t-mute" style={{ maxWidth: 420 }}>{hint}</p>}
      {action && <div style={{ marginTop: "var(--space-sm)" }}>{action}</div>}
    </div>
  );
}
