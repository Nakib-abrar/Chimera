import { useState } from "react";
import { FilePlus2, Layers } from "lucide-react";
import type { GraphNode } from "@/lib/types";
import { GraphCanvas, type LegendItem } from "@/components/graph/GraphCanvas";
import { Screen, ScreenHeader } from "@/components/shell/Screen";
import { Button, Drawer, SegmentedControl, StatusChip, TtpChip, useToast } from "@/components/ui";
import { SEVERITY_META } from "@/lib/ui";
import { chainEdges, chainNodes, surfaceEdges, surfaceNodes } from "@/data/mock";

const SURFACE_LEGEND: LegendItem[] = [
  { label: "Domain / asset", color: "var(--accent)" },
  { label: "Critical finding", color: "var(--sev-critical)" },
  { label: "High finding", color: "var(--sev-high)" },
  { label: "Cluster (collapsed)", color: "var(--accent)" },
];

export function ThreatMapView({ embedded }: { embedded?: boolean }) {
  const toast = useToast();
  const [mode, setMode] = useState<"surface" | "chain">("surface");
  const [selected, setSelected] = useState<GraphNode | null>(null);

  const nodes = mode === "surface" ? surfaceNodes : chainNodes;
  const edges = mode === "surface" ? surfaceEdges : chainEdges;

  const canvas = (
    <GraphCanvas
      nodes={nodes}
      edges={edges}
      mode={mode}
      onNodeClick={setSelected}
      legend={mode === "surface" ? SURFACE_LEGEND : undefined}
      showMinimap={mode === "surface"}
      topLeft={
        <SegmentedControl
          segments={[
            { value: "surface", label: "Attack Surface" },
            { value: "chain", label: "Attack Chain" },
          ]}
          value={mode}
          onChange={(v) => {
            setMode(v);
            setSelected(null);
          }}
        />
      }
    />
  );

  const drawer = (
    <Drawer
      open={!!selected}
      onClose={() => setSelected(null)}
      title={selected?.label}
      subtitle={selected?.type === "step" ? `Attack chain · step ${selected.step}` : selected?.type}
    >
      {selected && (
        <>
          {selected.techniqueId && (
            <div className="row gap-sm">
              <TtpChip>{selected.techniqueId}</TtpChip>
              {selected.severity && <StatusChip tone="neutral">{SEVERITY_META[selected.severity].label}</StatusChip>}
            </div>
          )}
          {selected.findings != null && selected.findings > 0 && (
            <div className="t-body-sm">
              {selected.findings} finding{selected.findings > 1 ? "s" : ""} attached to this node.
            </div>
          )}
          {selected.type === "cluster" && (
            <div className="t-body-sm t-mute">Collapsed cluster of {selected.count} assets. Expand to enumerate the subdomain family.</div>
          )}
          <p className="t-body-sm t-mute">Selecting a node scopes the chat rail — ask the orchestrator about this node directly.</p>
          {mode === "chain" && (
            <Button variant="primary" icon={<FilePlus2 size={15} />} onClick={() => toast.push("Attack chain added to Report Studio as evidence.", { tone: "positive" })}>
              Add step to report
            </Button>
          )}
        </>
      )}
    </Drawer>
  );

  if (embedded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 460 }}>
        <div style={{ flex: 1, display: "flex" }}>{canvas}</div>
        {drawer}
      </div>
    );
  }

  return (
    <Screen bleed>
      <div style={{ padding: "var(--space-xl) var(--space-xl) var(--space-md)" }}>
        <ScreenHeader
          title="Threat Map"
          subtitle="Attack-surface scales to thousands of clustered nodes; attack-chain reads as a story and exports to the report."
          meta={<StatusChip tone="accent" dot><Layers size={13} /> WebGL graph layer</StatusChip>}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex", padding: "0 var(--space-xl) var(--space-xl)" }}>{canvas}</div>
      {drawer}
    </Screen>
  );
}

export function ThreatMap() {
  return <ThreatMapView />;
}
