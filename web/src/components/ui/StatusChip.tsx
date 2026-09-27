import type { ReactNode } from "react";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

type Tone = "neutral" | "positive" | "warning" | "negative" | "accent";

interface StatusChipProps {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}

export function StatusChip({ tone = "neutral", dot, children }: StatusChipProps) {
  const dotColor: Record<Tone, string> = {
    neutral: "var(--mute)",
    positive: "var(--positive)",
    warning: "var(--warning)",
    negative: "var(--negative)",
    accent: "var(--accent)",
  };
  return (
    <span className={cx(s.chip, s[`chip--${tone}`])}>
      {dot && <span className={s.chipDot} style={{ background: dotColor[tone] }} />}
      {children}
    </span>
  );
}

/** Mono ATT&CK technique chip (TTP library signal). */
export function TtpChip({ children }: { children: ReactNode }) {
  return <span className={s.ttp}>{children}</span>;
}
