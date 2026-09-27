import type { AgentStatus } from "@/lib/types";
import { cx } from "@/lib/ui";
import s from "./ui.module.css";

const STATUS_META: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  idle: { color: "var(--mute)", label: "Idle", pulse: false },
  thinking: { color: "var(--accent)", label: "Thinking", pulse: true },
  "running-tool": { color: "var(--positive)", label: "Running tool", pulse: true },
  "awaiting-approval": { color: "var(--warning)", label: "Awaiting approval", pulse: true },
  error: { color: "var(--negative)", label: "Error", pulse: false },
};

export function StatusDot({ status }: { status: AgentStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cx(s.statusDot, meta.pulse && s["statusDot--pulse"])}
      style={{ background: meta.color }}
      title={meta.label}
      aria-label={meta.label}
    />
  );
}

export function agentStatusLabel(status: AgentStatus): string {
  return STATUS_META[status].label;
}
