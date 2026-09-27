import type { Severity } from "@/lib/types";
import { SEVERITY_META, SEVERITY_ORDER, cx } from "@/lib/ui";
import s from "./ui.module.css";

/** Distinct icon SHAPE per severity so meaning never relies on color alone (9.3). */
export function SeverityIcon({ severity, size = 12 }: { severity: Severity; size?: number }) {
  const { token, shape } = SEVERITY_META[severity];
  const c = size / 2;
  const common = { fill: token };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={s.sevIcon} aria-hidden="true">
      {shape === "diamond" && <rect x={c - c * 0.85} y={c - c * 0.85} width={c * 1.7} height={c * 1.7} transform={`rotate(45 ${c} ${c})`} {...common} />}
      {shape === "triangle" && <polygon points={`${c},${c - c * 0.9} ${c + c * 0.9},${c + c * 0.8} ${c - c * 0.9},${c + c * 0.8}`} {...common} />}
      {shape === "square" && <rect x={c - c * 0.75} y={c - c * 0.75} width={c * 1.5} height={c * 1.5} rx={1.5} {...common} />}
      {shape === "circle" && <circle cx={c} cy={c} r={c * 0.82} {...common} />}
      {shape === "dot" && <circle cx={c} cy={c} r={c * 0.55} {...common} />}
    </svg>
  );
}

export function SeverityPill({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span className={s.sevPill} style={{ background: meta.bg, color: meta.token }}>
      <SeverityIcon severity={severity} size={11} />
      {meta.label}
    </span>
  );
}

/** Stacked severity counts as a proportional mini-bar (Target Overview, tables). */
export function SeverityMiniBar({
  counts,
  width = 96,
}: {
  counts: Record<Severity, number>;
  width?: number;
}) {
  const total = SEVERITY_ORDER.reduce((sum, k) => sum + (counts[k] || 0), 0);
  if (total === 0) {
    return <span className="t-caption t-mute">none</span>;
  }
  return (
    <span className={s.miniBar} style={{ width }} aria-label={`Findings: ${total}`}>
      {SEVERITY_ORDER.map((k) =>
        counts[k] ? (
          <span
            key={k}
            className={cx(s.miniSeg)}
            style={{
              background: SEVERITY_META[k].token,
              flex: counts[k],
            }}
            title={`${SEVERITY_META[k].label}: ${counts[k]}`}
          />
        ) : null,
      )}
    </span>
  );
}
