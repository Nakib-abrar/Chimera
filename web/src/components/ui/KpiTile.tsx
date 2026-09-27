import type { ReactNode } from "react";
import { Sparkline } from "./Sparkline";
import s from "./ui.module.css";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: number[];
  sub?: ReactNode;
}

export function KpiTile({ label, value, icon, trend, sub }: KpiTileProps) {
  return (
    <div className={s.kpi}>
      <div className={s.kpiTop}>
        <span className="t-caption-caps">{label}</span>
        {icon && <span style={{ color: "var(--mute)" }}>{icon}</span>}
      </div>
      <div className="row between" style={{ alignItems: "flex-end", gap: "var(--space-md)" }}>
        <span className={s.kpiValue}>{value}</span>
        {trend && <Sparkline data={trend} width={72} height={24} fill />}
      </div>
      {sub && <div className="t-caption">{sub}</div>}
    </div>
  );
}
