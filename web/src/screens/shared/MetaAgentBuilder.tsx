import { useState } from "react";
import { Bot, Check, Send, Workflow } from "lucide-react";
import type { GraphEdge, GraphNode } from "@/lib/types";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Button, Card, Modal, SegmentedControl, StatusChip, useToast } from "@/components/ui";

const CANVAS_NODES: GraphNode[] = [
  { id: "o", label: "Orchestrator", type: "domain", x: 0.15, y: 0.5 },
  { id: "recon", label: "recon", type: "subdomain", x: 0.45, y: 0.28 },
  { id: "nuclei", label: "nuclei", type: "subdomain", x: 0.45, y: 0.72 },
  { id: "report", label: "report", type: "endpoint", x: 0.78, y: 0.5 },
];
const CANVAS_EDGES: GraphEdge[] = [
  { id: "e1", source: "o", target: "recon", directed: true },
  { id: "e2", source: "recon", target: "nuclei", directed: true },
  { id: "e3", source: "nuclei", target: "report", directed: true },
];

export function MetaAgentBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [view, setView] = useState<"chat" | "canvas">("chat");
  const [proposed, setProposed] = useState(false);
  const [draft, setDraft] = useState("");

  return (
    <Modal open={open} onClose={onClose} wide title="Meta-Agent builder" footer={
      proposed ? (
        <>
          <Button variant="tertiary" onClick={() => setProposed(false)}>Revise</Button>
          <Button variant="primary" icon={<Check size={15} />} onClick={() => { toast.push("Orchestrator configuration written.", { tone: "positive" }); onClose(); }}>
            Confirm & write
          </Button>
        </>
      ) : undefined
    }>
      <div className="row between" style={{ marginBottom: "var(--space-lg)" }}>
        <p className="t-body-sm t-mute" style={{ maxWidth: 460 }}>
          Describe what you want in plain language. Everything definable manually is also definable by chat.
        </p>
        <SegmentedControl
          segments={[
            { value: "chat", label: "Chat", icon: <Bot size={15} /> },
            { value: "canvas", label: "Canvas", icon: <Workflow size={15} /> },
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {view === "chat" ? (
        <div className="col gap-md">
          <div style={{ alignSelf: "flex-end", maxWidth: "85%", background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-sm) var(--space-md)", fontSize: "var(--fs-body-sm)", color: "var(--ink)" }}>
            Build me an orchestrator that chains recon → nuclei → report.
          </div>
          <div style={{ maxWidth: "92%", fontSize: "var(--fs-body-sm)", color: "var(--body)" }}>
            Here's a proposed configuration. Review it, then confirm to write it.
          </div>

          {proposed && (
            <Card raised>
              <div className="row gap-sm" style={{ marginBottom: "var(--space-md)" }}>
                <Bot size={18} style={{ color: "var(--accent)" }} />
                <span className="t-body-md-strong">recon-to-report orchestrator</span>
                <StatusChip tone="accent">preview</StatusChip>
              </div>
              <div className="col gap-sm">
                <ConfigRow label="Subagents" value="Recon → Vuln-Scan (nuclei) → Report-Writer" />
                <ConfigRow label="Tools" value="subfinder, httpx, nuclei" />
                <ConfigRow label="Skills" value="subdomain-enum, nuclei-verify, report-hackerone" />
                <ConfigRow label="Approval checkpoints" value="RUN_EXPLOIT before nuclei" />
              </div>
              <div className="row gap-sm t-caption" style={{ marginTop: "var(--space-md)", color: "var(--warning)" }}>
                This is a structural change and requires explicit confirmation.
              </div>
            </Card>
          )}

          <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-end", background: "var(--surface-inset)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "var(--space-sm)" }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Describe the agent you want…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--ink)", fontSize: "var(--fs-body-sm)" }}
            />
            <Button size="sm" variant="primary" icon={<Send size={14} />} onClick={() => { setProposed(true); setDraft(""); }}>
              Propose
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ height: 380, display: "flex" }}>
          <GraphCanvas nodes={CANVAS_NODES} edges={CANVAS_EDGES} mode="chain" showMinimap={false} />
        </div>
      )}
    </Modal>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="row between" style={{ gap: "var(--space-md)" }}>
      <span className="t-caption t-mute" style={{ minWidth: 140 }}>{label}</span>
      <span className="t-body-sm" style={{ textAlign: "right" }}>{value}</span>
    </div>
  );
}
