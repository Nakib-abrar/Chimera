import { useNavigate } from "react-router-dom";
import { Activity, BellRing, FolderOpen, HeartPulse } from "lucide-react";
import { Screen, ScreenHeader, Section } from "@/components/shell/Screen";
import { Card, KpiTile, SeverityPill, StatusChip } from "@/components/ui";
import { alerts, attackHeatmap, attackTactics, monitoredAssets, socCases } from "@/data/mock";
import s from "./defensive.module.css";

function HealthRing({ healthy, degraded, down }: { healthy: number; degraded: number; down: number }) {
  const total = healthy + degraded + down || 1;
  const r = 26;
  const c = 2 * Math.PI * r;
  const segs = [
    { v: healthy, color: "var(--positive)" },
    { v: degraded, color: "var(--warning)" },
    { v: down, color: "var(--negative)" },
  ];
  let offset = 0;
  return (
    <div className={s.healthRing}>
      <svg width={64} height={64} viewBox="0 0 64 64">
        <circle cx={32} cy={32} r={r} fill="none" stroke="var(--surface-inset)" strokeWidth={8} />
        {segs.map((seg, i) => {
          const len = (seg.v / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={i}
              cx={32}
              cy={32}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={8}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 32 32)"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="col" style={{ gap: 2 }}>
        <span className="t-body-sm"><b>{healthy}</b> healthy</span>
        <span className="t-caption">{degraded} degraded · {down} down</span>
      </div>
    </div>
  );
}

function heatColor(cov: number): string {
  if (cov >= 3) return "var(--positive)";
  if (cov === 2) return "color-mix(in srgb, var(--positive) 55%, var(--surface))";
  if (cov === 1) return "var(--warning-bg)";
  return "var(--surface-inset)";
}

export function SecurityOpsOverview() {
  const navigate = useNavigate();
  const health = {
    healthy: monitoredAssets.filter((a) => a.health === "healthy").length,
    degraded: monitoredAssets.filter((a) => a.health === "degraded").length,
    down: monitoredAssets.filter((a) => a.health === "down").length,
  };

  return (
    <Screen>
      <ScreenHeader title="Security Operations Overview" subtitle="Live posture across alerts, cases, and monitored-asset health." />

      <div className={s.kpiRow}>
        <KpiTile label="Alerts (24h)" value={alerts.length} icon={<BellRing size={18} />} trend={[4, 6, 5, 8, 7, 9, 7, 12]} sub="+3 vs. yesterday" />
        <KpiTile label="Open cases" value={socCases.filter((c) => c.status !== "closed").length} icon={<FolderOpen size={18} />} sub="1 critical, 1 high" />
        <Card>
          <div className="row between" style={{ marginBottom: "var(--space-sm)" }}>
            <span className="t-caption-caps">Asset health</span>
            <HeartPulse size={18} style={{ color: "var(--mute)" }} />
          </div>
          <HealthRing {...health} />
        </Card>
      </div>

      <div className={s.overviewGrid}>
        <Section title="ATT&CK coverage" action={<StatusChip tone="accent" dot><Activity size={13} /> live</StatusChip>}>
          <Card>
            <div className={s.heatmap} style={{ gridTemplateColumns: `120px repeat(${attackTactics.length}, 1fr)` }}>
              <div />
              {attackTactics.map((t) => (
                <div key={t} className={s.heatLabel}>{t}</div>
              ))}
              {attackHeatmap.map((row) => (
                <div key={row.technique} style={{ display: "contents" }}>
                  <div className={s.heatLabel} style={{ justifyContent: "flex-start" }}>{row.technique}</div>
                  {row.coverage.map((cov, i) => (
                    <div
                      key={i}
                      className={s.heatCell}
                      style={{ background: heatColor(cov), color: cov >= 2 ? "var(--on-accent)" : "var(--mute)" }}
                      title={`${row.technique} · ${attackTactics[i]} · coverage ${cov}/3`}
                      onClick={() => navigate("/defensive/triage")}
                    >
                      {cov > 0 ? cov : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="row gap-md" style={{ marginTop: "var(--space-md)" }}>
              <span className="row gap-xs t-caption"><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--positive)" }} /> covered</span>
              <span className="row gap-xs t-caption"><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--warning-bg)" }} /> partial</span>
              <span className="row gap-xs t-caption"><span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--surface-inset)" }} /> gap</span>
            </div>
          </Card>
        </Section>

        <div className="col gap-lg">
          <Section title="Recent alerts" action={<button className="t-caption" style={{ color: "var(--accent)" }} onClick={() => navigate("/defensive/triage")}>View all</button>}>
            <Card flush>
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="row between" style={{ padding: "var(--space-sm) var(--space-lg)", borderBottom: "1px solid var(--border)" }}>
                  <div className="row gap-sm" style={{ minWidth: 0 }}>
                    <SeverityPill severity={a.severity} />
                    <span className="t-body-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.rule}</span>
                  </div>
                  <span className="t-caption">{a.time}</span>
                </div>
              ))}
            </Card>
          </Section>

          <Section title="Open cases" action={<button className="t-caption" style={{ color: "var(--accent)" }} onClick={() => navigate("/defensive/cases")}>View all</button>}>
            <Card flush>
              {socCases.map((c) => (
                <div key={c.id} className="row between" style={{ padding: "var(--space-sm) var(--space-lg)", borderBottom: "1px solid var(--border)" }}>
                  <div className="row gap-sm" style={{ minWidth: 0 }}>
                    <SeverityPill severity={c.severity} />
                    <span className="t-body-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  </div>
                  <StatusChip tone={c.status === "open" ? "negative" : "warning"}>{c.status}</StatusChip>
                </div>
              ))}
            </Card>
          </Section>
        </div>
      </div>
    </Screen>
  );
}
