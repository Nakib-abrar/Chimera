import { useState } from "react";
import { Check, FileText, Network, TerminalSquare } from "lucide-react";
import type { CaseStatus, EvidenceItem, GraphEdge, GraphNode, SocCase } from "@/lib/types";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { Screen, ScreenHeader, Section } from "@/components/shell/Screen";
import { Card, SegmentedControl, SeverityPill, StatusChip } from "@/components/ui";
import { socCases } from "@/data/mock";
import s from "./defensive.module.css";
import off from "@/screens/offensive/offensive.module.css";

const STATUS_STEPS: CaseStatus[] = ["open", "contained", "eradicated", "recovered", "closed"];

const BLAST_NODES: GraphNode[] = [
  { id: "vpn", label: "vpn-01", type: "risk", severity: "critical", x: 0.2, y: 0.5, findings: 1 },
  { id: "dc", label: "dc01", type: "endpoint", severity: "high", x: 0.5, y: 0.3, findings: 1 },
  { id: "fs", label: "fileshare", type: "endpoint", severity: "medium", x: 0.5, y: 0.72, findings: 1 },
  { id: "app", label: "web-prod-2", type: "endpoint", severity: "high", x: 0.82, y: 0.5, findings: 1 },
];
const BLAST_EDGES: GraphEdge[] = [
  { id: "b1", source: "vpn", target: "dc", directed: true },
  { id: "b2", source: "vpn", target: "fs", directed: true },
  { id: "b3", source: "dc", target: "app", directed: true },
];

function evidenceIcon(kind: EvidenceItem["kind"]) {
  if (kind === "log") return <TerminalSquare size={16} />;
  return <FileText size={16} />;
}

export function CasesIR() {
  const [caseId, setCaseId] = useState(socCases[0].id);
  const active: SocCase = socCases.find((c) => c.id === caseId) ?? socCases[0];
  const [checklist, setChecklist] = useState(active.checklist);

  const toggleCheck = (id: string) =>
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)));

  const statusIdx = STATUS_STEPS.indexOf(active.status);

  return (
    <Screen>
      <ScreenHeader
        title="Cases / IR"
        subtitle="Incident timeline, evidence, and the auto-populated IR checklist the agent can advance."
        meta={<SeverityPill severity={active.severity} />}
        actions={
          <SegmentedControl
            segments={socCases.map((c) => ({ value: c.id, label: c.name.length > 22 ? c.name.slice(0, 21) + "…" : c.name }))}
            value={caseId}
            onChange={(id) => { setCaseId(id); const c = socCases.find((x) => x.id === id); if (c) setChecklist(c.checklist); }}
          />
        }
      />

      {/* status stepper */}
      <div className={off.stepper}>
        {STATUS_STEPS.map((st, i) => (
          <div key={st} style={{ display: "contents" }}>
            <div className={off.stepDot} data-active={i === statusIdx} data-done={i < statusIdx}>
              <span className={off.stepNum}>{i < statusIdx ? "✓" : i + 1}</span>
              {st}
            </div>
            {i < STATUS_STEPS.length - 1 && <span className={off.stepLine} />}
          </div>
        ))}
      </div>

      <div className={s.caseGrid}>
        <Section title="Timeline">
          <Card>
            <div className={s.timeline}>
              {active.timeline.map((ev) => (
                <div key={ev.id} className={s.tlItem}>
                  <span className={s.tlDot} style={{ background: ev.kind === "action" ? "var(--accent)" : ev.kind === "artifact" ? "var(--warning)" : "var(--positive)" }} />
                  <div className="row gap-sm" style={{ marginBottom: 2 }}>
                    <span className="t-body-sm-strong">{ev.text}</span>
                  </div>
                  <span className="t-caption">{ev.at} · {ev.actor} · {ev.kind}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <div className="col gap-lg">
          <Section title="IR checklist">
            <div className="col gap-sm">
              {checklist.map((c) => (
                <div key={c.id} className={s.checklistItem} onClick={() => toggleCheck(c.id)} style={{ cursor: "pointer" }}>
                  <span className={off.taskCheck} data-done={c.done}>{c.done && <Check size={13} />}</span>
                  <span className="t-body-sm" style={{ textDecoration: c.done ? "line-through" : "none", color: c.done ? "var(--mute)" : "var(--ink)" }}>{c.label}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Evidence / artifacts">
            {active.evidence.length > 0 ? (
              <div className="col gap-sm">
                {active.evidence.map((e) => (
                  <div key={e.id} className={off.evidenceTile}>
                    <span className={off.evidenceIcon}>{evidenceIcon(e.kind)}</span>
                    <div className="col grow" style={{ gap: 2, minWidth: 0 }}>
                      <span className="t-body-sm">{e.label}</span>
                      <span className="t-caption" style={{ fontFamily: "var(--font-mono)" }}>{e.hash} · {e.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="t-body-sm t-mute">No artifacts collected yet.</p>
            )}
          </Section>
        </div>
      </div>

      <Section title="Blast radius" action={<StatusChip tone="accent" dot><Network size={13} /> Code Intelligence · Phase 3</StatusChip>}>
        <div style={{ height: 320, display: "flex" }}>
          <GraphCanvas
            nodes={BLAST_NODES}
            edges={BLAST_EDGES}
            mode="surface"
            showMinimap={false}
            legend={[
              { label: "Compromised entry", color: "var(--sev-critical)" },
              { label: "Impacted component", color: "var(--sev-high)" },
            ]}
          />
        </div>
      </Section>
    </Screen>
  );
}
