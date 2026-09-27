import { useMemo, useState } from "react";
import { Bot, Trash2 } from "lucide-react";
import type { Alert } from "@/lib/types";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, DataTable, SeverityPill, StatusChip, useToast, type Column } from "@/components/ui";
import { alerts as seedAlerts } from "@/data/mock";
import ui from "@/components/ui/ui.module.css";

const SUGGESTION = {
  "likely-fp": { tone: "neutral", label: "likely FP" },
  investigate: { tone: "warning", label: "investigate" },
  escalate: { tone: "negative", label: "escalate" },
} as const;

export function AlertTriage() {
  const toast = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [sevFilter, setSevFilter] = useState("all");
  const [sugFilter, setSugFilter] = useState("all");

  const filtered = useMemo(
    () =>
      alerts
        .filter((a) => (sevFilter === "all" ? true : a.severity === sevFilter))
        .filter((a) => (sugFilter === "all" ? true : a.suggestion === sugFilter)),
    [alerts, sevFilter, sugFilter],
  );

  const dismissFps = () => {
    const fps = alerts.filter((a) => a.suggestion === "likely-fp");
    if (fps.length === 0) return;
    const prev = alerts;
    setAlerts((a) => a.filter((x) => x.suggestion !== "likely-fp"));
    toast.push(`Dismissed ${fps.length} likely false positives.`, { tone: "warning", undo: () => setAlerts(prev) });
  };

  const columns: Column<Alert>[] = [
    { key: "time", header: "Time", hideBelow: "mobile", render: (a) => <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{a.time}</span>, sortValue: (a) => a.time },
    { key: "sev", header: "Severity", render: (a) => <SeverityPill severity={a.severity} /> },
    {
      key: "rule",
      header: "Rule",
      render: (a) => (
        <div className="col" style={{ gap: 2 }}>
          <span className="t-body-sm t-ink">{a.rule}</span>
          <span className="t-caption">{a.description}</span>
        </div>
      ),
    },
    { key: "source", header: "Source", hideBelow: "tablet", render: (a) => <StatusChip tone="neutral">{a.source}</StatusChip> },
    { key: "asset", header: "Asset", hideBelow: "tablet", render: (a) => <span className="t-mono-sm" style={{ fontFamily: "var(--font-mono)" }}>{a.asset}</span> },
    { key: "sug", header: "AI triage", render: (a) => <StatusChip tone={SUGGESTION[a.suggestion].tone}>{SUGGESTION[a.suggestion].label}</StatusChip> },
    {
      key: "action",
      header: "",
      render: (a) => (
        <Button size="sm" variant="tertiary" icon={<Bot size={14} />} onClick={() => toast.push(`Handed "${a.rule}" to the Triage subagent.`, { tone: "info" })}>
          Investigate
        </Button>
      ),
    },
  ];

  return (
    <Screen>
      <ScreenHeader
        title="Alert Triage"
        subtitle="Incoming alerts from Wazuh and other sources, pre-classified by the Triage subagent."
        actions={
          <>
            <select className={ui.select} value={sevFilter} onChange={(e) => setSevFilter(e.target.value)} style={{ width: 150 }}>
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
            <select className={ui.select} value={sugFilter} onChange={(e) => setSugFilter(e.target.value)} style={{ width: 160 }}>
              <option value="all">All suggestions</option>
              <option value="escalate">Escalate</option>
              <option value="investigate">Investigate</option>
              <option value="likely-fp">Likely FP</option>
            </select>
            <Button variant="secondary" icon={<Trash2 size={15} />} onClick={dismissFps}>Bulk-dismiss FPs</Button>
          </>
        }
      />
      <DataTable columns={columns} rows={filtered} rowKey={(a) => a.id} emptyLabel="No alerts match these filters." />
    </Screen>
  );
}
