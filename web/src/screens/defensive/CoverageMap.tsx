import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Shield } from "lucide-react";
import type { GraphNode } from "@/lib/types";
import { GraphCanvas, type LegendItem } from "@/components/graph/GraphCanvas";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, Drawer, StatusChip, TtpChip } from "@/components/ui";
import { coverageEdges, coverageNodes } from "@/data/mock";

const LEGEND: LegendItem[] = [
  { label: "Gap (offensive finding proved viable)", color: "var(--sev-critical)" },
  { label: "Partially covered", color: "var(--sev-high)" },
  { label: "Covered (rule deployed)", color: "var(--positive)" },
  { label: "Tactic cluster", color: "var(--accent)" },
];

export function CoverageMap() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<GraphNode | null>(null);

  return (
    <Screen bleed>
      <div style={{ padding: "var(--space-xl) var(--space-xl) var(--space-md)" }}>
        <ScreenHeader
          title="ATT&CK / D3FEND Coverage Map"
          subtitle="One rendering stack, two questions. A technique a confirmed offensive finding proved viable lights up as a gap until a detection rule is deployed."
          meta={<StatusChip tone="accent" dot><Shield size={13} /> shared graph layer</StatusChip>}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", padding: "0 var(--space-xl) var(--space-xl)" }}>
        <GraphCanvas nodes={coverageNodes} edges={coverageEdges} mode="coverage" onNodeClick={setSelected} legend={LEGEND} />
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.label} subtitle="Technique coverage detail">
        {selected && (
          <>
            <div className="row gap-sm">
              <TtpChip>{selected.label}</TtpChip>
              {selected.severity === "info" ? (
                <StatusChip tone="positive" dot>Covered</StatusChip>
              ) : (
                <StatusChip tone="negative" dot>Gap</StatusChip>
              )}
            </div>
            <div className="col gap-sm">
              <span className="t-caption-caps">Linked offensive findings</span>
              {selected.severity !== "info" ? (
                <span className="t-body-sm">A confirmed finding proved this technique viable — this gap stays lit until a rule is deployed.</span>
              ) : (
                <span className="t-body-sm t-mute">None.</span>
              )}
            </div>
            <div className="col gap-sm">
              <span className="t-caption-caps">Linked detection rules</span>
              <span className="t-body-sm">{selected.severity === "info" ? "1 deployed Sigma rule" : "No rule deployed yet."}</span>
            </div>
            <div className="col gap-sm">
              <span className="t-caption-caps">Linked alerts</span>
              <span className="t-body-sm t-mute">2 alerts in the last 30 days.</span>
            </div>
            {selected.severity !== "info" && (
              <Button variant="primary" icon={<PenLine size={15} />} onClick={() => navigate("/defensive/detection")}>
                Draft a Sigma rule for this
              </Button>
            )}
          </>
        )}
      </Drawer>
    </Screen>
  );
}
