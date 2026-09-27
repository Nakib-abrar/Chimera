import type { Severity } from "@/lib/types";

/** Tiny classnames joiner. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Severity metadata — color token, label, and a distinct icon SHAPE so meaning
 *  never relies on color alone (9.3). */
export const SEVERITY_META: Record<
  Severity,
  { label: string; token: string; bg: string; shape: string; order: number }
> = {
  critical: { label: "Critical", token: "var(--sev-critical)", bg: "var(--sev-critical-bg)", shape: "diamond", order: 0 },
  high: { label: "High", token: "var(--sev-high)", bg: "var(--sev-high-bg)", shape: "triangle", order: 1 },
  medium: { label: "Medium", token: "var(--sev-medium)", bg: "var(--sev-medium-bg)", shape: "square", order: 2 },
  low: { label: "Low", token: "var(--sev-low)", bg: "var(--sev-low-bg)", shape: "circle", order: 3 },
  info: { label: "Info", token: "var(--sev-info)", bg: "var(--sev-info-bg)", shape: "dot", order: 4 },
};

export const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export function totalFindings(counts: Record<Severity, number>): number {
  return SEVERITY_ORDER.reduce((sum, s) => sum + (counts[s] || 0), 0);
}
